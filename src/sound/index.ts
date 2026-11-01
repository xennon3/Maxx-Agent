// Game sound for Maxx: effects and chiptune songs made from numbers (see
// engine.js). A game gets one file, sound.js, that holds its sound bank (plain
// JSON the person can edit) followed by the engine and a small player.

import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
// @ts-ignore: a text import has no type declarations
import ENGINE_SRC from "./engine.js" with { type: "text" };
// @ts-ignore
import RUNTIME_SRC from "./runtime.js" with { type: "text" };

export const ENGINE_JS = ENGINE_SRC as string;
export const RUNTIME_JS = RUNTIME_SRC as string;

export type SfxParams = Record<string, number | string>;
export type SongRecipe = { mood: string; bpm?: number; bars?: number; seed?: number; key?: string; drop?: string[]; jingle?: string };
export type Bank = { sfx: Record<string, SfxParams>; jingles: Record<string, SongRecipe>; music: Record<string, SongRecipe> };
type Note = { at: number; n: number | string; len: number; v: number };
export type Song = { recipe: SongRecipe; steps: number; stepSec: number; once?: boolean; parts: Record<string, Note[]>; chords: number[] };

export type Engine = {
  DEFAULTS: SfxParams; RANGES: Record<string, [number, number, number]>; WAVES: string[]; KINDS: string[]; JINGLES: string[];
  MOODS: string[]; KEYS: string[]; PARTS: string[];
  fill(p: SfxParams): SfxParams; tidy(p: SfxParams): SfxParams; length(p: SfxParams): number;
  renderSfx(p: SfxParams, rate?: number): Float32Array;
  makeSfx(name: string, describe?: string, seed?: number): { kind: string; params: SfxParams; words: string[] };
  mutate(p: SfxParams, amount?: number, seed?: number): SfxParams;
  kindOf(text: string): string | null; moodOf(text: string): string; describeSfx(p: SfxParams): string;
  recipe(r: Partial<SongRecipe> & { describe?: string }): SongRecipe; compose(r: SongRecipe): Song;
  renderSong(r: SongRecipe | Song, rate?: number): Float32Array; describeSong(r: SongRecipe): string;
  toWav(samples: Float32Array, rate?: number): Uint8Array; hash(s: string): number;
};

export const engine: Engine = new Function(ENGINE_JS + "\nreturn MaxxSound;")();

export const emptyBank = (): Bank => ({ sfx: {}, jingles: {}, music: {} });

const START = "// ---- SOUND_BANK: the sounds, as numbers (JSON). Edit freely, or re-run Maxx's make_sounds. ----";
const END = "// ---- end of SOUND_BANK ----";

export function soundFile(bank: Bank): string {
  const names = [...Object.keys(bank.sfx), ...Object.keys(bank.jingles)];
  const songs = Object.keys(bank.music);
  return [
    "// Sound effects and chiptune music for this game, made by Maxx. There are no",
    "// audio files: every sound is synthesized in the browser from SOUND_BANK.",
    "//",
    `//   ${`Sound.play("${names[0] ?? "name"}")`.padEnd(24)} play an effect or jingle${names.length ? ` (${names.join(", ")})` : ""}`,
    `//   ${`Sound.music("${songs[0] ?? "name"}")`.padEnd(24)} loop a song${songs.length ? ` (${songs.join(", ")})` : ""}; Sound.music() stops it`,
    `//   ${"Sound.toggleMute()".padEnd(24)} the M key does this too`,
    "//",
    "// Load it before your game's script: <script src=\"sound.js\"></script>",
    "// Tweak and preview the sounds in Maxx's Sound lab (the 🔊 tab).",
    "",
    START,
    "var SOUND_BANK = " + formatBank(bank) + ";",
    END,
    "",
    "// ---- engine and player: Maxx rewrites everything below, so change the bank above instead ----",
    ENGINE_JS.trim(),
    RUNTIME_JS.trim(),
    "",
  ].join("\n");
}

// One sound per line, so a diff of a tweak is one line.
function formatBank(bank: Bank): string {
  const group = (g: Record<string, unknown>) => {
    const rows = Object.entries(g).map(([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)}`);
    return rows.length ? `{\n${rows.join(",\n")}\n  }` : "{}";
  };
  return `{\n  "sfx": ${group(bank.sfx)},\n  "jingles": ${group(bank.jingles)},\n  "music": ${group(bank.music)}\n}`;
}

// The bank in a sound.js, or null when the text isn't one of ours.
export function parseSoundFile(text: string): Bank | null {
  const a = text.indexOf(START), b = text.indexOf(END);
  if (a < 0 || b < a) return null;
  const body = text.slice(a + START.length, b).trim().replace(/^var SOUND_BANK\s*=\s*/, "").replace(/;\s*$/, "");
  try {
    const j = JSON.parse(body);
    return { sfx: j.sfx ?? {}, jingles: j.jingles ?? {}, music: j.music ?? {} };
  } catch {
    return null;
  }
}

export const isSoundFile = (text: string) => text.includes(START);

// sound.js files in a project (not inside node_modules or dot folders), nearest first.
export async function findSoundFiles(cwd: string, depth = 3): Promise<string[]> {
  const out: string[] = [];
  async function walk(dir: string, d: number) {
    let entries;
    try { entries = await readdir(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (e.isFile() && /\.js$/i.test(e.name) && /sound/i.test(e.name)) {
        const p = join(dir, e.name);
        try { if (isSoundFile(await readFile(p, "utf8"))) out.push(relative(cwd, p).replace(/\\/g, "/")); } catch {}
      }
    }
    if (d <= 0) return;
    for (const e of entries) if (e.isDirectory() && !e.name.startsWith(".") && !/^(node_modules|build|dist|out|target|vendor)$/.test(e.name)) await walk(join(dir, e.name), d - 1);
  }
  if (existsSync(cwd)) await walk(cwd, depth);
  return out.sort((x, y) => x.split("/").length - y.split("/").length || x.localeCompare(y));
}

// ---- adding sounds by description ------------------------------------------

export type EffectAsk = { name: string; describe?: string; seed?: number };
export type SongAsk = { name: string; mood?: string; bpm?: number; bars?: number; seed?: number; key?: string };

const JINGLE_OF: Record<string, string> = { win: "win", levelup: "levelup", gameover: "gameover" };

export const cleanName = (s: string) => s.trim().replace(/[^\p{L}\p{N}_-]+/gu, "_").replace(/^_+|_+$/g, "").slice(0, 40) || "sound";

// What one ask turns into, and a line saying what was made.
export function addEffect(bank: Bank, ask: EffectAsk, key?: string): string {
  const name = cleanName(ask.name);
  const kind = engine.kindOf(ask.describe ?? "") ?? engine.kindOf(ask.name);
  if (kind && JINGLE_OF[kind]) {
    const r = engine.recipe({ mood: engine.moodOf(ask.describe ?? ""), jingle: kind, seed: ask.seed ?? 0, key });
    delete (r as Partial<SongRecipe>).bars;
    delete bank.sfx[name];
    bank.jingles[name] = r;
    return `${name}: ${engine.describeSong(r)}`;
  }
  const made = engine.makeSfx(name, ask.describe, ask.seed);
  delete bank.jingles[name];
  bank.sfx[name] = made.params;
  return `${name}: ${made.kind}${made.words.length ? ` (${made.words.join(", ")})` : ""}, ${engine.describeSfx(made.params)}`;
}

export function addSong(bank: Bank, ask: SongAsk): string {
  const name = cleanName(ask.name);
  const r = engine.recipe({ mood: ask.mood ?? "happy", bpm: ask.bpm, bars: ask.bars, seed: ask.seed ?? engine.hash(name) % 1000, key: ask.key });
  bank.music[name] = r;
  return `${name}: ${engine.describeSong(r)}`;
}

// The starter set the html-game template ships with.
export function starterBank(): Bank {
  const bank = emptyBank();
  addEffect(bank, { name: "eat", describe: "bright coin pickup", seed: 7 });
  addEffect(bank, { name: "turn", describe: "short soft blip", seed: 3 });
  addEffect(bank, { name: "die", describe: "crunchy falling hurt", seed: 5 });
  addSong(bank, { name: "theme", mood: "happy", seed: 12 });
  addEffect(bank, { name: "gameover", describe: "game over" }, bank.music.theme!.key);
  return bank;
}
