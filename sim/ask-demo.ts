#!/usr/bin/env bun
// Reproduces the hidden "Allow bash?" card: Agent mode, board and Plan open, a short window.
import { mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
const ROOT = resolve(import.meta.dir, "..");
const OUT = join(ROOT, "sim", "out", "ask");
rmSync(OUT, { recursive: true, force: true });
const proj = join(OUT, "app"); mkdirSync(proj, { recursive: true });
process.env.MAXX_HOME = join(OUT, "home");
const { startUI } = await import(ROOT + "/src/ui/server.ts");
const ui = await startUI({ baseURL: "http://127.0.0.1:9/v1", port: 0, open: false, cwd: proj });
const { chromium } = require("playwright");
const browser = await chromium.launch();
const H = Number(process.argv[2] || 700);
const p = await browser.newPage({ viewport: { width: 1400, height: H } });
await p.goto(ui.link);
await p.waitForTimeout(1500);
const tasks = Array.from({ length: 9 }, (_, i) => "Task number " + (i + 1) + " for the Android app");
await p.evaluate((tasks: string[]) => {
  const w = window as any;
  (0, eval)("busy = true");
  w.drawBoard({ goal: "Build an Android app", state: "running", current: 3, tasks: tasks.map((text, i) => ({ text, status: i < 3 ? "done" : i === 3 ? "doing" : "todo", check: "it builds", tries: 1 })) });
  w.drawPlan(tasks.slice(0, 6).map((text, i) => ({ text, done: i < 3 })));
  for (let i = 0; i < 14; i++) w.toolCard ? 0 : 0;
  for (let i = 0; i < 14; i++) w.add(Object.assign(document.createElement("div"), { className: "msg note", textContent: "Step " + i + " of the work so far, a line of narration." }));
  w.askCard({ id: "a1", question: "Allow bash?", preview: "$ ./gradlew assembleDebug --console=plain -q 2>&1 | tail -30" });
}, tasks);
await p.waitForTimeout(400);
await p.screenshot({ path: join(OUT, "ask-" + H + ".png") });
const r = await p.evaluate(() => {
  const b = document.querySelector("#okdock .ask .btns")!.getBoundingClientRect();
  const log = document.getElementById("log")!.getBoundingClientRect();
  const act = document.getElementById("activity")!.getBoundingClientRect();
  const l = document.getElementById("log")!;
  return { btnsTop: b.top, btnsBottom: b.bottom, logTop: log.top, logBottom: log.bottom, actTop: act.top, logH: l.clientHeight, scrollH: l.scrollHeight, scrollTop: l.scrollTop, inner: innerHeight, mainH: document.querySelector("main")!.getBoundingClientRect().height };
});
console.log(JSON.stringify(r), "buttons visible:", r.btnsBottom <= r.inner && r.btnsTop >= 0);
// Answer by keyboard: Y allows, and the card goes back into the transcript.

await p.keyboard.press("y");
await p.waitForTimeout(200);
console.log("after Y:", await p.evaluate(() => ({ dock: document.getElementById("okdock")!.classList.contains("on"), inLog: !!document.querySelector("#log .ask.answered"), label: document.querySelector("#log .ask .btns")?.textContent, title: document.title })));
await p.evaluate(() => { (0, eval)("busy = true"); (window as any).askCard({ id: "a2", question: "Allow bash?", preview: "$ adb install app-debug.apk" }); });
await p.keyboard.press("Tab");
console.log("Tab focus:", await p.evaluate(() => document.activeElement?.textContent));
await p.screenshot({ path: join(OUT, "ask-" + H + "-second.png") });
await browser.close(); ui.stop(); process.exit(0);
