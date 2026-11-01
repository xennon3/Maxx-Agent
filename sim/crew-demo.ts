#!/usr/bin/env bun
// Drives Crew mode in `maxx ui` with a scripted LM Studio that has two models:
// "qwen-agentworld-35b-a3b" answers one request at a time (so a worker waits
// for it) and "qwen3.8-27b" answers two at once. The goal splits into five
// tasks; two run after the template, two workers clash on index.html and the
// later one sorts it out. Screenshots go to sim/out/crew.
//   bun sim/crew-demo.ts
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
const ROOT = resolve(import.meta.dir, "..");
const OUT = join(ROOT, "sim", "out", "crew");
rmSync(OUT, { recursive: true, force: true });
const app = join(OUT, "weather");
mkdirSync(app, { recursive: true });
process.env.MAXX_HOME = join(OUT, "home");
mkdirSync(process.env.MAXX_HOME, { recursive: true });
writeFileSync(join(process.env.MAXX_HOME, "crew.json"), JSON.stringify({ workers: 3, models: ["qwen-agentworld-35b-a3b", "qwen3.8-27b"] }));
writeFileSync(join(process.env.MAXX_HOME, "agent.json"), JSON.stringify({ judge: false, briefing: false }));
Bun.spawnSync(["git", "init", "-q"], { cwd: app });

const page = (extra: string) => `<!doctype html><html><head><title>Weather</title><link rel=stylesheet href=style.css></head><body><h1>Weather</h1>${extra}<script src=app.js></script></body></html>\n`;
const W = (path: string, content: string) => ({ tool: ["write_file", { path, content }] });
const byTask: Record<string, any[]> = {
  t1: [W("index.html", page("<main id=today></main>")), W("app.js", "// weather app\n"), "DONE the page skeleton opens"],
  t2: [W("style.css", "body{font:16px system-ui;margin:0;background:#e7f5ff}h1{background:#1971c2;color:#fff;margin:0;padding:12px}\n"), "DONE styled for phones"],
  t3: [W("index.html", page("<main id=today></main>\n<input id=city placeholder='City'>")), W("search.js", "export function search(q){return fetch('/api?q='+q)}\n"), "DONE city search box"],
  t4: [W("index.html", page("<main id=today></main>\n<section id=week></section>")), W("forecast.js", "export function week(d){return d.slice(0,5)}\n"), "DONE 5-day forecast strip"],
  "t4-resolve": [W("index.html", page("<main id=today></main>\n<input id=city placeholder='City'>\n<section id=week></section>")), "DONE kept the search box and the forecast"],
  t5: [W("README.md", "# Weather\nOpen index.html.\n"), "DONE"],
  final: ["DONE the search box and the forecast both load"],
};
const plan = [
  "1. Start the page skeleton | check: index.html opens | after: - | files: index.html, app.js",
  "2. Style it for phones | check: it fits a 390px screen | after: 1 | files: style.css",
  "3. Add a city search box | check: typing a city shows it | after: 1",
  "4. Add a 5-day forecast strip | check: five days show | after: 1",
  "5. Write a README | check: README.md says how to open it | after: - | files: README.md",
].join("\n");

const sse = (chunks: any[]) => new Response(chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join("") + "data: [DONE]\n\n", { headers: { "content-type": "text/event-stream" } });
let serial: Promise<unknown> = Promise.resolve();
const lm = Bun.serve({
  port: 0,
  idleTimeout: 120,
  async fetch(req) {
    const u = new URL(req.url);
    if (u.pathname.endsWith("/models")) return Response.json({ data: [{ id: "qwen-agentworld-35b-a3b" }, { id: "qwen3.8-27b" }] });
    const body = (await req.json()) as any;
    const wait = (ms: number) => (body.model.startsWith("qwen-agentworld") ? (serial = serial.then(() => Bun.sleep(ms))) : Bun.sleep(ms));
    if (!body.stream) return await wait(150), Response.json({ choices: [{ message: { content: "1 2 3" } }] });
    const sys = String(body.messages[0].content);
    if (sys.startsWith("You plan work for a crew")) return await Bun.sleep(800), sse([{ choices: [{ delta: { content: plan } }] }]);
    await wait(1400);
    const texts = body.messages.filter((m: any) => m.role === "user").map((m: any) => (typeof m.content === "string" ? m.content : m.content.map((p: any) => p.text ?? "").join("")));
    const first = texts.find((t: string) => /Do task \d+ now|tasks are all merged/.test(t)) ?? "";
    const key = /tasks are all merged/.test(first) ? "final" : `t${first.match(/Do task (\d+) now/)?.[1]}`;
    const next = byTask[/clashes with work/.test(texts.at(-1)) ? `${key}-resolve` : key]?.shift() ?? "DONE";
    if (typeof next === "string") return sse([{ choices: [{ delta: { content: next } }] }]);
    return sse([{ choices: [{ delta: { tool_calls: [{ index: 0, id: "c" + Math.random(), type: "function", function: { name: next.tool[0], arguments: JSON.stringify(next.tool[1]) } }] } }] }]);
  },
});
const { startUI } = await import(ROOT + "/src/ui/server.ts");
const ui = await startUI({ baseURL: `http://127.0.0.1:${lm.port}/v1`, port: 0, open: false, context: 65536 });
const { chromium } = require("playwright");
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1440, height: 940 }, colorScheme: process.env.THEME ?? "light" });
p.on("pageerror", (e: any) => console.log("PAGE ERROR", e.message));
const shot = (n: string) => p.screenshot({ path: join(OUT, n + ".png") });
await p.goto(ui.link);
await p.waitForSelector("#model option", { state: "attached" });
await p.fill("#folder", app);
await p.click("#openBtn");
await p.waitForFunction(() => document.querySelector("#where")!.textContent!.includes("weather"));
await p.click("#crewBtn");
await p.fill("#input", "Build a weather web app with a city search and a 5-day forecast");
await shot("1-goal");
await p.keyboard.press("Enter");
await p.waitForSelector(".wk.queued", { timeout: 60000 });
await p.waitForTimeout(300);
await shot("2-running");
await p.waitForSelector(".card.fixing", { timeout: 90000 }).catch(() => console.log("(no clash caught on screen)"));
await shot("3-clash");
await p.waitForSelector("#sendBtn:not([disabled])", { timeout: 120000 });
await p.waitForTimeout(500);
await shot("4-done");
await p.click("#crewCfg");
await p.waitForTimeout(200);
await shot("5-settings");
console.log(await p.locator("#board").innerText());
console.log(Bun.spawnSync(["ls", app]).stdout.toString());
console.log(await Bun.file(join(app, "index.html")).text());
await browser.close();
ui.stop();
lm.stop();
process.exit(0);
