import { existsSync, readdirSync } from "node:fs";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { z } from "zod";
import { defineTool } from "./types.ts";
import { inside } from "./paths.ts";
import { maxxHome } from "../sessions.ts";

// speak: voices for games and app tours, all offline. Piper's neural voices
// when installed, else the voices Windows already has (SAPI), macOS `say`, or
// espeak-ng. video: ffmpeg recipes (trim, GIF, frames to video, compress...)
// so a model never has to remember ffmpeg's flags.

export type Voice = { kind: "piper" | "sapi" | "say" | "espeak"; bin: string; model?: string };

export function piperVoices(dir = join(maxxHome(), "voices")): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith(".onnx")).map((f) => join(dir, f));
}

export function findVoice(which = (b: string) => Bun.which(b), env = process.env, platform = process.platform): Voice | null {
  const piper = env.MAXX_PIPER ?? which("piper") ?? (existsSync(join(maxxHome(), "piper", platform === "win32" ? "piper.exe" : "piper")) ? join(maxxHome(), "piper", platform === "win32" ? "piper.exe" : "piper") : null);
  const model = env.MAXX_PIPER_VOICE ?? piperVoices()[0];
  if (piper && model) return { kind: "piper", bin: piper, model };
  if (platform === "win32") return { kind: "sapi", bin: which("powershell") ?? "powershell.exe" };
  if (platform === "darwin" && which("say")) return { kind: "say", bin: "say" };
  const es = which("espeak-ng") ?? which("espeak");
  return es ? { kind: "espeak", bin: es } : null;
}

// Windows' built-in speech, driven from PowerShell. The text goes in a file, never on the command line.
export function sapiScript(textFile: string, out: string, rate: number, voice?: string): string {
  const q = (s: string) => `'${s.replace(/'/g, "''")}'`;
  return [
    "Add-Type -AssemblyName System.Speech",
    "$s = New-Object System.Speech.Synthesis.SpeechSynthesizer",
    voice ? `$v = $s.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Name -like ${q(`*${voice}*`)} } | Select-Object -First 1; if ($v) { $s.SelectVoice($v.VoiceInfo.Name) }` : "",
    `$s.Rate = ${Math.max(-10, Math.min(10, Math.round(rate)))}`,
    `$s.SetOutputToWaveFile(${q(out)})`,
    `$s.Speak([IO.File]::ReadAllText(${q(textFile)}))`,
    "$s.Dispose()",
    "Write-Output ($s.Voice.Name)",
  ].filter(Boolean).join("; ");
}

export const speak = defineTool({
  name: "speak",
  description:
    "Turn text into a spoken WAV file, offline: game character lines, narration, app tour voice-over. Uses Piper's natural voices when installed (~/.maxx/voices/*.onnx), otherwise the computer's built-in voices.",
  schema: z.object({
    text: z.string().min(1).max(5000),
    path: z.string().describe("Where to save, e.g. assets/voice/intro.wav"),
    speed: z.number().min(0.5).max(2).optional().describe("1 is normal"),
    voice: z.string().optional().describe("Part of a voice name (Windows: 'Zira', 'David'; Piper: a model file in ~/.maxx/voices)"),
  }),
  risk: "write",
  ruleKey: () => "speak",
  preview: (a) => `say ${JSON.stringify(a.text.slice(0, 120))} → ${a.path}`,
  async run({ text, path, speed = 1, voice }, { cwd }) {
    const v = findVoice();
    if (!v) return "error: no voice found. Install Piper (github.com/rhasspy/piper) and put a voice .onnx in ~/.maxx/voices, or install espeak-ng.";
    const out = inside(cwd, path.replace(/\.\w+$/, "") + ".wav");
    await mkdir(dirname(out), { recursive: true });
    const tmp = join(tmpdir(), `maxx-say-${process.pid}-${Date.now()}.txt`);
    await writeFile(tmp, text);
    let cmd: string[];
    let stdin: "pipe" | "ignore" = "ignore";
    if (v.kind === "piper") {
      const model = voice ? (piperVoices().find((m) => m.toLowerCase().includes(voice.toLowerCase())) ?? v.model!) : v.model!;
      cmd = [v.bin, "--model", model, "--output_file", out, "--length_scale", String(1 / speed)];
      stdin = "pipe";
    } else if (v.kind === "sapi") cmd = [v.bin, "-NoLogo", "-NoProfile", "-NonInteractive", "-Command", sapiScript(tmp, out, (speed - 1) * 10, voice)];
    else if (v.kind === "say") cmd = [v.bin, "-o", out, "--data-format=LEI16@22050", "-r", String(Math.round(180 * speed)), ...(voice ? ["-v", voice] : []), "-f", tmp];
    else cmd = [v.bin, "-w", out, "-s", String(Math.round(165 * speed)), ...(voice ? ["-v", voice] : []), "-f", tmp];
    try {
      const p = Bun.spawn(cmd, { stdin, stdout: "pipe", stderr: "pipe" });
      if (stdin === "pipe") {
        (p.stdin as import("bun").FileSink).write(text);
        (p.stdin as import("bun").FileSink).end();
      }
      const [o, e] = await Promise.all([new Response(p.stdout).text(), new Response(p.stderr).text()]);
      await p.exited;
      if (p.exitCode !== 0 || !existsSync(out)) return `error: ${v.kind} failed: ${(e || o).trim().slice(0, 300)}`;
      const head = new Uint8Array(await Bun.file(out).slice(0, 44).arrayBuffer());
      const size = Bun.file(out).size;
      const rate = head.length >= 32 ? new DataView(head.buffer).getUint32(28, true) : 0;
      const secs = rate ? (size - 44) / rate : 0;
      return `saved ${path.replace(/\.\w+$/, "") + ".wav"} (${Math.round(size / 1024)} KB, about ${secs.toFixed(1)}s) with ${v.kind === "piper" ? `Piper (${v.model!.split(/[\\/]/).pop()})` : v.kind === "sapi" ? `the Windows voice ${o.trim() || "(default)"}` : v.kind}.${v.kind !== "piper" ? " For more natural voices, install Piper." : ""}\nPlay it in a web page with new Audio("${path.replace(/\.\w+$/, "") + ".wav"}").play().`;
    } finally {
      await rm(tmp, { force: true });
    }
  },
});

// ---- video ----

export type VideoArgs = { action: string; input?: string; inputs?: string[]; output: string; start?: string; end?: string; fps?: number; width?: number; quality?: "small" | "good" | "best"; pattern?: string };

// ffmpeg arguments for each recipe (after "ffmpeg -y -hide_banner").
export function ffmpegArgs(a: VideoArgs, abs: (p: string) => string): string[] | string {
  const i = a.input ? abs(a.input) : "";
  const o = abs(a.output);
  const crf = a.quality === "best" ? 18 : a.quality === "small" ? 32 : 24;
  const scale = a.width ? [`scale=${a.width}:-2:flags=lanczos`] : [];
  const vf = (f: string[]) => (f.length ? ["-vf", f.join(",")] : []);
  const range = [...(a.start ? ["-ss", a.start] : []), ...(a.end ? ["-to", a.end] : [])];
  switch (a.action) {
    case "trim":
      return [...range, "-i", i, "-c:v", "libx264", "-crf", String(crf), "-preset", "veryfast", "-c:a", "aac", "-movflags", "+faststart", o];
    case "gif": {
      const f = [`fps=${a.fps ?? 12}`, `scale=${a.width ?? 480}:-1:flags=lanczos`];
      return [...range, "-i", i, "-filter_complex", `${f.join(",")},split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=4`, "-loop", "0", o];
    }
    case "frames_to_video":
      if (!a.pattern) return "frames_to_video needs pattern, like frames/frame-%04d.png";
      return ["-framerate", String(a.fps ?? 30), "-i", abs(a.pattern), ...vf([...scale, "pad=ceil(iw/2)*2:ceil(ih/2)*2"]), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", String(crf), "-movflags", "+faststart", o];
    case "compress":
      return ["-i", i, ...vf(scale), "-c:v", "libx264", "-crf", String(crf + 4), "-preset", "slow", "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", o];
    case "extract_audio":
      return ["-i", i, "-vn", ...(/\.wav$/i.test(o) ? [] : ["-c:a", "libmp3lame", "-q:a", "3"]), o];
    case "to_ogg":
      return ["-i", i, "-vn", "-c:a", "libvorbis", "-q:a", "4", o];
    case "thumbnail":
      return ["-ss", a.start ?? "1", "-i", i, "-frames:v", "1", ...vf(scale), o];
    case "concat": {
      if (!a.inputs?.length) return "concat needs inputs";
      const n = a.inputs.length;
      return [...a.inputs.flatMap((f) => ["-i", abs(f)]), "-filter_complex", `${a.inputs.map((_, k) => `[${k}:v:0]`).join("")}concat=n=${n}:v=1:a=0[v]`, "-map", "[v]", "-c:v", "libx264", "-crf", String(crf), "-pix_fmt", "yuv420p", o];
    }
  }
  return `unknown action ${a.action}`;
}

export const video = defineTool({
  name: "video",
  description:
    "Make or change video and audio files with ffmpeg. action: trim (start/end like 00:00:05), gif (a looping GIF for a README or store page), frames_to_video (pattern like frames/f-%04d.png), compress, extract_audio (mp3 or wav), to_ogg (game music), thumbnail (a frame as an image), concat (inputs one after another).",
  schema: z.object({
    action: z.enum(["trim", "gif", "frames_to_video", "compress", "extract_audio", "to_ogg", "thumbnail", "concat"]),
    input: z.string().optional(),
    inputs: z.array(z.string()).optional(),
    output: z.string(),
    start: z.string().optional(),
    end: z.string().optional(),
    fps: z.number().int().min(1).max(60).optional(),
    width: z.number().int().min(16).max(3840).optional(),
    quality: z.enum(["small", "good", "best"]).optional(),
    pattern: z.string().optional(),
  }),
  risk: "write",
  ruleKey: (a) => a.action,
  preview: (a) => `ffmpeg ${a.action}: ${a.input ?? a.pattern ?? a.inputs?.join(" + ") ?? ""} → ${a.output}`,
  async run(a, { cwd }) {
    const ff = process.env.MAXX_FFMPEG ?? Bun.which("ffmpeg");
    if (!ff) return `error: ffmpeg is not installed. On Windows: winget install Gyan.FFmpeg (then restart Maxx). On macOS: brew install ffmpeg.`;
    if (a.input && !existsSync(inside(cwd, a.input))) return `error: ${a.input} does not exist`;
    const args = ffmpegArgs(a, (p) => inside(cwd, p));
    if (typeof args === "string") return `error: ${args}`;
    await mkdir(dirname(inside(cwd, a.output)), { recursive: true });
    const p = Bun.spawn([ff, "-y", "-hide_banner", "-loglevel", "error", ...args], { cwd, stdout: "pipe", stderr: "pipe", stdin: "ignore" });
    const timer = setTimeout(() => p.kill(), 10 * 60_000);
    const err = await new Response(p.stderr).text();
    await p.exited;
    clearTimeout(timer);
    if (p.exitCode !== 0) return `error: ffmpeg failed: ${err.trim().split("\n").slice(-4).join("\n")}`;
    const size = Bun.file(inside(cwd, a.output)).size;
    return `saved ${a.output} (${size > 1048576 ? `${(size / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(size / 1024))} KB`})`;
  },
});
