import { afterAll, expect, test } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Agent, type AgentIO } from "../src/loop.ts";
import { Permissions } from "../src/permissions.ts";
import { closeOpen, doubtful, dropRepeatedAnswers, parseWrap, reportLine, stripReport, withoutReports, wrapPrompt } from "../src/wrapup.ts";
import type { Step } from "../src/plan.ts";

const plan = (...done: boolean[]): Step[] => done.map((d, i) => ({ text: `step ${i + 1}`, done: d }));

test("the model's report ticks steps it finished and marks the rest not done", () => {
  const w = parseWrap("2: done\n3: not done: the build fails\nRESULT: not done: the build\nSUMMARY: made the page", plan(true, false, false));
  expect(w.steps.map((s) => [s.done, !!s.missed, s.why])).toEqual([[true, false, undefined], [true, false, undefined], [false, true, "the build fails"]]);
  expect(w.result).toEqual({ done: false, left: "the build" });
  expect(w.summary).toBe("made the page");
  // Loose shapes small models write.
  const l = parseWrap("- **Step 2.** Done\n* 3) [ ] Run it - not done (no phone)\nResult: DONE", plan(true, false, false));
  expect(l.steps[1]!.done).toBe(true);
  expect(l.steps[2]!.missed).toBe(true);
  expect(l.result).toEqual({ done: true });
  // A ticked step can't be unticked, and a step that isn't mentioned stays open until closeOpen.
  const n = parseWrap("1: not done", plan(true, false));
  expect(n.steps[0]!.done).toBe(true);
  expect(closeOpen(n.steps)[1]!.missed).toBe(true);
});

test("the last line says plainly whether the task is done", () => {
  expect(reportLine({ ending: "answered", plan: plan(true, true), files: 2 })).toBe("✅ Done · plan 2 of 2 steps done · changed 2 files");
  expect(reportLine({ ending: "answered", plan: [], files: 1, check: { what: "`npm test`", ok: true } })).toBe("✅ Done · `npm test` passed");
  const missed = closeOpen([{ text: "a", done: true }, { text: "b", done: false, missed: true, why: "no phone" }, { text: "c", done: false }]);
  expect(reportLine({ ending: "steps", plan: missed, files: 0 })).toBe("⚠ Not finished · stopped because it used all the steps one turn gets · plan 1 of 3 steps done · left: 2. b (no phone); 3. c");
  expect(reportLine({ ending: "answered", plan: [], files: 1, result: { done: false, left: "the tests" } })).toBe("⚠ Not finished · changed 1 file · left: the tests");
  expect(reportLine({ ending: "checkfail", plan: [], files: 1, check: { what: "`bun test`", ok: false } })).toStartWith("⚠ Not finished · stopped because Maxx's check still fails · `bun test` fails");
  expect(wrapPrompt(plan(true, false), "x", true)).toContain("[ ] 2. step 2");
  expect(doubtful("I couldn't get the build to pass.")).toBe(true);
  expect(doubtful("Added the button.")).toBe(false);
});

// A scripted fake server, as in loop.test.ts.
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
    if (r.tool) chunks.push({ choices: [{ delta: { tool_calls: [{ index: 0, id: `c${requests.length}`, function: { name: r.tool.name, arguments: JSON.stringify(r.tool.args) } }] } }] });
    return new Response(chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join("") + "data: [DONE]\n\n", { headers: { "content-type": "text/event-stream" } });
  },
});
afterAll(() => server.stop());

async function agent(maxSteps?: number) {
  const dir = await mkdtemp(join(tmpdir(), "maxx-wrap-"));
  await Bun.write(join(dir, "a.txt"), "hi\n");
  Bun.spawnSync(["git", "init", "-q"], { cwd: dir });
  const streamed: string[] = [];
  const plans: Step[][] = [];
  const io: AgentIO = { token: (t) => streamed.push(t), toolStart: () => {}, toolEnd: () => {}, note: () => {}, ask: async () => "yes", plan: (s) => plans.push(s) };
  const a = await new Agent({ llm: { baseURL: `http://localhost:${server.port}/v1`, model: "fake" }, cwd: dir, permissions: await new Permissions(dir, "yolo").load(), maxSteps, fixTries: 0 }, io).init();
  return { a, streamed, plans };
}

test("a turn that stops with plan steps open reconciles them and says it isn't finished", async () => {
  const { a, streamed } = await agent();
  script = [
    { tool: { name: "plan", args: { steps: "read the file\nchange it\nrun it" } } },
    { tool: { name: "read_file", args: { path: "a.txt" } } },
    { tool: { name: "plan", args: { done: 1 } } },
    { text: "I read it." },
    // The plan nudge, answered with words only again.
    { text: "OK." },
    // The wrap-up.
    { text: "2: not done: ran out of ideas\n3: not done\nRESULT: not done: the change" },
  ];
  const answer = await a.send("change a.txt and run it");
  expect(answer).toBe("OK.");
  const last = a.history.at(-1) as { role: string; content: string };
  expect(last.role).toBe("assistant");
  expect(last.content).toStartWith("OK.\n\n⚠ Not finished · plan 1 of 3 steps done · left: 2. change it (ran out of ideas); 3. run it");
  expect(a.plan.map((s) => s.missed ?? false)).toEqual([false, true, true]);
  expect(streamed.join("")).toContain("⚠ Not finished");
  // The wrap-up asked with no tools.
  expect(requests.at(-1).tools ?? []).toHaveLength(0);
  // The next turn opens the missed steps again.
  script = [{ text: "What file?" }];
  await a.send("hello");
  expect(a.plan.some((s) => s.missed)).toBe(false);
});

test("the step limit is no longer silent: the transcript ends with what was done and what is left", async () => {
  const { a } = await agent(2);
  script = [
    { tool: { name: "read_file", args: { path: "a.txt" } } },
    { tool: { name: "bash", args: { command: "echo hi" } } },
    { text: "RESULT: not done: the page\nSUMMARY: read a.txt and ran echo" },
  ];
  await a.send("build it");
  const last = a.history.at(-1) as { role: string; content: string };
  expect(last.role).toBe("assistant");
  expect(last.content).toContain("Stopped: reached the step limit");
  expect(last.content).toContain("What I did: read a.txt and ran echo");
  expect(last.content.split("\n").at(-1)).toBe("⚠ Not finished · stopped because it used all the steps one turn gets · left: the page");
});

test("a plain question gets no report, and a finished plan gets a ✅ without asking the model", async () => {
  const { a } = await agent();
  script = [{ text: "It says hi." }];
  const n = requests.length;
  await a.send("what does a.txt say?");
  expect(requests.length - n).toBe(1);
  expect((a.history.at(-1) as { content: string }).content).toBe("It says hi.");
  script = [
    { tool: { name: "plan", args: { steps: "write it" } } },
    { tool: { name: "write_file", args: { path: "b.txt", content: "yo\n" } } },
    { tool: { name: "plan", args: { done: 1 } } },
    { text: "Wrote b.txt." },
  ];
  const m = requests.length;
  await a.send("write b.txt");
  expect(requests.length - m).toBe(4);
  expect((a.history.at(-1) as { content: string }).content).toBe("Wrote b.txt.\n\n✅ Done · plan 1 of 1 step done · changed 1 file");
});

test("a model that copies the ✅ Done line doesn't make Maxx answer twice", async () => {
  const { a } = await agent();
  // A question answered after a tool call: the turn gets a report.
  script = [{ tool: { name: "bash", args: { command: "echo 30" } } }, { text: "There are 30 stations.\n\n✅ Done" }];
  await a.send("how many Haitian stations?");
  // Next turn: the model has seen "✅ Done" end its answers and writes it itself.
  script = [{ tool: { name: "bash", args: { command: "echo 312" } } }, { text: "TuneIn has 312.\n\n✅ Done" }];
  const answer = await a.send("how do the apps get more?");
  const replies = a.history.filter((m) => m.role === "assistant" && !m.tool_calls?.length).map((m) => m.content);
  expect(replies).toEqual(["There are 30 stations.\n\n✅ Done", "TuneIn has 312.\n\n✅ Done"]);
  expect(answer).toBe("TuneIn has 312.\n\n✅ Done");
  // The model never sees Maxx's report lines, so it has nothing to copy.
  const sent = requests.at(-1).messages.filter((m: any) => m.role === "assistant" && typeof m.content === "string");
  expect(sent.some((m: any) => m.content.includes("✅"))).toBe(false);
});

test("report lines come off the end of an answer, and repeated answers in old sessions fold into one", () => {
  expect(stripReport("Hi.\n\n✅ Done\n\n✅ Done")).toBe("Hi.");
  expect(stripReport("Hi.\n\nWhat I did: x\n\n⚠ Not finished · left: y")).toBe("Hi.");
  expect(stripReport("What I did: x")).toBe("What I did: x");
  expect(stripReport("✅ Done is a good word.\nOk")).toBe("✅ Done is a good word.\nOk");
  const h = [
    { role: "user" as const, content: "q" },
    { role: "assistant" as const, content: "A.\n\n✅ Done" },
    { role: "assistant" as const, content: "A.\n\n✅ Done\n\n✅ Done" },
    { role: "user" as const, content: "q2" },
  ];
  expect(dropRepeatedAnswers(h).map((m) => m.content)).toEqual(["q", "A.\n\n✅ Done", "q2"]);
  expect(withoutReports(h)[1]!.content).toBe("A.");
  const clean = [{ role: "user" as const, content: "q" }];
  expect(withoutReports(clean)).toBe(clean);
});
