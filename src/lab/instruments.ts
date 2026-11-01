import { existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { tmpdir } from "node:os";
import { maxxHome } from "../sessions.ts";
import { search, readPage, passages } from "../web.ts";
import { shell } from "../shell.ts";
import type { Image } from "../image.ts";
import { audioStats, decodeWav, describeStats, frameStats, parseLines, stats, type Row } from "./data.ts";
import { listPorts, readSerial } from "./serial.ts";

// Instruments: where the lab's data comes from. Each one is a plug: the web,
// every COM port that shows up, the camera and the microphone (through the
// app window, or ffmpeg in the terminal), a data file in the project, and any
// command the user registers in ~/.maxx/instruments.json (a weather station's
// script, rtl_433, a USB scope's CLI...). The ones that touch the physical
// world are gated: the user approves them, and every reading is logged.

export type Args = Record<string, string>;
export type Reading = {
  title: string;
  // What the model reads about it (statistics, extracted facts, a description).
  text: string;
  rows?: Row[];
  keys?: string[];
  images?: Image[];
  // Raw data kept next to the study (a WAV, the frames, the serial log).
  files?: { name: string; data: Uint8Array | string }[];
  // Web sources the reading quotes.
  urls?: string[];
};
export type Kind = "web" | "serial" | "camera" | "mic" | "file" | "command" | "sim";
export type Captured = { frames?: Uint8Array[]; wav?: Uint8Array; device?: string };
export type Capture = (kind: "camera" | "mic", args: { frames?: number; every?: number; seconds?: number }, signal?: AbortSignal) => Promise<Captured>;
export type RunCtx = { cwd: string; signal?: AbortSignal; serialSeconds?: number };

export type Instrument = {
  id: string;
  kind: Kind;
  label: string;
  about: string;
  // How the planner writes its arguments.
  usage: string;
  // Needs the user's OK (and is logged as such).
  gated: boolean;
  // Why it can't be used right now (shown, and the planner is told).
  unavailable?: string;
  run(args: Args, ctx: RunCtx): Promise<Reading>;
};

export const ICON: Record<Kind, string> = { web: "🌐", serial: "🔌", camera: "📷", mic: "🎙", file: "📄", command: "🧰", sim: "🧪" };

const num = (v: string | undefined, d: number, lo: number, hi: number) => {
  const n = Number(v);
  return Number.isFinite(n) && v !== undefined && v !== "" ? Math.min(hi, Math.max(lo, n)) : d;
};

// "seconds=10 baud=9600 send=R" plus free words, which become `q`.
export function parseArgs(text: string): Args {
  const out: Args = {};
  const rest = text.replace(/(\w+)\s*=\s*("([^"]*)"|'([^']*)'|\S+)/g, (_, k: string, v: string, dq?: string, sq?: string) => {
    out[k.toLowerCase()] = dq ?? sq ?? v;
    return "";
  }).trim();
  if (rest) out.q = rest.replace(/^["']|["']$/g, "");
  return out;
}

// ---- web ----
export function webInstrument(network: boolean): Instrument {
  return {
    id: "web",
    kind: "web",
    label: "Web search",
    about: "search the web and read the top pages",
    usage: "web | <search words>",
    gated: false,
    unavailable: network ? undefined : "network access is off (turn on 🌐 Network to search the web)",
    async run(a) {
      const q = a.q ?? a.query ?? "";
      if (!q) throw new Error("web needs search words");
      const r = await search(q);
      if (!r.hits.length) throw new Error(`no results for "${q}"${r.failed.length ? ` (${r.failed.join(", ")})` : ""}`);
      const parts: string[] = [`Search: ${q} (${r.engine})`];
      const urls: string[] = [];
      for (const h of r.hits.slice(0, 5)) parts.push(`- ${h.title.slice(0, 100)}: ${h.snippet.slice(0, 200)} <${h.url}>`);
      // The two best pages, cut to the passages about the search words.
      for (const h of r.hits.slice(0, 2)) {
        try {
          const page = await readPage(h.url);
          const text = passages(page.text, q, 1600) ?? page.text.slice(0, 1600);
          parts.push(`\nFrom ${page.title || h.title} <${h.url}>:\n${text}`);
          urls.push(h.url);
        } catch {}
      }
      return { title: q, text: parts.join("\n"), urls: urls.length ? urls : r.hits.slice(0, 3).map((h) => h.url) };
    },
  };
}

// ---- serial ----
export async function serialInstruments(): Promise<Instrument[]> {
  const ports = await listPorts().catch(() => []);
  return ports.map((p) => ({
    id: `serial:${p.path}`,
    kind: "serial" as const,
    label: `${p.name} (${p.path.replace(/^\/dev\//, "")})`,
    about: `read lines from ${p.name} on ${p.path}`,
    usage: `serial:${p.path} | seconds=10 baud=9600 [send=<command to write first>]`,
    gated: true,
    async run(a, ctx) {
      const seconds = num(a.seconds, ctx.serialSeconds ?? 10, 1, 300);
      const baud = num(a.baud, 9600, 300, 2_000_000);
      const lines = await readSerial({ port: p.path, baud, seconds, send: a.send, signal: ctx.signal });
      const log = lines.map((l) => `${l.t.toFixed(3)}\t${l.text}`).join("\n") + "\n";
      const { rows, keys } = parseLines(lines);
      if (!lines.length) throw new Error(`no data from ${p.path} in ${seconds}s at ${baud} baud (wrong baud rate, or the board prints nothing?)`);
      const text = rows.length
        ? `${lines.length} lines in ${seconds}s at ${baud} baud. Sample: ${lines.slice(0, 2).map((l) => l.text).join(" | ")}\n${describeStats(stats(rows, keys))}`
        : `${lines.length} lines, no numbers in them. First lines:\n${lines.slice(0, 8).map((l) => l.text).join("\n")}`;
      return { title: `${p.name}, ${seconds}s`, text, rows, keys, files: [{ name: "serial.log", data: log }] };
    },
  }));
}

// ---- camera and microphone ----
export function cameraInstrument(capture: Capture | null): Instrument {
  return {
    id: "camera",
    kind: "camera",
    label: "Camera",
    about: "take photos with the webcam; Maxx measures brightness, colour and motion, and the vision model describes them",
    usage: "camera | frames=3 every=2",
    gated: true,
    unavailable: capture ? undefined : "no camera access here (use the app, or install ffmpeg for the terminal)",
    async run(a, ctx) {
      const frames = Math.round(num(a.frames, 1, 1, 8));
      const every = num(a.every, 2, 0.2, 60);
      const got = await capture!("camera", { frames, every }, ctx.signal);
      const shots = got.frames ?? [];
      if (!shots.length) throw new Error("the camera gave no picture");
      const rows: Row[] = shots.map((f, i) => ({ t: +(i * every).toFixed(2), ...frameStats(f, shots[i - 1]) }));
      const keys = Object.keys(rows.at(-1)!).filter((k) => k !== "t");
      return {
        title: `${shots.length} photo${shots.length > 1 ? "s" : ""}${got.device ? ` from ${got.device}` : ""}`,
        text: `${shots.length} frame(s), ${every}s apart.\n${describeStats(stats(rows, keys))}`,
        rows,
        keys,
        images: shots.slice(-3).map((f) => ({ mime: "image/jpeg" as const, base64: Buffer.from(f).toString("base64") })),
        files: shots.map((f, i) => ({ name: `frame-${i + 1}.jpg`, data: f })),
      };
    },
  };
}

export function micInstrument(capture: Capture | null): Instrument {
  return {
    id: "mic",
    kind: "mic",
    label: "Microphone",
    about: "record sound; Maxx measures loudness every 100 ms, the peak and the main pitch",
    usage: "mic | seconds=5",
    gated: true,
    unavailable: capture ? undefined : "no microphone access here (use the app, or install ffmpeg for the terminal)",
    async run(a, ctx) {
      const seconds = num(a.seconds, 5, 1, 30);
      const got = await capture!("mic", { seconds }, ctx.signal);
      if (!got.wav) throw new Error("the microphone gave no sound");
      const { samples, rate } = decodeWav(got.wav);
      const s = audioStats(samples, rate);
      return {
        title: `${s.seconds}s of sound${got.device ? ` from ${got.device}` : ""}`,
        text: `${s.seconds}s recorded. Overall level ${s.rmsDb} dBFS, peak ${s.peakDb} dBFS, loudest pitch ${s.dominantHz} Hz.\n${describeStats(stats(s.rows, ["level_db"]))}`,
        rows: s.rows,
        keys: ["level_db"],
        files: [{ name: "sound.wav", data: got.wav }],
      };
    },
  };
}

// ---- a data file in the project ----
export function fileInstrument(): Instrument {
  return {
    id: "file",
    kind: "file",
    label: "Data file",
    about: "load a CSV, TSV, log or JSON file from the project",
    usage: "file | path=data/readings.csv",
    gated: false,
    async run(a, ctx) {
      const rel = a.path ?? a.q ?? "";
      const abs = resolve(ctx.cwd, rel);
      if (!rel || relative(ctx.cwd, abs).startsWith("..")) throw new Error("file needs a path inside the project");
      if ((await stat(abs)).size > 20 << 20) throw new Error("that file is over 20 MB");
      const raw = await readFile(abs, "utf8");
      let lines = raw.split(/\r?\n/);
      if (/\.json$/i.test(rel)) {
        const j = JSON.parse(raw);
        const arr: unknown[] = Array.isArray(j) ? j : Object.values(j).find(Array.isArray) ?? [];
        lines = arr.map((o) => (o && typeof o === "object" ? Object.entries(o).map(([k, v]) => `${k}=${v}`).join(",") : String(o)));
      }
      const { rows, keys } = parseLines(lines.map((text, i) => ({ t: i, text })));
      return {
        title: rel,
        text: rows.length ? `${rows.length} rows from ${rel} (t = row number).\n${describeStats(stats(rows, keys))}` : `${rel} has no numeric rows. Start:\n${raw.slice(0, 1200)}`,
        rows,
        keys,
      };
    },
  };
}

// ---- the user's own ----
export type CustomSpec = { id: string; about?: string; command: string; seconds?: number };
export const instrumentsFile = () => join(maxxHome(), "instruments.json");

export async function loadCustom(): Promise<CustomSpec[]> {
  try {
    const j = JSON.parse(await readFile(instrumentsFile(), "utf8")) as { instruments?: CustomSpec[] };
    return (j.instruments ?? []).filter((s) => s && /^[\w.-]{1,40}$/.test(s.id) && typeof s.command === "string" && s.command.trim());
  } catch {
    return [];
  }
}

export function commandInstrument(spec: CustomSpec): Instrument {
  return {
    id: spec.id,
    kind: "command",
    label: spec.id,
    about: spec.about ?? `run ${spec.command.split(/\s+/)[0]}`,
    usage: `${spec.id} | seconds=${spec.seconds ?? 10}`,
    gated: true,
    async run(a, ctx) {
      const seconds = num(a.seconds, spec.seconds ?? 10, 1, 600);
      // {seconds} and any {name} the planner passed; values are kept to safe characters.
      const cmd = spec.command.replace(/\{(\w+)\}/g, (_, k: string) => (k === "seconds" ? String(seconds) : String(a[k] ?? "")).replace(/[^\w.:/\\-]/g, ""));
      const p = Bun.spawn(shell().args(cmd), { cwd: ctx.cwd, stdout: "pipe", stderr: "pipe", stdin: "ignore" });
      const kill = () => p.kill();
      const timer = setTimeout(kill, (seconds + 30) * 1000);
      ctx.signal?.addEventListener("abort", kill);
      const started = Date.now();
      const lines: { t: number; text: string }[] = [];
      const reader = p.stdout.getReader();
      let buf = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += new TextDecoder().decode(value);
        const parts = buf.split(/\r?\n/);
        buf = parts.pop()!;
        for (const t of parts) if (t.trim()) lines.push({ t: (Date.now() - started) / 1000, text: t });
      }
      if (buf.trim()) lines.push({ t: (Date.now() - started) / 1000, text: buf });
      const err = await new Response(p.stderr).text();
      const code = await p.exited;
      clearTimeout(timer);
      ctx.signal?.removeEventListener("abort", kill);
      if (code !== 0 && !lines.length) throw new Error(`${spec.id} failed (exit ${code}): ${err.trim().slice(0, 300)}`);
      const { rows, keys } = parseLines(lines);
      return {
        title: `${spec.id}, ${lines.length} lines`,
        text: rows.length ? `${lines.length} lines.\n${describeStats(stats(rows, keys))}` : lines.slice(0, 20).map((l) => l.text).join("\n"),
        rows,
        keys,
        files: [{ name: "output.log", data: lines.map((l) => `${l.t.toFixed(3)}\t${l.text}`).join("\n") + "\n" }],
      };
    },
  };
}

// ---- ffmpeg, for the camera and mic in the terminal ----
export function ffmpegCapture(ffmpeg: string | null = Bun.which("ffmpeg"), platform = process.platform): Capture | null {
  if (!ffmpeg) return null;
  const devices = async (): Promise<{ video?: string; audio?: string }> => {
    if (platform === "win32") {
      const p = Bun.spawn([ffmpeg, "-hide_banner", "-list_devices", "true", "-f", "dshow", "-i", "dummy"], { stdout: "pipe", stderr: "pipe" });
      const err = await new Response(p.stderr).text();
      await p.exited;
      const pick = (kind: string) => err.split("\n").find((l) => l.includes(`(${kind})`))?.match(/"([^"]+)"/)?.[1];
      return { video: pick("video"), audio: pick("audio") };
    }
    if (platform === "darwin") return { video: "0", audio: ":0" };
    return { video: existsSync("/dev/video0") ? "/dev/video0" : undefined, audio: "default" };
  };
  const input = (kind: "video" | "audio", dev: string) =>
    platform === "win32" ? ["-f", "dshow", "-i", `${kind}=${dev}`] : platform === "darwin" ? ["-f", "avfoundation", "-i", kind === "video" ? dev : dev] : kind === "video" ? ["-f", "v4l2", "-i", dev] : ["-f", "alsa", "-i", dev];
  const go = async (args: string[], out: string, ms: number, signal?: AbortSignal) => {
    const p = Bun.spawn([ffmpeg, "-hide_banner", "-loglevel", "error", "-y", ...args, out], { stdout: "ignore", stderr: "pipe" });
    const kill = () => p.kill();
    const t = setTimeout(kill, ms);
    signal?.addEventListener("abort", kill);
    const err = await new Response(p.stderr).text();
    const code = await p.exited;
    clearTimeout(t);
    if (code !== 0) throw new Error(`ffmpeg: ${err.trim().split("\n").at(-1) ?? `exit ${code}`}`);
    return new Uint8Array(await Bun.file(out).arrayBuffer());
  };
  return async (kind, a, signal) => {
    const d = await devices();
    const tmp = join(tmpdir(), `maxx-lab-${process.pid}-${Date.now()}`);
    if (kind === "camera") {
      if (!d.video) throw new Error("ffmpeg found no camera");
      const frames: Uint8Array[] = [];
      for (let i = 0; i < (a.frames ?? 1); i++) {
        if (i) await Bun.sleep((a.every ?? 2) * 1000);
        frames.push(await go([...input("video", d.video), "-frames:v", "1", "-vf", "scale='min(960,iw)':-2"], `${tmp}-${i}.jpg`, 20_000, signal));
      }
      return { frames, device: d.video };
    }
    if (!d.audio) throw new Error("ffmpeg found no microphone");
    const wav = await go([...input("audio", d.audio), "-t", String(a.seconds ?? 5), "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le"], `${tmp}.wav`, ((a.seconds ?? 5) + 15) * 1000, signal);
    return { wav, device: d.audio };
  };
}

// Everything plugged in right now.
export async function discover(o: { network: boolean; capture: Capture | null; extra?: Instrument[] }): Promise<Instrument[]> {
  const custom = (await loadCustom()).map(commandInstrument);
  return [webInstrument(o.network), ...(await serialInstruments()), cameraInstrument(o.capture), micInstrument(o.capture), fileInstrument(), ...custom, ...(o.extra ?? [])];
}

// The list the planner sees.
export function menu(list: Instrument[]): string {
  return list.map((i) => `- ${i.id}: ${i.about}${i.unavailable ? ` [NOT AVAILABLE: ${i.unavailable}]` : ""}. Write: ${i.usage}`).join("\n");
}
