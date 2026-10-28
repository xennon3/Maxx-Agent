import { existsSync, readdirSync, statSync } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { gradleCommand } from "../tools/android.ts";

// Voice in, phone out. The page records speech and turns it into a request,
// either with the browser's own recognizer (Edge's Web Speech API) or, fully
// offline, with Whisper on this machine. After a spoken request changes the
// project, Maxx rebuilds it by itself and shows the result: the app on the
// live phone panel, or the page in the Preview panel at phone size.

// ---- Speech to text ----

// `url`: a Whisper server (whisper.cpp's `whisper-server`, or any
// OpenAI-style /v1/audio/transcriptions endpoint). `cli`: whisper.cpp's
// `whisper-cli` with a ggml model file.
export type Whisper = { kind: "url"; url: string } | { kind: "cli"; bin: string; model: string };

export function findWhisper(o: { whisper?: string; model?: string }, which = (b: string) => Bun.which(b), home = homedir()): Whisper | null {
  const w = o.whisper?.trim();
  if (w && /^https?:\/\//i.test(w)) return { kind: "url", url: w };
  const bin = w || which("whisper-cli") || which("whisper-cli.exe");
  if (!bin) return null;
  const model = o.model || newestModel(join(home, ".maxx", "whisper"));
  return model ? { kind: "cli", bin, model } : null;
}

function newestModel(dir: string): string | undefined {
  if (!existsSync(dir)) return;
  const bins = readdirSync(dir).filter((f) => /\.bin$/i.test(f)).map((f) => join(dir, f));
  return bins.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0];
}

export function describeWhisper(w: Whisper | null): string {
  if (!w) return "";
  return w.kind === "url" ? `Whisper at ${w.url}` : `Whisper (${w.model.split(/[\\/]/).pop()})`;
}

// Audio arrives as a 16 kHz mono WAV, which is what whisper.cpp wants.
export async function transcribe(w: Whisper, wav: Uint8Array, lang = "auto", signal?: AbortSignal): Promise<string> {
  if (w.kind === "url") {
    const u = new URL(w.url);
    // A bare host: whisper.cpp's server answers on /inference, OpenAI-style ones on /v1/audio/transcriptions.
    const paths = u.pathname === "/" ? ["/inference", "/v1/audio/transcriptions"] : [u.pathname];
    for (const p of paths) {
      const form = new FormData();
      form.append("file", new Blob([wav as Uint8Array<ArrayBuffer>], { type: "audio/wav" }), "speech.wav");
      form.append("model", "whisper-1");
      form.append("response_format", "json");
      if (lang !== "auto") form.append("language", lang);
      const res = await fetch(new URL(p, u), { method: "POST", body: form, signal: signal ?? AbortSignal.timeout(120_000) });
      if (res.status === 404 && p !== paths.at(-1)) continue;
      const body = await res.text();
      if (!res.ok) throw new Error(`Whisper server said ${res.status}: ${body.slice(0, 200)}`);
      try {
        return clean(String((JSON.parse(body) as { text?: string }).text ?? ""));
      } catch {
        return clean(body);
      }
    }
    throw new Error("no Whisper endpoint answered");
  }
  const dir = await mkdtemp(join(tmpdir(), "maxx-voice-"));
  try {
    const file = join(dir, "speech.wav");
    await writeFile(file, wav);
    const p = Bun.spawn([w.bin, "-m", w.model, "-f", file, "-l", lang, "-nt", "-np"], { stdout: "pipe", stderr: "pipe", signal });
    const [out, err, code] = await Promise.all([new Response(p.stdout).text(), new Response(p.stderr).text(), p.exited]);
    if (code !== 0) throw new Error(`whisper-cli failed (exit ${code}): ${err.trim().split("\n").slice(-3).join(" ")}`);
    return clean(out);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

// Whisper marks silence and noise in brackets: [BLANK_AUDIO], (music).
export const clean = (s: string) =>
  s
    .replace(/\[[^\]]*\]|\((?:music|silence|noise|inaudible)[^)]*\)/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

// ---- Phone out ----

export type TurnCall = { name: string; args: string; result: string };
export type Rebuild =
  | { kind: "android"; args: { project_dir?: string } }
  | { kind: "preview"; args: { path?: string; url?: string } }
  | { kind: "none"; why: string; shown?: "android" | "preview" };

const WEB = /\.(html?|css|m?[jt]sx?|vue|svelte|json|svg)$/i;
const ANDROID = /\.(kts?|java|xml|gradle|pro)$/i;

const pathOf = (args: string) => {
  try {
    return String(JSON.parse(args).path ?? "").replace(/\\/g, "/");
  } catch {
    return "";
  }
};

// The project folder with a Gradle wrapper: the workspace, android/ (Capacitor,
// Expo prebuild), or a folder one level down.
export function androidDir(cwd: string): string | null {
  if (gradleCommand(cwd)) return ".";
  if (gradleCommand(join(cwd, "android"))) return "android";
  try {
    for (const d of readdirSync(cwd, { withFileTypes: true }))
      if (d.isDirectory() && !d.name.startsWith(".") && d.name !== "node_modules" && gradleCommand(join(cwd, d.name))) return d.name;
  } catch {}
  return null;
}

// What to rebuild after a spoken request, from the calls the turn made.
export function planRebuild(
  cwd: string,
  calls: TurnCall[],
  o: { android: boolean; phone: boolean; html: string[]; serverUrl?: string },
): Rebuild {
  const edits = calls.filter((c) => /^(write_file|edit_file)$/.test(c.name) && !/^error|^user denied/.test(c.result));
  if (!edits.length) return { kind: "none", why: "nothing changed" };
  const lastEdit = calls.lastIndexOf(edits.at(-1)!);
  const after = calls.slice(lastEdit + 1);
  const paths = edits.map((c) => pathOf(c.args));
  const gradle = androidDir(cwd);

  const isAndroid = !!gradle && (paths.some((p) => ANDROID.test(p) || p.startsWith(gradle === "." ? "app/" : gradle + "/")) || !paths.some((p) => WEB.test(p)));
  if (isAndroid) {
    if (after.some((c) => c.name === "android_run" && !/^error|failed/.test(c.result))) return { kind: "none", why: "Maxx already ran it on the phone", shown: "android" };
    if (!o.android) return { kind: "none", why: "turn on 📱 Android to have spoken changes play on your phone" };
    if (!o.phone) return { kind: "none", why: "no phone connected over adb, so it was not rebuilt" };
    return { kind: "android", args: gradle === "." ? {} : { project_dir: gradle } };
  }

  const web = paths.filter((p) => WEB.test(p));
  if (!web.length) return { kind: "none", why: "the change has nothing to show" };
  if (after.some((c) => c.name === "preview" || c.name === "start_server")) return { kind: "none", why: "Maxx already opened it in the preview", shown: "preview" };
  if (o.serverUrl) return { kind: "preview", args: { url: o.serverUrl } };
  const page = [...web].reverse().find((p) => /\.html?$/i.test(p) && !/^([a-z]:|\/)/i.test(p)) ?? o.html.find((h) => /(^|\/)index\.html?$/i.test(h)) ?? o.html[0];
  return page ? { kind: "preview", args: { path: page } } : { kind: "none", why: "no page to preview yet" };
}

// A rebuild that went wrong goes back to the model, a couple of times at most.
export function failed(kind: "android" | "preview", result: string): boolean {
  if (/^error|^could not open|build failed|install failed|THE APP CRASHED/m.test(result)) return true;
  return kind === "preview" && /^\d+ error\(s\):/m.test(result);
}

export const FIX_ROUNDS = 2;

export function fixPrompt(kind: "android" | "preview", result: string): string {
  const what = kind === "android" ? "rebuilt the app and ran it on the phone" : "opened the page in the preview";
  return `After your change, Maxx ${what}, and it did not work:\n${result.slice(0, 3000)}\n\nFix the cause. Keep the change the user asked for.`;
}

// What the page reads aloud: the gist of the answer, not code.
export function speakable(text: string, max = 280): string {
  const s = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[*_#>]+/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  return end > 0 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, "") + "…";
}

// 16-bit PCM mono WAV, the same thing the page sends.
export function wav(samples: Float32Array, rate = 16000): Uint8Array<ArrayBuffer> {
  const b = new DataView(new ArrayBuffer(44 + samples.length * 2));
  const str = (o: number, s: string) => [...s].forEach((c, i) => b.setUint8(o + i, c.charCodeAt(0)));
  str(0, "RIFF");
  b.setUint32(4, 36 + samples.length * 2, true);
  str(8, "WAVEfmt ");
  b.setUint32(16, 16, true);
  b.setUint16(20, 1, true);
  b.setUint16(22, 1, true);
  b.setUint32(24, rate, true);
  b.setUint32(28, rate * 2, true);
  b.setUint16(32, 2, true);
  b.setUint16(34, 16, true);
  str(36, "data");
  b.setUint32(40, samples.length * 2, true);
  samples.forEach((v, i) => b.setInt16(44 + i * 2, Math.max(-1, Math.min(1, v)) * 0x7fff, true));
  return new Uint8Array(b.buffer);
}

// `maxx doctor voice`: is a local Whisper there, and how fast is it here?
export async function doctorVoice(o: { whisper?: string; model?: string }, log = console.log): Promise<boolean> {
  log("Voice input in `maxx ui`: the mic button uses Edge's built-in speech recognition (Microsoft's online service) unless a local Whisper is set up.\n");
  const w = findWhisper(o);
  if (!w) {
    log("no local Whisper found. For fully offline voice, either:");
    log("  - run whisper.cpp's server (whisper-server -m ggml-base.en.bin --port 8178) and start Maxx with --whisper http://127.0.0.1:8178");
    log("  - or put whisper-cli on PATH and a ggml model in ~/.maxx/whisper/ (or pass --whisper <path to whisper-cli> --whisper-model <file.bin>)");
    log("Models: https://huggingface.co/ggerganov/whisper.cpp (base.en, 142 MB, is a good start on a laptop CPU)");
    return false;
  }
  log(`using ${describeWhisper(w)}${w.kind === "cli" ? ` via ${w.bin}` : ""}`);
  // Two seconds of a quiet tone: enough to time a round trip without needing a recording.
  const s = new Float32Array(32000).map((_, i) => 0.05 * Math.sin((2 * Math.PI * 220 * i) / 16000));
  const t = performance.now();
  try {
    const text = await transcribe(w, wav(s));
    log(`pass  transcribed 2 s of audio in ${((performance.now() - t) / 1000).toFixed(1)} s${text ? ` (heard: ${JSON.stringify(text.slice(0, 60))})` : ""}`);
    return true;
  } catch (e) {
    log(`FAIL  ${(e as Error).message}`);
    return false;
  }
}
