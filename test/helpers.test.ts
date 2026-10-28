import { expect, test } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { applyPlan, parseSteps, planFromHistory } from "../src/plan.ts";
import { checkFromNotes, lessonsIn, swapLesson, withLesson, LESSONS_HEADING } from "../src/memory.ts";
import { detectCheck, excerpt, quickCheck, syntaxCheck } from "../src/fixit.ts";

test("plan steps are parsed from loose lists and ticked by number", () => {
  expect(parseSteps("1. Make index.html\n- [ ] add the snake\n\n* score")).toEqual([
    { text: "Make index.html", done: false },
    { text: "add the snake", done: false },
    { text: "score", done: false },
  ]);
  let r = applyPlan([], { steps: "a\nb\nc" });
  expect(r.text).toContain("Now do step 1: a");
  r = applyPlan(r.steps, { done: 1 });
  expect(r.text).toContain("[x] 1. a");
  expect(r.text).toContain("Now do step 2: b");
  expect(applyPlan(r.steps, { done: 9 }).text).toStartWith("error: there is no step 9");
  // A rewrite keeps ticks on unchanged steps.
  expect(applyPlan(r.steps, { steps: "a\nb2" }).steps).toEqual([{ text: "a", done: true }, { text: "b2", done: false }]);
  const all = applyPlan(applyPlan(applyPlan(r.steps, { done: 2 }).steps, { done: 3 }).steps, {});
  expect(all.text).toContain("All steps are done");
});

test("a resumed session gets its plan back", () => {
  const call = (args: object) => ({ role: "assistant" as const, content: null, tool_calls: [{ id: "1", type: "function" as const, function: { name: "plan", arguments: JSON.stringify(args) } }] });
  expect(planFromHistory([call({ steps: "x\ny" }), call({ done: 2 })])).toEqual([{ text: "x", done: false }, { text: "y", done: true }]);
});

test("lessons go in their own section, without duplicates, oldest dropped", () => {
  let md = "# My app\n\nUse tabs.\n\n## Other\nkeep";
  md = withLesson(md, "Use py, not python.").md;
  expect(md).toContain(`${LESSONS_HEADING}\n\n- Use py, not python.\n`);
  expect(md).toContain("## Other\nkeep");
  expect(withLesson(md, "use PY, not python").added).toBe(false);
  for (let i = 0; i < 25; i++) md = withLesson(md, `lesson ${i}`).md;
  const list = lessonsIn(md);
  expect(list).toHaveLength(20);
  expect(list.at(-1)).toBe("lesson 24");
  expect(md).toStartWith("# My app\n\nUse tabs.");
  expect(withLesson("", "first").md).toBe(`# Notes for Maxx\n\n${LESSONS_HEADING}\n\n- first\n`);
});

test("a program swap that fixed a command becomes a lesson", () => {
  expect(swapLesson("python main.py", "py main.py")).toBe("Use `py` instead of `python` here (`python` did not work).");
  expect(swapLesson("python main.py", "py other.py")).toBeNull();
  expect(swapLesson("npm test", "npm test")).toBeNull();
  expect(checkFromNotes("hi\ncheck: `npm run lint`\n")).toBe("npm run lint");
});

test("syntax checks for js, html inline scripts and json", () => {
  expect(syntaxCheck("a.js", "const a = 1;")).toBeNull();
  expect(syntaxCheck("a.ts", "let n: number = 1;")).toBeNull();
  expect(syntaxCheck("a.js", "if (a {}")).toContain("a.js:");
  expect(syntaxCheck("g.html", "<p>\n<script src=x.js></script>\n<script>\nok();\nif (x {\n</script>")).toContain("g.html: line 5:");
  expect(syntaxCheck("g.html", '<script type="text/template">{{ not js</script>')).toBeNull();
  expect(syntaxCheck("p.json", "{,}")).toContain("p.json:");
});

test("quick check and build detection in a folder", async () => {
  const dir = await mkdtemp(join(tmpdir(), "maxx-fix-"));
  await Bun.write(join(dir, "ok.js"), "1;");
  await Bun.write(join(dir, "bad.js"), "(");
  expect(await quickCheck(dir, ["notes.txt"])).toBeNull();
  expect((await quickCheck(dir, ["ok.js"]))?.ok).toBe(true);
  expect(await quickCheck(dir, ["ok.js", "bad.js"])).toMatchObject({ ok: false, what: "syntax check of bad.js" });
  expect(detectCheck(dir)).toBeUndefined();
  await Bun.write(join(dir, "package.json"), JSON.stringify({ scripts: { dev: "vite", build: "vite build", test: "vitest" } }));
  expect(detectCheck(dir)).toBe("npm run build");
  await Bun.write(join(dir, "MAXX.md"), "check: off\n");
  expect(detectCheck(dir)).toBeUndefined();
  await Bun.write(join(dir, "MAXX.md"), "check: make lint\n");
  expect(detectCheck(dir)).toBe("make lint");
});

test("excerpt shows the lines around the first error", () => {
  const out = Array.from({ length: 50 }, (_, i) => (i === 30 ? "error: boom" : `line ${i}`)).join("\n");
  const ex = excerpt(out, "error: boom");
  expect(ex.split("\n")[0]).toBe("line 28");
  expect(ex).toContain("error: boom");
});
