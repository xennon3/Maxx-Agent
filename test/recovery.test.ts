import { afterAll, expect, test } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Agent, type AgentIO, type AgentOptions } from "../src/loop.ts";
import { Permissions } from "../src/permissions.ts";
import type { Step } from "../src/plan.ts";

// The small-model helpers end to end, against a scripted fake LM Studio.
type Reply = { text?: string; tool?: { name: string; args: object } };
let script: Reply[] = [];
const requests: any[] = [];
const server = Bun.serve({
  port: 0,
  async fetch(req) {
    requests.push(await req.json());
    const r = script.shift() ?? { text: "done" };
    const chunks: object[] = [];
    if (r.text) chunks.push({ choices: [{ delta: { content: r.text } }] });
    if (r.tool) chunks.push({ choices: [{ delta: { tool_calls: [{ index: 0, id: "call_" + requests.length, function: { name: r.tool.name, arguments: JSON.stringify(r.tool.args) } }] } }] });
    return new Response(chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join("") + "data: [DONE]\n\n", { headers: { "content-type": "text/event-stream" } });
  },
});
afterAll(() => server.stop());

async function setup(opts: Partial<AgentOptions> = {}) {
  const dir = await mkdtemp(join(tmpdir(), "maxx-rec-"));
  Bun.spawnSync(["git", "init", "-q"], { cwd: dir });
  const log: string[] = [];
  const plans: Step[][] = [];
  const io: AgentIO = {
    token: () => {},
    toolStart: (n, a) => log.push(`start ${n} ${a}`),
    toolEnd: (n, r) => log.push(`end ${n}: ${r.split("\n")[0]}`),
    note: (t) => log.push(`note ${t}`),
    ask: async () => "yes",
    plan: (s) => plans.push(s),
  };
  const llm = { baseURL: `http://localhost:${server.port}/v1`, model: "fake" };
  const agent = await new Agent({ llm, cwd: dir, permissions: await new Permissions(dir, "yolo").load(), ...opts }, io).init();
  return { dir, agent, log, plans };
}
const reports = (agent: Agent) => agent.history.filter((m) => m.role === "user" && Array.isArray(m.content)).map((m) => (m.content as any)[0].text as string);

test("a broken file is sent back until it parses", async () => {
  const { dir, agent, log } = await setup();
  script = [
    { tool: { name: "write_file", args: { path: "game.js", content: "function loop( {\n}\n" } } },
    { text: "Made the game." },
    { tool: { name: "write_file", args: { path: "game.js", content: "function loop() {\n}\n" } } },
    { text: "Fixed it." },
  ];
  expect(await agent.send("make a game")).toBe("Fixed it.");
  const r = reports(agent);
  expect(r).toHaveLength(1);
  expect(r[0]).toStartWith("Maxx checked your changes: syntax check of game.js failed (try 1 of 3).");
  expect(log).toContain("note (checked: syntax check of game.js passed)");
  expect(await Bun.file(join(dir, "game.js")).text()).toContain("loop()");
});

test("the build command runs after edits and gives up after the cap", async () => {
  const { agent, log } = await setup({ check: "echo 'src/a.ts(3,1): error TS1005: expected ;' && exit 2", fixTries: 2 });
  script = [
    { tool: { name: "write_file", args: { path: "a.txt", content: "x" } } },
    { text: "done 1" },
    { tool: { name: "write_file", args: { path: "a.txt", content: "y" } } },
    { text: "done 2" },
    { tool: { name: "write_file", args: { path: "a.txt", content: "z" } } },
    { text: "done 3" },
  ];
  expect(await agent.send("change it")).toBe("done 3");
  const r = reports(agent);
  expect(r).toHaveLength(2);
  expect(r[1]).toContain("(try 2 of 2)");
  expect(r[0]).toContain("Maxx hint: Fix line 3 of src/a.ts: expected ;.");
  expect(log.some((l) => l.startsWith("note (`echo") && l.includes("still fails after 2 tries"))).toBe(true);
});

test("no edits, no check; fixTries 0 turns it off", async () => {
  const { agent, log } = await setup({ check: "exit 1", fixTries: 0 });
  script = [{ tool: { name: "write_file", args: { path: "a.js", content: "(" } } }, { text: "ok" }];
  expect(await agent.send("x")).toBe("ok");
  expect(log.some((l) => l.startsWith("start check"))).toBe(false);
});

test("the plan is pinned, ticked, and an unfinished plan gets one nudge", async () => {
  const { agent, plans } = await setup();
  script = [
    { tool: { name: "plan", args: { steps: "1. write index.html\n2. add score" } } },
    { tool: { name: "plan", args: { done: 1 } } },
    { text: "All done!" },
    { tool: { name: "plan", args: { done: 2 } } },
    { text: "Really done." },
  ];
  expect(await agent.send("make a page")).toBe("Really done.");
  expect(plans.at(-1)).toEqual([{ text: "write index.html", done: true }, { text: "add score", done: true }]);
  expect(reports(agent)).toEqual([expect.stringContaining("Maxx: plan step 2 not ticked yet.")]);
  const tool = agent.history.filter((m) => m.role === "tool").map((m) => m.content as string);
  expect(tool[0]).toContain("Now do step 1: write index.html");
  // The prompt asks for a plan, and the tools include it.
  expect(requests.at(-1).messages[0].content).toContain("first call plan");
  expect(requests.at(-1).tools.map((t: any) => t.function.name)).toEqual(expect.arrayContaining(["plan", "remember"]));
});

test("failed commands carry a coach hint, and a program swap that works is remembered", async () => {
  const { dir, agent, log } = await setup();
  script = [
    { tool: { name: "bash", args: { command: "nosuchpython3 -c 'print(1)'" } } },
    { tool: { name: "bash", args: { command: "echo -c 'print(1)'" } } },
    { tool: { name: "remember", args: { note: "The app lives in web/." } } },
    { text: "ok" },
  ];
  await agent.send("run it");
  const tool = agent.history.filter((m) => m.role === "tool").map((m) => m.content as string);
  expect(tool[0]).toContain("Maxx hint: `nosuchpython3` is not installed or not on PATH.");
  const md = await Bun.file(join(dir, "MAXX.md")).text();
  expect(md).toContain("- Use `echo` instead of `nosuchpython3` here");
  expect(md).toContain("- The app lives in web/.");
  expect(log.some((l) => l.startsWith("note (noted in MAXX.md"))).toBe(true);
  // Next session, the lessons are in the system prompt.
  await agent.init();
  expect((agent.history[0]!.content as string)).toContain("The app lives in web/.");
});

test("plan and memory can be switched off", async () => {
  const { agent } = await setup({ plan: false, memory: false });
  script = [{ text: "hi" }];
  await agent.send("hello");
  const names = requests.at(-1).tools.map((t: any) => t.function.name);
  expect(names).not.toContain("plan");
  expect(names).not.toContain("remember");
  expect(requests.at(-1).messages[0].content).not.toContain("call plan");
});
