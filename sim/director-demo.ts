#!/usr/bin/env bun
// Screenshots for the tier-4 director tools. The model's replies are scripted
// here (hand-written designs and SVGs), so this shows what the tools do with
// them: the rivals split screen, an asset kit, and a build time-lapse GIF.
import { mkdirSync, rmSync, writeFileSync, copyFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
const ROOT = resolve(import.meta.dir, "..");
const OUT = join(ROOT, "sim", "out", "director");
rmSync(OUT, { recursive: true, force: true });
const proj = join(OUT, "game"); mkdirSync(proj, { recursive: true });
process.env.MAXX_HOME = join(OUT, "home");
process.env.MAXX_BROWSER ??= "/opt/pw-browsers/chromium";
process.env.MAXX_IMAGES_URL = "http://127.0.0.1:9";
const { rivalDesigns, assetKit } = await import(ROOT + "/src/tools/director.ts");
const { saveFrame, makeTimelapse } = await import(ROOT + "/src/timelapse.ts");
const { screenshot } = await import(ROOT + "/src/browser.ts");
const { toShot } = await import(ROOT + "/src/image.ts");
const { closeBrowser } = await import(ROOT + "/src/tools/browse.ts");
const B = process.env.MAXX_BROWSER!;
const snap = async (file: string, out: string, w = 1280, h = 800) => writeFileSync(join(OUT, out), (await screenshot(B, pathToFileURL(file).href, { width: w, height: h, settleMs: 600 })).png);

const SWISS = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font:17px/1.5 Helvetica,Arial,sans-serif;color:#111;background:#fff}header{display:flex;justify-content:space-between;padding:24px 6vw;border-bottom:2px solid #111}main{padding:8vh 6vw;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:48px}h1{font-size:clamp(44px,7vw,92px);line-height:.95;margin:0;letter-spacing:-.03em}a.play{display:inline-block;margin-top:28px;background:#e11d48;color:#fff;padding:16px 28px;text-decoration:none;font-weight:700}ul{list-style:none;padding:0;margin:0;border-top:2px solid #111}li{padding:14px 0;border-bottom:1px solid #ccc}</style></head><body><header><b>FLIPPER</b><span>Play · Scores · About</span></header><main><div><h1>Pinball, reduced to the essentials.</h1><a class="play" href="#">Play now</a></div><ul><li>Three tables</li><li>Real ball physics</li><li>Daily leaderboard</li><li>Works offline</li></ul></main></body></html>`;
const NEON = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;min-height:100vh;background:radial-gradient(circle at 30% 20%,#2b0b4a,#07020f 70%);color:#f5f3ff;font:18px/1.5 system-ui,sans-serif;text-align:center}h1{font:900 clamp(48px,9vw,110px)/1 system-ui;margin:12vh 0 8px;color:#fff;text-shadow:0 0 18px #ff2bd6,0 0 42px #ff2bd6}p{color:#c4b5fd}.play{display:inline-block;margin:28px 8px;padding:18px 36px;border-radius:999px;background:#22d3ee;color:#04111a;font-weight:800;text-decoration:none;box-shadow:0 0 24px #22d3ee}.tables{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;padding:24px}.t{width:160px;height:110px;border-radius:18px;border:2px solid #ff2bd6;box-shadow:inset 0 0 22px #ff2bd655;display:grid;place-items:center;font-weight:700}</style></head><body><h1>🕹 FLIPPER</h1><p>Light it up. Three neon tables, one high score.</p><a class="play" href="#">▶ Play</a><div class="tables"><div class="t">Cyber Drift</div><div class="t">Moon Base</div><div class="t">Disco Inferno</div></div></body></html>`;
const r = await rivalDesigns.run({ brief: "a landing page for a pinball game", styles: ["Swiss minimalist", "Neon arcade"], path: "index.html" }, {
  cwd: proj,
  think: async (m: any) => (String(m[0].content).includes("Swiss") ? SWISS : NEON),
  ask: async (q: any) => (console.log("asked:", q.question.split("\n").join(" | "), q.choices), "B: Neon arcade"),
});
console.log((r as any).text);
await snap(join(proj, "design/rivals/index.html"), "1-rivals.png", 1280, 720);

const SVG: Record<string, string> = {
  ship: `<svg viewBox="0 0 64 64"><polygon points="32,4 52,52 32,42 12,52" fill="#ff5d8f"/><polygon points="32,14 40,40 32,36 24,40" fill="#5bc0be"/><rect x="28" y="50" width="8" height="10" fill="#f7d488"/></svg>`,
  alien: `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="34" rx="24" ry="16" fill="#5bc0be"/><circle cx="23" cy="32" r="5" fill="#0b132b"/><circle cx="41" cy="32" r="5" fill="#0b132b"/><rect x="14" y="46" width="6" height="12" fill="#5bc0be"/><rect x="44" y="46" width="6" height="12" fill="#5bc0be"/></svg>`,
  star: `<svg viewBox="0 0 64 64"><polygon points="32,4 39,24 60,24 43,37 50,58 32,45 14,58 21,37 4,24 25,24" fill="#f7d488"/></svg>`,
  background: `<svg viewBox="0 0 160 90"><rect width="160" height="90" fill="#0b132b"/><circle cx="120" cy="24" r="14" fill="#3a506b"/><g fill="#f7d488"><circle cx="20" cy="15" r="1"/><circle cx="60" cy="40" r="1.2"/><circle cx="90" cy="12" r="1"/><circle cx="140" cy="70" r="1.3"/><circle cx="30" cy="70" r="1"/><circle cx="75" cy="80" r="1"/></g></svg>`,
};
const k = await assetKit.run({ theme: "retro space shooter" }, {
  cwd: proj, network: false,
  think: async (m: any) => String(m[0].content).includes("art director")
    ? JSON.stringify({ palette: ["#0b132b", "#ff5d8f", "#5bc0be", "#f7d488", "#3a506b"], background: "#050816", font_mood: "retro arcade", sprites: Object.keys(SVG).map((name) => ({ name, look: name })), effects: [{ name: "laser", describe: "short zap" }, { name: "boom", describe: "deep crunchy explosion" }, { name: "coin", describe: "bright coin" }, { name: "hurt", describe: "low buzz" }], music: [{ name: "theme", mood: "epic" }] })
    : SVG[Object.keys(SVG).find((n) => String(m[1].content).includes(`"${n}"`))!]!,
});
console.log((k as any).text);
await snap(join(proj, "assets/kit/index.html"), "2-asset-kit.png", 1100, 760);

// A time-lapse: the page at each step of a build.
const steps = [
  `<body style="font:20px system-ui;padding:20px">Hello</body>`,
  `<body style="font:20px system-ui;padding:20px;background:#07020f;color:#fff"><h1>FLIPPER</h1></body>`,
  NEON.replace(/<div class="tables">[\s\S]*?<\/div><\/div>/, ""),
  NEON,
];
for (const [i, html] of steps.entries()) {
  writeFileSync(join(proj, "film.html"), html);
  await saveFrame(proj, toShot((await screenshot(B, pathToFileURL(join(proj, "film.html")).href, { width: 412, height: 860, settleMs: 300 })).png, { maxSide: 900, quality: 70 }), `step${i}`);
}
const film = await makeTimelapse(proj, "timelapse.gif", { seconds: 8 });
console.log(film && `${film.path} ${film.used} frames ${film.seconds}s ${film.bytes} bytes`);
copyFileSync(join(proj, "timelapse.gif"), join(OUT, "3-timelapse.gif"));
await closeBrowser();
