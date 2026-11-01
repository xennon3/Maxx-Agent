import { afterAll, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { mkdtemp, readdir, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Agent, type AgentIO } from "../src/loop.ts";
import { Permissions } from "../src/permissions.ts";
import { agentDefaults } from "../src/agentmode.ts";
import { cleanCrew, crewBrief, crewSettings, parseCrewTasks, runCrew, type CrewBoard } from "../src/crew.ts";
import { Gate, probeParallel, slotsFrom } from "../src/gate.ts";

process.env.MAXX_HOME = await mkdtemp(join(tmpdir(), "maxx-crew-home-"));

// A fake LM Studio that answers by task: each worker's request says which task
// it is on ("Do task N now"), so the replies don't depend on who asks first.
type Reply = { text?: string; tool?: { name: string; args: object } };
let plan = "";
let byTask: Record<string, Reply[]> = {};
let inFlight = 0;
let maxInFlight = 0;
let delay = 60;
let serial = false;
let queue: Promise<unknown> = Promise.resolve();
const seen: string[] = [];
const server = Bun.serve({
  port: 0,
  async fetch(req) {
    const body = (await req.json()) as any;
    const run = async () => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await Bun.sleep(delay);
      inFlight--;
    };
    if (serial) await (queue = queue.then(run));
    else await run();
    if (!body.stream) return Response.json({ choices: [{ message: { content: "1 2 3" } }] });
    const sys = String(body.messages[0].content);
    const texts = body.messages.filter((m: any) => m.role === "user").map((m: any) => (typeof m.content === "string" ? m.content : m.content.map((p: any) => p.text ?? "").join("")));
    const last = texts.at(-1) ?? "";
    let r: Reply;
    if (sys.startsWith("You plan work for a crew")) r = { text: plan };
    else {
      const first = texts.find((t: string) => /Do task \d+ now|tasks are all merged/.test(t)) ?? "";
      const key = /tasks are all merged/.test(first) ? "final" : `t${first.match(/Do task (\d+) now/)?.[1]}`;
      const k = /clashes with work/.test(last) ? `${key}-resolve` : key;
      seen.push(k);
      r = byTask[k]?.shift() ?? { text: "DONE" };
    }
    const chunks: object[] = [];
    if (r.text) chunks.push({ choices: [{ delta: { content: r.text } }] });
    if (r.tool) chunks.push({ choices: [{ delta: { tool_calls: [{ index: 0, id: `c${Math.random()}`, function: { name: r.tool.name, arguments: JSON.stringify(r.tool.args) } }] } }] });
    return new Response(chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join("") + "data: [DONE]\n\n", { headers: { "content-type": "text/event-stream" } });
  },
});
afterAll(() => server.stop());

const write = (path: string, content: string): Reply => ({ tool: { name: "write_file", args: { path, content } } });

async function setup(git = true) {
  const dir = await mkdtemp(join(tmpdir(), "maxx-crew-"));
  await Bun.write(join(dir, "notes.txt"), "line one\nline two\nline three\n");
  if (git) {
    Bun.spawnSync(["git", "init", "-q"], { cwd: dir });
    Bun.spawnSync(["git", "-c", "user.name=t", "-c", "user.email=t@t", "add", "-A"], { cwd: dir });
    Bun.spawnSync(["git", "-c", "user.name=t", "-c", "user.email=t@t", "commit", "-qm", "init"], { cwd: dir });
  }
  const log: string[] = [];
  const io: AgentIO = { token: () => {}, toolStart: () => {}, toolEnd: () => {}, note: (t) => log.push(t), ask: async () => "yes" };
  const permissions = await new Permissions(dir, "ask").load();
  const agent = await new Agent({ llm: { baseURL: `http://localhost:${server.port}/v1`, model: "fake" }, cwd: dir, permissions, vision: { mode: "off" }, fixTries: 0, contextWindow: 16384 }, io).init();
  return { dir, agent, log };
}

const settings = { ...agentDefaults(16384), judge: false, briefing: false, mapTokens: 0 };
const boards: CrewBoard[] = [];
const events = { board: (b: any) => boards.push(b) };

test("parseCrewTasks reads after: and files:, and only counts earlier tasks as needs", () => {
  const t = parseCrewTasks("Plan:\n1. Start from the web template | check: it opens | after: - | files: index.html, app.js\n2. Add the form | check: fields show | after: 1 | files: `index.html`\n3) Write a README | after: 1, 4 | files: README.md\n4. Loop | after: 4", 10);
  expect(t.map((x) => [x.id, x.text, x.after, x.touches])).toEqual([
    [1, "Start from the web template", [], ["index.html", "app.js"]],
    [2, "Add the form", [1], ["index.html"]],
    [3, "Write a README", [1], ["README.md"]],
    [4, "Loop", [], []],
  ]);
  expect(t[1]!.check).toBe("fields show");
  // Agent mode's plain plans still parse.
  expect(parseCrewTasks("1. Make the page | check: it shows\n2. Style it", 5).map((x) => x.check)).toEqual(["it shows", ""]);
});

test("crew settings are clamped, and models come as a list or a comma line", () => {
  expect(cleanCrew({ workers: 99, slots: "-2", models: "a, b,a", finalCheck: false, junk: 1 })).toEqual({ workers: 8, slots: 0, models: ["a", "b"], finalCheck: false });
  expect(crewSettings({ workers: 2 }).maxTasks).toBe(8);
});

test("the gate lets in as many as it has slots, queues the rest in order, and drops a stopped waiter", async () => {
  const g = new Gate("m", 1);
  const order: string[] = [];
  const a = await g.acquire();
  const queued: boolean[] = [];
  const pb = g.acquire(undefined, (q) => queued.push(q)).then((r) => (order.push("b"), r));
  const stop = new AbortController();
  const pc = g.acquire(stop.signal).catch((e) => (order.push(e.name), null));
  const pd = g.acquire().then((r) => (order.push("d"), r));
  expect(g.state).toEqual({ model: "m", slots: 1, busy: 1, waiting: 3 });
  stop.abort();
  await pc;
  a();
  (await pb)();
  (await pd)();
  expect(order).toEqual(["AbortError", "b", "d"]);
  expect(queued).toEqual([true, false]);
  expect(g.state.busy).toBe(0);
  g.resize(3);
  expect(g.state.slots).toBe(3);
});

test("the probe tells a server that queues from one that runs requests together", async () => {
  expect(slotsFrom(100, 310, 3)).toBe(1);
  expect(slotsFrom(100, 120, 3)).toBe(3);
  expect(slotsFrom(100, 190, 3)).toBe(2);
  const llm = { baseURL: `http://localhost:${server.port}/v1`, model: "fake" };
  serial = true;
  expect((await probeParallel(llm, 3)).slots).toBe(1);
  serial = false;
  expect((await probeParallel(llm, 3)).slots).toBe(3);
});

test("the crew runs independent tasks at the same time in worktrees and merges them into the folder", async () => {
  const { dir, agent, log } = await setup();
  plan = "1. Write a | after: - | files: a.txt\n2. Write b | after: 1 | files: b.txt\n3. Write c | after: 1 | files: c.txt";
  byTask = {
    t1: [write("a.txt", "A\n"), { text: "DONE wrote a" }],
    t2: [write("b.txt", "B\n"), { text: "DONE wrote b" }],
    t3: [write("c.txt", "C\n"), { text: "DONE wrote c" }],
    final: [{ text: "DONE the pieces fit" }],
  };
  maxInFlight = 0;
  boards.length = 0;
  const b = (await runCrew(agent, "write three files", events, { crew: crewSettings({ workers: 2, slots: 2 }), settings })) as CrewBoard;
  expect(b.state).toBe("done");
  expect(b.tasks.map((t) => t.status)).toEqual(["done", "done", "done"]);
  for (const [f, c] of [["a.txt", "A\n"], ["b.txt", "B\n"], ["c.txt", "C\n"]]) expect(await readFile(join(dir, f!), "utf8")).toBe(c!);
  // Tasks 2 and 3 only need task 1, so two workers had them at once. (Who reaches
  // the model first depends on how fast git makes worktrees, slow on Windows.)
  expect(boards.some((x) => x.tasks.filter((t) => t.id > 1 && t.worker && !["ready", "waiting", "done"].includes(t.status)).length === 2)).toBe(true);
  expect(new Set(b.tasks.slice(1).map((t) => t.worker)).size).toBe(2);
  // The later workers read what was handed in before them.
  expect(b.log[0]).toBe("#1 Ada: wrote a");
  expect(b.log.at(-1)).toContain("final check");
  expect(log.some((l) => l.includes("merged #2"))).toBe(true);
  // The worktrees are gone and the user's branch didn't move.
  expect(Bun.spawnSync(["git", "worktree", "list"], { cwd: dir }).stdout.toString().trim().split("\n")).toHaveLength(1);
  expect(Bun.spawnSync(["git", "log", "--oneline"], { cwd: dir }).stdout.toString().trim().split("\n")).toHaveLength(1);
  expect(boards.some((x) => x.workers.some((w) => w.state === "thinking"))).toBe(true);
});

test("with one slot the workers take turns at the model, and the board shows who is queued", async () => {
  const { dir, agent } = await setup();
  plan = "1. Write b | files: b.txt\n2. Write c | files: c.txt";
  byTask = { t1: [write("b.txt", "B\n"), { text: "DONE" }], t2: [write("c.txt", "C\n"), { text: "DONE" }] };
  maxInFlight = 0;
  boards.length = 0;
  // Slow answers, so the second worker reaches the gate while the first holds it, however long its worktree took.
  delay = 800;
  const b = (await runCrew(agent, "two files", events, { crew: crewSettings({ workers: 2, slots: 1, finalCheck: false }), settings }).finally(() => (delay = 60))) as CrewBoard;
  expect(b.state).toBe("done");
  expect(maxInFlight).toBe(1);
  expect(boards.some((x) => x.workers.some((w) => w.state === "queued"))).toBe(true);
  expect(existsSync(join(dir, "b.txt")) && existsSync(join(dir, "c.txt"))).toBe(true);
});

test("a clash is sorted out by the later worker in its own copy, then merged", async () => {
  const { dir, agent, log } = await setup();
  // No files listed, so both run at once and both change notes.txt's middle line.
  plan = "1. Change line two to red\n2. Change line two to blue";
  byTask = {
    t1: [write("notes.txt", "line one\nRED\nline three\n"), { text: "DONE" }],
    t2: [write("notes.txt", "line one\nBLUE\nline three\n"), { text: "DONE" }],
    "t1-resolve": [write("notes.txt", "line one\nRED and BLUE\nline three\n"), { text: "DONE merged" }],
    "t2-resolve": [write("notes.txt", "line one\nRED and BLUE\nline three\n"), { text: "DONE merged" }],
  };
  const b = (await runCrew(agent, "colors", events, { crew: crewSettings({ workers: 2, slots: 2, finalCheck: false }), settings })) as CrewBoard;
  expect(b.state).toBe("done");
  expect(await readFile(join(dir, "notes.txt"), "utf8")).toBe("line one\nRED and BLUE\nline three\n");
  expect(seen.some((k) => k.endsWith("-resolve"))).toBe(true);
  expect(log.some((l) => l.includes("clashes with merged work in notes.txt"))).toBe(true);
});

test("a failed task fails the ones that need it; the rest still lands, in a folder without git", async () => {
  const { dir, agent } = await setup(false);
  plan = "1. Write a | files: a.txt\n2. Write b on top of a | after: 1 | files: b.txt\n3. Write c | files: c.txt";
  byTask = { t1: [{ text: "STUCK: no idea" }, { text: "STUCK: still no idea" }], t3: [write("c.txt", "C\n"), { text: "DONE" }] };
  const b = (await runCrew(agent, "files", events, { crew: crewSettings({ workers: 3, slots: 3, finalCheck: false }), settings: { ...settings, tries: 2 } })) as CrewBoard;
  expect(b.state).toBe("stuck");
  expect(b.tasks.map((t) => t.status)).toEqual(["failed", "failed", "done"]);
  expect(b.tasks[1]!.note).toBe("needs #1, which failed");
  expect(await readFile(join(dir, "c.txt"), "utf8")).toBe("C\n");
  expect(existsSync(join(dir, "a.txt"))).toBe(false);
  expect(b.note).toContain("#1, #2 failed");
});

test("changes the user made while the crew worked are kept", async () => {
  const { dir, agent } = await setup();
  plan = "1. Write a | files: a.txt";
  byTask = { t1: [write("a.txt", "A\n"), { text: "DONE" }] };
  const p = runCrew(agent, "a", { board: (x: any) => x.state === "running" && Bun.write(join(dir, "mine.txt"), "mine\n") }, { crew: crewSettings({ workers: 1, slots: 1 }), settings });
  const b = (await p) as CrewBoard;
  expect(b.state).toBe("done");
  expect(await readFile(join(dir, "mine.txt"), "utf8")).toBe("mine\n");
  expect(await readFile(join(dir, "a.txt"), "utf8")).toBe("A\n");
});

test("the brief tells a worker who it is and what the others are doing", () => {
  const b: CrewBoard = {
    kind: "crew", goal: "g", state: "running", models: [], started: 0, log: ["#1 Ada: template ready"],
    workers: [{ name: "Ada", model: "m", state: "working", done: 1 }, { name: "Bo", model: "m", state: "working", done: 0 }],
    tasks: [
      { id: 1, text: "template", check: "", after: [], touches: [], status: "done", tries: 1 },
      { id: 2, text: "form", check: "", after: [1], touches: ["app.js"], status: "doing", tries: 1, worker: "Ada" },
      { id: 3, text: "readme", check: "", after: [1], touches: [], status: "doing", tries: 1, worker: "Bo" },
    ],
  };
  const text = crewBrief(b, b.tasks[1]!, b.workers[0]!);
  expect(text).toContain("you are Ada, one of 2 Maxx workers");
  expect(text).toContain("#3 readme (Bo)");
  expect(text).toContain("touch: app.js");
  expect(text).toContain("#1 Ada: template ready");
});

test("stopping keeps the folder as it was and cleans up the worktrees", async () => {
  const { dir, agent } = await setup();
  plan = "1. Write a | files: a.txt";
  delay = 300;
  byTask = { t1: [write("a.txt", "A\n"), { text: "DONE" }] };
  const stop = new AbortController();
  setTimeout(() => stop.abort(), 500);
  const b = (await runCrew(agent, "a", events, { crew: crewSettings({ workers: 1, slots: 1 }), settings, signal: stop.signal })) as CrewBoard;
  delay = 60;
  expect(b.state).toBe("stopped");
  expect(existsSync(join(dir, "a.txt"))).toBe(false);
  expect(await readdir(join(process.env.MAXX_HOME!, "crew")).then(async (ps) => (await Promise.all(ps.map((p) => readdir(join(process.env.MAXX_HOME!, "crew", p))))).flat())).toEqual([]);
});
