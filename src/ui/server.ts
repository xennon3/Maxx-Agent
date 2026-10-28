import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";
import type { ServerWebSocket } from "bun";
import { Agent, type AgentIO } from "../loop.ts";
import { Permissions, type Answer, type Mode } from "../permissions.ts";
import type { LLMConfig } from "../llm.ts";
import { pickVision } from "../vision.ts";
import { recordTo } from "../devices/run.ts";
import { textOf, typedText } from "../context.ts";
import { deleteSession, listProjects, loadSession, newSessionId, restoreSession, saveSession, stripAttachments } from "../sessions.ts";
import { buildTurn, imageLimits, type Upload } from "../attach.ts";
import { PAGE } from "./page.ts";
import { describe, statusLine, throttle, type StreamProgress } from "../progress.ts";
import { openWindow, pickFolder } from "./launch.ts";
import { Stage } from "./stage.ts";
import { TOOLS, TOOLSETS } from "../tools/index.ts";
import { TEMPLATES, findTemplate, freeFolder, isEmptyFolder, scaffold } from "../templates/index.ts";
import { resolveNetwork, saveNetwork } from "../network.ts";
import { CLAUDE_MODELS, HELPER_DEFAULTS, loadHelper, resolveHelper, saveHelper, type Helper } from "../escalate.ts";
import { htmlFiles } from "./preview.ts";
import * as A from "../devices/adb.ts";
import { FIX_ROUNDS, describeWhisper, failed, findWhisper, fixPrompt, planRebuild, speakable, transcribe, type TurnCall } from "./voice.ts";

// `maxx ui`: the agent behind a local web page. One WebSocket carries
// everything: streamed tokens, tool cards, permission questions, screenshots.
// It listens on 127.0.0.1 only and every request must carry a random token,
// so other web pages (and other people on the network) can't drive it.

type Client = ServerWebSocket<unknown>;
type Out = Record<string, unknown> & { type: string };

export type UIOptions = { baseURL: string; port?: number; previewPort?: number; open?: boolean; visionModel?: string; context?: number; whisper?: string; whisperModel?: string; network?: string };

export async function startUI(opts: UIOptions) {
  // Installs and downloads: the header's 🌐 switch, saved for next time.
  let network = await resolveNetwork(opts.network);
  const token = crypto.randomUUID().replace(/-/g, "");
  const clients = new Set<Client>();
  const send = (m: Out) => {
    const s = JSON.stringify(m);
    for (const c of clients) c.send(s);
  };

  // One project open at a time; switching saves the current session first.
  let state: {
    cwd: string;
    agent: Agent;
    permissions: Permissions;
    llm: LLMConfig;
    created: string;
    title: string;
    controller: AbortController | null;
  } | null = null;
  const pending = new Map<string, (a: Answer) => void>();
  let stage: Stage | null = null;
  // Files posted to /upload wait here until the message they belong to is sent.
  const uploads = new Map<string, Upload>();
  const contextWindow = opts.context ?? 32_768;
  const whisper = findWhisper({ whisper: opts.whisper, model: opts.whisperModel });
  // The tool calls of the current turn, for the rebuild after a spoken request.
  let turn: TurnCall[] = [];

  const progress = throttle((p: StreamProgress) => send(progressMessage(p)), 120);
  const io: AgentIO = {
    token: (t) => send({ type: "token", text: t }),
    progress,
    plan: (steps) => send({ type: "plan", steps }),
    toolStart: (name, args) => (turn.push({ name, args, result: "" }), send({ type: "toolStart", name, args })),
    toolEnd: (name, result) => {
      const c = turn.findLast((t) => t.name === name && !t.result);
      if (c) c.result = result || " ";
      send({ type: "toolEnd", name, result });
    },
    note: (text) => send({ type: "note", text }),
    escalation: (e) => send({ type: "escalation", ...e }),
    image: (tool, images) => send({ type: "image", tool, images: images.map((i) => `data:${i.mime};base64,${i.base64}`) }),
    ask: (question, preview) =>
      new Promise<Answer>((res) => {
        const id = crypto.randomUUID();
        pending.set(id, res);
        send({ type: "ask", id, question, preview });
      }),
  };

  async function models(): Promise<string[]> {
    try {
      const res = await fetch(`${opts.baseURL.replace(/\/$/, "")}/models`, { signal: AbortSignal.timeout(3000) });
      const json = (await res.json()) as { data?: { id: string }[] };
      return (json.data ?? []).map((m) => m.id).filter((id) => !/embed/i.test(id));
    } catch {
      return [];
    }
  }

  // What the settings form shows. The key itself never goes back to the page.
  async function helperInfo() {
    const h = await loadHelper();
    const envKey = { anthropic: !!process.env.ANTHROPIC_API_KEY, openai: !!process.env.OPENAI_API_KEY };
    return {
      ...HELPER_DEFAULTS,
      ...(h ? { ...h, apiKey: undefined, hasKey: !!h.apiKey } : { off: true }),
      envKey,
      claudeModels: CLAUDE_MODELS,
      // Set from the environment (MAXX_HELPER) for this run, overriding the saved one.
      fromEnv: !!process.env.MAXX_HELPER,
    };
  }

  // Each history entry the page draws, with the escalation banners in place.
  function transcript(agent: Agent) {
    const out: Record<string, unknown>[] = [];
    const marks = (i: number) => agent.marks.filter((m) => m.at === i).forEach((m) => out.push({ role: "mark", text: m.text, active: m.active }));
    agent.history.forEach((m, i) => {
      marks(i);
      // Parts-array user messages are screenshots and Maxx's own reports (fix-it, plan); only the reports are shown, as notes.
      if (m.role === "system") return;
      const typed = typedText(m);
      if (typed !== null) return void out.push({ role: "user", ...stripAttachments(typed) });
      if (m.role === "user") return void (Array.isArray(m.content) && isReport(m.content) && out.push({ role: "note", text: textOf(m.content) }));
      out.push({ role: m.role, text: textOf(m.content as any), tools: "tool_calls" in m ? m.tool_calls?.map((t) => ({ name: t.function.name, args: t.function.arguments })) : undefined });
    });
    agent.marks.filter((m) => m.at >= agent.history.length).forEach((m) => out.push({ role: "mark", text: m.text, active: m.active }));
    return out;
  }

  async function snapshot(): Promise<Out> {
    const projects = (await listProjects()).map((p) => ({ cwd: p.cwd, sessions: p.sessions.slice(0, 8).map(({ id, title, updated, turns, toolsets }) => ({ id, title, updated, turns, toolsets })) }));
    const s = state;
    return {
      type: "state",
      platform: process.platform,
      models: await models(),
      baseURL: opts.baseURL,
      maxUpload: MAX_UPLOAD,
      imageSide: imageLimits(contextWindow).maxSide,
      toolsets: Object.entries(TOOLSETS).map(([name, t]) => ({ name, about: t.about })),
      templates: TEMPLATES.map(({ id, name, icon, about, try: ideas }) => ({ id, name, icon, about, try: ideas })),
      projects,
      voice: { whisper: describeWhisper(whisper) || null },
      current: s && {
        cwd: s.cwd,
        session: s.agent.session,
        model: s.llm.model,
        mode: s.permissions.mode,
        toolsets: s.agent.toolsets,
        busy: !!s.controller,
        plan: s.agent.plan,
        history: transcript(s.agent),
        helper: s.agent.helper && { model: s.agent.helper.model, kind: s.agent.helper.kind },
      },
      helper: await helperInfo(),
      network,
    };
  }

  async function save() {
    if (!state || state.agent.history.length < 2) return;
    const s = await saveSession({ id: state.agent.session, cwd: state.cwd, created: state.created, model: state.llm.model, toolsets: state.agent.toolsets, history: state.agent.history, title: state.title });
    state.title ||= s.title;
  }

  async function open(cwd: string, o: { session?: string; model?: string; toolsets?: string[]; mode?: Mode }) {
    const dir = resolve(cwd.replace(/^~(?=$|[\\/])/, homedir()));
    if (!existsSync(dir) || !statSync(dir).isDirectory()) throw new Error(`${dir} is not a folder`);
    if (state?.controller) throw new Error("stop the current turn first");
    await save();
    const saved = o.session ? await loadSession(dir, o.session) : null;
    const model = o.model || saved?.model || (await models())[0];
    if (!model) throw new Error(`no model at ${opts.baseURL}. Start LM Studio's server and load a model.`);
    const llm: LLMConfig = { baseURL: opts.baseURL, model };
    const permissions = await new Permissions(dir, o.mode ?? state?.permissions.mode ?? "ask").load();
    const { vision, note } = await pickVision(llm, { visionModel: opts.visionModel });
    const toolsets = o.toolsets ?? saved?.toolsets ?? [];
    const helper = await resolveHelper({}).catch(() => null);
    const agent = await new Agent({ llm, cwd: dir, permissions, toolsets, vision, helper, network, contextWindow: opts.context, tools: [...TOOLS, ...stage!.tools()] }, io).init();
    if (saved) await agent.restore(saved.id, saved.history);
    state = { cwd: dir, agent, permissions, llm, created: saved?.created ?? new Date().toISOString(), title: saved?.title ?? "", controller: null };
    recordTo(resolve(dir, ".maxx", "replays", `${agent.session}.jsonl`));
    if (stage!.runner?.cwd !== dir) await stage!.use(dir);
    if (toolsets.length && note) io.note(note);
  }

  // A fresh, unsaved session in the open project (after New, or deleting the open one).
  async function fresh() {
    if (!state) return;
    await state.agent.init();
    state.agent.session = newSessionId();
    state.created = new Date().toISOString();
    state.title = "";
    recordTo(resolve(state.cwd, ".maxx", "replays", `${state.agent.session}.jsonl`));
  }

  async function handle(m: any) {
    if (await stage!.handle(m)) return;
    switch (m.type) {
      case "hello":
        send(await snapshot());
        return send(await stage!.info());
      case "open":
        await open(m.cwd, { session: m.session, model: m.model });
        send(await snapshot());
        return send(await stage!.info());
      case "pick": {
        const dir = await pickFolder();
        if (!dir) return;
        await open(dir, {});
        send(await snapshot());
        return send(await stage!.info());
      }
      case "new":
        if (!state) return;
        await save();
        await fresh();
        return send(await snapshot());
      case "delete": {
        const open = state && resolve(state.cwd) === resolve(String(m.cwd)) && state.agent.session === m.session;
        if (open && state!.controller) throw new Error("stop the current turn before deleting this session");
        if (!(await deleteSession(String(m.cwd), String(m.session)))) throw new Error("that session is already gone");
        // Deleting the open session leaves an empty one in its place, not a resurrected file on the next save.
        if (open) await fresh();
        send({ type: "deleted", cwd: m.cwd, session: m.session, title: m.title ?? "", wasOpen: !!open });
        return send(await snapshot());
      }
      case "undelete": {
        const info = await restoreSession(String(m.cwd), m.session ? String(m.session) : undefined);
        if (!info) throw new Error("nothing to undo; the session is no longer in the trash");
        if (m.reopen) await open(info.cwd, { session: info.id });
        send(await snapshot());
        return send(await stage!.info());
      }
      case "discard":
        for (const id of [].concat(m.ids ?? [])) uploads.delete(id);
        return;
      case "template": {
        // A starter in the open folder when it is empty, else in a new folder
        // inside it, which then becomes the open project.
        if (!state) throw new Error("open a project folder first");
        if (state.controller) throw new Error("stop the current turn first");
        const t = findTemplate(String(m.id));
        const dir = (await isEmptyFolder(state.cwd)) ? state.cwd : freeFolder(state.cwd, t.folder);
        const files = await scaffold(t, dir);
        if (dir === state.cwd) await state.agent.refreshSystemPrompt(); // picks up its MAXX.md
        else await open(dir, { toolsets: state.agent.toolsets });
        send(await snapshot());
        send(await stage!.info());
        return send({ type: "templated", id: t.id, name: t.name, cwd: dir, files, try: t.try });
      }
      case "settings": {
        if (!state) return;
        if (m.mode) state.permissions.mode = m.mode;
        if (m.toolsets) {
          state.agent.useToolsets(m.toolsets);
          await state.agent.refreshSystemPrompt();
        }
        if (m.model && m.model !== state.llm.model) await open(state.cwd, { session: state.agent.session, model: m.model, toolsets: state.agent.toolsets });
        return send(await snapshot());
      }
      case "helper": {
        // A blank key keeps the saved one; the page never sees it to send it back.
        const prev = await loadHelper();
        const h: Helper = {
          kind: m.kind,
          model: String(m.model ?? "").trim(),
          off: !!m.off,
          ...(m.kind === "openai" && m.baseURL ? { baseURL: String(m.baseURL).trim() } : {}),
          ...(m.apiKey ? { apiKey: String(m.apiKey).trim() } : m.clearKey || prev?.kind !== m.kind ? {} : prev?.apiKey ? { apiKey: prev.apiKey } : {}),
          afterFailures: clamp(m.afterFailures, 1, 10, HELPER_DEFAULTS.afterFailures),
          maxPerTurn: clamp(m.maxPerTurn, 1, 10, HELPER_DEFAULTS.maxPerTurn),
          maxSteps: clamp(m.maxSteps, 1, 20, HELPER_DEFAULTS.maxSteps),
        };
        if (!["lmstudio", "openai", "anthropic"].includes(h.kind)) throw new Error("pick where the helper runs");
        if (!h.off && !h.model) throw new Error("pick a helper model, or turn the helper off");
        await saveHelper(h);
        state?.agent.setHelper(h.off ? null : h);
        return send(await snapshot());
      }
      case "network":
        network = !!m.on;
        await saveNetwork(network);
        await state?.agent.setNetwork(network);
        return send(await snapshot());
      case "answer":
        pending.get(m.id)?.(m.answer);
        pending.delete(m.id);
        return;
      case "stop":
        state?.controller?.abort();
        for (const [id, res] of pending) (res("no"), pending.delete(id));
        return;
      case "send": {
        if (!state) throw new Error("open a project folder first");
        if (state.controller) throw new Error("Maxx is still working; stop it or wait");
        const s = state;
        const files: Upload[] = [];
        for (const f of m.files ?? []) {
          const u = uploads.get(String(f.id));
          if (!u) throw new Error("an attached file expired; attach it again");
          files.push({ ...u, mode: f.mode === "save" ? "save" : "attach" });
        }
        for (const f of m.files ?? []) uploads.delete(String(f.id));
        const controller = (s.controller = new AbortController());
        send({ type: "busy", busy: true });
        turn = [];
        try {
          const built = await buildTurn(String(m.text ?? ""), files, { cwd: s.cwd, contextWindow, vision: s.agent.vision, signal: controller.signal });
          for (const n of built.notes) io.note(n);
          let answer = await s.agent.send(built.content, controller.signal);
          send({ type: "done", text: answer });
          if (m.voice) {
            if (m.rebuild !== false) answer = (await phoneOut(s, controller.signal)) ?? answer;
            send({ type: "speak", text: speakable(answer) });
          }
        } catch (e) {
          const err = e as Error;
          send({ type: "error", text: err.name === "AbortError" ? "(stopped)" : err.message });
        } finally {
          s.controller = null;
          await save();
          send({ type: "busy", busy: false });
          send(await snapshot());
        }
        return;
      }
    }
  }

  // Voice in, phone out: after a spoken request changed the project, rebuild
  // it and show it (phone, or preview at phone size). A failure goes back to
  // the model, which gets FIX_ROUNDS tries. Returns the model's last answer.
  async function phoneOut(s: NonNullable<typeof state>, signal: AbortSignal): Promise<string | undefined> {
    let answer: string | undefined;
    for (let round = 0; !signal.aborted; round++) {
      const android = s.agent.toolsets.includes("android");
      const procs = stage!.runner?.list() ?? [];
      const plan = planRebuild(s.cwd, turn, {
        android,
        phone: android && (await A.devices().then((d) => d.some((x) => x.state === "device"), () => false)),
        html: await htmlFiles(s.cwd),
        serverUrl: procs.filter((p) => p.status === "running" && p.url).at(-1)?.url,
      });
      if (plan.kind === "none") {
        if (plan.shown) send({ type: "voiceShow", where: plan.shown === "android" ? "phone" : "preview" });
        else if (plan.why !== "nothing changed") io.note(`🎙 ${plan.why}`);
        return answer;
      }
      io.note(plan.kind === "android" ? "🎙 Rebuilding and running it on your phone…" : "🎙 Opening it in the preview at phone size…");
      if (plan.kind === "preview") send({ type: "voiceShow", where: "preview" });
      const result = await s.agent.runDirect(plan.kind === "android" ? "android_run" : "preview", plan.args);
      if (!failed(plan.kind, result)) {
        if (plan.kind === "android") send({ type: "voiceShow", where: "phone" });
        return answer;
      }
      if (/^user denied/.test(result)) return answer;
      if (round >= FIX_ROUNDS) {
        io.note(`🎙 It still fails after ${FIX_ROUNDS} fixes. Have a look at the last result, or say what to change.`);
        return answer;
      }
      io.note(`🎙 That didn't work; asking Maxx to fix it (try ${round + 1} of ${FIX_ROUNDS})`);
      turn = [];
      answer = await s.agent.send(fixPrompt(plan.kind, result), signal);
      send({ type: "done", text: answer });
    }
    return answer;
  }

  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: opts.port ?? 4317,
    async fetch(req, srv) {
      const url = new URL(req.url);
      if (url.searchParams.get("t") !== token) return new Response("Open the link Maxx printed in the terminal.", { status: 403 });
      // Recorded speech (16 kHz WAV) in, text out, through the local Whisper.
      if (url.pathname === "/voice" && req.method === "POST") {
        const origin = req.headers.get("origin");
        if (origin && new URL(origin).host !== url.host) return new Response("bad origin", { status: 403 });
        if (!whisper) return Response.json({ error: "no local Whisper set up (see maxx --help: --whisper)" }, { status: 404 });
        const wav = new Uint8Array(await req.arrayBuffer());
        if (wav.length > 8 << 20) return Response.json({ error: "recording too long" }, { status: 413 });
        try {
          return Response.json({ text: await transcribe(whisper, wav, url.searchParams.get("lang") || "auto") });
        } catch (e) {
          return Response.json({ error: (e as Error).message }, { status: 502 });
        }
      }
      if (url.pathname === "/ws") {
        // Only our own page may connect, not some other site in the same browser.
        const origin = req.headers.get("origin");
        if (origin && new URL(origin).host !== url.host) return new Response("bad origin", { status: 403 });
        return srv.upgrade(req) ? undefined : new Response("upgrade failed", { status: 400 });
      }
      if (url.pathname === "/upload" && req.method === "POST") return upload(req, url);
      if (url.pathname === "/") return new Response(PAGE, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
      return new Response("not found", { status: 404 });
    },
    websocket: {
      maxPayloadLength: 1 << 20,
      open: (ws) => void clients.add(ws),
      close: (ws) => void clients.delete(ws),
      async message(ws, raw) {
        try {
          await handle(JSON.parse(String(raw)));
        } catch (e) {
          ws.send(JSON.stringify({ type: "error", text: (e as Error).message }));
        }
      },
    },
  });

  async function upload(req: Request, url: URL): Promise<Response> {
    const origin = req.headers.get("origin");
    if (origin && new URL(origin).host !== url.host) return new Response("bad origin", { status: 403 });
    const len = Number(req.headers.get("content-length") ?? 0);
    if (len > MAX_UPLOAD) return Response.json({ error: `too big (the limit is ${MAX_UPLOAD >> 20} MB)` }, { status: 413 });
    const data = new Uint8Array(await req.arrayBuffer());
    if (data.length > MAX_UPLOAD) return Response.json({ error: `too big (the limit is ${MAX_UPLOAD >> 20} MB)` }, { status: 413 });
    const id = crypto.randomUUID();
    uploads.set(id, { name: url.searchParams.get("name") || "upload", mime: req.headers.get("content-type") ?? undefined, data });
    // Attached and then never sent: keep only the latest few around.
    while (uploads.size > 40) uploads.delete(uploads.keys().next().value!);
    return Response.json({ id });
  }

  // Started after the UI's own port is taken, so a failed start leaves nothing behind.
  stage = new Stage(send, () => clients.size, opts.previewPort ?? 0);
  const quit = () => stage?.runner?.stopAll();
  process.once("exit", quit);

  const link = `http://127.0.0.1:${server.port}/?t=${token}`;
  if (opts.open !== false) openWindow(link);
  return {
    server,
    link,
    token,
    stage,
    stop: () => {
      process.off("exit", quit);
      stage!.stop();
      server.stop(true);
    },
  };
}

const MAX_UPLOAD = 50 << 20;
const isReport = (parts: { type: string; text?: string }[]) => parts.every((p) => p.type === "text") && /^Maxx( checked|:)/.test(parts[0]?.text ?? "");
const clamp = (v: unknown, lo: number, hi: number, d: number) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n > 0 ? Math.min(hi, Math.max(lo, n)) : d;
};

// Only the tail of a long preview goes over the wire each time: the card
// shows the end of what is being written, the way a terminal would.
const PREVIEW_TAIL = 4000;

export function progressMessage(p: StreamProgress): Out {
  const a = describe(p);
  const cut = a.preview.length > PREVIEW_TAIL;
  return {
    type: "progress",
    phase: p.phase,
    tokens: p.tokens,
    elapsedMs: p.elapsedMs,
    generatingMs: p.generatingMs,
    title: a.title,
    status: statusLine(p, a),
    lines: a.lines,
    tool: p.tool && { index: p.tool.index, name: p.tool.name },
    preview: (cut ? "…" : "") + a.preview.slice(-PREVIEW_TAIL),
  };
}
