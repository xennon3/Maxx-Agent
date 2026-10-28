import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";
import type { ServerWebSocket } from "bun";
import { Agent, type AgentIO } from "../loop.ts";
import { Permissions, type Answer, type Mode } from "../permissions.ts";
import type { LLMConfig } from "../llm.ts";
import { pickVision } from "../vision.ts";
import { recordTo } from "../devices/run.ts";
import { textOf } from "../context.ts";
import { listProjects, listSessions, loadSession, newSessionId, saveSession } from "../sessions.ts";
import { PAGE } from "./page.ts";
import { describe, statusLine, throttle, type StreamProgress } from "../progress.ts";
import { openWindow, pickFolder } from "./launch.ts";
import { Stage } from "./stage.ts";
import { TOOLS, TOOLSETS } from "../tools/index.ts";

// `maxx ui`: the agent behind a local web page. One WebSocket carries
// everything: streamed tokens, tool cards, permission questions, screenshots.
// It listens on 127.0.0.1 only and every request must carry a random token,
// so other web pages (and other people on the network) can't drive it.

type Client = ServerWebSocket<unknown>;
type Out = Record<string, unknown> & { type: string };

export type UIOptions = { baseURL: string; port?: number; previewPort?: number; open?: boolean; visionModel?: string; context?: number };

export async function startUI(opts: UIOptions) {
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

  const progress = throttle((p: StreamProgress) => send(progressMessage(p)), 120);
  const io: AgentIO = {
    token: (t) => send({ type: "token", text: t }),
    progress,
    toolStart: (name, args) => send({ type: "toolStart", name, args }),
    toolEnd: (name, result) => send({ type: "toolEnd", name, result }),
    note: (text) => send({ type: "note", text }),
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

  async function snapshot(): Promise<Out> {
    const projects = (await listProjects()).map((p) => ({ cwd: p.cwd, sessions: p.sessions.slice(0, 8).map(({ id, title, updated, turns, toolsets }) => ({ id, title, updated, turns, toolsets })) }));
    const s = state;
    return {
      type: "state",
      platform: process.platform,
      models: await models(),
      baseURL: opts.baseURL,
      toolsets: Object.entries(TOOLSETS).map(([name, t]) => ({ name, about: t.about })),
      projects,
      current: s && {
        cwd: s.cwd,
        session: s.agent.session,
        model: s.llm.model,
        mode: s.permissions.mode,
        toolsets: s.agent.toolsets,
        busy: !!s.controller,
        history: s.agent.history
          .filter((m) => m.role !== "system" && !(m.role === "user" && Array.isArray(m.content)))
          .map((m) => ({ role: m.role, text: textOf(m.content as any), tools: "tool_calls" in m ? m.tool_calls?.map((t) => ({ name: t.function.name, args: t.function.arguments })) : undefined })),
      },
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
    const agent = await new Agent({ llm, cwd: dir, permissions, toolsets, vision, contextWindow: opts.context, tools: [...TOOLS, ...stage!.tools()] }, io).init();
    if (saved) await agent.restore(saved.id, saved.history);
    state = { cwd: dir, agent, permissions, llm, created: saved?.created ?? new Date().toISOString(), title: saved?.title ?? "", controller: null };
    recordTo(resolve(dir, ".maxx", "replays", `${agent.session}.jsonl`));
    if (stage!.runner?.cwd !== dir) await stage!.use(dir);
    if (toolsets.length && note) io.note(note);
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
        await state.agent.init();
        state.agent.session = newSessionId();
        state.created = new Date().toISOString();
        state.title = "";
        return send(await snapshot());
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
        s.controller = new AbortController();
        send({ type: "busy", busy: true });
        try {
          const answer = await s.agent.send(String(m.text), s.controller.signal);
          send({ type: "done", text: answer });
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

  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: opts.port ?? 4317,
    fetch(req, srv) {
      const url = new URL(req.url);
      if (url.searchParams.get("t") !== token) return new Response("Open the link Maxx printed in the terminal.", { status: 403 });
      if (url.pathname === "/ws") {
        // Only our own page may connect, not some other site in the same browser.
        const origin = req.headers.get("origin");
        if (origin && new URL(origin).host !== url.host) return new Response("bad origin", { status: 403 });
        return srv.upgrade(req) ? undefined : new Response("upgrade failed", { status: 400 });
      }
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
