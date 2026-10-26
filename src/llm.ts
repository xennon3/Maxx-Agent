// OpenAI-compatible chat client (LM Studio, llama.cpp, Ollama, vLLM...).
// Streams tokens, assembles tool-call deltas, and rescues tool calls that
// local models sometimes write into plain text instead of `tool_calls`.

export type ToolCall = { id: string; name: string; arguments: string };

export type Message =
  | { role: "system" | "user"; content: string }
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
};

export type Completion = { content: string; toolCalls: ToolCall[]; rescued: boolean };

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
): Promise<Completion> {
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
    }),
  });
  if (!res.ok || !res.body) {
    throw new Error(`model server returned ${res.status}: ${await res.text()}`);
  }

  let content = "";
  const partial = new Map<number, ToolCall>();
  const decoder = new TextDecoder();
  let buf = "";

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
      const delta = json.choices?.[0]?.delta ?? {};
      if (typeof delta.content === "string" && delta.content) {
        content += delta.content;
        onToken(delta.content);
      }
      for (const tc of delta.tool_calls ?? []) {
        const i = tc.index ?? 0;
        const cur = partial.get(i) ?? { id: tc.id ?? `call_${i}`, name: "", arguments: "" };
        if (tc.id) cur.id = tc.id;
        if (tc.function?.name) cur.name += tc.function.name;
        if (tc.function?.arguments) cur.arguments += tc.function.arguments;
        partial.set(i, cur);
      }
    }
  }

  const toolCalls = [...partial.values()].filter((c) => c.name);
  if (toolCalls.length) return { content, toolCalls, rescued: false };

  const known = new Set(tools.map((t) => t.function.name));
  const rescued = rescueToolCalls(content, known);
  return { content, toolCalls: rescued, rescued: rescued.length > 0 };
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
