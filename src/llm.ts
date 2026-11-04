// OpenAI-compatible chat client (LM Studio, llama.cpp, Ollama, vLLM...).
// Streams tokens, assembles tool-call deltas, and rescues tool calls that
// local models sometimes write into plain text instead of `tool_calls`.

import { completeAnthropic } from "./anthropic.ts";
import { cutNote, markPlain, ruminating, sendsFields, thinkingFields, type ThinkPlan } from "./thinking.ts";
import { parsePartialJSON, TEXT_CALL_CLOSE, TEXT_CALL_OPEN, type Phase, type StreamProgress } from "./progress.ts";

export type ToolCall = { id: string; name: string; arguments: string };

export type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export type Message =
  | { role: "system"; content: string }
  | { role: "user"; content: string | ContentPart[] }
  // reasoning_content: the model's thinking before a tool call, kept only while
  // its turn runs (Qwen's and DeepSeek's templates read it back within a turn).
  | { role: "assistant"; content: string | null; tool_calls?: WireToolCall[]; reasoning_content?: string }
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
  // How much the model may think on this request (see thinking.ts); unset: no limit.
  thinking?: ThinkPlan;
  // Crew mode: wait for a free slot on the model before asking (see gate.ts).
  gate?: { acquire(signal?: AbortSignal): Promise<() => void> };
};

export type Completion = {
  content: string;
  toolCalls: ToolCall[];
  rescued: boolean;
  // Only from hosted APIs: the model declined, and what the call used.
  refused?: boolean;
  usage?: { input: number; output: number };
  // Thinking tokens this call streamed, and why Maxx cut them off (if it did).
  thought?: { tokens: number; cut?: "budget" | "loop" };
  // What the model thought (reasoning_content, or <think> text moved out of the content).
  reasoning?: string;
  // The server's finish_reason: "stop", "length" (out of room), "tool_calls"...
  finish?: string;
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
  if (!cfg.gate) return completeNow(cfg, messages, tools, onToken, signal, onProgress);
  const release = await cfg.gate.acquire(signal);
  try {
    return await completeNow(cfg, messages, tools, onToken, signal, onProgress);
  } finally {
    release();
  }
}

async function completeNow(
  cfg: LLMConfig,
  messages: Message[],
  tools: ToolSpec[],
  onToken: (t: string) => void,
  signal: AbortSignal | undefined,
  onProgress: (p: StreamProgress) => void,
): Promise<Completion> {
  if (cfg.provider === "anthropic") return completeAnthropic(cfg, messages, tools, onToken, signal, onProgress);
  const plan = cfg.thinking;
  if (!plan) {
    const { thinking, ...res } = await streamOnce(cfg, messages, tools, onToken, signal, onProgress, {}, Infinity);
    return { ...res, reasoning: thinking || undefined };
  }
  // Over budget or going in circles: cut, then ask again with thinking off and
  // the gist of the thoughts. A server that ignores "off" gets one more cut,
  // then the plain request, so a turn never ends on a cut.
  let msgs = messages;
  let spent = 0;
  let cut: "budget" | "loop" | undefined;
  for (let attempt = 0; ; attempt++) {
    const p: ThinkPlan = attempt === 0 ? plan : { tier: 0, budget: Math.max(256, plan.budget), why: plan.why };
    const budget = attempt >= 2 ? Infinity : p.budget;
    const res = await streamOnce(cfg, msgs, tools, onToken, signal, onProgress, sendsFields(cfg.baseURL) ? thinkingFields(attempt >= 2 ? { ...p, tier: 4 } : p) : {}, budget);
    spent += res.thought?.tokens ?? 0;
    cut ??= res.thought?.cut;
    if (!res.thought?.cut) {
      const { thinking, ...done } = res;
      return { ...done, reasoning: thinking || undefined, thought: { tokens: spent, cut } };
    }
    msgs = [...messages, { role: "user", content: cutNote(res.thinking, res.thought.cut) }];
  }
}

// The fields a server rejected: a 400 or 422 that names one of them (or says nothing more useful).
const rejectsFields = (status: number, body: string) => (status === 400 || status === 422) && /chat_template_kwargs|reasoning|enable_thinking|unrecognized|unknown|extra|not permitted|additional/i.test(body);

async function streamOnce(
  cfg: LLMConfig,
  messages: Message[],
  tools: ToolSpec[],
  onToken: (t: string) => void,
  outer: AbortSignal | undefined,
  onProgress: (p: StreamProgress) => void,
  extra: Record<string, unknown>,
  budget: number,
): Promise<Completion & { thinking: string }> {
  // Our own abort, for cutting the thinking short; the caller's still stops everything.
  const ctl = new AbortController();
  const stop = () => ctl.abort();
  if (outer?.aborted) ctl.abort();
  outer?.addEventListener("abort", stop, { once: true });
  const signal = ctl.signal;
  // A server that stops sending (a crashed model, a full GPU, a dropped
  // connection) would hold the turn forever: give up on it after a while.
  let stalled = 0;
  let dog: ReturnType<typeof setTimeout> | undefined;
  const arm = (ms: number) => {
    clearTimeout(dog);
    dog = setTimeout(() => ((stalled = ms), ctl.abort()), ms);
  };
  arm(STALL.firstMs);
  const progress = (p: StreamProgress) => {
    if (p.tokens) arm(STALL.idleMs);
    onProgress(p);
  };
  try {
    return await streamBody(cfg, messages, tools, onToken, signal, progress, extra, budget, ctl);
  } catch (e) {
    if (stalled && !outer?.aborted) throw new Error(stallMessage(cfg, stalled));
    throw e;
  } finally {
    clearTimeout(dog);
    outer?.removeEventListener("abort", stop);
  }
}

// How long Maxx waits on a quiet model server: for the first token (the server
// may be reading a long prompt or loading the model), then between tokens.
export const STALL = { firstMs: 15 * 60_000, idleMs: 4 * 60_000 };

export function stallMessage(cfg: Pick<LLMConfig, "model" | "baseURL">, ms: number): string {
  const min = Math.round(ms / 60_000);
  return `the model server stopped answering: ${cfg.model} at ${cfg.baseURL} sent nothing for ${min} minute${min === 1 ? "" : "s"}. Check that it is still running (and the model still loaded), then send your message again.`;
}

async function streamBody(
  cfg: LLMConfig,
  messages: Message[],
  tools: ToolSpec[],
  onToken: (t: string) => void,
  signal: AbortSignal,
  onProgress: (p: StreamProgress) => void,
  extra: Record<string, unknown>,
  budget: number,
  ctl: AbortController,
): Promise<Completion & { thinking: string }> {
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
  const post = (fields: Record<string, unknown>) =>
    fetch(`${cfg.baseURL.replace(/\/$/, "")}/chat/completions`, {
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
        ...fields,
      }),
    });
  let res = await post(extra);
  if (!res.ok && Object.keys(extra).length) {
    const body = await res.text();
    if (!rejectsFields(res.status, body)) throw new Error(`model server returned ${res.status}: ${body}`);
    // A strict server: never send it the thinking switches again; the budget still applies.
    markPlain(cfg.baseURL);
    res = await post({});
  }
  if (!res.ok || !res.body) {
    throw new Error(`model server returned ${res.status}: ${await res.text()}`);
  }
  let thinkTokens = 0;
  let cut: "budget" | "loop" | undefined;
  // Some servers leave the thinking in the content, between <think> tags.
  let inlineThink = false;

  let content = "";
  let finish: string | undefined;
  let usage: Completion["usage"];
  const partial = new Map<number, ToolCall>();
  const decoder = new TextDecoder();
  let buf = "";
  const textCalls = new TextCallWatcher();

  const reader = res.body as unknown as AsyncIterable<Uint8Array>;
  try {
  for await (const chunk of reader) {
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
      if (json.choices?.[0]?.finish_reason) finish = String(json.choices[0].finish_reason);
      const before = tokens;
      // LM Studio calls it reasoning_content, some servers reasoning.
      const reasoning = delta.reasoning_content ?? delta.reasoning;
      if (typeof reasoning === "string" && reasoning) {
        thinking += reasoning;
        phase = "thinking";
        tokens++;
        thinkTokens++;
      }
      if (typeof delta.content === "string" && delta.content) {
        content += delta.content;
        if (!inlineThink && !thinkTokens && /^\s*<think>/.test(content) && !content.includes("</think>")) inlineThink = true;
        if (inlineThink) {
          if (content.includes("</think>")) inlineThink = false;
          else (thinkTokens++, (thinking += delta.content));
        }
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
      // Only thinking so far (no answer, no tool call): is it time to cut?
      const thinkingOnly = !partial.size && (inlineThink || !content.trim());
      if (thinkingOnly && thinkTokens && !cut) {
        if (thinkTokens > budget) cut = "budget";
        else if (thinkTokens % 32 === 0 && ruminating(thinking)) cut = "loop";
        if (cut) {
          ctl.abort();
          break;
        }
      }
    }
    if (cut) break;
  }
  } catch (e) {
    if (!cut) throw e;
  }
  if (cut) {
    phase = "done";
    report();
    return { content: "", toolCalls: [], rescued: false, usage, thought: { tokens: thinkTokens, cut }, thinking };
  }
  const tail = textCalls.flush();
  if (tail) onToken(tail);
  phase = "done";
  report();

  // Thinking left in the content: "<think>...</think>answer", or only the
  // closing tag when the template opened it in the prompt (DeepSeek, Qwen).
  const split = splitThinking(content);
  content = split.content;
  if (split.thinking && !thinking.trim()) thinking = split.thinking;

  const toolCalls = [...partial.values()].filter((c) => c.name);
  const thought = { tokens: thinkTokens };
  if (toolCalls.length) return { content, toolCalls, rescued: false, usage, thought, thinking, finish };

  const known = new Set(tools.map((t) => t.function.name));
  // A call the server failed to parse can be left in the thinking too (DeepSeek's DSML markup).
  let rescued = rescueToolCalls(content, known);
  if (!rescued.length && !content.trim() && thinking) rescued = rescueToolCalls(thinking, known);
  return { content, toolCalls: rescued, rescued: rescued.length > 0, usage, thought, thinking, finish };
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

  // DeepSeek V3.2+: <｜DSML｜invoke name="x"><｜DSML｜parameter name="k" string="true">v</｜DSML｜parameter></｜DSML｜invoke>
  // (servers print the bars as ｜ or |, and some drop the "DSML" word).
  const bar = "[｜|]";
  const dsml = `<${bar}(?:DSML${bar})?`;
  const close = `</${bar}(?:DSML${bar})?`;
  for (const m of text.matchAll(new RegExp(`${dsml}invoke\\s+name="([\\w.-]+)"\\s*>([\\s\\S]*?)${close}invoke>`, "g"))) {
    const args: Record<string, unknown> = {};
    for (const p of m[2]!.matchAll(new RegExp(`${dsml}parameter\\s+name="([\\w.-]+)"(?:\\s+string="(true|false)")?\\s*>([\\s\\S]*?)${close}parameter>`, "g"))) {
      const raw = p[3]!;
      args[p[1]!] = p[2] === "false" ? (parseLoose(raw) ?? raw) : raw;
    }
    push(m[1]!, args);
  }
  if (out.length) return out;

  // Older DeepSeek: <｜tool▁call▁begin｜>function<｜tool▁sep｜>name\n```json\n{...}\n```<｜tool▁call▁end｜>
  for (const m of text.matchAll(/<[｜|]tool[▁_ ]call[▁_ ]begin[｜|]>(?:function)?<[｜|]tool[▁_ ]sep[｜|]>([\w.-]+)\s*(?:```(?:json)?\s*)?(\{[\s\S]*?\})\s*(?:```)?\s*<[｜|]tool[▁_ ]call[▁_ ]end[｜|]>/g)) {
    const obj = parseLoose(m[2]!);
    if (obj) push(m[1]!, obj);
  }
  if (out.length) return out;

  for (const m of text.matchAll(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/g)) {
    const obj = parseLoose(m[1]!);
    if (obj?.name && (obj.arguments || obj.parameters)) push(obj.name, obj.arguments ?? obj.parameters);
  }
  return out;
}

// Pull thinking out of the content. Without any tag nothing changes.
export function splitThinking(text: string): { content: string; thinking: string } {
  const end = text.indexOf("</think>");
  if (end >= 0) {
    const before = text.slice(0, end).replace(/<think>/g, "").trim();
    return { content: text.slice(end + "</think>".length).replace(/^\s+/, ""), thinking: before };
  }
  const open = text.search(/^\s*<think>/);
  if (open >= 0) return { content: "", thinking: text.replace(/^\s*<think>/, "").trim() };
  return { content: text, thinking: "" };
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
