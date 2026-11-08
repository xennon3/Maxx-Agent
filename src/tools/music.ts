import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { tmpdir } from "node:os";
import { z } from "zod";
import { defineTool } from "./types.ts";
import { inside } from "./paths.ts";
import { music, type Analysis } from "../music/index.ts";
import { INSTALL_HELP, download, findSongServer, loadSongConfig, makeSong } from "../music/acestep.ts";

// 🎼 The music toolset:
//   compose    songs written as a text score -> .wav + .mid (+ .mp3/.ogg with ffmpeg)
//   make_song  real produced songs, vocals included, from the local ACE-Step model
//   mix_audio  layer, loop, fade, trim, join, normalize and convert audio with ffmpeg

const ffmpeg = () => process.env.MAXX_FFMPEG ?? Bun.which("ffmpeg");
const kb = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const slugOf = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "song";
const strip = (p: string) => p.replace(/\.[^./\\]+$/, "");

async function ff(args: string[], cwd: string): Promise<string | null> {
  const bin = ffmpeg();
  if (!bin) return "ffmpeg is not installed (winget install Gyan.FFmpeg)";
  const p = Bun.spawn([bin, "-y", "-hide_banner", "-loglevel", "error", ...args], { cwd, stdout: "pipe", stderr: "pipe", stdin: "ignore" });
  const timer = setTimeout(() => p.kill(), 10 * 60_000);
  const err = await new Response(p.stderr).text();
  await p.exited;
  clearTimeout(timer);
  return p.exitCode === 0 ? null : err.trim().split("\n").slice(-4).join("\n") || `ffmpeg exited ${p.exitCode}`;
}

const CODEC: Record<string, string[]> = {
  mp3: ["-c:a", "libmp3lame", "-q:a", "2"],
  ogg: ["-c:a", "libvorbis", "-q:a", "5"],
  flac: ["-c:a", "flac"],
  wav: ["-c:a", "pcm_s16le"],
  m4a: ["-c:a", "aac", "-b:a", "192k"],
  opus: ["-c:a", "libopus", "-b:a", "128k"],
};
const codecFor = (file: string) => CODEC[extname(file).slice(1).toLowerCase()] ?? [];

export function report(a: Analysis): string[] {
  const out: string[] = [];
  if (a.errors.length) {
    out.push(`⚠ ${a.errors.length} problem${a.errors.length === 1 ? "" : "s"} in the score (those notes were left out; fix and run compose again):`);
    for (const e of a.errors.slice(0, 12)) out.push(`  ${e.line ? `line ${e.line}: ` : ""}${e.msg}`);
  }
  if (a.warnings.length) {
    out.push("Worth a look:");
    for (const w of a.warnings.slice(0, 8)) out.push("  - " + w);
  }
  return out;
}

export const SCORE_HELP = [
  "A score is plain text, one track per line:  name (instrument, options): pattern",
  "  title: My song   bpm: 100   key: A minor   swing: 0.15   (optional header lines)",
  "  chords (pad): Am | F | C | G          '|' separates bars; a bar's steps share it equally",
  "  bass: a1 ~ a1 [~ a2]                  ~ rest, [a b] splits a step, _ holds the previous note",
  "  lead (epiano, echo 0.3): e5 d5 c5@2   x@2 = twice as long, x*4 = four times in its step, x!2 = repeat",
  "  drums: bd ~ sd ~, hh*8                a comma layers patterns; <a b> takes turns bar by bar; x? = sometimes",
  "Notes: c4 f#3 bb2 (c4 is middle C). Chords: C Am F#m7 G7 Cmaj7 Dsus4 E7/G#. Accent x^, soft (x).",
  `Instruments: ${Object.entries(music.INSTRUMENTS).map(([k, v]) => k).join(", ")}.`,
  "Drums: bd sd hh oh cp rim lt mt ht crash ride sh cb. Options: vol 0.8, pan -0.5, oct 3, rev 0.4, echo 0.3, tone 0.7, transpose -12, mute.",
  "Song form: 'section A' / 'section B' lines start sections (each repeats its tracks), then  form: A A B A.",
  "A track shorter than its section loops, so a one-bar drum beat fills the whole song.",
].join("\n");

export const compose = defineTool({
  name: "compose",
  description:
    "Write music as a text score and render it to audio: multi-track songs, game soundtracks, loops, jingles, with chords, basslines, melodies and drums on 18 built-in instruments " +
    "(piano, epiano, organ, strings, pad, choir, pluck, guitar, bell, marimba, flute, brass, lead, chip, bass, synthbass, sub, drums). " +
    "Writes the .score (editable text), a .wav and a .mid (opens in any music app), and .mp3/.ogg when asked. Works offline with nothing installed. " +
    "To change a song, edit the .score file and call compose with just the file. Score format:\n" + SCORE_HELP,
  schema: z.object({
    file: z.string().optional().describe("The .score file, e.g. music/theme.score. Default music/<title>.score"),
    score: z.string().optional().describe("The whole score text. Leave out to re-render the existing file"),
    formats: z.array(z.enum(["wav", "mid", "mp3", "ogg"])).optional().describe("Default wav and mid. ogg suits web games, mp3 for sharing"),
  }),
  risk: "write",
  ruleKey: () => "compose",
  preview: (a) => {
    const t = a.score ? /^\s*title:\s*(.+)$/im.exec(a.score)?.[1] : undefined;
    return `compose ${a.file ?? `music/${slugOf(t ?? "song")}.score`} → ${(a.formats ?? ["wav", "mid"]).join(", ")}${a.score ? `\n${a.score.split("\n").slice(0, 12).join("\n")}` : ""}`;
  },
  async run(a, { cwd }) {
    let text = a.score;
    let rel = a.file;
    if (!rel) {
      const t = text ? /^\s*title:\s*(.+)$/im.exec(text)?.[1] : undefined;
      rel = `music/${slugOf(t ?? "song")}.score`;
    }
    rel = rel.replace(/\\/g, "/");
    if (!/\.score$/i.test(rel)) rel = strip(rel) + ".score";
    const file = inside(cwd, rel);
    if (!text) {
      if (!existsSync(file)) return `error: ${rel} does not exist. Pass the score text in "score". Format:\n${SCORE_HELP}`;
      text = await readFile(file, "utf8");
    }
    const ev = music.events(text);
    const { text: summary, analysis } = music.describe(ev);
    if (!ev.notes.length) return ["error: the score has no notes I can play.", ...report(analysis), "", SCORE_HELP].join("\n");
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, text.endsWith("\n") ? text : text + "\n");
    const base = strip(file), relBase = strip(rel);
    const formats = new Set(a.formats ?? ["wav", "mid"]);
    const wrote: string[] = [rel];
    const r = music.render(ev, { rate: 44100 });
    const wav = music.toWav(r.L, r.R, r.rate);
    const keepWav = formats.has("wav");
    const wavPath = keepWav ? base + ".wav" : join(tmpdir(), `maxx-score-${process.pid}-${Date.now()}.wav`);
    await writeFile(wavPath, wav);
    if (keepWav) wrote.push(`${relBase}.wav (${kb(wav.length)})`);
    if (formats.has("mid")) {
      await writeFile(base + ".mid", music.toMidi(ev));
      wrote.push(`${relBase}.mid`);
    }
    const problems: string[] = [];
    for (const f of ["mp3", "ogg"] as const) {
      if (!formats.has(f)) continue;
      const err = await ff(["-i", wavPath, ...CODEC[f]!, `${base}.${f}`], cwd);
      if (err) problems.push(`${f}: ${err}`);
      else wrote.push(`${relBase}.${f} (${kb(Bun.file(`${base}.${f}`).size)})`);
    }
    if (!keepWav) await rm(wavPath, { force: true });
    const audio = [...formats].find((f) => f === "ogg" || f === "mp3") ?? "wav";
    return [
      `Wrote ${wrote.join(", ")}.`,
      summary,
      ...report(analysis),
      ...problems.map((p) => "could not make " + p),
      "",
      `The person can play and tweak it in the 🎹 Music tab. In a web page: const m = new Audio("${relBase.split("/").pop()}.${audio}"); m.loop = true; m.play() after a click.`,
    ].join("\n");
  },
});

export const makeSongTool = defineTool({
  name: "make_song",
  description:
    "Make a real, produced song (vocals, instruments, mixing) with the local AI song model ACE-Step, from a style description and optional lyrics. Takes seconds to a few minutes. " +
    "mode new: a new song. cover: re-make an existing audio file (for example a compose render) in the described style, keeping its tune. repaint: redo the part between start and end seconds. extend: continue a song. " +
    "Lyrics use section tags on their own lines: [verse], [chorus], [bridge], [outro]. Leave lyrics out for an instrumental.",
  schema: z.object({
    prompt: z.string().min(3).describe('Style, mood and instruments: "upbeat synthwave, female vocals, 110 bpm, punchy drums, retro arcade"'),
    lyrics: z.string().optional(),
    path: z.string().optional().describe("Where to save, e.g. music/theme.mp3. Default music/<words of the prompt>.mp3"),
    seconds: z.number().min(10).max(600).optional().describe("Length; default lets the model choose (about 1-3 minutes)"),
    mode: z.enum(["new", "cover", "repaint", "extend"]).optional(),
    from: z.string().optional().describe("For cover, repaint and extend: the audio file in the project to start from"),
    start: z.number().min(0).optional().describe("repaint: from this second"),
    end: z.number().min(0).optional().describe("repaint: to this second"),
    strength: z.number().min(0).max(1).optional().describe("cover: how closely to follow the original (0.3 loose, 1 very close). Default 0.7"),
    bpm: z.number().int().min(30).max(300).optional(),
    key: z.string().optional().describe('e.g. "A minor", "C major"'),
    language: z.string().optional().describe("Language of the lyrics, e.g. en, es, ja. Default en"),
    seed: z.number().int().min(0).optional().describe("The same seed and words give the same song"),
    takes: z.number().int().min(1).max(4).optional().describe("How many versions to make (saved as -2, -3...). Default 1"),
  }),
  risk: "write",
  ruleKey: (a) => a.mode ?? "new",
  preview: (a) => `${a.mode ?? "new"} song: ${a.prompt}${a.from ? ` from ${a.from}` : ""}${a.lyrics ? `\nlyrics: ${a.lyrics.split("\n").slice(0, 4).join(" / ")}…` : ""}`,
  async run(a, { cwd, signal }) {
    const cfg = await loadSongConfig();
    const server = await findSongServer(cfg);
    if (!server) return "error: " + INSTALL_HELP + "\nUntil then, compose writes songs without a model (no vocals).";
    const mode = a.mode ?? (a.from ? "cover" : "new");
    if (mode !== "new" && !a.from) return `error: ${mode} needs "from", the audio file to start from`;
    const from = a.from ? inside(cwd, a.from) : undefined;
    if (from && !existsSync(from)) return `error: ${a.from} does not exist`;
    // A .score is rendered first, so "make my composed tune a real song" just works.
    let tmp: string | undefined;
    let src = from;
    if (from && /\.score$/i.test(from)) {
      const r = music.render(await readFile(from, "utf8"));
      tmp = join(tmpdir(), `maxx-cover-${process.pid}-${Date.now()}.wav`);
      await writeFile(tmp, music.toWav(r.L, r.R, r.rate));
      src = tmp;
    }
    let rel = (a.path ?? `music/${slugOf(a.prompt.split(/[,.]/)[0]!)}.mp3`).replace(/\\/g, "/");
    if (!extname(rel)) rel += ".mp3";
    const ext = extname(rel).slice(1).toLowerCase();
    const format = (["mp3", "wav", "flac", "ogg"].includes(ext) ? ext : "mp3") as "mp3" | "wav" | "flac" | "ogg";
    try {
      const res = await makeSong(server, { ...a, mode, from: src, format: format === "ogg" ? "mp3" : format }, cfg, { signal });
      const saved: string[] = [];
      for (let i = 0; i < res.files.length; i++) {
        const name = i === 0 ? rel : `${strip(rel)}-${i + 1}.${ext}`;
        const out = inside(cwd, name);
        await mkdir(dirname(out), { recursive: true });
        const bytes = await download(res.files[i]!.url, signal);
        if (format === "ogg") {
          const t = out + ".mp3";
          await writeFile(t, bytes);
          const err = await ff(["-i", t, ...CODEC.ogg!, out], cwd);
          await rm(t, { force: true });
          if (err) { await writeFile(strip(out) + ".mp3", bytes); saved.push(`${strip(name)}.mp3 (no ogg: ${err})`); continue; }
        } else await writeFile(out, bytes);
        const m = res.files[i]!.metas ?? {};
        const facts = [m.bpm ? `${m.bpm} bpm` : "", m.keyscale ?? m.key_scale ?? "", m.duration ? `${Math.round(Number(m.duration))}s` : "", res.files[i]!.seed !== undefined ? `seed ${res.files[i]!.seed}` : ""].filter(Boolean).join(", ");
        saved.push(`${name} (${kb(Bun.file(out).size)}${facts ? `, ${facts}` : ""})`);
      }
      return [
        `Made ${saved.length === 1 ? "a song" : `${saved.length} takes`} in ${Math.round(res.seconds)}s with ACE-Step: ${saved.join("; ")}.`,
        "You can't hear it, so tell the person it's ready to play in the 🎹 Music tab and ask what to change (style words, lyrics, or repaint a part).",
      ].join("\n");
    } catch (e) {
      return `error: ${(e as Error).message}`;
    } finally {
      if (tmp) await rm(tmp, { force: true });
    }
  },
});

// ---- mix_audio --------------------------------------------------------------

export type MixArgs = {
  action: "layer" | "join" | "loop" | "fade" | "trim" | "normalize" | "convert" | "tempo" | "pitch" | "info";
  inputs?: string[];
  input?: string;
  output?: string;
  volumes?: number[];
  times?: number;
  seconds?: number;
  start?: number;
  end?: number;
  fade_in?: number;
  fade_out?: number;
  crossfade?: number;
  factor?: number;
  semitones?: number;
  lufs?: number;
};

// ffmpeg arguments for each action (after "ffmpeg -y"), or an error message.
export function mixArgs(a: MixArgs, abs: (p: string) => string, duration?: number): string[] | string {
  const i = a.input ? abs(a.input) : "";
  const o = a.output ? abs(a.output) : "";
  const enc = a.output ? codecFor(a.output) : [];
  switch (a.action) {
    case "layer": {
      const ins = a.inputs ?? [];
      if (ins.length < 2) return "layer needs two or more inputs";
      const vols = ins.map((_, k) => a.volumes?.[k] ?? 1);
      const pre = ins.map((_, k) => `[${k}:a]volume=${vols[k]}[a${k}]`).join(";");
      return [...ins.flatMap((f) => ["-i", abs(f)]), "-filter_complex", `${pre};${ins.map((_, k) => `[a${k}]`).join("")}amix=inputs=${ins.length}:duration=longest:normalize=0,alimiter=limit=0.95[out]`, "-map", "[out]", ...enc, o];
    }
    case "join": {
      const ins = a.inputs ?? [];
      if (ins.length < 2) return "join needs two or more inputs";
      const x = a.crossfade ?? 0;
      if (x > 0) {
        let chain = "", last = "0:a";
        for (let k = 1; k < ins.length; k++) {
          const out = k === ins.length - 1 ? "out" : `x${k}`;
          chain += `${chain ? ";" : ""}[${last}][${k}:a]acrossfade=d=${x}[${out}]`;
          last = out;
        }
        return [...ins.flatMap((f) => ["-i", abs(f)]), "-filter_complex", chain, "-map", "[out]", ...enc, o];
      }
      return [...ins.flatMap((f) => ["-i", abs(f)]), "-filter_complex", `${ins.map((_, k) => `[${k}:a]`).join("")}concat=n=${ins.length}:v=0:a=1[out]`, "-map", "[out]", ...enc, o];
    }
    case "loop": {
      if (!a.times && !a.seconds) return "loop needs times (how many plays) or seconds (total length)";
      const n = a.times ? Math.max(0, a.times - 1) : -1;
      return ["-stream_loop", String(n), "-i", i, ...(a.seconds ? ["-t", String(a.seconds)] : []), ...(a.fade_out ? ["-af", `afade=t=out:st=${Math.max(0, (a.seconds ?? 0) - a.fade_out)}:d=${a.fade_out}`] : []), ...enc, o];
    }
    case "fade": {
      const f: string[] = [];
      if (a.fade_in) f.push(`afade=t=in:st=0:d=${a.fade_in}`);
      if (a.fade_out) {
        if (!duration) return "could not read how long the input is, so can't place the fade out";
        f.push(`afade=t=out:st=${Math.max(0, duration - a.fade_out)}:d=${a.fade_out}`);
      }
      if (!f.length) return "fade needs fade_in and/or fade_out (seconds)";
      return ["-i", i, "-af", f.join(","), ...enc, o];
    }
    case "trim":
      return [...(a.start !== undefined ? ["-ss", String(a.start)] : []), ...(a.end !== undefined ? ["-to", String(a.end)] : []), "-i", i, ...enc, o];
    case "normalize":
      return ["-i", i, "-af", `loudnorm=I=${a.lufs ?? -14}:TP=-1:LRA=11`, "-ar", "44100", ...enc, o];
    case "convert":
      return ["-i", i, "-vn", ...enc, o];
    case "tempo": {
      const f = a.factor ?? 1;
      if (f < 0.25 || f > 4) return "factor should be between 0.25 and 4";
      const steps: string[] = [];
      let left = f;
      while (left > 2) { steps.push("atempo=2"); left /= 2; }
      while (left < 0.5) { steps.push("atempo=0.5"); left /= 0.5; }
      steps.push(`atempo=${left.toFixed(4)}`);
      return ["-i", i, "-af", steps.join(","), ...enc, o];
    }
    case "pitch": {
      const r = Math.pow(2, (a.semitones ?? 0) / 12);
      return ["-i", i, "-af", `asetrate=44100*${r.toFixed(5)},aresample=44100,atempo=${(1 / r).toFixed(5)}`, ...enc, o];
    }
  }
  return `unknown action ${a.action}`;
}

async function probe(file: string, cwd: string): Promise<{ seconds?: number; mean?: number; peak?: number; info?: string }> {
  const bin = ffmpeg();
  if (!bin) return {};
  const p = Bun.spawn([bin, "-hide_banner", "-i", file, "-af", "volumedetect", "-f", "null", "-"], { cwd, stdout: "pipe", stderr: "pipe", stdin: "ignore" });
  const err = await new Response(p.stderr).text();
  await p.exited;
  const d = /Duration:\s*(\d+):(\d+):([\d.]+)/.exec(err);
  const mean = /mean_volume:\s*(-?[\d.]+)/.exec(err), peak = /max_volume:\s*(-?[\d.]+)/.exec(err);
  const stream = /Stream #.*Audio:\s*([^\n]+)/.exec(err);
  return { seconds: d ? Number(d[1]) * 3600 + Number(d[2]) * 60 + Number(d[3]) : undefined, mean: mean ? Number(mean[1]) : undefined, peak: peak ? Number(peak[1]) : undefined, info: stream?.[1]?.trim() };
}

export const mixAudio = defineTool({
  name: "mix_audio",
  description:
    "Edit audio files with ffmpeg. action: layer (play inputs together, with volumes), join (one after another, optional crossfade seconds), loop (times, or seconds total), " +
    "fade (fade_in/fade_out seconds), trim (start/end seconds), normalize (even loudness, lufs default -14), convert (to the output's type: mp3 ogg wav flac m4a), " +
    "tempo (factor 1.25 = faster, same pitch), pitch (semitones, same speed), info (length and loudness).",
  schema: z.object({
    action: z.enum(["layer", "join", "loop", "fade", "trim", "normalize", "convert", "tempo", "pitch", "info"]),
    input: z.string().optional(),
    inputs: z.array(z.string()).optional(),
    output: z.string().optional(),
    volumes: z.array(z.number().min(0).max(4)).optional(),
    times: z.number().int().min(1).max(100).optional(),
    seconds: z.number().min(0.1).max(3600).optional(),
    start: z.number().min(0).optional(),
    end: z.number().min(0).optional(),
    fade_in: z.number().min(0).max(60).optional(),
    fade_out: z.number().min(0).max(60).optional(),
    crossfade: z.number().min(0).max(30).optional(),
    factor: z.number().optional(),
    semitones: z.number().min(-24).max(24).optional(),
    lufs: z.number().min(-40).max(-5).optional(),
  }),
  risk: "write",
  ruleKey: (a) => a.action,
  preview: (a) => `${a.action}: ${a.input ?? a.inputs?.join(" + ") ?? ""}${a.output ? ` → ${a.output}` : ""}`,
  async run(a, { cwd }) {
    if (!ffmpeg()) return "error: ffmpeg is not installed. On Windows: winget install Gyan.FFmpeg (then restart Maxx).";
    for (const f of [a.input, ...(a.inputs ?? [])]) if (f && !existsSync(inside(cwd, f))) return `error: ${f} does not exist`;
    if (a.action === "info") {
      const files = a.inputs ?? (a.input ? [a.input] : []);
      if (!files.length) return "error: info needs input";
      const lines = [];
      for (const f of files) {
        const p = await probe(inside(cwd, f), cwd);
        lines.push(`${f}: ${p.seconds !== undefined ? `${p.seconds.toFixed(1)}s` : "?"}, ${p.info ?? ""}${p.mean !== undefined ? `, average ${p.mean} dB, peak ${p.peak} dB${(p.peak ?? -9) > -0.2 ? " (may clip)" : ""}` : ""}`);
      }
      return lines.join("\n");
    }
    if (!a.output) return "error: give an output file";
    const out = inside(cwd, a.output);
    if (a.input && out === inside(cwd, a.input)) return "error: write to a new output file, not over the input";
    const dur = a.action === "fade" && a.fade_out && a.input ? (await probe(inside(cwd, a.input), cwd)).seconds : undefined;
    const args = mixArgs(a, (p) => inside(cwd, p), dur);
    if (typeof args === "string") return `error: ${args}`;
    await mkdir(dirname(out), { recursive: true });
    const err = await ff(args, cwd);
    if (err) return `error: ffmpeg failed: ${err}`;
    const p = await probe(out, cwd);
    return `saved ${a.output} (${kb(Bun.file(out).size)}${p.seconds !== undefined ? `, ${p.seconds.toFixed(1)}s` : ""}${p.peak !== undefined ? `, peak ${p.peak} dB` : ""})`;
  },
});

export const MUSIC_TOOLS = [compose, makeSongTool, mixAudio];

export const MUSIC_PROMPT = [
  "Music tools: compose writes songs as a text score and renders .wav and .mid files, offline. Plan a song like a musician: pick a key and tempo, write a chord progression,",
  "a bassline on the chord roots, a melody that uses chord tones on strong beats, and a drum groove; give it sections (A, B) and a form so it develops instead of looping one bar.",
  "Example:\n" + "title: Sunrise\nbpm: 100\nkey: C major\nsection A\nchords (epiano): C | Am | F | G\nbass: c2 ~ c2 g1 | a1 ~ a1 e2 | f1 ~ f1 c2 | g1 ~ g1 d2\nlead (flute): e5 d5 c5 g4 | a4 _ c5 ~ | a4 c5 f5 e5 | d5 _ _ ~\ndrums: bd ~ sd ~, hh*8\nsection B\nchords (strings): F | G | Em | Am\nlead (flute): c6 _ b5 a5 | b5 _ g5 ~ | g5 e5 d5 e5 | c5 _ _ ~\nform: A A B A",
  "Fix every reported problem and re-render. You can't hear the result: describe it, and let the person listen in the 🎹 Music tab.",
  "make_song makes a real produced song with vocals using the local ACE-Step model (mode cover turns a .score or audio file into a produced version of the same tune).",
  "mix_audio layers, joins, loops, fades, normalizes and converts audio. For simple game sound effects and chiptune loops use make_sounds instead.",
].join("\n");

// Messages about songs and music bring the music tools along.
export function wantsMusic(text: string): boolean {
  return /\b(music|musical|songs?|melod(y|ies)|soundtrack|compos(e|ing|ition)|lyrics|midi|tunes?|instrumental|bassline|chord progression|beats? for|jingle|lo-?fi|synthwave|orchestral|piano piece|ace-?step)\b|[\w-]+\.score\b/i.test(text) &&
    !/\b(test score|high ?score|score (board|counter)|scoreboard)\b/i.test(text);
}
