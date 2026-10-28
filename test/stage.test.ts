import { afterAll, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Runner, detectCommands, findUrl, saveCommand, savedCommands } from "../src/ui/runner.ts";
import { PreviewServer, htmlFiles, injectBridge } from "../src/ui/preview.ts";
import { Stage, describeReport } from "../src/ui/stage.ts";

const dir = () => mkdtempSync(join(tmpdir(), "maxx-stage-"));

test("finds the URL a dev server prints, ignoring colors", () => {
  expect(findUrl("  \x1b[32m➜\x1b[0m  Local:   \x1b[36mhttp://localhost:\x1b[1m5173\x1b[22m/\x1b[0m")).toBe("http://localhost:5173/");
  expect(findUrl("Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...")).toBe("http://localhost:8000/");
  expect(findUrl("listening on http://127.0.0.1:3000.")).toBe("http://127.0.0.1:3000");
  expect(findUrl("see https://example.com/docs")).toBeUndefined();
});

test("suggests commands from what is in the folder", () => {
  const d = dir();
  writeFileSync(join(d, "package.json"), JSON.stringify({ scripts: { build: "x", lint: "x", dev: "x", test: "x" } }));
  writeFileSync(join(d, "bun.lock"), "");
  writeFileSync(join(d, "gradlew"), "");
  expect(detectCommands(d, "bash").map((c) => c.command)).toEqual(["bun run dev", "bun run test", "bun run build", "bun run lint", "./gradlew assembleDebug", "./gradlew test"]);
  expect(detectCommands(d, "powershell").at(-1)!.command).toBe(".\\gradlew.bat test");
  const n = dir();
  writeFileSync(join(n, "package.json"), JSON.stringify({ scripts: { start: "x", test: "x" } }));
  expect(detectCommands(n, "bash").map((c) => c.command)).toEqual(["npm run start", "npm test"]);
});

test("remembers typed commands per project, newest first", async () => {
  const d = dir();
  await saveCommand(d, "npm run dev");
  await saveCommand(d, "pytest -x");
  await saveCommand(d, "npm run dev");
  expect(await savedCommands(d)).toEqual(["npm run dev", "pytest -x"]);
});

test("runs a command in the background, streams its output and notices its URL", async () => {
  const chunks: string[] = [];
  const r = new Runner(dir(), { output: (_, t) => chunks.push(t), changed: () => {} });
  const p = r.start(`echo starting; echo "ready on http://localhost:4999/"; sleep 30`);
  const settled = await r.settle(p.id, 5000);
  expect(settled.url).toBe("http://localhost:4999/");
  expect(settled.status).toBe("running");
  expect(chunks.join("")).toContain("starting");
  r.stop(p.id);
  for (let i = 0; i < 50 && p.code === null; i++) await Bun.sleep(50);
  expect(p.status).toBe("stopped");

  const bad = r.start("echo broken >&2; exit 3");
  await r.settle(bad.id, 5000);
  for (let i = 0; i < 50 && bad.code === null; i++) await Bun.sleep(50);
  expect(bad).toMatchObject({ status: "exited", code: 3 });
  expect(bad.output).toContain("broken");
});

test("the bridge script goes first in the page, so it sees early errors", () => {
  expect(injectBridge("<!doctype html><html><head><title>x</title></head>", "/b.js")).toBe('<!doctype html><html><head><script src="/b.js"></script><title>x</title></head>');
  expect(injectBridge("<h1>hi</h1>", "/b.js")).toBe('<script src="/b.js"></script><h1>hi</h1>');
});

test("lists the project's pages, index.html first, skipping node_modules", async () => {
  const d = dir();
  mkdirSync(join(d, "node_modules", "x"), { recursive: true });
  mkdirSync(join(d, "game"));
  writeFileSync(join(d, "node_modules", "x", "index.html"), "");
  writeFileSync(join(d, "about.html"), "");
  writeFileSync(join(d, "game", "index.html"), "");
  writeFileSync(join(d, "index.html"), "");
  expect(await htmlFiles(d)).toEqual(["index.html", "game/index.html", "about.html"]);
});

test("the preview server serves the project behind its token, and nothing outside it", async () => {
  const d = dir();
  writeFileSync(join(d, "index.html"), "<html><head></head><body>hello</body></html>");
  writeFileSync(join(d, "app.js"), "console.log(1)");
  const pv = new PreviewServer(() => {});
  pv.use(d);
  try {
    const root = pv.base.replace(/[^/]+\/$/, "");
    expect((await fetch(root + "wrongtoken/index.html")).status).toBe(404);
    const page = await (await fetch(pv.base)).text();
    expect(page).toContain(`<script src="/${pv.token}/__maxx/bridge.js"></script>`);
    expect(page).toContain("hello");
    const js = await fetch(pv.url("app.js"));
    expect(js.headers.get("content-type")).toContain("javascript");
    expect(await js.text()).toBe("console.log(1)");
    expect(await (await fetch(pv.base + "__maxx/bridge.js")).text()).toContain("postMessage");
    expect((await fetch(pv.base + "..%2F..%2F..%2Fetc%2Fpasswd")).status).toBe(403);
    expect((await fetch(pv.base + "%2e%2e/%2e%2e/etc/passwd")).status).toBe(404);
    expect((await fetch(pv.url("missing.html"))).status).toBe(404);
  } finally {
    pv.stop();
  }
});

test("the bridge script parses", () => {
  const { BRIDGE } = require("../src/ui/preview.ts");
  expect(() => new Function(BRIDGE)).not.toThrow();
});

test("the preview tool opens the page in the panel and reports what the page saw", async () => {
  const d = dir();
  writeFileSync(join(d, "index.html"), "<title>Tip</title>");
  const sent: any[] = [];
  let stage: Stage;
  stage = new Stage((m) => {
    sent.push(m);
    if (m.type === "preview") setTimeout(() => stage.handle({ type: "previewReport", id: m.id, title: "Tip", text: "Total: $0", logs: [{ level: "error", text: "x is not defined (app.js:3)" }] }), 10);
  }, () => 1);
  await stage.use(d);
  const tool = stage.tools().find((t) => t.name === "preview")!;
  try {
    const out = String(await tool.run({ path: "index.html" }, { cwd: d }));
    expect(sent.find((m) => m.type === "preview").url).toBe(stage.preview.url("index.html"));
    expect(out).toContain("title: Tip");
    expect(out).toContain("Total: $0");
    expect(out).toContain("1 error(s):\n  x is not defined (app.js:3)");
    expect(String(await tool.run({ path: "nope.html" }, { cwd: d }))).toContain("does not exist");
  } finally {
    stage.stop();
  }
});

test("the preview tool says so when no window is open", async () => {
  const stage = new Stage(() => {}, () => 0);
  await stage.use(dir());
  try {
    expect(String(await stage.tools()[0]!.run({}, { cwd: "." }))).toContain("not open");
  } finally {
    stage.stop();
  }
});

test("start_server starts the command in the Run panel and returns its URL", async () => {
  const d = dir();
  const sent: any[] = [];
  const stage = new Stage((m) => {
    sent.push(m);
    if (m.type === "preview") setTimeout(() => stage.handle({ type: "previewReport", id: m.id, unbridged: true }), 10);
  }, () => 1);
  await stage.use(d);
  const tool = stage.tools().find((t) => t.name === "start_server")!;
  try {
    const out = String(await tool.run({ command: `echo "Local: http://localhost:5173/"; sleep 30` }, { cwd: d }));
    expect(out).toStartWith("running at http://localhost:5173/");
    expect(out).toContain("it loaded");
    expect(sent.some((m) => m.type === "proc" && m.proc.status === "running")).toBe(true);
    expect(String(await tool.run({ command: "echo bye; exit 1" }, { cwd: d }))).toContain("exited with code 1");
    expect(stage.runner!.list().filter((p) => p.status === "running")).toHaveLength(1);
  } finally {
    stage.stop();
  }
});

test("a page that never reports back is described as such", () => {
  expect(describeReport("index.html", null, true)).toContain("did not report back");
  expect(describeReport("index.html", { title: "", text: "", logs: [] }, true)).toContain("shows no text");
});
