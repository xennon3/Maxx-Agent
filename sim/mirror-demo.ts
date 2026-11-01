#!/usr/bin/env bun
// The phone mirror and android_explore in `maxx ui`, driven in a headless
// browser: a scripted model asks android_explore to test a tip calculator on
// the pretend phone. The live view streams H.264 (fake adb pipes the pretend
// screen through ffmpeg), Maxx's taps show as a purple finger, and the report
// finds the crash. Screenshots go to sim/out/mirror.   bun sim/mirror-demo.ts
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
const ROOT = resolve(import.meta.dir, "..");
const OUT = join(ROOT, "sim", "out", "mirror");
rmSync(OUT, { recursive: true, force: true });
const app = join(OUT, "tipcalc");
mkdirSync(app, { recursive: true });
writeFileSync(join(app, "README.md"), "tip calculator\n");
Bun.spawnSync(["git", "init", "-q"], { cwd: app });
process.env.MAXX_HOME = join(OUT, "home");
mkdirSync(join(OUT, "bin"), { recursive: true });
// Bun.spawn hands children the environment Maxx started with, so the pretend phone's settings go in the script.
writeFileSync(join(OUT, "bin", "adb"), `#!/bin/sh\nexport SIM_PHONE='${join(OUT, "phone.json")}' SIM_ADB_LOG='${join(OUT, "adb.log")}'\nexec bun ${ROOT}/sim/fake-adb.ts "$@"\n`, { mode: 0o755 });
writeFileSync(join(OUT, "phone.json"), JSON.stringify({ installed: { pkg: "com.example.tipcalc", src: "CRASH_ON_BIG_BILL" }, foreground: "launcher", fields: { bill: "", tip: "" }, focus: null, result: "", crash: [], log: [] }));
process.env.MAXX_ADB = join(OUT, "bin", "adb");

let report = "";
const lm = Bun.serve({ port: 0, idleTimeout: 0, async fetch(req) {
  const u = new URL(req.url);
  if (u.pathname.endsWith("/models")) return Response.json({ data: [{ id: "qwen3.8-27b" }] });
  const body = await req.json() as any;
  const tools = body.messages.filter((m: any) => m.role === "tool");
  const sse = (chunks: any[]) => new Response(chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join("") + "data: [DONE]\n\n", { headers: { "content-type": "text/event-stream" } });
  const call = (name: string, args: any) => sse([{ choices: [{ delta: { tool_calls: [{ index: 0, id: "c" + tools.length, type: "function", function: { name, arguments: JSON.stringify(args) } }] } }] }, { choices: [{ delta: {}, finish_reason: "tool_calls" }] }]);
  if (!tools.length) return call("android_explore", { package: "com.example.tipcalc", steps: 16 });
  report = String(tools.at(-1).content?.[0]?.text ?? tools.at(-1).content);
  return sse([{ choices: [{ delta: { content: "Explored the tip calculator: it crashes when the bill is over 40 (Rounding necessary in tipFor, MainActivity.kt:58). I'll fix the rounding next." } }] }, { choices: [{ delta: {}, finish_reason: "stop" }] }]);
} });
const { startUI } = await import(ROOT + "/src/ui/server.ts");
const ui = await startUI({ baseURL: `http://127.0.0.1:${lm.port}/v1`, port: 0, open: false });
const { chromium } = require("playwright");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
page.on("pageerror", (e: any) => console.log("PAGE ERROR", e.message));
const shot = (n: string) => page.screenshot({ path: join(OUT, n + ".png") });
await page.goto(ui.link);
await page.waitForSelector("#model option", { state: "attached" });
await page.fill("#folder", app);
await page.click("#openBtn");
await page.waitForFunction(() => document.querySelector("#where")!.textContent!.includes("tipcalc"));
await page.selectOption("#mode", "yolo");
await page.click("text=📱 Android");
await page.click("#rail button[data-tab=screen]");
await page.click("#phLive");
await page.waitForSelector("#phCanvas:not(.hide)", { timeout: 20000 });
await shot("0-live");
await page.fill("#input", "Test the tip calculator on my phone");
await page.keyboard.press("Enter");
// Catch the ghost finger mid-run.
let ghosts = 0;
for (let i = 0; i < 600 && ghosts < 3; i++) {
  const g = await page.waitForSelector(".ghost:not(.out), .ghostSay", { timeout: 200 }).catch(() => null);
  if (g) (await shot(`1-ghost-${++ghosts}`), await page.waitForTimeout(500));
  if (!(await page.locator("#sendBtn[disabled]").count())) break;
}
console.log("video:", await page.locator("#phCanvas:not(.hide)").count() ? "live H.264 on canvas" : "screenshots", "·", await page.textContent("#scCap"));
await page.waitForSelector("#sendBtn:not([disabled])", { timeout: 120000 });
await page.waitForTimeout(800);
await shot("2-done");
await page.locator("#log .tool").last().click().catch(() => {});
await page.waitForTimeout(300);
await shot("3-report");
console.log("report:\n" + report);
await browser.close();
ui.stop(); lm.stop();
process.exit(0);
