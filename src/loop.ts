import { complete, toWire, type ContentPart, type LLMConfig, type Message, type ToolCall } from "./llm.ts";
import { TOOLS, TOOLSETS, toolSpecs, findTool, withToolsets } from "./tools/index.ts";
import { wantsRepo } from "./tools/repo.ts";
import { wantsMusic } from "./tools/music.ts";
import { wantsLook, lookAlarm } from "./tools/look.ts";
import { wantsBlender, hasBlendFiles } from "./tools/blender.ts";
import { usesThree } from "./look/kit.ts";
import type { Tool } from "./tools/types.ts";
import { Permissions, isNo, whyNo, type Answer } from "./permissions.ts";
import { Checkpoints } from "./checkpoint.ts";
import { loadRecipes, parseRecorded, projectRecipesDir, recipesPrompt, recorderMessages, saveRecipe, type Recipe } from "./recipes.ts";
import { compact, estimateTokens, systemPrompt, truncate, typedText } from "./context.ts";
import { describeImages, imagePart, type Vision } from "./vision.ts";
import type { Image } from "./image.ts";
import { newSessionId } from "./sessions.ts";
import type { StreamProgress } from "./progress.ts";
import { coach, coachNote, failed, missingTool, type Missing } from "./coach.ts";
import { planFromHistory, planTool, PLAN_PROMPT, formatPlan, type Step } from "./plan.ts";
import { addLesson, rememberTool, swapLesson, MEMORY_PROMPT } from "./memory.ts";
import { detectCheck, excerpt, quickCheck, type CheckResult } from "./fixit.ts";
import { bash } from "./tools/bash.ts";
import { NETWORK_PROMPT } from "./network.ts";
import { BREVITY_PROMPT, DEFAULT_BREVITY, type Brevity } from "./brevity.ts";
import { BUDGET, DEFAULT_THINKING, planFor, sizeAsk, THINKING_PROMPT, type Thinking, type ThinkPlan } from "./thinking.ts";
import { lookupPrompt, WEB_TOOLS } from "./web.ts";
import { contextFromError } from "./modelctx.ts";
import { finishNote, finishWarning, FINISH_TRIES, unfinished, type Unfinished } from "./unfinished.ts";
import { mcpHub } from "./mcp.ts";
import { chatPrompt } from "./chat.ts";
import { mentionedPalette, paletteNote, palettePrompt, type Palette } from "./palette.ts";
import { brief, describeHelper, HELPER_DEFAULTS, helperLLM, type Helper } from "./escalate.ts";
import { mapBudget, projectMap, projectMapTool } from "./projectmap.ts";
import type { Board } from "./agentmode.ts";
import { closeOpen, doubtful, dropRepeatedAnswers, parseWrap, reportLine, stripReport, withoutReports, wrapPrompt, ENDING_SAY, type Ending } from "./wrapup.ts";
import { afterRun, builtAlready, doneRecord, noteDone, planNudge, STEP_LIMIT, summaryChars, type Done } from "./redo.ts";
import { digestNote, errorDigest, extendNote, moreSteps, onlyLooks, peekedFiles, peekNote, PEEK_WARN, progressSay, stepCap, WINDOW } from "./keepgoing.ts";
import { findBrowser, isUiFile, judgeLLM, pickSurface, webPage, type SurfaceOptions } from "./judge.ts";
import { crimeList, findCrimes } from "./crimes.ts";
import { saveFrame } from "./timelapse.ts";
import { loadTaste, tasteSummary } from "./tools/director.ts";
import { riskOf, type ToolContext } from "./tools/types.ts";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { addRule, correctionPrompt, fallbackRule, handDiff, isStanding, loadRules, parseRule, soundsLikeCorrection, type Correction, type Rule } from "./learn.ts";
import type { CrewBoard } from "./crew.ts";
import type { Study } from "./lab/lab.ts";
import { answerText, ASK_PROMPT, askTool, MAX_QUESTIONS, type AskFn, type Question } from "./ask.ts";

// The local model got stuck and a helper took over (active), or handed back.
export type Escalation = { active: boolean; model: string; reason: string; steps?: number; usage?: { input: number; output: number }; text?: string };

export type AgentIO = {
  token(t: string): void;
  toolStart(name: string, args: string): void;
  toolEnd(name: string, result: string): void;
  // stillNeeded: false once the user switched to a mode that lets this run
  // (auto-run turned on while the card waits), so the UI can allow it itself.
  ask(question: string, preview: string, stillNeeded?: () => boolean): Promise<Answer>;
  note(text: string): void;
  // Screenshots as they arrive, for UIs that can show them.
  image?(tool: string, images: Image[]): void;
  // What the model is doing while it streams (often for minutes on a CPU).
  progress?(p: StreamProgress): void;
  // The pinned checklist, whenever the model writes or ticks it.
  plan?(steps: Step[]): void;
  // The helper model taking over a hard step, and handing back.
  escalation?(e: Escalation): void;
  // A follow-up question from the model (ask_user). Without it the model is not offered the tool.
  question?: AskFn;
  // A rule learned from the user's correction (new, or said again), for UIs that offer to take it back.
  learned?(l: Learned): void;
  // The text just streamed was not an answer (the model's thinking, or cut off); Maxx asks again.
  retract?(why: Unfinished): void;
  // A repository was cloned: offer to open it as the project (the app shows a button).
  workspace?(dir: string, name: string): void;
};

export type Learned = { rule: Rule; isNew: boolean; replaced?: string; kind: Correction["kind"]; text: string };
const FROM: Record<Correction["kind"], string> = { said: "from what you said", denied: "from why you said no", handfix: "from your fix", undid: "from your undo" };

export type AgentOptions = {
  llm: LLMConfig;
  cwd: string;
  permissions: Permissions;
  contextWindow?: number;
  maxSteps?: number;
  // The most steps one turn may take while it keeps making progress (default 4 × maxSteps; 0 = stop at maxSteps).
  keepGoing?: number;
  tools?: Tool<any>[];
  toolsets?: string[];
  vision?: Vision;
  session?: string;
  // Small-model helpers, all on by default.
  plan?: boolean;
  memory?: boolean;
  // The fix-it loop: how many times to send a failed check back (0 turns it off),
  // and the build command to run (default: detected; false for syntax checks only).
  fixTries?: number;
  check?: string | false;
  // A bigger model for when the local one is stuck; none keeps everything local.
  helper?: Helper | null;
  // May the model install packages and download files? Off unless turned on.
  network?: boolean;
  // How much the model says (default brief); only the prompt changes.
  brevity?: Brevity;
  // How much the model may think before acting (default auto: sized per step).
  thinking?: Thinking;
  // The colors the model designs with (null or unset: it picks its own).
  palette?: Palette | null;
  // Chat mode: no tools, no project, and a prompt about drawing visuals instead.
  chat?: boolean;
  // The look-up tools offered while network access is on (default: web search, web fetch and MCP servers).
  online?: () => Promise<Online>;
  // Tokens of project map in the system prompt and the project_map tool (default: 5% of the context; 0 = off).
  mapTokens?: number;
  // Learn a rule for MAXX.md when the user corrects Maxx (default on; off with memory off and in chat).
  learn?: boolean;
  // The ugliness alarm: after a web page changes, check it for design crimes before finishing (default off; the CLI and app turn it on).
  alarm?: boolean;
  // Save a screenshot after each change you can see, for a time-lapse GIF (default off; the CLI and app turn it on).
  timelapse?: boolean;
};

export type Online = { tools: Tool<any>[]; notes: string[]; servers: string[] };

// Network on: web search, web fetch and every MCP server. Off: only the MCP
// servers that run on this machine and don't need the internet.
async function defaultOnline(network: boolean, cwd: string): Promise<Online> {
  const m = await mcpHub.tools({ network, cwd });
  return { tools: [...(network ? WEB_TOOLS : []), ...m.tools], notes: m.notes, servers: m.servers };
}

const MAX_BAD_CALLS = 3;
// Weak models get stuck re-running a call that already worked (mkdir five
// times over). Count identical call + result pairs in a turn: from the third
// the result carries a nudge, and the fifth ends the turn.
const WARN_REPEATS = 3;
const STOP_REPEATS = 5;
// The same web search or fetch again only brings back what is already above,
// so lookups count by the call alone: the second gets the nudge, and from the
// third the model answers with what it found, with no tools for that step.
const LOOKUPS = new Set(WEB_TOOLS.map((t) => t.name));
const WARN_LOOKUPS = 2;
const STOP_LOOKUPS = 3;
// Once a tool turns out to be missing (no Java, no Android SDK), the model gets
// this many more steps to tell the user before Maxx tells them instead.
const BLOCKED_STEPS = 2;
// A failed check's errors at a glance, when there are several.
const digestOf = (output: string) => {
  const d = errorDigest(output);
  return d && d.count >= 3 ? digestNote(d) : "";
};
// Screenshots are big; only the most recent few stay in the conversation.
// Removing one rewrites an older message, which costs the server its prompt
// cache from that point on, so prune in batches: at 4 images, back down to 2.
const KEEP_IMAGES = 2;
const PRUNE_AT = 4;
const FIX_TRIES = 3;
// Rounds of the ugliness alarm per turn: one list of crimes, then the model's fix stands.
const ALARM_ROUNDS = 1;
// The look alarm: at most this many rounds a turn, and the score that passes.
const LOOK_ROUNDS = 2;
const LOOK_PASS = 70;

function dataImage(url: string): Image | null {
  const m = /^data:(image\/(?:png|jpeg));base64,(.+)$/.exec(url);
  return m ? { mime: m[1] as Image["mime"], base64: m[2]! } : null;
}

export class Agent {
  history: Message[] = [];
  readonly checkpoints: Checkpoints;
  session: string;
  private tools: Tool<any>[];
  // What the model is offered right now, for /tools (the model's own answer can be wrong).
  get toolNames(): string[] {
    return this.tools.map((t) => t.name);
  }
  private setTools: Tool<any>[] = [];
  private online: Online = { tools: [], notes: [], servers: [] };
  // The MCP hub's version when the tools were last picked up (a server added or reconnected bumps it).
  private mcpSeen = -1;
  private prompts: string[] = [];
  toolsets: string[] = [];
  plan: Step[] = [];
  // Escalation banners, by the history length when they happened, so a redrawn transcript keeps them.
  // `retracted`: a reply that was not an answer (the model's thinking), shown folded where it happened.
  marks: { at: number; text: string; active: boolean; learned?: boolean; retracted?: { why: Unfinished; text: string } }[] = [];
  // The last check the fix-it loop ran in the latest turn (null: none ran).
  lastCheck: CheckResult | null = null;
  // Agent mode's task board, while a goal runs and after.
  board: Board | CrewBoard | null = null;
  // The research lab's study, while one runs and after.
  lab: Study | null = null;
  // How long a follow-up question waits before the model's guess is used (Agent mode); unset waits for ever.
  askWaitMs?: number;
  // Questions asked in the current turn, and the turn's stop signal (a question must not outlive it).
  private asked = 0;
  // Where to find the running app (the Preview panel, a dev server), for the alarm, time-lapse and judge.
  surfaces: Partial<SurfaceOptions> = {};
  // Screenshots for the time-lapse, taken one at a time in the background.
  private frames: Promise<void> = Promise.resolve();
  private alarmRounds = 0;
  private lookRounds = 0;
  // Images the user attached to the latest message (sketch_to_app uses them).
  private attachedNow: Image[] = [];
  private turnSignal?: AbortSignal;
  // Learning from corrections: what this turn did, and what the last one left behind.
  private turnDid: string[] = [];
  private turnFiles = new Set<string>();
  private turnFrom = 0;
  // Where this turn's messages start in history.
  private turnAt = 0;
  private lastTurn: { did: string[]; files: Map<string, string>; start?: string; undone: boolean } | null = null;
  // What already worked this session, from Maxx's own records, so a compaction can't make the model forget it built the app.
  private done: Done[] = [];
  private turnNo = 0;
  // The turn the Plan was last written or ticked in, and why the current turn ended.
  private planTurn = -1;
  private ending: Ending = "answered";
  // The current request in the user's words, kept for the compaction record.
  private turnAsk = "";
  // The model's commands since its last file change, while they all passed (see afterRun):
  // when one is Maxx's own build check, running the check again would only build the app twice.
  private cleanRuns: string[] = [];
  private corrections: Correction[] = [];

  constructor(private opts: AgentOptions, readonly io: AgentIO) {
    this.tools = this.baseTools();
    this.session = opts.session ?? newSessionId();
    this.checkpoints = new Checkpoints(opts.cwd, this.session);
    if (opts.toolsets?.length) this.useToolsets(opts.toolsets);
  }

  // Another agent on the same settings, in another folder: a crew worker in its worktree.
  // It gets the plain tools (no app-window stage, no phone or desktop: those are shared).
  fork(o: Partial<AgentOptions>, io: AgentIO): Agent {
    const { session: _s, tools: _t, toolsets: _ts, ...rest } = this.opts;
    // Workers get task prompts, never the user's corrections, so they learn no rules.
    return new Agent({ ...rest, learn: false, ...o }, io);
  }

  get helper(): Helper | null {
    return this.opts.helper && !this.opts.helper.off ? this.opts.helper : null;
  }

  setHelper(h: Helper | null) {
    this.opts.helper = h;
  }

  get network(): boolean {
    return this.opts.network === true;
  }

  // The system prompt says which, so the model doesn't plan around an install it can't do.
  async setNetwork(on: boolean) {
    this.opts.network = on;
    await this.goOnline();
    await this.refreshSystemPrompt();
  }

  get brevity(): Brevity {
    return this.opts.brevity ?? DEFAULT_BREVITY;
  }

  async setBrevity(level: Brevity) {
    this.opts.brevity = level;
    await this.refreshSystemPrompt();
  }

  get thinking(): Thinking {
    return this.opts.thinking ?? DEFAULT_THINKING;
  }

  async setThinking(level: Thinking) {
    this.opts.thinking = level;
    await this.refreshSystemPrompt();
  }

  get palette(): Palette | null {
    return this.opts.palette ?? null;
  }

  async setPalette(p: Palette | null) {
    this.opts.palette = p;
    await this.refreshSystemPrompt();
  }

  get vision(): Vision {
    return this.opts.vision ?? { mode: "native" };
  }

  // Switch tool groups; the system prompt is rewritten in place, history kept.
  useToolsets(names: string[]) {
    if (this.opts.chat) return;
    const { tools, prompts } = withToolsets(names);
    this.setTools = tools;
    this.tools = [...this.baseTools(), ...tools];
    this.prompts = prompts;
    this.toolsets = names;
    if (this.vision.mode === "off" && names.length) this.prompts.push("You cannot see images in this session; screenshots arrive as element lists only.");
  }

  get chat(): boolean {
    return !!this.opts.chat;
  }

  get mapTokens(): number {
    return this.opts.chat ? 0 : (this.opts.mapTokens ?? mapBudget(this.opts.contextWindow ?? 32_768));
  }

  get llm(): LLMConfig {
    return this.opts.llm;
  }

  get cwd(): string {
    return this.opts.cwd;
  }

  get permissions(): Permissions {
    return this.opts.permissions;
  }

  get contextWindow(): number {
    return this.opts.contextWindow ?? 32_768;
  }

  clearPlan() {
    this.setPlan([]);
  }

  // The recipe recorder: turn this session's work into a playbook in the
  // project's .maxx/recipes, so the next session (or a smaller model) can repeat it.
  async recordRecipe(hint = "", signal?: AbortSignal): Promise<{ recipe: Recipe; path: string }> {
    if (this.opts.chat) throw new Error("recipes are recorded from project work; open a project folder first");
    const worked = this.history.filter((m) => m.role === "tool").length;
    if (worked < 2) throw new Error("nothing to record yet: do a task first, then save it as a recipe");
    const text = await this.think(recorderMessages(this.history, hint), signal);
    const recipe = parseRecorded(text, hint || "recorded");
    if (!recipe) throw new Error("the model did not write a recipe; try again, or give it a name: /recipe save <what it is for>");
    const path = await saveRecipe(projectRecipesDir(this.opts.cwd), recipe);
    await this.refreshSystemPrompt();
    return { recipe, path };
  }

  // A one-off request outside the conversation (Agent mode's planner, the
  // screenshot judge), with the same progress display as a turn.
  async think(messages: Message[], signal?: AbortSignal, llm: LLMConfig = this.opts.llm): Promise<string> {
    const promptTokens = estimateTokens(messages);
    // Planning and judging deserve a moderate think, not the model's full habit.
    const thinking: ThinkPlan = this.thinking === "auto" ? { tier: 2, budget: BUDGET[2], why: "a one-off request" } : planFor(this.thinking, "normal", { step: 0, failed: false, failures: 0 });
    const res = await complete(llm.provider === "anthropic" ? llm : { ...llm, thinking }, messages, [], () => {}, signal, (p) => this.io.progress?.({ ...p, promptTokens }));
    return res.content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  }

  note(text: string) {
    this.io.note(text);
  }

  // Ask before something outside a tool call (the lab's instruments): the
  // same Allow / Always / Deny card, and Always saves a rule like
  // instrument(serial:COM3). `private` things (camera, mic) ask even when
  // the mode never asks, unless a rule allows them.
  async approve(name: string, key: string, question: string, preview: string, privacy = false): Promise<"you" | "saved rule" | "not needed" | "denied"> {
    const tool = { name, risk: "exec", ruleKey: () => key } as unknown as Tool<any>;
    const perms = this.opts.permissions;
    const asks = privacy ? !perms.allows(tool, {}) : perms.needsPrompt(tool, {});
    if (!asks) return perms.allows(tool, {}) ? "saved rule" : "not needed";
    const a = await this.io.ask(question, preview, () => (privacy ? !perms.allows(tool, {}) : perms.needsPrompt(tool, {})));
    if (a === "no") return "denied";
    if (a === "always") await perms.remember(tool, {});
    return "you";
  }

  get canAsk(): boolean {
    return !!this.io.question;
  }

  // Put a question to the user and wait. Null: nobody answered, with why.
  async ask(q: Omit<Question, "id" | "deadline">, signal?: AbortSignal): Promise<{ answer: string | null; why: "none" | "timeout" | "stopped" }> {
    if (!this.io.question) return { answer: null, why: "none" };
    const wait = this.askWaitMs;
    const timer = wait ? AbortSignal.timeout(wait) : undefined;
    const all = [signal, timer].filter((s): s is AbortSignal => !!s);
    const s = all.length ? AbortSignal.any(all) : new AbortController().signal;
    const answer = await this.io.question({ ...q, id: crypto.randomUUID(), deadline: wait ? Date.now() + wait : undefined }, s).catch(() => null);
    if (answer?.trim()) return { answer: answer.trim(), why: "none" };
    if (signal?.aborted) throw Object.assign(new Error("stopped"), { name: "AbortError" });
    return { answer: null, why: timer?.aborted ? "timeout" : "stopped" };
  }

  // ask_user inside a turn: counted, and answered in words the model reads.
  private async askTurn(q: Omit<Question, "id" | "deadline">): Promise<string> {
    if (++this.asked > MAX_QUESTIONS) return answerText(q, null, "limit");
    const r = await this.ask(q, this.turnSignal);
    if (r.answer === null) this.io.note(`(no answer${q.guess ? `; going with "${q.guess}"` : ""})`);
    return answerText(q, r.answer, r.why);
  }

  private baseTools(): Tool<any>[] {
    if (this.opts.chat) return this.online.tools;
    const extra: Tool<any>[] = [];
    if (this.opts.plan !== false) extra.push(planTool(() => this.plan, (s) => ((this.planTurn = this.turnNo), this.setPlan(s))));
    if (this.opts.memory !== false) extra.push(rememberTool);
    if (this.io.question) extra.push(askTool((q) => this.askTurn(q)));
    if (this.mapTokens > 0) extra.push(projectMapTool(() => this.mapTokens));
    return [...(this.opts.tools ?? TOOLS), ...this.online.tools, ...extra];
  }

  // Network on: web search, web fetch and the MCP servers' tools join in. Off: gone again.
  private async goOnline() {
    const before = this.online.notes;
    this.mcpSeen = mcpHub.version;
    this.online = this.opts.online ? (this.network ? await this.opts.online() : { tools: [], notes: [], servers: [] }) : this.opts.chat && !this.network ? { tools: [], notes: [], servers: [] } : await defaultOnline(this.network, this.opts.cwd);
    for (const n of this.online.notes) if (!before.includes(n)) this.io.note(`(${n})`);
    this.tools = [...this.baseTools(), ...this.setTools];
  }

  // What the system prompt says about looking things up.
  private lookupNote(): string {
    if (!this.online.tools.length) return "";
    if (!this.network) return this.online.servers.length ? `You also have tools from these MCP servers: ${this.online.servers.join(", ")}. Use them when they fit the task.` : "";
    return lookupPrompt(new Date(), this.online.servers.map((s) => `the ${s} tools`));
  }

  private setPlan(steps: Step[]) {
    this.plan = steps;
    this.io.plan?.(steps);
  }

  async refreshSystemPrompt() {
    const notes = [this.opts.plan !== false ? PLAN_PROMPT : "", this.opts.memory !== false ? MEMORY_PROMPT : "", this.io.question ? ASK_PROMPT : "", NETWORK_PROMPT[this.network ? "on" : "off"], this.lookupNote()].filter(Boolean).join(" ");
    const style = [palettePrompt(this.palette), BREVITY_PROMPT[this.brevity], THINKING_PROMPT[this.thinking]].filter(Boolean).join("\n");
    // Last, so it is what the model read most recently.
    // The map as it was when the session started; project_map gives a fresh one.
    const recipes = !this.opts.chat && this.tools.some((t) => t.name === "recipe") ? recipesPrompt(await loadRecipes(this.opts.cwd).catch(() => [])) : "";
    const map = !this.opts.chat && this.mapTokens > 0 ? await projectMap(this.opts.cwd, this.mapTokens).catch(() => "") : "";
    // Design taste from rival_designs picks, while design tools are on.
    const taste = !this.opts.chat && this.tools.some((t) => t.name === "rival_designs" || t.name === "draw_svg") ? tasteSummary(await loadTaste()) : "";
    const content = this.opts.chat ? chatPrompt(new Date(), this.lookupNote(), style) : await systemPrompt(this.opts.cwd, [...(notes ? [notes] : []), ...this.prompts, ...(recipes ? [recipes] : []), ...(taste ? [taste] : []), ...(map ? [`${map}\n(This map is from the start of the session; call project_map for a fresh one.)`] : []), ...(style ? [style] : [])]);
    if (this.history[0]?.role === "system") this.history[0] = { role: "system", content };
    else this.history.unshift({ role: "system", content });
  }

  async init() {
    this.history = [];
    this.done = [];
    this.turnAsk = "";
    this.setPlan([]);
    this.marks = [];
    this.board = null;
    this.lab = null;
    await this.goOnline();
    await this.refreshSystemPrompt();
    return this;
  }

  // Continue a saved session: its turns, with today's system prompt.
  async restore(id: string, history: Message[]) {
    this.session = id;
    this.history = dropRepeatedAnswers(history.filter((m) => m.role !== "system"));
    this.setPlan(planFromHistory(this.history));
    this.marks = [];
    await this.refreshSystemPrompt();
  }

  // One user turn: loop until the model answers without calling tools.
  // A turn with attached images comes as parts (see attach.ts).
  // Agent mode gives each task its own step budget.
  // Agent mode's own task prompts pass learn: false; they are not the user talking.
  // report: false leaves out the wrap-up (Agent and Crew mode read the bare answer for DONE / STUCK).
  async send(userText: string | ContentPart[], signal?: AbortSignal, o: { maxSteps?: number; learn?: boolean; report?: boolean } = {}): Promise<string> {
    const learning = this.learning && o.learn !== false;
    if (learning) await this.noticeCorrection(userText).catch(() => {});
    this.turnDid = [];
    this.turnFiles = new Set();
    this.turnNo++;
    // Agent mode's task prompts are reports from Maxx, not the user's words; the goal stays the ask.
    if (learning || !this.turnAsk) this.turnAsk = (typeof userText === "string" ? userText : userText.map((p) => (p.type === "text" ? p.text : "")).join("\n")).trim();
    this.turnFrom = this.checkpoints.count;
    this.turnAt = this.history.length;
    await this.beforeTurn(typeof userText === "string" ? userText : userText.map((p) => (p.type === "text" ? p.text : "")).join("\n")).catch(() => {});
    let answer = "";
    try {
      answer = await this.turn(userText, signal, o);
      // The report goes into the transcript and the stream; callers still get the answer itself.
      if (o.report !== false) await this.wrapUp(answer, signal);
      return answer;
    } finally {
      dropThinking(this.history);
      await this.endTurn(answer, learning, signal).catch(() => {});
    }
  }

  // A server added in the app, or one that finished starting, joins now; and a
  // message about a repository brings the repo tools along.
  private async beforeTurn(ask: string) {
    let prompt = mcpHub.version !== this.mcpSeen && (await this.pickUpTools());
    if (!this.opts.chat && TOOLSETS.repo && !this.toolsets.includes("repo") && wantsRepo(ask)) {
      this.useToolsets([...this.toolsets, "repo"]);
      this.io.note("(added the 🐙 repo tools for this: clone, branch, push, pull requests)");
      prompt = true;
    }
    if (!this.opts.chat && TOOLSETS.music && !this.toolsets.includes("music") && wantsMusic(ask)) {
      this.useToolsets([...this.toolsets, "music"]);
      this.io.note("(added the 🎼 music tools for this: compose, make_song, mix_audio)");
      prompt = true;
    }
    const blender = !this.opts.chat && TOOLSETS.blender && (wantsBlender(ask) || hasBlendFiles(this.opts.cwd));
    if (blender && !this.toolsets.includes("blender")) {
      this.useToolsets([...this.toolsets, "blender"]);
      this.io.note("(added the 🧊 Blender tools for this: realistic scenes, renders, turntables, scanned assets)");
      prompt = true;
    }
    // A Blender scene isn't a three.js game: leave the look tools out unless the ask is about a game.
    const gameAsk = /\bgame|three\.?js|webgl/i.test(ask);
    if (!this.opts.chat && TOOLSETS.look && !this.toolsets.includes("look") && (!blender || gameAsk) && (wantsLook(ask) || (await usesThree(this.opts.cwd).catch(() => false)))) {
      this.useToolsets([...this.toolsets, "look"]);
      this.io.note("(added the 🎬 look tools for this: art direction, the LOOK realism kit, look scores, CC0 assets)");
      prompt = true;
    }
    if (prompt) await this.refreshSystemPrompt();
  }

  // Take in MCP servers that were added, changed or finished starting. True when the tools changed.
  private async pickUpTools(): Promise<boolean> {
    if (this.opts.online) return false;
    const before = this.toolNames.join();
    await this.goOnline();
    return this.toolNames.join() !== before;
  }

  // The app's MCP dialog changed something: show it in /tools and the prompt now, not on the next message.
  async refreshTools() {
    if (await this.pickUpTools()) await this.refreshSystemPrompt();
  }

  private async turn(userText: string | ContentPart[], signal: AbortSignal | undefined, o: { maxSteps?: number }): Promise<string> {
    dropThinking(this.history);
    this.history.push({ role: "user", content: withPalette(userText, this.palette) });
    this.lastCheck = null;
    this.ending = "answered";
    // Steps the last turn left not done are open again: this turn may be the one that finishes them.
    if (this.plan.some((s) => s.missed)) this.setPlan(this.plan.map((s) => ({ text: s.text, done: s.done })));
    this.cleanRuns = [];
    this.asked = 0;
    this.alarmRounds = 0;
    this.lookRounds = 0;
    this.turnSignal = signal;
    this.attachedNow = Array.isArray(userText) ? userText.flatMap((p) => (p.type === "image_url" ? [dataImage(p.image_url.url)].filter((x): x is Image => !!x) : [])) : [];
    if (Array.isArray(userText)) this.pruneImages();
    const specs = toolSpecs(this.tools);
    let badCalls = 0;
    let failures = 0;
    let repeats = new Map<string, number>();
    let stuck = 0;
    // For the fix-it loop: files changed since the last check, and checks sent back.
    const changed = new Set<string>();
    let fixes = 0;
    let nudged = false;
    let lastFail = "";
    // Brain swap: while `helping` is set, the helper model drives.
    let helping: { reason: string; steps: number; usage: { input: number; output: number } } | null = null;
    let escalations = 0;
    const handBack = (why: string) => {
      const h = this.helper ?? this.opts.helper!;
      const e: Escalation = { active: false, model: h.model, reason: why, steps: helping!.steps, usage: helping!.usage };
      helping = null;
      repeats = new Map();
      failures = badCalls = stuck = 0;
      this.mark(e, `Back to ${this.opts.llm.model}: ${why}${spent(e)}`);
    };
    let blocked: Missing | undefined;
    let blockedSteps = 0;
    // Replies that weren't answers (thinking, cut off): asked again this many times.
    let finishTries = 0;
    // Said to the model with the next request only (never kept in the history).
    let pending = "";
    // Lookups went in circles: one step with no tools, to answer from what it found.
    let answerNow = false;
    // Thinking: sized by the ask, then by how the last step went.
    const size = sizeAsk(typeof userText === "string" ? userText : userText.map((p) => (p.type === "text" ? p.text : "")).join("\n"));
    let lastFailed = false;
    let failedInARow = 0;

    // The step budget grows while the turn keeps changing things (see keepgoing.ts).
    // Agent and Crew mode pass their own per-task budget and handle running out themselves.
    let limit = o.maxSteps ?? this.opts.maxSteps ?? 50;
    const cap = o.maxSteps ? limit : stepCap(limit, this.opts.keepGoing);
    let lastProgress = -1;
    const lately: { step: number; what: string }[] = [];
    const progress = (step: number, what: string) => {
      lastProgress = step;
      lately.push({ step, what });
    };
    let errors: number | undefined;
    const peeks = new Map<string, number>();
    let ranOut = false;

    for (let step = 0; ; step++) {
      if (step >= limit) {
        const next = moreSteps({ step, limit, cap, lastProgress });
        if (!next) {
          ranOut = true;
          break;
        }
        const recent = new Map<string, number>();
        for (const p of lately) if (step - p.step <= WINDOW) recent.set(p.what, (recent.get(p.what) ?? 0) + 1);
        this.io.note(`(used ${step} steps and still making progress: ${progressSay(recent)} in the last ${WINDOW}. Keeping going, up to ${next} of ${cap})`);
        limit = next;
        pending = [pending, extendNote(step, limit, cap)].filter(Boolean).join("\n\n");
      }
      if (signal?.aborted) throw Object.assign(new Error("stopped"), { name: "AbortError" });
      await this.maybeCompact(signal);
      if (helping && !this.helper) handBack("the helper was turned off");
      const helper = helping && this.helper;
      const thinking = planFor(this.thinking, size, { step, failed: lastFailed, failures: failedInARow });
      const llm = helper ? helperLLM(helper, this.opts.llm.baseURL) : { ...this.opts.llm, thinking };
      // The brief rides along with each helper request; it is not kept in history.
      const once: Message[] = pending ? [{ role: "user", content: [{ type: "text", text: pending }] }] : [];
      const seenHistory = withoutReports(this.history);
      const messages: Message[] = helper ? [...seenHistory, ...once, { role: "user", content: [{ type: "text", text: brief(helping!.reason, this.opts.llm.model) }] }] : once.length ? [...seenHistory, ...once] : seenHistory;
      pending = "";
      const offer = answerNow ? [] : specs;
      answerNow = false;
      const promptTokens = estimateTokens(messages);
      let res;
      try {
        res = await complete(llm, messages, offer, (t) => this.io.token(t), signal, (p) => this.io.progress?.({ ...p, promptTokens }));
      } catch (e) {
        // Too long for the model: the server says how much it really has. Plan for that and compact.
        const real = helping ? null : contextFromError((e as Error).message);
        if (real && real < this.contextWindow) {
          this.io.note(`(${this.opts.llm.model} has only ${real} tokens of context, not ${this.contextWindow}; Maxx now plans for ${real})`);
          this.opts.contextWindow = real;
          await this.maybeCompact(signal);
          continue;
        }
        // A helper that can't be reached (no key, no credit, offline) must not end the turn.
        if (!helping || (e as Error).name === "AbortError") throw e;
        this.io.note(`(the helper model failed: ${(e as Error).message})`);
        handBack("the helper could not be reached");
        continue;
      }
      if (res.rescued) this.io.note(`(recovered ${res.toolCalls.length} tool call(s) written as text)`);
      if (res.thought?.cut) this.io.note(`(thinking cut after ${res.thought.tokens} tokens: ${res.thought.cut === "loop" ? "it was going in circles" : `budget ${thinking.budget} for ${thinking.why}`})`);
      if (helping && res.usage) (helping.usage.input += res.usage.input), (helping.usage.output += res.usage.output);
      if (helping && res.refused) {
        handBack("the helper declined this step");
        continue;
      }

      if (!res.toolCalls.length) {
        // Not an answer: the model's thinking, a sentence that stops, no room left. Ask it to go on.
        const why = helping ? null : unfinished(res.content, res.finish);
        if (why && finishTries < FINISH_TRIES) {
          finishTries++;
          this.io.retract?.(why);
          this.marks.push({ at: this.history.length, text: UNFINISHED_SAY[why], active: false, retracted: { why, text: (res.content || res.reasoning || "").slice(0, 6000) } });
          this.io.note(`(${UNFINISHED_SAY[why]}; asking ${this.opts.llm.model} to finish, try ${finishTries} of ${FINISH_TRIES})`);
          pending = finishNote(why, res.content, res.reasoning);
          continue;
        }
        if (why) {
          this.io.note(finishWarning(why, this.opts.llm.model, this.contextWindow));
          if (!res.content.trim()) {
            const msg = `Stopped: ${this.opts.llm.model} ended without writing an answer. Send "continue" to let it try again, or switch to another model.`;
            this.history.push({ role: "assistant", content: msg });
            this.ending = "empty";
            return msg;
          }
        }
        this.history.push({ role: "assistant", content: res.content });
        if (helping) handBack("it answered");
        // A missing tool fails every check, so the fix-it loop would only go in circles.
        const more = blocked ? null : await this.beforeFinish(changed, fixes, nudged, signal);
        if (more === "fix") fixes++;
        // A failed check is worth thinking about; a plan nudge is not.
        lastFailed = more === "fix";
        failedInARow = lastFailed ? failedInARow + 1 : 0;
        if (more === "plan") nudged = true;
        if (more) continue;
        return res.content;
      }

      // A rescued call's text would confuse the model on the next turn, so store it as a real tool call.
      // Its thinking rides along until the turn ends, so the next step knows why it made the call.
      const thought = keptThinking(res.reasoning, this.contextWindow);
      this.history.push({ role: "assistant", content: res.rescued ? null : res.content || null, tool_calls: toWire(res.toolCalls), ...(thought ? { reasoning_content: thought } : {}) });
      const seen: ContentPart[] = [];
      let stepFailed = false;
      let trigger = "";
      const ticked = this.plan.filter((s) => s.done).length;
      for (const call of res.toolCalls) {
        // After Stop, the rest of the step's calls don't run, but each still gets a result so the history stays whole.
        let { result, bad, images, glance, args } = signal?.aborted ? { result: "error: not run, the user pressed Stop", bad: false } as Awaited<ReturnType<Agent["runTool"]>> : await this.runTool(call);
        badCalls = bad ? badCalls + 1 : 0;
        if (args) await this.learn(call.name, args, result, changed, lastFail).then((f) => (lastFail = f));
        const fail = bad || failed(result);
        failures = fail ? failures + 1 : 0;
        stepFailed ||= fail;
        blocked ??= missingTool(result);
        // Momentum: what counts as getting somewhere, and notes that save steps.
        if (args) {
          const risk = findTool(call.name, this.tools) ? riskOf(findTool(call.name, this.tools)!, args) : "read";
          const command = call.name === "bash" ? String(args.command ?? "") : "";
          if (risk === "write" && !fail && !/^no change/.test(result)) {
            progress(step, typeof args.path === "string" ? "file changes" : "actions");
            if (typeof args.path === "string") peeks.delete(peekedFiles(args.path)[0] ?? "");
          } else if (risk === "exec" && !fail && !(command && onlyLooks(command))) progress(step, command ? "commands run" : "actions");
          if (call.name === "bash") {
            const d = fail ? errorDigest(result) : null;
            if (d) {
              if (errors !== undefined && d.count < errors) progress(step, "fewer build errors");
              if (d.count >= 3) result += digestNote(d, errors);
              errors = d.count;
            } else if (!fail && errors !== undefined && !onlyLooks(command)) {
              errors = undefined;
              progress(step, "fewer build errors");
            }
          }
          const looked = call.name === "read_file" && typeof args.path === "string" ? peekedFiles(args.path) : command && onlyLooks(command) ? peekedFiles(command) : [];
          for (const f of looked) {
            const n = (peeks.get(f) ?? 0) + 1;
            peeks.set(f, n);
            if (n === PEEK_WARN || n === PEEK_WARN * 2) result += peekNote(f, n);
          }
        }
        // Sending the same edit or write again is never progress, whatever it returned
        // (applied, then "not found", then applied...), so those count by the call alone.
        const writes = findTool(call.name, this.tools)?.risk === "write";
        const lookup = LOOKUPS.has(call.name);
        const key = `${call.name}|${canonicalArgs(call.arguments)}${writes || lookup ? "" : `|${result}`}`;
        const n = (repeats.get(key) ?? 0) + 1;
        repeats.set(key, n);
        if (lookup && n >= WARN_LOOKUPS) {
          result += `\n\nNote from Maxx: you already made this exact ${call.name} call${n > 2 ? ` ${n} times` : ""} in this turn, so these results are the same as before. ${n >= STOP_LOOKUPS ? "Searching again is off for the next step: answer the user now with what you found, and say what you could not find." : "Use what you found above, or try different words."}`;
          if (n >= STOP_LOOKUPS) {
            answerNow = true;
            this.io.note(`(${call.name} ran ${n} times with the same input; Maxx asked for an answer from what was found)`);
          }
        } else if (n >= WARN_REPEATS) {
          stuck = Math.max(stuck, n);
          stepFailed = true;
          trigger ||= `it ran the same ${call.name} call ${n} times${writes ? "" : " with the same result"}`;
          result += `\n\nNote from Maxx: you have made this exact ${call.name} call ${n} times in this turn and ${writes ? "already made that change" : "got the same result each time"}. Repeating it will not change anything. Do the next step of the task instead, or reply to the user if you are stuck.`;
        }
        if (images?.length) this.io.image?.(call.name, images);
        const content = images?.length ? await this.deliverImages(call.name, result, images, seen, signal, glance) : result;
        this.history.push({ role: "tool", tool_call_id: call.id, content });
      }
      // Tool messages can't carry images on most servers, so they follow as one user message.
      if (seen.length) {
        this.history.push({ role: "user", content: seen });
        this.pruneImages();
      }

      if (this.plan.filter((s) => s.done).length > ticked) progress(step, "plan steps ticked");
      lastFailed = stepFailed;
      failedInARow = stepFailed ? failedInARow + 1 : 0;
      // A missing program (Java, the Android SDK, adb) can't be fixed from here, not even by the helper.
      if (blocked && ++blockedSteps > BLOCKED_STEPS) {
        if (helping) handBack("a program it needs is not installed");
        const msg = `Stopped: this computer does not have ${blocked.what}, so I can't finish this here. ${blocked.install}`;
        this.history.push({ role: "assistant", content: msg });
        this.ending = "blocked";
        return msg;
      }
      if (helping) {
        helping.steps++;
        const max = this.helper?.maxSteps ?? HELPER_DEFAULTS.maxSteps;
        if (!stepFailed) {
          handBack("the step worked");
          this.tellLocal("A stronger helper model just took over and got past the step you were stuck on (the calls above). Carry on with the rest of the task from here.");
          continue;
        }
        if (helping.steps >= max) {
          handBack(`still stuck after ${max} helper steps`);
          continue;
        }
      } else {
        const h = this.helper;
        trigger ||= failures >= (h?.afterFailures ?? HELPER_DEFAULTS.afterFailures) ? `${failures} failed tool calls in a row` : badCalls >= MAX_BAD_CALLS ? "it kept writing invalid tool calls" : "";
        if (trigger && h && !blocked && escalations < (h.maxPerTurn ?? HELPER_DEFAULTS.maxPerTurn)) {
          escalations++;
          helping = { reason: trigger, steps: 0, usage: { input: 0, output: 0 } };
          this.mark({ active: true, model: h.model, reason: trigger }, `Stuck: ${trigger}. Handing this step to ${describeHelper(h)}`);
          continue;
        }
      }
      if (stuck >= STOP_REPEATS) {
        const msg = "Stopped: the model kept repeating the same tool call without making progress. Try a more specific request, or a stronger model (run `maxx doctor` to check this one).";
        this.history.push({ role: "assistant", content: msg });
        this.ending = "repeats";
        return msg;
      }
      if (badCalls >= MAX_BAD_CALLS) {
        const msg = "Stopped: the model kept producing invalid tool calls. Try rephrasing, or run `maxx doctor` to check this model.";
        this.history.push({ role: "assistant", content: msg });
        this.ending = "badcalls";
        return msg;
      }
    }
    if (helping) handBack("the turn hit its step limit");
    // Out of steps while still changing things (the hard cap), or stalled: nothing changed for a while.
    // At the first limit it is simply out of steps; after more were given, it stalled.
    const stalled = ranOut && limit < cap && limit > (o.maxSteps ?? this.opts.maxSteps ?? 50);
    this.ending = stalled ? "stalled" : "steps";
    if (stalled) this.io.note(`(stopped after ${limit} steps: nothing changed in the last ${WINDOW})`);
    return STEP_LIMIT;
  }

  // Bookkeeping after each tool call: which files changed, and lessons from a fix that worked.
  private async learn(name: string, args: Record<string, unknown>, result: string, changed: Set<string>, lastFail: string): Promise<string> {
    const tool = findTool(name, this.tools);
    const denied = result.startsWith("user denied this tool call");
    const bad = failed(result) || denied;
    const risk = tool && riskOf(tool, args);
    if (tool && risk !== "read") this.turnDid.push(`${denied ? "(denied) " : ""}${name} ${tool.ruleKey?.(args as never) ?? ""}`.trim().slice(0, 160));
    if (tool?.risk === "write" && typeof args.path === "string" && !bad) changed.add(args.path), this.turnFiles.add(args.path), this.captureFrame(args.path);
    if (tool && risk !== "read" && !bad) this.done = noteDone(this.done, this.turnNo, `${name} ${tool.ruleKey?.(args as never) ?? ""}`);
    if (tool?.risk === "write") this.cleanRuns = [];
    if (name !== "bash") return lastFail;
    const command = String(args.command ?? "");
    this.cleanRuns = afterRun(this.cleanRuns, command, !bad);
    if (bad) return command;
    const lesson = this.opts.memory !== false && lastFail ? swapLesson(lastFail, command) : null;
    if (lesson && (await addLesson(this.opts.cwd, lesson).catch(() => false))) this.io.note(`(noted in MAXX.md: ${lesson})`);
    return "";
  }

  // The model wants to stop. Check its work first, and hold it to its plan.
  // Returns why the turn goes on, or null to let it end.
  private async beforeFinish(changed: Set<string>, fixes: number, nudged: boolean, signal?: AbortSignal): Promise<"fix" | "plan" | null> {
    const tries = this.opts.fixTries ?? FIX_TRIES;
    if (changed.size && tries > 0) {
      const files = [...changed];
      changed.clear();
      const r = await this.check(files, signal);
      if (r) this.lastCheck = r;
      if (r && !r.ok) {
        if (fixes >= tries) {
          this.io.note(`(${r.what} still fails after ${tries} tries; over to you)`);
          this.ending = "checkfail";
          return null;
        }
        const c = coach("bash", {}, r.output, process.platform, this.network);
        const hint = c.hint ? `\nMaxx hint: ${c.hint}` : "";
        const text = `Maxx checked your changes: ${r.what} failed (try ${fixes + 1} of ${tries}).\n${excerpt(r.output, c.first)}${hint}${digestOf(r.output)}\nFix this, then reply when it works.`;
        // A parts array, so it reads as a report from Maxx rather than a new request (and the UI shows it as a note).
        this.history.push({ role: "user", content: [{ type: "text", text }] });
        return "fix";
      }
      if (r) this.io.note(`(checked: ${r.what} passed)`);
      if (this.opts.alarm && files.some(isUiFile) && this.alarmRounds < ALARM_ROUNDS && !signal?.aborted) {
        this.alarmRounds++;
        const crimes = await this.uglyCheck(files, signal);
        if (crimes) {
          const text = `Maxx's ugliness alarm checked the page at phone and desktop size and found design crimes:\n${crimes}\nFix them (or say why one is on purpose), then reply when done.`;
          this.history.push({ role: "user", content: [{ type: "text", text }] });
          return "fix";
        }
      }
      if (this.opts.alarm && files.some((f) => isUiFile(f) || /\.m?js$/i.test(f)) && this.lookRounds < LOOK_ROUNDS && !signal?.aborted && (await usesThree(this.opts.cwd).catch(() => false))) {
        this.lookRounds++;
        const look = await this.lookAlarmCheck(files, signal);
        if (look && look.score < LOOK_PASS) {
          const text = `Maxx's look check opened the 3D scene and scored it ${look.score}/100:\n${look.text}\nFix the top items with the LOOK kit (look/README.md), then reply when done.`;
          this.history.push({ role: "user", content: [{ type: "text", text }] });
          return "fix";
        }
      }
    }
    const open = this.plan.map((s, i) => (s.done ? 0 : i + 1)).filter(Boolean);
    if (!nudged && this.planTurn === this.turnNo && open.length) {
      const text = planNudge(open, formatPlan(this.plan));
      this.history.push({ role: "user", content: [{ type: "text", text }] });
      return "plan";
    }
    return null;
  }

  // The turn is over, however it ended: reconcile the Plan (each open step done
  // or not done, with why) and end on one line that says whether the task is done.
  // Returns the turn's last message as the transcript now shows it.
  private async wrapUp(answer: string, signal?: AbortSignal): Promise<string> {
    if (this.opts.chat || signal?.aborted) return answer;
    const ending = this.ending;
    const mine = this.history.at(-1);
    if (this.history.length > this.turnAt && mine?.role === "assistant" && !mine.tool_calls?.length && typeof mine.content === "string") mine.content = stripReport(mine.content);
    const planned = this.planTurn === this.turnNo && this.plan.length > 0;
    // A question answered without touching anything needs no report.
    if (ending === "answered" && !planned && !this.turnDid.length) return answer;
    let plan = planned ? this.plan : [];
    let result, summary;
    // Only ask the model when there is something to settle: open steps, a turn Maxx cut short, or a reply that sounds unsure.
    if (plan.some((s) => !s.done) || ending !== "answered" || doubtful(answer)) {
      try {
        const w = parseWrap(await this.verdict(wrapPrompt(plan, ENDING_SAY[ending], ending !== "answered"), signal), plan);
        (plan = w.steps), (result = w.result), (summary = w.summary);
      } catch {
        if (signal?.aborted) return answer;
      }
    }
    if (planned) this.setPlan((plan = closeOpen(plan)));
    const check = this.lastCheck ? { what: this.lastCheck.what, ok: this.lastCheck.ok } : undefined;
    const line = reportLine({ ending, plan, result, check, files: this.turnFiles.size });
    const extra = [ending !== "answered" && summary ? `What I did: ${summary}` : "", line].filter(Boolean).join("\n\n");
    // The model's own reply was streamed already; Maxx's "Stopped: ..." never was.
    const streamed = ending === "answered" || ending === "checkfail";
    const last = this.history.at(-1);
    let full: string;
    // The answer this turn wrote gets the line, once: a "✅ Done" the model wrote itself
    // (copied from earlier answers) is taken off, not read as "already reported".
    // Pushing a second message here is what made Maxx answer twice.
    if (this.history.length > this.turnAt && last?.role === "assistant" && !last.tool_calls?.length && typeof last.content === "string") {
      full = `${stripReport(last.content)}\n\n${extra}`.trim();
      last.content = full;
    } else {
      full = [stripReport(answer), extra].filter(Boolean).join("\n\n");
      this.history.push({ role: "assistant", content: full });
    }
    this.io.token(streamed ? `\n\n${extra}` : `${full}\n`);
    return full;
  }

  // One request with no tools, on top of the conversation (so the server's cache has most of it), with almost no thinking.
  private async verdict(prompt: string, signal?: AbortSignal): Promise<string> {
    const llm = this.opts.llm.provider === "anthropic" ? this.opts.llm : { ...this.opts.llm, thinking: { tier: 0 as const, budget: 256, why: "the end-of-turn report" } };
    const messages: Message[] = [...withoutReports(this.history), { role: "user", content: [{ type: "text", text: prompt }] }];
    const promptTokens = estimateTokens(messages);
    const res = await complete(llm, messages, [], () => {}, signal, (p) => this.io.progress?.({ ...p, promptTokens }));
    return (res.content || "").replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  }

  // Quick syntax check of the changed files, then the project's build command.
  // Check files outside a turn's own fix-it loop (Agent mode, after a try that ran out of steps). Sets lastCheck.
  async verify(files: string[], signal?: AbortSignal): Promise<CheckResult | null> {
    if (!files.length || (this.opts.fixTries ?? FIX_TRIES) <= 0) return null;
    const r = await this.check(files, signal);
    if (r) this.lastCheck = r;
    return r;
  }

  // Turns sent so far; Agent mode keeps it to forget a whole try (which can take more than one turn).
  get turns(): number {
    return this.turnNo;
  }

  private async check(files: string[], signal?: AbortSignal): Promise<CheckResult | null> {
    const quick = await quickCheck(this.opts.cwd, files);
    if (quick && !quick.ok) {
      this.io.toolStart("check", JSON.stringify({ command: quick.what }));
      this.io.toolEnd("check", quick.output);
      return quick;
    }
    const command = this.opts.check === false ? undefined : this.opts.check || detectCheck(this.opts.cwd);
    if (!command || signal?.aborted) return quick;
    // The model just ran this build itself, after its last change, and it passed: running it again only builds the app twice.
    const ran = builtAlready(this.cleanRuns, command);
    if (ran) {
      this.io.note(`(skipped Maxx's build check: the model already ran \`${ran.slice(0, 120)}\` after its last change, and it passed)`);
      return { ok: true, what: `\`${command}\`` };
    }
    const args = { command, timeout: 600 };
    this.io.toolStart("check", JSON.stringify(args));
    if (this.opts.permissions.needsPrompt(bash, args)) {
      const answer = await this.io.ask("Let Maxx check the build?", `$ ${command}`, () => this.opts.permissions.needsPrompt(bash, args));
      if (isNo(answer)) {
        this.io.toolEnd("check", "skipped");
        return quick;
      }
      if (answer === "always") await this.opts.permissions.remember(bash, args);
    }
    // Stop reaches the build too (it throws AbortError, which ends the turn).
    const output = truncate(String(await bash.run(args, { cwd: this.opts.cwd, network: this.network, signal })));
    this.io.toolEnd("check", output);
    return failed(output) ? { ok: false, what: `\`${command}\``, output } : { ok: true, what: `\`${command}\`` };
  }

  private mark(e: Escalation, text: string) {
    this.marks.push({ at: this.history.length, text, active: e.active });
    if (this.io.escalation) this.io.escalation({ ...e, text });
    else this.io.note(text);
  }

  // Appends a line to the latest tool result, so the local model reads it with the output.
  private tellLocal(text: string) {
    const last = this.history[this.history.length - 1];
    const tool = [...this.history].reverse().find((m) => m.role === "tool");
    if (tool && tool.role === "tool" && (last === tool || last?.role === "user")) tool.content += `\n\n(Maxx: ${text})`;
  }

  // Maxx calling a tool on its own (the rebuild after a spoken request): the
  // same permission gate, and kept in the history as if the model had called
  // it, so the model knows what happened on the next turn.
  async runDirect(name: string, args: Record<string, unknown>): Promise<string> {
    const call: ToolCall = { id: `maxx_${Date.now().toString(36)}`, name, arguments: JSON.stringify(args) };
    const { result, images } = await this.runTool(call);
    if (images?.length) this.io.image?.(name, images);
    this.history.push({ role: "assistant", content: null, tool_calls: toWire([call]) }, { role: "tool", tool_call_id: call.id, content: result });
    return result;
  }

  private async deliverImages(tool: string, result: string, images: Image[], seen: ContentPart[], signal?: AbortSignal, glance = false): Promise<string> {
    const v = this.vision;
    if (v.mode === "native") {
      seen.push({ type: "text", text: `Screenshot from ${tool}:` }, ...images.map(imagePart));
      return `${result}\n(the screenshot is attached in the next message)`;
    }
    if (v.mode === "off") return `${result}\n(a screenshot was taken, but this model cannot see images; use the element list)`;
    // A second model is slow to ask; after an action, the element list is usually enough.
    if (glance && !v.always && /^\[\d+\] /m.test(result)) return `${result}\n(screenshot not described; take a screenshot to have the vision model look at it)`;
    try {
      this.io.note(`(asking ${v.llm.model} to look at the screenshot)`);
      return `${result}\n\nWhat the screenshot shows, according to the vision model:\n${await describeImages(v.llm, images, result, signal)}`;
    } catch (e) {
      return `${result}\n(the vision model failed: ${(e as Error).message}; use the element list)`;
    }
  }

  private pruneImages() {
    const withImages = this.history.filter((m) => m.role === "user" && Array.isArray(m.content) && m.content.some((p) => p.type === "image_url")).length;
    if (withImages < PRUNE_AT) return;
    let kept = 0;
    for (let i = this.history.length - 1; i >= 0; i--) {
      const m = this.history[i]!;
      if (m.role !== "user" || !Array.isArray(m.content) || !m.content.some((p) => p.type === "image_url")) continue;
      if (++kept <= KEEP_IMAGES) continue;
      const typed = typedText(m);
      if (typed !== null) {
        this.history[i] = { role: "user", content: `${typed} [image removed to save context]` };
        continue;
      }
      const text = m.content.filter((p) => p.type === "text").map((p) => (p as { text: string }).text).join(" ");
      // Stays a parts array, so it still reads as tool output rather than a new request from the user.
      this.history[i] = { role: "user", content: [{ type: "text", text: `${text} [older screenshot removed to save context]` }] };
    }
  }

  // What a tool gets: the folder, and for the tools that need them, the model, eyes and the user.
  toolCtx(): ToolContext {
    const signal = this.turnSignal;
    return {
      cwd: this.opts.cwd,
      network: this.network,
      signal,
      llm: this.opts.llm,
      vision: this.vision,
      think: (messages) => this.think(messages, signal),
      see: (images, question) => this.see(images, question, signal),
      ask: this.io.question ? async (q) => (await this.ask(q, signal)).answer : undefined,
      show: (images) => this.io.image?.("maxx", images),
      attached: () => this.attachedNow,
      offerWorkspace: this.io.workspace ? (dir, name) => this.io.workspace!(dir, name) : undefined,
    };
  }

  // Ask a model that can see. Null when none can.
  async see(images: Image[], question: string, signal?: AbortSignal): Promise<string | null> {
    const llm = judgeLLM(this.opts.llm, this.vision);
    if (!llm) return null;
    return this.think([{ role: "user", content: [{ type: "text", text: question }, ...images.map(imagePart)] }], signal, llm);
  }

  // The time-lapse: one screenshot after each change you can see, in the background.
  private captureFrame(path: string) {
    if (!this.opts.timelapse || !isUiFile(path)) return;
    const cwd = this.opts.cwd;
    this.frames = this.frames.then(async () => {
      const surface = await pickSurface({ cwd, changed: [path], android: this.toolsets.includes("android"), ...this.surfaces });
      if (surface) await saveFrame(cwd, await surface.shoot(), path.split(/[\\/]/).pop());
    }).catch(() => {});
  }

  get timelapse(): boolean {
    return !!this.opts.timelapse;
  }

  // Resolves once the time-lapse has its latest frame.
  framesSettled(): Promise<void> {
    return this.frames;
  }

  // The ugliness alarm: design crimes on the page that changed. Null: nothing to check.
  async uglyCheck(files: string[], signal?: AbortSignal): Promise<string | null> {
    const browser = findBrowser();
    if (!browser) return null;
    const web = await webPage({ cwd: this.opts.cwd, changed: files, android: false, ...this.surfaces }).catch(() => null);
    if (!web) return null;
    this.io.toolStart("ugly_check", JSON.stringify({ page: web.label }));
    try {
      const crimes = await findCrimes(browser, web.url, { signal });
      const text = crimes.length ? crimeList(crimes) : "";
      this.io.toolEnd("ugly_check", text || "no design crimes found");
      return text;
    } catch (e) {
      this.io.toolEnd("ugly_check", `skipped: ${(e as Error).message}`);
      return null;
    }
  }

  // The look alarm: a quick scene audit of a 3D page that changed. Null: nothing to check.
  async lookAlarmCheck(files: string[], signal?: AbortSignal): Promise<{ score: number; text: string } | null> {
    const pages = files.filter((f) => /\.html?$/i.test(f));
    const web = await webPage({ cwd: this.opts.cwd, changed: pages.length ? pages : ["index.html"], android: false, ...this.surfaces }).catch(() => null);
    if (!web) return null;
    this.io.toolStart("look_check", JSON.stringify({ page: web.label }));
    try {
      const r = await lookAlarm(this.opts.cwd, web.url, signal);
      this.io.toolEnd("look_check", r ? r.text : "no 3D scene on the page");
      return r;
    } catch (e) {
      this.io.toolEnd("look_check", `skipped: ${(e as Error).message}`);
      return null;
    }
  }

  private async runTool(call: ToolCall): Promise<{ result: string; bad: boolean; images?: Image[]; glance?: boolean; args?: Record<string, unknown> }> {
    const tool = findTool(call.name, this.tools);
    if (!tool) return { result: `error: unknown tool "${call.name}". Available: ${this.tools.map((t) => t.name).join(", ")}`, bad: true };

    let raw: unknown;
    try {
      raw = call.arguments.trim() ? JSON.parse(call.arguments) : {};
    } catch {
      return { result: `error: arguments are not valid JSON: ${call.arguments.slice(0, 200)}`, bad: true };
    }
    const parsed = tool.schema.safeParse(raw);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i: { path: PropertyKey[]; message: string }) => `${i.path.map(String).join(".") || "(root)"}: ${i.message}`).join("; ");
      return { result: `error: invalid arguments for ${tool.name}: ${issues}`, bad: true };
    }
    const args = parsed.data;
    const ctx = this.toolCtx();
    this.io.toolStart(tool.name, JSON.stringify(args));

    const refused = tool.refuse?.(args, ctx);
    if (refused) {
      const result = refused;
      this.io.toolEnd(tool.name, result);
      return { result, bad: false, args };
    }

    if (this.opts.permissions.needsPrompt(tool, args)) {
      let preview = "";
      try {
        preview = (await tool.preview?.(args, ctx)) ?? "";
      } catch (e) {
        preview = `(no preview: ${(e as Error).message})`;
      }
      const perms = this.opts.permissions;
      const risky = perms.mode === "yolo" ? perms.risky(tool, args) : null;
      const answer = await this.io.ask(risky ? `Auto-run is on, but this ${risky}. Allow ${tool.name}?` : `Allow ${tool.name}?`, preview, () => perms.needsPrompt(tool, args));
      if (isNo(answer)) {
        // The reason goes to the model now, and becomes a rule when the turn ends.
        const why = whyNo(answer);
        const result = why ? `user denied this tool call and said: ${why}` : "user denied this tool call";
        if (why && this.learning) this.corrections.push({ kind: "denied", did: [...this.turnDid, `${tool.name} ${tool.ruleKey?.(args as never) ?? ""}`.trim()], said: why.slice(0, 600) });
        this.io.toolEnd(tool.name, result);
        return { result, bad: false, args };
      }
      if (answer === "always") await this.opts.permissions.remember(tool, args);
    }

    if (tool.risk !== "read" && tool.checkpoint !== false) await this.snapshotBefore(tool.name, tool.ruleKey?.(args) ?? "");
    let result: string;
    let images: Image[] | undefined;
    let glance: boolean | undefined;
    try {
      const out = await tool.run(args, ctx);
      result = truncate(typeof out === "string" ? out : out.text);
      if (typeof out !== "string") ({ images, glance } = out);
    } catch (e) {
      result = `error: ${(e as Error).message}`;
    }
    result += coachNote(coach(tool.name, args, result, process.platform, this.network), result);
    this.io.toolEnd(tool.name, result);
    return { result, bad: false, images, glance, args };
  }

  // A snapshot must never stop the tool from running (or leave its card spinning).
  // When snapshots are off, say why once.
  private snapshotsOffSaid = false;
  private async snapshotBefore(name: string, key: string) {
    try {
      await this.checkpoints.snapshot(`before ${name} ${key}`.trim());
    } catch (e) {
      this.checkpoints.off ||= `snapshots failed (${(e as Error).message}), so /rewind may not have this step.`;
    }
    if (this.checkpoints.off && !this.snapshotsOffSaid) {
      this.snapshotsOffSaid = true;
      this.io.note(`(${this.checkpoints.off})`);
    }
  }

  get learning(): boolean {
    return this.opts.learn !== false && this.opts.memory !== false && !this.opts.chat;
  }

  setLearn(on: boolean) {
    this.opts.learn = on;
    if (!on) this.corrections = [];
  }

  // Before a typed message: did the user just correct the last turn? Fixing
  // Maxx's files by hand, undoing the turn, or saying "no, ..." all count.
  private async noticeCorrection(userText: string | ContentPart[]) {
    const last = this.lastTurn;
    this.lastTurn = null;
    const typed = (typeof userText === "string" ? userText : userText.map((p) => (p.type === "text" ? p.text : "")).join(" ")).trim().slice(0, 600);
    const said = soundsLikeCorrection(typed) || isStanding(typed) ? typed : undefined;
    if (last) {
      const diffs: string[] = [];
      for (const [path, before] of last.files) {
        const now = await readFile(join(this.opts.cwd, path), "utf8").catch(() => null);
        const d = now === null ? null : handDiff(path, before, now);
        if (d) diffs.push(d);
      }
      if (diffs.length) return void this.corrections.push({ kind: "handfix", did: last.did, diff: diffs.join("\n\n").slice(0, 3000), said });
      if (last.undone) return void this.corrections.push({ kind: "undid", did: last.did, said: typed || undefined });
    }
    if (said && (last || isStanding(typed))) this.corrections.push({ kind: "said", did: last?.did ?? [], said });
  }

  // After a turn: remember what it left behind, and learn from any correction.
  private async endTurn(answer: string, learning: boolean, signal?: AbortSignal) {
    const files = new Map<string, string>();
    for (const path of [...this.turnFiles].slice(0, 12)) {
      const text = await readFile(join(this.opts.cwd, path), "utf8").catch(() => null);
      if (text !== null && text.length < 200_000) files.set(path, text);
    }
    const did = [...this.turnDid.slice(-12), ...(answer ? [`answered: ${answer.replace(/\s+/g, " ").slice(0, 240)}`] : [])];
    this.lastTurn = { did, files, start: this.checkpoints.shaAt(this.turnFrom), undone: false };
    if (!learning || !this.corrections.length) return;
    const todo = this.corrections.splice(0);
    // After Stop no model call: learnFrom falls back to a plain rule, so the UI frees up at once.
    for (const c of todo.slice(-2)) await this.learnFrom(c, signal);
  }

  // One correction, one rule (or none, when it was only a change of mind).
  async learnFrom(c: Correction, signal?: AbortSignal): Promise<Learned | null> {
    const rules = await loadRules(this.opts.cwd);
    let text: string | null = null;
    try {
      if (signal?.aborted) throw new Error("stopped");
      const p = parseRule(await this.think(correctionPrompt(c, rules), signal), rules);
      if (!p) return null;
      text = "again" in p ? rules[p.again]!.text : p.rule;
    } catch {
      text = fallbackRule(c);
    }
    if (!text) return null;
    const r = await addRule(this.opts.cwd, text);
    const say = `📏 ${r.isNew ? "Learned" : `Learned again (x${r.rule.times})`} ${FROM[c.kind]}: ${r.rule.text}${r.replaced ? ` (replaces: ${r.replaced})` : ""}`;
    const l: Learned = { rule: r.rule, isNew: r.isNew, replaced: r.replaced, kind: c.kind, text: say };
    // Kept with the transcript, so it is still there when the page redraws.
    this.marks.push({ at: this.history.length, text: say, active: false, learned: true });
    if (this.io.learned) this.io.learned(l);
    else this.io.note(`(${say}. Saved in MAXX.md; /rules to review.)`);
    return l;
  }

  // Put every file back as it was before the last turn. What the user says
  // next is then read as the correction, so Maxx learns what to do instead.
  async undoTurn(): Promise<string> {
    const last = this.lastTurn;
    if (!last?.start) return "Nothing to undo: the last turn changed no files (or snapshots are off).";
    if (last.undone) return "The last turn is already undone.";
    const r = await this.checkpoints.rewind(last.start);
    if (!r.ok) return `Couldn't undo: ${r.error}`;
    last.undone = true;
    last.files = new Map();
    this.done = this.done.filter((d) => d.turn !== this.turnNo);
    this.history.push({ role: "user", content: [{ type: "text", text: "Maxx: the user undid all file changes from your last turn, so the files are back as they were before it. Do not redo that work unless asked." }] });
    return `Undid the last turn${r.removed.length ? ` (and removed ${r.removed.length} new file${r.removed.length > 1 ? "s" : ""})` : ""}. Tell Maxx what you wanted instead; it will learn a rule from it.`;
  }

  get canUndo(): boolean {
    return !!this.lastTurn?.start && !this.lastTurn.undone;
  }

  // The user put files back by hand (/rewind): what they say next is a correction too.
  markUndone() {
    if (this.lastTurn) (this.lastTurn.undone = true), (this.lastTurn.files = new Map());
    // A rewind can go back further than one turn; the record of finished work no longer holds.
    this.done = [];
  }

  // Agent mode rewinds tasks itself; that is not the user correcting anything.
  // `since`: the turn count before the try began (default: only the last turn is forgotten).
  forgetTurn(since = this.turnNo - 1) {
    this.lastTurn = null;
    // The files went back to before that try, so what it did is no longer done.
    this.done = this.done.filter((d) => d.turn <= since);
  }

  private async maybeCompact(signal?: AbortSignal) {
    const window = this.opts.contextWindow ?? 32_768;
    if (estimateTokens(this.history) < window * 0.7) return;
    this.io.note("(compacting older turns to free context)");
    this.marks = [];
    const record = doneRecord(this.done, this.turnAsk);
    this.history = await compact(this.history, async (transcript) => {
      // With the turn's signal (Stop ends it) and progress (the bar keeps moving while a slow model reads the transcript).
      const ask: Message[] = [
        { role: "system", content: "You summarize coding sessions for handoff. Be terse and specific." },
        { role: "user", content: `Summarize this session so far: the user's goal, what is already finished (say plainly that it is done), files read or changed, decisions made, commands run and their outcomes, and what is left to do.\n\n${transcript}` },
      ];
      // A summary needs no long think; a thinking model left to its habit can spend minutes here.
      const llm = this.opts.llm.provider === "anthropic" ? this.opts.llm : { ...this.opts.llm, thinking: { tier: 0 as const, budget: 512, why: "a summary of older turns" } };
      const promptTokens = estimateTokens(ask);
      const res = await complete(llm, ask, [], () => {}, signal, (p) => this.io.progress?.({ ...p, promptTokens }));
      return [res.content.replace(/<think>[\s\S]*?<\/think>/g, "").trim(), record].filter(Boolean).join("\n\n");
    }, 6, summaryChars(window));
  }
}

const spent = (e: Escalation) => {
  const parts = [e.steps ? `${e.steps} step${e.steps > 1 ? "s" : ""}` : "", e.usage && (e.usage.input || e.usage.output) ? `${k(e.usage.input)} in / ${k(e.usage.output)} out tokens` : ""].filter(Boolean);
  return parts.length ? ` (helper used ${parts.join(", ")})` : "";
};
const k = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

// The same arguments with different spacing or key order are the same call.
function canonicalArgs(args: string): string {
  try {
    const v = JSON.parse(args || "{}");
    return JSON.stringify(v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b))) : v);
  } catch {
    return args;
  }
}

// A message that names a palette ("make it in synthwave colors") gets that
// palette's hex codes beside it, so the model doesn't have to remember them.
export function withPalette<T extends string | ContentPart[]>(text: T, active: Palette | null): T {
  const typed = typeof text === "string" ? text : text.map((p) => (p.type === "text" ? p.text : "")).join("\n");
  const p = mentionedPalette(typed);
  if (!p || (active && p.colors.join() === active.colors.join())) return text;
  if (typeof text === "string") return (text + paletteNote(p)) as T;
  const i = text.findIndex((x) => x.type === "text");
  if (i < 0) return [...text, { type: "text", text: paletteNote(p).trim() }] as T;
  return text.map((x, k) => (k === i && x.type === "text" ? { ...x, text: x.text + paletteNote(p) } : x)) as T;
}

const UNFINISHED_SAY: Record<Unfinished, string> = {
  length: "the reply ran out of room",
  empty: "the model thought but wrote no answer",
  thinking: "that was the model's thinking, not an answer",
  cut: "the reply stopped mid-way",
};

// The end of the thinking before a tool call, sized to the context: about 2%
// of it, at most ~400 tokens, so an 8K model keeps its room.
export function keptThinking(reasoning: string | undefined, context: number): string {
  const t = reasoning?.trim() ?? "";
  if (!t) return "";
  const max = Math.max(300, Math.min(1600, Math.floor(context * 0.02) * 4));
  return t.length <= max ? t : "…" + t.slice(-max).replace(/^\S*\s/, "");
}

// Earlier turns' thinking is noise (the chat templates drop it too).
export function dropThinking(history: Message[]) {
  for (const m of history) if (m.role === "assistant" && m.reasoning_content !== undefined) delete m.reasoning_content;
}
