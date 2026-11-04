#!/usr/bin/env bun
// Drives the Sound lab in `maxx ui` in a headless browser: a scripted model
// starts the Snake template, then calls make_sounds for spooky music and an
// explosion. The lab lists them, plays a song with its piano roll, and edits
// an effect. Screenshots go to sim/out/sound.   bun sim/sound-demo.ts
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
const ROOT = resolve(import.meta.dir, "..");
const OUT = join(ROOT, "sim", "out", "sound");
rmSync(OUT, { recursive: true, force: true });
const app = join(OUT, "arcade");
mkdirSync(app, { recursive: true });
Bun.spawnSync(["git", "init", "-q"], { cwd: app });
process.env.MAXX_HOME = join(OUT, "home");

const lm = Bun.serve({ port: 0, async fetch(req) {
  const u = new URL(req.url);
  if (u.pathname.endsWith("/models")) return Response.json({ data: [{ id: "qwen3-vl-4b" }] });
  const body = await req.json() as any;
  const tools = body.messages.filter((m: any) => m.role === "tool").length;
  const sse = (chunks: any[]) => new Response(chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join("") + "data: [DONE]\n\n", { headers: { "content-type": "text/event-stream" } });
  const call = (name: string, args: any) => sse([{ choices: [{ delta: { tool_calls: [{ index: 0, id: "c" + tools, type: "function", function: { name, arguments: JSON.stringify(args) } }] } }] }, { choices: [{ delta: {}, finish_reason: "tool_calls" }] }]);
  await Bun.sleep(200);
  if (tools === 0) return call("use_template", { template: "html-game", name: "Ghost Snake" });
  if (tools === 1) return call("make_sounds", { music: [{ name: "theme", mood: "spooky" }], effects: [{ name: "eat", describe: "wobbly echo coin" }, { name: "boom", describe: "deep crunchy explosion" }, { name: "win", describe: "victory fanfare" }] });
  return sse([{ choices: [{ delta: { content: "Ghost Snake now has spooky music, a wobbly coin and a crunchy explosion." } }] }, { choices: [{ delta: {}, finish_reason: "stop" }] }]);
} });
const { startUI } = await import(ROOT + "/src/ui/server.ts");
const ui = await startUI({ baseURL: `http://127.0.0.1:${lm.port}/v1`, port: 0, open: false });
const { chromium } = require("playwright");
const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: process.env.THEME ?? "dark" });
const errors: string[] = [];
page.on("pageerror", (e: any) => { errors.push(e.message); console.log("PAGE ERROR", e.message); });
const shot = (n: string) => page.screenshot({ path: join(OUT, n + ".png") });
await page.goto(ui.link);
await page.waitForSelector("#model option", { state: "attached" });
await page.fill("#folder", app);
await page.click("#openBtn");
await page.waitForFunction(() => document.querySelector("#where")!.textContent!.includes("arcade"));
await page.evaluate((v: string) => (0, eval)("send")({ type: "settings", mode: v }), "yolo");
await page.fill("#input", "Make a spooky snake game with sound");
await page.keyboard.press("Enter");
await page.waitForSelector("#sendBtn:not([disabled])", { timeout: 30000 });
await page.waitForTimeout(1200);
console.log("reply:", await page.locator("#log .msg").last().textContent());
console.log("sound dot:", await page.locator("#dotSound").getAttribute("class"));
await page.click("#rail button[data-tab=sound]");
await page.waitForSelector("#sndFx .snd-row");
console.log("effects:", (await page.locator("#sndFx .nm").allTextContents()).join(", "));
console.log("songs:", (await page.locator("#sndSongs .ds").allTextContents()).join(" | "));
await page.click("#sndSongs .snd-row .ds");
await page.waitForTimeout(1500);
await shot("1-song");
await page.click("#sndFx .snd-row:has-text('boom') .ds");
await page.fill("#sndEd input[placeholder^='Describe']", "longer echo");
await page.click("#sndEd button[data-a=words]");
await page.waitForTimeout(300);
await shot("2-effect");
await page.fill("#sndAsk", "shoot short laser");
await page.click("#sndAdd");
await page.click("#sndSave");
await page.waitForFunction(() => document.querySelector("#sndSave")!.textContent!.includes("Saved"));
const file = readFileSync(join(app, "sound.js"), "utf8");
console.log("saved shoot:", file.includes('"shoot"'), "boom echo:", /"boom": \{[^}]*"echo":0\.5/.test(file));
await shot("3-saved");
// The game itself, with its sounds, in Preview.
await page.click("#rail button[data-tab=preview]");
await page.fill("#pvUrl", "index.html");
await page.keyboard.press("Enter");
await page.waitForTimeout(1500);
await page.frameLocator("#pvFrame").locator("canvas").click();
await page.keyboard.press("ArrowUp");
await page.waitForTimeout(500);
console.log("game console:", await page.locator("#pvConsSum").textContent(), (await page.locator("#pvRows .row").allTextContents()).join(" / "));
console.log("game Sound:", await page.frameLocator("#pvFrame").locator("body").evaluate(() => JSON.stringify((window as any).Sound.names())));
await shot("4-game");
await browser.close();
ui.stop?.();
lm.stop();
console.log(errors.length ? "page errors: " + errors.length : "no page errors");
process.exit(0);
