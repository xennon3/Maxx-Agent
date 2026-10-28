// OpenAI-compatible chat client (LM Studio, llama.cpp, Ollama, vLLM...).
// Streams tokens, assembles tool-call deltas, and rescues tool calls that
// local models sometimes write into plain text instead of `tool_calls`.

import { completeAnthropic } from "./anthropic.ts";
import { parsePartialJSON, TEXT_CALL_CLOSE, TEXT_CALL_OPEN, type Phase, type StreamProgress } from "./progress.ts";

export type ToolCall = { id: string; name: string; arguments: string };

export type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export type Message =
  | { role: "system"; content: string }
  | { role: "user"; content: string | ContentPart[] }
  | { role: "assistant"; content: string | null; tool_calls?: WireToolCall[] }
  | { role: "tool"; tool_call_id: string; content: string };

type WireToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

export type ToolSpec = {
  type: "function";
  function: { name: string; description: string; parameters: unknown };
};

export type LLMConfig = {
  baseURL: string;
  model: string;
  apiKey?: string;
  temperature?: number;
  // "anthropic" talks to Claude's Messages API instead (the escalation helper).
  provider?: "openai" | "anthropic";
  effort?: "low" | "medium" | "high" | "xhigh" | "max";
};

export type Completion = {
  content: string;
  toolCalls: ToolCall[];
  rescued: boolean;
  // Only from hosted APIs: the model declined, and what the call used.
  refused?: boolean;
  usage?: { input: number; output: number };
};

export function toWire(calls: ToolCall[]): WireToolCall[] {
  return calls.map((c) => ({
    id: c.id,
    type: "function",
    function: { name: c.name, arguments: c.arguments },
  }));
}

export async function complete(
  cfg: LLMConfig,
  messages: Message[],
  tools: ToolSpec[],
  onToken: (t: string) => void = () => {},
  signal?: AbortSignal,
  onProgress: (p: StreamProgress) => void = () => {},
): Promise<Completion> {
  if (cfg.provider === "anthropic") return completeAnthropic(cfg, messages, tools, onToken, signal, onProgress);
  const started = Date.now();
  let tokens = 0;
  let phase: Phase = "waiting";
  let thinking = "";
  let tool: StreamProgress["tool"];
  let firstAt = 0;
  const report = () => {
    const now = Date.now();
    if (tokens && !firstAt) firstAt = now;
    onProgress({ phase, tokens, elapsedMs: now - started, generatingMs: firstAt ? now - firstAt : 0, thinking: thinking || undefined, tool });
  };
  report();
  const res = await fetch(`${cfg.baseURL.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    signal,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${cfg.apiKey ?? "lm-studio"}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      messages,
      ...(tools.length ? { tools, tool_choice: "auto" } : {}),
      temperature: cfg.temperature ?? 0.3,
      stream: true,
      // Hosted APIs report what a call used; local servers don't need asking.
      ...(cfg.apiKey ? { stream_options: { include_usage: true } } : {}),
    }),
  });
  if (!res.ok || !res.body) {
    throw new Error(`model server returned ${res.status}: ${await res.text()}`);
  }

  let content = "";
  let usage: Completion["usage"];
  const partial = new Map<number, ToolCall>();
  const decoder = new TextDecoder();
  let buf = "";
  const textCalls = new TextCallWatcher();

  for await (const chunk of res.body as unknown as AsyncIterable<Uint8Array>) {
    buf += decoder.decode(chunk, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      const data = line.trim().replace(/^data:\s*/, "");
      if (!data || data === "[DONE]" || !line.trim().startsWith("data:")) continue;
      let json: any;
      try {
        json = JSON.parse(data);
      } catch {
        continue;
      }
      if (json.usage) usage = { input: json.usage.prompt_tokens ?? 0, output: json.usage.completion_tokens ?? 0 };
      const delta = json.choices?.[0]?.delta ?? {};
      const before = tokens;
      // LM Studio calls it reasoning_content, some servers reasoning.
      const reasoning = delta.reasoning_content ?? delta.reasoning;
      if (typeof reasoning === "string" && reasoning) {
        thinking += reasoning;
        phase = "thinking";
        tokens++;
      }
      if (typeof delta.content === "string" && delta.content) {
        content += delta.content;
        tokens++;
        const shown = textCalls.push(delta.content);
        if (shown) onToken(shown);
        if (textCalls.inside) {
          phase = "tool";
          tool = textCalls.progress();
        } else if (shown.trim() || phase === "waiting") phase = "text";
      }
      for (const tc of delta.tool_calls ?? []) {
        const i = tc.index ?? 0;
        const cur = partial.get(i) ?? { id: tc.id ?? `call_${i}`, name: "", arguments: "" };
        if (tc.id) cur.id = tc.id;
        if (tc.function?.name) cur.name += tc.function.name;
        if (tc.function?.arguments) cur.arguments += tc.function.arguments;
        partial.set(i, cur);
        phase = "tool";
        tool = { index: i, name: cur.name, args: cur.arguments };
      }
      if (delta.tool_calls?.length) tokens++;
      if (tokens !== before) report();
    }
  }
  const tail = textCalls.flush();
  if (tail) onToken(tail);
  phase = "done";
  report();

  const toolCalls = [...partial.values()].filter((c) => c.name);
  if (toolCalls.length) return { content, toolCalls, rescued: false, usage };

  const known = new Set(tools.map((t) => t.function.name));
  const rescued = rescueToolCalls(content, known);
  return { content, toolCalls: rescued, rescued: rescued.length > 0, usage };
}

// Hides `<tool_call>{...}</tool_call>` text from the live output while it
// streams, and reports what is inside so far. The full text still goes to
// rescueToolCalls at the end.
export class TextCallWatcher {
  inside = false;
  private held = "";
  private raw = "";
  private count = 0;

  // Returns the part of the stream that is safe to show.
  push(piece: string): string {
    let buf = this.held + piece;
    this.held = "";
    let show = "";
    while (buf) {
      if (this.inside) {
        const end = buf.indexOf(TEXT_CALL_CLOSE);
        if (end < 0) {
          this.raw += buf;
          break;
        }
        this.raw += buf.slice(0, end);
        buf = buf.slice(end + TEXT_CALL_CLOSE.length);
        this.inside = false;
        this.count++;
        continue;
      }
      const start = buf.indexOf(TEXT_CALL_OPEN);
      if (start >= 0) {
        show += buf.slice(0, start);
        buf = buf.slice(start + TEXT_CALL_OPEN.length);
        this.inside = true;
        this.raw = "";
        continue;
      }
      // Hold back a tail that may be the start of "<tool_call>".
      let keep = Math.min(buf.length, TEXT_CALL_OPEN.length - 1);
      while (keep > 0 && !TEXT_CALL_OPEN.startsWith(buf.slice(-keep))) keep--;
      show += buf.slice(0, buf.length - keep);
      this.held = buf.slice(buf.length - keep);
      break;
    }
    return show;
  }

  flush(): string {
    const h = this.held;
    this.held = "";
    return this.inside ? "" : h;
  }

  progress(): NonNullable<StreamProgress["tool"]> {
    const obj = parsePartialJSON(this.raw) as { name?: unknown; arguments?: unknown; parameters?: unknown } | undefined;
    const args = obj?.arguments ?? obj?.parameters;
    return {
      index: this.count,
      name: typeof obj?.name === "string" ? obj.name : "",
      args: args === undefined ? "" : typeof args === "string" ? args : JSON.stringify(args),
    };
  }
}

// Local models often emit tool calls as text. Recognise the common shapes:
//   <tool_call>{"name": "...", "arguments": {...}}</tool_call>   (Hermes / Qwen)
//   <function=name><parameter=key>value</parameter></function>   (Qwen3-Coder)
//   ```json {"name": "...", "arguments": {...}} ```               (fenced)
export function rescueToolCalls(text: string, known: Set<string>): ToolCall[] {
  const out: ToolCall[] = [];
  const push = (name: string, args: unknown) => {
    if (!known.has(name)) return;
    const a = typeof args === "string" ? args : JSON.stringify(args ?? {});
    out.push({ id: `rescued_${out.length}`, name, arguments: a });
  };

  for (const m of text.matchAll(/<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/g)) {
    const obj = parseLoose(m[1]!);
    if (obj?.name) push(obj.name, obj.arguments ?? obj.parameters);
  }
  if (out.length) return out;

  for (const m of text.matchAll(/<function=([\w.-]+)>([\s\S]*?)<\/function>/g)) {
    const args: Record<string, string> = {};
    for (const p of m[2]!.matchAll(/<parameter=([\w.-]+)>\n?([\s\S]*?)\n?<\/parameter>/g)) {
      args[p[1]!] = p[2]!;
    }
    push(m[1]!, args);
  }
  if (out.length) return out;

  for (const m of text.matchAll(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/g)) {
    const obj = parseLoose(m[1]!);
    if (obj?.name && (obj.arguments || obj.parameters)) push(obj.name, obj.arguments ?? obj.parameters);
  }
  return out;
}

function parseLoose(s: string): any {
  try {
    return JSON.parse(s);
  } catch {
    // Trailing commas are the most common slip.
    try {
      return JSON.parse(s.replace(/,\s*([}\]])/g, "$1"));
    } catch {
      return null;
    }
  }
}
