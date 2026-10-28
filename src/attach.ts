import { mkdir } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import jpeg from "jpeg-js";
import type { ContentPart } from "./llm.ts";
import { ATTACHED_IMAGE } from "./context.ts";
import { decodePng, toShot, type Image } from "./image.ts";
import { describeImages, imagePart, type Vision } from "./vision.ts";

// Files the user hands Maxx with a message (dropped, pasted or picked in the
// app, or /attach in the terminal). What happens to each one:
//   image        the model sees it (native), a vision model describes it
//                (proxy), or it is saved for later (off)
//   text / code  inlined in the message, up to a share of the context window;
//                a bigger file is saved and only its start is inlined
//   save         copied into the project folder; the model is told where
//   anything else (zip, apk, pdf...) is saved, there is no other use for it
// Small local models have small windows (16K on a laptop), so the budget
// matters more than it would with a cloud model.

export type Upload = { name: string; data: Uint8Array; mime?: string; mode?: "attach" | "save" };
export type Turn = { content: string | ContentPart[]; notes: string[] };
export type AttachOptions = { cwd: string; contextWindow: number; vision: Vision; signal?: AbortSignal };

// Share of the context window that attached text may take, all files together.
const TEXT_SHARE = 0.3;
const UPLOAD_DIR = ".maxx/uploads";

export const isImageName = (name: string) => /\.(png|jpe?g)$/i.test(name);

// Small windows get smaller images and fewer of them.
export const imageLimits = (contextWindow: number) => (contextWindow <= 16_384 ? { maxSide: 1024, count: 2 } : { maxSide: 1280, count: 4 });

export function looksLikeText(data: Uint8Array): boolean {
  const head = data.subarray(0, 8000);
  if (head.includes(0)) return false;
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(head.length < data.length ? trimUtf8(head) : head);
    return true;
  } catch {
    return false;
  }
}

// Cutting at 8000 bytes can split a multi-byte character; drop the partial tail.
function trimUtf8(b: Uint8Array): Uint8Array {
  let end = b.length;
  while (end > 0 && end > b.length - 4 && (b[end - 1]! & 0xc0) === 0x80) end--;
  if (end > 0 && b[end - 1]! >= 0xc0) end--;
  return b.subarray(0, end);
}

// A name that is safe to write in the project folder, never over an existing file.
export async function saveInProject(cwd: string, dir: string, name: string, data: Uint8Array): Promise<string> {
  const clean = basename(name.replace(/\\/g, "/")).replace(/[<>:"|?*\x00-\x1f]/g, "_").replace(/^\.+/, "") || "upload";
  await mkdir(join(cwd, dir), { recursive: true });
  const ext = extname(clean), stem = clean.slice(0, clean.length - ext.length);
  for (let n = 0; ; n++) {
    const rel = (dir ? dir + "/" : "") + (n ? `${stem}-${n}${ext}` : clean);
    const f = Bun.file(join(cwd, rel));
    if (!(await f.exists())) {
      await Bun.write(f, data);
      return rel;
    }
  }
}

export function shrinkImage(name: string, data: Uint8Array, maxSide: number): Image {
  const raw = /\.png$/i.test(name) || (data[0] === 0x89 && data[1] === 0x50) ? decodePng(data) : jpeg.decode(data, { useTArray: true, formatAsRGBA: true, maxMemoryUsageInMB: 512 });
  const shot = toShot({ width: raw.width, height: raw.height, data: raw.data }, { maxSide, quality: 82 });
  return { mime: shot.mime, base64: shot.base64 };
}

const size = (n: number) => (n < 1024 ? `${n} B` : n < 1 << 20 ? `${(n / 1024).toFixed(1)} KB` : `${(n / (1 << 20)).toFixed(1)} MB`);

export async function buildTurn(typed: string, files: Upload[], o: AttachOptions): Promise<Turn> {
  if (!files.length) return { content: typed, notes: [] };
  const notes: string[] = [];
  const blocks: string[] = [];
  const images: { name: string; img: Image }[] = [];
  const limits = imageLimits(o.contextWindow);
  let budget = Math.floor(o.contextWindow * TEXT_SHARE * 4); // characters, ~4 per token

  for (const f of files) {
    const image = isImageName(f.name) || f.mime === "image/png" || f.mime === "image/jpeg";
    const text = !image && looksLikeText(f.data);

    if (f.mode === "save" || (!image && !text)) {
      const rel = await saveInProject(o.cwd, "", f.name, f.data);
      blocks.push(`[file added to the project: ${rel} (${size(f.data.length)})]`);
      notes.push(`Saved ${f.name} to the project as ${rel}.`);
      continue;
    }

    if (image) {
      let img: Image;
      try {
        img = shrinkImage(f.name, f.data, limits.maxSide);
      } catch (e) {
        const rel = await saveInProject(o.cwd, UPLOAD_DIR, f.name, f.data);
        notes.push(`Could not read ${f.name} as an image (${(e as Error).message}); saved it as ${rel}.`);
        blocks.push(`[attached file: ${f.name} (not a readable image; saved as ${rel})]`);
        continue;
      }
      if (o.vision.mode === "off" || images.length >= limits.count) {
        const rel = await saveInProject(o.cwd, UPLOAD_DIR, f.name, f.data);
        const why = o.vision.mode === "off" ? "this model cannot see images" : `only ${limits.count} images fit in one message at this context size`;
        notes.push(`${f.name}: ${why}, so it was saved as ${rel}${o.vision.mode === "off" ? ". Load a vision model (or pass --vision-model) to show it to Maxx." : "."}`);
        blocks.push(`[attached file: ${f.name} (an image you cannot see: ${why}; saved as ${rel})]`);
        continue;
      }
      images.push({ name: f.name, img });
      continue;
    }

    const body = new TextDecoder().decode(f.data).replace(/\r\n/g, "\n");
    const lines = body.split("\n");
    if (body.length <= budget) {
      budget -= body.length;
      blocks.push(`<file name="${attr(f.name)}" lines="${lines.length}">\n${body}\n</file>`);
      continue;
    }
    // Too big for the window: keep the whole file in the project, show the start.
    const rel = await saveInProject(o.cwd, UPLOAD_DIR, f.name, f.data);
    let shown = 0, used = 0;
    while (shown < lines.length && used + lines[shown]!.length + 1 <= Math.max(budget, 0)) used += lines[++shown - 1]!.length + 1;
    budget -= used;
    const head = lines.slice(0, shown).join("\n");
    blocks.push(
      `<file name="${attr(f.name)}" lines="${lines.length}" shown="${shown}" saved="${rel}">\n${head}${head ? "\n" : ""}` +
        `[... ${lines.length - shown} more lines not shown to save context. The whole file is saved at ${rel}: read_file it in parts or grep it.]\n</file>`,
    );
    notes.push(`${f.name} is too big for the context window (${lines.length} lines); Maxx sees the first ${shown} and the whole file is saved as ${rel}.`);
  }

  if (images.length && o.vision.mode === "proxy") {
    const v = o.vision;
    for (const { name, img } of images) {
      try {
        const seen = await describeImages(v.llm, [img], `The user attached ${name} to this message: ${typed.slice(0, 1000)}`, o.signal);
        blocks.push(`<image name="${attr(name)}" described-by="${attr(v.llm.model)}">\n${seen}\n</image>`);
      } catch (e) {
        const rel = await saveInProject(o.cwd, UPLOAD_DIR, name, Buffer.from(img.base64, "base64"));
        blocks.push(`[attached file: ${name} (the vision model failed: ${(e as Error).message}; saved as ${rel})]`);
      }
    }
    images.length = 0;
  }

  const text = [typed, ...blocks].join("\n\n");
  if (!images.length) return { content: text, notes };
  const marks = images.map((i) => `${ATTACHED_IMAGE}${i.name}]`).join("\n");
  return { content: [{ type: "text", text: `${text}\n\n${marks}` }, ...images.map((i) => imagePart(i.img))], notes };
}

const attr = (s: string) => s.replace(/["<>\n]/g, "_");
