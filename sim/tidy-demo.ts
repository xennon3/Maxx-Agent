#!/usr/bin/env bun
// Recreates a busy Agent-mode screen in `maxx ui` (toolsets on, network on, a task board,
// tool cards, the live preview) to judge the layout. Screenshots go to sim/out/tidy/<tag>.
//   bun sim/tidy-demo.ts after        (THEME=dark for the dark theme)
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
const ROOT = resolve(import.meta.dir, "..");
const TAG = process.argv[2] ?? "after";
const OUT = join(ROOT, "sim", "out", "tidy", TAG);
rmSync(OUT, { recursive: true, force: true });
const proj = join(OUT, "ADvert"); mkdirSync(proj, { recursive: true });
writeFileSync(join(proj, "index.html"), `<!doctype html><body style="margin:0;background:#0b0b10;color:#e8c26a;font:14px monospace;display:grid;place-items:center;height:100vh"><div style="text-align:center"><div style="border:1px solid #333;width:520px;height:300px;background:#16161c;display:grid;place-items:end start;padding:14px">CHRONO CORPORATION — RETROREL 3000</div><p><button>START</button> <button>REPLAY</button> <button>MUTE</button></p></div></body>`);
process.env.MAXX_HOME = join(OUT, "home");
const lm = Bun.serve({ port: 0, fetch(req) {
  if (new URL(req.url).pathname.endsWith("/models")) return Response.json({ data: [{ id: "deepseek-v4.1-flash-ista-das-coder" }, { id: "qwen3.8-27b" }] });
  return new Response("data: [DONE]\n\n", { headers: { "content-type": "text/event-stream" } });
} });
const { startUI } = await import(ROOT + "/src/ui/server.ts");
const ui = await startUI({ baseURL: `http://127.0.0.1:${lm.port}/v1`, port: 0, open: false, cwd: proj });
const { chromium } = require("playwright");
const browser = await chromium.launch();
const W = Number(process.env.W ?? 1920), H = Number(process.env.H ?? 1030);
const p = await browser.newPage({ viewport: { width: W, height: H }, colorScheme: process.env.THEME ?? "light" });
p.on("pageerror", (e: any) => console.log("PAGE ERROR", e.message));
await p.goto(ui.link);
await p.waitForTimeout(1200);
const send = (m: any) => p.evaluate((m: any) => (0, eval)("send")(m), m);
await send({ type: "open", cwd: proj, model: "deepseek-v4.1-flash-ista-das-coder" });
await p.waitForTimeout(800);
await send({ type: "settings", toolsets: ["desktop", "browser", "engineer", "studio", "media"], mode: "yolo" });
await send({ type: "network", on: true });
await p.waitForTimeout(800);
await p.evaluate(() => { localStorage.setItem("maxx.agent", "1"); });
await p.reload(); await p.waitForTimeout(1500);
await p.click("#rail button[data-tab=preview]"); await p.waitForTimeout(800);
const tasks = ["Start from the html-game template", "Replace the Snake canvas with a full-screen infomercial stage", "Invent the gadget and add its product name and tagline", "Build the gadget logo as inline SVG", "Design the box art panel with CSS and inline SVG", "Apply a retro font theme and VHS styling", "Add a 30-second animated infomercial timeline", "Add audible narration using browser SpeechSynthesis"];
await p.evaluate((tasks: string[]) => {
  const w = window as any, ev = (s: string) => (0, eval)(s);
  ev("busy = true");
  w.drawBoard({ goal: "Make a 30-second VHS infomercial for an invented gadget", state: "running", current: 1, tasks: tasks.map((text, i) => ({ text, status: i === 0 ? "done" : i === 1 ? "doing" : "todo", check: i === 0 ? "index.html opens in the preview" : "page shows a stage and no console errors", tries: 1 })) });
  for (const [n, a, r] of [["snap_page", '{"url":"http://localhost:8000/index.html?scene=s4"}', "ok"], ["grep", '{"pattern":"index.html"}', "index.html:1"], ["read_file", '{"path":"index.html"}', "<!doctype html>"], ["snap_page", '{"url":"http://localhost:8000/index.html?scene=s5"}', "ok"], ["snap_page", '{"url":"http://localhost:8000/index.html?scene=s6"}', "ok"]]) ev("toolCard")(n, a, r);
  w.progress({ phase: "thinking", title: "Thinking", tokens: 187, elapsedMs: 40000, generatingMs: 8000, preview: "7=337. So ring passes through text region at y=337, below text baseline 326. So text is above ring." });
}, tasks);
await p.waitForTimeout(400);
await p.screenshot({ path: join(OUT, "1-busy.png") });
// The grouped menus, open.
for (const [btn, name] of [["#toolsBtn", "2-tools-menu"], ["#tuneBtn", "3-settings-menu"]] as const) {
  if (await p.$(btn)) { await p.click(btn); await p.waitForTimeout(200); await p.screenshot({ path: join(OUT, name + ".png") }); await p.keyboard.press("Escape"); }
}
for (const [m, name] of [[{ type: "chat" }, "4-chat"], [{ type: "research" }, "5-research"]] as const) {
  await send(m); await p.waitForTimeout(900); await p.screenshot({ path: join(OUT, name + ".png") });
}
console.log("shots in", OUT);
await browser.close(); ui.stop(); lm.stop(); process.exit(0);
