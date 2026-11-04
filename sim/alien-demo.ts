#!/usr/bin/env bun
// Shows the 👽 typing buddy: the picker for each activity, the alien in the status
// bar of a busy session, and one animated GIF per alien with all its scenes.
// Output goes to sim/out/alien.   bun sim/alien-demo.ts   (THEME=dark for dark)
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { decodePng } from "../src/image.ts";
import { encodeGif } from "../src/gif.ts";
import { ACTS, ALIEN_CSS, CHARS, alienSvg } from "../src/ui/aliens-page.ts";
const ROOT = resolve(import.meta.dir, "..");
const OUT = join(ROOT, "sim", "out", "alien");
rmSync(OUT, { recursive: true, force: true });
const proj = join(OUT, "proj"); mkdirSync(proj, { recursive: true });
process.env.MAXX_HOME = join(OUT, "home");
const lm = Bun.serve({ port: 0, fetch(req) {
  if (new URL(req.url).pathname.endsWith("/models")) return Response.json({ data: [{ id: "qwen-agentworld-35b-a3b" }] });
  return new Response("data: [DONE]\n\n", { headers: { "content-type": "text/event-stream" } });
} });
const { startUI } = await import(ROOT + "/src/ui/server.ts");
const ui = await startUI({ baseURL: `http://127.0.0.1:${lm.port}/v1`, port: 0, open: false, cwd: proj });
const { chromium } = require("playwright");
const browser = await chromium.launch();
const theme = process.env.THEME ?? "light";
const p = await browser.newPage({ viewport: { width: 1280, height: 860 }, colorScheme: theme, deviceScaleFactor: 2 });
p.on("pageerror", (e: any) => console.log("PAGE ERROR", e.message));
await p.goto(ui.link);
await p.waitForTimeout(1200);
const send = (m: any) => p.evaluate((m: any) => (0, eval)("send")(m), m);
await send({ type: "open", cwd: proj, model: "qwen-agentworld-35b-a3b" });
await p.waitForTimeout(800);

// 1. The picker, once per activity.
await p.click("#tuneBtn"); await p.waitForTimeout(200);
await p.screenshot({ path: join(OUT, "0-settings-row.png") });
await p.click("#alienBtn"); await p.waitForTimeout(300);
const acts = Object.keys(ACTS);
for (const [i, a] of acts.entries()) {
  await p.click(`#alActs button:nth-child(${i + 1})`); await p.waitForTimeout(500);
  await (await p.$("#alienDlg"))!.screenshot({ path: join(OUT, `1-picker-${String(i).padStart(2, "0")}-${a}.png`) });
}
await p.keyboard.press("Escape");

// 2. The status bar while busy, one step per scene.
await p.evaluate(() => (0, eval)("busy = true"));
const steps: [string, any][] = [
  ["type", { type: "progress", phase: "text", title: "Answering", tokens: 412, elapsedMs: 9000, generatingMs: 8000, preview: "Here's the new pause menu: Esc opens it" }],
  ["read", { type: "toolStart", name: "read_file", args: '{"path":"src/game.js"}' }],
  ["run", { type: "toolStart", name: "bash", args: '{"command":"npm test"}' }],
  ["web", { type: "toolStart", name: "web_search", args: '{"query":"canvas pointer lock"}' }],
  ["draw", { type: "toolStart", name: "draw_svg", args: '{"path":"logo.svg"}' }],
  ["phone", { type: "toolStart", name: "android_tap", args: '{"x":240,"y":610}' }],
  ["sound", { type: "toolStart", name: "make_sounds", args: '{"what":"laser"}' }],
  ["think", { type: "progress", phase: "thinking", title: "Thinking", tokens: 187, elapsedMs: 6000, generatingMs: 5000, preview: "The pause flag should live in state, so…" }],
  ["wait", { type: "progress", phase: "waiting", title: "Reading the prompt", tokens: 0, elapsedMs: 3000, generatingMs: 0, preview: "" }],
];
for (const [i, [a, m]] of steps.entries()) {
  await p.evaluate((m: any) => (window as any).on(m), m);
  await p.waitForTimeout(900);
  const bar = (await (await p.$("#activity"))!.boundingBox())!;
  await p.screenshot({ path: join(OUT, `2-bar-${i}-${a}.png`), clip: { x: 0, y: bar.y - 120, width: 1280, height: bar.height + 200 } });
}

// 3. One GIF per alien: its ten scenes, frame by frame, with the clock stepped by hand.
const sheet = (char: string) => `<!doctype html><style>${ALIEN_CSS}
body{margin:0;background:${theme === "dark" ? "#1d1d1b" : "#fff"};color:${theme === "dark" ? "#ecebe6" : "#1d1d1b"};font:600 12px system-ui}
#g{display:grid;grid-template-columns:repeat(5,120px);gap:6px;padding:8px;width:max-content}
.t{display:flex;flex-direction:column;align-items:center}.t div{width:112px;height:84px}</style>
<div id="g">${acts.map((a) => `<div class="t"><div>${alienSvg(char, a)}</div>${ACTS[a]!.icon} ${ACTS[a]!.label.replace("Waiting for your OK", "Asking you")}</div>`).join("")}</div>`;
const g = await browser.newPage({ viewport: { width: 700, height: 300 }, deviceScaleFactor: 1 });
for (const char of Object.keys(CHARS)) {
  await g.setContent(sheet(char)); await g.waitForTimeout(200);
  const frames = [];
  for (let f = 0; f < 36; f++) {
    await g.evaluate((t: number) => { for (const a of document.getAnimations()) { a.pause(); a.currentTime = t; } }, f * 100);
    frames.push(decodePng(new Uint8Array(await (await g.$("#g"))!.screenshot())));
  }
  writeFileSync(join(OUT, `3-${char}.gif`), encodeGif(frames, 100));
  await (await g.$("#g"))!.screenshot({ path: join(OUT, `3-${char}.png`) });
}
console.log("shots in", OUT);
await browser.close(); ui.stop(); lm.stop(); process.exit(0);
