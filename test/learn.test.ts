import { afterAll, expect, test } from "bun:test";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Agent, type AgentIO, type Learned } from "../src/loop.ts";
import { Permissions, type Answer } from "../src/permissions.ts";
import { systemPrompt } from "../src/context.ts";
import { MAX_RULES, cleanRule, fallbackRule, handDiff, isStanding, mergeRule, parseRule, rulesIn, soundsLikeCorrection, tidyRules, withRules, type Rule } from "../src/learn.ts";
import { withLesson } from "../src/memory.ts";

// ---- the rules section ----

test("rules round-trip through MAXX.md and leave the rest alone", () => {
  const md = withLesson("# My notes\n\ncheck: npm test\n", "Use py, not python.").md;
  const withR = withRules(md, [{ text: "Use tabs.", times: 1 }, { text: "Keep colors in theme.ts.", times: 3 }]);
  expect(withR).toContain("check: npm test");
  expect(withR).toContain("- Use py, not python.");
  expect(withR).toContain("- Keep colors in theme.ts. (x3)");
  expect(rulesIn(withR)).toEqual([{ text: "Use tabs.", times: 1 }, { text: "Keep colors in theme.ts.", times: 3 }]);
  // Rewriting keeps one section; removing every rule takes the section out.
  const again = withRules(withR, [{ text: "Use tabs.", times: 2 }]);
  expect(again.match(/## Rules from your corrections/g)?.length).toBe(1);
  expect(rulesIn(again)).toEqual([{ text: "Use tabs.", times: 2 }]);
  const gone = withRules(again, []);
  expect(gone).not.toContain("Rules from your corrections");
  expect(gone).toContain("- Use py, not python.");
  expect(gone).toContain("check: npm test");
});

test("a section in the middle of MAXX.md keeps what follows it", () => {
  const md = "# Notes\n\n## Rules from your corrections\n\n- Old rule.\n\n## Lessons (Maxx keeps this list)\n\n- A lesson.\n";
  const out = withRules(md, [{ text: "New rule.", times: 1 }]);
  expect(rulesIn(out)).toEqual([{ text: "New rule.", times: 1 }]);
  expect(out).toContain("## Lessons (Maxx keeps this list)\n\n- A lesson.");
});

test("the same rule said again gets stronger instead of added twice", () => {
  let rules: Rule[] = [{ text: "Use pnpm, not npm, to install packages.", times: 1 }, { text: "Keep game constants in src/config.ts.", times: 1 }];
  const r = mergeRule(rules, "use pnpm instead of npm to install packages");
  expect(r.isNew).toBe(false);
  expect(r.rules.length).toBe(2);
  expect(r.rule).toEqual({ text: "Use pnpm, not npm, to install packages.", times: 2 });
  expect(r.rules.at(-1)).toEqual(r.rule); // strongest last
  rules = r.rules;
  const n = mergeRule(rules, "Name test files *.spec.ts.");
  expect(n.isNew).toBe(true);
  expect(n.rules.length).toBe(3);
});

test("a rule that contradicts an old one replaces it", () => {
  const r = mergeRule([{ text: "Indent with spaces in Python files.", times: 2 }], "Never indent with spaces in Python files.");
  expect(r.isNew).toBe(true);
  expect(r.replaced).toBe("Indent with spaces in Python files.");
  expect(r.rules).toEqual([{ text: "Never indent with spaces in Python files.", times: 1 }]);
});

test("a full list drops its weakest, oldest rule, never the new one", () => {
  const rules: Rule[] = Array.from({ length: MAX_RULES }, (_, i) => ({ text: `Rule number ${"abcdefghijklmnopqrstuvwxyz"[i]}${i} about topic${i}.`, times: i === 0 ? 5 : 1 }));
  const r = mergeRule(rules, "Brand new advice regarding widgets.");
  expect(r.rules.length).toBe(MAX_RULES);
  expect(r.rules.at(-1)!.text).toBe("Brand new advice regarding widgets.");
  expect(r.rules[0]!.times).toBe(5); // the strong one stays
  expect(r.rules.some((x) => x.text === rules[1]!.text)).toBe(false); // the oldest weak one went
});

test("rules are cleaned up: bullets, quotes, numbering and a full stop", () => {
  expect(cleanRule('- "use tabs for indentation"')).toBe("Use tabs for indentation.");
  expect(cleanRule("Rule: Keep files small (x3)")).toBe("Keep files small.");
  expect(cleanRule("<think>hmm</think>\n1. run tests with bun test")).toBe("Run tests with bun test.");
  expect(tidyRules([{ text: "a rule" }, { text: "A rule." , times: 2 }, { text: "  " }])).toEqual([{ text: "A rule.", times: 3 }]);
});

// ---- noticing ----

test("corrections are told apart from new requests", () => {
  for (const t of ["No, use tabs", "no. put it in src/", "That's wrong, the port is 8080", "Don't touch the tests", "I said Kotlin, not Java", "You forgot the import", "make it blue instead of red", "why did you delete main.ts?", "You keep using npm", "Actually, keep the old name"])
    expect([t, soundsLikeCorrection(t)]).toEqual([t, true]);
  for (const t of ["Make a snake game", "Add a README", "now add sound effects", "Note the score", "Nothing else, thanks"])
    expect([t, soundsLikeCorrection(t)]).toEqual([t, false]);
  expect(isStanding("Always use pnpm here")).toBe(true);
  expect(isStanding("From now on write tests first")).toBe(true);
  expect(isStanding("Make a game")).toBe(false);
});

test("a hand fix becomes a small diff", () => {
  const d = handDiff("app.ts", "const port = 3000;\nconsole.log(port);\n", "const port = 8080;\nconsole.log(port);\n")!;
  expect(d).toContain("app.ts:");
  expect(d).toContain("- const port = 3000;");
  expect(d).toContain("+ const port = 8080;");
  expect(d).not.toContain("\x1b");
  expect(handDiff("a", "same", "same")).toBeNull();
});

test("the model's reply: a rule, a saved rule's number, or nothing", () => {
  const rules = [{ text: "Use tabs.", times: 1 }];
  expect(parseRule("NONE", rules)).toBeNull();
  expect(parseRule("none.", rules)).toBeNull();
  expect(parseRule("1", rules)).toEqual({ again: 0 });
  expect(parseRule("7", rules)).toBeNull();
  expect(parseRule("<think>The user wants pnpm.</think>\nUse pnpm, not npm.", rules)).toEqual({ rule: "Use pnpm, not npm." });
  expect(parseRule("word ".repeat(40), rules)).toBeNull();
});

test("without the model, the user's own words count when they read as a rule", () => {
  expect(fallbackRule({ kind: "said", did: [], said: "No, use pnpm not npm" })).toBe("Use pnpm not npm.");
  expect(fallbackRule({ kind: "said", did: [], said: "no that's wrong" })).toBeNull();
  expect(fallbackRule({ kind: "denied", did: [], said: "never run the dev server on port 80" })).toBe("Never run the dev server on port 80.");
});

test("the system prompt puts rules last, once, not in the middle of MAXX.md", async () => {
  const dir = await mkdtemp(join(tmpdir(), "maxx-rules-"));
  await writeFile(join(dir, "MAXX.md"), withRules("# Notes\n\nSome note.\n", [{ text: "Use tabs.", times: 2 }]));
  const p = await systemPrompt(dir);
  expect(p.match(/Use tabs\./g)?.length).toBe(1);
  expect(p).toContain("Some note.");
  expect(p.trimEnd().endsWith("- Use tabs. (x2)")).toBe(true);
});

// ---- the whole loop, against a fake model ----

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
    if (r.tool) chunks.push({ choices: [{ delta: { tool_calls: [{ index: 0, id: "call_1", function: { name: r.tool.name, arguments: JSON.stringify(r.tool.args) } }] } }] });
    return new Response(chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join("") + "data: [DONE]\n\n", { headers: { "content-type": "text/event-stream" } });
  },
});
afterAll(() => server.stop());

async function setup(answers: Answer[] = [], o: { learn?: boolean } = {}) {
  const dir = await mkdtemp(join(tmpdir(), "maxx-learn-"));
  await writeFile(join(dir, "app.ts"), "const port = 3000;\nconsole.log(port);\n");
  Bun.spawnSync(["git", "init", "-q"], { cwd: dir });
  const learned: Learned[] = [];
  const results: string[] = [];
  const io: AgentIO = {
    token: () => {},
    toolStart: () => {},
    toolEnd: (_n, r) => results.push(r),
    note: () => {},
    ask: async () => answers.shift() ?? "yes",
    learned: (l) => learned.push(l),
  };
  const llm = { baseURL: `http://localhost:${server.port}/v1`, model: "fake" };
  const agent = await new Agent({ llm, cwd: dir, permissions: await new Permissions(dir, "ask").load(), fixTries: 0, mapTokens: 0, ...o }, io).init();
  requests.length = 0;
  return { dir, agent, learned, results, rules: async () => rulesIn(await readFile(join(dir, "MAXX.md"), "utf8").catch(() => "")) };
}
const write = (content: string) => ({ tool: { name: "write_file", args: { path: "app.ts", content } } });
const lastPrompt = () => JSON.stringify(requests.at(-1).messages);

test("saying \"no, ...\" after a turn teaches a rule", async () => {
  const t = await setup();
  script = [write("const port = 3000;\n"), { text: "Wrote app.ts." }];
  await t.agent.send("make a server");
  script = [{ text: "Switched to tabs." }, { text: "Indent with tabs, not spaces." }];
  await t.agent.send("no, use tabs not spaces");
  expect(lastPrompt()).toContain("no, use tabs not spaces");
  expect(lastPrompt()).toContain("write_file app.ts");
  expect(await t.rules()).toEqual([{ text: "Indent with tabs, not spaces.", times: 1 }]);
  expect(t.learned[0]).toMatchObject({ isNew: true, kind: "said" });
  // Said again later: stronger, not duplicated.
  script = [{ text: "ok" }, { text: "1" }];
  await t.agent.send("I told you, tabs!");
  expect(await t.rules()).toEqual([{ text: "Indent with tabs, not spaces.", times: 2 }]);
  // A plain new request learns nothing (no extra model call).
  const before = requests.length;
  script = [{ text: "Added." }];
  await t.agent.send("add a README");
  expect(requests.length).toBe(before + 1);
});

test("a change of mind (NONE) adds nothing", async () => {
  const t = await setup();
  script = [write("x\n"), { text: "done" }];
  await t.agent.send("make it");
  script = [{ text: "ok" }, { text: "NONE" }];
  await t.agent.send("no, make the title say Hello instead");
  expect(await t.rules()).toEqual([]);
  expect(t.learned).toEqual([]);
});

test("fixing Maxx's file by hand teaches a rule from the diff", async () => {
  const t = await setup();
  script = [write("const port = 3000;\nconsole.log(port);\n"), { text: "Server on 3000." }];
  await t.agent.send("make a server");
  await writeFile(join(t.dir, "app.ts"), "const port = 8080;\nconsole.log(port);\n");
  script = [{ text: "Added." }, { text: "Run the dev server on port 8080." }];
  await t.agent.send("add a health route");
  expect(lastPrompt()).toContain("+ const port = 8080;");
  expect(await t.rules()).toEqual([{ text: "Run the dev server on port 8080.", times: 1 }]);
  expect(t.learned[0]!.kind).toBe("handfix");
});

test("Deny with a reason: the model reads it, and it becomes a rule", async () => {
  const t = await setup(["no: keep the build folder, it has the signed apk"]);
  script = [{ tool: { name: "bash", args: { command: "rm -rf build" } } }, { text: "OK, I won't." }, { text: "Never delete the build folder." }];
  await t.agent.send("clean up");
  expect(t.results).toContain("user denied this tool call and said: keep the build folder, it has the signed apk");
  expect(JSON.stringify(requests[1].messages)).toContain("it has the signed apk");
  expect(lastPrompt()).toContain("bash rm -rf build");
  expect(await t.rules()).toEqual([{ text: "Never delete the build folder.", times: 1 }]);
  expect(t.learned[0]!.kind).toBe("denied");
});

test("Undo puts the files back, and the next message is the correction", async () => {
  const t = await setup();
  script = [write("RED\n"), { text: "Made it red." }];
  await t.agent.send("make it");
  expect(t.agent.canUndo).toBe(true);
  expect(await t.agent.undoTurn()).toContain("Undid the last turn");
  expect(await readFile(join(t.dir, "app.ts"), "utf8")).toBe("const port = 3000;\nconsole.log(port);\n");
  expect(t.agent.canUndo).toBe(false);
  script = [{ text: "ok" }, { text: "Ask before rewriting a whole file." }];
  await t.agent.send("make only the button blue");
  expect(lastPrompt()).toContain("undid those changes");
  expect(t.learned[0]!.kind).toBe("undid");
});

test("Agent mode's own prompts and learning off never learn", async () => {
  const t = await setup([], { learn: false });
  script = [write("a\n"), { text: "done" }];
  await t.agent.send("make it");
  script = [{ text: "ok" }];
  await t.agent.send("no, use tabs");
  expect(requests.length).toBe(3);
  expect(await t.rules()).toEqual([]);

  const a = await setup();
  script = [write("a\n"), { text: "done" }];
  await a.agent.send("make it");
  script = [{ text: "ok" }];
  await a.agent.send("Don't stop until the tests pass", undefined, { learn: false });
  expect(requests.length).toBe(3);
  expect(await a.rules()).toEqual([]);
});

test("a standing preference is kept even on the first message", async () => {
  const t = await setup();
  script = [{ text: "Got it." }, { text: "Write comments in Spanish." }];
  await t.agent.send("Always write comments in Spanish");
  expect(await t.rules()).toEqual([{ text: "Write comments in Spanish.", times: 1 }]);
});
