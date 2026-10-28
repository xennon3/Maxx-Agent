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
};

const MAX_BAD_CALLS = 3;
// Weak models get stuck re-running a call that already worked (mkdir five
// times over). Count identical call + result pairs in a turn: from the third
// the result carries a nudge, and the fifth ends the turn.
const WARN_REPEATS = 3;
const STOP_REPEATS = 5;
// Screenshots are big; only the most recent few stay in the conversation.
// Removing one rewrites an older message, which costs the server its prompt
// cache from that point on, so prune in batches: at 4 images, back down to 2.
const KEEP_IMAGES = 2;
const PRUNE_AT = 4;

export class Agent {
  history: Message[] = [];
  readonly checkpoints: Checkpoints;
  session: string;
  private tools: Tool<any>[];
  private prompts: string[] = [];
  toolsets: string[] = [];

  constructor(private opts: AgentOptions, private io: AgentIO) {
    this.tools = opts.tools ?? TOOLS;
    this.session = opts.session ?? newSessionId();
    this.checkpoints = new Checkpoints(opts.cwd, this.session);
    if (opts.toolsets?.length) this.useToolsets(opts.toolsets);
  }

  get vision(): Vision {
    return this.opts.vision ?? { mode: "native" };
  }

  // Switch tool groups; the system prompt is rewritten in place, history kept.
  useToolsets(names: string[]) {
    const { tools, prompts } = withToolsets(names);
    this.tools = [...(this.opts.tools ?? TOOLS), ...tools];
    this.prompts = prompts;
    this.toolsets = names;
    if (this.vision.mode === "off" && names.length) this.prompts.push("You cannot see images in this session; screenshots arrive as element lists only.");
  }

  async refreshSystemPrompt() {
    const content = await systemPrompt(this.opts.cwd, this.prompts);
    if (this.history[0]?.role === "system") this.history[0] = { role: "system", content };
    else this.history.unshift({ role: "system", content });
  }

  async init() {
    this.history = [];
    await this.refreshSystemPrompt();
    return this;
  }

  // Continue a saved session: its turns, with today's system prompt.
  async restore(id: string, history: Message[]) {
    this.session = id;
    this.history = history.filter((m) => m.role !== "system");
    await this.refreshSystemPrompt();
  }

  // One user turn: loop until the model answers without calling tools.
  // A turn with attached images comes as parts (see attach.ts).
  async send(userText: string | ContentPart[], signal?: AbortSignal): Promise<string> {
    this.history.push({ role: "user", content: userText });
    if (Array.isArray(userText)) this.pruneImages();
    const specs = toolSpecs(this.tools);
    let badCalls = 0;
    const repeats = new Map<string, number>();
    let stuck = 0;

    for (let step = 0; step < (this.opts.maxSteps ?? 50); step++) {
      await this.maybeCompact();
      const promptTokens = estimateTokens(this.history);
      const res = await complete(this.opts.llm, this.history, specs, (t) => this.io.token(t), signal, (p) => this.io.progress?.({ ...p, promptTokens }));
      if (res.rescued) this.io.note(`(recovered ${res.toolCalls.length} tool call(s) written as text)`);

      if (!res.toolCalls.length) {
        this.history.push({ role: "assistant", content: res.content });
        return res.content;
      }

      // A rescued call's text would confuse the model on the next turn, so store it as a real tool call.
      this.history.push({ role: "assistant", content: res.rescued ? null : res.content || null, tool_calls: toWire(res.toolCalls) });
      const seen: ContentPart[] = [];
      for (const call of res.toolCalls) {
        let { result, bad, images, glance } = await this.runTool(call);
        badCalls = bad ? badCalls + 1 : 0;
        const key = `${call.name}|${canonicalArgs(call.arguments)}|${result}`;
        const n = (repeats.get(key) ?? 0) + 1;
        repeats.set(key, n);
        if (n >= WARN_REPEATS) {
          stuck = Math.max(stuck, n);
          result += `\n\nNote from Maxx: you have made this exact ${call.name} call ${n} times in this turn and got the same result each time. Repeating it will not change anything. Do the next step of the task instead, or reply to the user if you are stuck.`;
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
    return "Stopped: reached the step limit for one turn.";
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

  private async runTool(call: ToolCall): Promise<{ result: string; bad: boolean; images?: Image[]; glance?: boolean }> {
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
    const ctx = { cwd: this.opts.cwd };
    this.io.toolStart(tool.name, JSON.stringify(args));

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
        return { result, bad: false };
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
    this.io.toolEnd(tool.name, result);
    return { result, bad: false, images, glance };
  }

  private async maybeCompact() {
    const window = this.opts.contextWindow ?? 32_768;
    if (estimateTokens(this.history) < window * 0.7) return;
    this.io.note("(compacting older turns to free context)");
    this.history = await compact(this.history, async (transcript) => {
      const res = await complete(this.opts.llm, [
        { role: "system", content: "You summarize coding sessions for handoff. Be terse and specific." },
        { role: "user", content: `Summarize this session so far: the user's goal, files read or changed, decisions made, commands run and their outcomes, and what is left to do.\n\n${transcript}` },
      ], []);
      return res.content;
    });
  }
}

// The same arguments with different spacing or key order are the same call.
function canonicalArgs(args: string): string {
  try {
    const v = JSON.parse(args || "{}");
    return JSON.stringify(v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b))) : v);
  } catch {
    return args;
  }
}
