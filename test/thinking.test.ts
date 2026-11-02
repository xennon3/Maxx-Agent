import { afterAll, beforeEach, expect, test } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { complete } from "../src/llm.ts";
import { Agent, type AgentIO } from "../src/loop.ts";
import { Permissions } from "../src/permissions.ts";
import { BUDGET, loadThinking, parseThinking, planFor, resetPlainServers, resolveThinking, ruminating, saveThinking, sizeAsk, thinkingFields } from "../src/thinking.ts";

// A fake server whose model thinks for `think` chunks (forever if Infinity)
// before answering, the way DeepSeek does at 20 tok/s.
type Reply = { think?: number; thought?: string; inline?: boolean; text?: string; tool?: { name: string; args: object } };
let script: Reply[] = [];
const requests: any[] = [];
let strict = false;
let cancelled = 0;

const server = Bun.serve({
  port: 0,
  async fetch(req) {
    const body = await req.json();
    if (strict && (body.chat_template_kwargs || body.reasoning_effort)) {
      return new Response(JSON.stringify({ error: "Unrecognized request argument supplied: chat_template_kwargs" }), { status: 400 });
    }
    requests.push(body);
    const r = script.shift() ?? { text: "done" };
    const enc = new TextEncoder();
    const sse = (o: object) => enc.encode(`data: ${JSON.stringify(o)}\n\n`);
    let i = 0;
    const thought = r.thought;
    const stream = new ReadableStream({
      async pull(c) {
        if (r.inline && i === 0) c.enqueue(sse({ choices: [{ delta: { content: "<think>" } }] }));
        if (i < (r.think ?? 0)) {
          i++;
          // Fresh words by default (no loop), or the given sentence over and over.
          const piece = thought ? thought.split(" ")[i % thought.split(" ").length] + " " : `button${i} `;
          c.enqueue(sse({ choices: [{ delta: r.inline ? { content: piece } : { reasoning_content: piece } }] }));
          if (i % 50 === 0) await Bun.sleep(1);
          return;
        }
        if (r.inline) c.enqueue(sse({ choices: [{ delta: { content: "</think>" } }] }));
        if (r.text) c.enqueue(sse({ choices: [{ delta: { content: r.text } }] }));
        if (r.tool) c.enqueue(sse({ choices: [{ delta: { tool_calls: [{ index: 0, id: "call_1", function: { name: r.tool.name, arguments: JSON.stringify(r.tool.args) } }] } }] }));
        c.enqueue(enc.encode("data: [DONE]\n\n"));
        c.close();
      },
      cancel() {
        cancelled++;
      },
    });
    return new Response(stream, { headers: { "content-type": "text/event-stream" } });
  },
});
afterAll(() => server.stop());
const baseURL = `http://localhost:${server.port}/v1`;

beforeEach(() => {
  script = [];
  requests.length = 0;
  strict = false;
  resetPlainServers();
});

test("asks are sized by their words", () => {
  expect(sizeAsk("make the start button blue")).toBe("simple");
  expect(sizeAsk("rename score to points")).toBe("simple");
  expect(sizeAsk("thanks!")).toBe("simple");
  expect(sizeAsk("add a settings screen with a dark mode toggle that remembers the choice")).toBe("normal");
  expect(sizeAsk("why does the game crash when the second level loads?")).toBe("hard");
  expect(sizeAsk("make it blue\n```\nTypeError: x is undefined\n```")).toBe("hard");
  expect(sizeAsk("x".repeat(700))).toBe("hard");
});

test("auto gives simple asks almost nothing, hard ones plenty, and failures more", () => {
  const ok = { step: 0, failed: false, failures: 0 };
  expect(planFor("auto", "simple", ok).tier).toBe(0);
  expect(planFor("auto", "normal", ok).tier).toBe(1);
  expect(planFor("auto", "hard", ok).tier).toBe(3);
  expect(planFor("auto", "hard", { ...ok, step: 2 }).tier).toBe(2);
  expect(planFor("auto", "simple", { step: 3, failed: true, failures: 1 }).tier).toBe(1);
  expect(planFor("auto", "simple", { step: 4, failed: true, failures: 3 }).tier).toBe(2);
  expect(planFor("auto", "hard", { step: 4, failed: true, failures: 3 }).tier).toBe(3);
  expect(planFor("off", "hard", { step: 4, failed: true, failures: 3 }).tier).toBe(0);
  expect(planFor("max", "simple", ok).budget).toBe(Infinity);
  expect(thinkingFields(planFor("off", "hard", ok))).toEqual({ chat_template_kwargs: { enable_thinking: false, thinking: false }, reasoning_effort: "low" });
  expect(thinkingFields(planFor("max", "hard", ok))).toEqual({});
});

test("the setting is auto until changed, saved, and the flag wins", async () => {
  const home = process.env.MAXX_HOME;
  process.env.MAXX_HOME = await mkdtemp(join(tmpdir(), "maxx-think-home-"));
  try {
    expect(await loadThinking()).toBe("auto");
    await saveThinking("off");
    expect(await resolveThinking(undefined, {})).toBe("off");
    expect(await resolveThinking(undefined, { MAXX_THINKING: "high" })).toBe("high");
    expect(await resolveThinking("max", { MAXX_THINKING: "high" })).toBe("max");
    await expect(resolveThinking("lots", {})).rejects.toThrow("auto, off, low, high, max");
    expect(parseThinking("on")).toBe("max");
    expect(parseThinking("L")).toBe("low");
  } finally {
    if (home === undefined) delete process.env.MAXX_HOME;
    else process.env.MAXX_HOME = home;
  }
});

test("thinking past the budget is cut, and the model asked again with thinking off", async () => {
  script = [{ think: Infinity, text: "never" }, { text: "Done: the button is blue." }];
  const plan = { tier: 1 as const, budget: 100, why: "a simple ask" };
  const res = await complete({ baseURL, model: "m", thinking: plan }, [{ role: "user", content: "make it blue" }], []);
  expect(res.content).toBe("Done: the button is blue.");
  expect(res.thought?.cut).toBe("budget");
  expect(res.thought!.tokens).toBeGreaterThan(100);
  expect(res.thought!.tokens).toBeLessThan(140);
  expect(requests).toHaveLength(2);
  expect(requests[0].chat_template_kwargs.enable_thinking).toBe(true);
  expect(requests[1].chat_template_kwargs.enable_thinking).toBe(false);
  const note = requests[1].messages.at(-1);
  expect(note.role).toBe("user");
  expect(note.content).toContain("Do not think any further");
  expect(note.content).toContain("button");
  await Bun.sleep(20);
  expect(cancelled).toBeGreaterThan(0);
});

test("a server that ignores 'off' is cut once more, then gets a plain request", async () => {
  script = [{ think: Infinity }, { think: Infinity }, { think: 50, text: "ok" }];
  const res = await complete({ baseURL, model: "m", thinking: { tier: 0, budget: 30, why: "x" } }, [{ role: "user", content: "hi" }], []);
  expect(res.content).toBe("ok");
  expect(requests).toHaveLength(3);
  expect(requests[2].chat_template_kwargs).toBeUndefined();
});

test("going round in circles is cut before the budget", async () => {
  expect(ruminating("Wait, the file is main.js. Let me check that again. Wait, the file is main.js. Hmm. Wait, the file is main.js.")).toBe(true);
  expect(ruminating("First read the file. Then change the color. Then save it.")).toBe(false);
  script = [{ think: Infinity, thought: "Wait, maybe the color should be a darker blue instead. " }, { text: "ok" }];
  const res = await complete({ baseURL, model: "m", thinking: { tier: 3, budget: BUDGET[3], why: "x" } }, [{ role: "user", content: "hi" }], []);
  expect(res.thought?.cut).toBe("loop");
  expect(res.thought!.tokens).toBeLessThan(200);
});

test("<think> tags in the content count as thinking too", async () => {
  script = [{ think: Infinity, inline: true }, { text: "ok" }];
  const res = await complete({ baseURL, model: "m", thinking: { tier: 1, budget: 60, why: "x" } }, [{ role: "user", content: "hi" }], []);
  expect(res.thought?.cut).toBe("budget");
  expect(res.content).toBe("ok");
});

test("a short think is not cut, and no plan means no extra fields", async () => {
  script = [{ think: 20, text: "fine" }, { think: 20, text: "plain" }];
  const a = await complete({ baseURL, model: "m", thinking: { tier: 1, budget: 400, why: "x" } }, [{ role: "user", content: "hi" }], []);
  expect(a).toMatchObject({ content: "fine", thought: { tokens: 20 } });
  expect(a.thought?.cut).toBeUndefined();
  const b = await complete({ baseURL, model: "m" }, [{ role: "user", content: "hi" }], []);
  expect(b.content).toBe("plain");
  expect(requests[1].chat_template_kwargs).toBeUndefined();
  expect(requests[1].reasoning_effort).toBeUndefined();
});

test("a server that rejects the switches gets plain requests from then on", async () => {
  strict = true;
  script = [{ text: "one" }, { text: "two" }];
  const cfg = { baseURL, model: "m", thinking: { tier: 0 as const, budget: 96, why: "x" } };
  expect((await complete(cfg, [{ role: "user", content: "hi" }], [])).content).toBe("one");
  expect((await complete(cfg, [{ role: "user", content: "hi" }], [])).content).toBe("two");
  expect(requests).toHaveLength(2);
  expect(requests.every((r) => r.chat_template_kwargs === undefined)).toBe(true);
});

test("the agent thinks less on a simple ask and more after a failed step", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "maxx-think-"));
  const notes: string[] = [];
  const io: AgentIO = { token: () => {}, toolStart: () => {}, toolEnd: () => {}, note: (t) => notes.push(t), ask: async () => "no" };
  const online = async () => ({ tools: [], notes: [], servers: [] });
  const agent = await new Agent({ llm: { baseURL, model: "m" }, cwd, permissions: await new Permissions(cwd, "yolo").load(), online, plan: false, memory: false, fixTries: 0, learn: false }, io).init();
  expect(String(agent.history[0]!.content)).toContain("Think only as much as the step needs");
  script = [
    { tool: { name: "read_file", args: { path: "missing.js" } } },
    { think: Infinity },
    { text: "There is no missing.js here." },
  ];
  await agent.send("show me missing.js");
  // Simple ask: thinking off. The read fails, so the next step may think (but not for ever).
  expect(requests[0].chat_template_kwargs.enable_thinking).toBe(false);
  expect(requests[1].chat_template_kwargs.enable_thinking).toBe(true);
  expect(requests[1].reasoning_effort).toBe("low");
  expect(notes.some((n) => n.startsWith("(thinking cut after"))).toBe(true);
  await agent.setThinking("max");
  expect(String(agent.history[0]!.content)).not.toContain("Think only as much");
  requests.length = 0;
  script = [{ text: "hi" }];
  await agent.send("hello");
  expect(requests[0].chat_template_kwargs).toBeUndefined();
});
