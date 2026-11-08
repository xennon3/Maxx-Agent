// The typing buddy: a cartoon alien in the status bar that acts out what Maxx is doing
// while it works. Typing a reply or code, reading files, running a command, searching
// the web, drawing, driving a phone, making sounds, thinking, waiting, or holding up
// an "OK?" sign while a step waits for you. The user picks the alien (or Random, or
// the plain spinner) in ⚙ Settings → 👽 Typing buddy; the choice is kept in localStorage.
//
// Every scene is one small inline SVG (viewBox 64×48): a character on the left, the
// action's props and arms on the right. Arms are drawn by the action in the
// character's skin color, so any alien can do any job. Animation is plain CSS.
// ALIEN_JS is a plain string spliced into page.ts's script, so it has no backslashes
// of its own (page.ts's literal text needs them doubled; a spliced value does not).

import { readFileSync } from "node:fs";
// @ts-ignore: file imports have no type declarations (they embed in maxx.exe)
import H_TYPE from "./aliens/hoodie/type.webp" with { type: "file" };
// @ts-ignore
import H_READ from "./aliens/hoodie/read.webp" with { type: "file" };
// @ts-ignore
import H_RUN from "./aliens/hoodie/run.webp" with { type: "file" };
// @ts-ignore
import H_WEB from "./aliens/hoodie/web.webp" with { type: "file" };
// @ts-ignore
import H_DRAW from "./aliens/hoodie/draw.webp" with { type: "file" };
// @ts-ignore
import H_PHONE from "./aliens/hoodie/phone.webp" with { type: "file" };
// @ts-ignore
import H_SOUND from "./aliens/hoodie/sound.webp" with { type: "file" };
// @ts-ignore
import H_THINK from "./aliens/hoodie/think.webp" with { type: "file" };
// @ts-ignore
import H_WAIT from "./aliens/hoodie/wait.webp" with { type: "file" };
// @ts-ignore
import H_ASK from "./aliens/hoodie/ask.webp" with { type: "file" };

type Char = { name: string; say: string; sk: string; skd: string; head: [number, number, number]; body: string };
type Act = { label: string; icon: string; back?: string; front: string; arms?: (c: Char) => string };

const arm = (x1: number, y1: number, x2: number, y2: number, cls = "") =>
  `<g class="arm ${cls}"><path d="M${x1} ${y1} Q${(x1 + x2) / 2} ${Math.max(y1, y2) + 2} ${x2} ${y2}" stroke="var(--sk)" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="${x2}" cy="${y2}" r="1.9" fill="var(--sk)" stroke="var(--skd)" stroke-width=".6"/></g>`;
const eyes = (l: number, r: number, y: number, rx = 2.6, ry = 3.4) =>
  `<g class="blink" style="transform-origin:16px ${y}px"><ellipse cx="${l}" cy="${y}" rx="${rx}" ry="${ry}" fill="#111"/><ellipse cx="${r}" cy="${y}" rx="${rx}" ry="${ry}" fill="#111"/><circle cx="${l + 0.8}" cy="${y - 1.2}" r=".9" fill="#fff"/><circle cx="${r + 0.8}" cy="${y - 1.2}" r=".9" fill="#fff"/></g>`;

export const CHARS: Record<string, Char> = {
  zorp: {
    name: "Zorp", say: "Classic little green coder with bouncy antennae", sk: "#74d65e", skd: "#2f7a24", head: [16, 17, 10],
    body: `<g class="bob"><ellipse cx="12" cy="45" rx="3" ry="1.4" fill="var(--skd)"/><ellipse cx="20" cy="45" rx="3" ry="1.4" fill="var(--skd)"/>
<ellipse cx="16" cy="37" rx="8" ry="7.5" fill="var(--sk)" stroke="var(--skd)"/>
<g class="hd"><g class="ant"><path d="M12 10 L9 3 M20 10 L23 3" stroke="var(--skd)" stroke-width="1.2" fill="none"/><circle cx="9" cy="3" r="1.7" fill="#ffd43b"/><circle cx="23" cy="3" r="1.7" fill="#ffd43b"/></g>
<ellipse cx="16" cy="17" rx="10" ry="8.5" fill="var(--sk)" stroke="var(--skd)"/>${eyes(12, 20, 16.5)}
<path d="M13 22 Q16 24.5 19 22" stroke="var(--skd)" fill="none" stroke-width="1" stroke-linecap="round"/></g></g>`,
  },
  blip: {
    name: "Blip", say: "Purple one-eyed blob whose eye darts across every line", sk: "#a06cf0", skd: "#5a2ea6", head: [16, 21, 10],
    body: `<g class="bob"><g class="hd"><path d="M16 10 L16 4" stroke="var(--skd)" stroke-width="1.2"/><circle class="glow" cx="16" cy="3.5" r="2" fill="#ff6bd6"/></g>
<path d="M5 45 Q3 28 8 19 Q16 6 24 19 Q29 28 27 45 Q21.5 42 16 45 Q10.5 42 5 45Z" fill="var(--sk)" stroke="var(--skd)"/>
<circle cx="9" cy="33" r="1.2" fill="#c9a6ff"/><circle cx="23" cy="36" r="1.5" fill="#c9a6ff"/><circle cx="11" cy="39" r=".9" fill="#c9a6ff"/>
<g class="hd"><g class="blink" style="transform-origin:16px 21px"><circle cx="16" cy="21" r="6.2" fill="#fff" stroke="var(--skd)" stroke-width=".8"/><g class="pupil"><circle cx="16" cy="21" r="3.1" fill="#2fb36b"/><circle cx="16" cy="21" r="1.6" fill="#111"/><circle cx="17" cy="20" r=".7" fill="#fff"/></g></g>
<path d="M13 31 Q16 33.5 19 31" stroke="var(--skd)" fill="none" stroke-width="1" stroke-linecap="round"/></g></g>`,
  },
  vex: {
    name: "Vex", say: "Big-eyed grey from the far side of the galaxy, very focused", sk: "#c3cad5", skd: "#6b7686", head: [16, 16, 11],
    body: `<g class="bob"><rect x="11" y="31" width="10" height="13" rx="4" fill="var(--sk)" stroke="var(--skd)"/><circle cx="16" cy="35" r="1.4" fill="#4dabf7"/>
<rect x="14.5" y="28" width="3" height="4" fill="var(--sk)"/>
<g class="hd"><path d="M16 4 C27 4 29 14 25 21 C22 26 19 29 16 29 C13 29 10 26 7 21 C3 14 5 4 16 4Z" fill="var(--sk)" stroke="var(--skd)"/>
<g class="blink" style="transform-origin:16px 16px"><path d="M7.5 14 Q11 11.5 14.5 16.5 Q12 20 7.5 14Z" fill="#0d0d12"/><path d="M24.5 14 Q21 11.5 17.5 16.5 Q20 20 24.5 14Z" fill="#0d0d12"/><circle cx="10.5" cy="14.5" r=".8" fill="#fff"/><circle cx="21.5" cy="14.5" r=".8" fill="#fff"/></g>
<path d="M14.5 23.5 H17.5" stroke="var(--skd)" stroke-width=".9" stroke-linecap="round"/></g></g>`,
  },
  quadra: {
    name: "Quadra", say: "Pink, three eyes, four arms: the spare pair waves hello", sk: "#ff8fc7", skd: "#b0306f", head: [16, 19, 10],
    body: `<g class="bob"><g class="wave2"><path d="M7 33 Q2 31 2 25" stroke="var(--sk)" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="2" cy="25" r="1.7" fill="var(--sk)" stroke="var(--skd)" stroke-width=".6"/></g>
<path d="M8 11 L6 6 L11 9Z M24 11 L26 6 L21 9Z" fill="var(--skd)"/>
<ellipse cx="16" cy="28" rx="10.5" ry="16" fill="var(--sk)" stroke="var(--skd)"/>
<g class="hd"><g class="blink" style="transform-origin:16px 19px"><circle cx="10" cy="19" r="2.4" fill="#fff"/><circle cx="16" cy="17.5" r="2.6" fill="#fff"/><circle cx="22" cy="19" r="2.4" fill="#fff"/>
<g class="pupil"><circle cx="10.4" cy="19.2" r="1.2" fill="#111"/><circle cx="16.4" cy="17.7" r="1.3" fill="#111"/><circle cx="22.4" cy="19.2" r="1.2" fill="#111"/></g></g>
<path d="M12.5 25 Q16 28 19.5 25" stroke="var(--skd)" fill="none" stroke-width="1" stroke-linecap="round"/></g>
<path d="M9 38 Q13 40 14 36" stroke="var(--skd)" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>`,
  },
  pix: {
    name: "Pix", say: "Tiny pilot typing from inside a hovering saucer", sk: "#8ce99a", skd: "#2b8a3e", head: [16, 27, 6],
    body: `<g class="hover"><ellipse class="glow" cx="16" cy="43" rx="7" ry="1.6" fill="#74c0fc"/>
<ellipse cx="16" cy="27" rx="6" ry="5" fill="var(--sk)" stroke="var(--skd)" stroke-width=".7"/>${eyes(13.6, 18.4, 27, 1.4, 2)}
<ellipse cx="16" cy="34" rx="4" ry="3" fill="var(--sk)"/>
<path d="M5 36.5 A11 11 0 0 1 27 36.5Z" fill="rgba(165,216,255,.35)" stroke="#74c0fc" stroke-width=".8"/>
<ellipse cx="16" cy="38.5" rx="15" ry="4.5" fill="#9aa5b1" stroke="#5c6670" stroke-width=".8"/>
<g class="lights"><circle cx="5" cy="39" r="1" fill="#ffd43b"/><circle cx="10.5" cy="40.5" r="1" fill="#ff6b6b"/><circle cx="16" cy="41" r="1" fill="#ffd43b"/><circle cx="21.5" cy="40.5" r="1" fill="#ff6b6b"/><circle cx="27" cy="39" r="1" fill="#ffd43b"/></g></g>`,
  },
  bit: {
    name: "Bit", say: "Chunky 8-bit alien that moves in pixel steps", sk: "#4dd4ac", skd: "#087f5b", head: [16, 14, 8],
    body: `<g class="step" shape-rendering="crispEdges"><rect x="14" y="0" width="4" height="2" fill="#ffd43b"/><rect x="15" y="2" width="2" height="4" fill="var(--skd)"/>
<rect x="10" y="6" width="12" height="2" fill="var(--sk)"/><rect x="8" y="8" width="16" height="12" fill="var(--sk)"/>
<g class="blink" style="transform-origin:16px 13px"><rect x="11" y="11" width="3" height="4" fill="#111"/><rect x="18" y="11" width="3" height="4" fill="#111"/></g>
<rect x="13" y="17" width="6" height="1.5" fill="var(--skd)"/><rect x="13" y="20" width="6" height="2" fill="var(--sk)"/>
<rect x="10" y="22" width="12" height="14" fill="var(--sk)"/><rect x="12" y="25" width="2" height="2" fill="var(--skd)"/><rect x="18" y="29" width="2" height="2" fill="var(--skd)"/>
<rect x="10" y="36" width="4" height="7" fill="var(--sk)"/><rect x="18" y="36" width="4" height="7" fill="var(--sk)"/>
<rect x="8" y="43" width="6" height="2" fill="var(--skd)"/><rect x="18" y="43" width="6" height="2" fill="var(--skd)"/></g>`,
  },
};

// Drawn aliens: one animated WebP per scene instead of SVG. Hoodie is Luther's own
// alien (his GIFs, shrunk to 160px animated WebP, which keeps soft transparent edges).
const webp = (path: string) => "data:image/webp;base64," + readFileSync(path).toString("base64");
export const PICS: Record<string, { name: string; say: string; frames: Record<string, string> }> = {
  hoodie: {
    name: "Hoodie", say: "Luther's own alien in a blue hoodie",
    frames: { type: H_TYPE, read: H_READ, run: H_RUN, web: H_WEB, draw: H_DRAW, phone: H_PHONE, sound: H_SOUND, think: H_THINK, wait: H_WAIT, ask: H_ASK },
  },
};

// Which scene each tool plays. Anything unknown counts as running a command.
export const TOOL_ACT: [RegExp, string][] = [
  [/^(write_file|edit_file|rename_symbol|git_commit|remember|recipe|plan)$/, "type"],
  [/^(read_file|grep|list_files|code_nav|project_map|git)$/, "read"],
  [/^(web_search|web_fetch|browser_\w+|lookup)$/, "web"],
  [/^(draw_svg|image_\w+|design_tokens|pick_fonts|sprite_sheet|mood_board|make_icons|asset_kit|rival_designs|sketch_to_app|theme|ugly_check|use_template)$/, "draw"],
  [/^(android_\w+|desktop_\w+|snap_page|persona_test|timelapse)$/, "phone"],
  [/^(make_sounds|speak|video|compose|make_song|mix_audio)$/, "sound"],
];

const ink = "#2b2f3a";
export const ACTS: Record<string, Act> = {
  type: {
    label: "Typing", icon: "⌨",
    back: `<rect x="38" y="17" width="23" height="17" rx="1.6" fill="${ink}" stroke="#5c636e" stroke-width=".8"/>
<rect class="ln l1" x="41" y="20.5" width="12" height="1.6" rx=".8" fill="#ff8787"/><rect class="ln l2" x="43" y="24" width="14" height="1.6" rx=".8" fill="#74c0fc"/><rect class="ln l3" x="43" y="27.5" width="9" height="1.6" rx=".8" fill="#8ce99a"/><rect class="ln l4" x="41" y="31" width="6" height="1.4" rx=".7" fill="#ffd43b"/>`,
    front: `<path d="M35 34 H62 L60 38 H32 Z" fill="#adb5bd" stroke="#868e96" stroke-width=".6"/>
<g class="keys"><rect class="k1" x="37" y="35.2" width="3" height="1.2" fill="#fff"/><rect class="k2" x="42" y="35.2" width="3" height="1.2" fill="#fff"/><rect class="k3" x="47" y="35.2" width="3" height="1.2" fill="#fff"/><rect class="k4" x="52" y="35.2" width="3" height="1.2" fill="#fff"/></g>
<g class="sparks" font-family="monospace" font-size="4.5" font-weight="700"><text class="sp1" x="40" y="33" fill="#f59f00">{</text><text class="sp2" x="47" y="33" fill="#d6336c">;</text><text class="sp3" x="53" y="33" fill="#1c7ed6">}</text></g>`,
    arms: () => arm(22, 31, 41, 35.5, "tap1") + arm(10, 33, 36, 36.5, "tap2"),
  },
  read: {
    label: "Reading", icon: "🔍",
    back: `<g transform="rotate(4 47 31)"><rect x="36" y="17" width="22" height="27" rx="1.5" fill="#fff8e1" stroke="#c9b37e" stroke-width=".8"/>
<rect x="39" y="21" width="15" height="1.3" fill="#adb5bd"/><rect x="39" y="24.5" width="12" height="1.3" fill="#adb5bd"/><rect x="41" y="28" width="13" height="1.3" fill="#adb5bd"/><rect x="41" y="31.5" width="9" height="1.3" fill="#adb5bd"/><rect x="39" y="35" width="14" height="1.3" fill="#adb5bd"/><rect x="39" y="38.5" width="10" height="1.3" fill="#adb5bd"/></g>`,
    front: ``,
    arms: () => arm(10, 33, 36, 41) + `<g class="scan">${arm(22, 31, 38, 33)}<path d="M38 33 L41.5 29.5" stroke="#495057" stroke-width="1.6" stroke-linecap="round"/><circle cx="44.5" cy="26.5" r="4.6" fill="rgba(116,192,252,.28)" stroke="#495057" stroke-width="1.4"/><path d="M42.5 24.5 Q43.5 23.3 45 23.4" stroke="#fff" stroke-width=".8" fill="none"/></g>`,
  },
  run: {
    label: "Running", icon: "▶",
    back: `<rect x="40" y="9" width="22" height="17" rx="2" fill="#111" stroke="#5c636e" stroke-width=".8"/>
<text x="42.5" y="15" font-family="monospace" font-size="4.5" font-weight="700" fill="#51cf66">&gt;_</text>
<rect x="42.5" y="20" width="17" height="2.6" rx="1.3" fill="#2b2f3a"/><rect class="bar" x="42.5" y="20" width="17" height="2.6" rx="1.3" fill="#51cf66"/>
<g class="puffs"><circle class="pf1" cx="46" cy="8" r="1.6" fill="#ced4da"/><circle class="pf2" cx="52" cy="8" r="1.3" fill="#ced4da"/><circle class="pf3" cx="57" cy="8" r="1.8" fill="#ced4da"/></g>
<rect x="33" y="39" width="11" height="7" rx="1" fill="#868e96"/>`,
    front: `<g class="press"><ellipse cx="38.5" cy="38.6" rx="4.3" ry="1.8" fill="#c92a2a"/><ellipse cx="38.5" cy="37.8" rx="4.3" ry="1.8" fill="#fa5252"/></g>
<g class="boom" font-family="system-ui" font-size="5" font-weight="900" fill="#f59f00"><text x="44" y="37">!</text></g>`,
    arms: () => arm(10, 33, 4, 38) + arm(22, 31, 38.5, 35, "slam"),
  },
  web: {
    label: "Searching the web", icon: "🔭",
    back: `<path d="M48 30 L48 45 M43 46 H53" stroke="#868e96" stroke-width="1.6" stroke-linecap="round"/>
<g class="dish"><path d="M39 17 Q40 32 56 33 Z" fill="#e9ecef" stroke="#868e96" stroke-width=".9"/><path d="M47 28 L52 21" stroke="#868e96" stroke-width="1"/><circle cx="52" cy="21" r="1.3" fill="#fa5252"/></g>
<g class="waves" fill="none" stroke="#4dabf7" stroke-width="1.1" stroke-linecap="round"><path class="w1" d="M54 16 Q57 18 56 21"/><path class="w2" d="M56 12 Q61 16 59 22"/><path class="w3" d="M58 8 Q65 14 62 23"/></g>
<circle cx="60" cy="40" r="3.4" fill="#4dabf7" stroke="#1c7ed6" stroke-width=".6"/><path d="M57.2 39 Q60 38 62.8 41 M60 36.6 Q58 40 60 43.4" stroke="#8ce99a" stroke-width=".9" fill="none"/>`,
    front: `<g class="crank"><circle cx="48" cy="37" r="3" fill="none" stroke="#495057" stroke-width="1"/><path d="M48 37 L51 37" stroke="#495057" stroke-width="1.2"/></g>`,
    arms: () => arm(10, 33, 6, 27, "wave2") + arm(22, 31, 44, 37, "tap1"),
  },
  draw: {
    label: "Drawing", icon: "🎨",
    back: `<path d="M41 46 L46 14 M57 46 L52 14 M49 46 L49 32" stroke="#a9744f" stroke-width="1.4" stroke-linecap="round"/>
<rect x="37" y="13" width="24" height="19" fill="#fff" stroke="#adb5bd" stroke-width=".8"/>
<path class="st s1" pathLength="1" d="M40 27 Q45 16 50 23 T59 18" stroke="#f76707" stroke-width="1.8" fill="none" stroke-linecap="round"/>
<path class="st s2" pathLength="1" d="M41 30 Q50 25 58 29" stroke="#1c7ed6" stroke-width="1.6" fill="none" stroke-linecap="round"/>
<circle class="st s3" pathLength="1" cx="54" cy="21" r="2.6" stroke="#ae3ec9" stroke-width="1.4" fill="none"/>`,
    front: `<ellipse cx="7" cy="37" rx="5.5" ry="3.5" fill="#e3c9a0" stroke="#a9744f" stroke-width=".6"/><circle cx="5" cy="36" r="1" fill="#f76707"/><circle cx="8" cy="35.4" r="1" fill="#1c7ed6"/><circle cx="10" cy="37.4" r="1" fill="#ae3ec9"/>`,
    arms: () => arm(10, 33, 7, 37) + `<g class="paint">${arm(22, 31, 37, 27)}<path d="M37 27 L42 22" stroke="#a9744f" stroke-width="1.3" stroke-linecap="round"/><circle cx="42.3" cy="21.7" r="1.1" fill="#f76707"/></g>`,
  },
  phone: {
    label: "Using the phone", icon: "📱",
    back: `<rect x="34" y="16" width="12" height="22" rx="2.2" fill="#212529"/><rect x="35.3" y="18.5" width="9.4" height="16.5" rx=".8" fill="#e7f5ff"/>
<rect class="tile t1" x="36.4" y="20" width="3.2" height="3.2" rx=".6" fill="#ff8787"/><rect class="tile t2" x="40.6" y="20" width="3.2" height="3.2" rx=".6" fill="#74c0fc"/><rect class="tile t3" x="36.4" y="24.5" width="3.2" height="3.2" rx=".6" fill="#8ce99a"/><rect class="tile t4" x="40.6" y="24.5" width="3.2" height="3.2" rx=".6" fill="#ffd43b"/>
<circle class="ripple" cx="42.2" cy="30.5" r="2" fill="none" stroke="#1c7ed6" stroke-width=".8"/>
<g class="flash"><path d="M52 14 L55 11 M54 20 L58 20 M52 26 L55 29" stroke="#fab005" stroke-width="1.2" stroke-linecap="round"/></g>`,
    front: ``,
    arms: () => arm(10, 33, 36, 37) + arm(22, 31, 42, 30.5, "poke"),
  },
  sound: {
    label: "Making sounds", icon: "🎵",
    back: `<g class="eq"><rect class="e1" x="38" y="26" width="3" height="8" fill="#ae3ec9"/><rect class="e2" x="43" y="26" width="3" height="8" fill="#1c7ed6"/><rect class="e3" x="48" y="26" width="3" height="8" fill="#2b8a3e"/><rect class="e4" x="53" y="26" width="3" height="8" fill="#f76707"/><rect class="e5" x="58" y="26" width="3" height="8" fill="#d6336c"/></g>
<g class="notes" font-family="system-ui" font-size="7" fill="#ae3ec9"><text class="n1" x="40" y="20">♪</text><text class="n2" x="50" y="18">♫</text><text class="n3" x="57" y="22">♪</text></g>`,
    front: `<rect x="34" y="35" width="28" height="7" rx="1" fill="#f8f9fa" stroke="#495057" stroke-width=".7"/>
<path d="M38 35 V42 M42 35 V42 M46 35 V42 M50 35 V42 M54 35 V42 M58 35 V42" stroke="#adb5bd" stroke-width=".5"/>
<rect x="37" y="35" width="2" height="4" fill="#212529"/><rect x="41" y="35" width="2" height="4" fill="#212529"/><rect x="49" y="35" width="2" height="4" fill="#212529"/><rect x="53" y="35" width="2" height="4" fill="#212529"/><rect x="57" y="35" width="2" height="4" fill="#212529"/>`,
    arms: (c) => {
      const [x, y, r] = c.head;
      const phones = `<path d="M${x - r} ${y} Q${x} ${y - r * 1.9} ${x + r} ${y}" stroke="#343a40" stroke-width="1.8" fill="none"/><rect x="${x - r - 2.5}" y="${y - 2.5}" width="4" height="6" rx="1.5" fill="#495057"/><rect x="${x + r - 1.5}" y="${y - 2.5}" width="4" height="6" rx="1.5" fill="#495057"/>`;
      return `<g class="hdp">${phones}</g>` + arm(22, 31, 46, 37, "tap1") + arm(10, 33, 39, 37.5, "tap2");
    },
  },
  think: {
    label: "Thinking", icon: "💭",
    back: `<g class="bubble"><circle cx="29" cy="12" r="1.3" fill="#fff" stroke="#adb5bd" stroke-width=".6"/><circle cx="33" cy="8.5" r="2" fill="#fff" stroke="#adb5bd" stroke-width=".6"/>
<path d="M38 12 Q35 5 41 4 Q44 -1 50 2 Q57 0 58 6 Q63 9 58 13 Q56 18 49 16 Q43 19 40 15 Q36 15 38 12Z" fill="#fff" stroke="#adb5bd" stroke-width=".7"/>
<g class="gear" style="transform-origin:46px 9.5px"><circle cx="46" cy="9.5" r="2.4" fill="none" stroke="#868e96" stroke-width="1.4" stroke-dasharray="1.2 .7"/><circle cx="46" cy="9.5" r=".8" fill="#868e96"/></g>
<text class="q" x="51" y="12.5" font-family="system-ui" font-size="7" font-weight="800" fill="#d9480f">?</text></g>`,
    front: ``,
    arms: (c) => arm(22, 31, c.head[0] + 3, c.head[1] + c.head[2] - 1, "chin") + arm(10, 33, 14, 39),
  },
  wait: {
    label: "Waiting", icon: "⏳",
    back: `<g class="steam" fill="none" stroke="#adb5bd" stroke-width=".9" stroke-linecap="round"><path class="sm1" d="M37 26 Q35 23 37 20 Q39 17 37 14"/><path class="sm2" d="M40 26 Q38 23 40 20 Q42 17 40 14"/></g>
<g class="glass" style="transform-origin:54px 36px"><path d="M49 28 H59 L54 36 L59 44 H49 L54 36Z" fill="rgba(165,216,255,.35)" stroke="#495057" stroke-width=".9"/><path class="sand" d="M51 42.5 H57 L54 39Z" fill="#f59f00"/><path d="M48 28 H60 M48 44 H60" stroke="#a9744f" stroke-width="1.4"/></g>`,
    front: `<g class="sip"><rect x="34" y="27" width="7" height="7" rx="1.2" fill="#d9480f"/><path d="M41 28.5 Q44 30.5 41 32.5" stroke="#d9480f" stroke-width="1.1" fill="none"/><text x="35" y="32.6" font-family="system-ui" font-size="4" fill="#fff">★</text></g>`,
    arms: () => arm(10, 33, 14, 40) + `<g class="sip">${arm(22, 31, 34.5, 31)}</g>`,
  },
  ask: {
    label: "Waiting for your OK", icon: "✋",
    back: ``,
    front: `<g class="sign"><path d="M41 21 L41 40" stroke="#a9744f" stroke-width="1.6" stroke-linecap="round"/><rect x="31" y="5" width="22" height="15" rx="2" fill="#fff3bf" stroke="#f59f00" stroke-width="1"/><text x="34.2" y="15.8" font-family="system-ui" font-size="8" font-weight="900" fill="#d9480f">OK?</text></g>`,
    arms: () => `<g class="sign">${arm(22, 31, 41, 34)}</g>` + arm(10, 33, 3, 24, "wave2"),
  },
};

export const ALIEN_CSS = `
.buddy { display: none; flex: none; width: 64px; height: 48px; margin: -6px 0; }
.activity.alien .buddy { display: block; }
.activity.alien .spin { display: none; }
img.alimg { width: 100%; height: 100%; object-fit: contain; display: block; }
.buddy:has(img) { width: 60px; height: 60px; margin: -12px 0; }
.alcard .pic img.alimg { width: 96px; height: 96px; }
svg.al { width: 100%; height: 100%; overflow: visible; display: block; --sp: .3s; }
svg.al * { transform-box: view-box; }
svg.al .blink { animation: al-blink 4.2s infinite; }
svg.al .bob { animation: al-bob 1.6s ease-in-out infinite; }
svg.al .ant { transform-origin: 16px 10px; animation: al-wig 1.1s ease-in-out infinite alternate; }
svg.al .glow { animation: al-glow 1.2s ease-in-out infinite alternate; }
svg.al .pupil { animation: al-dart 1.8s ease-in-out infinite; }
svg.al .wave2 { transform-origin: 7px 33px; animation: al-wave .7s ease-in-out infinite alternate; }
svg.al .hover { animation: al-hover 2s ease-in-out infinite; }
svg.al .lights circle { animation: al-glow .5s steps(1) infinite alternate; }
svg.al .lights circle:nth-child(2n) { animation-delay: .25s; }
svg.al .step { animation: al-step .8s steps(1) infinite; }
svg.al .tap1 { transform-origin: 22px 31px; animation: al-tap var(--sp) ease-in-out infinite alternate; }
svg.al .tap2 { transform-origin: 10px 33px; animation: al-tap var(--sp) ease-in-out infinite alternate-reverse; }
svg.al .keys rect { opacity: .25; animation: al-key calc(var(--sp) * 4) steps(1) infinite; }
svg.al .keys .k2 { animation-delay: calc(var(--sp) * -1); } svg.al .keys .k3 { animation-delay: calc(var(--sp) * -2); } svg.al .keys .k4 { animation-delay: calc(var(--sp) * -3); }
svg.al .ln { transform-origin: 41px 0; animation: al-line calc(var(--sp) * 14) linear infinite; }
svg.al .l2 { animation-delay: calc(var(--sp) * -10); } svg.al .l3 { animation-delay: calc(var(--sp) * -6); } svg.al .l4 { animation-delay: calc(var(--sp) * -2); }
svg.al .sparks text { opacity: 0; animation: al-spark calc(var(--sp) * 6) ease-out infinite; }
svg.al .sp2 { animation-delay: calc(var(--sp) * -2) !important; } svg.al .sp3 { animation-delay: calc(var(--sp) * -4) !important; }
svg.al .scan { transform-origin: 22px 31px; animation: al-scan 2.4s ease-in-out infinite alternate; }
svg.al .slam { transform-origin: 22px 31px; animation: al-slam 1.4s ease-in infinite; }
svg.al .press { animation: al-press 1.4s ease-in infinite; }
svg.al .boom { opacity: 0; animation: al-boom 1.4s infinite; }
svg.al .bar { transform-origin: 42.5px 0; animation: al-bar 2.8s ease-in-out infinite; }
svg.al .puffs circle { opacity: 0; animation: al-puff 2.1s ease-out infinite; }
svg.al .pf2 { animation-delay: -.7s !important; } svg.al .pf3 { animation-delay: -1.4s !important; }
svg.al .dish { transform-origin: 48px 30px; animation: al-dish 3s ease-in-out infinite alternate; }
svg.al .waves path { opacity: 0; animation: al-ping 1.5s ease-out infinite; }
svg.al .w2 { animation-delay: .25s !important; } svg.al .w3 { animation-delay: .5s !important; }
svg.al .crank { transform-origin: 48px 37px; animation: al-spin 1.2s linear infinite; }
svg.al .paint { transform-origin: 22px 31px; animation: al-paint 1.6s ease-in-out infinite; }
svg.al .st { stroke-dasharray: 1; stroke-dashoffset: 1; animation: al-draw 4.8s ease-in-out infinite; }
svg.al .s2 { animation-delay: .8s; } svg.al .s3 { animation-delay: 1.6s; }
svg.al .poke { transform-origin: 22px 31px; animation: al-poke .9s ease-in-out infinite; }
svg.al .ripple { transform-origin: 42.2px 30.5px; opacity: 0; animation: al-ripple .9s ease-out infinite; }
svg.al .tile { animation: al-key 1.8s steps(1) infinite; } svg.al .t2 { animation-delay: -.45s; } svg.al .t3 { animation-delay: -.9s; } svg.al .t4 { animation-delay: -1.35s; }
svg.al .flash { opacity: 0; animation: al-boom 1.8s infinite; }
svg.al .eq rect { transform-origin: 0 34px; animation: al-eq .45s ease-in-out infinite alternate; }
svg.al .e2 { animation-delay: -.15s !important; } svg.al .e3 { animation-delay: -.3s !important; } svg.al .e4 { animation-delay: -.1s !important; } svg.al .e5 { animation-delay: -.25s !important; }
svg.al .notes text { opacity: 0; animation: al-note 2.4s ease-out infinite; }
svg.al .n2 { animation-delay: -.8s !important; } svg.al .n3 { animation-delay: -1.6s !important; }
svg.al .hdp { animation: al-bob .45s ease-in-out infinite alternate; }
svg.al.a-sound .bob, svg.al.a-sound .step { animation: al-bob .45s ease-in-out infinite alternate; }
svg.al .bubble { animation: al-hover 2.4s ease-in-out infinite; }
svg.al .gear { animation: al-spin 2s linear infinite; }
svg.al .q { animation: al-glow .8s ease-in-out infinite alternate; }
svg.al.a-think .hd { transform-origin: 16px 28px; animation: al-tilt 2.4s ease-in-out infinite alternate; }
svg.al.a-think .pupil { animation: none; transform: translate(.8px, -1.2px); }
svg.al .chin { transform-origin: 22px 31px; animation: al-tap 1.2s ease-in-out infinite alternate; }
svg.al .sip { transform-origin: 22px 31px; animation: al-sip 3s ease-in-out infinite; }
svg.al .steam path { opacity: 0; animation: al-steam 2s ease-out infinite; } svg.al .sm2 { animation-delay: -1s !important; }
svg.al .glass { animation: al-flip 4s ease-in-out infinite; }
svg.al .sand { transform-origin: 54px 44px; animation: al-sand 2s linear infinite; }
svg.al .sign { transform-origin: 41px 40px; animation: al-sway 1.2s ease-in-out infinite alternate; }
@keyframes al-blink { 0%, 92%, 100% { transform: scaleY(1); } 95% { transform: scaleY(.1); } }
@keyframes al-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-.8px); } }
@keyframes al-wig { from { transform: rotate(-7deg); } to { transform: rotate(7deg); } }
@keyframes al-glow { from { opacity: 1; } to { opacity: .35; } }
@keyframes al-dart { 0%, 100% { transform: translateX(-1.6px); } 45%, 55% { transform: translateX(1.6px); } }
@keyframes al-wave { from { transform: rotate(-10deg); } to { transform: rotate(14deg); } }
@keyframes al-hover { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
@keyframes al-step { 0% { transform: translateY(0); } 50% { transform: translateY(-1px); } }
@keyframes al-tap { from { transform: rotate(-5deg); } to { transform: rotate(2deg); } }
@keyframes al-key { 0% { opacity: 1; fill: #ffd43b; } 25% { opacity: .25; } }
@keyframes al-line { 0% { transform: scaleX(0); } 40%, 90% { transform: scaleX(1); } 100% { transform: scaleX(0); } }
@keyframes al-spark { 0% { opacity: 0; transform: translateY(0); } 20% { opacity: 1; } 100% { opacity: 0; transform: translateY(-9px); } }
@keyframes al-scan { 0% { transform: rotate(-10deg); } 33% { transform: rotate(6deg); } 66% { transform: rotate(-3deg); } 100% { transform: rotate(14deg); } }
@keyframes al-slam { 0%, 100% { transform: rotate(-26deg); } 55% { transform: rotate(-26deg); } 70% { transform: rotate(0); } 85% { transform: rotate(0); } }
@keyframes al-press { 0%, 66%, 90%, 100% { transform: translateY(0); } 72%, 84% { transform: translateY(1.2px); } }
@keyframes al-boom { 0%, 68% { opacity: 0; transform: scale(.5); } 75% { opacity: 1; transform: scale(1.1); } 95%, 100% { opacity: 0; } }
@keyframes al-bar { 0% { transform: scaleX(0); } 80%, 100% { transform: scaleX(1); } }
@keyframes al-puff { 0% { opacity: 0; transform: translateY(0) scale(.6); } 20% { opacity: .9; } 100% { opacity: 0; transform: translateY(-8px) scale(1.4); } }
@keyframes al-dish { from { transform: rotate(-8deg); } to { transform: rotate(6deg); } }
@keyframes al-ping { 0% { opacity: 0; } 30% { opacity: 1; } 100% { opacity: 0; } }
@keyframes al-spin { to { transform: rotate(360deg); } }
@keyframes al-paint { 0%, 100% { transform: rotate(-10deg); } 25% { transform: rotate(4deg); } 50% { transform: rotate(-4deg); } 75% { transform: rotate(8deg); } }
@keyframes al-draw { 0% { stroke-dashoffset: 1; } 45%, 85% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: 1; opacity: 0; } }
@keyframes al-poke { 0%, 100% { transform: rotate(-6deg); } 40%, 55% { transform: rotate(0); } }
@keyframes al-ripple { 0%, 40% { opacity: 0; transform: scale(.4); } 50% { opacity: 1; } 100% { opacity: 0; transform: scale(2); } }
@keyframes al-eq { from { transform: scaleY(.25); } to { transform: scaleY(1.15); } }
@keyframes al-note { 0% { opacity: 0; transform: translate(0, 4px); } 25% { opacity: 1; } 100% { opacity: 0; transform: translate(3px, -9px); } }
@keyframes al-tilt { from { transform: rotate(-5deg); } to { transform: rotate(4deg); } }
@keyframes al-sip { 0%, 60%, 100% { transform: rotate(0); } 70%, 85% { transform: rotate(-24deg); } }
@keyframes al-steam { 0% { opacity: 0; transform: translateY(2px); } 30% { opacity: .9; } 100% { opacity: 0; transform: translateY(-5px); } }
@keyframes al-flip { 0%, 40% { transform: rotate(0); } 50%, 90% { transform: rotate(180deg); } 100% { transform: rotate(360deg); } }
@keyframes al-sand { from { transform: scaleY(.2); } to { transform: scaleY(1); } }
@keyframes al-sway { from { transform: rotate(-6deg); } to { transform: rotate(5deg); } }
@media (prefers-reduced-motion: reduce) { svg.al * { animation-duration: 3s !important; } }
.c-zorp { --sk: #74d65e; --skd: #2f7a24; } .c-blip { --sk: #a06cf0; --skd: #5a2ea6; } .c-vex { --sk: #c3cad5; --skd: #6b7686; }
.c-quadra { --sk: #ff8fc7; --skd: #b0306f; } .c-pix { --sk: #8ce99a; --skd: #2b8a3e; } .c-bit { --sk: #4dd4ac; --skd: #087f5b; }
#alienDlg { width: min(760px, 94vw); }
.alacts { display: flex; flex-wrap: wrap; gap: 4px; margin: 6px 0 10px; }
.alacts button { padding: 3px 9px; font-size: 12.5px; }
.alacts button.on { color: var(--accent); border-color: var(--accent); }
.algrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; }
.alcard { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 8px 8px 10px; border: 1px solid var(--line); border-radius: var(--radius); background: var(--panel); cursor: pointer; text-align: center; font: inherit; color: inherit; }
.alcard:hover { border-color: var(--mute); }
.alcard.on { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent) inset; }
.alcard .pic { width: 128px; height: 96px; display: grid; place-items: center; font-size: 34px; }
.alcard b { font-size: 13.5px; }
.alcard span { color: var(--mute); font-size: 11.5px; line-height: 1.3; }
`;

export const ALIEN_HTML = `<dialog id="alienDlg"><form method="dialog">
  <h3>👽 Typing buddy</h3>
  <p class="hint">While Maxx works, an alien in the status bar acts out the current step: typing code, reading files, running commands, searching the web, drawing, using the phone, making sounds, thinking, waiting, or holding up a sign when a step needs your OK. It types faster when the model does. Pick who sits at the keyboard.</p>
  <div class="alacts" id="alActs"></div>
  <div class="algrid" id="alGrid"></div>
  <label class="check"><input type="checkbox" id="alMatch"> Act out what Maxx is doing (off: always typing)</label>
  <div class="btns"><button class="primary" value="cancel">Done</button></div>
</form></dialog>`;

// The scenes as data, combined in the page.
const DATA = {
  chars: Object.fromEntries([
    ...Object.entries(PICS).map(([k, c]) => [k, { name: c.name, say: c.say, pics: Object.fromEntries(Object.entries(c.frames).map(([a, f]) => [a, webp(f)])) }]),
    ...Object.entries(CHARS).map(([k, c]) => [k, { name: c.name, say: c.say, body: c.body }]),
  ]),
  acts: Object.fromEntries(Object.entries(ACTS).map(([k, a]) => [k, { label: a.label, icon: a.icon }])),
  // Arms depend on the character (headphones and chin sit on its head), so they are built per pair.
  parts: Object.fromEntries(Object.entries(CHARS).map(([ck, c]) => [ck, Object.fromEntries(Object.entries(ACTS).map(([ak, a]) => [ak, [a.back ?? "", a.front + (a.arms ? a.arms(c) : "")]]))])),
  tools: TOOL_ACT.map(([re, act]) => [re.source, act]),
};

export function alienSvg(char: string, act: string): string {
  const pic = DATA.chars[char]?.pics?.[act];
  if (pic) return `<img class="alimg" alt="" src="${pic}">`;
  const c = DATA.parts[char]?.[act];
  if (!c) return "";
  return `<svg class="al c-${char} a-${act}" viewBox="0 0 64 48" aria-hidden="true">${c[0]}${CHARS[char]!.body}${c[1]}</svg>`;
}

export const ALIEN_JS = `
const ALIENS = ${JSON.stringify(DATA)};
const ALIEN_TOOLS = ALIENS.tools.map((p) => [new RegExp(p[0]), p[1]]);
const alien = { pick: "hoodie", match: true, turn: "hoodie", shown: "", act: "type", since: 0, preview: "type" };
try { const v = localStorage.getItem("maxx.alien"); if (v && (v === "off" || v === "random" || ALIENS.chars[v])) alien.pick = v; } catch {}
try { alien.match = localStorage.getItem("maxx.alien.match") !== "0"; } catch {}
function alienSvg(c, a) { const ch = ALIENS.chars[c]; if (ch.pics) return '<img class="alimg" alt="" src="' + ch.pics[a] + '">'; const p = ALIENS.parts[c][a]; return '<svg class="al c-' + c + ' a-' + a + '" viewBox="0 0 64 48" aria-hidden="true">' + p[0] + ALIENS.chars[c].body + p[1] + "</svg>"; }
function alienName() { return alien.pick === "off" ? "Off" : alien.pick === "random" ? "🎲 Random" : ALIENS.chars[alien.pick].name; }
// A new Random alien for each turn.
function alienTurn() { const ks = Object.keys(ALIENS.chars); alien.turn = alien.pick === "random" ? ks[Math.floor(Math.random() * ks.length)] : alien.pick; }
// Which scene the current step plays.
function alienAct(a) {
  if (!alien.match) return "type";
  if (askCards.size) return "ask";
  if (!a) return "wait";
  if (a.phase === "thinking") return "think";
  if (a.phase === "waiting") return "wait";
  if (a.tool) { for (const [re, act] of ALIEN_TOOLS) if (re.test(a.tool)) return act; return a.tool === "ask_user" ? "ask" : "run"; }
  if (a.phase === "text") return "type";
  return "wait";
}
// Called from drawActivity on every frame while Maxx is busy.
function drawAlien(a) {
  const bar = $("activity"), on = alien.pick !== "off";
  bar.classList.toggle("alien", on);
  if (!on) return;
  let next = alienAct(a);
  // Between two steps the bar says "Working" for a moment: don't flash the waiting scene for it.
  if (next === "wait" && alien.act !== "wait" && Date.now() - alien.since < 700) next = alien.act;
  if (next !== alien.act) { alien.act = next; alien.since = Date.now(); }
  else if (next !== "wait") alien.since = Date.now();
  const key = alien.turn + "/" + alien.act, box = $("actBuddy");
  if (alien.shown !== key) { box.innerHTML = alienSvg(alien.turn, alien.act); alien.shown = key; box.title = ALIENS.chars[alien.turn].name + ": " + ALIENS.acts[alien.act].label.toLowerCase(); }
  // Typing speed follows the model's: about 3 keystrokes a token.
  const tps = a && a.tokens && a.generatingMs >= 1000 ? a.tokens / (a.generatingMs / 1000) : 0;
  const sp = tps ? Math.max(0.09, Math.min(0.45, 2.4 / tps)) : 0.3;
  const svg = box.firstChild; if (svg && svg.style) svg.style.setProperty("--sp", sp.toFixed(3) + "s");
}
function alienBtn() { $("alienBtn").textContent = alienName(); }
function alienGallery() {
  const acts = $("alActs"); acts.innerHTML = "";
  for (const k in ALIENS.acts) {
    const b = document.createElement("button"); b.type = "button"; b.textContent = ALIENS.acts[k].icon + " " + ALIENS.acts[k].label;
    b.className = k === alien.preview ? "on" : ""; b.onclick = () => { alien.preview = k; alienGallery(); }; acts.append(b);
  }
  const grid = $("alGrid"); grid.innerHTML = "";
  const card = (k, pic, name, say) => {
    const b = document.createElement("button"); b.type = "button"; b.className = "alcard" + (alien.pick === k ? " on" : "");
    b.innerHTML = '<div class="pic">' + pic + "</div><b>" + name + "</b><span>" + say + "</span>";
    b.onclick = () => { alien.pick = k; try { localStorage.setItem("maxx.alien", k); } catch {} alienTurn(); alien.shown = ""; alienBtn(); alienGallery(); };
    grid.append(b);
  };
  for (const k in ALIENS.chars) card(k, alienSvg(k, alien.preview), ALIENS.chars[k].name, ALIENS.chars[k].say);
  card("random", "🎲", "Random", "A different alien each time Maxx starts working");
  card("off", '<i style="font-style:normal;font-family:var(--mono);color:var(--accent)">⠋</i>', "Off", "The plain spinner");
  $("alMatch").checked = alien.match;
}
$("alienBtn").onclick = () => { alienGallery(); $("alienDlg").showModal(); };
$("alMatch").onchange = () => { alien.match = $("alMatch").checked; alien.shown = ""; try { localStorage.setItem("maxx.alien.match", alien.match ? "1" : "0"); } catch {} };
alienTurn(); alienBtn();
`;
