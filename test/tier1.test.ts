import { expect, test, beforeAll } from "bun:test";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { closest, loadRecipes, parseRecipe, parseRecorded, recipeTool, recipesPrompt, recorderMessages, saveRecipe, projectRecipesDir } from "../src/recipes.ts";
import { detectRunner, runTests, summarizeTests } from "../src/tools/tests.ts";
import { gitCommit, gitTool, trimDiff } from "../src/tools/git.ts";
import { buildIco, iconPlan, makeIcons, sizedSvg, snapPage, withManifestIcons } from "../src/tools/studio.ts";
import { findBrowser } from "../src/judge.ts";
import { TOOLS, TOOLSETS } from "../src/tools/index.ts";
import { textOf } from "../src/context.ts";

const tmp = (p = "maxx-t1-") => mkdtemp(join(tmpdir(), p));

beforeAll(async () => {
  process.env.MAXX_HOME = await tmp("maxx-home-");
});

test("the always-on tools stay few enough for small models", () => {
  expect(TOOLS.map((t) => t.name)).toEqual(["read_file", "list_files", "grep", "edit_file", "write_file", "bash", "run_tests", "git", "git_commit", "snap_page", "recipe", "use_template", "make_sounds"]);
  expect(TOOLSETS.studio!.tools.map((t) => t.name)).toEqual(["make_icons"]);
});

// ---- recipes ----

test("a recipe file parses with its front matter, and a project recipe overrides a built-in one", async () => {
  const r = parseRecipe("---\nname: Ship It\nwhen: release the app\n---\n1. build\n2. ship", "x.md", "yours")!;
  expect(r).toMatchObject({ name: "ship-it", when: "release the app", body: "1. build\n2. ship" });
  expect(parseRecipe("# Deploy to itch\n1. zip", "deploy.md", "project")).toMatchObject({ name: "deploy", when: "Deploy to itch" });
  const dir = await tmp();
  const builtIn = await loadRecipes(dir);
  expect(builtIn.map((x) => x.name)).toContain("fix-failing-test");
  await saveRecipe(projectRecipesDir(dir), { name: "fix-failing-test", when: "our way", body: "1. ask Luther" });
  const all = await loadRecipes(dir);
  expect(all.filter((x) => x.name === "fix-failing-test")).toEqual([{ name: "fix-failing-test", when: "our way", body: "1. ask Luther", from: "project" }]);
  // The project's own recipes come first in the menu.
  const menu = recipesPrompt(all);
  expect(menu.split("\n")[1]).toBe("- fix-failing-test: our way");
  expect(menu.length).toBeLessThan(1800);
});

test("the recipe tool finds a recipe by a loose name and lists them when nothing matches", async () => {
  const dir = await tmp();
  expect(await recipeTool.run({ name: "PWA install" }, { cwd: dir })).toContain("manifest.webmanifest");
  expect(closest(await loadRecipes(dir), "make the game juicier")?.name).toBe("game-juice");
  expect(await recipeTool.run({ name: "bake bread" }, { cwd: dir })).toContain("No recipe called");
});

test("the recorder turns a transcript into a recipe and reads it back from a chatty reply", () => {
  const msgs = recorderMessages([
    { role: "system", content: "sys" },
    { role: "user", content: "add dark mode" },
    { role: "assistant", content: null, tool_calls: [{ id: "1", type: "function", function: { name: "edit_file", arguments: '{"path":"style.css"}' } }] },
    { role: "tool", tool_call_id: "1", content: "ok" },
  ] as any, "dark mode");
  expect(textOf(msgs[1]!.content)).toContain("call edit_file");
  expect(textOf(msgs[1]!.content)).toContain("dark mode");
  const r = parseRecorded("<think>hmm</think>Sure!\n```markdown\n---\nname: dark-mode\nwhen: add a dark theme\n---\n1. Add CSS variables\n2. Check with snap_page\n```")!;
  expect(r).toMatchObject({ name: "dark-mode", when: "add a dark theme" });
  expect(r.body).toBe("1. Add CSS variables\n2. Check with snap_page");
});

// ---- run_tests ----

test("the test runner is found from the project's files", async () => {
  const dir = await tmp();
  expect(detectRunner(dir)).toBeNull();
  await writeFile(join(dir, "package.json"), JSON.stringify({ scripts: { test: "vitest run" } }));
  expect(detectRunner(dir)!.command).toBe("npm test");
  expect(detectRunner(dir)!.filter!("login")).toBe("npm test -- login");
  await writeFile(join(dir, "pnpm-lock.yaml"), "");
  expect(detectRunner(dir)!.command).toBe("pnpm test");
  const py = await tmp();
  await writeFile(join(py, "pyproject.toml"), "[tool.pytest.ini_options]\n");
  expect(detectRunner(py)!.command).toBe("python -m pytest -q");
  const gr = await tmp();
  await writeFile(join(gr, "gradlew"), "");
  expect(detectRunner(gr, "bash")!.command).toBe("./gradlew test --console=plain");
  expect(detectRunner(gr, "powershell")!.command).toBe(".\\gradlew.bat test --console=plain");
});

test("a failing run comes back as just the failures, with file and line", () => {
  const noise = Array.from({ length: 400 }, (_, i) => `(pass) works ${i} [0.1ms]`).join("\n");
  const out = `${noise}\ntest/math.test.ts:\n(fail) adds two numbers [0.3ms]\n  error: expect(received).toBe(expected)\n  Expected: 4\n  Received: 5\n      at <anonymous> (/p/test/math.test.ts:7:18)\n${noise}\n 400 pass\n 1 fail\n`;
  const s = summarizeTests(out, 1);
  expect(s).toStartWith("FAILED (exit code 1)");
  expect(s).toContain("Expected: 4");
  expect(s).toContain("math.test.ts:7:18");
  expect(s).not.toContain("works 3 ");
  expect(s.split("\n").length).toBeLessThan(25);
  expect(summarizeTests("===== 12 passed in 0.4s =====", 0)).toBe("PASSED\n===== 12 passed in 0.4s =====");
  const py = summarizeTests("tests/test_a.py F\n\n    def test_add():\n>       assert add(2, 2) == 5\nE       assert 4 == 5\n\ntests/test_a.py:3: AssertionError\n===== 1 failed in 0.1s =====", 1);
  expect(py).toContain("E       assert 4 == 5");
  expect(py).toContain("1 failed");
});

test("run_tests runs bun's tests for real and reports a failure", async () => {
  const dir = await tmp();
  await writeFile(join(dir, "bun.lock"), "");
  await writeFile(join(dir, "package.json"), "{}");
  await writeFile(join(dir, "a.test.ts"), 'import { test, expect } from "bun:test";\ntest("ok", () => expect(1).toBe(1));\ntest("adds", () => expect(2 + 2).toBe(5));\n');
  const r = String(await runTests.run({}, { cwd: dir }));
  expect(r).toContain("$ bun test");
  expect(r).toContain("FAILED");
  expect(r).toContain("adds");
  expect(String(await runTests.run({ filter: "a.test" , command: "bun test -t ok" }, { cwd: dir }))).toContain("PASSED");
}, 30_000);

// ---- git ----

test("git_commit makes the repository, commits, and git shows status, diff, log and blame", async () => {
  const dir = await tmp();
  await writeFile(join(dir, "a.txt"), "one\n");
  expect(await gitTool.run({ action: "status" }, { cwd: dir })).toContain("not a git repository");
  const first = String(await gitCommit.run({ message: "Add a.txt" }, { cwd: dir }));
  expect(first).toContain("made a new git repository");
  expect(first).toContain("Add a.txt");
  expect(existsSync(join(dir, ".gitignore"))).toBe(true);
  await writeFile(join(dir, "a.txt"), "one\ntwo\n");
  expect(await gitTool.run({ action: "status" }, { cwd: dir })).toContain("M a.txt");
  expect(await gitTool.run({ action: "diff" }, { cwd: dir })).toContain("+two");
  expect(String(await gitCommit.run({ message: "Add two", branch: "feature/two" }, { cwd: dir }))).toContain("made branch feature/two");
  const log = String(await gitTool.run({ action: "log" }, { cwd: dir }));
  expect(log.split("\n")[0]).toContain("Add two");
  expect(await gitTool.run({ action: "blame", path: "a.txt" }, { cwd: dir })).toContain("two");
  expect(await gitCommit.run({ message: "nothing" }, { cwd: dir })).toContain("nothing to commit");
  expect(await gitTool.run({ action: "diff", ref: "--output=/tmp/x" }, { cwd: dir })).toContain("error");
  expect(await gitCommit.run({ message: "bad", branch: "a b" }, { cwd: dir })).toContain("not a valid branch name");
}, 30_000);

test("long diffs are cut with a note on how to see the rest", () => {
  const d = Array.from({ length: 500 }, (_, i) => (i % 100 === 0 ? `diff --git a/f${i} b/f${i}` : `+line ${i}`)).join("\n");
  const t = trimDiff(d);
  expect(t.split("\n").length).toBeLessThan(230);
  expect(t).toContain("280 more lines in 5 file(s)");
});

// ---- studio ----

test("icon sets cover every Android density, the PWA sizes and the favicon", () => {
  const plan = iconPlan(["android", "pwa", "favicon"], "app/src/main/res");
  expect(plan.filter((s) => s.file.endsWith("/ic_launcher.png")).map((s) => s.size)).toEqual([48, 72, 96, 144, 192]);
  expect(plan.find((s) => s.file.includes("xxxhdpi/ic_launcher_foreground"))!.size).toBe(432);
  expect(plan.map((s) => s.file)).toContain("icons/maskable-512.png");
  expect(plan.map((s) => s.file)).toContain("favicon-16.png");
  expect(withManifestIcons('<manifest>\n    <application\n        android:label="X">')).toContain('android:icon="@mipmap/ic_launcher"');
  expect(withManifestIcons('<application android:icon="@drawable/a">')).toBe('<application android:icon="@drawable/a">');
  expect(sizedSvg('<svg viewBox="0 0 24 12"><rect/></svg>')).toContain('width="1024" height="512"');
  expect(sizedSvg('<svg width="10"></svg>')).toBe('<svg width="10"></svg>');
});

test("an .ico holds its PNGs behind a directory", () => {
  const ico = buildIco([{ size: 16, data: new Uint8Array([1, 2, 3]) }, { size: 256, data: new Uint8Array([4, 5]) }]);
  const v = new DataView(ico.buffer);
  expect([v.getUint16(2, true), v.getUint16(4, true)]).toEqual([1, 2]);
  expect([ico[6], ico[22]]).toEqual([16, 0]);
  expect(v.getUint32(6 + 12, true)).toBe(38);
  expect([...ico.slice(38)]).toEqual([1, 2, 3, 4, 5]);
});

const chromium = findBrowser() ?? (Bun.file("/opt/pw-browsers/chromium").size ? "/opt/pw-browsers/chromium" : null);

test.skipIf(!chromium)("snap_page shows the page at both sizes with its console errors and overflow", async () => {
  process.env.MAXX_BROWSER ??= chromium!;
  const dir = await tmp();
  await writeFile(join(dir, "index.html"), '<title>Hi</title><div style="width:900px">wide</div><script>console.error("boom"); missing();</script>');
  const r = (await snapPage.run({}, { cwd: dir })) as { text: string; images: unknown[] };
  expect(r.images).toHaveLength(2);
  expect(r.text).toContain('title "Hi"');
  expect(r.text).toContain("scrolls sideways");
  expect(r.text).toContain("boom");
  expect(r.text).toContain("missing");
  expect(await snapPage.run({ target: "https://example.com" }, { cwd: dir, network: false })).toContain("network access is off");
}, 60_000);

test.skipIf(!chromium)("make_icons draws every size from one SVG and wires an Android app", async () => {
  process.env.MAXX_BROWSER ??= chromium!;
  const dir = await tmp();
  await mkdir(join(dir, "app/src/main/res/values"), { recursive: true });
  await writeFile(join(dir, "app/src/main/AndroidManifest.xml"), '<manifest xmlns:android="http://schemas.android.com/apk/res/android">\n    <application android:label="Demo"></application>\n</manifest>\n');
  await writeFile(join(dir, "logo.svg"), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#e11"/></svg>');
  const r = String(await makeIcons.run({ source: "logo.svg", kinds: ["android", "favicon"], background: "#123456" }, { cwd: dir }));
  expect(r).toContain("app/src/main/res/mipmap-xxxhdpi/ic_launcher.png");
  const png = await readFile(join(dir, "app/src/main/res/mipmap-hdpi/ic_launcher.png"));
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([72, 72]);
  expect(await readFile(join(dir, "app/src/main/AndroidManifest.xml"), "utf8")).toContain("@mipmap/ic_launcher_round");
  expect(await readFile(join(dir, "app/src/main/res/values/ic_launcher_background.xml"), "utf8")).toContain("#123456");
  const ico = await readFile(join(dir, "favicon.ico"));
  expect(ico.readUInt16LE(4)).toBe(3);
}, 60_000);
