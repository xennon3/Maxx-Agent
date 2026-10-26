import { complete, toWire, type LLMConfig, type Message, type ToolCall } from "./llm.ts";
import { TOOLS, toolSpecs, findTool } from "./tools/index.ts";
import type { Tool } from "./tools/types.ts";
import { Permissions, type Answer } from "./permissions.ts";
import { Checkpoints } from "./checkpoint.ts";
import { compact, estimateTokens, systemPrompt, truncate } from "./context.ts";

export type AgentIO = {
  token(t: string): void;
  toolStart(name: string, args: string): void;
  toolEnd(name: string, result: string): void;
  ask(question: string, preview: string): Promise<Answer>;
  note(text: string): void;
};

export type AgentOptions = {
  llm: LLMConfig;
  cwd: string;
  permissions: Permissions;
  contextWindow?: number;
  maxSteps?: number;
  tools?: Tool<any>[];
};

const MAX_BAD_CALLS = 3;

export class Agent {
  history: Message[] = [];
  readonly checkpoints: Checkpoints;
  private tools: Tool<any>[];

  constructor(private opts: AgentOptions, private io: AgentIO) {
    this.tools = opts.tools ?? TOOLS;
    this.checkpoints = new Checkpoints(opts.cwd, new Date().toISOString().replace(/[:.]/g, "-"));
  }

  async init() {
    this.history = [{ role: "system", content: await systemPrompt(this.opts.cwd) }];
    return this;
  }

  // One user turn: loop until the model answers without calling tools.
  async send(userText: string, signal?: AbortSignal): Promise<string> {
    this.history.push({ role: "user", content: userText });
    const specs = toolSpecs(this.tools);
    let badCalls = 0;

    for (let step = 0; step < (this.opts.maxSteps ?? 50); step++) {
      await this.maybeCompact();
      const res = await complete(this.opts.llm, this.history, specs, (t) => this.io.token(t), signal);
      if (res.rescued) this.io.note(`(recovered ${res.toolCalls.length} tool call(s) written as text)`);

      if (!res.toolCalls.length) {
        this.history.push({ role: "assistant", content: res.content });
        return res.content;
      }

      // A rescued call's text would confuse the model on the next turn, so store it as a real tool call.
      this.history.push({ role: "assistant", content: res.rescued ? null : res.content || null, tool_calls: toWire(res.toolCalls) });
      for (const call of res.toolCalls) {
        const { result, bad } = await this.runTool(call);
        badCalls = bad ? badCalls + 1 : 0;
        this.history.push({ role: "tool", tool_call_id: call.id, content: result });
      }
      if (badCalls >= MAX_BAD_CALLS) {
        const msg = "Stopped: the model kept producing invalid tool calls. Try rephrasing, or run `maxx doctor` to check this model.";
        this.history.push({ role: "assistant", content: msg });
        return msg;
      }
    }
    return "Stopped: reached the step limit for one turn.";
  }

  private async runTool(call: ToolCall): Promise<{ result: string; bad: boolean }> {
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

    if (tool.risk !== "read") await this.checkpoints.snapshot(`before ${tool.name} ${tool.ruleKey?.(args) ?? ""}`.trim());
    let result: string;
    try {
      result = truncate(await tool.run(args, ctx));
    } catch (e) {
      result = `error: ${(e as Error).message}`;
    }
    this.io.toolEnd(tool.name, result);
    return { result, bad: false };
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
