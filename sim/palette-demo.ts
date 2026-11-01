#!/usr/bin/env bun
// Screenshots of the 🎨 palette picker and a chat whose chart and diagram follow it.
//   bun sim/palette-demo.ts [outdir]
import { mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

const OUT = resolve(process.argv[2] ?? join(import.meta.dir, "out", "palette"));
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
process.env.MAXX_HOME = join(OUT, "home");

const prompts: string[] = [];
const ANSWER = [
  "Here is the quarter at a glance.",
  "```chart",
  '{"type":"bar","data":{"labels":["Jan","Feb","Mar","Apr"],"datasets":[{"label":"Coffee","data":[12,19,9,15]},{"label":"Tea","data":[7,11,14,8]},{"label":"Cocoa","data":[3,6,5,10]}]}}',
  "```",
  "And how an order flows:",
  "```mermaid",
  "flowchart LR",
  '  A["Order"] --> B{"In stock?"}',
  "  B -- yes --> C[Pack] --> D[Ship]",
  "  B -- no --> E[Backorder] --> C",
  "```",
].join("\n");
const lm = Bun.serve({
  port: 0,
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname.endsWith("/models")) return Response.json({ data: [{ id: "qwen-demo" }] });
    const body = (await req.json()) as { messages: { role: string; content: unknown }[] };
    prompts.push(JSON.stringify(body.messages));
    const chunk = (d: unknown) => `data: ${JSON.stringify({ choices: [{ delta: d }] })}\n\n`;
    return new Response(chunk({ content: ANSWER }) + `data: ${JSON.stringify({ choices: [{ delta: {}, finish_reason: "stop" }] })}\n\ndata: [DONE]\n\n`, { headers: { "content-type": "text/event-stream" } });
  },
});
const { startUI } = await import("../src/ui/server.ts");
const ui = await startUI({ baseURL: `http://localhost:${lm.port}/v1`, port: 0, open: false });
const { chromium } = require("playwright");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1360, height: 860 }, colorScheme: process.env.SIM_THEME === "light" ? "light" : "dark" });
const shot = (name: string) => page.screenshot({ path: join(OUT, `${name}.png`) });
await page.goto(ui.link);
await page.waitForSelector("#model option", { state: "attached" });
await page.click("#chatBtn");
await page.waitForFunction(() => document.querySelector("#where")!.textContent!.includes("Chat"));

await page.click("#palBtn");
await page.waitForSelector(".pal");
await page.fill("#palSpec", "#ff6600 triad");
await shot("1-picker");
await page.click('#palDlg button[value=cancel]');
await page.click("#palBtn");
await page.click('.pal:has-text("synthwave")');
await page.waitForFunction(() => document.querySelector("#palBtn")!.textContent!.includes("synthwave"));
await page.fill("#input", "chart my drink sales and draw the order flow");
await page.keyboard.press("Enter");
await page.waitForSelector(".vis .body.mermaid svg", { timeout: 20000 });
await page.waitForTimeout(800);
await shot("2-chat-synthwave");

await page.click("#palBtn");
await page.click('#palDlg button[value=random]');
await page.waitForTimeout(1200);
await shot("3-chat-random");
console.log("palette in system prompt:", prompts.some((p) => p.includes('Color palette \\"synthwave\\"')));
console.log(`screenshots in ${OUT}`);
await browser.close();
ui.stop();
lm.stop(true);
process.exit(0);
