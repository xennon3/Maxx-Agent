#!/usr/bin/env bun
// Shows ⚡ auto-run in `maxx ui`: a waiting card, "Allow & auto-run", and the
// safety net still asking for a risky command. Screenshots go to sim/out/autorun.
import { mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
const ROOT = resolve(import.meta.dir, "..");
const OUT = join(ROOT, "sim", "out", "autorun");
rmSync(OUT, { recursive: true, force: true });
const proj = join(OUT, "snake"); mkdirSync(proj, { recursive: true });
process.env.MAXX_HOME = join(OUT, "home");
const steps: object[] = [
  { tool_calls: [{ index: 0, id: "c1", type: "function", function: { name: "bash", arguments: JSON.stringify({ command: "npm install --save-dev vite" }) } }] },
  { tool_calls: [{ index: 0, id: "c2", type: "function", function: { name: "bash", arguments: JSON.stringify({ command: "echo built" }) } }] },
  { tool_calls: [{ index: 0, id: "c3", type: "function", function: { name: "bash", arguments: JSON.stringify({ command: "git push origin main" }) } }] },
  { content: "Done." },
];
let n = 0;
const llm = Bun.serve({ port: 0, async fetch(req) {
  if (new URL(req.url).pathname.endsWith("/models")) return Response.json({ data: [{ id: "qwen-agentworld-35b" }] });
  await req.json(); await Bun.sleep(300);
  return new Response(`data: ${JSON.stringify({ choices: [{ delta: steps[Math.min(n++, steps.length - 1)] }] })}\n\ndata: [DONE]\n\n`, { headers: { "content-type": "text/event-stream" } });
} });
const { startUI } = await import(ROOT + "/src/ui/server.ts");
const ui = await startUI({ baseURL: `http://127.0.0.1:${llm.port}/v1`, port: 0, open: false, cwd: proj, context: 16384 });
const { chromium } = require("playwright");
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1180, height: 820 } });
await p.goto(ui.link);
await p.waitForTimeout(1200);
await p.evaluate((cwd: string) => (0, eval)("send")({ type: "open", cwd }), proj);
await p.waitForTimeout(1000);
await p.fill("#input", "set up vite, build it and push");
await p.click("#sendBtn");
await p.waitForSelector(".ask:not(.answered)");
await p.waitForTimeout(300);
await p.screenshot({ path: join(OUT, "1-card.png") });
await p.click(".ask:not(.answered) button[data-a=auto]");
await p.waitForSelector(".ask:not(.answered)", { timeout: 15000 });
await p.waitForTimeout(400);
await p.screenshot({ path: join(OUT, "2-auto-on-risky-asks.png") });
await p.click(".ask:not(.answered) button[data-a=no]");
await p.waitForTimeout(1500);
await p.screenshot({ path: join(OUT, "3-done.png") });
await browser.close(); ui.stop(); llm.stop(); process.exit(0);
