// Claude through the Anthropic Messages API, for the escalation helper.
// Maxx keeps its history in the OpenAI chat shape; this translates it on the
// way out and turns the stream back into the same Completion the local
// models produce, so the loop can't tell which one answered.

import Anthropic from "@anthropic-ai/sdk";
import type { Completion, ContentPart, LLMConfig, Message, ToolCall, ToolSpec } from "./llm.ts";
import type { Phase, StreamProgress } from "./progress.ts";

type Block = Anthropic.ContentBlockParam;
type Turn = { role: "user" | "assistant"; content: Block[] };

// Models that take adaptive thinking and an effort level. Older ones get neither.
const MODERN = /^claude-(fable|mythos|opus-5|sonnet-5|haiku-5|opus-4-[678]|sonnet-4-6)/;
// Server-side refusal fallback ("default" form) on the first-party API.
const FALLBACKS = /^claude-(fable-5-1|opus-5|sonnet-5-5)/;

export async function completeAnthropic(
  cfg: LLMConfig,
  messages: Message[],
  tools: ToolSpec[],
  onToken: (t: string) => void = () => {},
  signal?: AbortSignal,
  onProgress: (p: StreamProgress) => void = () => {},
): Promise<Completion> {
  const client = new Anthropic({ apiKey: cfg.apiKey || undefined, baseURL: cfg.baseURL || undefined });
  const { system, turns } = toAnthropic(messages);
  const modern = MODERN.test(cfg.model);
  const params: Record<string, unknown> = {
    model: cfg.model,
    max_tokens: 64_000,
    system,
    messages: turns,
    tools: tools.map((t) => ({ name: t.function.name, description: t.function.description, input_schema: t.function.parameters, eager_input_streaming: true })),
    // The helper is only called for the hard step, so let it think properly.
    ...(modern ? { thinking: { type: "adaptive", display: "summarized" }, output_config: { effort: cfg.effort ?? "high" } } : {}),
  };
  const fallback = !cfg.baseURL && FALLBACKS.test(cfg.model);
  if (fallback) Object.assign(params, { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" });

  const started = Date.now();
  let firstAt = 0;
  let tokens = 0;
  let phase: Phase = "waiting";
  let thinking = "";
  let tool: StreamProgress["tool"];
  const report = () => {
    const now = Date.now();
    if (tokens && !firstAt) firstAt = now;
    onProgress({ phase, tokens, elapsedMs: now - started, generatingMs: firstAt ? now - firstAt : 0, thinking: thinking || undefined, tool });
  };
  report();

  const stream = fallback ? client.beta.messages.stream(params as any, { signal }) : client.messages.stream(params as any, { signal });
  let content = "";
  const calls = new Map<number, ToolCall>();
  for await (const ev of stream as AsyncIterable<any>) {
    if (ev.type === "content_block_start" && ev.content_block.type === "tool_use") {
      calls.set(ev.index, { id: ev.content_block.id, name: ev.content_block.name, arguments: "" });
      phase = "tool";
      tool = { index: calls.size - 1, name: ev.content_block.name, args: "" };
    } else if (ev.type === "content_block_delta") {
      const d = ev.delta;
      if (d.type === "text_delta") {
        content += d.text;
        onToken(d.text);
        phase = "text";
      } else if (d.type === "thinking_delta") {
        thinking += d.thinking;
        phase = "thinking";
      } else if (d.type === "input_json_delta") {
        const c = calls.get(ev.index);
        if (c) {
          c.arguments += d.partial_json;
          tool = { index: [...calls.keys()].indexOf(ev.index), name: c.name, args: c.arguments };
        }
      } else continue;
      tokens++;
    } else continue;
    report();
  }
  const final: any = await stream.finalMessage();
  phase = "done";
  report();
  const usage = { input: (final.usage?.input_tokens ?? 0) + (final.usage?.cache_read_input_tokens ?? 0) + (final.usage?.cache_creation_input_tokens ?? 0), output: final.usage?.output_tokens ?? 0 };
  if (final.stop_reason === "refusal") return { content: "", toolCalls: [], rescued: false, refused: true, usage };
  // A call cut off by max_tokens has half its JSON; the loop reports it as a bad call.
  return { content, toolCalls: [...calls.values()], rescued: false, usage };
}

// OpenAI chat history -> Anthropic turns. Tool results become tool_result
// blocks in a user turn, consecutive same-role messages merge (the API wants
// them alternating), and tool call ids are renumbered because local servers
// reuse ids like "call_1" every turn.
export function toAnthropic(messages: Message[]): { system: string; turns: Turn[] } {
  const system: string[] = [];
  const turns: Turn[] = [];
  let ids = new Map<string, string>();
  let n = 0;
  const push = (role: Turn["role"], blocks: Block[]) => {
    if (!blocks.length) return;
    const last = turns[turns.length - 1];
    if (last?.role === role) last.content.push(...blocks);
    else turns.push({ role, content: blocks });
  };
  for (const m of messages) {
    if (m.role === "system") {
      system.push(m.content);
    } else if (m.role === "user") {
      push("user", typeof m.content === "string" ? text(m.content) : m.content.flatMap(part));
    } else if (m.role === "assistant") {
      ids = new Map();
      const blocks: Block[] = text(m.content ?? "");
      for (const c of m.tool_calls ?? []) {
        const id = `toolu_maxx_${n++}`;
        ids.set(c.id, id);
        blocks.push({ type: "tool_use", id, name: c.function.name, input: parseInput(c.function.arguments) });
      }
      push("assistant", blocks);
    } else {
      const id = ids.get(m.tool_call_id);
      // A result whose call was compacted away can't be a tool_result; keep it as text.
      if (!id) push("user", text(`(tool result) ${m.content}`));
      else push("user", [{ type: "tool_result", tool_use_id: id, content: m.content || "(no output)", ...(/^error\b/.test(m.content) ? { is_error: true } : {}) }]);
    }
  }
  // The conversation has to open with the user and, with no prefill on current models, end with them.
  if (turns[0]?.role !== "user") turns.unshift({ role: "user", content: text("(continuing an earlier session)") });
  if (turns[turns.length - 1]?.role !== "user") turns.push({ role: "user", content: text("Continue.") });
  return { system: system.join("\n\n"), turns };
}

const text = (s: string): Block[] => (s.trim() ? [{ type: "text", text: s }] : []);

function part(p: ContentPart): Block[] {
  if (p.type === "text") return text(p.text);
  const m = /^data:(image\/[\w.+-]+);base64,(.*)$/s.exec(p.image_url.url);
  if (!m) return [{ type: "image", source: { type: "url", url: p.image_url.url } }];
  return [{ type: "image", source: { type: "base64", media_type: m[1] as "image/png", data: m[2]! } }];
}

function parseInput(args: string): Record<string, unknown> {
  try {
    const v = JSON.parse(args || "{}");
    return v && typeof v === "object" && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
}
