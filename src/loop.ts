import { complete, toWire, type ContentPart, type LLMConfig, type Message, type ToolCall } from "./llm.ts";
import { TOOLS, toolSpecs, findTool, withToolsets } from "./tools/index.ts";
import type { Tool } from "./tools/types.ts";
import { Permissions, type Answer } from "./permissions.ts";
import { Checkpoints } from "./checkpoint.ts";
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
import { lookupPrompt, WEB_TOOLS } from "./web.ts";
import { mcpHub } from "./mcp.ts";
import { chatPrompt } from "./chat.ts";
import { brief, describeHelper, HELPER_DEFAULTS, helperLLM, type Helper } from "./escalate.ts";

// The local model got stuck and a helper took over (active), or handed back.
export type Escalation = { active: boolean; model: string; reason: string; steps?: number; usage?: { input: number; output: number }; text?: string };

export type AgentIO = {
  token(t: string): void;
  toolStart(name: string, args: string): void;
  toolEnd(name: string, result: string): void;
  ask(question: string, preview: string): Promise<Answer>;
  note(text: string): void;
  // Screenshots as they arrive, for UIs that can show them.
  image?(tool: string, images: Image[]): void;
  // What the model is doing while it streams (often for minutes on a CPU).
  progress?(p: StreamProgress): void;
  // The pinned checklist, whenever the model writes or ticks it.
  plan?(steps: Step[]): void;
  // The helper model taking over a hard step, and handing back.
  escalation?(e: Escalation): void;
};

export type AgentOptions = {
  llm: LLMConfig;
  cwd: string;
  permissions: Permissions;
  contextWindow?: number;
  maxSteps?: number;
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
  // Chat mode: no tools, no project, and a prompt about drawing visuals instead.
  chat?: boolean;
  // The look-up tools offered while network access is on (default: web search, web fetch and MCP servers).
  online?: () => Promise<Online>;
};

export type Online = { tools: Tool<any>[]; notes: string[]; servers: string[] };

async function defaultOnline(): Promise<Online> {
  const m = await mcpHub.tools();
  return { tools: [...WEB_TOOLS, ...m.tools], notes: m.notes, servers: [...new Set(m.tools.map((t) => t.description.match(/^\((.+?)\)/)?.[1]).filter((s): s is string => !!s))] };
}

const MAX_BAD_CALLS = 3;
// Weak models get stuck re-running a call that already worked (mkdir five
// times over). Count identical call + result pairs in a turn: from the third
// the result carries a nudge, and the fifth ends the turn.
const WARN_REPEATS = 3;
const STOP_REPEATS = 5;
// Once a tool turns out to be missing (no Java, no Android SDK), the model gets
// this many more steps to tell the user before Maxx tells them instead.
const BLOCKED_STEPS = 2;
// Screenshots are big; only the most recent few stay in the conversation.
// Removing one rewrites an older message, which costs the server its prompt
// cache from that point on, so prune in batches: at 4 images, back down to 2.
const KEEP_IMAGES = 2;
const PRUNE_AT = 4;
const FIX_TRIES = 3;

export class Agent {
  history: Message[] = [];
  readonly checkpoints: Checkpoints;
  session: string;
  private tools: Tool<any>[];
  private setTools: Tool<any>[] = [];
  private online: Online = { tools: [], notes: [], servers: [] };
  private prompts: string[] = [];
  toolsets: string[] = [];
  plan: Step[] = [];
  // Escalation banners, by the history length when they happened, so a redrawn transcript keeps them.
  marks: { at: number; text: string; active: boolean }[] = [];

  constructor(private opts: AgentOptions, private io: AgentIO) {
    this.tools = this.baseTools();
    this.session = opts.session ?? newSessionId();
    this.checkpoints = new Checkpoints(opts.cwd, this.session);
    if (opts.toolsets?.length) this.useToolsets(opts.toolsets);
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

  private baseTools(): Tool<any>[] {
    if (this.opts.chat) return this.online.tools;
    const extra: Tool<any>[] = [];
    if (this.opts.plan !== false) extra.push(planTool(() => this.plan, (s) => this.setPlan(s)));
    if (this.opts.memory !== false) extra.push(rememberTool);
    return [...(this.opts.tools ?? TOOLS), ...this.online.tools, ...extra];
  }

  // Network on: web search, web fetch and the MCP servers' tools join in. Off: gone again.
  private async goOnline() {
    const before = this.online.notes;
    this.online = this.network ? await (this.opts.online ?? defaultOnline)() : { tools: [], notes: [], servers: [] };
    for (const n of this.online.notes) if (!before.includes(n)) this.io.note(`(${n})`);
    this.tools = [...this.baseTools(), ...this.setTools];
  }

  // What the system prompt says about looking things up.
  private lookupNote(): string {
    if (!this.online.tools.length) return "";
    return lookupPrompt(new Date(), this.online.servers.map((s) => `the ${s} tools`));
  }

  private setPlan(steps: Step[]) {
    this.plan = steps;
    this.io.plan?.(steps);
  }

  async refreshSystemPrompt() {
    const notes = [this.opts.plan !== false ? PLAN_PROMPT : "", this.opts.memory !== false ? MEMORY_PROMPT : "", NETWORK_PROMPT[this.network ? "on" : "off"], this.lookupNote()].filter(Boolean).join(" ");
    const content = this.opts.chat ? chatPrompt(new Date(), this.lookupNote()) : await systemPrompt(this.opts.cwd, notes ? [notes, ...this.prompts] : this.prompts);
    if (this.history[0]?.role === "system") this.history[0] = { role: "system", content };
    else this.history.unshift({ role: "system", content });
  }

  async init() {
    this.history = [];
    this.setPlan([]);
    this.marks = [];
    await this.goOnline();
    await this.refreshSystemPrompt();
    return this;
  }

  // Continue a saved session: its turns, with today's system prompt.
  async restore(id: string, history: Message[]) {
    this.session = id;
    this.history = history.filter((m) => m.role !== "system");
    this.setPlan(planFromHistory(this.history));
    this.marks = [];
    await this.refreshSystemPrompt();
  }

  // One user turn: loop until the model answers without calling tools.
  // A turn with attached images comes as parts (see attach.ts).
  async send(userText: string | ContentPart[], signal?: AbortSignal): Promise<string> {
    this.history.push({ role: "user", content: userText });
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

    for (let step = 0; step < (this.opts.maxSteps ?? 50); step++) {
      await this.maybeCompact();
      if (helping && !this.helper) handBack("the helper was turned off");
      const helper = helping && this.helper;
      const llm = helper ? helperLLM(helper, this.opts.llm.baseURL) : this.opts.llm;
      // The brief rides along with each helper request; it is not kept in history.
      const messages: Message[] = helper ? [...this.history, { role: "user", content: [{ type: "text", text: brief(helping!.reason, this.opts.llm.model) }] }] : this.history;
      const promptTokens = estimateTokens(messages);
      let res;
      try {
        res = await complete(llm, messages, specs, (t) => this.io.token(t), signal, (p) => this.io.progress?.({ ...p, promptTokens }));
      } catch (e) {
        // A helper that can't be reached (no key, no credit, offline) must not end the turn.
        if (!helping || (e as Error).name === "AbortError") throw e;
        this.io.note(`(the helper model failed: ${(e as Error).message})`);
        handBack("the helper could not be reached");
        continue;
      }
      if (res.rescued) this.io.note(`(recovered ${res.toolCalls.length} tool call(s) written as text)`);
      if (helping && res.usage) (helping.usage.input += res.usage.input), (helping.usage.output += res.usage.output);
      if (helping && res.refused) {
        handBack("the helper declined this step");
        continue;
      }

      if (!res.toolCalls.length) {
        this.history.push({ role: "assistant", content: res.content });
        if (helping) handBack("it answered");
        // A missing tool fails every check, so the fix-it loop would only go in circles.
        const more = blocked ? null : await this.beforeFinish(changed, fixes, nudged, signal);
        if (more === "fix") fixes++;
        if (more === "plan") nudged = true;
        if (more) continue;
        return res.content;
      }

      // A rescued call's text would confuse the model on the next turn, so store it as a real tool call.
      this.history.push({ role: "assistant", content: res.rescued ? null : res.content || null, tool_calls: toWire(res.toolCalls) });
      const seen: ContentPart[] = [];
      let stepFailed = false;
      let trigger = "";
      for (const call of res.toolCalls) {
        let { result, bad, images, glance, args } = await this.runTool(call);
        badCalls = bad ? badCalls + 1 : 0;
        if (args) await this.learn(call.name, args, result, changed, lastFail).then((f) => (lastFail = f));
        const fail = bad || failed(result);
        failures = fail ? failures + 1 : 0;
        stepFailed ||= fail;
        blocked ??= missingTool(result);
        // Sending the same edit or write again is never progress, whatever it returned
        // (applied, then "not found", then applied...), so those count by the call alone.
        const writes = findTool(call.name, this.tools)?.risk === "write";
        const key = `${call.name}|${canonicalArgs(call.arguments)}${writes ? "" : `|${result}`}`;
        const n = (repeats.get(key) ?? 0) + 1;
        repeats.set(key, n);
        if (n >= WARN_REPEATS) {
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

      // A missing program (Java, the Android SDK, adb) can't be fixed from here, not even by the helper.
      if (blocked && ++blockedSteps > BLOCKED_STEPS) {
        if (helping) handBack("a program it needs is not installed");
        const msg = `Stopped: this computer does not have ${blocked.what}, so I can't finish this here. ${blocked.install}`;
        this.history.push({ role: "assistant", content: msg });
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
        return msg;
      }
      if (badCalls >= MAX_BAD_CALLS) {
        const msg = "Stopped: the model kept producing invalid tool calls. Try rephrasing, or run `maxx doctor` to check this model.";
        this.history.push({ role: "assistant", content: msg });
        return msg;
      }
    }
    if (helping) handBack("the turn hit its step limit");
    return "Stopped: reached the step limit for one turn.";
  }

  // Bookkeeping after each tool call: which files changed, and lessons from a fix that worked.
  private async learn(name: string, args: Record<string, unknown>, result: string, changed: Set<string>, lastFail: string): Promise<string> {
    const tool = findTool(name, this.tools);
    const bad = failed(result) || result === "user denied this tool call";
    if (tool?.risk === "write" && typeof args.path === "string" && !bad) changed.add(args.path);
    if (name !== "bash") return lastFail;
    const command = String(args.command ?? "");
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
      if (r && !r.ok) {
        if (fixes >= tries) {
          this.io.note(`(${r.what} still fails after ${tries} tries; over to you)`);
          return null;
        }
        const c = coach("bash", {}, r.output, process.platform, this.network);
        const hint = c.hint ? `\nMaxx hint: ${c.hint}` : "";
        const text = `Maxx checked your changes: ${r.what} failed (try ${fixes + 1} of ${tries}).\n${excerpt(r.output, c.first)}${hint}\nFix this, then reply when it works.`;
        // A parts array, so it reads as a report from Maxx rather than a new request (and the UI shows it as a note).
        this.history.push({ role: "user", content: [{ type: "text", text }] });
        return "fix";
      }
      if (r) this.io.note(`(checked: ${r.what} passed)`);
    }
    const open = this.plan.map((s, i) => (s.done ? 0 : i + 1)).filter(Boolean);
    if (!nudged && this.plan.length && open.length) {
      const text = `Maxx: plan step${open.length > 1 ? "s" : ""} ${open.join(", ")} not ticked yet.\n${formatPlan(this.plan)}\nDo the next step now. If it is already done, call plan with done set to its number.`;
      this.history.push({ role: "user", content: [{ type: "text", text }] });
      return "plan";
    }
    return null;
  }

  // Quick syntax check of the changed files, then the project's build command.
  private async check(files: string[], signal?: AbortSignal): Promise<CheckResult | null> {
    const quick = await quickCheck(this.opts.cwd, files);
    if (quick && !quick.ok) {
      this.io.toolStart("check", JSON.stringify({ command: quick.what }));
      this.io.toolEnd("check", quick.output);
      return quick;
    }
    const command = this.opts.check === false ? undefined : this.opts.check || detectCheck(this.opts.cwd);
    if (!command || signal?.aborted) return quick;
    const args = { command, timeout: 600 };
    this.io.toolStart("check", JSON.stringify(args));
    if (this.opts.permissions.needsPrompt(bash, args)) {
      const answer = await this.io.ask("Let Maxx check the build?", `$ ${command}`);
      if (answer === "no") {
        this.io.toolEnd("check", "skipped");
        return quick;
      }
      if (answer === "always") await this.opts.permissions.remember(bash, args);
    }
    const output = truncate(String(await bash.run(args, { cwd: this.opts.cwd, network: this.network })));
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
    const ctx = { cwd: this.opts.cwd, network: this.network };
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
      const answer = await this.io.ask(`Allow ${tool.name}?`, preview);
      if (answer === "no") {
        const result = "user denied this tool call";
        this.io.toolEnd(tool.name, result);
        return { result, bad: false, args };
      }
      if (answer === "always") await this.opts.permissions.remember(tool, args);
    }

    if (tool.risk !== "read" && tool.checkpoint !== false) await this.checkpoints.snapshot(`before ${tool.name} ${tool.ruleKey?.(args) ?? ""}`.trim());
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

  private async maybeCompact() {
    const window = this.opts.contextWindow ?? 32_768;
    if (estimateTokens(this.history) < window * 0.7) return;
    this.io.note("(compacting older turns to free context)");
    this.marks = [];
    this.history = await compact(this.history, async (transcript) => {
      const res = await complete(this.opts.llm, [
        { role: "system", content: "You summarize coding sessions for handoff. Be terse and specific." },
        { role: "user", content: `Summarize this session so far: the user's goal, files read or changed, decisions made, commands run and their outcomes, and what is left to do.\n\n${transcript}` },
      ], []);
      return res.content;
    });
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
