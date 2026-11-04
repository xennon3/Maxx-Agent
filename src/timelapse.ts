import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import jpeg from "jpeg-js";
import { z } from "zod";
import { decodePng, downscale, toShot, type Image, type Raw } from "./image.ts";
import { encodeGif, letterbox } from "./gif.ts";
import { defineTool } from "./tools/types.ts";
import { inside } from "./tools/paths.ts";

// The time-lapse builder. Every time Maxx changes something you can see, the
// loop saves a small screenshot of the page (or the phone) here. Asked for a
// film, it strings them into a looping GIF of about 20 seconds: the app being
// built, ready to share. Frames stay out of git.

export const reelDir = (cwd: string) => join(cwd, ".maxx", "timelapse", "frames");
const lastHash = new Map<string, string>();

const hashOf = (s: string) => Bun.hash(s).toString(36);

// Saves a frame unless it looks the same as the last one. Returns its path, or null.
export async function saveFrame(cwd: string, img: Image, label = ""): Promise<string | null> {
  const dir = reelDir(cwd);
  const h = hashOf(img.base64);
  if (lastHash.get(dir) === h) return null;
  lastHash.set(dir, h);
  await mkdir(dir, { recursive: true });
  const ignore = join(cwd, ".maxx", "timelapse", ".gitignore");
  if (!existsSync(ignore)) await writeFile(ignore, "*\n");
  const n = (await listFrames(cwd)).length + 1;
  const file = join(dir, `${String(n).padStart(5, "0")}-${Date.now().toString(36)}${label ? "-" + label.replace(/[^\w-]+/g, "_").slice(0, 30) : ""}.${img.mime === "image/png" ? "png" : "jpg"}`);
  await writeFile(file, Buffer.from(img.base64, "base64"));
  return file;
}

export async function listFrames(cwd: string): Promise<string[]> {
  const dir = reelDir(cwd);
  if (!existsSync(dir)) return [];
  return (await readdir(dir)).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort().map((f) => join(dir, f));
}

export async function clearReel(cwd: string) {
  lastHash.delete(reelDir(cwd));
  await rm(reelDir(cwd), { recursive: true, force: true });
}

function decode(bytes: Uint8Array): Raw {
  if (bytes[0] === 0x89) return decodePng(bytes);
  const j = jpeg.decode(bytes, { useTArray: true, formatAsRGBA: true });
  return { width: j.width, height: j.height, data: j.data };
}

// Evenly picks at most `max` frames, always keeping the first and the last.
export function thin<T>(items: T[], max: number): T[] {
  if (items.length <= max) return items;
  return Array.from({ length: max }, (_, i) => items[Math.round((i * (items.length - 1)) / (max - 1))]!);
}

// Frame timing for a film of about `seconds`: the last frame holds so the finished app shows.
export function timing(frames: number, seconds = 20): { keep: number; delay: number; hold: number } {
  const hold = frames > 1 ? 2500 : 1000;
  const budget = Math.max(1000, seconds * 1000 - hold);
  const keep = Math.max(1, Math.min(frames, Math.floor(budget / 150)));
  const delay = Math.max(150, Math.min(1200, Math.round(budget / Math.max(1, keep - 1))));
  return { keep, delay, hold };
}

export async function makeTimelapse(cwd: string, out: string, o: { seconds?: number; maxSide?: number } = {}): Promise<{ path: string; frames: number; used: number; seconds: number; bytes: number; poster: Raw } | null> {
  const files = await listFrames(cwd);
  if (!files.length) return null;
  const t = timing(files.length, o.seconds ?? 20);
  const chosen = thin(files, t.keep);
  const raws: Raw[] = [];
  for (const f of chosen) {
    try {
      raws.push(downscale(decode(new Uint8Array(await readFile(f))), o.maxSide ?? 480).img);
    } catch {}
  }
  if (!raws.length) return null;
  // One canvas that fits the biggest frame; the rest are letterboxed into it.
  const w = Math.max(...raws.map((r) => r.width)), h = Math.max(...raws.map((r) => r.height));
  const frames = raws.map((r) => (r.width === w && r.height === h ? r : letterbox(r, w, h)));
  const delays = frames.map((_, i) => (i === frames.length - 1 ? t.hold : t.delay));
  const gif = encodeGif(frames, delays);
  const abs = inside(cwd, out);
  await mkdir(dirname(abs), { recursive: true });
  await writeFile(abs, gif);
  return { path: out, frames: files.length, used: frames.length, seconds: delays.reduce((a, b) => a + b, 0) / 1000, bytes: gif.length, poster: frames.at(-1)! };
}

export const timelapseTool = defineTool({
  name: "timelapse",
  description:
    "Maxx saves a screenshot each time it changes something on screen. make: turn them into a looping GIF of the app being built (about 20 seconds), to share or put in a README. clear: start a new film. status: how many frames there are.",
  schema: z.object({
    action: z.enum(["make", "clear", "status"]),
    output: z.string().optional().describe("Where to save the GIF; default timelapse.gif"),
    seconds: z.number().min(3).max(120).optional(),
  }),
  risk: "write",
  checkpoint: false,
  ruleKey: (a) => a.action,
  preview: (a) => (a.action === "make" ? `make ${a.output ?? "timelapse.gif"} from the saved frames` : `${a.action} the time-lapse frames`),
  async run({ action, output, seconds }, { cwd }) {
    if (action === "clear") {
      await clearReel(cwd);
      return "cleared the time-lapse frames; the next screen change starts a new film";
    }
    const n = (await listFrames(cwd)).length;
    if (action === "status") return n ? `${n} frame(s) saved in .maxx/timelapse/frames` : "no frames yet: they are saved when Maxx changes a web page or an app screen";
    const r = await makeTimelapse(cwd, output ?? "timelapse.gif", { seconds });
    if (!r) return "error: no frames yet. Frames are saved when Maxx changes a web page or an app screen (time-lapse is on in maxx ui and the CLI unless --no-timelapse).";
    return {
      text: `saved ${r.path}: ${r.used} of ${r.frames} frames, ${r.seconds.toFixed(1)}s, ${Math.round(r.bytes / 1024)} KB. It loops; the last frame holds so the finished app shows.`,
      images: [toShot(r.poster, { maxSide: 480 })],
    };
  },
});
