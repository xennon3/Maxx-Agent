#!/usr/bin/env bun
// Replays the DeepSeek stop on the EVO in `maxx ui`: a model loaded at 8192
// tokens (Maxx was told 65536) sends its thinking as the reply, cut off at a
// colon. Maxx folds it away, asks again, and gets the answer.
// Screenshots go to sim/out/unfinished.
import { mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
const ROOT = resolve(import.meta.dir, "..");
const OUT = join(ROOT, "sim", "out", "unfinished");
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
process.env.MAXX_HOME = join(OUT, "home");

const LEAKED = "I keep repeating the same search. The results show the bulb is an SVG path with id bulb. Let me think about how to make it glow. I need to set the fill, and maybe a drop-shadow filter for the glow. Wait, the user wants it to toggle on click. I'll set bulb fill via JS:";
const ANSWER = "Give the bulb a click handler that flips its fill and adds a glow:\n\n```html\n<svg width=\"120\" height=\"160\" viewBox=\"0 0 120 160\"><circle id=\"bulb\" cx=\"60\" cy=\"60\" r=\"44\" fill=\"#555\" stroke=\"#222\" stroke-width=\"4\"/><rect x=\"40\" y=\"104\" width=\"40\" height=\"34\" rx=\"6\" fill=\"#888\"/></svg>\n<p style=\"font:14px sans-serif\">Click the bulb</p>\n<script>\nconst b = document.getElementById('bulb');\nb.style.cursor = 'pointer';\nb.onclick = () => { const on = b.getAttribute('fill') === '#555'; b.setAttribute('fill', on ? '#ffd84d' : '#555'); b.style.filter = on ? 'drop-shadow(0 0 18px #ffd84d)' : ''; };\n</script>\n```\n\nClick it once to light it, again to switch it off.";
let n = 0;
const model = Bun.serve({
  port: 0,
  async fetch(req) {
    if (new URL(req.url).pathname.endsWith("/models")) return Response.json({ data: [{ id: "deepseek-v4.1-flash", context_length: 8192 }] });
    await req.json();
    const text = n++ === 0 ? LEAKED : ANSWER;
    const chunks = (text.match(/.{1,12}/gs) ?? []).map((c) => ({ choices: [{ delta: { content: c } }] }));
    chunks.push({ choices: [{ delta: {}, finish_reason: "stop" }] } as any);
    const body = new ReadableStream({
      async start(ctl) {
        for (const c of chunks) { ctl.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(c)}\n\n`)); await Bun.sleep(4); }
        ctl.enqueue(new TextEncoder().encode("data: [DONE]\n\n")); ctl.close();
      },
    });
    return new Response(body, { headers: { "content-type": "text/event-stream" } });
  },
});

const { startUI } = await import(ROOT + "/src/ui/server.ts");
const ui = await startUI({ baseURL: `http://127.0.0.1:${model.port}/v1`, port: 0, open: false, context: 65536, thinking: "max" });
const { chromium } = require("playwright");
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1025, height: 820 } });
await p.goto(ui.link);
await p.waitForTimeout(1200);
await p.click("#chatBtn");
await p.waitForTimeout(800);
await p.fill("#input", "make the bulb glow yellow when I click it");
await p.click("#sendBtn");
await p.waitForFunction(() => document.querySelector(".msg.retracted") && !(document.getElementById("sendBtn") as HTMLButtonElement).disabled, null, { timeout: 15000 });
await p.waitForTimeout(1500);
await p.screenshot({ path: join(OUT, "1-retried.png") });
await p.click(".msg.retracted summary");
await p.waitForTimeout(300);
await p.screenshot({ path: join(OUT, "2-thinking-open.png") });
console.log(await p.evaluate(() => [...document.querySelectorAll(".msg.note, .msg.retracted summary")].map((e) => e.textContent).join("\n")));
await browser.close(); ui.stop(); model.stop(); process.exit(0);
