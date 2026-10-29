#!/usr/bin/env bun
// Drives Agent mode in `maxx ui` with a scripted model: the goal is split into
// three tasks, the screenshot judge fails the first page (it shows NaN) and
// the model fixes it, the second task fails once and is rewound and retried,
// the third needs no screenshot. Screenshots go to sim/out/agent.
//   MAXX_BROWSER=/path/to/chrome bun sim/agent-demo.ts
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
const ROOT = resolve(import.meta.dir, "..");
const OUT = join(ROOT, "sim", "out", "agent");
rmSync(OUT, { recursive: true, force: true });
const app = join(OUT, "tipcalc");
mkdirSync(app, { recursive: true });
process.env.MAXX_HOME = join(OUT, "home");

const page = (total: string) => `<!doctype html><html><head><title>Tip calculator</title><link rel=stylesheet href=style.css></head><body><h1>Tip calculator</h1><label>Bill <input id=bill value=42></label><label>Tip % <input id=tip value=18></label><div class=total id=out></div><script>function calc(){out.textContent="Total: $"+${total}}bill.oninput=tip.oninput=calc;calc()</script></body></html>`;
const CSS = "body{font:18px system-ui;margin:24px;background:#fff7ed}h1{color:#c2410c}label{display:block;margin:8px 0}input{font-size:18px;width:120px}.total{font-size:30px;font-weight:700;margin-top:16px}";
const turns: any[] = [
  ["write_file", { path: "index.html", content: page("(+bill.value*(1+tip/100)).toFixed(2)") }], "DONE",
  ["write_file", { path: "index.html", content: page("(+bill.value*(1+tip.value/100)).toFixed(2)") }], "DONE, fixed the total",
  ["write_file", { path: "theme.css", content: "/* wrong file */" }], "STUCK: the page does not load theme.css",
  ["write_file", { path: "style.css", content: CSS }], "DONE",
  ["write_file", { path: "README.md", content: "# Tip calculator\nOpen index.html.\n" }], "DONE",
];
let judged = 0;
const lm = Bun.serve({ port: 0, async fetch(req) {
  const u = new URL(req.url);
  if (u.pathname.endsWith("/models")) return Response.json({ data: [{ id: "qwen3-vl-4b" }] });
  const body = await req.json() as any;
  const sse = (chunks: any[]) => new Response(chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join("") + "data: [DONE]\n\n", { headers: { "content-type": "text/event-stream" } });
  const text = (t: string) => sse([{ choices: [{ delta: { content: t } }] }, { choices: [{ delta: {}, finish_reason: "stop" }] }]);
  await Bun.sleep(500);
  const sys = String(body.messages[0].content);
  if (sys.startsWith("You plan work")) return text("1. Make the tip calculator page | check: it shows a total for a $42 bill\n2. Style the page | check: it looks tidy on a phone\n3. Write a short README | check: README.md exists");
  if (sys.startsWith("You are a careful software tester")) return text(++judged === 1 ? "FAIL: the total says NaN instead of a dollar amount" : "PASS");
  const next = turns.shift() ?? "DONE";
  if (typeof next === "string") return text(next);
  return sse([{ choices: [{ delta: { tool_calls: [{ index: 0, id: "c" + turns.length, type: "function", function: { name: next[0], arguments: JSON.stringify(next[1]) } }] } }] }, { choices: [{ delta: {}, finish_reason: "tool_calls" }] }]);
} });
const { startUI } = await import(ROOT + "/src/ui/server.ts");
const ui = await startUI({ baseURL: `http://127.0.0.1:${lm.port}/v1`, port: 0, open: false, context: 16384 });
const { chromium } = require("playwright");
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: process.env.THEME ?? "light" });
p.on("pageerror", (e: any) => console.log("PAGE ERROR", e.message));
const shot = (n: string) => p.screenshot({ path: join(OUT, n + ".png") });
await p.goto(ui.link);
await p.waitForSelector("#model option", { state: "attached" });
await p.fill("#folder", app);
await p.click("#openBtn");
await p.waitForFunction(() => document.querySelector("#where")!.textContent!.includes("tipcalc"));
await p.click("#agentBtn");
await p.fill("#input", "Build a tip calculator web page that looks good on a phone");
await shot("1-goal");
await p.keyboard.press("Enter");
await p.waitForFunction(() => document.querySelector("#board .task.failed, #board .task .tries"), null, { timeout: 120000 });
await shot("2-running");
await p.waitForSelector("#sendBtn:not([disabled])", { timeout: 120000 });
await p.waitForTimeout(500);
await shot("3-done");
await p.click("#agentCfg");
await p.waitForTimeout(200);
await shot("4-settings");
console.log(await p.locator("#board").innerText());
await browser.close();
ui.stop();
lm.stop();
process.exit(0);
