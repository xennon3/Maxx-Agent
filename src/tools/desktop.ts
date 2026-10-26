import { z } from "zod";
import { defineTool, type ToolResult } from "./types.ts";
import { sleep } from "../devices/run.ts";
import * as W from "../devices/windows.ts";

// Computer use on the Windows desktop. Coordinates are screenshot pixels;
// the user can stop everything by moving the mouse to the top-left corner.

const shot = z.boolean().optional().describe("Return a new screenshot after the action (default true)");
const NO_CKPT = { checkpoint: false } as const;

async function observe(note: string, screenshot = true, settleMs = 500, glance = true): Promise<ToolResult> {
  if (!screenshot) return note;
  await sleep(settleMs);
  const l = await W.look();
  return { text: `${note}\n\n${l.text}`, images: [l.shot], glance };
}

async function ensureScale() {
  if (!W.desktop.seen) await W.look({ elements: false });
}

export const desktopScreenshot = defineTool({
  name: "desktop_screenshot",
  description: "Screenshot the Windows desktop with numbered boxes on the foreground window's controls, plus the element list. Use zoom to read small text.",
  schema: z.object({
    marks: z.boolean().optional().describe("Draw numbered element boxes (default true)"),
    zoom: z.string().optional().describe('Region "x1,y1,x2,y2" of the last screenshot to show at full resolution'),
  }),
  risk: "exec",
  ...NO_CKPT,
  ruleKey: () => "screen",
  preview: (a) => (a.zoom ? `zoom into ${a.zoom}` : "take a screenshot of your screen"),
  async run({ marks, zoom }) {
    if (zoom) {
      const l = await W.look({ elements: false, marks: false });
      const img = W.desktop.zoom(l.png, zoom);
      return { text: `zoomed region ${zoom} (${img.width}x${img.height}); coordinates in it are not screenshot coordinates.`, images: [img] };
    }
    const l = await W.look({ marks });
    return { text: l.text, images: [l.shot] };
  },
});

export const desktopClick = defineTool({
  name: "desktop_click",
  description: "Click an element by its number from the last screenshot, by its name, or at x,y. Set to_x/to_y to drag instead. Returns a new screenshot.",
  schema: z.object({
    element: z.number().int().optional().describe("Element number from the last screenshot (preferred)"),
    text: z.string().optional().describe("Or: the element's name"),
    x: z.number().optional().describe("Or: x in screenshot pixels"),
    y: z.number().optional().describe("Or: y in screenshot pixels"),
    button: z.enum(["left", "right", "middle"]).optional(),
    double: z.boolean().optional(),
    to_x: z.number().optional().describe("Drag to this x"),
    to_y: z.number().optional().describe("Drag to this y"),
    screenshot: shot,
  }),
  risk: "exec",
  ...NO_CKPT,
  ruleKey: () => "click",
  preview: (a) => `${a.to_x !== undefined ? "drag from" : a.double ? "double-click" : `${a.button ?? "left"}-click`} ${a.element !== undefined ? `element ${a.element}` : a.text ?? `${a.x},${a.y}`}${a.to_x !== undefined ? ` to ${a.to_x},${a.to_y}` : ""}`,
  async run(a) {
    await ensureScale();
    const p = W.desktop.point(a);
    if (a.to_x !== undefined && a.to_y !== undefined) {
      const to = W.desktop.toScreen({ x: a.to_x, y: a.to_y });
      await W.winAct("drag", { x: p.x, y: p.y, x2: to.x, y2: to.y }, `drag ${p.what}`);
      return observe(`dragged ${p.what} to ${a.to_x},${a.to_y}`, a.screenshot);
    }
    await W.winAct("click", { x: p.x, y: p.y, button: a.button ?? "left", count: a.double ? 2 : 1 }, `click ${p.what}`);
    return observe(`${a.double ? "double-clicked" : "clicked"} ${p.what}`, a.screenshot);
  },
});

export const desktopType = defineTool({
  name: "desktop_type",
  description: "Type text into the focused window (any language; \\n presses Enter).",
  schema: z.object({ text: z.string(), submit: z.boolean().optional().describe("Press Enter afterwards"), screenshot: shot }),
  risk: "exec",
  ...NO_CKPT,
  ruleKey: () => "type",
  preview: (a) => `type ${JSON.stringify(a.text.length > 200 ? a.text.slice(0, 200) + "…" : a.text)}${a.submit ? " + Enter" : ""}`,
  async run(a) {
    await W.winAct("type", { text: a.text + (a.submit ? "\n" : "") }, "type");
    return observe(`typed ${a.text.length} characters${a.submit ? " and pressed Enter" : ""}`, a.screenshot);
  },
});

export const desktopKey = defineTool({
  name: "desktop_key",
  description: 'Press a key or shortcut, e.g. "enter", "ctrl+s", "alt+tab", "win+r", "ctrl+shift+esc", "f5".',
  schema: z.object({ keys: z.string(), screenshot: shot }),
  risk: "exec",
  ...NO_CKPT,
  ruleKey: (a) => a.keys.toLowerCase(),
  preview: (a) => `press ${a.keys}`,
  async run({ keys, screenshot }) {
    const vks = W.parseKeys(keys);
    await W.winAct("keys", { vks }, `keys ${keys}`);
    return observe(`pressed ${keys}`, screenshot);
  },
});

export const desktopScroll = defineTool({
  name: "desktop_scroll",
  description: "Scroll with the mouse wheel, over an element or point if given (otherwise wherever the mouse is).",
  schema: z.object({
    direction: z.enum(["up", "down", "left", "right"]),
    amount: z.number().int().min(1).max(30).optional().describe("Wheel notches, default 5"),
    element: z.number().int().optional(),
    x: z.number().optional(),
    y: z.number().optional(),
    screenshot: shot,
  }),
  risk: "exec",
  ...NO_CKPT,
  ruleKey: () => "scroll",
  preview: (a) => `scroll ${a.direction} ${a.amount ?? 5}`,
  async run(a) {
    await ensureScale();
    const at = a.element !== undefined || a.x !== undefined ? W.desktop.point(a) : null;
    const n = (a.amount ?? 5) * 120;
    const delta = a.direction === "up" || a.direction === "right" ? n : -n;
    await W.winAct("scroll", { ...(at ? { x: at.x, y: at.y } : {}), delta, horizontal: a.direction === "left" || a.direction === "right" }, `scroll ${a.direction}`);
    return observe(`scrolled ${a.direction}`, a.screenshot);
  },
});

export const desktopOpen = defineTool({
  name: "desktop_open",
  description: "Open a program, file, folder or URL with Windows (like the Run box): notepad, calc, ms-settings:, https://..., C:/path/file.txt.",
  schema: z.object({ target: z.string(), wait: z.number().min(0).max(30).optional().describe("Seconds before the screenshot, default 2"), screenshot: shot }),
  risk: "exec",
  ...NO_CKPT,
  ruleKey: (a) => a.target,
  preview: (a) => `open ${a.target}`,
  async run(a) {
    await W.winAct("open", { target: a.target }, `open ${a.target}`);
    return observe(`opened ${a.target}`, a.screenshot, (a.wait ?? 2) * 1000);
  },
});

export const DESKTOP_TOOLS = [desktopScreenshot, desktopClick, desktopType, desktopKey, desktopScroll, desktopOpen];

export const DESKTOP_PROMPT = `Desktop tools are enabled: you can see and control the user's Windows desktop.
- Start with desktop_screenshot. Prefer element numbers from the latest screenshot; use x,y (screenshot pixels) only when the thing has no number.
- Every action returns a new screenshot. Check it before the next step; if a window did not appear, wait or try another way instead of repeating blindly.
- Prefer keyboard shortcuts and desktop_open over long chains of clicks.
- If a result says STOPPED (failsafe), stop all desktop actions and ask the user.
- Never enter passwords, payment details or send messages unless the user explicitly asked in this conversation.`;
