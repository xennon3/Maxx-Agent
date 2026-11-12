#!/usr/bin/env bun
// Paints the answer from Luther's screenshot (an ASCII architecture diagram, ## headings and a
// table that showed as raw text) in `maxx ui`, in a few themes. Shots go to sim/out/markdown.
//   bun sim/markdown-demo.ts [skin,skin...]
import { mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
const ROOT = resolve(import.meta.dir, "..");
const ONLY = (process.argv[2] ?? "abduction,classic,phosphor,blueprint").split(",");
const OUT = join(ROOT, "sim", "out", "markdown");
rmSync(OUT, { recursive: true, force: true });
const proj = join(OUT, "stt"); mkdirSync(proj, { recursive: true });
process.env.MAXX_HOME = join(OUT, "home");
const lm = Bun.serve({ port: 0, fetch(req) {
  if (new URL(req.url).pathname.endsWith("/models")) return Response.json({ data: [{ id: "unsloth-ud-iq4_xs" }] });
  return new Response("data: [DONE]\n\n", { headers: { "content-type": "text/event-stream" } });
} });
const F = "\x60\x60\x60";
export const ANSWER = `## Shape of it

Two processes, one socket. The transcribing machine is the **server**; the other device is a **thin viewer** that only ever receives text (a few KB/s — no audio ever crosses the wire).

${F}
┌──────────────── TRANSCRIBER (one machine) ─────────────────┐
│                                                            │
│ ① CAPTURE        ② PRE-PROCESS       ③ ASR WORKERS         │
│ mic / loopback → resample 16k mono → VAD (Silero)          │
│ 48k float32      ring buffer,        ↓ 20-40 ms chunks     │
│ (sounddevice,    high-pass, gain     rolling window        │
│  WASAPI,         ↓                                         │
│  WebAudio)       queue w/ backpressure → streaming model   │
│                                        (Parakeet/Canary    │
│                                         streaming, or      │
│                                         whisper.cpp +      │
│                                         LocalAgreement)    │
│                                              ↓             │
│                   ④ TEXT STAGE: segment id + partial/      │
│                     final flag, punctuation, diff          │
│                                              ↓             │
│                   ⑤ HUB: fan-out, seq #, last-N cache      │
│                     ├─ HTTP :8080  (index.html, /api/hist) │
│                     └─ WS   :8080/ws (push)                │
│                     ⊕ mDNS _stt._local → auto-discover     │
└───────────────────────────┬────────────────────────────────┘
                            │  WebSocket, plain JSON, LAN only
              ┌─────────────┴──────────────┐
        ⑥ VIEWER A                    ⑦ VIEWER B
        browser (ws + diff renderer)  phone / second app
${F}

## The contracts between stages

| Boundary | Handoff | Why |
|---|---|---|
| ①→② | \x60float32[]\x60 at device rate | capture thread must never block or compute |
| ②→③ | \x60int16\x60 PCM **@ 16 kHz mono**, 10–30 ms frames | every ASR model wants exactly this |
| ③→④ | \x60{seg_id, text, is_final, ts}\x60 | partials get revised; finals are immutable |
| ⑤→⑥⑦ | JSON over WebSocket | browsers speak it natively, no client install |

### What to build first
1. Capture → file, to check the audio is clean
2. Add the ASR worker and print finals
   - partials come later
   - [x] pick the model
3. Then the hub and a viewer

> Keep audio on one machine; only text crosses the network.

✅ Done`;
const { startUI } = await import(ROOT + "/src/ui/server.ts");
const ui = await startUI({ baseURL: `http://127.0.0.1:${lm.port}/v1`, port: 0, open: false, cwd: proj });
const { chromium } = require("playwright");
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1280, height: 1500 }, colorScheme: "dark", deviceScaleFactor: 1 });
p.on("pageerror", (e: any) => console.log("PAGE ERROR", e.message));
await p.goto(ui.link);
await p.waitForTimeout(1200);
await p.evaluate((proj: string) => (0, eval)("send")({ type: "open", cwd: proj, model: "unsloth-ud-iq4_xs" }), proj);
await p.waitForTimeout(900);
await p.evaluate((text: string) => {
  const ev = (s: string) => (0, eval)(s);
  ev("userMsg")("What would the architecture of this program look like? I'm capturing live audio, transcribing it, and sharing the text with another device on the same network.");
  const el = ev("add")(ev("div")("msg"));
  ev("paintReply")(el, text, false);
}, ANSWER);
await p.waitForTimeout(500);
for (const id of ONLY) {
  await p.evaluate((id: string) => (0, eval)("skinApply")(id), id);
  await p.waitForTimeout(600);
  await p.evaluate(() => { const l = document.getElementById("log")!; l.scrollTop = 0; });
  await p.screenshot({ path: join(OUT, `${id}.png`) });
}
console.log("shots in", OUT);
await browser.close(); ui.stop(); lm.stop(); process.exit(0);
