import { z } from "zod";
import { defineTool, type ToolResult } from "./types.ts";
import { findBrowser } from "../judge.ts";
import { openPage, type Page } from "../browser.ts";
import { toShot, decodePng, type Mark, type Shot } from "../image.ts";
import { pageUrl } from "./studio.ts";

// Browser hands: Maxx drives a real browser page the way it drives the phone.
// Each look returns a screenshot with numbered boxes on the things that can be
// clicked, plus the same list as text, so a model without vision still knows
// what is there. The page stays open between calls. With MAXX_BROWSER_HEADED=1
// the window is visible, so you can watch Maxx test your app.

type El = { n: number; tag: string; label: string; x1: number; y1: number; x2: number; y2: number };
type Session = { page: Page; url: string; els: El[]; shot?: Shot; seenLogs: number; width: number; height: number };
let live: Session | null = null;

const NO_BROWSER = "error: no Edge or Chrome found. Install Microsoft Edge or Google Chrome, or set MAXX_BROWSER to its path.";

// Runs in the page: every visible thing a user could click or type into.
export const COLLECT = `(() => {
  const sel = 'a[href],button,input,select,textarea,summary,label[for],[role=button],[role=link],[role=tab],[role=checkbox],[role=menuitem],[onclick],[tabindex]:not([tabindex="-1"]),canvas,[contenteditable=true]';
  const out = [];
  const seen = new Set();
  for (const e of document.querySelectorAll(sel)) {
    if (seen.has(e)) continue;
    seen.add(e);
    const r = e.getBoundingClientRect();
    const st = getComputedStyle(e);
    if (r.width < 4 || r.height < 4 || st.visibility === "hidden" || st.display === "none" || +st.opacity === 0) continue;
    if (r.bottom < 0 || r.right < 0 || r.top > innerHeight || r.left > innerWidth) continue;
    const t = e.tagName.toLowerCase();
    const kind = t === "input" ? "input[" + (e.type || "text") + "]" : (e.getAttribute("role") || t);
    const own = e.labels && e.labels[0] ? e.labels[0].innerText : "";
    let label = (e.getAttribute("aria-label") || own || e.innerText || e.value || e.placeholder || e.title || e.alt || e.name || (t === "canvas" ? r.width + "x" + r.height + " canvas" : "")).trim().replace(/\\s+/g, " ").slice(0, 60);
    if (t === "input" && e.placeholder && !e.value) label = 'placeholder "' + e.placeholder.slice(0, 40) + '"';
    if (t === "input" && (e.type === "checkbox" || e.type === "radio")) label += e.checked ? " (checked)" : " (unchecked)";
    out.push({ n: out.length + 1, tag: kind, label, x1: Math.round(r.left), y1: Math.round(r.top), x2: Math.round(r.right), y2: Math.round(r.bottom) });
    if (out.length >= 60) break;
  }
  return out;
})()`;

export function elementList(els: El[]): string {
  if (!els.length) return "No clickable elements are visible (scroll, or click by x,y).";
  return els.map((e) => `${e.n} ${e.tag}${!e.label ? "" : e.label.startsWith("placeholder ") ? ` ${e.label}` : ` "${e.label}"`}`).join("\n");
}

async function session(width = 1280, height = 800): Promise<Session | string> {
  if (live) return live;
  const browser = findBrowser();
  if (!browser) return NO_BROWSER;
  const page = await openPage(browser, { width, height, headed: process.env.MAXX_BROWSER_HEADED === "1" });
  live = { page, url: "about:blank", els: [], seenLogs: 0, width, height };
  return live;
}

export async function closeBrowser() {
  const s = live;
  live = null;
  await s?.page.close();
}

async function look(s: Session, note: string, settleMs = 400): Promise<ToolResult> {
  await Bun.sleep(settleMs);
  const r = await s.page.call("Runtime.evaluate", { expression: COLLECT, returnByValue: true });
  s.els = (r.result?.value ?? []) as El[];
  const info = await s.page.call("Runtime.evaluate", { expression: "JSON.stringify({u: location.href, t: document.title, y: Math.round(scrollY), h: document.documentElement.scrollHeight})", returnByValue: true });
  const i = JSON.parse(info.result.value);
  s.url = i.u;
  const png = await s.page.call("Page.captureScreenshot", { format: "png" });
  const marks: Mark[] = s.els.map((e) => ({ n: e.n, bounds: { x1: e.x1, y1: e.y1, x2: e.x2, y2: e.y2 } }));
  s.shot = toShot(decodePng(Uint8Array.from(Buffer.from(png.data, "base64"))), { maxSide: 1100, quality: 70, marks });
  const fresh = s.page.logs.slice(s.seenLogs);
  s.seenLogs = s.page.logs.length;
  const where = `${i.t ? `"${i.t}" ` : ""}${i.u}${i.h > s.height ? ` (scrolled to ${i.y} of ${i.h}px)` : ""}`;
  const logs = fresh.length ? `\nconsole since last look:\n${fresh.slice(-15).map((l) => `- ${l}`).join("\n")}` : "";
  return { text: `${note}\n${where}\nelements:\n${elementList(s.els)}${logs}`, images: [s.shot], glance: true };
}

function point(s: Session, a: { element?: number; x?: number; y?: number }): { x: number; y: number; what: string } {
  if (a.element !== undefined) {
    const e = s.els.find((x) => x.n === a.element);
    if (!e) throw new Error(`no element ${a.element} in the last look; call browser_look again`);
    return { x: (e.x1 + e.x2) / 2, y: (e.y1 + e.y2) / 2, what: `${e.n} ${e.tag}${e.label ? ` "${e.label}"` : ""}` };
  }
  if (a.x !== undefined && a.y !== undefined) {
    const k = s.shot?.scale ?? 1;
    return { x: a.x * k, y: a.y * k, what: `${a.x},${a.y}` };
  }
  throw new Error("give element (a number from the last look) or x and y");
}

const KEYS: Record<string, [string, number]> = {
  enter: ["Enter", 13], escape: ["Escape", 27], esc: ["Escape", 27], tab: ["Tab", 9], space: [" ", 32], backspace: ["Backspace", 8], delete: ["Delete", 46],
  arrowup: ["ArrowUp", 38], up: ["ArrowUp", 38], arrowdown: ["ArrowDown", 40], down: ["ArrowDown", 40], arrowleft: ["ArrowLeft", 37], left: ["ArrowLeft", 37], arrowright: ["ArrowRight", 39], right: ["ArrowRight", 39],
  home: ["Home", 36], end: ["End", 35], pageup: ["PageUp", 33], pagedown: ["PageDown", 34], shift: ["Shift", 16], control: ["Control", 17], ctrl: ["Control", 17], alt: ["Alt", 18],
};

export function keyEvent(name: string): { key: string; code: string; windowsVirtualKeyCode: number; text?: string } {
  const k = KEYS[name.toLowerCase().replace(/\s+/g, "")];
  if (k) return { key: k[0], code: k[0] === " " ? "Space" : k[0], windowsVirtualKeyCode: k[1], ...(k[0] === "Enter" ? { text: "\r" } : k[0] === " " ? { text: " " } : {}) };
  if (/^[a-z0-9]$/i.test(name)) return { key: name, code: /\d/.test(name) ? `Digit${name}` : `Key${name.toUpperCase()}`, windowsVirtualKeyCode: name.toUpperCase().charCodeAt(0), text: name };
  if (/^f([1-9]|1[0-2])$/i.test(name)) return { key: name.toUpperCase(), code: name.toUpperCase(), windowsVirtualKeyCode: 111 + Number(name.slice(1)) };
  throw new Error(`unknown key "${name}"; use enter, escape, tab, space, arrow keys, a letter or a digit`);
}

async function press(page: Page, name: string, holdMs = 0) {
  const ev = keyEvent(name);
  await page.call("Input.dispatchKeyEvent", { type: ev.text ? "keyDown" : "rawKeyDown", ...ev });
  if (holdMs) await Bun.sleep(holdMs);
  await page.call("Input.dispatchKeyEvent", { type: "keyUp", key: ev.key, code: ev.code, windowsVirtualKeyCode: ev.windowsVirtualKeyCode });
}

async function click(page: Page, x: number, y: number, count = 1) {
  await page.call("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
  for (let c = 1; c <= count; c++) {
    await page.call("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: c });
    await page.call("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: c });
  }
}

const fail = (e: unknown) => `error: ${(e as Error).message}`;

export const browserOpen = defineTool({
  name: "browser_open",
  description:
    "Open a page in Maxx's own browser and look at it: a screenshot with numbered boxes on everything clickable, the same list as text, and console output. target is a project file (index.html) or a URL such as http://localhost:5173. The page stays open for browser_act.",
  schema: z.object({
    target: z.string().optional().describe("Project HTML file or URL; default index.html"),
    size: z.enum(["phone", "desktop"]).optional().describe("Window size, default desktop"),
  }),
  risk: "exec",
  checkpoint: false,
  ruleKey: () => "open",
  preview: (a) => `open ${a.target ?? "index.html"} in Maxx's browser`,
  async run({ target, size }, ctx) {
    try {
      const url = await pageUrl(ctx.cwd, target, ctx.network);
      const [w, h] = size === "phone" ? [412, 860] : [1280, 800];
      if (live && (live.width !== w || live.height !== h)) await closeBrowser();
      const s = await session(w, h);
      if (typeof s === "string") return s;
      const load = s.page.loaded();
      await s.page.call("Page.navigate", { url });
      await load;
      return await look(s, `opened ${url}`, 600);
    } catch (e) {
      return fail(e);
    }
  },
});

export const browserAct = defineTool({
  name: "browser_act",
  description:
    "Do something on the open page, then look again. action: click (element number, or x,y), type (text into element, or the focused field; enter: true submits), key (a key like enter, escape, space, arrowleft; hold_ms holds it, for games), scroll (down/up), back, reload, wait (ms).",
  schema: z.object({
    action: z.enum(["click", "double_click", "type", "key", "scroll", "back", "reload", "wait"]),
    element: z.number().int().optional().describe("Element number from the last look"),
    x: z.number().optional().describe("Or x in screenshot pixels"),
    y: z.number().optional().describe("Or y in screenshot pixels"),
    text: z.string().optional().describe("type: the text. scroll: up or down"),
    key: z.string().optional().describe("key: the key name"),
    enter: z.boolean().optional().describe("type: press Enter after"),
    hold_ms: z.number().int().min(0).max(5000).optional().describe("key: hold it this long. wait: how long"),
  }),
  risk: "exec",
  checkpoint: false,
  ruleKey: () => "act",
  preview: (a) => `${a.action}${a.element !== undefined ? ` element ${a.element}` : a.x !== undefined ? ` at ${a.x},${a.y}` : ""}${a.text ? ` ${JSON.stringify(a.text.slice(0, 80))}` : ""}${a.key ? ` ${a.key}` : ""}`,
  async run(a) {
    if (!live) return "error: no page is open; call browser_open first";
    const s = live;
    try {
      let did = "";
      switch (a.action) {
        case "click":
        case "double_click": {
          const p = point(s, a);
          await click(s.page, p.x, p.y, a.action === "double_click" ? 2 : 1);
          did = `${a.action === "double_click" ? "double-clicked" : "clicked"} ${p.what}`;
          break;
        }
        case "type": {
          if (a.text === undefined) return "error: type needs text";
          if (a.element !== undefined || a.x !== undefined) {
            const p = point(s, a);
            await click(s.page, p.x, p.y);
            // Replace what is there, like a person selecting the field first.
            await s.page.call("Runtime.evaluate", { expression: "document.activeElement && 'value' in document.activeElement && document.activeElement.select && document.activeElement.select()" });
          }
          await s.page.call("Input.insertText", { text: a.text });
          if (a.enter) await press(s.page, "enter");
          did = `typed ${JSON.stringify(a.text.slice(0, 60))}${a.enter ? " and pressed Enter" : ""}`;
          break;
        }
        case "key":
          if (!a.key) return "error: key needs key";
          await press(s.page, a.key, a.hold_ms ?? 0);
          did = `pressed ${a.key}${a.hold_ms ? ` for ${a.hold_ms}ms` : ""}`;
          break;
        case "scroll": {
          const up = /up/i.test(a.text ?? "");
          const p = a.element !== undefined || a.x !== undefined ? point(s, a) : { x: s.width / 2, y: s.height / 2 };
          await s.page.call("Input.dispatchMouseEvent", { type: "mouseWheel", x: p.x, y: p.y, deltaX: 0, deltaY: up ? -600 : 600 });
          did = `scrolled ${up ? "up" : "down"}`;
          break;
        }
        case "back":
          await s.page.call("Runtime.evaluate", { expression: "history.back()" });
          did = "went back";
          break;
        case "reload": {
          const load = s.page.loaded();
          await s.page.call("Page.reload", { ignoreCache: true });
          await load;
          did = "reloaded";
          break;
        }
        case "wait":
          await Bun.sleep(a.hold_ms ?? 1000);
          did = `waited ${a.hold_ms ?? 1000}ms`;
          break;
      }
      return await look(s, did);
    } catch (e) {
      return fail(e);
    }
  },
});

export const browserLook = defineTool({
  name: "browser_look",
  description: "Look at the open page again: screenshot with numbered elements, the element list and new console output.",
  schema: z.object({}),
  risk: "read",
  checkpoint: false,
  async run() {
    if (!live) return "error: no page is open; call browser_open first";
    try {
      return await look(live, "looked", 100);
    } catch (e) {
      return fail(e);
    }
  },
});

export const browserEval = defineTool({
  name: "browser_eval",
  description: "Run JavaScript in the open page and return the result as JSON, e.g. to read app state (game.score), localStorage, or check a value the screen does not show.",
  schema: z.object({ js: z.string().describe("An expression; await works") }),
  risk: "exec",
  checkpoint: false,
  ruleKey: () => "eval",
  preview: (a) => `run in the page: ${a.js.slice(0, 200)}`,
  async run({ js }) {
    if (!live) return "error: no page is open; call browser_open first";
    try {
      const r = await live.page.call("Runtime.evaluate", { expression: `(async () => (${js}))()`, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) return `error: ${r.exceptionDetails.exception?.description?.split("\n")[0] ?? r.exceptionDetails.text}`;
      const v = r.result.value;
      const text = v === undefined ? "undefined" : JSON.stringify(v, null, 1);
      return text.length > 4000 ? text.slice(0, 4000) + "\n... (cut)" : text;
    } catch (e) {
      return fail(e);
    }
  },
});
