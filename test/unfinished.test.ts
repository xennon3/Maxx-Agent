import { afterAll, expect, test } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { z } from "zod";
import { Agent, dropThinking, keptThinking, type AgentIO } from "../src/loop.ts";
import { Permissions } from "../src/permissions.ts";
import { rescueToolCalls, splitThinking, type Message } from "../src/llm.ts";
import { unfinished, finishNote } from "../src/unfinished.ts";
import { contextFromError, fitContext, probeContext } from "../src/modelctx.ts";
import { defineTool } from "../src/tools/types.ts";

// A fake OpenAI-style server that can stream reasoning, say why it stopped, refuse long prompts and report a context size.
type Reply = { text?: string; reasoning?: string; finish?: string; tool?: { name: string; args: object }; status?: number; error?: string };
let script: Reply[] = [];
const requests: any[] = [];
let modelsBody: any = { data: [{ id: "deepseek", object: "model" }] };

const server = Bun.serve({
  port: 0,
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/v1/models") return Response.json(modelsBody);
    if (url.pathname.startsWith("/api/v0/models/")) return Response.json({ id: "lms", loaded_context_length: 4096, max_context_length: 131072 });
    if (url.pathname === "/props") return new Response("no", { status: 404 });
    requests.push(await req.json());
    const r = script.shift() ?? { text: "done" };
    if (r.status) return new Response(JSON.stringify({ error: { message: r.error } }), { status: r.status });
    const chunks: object[] = [];
    if (r.reasoning) for (const piece of r.reasoning.match(/.{1,16}/gs) ?? []) chunks.push({ choices: [{ delta: { reasoning_content: piece } }] });
    if (r.text) for (const piece of r.text.match(/.{1,16}/gs) ?? []) chunks.push({ choices: [{ delta: { content: piece } }] });
    if (r.tool) {
      chunks.push({ choices: [{ delta: { tool_calls: [{ index: 0, id: `call_${requests.length}`, function: { name: r.tool.name, arguments: JSON.stringify(r.tool.args) } }] } }] });
    }
    chunks.push({ choices: [{ delta: {}, finish_reason: r.finish ?? (r.tool ? "tool_calls" : "stop") }] });
    const body = chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join("") + "data: [DONE]\n\n";
    return new Response(body, { headers: { "content-type": "text/event-stream" } });
  },
});
afterAll(() => server.stop());
const baseURL = `http://localhost:${server.port}/v1`;

function fakeIO() {
  const log: string[] = [];
  const io: AgentIO = {
    token: () => {},
    toolStart: (n) => log.push(`start ${n}`),
    toolEnd: (n) => log.push(`end ${n}`),
    note: (t) => log.push(`note ${t}`),
    ask: async () => "yes",
    retract: (why) => log.push(`retract ${why}`),
  };
  return { io, log };
}

let searches = 0;
const fakeSearch = defineTool({
  name: "web_search",
  description: "search the web",
  schema: z.object({ query: z.string() }),
  risk: "read",
  // Results differ a little each time (as real engines do), so a result-based repeat check misses them.
  run: async ({ query }) => `results for ${query} #${++searches}: bulb.svg has a fill attribute`,
});

async function chatAgent(context = 8192) {
  const { io, log } = fakeIO();
  const cwd = await mkdtemp(join(tmpdir(), "maxx-unf-"));
  const online = async () => ({ tools: [fakeSearch], notes: [], servers: [] });
  const agent = await new Agent({ llm: { baseURL, model: "deepseek" }, cwd, permissions: await new Permissions(cwd, "ask").load(), chat: true, network: true, online, thinking: "max", contextWindow: context, plan: false, memory: false, fixTries: 0 }, io).init();
  return { agent, log };
}

// What DeepSeek V4.1-Flash sent on the EVO: its thinking as the reply, cut off at a colon, finish "stop".
const LEAKED = "I keep repeating the same search. The results show the bulb is an SVG path. Let me think about how to change the color. I need to set the fill. Maybe I should use the style attribute instead. Wait, the user wants it to glow. I'll set bulb fill via JS:";

test("a reply that is only the model's thinking is not taken as the answer", async () => {
  const { agent, log } = await chatAgent();
  script = [{ text: LEAKED }, { text: "Set the bulb's `fill` in JavaScript: `bulb.setAttribute('fill', '#ffd84d')`." }];
  requests.length = 0;
  const answer = await agent.send("make the bulb glow yellow when clicked");
  expect(answer).toContain("setAttribute");
  expect(log).toContain("retract thinking");
  // The second request carried the note, with the end of what it thought.
  const last = requests[1].messages.at(-1);
  expect(JSON.stringify(last)).toContain("Note from Maxx");
  expect(JSON.stringify(last)).toContain("bulb fill via JS");
  // Neither the leaked thinking nor the note stays in the history.
  expect(JSON.stringify(agent.history)).not.toContain("I keep repeating");
  expect(JSON.stringify(agent.history)).not.toContain("Note from Maxx");
});

test("after two tries the user is told, and an empty reply is not passed off as an answer", async () => {
  const { agent, log } = await chatAgent();
  script = [{ reasoning: "thinking..." }, { reasoning: "still thinking" }, { reasoning: "more" }];
  const answer = await agent.send("hi");
  expect(answer).toStartWith("Stopped: deepseek ended without writing an answer");
  expect(log.filter((l) => l.startsWith("retract")).length).toBe(2);
  expect(log.some((l) => l.includes("stopped without finishing"))).toBe(true);
});

test("running out of room says so", async () => {
  const { agent, log } = await chatAgent();
  script = [{ text: "Here is a long", finish: "length" }, { text: "Here is a long", finish: "length" }, { text: "Here is a long", finish: "length" }];
  const answer = await agent.send("write an essay");
  expect(answer).toBe("Here is a long");
  expect(log.some((l) => l.includes("ran out of room") && l.includes("8192"))).toBe(true);
});

test("the same web search a third time switches tools off for one step", async () => {
  const { agent, log } = await chatAgent();
  searches = 0;
  const call = { tool: { name: "web_search", args: { query: "svg bulb fill" } } };
  script = [call, call, call, { text: "Use the fill attribute." }];
  requests.length = 0;
  const answer = await agent.send("how do I color an svg bulb?");
  expect(answer).toBe("Use the fill attribute.");
  expect(searches).toBe(3);
  // The second result already says it is a repeat.
  const tools = agent.history.filter((m) => m.role === "tool").map((m) => m.content as string);
  expect(tools[1]).toContain("already made this exact web_search call");
  expect(tools[2]).toContain("answer the user now");
  // The fourth request offered no tools.
  expect(requests[3].tools).toBeUndefined();
  expect(requests[2].tools?.length).toBe(1);
  expect(log.some((l) => l.includes("ran 3 times"))).toBe(true);
});

test("thinking before a tool call rides along within the turn, then is dropped", async () => {
  const { agent } = await chatAgent();
  script = [{ reasoning: "The bulb is an SVG; search how to fill it.", tool: { name: "web_search", args: { query: "svg fill" } } }, { text: "Use fill." }];
  requests.length = 0;
  await agent.send("color the bulb");
  const asst = requests[1].messages.find((m: any) => m.role === "assistant");
  expect(asst.reasoning_content).toContain("search how to fill it");
  expect(agent.history.some((m) => m.role === "assistant" && "reasoning_content" in m)).toBe(false);
});

test("a too-long error with the real window shrinks the plan and goes on", async () => {
  const { agent, log } = await chatAgent(65536);
  script = [{ status: 400, error: "request (9000 tokens) exceeds the available context size (8192 tokens), try increasing it" }, { text: "Hello!" }];
  const answer = await agent.send("hi");
  expect(answer).toBe("Hello!");
  expect(agent.contextWindow).toBe(8192);
  expect(log.some((l) => l.includes("only 8192 tokens"))).toBe(true);
});

test("unfinished: what counts", () => {
  expect(unfinished(LEAKED)).toBe("thinking");
  expect(unfinished("")).toBe("empty");
  expect(unfinished("Done.", "length")).toBe("length");
  expect(unfinished("Here it is:\n```js\nconst a = 1;")).toBe("cut");
  expect(unfinished("Sure, here's the plan. Now let's write the code:")).toBe("cut");
  // Real answers pass, including ones that open casually or end on a list or code.
  expect(unfinished("Okay! The capital of France is Paris.")).toBeNull();
  expect(unfinished("Steps:\n- boil water\n- add pasta")).toBeNull();
  expect(unfinished("Run this:\n```bash\nls\n```")).toBeNull();
  expect(unfinished("I'll keep it short: yes, it works 👍")).toBeNull();
  expect(unfinished("| a | b |\n|---|---|\n| 1 | 2 |")).toBeNull();
  expect(finishNote("thinking", LEAKED)).toContain("make that tool call now");
});

test("thinking left in the content is moved out of it", () => {
  expect(splitThinking("<think>plan</think>\n\nAnswer")).toEqual({ content: "Answer", thinking: "plan" });
  expect(splitThinking("plan only closed</think>Answer")).toEqual({ content: "Answer", thinking: "plan only closed" });
  expect(splitThinking("<think>never closed")).toEqual({ content: "", thinking: "never closed" });
  expect(splitThinking("plain")).toEqual({ content: "plain", thinking: "" });
});

test("DeepSeek's DSML tool calls are recovered from text", () => {
  const known = new Set(["web_search", "edit"]);
  const dsml = 'I\'ll search.\n<｜DSML｜function_calls>\n<｜DSML｜invoke name="web_search">\n<｜DSML｜parameter name="query" string="true">svg bulb fill</｜DSML｜parameter>\n<｜DSML｜parameter name="limit" string="false">5</｜DSML｜parameter>\n</｜DSML｜invoke>\n</｜DSML｜function_calls>';
  const calls = rescueToolCalls(dsml, known);
  expect(calls.length).toBe(1);
  expect(JSON.parse(calls[0]!.arguments)).toEqual({ query: "svg bulb fill", limit: 5 });
  const old = "<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>function<｜tool▁sep｜>web_search\n```json\n{\"query\":\"x\"}\n```<｜tool▁call▁end｜><｜tool▁calls▁end｜>";
  expect(rescueToolCalls(old, known)[0]?.name).toBe("web_search");
});

test("kept thinking is sized to the context", () => {
  const long = "word ".repeat(2000);
  expect(keptThinking(long, 8192).length).toBeLessThan(700);
  expect(keptThinking(long, 65536).length).toBeLessThan(1700);
  expect(keptThinking(undefined, 8192)).toBe("");
  const h: Message[] = [{ role: "assistant", content: null, reasoning_content: "x" }];
  dropThinking(h);
  expect("reasoning_content" in h[0]!).toBe(false);
});

test("the real context comes from the server, never above the setting", async () => {
  modelsBody = { data: [{ id: "deepseek", context_length: 8192 }] };
  expect(await probeContext(baseURL, "deepseek")).toBe(8192);
  const fit = await fitContext(baseURL, "deepseek", 65536);
  expect(fit.context).toBe(8192);
  expect(fit.note).toContain("8192");
  expect((await fitContext(baseURL, "deepseek", 4096)).context).toBe(4096);
  // Not in the list: LM Studio's own API answers with what was loaded.
  modelsBody = { data: [{ id: "lms", owned_by: "organization_owner" }] };
  expect(await probeContext(baseURL, "lms")).toBe(4096);
  modelsBody = { data: [{ id: "deepseek", object: "model" }] };
});

test("context sizes read from refusals", () => {
  expect(contextFromError("This model's maximum context length is 8192 tokens. However, you requested 9000 tokens")).toBe(8192);
  expect(contextFromError("request (9000 tokens) exceeds the available context size (8192 tokens)")).toBe(8192);
  expect(contextFromError("the model is loaded with context length of only 4096 tokens")).toBe(4096);
  expect(contextFromError("model not found")).toBeNull();
});
