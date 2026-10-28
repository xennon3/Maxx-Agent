// What the model is doing while it streams, so a slow local model doesn't
// look stuck. A 4B model on a laptop CPU writes ~4 tokens a second: a whole
// file in one write_file call is minutes of silence without this.

export type Phase = "waiting" | "thinking" | "text" | "tool" | "done";

export type StreamProgress = {
  phase: Phase;
  // Stream chunks so far; servers send about one token per chunk.
  tokens: number;
  elapsedMs: number;
  // Time since the first token: the speed is tokens over this, not counting the prompt.
  generatingMs?: number;
  // Reasoning text so far (models that think before answering).
  thinking?: string;
  // The tool call being written, arguments still incomplete.
  tool?: { index: number; name: string; args: string };
  // Set by the agent: the size of the prompt the server is reading.
  promptTokens?: number;
};

// Parse JSON that is still arriving: `{"path": "a.ts", "content": "line 1\nli`
// gives { path: "a.ts", content: "line 1\nli" }. Whatever is complete so far
// comes back; a half-written key, number or literal is dropped.
export function parsePartialJSON(s: string): unknown {
  let i = 0;
  let closed = false; // did the last string get its closing quote?
  const ws = () => {
    while (i < s.length && /\s/.test(s[i]!)) i++;
  };
  const str = (): string => {
    i++; // opening quote
    closed = false;
    let out = "";
    while (i < s.length) {
      const c = s[i]!;
      if (c === '"') return i++, (closed = true), out;
      if (c !== "\\") {
        out += c;
        i++;
        continue;
      }
      const e = s[i + 1];
      if (e === undefined) break;
      if (e === "u") {
        const hex = s.slice(i + 2, i + 6);
        if (!/^[0-9a-fA-F]{4}$/.test(hex)) break;
        out += String.fromCharCode(parseInt(hex, 16));
        i += 6;
        continue;
      }
      out += ({ n: "\n", t: "\t", r: "\r", b: "\b", f: "\f" } as Record<string, string>)[e] ?? e;
      i += 2;
    }
    i = s.length;
    return out;
  };
  const value = (): unknown => {
    ws();
    const c = s[i];
    if (c === undefined) return undefined;
    if (c === '"') return str();
    if (c === "{") {
      i++;
      const obj: Record<string, unknown> = {};
      for (;;) {
        ws();
        if (i >= s.length) return obj;
        if (s[i] === "}") return i++, obj;
        if (s[i] === ",") {
          i++;
          continue;
        }
        if (s[i] !== '"') return obj;
        const key = str();
        // A key with no closing quote yet isn't a key.
        if (!closed) return obj;
        ws();
        if (s[i] !== ":") return obj;
        i++;
        const v = value();
        if (v !== undefined) obj[key] = v;
        if (i >= s.length) return obj;
      }
    }
    if (c === "[") {
      i++;
      const arr: unknown[] = [];
      for (;;) {
        ws();
        if (i >= s.length) return arr;
        if (s[i] === "]") return i++, arr;
        if (s[i] === ",") {
          i++;
          continue;
        }
        const v = value();
        if (v !== undefined) arr.push(v);
        if (i >= s.length) return arr;
      }
    }
    const m = /^(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null)(?=[\s,}\]])/.exec(s.slice(i));
    if (!m) return (i = s.length), undefined;
    i += m[1]!.length;
    return JSON.parse(m[1]!);
  };
  return value();
}

// Tool calls a model writes as text instead of `tool_calls`. Shown as a live
// tool card rather than raw JSON scrolling past.
export const TEXT_CALL_OPEN = "<tool_call>";
export const TEXT_CALL_CLOSE = "</tool_call>";

const VERBS: Record<string, string> = {
  read_file: "Reading", write_file: "Writing", edit_file: "Editing", list_files: "Listing", grep: "Searching", bash: "Running",
};

export type Activity = {
  // "Writing src/app.ts", "Thinking", "Reading the prompt".
  title: string;
  // The text being written right now: file contents, new code, a command.
  preview: string;
  lines: number;
};

// Turn raw progress into what a person wants to see.
export function describe(p: StreamProgress): Activity {
  if (p.phase === "tool" && p.tool) {
    const args = parsePartialJSON(p.tool.args);
    const a = (args && typeof args === "object" && !Array.isArray(args) ? args : {}) as Record<string, unknown>;
    const verb = VERBS[p.tool.name] ?? (p.tool.name ? `Calling ${p.tool.name}` : "Preparing a tool call");
    const target = [a.path, a.pattern, a.project_dir].find((v) => typeof v === "string") as string | undefined;
    const preview = previewOf(p.tool.name, a);
    return { title: target ? `${verb} ${target}` : verb, preview, lines: preview ? preview.split("\n").length : 0 };
  }
  if (p.phase === "thinking") return { title: "Thinking", preview: p.thinking ?? "", lines: 0 };
  if (p.phase === "waiting") {
    const k = p.promptTokens && p.promptTokens >= 1000 ? `${(p.promptTokens / 1000).toFixed(1)}k-token ` : "";
    return { title: `Reading the ${k}prompt`, preview: "", lines: 0 };
  }
  return { title: p.phase === "text" ? "Answering" : "", preview: "", lines: 0 };
}

function previewOf(tool: string, a: Record<string, unknown>): string {
  const pick = tool === "write_file" ? a.content : tool === "edit_file" ? (a.new_string ?? a.old_string) : tool === "bash" ? a.command : undefined;
  if (typeof pick === "string") return pick;
  // Unknown tools: the longest string argument is the interesting one.
  const strings = Object.values(a).filter((v): v is string => typeof v === "string");
  return strings.sort((x, y) => y.length - x.length)[0] ?? "";
}

// "⠋ Writing app.ts · 312 tokens · 4.1 tok/s · 1:12"
export function statusLine(p: StreamProgress, a: Activity = describe(p)): string {
  const parts = [a.title];
  if (a.lines > 1) parts.push(`${a.lines} lines`);
  if (p.phase !== "waiting" && p.tokens) {
    parts.push(`${p.tokens} tokens`);
    const secs = (p.generatingMs ?? p.elapsedMs) / 1000;
    if (secs >= 2) parts.push(`${(p.tokens / secs).toFixed(1)} tok/s`);
  }
  parts.push(clock(p.elapsedMs));
  return parts.join(" · ");
}

export function clock(ms: number): string {
  const s = Math.floor(ms / 1000);
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m${String(s % 60).padStart(2, "0")}s`;
}

export const SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

// Calls fn at most every `ms`, always with the latest value; a phase change
// or the end goes through at once, after any update still waiting (so the
// last piece of a file being written isn't lost).
export function throttle(fn: (p: StreamProgress) => void, ms: number, now = () => Date.now()) {
  let last = 0;
  let phase: Phase | undefined;
  let queued: StreamProgress | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const fire = (p: StreamProgress) => {
    last = now();
    phase = p.phase;
    queued = null;
    if (timer) clearTimeout(timer), (timer = null);
    fn(p);
  };
  return (p: StreamProgress) => {
    if (p.phase !== phase || p.phase === "done") {
      if (queued) fn(queued);
      return fire(p);
    }
    if (now() - last >= ms) return fire(p);
    queued = p;
    timer ??= setTimeout(() => queued && fire(queued), ms - (now() - last));
  };
}
