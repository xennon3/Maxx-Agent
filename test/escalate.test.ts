import { afterAll, expect, test } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Agent, type AgentIO, type Escalation } from "../src/loop.ts";
import { Permissions } from "../src/permissions.ts";
import { toAnthropic, completeAnthropic } from "../src/anthropic.ts";
import { failed, loadHelper, resolveHelper, saveHelper, type Helper } from "../src/escalate.ts";
import type { Message } from "../src/llm.ts";

// One fake OpenAI-compatible server with a script per model, so the local
// model and the helper can be told apart by the "model" field.
type Reply = { text?: string; tool?: { name: string; args: object }; status?: number };
const scripts: Record<string, Reply[]> = {};
const requests: { model: string; messages: Message[] }[] = [];
const server = Bun.serve({
  port: 0,
  async fetch(req) {
    const body = (await req.json()) as any;
    requests.push(body);
    const r = scripts[body.model]?.shift() ?? { text: "done" };
    if (r.status) return new Response("no credit", { status: r.status });
    const chunks: object[] = [];
    if (r.text) chunks.push({ choices: [{ delta: { content: r.text } }] });
    if (r.tool) chunks.push({ choices: [{ delta: { tool_calls: [{ index: 0, id: "call_1", function: { name: r.tool.name, arguments: JSON.stringify(r.tool.args) } }] } }] });
    return new Response(chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join("") + "data: [DONE]\n\n", { headers: { "content-type": "text/event-stream" } });
  },
});
afterAll(() => server.stop());
const baseURL = `http://localhost:${server.port}/v1`;

async function setup(helper: Helper | null) {
  const dir = await mkdtemp(join(tmpdir(), "maxx-esc-"));
  const log: string[] = [];
  const events: Escalation[] = [];
  const io: AgentIO = {
    token: () => {},
    toolStart: (n, a) => log.push(`start ${n} ${a}`),
    toolEnd: () => {},
    note: (t) => log.push(`note ${t}`),
    ask: async () => "yes",
    escalation: (e) => events.push(e),
  };
  const agent = await new Agent({ llm: { baseURL, model: "small" }, cwd: dir, permissions: await new Permissions(dir, "yolo").load(), helper }, io).init();
  requests.length = 0;
  return { agent, log, events };
}

const fails = (n: number) => Array.from({ length: n }, (_, i) => ({ tool: { name: "bash", args: { command: `exit ${i + 3}` } } }));
const fix = { tool: { name: "bash", args: { command: "echo fixed" } } };

test("three failed calls hand the step to the helper, which hands back once it works", async () => {
  const { agent, events } = await setup({ kind: "lmstudio", model: "big" });
  scripts.small = [...fails(3), { text: "all done" }];
  scripts.big = [fix];
  expect(await agent.send("build it")).toBe("all done");

  expect(requests.map((r) => r.model)).toEqual(["small", "small", "small", "big", "small"]);
  expect(events.map((e) => e.active)).toEqual([true, false]);
  expect(events[0]!.reason).toBe("3 failed tool calls in a row");
  expect(events[1]!.steps).toBe(1);
  // The helper gets a brief that is not kept in history.
  const brief = JSON.stringify(requests[3]!.messages.at(-1));
  expect(brief).toContain("got stuck on this step");
  expect(JSON.stringify(agent.history)).not.toContain("got stuck on this step");
  // The local model is told the helper got past it, alongside the output.
  expect(JSON.stringify(requests[4]!.messages.at(-1))).toContain("helper model just took over");
  expect(agent.marks.map((m) => m.active)).toEqual([true, false]);
});

test("a repeat loop escalates on the third identical call", async () => {
  const { agent, events } = await setup({ kind: "lmstudio", model: "big" });
  const same = { tool: { name: "bash", args: { command: "echo same" } } };
  scripts.small = [same, same, same, { text: "ok" }];
  scripts.big = [fix];
  expect(await agent.send("go")).toBe("ok");
  expect(events[0]!.reason).toContain("same bash call 3 times");
});

test("with no helper, nothing leaves the local model and it stops as before", async () => {
  const { agent, events } = await setup(null);
  const same = { tool: { name: "bash", args: { command: "echo same" } } };
  scripts.small = [same, same, same, same, same];
  expect(await agent.send("go")).toContain("Stopped: the model kept repeating");
  expect(new Set(requests.map((r) => r.model))).toEqual(new Set(["small"]));
  expect(events).toEqual([]);
});

test("an unreachable helper hands back instead of ending the turn", async () => {
  const { agent, events, log } = await setup({ kind: "lmstudio", model: "big" });
  scripts.small = [...fails(3), { text: "gave it my best" }];
  scripts.big = [{ status: 402 }];
  expect(await agent.send("go")).toBe("gave it my best");
  expect(events.map((e) => e.reason)).toEqual(["3 failed tool calls in a row", "the helper could not be reached"]);
  expect(log.some((l) => l.includes("helper model failed"))).toBe(true);
});

test("a helper that keeps failing gives up after its step budget, and escalations per turn are capped", async () => {
  const { agent, events } = await setup({ kind: "lmstudio", model: "big", maxSteps: 2, maxPerTurn: 1 });
  scripts.small = [...fails(6), { text: "stuck" }];
  scripts.big = fails(2);
  expect(await agent.send("go")).toBe("stuck");
  expect(events.map((e) => e.reason)).toEqual(["3 failed tool calls in a row", "still stuck after 2 helper steps"]);
  expect(requests.filter((r) => r.model === "big")).toHaveLength(2);
});

test("an answer from the helper ends the turn and is credited back", async () => {
  const { agent, events } = await setup({ kind: "lmstudio", model: "big" });
  scripts.small = fails(3);
  scripts.big = [{ text: "It was already fixed." }];
  expect(await agent.send("go")).toBe("It was already fixed.");
  expect(events.at(-1)!.reason).toBe("it answered");
});

test("failed() reads errors and non-zero exit codes", () => {
  expect(failed("error: no such file")).toBe(true);
  expect(failed("stdout:\nboom\nexit code: 2")).toBe(true);
  expect(failed("exit code: killed after 120s")).toBe(true);
  expect(failed("hello\nexit code: 0")).toBe(false);
  expect(failed("wrote 3 lines")).toBe(false);
});

test("history converts to Anthropic turns", () => {
  const { system, turns } = toAnthropic([
    { role: "system", content: "be Maxx" },
    { role: "user", content: "hi" },
    { role: "assistant", content: null, tool_calls: [{ id: "call_1", type: "function", function: { name: "bash", arguments: '{"command":"ls"}' } }] },
    { role: "tool", tool_call_id: "call_1", content: "error: nope" },
    { role: "user", content: [{ type: "text", text: "Screenshot:" }, { type: "image_url", image_url: { url: "data:image/png;base64,AAAA" } }] },
    { role: "assistant", content: "again", tool_calls: [{ id: "call_1", type: "function", function: { name: "bash", arguments: "{" } }] },
    { role: "tool", tool_call_id: "call_1", content: "ok" },
  ]);
  expect(system).toBe("be Maxx");
  expect(turns.map((t) => t.role)).toEqual(["user", "assistant", "user", "assistant", "user"]);
  const [, a1, u1, a2, u2] = turns as any[];
  // Reused local ids become unique ones, and each result points at its own call.
  expect(a1.content[0]).toEqual({ type: "tool_use", id: "toolu_maxx_0", name: "bash", input: { command: "ls" } });
  expect(u1.content[0]).toMatchObject({ type: "tool_result", tool_use_id: "toolu_maxx_0", is_error: true });
  expect(u1.content[2]).toEqual({ type: "image", source: { type: "base64", media_type: "image/png", data: "AAAA" } });
  expect(a2.content[1]).toMatchObject({ id: "toolu_maxx_1", input: {} });
  expect(u2.content[0]).toMatchObject({ tool_use_id: "toolu_maxx_1", content: "ok" });
});

test("Claude's stream becomes a Completion", async () => {
  const sse = (events: object[]) => events.map((e: any) => `event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`).join("");
  let body: any;
  const fake = Bun.serve({
    port: 0,
    async fetch(req) {
      body = await req.json();
      return new Response(
        sse([
          { type: "message_start", message: { id: "msg_1", type: "message", role: "assistant", model: body.model, content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 1200, output_tokens: 1 } } },
          { type: "content_block_start", index: 0, content_block: { type: "thinking", thinking: "", signature: "" } },
          { type: "content_block_delta", index: 0, delta: { type: "thinking_delta", thinking: "The path has a space." } },
          { type: "content_block_stop", index: 0 },
          { type: "content_block_start", index: 1, content_block: { type: "text", text: "" } },
          { type: "content_block_delta", index: 1, delta: { type: "text_delta", text: "Quoting it." } },
          { type: "content_block_stop", index: 1 },
          { type: "content_block_start", index: 2, content_block: { type: "tool_use", id: "toolu_1", name: "bash", input: {} } },
          { type: "content_block_delta", index: 2, delta: { type: "input_json_delta", partial_json: '{"command":' } },
          { type: "content_block_delta", index: 2, delta: { type: "input_json_delta", partial_json: '"cd \\"My App\\""}' } },
          { type: "content_block_stop", index: 2 },
          { type: "message_delta", delta: { stop_reason: "tool_use", stop_sequence: null }, usage: { output_tokens: 42 } },
          { type: "message_stop" },
        ]),
        { headers: { "content-type": "text/event-stream" } },
      );
    },
  });
  const phases: string[] = [];
  const res = await completeAnthropic(
    { provider: "anthropic", baseURL: `http://localhost:${fake.port}`, model: "claude-opus-5-5", apiKey: "test" },
    [{ role: "system", content: "sys" }, { role: "user", content: "hi" }],
    [{ type: "function", function: { name: "bash", description: "run", parameters: { type: "object", properties: { command: { type: "string" } } } } }],
    () => {},
    undefined,
    (p) => phases.push(p.phase),
  );
  fake.stop();
  expect(res.content).toBe("Quoting it.");
  expect(res.toolCalls).toEqual([{ id: "toolu_1", name: "bash", arguments: '{"command":"cd \\"My App\\""}' }]);
  expect(res.usage).toEqual({ input: 1200, output: 42 });
  expect(phases).toContain("thinking");
  expect(body.thinking).toEqual({ type: "adaptive", display: "summarized" });
  expect(body.output_config).toEqual({ effort: "high" });
  expect(body.temperature).toBeUndefined();
  expect(body.tools[0]).toMatchObject({ name: "bash", eager_input_streaming: true });
});

test("helper settings: flags beat the environment, which beats the saved file", async () => {
  const home = await mkdtemp(join(tmpdir(), "maxx-home-"));
  const prev = process.env.MAXX_HOME;
  process.env.MAXX_HOME = home;
  try {
    expect(await resolveHelper({}, {})).toBeNull();
    await saveHelper({ kind: "anthropic", model: "claude-sonnet-5-5", apiKey: "sk-saved", afterFailures: 2 });
    expect(await resolveHelper({}, {})).toMatchObject({ kind: "anthropic", model: "claude-sonnet-5-5", apiKey: "sk-saved" });
    // Same kind keeps the saved key and thresholds.
    expect(await resolveHelper({}, { MAXX_HELPER: "claude-opus-5-5" })).toMatchObject({ kind: "anthropic", model: "claude-opus-5-5", apiKey: "sk-saved", afterFailures: 2 });
    expect(await resolveHelper({ model: "qwen3.8-27b" }, { MAXX_HELPER: "claude-opus-5-5" })).toEqual({ off: false, kind: "lmstudio", model: "qwen3.8-27b" });
    expect(await resolveHelper({ model: "gpt-5", url: "https://openrouter.ai/api/v1" }, {})).toMatchObject({ kind: "openai", baseURL: "https://openrouter.ai/api/v1" });
    expect(await resolveHelper({ model: "off" }, {})).toBeNull();
    await saveHelper({ ...(await loadHelper())!, off: true });
    expect(await resolveHelper({}, {})).toBeNull();
    expect(resolveHelper({ model: "x", kind: "nope" }, {})).rejects.toThrow("unknown helper kind");
  } finally {
    if (prev === undefined) delete process.env.MAXX_HOME;
    else process.env.MAXX_HOME = prev;
  }
});
