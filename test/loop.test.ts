import { afterAll, expect, test } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Agent, type AgentIO } from "../src/loop.ts";
import { Permissions } from "../src/permissions.ts";

// A scripted fake of LM Studio's streaming chat endpoint.
type Reply = { text?: string; tool?: { name: string; args: object } };
let script: Reply[] = [];
const requests: any[] = [];

const server = Bun.serve({
  port: 0,
  async fetch(req) {
    requests.push(await req.json());
    const r = script.shift() ?? { text: "done" };
    const chunks: object[] = [];
    if (r.text) for (const piece of r.text.match(/.{1,8}/gs) ?? []) chunks.push({ choices: [{ delta: { content: piece } }] });
    if (r.tool) {
      const args = JSON.stringify(r.tool.args);
      chunks.push({ choices: [{ delta: { tool_calls: [{ index: 0, id: "call_1", function: { name: r.tool.name, arguments: "" } }] } }] });
      // Split arguments across deltas, the way real servers stream them.
      for (let i = 0; i < args.length; i += 10) chunks.push({ choices: [{ delta: { tool_calls: [{ index: 0, function: { arguments: args.slice(i, i + 10) } }] } }] });
    }
    const body = chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join("") + "data: [DONE]\n\n";
    return new Response(body, { headers: { "content-type": "text/event-stream" } });
  },
});
afterAll(() => server.stop());

function fakeIO(answers: ("yes" | "no" | "always")[] = []) {
  const log: string[] = [];
  const io: AgentIO = {
    token: () => {},
    toolStart: (n) => log.push(`start ${n}`),
    toolEnd: (n, r) => log.push(`end ${n}: ${r.split("\n")[0]}`),
    note: (t) => log.push(`note ${t}`),
    ask: async (q) => (log.push(`ask ${q}`), answers.shift() ?? "no"),
  };
  return { io, log };
}

async function workspace() {
  const dir = await mkdtemp(join(tmpdir(), "maxx-loop-"));
  await Bun.write(join(dir, "app.ts"), "const port = 3000;\nconsole.log(port);\n");
  Bun.spawnSync(["git", "init", "-q"], { cwd: dir });
  return dir;
}

async function agentIn(dir: string, answers: ("yes" | "no" | "always")[] = []) {
  const { io, log } = fakeIO(answers);
  const llm = { baseURL: `http://localhost:${server.port}/v1`, model: "fake" };
  const agent = await new Agent({ llm, cwd: dir, permissions: await new Permissions(dir, "ask").load() }, io).init();
  return { agent, log };
}

test("read, edit with approval, then answer", async () => {
  const dir = await workspace();
  script = [
    { tool: { name: "read_file", args: { path: "app.ts" } } },
    { tool: { name: "edit_file", args: { path: "app.ts", old_string: "const port = 3000;", new_string: "const port = 8080;" } } },
    { text: "Changed the port to 8080." },
  ];
  const { agent, log } = await agentIn(dir, ["yes"]);
  const answer = await agent.send("use port 8080");

  expect(answer).toBe("Changed the port to 8080.");
  expect(await Bun.file(join(dir, "app.ts")).text()).toContain("8080");
  expect(log).toContain("ask Allow edit_file?");
  expect(agent.checkpoints.list()).toHaveLength(1);
  // The model saw the file contents as a tool result.
  const last = requests.at(-1);
  expect(last.messages.some((m: any) => m.role === "tool" && m.content.includes("const port = 3000;"))).toBe(true);
  expect(last.tools.map((t: any) => t.function.name)).toContain("bash");
});

test("denied calls and bad arguments go back to the model as errors", async () => {
  const dir = await workspace();
  script = [
    { tool: { name: "bash", args: { command: "rm -rf build" } } },
    { tool: { name: "read_file", args: { file: "app.ts" } } },
    { text: "ok" },
  ];
  const { agent } = await agentIn(dir, ["no"]);
  await agent.send("clean up");
  const tools = agent.history.filter((m) => m.role === "tool").map((m) => m.content);
  expect(tools[0]).toBe("user denied this tool call");
  expect(tools[1]).toContain("invalid arguments for read_file");
});

test("tool calls written as text are rescued", async () => {
  const dir = await workspace();
  script = [
    { text: '<tool_call>{"name": "read_file", "arguments": {"path": "app.ts"}}</tool_call>' },
    { text: "The port is 3000." },
  ];
  const { agent, log } = await agentIn(dir);
  expect(await agent.send("what port?")).toBe("The port is 3000.");
  expect(log.some((l) => l.startsWith("note (recovered 1 tool call"))).toBe(true);
  expect(log).toContain("start read_file");
});

test("the same call with the same result gets a nudge, then ends the turn", async () => {
  const dir = await workspace();
  const same = { tool: { name: "list_files", args: { pattern: "*.ts" } } };
  script = [same, same, same, same, same, { text: "should not get here" }];
  const { agent } = await agentIn(dir);
  const answer = await agent.send("make a game");

  expect(answer).toStartWith("Stopped: the model kept repeating the same tool call");
  const tools = agent.history.filter((m) => m.role === "tool").map((m) => m.content as string);
  expect(tools).toHaveLength(5);
  expect(tools[1]).not.toContain("Note from Maxx");
  expect(tools[2]).toContain("this exact list_files call 3 times");
  script = [];
});

test("resending an edit that already landed is stopped even when results alternate", async () => {
  const dir = await workspace();
  const edit = { tool: { name: "edit_file", args: { path: "app.ts", old_string: "const port = 3000;", new_string: "const port = 8080;" } } };
  const read = { tool: { name: "read_file", args: { path: "app.ts" } } };
  script = [edit, edit, read, edit, read, edit, read, edit, { text: "should not get here" }];
  const { agent } = await agentIn(dir, ["always"]);
  const answer = await agent.send("use port 8080");

  expect(answer).toStartWith("Stopped: the model kept repeating the same tool call");
  const tools = agent.history.filter((m) => m.role === "tool").map((m) => m.content as string);
  expect(tools[0]).toContain("It now reads:");
  expect(tools[1]).toStartWith("no change: app.ts already contains new_string");
  expect(tools.at(-1)).toContain("this exact edit_file call 5 times");
  script = [];
});
