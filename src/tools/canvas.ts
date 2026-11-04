import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, extname } from "node:path";
import { z } from "zod";
import { defineTool } from "./types.ts";
import { inside } from "./paths.ts";
import { findBrowser } from "../judge.ts";
import { evaluate } from "../browser.ts";
import { toShot } from "../image.ts";

// image_edit and sprite_sheet: an image kit with no image library. The work
// happens on a canvas in headless Edge, which reads and writes PNG, JPEG and
// WebP and draws as well as any editor. Ops run in order, so "trim, then
// resize to 64, then outline" is one call.

export const MIME: Record<string, string> = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml", ".bmp": "image/bmp" };
const mimeOf = (p: string) => MIME[extname(p).toLowerCase()] ?? "image/png";
const outMime = (p: string) => (/\.jpe?g$/i.test(p) ? "image/jpeg" : /\.webp$/i.test(p) ? "image/webp" : "image/png");

// The page-side editor. Each op takes a canvas and returns a canvas.
export const EDITOR = String.raw`
const load = (src) => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error("could not read the image")); i.src = src; });
const mk = (w, h) => { const c = document.createElement("canvas"); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };
const hex = (s) => { s = String(s || "#000").replace("#", ""); if (s.length === 3) s = [...s].map((x) => x + x).join(""); const n = parseInt(s, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const fromImg = (img) => { const c = mk(img.naturalWidth || img.width || 512, img.naturalHeight || img.height || 512); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); return c; };
const OPS = {
  resize(c, o) {
    const fit = o.fit || "contain";
    let w = o.width, h = o.height;
    if (!w && !h) return c;
    if (!w) w = c.width * h / c.height; if (!h) h = c.height * w / c.width;
    const out = mk(w, h), g = out.getContext("2d");
    g.imageSmoothingEnabled = o.smooth !== false; g.imageSmoothingQuality = "high";
    if (fit === "stretch" || !(o.width && o.height)) { g.drawImage(c, 0, 0, out.width, out.height); return out; }
    const k = fit === "cover" ? Math.max(w / c.width, h / c.height) : Math.min(w / c.width, h / c.height);
    g.drawImage(c, (w - c.width * k) / 2, (h - c.height * k) / 2, c.width * k, c.height * k);
    return out;
  },
  scale(c, o) { return OPS.resize(c, { width: c.width * o.factor, height: c.height * o.factor, fit: "stretch", smooth: o.smooth }); },
  crop(c, o) { const out = mk(o.width, o.height); out.getContext("2d").drawImage(c, -(o.x || 0), -(o.y || 0)); return out; },
  trim(c) {
    const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
    let x1 = c.width, y1 = c.height, x2 = -1, y2 = -1;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 8) { if (x < x1) x1 = x; if (x > x2) x2 = x; if (y < y1) y1 = y; if (y > y2) y2 = y; }
    return x2 < 0 ? c : OPS.crop(c, { x: x1, y: y1, width: x2 - x1 + 1, height: y2 - y1 + 1 });
  },
  pad(c, o) { const p = o.size || 8, out = mk(c.width + 2 * p, c.height + 2 * p), g = out.getContext("2d"); if (o.color) { g.fillStyle = o.color; g.fillRect(0, 0, out.width, out.height); } g.drawImage(c, p, p); return out; },
  remove_bg(c, o) {
    // Flood fill from the border with the colour found there, so a white shirt in the middle stays.
    const g = c.getContext("2d"), im = g.getImageData(0, 0, c.width, c.height), d = im.data, W = c.width, H = c.height;
    const tol = (o.tolerance ?? 40) ** 2 * 3;
    const ref = o.color ? hex(o.color) : [d[0], d[1], d[2]];
    const near = (i) => (d[i] - ref[0]) ** 2 + (d[i + 1] - ref[1]) ** 2 + (d[i + 2] - ref[2]) ** 2 <= tol;
    const seen = new Uint8Array(W * H), stack = [];
    for (let x = 0; x < W; x++) stack.push(x, (H - 1) * W + x);
    for (let y = 0; y < H; y++) stack.push(y * W, y * W + W - 1);
    while (stack.length) {
      const p = stack.pop();
      if (seen[p]) continue; seen[p] = 1;
      if (!near(p * 4)) continue;
      d[p * 4 + 3] = 0;
      const x = p % W, y = (p / W) | 0;
      if (x > 0) stack.push(p - 1); if (x < W - 1) stack.push(p + 1); if (y > 0) stack.push(p - W); if (y < H - 1) stack.push(p + W);
    }
    // Soften the edge by one pixel.
    for (let p = 0; p < W * H; p++) if (d[p * 4 + 3] && ((p % W > 0 && !d[(p - 1) * 4 + 3]) || (p % W < W - 1 && !d[(p + 1) * 4 + 3]) || (p >= W && !d[(p - W) * 4 + 3]) || (p < W * (H - 1) && !d[(p + W) * 4 + 3]))) d[p * 4 + 3] = Math.min(d[p * 4 + 3], 170);
    g.putImageData(im, 0, 0); return c;
  },
  key(c, o) { const g = c.getContext("2d"), im = g.getImageData(0, 0, c.width, c.height), d = im.data, k = hex(o.color), tol = (o.tolerance ?? 40) ** 2 * 3; for (let i = 0; i < d.length; i += 4) if ((d[i] - k[0]) ** 2 + (d[i + 1] - k[1]) ** 2 + (d[i + 2] - k[2]) ** 2 <= tol) d[i + 3] = 0; g.putImageData(im, 0, 0); return c; },
  pixelate(c, o) { const s = o.size || 8, small = OPS.resize(c, { width: Math.max(1, Math.round(c.width / s)), height: Math.max(1, Math.round(c.height / s)), fit: "stretch" }); return OPS.resize(small, { width: c.width, height: c.height, fit: "stretch", smooth: false }); },
  palette(c, o) {
    const pal = (o.colors || []).map(hex); if (!pal.length) return c;
    const g = c.getContext("2d"), im = g.getImageData(0, 0, c.width, c.height), d = im.data;
    for (let i = 0; i < d.length; i += 4) { let best = 0, bd = 1e9; for (let j = 0; j < pal.length; j++) { const q = pal[j], dd = (d[i] - q[0]) ** 2 * 0.3 + (d[i + 1] - q[1]) ** 2 * 0.59 + (d[i + 2] - q[2]) ** 2 * 0.11; if (dd < bd) { bd = dd; best = j; } } [d[i], d[i + 1], d[i + 2]] = pal[best]; if (d[i + 3] < 128) d[i + 3] = 0; else d[i + 3] = 255; }
    g.putImageData(im, 0, 0); return c;
  },
  tint(c, o) { const out = mk(c.width, c.height), g = out.getContext("2d"); g.drawImage(c, 0, 0); g.globalCompositeOperation = "source-atop"; g.globalAlpha = o.amount ?? 0.5; g.fillStyle = o.color || "#f00"; g.fillRect(0, 0, c.width, c.height); return out; },
  filter(c, o) { const out = mk(c.width, c.height), g = out.getContext("2d"); g.filter = o.css || "none"; g.drawImage(c, 0, 0); return out; },
  hue(c, o) { return OPS.filter(c, { css: "hue-rotate(" + (o.degrees || 0) + "deg)" }); },
  grayscale(c) { return OPS.filter(c, { css: "grayscale(1)" }); },
  adjust(c, o) { return OPS.filter(c, { css: "brightness(" + (o.brightness ?? 1) + ") contrast(" + (o.contrast ?? 1) + ") saturate(" + (o.saturation ?? 1) + ")" }); },
  flip(c, o) { const out = mk(c.width, c.height), g = out.getContext("2d"), v = o.direction === "vertical"; g.translate(v ? 0 : c.width, v ? c.height : 0); g.scale(v ? 1 : -1, v ? -1 : 1); g.drawImage(c, 0, 0); return out; },
  rotate(c, o) { const r = (o.degrees || 0) * Math.PI / 180, s = Math.abs(Math.sin(r)), k = Math.abs(Math.cos(r)), out = mk(c.width * k + c.height * s, c.width * s + c.height * k), g = out.getContext("2d"); g.translate(out.width / 2, out.height / 2); g.rotate(r); g.drawImage(c, -c.width / 2, -c.height / 2); return out; },
  outline(c, o) {
    const w = o.width || 2, base = OPS.pad(c, { size: w }), sil = mk(base.width, base.height), sg = sil.getContext("2d");
    sg.drawImage(base, 0, 0); sg.globalCompositeOperation = "source-in"; sg.fillStyle = o.color || "#000"; sg.fillRect(0, 0, sil.width, sil.height);
    const out = mk(base.width, base.height), g = out.getContext("2d");
    for (let a = 0; a < 16; a++) g.drawImage(sil, Math.round(Math.cos(a * Math.PI / 8) * w), Math.round(Math.sin(a * Math.PI / 8) * w));
    g.drawImage(base, 0, 0); return out;
  },
  shadow(c, o) { const p = (o.blur || 12) + Math.max(Math.abs(o.x ?? 4), Math.abs(o.y ?? 6)), out = mk(c.width + 2 * p, c.height + 2 * p), g = out.getContext("2d"); g.shadowColor = o.color || "rgba(0,0,0,.45)"; g.shadowBlur = o.blur || 12; g.shadowOffsetX = o.x ?? 4; g.shadowOffsetY = o.y ?? 6; g.drawImage(c, p, p); return out; },
  round(c, o) { const out = mk(c.width, c.height), g = out.getContext("2d"), r = o.radius ?? Math.min(c.width, c.height) / 6; g.beginPath(); g.roundRect(0, 0, c.width, c.height, r); g.clip(); g.drawImage(c, 0, 0); return out; },
  background(c, o) { const out = mk(c.width, c.height), g = out.getContext("2d"); g.fillStyle = o.color || "#fff"; g.fillRect(0, 0, c.width, c.height); g.drawImage(c, 0, 0); return out; },
};
`;

export type Op = { op: string; [k: string]: unknown };

async function dataUrl(abs: string): Promise<string> {
  return `data:${mimeOf(abs)};base64,${(await readFile(abs)).toString("base64")}`;
}

const NO_BROWSER = "error: image tools draw with Edge or Chrome in the background, and neither was found. Install one, or set MAXX_BROWSER.";

// Run a custom draw step (or just re-encode) on raw image bytes. Null when no browser.
export async function runCanvas(bytes: Uint8Array, o: { draw?: string; mime?: string; ops?: Op[] }): Promise<Uint8Array | null> {
  const browser = findBrowser();
  if (!browser) return null;
  const src = `data:image/png;base64,${Buffer.from(bytes).toString("base64")}`;
  const out = await evaluate<string>(browser, `(async () => { ${EDITOR}
    let c = fromImg(await load(${JSON.stringify(src)}));
    for (const o of ${JSON.stringify(o.ops ?? [])}) c = OPS[o.op](c, o);
    ${o.draw ? `(${o.draw})(null, c, c.getContext("2d"));` : ""}
    return c.toDataURL(${JSON.stringify(outMime(o.mime ?? ".png"))}, 0.9).split(",")[1];
  })()`, { timeoutMs: 60_000 });
  return Buffer.from(out, "base64");
}

const OP_NAMES = ["resize", "scale", "crop", "trim", "pad", "remove_bg", "key", "pixelate", "palette", "tint", "filter", "hue", "grayscale", "adjust", "flip", "rotate", "outline", "shadow", "round", "background"] as const;

export const imageEdit = defineTool({
  name: "image_edit",
  description:
    "Edit an image file with a list of ops applied in order, and save it (PNG, JPEG or WebP by the output's extension). Ops: resize {width,height,fit:contain|cover|stretch,smooth}, scale {factor}, crop {x,y,width,height}, trim (cut transparent edges), pad {size,color}, remove_bg {tolerance,color} (makes the background around the subject see-through), key {color,tolerance}, pixelate {size}, palette {colors:[hex]}, tint {color,amount}, hue {degrees}, grayscale, adjust {brightness,contrast,saturation}, flip {direction}, rotate {degrees}, outline {color,width}, shadow {color,blur,x,y}, round {radius}, background {color}.",
  schema: z.object({
    input: z.string().describe("Image in the project"),
    output: z.string().optional().describe("Where to save; default overwrites input"),
    ops: z.array(z.object({ op: z.enum(OP_NAMES) }).passthrough()).min(1),
  }),
  risk: "write",
  ruleKey: () => "image",
  preview: (a) => `${a.ops.map((o) => o.op).join(" → ")} on ${a.input}${a.output && a.output !== a.input ? ` → ${a.output}` : ""}`,
  async run({ input, output, ops }, { cwd }) {
    const browser = findBrowser();
    if (!browser) return NO_BROWSER;
    const src = inside(cwd, input);
    if (!existsSync(src)) return `error: ${input} does not exist`;
    const out = output ?? input;
    const dest = inside(cwd, out);
    let res: { b64: string; w: number; h: number };
    try {
      res = await evaluate(browser, `(async () => { ${EDITOR}
        let c = fromImg(await load(${JSON.stringify(await dataUrl(src))}));
        for (const o of ${JSON.stringify(ops)}) { if (!OPS[o.op]) throw new Error("unknown op " + o.op); c = OPS[o.op](c, o); }
        return { b64: c.toDataURL(${JSON.stringify(outMime(out))}, 0.9).split(",")[1], w: c.width, h: c.height };
      })()`, { timeoutMs: 90_000 });
    } catch (e) {
      return `error: ${(e as Error).message}`;
    }
    const bytes = Buffer.from(res.b64, "base64");
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, bytes);
    let images: ReturnType<typeof toShot>[] = [];
    try {
      if (outMime(out) === "image/png") images = [toShot(bytes, { maxSide: 512, quality: 75 })];
    } catch {}
    return { text: `saved ${out} (${res.w}x${res.h}, ${Math.max(1, Math.round(bytes.length / 1024))} KB) after ${ops.map((o) => o.op).join(", ")}`, images };
  },
});

export const spriteSheet = defineTool({
  name: "sprite_sheet",
  description:
    "Pack several images (animation frames, tiles, icons) into one sprite sheet PNG on a grid, plus a JSON atlas with each frame's x, y, w, h. frames is a list of files or one glob like 'art/walk-*.png'.",
  schema: z.object({
    frames: z.array(z.string()).min(1),
    output: z.string().describe("The sheet, e.g. assets/hero-walk.png; the atlas goes next to it as .json"),
    columns: z.number().int().min(1).max(64).optional().describe("Frames per row; default a square-ish grid"),
    cell: z.number().int().min(4).max(1024).optional().describe("Fit every frame into a square cell of this size; default the largest frame"),
    pixel: z.boolean().optional().describe("Pixel art: scale without smoothing"),
  }),
  risk: "write",
  ruleKey: () => "image",
  preview: (a) => `pack ${a.frames.length > 1 ? `${a.frames.length} images` : a.frames[0]} into ${a.output}`,
  async run({ frames, output, columns, cell, pixel }, { cwd }) {
    const browser = findBrowser();
    if (!browser) return NO_BROWSER;
    const files: string[] = [];
    for (const f of frames) {
      if (/[*?[]/.test(f)) for (const m of [...new Bun.Glob(f).scanSync({ cwd })].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))) files.push(m);
      else files.push(f);
    }
    if (!files.length) return "error: no frames matched";
    const missing = files.filter((f) => !existsSync(inside(cwd, f)));
    if (missing.length) return `error: not found: ${missing.join(", ")}`;
    const srcs = await Promise.all(files.map((f) => dataUrl(inside(cwd, f))));
    const cols = columns ?? Math.ceil(Math.sqrt(files.length));
    const res = await evaluate<{ b64: string; w: number; h: number; cw: number; ch: number }>(browser, `(async () => { ${EDITOR}
      const imgs = await Promise.all(${JSON.stringify(srcs)}.map(load));
      const cw = ${cell ?? 0} || Math.max(...imgs.map((i) => i.naturalWidth)), ch = ${cell ?? 0} || Math.max(...imgs.map((i) => i.naturalHeight));
      const cols = ${cols}, rows = Math.ceil(imgs.length / cols), out = mk(cw * cols, ch * rows), g = out.getContext("2d");
      g.imageSmoothingEnabled = ${pixel ? "false" : "true"};
      imgs.forEach((im, n) => { const k = Math.min(1, cw / im.naturalWidth, ch / im.naturalHeight) || 1; const w = im.naturalWidth * (${cell ? "Math.min(cw / im.naturalWidth, ch / im.naturalHeight)" : "k"}), h = im.naturalHeight * (${cell ? "Math.min(cw / im.naturalWidth, ch / im.naturalHeight)" : "k"}); g.drawImage(im, (n % cols) * cw + (cw - w) / 2, Math.floor(n / cols) * ch + (ch - h) / 2, w, h); });
      return { b64: out.toDataURL("image/png").split(",")[1], w: out.width, h: out.height, cw, ch };
    })()`, { timeoutMs: 90_000 });
    const dest = inside(cwd, output);
    await mkdir(dirname(dest), { recursive: true });
    const bytes = Buffer.from(res.b64, "base64");
    await writeFile(dest, bytes);
    const atlas = {
      image: basename(output),
      size: { w: res.w, h: res.h },
      cell: { w: res.cw, h: res.ch },
      columns: cols,
      frames: Object.fromEntries(files.map((f, n) => [basename(f, extname(f)), { x: (n % cols) * res.cw, y: Math.floor(n / cols) * res.ch, w: res.cw, h: res.ch }])),
    };
    const atlasPath = output.replace(/\.\w+$/, "") + ".json";
    await writeFile(inside(cwd, atlasPath), JSON.stringify(atlas, null, 2) + "\n");
    let images: ReturnType<typeof toShot>[] = [];
    try {
      images = [toShot(bytes, { maxSide: 700, quality: 75 })];
    } catch {}
    return {
      text: `packed ${files.length} frames into ${output} (${res.w}x${res.h}, ${cols} per row, cells ${res.cw}x${res.ch}) and the atlas ${atlasPath}.\nDraw frame n with ctx.drawImage(sheet, (n % ${cols}) * ${res.cw}, Math.floor(n / ${cols}) * ${res.ch}, ${res.cw}, ${res.ch}, x, y, ${res.cw}, ${res.ch}).`,
      images,
    };
  },
});
