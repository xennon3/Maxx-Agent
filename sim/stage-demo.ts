#!/usr/bin/env bun
// Drives the Preview / Run / Phone panel of `maxx ui` in a headless browser:
// a scripted model writes a page with a bug and previews it, then the Run tab
// starts a dev server and a failing test, and the phone is mirrored live.
// Screenshots go to sim/out/stage.   bun sim/stage-demo.ts
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
const ROOT = resolve(import.meta.dir, "..");
const OUT = join(ROOT, "sim", "out", "stage");
rmSync(OUT, { recursive: true, force: true });
const app = join(OUT, "tipcalc");
mkdirSync(app, { recursive: true });
writeFileSync(join(app, "package.json"), JSON.stringify({ scripts: { dev: "bun serve.ts", test: "echo '1 test failed: total is NaN' && exit 1" } }));
writeFileSync(join(app, "serve.ts"), `Bun.serve({port:4788,fetch:()=>new Response("<h1>dev server page</h1>",{headers:{"content-type":"text/html"}})});console.log("  Local: http://localhost:4788/");`);
writeFileSync(join(app, "bun.lock"), "");
Bun.spawnSync(["git", "init", "-q"], { cwd: app });
process.env.MAXX_HOME = join(OUT, "home");
mkdirSync(join(OUT, "bin"), { recursive: true });
writeFileSync(join(OUT, "bin", "adb"), "#!/bin/sh\nexec bun " + ROOT + "/sim/fake-adb.ts \"$@\"\n", { mode: 0o755 });
Object.assign(process.env, { MAXX_ADB: join(OUT, "bin", "adb"), SIM_PHONE: join(OUT, "phone.json") });

const HTML = `<!doctype html><html><head><title>Tip calculator</title><style>body{font:16px system-ui;margin:24px;background:#fff7ed}h1{color:#c2410c}input{font-size:18px;padding:6px;margin:4px 0;width:200px}.total{font-size:28px;font-weight:700;margin-top:12px}</style></head><body><h1>Tip calculator</h1><label>Bill<br><input id=bill value=42></label><br><label>Tip %<br><input id=tip value=18></label><div class=total id=out>Total: $0</div><script>function calc(){const b=+bill.value,t=+tip.value;out.textContent="Total: $"+(b*(1+t/100)).toFixed(2)}bill.oninput=tip.oninput=calc;calc();console.log("ready");totl.focus();</script></body></html>`;
let turn = 0;
const lm = Bun.serve({ port: 0, async fetch(req) {
  const u = new URL(req.url);
  if (u.pathname.endsWith("/models")) return Response.json({ data: [{ id: "qwen3-vl-4b" }] });
  const body = await req.json() as any;
  const tools = body.messages.filter((m: any) => m.role === "tool").length;
  const sse = (chunks: any[]) => new Response(chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join("") + "data: [DONE]\n\n", { headers: { "content-type": "text/event-stream" } });
  const call = (name: string, args: any) => sse([{ choices: [{ delta: { tool_calls: [{ index: 0, id: "c" + tools, type: "function", function: { name, arguments: JSON.stringify(args) } }] } }] }, { choices: [{ delta: {}, finish_reason: "tool_calls" }] }]);
  await Bun.sleep(300);
  if (tools === 0) return call("write_file", { path: "index.html", content: HTML });
  if (tools === 1) return call("preview", { path: "index.html" });
  const last = body.messages.at(-1).content;
  return sse([{ choices: [{ delta: { content: "The page loads, but the preview shows an error:\n\n```\n" + String(last).split("\n").filter((l: string) => l.includes("error") || l.includes("not defined")).join("\n") + "\n```" } }] }, { choices: [{ delta: {}, finish_reason: "stop" }] }]);
} });
const { startUI } = await import(ROOT + "/src/ui/server.ts");
const ui = await startUI({ baseURL: `http://127.0.0.1:${lm.port}/v1`, port: 0, open: false });
const { chromium } = require("playwright");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: process.env.THEME ?? "dark" });
page.on("pageerror", (e: any) => console.log("PAGE ERROR", e.message));
const shot = (n: string) => page.screenshot({ path: join(OUT, n + ".png") });
await page.goto(ui.link);
await page.waitForSelector("#model option", { state: "attached" });
await page.fill("#folder", app);
await page.click("#openBtn");
await page.waitForFunction(() => document.querySelector("#where")!.textContent!.includes("tipcalc"));
await page.selectOption("#mode", "yolo");
await page.fill("#input", "Make a tip calculator web page and check it in the preview");
await page.keyboard.press("Enter");
await page.waitForSelector("#sendBtn:not([disabled])", { timeout: 30000 });
await page.waitForTimeout(1500);
await page.waitForSelector("#sendBtn:not([disabled])");
await shot("1-preview");
console.log("reply:", await page.locator("#log .msg").last().textContent());
console.log("console:", await page.locator("#pvConsSum").textContent());
// Run tab
await page.click("#rail button[data-tab=run]");
await page.click(".chips .chip:has-text('dev')");
await page.waitForSelector(".proc.running .meta a", { timeout: 10000 });
await page.click(".chips .chip:has-text('test')");
await page.waitForSelector(".proc.failed", { timeout: 10000 });
await page.waitForTimeout(500);
await shot("2-run");
await page.click(".proc.failed .meta a");
console.log("composer:", (await page.inputValue("#input")).slice(0, 120));
await page.click(".proc.running .meta a");
await page.waitForTimeout(800);
await page.click("#pvSize");
await page.waitForTimeout(300);
await shot("3-devserver-phone-size");
await page.click("#rail button[data-tab=screen]");
await page.click("#phLive");
await page.waitForSelector("#shot.live[src]", { timeout: 15000 });
await page.waitForTimeout(1200);
const box = (await page.locator("#shot").boundingBox())!;
await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.3);
await page.waitForTimeout(200);
await shot("4-screen");
console.log("cap:", await page.textContent("#scCap"));
await browser.close();
ui.stop(); lm.stop();
process.exit(0);
