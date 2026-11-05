// Themes ("skins") for the Maxx window: whole looks, not just an accent swap. Each one sets
// the colors, its own fonts (baked into maxx.exe, so they work offline), the shape of things
// and a backdrop. Picked in ⚙ Settings → 🖌 Theme; the choice is kept in localStorage.
import { readFileSync } from "node:fs";
// @ts-ignore: file imports have no type declarations (they embed in maxx.exe)
import F_SPACE from "./fonts/space-grotesk-400-700.woff2" with { type: "file" };
// @ts-ignore
import F_SPACEMONO4 from "./fonts/space-mono-400.woff2" with { type: "file" };
// @ts-ignore
import F_SPACEMONO7 from "./fonts/space-mono-700.woff2" with { type: "file" };
// @ts-ignore
import F_VT from "./fonts/vt323-400.woff2" with { type: "file" };
// @ts-ignore
import F_PLEXMONO4 from "./fonts/ibm-plex-mono-400.woff2" with { type: "file" };
// @ts-ignore
import F_PLEXMONO6 from "./fonts/ibm-plex-mono-600.woff2" with { type: "file" };
// @ts-ignore
import F_ORBITRON from "./fonts/orbitron-500-900.woff2" with { type: "file" };
// @ts-ignore
import F_EXO from "./fonts/exo2-400-700.woff2" with { type: "file" };
// @ts-ignore
import F_ARCH from "./fonts/architects-daughter-400.woff2" with { type: "file" };
// @ts-ignore
import F_PLEXC4 from "./fonts/ibm-plex-sans-cond-400.woff2" with { type: "file" };
// @ts-ignore
import F_PLEXC6 from "./fonts/ibm-plex-sans-cond-600.woff2" with { type: "file" };
// @ts-ignore
import F_ARCHIVO from "./fonts/archivo-black-400.woff2" with { type: "file" };
// @ts-ignore
import F_BRICO from "./fonts/bricolage-400-800.woff2" with { type: "file" };
// @ts-ignore
import F_SYNE from "./fonts/syne-500-800.woff2" with { type: "file" };
// @ts-ignore
import F_OUTFIT from "./fonts/outfit-300-700.woff2" with { type: "file" };

export type Skin = { id: string; name: string; say: string; glyph: string; dark: boolean | null };

// The theme the window starts in until the user picks one.
export const SKIN_DEFAULT = "classic";

export const SKINS: Skin[] = [
  { id: "classic", name: "Classic", say: "The original: warm paper and orange, follows Windows light/dark", glyph: "◆", dark: null },
  { id: "abduction", name: "Abduction", say: "Deep space, alien lime and hoodie blue. A tractor beam under every step", glyph: "🛸", dark: true },
  { id: "phosphor", name: "Phosphor", say: "A green CRT terminal: scanlines, glow, square corners, VT323", glyph: "▌", dark: true },
  { id: "nightdrive", name: "Nightdrive", say: "Synthwave: a neon grid racing to a striped sun, chrome letters", glyph: "▲", dark: true },
  { id: "blueprint", name: "Blueprint", say: "Drafting paper: grid lines, hand lettering, a title block, yellow pencil", glyph: "⌖", dark: true },
  { id: "riso", name: "Riso", say: "A loud printed zine: fluoro pink, yellow, thick ink and off-register shadows", glyph: "✺", dark: false },
  { id: "abyss", name: "Abyss", say: "The deep sea: drifting marine snow and bioluminescent glow", glyph: "✧", dark: true },
];

const face = (family: string, file: string, weight: string) =>
  `@font-face{font-family:"${family}";src:url(data:font/woff2;base64,${readFileSync(file).toString("base64")}) format("woff2");font-weight:${weight};font-style:normal;font-display:swap}`;

const FONTS = [
  face("Space Grotesk", F_SPACE, "300 700"), face("Space Mono", F_SPACEMONO4, "400"), face("Space Mono", F_SPACEMONO7, "700"),
  face("VT323", F_VT, "400"), face("IBM Plex Mono", F_PLEXMONO4, "400"), face("IBM Plex Mono", F_PLEXMONO6, "600 700"),
  face("Orbitron", F_ORBITRON, "500 900"), face("Exo 2", F_EXO, "400 700"), face("Architects Daughter", F_ARCH, "400"),
  face("IBM Plex Sans Condensed", F_PLEXC4, "400"), face("IBM Plex Sans Condensed", F_PLEXC6, "600 700"),
  face("Archivo Black", F_ARCHIVO, "400"), face("Bricolage Grotesque", F_BRICO, "400 800"),
  face("Syne", F_SYNE, "500 800"), face("Outfit", F_OUTFIT, "300 700"),
].join("\n");

// Shared hooks every theme can fill in: a backdrop (--wall), a heading font (--head) and the
// elements that use it. Classic leaves them at their plain defaults.
const BASE = `
:root { --head: var(--font); --wall: none; --wall-size: auto; --glow: none; }
body { background-color: var(--bg); background-image: var(--wall); background-size: var(--wall-size); background-attachment: fixed; }
.brand, header .where b, h2, h3, .pop h4, .hbtn, .seg button, .chip, button.primary, .board .head, .plan .head, .starter b, .tool summary b, .prow .pl b { font-family: var(--head); }
html[data-skin]:not([data-skin="classic"]) ::selection { background: var(--accent); color: var(--accent-ink); }
html[data-skin]:not([data-skin="classic"]) * { scrollbar-color: color-mix(in srgb, var(--accent) 45%, var(--line)) transparent; scrollbar-width: thin; }
html[data-skin]:not([data-skin="classic"]) dialog::backdrop { background: color-mix(in srgb, var(--bg) 70%, transparent); backdrop-filter: blur(3px); }
html[data-skin]:not([data-skin="classic"]) .seg button.on { color: var(--seg-on-ink, var(--ink)) !important; }
html[data-skin]:not([data-skin="classic"]) .brand b { color: var(--accent); text-shadow: var(--glow); }
@media (prefers-reduced-motion: reduce) { html[data-skin] *, html[data-skin] *::before, html[data-skin] *::after, html[data-skin]::after { animation: none !important; } }
`;

const ABDUCTION = `
[data-skin="abduction"] {
  --bg: #060a1c; --panel: #0c1230; --ink: #e8edff; --mute: #8b93c7; --line: #1f2a5e; --code: #080d26; --user: #1d34b0;
  --accent: #a6f23c; --accent-ink: #0b1a00; --ok: #5ef0a0; --bad: #ff5c7c; --agent: #5b8cff; --crew: #d38bff; --warn: #ffd23f; --warn-ink: #1a1400;
  --radius: 14px; --font: "Space Grotesk", system-ui, sans-serif; --head: "Space Grotesk", system-ui, sans-serif; --mono: "Space Mono", ui-monospace, Consolas, monospace;
  --glow: 0 0 10px rgba(166,242,60,.65); --seg-on-ink: #fff;
  --wall: radial-gradient(1px 1px at 23px 41px, #fff, transparent), radial-gradient(1px 1px at 137px 88px, #cfe0ff, transparent), radial-gradient(1.5px 1.5px at 201px 173px, #fff, transparent), radial-gradient(1px 1px at 61px 211px, #a6f23c, transparent), radial-gradient(1px 1px at 173px 19px, #fff, transparent),
    radial-gradient(1px 1px at 91px 141px, #8fa6ff, transparent), radial-gradient(1.5px 1.5px at 311px 61px, #fff, transparent), radial-gradient(1px 1px at 263px 277px, #fff, transparent), radial-gradient(1px 1px at 349px 199px, #cfe0ff, transparent),
    radial-gradient(ellipse 60% 45% at 85% 10%, rgba(91,140,255,.18), transparent 70%), radial-gradient(ellipse 50% 40% at 10% 95%, rgba(166,242,60,.09), transparent 70%), radial-gradient(ellipse 40% 35% at 45% 55%, rgba(211,139,255,.07), transparent 70%);
  --wall-size: 230px 230px, 230px 230px, 230px 230px, 230px 230px, 230px 230px, 370px 370px, 370px 370px, 370px 370px, 370px 370px, 100% 100%, 100% 100%, 100% 100%;
}
html[data-skin="abduction"] aside, html[data-skin="abduction"] header, html[data-skin="abduction"] #rail, html[data-skin="abduction"] .activity { background: rgba(10,16,44,.72); backdrop-filter: blur(8px); }
html[data-skin="abduction"] .composer { background: transparent; }
html[data-skin="abduction"] main { position: relative; isolation: isolate; }
html[data-skin="abduction"] main::after { content: ""; position: absolute; right: -150px; bottom: 120px; width: 330px; height: 330px; border-radius: 50%; z-index: -1; pointer-events: none;
  background: radial-gradient(circle at 30% 28%, #3b5bdb 0%, #1d34b0 35%, #0b1550 75%, #060a1c 100%);
  box-shadow: inset 10px 6px 30px rgba(166,242,60,.35), 0 0 60px rgba(91,140,255,.35); opacity: .85; }
html[data-skin="abduction"] main::before { content: ""; position: absolute; right: -230px; bottom: 270px; width: 490px; height: 60px; border-radius: 50%; z-index: -1; pointer-events: none; transform: rotate(-18deg);
  border: 3px solid rgba(166,242,60,.45); border-top-color: transparent; box-shadow: 0 6px 18px rgba(166,242,60,.15); }
html[data-skin="abduction"] .brand { letter-spacing: 3px; text-transform: uppercase; font-weight: 700; }
html[data-skin="abduction"] .brand b { display: inline-block; animation: sk-hover 3.2s ease-in-out infinite; text-shadow: none; filter: drop-shadow(0 6px 6px rgba(166,242,60,.55)); }
html[data-skin="abduction"] button { border-radius: 999px; }
html[data-skin="abduction"] button.primary, html[data-skin="abduction"] .chip.on, html[data-skin="abduction"] .switch.on { box-shadow: 0 0 16px rgba(166,242,60,.45); font-weight: 600; }
html[data-skin="abduction"] .msg.user { color: #fff; border-radius: 18px 18px 4px 18px; box-shadow: 0 6px 20px rgba(29,52,176,.45); }
html[data-skin="abduction"] .tool, html[data-skin="abduction"] .board, html[data-skin="abduction"] .plan { background: rgba(12,18,48,.82); }
html[data-skin="abduction"] .tool summary b { color: var(--accent); }
html[data-skin="abduction"] .cbox { background: rgba(12,18,48,.9); border-color: #2a3880; box-shadow: 0 0 0 1px rgba(166,242,60,.08), 0 10px 40px rgba(0,0,0,.45); }
html[data-skin="abduction"] .cbox:focus-within { border-color: var(--accent); box-shadow: 0 0 22px rgba(166,242,60,.25); }
html[data-skin="abduction"] .activity.on { background: linear-gradient(90deg, rgba(166,242,60,.16), rgba(166,242,60,0) 55%), rgba(10,16,44,.72); box-shadow: inset 3px 0 0 var(--accent); }
html[data-skin="abduction"] .seg button.on { background: var(--user); color: #fff; }
@keyframes sk-hover { 50% { transform: translateY(-3px) rotate(-6deg); } }
`;

const PHOSPHOR = `
[data-skin="phosphor"] {
  --bg: #020904; --panel: #051208; --ink: #62ff9a; --mute: #2da35b; --line: #124326; --code: #031007; --user: #0a2614;
  --accent: #62ff9a; --accent-ink: #021006; --ok: #62ff9a; --bad: #ff5f4a; --agent: #6be8ff; --crew: #ffb43a; --warn: #ffb43a; --warn-ink: #140b00;
  --radius: 0px; --font: "IBM Plex Mono", ui-monospace, monospace; --mono: "IBM Plex Mono", ui-monospace, monospace; --head: "VT323", ui-monospace, monospace;
  --glow: 0 0 6px rgba(98,255,154,.75); --seg-on-ink: #020904;
  --wall: radial-gradient(ellipse 80% 70% at 50% 45%, #062010, #020904 75%);
}
html[data-skin="phosphor"] body { font-size: 13.5px; text-shadow: 0 0 5px rgba(98,255,154,.38); }
html[data-skin="phosphor"]::after { content: ""; position: fixed; inset: 0; pointer-events: none; z-index: 2147483000;
  background: repeating-linear-gradient(to bottom, rgba(0,0,0,.28) 0 1px, transparent 1px 3px), radial-gradient(ellipse at center, transparent 58%, rgba(0,0,0,.6) 100%);
  animation: sk-flicker 5s steps(2) infinite; }
html[data-skin="phosphor"] * { border-radius: 0 !important; }
html[data-skin="phosphor"] .brand { font-size: 30px; letter-spacing: 4px; text-transform: uppercase; text-shadow: var(--glow); font-weight: 400; }
html[data-skin="phosphor"] .brand::after { content: "_"; animation: blink 1s steps(1) infinite; margin-left: -6px; }
html[data-skin="phosphor"] .hbtn, html[data-skin="phosphor"] .seg button, html[data-skin="phosphor"] button.primary, html[data-skin="phosphor"] .chip, html[data-skin="phosphor"] header .where b { font-size: 18px; line-height: 1; text-transform: uppercase; letter-spacing: 1px; }
html[data-skin="phosphor"] .board .head, html[data-skin="phosphor"] .plan .head, html[data-skin="phosphor"] h2, html[data-skin="phosphor"] h3, html[data-skin="phosphor"] .pop h4, html[data-skin="phosphor"] .prow .pl b, html[data-skin="phosphor"] .starter b { font-size: 19px; font-weight: 400; letter-spacing: .5px; }
html[data-skin="phosphor"] .tool summary b { font-family: var(--mono); }
html[data-skin="phosphor"] button:hover:not(:disabled), html[data-skin="phosphor"] .cbar .tb:hover:not(:disabled) { background: var(--ink); color: var(--bg); text-shadow: none; }
html[data-skin="phosphor"] button.primary, html[data-skin="phosphor"] .chip.on, html[data-skin="phosphor"] .seg button.on { background: var(--ink); color: var(--bg); text-shadow: none; box-shadow: 0 0 12px rgba(98,255,154,.5); }
html[data-skin="phosphor"] .msg.user { background: none; border-left: 2px solid var(--ink); color: #c9ffd9; padding: 2px 10px; }
html[data-skin="phosphor"] .msg.user::before { content: "> "; color: var(--ink); }
html[data-skin="phosphor"] .tool, html[data-skin="phosphor"] .board, html[data-skin="phosphor"] .plan, html[data-skin="phosphor"] .cbox { border-style: dashed; }
html[data-skin="phosphor"] .cbox:focus-within { border-style: solid; border-color: var(--ink); box-shadow: 0 0 14px rgba(98,255,154,.3); }
html[data-skin="phosphor"] textarea, html[data-skin="phosphor"] input { caret-color: var(--ink); caret-shape: block; }
html[data-skin="phosphor"] textarea::placeholder { color: var(--mute); }
html[data-skin="phosphor"] .switch i { background: var(--bg); }
html[data-skin="phosphor"] img, html[data-skin="phosphor"] .alien { filter: saturate(.6) sepia(.25) hue-rotate(60deg); }
@keyframes sk-flicker { 50% { opacity: .92; } }
`;

// The synthwave floor: lines fanning out from a vanishing point, rows packing toward the horizon.
const GRID = (() => {
  const W = 1000, H = 300, lines: string[] = [];
  for (let i = -24; i <= 24; i++) lines.push(`<line x1="${W / 2 + i * 8}" y1="0" x2="${W / 2 + i * 90}" y2="${H}"/>`);
  for (let k = 1; k <= 12; k++) { const y = H * Math.pow(k / 12, 2.2); lines.push(`<line x1="0" y1="${y.toFixed(1)}" x2="${W}" y2="${y.toFixed(1)}"/>`); }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><g stroke="#ff2fa8" stroke-width="1.6" vector-effect="non-scaling-stroke" opacity=".6">${lines.join("")}</g><line x1="0" y1="0.8" x2="${W}" y2="0.8" stroke="#22e4ff" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
})();

const NIGHTDRIVE = `
[data-skin="nightdrive"] {
  --bg: #12022b; --panel: #1c0640; --ink: #fde9ff; --mute: #b98ad8; --line: #3f1872; --code: #120329; --user: #48106c;
  --accent: #ff2fa8; --accent-ink: #fff; --ok: #3dffb0; --bad: #ff4f6e; --agent: #22e4ff; --crew: #ffcf3a; --warn: #ffcf3a; --warn-ink: #2a1500;
  --radius: 6px; --font: "Exo 2", system-ui, sans-serif; --head: "Orbitron", "Exo 2", sans-serif;
  --glow: 0 0 8px rgba(255,47,168,.9), 0 0 22px rgba(255,47,168,.5); --seg-on-ink: #fff;
  --wall: linear-gradient(180deg, #08011c 0%, #1c0545 45%, #3d0a62 75%, #5c0c62 100%);
}
html[data-skin="nightdrive"] main { position: relative; isolation: isolate; }
html[data-skin="nightdrive"] main::before { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 38%; z-index: -1; pointer-events: none;
  background: url("${GRID}") center bottom / 100% 100% no-repeat; -webkit-mask-image: linear-gradient(to top, #000 50%, transparent); mask-image: linear-gradient(to top, #000 50%, transparent); animation: sk-pulse 3s ease-in-out infinite; }
html[data-skin="nightdrive"] main::after { content: ""; position: absolute; left: 50%; bottom: 38%; width: 340px; height: 170px; margin-left: -170px; border-radius: 160px 160px 0 0; z-index: -2; pointer-events: none; opacity: .55;
  background: linear-gradient(180deg, #ffe45c 0%, #ff8a3d 40%, #ff2fa8 75%, #b31aa8 100%);
  -webkit-mask-image: linear-gradient(180deg, #000 0 40%, transparent 40% 46%, #000 46% 58%, transparent 58% 66%, #000 66% 76%, transparent 76% 86%, #000 86% 93%, transparent 93%);
  mask-image: linear-gradient(180deg, #000 0 40%, transparent 40% 46%, #000 46% 58%, transparent 58% 66%, #000 66% 76%, transparent 76% 86%, #000 86% 93%, transparent 93%);
  filter: drop-shadow(0 0 40px rgba(255,47,168,.6)); }
html[data-skin="nightdrive"] aside, html[data-skin="nightdrive"] #rail { background: rgba(14,2,36,.78); }
html[data-skin="nightdrive"] header { background: rgba(14,2,36,.7); backdrop-filter: blur(6px); border-bottom: 1px solid transparent; border-image: linear-gradient(90deg, transparent, #ff2fa8, #22e4ff, transparent) 1; }
html[data-skin="nightdrive"] .composer { background: transparent; }
html[data-skin="nightdrive"] .brand { font-weight: 900; font-size: 22px; letter-spacing: 3px; text-transform: uppercase; font-style: italic;
  background: linear-gradient(180deg, #ffffff 0%, #ffd6f1 40%, #ff2fa8 52%, #7a2bd6 100%); -webkit-background-clip: text; background-clip: text; color: transparent; filter: drop-shadow(0 0 8px rgba(255,47,168,.6)); }
html[data-skin="nightdrive"] .brand b { -webkit-text-fill-color: #22e4ff; color: #22e4ff; font-style: normal; }
html[data-skin="nightdrive"] .hbtn, html[data-skin="nightdrive"] .seg button, html[data-skin="nightdrive"] button.primary, html[data-skin="nightdrive"] .chip { text-transform: uppercase; letter-spacing: 1px; font-size: 11px; font-weight: 600; }
html[data-skin="nightdrive"] header .where b, html[data-skin="nightdrive"] .board .head, html[data-skin="nightdrive"] .plan .head { letter-spacing: .5px; font-size: 13px; }
html[data-skin="nightdrive"] button.primary { background: linear-gradient(90deg, #ff2fa8, #a12bff); border-color: transparent; box-shadow: 0 0 18px rgba(255,47,168,.55); }
html[data-skin="nightdrive"] .seg button.on { background: #ff2fa8; color: #fff; box-shadow: 0 0 12px rgba(255,47,168,.6); }
html[data-skin="nightdrive"] .msg.user { background: linear-gradient(135deg, rgba(255,47,168,.35), rgba(34,228,255,.18)); border: 1px solid rgba(255,47,168,.7); box-shadow: 0 0 16px rgba(255,47,168,.25); }
html[data-skin="nightdrive"] .tool, html[data-skin="nightdrive"] .board, html[data-skin="nightdrive"] .plan { background: rgba(28,6,64,.88); }
html[data-skin="nightdrive"] .activity { background: rgba(14,2,36,.55) !important; }
html[data-skin="nightdrive"] .tool summary b { color: #22e4ff; text-shadow: 0 0 6px rgba(34,228,255,.6); }
html[data-skin="nightdrive"] .cbox { background: rgba(20,3,48,.92); border-color: #ff2fa8; box-shadow: 0 0 14px rgba(255,47,168,.35), inset 0 0 12px rgba(255,47,168,.08); }
html[data-skin="nightdrive"] .cbox:focus-within { box-shadow: 0 0 24px rgba(255,47,168,.6); }
html[data-skin="nightdrive"] .activity { background: rgba(14,2,36,.78); }
@keyframes sk-pulse { 50% { opacity: .7; } }
`;

const BLUEPRINT = `
[data-skin="blueprint"] {
  --bg: #0c3c71; --panel: #0f4580; --ink: #f2f8ff; --mute: #a6c8ec; --line: rgba(230,242,255,.32); --code: rgba(5,30,60,.45); --user: rgba(255,225,77,.12);
  --accent: #ffe14d; --accent-ink: #0b2a4d; --ok: #8dffb0; --bad: #ff8f7f; --agent: #9fd8ff; --crew: #ffb8f2; --warn: #ffe14d; --warn-ink: #0b2a4d;
  --seg-on-ink: #0c3c71; --radius: 2px; --font: "IBM Plex Sans Condensed", "Segoe UI", sans-serif; --mono: "IBM Plex Mono", ui-monospace, monospace; --head: "Architects Daughter", "Segoe Print", cursive;
  --wall: linear-gradient(rgba(255,255,255,.13) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.13) 1px, transparent 1px), linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px), radial-gradient(ellipse at 30% 20%, #135095, #0c3c71 70%);
  --wall-size: 100px 100px, 100px 100px, 20px 20px, 20px 20px, 100% 100%;
}
html[data-skin="blueprint"] aside, html[data-skin="blueprint"] header, html[data-skin="blueprint"] .composer, html[data-skin="blueprint"] #rail, html[data-skin="blueprint"] .activity { background: transparent; }
html[data-skin="blueprint"] aside { border-right: 2px solid rgba(230,242,255,.55); }
html[data-skin="blueprint"] header { border-bottom: 2px solid rgba(230,242,255,.55); }
html[data-skin="blueprint"] aside::after { content: "MAXX AGENT · DWG 001\\A SCALE 1:1 · SHEET 1 OF 1\\A DRAWN BY MAXX · REV B"; white-space: pre; margin: 10px; padding: 8px 10px; border: 1.5px solid rgba(230,242,255,.7); font: 600 10.5px/1.6 var(--mono); letter-spacing: 1px; color: var(--mute); }
html[data-skin="blueprint"] .brand { font-size: 24px; letter-spacing: 1px; }
html[data-skin="blueprint"] .brand b { color: var(--accent); }
html[data-skin="blueprint"] .hbtn, html[data-skin="blueprint"] .seg button, html[data-skin="blueprint"] button.primary, html[data-skin="blueprint"] .chip { font-size: 14px; }
html[data-skin="blueprint"] header .where b, html[data-skin="blueprint"] .board .head, html[data-skin="blueprint"] .plan .head, html[data-skin="blueprint"] .prow .pl b { font-size: 15.5px; font-weight: 400; }
html[data-skin="blueprint"] button, html[data-skin="blueprint"] input, html[data-skin="blueprint"] select, html[data-skin="blueprint"] textarea { background: rgba(5,30,60,.35); }
html[data-skin="blueprint"] select option { background: #0c3c71; }
html[data-skin="blueprint"] button.primary { background: var(--accent); color: var(--accent-ink); }
html[data-skin="blueprint"] .seg { background: transparent; }
html[data-skin="blueprint"] .seg button.on { background: var(--ink); color: #0c3c71; }
html[data-skin="blueprint"] .tool { background: rgba(5,30,60,.35); border-style: dashed; }
html[data-skin="blueprint"] .board, html[data-skin="blueprint"] .plan { background: rgba(5,30,60,.4); border: 1.5px solid rgba(230,242,255,.6); border-left-width: 4px; }
html[data-skin="blueprint"] .msg.user { background: rgba(255,225,77,.1); border: 1.5px solid var(--accent); font-family: var(--head); font-size: 15px; transform: rotate(-.4deg); }
html[data-skin="blueprint"] .cbox { background: rgba(5,30,60,.5); border: 1.5px solid rgba(230,242,255,.7); }
html[data-skin="blueprint"] .cbox textarea { font-family: var(--head); font-size: 15px; }
html[data-skin="blueprint"] .tool summary b { color: var(--accent); }
html[data-skin="blueprint"] .pop, html[data-skin="blueprint"] dialog { background: #0e4380; }
`;

const RISO = `
[data-skin="riso"] {
  --bg: #f3ecdc; --panel: #fffaf0; --ink: #1d1a3a; --mute: #5c5876; --line: #1d1a3a; --code: #f1e8d6; --user: #ffe800;
  --accent: #ff3fa4; --accent-ink: #1d1a3a; --ok: #00a95c; --bad: #e8263b; --agent: #0078bf; --crew: #00a95c; --warn: #ffe800; --warn-ink: #1d1a3a;
  --seg-on-ink: #fff; --radius: 4px; --font: "Bricolage Grotesque", system-ui, sans-serif; --head: "Archivo Black", "Arial Black", sans-serif; --mono: "Space Mono", ui-monospace, monospace;
  --wall: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .11 0 0 0 0 .1 0 0 0 0 .23 0 0 0 .09 0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E");
  --wall-size: 160px 160px;
}
html[data-skin="riso"] aside { background: #ff3fa4 radial-gradient(rgba(29,26,58,.22) 1.2px, transparent 1.4px) 0 0 / 7px 7px; border-right: 3px solid var(--ink); }
html[data-skin="riso"] aside .proj > .name:hover, html[data-skin="riso"] aside .sess:hover { background: rgba(255,250,240,.6); }
html[data-skin="riso"] aside { --mute: #1d1a3a; }
html[data-skin="riso"] aside .sess.on { background: #ffe800; box-shadow: 2px 2px 0 var(--ink); }
html[data-skin="riso"] aside input, html[data-skin="riso"] aside button { background: var(--panel); border-width: 2px; }
html[data-skin="riso"] header { background: var(--bg); border-bottom: 3px solid var(--ink); }
html[data-skin="riso"] #rail { background: #ffe800; border-left: 3px solid var(--ink); }
html[data-skin="riso"] .brand { font-size: 30px; text-transform: uppercase; letter-spacing: -1px; text-shadow: 3px 2px 0 #0078bf; transform: rotate(-3deg); }
html[data-skin="riso"] .brand b { color: #ffe800 !important; text-shadow: 2px 2px 0 var(--ink) !important; }
html[data-skin="riso"] .hbtn, html[data-skin="riso"] .seg button, html[data-skin="riso"] button.primary, html[data-skin="riso"] .chip { text-transform: uppercase; font-size: 11.5px; letter-spacing: .5px; font-weight: 400; }
html[data-skin="riso"] header .where b, html[data-skin="riso"] .board .head, html[data-skin="riso"] .plan .head, html[data-skin="riso"] .prow .pl b { font-weight: 400; }
html[data-skin="riso"] button { border-width: 2px; border-color: var(--ink); }
html[data-skin="riso"] button:hover:not(:disabled) { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 var(--ink); }
html[data-skin="riso"] button.primary { box-shadow: 3px 3px 0 #0078bf; }
html[data-skin="riso"] .seg { border-width: 2px; border-color: var(--ink); background: var(--panel); }
html[data-skin="riso"] .seg button { border: 0; }
html[data-skin="riso"] .seg button.on { background: #0078bf; color: #fff; box-shadow: none; }
html[data-skin="riso"] .msg.user { border: 2px solid var(--ink); box-shadow: 4px 4px 0 #ff3fa4; transform: rotate(.6deg); }
html[data-skin="riso"] .tool { border: 2px solid var(--ink); box-shadow: 3px 3px 0 #0078bf; }
html[data-skin="riso"] .tool summary b { color: #0078bf; font-family: var(--head); font-weight: 400; }
html[data-skin="riso"] .board, html[data-skin="riso"] .plan { border: 2px solid var(--ink); border-left-width: 8px; box-shadow: 4px 4px 0 #ffe800, 4px 4px 0 2px var(--ink); }
html[data-skin="riso"] .cbox { border: 3px solid var(--ink); box-shadow: 5px 5px 0 #ff3fa4; border-radius: 6px; }
html[data-skin="riso"] .cbox:focus-within { box-shadow: 5px 5px 0 #0078bf; }
html[data-skin="riso"] .prow { border-top: 1.5px dashed rgba(29,26,58,.35); }
html[data-skin="riso"] .pop, html[data-skin="riso"] dialog { border: 3px solid var(--ink) !important; box-shadow: 6px 6px 0 #ff3fa4 !important; }
html[data-skin="riso"] .composer { background: transparent; }
`;

const ABYSS = `
[data-skin="abyss"] {
  --bg: #011318; --panel: #032229; --ink: #d8fff7; --mute: #6fb2ac; --line: #0c3e47; --code: #021a20; --user: #064049;
  --accent: #3dffd2; --accent-ink: #00241c; --ok: #7dffb2; --bad: #ff6f91; --agent: #7ab0ff; --crew: #ff86e6; --warn: #ffd36e; --warn-ink: #2a1a00;
  --radius: 18px; --font: "Outfit", system-ui, sans-serif; --head: "Syne", "Outfit", sans-serif;
  --glow: 0 0 12px rgba(61,255,210,.8); --seg-on-ink: #00241c;
  --wall: radial-gradient(ellipse 90% 55% at 50% -10%, rgba(40,160,170,.35), transparent 70%), radial-gradient(ellipse 30% 25% at 88% 78%, rgba(255,134,230,.10), transparent 70%), radial-gradient(ellipse 25% 20% at 12% 60%, rgba(61,255,210,.08), transparent 70%), linear-gradient(180deg, #03303a 0%, #011318 45%, #00070a 100%);
  --wall-size: 100% 100%;
}
html[data-skin="abyss"] main { position: relative; isolation: isolate; }
html[data-skin="abyss"] main::before { content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none; opacity: 1;
  background-image: radial-gradient(1.5px 1.5px at 30px 60px, rgba(216,255,247,.7), transparent), radial-gradient(1px 1px at 120px 150px, rgba(216,255,247,.5), transparent), radial-gradient(2px 2px at 200px 40px, rgba(61,255,210,.6), transparent), radial-gradient(1px 1px at 260px 220px, rgba(216,255,247,.5), transparent), radial-gradient(1.5px 1.5px at 80px 260px, rgba(255,134,230,.5), transparent);
  background-size: 300px 300px; animation: sk-snow 60s linear infinite; }
html[data-skin="abyss"] main::after { content: ""; position: absolute; inset: 0; z-index: -2; pointer-events: none;
  background: linear-gradient(105deg, transparent 20%, rgba(120,255,230,.06) 24%, transparent 30%), linear-gradient(98deg, transparent 48%, rgba(120,255,230,.05) 53%, transparent 60%), linear-gradient(110deg, transparent 68%, rgba(120,255,230,.045) 71%, transparent 76%),
    radial-gradient(circle 70px at 90% 70%, rgba(255,134,230,.22), transparent 70%), radial-gradient(circle 46px at 6% 38%, rgba(61,255,210,.2), transparent 70%);
  -webkit-mask-image: linear-gradient(180deg, #000, transparent 85%); animation: sk-rays 14s ease-in-out infinite alternate; }
@keyframes sk-rays { to { opacity: .55; transform: translateX(-30px); } }
html[data-skin="abyss"] aside, html[data-skin="abyss"] header, html[data-skin="abyss"] #rail, html[data-skin="abyss"] .activity { background: rgba(2,26,32,.6); backdrop-filter: blur(10px); }
html[data-skin="abyss"] .composer { background: transparent; }
html[data-skin="abyss"] .brand { font-weight: 800; font-size: 21px; letter-spacing: .5px; }
html[data-skin="abyss"] .brand b { display: inline-block; animation: sk-breathe 4s ease-in-out infinite; }
html[data-skin="abyss"] button { border-radius: 999px; }
html[data-skin="abyss"] button.primary { box-shadow: 0 0 18px rgba(61,255,210,.45); animation: sk-lume 4s ease-in-out infinite; font-weight: 600; }
html[data-skin="abyss"] .seg { border-radius: 999px; } html[data-skin="abyss"] .seg button { border-radius: 999px; }
html[data-skin="abyss"] .seg button.on { background: var(--accent); color: var(--accent-ink); }
html[data-skin="abyss"] .msg.user { background: linear-gradient(135deg, rgba(61,255,210,.18), rgba(122,176,255,.14)); border: 1px solid rgba(61,255,210,.35); border-radius: 20px 20px 6px 20px; }
html[data-skin="abyss"] .tool, html[data-skin="abyss"] .board, html[data-skin="abyss"] .plan { background: rgba(3,34,41,.7); backdrop-filter: blur(6px); }
html[data-skin="abyss"] .tool:hover { box-shadow: 0 0 18px rgba(61,255,210,.15); }
html[data-skin="abyss"] .tool summary b { color: var(--accent); }
html[data-skin="abyss"] .cbox { background: rgba(3,34,41,.82); border-color: rgba(61,255,210,.3); border-radius: 22px; box-shadow: 0 10px 40px rgba(0,0,0,.5); }
html[data-skin="abyss"] .cbox:focus-within { border-color: var(--accent); box-shadow: 0 0 28px rgba(61,255,210,.25); }
@keyframes sk-snow { to { background-position: 40px -600px; } }
@keyframes sk-breathe { 50% { text-shadow: 0 0 18px rgba(61,255,210,1); transform: scale(1.12); } }
@keyframes sk-lume { 50% { box-shadow: 0 0 28px rgba(61,255,210,.7); } }
`;

// The picker: one card per theme, each a small working mock drawn in that theme's own colors and fonts.
const PICKER = `
#skinDlg { border: 1px solid var(--line); border-radius: 12px; background: var(--panel); color: var(--ink); padding: 0; width: min(820px, calc(100vw - 32px)); }
#skinDlg form { display: flex; flex-direction: column; gap: 10px; padding: 16px; }
#skinDlg h3 { margin: 0; }
#skinDlg .hint { font-size: 12px; color: var(--mute); margin: 0; }
#skinDlg .btns { display: flex; gap: 8px; justify-content: flex-end; }
.skins { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px; max-height: 64vh; overflow: auto; padding: 4px; }
.skin { display: flex; flex-direction: column; padding: 0; overflow: hidden; text-align: left; border: 1px solid var(--line); border-radius: 10px; background: var(--panel); color: var(--ink); cursor: pointer; font-family: var(--font); transform: none !important; }
.skin.on { outline: 3px solid var(--accent); outline-offset: 2px; }
.skin .mini { display: grid; grid-template-columns: 30% 1fr; height: 120px; background-color: var(--bg); background-image: var(--wall); background-size: var(--wall-size); border-bottom: 1px solid var(--line); }
.skin .mini .ms { background: color-mix(in srgb, var(--panel) 75%, transparent); border-right: 1px solid var(--line); padding: 8px 6px; display: flex; flex-direction: column; gap: 6px; }
.skin .mini .mb { font: 700 12px var(--head); color: var(--ink); white-space: nowrap; }
.skin .mini .mb b { color: var(--accent); }
.skin .mini .ml { height: 6px; border-radius: 3px; background: var(--line); }
.skin .mini .ml.s { width: 60%; background: var(--user); }
.skin .mini .mm { padding: 8px; display: flex; flex-direction: column; gap: 6px; }
.skin .mini .mu { align-self: flex-end; background: var(--user); color: var(--ink); font-size: 11px; padding: 3px 8px; border-radius: calc(var(--radius) * .7); }
.skin .mini .mt { font: 10.5px/1.3 var(--mono); color: var(--mute); border: 1px solid var(--line); background: var(--panel); border-radius: calc(var(--radius) * .5); padding: 3px 6px; }
.skin .mini .mt b { color: var(--accent); font-weight: 600; }
.skin .mini .mp { margin-top: auto; align-self: flex-end; background: var(--accent); color: var(--accent-ink); font: 600 10.5px var(--head); padding: 3px 10px; border-radius: calc(var(--radius) * .6); }
.skin .nm { padding: 6px 10px 0; font: 700 15px var(--head); color: var(--ink); }
.skin .vb { padding: 0 10px 8px; font-size: 11.5px; color: var(--mute); line-height: 1.35; }
.skin .dots { display: flex; gap: 3px; padding: 0 10px 8px; }
.skin .dots i { width: 14px; height: 14px; border-radius: 50%; border: 1px solid var(--line); }
`;

export const SKIN_CSS = [FONTS, BASE, ABDUCTION, PHOSPHOR, NIGHTDRIVE, BLUEPRINT, RISO, ABYSS, PICKER].join("\n");

// Runs in <head> before anything paints, so the window never flashes the wrong theme.
export const SKIN_BOOT = `<script data-skin-boot>(function(){var M=${JSON.stringify(Object.fromEntries(SKINS.map((s) => [s.id, s.dark])))};var s="${SKIN_DEFAULT}";try{var v=localStorage.getItem("maxx.skin");if(v&&v in M)s=v;}catch(e){}var h=document.documentElement;h.dataset.skin=s;if(M[s]!==null){h.dataset.dark=M[s]?"1":"0";h.style.colorScheme=M[s]?"dark":"light";}})();</script>`;

export const SKIN_ROW = `<div class="prow"><div class="pl"><b>🖌 Theme</b><span>How the Maxx window itself looks</span></div>
      <button id="skinBtn" title="Change how the Maxx window looks: colors, fonts, shapes and backdrop">Classic</button></div>`;

export const SKIN_HTML = `<dialog id="skinDlg"><form method="dialog">
  <h3>🖌 Theme</h3>
  <p class="hint">A whole look for the Maxx window: colors, fonts, shapes and a backdrop. Click one to try it on; it sticks until you pick another. (🎨 Colors is different: that's the palette Maxx designs your charts, pages and games with.)</p>
  <div class="skins" id="skinGrid"></div>
  <div class="btns"><button class="primary" value="cancel">Done</button></div>
</form></dialog>`;

export const SKIN_JS = `
const SKINS = ${JSON.stringify(SKINS)};
function skinNow() { return document.documentElement.dataset.skin || "${SKIN_DEFAULT}"; }
function skinApply(id) {
  const t = SKINS.find((s) => s.id === id) || SKINS[0], h = document.documentElement;
  h.dataset.skin = t.id;
  if (t.dark === null) { delete h.dataset.dark; h.style.colorScheme = ""; } else { h.dataset.dark = t.dark ? "1" : "0"; h.style.colorScheme = t.dark ? "dark" : "light"; }
  const g = document.querySelector(".brand b"); if (g) g.textContent = t.glyph;
  if ($("skinBtn")) $("skinBtn").textContent = t.glyph + " " + t.name;
  try { localStorage.setItem("maxx.skin", t.id); } catch {}
}
function skinGrid() {
  const grid = $("skinGrid"); grid.innerHTML = "";
  for (const t of SKINS) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "skin" + (t.id === skinNow() ? " on" : ""); b.dataset.skin = t.id;
    b.innerHTML = '<span class="mini"><span class="ms"><span class="mb"><b></b> Maxx</span><i class="ml"></i><i class="ml s"></i><i class="ml"></i></span>' +
      '<span class="mm"><span class="mu">make it pop ✨</span><span class="mt"><b>Edit</b> index.html</span><span class="mt"><b>Run</b> npm test</span><span class="mp">Send</span></span></span>' +
      '<span class="nm"></span><span class="vb"></span><span class="dots">' + ["--bg", "--panel", "--accent", "--agent", "--crew", "--ink"].map((v) => '<i style="background:var(' + v + ')"></i>').join("") + "</span>";
    b.querySelector(".mb b").textContent = t.glyph; b.querySelector(".nm").textContent = t.name; b.querySelector(".vb").textContent = t.say;
    b.onclick = () => { skinApply(t.id); skinGrid(); };
    grid.appendChild(b);
  }
}
$("skinBtn").onclick = () => { skinGrid(); $("skinDlg").showModal(); };
skinApply(skinNow());
`;
