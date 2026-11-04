#!/usr/bin/env bun
// Screenshots for the tier-1 tools: the 🧰 chip, 🎨 Studio, a saved recipe, and make_icons output.
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
const ROOT = resolve(import.meta.dir, "..");
const OUT = join(ROOT, "sim", "out", "tools");
rmSync(OUT, { recursive: true, force: true });
const proj = join(OUT, "app"); mkdirSync(proj, { recursive: true });
process.env.MAXX_HOME = join(OUT, "home");
process.env.MAXX_BROWSER ??= "/opt/pw-browsers/chromium";
const { startUI } = await import(ROOT + "/src/ui/server.ts");
const ui = await startUI({ baseURL: "http://127.0.0.1:9/v1", port: 0, open: false, cwd: proj });
const { chromium } = require("playwright");
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await p.goto(ui.link);
await p.waitForTimeout(1500);
await p.evaluate((cwd: string) => (0, eval)("send")({ type: "open", cwd, model: "qwen3.8-27b" }), proj);
await p.waitForTimeout(1500);
await p.click("#toolsBtn"); await p.click("#toolsList");
await p.evaluate(() => (window as any).on({ type: "recipe", name: "add-settings-screen", when: "add a settings screen with saved preferences to an Android app", path: ".maxx/recipes/add-settings-screen.md" }));
await p.waitForTimeout(300);
await p.screenshot({ path: join(OUT, "1-tools-and-recipe.png") });

// make_icons on a real logo, shown as a contact sheet.
const { makeIcons } = await import(ROOT + "/src/tools/studio.ts");
writeFileSync(join(proj, "logo.svg"), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff5f6d"/><stop offset="1" stop-color="#ffc371"/></linearGradient></defs><rect x="4" y="4" width="56" height="56" rx="14" fill="url(#g)"/><path d="M18 44V20l14 14 14-14v24" fill="none" stroke="#1e1b4b" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>');
mkdirSync(join(proj, "app/src/main/res"), { recursive: true });
writeFileSync(join(proj, "app/src/main/AndroidManifest.xml"), '<manifest xmlns:android="http://schemas.android.com/apk/res/android">\n    <application android:label="Demo"></application>\n</manifest>\n');
console.log(String(await makeIcons.run({ source: "logo.svg", kinds: ["android", "pwa", "favicon", "windows"], background: "#1e1b4b" }, { cwd: proj })).split("\n").slice(0, 3).join("\n"));
const files = ["app/src/main/res/mipmap-xxxhdpi/ic_launcher.png", "app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png", "app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png", "icons/maskable-512.png", "icons/icon-192.png", "icons/apple-touch-icon.png", "favicon-32.png", "favicon-16.png"];
const sheet = `<body style="margin:0;padding:24px;background:#f4f4f5;font:14px system-ui;display:flex;flex-wrap:wrap;gap:18px;align-items:end">${files.map((f) => `<figure style="margin:0;text-align:center"><img src="${f}" style="max-width:150px;background:repeating-conic-gradient(#ddd 0 25%,#fff 0 50%) 0 0/16px 16px"><figcaption style="color:#555;margin-top:6px">${f.split("/").pop()}</figcaption></figure>`).join("")}</body>`;
writeFileSync(join(proj, "sheet.html"), sheet);
const q = await browser.newPage({ viewport: { width: 1100, height: 280 } });
await q.goto("file://" + join(proj, "sheet.html"));
await q.waitForTimeout(300);
await q.screenshot({ path: join(OUT, "2-make-icons.png") });
await browser.close(); ui.stop(); process.exit(0);
