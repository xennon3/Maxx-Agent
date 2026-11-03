import { existsSync, readdirSync, readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { z } from "zod";
import { defineTool, type ToolResult } from "./types.ts";
import { inside } from "./paths.ts";
import { findBrowser } from "../judge.ts";
import { evaluate, screenshot } from "../browser.ts";
import { toShot } from "../image.ts";
import { htmlFiles } from "../ui/preview.ts";

// The studio toolset: tools for things people look at. snap_page shows the
// model its page at phone and desktop size (plus the console errors), and
// make_icons turns one logo into every icon an app or site needs. Both use
// the headless Edge that Windows already has; no image library needed.

const NO_BROWSER = "error: no Edge or Chrome found for headless rendering. Install Microsoft Edge or Google Chrome, or set MAXX_BROWSER to its path.";

export const SIZES = { phone: { width: 412, height: 860 }, tablet: { width: 820, height: 1100 }, desktop: { width: 1366, height: 860 } } as const;
type Size = keyof typeof SIZES;

const isLocal = (u: URL) => ["localhost", "127.0.0.1", "[::1]", "0.0.0.0"].includes(u.hostname);

export async function pageUrl(cwd: string, target: string | undefined, network?: boolean): Promise<string> {
  if (target && /^https?:\/\//i.test(target)) {
    const u = new URL(target);
    if (network === false && !isLocal(u)) throw new Error("network access is off, so only local pages (localhost or project files) can be opened. Turn on 🌐 Network for web pages.");
    return u.href;
  }
  const page = target ?? (existsSync(join(cwd, "index.html")) ? "index.html" : (await htmlFiles(cwd))[0]);
  if (!page) throw new Error("no HTML page found in the project; give target as a file path or a http://localhost URL");
  const abs = inside(cwd, page);
  if (!existsSync(abs)) throw new Error(`${page} does not exist`);
  return pathToFileURL(abs).href;
}

export const snapPage = defineTool({
  name: "snap_page",
  description:
    "Open a web page in a headless browser and look at it: returns screenshots at phone and/or desktop size, plus console errors and sideways overflow. target is a project file (index.html) or a http://localhost URL. Use after changing a page's look.",
  schema: z.object({
    target: z.string().optional().describe("A project HTML file or a URL; default: index.html"),
    size: z.enum(["phone", "tablet", "desktop", "both"]).optional().describe("both = phone and desktop (the default)"),
    full: z.boolean().optional().describe("Capture the whole scrolling page, not just the first screen"),
    wait: z.number().int().min(0).max(10000).optional().describe("Milliseconds to wait after load for animations or data, default 800"),
  }),
  risk: "read",
  checkpoint: false,
  async run({ target, size = "both", full, wait }, ctx): Promise<ToolResult> {
    const browser = findBrowser();
    if (!browser) return NO_BROWSER;
    let url: string;
    try {
      url = await pageUrl(ctx.cwd, target, ctx.network);
    } catch (e) {
      return `error: ${(e as Error).message}`;
    }
    const sizes: Size[] = size === "both" ? ["phone", "desktop"] : [size];
    const text: string[] = [];
    const images = [];
    for (const s of sizes) {
      try {
        const r = await screenshot(browser, url, { ...SIZES[s], full, settleMs: wait });
        images.push(toShot(r.png, { maxSide: s === "phone" ? 900 : 1100, quality: 70 }));
        text.push(`${s} (${SIZES[s].width}px wide)${r.title ? `, title "${r.title}"` : ""}: ${r.overflow > 4 ? `content is ${r.overflow}px wider than the screen, so it scrolls sideways; find the element that is too wide` : "fits the width"}`);
        if (s === sizes[0]) text.push(r.errors.length ? `console errors:\n${r.errors.slice(0, 12).map((e) => `- ${e}`).join("\n")}` : "no console errors");
      } catch (e) {
        text.push(`${s}: could not render (${(e as Error).message})`);
      }
    }
    return { text: `${url}\n${text.join("\n")}`, images };
  },
});

// ---- make_icons ----

type Spec = { file: string; size: number; pad?: number; round?: boolean; bg?: boolean };
export type IconKind = "android" | "pwa" | "favicon" | "windows";

const DENSITIES: [string, number][] = [["mdpi", 1], ["hdpi", 1.5], ["xhdpi", 2], ["xxhdpi", 3], ["xxxhdpi", 4]];

export function iconPlan(kinds: IconKind[], androidRes: string | null): Spec[] {
  const out: Spec[] = [];
  if (kinds.includes("android")) {
    const res = androidRes ?? "icons/android";
    for (const [d, k] of DENSITIES) {
      out.push({ file: `${res}/mipmap-${d}/ic_launcher.png`, size: 48 * k, pad: 0.08, bg: true });
      out.push({ file: `${res}/mipmap-${d}/ic_launcher_round.png`, size: 48 * k, pad: 0.16, round: true, bg: true });
      // Adaptive icons (Android 8+): 108dp layers, the logo inside the middle 66dp.
      out.push({ file: `${res}/mipmap-${d}/ic_launcher_foreground.png`, size: 108 * k, pad: 0.25 });
    }
    out.push({ file: "icons/play-store-512.png", size: 512, pad: 0.1, bg: true });
  }
  if (kinds.includes("pwa")) {
    out.push({ file: "icons/icon-192.png", size: 192, pad: 0.04 }, { file: "icons/icon-512.png", size: 512, pad: 0.04 });
    out.push({ file: "icons/maskable-512.png", size: 512, pad: 0.2, bg: true }, { file: "icons/apple-touch-icon.png", size: 180, pad: 0.08, bg: true });
  }
  if (kinds.includes("favicon")) out.push({ file: "favicon-32.png", size: 32 }, { file: "favicon-16.png", size: 16 });
  return out;
}

// An .ico is a tiny header and a directory, then PNGs back to back.
export function buildIco(pngs: { size: number; data: Uint8Array }[]): Uint8Array {
  const head = 6 + 16 * pngs.length;
  const total = head + pngs.reduce((n, p) => n + p.data.length, 0);
  const buf = new Uint8Array(total);
  const v = new DataView(buf.buffer);
  v.setUint16(0, 0, true);
  v.setUint16(2, 1, true);
  v.setUint16(4, pngs.length, true);
  let off = head;
  pngs.forEach((p, i) => {
    const e = 6 + 16 * i;
    buf[e] = p.size >= 256 ? 0 : p.size;
    buf[e + 1] = p.size >= 256 ? 0 : p.size;
    v.setUint16(e + 4, 1, true);
    v.setUint16(e + 6, 32, true);
    v.setUint32(e + 8, p.data.length, true);
    v.setUint32(e + 12, off, true);
    buf.set(p.data, off);
    off += p.data.length;
  });
  return buf;
}

const MIME: Record<string, string> = { ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif" };

// The page-side drawing: each spec becomes a PNG data URL, base64 only.
export function drawScript(dataUrl: string, specs: { size: number; pad?: number; round?: boolean; bg?: boolean }[], background: string): string {
  return `(async () => {
    const img = new Image();
    img.src = ${JSON.stringify(dataUrl)};
    await img.decode();
    const out = [];
    for (const s of ${JSON.stringify(specs)}) {
      const c = document.createElement("canvas");
      c.width = c.height = s.size;
      const g = c.getContext("2d");
      g.imageSmoothingQuality = "high";
      if (s.round) { g.beginPath(); g.arc(s.size / 2, s.size / 2, s.size / 2, 0, Math.PI * 2); g.clip(); }
      if (s.bg) { g.fillStyle = ${JSON.stringify(background)}; g.fillRect(0, 0, s.size, s.size); }
      const box = s.size * (1 - 2 * (s.pad || 0));
      const k = Math.min(box / (img.naturalWidth || box), box / (img.naturalHeight || box));
      const w = (img.naturalWidth || box) * k, h = (img.naturalHeight || box) * k;
      g.drawImage(img, (s.size - w) / 2, (s.size - h) / 2, w, h);
      out.push(c.toDataURL("image/png").split(",")[1]);
    }
    return out;
  })()`;
}

function androidResDir(cwd: string): string | null {
  for (const d of ["app/src/main/res", "src/main/res"]) if (existsSync(join(cwd, d))) return d;
  return null;
}

// Point the manifest at the new icons when it names none.
export function withManifestIcons(xml: string): string {
  if (/<application\b[^>]*android:icon=/.test(xml)) return xml;
  return xml.replace(/<application\b/, '<application\n        android:icon="@mipmap/ic_launcher"\n        android:roundIcon="@mipmap/ic_launcher_round"');
}

export const makeIcons = defineTool({
  name: "make_icons",
  description:
    "Turn one square logo (SVG or PNG) into every icon an app needs. kinds: android (launcher icons in every density, adaptive icon, Play Store 512px), pwa (192/512/maskable/apple-touch), favicon (favicon.ico, 16 and 32px), windows (app.ico up to 256px). Writes the files and says how to wire them in.",
  schema: z.object({
    source: z.string().describe("The logo file in the project, ideally an SVG"),
    kinds: z.array(z.enum(["android", "pwa", "favicon", "windows"])).min(1).describe("Which icon sets to make"),
    background: z.string().optional().describe("Fill behind the logo for launcher, maskable and round icons, e.g. #1e293b; default white"),
  }),
  risk: "write",
  preview: (a) => `make ${a.kinds.join(", ")} icons from ${a.source}`,
  async run({ source, kinds, background = "#ffffff" }, { cwd }) {
    const browser = findBrowser();
    if (!browser) return NO_BROWSER;
    const src = inside(cwd, source);
    const mime = MIME[extname(src).toLowerCase()];
    if (!mime) return `error: ${source} is not an SVG, PNG, JPEG, WebP or GIF`;
    if (!existsSync(src)) return `error: ${source} does not exist`;
    let bytes = await readFile(src);
    // SVGs without a size draw at 0x0 or 150x150; give them the viewBox's.
    if (mime === "image/svg+xml") bytes = Buffer.from(sizedSvg(bytes.toString("utf8")));
    const dataUrl = `data:${mime};base64,${Buffer.from(bytes).toString("base64")}`;
    const res = kinds.includes("android") ? androidResDir(cwd) : null;
    const plan = iconPlan(kinds, res);
    const icoSizes = [...(kinds.includes("favicon") ? [16, 32, 48] : []), ...(kinds.includes("windows") ? [16, 24, 32, 48, 64, 128, 256] : [])];
    const icoSpecs = [...new Set(icoSizes)].map((size) => ({ size }));
    let pngs: string[];
    try {
      pngs = await evaluate<string[]>(browser, drawScript(dataUrl, [...plan, ...icoSpecs], background), { timeoutMs: 40_000 });
    } catch (e) {
      return `error: could not draw ${source}: ${(e as Error).message}`;
    }
    const written: string[] = [];
    const put = async (file: string, data: Uint8Array | string) => {
      const abs = inside(cwd, file);
      await mkdir(dirname(abs), { recursive: true });
      await writeFile(abs, data);
      written.push(file);
    };
    for (const [i, s] of plan.entries()) await put(s.file, Buffer.from(pngs[i]!, "base64"));
    const ico = (sizes: number[]) => buildIco(sizes.map((size) => ({ size, data: Buffer.from(pngs[plan.length + icoSpecs.findIndex((x) => x.size === size)]!, "base64") })));
    if (kinds.includes("favicon")) await put("favicon.ico", ico([16, 32, 48]));
    if (kinds.includes("windows")) await put("icons/app.ico", ico([16, 24, 32, 48, 64, 128, 256]));

    const how: string[] = [];
    if (kinds.includes("android")) {
      const r = res ?? "icons/android";
      const color = existingColorClash(cwd, r) ? "maxx_icon_background" : "ic_launcher_background";
      await put(`${r}/values/${color}.xml`, `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="${color}">${background}</color>\n</resources>\n`);
      const adaptive = `<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n    <background android:drawable="@color/${color}"/>\n    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>\n</adaptive-icon>\n`;
      await put(`${r}/mipmap-anydpi-v26/ic_launcher.xml`, adaptive);
      await put(`${r}/mipmap-anydpi-v26/ic_launcher_round.xml`, adaptive);
      const manifest = res ? join(cwd, dirname(res), "AndroidManifest.xml") : "";
      if (manifest && existsSync(manifest)) {
        const xml = await readFile(manifest, "utf8");
        const next = withManifestIcons(xml);
        if (next !== xml) {
          await writeFile(manifest, next);
          written.push(relative(cwd, manifest).replaceAll("\\", "/"));
        }
        how.push("Android: icons are in the res folders and the manifest uses @mipmap/ic_launcher. Rebuild the app to see them.");
      } else how.push("Android: copy icons/android/* into app/src/main/res and set android:icon=\"@mipmap/ic_launcher\" android:roundIcon=\"@mipmap/ic_launcher_round\" on <application>.");
    }
    if (kinds.includes("pwa"))
      how.push('PWA: in manifest.webmanifest, "icons": [{"src":"icons/icon-192.png","sizes":"192x192","type":"image/png"},{"src":"icons/icon-512.png","sizes":"512x512","type":"image/png"},{"src":"icons/maskable-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"}], and <link rel="apple-touch-icon" href="icons/apple-touch-icon.png"> in the head.');
    if (kinds.includes("favicon")) how.push('Favicon: <link rel="icon" href="favicon.ico" sizes="any"> and <link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png"> in the head.');
    if (kinds.includes("windows")) how.push("Windows: icons/app.ico has 16 to 256px; use it for the exe or the shortcut.");
    return `wrote ${written.length} files:\n${written.map((f) => `- ${f}`).join("\n")}\n\n${how.join("\n")}`;
  },
});

function existingColorClash(cwd: string, res: string): boolean {
  const dir = join(cwd, res, "values");
  if (!existsSync(dir)) return false;
  return readdirSync(dir).some((f) => f !== "ic_launcher_background.xml" && f.endsWith(".xml") && /name="ic_launcher_background"/.test(readFileSync(join(dir, f), "utf8")));
}

export function sizedSvg(svg: string): string {
  const open = /<svg\b[^>]*>/i.exec(svg);
  if (!open || /\swidth=/.test(open[0])) return svg;
  const vb = /viewBox=["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(open[0]);
  const [w, h] = vb ? [Number(vb[1]), Number(vb[2])] : [512, 512];
  const k = 1024 / Math.max(w, h);
  return svg.replace(open[0], open[0].replace(/<svg\b/i, `<svg width="${Math.round(w * k)}" height="${Math.round(h * k)}"`));
}

export const STUDIO_TOOLS = [snapPage, makeIcons];
export const STUDIO_PROMPT =
  "Studio tools: after changing how a web page looks, call snap_page and look at the screenshots and console errors before saying it is done. For app icons, write one square logo.svg and call make_icons instead of drawing icon files by hand.";
