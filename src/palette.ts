// Color palettes: the colors Maxx designs with. Charts, Mermaid diagrams, HTML
// widgets, CSS, games and apps all follow the active palette. A palette can be
// a preset ("synthwave"), any list of hex colors, a coolors.co link, a harmony
// grown from one color ("#ff6600 triad"), or a fresh random one. With none set
// (auto), the model picks its own colors and the app's charts use its accent set.
//
// It runs in the page too (page.ts embeds some of these functions' source), so
// the functions marked "page" must stay plain JavaScript once types are stripped.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { maxxHome } from "./sessions.ts";

export type Palette = { name: string; colors: string[]; bg?: string; ink?: string };

type Preset = { colors: string[]; bg: string; ink: string; vibe: string };

// bg and ink are a background and a text color that read well together on it.
export const PRESETS: Record<string, Preset> = {
  maxx: { colors: ["#d9480f", "#1c7ed6", "#2b8a3e", "#ae3ec9", "#f59f00", "#0c8599"], bg: "#f6f6f3", ink: "#1d1d1b", vibe: "the app's own warm orange and friends" },
  ocean: { colors: ["#03045e", "#0077b6", "#00b4d8", "#90e0ef", "#caf0f8"], bg: "#f1fbfd", ink: "#03045e", vibe: "deep navy to sea foam" },
  sunset: { colors: ["#355070", "#6d597a", "#b56576", "#e56b6f", "#eaac8b"], bg: "#fff7f0", ink: "#2b2d42", vibe: "dusky blue into peach" },
  forest: { colors: ["#283618", "#606c38", "#a3b18a", "#dda15e", "#bc6c25"], bg: "#fefae0", ink: "#283618", vibe: "moss, bark and amber" },
  pastel: { colors: ["#ffadad", "#ffd6a5", "#fdffb6", "#caffbf", "#9bf6ff", "#a0c4ff", "#bdb2ff", "#ffc6ff"], bg: "#fffdf8", ink: "#3d3a4b", vibe: "soft candy rainbow" },
  synthwave: { colors: ["#f72585", "#b5179e", "#7209b7", "#4361ee", "#4cc9f0"], bg: "#10002b", ink: "#f8f0ff", vibe: "neon magenta to electric blue on night purple" },
  neon: { colors: ["#39ff14", "#ff073a", "#00f0ff", "#fff01f", "#ff00ff"], bg: "#0a0a0a", ink: "#f5f5f5", vibe: "glowing signs on black" },
  earth: { colors: ["#582f0e", "#7f4f24", "#936639", "#a68a64", "#b6ad90", "#656d4a"], bg: "#f5f0e6", ink: "#3b2a1a", vibe: "clay, sand and olive" },
  mono: { colors: ["#111111", "#444444", "#777777", "#aaaaaa", "#dddddd"], bg: "#ffffff", ink: "#111111", vibe: "greyscale, ink on paper" },
  ice: { colors: ["#0b2545", "#13315c", "#134074", "#8da9c4", "#eef4ed"], bg: "#f7fbff", ink: "#0b2545", vibe: "glacier blues" },
  autumn: { colors: ["#9b2226", "#ae2012", "#bb3e03", "#ca6702", "#ee9b00", "#e9d8a6"], bg: "#fffaf0", ink: "#3a0e0e", vibe: "maple red to harvest gold" },
  candy: { colors: ["#ff595e", "#ffca3a", "#8ac926", "#1982c4", "#6a4c93"], bg: "#ffffff", ink: "#222222", vibe: "bold primary toy-box colors" },
  retro: { colors: ["#e63946", "#f4a261", "#e9c46a", "#2a9d8f", "#264653"], bg: "#fdf6e3", ink: "#264653", vibe: "70s poster" },
  cyber: { colors: ["#fcee0a", "#00f0ff", "#ff003c", "#711c91", "#0abdc6"], bg: "#0d0221", ink: "#e0e0ff", vibe: "yellow and cyan on deep violet" },
  dracula: { colors: ["#bd93f9", "#ff79c6", "#8be9fd", "#50fa7b", "#ffb86c", "#f1fa8c"], bg: "#282a36", ink: "#f8f8f2", vibe: "the popular dark editor theme" },
  nord: { colors: ["#5e81ac", "#81a1c1", "#88c0d0", "#a3be8c", "#ebcb8b", "#bf616a"], bg: "#2e3440", ink: "#eceff4", vibe: "calm arctic dark theme" },
  solarized: { colors: ["#b58900", "#cb4b16", "#dc322f", "#d33682", "#6c71c4", "#268bd2", "#2aa198", "#859900"], bg: "#fdf6e3", ink: "#073642", vibe: "the classic low-contrast editor theme" },
  // Four greens, like an early handheld's screen.
  handheld: { colors: ["#0f380f", "#306230", "#8bac0f", "#9bbc0f"], bg: "#9bbc0f", ink: "#0f380f", vibe: "4-shade green LCD, for retro games" },
  // A 16-color fantasy-console set, for pixel-art games.
  pico: { colors: ["#000000", "#1d2b53", "#7e2553", "#008751", "#ab5236", "#5f574f", "#c2c3c7", "#fff1e8", "#ff004d", "#ffa300", "#ffec27", "#00e436", "#29adff", "#83769c", "#ff77a8", "#ffccaa"], bg: "#000000", ink: "#fff1e8", vibe: "16-color pixel-art set" },
  // Okabe and Ito's set, told apart by people with every common kind of color blindness.
  colorblind: { colors: ["#e69f00", "#56b4e9", "#009e73", "#f0e442", "#0072b2", "#d55e00", "#cc79a7", "#000000"], bg: "#ffffff", ink: "#000000", vibe: "safe for color-blind readers" },
};

const ALIASES: Record<string, string> = {
  default: "maxx", sea: "ocean", beach: "ocean", dusk: "sunset", woods: "forest", nature: "forest", soft: "pastel",
  vaporwave: "synthwave", outrun: "synthwave", glow: "neon", earthy: "earth", grayscale: "mono", greyscale: "mono",
  bw: "mono", winter: "ice", arctic: "ice", fall: "autumn", rainbow: "candy", vintage: "retro", cyberpunk: "cyber",
  gameboy: "handheld", lcd: "handheld", pico8: "pico", pixel: "pico", accessible: "colorblind", "okabe-ito": "colorblind", okabe: "colorblind",
};

const key = (s: string) => s.trim().toLowerCase().replace(/[\s_]+/g, "-");

export function preset(name: string): Palette | undefined {
  const k = key(name);
  const id = PRESETS[k] ? k : ALIASES[k] ?? ALIASES[k.replace(/-/g, "")];
  const p = id ? PRESETS[id] : undefined;
  return p && id ? { name: id, colors: [...p.colors], bg: p.bg, ink: p.ink } : undefined;
}

// --- color math ------------------------------------------------------------

export function normHex(h: string): string | undefined {
  const m = h.trim().replace(/^#/, "").toLowerCase();
  if (/^[0-9a-f]{6}$/.test(m)) return "#" + m;
  if (/^[0-9a-f]{3}$/.test(m)) return "#" + [...m].map((c) => c + c).join("");
  return undefined;
}

const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hex = (r: number, g: number, b: number) => "#" + [r, g, b].map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("");

// WCAG relative luminance and contrast ratio.
export function luminance(h: string): number {
  const [r, g, b] = rgb(h).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}
export const contrast = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x! + 0.05) / (y! + 0.05);
};

function toHsl(h: string): [number, number, number] {
  const [r, g, b] = rgb(h).map((v) => v / 255) as [number, number, number];
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  const hue = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(hue * 60 + 360) % 360, s, l];
}

export function fromHsl(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return hex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

// A background and text color for colors that came without them: the lightest
// and darkest, when they contrast enough; otherwise near-white and near-black.
export function withBackdrop(name: string, colors: string[]): Palette {
  const byL = [...colors].sort((a, b) => luminance(b) - luminance(a));
  const light = byL[0]!, dark = byL[byL.length - 1]!;
  const pair = colors.length > 2 && contrast(light, dark) >= 7 ? { bg: light, ink: dark } : { bg: "#fafafa", ink: "#1a1a1a" };
  return { name, colors, ...pair };
}

// --- generated palettes -------------------------------------------------------

export const HARMONIES = ["analogous", "complementary", "triad", "split", "tetrad", "mono"] as const;
export type Harmony = (typeof HARMONIES)[number];
// Hue turns for the four colors that join the seed.
const OFFSETS: Record<Harmony, number[]> = {
  analogous: [-30, -15, 15, 30],
  complementary: [0, 180, 180, 0],
  triad: [120, 240, 120, 240],
  split: [150, 210, 150, 210],
  tetrad: [90, 180, 270, 0],
  mono: [0, 0, 0, 0],
};

// Five colors around one, so a single brand color is enough to design with.
// The seed stays first; the others step from dark to light around it.
export function harmony(seed: string, kind: Harmony = "analogous"): Palette {
  const base = normHex(seed);
  if (!base) throw new Error(`"${seed}" is not a hex color`);
  const [h, s0] = toHsl(base);
  const s = Math.max(0.35, s0);
  const lights = [0.28, 0.42, 0.62, 0.8];
  const others = OFFSETS[kind].map((o, i) => fromHsl(h + o, kind === "mono" ? s : s * (i % 2 ? 0.85 : 1), lights[i]!));
  return withBackdrop(`${base} ${kind}`, [...new Set([base, ...others])]);
}

const ADJ = ["velvet", "electric", "lazy", "cosmic", "salty", "molten", "frosty", "secret", "loud", "quiet", "feral", "golden", "haunted", "jolly", "sleepy", "lucky"];
const NOUN = ["comet", "lagoon", "taco", "dragon", "harbor", "orchid", "pixel", "canyon", "lantern", "meadow", "rocket", "jellyfish", "volcano", "mixtape", "glacier", "garden"];

// A small seeded generator, so a random palette can be rolled again from its seed in tests.
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A fresh palette that still hangs together: a random hue, harmony and mood, and a made-up name.
export function randomPalette(seed = Math.floor(Math.random() * 2 ** 31)): Palette {
  const r = rng(seed);
  const pick = <T,>(a: readonly T[]) => a[Math.floor(r() * a.length)]!;
  const kind = pick(HARMONIES.filter((k) => k !== "mono"));
  const p = harmony(fromHsl(r() * 360, 0.45 + r() * 0.45, 0.42 + r() * 0.16), kind);
  return { ...p, name: `${pick(ADJ)} ${pick(NOUN)}` };
}

// --- parsing -------------------------------------------------------------------

const HEXES = /#[0-9a-f]{6}\b|#[0-9a-f]{3}\b|\b[0-9a-f]{6}\b/gi;
const COOLORS = /coolors\.co\/(?:palette\/)?([0-9a-f]{6}(?:-[0-9a-f]{6})+)/i;

// Anything a person might type for a palette. null means auto (the model picks).
// Throws on a name it doesn't know, listing the ones it does.
export function parsePalette(spec: string, seed?: number): Palette | null {
  const s = spec.trim();
  if (/^(auto|off|none|default-off|)$/i.test(s)) return null;
  if (/^(random|surprise|surprise me|roll|shuffle|dice|🎲)$/i.test(s)) return randomPalette(seed);
  const p = preset(s);
  if (p) return p;
  const coolors = s.match(COOLORS);
  if (coolors) return withBackdrop("coolors", coolors[1]!.split("-").map((h) => "#" + h.toLowerCase()));
  // "brand: #112233 #445566", or "#ff6600 triad"
  const label = s.match(/^([^:#]{1,30}):\s*(.+)$/);
  const body = label ? label[2]! : s;
  const hexes = (body.match(HEXES) ?? []).map((h) => normHex(h)!).filter(Boolean);
  const word = body.replace(HEXES, "").replace(/[,;\s]+/g, " ").trim().toLowerCase();
  if (hexes.length === 1) {
    const kind = (HARMONIES as readonly string[]).find((k) => word === k || (word.length > 2 && k.startsWith(word))) as Harmony | undefined;
    if (word && !kind) throw new Error(`a single color takes a harmony: ${HARMONIES.join(", ")}`);
    const h = harmony(hexes[0]!, kind ?? "analogous");
    return label ? { ...h, name: label[1]!.trim() } : h;
  }
  if (hexes.length >= 2 && !word) return withBackdrop(label ? label[1]!.trim() : "custom", [...new Set(hexes)].slice(0, 16));
  throw new Error(`unknown palette "${s}". Try a preset (${Object.keys(PRESETS).join(", ")}), hex colors like "#264653 #2a9d8f #e9c46a", one color and a harmony like "#ff6600 triad", a coolors.co link, random, or auto`);
}

// A palette someone asks for in a message: "use the sunset palette", "in synthwave
// colors", "palette: #111 #f60", a coolors.co link, or "a random palette".
// Picked up for that request only, so a passing mention doesn't change the setting.
export function mentionedPalette(text: string, seed?: number): Palette | undefined {
  const t = text.slice(0, 4000);
  const coolors = t.match(COOLORS);
  if (coolors) return parsePalette(coolors[0], seed) ?? undefined;
  const words = "palette|colou?rs?|colou?r ?scheme|scheme|theme|tones|vibes?";
  const listed = t.match(new RegExp(`\\b(?:${words})\\b\\s*(?:of|like|:|=)?\\s*((?:#?[0-9a-f]{3,6}\\b[\\s,;/]*(?:and\\s+)?){2,16})`, "i"));
  if (listed) {
    const hexes = (listed[1]!.match(HEXES) ?? []).map((h) => normHex(h)!).filter(Boolean);
    if (hexes.length >= 2 && hexes.some((h) => /[a-f]|^#/.test(h))) return withBackdrop("custom", [...new Set(hexes)]);
  }
  if (new RegExp(`\\b(random|surprise me with a|surprising|unexpected|wild|random-ish)\\s+(?:colou?r\\s+)?(?:${words})\\b`, "i").test(t)) return randomPalette(seed);
  const names = [...Object.keys(PRESETS), ...Object.keys(ALIASES)].sort((a, b) => b.length - a.length).map((n) => n.replace(/-/g, "[- ]?"));
  const named = t.match(new RegExp(`\\b(${names.join("|")})\\b[- ]?(?:${words})\\b|\\b(?:${words})\\s*(?::|=|called|named)?\\s*["']?(${names.join("|")})\\b`, "i"));
  const id = named && (named[1] ?? named[2]);
  return id ? preset(id) : undefined;
}

// --- prompts and display --------------------------------------------------------

// One line in the system prompt. The model sees the hex codes, so it can use
// them anywhere it writes colors: CSS, canvas, Chart.js, Mermaid, SVG, Kotlin.
export function palettePrompt(p: Palette | null): string {
  if (!p) return "";
  const back = p.bg && p.ink ? ` Background ${p.bg}, text ${p.ink}.` : "";
  return `Color palette "${p.name}": ${p.colors.join(", ")}.${back} Use these colors (and lighter or darker shades of them) for anything you design: charts, diagrams, web pages, CSS, SVG, apps and games. Keep text readable against its background.`;
}

// Appended to a message that names a palette, for that request.
export const paletteNote = (p: Palette) => `\n\n[${palettePrompt(p).replace(/^Color palette/, "Color palette for this request")}]`;

// Truecolor blocks for the terminal: one swatch per color.
export function swatches(p: Palette): string {
  const block = (h: string) => {
    const [r, g, b] = rgb(h);
    return `\x1b[48;2;${r};${g};${b}m   \x1b[0m`;
  };
  return p.colors.map(block).join("");
}

export function describePalette(p: Palette | null): string {
  return p ? `${p.name} ${p.colors.join(" ")}` : "auto (the model picks its own colors)";
}

// Everything the app's picker needs to draw its preset swatches.
export const presetList = () => Object.entries(PRESETS).map(([name, p]) => ({ name, colors: p.colors, bg: p.bg, ink: p.ink, vibe: p.vibe }));

// --- saved setting ----------------------------------------------------------------

export const paletteFile = () => join(maxxHome(), "palette.json");

function clean(v: unknown): Palette | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const colors = Array.isArray(o.colors) ? o.colors.map((c) => normHex(String(c))).filter((c): c is string => !!c).slice(0, 16) : [];
  if (colors.length < 2) return null;
  const opt = (x: unknown) => (typeof x === "string" ? normHex(x) : undefined);
  const bg = opt(o.bg), ink = opt(o.ink);
  return { name: String(o.name ?? "custom").slice(0, 40) || "custom", colors, ...(bg && ink ? { bg, ink } : {}) };
}

// The palette itself is saved, not what was typed, so a random roll survives a restart.
export async function loadPalette(): Promise<Palette | null> {
  try {
    return clean((JSON.parse(await readFile(paletteFile(), "utf8")) as { palette?: unknown }).palette);
  } catch {
    return null;
  }
}

export async function savePalette(p: Palette | null) {
  await mkdir(maxxHome(), { recursive: true });
  await writeFile(paletteFile(), JSON.stringify({ palette: p }, null, 2) + "\n");
}

// The flag beats the environment ($MAXX_PALETTE), which beats the saved setting.
export async function resolvePalette(flag?: string, env = process.env): Promise<Palette | null> {
  const v = flag ?? env.MAXX_PALETTE;
  if (v === undefined || v === "") return loadPalette();
  return parsePalette(v);
}

export const checkPalette = clean;
