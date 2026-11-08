import { chooseModel, lastModel, listModels, rememberModel, type ModelList } from "../modelpick.ts";
import { appendFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { homedir } from "node:os";
import type { ServerWebSocket } from "bun";
import { Agent, type AgentIO } from "../loop.ts";
import { Permissions, MODE_SAY, parseMode, resolveMode, saveMode, type Answer, type Mode } from "../permissions.ts";
import type { LLMConfig } from "../llm.ts";
import { pickVision } from "../vision.ts";
import { recordTo } from "../devices/run.ts";
import { textOf, typedText } from "../context.ts";
import { fitContext } from "../modelctx.ts";
import { maxxHome } from "../sessions.ts";
import { deleteSession, listProjects, loadSession, newSessionId, restoreSession, saveSession, stripAttachments } from "../sessions.ts";
import { buildTurn, imageLimits, type Upload } from "../attach.ts";
import { PAGE } from "./page.ts";
import { VENDOR } from "./vendor.ts";
import { chatDir, ensureChatDir, isChatDir } from "../chat.ts";
import { describe, statusLine, throttle, type StreamProgress } from "../progress.ts";
import { openWindow, pickFolder } from "./launch.ts";
import { Stage } from "./stage.ts";
import { TOOLS, TOOLSETS } from "../tools/index.ts";
import { TEMPLATES, findTemplate, freeFolder, isEmptyFolder, scaffold } from "../templates/index.ts";
import { resolveNetwork, saveNetwork } from "../network.ts";
import { parseBrevity, resolveBrevity, saveBrevity } from "../brevity.ts";
import { parseThinking, resolveThinking, saveThinking, THINKING } from "../thinking.ts";
import { forgetRule, loadRules, resolveLearn, saveLearn, saveRules, tidyRules } from "../learn.ts";
import { checkPalette, parsePalette, presetList, resolvePalette, savePalette, withBackdrop } from "../palette.ts";
import { CLAUDE_MODELS, HELPER_DEFAULTS, loadHelper, resolveHelper, saveHelper, type Helper } from "../escalate.ts";
import { htmlFiles } from "./preview.ts";
import { connectHandler } from "./connect.ts";
import { mcpHub } from "../mcp.ts";
import * as A from "../devices/adb.ts";
import { agentDefaults, agentSettings, cleanSettings, loadAgentSettings, runGoal, saveAgentSettings } from "../agentmode.ts";
import { cleanCrew, CREW_DEFAULTS, crewSettings, loadCrewSettings, runCrew, saveCrewSettings } from "../crew.ts";
import { findBrowser } from "../judge.ts";
import { cleanLab, ensureResearchDir, isResearchDir, LAB_DEFAULTS, labSettings, listStudies, loadLab, loadStudy, researchDir, runStudy, saveLab } from "../lab/lab.ts";
import { discover, ffmpegCapture, instrumentsFile, type Capture, type Captured } from "../lab/instruments.ts";
import { ARDUINO_SKETCH } from "../lab/serial.ts";
import { listLeads, loadPredictions, settlePrediction, trackRecord } from "../lab/discover.ts";
import { listLabs, listRuns, loadLabCode, loadLabMeta, recordRun } from "../lab/sim.ts";
import { runWatch, type WatchState } from "../lab/watch.ts";
import { FIX_ROUNDS, describeWhisper, failed, findWhisper, fixPrompt, planRebuild, speakable, transcribe, type TurnCall } from "./voice.ts";

// `maxx ui`: the agent behind a local web page. One WebSocket carries
// everything: streamed tokens, tool cards, permission questions, screenshots.
// It listens on 127.0.0.1 only and every request must carry a random token,
// so other web pages (and other people on the network) can't drive it.

type Client = ServerWebSocket<unknown>;
type Out = Record<string, unknown> & { type: string };

export type UIOptions = { baseURL: string; port?: number; previewPort?: number; open?: boolean; model?: string; visionModel?: string; context?: number; whisper?: string; whisperModel?: string; network?: string; brevity?: string; thinking?: string; learn?: string; palette?: string; mode?: string };

export async function startUI(opts: UIOptions) {
  // Installs and downloads: the header's 🌐 switch, saved for next time.
  let network = await resolveNetwork(opts.network);
  // How much Maxx says: the header's ✂ switch, saved too.
  let brevity = await resolveBrevity(opts.brevity);
  // How much the model thinks: the header's 💭 switch, saved too.
  let thinking = await resolveThinking(opts.thinking);
  // Ask / Auto-approve edits / Auto-run: one choice for every project, kept between launches.
  let mode: Mode = await resolveMode(opts.mode);
  // Learn rules from the user's corrections: the 📏 Rules dialog, saved too.
  let learn = await resolveLearn(opts.learn);
  // The colors Maxx designs with: the header's 🎨 picker, saved too.
  let palette = await resolvePalette(opts.palette);
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
  const pending = new Map<string, { res: (a: Answer, stopped?: boolean, why?: string) => void; stillNeeded?: () => boolean }>();
  // Follow-up questions waiting for the user (ask_user, Agent mode's briefing).
  const questions = new Map<string, (a: string | null) => void>();
  let stage: Stage | null = null;
  // Files posted to /upload wait here until the message they belong to is sent.
  const uploads = new Map<string, Upload>();
  const contextWindow = opts.context ?? 32_768;
  const whisper = findWhisper({ whisper: opts.whisper, model: opts.whisperModel });
  // The tool calls of the current turn, for the rebuild after a spoken request.
  let turn: TurnCall[] = [];
  // Agent mode budgets the user changed (the rest follow the context window).
  let goalSaved = await loadAgentSettings();
  let crewSaved = await loadCrewSettings();
  // How many requests LM Studio runs at once, by model, measured on the first crew run.
  const probed = new Map<string, number>();
  const browser = !!findBrowser();
  // Research lab settings the user changed.
  let labSaved = await loadLab();
  // Camera and mic readings the page is taking for the lab.
  const captures = new Map<string, { res: (c: Captured) => void; rej: (e: Error) => void }>();
  // The lab's camera and mic go through the app window (getUserMedia), so
  // they need nothing installed; with no window open, ffmpeg if there is one.
  const ffmpeg = ffmpegCapture();
  const capture: Capture = (kind, args, signal) => {
    const client = [...clients].at(-1);
    if (!client) {
      if (ffmpeg) return ffmpeg(kind, args, signal);
      return Promise.reject(new Error("the app window is closed"));
    }
    return new Promise<Captured>((res, rej) => {
      const id = crypto.randomUUID();
      const ms = ((args.frames ?? 1) * (args.every ?? 2) + (args.seconds ?? 0) + 45) * 1000;
      const timer = setTimeout(() => done(() => rej(new Error("the window did not answer (camera or microphone blocked?)"))), ms);
      const gone = () => done(() => rej(Object.assign(new Error("stopped"), { name: "AbortError" })));
      const done = (f: () => void) => {
        if (!captures.delete(id)) return;
        clearTimeout(timer);
        signal?.removeEventListener("abort", gone);
        f();
      };
      captures.set(id, { res: (c) => done(() => res(c)), rej: (e) => done(() => rej(e)) });
      signal?.addEventListener("abort", gone);
      client.send(JSON.stringify({ type: "capture", id, kind, args }));
    });
  };
  const instruments = () => discover({ network, capture });
  // The overnight watch runs on its own, beside whatever else Maxx is doing.
  let watch: { ctl: AbortController; state: WatchState | null } | null = null;
  let lastWatch: WatchState | null = null;
  const sendAll = (msg: unknown) => { for (const c of clients) c.send(JSON.stringify(msg)); };

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
    retract: (why) => send({ type: "retract", why }),
    escalation: (e) => send({ type: "escalation", ...e }),
    learned: (l) => send({ type: "learned", ...l }),
    workspace: (dir, name) => send({ type: "offerOpen", cwd: dir, name }),
    image: (tool, images) => send({ type: "image", tool, images: images.map((i) => `data:${i.mime};base64,${i.base64}`) }),
    ask: (question, preview, stillNeeded) =>
      new Promise<Answer>((res) => {
        const id = crypto.randomUUID();
        // Closes the card on every open window, however it was answered.
        pending.set(id, {
          res: (a: Answer, stopped = false, why?: string) => {
            send({ type: "askDone", id, answer: String(a).startsWith("no") ? "no" : a, stopped, why });
            res(a);
          },
          stillNeeded,
        });
        send({ type: "ask", id, question, preview });
      }),
    question: (q, signal) =>
      new Promise<string | null>((res) => {
        const done = (a: string | null) => {
          if (!questions.delete(q.id)) return;
          signal.removeEventListener("abort", gone);
          // Closes the card on every open window, answered or not.
          send({ type: "questionDone", id: q.id, answer: a, timedOut: a === null && signal.aborted });
          res(a);
        };
        const gone = () => done(null);
        questions.set(q.id, done);
        signal.addEventListener("abort", gone);
        send({ type: "question", ...q });
        if (signal.aborted) gone();
      }),
  };

  // The server's model list, and which ones it has loaded. Asked again at most every few
  // seconds (every snapshot would ask), or right away from the picker's ⟳ button.
  let modelCache: { at: number; list: ModelList } | null = null;
  async function modelList(fresh = false): Promise<ModelList> {
    if (!fresh && modelCache && Date.now() - modelCache.at < 5000) return modelCache.list;
    const list = await listModels(opts.baseURL);
    modelCache = { at: Date.now(), list };
    return list;
  }
  const models = async () => (await modelList()).ids;
  // What a new session starts on: the loaded model, else the last pick, else $MAXX_MODEL, else the first listed.
  const startModel = async (fresh = false) => chooseModel(await modelList(fresh), await lastModel(), opts.model);

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
    const marks = (i: number) => agent.marks.filter((m) => m.at === i).forEach((m) => out.push({ role: "mark", text: m.text, active: m.active, learned: m.learned, retracted: m.retracted }));
    agent.history.forEach((m, i) => {
      marks(i);
      // Parts-array user messages are screenshots and Maxx's own reports (fix-it, plan); only the reports are shown, as notes.
      if (m.role === "system") return;
      const typed = typedText(m);
      if (typed !== null) return void out.push({ role: "user", ...stripAttachments(typed) });
      if (m.role === "user") return void (Array.isArray(m.content) && isReport(m.content) && out.push({ role: "note", text: textOf(m.content) }));
      out.push({ role: m.role, text: textOf(m.content as any), tools: "tool_calls" in m ? m.tool_calls?.map((t) => ({ name: t.function.name, args: t.function.arguments })) : undefined });
    });
    agent.marks.filter((m) => m.at >= agent.history.length).forEach((m) => out.push({ role: "mark", text: m.text, active: m.active, learned: m.learned, retracted: m.retracted }));
    return out;
  }

  async function snapshot(): Promise<Out> {
    const all = (await listProjects()).map((p) => ({ cwd: p.cwd, sessions: p.sessions.slice(0, 8).map(({ id, title, updated, turns, toolsets }) => ({ id, title, updated, turns, toolsets })) }));
    // Chat sessions get their own place in the sidebar, above the projects.
    const projects = all.filter((p) => !isChatDir(p.cwd) && !isResearchDir(p.cwd));
    const chat = { cwd: chatDir(), sessions: all.find((p) => isChatDir(p.cwd))?.sessions ?? [] };
    const s = state;
    return {
      type: "state",
      platform: process.platform,
      models: (await modelList()).ids,
      // Which of them the server has in memory, marked in the picker.
      loadedModels: (await modelList()).loaded,
      modelsOk: (await modelList()).ok,
      // What a new session starts on, so the picker shows it before one is open.
      defaultModel: (await startModel()) ?? null,
      baseURL: opts.baseURL,
      maxUpload: MAX_UPLOAD,
      imageSide: imageLimits(contextWindow).maxSide,
      toolsets: Object.entries(TOOLSETS).map(([name, t]) => ({ name, about: t.about })),
      templates: TEMPLATES.map(({ id, name, icon, about, try: ideas }) => ({ id, name, icon, about, try: ideas })),
      projects,
      chat,
      voice: { whisper: describeWhisper(whisper) || null },
      current: s && {
        cwd: s.cwd,
        chat: s.agent.chat,
        research: isResearchDir(s.cwd),
        session: s.agent.session,
        model: s.llm.model,
        mode: s.permissions.mode,
        toolsets: s.agent.toolsets,
        tools: s.agent.toolNames,
        busy: !!s.controller,
        plan: s.agent.plan,
        board: s.agent.board,
        lab: s.agent.lab && { ...s.agent.lab, dir: undefined },
        history: transcript(s.agent),
        helper: s.agent.helper && { model: s.agent.helper.model, kind: s.agent.helper.kind },
        rules: s.agent.chat ? [] : await loadRules(s.cwd),
        canUndo: s.agent.canUndo,
      },
      learn,
      // The 🔌 row in 🧰 Tools: each MCP server and how many tools it gives.
      mcp: (await mcpHub.status({ network, cwd: s && !s.agent.chat ? s.cwd : undefined }).catch(() => [])).map((x) => ({ label: x.label, state: x.state, source: x.source, n: x.tools.filter((t) => t.on).length })),
      helper: await helperInfo(),
      network,
      brevity,
      thinking,
      palette,
      palettes: presetList(),
      research: await researchInfo(),
      labMode: { settings: labSettings(labSaved), defaults: LAB_DEFAULTS, saved: labSaved },
      agentMode: { settings: agentSettings(contextWindow, goalSaved), defaults: agentDefaults(contextWindow), saved: goalSaved, context: contextWindow, browser },
      crewMode: { settings: crewSettings(crewSaved), defaults: CREW_DEFAULTS, probed: Object.fromEntries(probed) },
    };
  }

  async function researchInfo() {
    const predictions = await loadPredictions();
    return {
      cwd: researchDir(),
      studies: await listStudies(researchDir()),
      leads: await listLeads(40),
      predictions: predictions.slice(-40).reverse(),
      record: trackRecord(predictions),
      labs: (await listLabs()).slice(0, 30),
      watch: watch?.state ?? lastWatch,
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
    // A resumed session keeps its model while the server still has it; otherwise the
    // loaded model, the last one picked, --model / $MAXX_MODEL, then the first listed.
    const list = await modelList(true);
    const kept = saved?.model && (!list.ids.length || list.ids.includes(saved.model)) ? saved.model : undefined;
    const model = o.model || kept || (await startModel());
    const moved = saved?.model && !o.model && !kept && model ? `This session used ${saved.model}, which the server no longer lists, so it is on ${model} now` : "";
    if (!model) throw new Error(`no model at ${opts.baseURL}. Start LM Studio's server and load a model.`);
    const llm: LLMConfig = { baseURL: opts.baseURL, model };
    if (o.model) await rememberModel(model);
    const permissions = await new Permissions(dir, o.mode ?? mode).load();
    const { vision, note } = await pickVision(llm, { visionModel: opts.visionModel });
    // The context this model was really loaded with, when the server says (never more than --context).
    const fit = await fitContext(opts.baseURL, model, contextWindow);
    const chat = isChatDir(dir);
    const toolsets = chat || isResearchDir(dir) ? [] : (o.toolsets ?? saved?.toolsets ?? []);
    const helper = chat ? null : await resolveHelper({}).catch(() => null);
    const agent = await new Agent(
      chat
        ? { llm, cwd: dir, permissions, vision, network, brevity, thinking, palette, contextWindow: fit.context, chat: true, plan: false, memory: false, fixTries: 0 }
        : { llm, cwd: dir, permissions, toolsets, vision, helper, network, brevity, thinking, palette, learn, contextWindow: fit.context, tools: [...TOOLS, ...stage!.tools()], mapTokens: agentSettings(contextWindow, goalSaved).mapTokens, alarm: process.env.MAXX_ALARM !== "0", timelapse: process.env.MAXX_TIMELAPSE !== "0", ...turnSteps() },
      io,
    ).init();
    // The alarm and the time-lapse look at the Preview panel's page, or the dev server it runs.
    if (!chat) agent.surfaces = { previewUrl: (p) => stage!.preview.url(p), serverUrl: () => (stage!.runner?.list() ?? []).filter((p) => p.status === "running" && p.url).at(-1)?.url };
    if (saved) await agent.restore(saved.id, saved.history);
    state = { cwd: dir, agent, permissions, llm, created: saved?.created ?? new Date().toISOString(), title: saved?.title ?? "", controller: null };
    // A banner at the top, so it outlasts the redraw after each turn.
    if (moved) agent.marks.push({ at: agent.history.length, text: moved, active: false });
    if (fit.note) agent.marks.push({ at: agent.history.length, text: fit.note.replace(/^\(|\)$/g, ""), active: false });
    if (chat) return; // nothing to replay, and the stage keeps showing the last project
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
    if (!state.agent.chat) recordTo(resolve(state.cwd, ".maxx", "replays", `${state.agent.session}.jsonl`));
  }

  const connect = connectHandler({
    send,
    agent: () => state?.agent,
    cwd: () => (state && !state.agent.chat ? state.cwd : undefined),
    network: () => network,
    open: async (cwd, toolsets) => {
      await open(cwd, { toolsets });
      send(await snapshot());
      send(await stage!.info());
    },
    refresh: async () => send(await snapshot()),
  });

  async function handle(m: any) {
    if (await stage!.handle(m)) return;
    if (await connect(m)) return;
    switch (m.type) {
      case "hello":
        send(await snapshot());
        return send(await stage!.info());
      case "open":
        await open(m.cwd, { session: m.session, model: m.model, toolsets: Array.isArray(m.toolsets) ? m.toolsets : undefined });
        send(await snapshot());
        return send(await stage!.info());
      case "chat":
        // A new chat, or the saved one picked in the sidebar.
        await open(await ensureChatDir(), { session: m.session, model: m.session ? undefined : state?.llm.model });
        return send(await snapshot());
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
        if (state.agent.chat) throw new Error("templates start projects; open a project folder first");
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
      case "models": {
        // The picker's ⟳: ask the server again for what it lists and has loaded.
        const l = await modelList(true);
        send(await snapshot());
        return send({ type: "modelsRefreshed", ok: l.ok, count: l.ids.length, loaded: l.loaded, baseURL: opts.baseURL });
      }
      case "settings": {
        // Picked before a session is open: the next one starts on it.
        if (!state && m.model) {
          await rememberModel(String(m.model));
          return send(await snapshot());
        }
        if (!state) return;
        if (m.mode) {
          const want = parseMode(String(m.mode));
          if (!want) throw new Error("mode is ask, auto-edit or yolo");
          mode = state.permissions.mode = want;
          await saveMode(want);
          // A card already waiting goes through if the new mode would not have asked.
          let let_through = 0;
          for (const [id, p] of [...pending]) {
            if (p.stillNeeded && !p.stillNeeded()) {
              pending.delete(id);
              p.res("yes", false, "auto");
              let_through++;
            }
          }
          send({ type: "note", text: `${want === "yolo" ? "⚡ Auto-run on" : want === "auto-edit" ? "Auto-approve edits" : "Auto-run off"}: ${MODE_SAY[want]}${let_through ? `. Allowed the step that was waiting` : ""}.` });
        }
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
      case "brevity": {
        const level = parseBrevity(String(m.level ?? ""));
        if (!level) throw new Error("brevity is brief, normal or detailed");
        brevity = level;
        await saveBrevity(brevity);
        await state?.agent.setBrevity(brevity);
        return send(await snapshot());
      }
      case "thinking": {
        const level = parseThinking(String(m.level ?? ""));
        if (!level) throw new Error(`thinking is ${THINKING.join(", ")}`);
        thinking = level;
        await saveThinking(thinking);
        await state?.agent.setThinking(thinking);
        return send(await snapshot());
      }
      case "palette": {
        // A spec typed in the picker ("#ff6600 triad", "random", a preset), or colors it already worked out (from an image).
        if (m.colors) {
          const c = checkPalette({ name: m.name, colors: m.colors });
          if (!c) throw new Error("a palette needs at least two hex colors");
          palette = withBackdrop(c.name, c.colors);
        } else palette = parsePalette(String(m.spec ?? ""));
        await savePalette(palette);
        await state?.agent.setPalette(palette);
        return send(await snapshot());
      }
      case "rules": {
        // The 📏 dialog: the whole list as the user left it, and the learning switch.
        if (typeof m.learn === "boolean") {
          learn = m.learn;
          await saveLearn(learn);
          state?.agent.setLearn(learn);
        }
        if (Array.isArray(m.rules)) {
          if (!state || state.agent.chat) throw new Error("open a project folder first; rules live in its MAXX.md");
          await saveRules(state.cwd, tidyRules(m.rules));
          if (!state.controller) await state.agent.refreshSystemPrompt();
        }
        return send(await snapshot());
      }
      case "forgetRule":
        // "Undo" on the toast after Maxx learned something.
        if (state && (await forgetRule(state.cwd, String(m.text ?? ""))) && !state.controller) await state.agent.refreshSystemPrompt();
        return send(await snapshot());
      case "undoTurn": {
        if (!state || state.agent.chat) throw new Error("open a project folder first");
        if (state.controller) throw new Error("stop the current turn first");
        io.note(await state.agent.undoTurn());
        await save();
        return send(await snapshot());
      }
      case "recordRecipe": {
        if (!state) throw new Error("open a project folder first");
        if (state.controller) throw new Error("stop the current turn first");
        const { recipe, path } = await state.agent.recordRecipe(String(m.hint ?? "").slice(0, 200));
        send({ type: "recipe", name: recipe.name, when: recipe.when, path: relative(state.cwd, path).replaceAll("\\", "/") });
        return send(await snapshot());
      }
      case "agentSettings":
        // Saving the defaults back unchanged keeps following them when the context changes.
        goalSaved = m.reset ? {} : cleanSettings(m.settings ?? {});
        await saveAgentSettings(goalSaved);
        return send(await snapshot());
      case "crewSettings":
        crewSaved = m.reset ? {} : cleanCrew(m.settings ?? {});
        await saveCrewSettings(crewSaved);
        // A new slot count is a new measurement.
        if (m.reprobe) probed.clear();
        return send(await snapshot());
      case "research":
        // The Research tab: its own workspace, like chat.
        if (!state || !isResearchDir(state.cwd)) await open(await ensureResearchDir(), { model: state?.llm.model });
        return send(await snapshot());
      case "study": {
        const st = state && (await loadStudy(state.cwd, String(m.id)));
        if (!st) throw new Error("that study is gone");
        return send({ type: "lab", study: { ...st, dir: undefined }, viewing: true });
      }
      case "labSettings":
        labSaved = m.reset ? {} : cleanLab(m.settings ?? {});
        await saveLab(labSaved);
        return send(await snapshot());
      case "instruments": {
        const list = await instruments();
        return send({ type: "instruments", list: list.map(({ id, kind, label, about, usage, gated, unavailable }) => ({ id, kind, label, about, usage, gated, unavailable })), file: instrumentsFile(), sketch: ARDUINO_SKETCH, ffmpeg: !!ffmpeg });
      }
      case "captured": {
        const c = captures.get(String(m.id));
        if (!c) return;
        if (m.error) return c.rej(new Error(String(m.error)));
        const b64 = (x: unknown) => new Uint8Array(Buffer.from(String(x), "base64"));
        return c.res({ frames: Array.isArray(m.frames) ? m.frames.slice(0, 8).map(b64) : undefined, wav: m.wav ? b64(m.wav) : undefined, device: typeof m.device === "string" ? m.device.slice(0, 80) : undefined });
      }
      case "simLab": {
        // A virtual lab for the playground: a study's own, or one from the library.
        let slug = typeof m.slug === "string" ? m.slug : "";
        let study: string | undefined;
        if (m.study && state) {
          const st = await loadStudy(state.cwd, String(m.study));
          if (!st?.lab) throw new Error("that study has no virtual lab");
          slug = st.lab.slug;
          study = st.id;
        }
        const meta = await loadLabMeta(slug);
        const code = await loadLabCode(slug);
        if (!meta || !code) throw new Error("that virtual lab is gone");
        return send({ type: "simLab", slug, study, meta, code, runs: (await listRuns(slug, 80)).reverse() });
      }
      case "simRun": {
        const slug = String(m.slug ?? "");
        if (!(await loadLabMeta(slug))) throw new Error("that virtual lab is gone");
        const num = (o: unknown) => Object.fromEntries(Object.entries(o && typeof o === "object" ? o : {}).filter(([k, v]) => /^[\w.-]{1,40}$/.test(k) && Number.isFinite(v)).slice(0, 30)) as Record<string, number>;
        const st = m.study && state ? await loadStudy(state.cwd, String(m.study)) : null;
        await recordRun(slug, { at: new Date().toISOString(), source: "you", params: num(m.params), seed: Math.floor(Number(m.seed) || 1), steps: Math.floor(Number(m.steps) || 0), final: num(m.final), note: typeof m.note === "string" ? m.note.slice(0, 200) : undefined }, st?.dir);
        return send({ type: "simRuns", slug, runs: (await listRuns(slug, 80)).reverse() });
      }
      case "predict":
        await settlePrediction(String(m.id), !!m.right);
        return send(await snapshot());
      case "watch": {
        if (watch) throw new Error("a watch is already running; stop it first");
        if (!state) throw new Error("open the Research tab first");
        const inst = (await instruments()).find((i) => i.id === m.instrument);
        if (!inst) throw new Error("that instrument is not connected");
        if (inst.unavailable) throw new Error(`${inst.id}: ${inst.unavailable}`);
        if (inst.kind === "web" || inst.kind === "file") throw new Error("watch a sensor: a serial port, the camera, the microphone or a custom instrument");
        const hours = Math.max(0.05, Math.min(24, Number(m.hours) || 8));
        const chunk = Math.max(2, Math.min(600, Number(m.chunk) || 20));
        const args = String(m.args ?? "").slice(0, 300);
        const agent = state.agent;
        const how = await agent.approve("instrument", `watch:${inst.id}`, `Let Maxx watch ${inst.label} for ${hours} h?`, `🌙 ${inst.id} | ${args}\nRead every ${chunk} s for ${hours} hours and flag anything far outside the usual. Readings go to ~/.maxx/research/.maxx/watch; ${process.platform === "win32" ? "the PC is kept awake until it ends" : "keep the computer awake"}.`, inst.kind === "camera" || inst.kind === "mic");
        if (how === "denied") throw new Error("watch not started: you said no");
        const ctl = new AbortController();
        const w = (watch = { ctl, state: null as WatchState | null });
        const root = join(researchDir(), ".maxx", "watch");
        runWatch({ inst, args, hours, chunkSeconds: chunk, root, cwd: researchDir(), signal: ctl.signal, update: (x) => ((w.state = x), sendAll({ type: "watch", watch: x })) })
          .then((x) => (lastWatch = x))
          .catch((e) => sendAll({ type: "error", text: `The watch failed: ${(e as Error).message}` }))
          .finally(async () => {
            if (watch === w) watch = null;
            sendAll(await snapshot());
          });
        return;
      }
      case "unwatch":
        watch?.ctl.abort();
        return;
      case "answer":
        // Deny can carry the user's reason, which the model reads and Maxx learns a rule from.
        pending.get(m.id)?.res(m.answer === "no" && typeof m.why === "string" && m.why.trim() ? `no: ${m.why.trim().slice(0, 600)}` : m.answer);
        pending.delete(m.id);
        return;
      case "reply":
        // An empty reply skips the question; the model then goes with its guess.
        questions.get(String(m.id))?.(typeof m.answer === "string" && m.answer.trim() ? m.answer.trim().slice(0, 2000) : null);
        return;
      case "stop":
        state?.controller?.abort();
        for (const [id, p] of pending) (p.res("no", true), pending.delete(id));
        for (const done of [...questions.values()]) done(null);
        for (const c of [...captures.values()]) c.rej(Object.assign(new Error("stopped"), { name: "AbortError" }));
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
        if (m.lab && files.length) throw new Error("The lab takes a question in words; send attachments as a normal message");
        if ((m.agent || m.crew) && s.agent.chat) throw new Error(`${m.crew ? "Crew" : "Agent"} mode works on a project; open a project folder first`);
        if ((m.agent || m.crew) && files.length) throw new Error(`${m.crew ? "Crew" : "Agent"} mode takes a goal in words; send attachments as a normal message`);
        const controller = (s.controller = new AbortController());
        send({ type: "busy", busy: true });
        turn = [];
        try {
          if (m.crew) {
            const b = await runCrew(s.agent, String(m.text ?? ""), { board: (board) => send({ type: "board", board }), image: (tool, images) => io.image!(tool, images) }, {
              crew: crewSettings(crewSaved),
              settings: agentSettings(contextWindow, goalSaved),
              signal: controller.signal,
              probed,
            });
            send({ type: "done", text: b.note ?? "" });
            return;
          }
          if (m.lab) {
            const st = await runStudy(s.agent, String(m.text ?? ""), { study: (study) => send({ type: "lab", study: { ...study, dir: undefined } }), image: (tool, images) => io.image!(tool, images) }, {
              settings: labSettings(labSaved),
              instruments: await instruments(),
              signal: controller.signal,
              parent: m.parent && typeof m.parent.question === "string" ? { id: typeof m.parent.id === "string" ? m.parent.id.slice(0, 120) : undefined, question: m.parent.question.slice(0, 500) } : undefined,
            });
            send({ type: "done", text: st.note ?? "" });
            return;
          }
          if (m.agent) {
            const b = await runGoal(s.agent, String(m.text ?? ""), { board: (board) => send({ type: "board", board }), image: (tool, images) => io.image!(tool, images) }, {
              settings: agentSettings(contextWindow, goalSaved),
              signal: controller.signal,
              surfaces: {
                previewUrl: (p) => stage!.preview.url(p),
                serverUrl: () => (stage!.runner?.list() ?? []).filter((p) => p.status === "running" && p.url).at(-1)?.url,
              },
            });
            send({ type: "done", text: b.note ?? "" });
            return;
          }
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
          if (err.name !== "AbortError") logError("turn", err);
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
      // The token sits in the path here, so the notebook's relative links keep it.
      const lab = url.pathname.match(/^\/lab\/(\w+)\/([\w-]+)\/(.+)$/);
      if (lab) return lab[1] === token ? labFile(lab[2]!, decodeURIComponent(lab[3]!)) : new Response("forbidden", { status: 403 });
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
      const lib = url.pathname.match(/^\/vendor\/(\w+)\.js$/)?.[1];
      if (lib && VENDOR[lib]) return new Response(VENDOR[lib], { headers: { "content-type": "text/javascript; charset=utf-8", "cache-control": "max-age=86400" } });
      if (url.pathname === "/") return new Response(PAGE, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
      return new Response("not found", { status: 404 });
    },
    websocket: {
      // Camera frames and recordings come back from the page for the lab.
      maxPayloadLength: 16 << 20,
      open: (ws) => void clients.add(ws),
      close: (ws) => void clients.delete(ws),
      async message(ws, raw) {
        try {
          await handle(JSON.parse(String(raw)));
        } catch (e) {
          logError("message", e as Error);
          ws.send(JSON.stringify({ type: "error", text: (e as Error).message }));
        }
      },
    },
  });

  // A study's notebook and its files, from the open project. The token is in
  // the path, /lab/<token>/<id>/<file>, so relative links inside report.html
  // (data/E1-serial.csv) carry it too.
  async function labFile(id: string, path: string): Promise<Response> {
    if (!state) return new Response("no project open", { status: 404 });
    const root = resolve(state.cwd, ".maxx", "research", id);
    const file = resolve(root, path);
    if (!file.startsWith(root + (process.platform === "win32" ? "\\" : "/"))) return new Response("not found", { status: 404 });
    const f = Bun.file(file);
    if (!(await f.exists())) return new Response("not found", { status: 404 });
    const type = /\.html$/.test(file) ? "text/html; charset=utf-8" : /\.(csv|py|js|log|md|jsonl?)$/.test(file) ? "text/plain; charset=utf-8" : f.type;
    return new Response(f, { headers: { "content-type": type, "cache-control": "no-store", "content-security-policy": "script-src 'none'" } });
  }

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
  const quit = () => (watch?.ctl.abort(), stage?.runner?.stopAll());
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

// Errors also go to ~/.maxx/errors.log, with the stack, so one that flashed past can be read later.
export function logError(where: string, e: Error) {
  try {
    mkdirSync(maxxHome(), { recursive: true });
    appendFileSync(join(maxxHome(), "errors.log"), `${new Date().toISOString()} [${where}] ${e.stack || e.message}\n\n`);
  } catch {}
}

// Steps per turn from MAXX_STEPS / MAXX_MAX_STEPS (unset: 50, growing to 200 while the turn makes progress).
function turnSteps(): { maxSteps?: number; keepGoing?: number } {
  const n = (v?: string) => (v !== undefined && v !== "" && Number.isFinite(Number(v)) && Number(v) >= 0 ? Math.floor(Number(v)) : undefined);
  return { maxSteps: n(process.env.MAXX_STEPS) || undefined, keepGoing: n(process.env.MAXX_MAX_STEPS) };
}
