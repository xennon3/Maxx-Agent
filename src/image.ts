import { PNG } from "pngjs";
import jpeg from "jpeg-js";

// Screenshots go to the model as small JPEGs: a phone's 1080x2400 PNG is
// several thousand vision tokens, a 1280px-tall JPEG is a fraction of that.
// Pure JS (pngjs + jpeg-js) so it works in the compiled binary on any OS.

export type Image = { mime: "image/jpeg" | "image/png"; base64: string };
export type Bounds = { x1: number; y1: number; x2: number; y2: number };
export type Mark = { n: number; bounds: Bounds };

export type Shot = Image & {
  width: number; // size of the image the model sees
  height: number;
  scale: number; // screen pixels per image pixel
};

export type Raw = { width: number; height: number; data: Uint8Array };

export function decodePng(png: Uint8Array): Raw {
  const img = PNG.sync.read(Buffer.from(png));
  return { width: img.width, height: img.height, data: img.data };
}

// Box-filter downscale so the long side is at most `maxSide`.
export function downscale(src: Raw, maxSide: number): { img: Raw; scale: number } {
  const scale = Math.max(1, Math.max(src.width, src.height) / maxSide);
  if (scale === 1) return { img: src, scale };
  const w = Math.round(src.width / scale), h = Math.round(src.height / scale);
  const out = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) {
    const sy0 = Math.floor(y * scale), sy1 = Math.min(src.height, Math.max(sy0 + 1, Math.floor((y + 1) * scale)));
    for (let x = 0; x < w; x++) {
      const sx0 = Math.floor(x * scale), sx1 = Math.min(src.width, Math.max(sx0 + 1, Math.floor((x + 1) * scale)));
      let r = 0, g = 0, b = 0, n = 0;
      for (let sy = sy0; sy < sy1; sy++) {
        for (let sx = sx0; sx < sx1; sx++) {
          const i = (sy * src.width + sx) * 4;
          r += src.data[i]!; g += src.data[i + 1]!; b += src.data[i + 2]!; n++;
        }
      }
      const o = (y * w + x) * 4;
      out[o] = r / n; out[o + 1] = g / n; out[o + 2] = b / n; out[o + 3] = 255;
    }
  }
  return { img: { width: w, height: h, data: out }, scale };
}

// "Set-of-marks": numbered boxes over the elements we know about, so the model
// can say "tap 7" instead of guessing pixel coordinates.
const COLORS: [number, number, number][] = [[255, 0, 80], [0, 160, 255], [0, 200, 90], [255, 140, 0], [170, 60, 255]];

// 3x5 bitmap digits, one row per string, read left to right.
const DIGITS = ["111101101101111", "010110010010111", "111001111100111", "111001111001111", "101101111001001", "111100111001111", "111100111101111", "111001010010010", "111101111101111", "111101111001111"];

export function drawMarks(img: Raw, marks: Mark[], scale: number, labelScale = 2) {
  for (const m of marks) {
    const c = COLORS[m.n % COLORS.length]!;
    const x1 = Math.round(m.bounds.x1 / scale), y1 = Math.round(m.bounds.y1 / scale);
    const x2 = Math.round(m.bounds.x2 / scale) - 1, y2 = Math.round(m.bounds.y2 / scale) - 1;
    for (let t = 0; t < 2; t++) {
      for (let x = x1; x <= x2; x++) (px(img, x, y1 + t, c), px(img, x, y2 - t, c));
      for (let y = y1; y <= y2; y++) (px(img, x1 + t, y, c), px(img, x2 - t, y, c));
    }
    // Label: white digits on the box color, in the top-left corner.
    const text = String(m.n), s = labelScale;
    const lw = text.length * 4 * s + s, lh = 7 * s;
    for (let y = 0; y < lh; y++) for (let x = 0; x < lw; x++) px(img, x1 + x, y1 + y, c);
    [...text].forEach((d, i) => {
      const bits = DIGITS[Number(d)]!;
      for (let r = 0; r < 5; r++) {
        for (let col = 0; col < 3; col++) {
          if (bits[r * 3 + col] !== "1") continue;
          for (let dy = 0; dy < s; dy++) for (let dx = 0; dx < s; dx++) px(img, x1 + s + (i * 4 + col) * s + dx, y1 + s + r * s + dy, [255, 255, 255]);
        }
      }
    });
  }
}

function px(img: Raw, x: number, y: number, [r, g, b]: [number, number, number]) {
  if (x < 0 || y < 0 || x >= img.width || y >= img.height) return;
  const i = (y * img.width + x) * 4;
  img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = 255;
}

export function crop(src: Raw, b: Bounds): Raw {
  const x1 = clamp(b.x1, 0, src.width - 1), y1 = clamp(b.y1, 0, src.height - 1);
  const w = clamp(b.x2, x1 + 1, src.width) - x1, h = clamp(b.y2, y1 + 1, src.height) - y1;
  const out = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) out.set(src.data.subarray(((y1 + y) * src.width + x1) * 4, ((y1 + y) * src.width + x1 + w) * 4), y * w * 4);
  return { width: w, height: h, data: out };
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, Math.round(v)));

export function toShot(src: Uint8Array | Raw, opts: { maxSide?: number; marks?: Mark[]; quality?: number } = {}): Shot {
  const { img, scale } = downscale(src instanceof Uint8Array ? decodePng(src) : src, opts.maxSide ?? 1280);
  // Downscaling may return the decoder's own buffer; copy before drawing on it.
  const canvas = { ...img, data: new Uint8Array(img.data) };
  if (opts.marks?.length) drawMarks(canvas, opts.marks, scale);
  const enc = jpeg.encode({ width: canvas.width, height: canvas.height, data: Buffer.from(canvas.data) }, opts.quality ?? 75);
  return { mime: "image/jpeg", base64: Buffer.from(enc.data).toString("base64"), width: canvas.width, height: canvas.height, scale };
}

export const center = (b: Bounds) => ({ x: Math.round((b.x1 + b.x2) / 2), y: Math.round((b.y1 + b.y2) / 2) });
