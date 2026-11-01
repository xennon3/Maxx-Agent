#!/usr/bin/env bun
// Screenshots of Maxx learning from corrections: Deny with a reason, a
// "no, ..." message, the 📏 Rules dialog, and ↶ Undo.
//   bun sim/learn-demo.ts [outdir]
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const OUT = resolve(process.argv[2] ?? join(import.meta.dir, "out", "learn"));
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
process.env.MAXX_HOME = join(OUT, "home");
const app = join(OUT, "snake");
mkdirSync(app, { recursive: true });
writeFileSync(join(app, "game.js"), "const SPEED = 120;\nconst COLOR = 'green';\n");
Bun.spawnSync(["git", "init", "-q"], { cwd: app });

// A fake model that answers by what it is asked.
type Reply = { text?: string; tool?: { name: string; args: object } };
const queue: Reply[] = [];
const lm = Bun.serve({
  port: 0,
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname.endsWith("/models")) return Response.json({ data: [{ id: "qwen-agentworld-35b-a3b" }] });
    const body = (await req.json()) as { messages: { role: string; content: unknown }[] };
    const sys = String(body.messages[0]?.content ?? "");
    let r: Reply;
    if (sys.startsWith("You turn a user's correction")) {
      const ask = JSON.stringify(body.messages);
      r = { text: ask.includes("signed apk") ? "Never delete the build folder; it holds the signed APK." : ask.includes("undid") ? "Change only what was asked; don't restyle the whole game." : "Keep game speed and colors in config.js, not in game.js." };
    } else r = queue.shift() ?? { text: "Done." };
    const chunk = (d: unknown) => `data: ${JSON.stringify({ choices: [{ delta: d }] })}\n\n`;
    const parts = r.tool ? chunk({ tool_calls: [{ index: 0, id: "c" + Math.random().toString(36).slice(2, 8), function: { name: r.tool.name, arguments: JSON.stringify(r.tool.args) } }] }) : chunk({ content: r.text });
    return new Response(parts + "data: [DONE]\n\n", { headers: { "content-type": "text/event-stream" } });
  },
});
const { startUI } = await import("../src/ui/server.ts");
const ui = await startUI({ baseURL: `http://localhost:${lm.port}/v1`, port: 0, open: false });
const { chromium } = require("playwright");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1360, height: 860 }, colorScheme: process.env.SIM_THEME === "light" ? "light" : "dark" });
const shot = (name: string) => page.screenshot({ path: join(OUT, `${name}.png`) });
const idle = () => page.waitForFunction(() => !(document.querySelector("#sendBtn") as HTMLButtonElement).disabled, null, { timeout: 20000 });
const say = async (text: string) => {
  await page.fill("#input", text);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(300);
};
await page.goto(ui.link);
await page.waitForSelector("#model option", { state: "attached" });
await page.fill("#folder", app);
await page.click("#openBtn");
await page.waitForFunction(() => document.querySelector("#where")!.textContent!.includes("snake"));

// 1. Deny with a reason.
queue.push({ tool: { name: "bash", args: { command: "rm -rf build" } } }, { text: "OK, I left the build folder alone." });
await say("clean up the project before we start");
await page.waitForSelector(".ask .why input");
await page.fill(".ask .why input", "keep the build folder, it has the signed apk");
await shot("1-deny-why");
await page.keyboard.press("Enter");
await idle();
await page.waitForSelector(".msg.learned");
await shot("2-learned-deny");

// 2. Maxx writes, you fix it by hand, Maxx learns from the diff.
await page.selectOption("#mode", "auto-edit");
queue.push({ tool: { name: "write_file", args: { path: "game.js", content: "const SPEED = 80;\nconst COLOR = 'lime';\n" } } }, { text: "Faster snake, brighter color." });
await say("make the snake faster");
await idle();
writeFileSync(join(app, "config.js"), "export const SPEED = 80;\nexport const COLOR = 'lime';\n");
writeFileSync(join(app, "game.js"), "import { SPEED, COLOR } from './config.js';\n");
queue.push({ text: "Added a score counter." });
await say("now add a score counter");
await idle();
await page.waitForFunction(() => document.querySelectorAll(".msg.learned").length >= 1);
await shot("3-learned-handfix");

// 3. Undo a turn, then say what you wanted.
queue.push({ tool: { name: "write_file", args: { path: "game.js", content: "// a whole new neon theme\n" } } }, { text: "Restyled the game in neon." });
await say("make the apple red");
await idle();
await page.click("#undoBtn");
await page.waitForTimeout(500);
queue.push({ text: "Only the apple is red now." });
await say("only the apple, leave everything else");
await idle();
await shot("4-undo-learned");

// 4. The rules dialog.
await page.click("#rulesBtn");
await page.waitForSelector("#ruleList .rule");
await shot("5-rules-dialog");
console.log(`screenshots in ${OUT}`);
await browser.close();
ui.stop?.();
lm.stop();
process.exit(0);
