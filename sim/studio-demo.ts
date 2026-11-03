#!/usr/bin/env bun
// Screenshots for the tier-3 tools: what the model sees back from draw_svg, design_tokens,
// pick_fonts, sprite_sheet, image_edit and mood_board, run on a small game project.
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
const ROOT = resolve(import.meta.dir, "..");
const OUT = join(ROOT, "sim", "out", "studio");
rmSync(OUT, { recursive: true, force: true });
const proj = join(OUT, "game"); mkdirSync(join(proj, "art"), { recursive: true });
process.env.MAXX_HOME = join(OUT, "home");
process.env.MAXX_BROWSER ??= "/opt/pw-browsers/chromium";
const { drawSvg, designTokens, pickFonts, moodBoard } = await import(ROOT + "/src/tools/design.ts");
const { spriteSheet, imageEdit } = await import(ROOT + "/src/tools/canvas.ts");
const { evaluate } = await import(ROOT + "/src/browser.ts");
const { closeBrowser } = await import(ROOT + "/src/tools/browse.ts");
let n = 0;
const save = (label: string, r: any) => {
  console.log(`--- ${label}\n${typeof r === "string" ? r : r.text}`);
  for (const im of r.images ?? []) writeFileSync(join(OUT, `${++n}-${label}.${im.mime === "image/png" ? "png" : "jpg"}`), Buffer.from(im.base64, "base64"));
};
const ctx = { cwd: proj, network: false };

save("draw_svg", await drawSvg.run({ path: "assets/logo.svg", png: [64, 512], svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="28" fill="#0f172a"/><circle cx="60" cy="58" r="34" fill="#f97316"/><path d="M38 60c8-14 36-14 44 0-8 14-36 14-44 0z" fill="#0f172a"/><circle cx="60" cy="60" r="7" fill="#fde68a"/><rect x="26" y="96" width="68" height="8" rx="4" fill="#38bdf8"/></svg>' }, ctx));
save("design_tokens", await designTokens.run({ palette: "#0f172a #f97316 #38bdf8 #fde68a", radius: "round" }, ctx));
save("pick_fonts", await pickFonts.run({ mood: "retro arcade game" }, ctx));

// Eight walk frames drawn in a page, then packed.
for (let i = 0; i < 8; i++) {
  const b64: string = await evaluate(process.env.MAXX_BROWSER!, `(() => { const c = document.createElement("canvas"); c.width = c.height = 32; const g = c.getContext("2d");
    const y = ${Math.round(Math.abs(Math.sin(i * Math.PI / 4)) * 4)}; g.fillStyle = "#f97316"; g.fillRect(9, 6 - y + 4, 14, 14); g.fillStyle = "#0f172a"; g.fillRect(17, 10 - y + 4, 3, 3);
    g.fillStyle = "#38bdf8"; g.fillRect(${10 + (i % 2) * 3}, 24, 4, 6); g.fillRect(${18 - (i % 2) * 3}, 24, 4, 6);
    return c.toDataURL().split(",")[1]; })()`);
  writeFileSync(join(proj, `art/walk-${i + 1}.png`), Buffer.from(b64, "base64"));
}
save("sprite_sheet", await spriteSheet.run({ frames: ["art/walk-*.png"], output: "assets/walk.png", columns: 4, pixel: true }, ctx));
save("image_edit", await imageEdit.run({ input: "assets/walk.png", output: "assets/walk-big.png", ops: [{ op: "scale", factor: 4, smooth: false }, { op: "outline", color: "#ffffff", width: 2 }, { op: "background", color: "#1e293b" }] }, ctx));
save("mood_board", await moodBoard.run({ sources: ["assets/logo-512.png", "assets/walk-big.png", "design/.tokens-preview.html".replace(".html", ".png")].slice(0, 2), name: "neon arcade" }, ctx));
await closeBrowser();
