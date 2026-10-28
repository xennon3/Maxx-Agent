#!/usr/bin/env bun
// Drives `maxx ui` in a headless browser against the simulated EVO-X2 (fake
// LM Studio, phone and Gradle) and saves screenshots of the app to sim/out/ui.
//   bun sim/ui-demo.ts
import { chmodSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { SETUPS } from "./profile.ts";

const ROOT = resolve(import.meta.dir, "..");
const OUT = join(ROOT, "sim", "out", "ui");
rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, "bin"), { recursive: true });
const app = join(OUT, "projects", "tipcalc");
mkdirSync(app, { recursive: true });
const sh = (p: string, t: string) => (writeFileSync(p, `#!/bin/sh\nexec bun "${t}" "$@"\n`), chmodSync(p, 0o755));
sh(join(OUT, "bin", "adb"), join(ROOT, "sim/fake-adb.ts"));
sh(join(app, "gradlew"), join(ROOT, "sim/fake-gradle.ts"));
writeFileSync(join(app, "settings.gradle.kts"), `rootProject.name = "TipCalc"\ninclude(":app")\n`);
Bun.spawnSync(["git", "init", "-q"], { cwd: app });

Object.assign(process.env, { MAXX_HOME: join(OUT, "home"), MAXX_ADB: join(OUT, "bin", "adb"), SIM_PHONE: join(OUT, "phone.json"), SIM_SPEEDUP: process.env.SIM_SPEEDUP ?? "200" });
const { startServer } = await import("./server.ts");
const { startUI } = await import("../src/ui/server.ts");
const lm = startServer(SETUPS[1]!); // Qwen3.8-27B, thinking off
const ui = await startUI({ baseURL: `http://localhost:${lm.port}/v1`, port: 0, open: false });

const { chromium } = require("playwright");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: process.env.SIM_THEME === "light" ? "light" : "dark" });
const shot = (name: string) => page.screenshot({ path: join(OUT, `${name}.png`) });
await page.goto(ui.link);
await page.waitForSelector("#model option", { state: "attached" });
await shot("1-empty");

await page.fill("#folder", app);
await page.click("#openBtn");
await page.waitForFunction(() => document.querySelector("#where")!.textContent!.includes("tipcalc"));
await page.click("text=📱 Android");
await page.waitForSelector(".chip.on");
await page.fill("#input", "Create an Android tip calculator app and test it on my phone");
await page.keyboard.press("Enter");

// Approve everything Maxx asks for, keeping a picture of the first edit prompt and of the run.
let asks = 0;
const deadline = Date.now() + 120_000;
while (Date.now() < deadline) {
  const btn = page.locator(".ask:not(.answered) button[data-a=yes]").first();
  if (await btn.count()) {
    if (++asks === 2) await shot("2-permission-prompt");
    await btn.click();
    continue;
  }
  if (asks >= 6 && (await page.locator("#screen.on").count()) && !(await page.locator("#screenshot-taken").count())) {
    await page.evaluate(() => document.body.appendChild(Object.assign(document.createElement("i"), { id: "screenshot-taken" })));
    await shot("3-phone-screen");
  }
  if (await page.locator("#sendBtn:not([disabled])").count()) {
    const done = await page.locator("#log .msg").last().textContent();
    if (done && /tip calculator works|wrong/i.test(done)) break;
  }
  await page.waitForTimeout(150);
}
await page.waitForTimeout(400);
await shot("4-done");
const answer = await page.locator("#log .msg").last().textContent();
console.log(`asked ${asks} times; final reply: ${answer}`);
console.log(`screenshots in ${OUT}`);
await browser.close();
ui.stop();
lm.stop(true);
process.exit(/tip calculator works/.test(answer ?? "") ? 0 : 1);
