import { afterAll, expect, test } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Agent, type AgentIO, type AgentOptions } from "../src/loop.ts";
import { Permissions } from "../src/permissions.ts";
import { agentDefaults, runGoal, taskPrompt, type Board } from "../src/agentmode.ts";
import { afterRun, builtAlready, doneRecord, noteDone, planNudge, sameCheck, summaryChars } from "../src/redo.ts";

// Maxx building the app twice: the four causes, each with its fix.
type Reply = { text?: string; tool?: { name: string; args: object } };
let script: Reply[] = [];
const requests: any[] = [];
const server = Bun.serve({
  port: 0,
  async fetch(req) {
    const body = await req.json();
    requests.push(body);
    // The compaction summarizer gets its own answer, outside the script.
    const summarizing = String(body.messages?.[0]?.content ?? "").startsWith("You summarize");
    const r = summarizing ? { text: "The user wants a game. Not much else happened." } : (script.shift() ?? { text: "DONE" });
    const chunks: object[] = [];
    if (r.text) chunks.push({ choices: [{ delta: { content: r.text } }] });
    if (r.tool) chunks.push({ choices: [{ delta: { tool_calls: [{ index: 0, id: `call_${requests.length}`, function: { name: r.tool.name, arguments: JSON.stringify(r.tool.args) } }] } }] });
    return new Response(chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join("") + "data: [DONE]\n\n", { headers: { "content-type": "text/event-stream" } });
  },
});
afterAll(() => server.stop());

async function setup(opts: Partial<AgentOptions> = {}, files: Record<string, string> = {}) {
  const dir = await mkdtemp(join(tmpdir(), "maxx-redo-"));
  Bun.spawnSync(["git", "init", "-q"], { cwd: dir });
  for (const [p, c] of Object.entries(files)) await Bun.write(join(dir, p), c);
  const log: string[] = [];
  const io: AgentIO = { token: () => {}, toolStart: (n, a) => log.push(`start ${n} ${a}`), toolEnd: () => {}, note: (t) => log.push(`note ${t}`), ask: async () => "yes" };
  const llm = { baseURL: `http://localhost:${server.port}/v1`, model: "fake" };
  const agent = await new Agent({ llm, cwd: dir, permissions: await new Permissions(dir, "yolo").load(), vision: { mode: "off" }, ...opts }, io).init();
  return { dir, agent, log };
}
const write = (path: string, content = "x") => ({ tool: { name: "write_file", args: { path, content } } });
const run = (command: string) => ({ tool: { name: "bash", args: { command } } });

test("sameCheck: the model's own build is Maxx's check, in its usual spellings", () => {
  const gradle = "./gradlew assembleDebug --console=plain -q";
  expect(sameCheck("./gradlew assembleDebug", gradle)).toBe(true);
  expect(sameCheck(".\\gradlew.bat assembleDebug --stacktrace", ".\\gradlew.bat assembleDebug --console=plain -q")).toBe(true);
  expect(sameCheck("gradlew.bat assembleDebug", gradle)).toBe(true);
  expect(sameCheck("npm install && npm run build", "npm run build")).toBe(true);
  expect(sameCheck("cd . && npm run build 2>&1", "npm run build")).toBe(true);
  // Another folder, another task, a pipe that hides the exit code: not the check.
  expect(sameCheck("cd app && npm run build", "npm run build")).toBe(false);
  expect(sameCheck("npm run build | tail -5", "npm run build")).toBe(false);
  expect(sameCheck("npm run lint", "npm run build")).toBe(false);
  expect(sameCheck("./gradlew assembleRelease", gradle)).toBe(false);
});

test("afterRun keeps a passing build while only looking commands follow it", () => {
  let runs = afterRun([], "npm run build", true);
  runs = afterRun(runs, "ls dist", true);
  runs = afterRun(runs, "cat dist/index.html", false);
  expect(builtAlready(runs, "npm run build")).toBe("npm run build");
  // A command that may write files, or a build that failed, starts over.
  expect(builtAlready(afterRun(runs, "npm install left-pad", true), "npm run build")).toBeNull();
  expect(builtAlready(afterRun(runs, "npm run build", false), "npm run build")).toBeNull();
  expect(builtAlready(afterRun(runs, "echo hi > notes.txt", true), "npm run build")).toBeNull();
});

test("the done record, the plan nudge and the summarizer's budget", () => {
  let d = noteDone([], 1, "write_file a.js");
  d = noteDone(d, 1, "bash npm run build");
  d = noteDone(d, 2, "write_file a.js");
  expect(d.map((x) => x.text)).toEqual(["bash npm run build", "write_file a.js"]);
  const r = doneRecord(d, "make a snake game");
  expect(r).toContain("- write_file a.js");
  expect(r).toContain("Do not build or write it again");
  expect(r).toContain('"""make a snake game"""');
  expect(doneRecord([], "")).toBe("");
  const n = planNudge([2], "1. [x] a\n2. [ ] b");
  expect(n).toStartWith("Maxx: plan step 2 not ticked yet.");
  expect(n).toContain("do not do it again");
  expect(n).not.toContain("Do the next step now");
  expect(summaryChars(8192)).toBe(16384);
  expect(summaryChars(200_000)).toBe(60_000);
});

test("Maxx skips its build check when the model just ran that build and it passed", async () => {
  const { agent, log } = await setup({}, { "package.json": JSON.stringify({ scripts: { build: "echo built" } }) });
  script = [write("app.js", "console.log(1)\n"), run("npm run build"), run("ls"), { text: "Built the app." }];
  expect(await agent.send("make an app")).toBe("Built the app.");
  expect(log.some((t) => t.startsWith("note (skipped Maxx's build check: the model already ran `npm run build`"))).toBe(true);
  expect(log.some((l) => l.startsWith("start check"))).toBe(false);
  expect(agent.lastCheck?.ok).toBe(true);
});

test("Maxx still checks when the model changed a file after its build", async () => {
  const { agent, log } = await setup({}, { "package.json": JSON.stringify({ scripts: { build: "echo built" } }) });
  script = [write("app.js", "1\n"), run("npm run build"), write("app.js", "2\n"), { text: "Done." }];
  await agent.send("make an app");
  expect(log.some((l) => l.startsWith("start check"))).toBe(true);
  expect(log.some((l) => l.includes("skipped Maxx's build check"))).toBe(false);
});

test("a compaction keeps Maxx's own record of finished work and the request", async () => {
  const { agent } = await setup({ contextWindow: 2500 });
  const big = "// filler\n".repeat(120);
  script = [write("a.js", big), write("b.js", big), write("c.js", big), write("d.js", big), write("e.js", big), { text: "All five files are written." }];
  await agent.send("write five files for my game");
  const summary = agent.history.find((m) => m.role === "user" && typeof m.content === "string" && m.content.startsWith("Summary of the earlier"));
  expect(summary).toBeTruthy();
  const text = summary!.content as string;
  expect(text).toContain("not a new request");
  expect(text).toContain("Maxx's own record of what already worked");
  expect(text).toContain("- write_file a.js");
  expect(text).toContain('"""write five files for my game"""');
});

test("Agent mode keeps a task that ran out of steps and lets it finish, instead of building it again", async () => {
  const { dir, agent } = await setup({ fixTries: 0 });
  const notes: string[] = [];
  (agent.io as any).note = (t: string) => notes.push(t);
  script = [
    { text: "1. Build the game | check: the files are there" },
    write("a.js"),
    write("b.js"),
    write("c.js"),
    { text: "DONE, the game is built" },
  ];
  const b = await runGoal(agent, "build a game", { board: () => {} }, { settings: { ...agentDefaults(16384), stepsPerTask: 3, judge: false, briefing: false, mapTokens: 0 } });
  expect(b.state).toBe("done");
  expect(b.tasks[0]!.tries).toBe(1);
  for (const f of ["a.js", "b.js", "c.js"]) expect(await Bun.file(join(dir, f)).exists()).toBe(true);
  expect(notes.some((n) => n.includes("used its 3 steps; the work is kept"))).toBe(true);
  expect(notes.some((n) => n.includes("rewound"))).toBe(false);
  const last = requests.at(-1).messages.findLast((m: any) => m.role === "user");
  expect(JSON.stringify(last.content)).toContain("Do not start over");
});

test("Agent mode still rewinds a try that is out of steps twice over", async () => {
  const { dir, agent } = await setup({ fixTries: 0 });
  script = [{ text: "1. Build the game" }, write("a.js"), write("b.js"), write("c.js"), write("d.js"), write("e.js"), write("f.js")];
  const b = await runGoal(agent, "build a game", { board: () => {} }, { settings: { ...agentDefaults(16384), stepsPerTask: 3, tries: 1, judge: false, briefing: false, mapTokens: 0 } });
  expect(b.state).toBe("stuck");
  expect(await Bun.file(join(dir, "a.js")).exists()).toBe(false);
});

test("later tasks see what earlier ones finished, and are told not to redo it", () => {
  const b: Board = { goal: "game", state: "running", current: 1, tasks: [{ text: "make the game", check: "", status: "done", tries: 1, answer: "game.html with movement and score" }, { text: "add a score", check: "", status: "doing", tries: 1 }] };
  const p = taskPrompt(b, "", "");
  expect(p).toContain("[x] 1. make the game (done: game.html with movement and score)");
  expect(p).toContain("do not build or write them again");
});
