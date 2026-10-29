import { afterAll, expect, test } from "bun:test";
import { mkdtemp, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Agent, type AgentIO } from "../src/loop.ts";
import { Permissions } from "../src/permissions.ts";
import { Checkpoints } from "../src/checkpoint.ts";
import { agentDefaults, agentSettings, cleanSettings, outcome, parseTasks, runGoal, taskPrompt, type Board } from "../src/agentmode.ts";
import { formatMap, projectMap, symbolsOf } from "../src/projectmap.ts";
import { findBrowser, isUiFile, parseVerdict, pickSurface } from "../src/judge.ts";

// A scripted fake of LM Studio's streaming chat endpoint (see loop.test.ts).
type Reply = { text?: string; tool?: { name: string; args: object } };
let script: Reply[] = [];
const requests: any[] = [];
const server = Bun.serve({
  port: 0,
  async fetch(req) {
    requests.push(await req.json());
    const r = script.shift() ?? { text: "DONE" };
    const chunks: object[] = [];
    if (r.text) chunks.push({ choices: [{ delta: { content: r.text } }] });
    if (r.tool) chunks.push({ choices: [{ delta: { tool_calls: [{ index: 0, id: `call_${requests.length}`, function: { name: r.tool.name, arguments: JSON.stringify(r.tool.args) } }] } }] });
    const body = chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join("") + "data: [DONE]\n\n";
    return new Response(body, { headers: { "content-type": "text/event-stream" } });
  },
});
afterAll(() => server.stop());

async function setup(git = true) {
  const dir = await mkdtemp(join(tmpdir(), "maxx-agentmode-"));
  await Bun.write(join(dir, "notes.txt"), "start\n");
  if (git) Bun.spawnSync(["git", "init", "-q"], { cwd: dir });
  const log: string[] = [];
  const io: AgentIO = { token: () => {}, toolStart: (n) => log.push(`start ${n}`), toolEnd: () => {}, note: (t) => log.push(`note ${t}`), ask: async (q) => (log.push(`ask ${q}`), "no") };
  const permissions = await new Permissions(dir, "ask").load();
  const agent = await new Agent({ llm: { baseURL: `http://localhost:${server.port}/v1`, model: "fake" }, cwd: dir, permissions, vision: { mode: "off" }, fixTries: 0, contextWindow: 16384 }, io).init();
  return { dir, agent, log, permissions };
}

const write = (path: string, content = "x") => ({ tool: { name: "write_file", args: { path, content } } });

test("parseTasks reads numbered lists with checks, in their many spellings", () => {
  const text = "<think>hmm</think>Here is the plan:\n1. Start from the web app template | check: index.html opens\n2) **Add a tip field** -- done when: the field shows\n- Style the page (check: it looks tidy)\n3. Ship it";
  expect(parseTasks(text, 10)).toEqual([
    { text: "Start from the web app template", check: "index.html opens" },
    { text: "Add a tip field", check: "the field shows" },
    { text: "Style the page", check: "it looks tidy" },
    { text: "Ship it", check: "" },
  ]);
  expect(parseTasks(text, 2)).toHaveLength(2);
  // No list markers at all: each line is a task.
  expect(parseTasks("Make the page\nAdd a button", 5).map((t) => t.text)).toEqual(["Make the page", "Add a button"]);
});

test("outcome: the model's word and the last check decide", () => {
  expect(outcome("DONE, the field is there", null).ok).toBe(true);
  expect(outcome("STUCK: gradle is missing", null)).toEqual({ ok: false, why: "the model is stuck: gradle is missing" });
  expect(outcome("Stopped: reached the step limit for one turn.", null).ok).toBe(false);
  expect(outcome("DONE", { ok: false, what: "`bun run build`", output: "error" })).toEqual({ ok: false, why: "`bun run build` still fails" });
});

test("budgets grow with the context window, and saved values are clamped", () => {
  const small = agentDefaults(16384), big = agentDefaults(131072);
  expect(small.stepsPerTask).toBeLessThan(big.stepsPerTask);
  expect(small.mapTokens).toBeLessThan(big.mapTokens);
  expect(cleanSettings({ tries: 99, stepsPerTask: "40", judge: false, junk: 1, maxTasks: "" })).toEqual({ tries: 5, stepsPerTask: 40, judge: false });
  expect(agentSettings(16384, { tries: 4 }).tries).toBe(4);
});

test("the task prompt shows the board, the check and why the last try was rewound", () => {
  const b: Board = { goal: "tip app", state: "running", current: 1, tasks: [{ text: "template", check: "", status: "done", tries: 1 }, { text: "add field", check: "field shows", status: "doing", tries: 2 }] };
  const p = taskPrompt(b, "", "the build failed");
  expect(p).toStartWith("Maxx: Agent mode, task 2 of 2.");
  expect(p).toContain("[x] 1. template\n[>] 2. add field");
  expect(p).toContain("Done when: field shows");
  expect(p).toContain("failed (the build failed)");
});

test("snapshots rewind changed and new files, with or without a git repository", async () => {
  for (const git of [true, false]) {
    const dir = await mkdtemp(join(tmpdir(), "maxx-rewind-"));
    if (git) Bun.spawnSync(["git", "init", "-q"], { cwd: dir });
    await Bun.write(join(dir, "a.txt"), "one");
    const c = new Checkpoints(dir, "s");
    const sha = (await c.snapshot("before"))!;
    expect(sha).toBeTruthy();
    await Bun.write(join(dir, "a.txt"), "two");
    await Bun.write(join(dir, "src", "b.txt"), "b");
    expect((await c.changed(sha)).sort()).toEqual(["a.txt", "src/b.txt"]);
    const r = await c.rewind(sha);
    expect(r.ok).toBe(true);
    expect(await Bun.file(join(dir, "a.txt")).text()).toBe("one");
    expect(await readdir(dir)).not.toContain("src");
  }
});

test("project map: symbols per language, cut to the budget", async () => {
  expect(symbolsOf("a.ts", "export function go() {}\nconst x = 1;\nconst add = (a, b) => a + b;\nexport class Game {}\n")).toEqual(["go()", "add()", "Game"]);
  expect(symbolsOf("main.py", "def main():\n    def inner(): pass\nclass App:\n")).toEqual(["main()", "App"]);
  expect(symbolsOf("MainActivity.kt", "class MainActivity : ComponentActivity() {\n@Composable\nfun Greeting(name: String) {}\nprivate fun helper() {}\n")).toEqual(["MainActivity", "Greeting()@", "helper()"]);
  expect(symbolsOf("index.html", "<title>Tips</title><div id=\"total\"></div>")).toEqual(['"Tips"', "#total"]);
  const dir = await mkdtemp(join(tmpdir(), "maxx-map-"));
  await Bun.write(join(dir, "app.js"), "export function start() {}\n");
  await Bun.write(join(dir, "node_modules", "x", "index.js"), "export function hidden() {}\n");
  const map = await projectMap(dir, 500);
  expect(map).toContain("app.js 27B: start()");
  expect(map).not.toContain("hidden");
  const many = Array.from({ length: 200 }, (_, i) => ({ path: `src/file${i}.ts`, size: 100, symbols: ["a()", "b()"] }));
  const cut = formatMap(many, 300);
  expect(cut.length).toBeLessThanOrEqual(1200 + 80);
  expect(cut).toMatch(/more files/);
});

test("the judge's verdict, and when there is something to screenshot", async () => {
  expect(parseVerdict("PASS")).toEqual({ pass: true, why: "looks right" });
  expect(parseVerdict("<think>x</think>**FAIL:** the button is cut off")).toEqual({ pass: false, why: "the button is cut off" });
  expect(parseVerdict("It looks fine to me").pass).toBe(true);
  expect(isUiFile("index.html")).toBe(true);
  expect(isUiFile("app/src/main/res/layout/main.xml")).toBe(true);
  expect(isUiFile("server.py")).toBe(false);
  expect(await pickSurface({ cwd: "/", changed: ["server.py"], android: false, browser: "/x" })).toBeNull();
  const dir = await mkdtemp(join(tmpdir(), "maxx-surface-"));
  await Bun.write(join(dir, "index.html"), "<p>hi</p>");
  expect(await pickSurface({ cwd: dir, changed: ["style.css"], android: false, browser: null })).toBeNull();
  const s = await pickSurface({ cwd: dir, changed: ["style.css"], android: false, browser: "/usr/bin/chromium", previewUrl: (p) => `http://preview/${p}` });
  expect(s?.kind).toBe("web");
  expect(s?.label).toContain("index.html");
  const win = { ProgramFiles: "C:\\PF", "ProgramFiles(x86)": "C:\\PF86" } as NodeJS.ProcessEnv;
  expect(findBrowser(win, (p) => p.endsWith("msedge.exe") && p.startsWith("C:\\PF86"), () => null, "win32")).toContain("msedge.exe");
  expect(findBrowser({}, () => false, () => null, "linux")).toBeNull();
});

test("runGoal plans, runs each task, rewinds a failed try and retries it", async () => {
  const { dir, agent, log, permissions } = await setup();
  const boards: Board[] = [];
  script = [
    { text: "1. Write the notes | check: notes.txt says hello\n2. Add the readme | check: README.md exists" },
    write("notes.txt", "hello\n"),
    { text: "DONE" },
    write("wrong.txt", "oops"),
    { text: "STUCK: I wrote the wrong file" },
    write("README.md", "# hi\n"),
    { text: "DONE, the readme is there" },
  ];
  const b = await runGoal(agent, "set up the notes", { board: (x) => boards.push(x) }, { settings: { ...agentDefaults(16384), judge: false } });
  expect(b.state).toBe("done");
  expect(b.tasks.map((t) => [t.status, t.tries])).toEqual([["done", 1], ["done", 2]]);
  expect(await Bun.file(join(dir, "notes.txt")).text()).toBe("hello\n");
  expect(await Bun.file(join(dir, "README.md")).exists()).toBe(true);
  // The failed try was rewound, so its file is gone.
  expect(await Bun.file(join(dir, "wrong.txt")).exists()).toBe(false);
  // Edits went through without asking, and the mode is back to ask afterwards.
  expect(log.some((l) => l.startsWith("ask"))).toBe(false);
  expect(permissions.mode).toBe("ask");
  expect(boards[0]!.state).toBe("planning");
  expect(boards.some((x) => x.tasks[1]?.note?.includes("rewound"))).toBe(true);
  // The retry was told why the first try was rewound.
  const retry = requests.at(-2).messages.findLast((m: any) => m.role === "user");
  expect(JSON.stringify(retry.content)).toContain("Do not repeat that approach");
  expect(agent.board).toBe(b);
});

test("runGoal stops when a task still fails after its tries, with the files rewound", async () => {
  const { dir, agent } = await setup(false);
  script = [{ text: "1. Do the thing | check: it works" }, write("half.txt", "half"), { text: "STUCK: no idea" }];
  const b = await runGoal(agent, "do the thing", { board: () => {} }, { settings: { ...agentDefaults(16384), tries: 1, judge: false, mapTokens: 0 } });
  expect(b.state).toBe("stuck");
  expect(b.tasks[0]!.status).toBe("failed");
  expect(b.note).toContain("Stuck on task 1 after 1 try: the model is stuck: no idea");
  expect(await Bun.file(join(dir, "half.txt")).exists()).toBe(false);
  expect(await Bun.file(join(dir, "notes.txt")).text()).toBe("start\n");
});

test("an unparseable plan becomes one task: the goal itself", async () => {
  const { agent } = await setup();
  script = [{ text: " " }, { text: "DONE" }];
  const b = await runGoal(agent, "say hi", { board: () => {} }, { settings: { ...agentDefaults(16384), judge: false } });
  expect(b.tasks.map((t) => t.text)).toEqual(["say hi"]);
  expect(b.state).toBe("done");
});

const chromium = findBrowser() ?? (Bun.file("/opt/pw-browsers/chromium").size ? "/opt/pw-browsers/chromium" : null);
test.skipIf(!chromium)("the screenshot judge sends a FAIL back as a fix, then passes", async () => {
  const { dir, agent } = await setup();
  const native = await new Agent({ llm: agent.llm, cwd: dir, permissions: agent.permissions, vision: { mode: "native" }, fixTries: 0, contextWindow: 16384 }, { token() {}, toolStart() {}, toolEnd() {}, note() {}, ask: async () => "no" }).init();
  script = [
    { text: "1. Make the page | check: it says hello" },
    write("index.html", "<h1>helo</h1>"),
    { text: "DONE" },
    { text: "FAIL: the heading says helo, not hello" },
    write("index.html", "<h1>hello</h1>"),
    { text: "DONE" },
    { text: "PASS" },
  ];
  const shots: string[] = [];
  const b = await runGoal(native, "a page that says hello", { board: () => {}, image: (l) => shots.push(l) }, { settings: { ...agentDefaults(16384), mapTokens: 0 }, surfaces: { browser: chromium } });
  expect(b.state).toBe("done");
  expect(b.tasks[0]!.note).toBeUndefined();
  expect(shots).toEqual(["judge", "judge"]);
  const judged = requests.filter((r) => JSON.stringify(r.messages).includes("careful software tester"));
  expect(judged).toHaveLength(2);
  expect(JSON.stringify(judged[0].messages)).toContain("data:image/");
  expect(await Bun.file(join(dir, "index.html")).text()).toBe("<h1>hello</h1>");
}, 60_000);
