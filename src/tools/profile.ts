import { z } from "zod";
import { defineTool } from "./types.ts";
import { findBrowser } from "../judge.ts";
import { openPage } from "../browser.ts";
import { pageUrl } from "./studio.ts";

// profile_page: "make it faster" turns into a short list. Loads the page in a
// fresh headless browser, records load timing, layout shifts, long tasks,
// the heaviest files and (for games and animations) the frame rate, then
// names the three worst problems with what to do about each.

// Installed before any page script runs, so it sees the whole load.
const OBSERVE = `window.__maxx = { lcp: 0, cls: 0, long: [] };
try { new PerformanceObserver((l) => { for (const e of l.getEntries()) __maxx.lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true }); } catch {}
try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) __maxx.cls += e.value; }).observe({ type: "layout-shift", buffered: true }); } catch {}
try { new PerformanceObserver((l) => { for (const e of l.getEntries()) __maxx.long.push(Math.round(e.duration)); }).observe({ type: "longtask", buffered: true }); } catch {}`;

const MEASURE = (sampleMs: number) => `(async () => {
  const nav = performance.getEntriesByType("navigation")[0] || {};
  const fcp = (performance.getEntriesByName("first-contentful-paint")[0] || {}).startTime || 0;
  let frames = 0, worst = 0, last = performance.now();
  await new Promise((done) => { const end = last + ${sampleMs}; const tick = (t) => { frames++; worst = Math.max(worst, t - last); last = t; t < end ? requestAnimationFrame(tick) : done(); }; requestAnimationFrame(tick); });
  const res = performance.getEntriesByType("resource").map((r) => ({ name: r.name.split("/").pop().split("?")[0] || r.name, kind: r.initiatorType, kb: Math.round((r.transferSize || r.encodedBodySize || 0) / 1024), ms: Math.round(r.duration) }));
  return {
    load: Math.round(nav.loadEventEnd || 0), dcl: Math.round(nav.domContentLoadedEventEnd || 0), fcp: Math.round(fcp), lcp: Math.round(__maxx.lcp), cls: +__maxx.cls.toFixed(3),
    long: __maxx.long, fps: Math.round(frames / (${sampleMs} / 1000)), worstFrame: Math.round(worst),
    dom: document.getElementsByTagName("*").length, heapMb: performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : null,
    totalKb: res.reduce((n, r) => n + r.kb, 0) + Math.round((nav.transferSize || nav.encodedBodySize || 0) / 1024),
    heavy: res.sort((a, b) => b.kb - a.kb).slice(0, 5), slow: [...res].sort((a, b) => b.ms - a.ms).slice(0, 3), count: res.length,
    images: [...document.images].filter((i) => i.naturalWidth > 2 * i.clientWidth && i.clientWidth > 0).map((i) => ({ name: (i.currentSrc || i.src).split("/").pop().slice(0, 40), natural: i.naturalWidth, shown: i.clientWidth })).slice(0, 3),
  };
})()`;

export type Metrics = {
  load: number; dcl: number; fcp: number; lcp: number; cls: number; long: number[]; fps: number; worstFrame: number;
  dom: number; heapMb: number | null; totalKb: number; heavy: { name: string; kind: string; kb: number; ms: number }[]; slow: { name: string; ms: number }[]; count: number;
  images: { name: string; natural: number; shown: number }[];
};

// The problems, worst first, each with a fix a model can act on.
export function diagnose(m: Metrics, animated: boolean): string[] {
  const out: [number, string][] = [];
  const blocking = m.long.reduce((n, d) => n + Math.max(0, d - 50), 0);
  if (m.lcp > 2500) out.push([m.lcp / 2500, `Main content shows late (largest paint at ${m.lcp} ms, aim under 2500). Make the biggest image or heading load first: smaller image, preload it, no script needed to show it.`]);
  else if (m.fcp > 1800) out.push([m.fcp / 1800, `First paint is slow (${m.fcp} ms, aim under 1800). Move scripts to the end of the body or add defer, and inline the CSS the first screen needs.`]);
  if (blocking > 200) out.push([blocking / 200, `JavaScript blocks the page for ${blocking} ms in ${m.long.length} long task(s) (longest ${Math.max(...m.long)} ms). Split the work, run it after the first paint, or cache results.`]);
  if (m.cls > 0.1) out.push([m.cls / 0.1, `Things jump around while loading (layout shift ${m.cls}, aim under 0.1). Give images and ads a width and height, and reserve space for late content.`]);
  if (animated && m.fps < 50) out.push([60 / Math.max(1, m.fps), `Animation runs at ${m.fps} fps (worst frame ${m.worstFrame} ms). Draw less per frame: cache static layers on an offscreen canvas, avoid creating objects in the loop, and don't read layout (offsetWidth) every frame.`]);
  if (m.totalKb > 2048) out.push([m.totalKb / 2048, `The page downloads ${(m.totalKb / 1024).toFixed(1)} MB. Heaviest: ${m.heavy.slice(0, 3).map((h) => `${h.name} ${h.kb} KB`).join(", ")}. Compress images (WebP), and drop unused libraries.`]);
  for (const h of m.heavy) if (h.kb > 400 && h.kind === "img") out.push([h.kb / 400, `${h.name} is ${h.kb} KB. Resize it to the size it is shown at and save as WebP or JPEG at 80%.`]);
  for (const i of m.images) out.push([1.1, `${i.name} is ${i.natural}px wide but shown at ${i.shown}px. Resize it.`]);
  if (m.dom > 1500) out.push([m.dom / 1500, `The page has ${m.dom} elements (aim under 1500). Render long lists in pages or only what is on screen.`]);
  if (m.heapMb && m.heapMb > 150) out.push([m.heapMb / 150, `JavaScript uses ${m.heapMb} MB of memory. Look for arrays or caches that only grow.`]);
  return out.sort((a, b) => b[0] - a[0]).map(([, t]) => t);
}

export const profilePage = defineTool({
  name: "profile_page",
  description:
    "Measure how fast a web page or game is: load and paint times, layout shifts, long JavaScript tasks, frame rate, heaviest files. Returns the numbers and the top 3 problems with what to fix. target is a project file or a localhost URL.",
  schema: z.object({
    target: z.string().optional().describe("Project HTML file or URL; default index.html"),
    animated: z.boolean().optional().describe("A game or animation: judge the frame rate too (default: guessed from a canvas)"),
    size: z.enum(["phone", "desktop"]).optional(),
  }),
  risk: "read",
  checkpoint: false,
  async run({ target, animated, size }, ctx) {
    const browser = findBrowser();
    if (!browser) return "error: no Edge or Chrome found. Install one, or set MAXX_BROWSER.";
    let url: string;
    try {
      url = await pageUrl(ctx.cwd, target, ctx.network);
    } catch (e) {
      return `error: ${(e as Error).message}`;
    }
    const page = await openPage(browser, size === "phone" ? { width: 412, height: 860 } : { width: 1366, height: 860 });
    try {
      await page.call("Page.addScriptToEvaluateOnNewDocument", { source: OBSERVE });
      // A phone-like CPU on phone size, so a fast PC does not hide the problems.
      if (size === "phone") await page.call("Emulation.setCPUThrottlingRate", { rate: 4 });
      const load = page.loaded(15_000);
      await page.call("Page.navigate", { url });
      await load;
      await Bun.sleep(1200);
      const canvas = (await page.call("Runtime.evaluate", { expression: "!!document.querySelector('canvas')", returnByValue: true })).result.value;
      const anim = animated ?? canvas;
      const r = await page.call("Runtime.evaluate", { expression: MEASURE(anim ? 3000 : 1000), awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) return `error measuring: ${r.exceptionDetails.text}`;
      const m = r.result.value as Metrics;
      const problems = diagnose(m, anim);
      const lines = [
        `${url}${size === "phone" ? " (phone size, CPU slowed 4x like a mid-range phone)" : ""}`,
        `load ${m.load} ms · first paint ${m.fcp} ms · largest paint ${m.lcp || "n/a"} ms · layout shift ${m.cls}`,
        `long tasks ${m.long.length}${m.long.length ? ` (longest ${Math.max(...m.long)} ms)` : ""} · ${anim ? `${m.fps} fps, worst frame ${m.worstFrame} ms · ` : ""}${m.dom} elements${m.heapMb ? ` · ${m.heapMb} MB JS memory` : ""}`,
        `${m.count + 1} files, ${m.totalKb} KB${m.heavy.length ? `; heaviest: ${m.heavy.slice(0, 3).map((h) => `${h.name} ${h.kb} KB`).join(", ")}` : ""}`,
        ...(page.errors.length ? [`console errors: ${page.errors.slice(0, 3).join(" | ")}`] : []),
        "",
        problems.length ? `Top problems:\n${problems.slice(0, 3).map((p, i) => `${i + 1}. ${p}`).join("\n")}` : "No problems found: it loads fast and runs smoothly.",
      ];
      return lines.join("\n");
    } catch (e) {
      return `error: ${(e as Error).message}`;
    } finally {
      await page.close();
    }
  },
});
