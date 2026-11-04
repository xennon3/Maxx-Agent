import type { Raw } from "./image.ts";

// A small animated-GIF encoder, so Maxx can make a shareable time-lapse with no
// ffmpeg. One palette for the whole film, picked from the colours the frames
// use most (screenshots of apps have few colours, so 256 go a long way), then
// each frame is LZW-packed. Frames must all be the same size.

type Rgb = [number, number, number];

// The 256 colours that cover the most pixels, spread out so near-duplicates
// don't crowd out an accent colour. Sampled on a 5-bit-per-channel grid.
export function pickPalette(frames: Raw[], max = 256): Rgb[] {
  const counts = new Map<number, number>();
  for (const f of frames) {
    const step = Math.max(1, Math.floor((f.width * f.height) / 60_000));
    for (let p = 0; p < f.width * f.height; p += step) {
      const i = p * 4;
      const k = ((f.data[i]! >> 3) << 10) | ((f.data[i + 1]! >> 3) << 5) | (f.data[i + 2]! >> 3);
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const out: Rgb[] = [];
  const unpack = (k: number): Rgb => [((k >> 10) & 31) * 8 + 4, ((k >> 5) & 31) * 8 + 4, (k & 31) * 8 + 4];
  // First pass: well-separated colours; second: fill up with the rest.
  for (const minDist of [24 * 24, 0]) {
    for (const [k] of ranked) {
      if (out.length >= max) break;
      const c = unpack(k);
      if (out.some((o) => (o[0] - c[0]) ** 2 + (o[1] - c[1]) ** 2 + (o[2] - c[2]) ** 2 <= minDist)) continue;
      out.push(c);
    }
  }
  if (!out.length) out.push([0, 0, 0]);
  while (out.length < 2) out.push([255, 255, 255]);
  return out;
}

// Map each pixel to its nearest palette index, with a cache keyed on the 5-bit colour.
function indexFrame(f: Raw, pal: Rgb[], cache: Int16Array): Uint8Array {
  const out = new Uint8Array(f.width * f.height);
  for (let p = 0; p < out.length; p++) {
    const i = p * 4;
    const r = f.data[i]!, g = f.data[i + 1]!, b = f.data[i + 2]!;
    const k = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    let best = cache[k]!;
    if (best < 0) {
      let bd = Infinity;
      for (let j = 0; j < pal.length; j++) {
        const c = pal[j]!;
        const d = (c[0] - r) ** 2 + (c[1] - g) ** 2 + (c[2] - b) ** 2;
        if (d < bd) (bd = d), (best = j);
      }
      cache[k] = best;
    }
    out[p] = best;
  }
  return out;
}

// GIF's variable-width LZW, written out in sub-blocks of up to 255 bytes.
export function lzw(indices: Uint8Array, minCode: number): Uint8Array {
  const clear = 1 << minCode, eoi = clear + 1;
  const bytes: number[] = [];
  let cur = 0, bits = 0;
  let size = minCode + 1;
  const put = (code: number) => {
    cur |= code << bits;
    bits += size;
    while (bits >= 8) {
      bytes.push(cur & 255);
      cur >>>= 8;
      bits -= 8;
    }
  };
  let dict = new Map<number, number>();
  let next = eoi + 1;
  put(clear);
  let prefix = indices[0] ?? 0;
  for (let i = 1; i < indices.length; i++) {
    const k = indices[i]!;
    const key = prefix * 256 + k;
    const hit = dict.get(key);
    if (hit !== undefined) {
      prefix = hit;
      continue;
    }
    put(prefix);
    if (next < 4096) {
      dict.set(key, next++);
      if (next > 1 << size && size < 12) size++;
    } else {
      put(clear);
      dict = new Map();
      next = eoi + 1;
      size = minCode + 1;
    }
    prefix = k;
  }
  put(prefix);
  put(eoi);
  if (bits > 0) bytes.push(cur & 255);
  const out: number[] = [];
  for (let i = 0; i < bytes.length; i += 255) {
    const n = Math.min(255, bytes.length - i);
    out.push(n, ...bytes.slice(i, i + n));
  }
  out.push(0);
  return Uint8Array.from(out);
}

// delays: per frame, in milliseconds (GIF counts in hundredths of a second).
export function encodeGif(frames: Raw[], delays: number[] | number): Uint8Array {
  if (!frames.length) throw new Error("no frames");
  const { width, height } = frames[0]!;
  if (frames.some((f) => f.width !== width || f.height !== height)) throw new Error("all frames must be the same size");
  const pal = pickPalette(frames);
  const bitsPer = Math.max(1, Math.ceil(Math.log2(pal.length)));
  const tableSize = 1 << bitsPer;
  const out: number[] = [];
  const u16 = (n: number) => out.push(n & 255, (n >> 8) & 255);
  out.push(...new TextEncoder().encode("GIF89a"));
  u16(width);
  u16(height);
  out.push(0x80 | ((bitsPer - 1) << 4) | (bitsPer - 1), 0, 0);
  for (let i = 0; i < tableSize; i++) out.push(...(pal[i] ?? [0, 0, 0]));
  // Loop for ever (NETSCAPE2.0).
  out.push(0x21, 0xff, 11, ...new TextEncoder().encode("NETSCAPE2.0"), 3, 1, 0, 0, 0);
  const cache = new Int16Array(32768).fill(-1);
  const body: Uint8Array[] = [Uint8Array.from(out)];
  frames.forEach((f, n) => {
    const d = Math.max(2, Math.round((Array.isArray(delays) ? (delays[n] ?? delays.at(-1) ?? 100) : delays) / 10));
    const head = [0x21, 0xf9, 4, 0, d & 255, (d >> 8) & 255, 0, 0, 0x2c, 0, 0, 0, 0, width & 255, width >> 8, height & 255, height >> 8, 0, Math.max(2, bitsPer)];
    body.push(Uint8Array.from(head), lzw(indexFrame(f, pal, cache), Math.max(2, bitsPer)));
  });
  body.push(Uint8Array.of(0x3b));
  const total = body.reduce((n, b) => n + b.length, 0);
  const gif = new Uint8Array(total);
  let at = 0;
  for (const b of body) gif.set(b, at), (at += b.length);
  return gif;
}

// Fit a frame into w x h on a background, keeping its shape (frames from a
// phone and a desktop page can share one film).
export function letterbox(src: Raw, w: number, h: number, bg: Rgb = [17, 17, 20]): Raw {
  const out = new Uint8Array(w * h * 4);
  for (let i = 0; i < w * h; i++) out.set([bg[0], bg[1], bg[2], 255], i * 4);
  const k = Math.min(w / src.width, h / src.height);
  const dw = Math.max(1, Math.round(src.width * k)), dh = Math.max(1, Math.round(src.height * k));
  const ox = Math.floor((w - dw) / 2), oy = Math.floor((h - dh) / 2);
  for (let y = 0; y < dh; y++) {
    const sy = Math.min(src.height - 1, Math.floor(y / k));
    for (let x = 0; x < dw; x++) {
      const sx = Math.min(src.width - 1, Math.floor(x / k));
      const si = (sy * src.width + sx) * 4, di = ((oy + y) * w + ox + x) * 4;
      out[di] = src.data[si]!;
      out[di + 1] = src.data[si + 1]!;
      out[di + 2] = src.data[si + 2]!;
      out[di + 3] = 255;
    }
  }
  return { width: w, height: h, data: out };
}
