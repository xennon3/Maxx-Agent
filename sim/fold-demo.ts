#!/usr/bin/env bun
// Shows the folding task board, Plan and live code preview in `maxx ui`, Agent mode.
// Screenshots go to sim/out/fold.
import { mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
const ROOT = resolve(import.meta.dir, "..");
const OUT = join(ROOT, "sim", "out", "fold");
rmSync(OUT, { recursive: true, force: true });
const proj = join(OUT, "lv-lab"); mkdirSync(proj, { recursive: true });
process.env.MAXX_HOME = join(OUT, "home");
const { startUI } = await import(ROOT + "/src/ui/server.ts");
const ui = await startUI({ baseURL: "http://127.0.0.1:9/v1", port: 0, open: false, cwd: proj });
const { chromium } = require("playwright");
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1025, height: 900 } });
await p.goto(ui.link);
await p.waitForTimeout(1500);
const tasks = ["Replace the notes UI with a lab shell: title, circuit canvas, component palette, mode tabs, and experiment sidebar", "Add draggable circuit components to the canvas: battery, resistor, capacitor, LED, NPN transistor, and wire", "Add wire drawing between component terminals with snap-to-grid connection state", "Build a simplified circuit graph and DC solver for batteries, resistors, LEDs, and wires", "Add capacitor charge/discharge simulation with a time step and visual voltage bar", "Add a simplified NPN transistor switch/amplifier model with base threshold and collector-emitter current", "Add a voltmeter tool that places probes on two nodes and displays voltage", "Add guided experiments with preset circuits, instructions, and success checks", "Add arbitrary circuit mode controls: clear, undo, save, and load circuit JSON", "Add educational tooltips and warnings for short circuits and overvoltage", "Make the lab layout responsive and keyboard accessible"];
await p.evaluate((tasks: string[]) => {
  const w = window as any;
  (0, eval)("busy = true");
  w.drawBoard({ goal: "Build an interactive electronics lab", state: "running", current: 1, tasks: tasks.map((text, i) => ({ text, status: i === 0 ? "done" : i === 1 ? "doing" : "todo", check: "it works in the preview", tries: 1 })) });
  w.drawPlan([{ text: "use_template web app", done: true }, ...tasks.slice(0, 7).map((text) => ({ text, done: false }))]);
  const code = Array.from({ length: 86 }, (_, i) => "  <div class=\"row\">line " + i + "</div>").join("\n");
  w.progress({ phase: "tool", title: "Writing lv-lab/static/index.html", tool: { index: 0, name: "write_file" }, preview: code, tokens: 1232, elapsedMs: 25000, generatingMs: 23000, lines: 86 });
}, tasks);
await p.waitForTimeout(300);
await p.screenshot({ path: join(OUT, "1-unfolded.png") });
await p.click("#board .head"); await p.click("#plan .head"); await p.click(".tool.live summary");
await p.waitForTimeout(300);
await p.screenshot({ path: join(OUT, "2-folded.png") });
await p.reload(); await p.waitForTimeout(1500);
const kept = await p.evaluate(() => (0, eval)("JSON.stringify(fold)"));
console.log("after reload:", kept);
await browser.close(); ui.stop(); process.exit(0);
