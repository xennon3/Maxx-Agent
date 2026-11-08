import { afterAll, expect, test } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Agent, type AgentIO, type AgentOptions } from "../src/loop.ts";
import { Permissions } from "../src/permissions.ts";
import { digestNote, errorDigest, moreSteps, peekedFiles, stepCap } from "../src/keepgoing.ts";
import { applyEdits, editFile } from "../src/tools/edit.ts";
import { STEP_LIMIT } from "../src/redo.ts";

// Maxx stopping at the step limit in the middle of fixing 42 compile errors.
type Reply = { text?: string; tool?: { name: string; args: object } };
let script: Reply[] | ((n: number) => Reply) = [];
const requests: any[] = [];
const server = Bun.serve({
  port: 0,
  async fetch(req) {
    const body = await req.json();
    requests.push(body);
    const summarizing = String(body.messages?.[0]?.content ?? "").startsWith("You summarize");
    const r = summarizing ? { text: "Summary." } : typeof script === "function" ? script(requests.length) : (script.shift() ?? { text: "Done." });
    const chunks: object[] = [];
    if (r.text) chunks.push({ choices: [{ delta: { content: r.text } }] });
    if (r.tool) chunks.push({ choices: [{ delta: { tool_calls: [{ index: 0, id: `call_${requests.length}`, function: { name: r.tool.name, arguments: JSON.stringify(r.tool.args) } }] } }] });
    return new Response(chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join("") + "data: [DONE]\n\n", { headers: { "content-type": "text/event-stream" } });
  },
});
afterAll(() => server.stop());

async function setup(opts: Partial<AgentOptions> = {}) {
  const dir = await mkdtemp(join(tmpdir(), "maxx-keep-"));
  Bun.spawnSync(["git", "init", "-q"], { cwd: dir });
  for (let i = 0; i < 40; i++) await Bun.write(join(dir, `f${i}.txt`), "x\n");
  const log: string[] = [];
  const io: AgentIO = { token: () => {}, toolStart: () => {}, toolEnd: () => {}, note: (t) => log.push(t), ask: async () => "yes" };
  const llm = { baseURL: `http://localhost:${server.port}/v1`, model: "fake" };
  const agent = await new Agent({ llm, cwd: dir, permissions: await new Permissions(dir, "yolo").load(), vision: { mode: "off" }, plan: false, memory: false, learn: false, fixTries: 0, ...opts }, io).init();
  return { dir, agent, log };
}

const KOTLIN = [
  "> Task :app:compileDebugKotlin FAILED",
  "e: file:///C:/Users/King/one-dj/app/src/main/java/com/example/onedj/audio/Sfx.kt:12:5 Type mismatch: inferred type is Double but Float was expected",
  "e: file:///C:/Users/King/one-dj/app/src/main/java/com/example/onedj/audio/Sfx.kt:40:9 Unresolved reference: TAU",
  "e: file:///C:/Users/King/one-dj/app/src/main/java/com/example/onedj/audio/Sfx.kt:41:9 Unresolved reference: TAU",
  "e: C:\\Users\\King\\one-dj\\app\\src\\main\\java\\com\\example\\onedj\\audio\\FxChain.kt: (7, 3): Unresolved reference: Voice",
  "e: file:///C:/Users/King/one-dj/app/src/main/java/com/example/onedj/ui/Ui.kt:3:1 Expecting member declaration",
  "FAILURE: Build failed with an exception.",
].join("\n");

test("errorDigest counts Kotlin, gcc/tsc and Rust errors per file", () => {
  const d = errorDigest(KOTLIN)!;
  expect(d.count).toBe(5);
  expect(d.files[0]).toEqual(["Sfx.kt", 3]);
  expect(d.files.map((f) => f[0]).sort()).toEqual(["FxChain.kt", "Sfx.kt", "Ui.kt"]);
  expect(errorDigest("src/a.ts(3,4): error TS2322: no\nsrc/a.ts:9:1 - error TS1005: x\nsrc/b.c:3:1: error: y")!.count).toBe(3);
  expect(errorDigest("error[E0308]: mismatched types\n  --> src/main.rs:4:5\n")!.files).toEqual([["main.rs", 1]]);
  expect(errorDigest("BUILD SUCCESSFUL in 3s")).toBeNull();
  // Gradle prints some errors twice; the same line counts once.
  expect(errorDigest(KOTLIN + "\n" + KOTLIN)!.count).toBe(5);
  const note = digestNote(d, 42);
  expect(note).toContain("5 build errors (down from 42");
  expect(note).toContain("Sfx.kt (3)");
  expect(note).toContain("edits:");
});

test("peekedFiles finds the files a sed/grep/cat looks at", () => {
  expect(peekedFiles(`cd one-dj && sed -n '30,50p' app/src/main/java/com/example/onedj/ads/Ads.kt && echo "== SFX" && sed -n '350,360p' app/x/Sfx.kt`)).toEqual(["ads.kt", "sfx.kt"]);
  expect(peekedFiles(`grep -n "TAU" app/src/Sfx.kt | head -3`)).toEqual(["sfx.kt"]);
  expect(peekedFiles("ls -la")).toEqual([]);
});

test("stepCap and moreSteps: more steps only while something changed lately", () => {
  expect(stepCap(50)).toBe(200);
  expect(stepCap(50, 0)).toBe(50);
  expect(stepCap(50, 120)).toBe(120);
  expect(moreSteps({ step: 50, limit: 50, cap: 200, lastProgress: 45 })).toBe(75);
  expect(moreSteps({ step: 50, limit: 50, cap: 200, lastProgress: 20 })).toBe(0);
  expect(moreSteps({ step: 50, limit: 50, cap: 200, lastProgress: -1 })).toBe(0);
  expect(moreSteps({ step: 190, limit: 190, cap: 200, lastProgress: 189 })).toBe(200);
  expect(moreSteps({ step: 200, limit: 200, cap: 200, lastProgress: 199 })).toBe(0);
});

test("edit_file takes several changes in one call, all or nothing", async () => {
  const src = "val a = 1.0\nval b = 2.0\nval c = TAU\n";
  const r = applyEdits(src, [
    { old_string: "val a = 1.0", new_string: "val a = 1f" },
    { old_string: "val b = 2.0", new_string: "val b = 2f" },
  ]);
  expect(r.ok && r.text).toBe("val a = 1f\nval b = 2f\nval c = TAU\n");
  const bad = applyEdits(src, [
    { old_string: "val a = 1.0", new_string: "val a = 1f" },
    { old_string: "nope", new_string: "x" },
  ]);
  expect(bad.ok).toBe(false);
  expect(!bad.ok && bad.error).toContain("change 2 of 2");

  const dir = await mkdtemp(join(tmpdir(), "maxx-edits-"));
  await Bun.write(join(dir, "Sfx.kt"), src);
  const out = await editFile.run({ path: "Sfx.kt", edits: [{ old_string: "val a = 1.0", new_string: "val a = 1f" }, { old_string: "val c = TAU", new_string: "val c = (2 * Math.PI).toFloat()" }] }, { cwd: dir } as any);
  expect(out).toContain("edited Sfx.kt (2 changes)");
  expect(await Bun.file(join(dir, "Sfx.kt")).text()).toBe("val a = 1f\nval b = 2.0\nval c = (2 * Math.PI).toFloat()\n");
  // The single old_string/new_string form still works.
  expect(await editFile.run({ path: "Sfx.kt", old_string: "val b = 2.0", new_string: "val b = 2f" }, { cwd: dir } as any)).toStartWith("edited Sfx.kt");
  // A failing batch leaves the file alone.
  expect(await editFile.run({ path: "Sfx.kt", edits: [{ old_string: "val b = 2f", new_string: "B" }, { old_string: "zzz", new_string: "y" }] }, { cwd: dir } as any)).toStartWith("error: change 2 of 2");
  expect(await Bun.file(join(dir, "Sfx.kt")).text()).toContain("val b = 2f");
});

test("a turn that keeps changing files runs past the first step limit, up to the cap", async () => {
  // Every step writes a new file: real progress, and never the same call twice.
  script = (n) => ({ tool: { name: "write_file", args: { path: `out/${n}.txt`, content: `step ${n}` } } });
  requests.length = 0;
  const { agent, log } = await setup({ maxSteps: 10, keepGoing: 30 });
  const answer = await agent.send("fix all the errors", undefined, { report: false });
  expect(answer).toBe(STEP_LIMIT);
  expect(requests.length).toBe(30);
  expect(log.filter((l) => l.startsWith("(used ")).length).toBe(1);
  expect(log.find((l) => l.startsWith("(used 10 steps"))).toContain("up to 30 of 30");
  // The model is told it has more steps, once, with the next request.
  const told = requests[10].messages.at(-1).content[0].text;
  expect(told).toContain("you have used 10 steps");
  expect(told).toContain("edits: [...]");
  expect(JSON.stringify(requests[11].messages)).not.toContain("you have used 10 steps");
});

test("a turn that only reads stops at the step limit as before", async () => {
  script = (n) => ({ tool: { name: "read_file", args: { path: `f${n % 40}.txt` } } });
  requests.length = 0;
  const { agent, log } = await setup({ maxSteps: 10, keepGoing: 30 });
  expect(await agent.send("look around", undefined, { report: false })).toBe(STEP_LIMIT);
  expect(requests.length).toBe(10);
  expect(log.some((l) => l.startsWith("(used "))).toBe(false);
});

test("a turn that stops changing things stops at the next limit", async () => {
  // 12 writes, then nothing but reading.
  script = (n) => (n <= 12 ? { tool: { name: "write_file", args: { path: `out/${n}.txt`, content: "x" } } } : { tool: { name: "read_file", args: { path: `f${n % 40}.txt` } } });
  requests.length = 0;
  const { agent, log } = await setup({ maxSteps: 10, keepGoing: 200 });
  expect(await agent.send("go", undefined, { report: false })).toBe(STEP_LIMIT);
  // Extended at 10 (progress at 11 -> 35), then 35 - 12 > 20 steps with no change: stop.
  expect(requests.length).toBe(35);
  expect(log.some((l) => l.startsWith("(stopped after 35 steps"))).toBe(true);
});

test("keepGoing 0 and Agent mode's own budget keep the old hard limit", async () => {
  script = (n) => ({ tool: { name: "write_file", args: { path: `out/${n}.txt`, content: "x" } } });
  requests.length = 0;
  let { agent } = await setup({ maxSteps: 8, keepGoing: 0 });
  await agent.send("go", undefined, { report: false });
  expect(requests.length).toBe(8);
  requests.length = 0;
  ({ agent } = await setup({ maxSteps: 50 }));
  await agent.send("task", undefined, { maxSteps: 6, report: false });
  expect(requests.length).toBe(6);
});

test("Stop still ends a turn that was given more steps", async () => {
  const stop = new AbortController();
  script = (n) => {
    if (n === 15) stop.abort();
    return { tool: { name: "write_file", args: { path: `out/${n}.txt`, content: "x" } } };
  };
  requests.length = 0;
  const { agent } = await setup({ maxSteps: 10, keepGoing: 100 });
  await expect(agent.send("go", stop.signal, { report: false })).rejects.toThrow();
  expect(requests.length).toBeLessThanOrEqual(16);
});

test("a failed build gets the error digest, and slices of one file get a read-it-whole note", async () => {
  const dir0 = await mkdtemp(join(tmpdir(), "maxx-digest-"));
  await Bun.write(join(dir0, "build.txt"), KOTLIN);
  script = [
    { tool: { name: "bash", args: { command: process.platform === "win32" ? "type build.txt && exit 1" : "cat build.txt; exit 1" } } },
    { tool: { name: "bash", args: { command: "sed -n '1,5p' f1.txt" } } },
    { tool: { name: "bash", args: { command: "grep -n x f1.txt" } } },
    { tool: { name: "bash", args: { command: "sed -n '2,3p' f1.txt" } } },
    { text: "Done." },
  ];
  requests.length = 0;
  const { agent, dir } = await setup({ maxSteps: 20 });
  await Bun.write(join(dir, "build.txt"), KOTLIN);
  await agent.send("build it", undefined, { report: false });
  const tools = requests.at(-1).messages.filter((m: any) => m.role === "tool").map((m: any) => String(m.content));
  expect(tools[0]).toContain("Note from Maxx: 5 build errors in 3 files: Sfx.kt (3)");
  expect(tools[3]).toContain("looked at f1.txt 3 times");
  expect(tools[2]).not.toContain("looked at");
});

test("onlyLooks: peeks are not progress, changes are", async () => {
  const { onlyLooks } = await import("../src/keepgoing.ts");
  expect(onlyLooks(`cd one-dj && sed -n '30,50p' app/Ads.kt && echo "== SFX" && sed -n '1,20p' app/Sfx.kt`)).toBe(true);
  expect(onlyLooks(`cd one-dj && grep -n "TAU" app/Sfx.kt | head -3 2>&1`)).toBe(true);
  expect(onlyLooks(`sed -i 's/a/b/' app/Sfx.kt`)).toBe(false);
  expect(onlyLooks(`cat a.kt > b.kt`)).toBe(false);
  expect(onlyLooks(`./gradlew assembleDebug`)).toBe(false);
});
