// Music for Maxx: songs written as text scores (score.js renders them to
// stereo WAV and MIDI), plus a bridge to ACE-Step, the local AI song model
// (acestep.ts). The 🎹 Music tab plays the same engine in the app page.

import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";
// @ts-ignore: a text import has no type declarations
import SCORE_SRC from "./score.js" with { type: "text" };

export const SCORE_JS = SCORE_SRC as string;

export type Note = { track: string; t: number; d: number; n: number; v: number; drum?: string };
export type Track = { name: string; inst: string; vol: number; pan: number; oct: number; rev: number; echo: number; tone: number; mute: boolean; transpose: number; line: number };
export type Score = { title: string; bpm: number; key: string; meter: number; swing: number; reverb: number; form: string[] | null; order: string[]; tracks: Record<string, Track>; sections: Record<string, { name: string; bars: number }>; errors: { line: number; msg: string }[] };
export type Events = { score: Score; notes: Note[]; beats: number; sections: { name: string; beat: number; bars: number }[] };
export type Analysis = { title: string; bpm: number; bars: number; seconds: number; key: string; detected?: string; tracks: { name: string; inst: string; notes: number; range?: string; mute: boolean }[]; warnings: string[]; errors: { line: number; msg: string }[] };
export type Rendered = { L: Float32Array; R: Float32Array; rate: number; seconds: number; rms: number; peak: number };

export type ScoreEngine = {
  INSTRUMENTS: Record<string, { gm: number; oct: number; lo: number; hi: number; about: string }>;
  DRUMS: Record<string, number>;
  parse(text: string): Score;
  events(input: string | Score): Events;
  render(input: string | Score | Events, opts?: { rate?: number }): Rendered;
  toWav(L: Float32Array, R: Float32Array | null, rate: number): Uint8Array;
  toMidi(input: string | Score | Events): Uint8Array;
  analyze(input: string | Score | Events): Analysis;
  describe(input: string | Score | Events): { text: string; analysis: Analysis };
  noteName(n: number): string;
  instOf(word: string): string | null;
  hash(s: string): number;
};

export const music: ScoreEngine = new Function(SCORE_JS + "\nreturn MaxxScore;")();

export const AUDIO_EXT = /\.(wav|mp3|ogg|flac|opus|m4a|aac)$/i;

// .score files and audio files in a project, nearest first.
export async function findMusicFiles(cwd: string, depth = 3): Promise<{ scores: string[]; audio: string[] }> {
  const scores: string[] = [], audio: string[] = [];
  async function walk(dir: string, d: number) {
    let entries;
    try { entries = await readdir(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (!e.isFile()) continue;
      const rel = relative(cwd, join(dir, e.name)).replace(/\\/g, "/");
      if (/\.score$/i.test(e.name)) scores.push(rel);
      else if (AUDIO_EXT.test(e.name) && audio.length < 200) audio.push(rel);
    }
    if (d <= 0) return;
    for (const e of entries) if (e.isDirectory() && !e.name.startsWith(".") && !/^(node_modules|build|dist|out|target|vendor)$/.test(e.name)) await walk(join(dir, e.name), d - 1);
  }
  if (existsSync(cwd)) await walk(cwd, depth);
  const near = (x: string, y: string) => x.split("/").length - y.split("/").length || x.localeCompare(y);
  return { scores: scores.sort(near), audio: audio.sort(near) };
}

export const EXAMPLE_SCORE = `title: First light
bpm: 92
key: A minor

section A
chords (pad): Am | F | C | G
bass (bass): a1 ~ a1 [~ a2] | f1 ~ f1 [~ f2] | c2 ~ c2 [~ c3] | g1 ~ g1 [~ g2]
drums: bd ~ sd ~, hh*8
lead (epiano, echo 0.3): e5 ~ [d5 c5] a4 | c5@3 ~ | <g4 e5> _ ~ c5 | b4 ~ ~ ~

section B
chords (strings): F | G | Em | Am
bass (bass): f1 f2 f1 f2 | g1 g2 g1 g2 | e1 e2 e1 e2 | a1 a2 a1 a2
drums: bd [~ bd] sd ~, hh*8, ~ ~ ~ <~ cp>
lead (lead): a5 _ g5 e5 | d5 _ b4 g4 | e5 d5 b4 g4 | a4 _ _ ~

form: A A B A
`;
