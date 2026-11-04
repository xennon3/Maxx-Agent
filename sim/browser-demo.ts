#!/usr/bin/env bun
// Screenshot of browser hands: a small web app with numbered boxes, plus profile_page and mutate output.
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
const ROOT = resolve(import.meta.dir, "..");
const OUT = join(ROOT, "sim", "out", "browser");
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
process.env.MAXX_BROWSER ??= "/opt/pw-browsers/chromium";
writeFileSync(join(OUT, "index.html"), `<!doctype html><title>Todo</title><style>body{font:16px system-ui;max-width:560px;margin:30px auto;background:#fafaf9}h1{color:#c2410c}input{padding:8px;width:65%}button{padding:8px 14px;background:#c2410c;color:#fff;border:0;border-radius:6px}li{padding:6px 0}a{color:#0369a1}</style>
<h1>Todo</h1><input id=t placeholder="What needs doing?"><button onclick="add()">Add</button><ul id=l><li><label><input type=checkbox> Buy milk</label></li></ul><a href="#about">About</a>
<script>function add(){ const v=t.value.trim(); if(!v) return; const li=document.createElement('li'); li.innerHTML='<label><input type=checkbox> '+v+'</label>'; l.append(li); t.value=''; console.log('added', v) }</script>`);
const { browserOpen, browserAct, closeBrowser } = await import(ROOT + "/src/tools/browse.ts");
const ctx = { cwd: OUT };
await browserOpen.run({}, ctx);
await browserAct.run({ action: "type", element: 1, text: "Ship Maxx tier 2", enter: false }, ctx);
const r = (await browserAct.run({ action: "click", element: 2 }, ctx)) as { text: string; images: { base64: string }[] };
writeFileSync(join(OUT, "1-browser-hands.jpg"), Buffer.from(r.images[0]!.base64, "base64"));
console.log(r.text);
await closeBrowser();
process.exit(0);
