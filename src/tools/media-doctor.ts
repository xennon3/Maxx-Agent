import { findBrowser } from "../judge.ts";
import { imagesDoctor, findBackend, loadImagesConfig } from "./imagegen.ts";
import { findVoice } from "./media.ts";
import { findServer } from "../lsp.ts";

// `maxx doctor media`: what the Studio, Media, Browser and Engineer tools can use on this PC.
export async function doctorMedia(log = console.log): Promise<boolean> {
  const browser = findBrowser();
  log(`${browser ? "✓" : "✗"} browser for drawing, screenshots and testing: ${browser ?? "none (install Edge or Chrome, or set MAXX_BROWSER)"}`);
  const img = await findBackend(await loadImagesConfig());
  log(`${img ? "✓" : "–"} ${img ? await imagesDoctor() : "image model: none running (start ComfyUI on port 8188, or Forge/A1111 with --api on 7860)"}`);
  const v = findVoice();
  log(`${v ? "✓" : "–"} voices: ${v ? (v.kind === "piper" ? `Piper with ${v.model}` : v.kind === "sapi" ? "Windows built-in voices (install Piper for natural ones)" : v.kind) : "none (install Piper or espeak-ng)"}`);
  const ff = process.env.MAXX_FFMPEG ?? Bun.which("ffmpeg");
  log(`${ff ? "✓" : "–"} ffmpeg: ${ff ?? "not installed (winget install Gyan.FFmpeg)"}`);
  for (const [lang, file] of [["TypeScript/JavaScript", "a.ts"], ["Python", "a.py"], ["Kotlin", "a.kt"]] as const) {
    const s = findServer(file, undefined, process.cwd());
    log(`${s && !("missing" in s) ? "✓" : "–"} ${lang} language server: ${s && !("missing" in s) ? s.cmd.join(" ") : s && "missing" in s ? `none (${s.missing[0]!.install})` : "none"}`);
  }
  return !!browser;
}
