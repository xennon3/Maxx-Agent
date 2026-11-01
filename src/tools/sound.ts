import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { z } from "zod";
import { defineTool } from "./types.ts";
import { inside } from "./paths.ts";
import { addEffect, addSong, emptyBank, engine, findSoundFiles, parseSoundFile, soundFile, type Bank } from "../sound/index.ts";

// Where sounds go when the model doesn't say: the project's existing sound.js,
// else next to the nearest index.html, else sound.js in the workspace.
export async function defaultSoundPath(cwd: string): Promise<string> {
  const found = await findSoundFiles(cwd);
  if (found[0]) return found[0];
  if (existsSync(join(cwd, "index.html"))) return "sound.js";
  try {
    for (const e of await readdir(cwd, { withFileTypes: true })) {
      if (e.isDirectory() && !e.name.startsWith(".") && e.name !== "node_modules" && existsSync(join(cwd, e.name, "index.html"))) return `${e.name}/sound.js`;
    }
  } catch {}
  return "sound.js";
}

// Put <script src="sound.js"> into the page next to it, before its first script.
export async function linkPage(file: string): Promise<string | undefined> {
  const page = join(dirname(file), "index.html");
  if (!existsSync(page)) return undefined;
  const html = await readFile(page, "utf8");
  const src = file.split(/[\\/]/).pop()!;
  if (html.includes(src)) return undefined;
  const tag = `<script src="${src}"></script>`;
  const at = html.search(/<script\b/i);
  const out = at >= 0 ? html.slice(0, at) + tag + "\n  " + html.slice(at) : html.replace(/<\/body>/i, `  ${tag}\n</body>`);
  if (out === html) return undefined;
  await writeFile(page, out);
  return page;
}

export async function loadBank(file: string): Promise<Bank> {
  if (!existsSync(file)) return emptyBank();
  const bank = parseSoundFile(await readFile(file, "utf8"));
  if (!bank) throw new Error(`${file} exists but isn't a Maxx sound file; pass another file name`);
  return bank;
}

export async function saveBank(file: string, bank: Bank) {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, soundFile(bank));
}

const effect = z.object({
  name: z.string().describe('What the game calls it: Sound.play("<name>"), e.g. eat, jump, shoot, hit, explode, win'),
  describe: z.string().optional().describe('A few words: "short bright coin", "deep crunchy explosion", "soft blip", "rising power up", "victory fanfare", "game over"'),
  seed: z.number().int().optional().describe("Another number gives another take on the same description"),
});
const song = z.object({
  name: z.string().describe('What the game calls it: Sound.music("<name>"), e.g. theme, boss, menu'),
  mood: z.string().optional().describe(`One of ${engine.MOODS.join(", ")} (or a word like "dungeon" or "racing")`),
  bpm: z.number().optional().describe("Tempo; each mood has a good default"),
  bars: z.number().int().optional().describe("Length of the loop in bars, default 8"),
  seed: z.number().int().optional().describe("Another number gives a different tune in the same mood"),
});

export const makeSounds = defineTool({
  name: "make_sounds",
  description:
    "Give a web game sound effects, jingles and looping chiptune music, synthesized in the browser with no audio files or downloads. " +
    "Describe each sound in a few words; Maxx writes sound.js (and links it from index.html). Then call Sound.play(\"name\") where things happen " +
    "(eating, jumping, shooting, getting hit, winning) and Sound.music(\"name\") when the game starts. Calling it again adds to or replaces sounds by name.",
  schema: z.object({
    effects: z.array(effect).optional().describe("Sound effects and jingles (win, level up, game over)"),
    music: z.array(song).optional().describe("Looping songs"),
    remove: z.array(z.string()).optional().describe("Names of sounds to delete"),
    file: z.string().optional().describe("Where the sound file goes, relative to the workspace. Default: the project's sound.js, or next to index.html"),
  }),
  risk: "write",
  ruleKey: () => "sound",
  async preview(args, { cwd }) {
    const rel = args.file ?? (await defaultSoundPath(cwd));
    const parts = [
      ...(args.effects ?? []).map((e) => `effect ${e.name}${e.describe ? `: ${e.describe}` : ""}`),
      ...(args.music ?? []).map((m) => `song ${m.name}: ${m.mood ?? "happy"}`),
      ...(args.remove ?? []).map((n) => `remove ${n}`),
    ];
    return `write ${rel}:\n  ${parts.join("\n  ") || "(nothing new)"}`;
  },
  async run(args, { cwd }) {
    const rel = (args.file ?? (await defaultSoundPath(cwd))).replace(/\\/g, "/");
    const file = inside(cwd, rel);
    const bank = await loadBank(file);
    const made: string[] = [];
    for (const m of args.music ?? []) made.push(addSong(bank, m));
    const key = Object.values(bank.music)[0]?.key;
    for (const e of args.effects ?? []) made.push(addEffect(bank, e, key));
    for (const n of args.remove ?? []) {
      for (const g of [bank.sfx, bank.jingles, bank.music] as Record<string, unknown>[]) delete g[n];
      made.push(`removed ${n}`);
    }
    await saveBank(file, bank);
    const page = await linkPage(file);
    const sfx = [...Object.keys(bank.sfx), ...Object.keys(bank.jingles)];
    const songs = Object.keys(bank.music);
    return [
      `Wrote ${rel} with ${sfx.length} effect${sfx.length === 1 ? "" : "s"} and ${songs.length} song${songs.length === 1 ? "" : "s"}:`,
      ...made.map((m) => "  " + m),
      page ? `Added <script src="${rel.split("/").pop()}"></script> to ${relative(cwd, page).replace(/\\/g, "/")}, before the game's script.` : "",
      "",
      "Use them in the game's code:",
      ...sfx.map((n) => `  Sound.play("${n}")`),
      ...songs.map((n) => `  Sound.music("${n}")   // loops; starts after the player's first key or click. Sound.music() stops it`),
      "The M key mutes. Don't write audio code or load audio files yourself; the person can fine-tune these in the Sound lab.",
    ].filter((l) => l !== "").join("\n");
  },
});
