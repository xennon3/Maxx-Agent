#!/usr/bin/env bun
// Shows how a turn ends in `maxx ui`: the Plan reconciled (✓ done, ✗ not done
// with why), the ✅ / ⚠ report line, and an error that stays until dismissed.
// Screenshots go to sim/out/wrapup.
import { mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
const ROOT = resolve(import.meta.dir, "..");
const OUT = join(ROOT, "sim", "out", "wrapup");
rmSync(OUT, { recursive: true, force: true });
const proj = join(OUT, "weather-card"); mkdirSync(proj, { recursive: true });
process.env.MAXX_HOME = join(OUT, "home");
const { startUI } = await import(ROOT + "/src/ui/server.ts");
const ui = await startUI({ baseURL: "http://127.0.0.1:9/v1", port: 0, open: false, cwd: proj });
const { chromium } = require("playwright");
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1025, height: 760 }, deviceScaleFactor: 2 });
await p.goto(ui.link);
await p.waitForTimeout(1500);
const shot = async (name: string, f: () => void) => {
  await p.evaluate(f);
  await p.waitForTimeout(300);
  await p.screenshot({ path: join(OUT, name) });
};
await shot("1-not-finished.png", () => {
  const w = window as any;
  w.drawPlan([
    { text: "Create index.html with the card layout", done: true },
    { text: "Fetch the forecast from the weather API", done: true },
    { text: "Add the 5-day strip and icons", done: false, missed: true, why: "the icon font did not load" },
    { text: "Start a server and check it in the preview", done: false, missed: true },
  ]);
  w.on({ type: "token", text: "Built the card and the live forecast. The 5-day strip is still missing its icons.\n\n⚠ Not finished · plan 2 of 4 steps done · left: 3. Add the 5-day strip and icons (the icon font did not load); 4. Start a server and check it in the preview" });
});
await shot("2-done.png", () => {
  const w = window as any;
  w.on({ type: "done" });
  w.drawPlan([
    { text: "Add the 5-day strip and icons", done: true },
    { text: "Start a server and check it in the preview", done: true },
  ]);
  w.on({ type: "token", text: "Added the icons (inline SVG now) and checked it at phone size.\n\n✅ Done · plan 2 of 2 steps done · syntax check of index.html passed" });
});
await shot("3-error-stays.png", () => {
  const w = window as any;
  w.on({ type: "error", text: "400 Bad Request: the request has more tokens than the model's context (65536)" });
  // A turn ending redraws the transcript; the error bar stays.
  w.on({ type: "busy", busy: false });
});
await browser.close(); ui.stop(); process.exit(0);
