import { existsSync, readdirSync, readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { z } from "zod";
import { defineTool } from "./types.ts";
import { inside } from "./paths.ts";
import { findBrowser } from "../judge.ts";
import { evaluate, screenshot } from "../browser.ts";
import { toShot } from "../image.ts";
import { sizedSvg } from "./studio.ts";
import { EDITOR } from "./canvas.ts";
import { contrast, luminance, parsePalette, randomPalette, type Palette } from "../palette.ts";

// Design tools: draw_svg (vector art the model can see and fix), design_tokens
// (one source of truth for colors, type and spacing, exported to every
// platform), pick_fonts (a heading and body pairing, bundled offline) and
// mood_board (reference sites and images boiled down to a style brief).

const NO_BROWSER = "error: this tool draws with Edge or Chrome in the background, and neither was found. Install one, or set MAXX_BROWSER.";
const shotOf = (b64: string, maxSide = 700) => {
  try {
    return [toShot(Buffer.from(b64, "base64"), { maxSide, quality: 75 })];
  } catch {
    return [];
  }
};

// ---- draw_svg ----

export function svgProblems(svg: string): string[] {
  const out: string[] = [];
  if (!/<svg\b/i.test(svg)) out.push("there is no <svg> element");
  if (/<svg\b/i.test(svg) && !/xmlns=["']http:\/\/www\.w3\.org\/2000\/svg["']/.test(svg)) out.push('add xmlns="http://www.w3.org/2000/svg" to <svg>, or it will not show as an image file');
  if (/<svg\b/i.test(svg) && !/viewBox=/.test(svg)) out.push("add a viewBox so it scales cleanly");
  if (/<image\b[^>]*href=["']https?:/i.test(svg)) out.push("it links to an image on the web; draw it with shapes instead");
  if (/<script\b/i.test(svg)) out.push("remove <script>: icons and logos must not run code");
  return out;
}

export const drawSvg = defineTool({
  name: "draw_svg",
  description:
    "Write SVG art (logo, icon, illustration, UI graphic) to a file and see it rendered, so you can check and improve it. Returns the picture and any problems. Keep it simple: a viewBox, flat shapes, few colors. png: also save PNG copies at these sizes.",
  schema: z.object({
    path: z.string().describe("e.g. assets/logo.svg"),
    svg: z.string().describe("The whole SVG document"),
    png: z.array(z.number().int().min(8).max(2048)).max(6).optional().describe("Sizes for PNG copies, e.g. [64, 512]"),
    background: z.string().optional().describe("Preview background, default a checkerboard"),
  }),
  risk: "write",
  ruleKey: () => "svg",
  preview: (a) => `write ${a.path} (${a.svg.length} characters of SVG)${a.png ? ` + PNGs at ${a.png.join(", ")}px` : ""}`,
  async run({ path, svg, png, background }, { cwd }) {
    const dest = inside(cwd, path);
    const problems = svgProblems(svg);
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, svg);
    const browser = findBrowser();
    if (!browser) return `saved ${path}. ${problems.length ? `Problems: ${problems.join("; ")}.` : ""} (No Edge or Chrome to render a preview.)`;
    const src = `data:image/svg+xml;base64,${Buffer.from(sizedSvg(svg)).toString("base64")}`;
    const sizes = png ?? [];
    let r: { err: string; preview: string; pngs: string[]; empty: boolean };
    try {
      r = await evaluate(browser, `(async () => { ${EDITOR}
        const doc = new DOMParser().parseFromString(${JSON.stringify(svg)}, "image/svg+xml");
        const pe = doc.querySelector("parsererror");
        if (pe) return { err: pe.textContent.split("\\n").slice(0, 2).join(" ").slice(0, 300), preview: "", pngs: [], empty: false };
        const img = await load(${JSON.stringify(src)});
        const S = 480, c = mk(S + 32, S + 32), g = c.getContext("2d");
        ${background ? `g.fillStyle = ${JSON.stringify(background)}; g.fillRect(0, 0, c.width, c.height);` : `for (let y = 0; y < c.height; y += 16) for (let x = 0; x < c.width; x += 16) { g.fillStyle = (x + y) % 32 ? "#e5e7eb" : "#ffffff"; g.fillRect(x, y, 16, 16); }`}
        const k = Math.min(S / img.naturalWidth, S / img.naturalHeight);
        g.drawImage(img, 16 + (S - img.naturalWidth * k) / 2, 16 + (S - img.naturalHeight * k) / 2, img.naturalWidth * k, img.naturalHeight * k);
        const probe = mk(64, 64); probe.getContext("2d").drawImage(img, 0, 0, 64, 64);
        const d = probe.getContext("2d").getImageData(0, 0, 64, 64).data; let ink = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 8) ink++;
        const pngs = ${JSON.stringify(sizes)}.map((s) => { const o = mk(s, s); const q = Math.min(s / img.naturalWidth, s / img.naturalHeight); o.getContext("2d").drawImage(img, (s - img.naturalWidth * q) / 2, (s - img.naturalHeight * q) / 2, img.naturalWidth * q, img.naturalHeight * q); return o.toDataURL("image/png").split(",")[1]; });
        return { err: "", preview: c.toDataURL("image/png").split(",")[1], pngs, empty: ink < 20 };
      })()`, { timeoutMs: 40_000 });
    } catch (e) {
      return `saved ${path}, but it does not render: ${(e as Error).message}. Check that the SVG is valid XML.`;
    }
    if (r.err) return `saved ${path}, but it is not valid SVG: ${r.err}. Fix the markup and call draw_svg again.`;
    const written: string[] = [path];
    for (const [i, s] of sizes.entries()) {
      const p = path.replace(/\.svg$/i, "") + `-${s}.png`;
      await writeFile(inside(cwd, p), Buffer.from(r.pngs[i]!, "base64"));
      written.push(p);
    }
    if (r.empty) problems.push("it renders as (almost) nothing: check the viewBox and that shapes have a fill or stroke");
    return {
      text: `saved ${written.join(", ")}.${problems.length ? ` Problems: ${problems.join("; ")}.` : ""}\nLook at the picture: fix anything off (balance, alignment, contrast, readable at small size) and call draw_svg again.`,
      images: shotOf(r.preview, 512),
    };
  },
});

// ---- design_tokens ----

export type Tokens = {
  name: string;
  color: Record<string, string>;
  font: { heading: string; body: string; mono: string };
  size: Record<string, string>;
  space: Record<string, string>;
  radius: Record<string, string>;
  shadow: Record<string, string>;
};

const mix = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return "#" + x.map((v, i) => Math.round(v + (y[i]! - v) * t).toString(16).padStart(2, "0")).join("");
};

export function tokensFrom(p: Palette, o: { radius?: "sharp" | "soft" | "round"; fonts?: { heading?: string; body?: string } } = {}): Tokens {
  const bg = p.bg ?? "#ffffff";
  const dark = luminance(bg) < 0.4;
  const ink = p.ink ?? (dark ? "#f5f5f4" : "#1c1917");
  const cs = [...p.colors];
  // The most saturated colour that reads on the background is the brand colour.
  const sat = (h: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
    return Math.max(r!, g!, b!) - Math.min(r!, g!, b!);
  };
  const ranked = [...cs].sort((a, b) => sat(b) * Math.min(4.5, contrast(b, bg)) - sat(a) * Math.min(4.5, contrast(a, bg)));
  const primary = ranked[0] ?? "#2563eb";
  const secondary = ranked[1] ?? mix(primary, ink, 0.4);
  const accent = ranked[2] ?? mix(primary, "#f59e0b", 0.6);
  const r = o.radius ?? "soft";
  const scale = (n: number) => `${(Math.round(16 * Math.pow(1.25, n)) / 16).toFixed(3).replace(/\.?0+$/, "")}rem`;
  return {
    name: p.name,
    color: {
      primary, secondary, accent, bg, surface: mix(bg, ink, dark ? 0.08 : 0.04), text: ink, muted: mix(ink, bg, 0.45), border: mix(bg, ink, 0.15),
      "on-primary": contrast("#ffffff", primary) >= contrast("#111111", primary) ? "#ffffff" : "#111111",
      success: "#16a34a", warning: "#d97706", danger: "#dc2626",
    },
    font: { heading: o.fonts?.heading ?? "system-ui, -apple-system, 'Segoe UI', sans-serif", body: o.fonts?.body ?? "system-ui, -apple-system, 'Segoe UI', sans-serif", mono: "ui-monospace, 'Cascadia Code', Consolas, monospace" },
    size: { xs: scale(-2), sm: scale(-1), base: "1rem", lg: scale(1), xl: scale(2), "2xl": scale(3), "3xl": scale(4), "4xl": scale(5) },
    space: Object.fromEntries([1, 2, 3, 4, 6, 8, 12, 16].map((n) => [String(n), `${n * 4}px`])),
    radius: r === "sharp" ? { sm: "2px", md: "4px", lg: "6px", full: "9999px" } : r === "round" ? { sm: "8px", md: "16px", lg: "28px", full: "9999px" } : { sm: "4px", md: "8px", lg: "14px", full: "9999px" },
    shadow: { sm: "0 1px 2px rgba(0,0,0,.08)", md: "0 4px 12px rgba(0,0,0,.12)", lg: "0 12px 32px rgba(0,0,0,.18)" },
  };
}

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
const camel = (s: string) => s.replace(/-(\w)/g, (_, c) => c.toUpperCase());

export function toCss(t: Tokens): string {
  const lines = [
    ...Object.entries(t.color).map(([k, v]) => `  --color-${k}: ${v};`),
    ...Object.entries(t.font).map(([k, v]) => `  --font-${k}: ${v};`),
    ...Object.entries(t.size).map(([k, v]) => `  --text-${k}: ${v};`),
    ...Object.entries(t.space).map(([k, v]) => `  --space-${k}: ${v};`),
    ...Object.entries(t.radius).map(([k, v]) => `  --radius-${k}: ${v};`),
    ...Object.entries(t.shadow).map(([k, v]) => `  --shadow-${k}: ${v};`),
  ];
  return `/* Design tokens: ${t.name}. Made by Maxx from design/tokens.json; change that file, then export again. */\n:root {\n${lines.join("\n")}\n}\n\nbody { background: var(--color-bg); color: var(--color-text); font-family: var(--font-body); }\nh1, h2, h3 { font-family: var(--font-heading); }\n`;
}

export function toTailwind(t: Tokens): string {
  const theme = { colors: Object.fromEntries(Object.keys(t.color).map((k) => [k, `var(--color-${k})`])), fontFamily: { heading: [`var(--font-heading)`], body: [`var(--font-body)`], mono: [`var(--font-mono)`] }, borderRadius: t.radius, boxShadow: t.shadow, spacing: t.space };
  return `// Design tokens for Tailwind: in tailwind.config, theme: { extend: require("./design/tailwind.tokens.cjs") }\n// The values are the CSS variables in design/tokens.css, so load that file too.\nmodule.exports = ${JSON.stringify(theme, null, 2)};\n`;
}

export function toAndroidXml(t: Tokens): { colors: string; dimens: string } {
  const colors = Object.entries(t.color).map(([k, v]) => `    <color name="token_${k.replace(/-/g, "_")}">${v}</color>`);
  const px = (v: string) => (v.endsWith("rem") ? `${Math.round(parseFloat(v) * 16)}sp` : v.replace("px", "dp"));
  const dimens = [...Object.entries(t.space).map(([k, v]) => `    <dimen name="token_space_${k}">${px(v)}</dimen>`), ...Object.entries(t.radius).filter(([k]) => k !== "full").map(([k, v]) => `    <dimen name="token_radius_${k}">${px(v)}</dimen>`), ...Object.entries(t.size).map(([k, v]) => `    <dimen name="token_text_${k.replace(/\W/g, "")}">${px(v)}</dimen>`)];
  return { colors: `<?xml version="1.0" encoding="utf-8"?>\n<!-- Design tokens: ${t.name} (from design/tokens.json) -->\n<resources>\n${colors.join("\n")}\n</resources>\n`, dimens: `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n${dimens.join("\n")}\n</resources>\n` };
}

export function toCompose(t: Tokens, pkg: string): string {
  const c = Object.entries(t.color).map(([k, v]) => `    val ${camel(k)} = Color(0xFF${v.slice(1).toUpperCase()})`);
  const sp = Object.entries(t.space).map(([k, v]) => `    val space${k} = ${parseInt(v)}.dp`);
  const rd = Object.entries(t.radius).filter(([k]) => k !== "full").map(([k, v]) => `    val radius${k[0]!.toUpperCase()}${k.slice(1)} = ${parseInt(v)}.dp`);
  const tx = Object.entries(t.size).map(([k, v]) => `    val text${k.replace(/\W/g, "").replace(/^\w/, (x) => x.toUpperCase())} = ${Math.round(parseFloat(v) * 16)}.sp`);
  return `package ${pkg}\n\n// Design tokens: ${t.name} (made by Maxx from design/tokens.json)\nimport androidx.compose.ui.graphics.Color\nimport androidx.compose.ui.unit.dp\nimport androidx.compose.ui.unit.sp\n\nobject Tokens {\n${[...c, "", ...sp, "", ...rd, "", ...tx].join("\n")}\n}\n`;
}

function androidTargets(cwd: string): { res: string | null; compose: string | null } {
  const res = ["app/src/main/res"].find((d) => existsSync(join(cwd, d))) ?? null;
  const gradle = ["app/build.gradle.kts", "app/build.gradle"].map((f) => join(cwd, f)).find(existsSync);
  const g = gradle ? readFileSync(gradle, "utf8") : "";
  if (!/compose/i.test(g)) return { res, compose: null };
  const ns = /namespace\s*=?\s*["']([\w.]+)["']/.exec(g)?.[1] ?? /applicationId\s*=?\s*["']([\w.]+)["']/.exec(g)?.[1];
  return { res, compose: ns ?? null };
}

export const designTokens = defineTool({
  name: "design_tokens",
  description:
    "Set up the project's design system in one file, design/tokens.json (colors, fonts, type scale, spacing, corner radius, shadows), and export it to CSS variables, Tailwind, Android colors/dimens and Jetpack Compose as the project needs. palette is a preset name (e.g. synthwave, forest), hex colors like '#264653 #2a9d8f #e9c46a', one color and a harmony like '#ff6600 triad', or random. Call again with only export: true after editing tokens.json.",
  schema: z.object({
    palette: z.string().optional().describe("Colors to build from; default: keep tokens.json, or random"),
    radius: z.enum(["sharp", "soft", "round"]).optional(),
    heading_font: z.string().optional(),
    body_font: z.string().optional(),
    export: z.boolean().optional().describe("Only re-export the existing tokens.json"),
  }),
  risk: "write",
  ruleKey: () => "tokens",
  preview: (a) => (a.export ? "export design/tokens.json" : `design tokens from ${a.palette ?? "a palette"}`),
  async run(a, { cwd }) {
    const file = join(cwd, "design", "tokens.json");
    let t: Tokens;
    if (a.export || (!a.palette && existsSync(file))) {
      if (!existsSync(file)) return "error: there is no design/tokens.json yet; call design_tokens with a palette first";
      t = JSON.parse(await readFile(file, "utf8"));
      if (a.heading_font) t.font.heading = a.heading_font;
      if (a.body_font) t.font.body = a.body_font;
    } else {
      let p: Palette;
      try {
        p = (a.palette && parsePalette(a.palette)) || randomPalette();
      } catch (e) {
        return `error: ${(e as Error).message}`;
      }
      t = tokensFrom(p, { radius: a.radius, fonts: { heading: a.heading_font, body: a.body_font } });
    }
    await mkdir(join(cwd, "design"), { recursive: true });
    await writeFile(file, JSON.stringify(t, null, 2) + "\n");
    const written = ["design/tokens.json"];
    const put = async (rel: string, text: string) => {
      const abs = inside(cwd, rel);
      await mkdir(dirname(abs), { recursive: true });
      await writeFile(abs, text);
      written.push(rel);
    };
    await put("design/tokens.css", toCss(t));
    if (readdirSync(cwd).some((f) => /^tailwind\.config\./.test(f)) || /tailwindcss/.test(existsSync(join(cwd, "package.json")) ? readFileSync(join(cwd, "package.json"), "utf8") : "")) await put("design/tailwind.tokens.cjs", toTailwind(t));
    const and = androidTargets(cwd);
    if (and.res) {
      const x = toAndroidXml(t);
      await put(`${and.res}/values/tokens_colors.xml`, x.colors);
      await put(`${and.res}/values/tokens_dimens.xml`, x.dimens);
    }
    if (and.compose) await put(`app/src/main/java/${and.compose.replace(/\./g, "/")}/ui/Tokens.kt`, toCompose(t, `${and.compose}.ui`));
    // A sheet of the tokens, so the model (and you) can see them.
    const browser = findBrowser();
    let images: ReturnType<typeof shotOf> = [];
    if (browser) {
      const html = `<style>${toCss(t)} body{margin:0;padding:24px;width:760px} .sw{display:inline-block;width:84px;margin:0 8px 12px 0;font:11px var(--font-mono)} .sw div{height:56px;border-radius:var(--radius-md);box-shadow:var(--shadow-sm);border:1px solid var(--color-border)} button{background:var(--color-primary);color:var(--color-on-primary);border:0;padding:var(--space-3) var(--space-6);border-radius:var(--radius-md);font:600 var(--text-base) var(--font-body);box-shadow:var(--shadow-md)} .card{background:var(--color-surface);border-radius:var(--radius-lg);padding:var(--space-6);margin-top:16px;box-shadow:var(--shadow-sm)}</style>
        <div>${Object.entries(t.color).map(([k, v]) => `<span class="sw"><div style="background:${v}"></div>${k}<br>${v}</span>`).join("")}</div>
        <div class="card"><div style="font:700 var(--text-3xl) var(--font-heading)">${t.name.replace(/</g, "")} heading</div><p style="font-size:var(--text-lg);color:var(--color-muted)">Body text in the body font, muted for secondary lines.</p><button>Primary button</button> <span style="color:var(--color-accent);font-weight:600;margin-left:12px">Accent link</span></div>`;
      const tmp = join(cwd, "design", ".tokens-preview.html");
      await writeFile(tmp, html);
      try {
        const s = await screenshot(browser, pathToFileURL(tmp).href, { width: 808, height: 520, settleMs: 200 });
        images = [toShot(s.png, { maxSide: 808, quality: 75 })];
      } catch {}
    }
    const c = t.color;
    const warn = contrast(c.text!, c.bg!) < 4.5 ? `\nwarning: text on background has contrast ${contrast(c.text!, c.bg!).toFixed(1)} (aim for 4.5 or more).` : "";
    return {
      text: `tokens "${t.name}": primary ${c.primary}, secondary ${c.secondary}, accent ${c.accent}, background ${c.bg}, text ${c.text}\nwrote ${written.join(", ")}${warn}\nUse them by name: var(--color-primary), var(--space-4), var(--radius-md) in CSS; @color/token_primary on Android; Tokens.primary in Compose. Never hard-code a color the tokens have.`,
      images,
    };
  },
});

// ---- pick_fonts ----

export const PAIRS: { heading: string; body: string; vibe: string; hw: number }[] = [
  { heading: "Space Grotesk", body: "Inter", vibe: "tech modern startup clean app dashboard saas", hw: 700 },
  { heading: "Poppins", body: "Inter", vibe: "friendly modern app rounded clean", hw: 700 },
  { heading: "Playfair Display", body: "Source Sans 3", vibe: "elegant luxury editorial classic fashion wedding", hw: 700 },
  { heading: "Fraunces", body: "Inter", vibe: "warm editorial soft vintage food blog", hw: 700 },
  { heading: "Press Start 2P", body: "VT323", vibe: "retro pixel arcade 8-bit game", hw: 400 },
  { heading: "Bungee", body: "Rubik", vibe: "bold playful game arcade loud fun", hw: 400 },
  { heading: "Orbitron", body: "Exo 2", vibe: "sci-fi space futuristic synthwave neon cyber", hw: 700 },
  { heading: "Righteous", body: "Nunito", vibe: "fun casual playful kids game cartoon", hw: 400 },
  { heading: "Baloo 2", body: "Nunito", vibe: "cute kids playful rounded soft friendly", hw: 700 },
  { heading: "Bebas Neue", body: "Roboto", vibe: "sports bold poster strong fitness news", hw: 400 },
  { heading: "Montserrat", body: "Open Sans", vibe: "corporate business professional clean", hw: 700 },
  { heading: "DM Serif Display", body: "DM Sans", vibe: "portfolio stylish creative studio elegant", hw: 400 },
  { heading: "Merriweather", body: "Lato", vibe: "reading blog article long text news classic", hw: 700 },
  { heading: "Cinzel", body: "Cormorant Garamond", vibe: "fantasy medieval rpg epic ancient", hw: 700 },
  { heading: "Creepster", body: "Nunito", vibe: "horror halloween spooky", hw: 400 },
  { heading: "Pacifico", body: "Quicksand", vibe: "beach summer handwritten relaxed cafe", hw: 400 },
  { heading: "JetBrains Mono", body: "Inter", vibe: "developer code terminal hacker docs", hw: 700 },
  { heading: "Archivo Black", body: "Archivo", vibe: "brutalist bold minimal stark", hw: 400 },
  { heading: "Lexend", body: "Lexend", vibe: "accessible readable dyslexia education simple", hw: 700 },
  { heading: "Outfit", body: "Outfit", vibe: "minimal modern geometric clean product", hw: 700 },
];

export function pickPair(mood: string) {
  const words = mood.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
  let best = PAIRS[0]!, score = -1;
  for (const p of PAIRS) {
    const s = words.reduce((n, w) => n + (p.vibe.includes(w) ? 2 : 0) + (p.heading.toLowerCase().includes(w) || p.body.toLowerCase().includes(w) ? 3 : 0), 0);
    if (s > score) (best = p), (score = s);
  }
  return best;
}

const serifish = (f: string) => /serif|playfair|fraunces|merriweather|cinzel|cormorant|garamond/i.test(f) && !/sans/i.test(f);
const stack = (f: string) => `'${f}', ${/mono/i.test(f) ? "ui-monospace, Consolas, monospace" : serifish(f) ? "Georgia, 'Times New Roman', serif" : "system-ui, 'Segoe UI', sans-serif"}`;

// Google Fonts sends woff2 to a modern browser; download them so the app works offline.
async function download(family: string, weights: number[], dir: string): Promise<string> {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weights.join(";")}&display=swap`, { headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36" }, signal: AbortSignal.timeout(15_000) })).text();
  if (!/@font-face/.test(css)) throw new Error(`Google Fonts has no family "${family}"`);
  let out = css;
  let n = 0;
  for (const m of css.matchAll(/url\((https:[^)]+\.woff2)\)/g)) {
    const name = `${family.replace(/\W+/g, "-")}-${++n}.woff2`;
    await writeFile(join(dir, name), new Uint8Array(await (await fetch(m[1]!)).arrayBuffer()));
    out = out.replace(m[1]!, name);
  }
  return out.replace(/\/\*.*?\*\//g, "").trim();
}

export const pickFonts = defineTool({
  name: "pick_fonts",
  description:
    "Choose a heading and body font pair that fits a mood (e.g. 'retro arcade', 'elegant wedding', 'tech dashboard'), or give the fonts by name. With network on, downloads them into fonts/ so the app works offline, writes fonts/fonts.css, and shows a sample.",
  schema: z.object({
    mood: z.string().optional().describe("The feel you want"),
    heading: z.string().optional().describe("Or a Google Fonts family for headings"),
    body: z.string().optional().describe("And one for body text"),
  }),
  risk: "write",
  ruleKey: () => "fonts",
  preview: (a) => `pick fonts for ${a.heading ?? a.mood ?? "this project"} and save them in fonts/`,
  async run({ mood, heading, body }, ctx) {
    const pair = heading ? { heading, body: body ?? heading, vibe: "", hw: 700 } : pickPair(mood ?? "modern clean");
    const dir = join(ctx.cwd, "fonts");
    await mkdir(dir, { recursive: true });
    let css = "";
    let local = false;
    if (ctx.network !== false) {
      try {
        const parts = [await download(pair.heading, [pair.hw], dir)];
        if (pair.body !== pair.heading) parts.push(await download(pair.body, [400, 700], dir));
        else parts[0] = await download(pair.heading, [...new Set([400, pair.hw, 700])].sort(), dir);
        css = parts.join("\n\n");
        local = true;
      } catch (e) {
        css = `/* Could not download (${(e as Error).message}); the fallback fonts below are used. */`;
      }
    } else css = "/* Network access is off, so the fonts were not downloaded; the fallback fonts below are used until they are. */";
    const vars = `:root {\n  --font-heading: ${stack(pair.heading)};\n  --font-body: ${stack(pair.body)};\n}\nh1, h2, h3 { font-family: var(--font-heading); font-weight: ${pair.hw}; }\nbody { font-family: var(--font-body); }\n`;
    await writeFile(join(dir, "fonts.css"), `${css}\n\n${vars}`);
    if (existsSync(join(ctx.cwd, "design", "tokens.json"))) {
      const t = JSON.parse(await readFile(join(ctx.cwd, "design", "tokens.json"), "utf8")) as Tokens;
      t.font.heading = stack(pair.heading);
      t.font.body = stack(pair.body);
      await writeFile(join(ctx.cwd, "design", "tokens.json"), JSON.stringify(t, null, 2) + "\n");
    }
    const browser = findBrowser();
    let images: ReturnType<typeof shotOf> = [];
    if (browser) {
      const tmp = join(dir, ".preview.html");
      await writeFile(tmp, `<link rel="stylesheet" href="fonts.css"><body style="margin:0;padding:28px;background:#fafaf9;color:#1c1917;width:700px"><h1 style="font-size:46px;margin:0 0 8px">${pair.heading}: The quick brown fox</h1><p style="font-size:18px;line-height:1.6;margin:0">${pair.body} for body text. Sphinx of black quartz, judge my vow. 0123456789 — readable at small sizes, with clear numbers and punctuation.</p></body>`);
      try {
        const s = await screenshot(browser, pathToFileURL(tmp).href, { width: 760, height: 260, settleMs: 400 });
        images = [toShot(s.png, { maxSide: 760, quality: 80 })];
      } catch {}
    }
    return {
      text: `fonts: ${pair.heading} for headings, ${pair.body} for body${pair.vibe ? ` (fits: ${pair.vibe})` : ""}. ${local ? "Downloaded into fonts/ for offline use." : "Not downloaded; using similar system fonts."}\nwrote fonts/fonts.css${existsSync(join(ctx.cwd, "design", "tokens.json")) ? " and updated design/tokens.json" : ""}. Add <link rel="stylesheet" href="fonts/fonts.css"> to the page head.`,
      images,
    };
  },
});

// ---- mood_board ----

// Runs in a page: the colors that cover the most of a canvas (k-means on a small copy).
export const PALETTE_OF = String.raw`(c, k) => {
  const s = mk(64, 64); s.getContext("2d").drawImage(c, 0, 0, 64, 64);
  const d = s.getContext("2d").getImageData(0, 0, 64, 64).data, px = [];
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 128) px.push([d[i], d[i + 1], d[i + 2]]);
  if (!px.length) return [];
  let cs = Array.from({ length: k }, (_, i) => px[Math.floor(i * px.length / k)].slice());
  let lab = new Array(px.length).fill(0);
  for (let it = 0; it < 10; it++) {
    lab = px.map((p) => { let b = 0, bd = 1e9; cs.forEach((c, j) => { const dd = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2; if (dd < bd) { bd = dd; b = j; } }); return b; });
    cs = cs.map((c, j) => { const m = px.filter((_, i) => lab[i] === j); return m.length ? [0, 1, 2].map((q) => m.reduce((n, p) => n + p[q], 0) / m.length) : c; });
  }
  const count = cs.map((_, j) => lab.filter((l) => l === j).length);
  return cs.map((c, j) => ({ hex: "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join(""), share: count[j] / px.length })).filter((x) => x.share > 0.02).sort((a, b) => b.share - a.share);
}`;

const STYLE_PROBE = `(() => {
  const g = (sel) => { const e = document.querySelector(sel); if (!e) return null; const s = getComputedStyle(e); return { font: s.fontFamily.split(",")[0].replace(/["']/g, "").trim(), weight: s.fontWeight, size: s.fontSize, radius: s.borderRadius, bg: s.backgroundColor, color: s.color }; };
  return { h: g("h1") || g("h2"), body: g("p") || g("body"), button: g("button, .btn, a[class*=button], [role=button]"), bodyBg: getComputedStyle(document.body).backgroundColor };
})()`;

export const moodBoard = defineTool({
  name: "mood_board",
  description:
    "Collect references before designing: give up to 6 web pages (URLs) or images in the project. Maxx screenshots or loads each one, pulls out the main colors, fonts and corner style, and writes design/moodboard.html plus a short style brief to design from.",
  schema: z.object({
    sources: z.array(z.string()).min(1).max(6).describe("URLs (needs network on, except localhost) or image files in the project"),
    name: z.string().optional().describe("What the board is for, e.g. 'cozy farming game'"),
  }),
  risk: "write",
  ruleKey: () => "moodboard",
  preview: (a) => `mood board from ${a.sources.length} reference(s)`,
  async run({ sources, name }, ctx) {
    const browser = findBrowser();
    if (!browser) return NO_BROWSER;
    type Ref = { label: string; img: string; colors: { hex: string; share: number }[]; style?: any; error?: string };
    const refs: Ref[] = [];
    for (const s of sources) {
      try {
        let img: string;
        let style: any;
        if (/^https?:/i.test(s)) {
          const u = new URL(s);
          if (ctx.network === false && !["localhost", "127.0.0.1"].includes(u.hostname)) throw new Error("network access is off");
          const shot = await screenshot(browser, u.href, { width: 1280, height: 800, settleMs: 1500 });
          img = `data:image/png;base64,${Buffer.from(shot.png).toString("base64")}`;
          // A second short visit for the computed styles.
          const { openPage } = await import("../browser.ts");
          const p = await openPage(browser, { width: 1280, height: 800 });
          try {
            const load = p.loaded();
            await p.call("Page.navigate", { url: u.href });
            await load;
            style = (await p.call("Runtime.evaluate", { expression: STYLE_PROBE, returnByValue: true })).result.value;
          } finally {
            await p.close();
          }
        } else {
          const abs = inside(ctx.cwd, s);
          if (!existsSync(abs)) throw new Error("not found");
          const ext = s.split(".").pop()!.toLowerCase();
          img = `data:image/${ext === "jpg" ? "jpeg" : ext === "svg" ? "svg+xml" : ext};base64,${(await readFile(abs)).toString("base64")}`;
        }
        const colors = await evaluate<{ hex: string; share: number }[]>(browser, `(async () => { ${EDITOR} const c = fromImg(await load(${JSON.stringify(img)})); return (${PALETTE_OF})(c, 6); })()`, { timeoutMs: 40_000 });
        refs.push({ label: s, img, colors, style });
      } catch (e) {
        refs.push({ label: s, img: "", colors: [], error: (e as Error).message });
      }
    }
    const ok = refs.filter((r) => !r.error);
    if (!ok.length) return `error: none of the sources could be read: ${refs.map((r) => `${r.label} (${r.error})`).join("; ")}`;
    // The board's palette: colors weighted by how much area they cover, near-duplicates merged.
    const all = ok.flatMap((r) => r.colors.map((c) => ({ ...c, share: c.share / ok.length })));
    const dist = (a: string, b: string) => [1, 3, 5].reduce((n, i) => n + (parseInt(a.slice(i, i + 2), 16) - parseInt(b.slice(i, i + 2), 16)) ** 2, 0);
    const merged: { hex: string; share: number }[] = [];
    for (const c of all.sort((a, b) => b.share - a.share)) {
      const m = merged.find((x) => dist(x.hex, c.hex) < 1600);
      if (m) m.share += c.share;
      else merged.push({ ...c });
    }
    const palette = merged.slice(0, 7);
    const fonts = [...new Set(ok.flatMap((r) => [r.style?.h?.font, r.style?.body?.font]).filter(Boolean))];
    const radii = ok.map((r) => parseFloat(r.style?.button?.radius ?? "")).filter((n) => !isNaN(n));
    const darkness = palette.reduce((n, c) => n + c.share * (luminance(c.hex) < 0.35 ? 1 : 0), 0);
    const brief = [
      `Palette: ${palette.map((c) => `${c.hex} (${Math.round(c.share * 100)}%)`).join(", ")}`,
      `Mood: ${darkness > 0.5 ? "mostly dark" : "mostly light"}${radii.length ? `, ${Math.max(...radii) >= 12 ? "rounded" : Math.max(...radii) <= 3 ? "sharp-cornered" : "softly rounded"} buttons` : ""}`,
      ...(fonts.length ? [`Fonts seen: ${fonts.join(", ")}`] : []),
      `Next: design_tokens with palette "${palette.slice(0, 5).map((c) => c.hex).join(" ")}"${fonts.length ? `, then pick_fonts with heading "${fonts[0]}" or a close match` : ""}.`,
    ];
    const html = `<!doctype html><meta charset="utf-8"><title>Mood board${name ? `: ${name.replace(/</g, "")}` : ""}</title>
<style>body{margin:0;padding:24px;font:14px system-ui;background:#f5f5f4;color:#1c1917}h1{margin:0 0 4px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:16px}.ref{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)}.ref img{width:100%;height:180px;object-fit:cover;display:block}.ref .sw{display:flex;height:22px}.ref p{margin:6px 10px;font-size:11px;color:#57534e;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.pal{display:flex;height:64px;border-radius:12px;overflow:hidden;margin-top:12px}.pal div{display:flex;align-items:end;padding:4px;font:11px ui-monospace,Consolas,'Courier New',monospace;color:#fff;text-shadow:0 1px 2px #0008}</style>
<h1>Mood board${name ? `: ${name.replace(/</g, "")}` : ""}</h1><div>${brief.slice(1, 3).join(" · ").replace(/</g, "")}</div>
<div class="pal">${palette.map((c) => `<div style="background:${c.hex};flex:${c.share} 0 0">${c.hex}</div>`).join("")}</div>
<div class="grid">${ok.map((r) => `<div class="ref"><img src="${r.img}"><div class="sw">${r.colors.map((c) => `<span style="flex:${c.share} 0 0;background:${c.hex}"></span>`).join("")}</div><p>${r.label.replace(/</g, "")}${r.style?.h?.font ? ` · ${r.style.h.font}` : ""}</p></div>`).join("")}</div>`;
    const out = join(ctx.cwd, "design", "moodboard.html");
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, html);
    let images: ReturnType<typeof shotOf> = [];
    try {
      const s = await screenshot(browser, pathToFileURL(out).href, { width: 1100, height: 720, settleMs: 300 });
      images = [toShot(s.png, { maxSide: 1100, quality: 75 })];
    } catch {}
    const failed = refs.filter((r) => r.error);
    return { text: `wrote design/moodboard.html from ${ok.length} reference(s)${failed.length ? `; skipped ${failed.map((r) => `${r.label} (${r.error})`).join(", ")}` : ""}\n${brief.join("\n")}`, images };
  },
});
