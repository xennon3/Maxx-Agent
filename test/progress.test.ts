import { afterAll, expect, test } from "bun:test";
import { complete, TextCallWatcher } from "../src/llm.ts";
import { describe, parsePartialJSON, statusLine, throttle, type StreamProgress } from "../src/progress.ts";
import { progressMessage } from "../src/ui/server.ts";
import { Agent } from "../src/loop.ts";
import { Permissions } from "../src/permissions.ts";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("partial JSON gives back whatever has arrived", () => {
  expect(parsePartialJSON('{"path": "src/app.ts", "content": "line 1\\nli')).toEqual({ path: "src/app.ts", content: "line 1\nli" });
  expect(parsePartialJSON('{"path": "a.ts", "con')).toEqual({ path: "a.ts" });
  expect(parsePartialJSON('{"path": "a.ts", "content"')).toEqual({ path: "a.ts" });
  expect(parsePartialJSON('{"path": "a.ts", "content":')).toEqual({ path: "a.ts" });
  expect(parsePartialJSON('{"say": "he said \\"hi')).toEqual({ say: 'he said "hi' });
  // A half-written escape is left off rather than shown wrong.
  expect(parsePartialJSON('{"s": "tab\\')).toEqual({ s: "tab" });
  expect(parsePartialJSON('{"s": "\\u00e9\\u00')).toEqual({ s: "é" });
  expect(parsePartialJSON('{"timeout": 12')).toEqual({});
  expect(parsePartialJSON('{"timeout": 120, "ok": true, "list": [1, "tw')).toEqual({ timeout: 120, ok: true, list: [1, "tw"] });
  expect(parsePartialJSON('{"name": "write_file", "arguments": {"path": "x.ts", "content": "ab')).toEqual({ name: "write_file", arguments: { path: "x.ts", content: "ab" } });
  expect(parsePartialJSON("")).toBeUndefined();
  const full = { a: [1, { b: "c\n\"d\"" }], e: null, f: -1.5e3 };
  expect(parsePartialJSON(JSON.stringify(full))).toEqual(full);
});

test("progress reads as a person would say it", () => {
  const p: StreamProgress = { phase: "tool", tokens: 120, elapsedMs: 30_000, tool: { index: 0, name: "write_file", args: '{"path": "src/app.ts", "content": "a\\nb\\nc' } };
  const a = describe(p);
  expect(a).toEqual({ title: "Writing src/app.ts", preview: "a\nb\nc", lines: 3 });
  expect(statusLine(p, a)).toBe("Writing src/app.ts · 3 lines · 120 tokens · 4.0 tok/s · 30s");
  expect(describe({ phase: "tool", tokens: 3, elapsedMs: 1, tool: { index: 0, name: "bash", args: '{"command": "bun te' } })).toEqual({ title: "Running", preview: "bun te", lines: 1 });
  expect(describe({ phase: "tool", tokens: 1, elapsedMs: 1, tool: { index: 0, name: "", args: "" } }).title).toBe("Preparing a tool call");
  expect(statusLine({ phase: "waiting", tokens: 0, elapsedMs: 75_000, promptTokens: 9_200 })).toBe("Reading the 9.2k-token prompt · 1m15s");
  expect(describe({ phase: "thinking", tokens: 5, elapsedMs: 1, thinking: "hmm" })).toEqual({ title: "Thinking", preview: "hmm", lines: 0 });
});

test("tool calls written as text are hidden from the output and reported as they grow", () => {
  const w = new TextCallWatcher();
  let shown = "";
  const pieces = ["Sure, creating it.\n<tool", "_call>\n{\"name\": \"write_file\", ", "\"arguments\": {\"path\": \"a.ts\", \"content\": \"x = 1", "\"}}\n</tool_call>", " done"];
  const seen: (string | undefined)[] = [];
  for (const p of pieces) {
    shown += w.push(p);
    seen.push(w.inside ? w.progress().args : undefined);
  }
  shown += w.flush();
  expect(shown).toBe("Sure, creating it.\n done");
  expect(seen[1]).toBe("");
  expect(seen[2]).toBe('{"path":"a.ts","content":"x = 1"}');
  expect(w.inside).toBe(false);
  // A "<" that turns out not to open a tool call still shows.
  const v = new TextCallWatcher();
  expect(v.push("if a <") + v.push(" b") + v.flush()).toBe("if a < b");
});

test("the throttle passes phase changes at once and keeps the latest value", async () => {
  let t = 0;
  const got: string[] = [];
  const f = throttle((p) => got.push(`${p.phase}:${p.tokens}`), 100, () => t);
  const p = (phase: StreamProgress["phase"], tokens: number): StreamProgress => ({ phase, tokens, elapsedMs: 0 });
  f(p("waiting", 0));
  f(p("tool", 1));
  t = 10;
  f(p("tool", 2));
  f(p("tool", 3));
  t = 150;
  f(p("tool", 4));
  t = 160;
  f(p("tool", 5));
  f(p("done", 5));
  expect(got).toEqual(["waiting:0", "tool:1", "tool:4", "tool:5", "done:5"]);
});

test("the UI gets the tail of a long preview", () => {
  const content = "x".repeat(10_000);
  const m = progressMessage({ phase: "tool", tokens: 9, elapsedMs: 9, tool: { index: 0, name: "write_file", args: JSON.stringify({ path: "big.txt", content }) } });
  expect(m.title).toBe("Writing big.txt");
  expect((m.preview as string).length).toBe(4001);
  expect(m.tool).toEqual({ index: 0, name: "write_file" });
});

// A fake server that thinks, then streams a write_file call in small pieces.
const server = Bun.serve({
  port: 0,
  async fetch(req) {
    const { messages } = (await req.json()) as any;
    const textMode = String(messages.at(-1)?.content).includes("as text");
    const chunks: object[] = [{ choices: [{ delta: { reasoning_content: "The user wants " } }] }, { choices: [{ delta: { reasoning_content: "a file." } }] }];
    const args = JSON.stringify({ path: "hello.ts", content: "console.log(1);\nconsole.log(2);\n" });
    if (textMode) {
      const text = `<tool_call>\n{"name": "write_file", "arguments": ${args}}\n</tool_call>`;
      for (let i = 0; i < text.length; i += 7) chunks.push({ choices: [{ delta: { content: text.slice(i, i + 7) } }] });
    } else {
      chunks.push({ choices: [{ delta: { tool_calls: [{ index: 0, id: "c1", function: { name: "write_file", arguments: "" } }] } }] });
      for (let i = 0; i < args.length; i += 7) chunks.push({ choices: [{ delta: { tool_calls: [{ index: 0, function: { arguments: args.slice(i, i + 7) } }] } }] });
    }
    const body = chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join("") + "data: [DONE]\n\n";
    return new Response(body, { headers: { "content-type": "text/event-stream" } });
  },
});
afterAll(() => server.stop());
const llm = { baseURL: `http://localhost:${server.port}/v1`, model: "fake" };
const tools = [{ type: "function" as const, function: { name: "write_file", description: "", parameters: {} } }];

test("streaming reports thinking, then the file as it is written, then done", async () => {
  const seen: StreamProgress[] = [];
  const res = await complete(llm, [{ role: "user", content: "make hello.ts" }], tools, () => {}, undefined, (p) => seen.push(structuredClone(p)));
  expect(res.toolCalls[0]!.name).toBe("write_file");
  expect(seen[0]!.phase).toBe("waiting");
  expect(seen.find((p) => p.phase === "thinking")?.thinking).toBe("The user wants ");
  const writes = seen.filter((p) => p.phase === "tool").map((p) => describe(p));
  // Part of the file shows before the call is complete.
  const full = "console.log(1);\nconsole.log(2);\n";
  expect(writes.some((a) => a.title === "Writing hello.ts" && a.preview.length > 0 && a.preview.length < full.length && full.startsWith(a.preview))).toBe(true);
  expect(writes.at(-1)!.preview).toBe(full);
  // Tokens only go up.
  expect(seen.every((p, i) => i === 0 || p.tokens >= seen[i - 1]!.tokens)).toBe(true);
  expect(seen.at(-1)!.phase).toBe("done");
});

test("a tool call written as text shows as progress, not as raw JSON", async () => {
  let out = "";
  const seen: StreamProgress[] = [];
  const res = await complete(llm, [{ role: "user", content: "write it as text" }], tools, (t) => (out += t), undefined, (p) => seen.push(structuredClone(p)));
  expect(res.rescued).toBe(true);
  expect(out).not.toContain("tool_call");
  expect(out).not.toContain("console.log");
  const last = seen.filter((p) => p.phase === "tool").at(-1)!;
  expect(describe(last).title).toBe("Writing hello.ts");
  expect(describe(last).preview).toBe("console.log(1);\nconsole.log(2);\n");
});

test("the agent passes progress on, with the prompt size", async () => {
  const dir = await mkdtemp(join(tmpdir(), "maxx-progress-"));
  const seen: StreamProgress[] = [];
  const io = { token() {}, toolStart() {}, toolEnd() {}, note() {}, ask: async () => "no" as const, progress: (p: StreamProgress) => seen.push(p) };
  const agent = await new Agent({ llm, cwd: dir, permissions: await new Permissions(dir, "ask").load(), maxSteps: 1 }, io).init();
  await agent.send("make hello.ts");
  expect(seen.length).toBeGreaterThan(3);
  expect(seen.every((p) => (p.promptTokens ?? 0) > 0)).toBe(true);
});
