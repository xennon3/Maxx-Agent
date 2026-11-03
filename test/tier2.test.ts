import { expect, test, beforeAll, afterAll } from "bun:test";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { findBrowser } from "../src/judge.ts";
import { browserAct, browserEval, browserLook, browserOpen, closeBrowser, keyEvent } from "../src/tools/browse.ts";
import { diagnose, profilePage, type Metrics } from "../src/tools/profile.ts";
import { codeNav, defPattern, locate, renameSymbol, searchFallback } from "../src/tools/symbols.ts";
import { applyEdits, editsByFile, findServer, LspClient, toLocs } from "../src/lsp.ts";
import { applyMutant, bisect, bumpGradle, firstBad, mutants, mutate, probe, probeLine, probeReport, release } from "../src/tools/engineer.ts";
import { crc32, zip } from "../src/zip.ts";
import { git } from "../src/tools/git.ts";
import { TOOLSETS } from "../src/tools/index.ts";

const tmp = (p = "maxx-t2-") => mkdtemp(join(tmpdir(), p));
const chromium = findBrowser() ?? (Bun.file("/opt/pw-browsers/chromium").size ? "/opt/pw-browsers/chromium" : null);

beforeAll(() => {
  if (chromium) process.env.MAXX_BROWSER ??= chromium;
});
afterAll(() => closeBrowser());

test("the new toolsets stay small", () => {
  expect(TOOLSETS.browser!.tools.map((t) => t.name)).toEqual(["browser_open", "browser_act", "browser_look", "browser_eval", "profile_page"]);
  expect(TOOLSETS.engineer!.tools.map((t) => t.name)).toEqual(["code_nav", "rename_symbol", "probe", "bisect", "mutate", "release"]);
});

// ---- browser hands ----

test("keys map to DevTools key events", () => {
  expect(keyEvent("Enter")).toMatchObject({ key: "Enter", windowsVirtualKeyCode: 13, text: "\r" });
  expect(keyEvent("left")).toMatchObject({ key: "ArrowLeft", windowsVirtualKeyCode: 37 });
  expect(keyEvent("a")).toMatchObject({ key: "a", code: "KeyA", text: "a" });
  expect(() => keyEvent("hyperdrive")).toThrow("unknown key");
});

test.skipIf(!chromium)("Maxx's browser opens a page, numbers what can be clicked, clicks, types, presses keys and reads state", async () => {
  const dir = await tmp();
  await writeFile(
    join(dir, "index.html"),
    `<title>Counter</title><button id="b" onclick="n++;out.textContent=n">Add one</button><input id="name" placeholder="Your name"><p id="out">0</p>
     <script>let n=0; addEventListener("keydown", (e) => { if (e.key === "ArrowUp") { n += 10; out.textContent = n; } }); console.log("ready");</script>`,
  );
  const first = (await browserOpen.run({}, { cwd: dir })) as { text: string; images: unknown[] };
  expect(first.images).toHaveLength(1);
  expect(first.text).toContain('1 button "Add one"');
  expect(first.text).toContain('2 input[text] placeholder "Your name"');
  expect(first.text).toContain("log: ready");
  const clicked = (await browserAct.run({ action: "click", element: 1 }, { cwd: dir })) as { text: string };
  expect(clicked.text).toContain('clicked 1 button "Add one"');
  await browserAct.run({ action: "type", element: 2, text: "Luther" }, { cwd: dir });
  await browserAct.run({ action: "key", key: "up" }, { cwd: dir });
  expect(await browserEval.run({ js: "({ n, name: document.getElementById('name').value })" }, { cwd: dir })).toBe('{\n "n": 11,\n "name": "Luther"\n}');
  expect(((await browserLook.run({}, { cwd: dir })) as { text: string }).text).not.toContain("log: ready");
  expect(String(await browserAct.run({ action: "click", element: 99 }, { cwd: dir }))).toContain("no element 99");
}, 60_000);

// ---- profile_page ----

test("diagnose ranks the worst problems first, with fixes", () => {
  const m: Metrics = { load: 900, dcl: 500, fcp: 600, lcp: 4200, cls: 0.02, long: [400, 120], fps: 24, worstFrame: 90, dom: 300, heapMb: 20, totalKb: 900, heavy: [{ name: "hero.png", kind: "img", kb: 820, ms: 300 }], slow: [], count: 4, images: [] };
  const p = diagnose(m, true);
  expect(p[0]).toContain("24 fps");
  expect(p.some((x) => x.includes("Main content shows late"))).toBe(true);
  expect(p.some((x) => x.includes("hero.png is 820 KB"))).toBe(true);
  expect(diagnose({ ...m, lcp: 800, long: [], fps: 60, heavy: [] }, true)).toEqual([]);
});

test.skipIf(!chromium)("profile_page measures a page that burns the CPU every frame", async () => {
  const dir = await tmp();
  await writeFile(join(dir, "index.html"), `<canvas width=300 height=200></canvas><script>function f(){ const t=performance.now(); while(performance.now()-t<45){} requestAnimationFrame(f) } requestAnimationFrame(f)</script>`);
  const r = String(await profilePage.run({}, { cwd: dir }));
  expect(r).toContain("fps");
  expect(r).toContain("Top problems:");
  expect(r).toMatch(/Animation runs at \d+ fps|JavaScript blocks the page/);
}, 60_000);

// ---- code navigation ----

test("a symbol is found by name, preferring its definition, and definitions are recognised across languages", () => {
  const text = "import { total } from './x'\n\nexport function total(items) {\n  return items.length\n}\nconsole.log(total([]))";
  expect(locate(text, "total")).toEqual({ line: 2, character: 16 });
  expect(locate(text, "total", 6)).toEqual({ line: 5, character: 12 });
  for (const l of ["def total(x):", "fun total(): Int {", "func total() int {", "const total = (a) => a", "class Total {", "  total(items) {", "fn total() -> u32 {"])
    expect([l, defPattern(l.includes("Total") ? "Total" : "total").test(l)]).toEqual([l, true]);
  expect(defPattern("total").test("const subtotal = 1")).toBe(false);
});

test("without a language server, code_nav searches carefully and says how to get exact answers", async () => {
  const dir = await tmp();
  await mkdir(join(dir, "src"));
  await writeFile(join(dir, "src/cart.ts"), "export function total(xs: number[]) {\n  return xs.reduce((a, b) => a + b, 0)\n}\n// total is cached\nexport const subtotal = 1\n");
  await writeFile(join(dir, "src/app.ts"), "import { total } from './cart'\nconsole.log(total([1, 2]))\n");
  expect(searchFallback(dir, "ts", "total", "definition").map((l) => `${l.path}:${l.line}`)).toEqual(["src/cart.ts:1"]);
  expect(searchFallback(dir, "ts", "total", "references").map((l) => `${l.path}:${l.line}`)).toEqual(["src/app.ts:1", "src/app.ts:2", "src/cart.ts:1"]);
  const out = String(await codeNav.run({ action: "definition", path: "src/app.ts", symbol: "total" }, { cwd: dir }));
  if (!Bun.which("typescript-language-server")) expect(out).toContain("npm i -g typescript typescript-language-server");
  expect(out).toContain("src/cart.ts:1:");
});

test("the LSP client talks to a language server: definition, references and a rename applied to the files", async () => {
  const dir = await tmp();
  const a = join(dir, "a.ts");
  await writeFile(a, "export const greet = () => 'hi'\ngreet()\n");
  // A tiny language server that knows one symbol.
  const fake = join(dir, "fake-lsp.ts");
  await writeFile(
    fake,
    `const uri = ${JSON.stringify(pathToFileURL(a).href)};
let buf = "";
const send = (m) => { const b = JSON.stringify(m); process.stdout.write("Content-Length: " + Buffer.byteLength(b) + "\\r\\n\\r\\n" + b); };
for await (const chunk of Bun.stdin.stream()) {
  buf += new TextDecoder().decode(chunk);
  for (;;) {
    const i = buf.indexOf("\\r\\n\\r\\n"); if (i < 0) break;
    const len = Number(/Content-Length: (\\d+)/.exec(buf.slice(0, i))[1]);
    if (buf.length < i + 4 + len) break;
    const m = JSON.parse(buf.slice(i + 4, i + 4 + len)); buf = buf.slice(i + 4 + len);
    const at = (l, c, e) => ({ uri, range: { start: { line: l, character: c }, end: { line: l, character: e } } });
    if (m.method === "initialize") send({ jsonrpc: "2.0", id: m.id, result: { capabilities: {} } });
    if (m.method === "textDocument/didOpen") send({ jsonrpc: "2.0", method: "textDocument/publishDiagnostics", params: { uri, diagnostics: [{ range: at(1,0,5).range, severity: 1, message: "demo error" }] } });
    if (m.method === "textDocument/definition") send({ jsonrpc: "2.0", id: m.id, result: at(0, 13, 18) });
    if (m.method === "textDocument/references") send({ jsonrpc: "2.0", id: m.id, result: [at(0, 13, 18), at(1, 0, 5)] });
    if (m.method === "textDocument/rename") send({ jsonrpc: "2.0", id: m.id, result: { changes: { [uri]: [{ range: at(0,13,18).range, newText: m.params.newName }, { range: at(1,0,5).range, newText: m.params.newName }] } } });
  }
}`,
  );
  const c = new LspClient(dir, { lang: "fake", cmd: ["bun", fake], install: "" });
  try {
    const uri = await c.open(a);
    const pos = locate(await readFile(a, "utf8"), "greet")!;
    expect(toLocs(dir, await c.request("textDocument/definition", { textDocument: { uri }, position: pos }))).toEqual([{ path: "a.ts", line: 1, col: 14, text: "export const greet = () => 'hi'" }]);
    expect(toLocs(dir, await c.request("textDocument/references", { textDocument: { uri }, position: pos, context: { includeDeclaration: true } })).map((l) => l.line)).toEqual([1, 2]);
    for (let i = 0; i < 20 && !c.diagnostics.has(uri); i++) await Bun.sleep(50);
    expect(c.diagnostics.get(uri)![0].message).toBe("demo error");
    const edits = editsByFile(await c.request("textDocument/rename", { textDocument: { uri }, position: pos, newName: "welcome" }));
    expect(applyEdits(await readFile(a, "utf8"), edits.get(a)!)).toBe("export const welcome = () => 'hi'\nwelcome()\n");
  } finally {
    c.close();
  }
}, 20_000);

// ---- probe ----

test("probe lines fit each language and the report counts each hit", () => {
  expect(probeLine(".py", "    ", 3, ["total", "len(xs)"])).toBe('    print("@@MAXX_PROBE@@ L3", "total =", repr(total), "len(xs) =", repr(len(xs)), flush=True)');
  expect(probeLine(".ts", "", 2, ["a"])).toContain('JSON.stringify({ "a": a })');
  expect(probeLine(".rs", "", 2, ["x"])).toBe('eprintln!("@@MAXX_PROBE@@ L2 x={:?}", x);');
  expect(probeLine(".rb", "", 2, ["x"])).toBeNull();
  const r = probeReport(["noise", ...Array.from({ length: 12 }, (_, i) => `@@MAXX_PROBE@@ L5 {"i":${i}}`)].join("\n"));
  expect(r).toStartWith("L5 ran 12 time(s):");
  expect(r).toContain('{"i":0}');
  expect(r).toContain('{"i":11}');
  expect(r).toContain("... 6 more ...");
  expect(probeReport("nothing")).toContain("never ran");
});

const bunProject = async () => {
  const dir = await tmp();
  await writeFile(join(dir, "bun.lock"), "");
  await writeFile(join(dir, "package.json"), "{}");
  return dir;
};

test("probe shows the values inside a loop while the tests run, then puts the file back", async () => {
  const dir = await bunProject();
  const src = "export function sum(xs: number[]) {\n  let t = 0\n  for (const x of xs) {\n    t += x\n  }\n  return t\n}\n";
  await writeFile(join(dir, "sum.ts"), src);
  await writeFile(join(dir, "sum.test.ts"), 'import { test, expect } from "bun:test";\nimport { sum } from "./sum";\ntest("sum", () => expect(sum([1, 2, 3])).toBe(6));\n');
  const r = String(await probe.run({ path: "sum.ts", line: 4, values: ["x", "t"] }, { cwd: dir }));
  expect(r).toContain("L4 ran 3 time(s)");
  expect(r).toContain('{"x":3,"t":3}');
  expect(await readFile(join(dir, "sum.ts"), "utf8")).toBe(src);
}, 30_000);

// ---- mutate ----

test("mutants skip strings, comments and logging, and spread over the file", () => {
  const src = 'if (a < b) x()\nconst s = "a < b"\n// a < b\nconsole.log(a > b)\nreturn ok && done';
  expect(mutants(src)).toEqual([{ line: 1, from: " < ", to: " <= " }, { line: 5, from: " && ", to: " || " }]);
  expect(applyMutant('if (n > 0 && s == "x > y")', { line: 1, from: " > ", to: " >= " })).toBe('if (n >= 0 && s == "x > y")');
  expect(applyMutant("return true", { line: 1, from: "true", to: "false" })).toBe("return false");
  const many = Array.from({ length: 100 }, (_, i) => `if (a${i} < b) x()`).join("\n");
  expect(mutants(many, 5).map((m) => m.line)).toEqual([1, 21, 41, 61, 81]);
});

test("mutate finds the bug the tests miss and restores the file", async () => {
  const dir = await bunProject();
  const src = "export function canVote(age: number) {\n  return age >= 18\n}\nexport function both(a: boolean, b: boolean) {\n  return a && b\n}\n";
  await writeFile(join(dir, "vote.ts"), src);
  // Weak tests: no check at exactly 18, and both() is only tried with true, true.
  await writeFile(join(dir, "vote.test.ts"), 'import { test, expect } from "bun:test";\nimport { canVote, both } from "./vote";\ntest("v", () => { expect(canVote(30)).toBe(true); expect(canVote(5)).toBe(false); expect(both(true, true)).toBe(true); });\n');
  const r = String(await mutate.run({ path: "vote.ts" }, { cwd: dir }));
  expect(r).toContain("caught 0 of 2");
  expect(r).toContain('line 2: `return age >= 18` with ">=" changed to ">"');
  expect(r).toContain('line 5: `return a && b` with "&&" changed to "||"');
  expect(await readFile(join(dir, "vote.ts"), "utf8")).toBe(src);
}, 60_000);

// ---- bisect ----

test("bisect names the commit that broke the tests and leaves the branch as it was", async () => {
  const dir = await bunProject();
  const run = (args: string[]) => git(dir, ["-c", "user.name=T", "-c", "user.email=t@t", ...args]);
  await run(["init", "-q", "-b", "main"]);
  await writeFile(join(dir, "m.test.ts"), 'import { test, expect } from "bun:test";\nimport { f } from "./m";\ntest("f", () => expect(f()).toBe(1));\n');
  for (let i = 1; i <= 6; i++) {
    await writeFile(join(dir, "m.ts"), `export const f = () => ${i === 4 ? "2" : i > 4 ? "2" : "1"} // v${i}\n`);
    await run(["add", "-A"]);
    await run(["commit", "-q", "-m", i === 4 ? "Speed up f" : `Change ${i}`]);
  }
  const r = String(await bisect.run({ good: "HEAD~5" }, { cwd: dir }));
  expect(r).toContain("Speed up f");
  expect((await git(dir, ["rev-parse", "--abbrev-ref", "HEAD"])).out).toBe("main");
  expect(firstBad("abc1234def is the first bad commit\n")).toBe("abc1234def");
}, 60_000);

// ---- release ----

test("crc32 and zip match the format", () => {
  expect(crc32(new TextEncoder().encode("123456789"))).toBe(0xcbf43926);
  const z = zip([{ name: "index.html", data: new TextEncoder().encode("<h1>hi</h1>".repeat(50)) }]);
  expect(new DataView(z.buffer).getUint32(0, true)).toBe(0x04034b50);
  expect(new DataView(z.buffer).getUint32(z.length - 22, true)).toBe(0x06054b50);
});

test("gradle versions bump: versionCode up by one, versionName set", () => {
  const b = bumpGradle('android {\n  defaultConfig {\n    versionCode = 7\n    versionName = "1.0"\n  }\n}', "1.1.0");
  expect(b.text).toContain("versionCode = 8");
  expect(b.text).toContain('versionName = "1.1.0"');
  expect(bumpGradle("versionCode 3", undefined).code).toBe(4);
});

test("release packs a web game into a zip with index.html at its root and writes the changelog", async () => {
  const dir = await tmp();
  const run = (args: string[]) => git(dir, ["-c", "user.name=T", "-c", "user.email=t@t", ...args]);
  await run(["init", "-q", "-b", "main"]);
  await writeFile(join(dir, "index.html"), "<canvas></canvas><script src='game.js'></script>");
  await writeFile(join(dir, "game.js"), "console.log(1)");
  await writeFile(join(dir, "README.md"), "notes");
  await run(["add", "-A"]);
  await run(["commit", "-q", "-m", "Add a jump"]);
  await run(["commit", "-q", "--allow-empty", "-m", "Fix the score"]);
  const r = String(await release.run({ version: "1.0.0" }, { cwd: dir }));
  expect(r).toContain("packed 2 files into releases/");
  expect(r).toContain("-1.0.0.zip");
  const log = await readFile(join(dir, "CHANGELOG.md"), "utf8");
  expect(log).toContain("## 1.0.0");
  expect(log).toContain("- Fix the score");
  if (Bun.which("unzip")) {
    const name = r.match(/releases\/(\S+\.zip)/)![1]!;
    const p = Bun.spawnSync(["unzip", "-l", join(dir, "releases", name)]);
    const listing = p.stdout.toString();
    expect(listing).toContain("index.html");
    expect(listing).not.toContain("README.md");
    expect(Bun.spawnSync(["unzip", "-t", join(dir, "releases", name)]).exitCode).toBe(0);
  }
  expect(existsSync(join(dir, "releases"))).toBe(true);
}, 30_000);

const ts = findServer("x.ts", undefined, "/nonexistent");
const realTs = ts && !("missing" in ts) ? ts : null;

test.skipIf(!realTs)("with a real TypeScript language server: hover, type errors and a rename across files", async () => {
  const dir = await tmp();
  await mkdir(join(dir, "src"));
  await writeFile(join(dir, "tsconfig.json"), '{"compilerOptions":{"strict":true,"module":"esnext","target":"es2022","moduleResolution":"bundler"}}');
  await writeFile(join(dir, "src/cart.ts"), "export function total(xs: number[]) {\n  return xs.reduce((a, b) => a + b, 0)\n}\n");
  await writeFile(join(dir, "src/app.ts"), 'import { total } from "./cart"\nconst n: string = total([1, 2])\n');
  expect(String(await codeNav.run({ action: "hover", path: "src/app.ts", symbol: "total" }, { cwd: dir }))).toContain("(xs: number[]): number");
  expect(String(await codeNav.run({ action: "diagnostics", path: "src/app.ts" }, { cwd: dir }))).toContain("src/app.ts:2:7 error: Type 'number' is not assignable to type 'string'");
  expect(String(await renameSymbol.run({ path: "src/cart.ts", symbol: "total", new_name: "sumAll" }, { cwd: dir }))).toContain("in 2 file(s)");
  expect(await readFile(join(dir, "src/app.ts"), "utf8")).toBe('import { sumAll } from "./cart"\nconst n: string = sumAll([1, 2])\n');
}, 90_000);
