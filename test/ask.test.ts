import { afterAll, expect, test } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Agent, type AgentIO } from "../src/loop.ts";
import { Permissions } from "../src/permissions.ts";
import { agentDefaults, runGoal, type Board } from "../src/agentmode.ts";
import { answerText, cleanChoices, MAX_QUESTIONS, parseBriefing, questionsIn, type Question } from "../src/ask.ts";

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

// `answer` decides what the user does with each question: a string, null to skip, "wait" to never answer.
async function setup(answer: (q: Question) => string | null | "wait", withQuestions = true) {
  const dir = await mkdtemp(join(tmpdir(), "maxx-ask-"));
  Bun.spawnSync(["git", "init", "-q"], { cwd: dir });
  const asked: Question[] = [];
  const io: AgentIO = { token: () => {}, toolStart: () => {}, toolEnd: () => {}, note: () => {}, ask: async () => "yes" };
  if (withQuestions)
    io.question = (q, signal) => {
      asked.push(q);
      const a = answer(q);
      if (a !== "wait") return Promise.resolve(a);
      return new Promise((res) => signal.addEventListener("abort", () => res(null)));
    };
  const agent = await new Agent({ llm: { baseURL: `http://localhost:${server.port}/v1`, model: "fake" }, cwd: dir, permissions: await new Permissions(dir, "ask").load(), fixTries: 0, mapTokens: 0 }, io).init();
  return { agent, asked, dir };
}

const toolNames = (r: any) => (r.tools ?? []).map((t: any) => t.function.name);
const lastTool = (r: any) => r.messages.findLast((m: any) => m.role === "tool")?.content;

test("choices from small models come as lists, strings and numbered lines", () => {
  expect(cleanChoices(["1. React", "2) Vue", "react", "  "])).toEqual(["React", "Vue"]);
  expect(cleanChoices("React, Vue or Svelte")).toEqual(["React", "Vue", "Svelte"]);
  expect(cleanChoices(["a", "b", "c", "d", "e"])).toHaveLength(4);
  expect(cleanChoices(undefined)).toEqual([]);
});

test("the answer the model reads back", () => {
  const q = { choices: ["Web page", "Android app"], guess: "Web page" };
  expect(answerText(q, "Android app")).toBe("The user answered: Android app");
  expect(answerText(q, "2")).toBe("The user answered: Android app");
  expect(answerText(q, null, "timeout")).toContain("did not answer in time. Go with your guess (Web page)");
  expect(answerText({ choices: [] }, null, "stopped")).toContain("skipped the question. Make the most sensible choice yourself");
  expect(answerText(q, null, "limit")).toContain(`already asked ${MAX_QUESTIONS} questions`);
});

test("briefing questions parse from the formats small models write, and CLEAR means none", () => {
  expect(parseBriefing("CLEAR")).toEqual([]);
  expect(parseBriefing("<think>hmm</think>\n**Clear.**")).toEqual([]);
  const qs = parseBriefing("Here you go:\nQ: Web page or Android app? | choices: web page; android app | guess: web page\n2. **Question 2:** Should scores be saved? | guess: yes\nQ: ok");
  expect(qs).toEqual([
    { question: "Web page or Android app?", choices: ["web page", "android app"], guess: "web page" },
    { question: "Should scores be saved?", choices: [], guess: "yes" },
  ]);
});

test("ask_user pauses the turn, shows choices and the guess, and hands the answer back", async () => {
  const { agent, asked } = await setup(() => "Android app");
  script = [
    { tool: { name: "ask_user", args: { question: "Web page or Android app?", choices: ["Web page", "Android app"], guess: "Web page" } } },
    { text: "Building the Android app." },
  ];
  const n = requests.length;
  expect(await agent.send("make a snake game")).toBe("Building the Android app.");
  expect(toolNames(requests[n])).toContain("ask_user");
  expect(requests[n].messages[0].content).toContain("call ask_user");
  expect(asked[0]).toMatchObject({ question: "Web page or Android app?", choices: ["Web page", "Android app"], guess: "Web page" });
  expect(asked[0]!.deadline).toBeUndefined();
  expect(lastTool(requests.at(-1))).toBe("The user answered: Android app");
  expect(questionsIn(agent.history)).toEqual([{ question: "Web page or Android app?", answer: "The user answered: Android app" }]);
});

test("a skipped question tells the model to use its guess; past the limit it is not asked", async () => {
  const { agent, asked } = await setup(() => null);
  const ask = (i: number) => ({ tool: { name: "ask_user", args: { question: `Question number ${i}?`, guess: "yes" } } });
  script = [ask(1), ask(2), ask(3), ask(4), { text: "ok" }];
  await agent.send("go");
  expect(asked).toHaveLength(MAX_QUESTIONS);
  expect(lastTool(requests.at(-1))).toContain(`already asked ${MAX_QUESTIONS} questions`);
  expect(requests.at(-1).messages.filter((m: any) => m.role === "tool")[0].content).toContain("skipped the question. Go with your guess (yes)");
});

test("without a way to answer (piped input) the model is not offered ask_user", async () => {
  const { agent } = await setup(() => null, false);
  script = [{ text: "hi" }];
  const n = requests.length;
  await agent.send("hello");
  expect(toolNames(requests[n])).not.toContain("ask_user");
  expect(requests[n].messages[0].content).not.toContain("ask_user");
});

test("stopping the turn while a question waits stops the turn", async () => {
  const { agent } = await setup(() => "wait");
  script = [{ tool: { name: "ask_user", args: { question: "Which one?" } } }];
  const c = new AbortController();
  setTimeout(() => c.abort(), 50);
  await expect(agent.send("go", c.signal)).rejects.toThrow();
});

test("Agent mode asks before planning, and an unanswered question falls back to the guess in time", async () => {
  const { agent, asked } = await setup((q) => (q.question.startsWith("Web") ? "Android app" : "wait"));
  const boards: Board[] = [];
  script = [
    { text: "Q: Web page or Android app? | choices: web page; android app | guess: web page\nQ: Save high scores? | guess: no" },
    { text: "1. Make the game | check: it builds" },
    { text: "DONE" },
  ];
  const settings = { ...agentDefaults(16384), judge: false, mapTokens: 0, askMinutes: 0.002 }; // about 120 ms
  const b = await runGoal(agent, "a snake game", { board: (x) => boards.push(x) }, { settings });
  expect(b.state).toBe("done");
  expect(asked).toHaveLength(2);
  expect(asked[1]!.deadline).toBeGreaterThan(Date.now() - 5000);
  expect(b.brief).toContain("Web page or Android app? → Android app");
  expect(b.brief).toContain("Save high scores? → no (no answer; Maxx's guess)");
  // The planner and the task both read the answers.
  const planner = requests.at(-2).messages.at(-1).content;
  expect(planner).toContain("→ Android app");
  expect(JSON.stringify(requests.at(-1).messages.at(-1).content)).toContain("→ Android app");
  // The wait only applies while Agent mode runs.
  expect(agent.askWaitMs).toBeUndefined();
});

test("Agent mode skips the briefing when it is off or the goal is clear", async () => {
  const { agent, asked } = await setup(() => "x");
  script = [{ text: "CLEAR" }, { text: "1. Do it | check: done" }, { text: "DONE" }];
  const b = await runGoal(agent, "add a readme", { board: () => {} }, { settings: { ...agentDefaults(16384), judge: false, mapTokens: 0 } });
  expect(b.state).toBe("done");
  expect(asked).toHaveLength(0);
  expect(b.brief).toBeUndefined();
  const n = requests.length;
  script = [{ text: "1. Do it | check: done" }, { text: "DONE" }];
  await runGoal(agent, "add a licence", { board: () => {} }, { settings: { ...agentDefaults(16384), judge: false, mapTokens: 0, briefing: false } });
  expect(requests.length - n).toBe(2);
});
