import { openPage } from "./browser.ts";

// The ugliness alarm. Loads a page at phone and desktop size and looks for the
// design crimes a screenshot judge misses or a small model never checks: text
// that can't be read against its background, tap targets too small for a
// thumb, text cut off or spilling out, a page wider than the phone, tiny
// type, colours that vibrate against each other, broken images, and buttons
// on top of each other. All measured from the page itself, so it needs no
// vision model and gives the same answer every time.

export type Crime = { kind: "contrast" | "tap" | "overflow" | "wide" | "tiny-text" | "clash" | "broken-image" | "overlap" | "error"; where: string; detail: string; size: "phone" | "desktop" };

// Runs in the page: returns the crimes it can see at this size.
export const AUDIT = String.raw`(() => {
  const out = [];
  // The screen's width: a page wider than a phone stretches innerWidth to fit, so it is passed in.
  const W = window.__maxxW || innerWidth;
  const parse = (s) => { const m = /rgba?\(([^)]+)\)/.exec(s || ""); if (!m) return null; const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const lum = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const hex = (c) => "#" + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
  const blend = (top, under) => ({ r: top.r * top.a + under.r * (1 - top.a), g: top.g * top.a + under.g * (1 - top.a), b: top.b * top.a + under.b * (1 - top.a), a: 1 });
  const hsl = (c) => { const r = c.r / 255, g = c.g / 255, b = c.b / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn; if (!d) return { h: 0, s: 0, l }; const s = d / (1 - Math.abs(2 * l - 1)); let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return { h: (h * 60 + 360) % 360, s, l }; };
  const name = (e) => { const t = (e.innerText || e.value || e.getAttribute("aria-label") || e.alt || "").trim().replace(/\s+/g, " ").slice(0, 40); return e.tagName.toLowerCase() + (e.id ? "#" + e.id : e.classList.length ? "." + [...e.classList].slice(0, 2).join(".") : "") + (t ? ' "' + t + '"' : ""); };
  const visible = (e) => { const r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return null; const s = getComputedStyle(e); if (s.visibility === "hidden" || s.display === "none" || +s.opacity === 0) return null; return r; };
  // The colour behind an element: walk up until something paints a background.
  const behind = (e) => {
    let stack = [];
    for (let n = e; n; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.backgroundImage && s.backgroundImage !== "none") return null; // a picture or gradient: can't judge
      const c = parse(s.backgroundColor);
      if (c && c.a > 0) { stack.push(c); if (c.a >= 1) break; }
    }
    let base = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = stack.length - 1; i >= 0; i--) base = blend(stack[i], base);
    return base;
  };
  const seen = new Set();
  const add = (kind, e, detail) => { const k = kind + name(e); if (seen.has(k)) return; seen.add(k); out.push({ kind, where: name(e), detail }); };

  // Text: contrast, tiny type, cut off.
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const textEls = new Set();
  for (let t = walker.nextNode(); t; t = walker.nextNode()) if (t.textContent.trim().length > 1 && t.parentElement) textEls.add(t.parentElement);
  const colours = new Map();
  for (const e of textEls) {
    if (["SCRIPT", "STYLE", "NOSCRIPT", "TITLE", "OPTION"].includes(e.tagName)) continue;
    const r = visible(e); if (!r) continue;
    const s = getComputedStyle(e);
    const size = parseFloat(s.fontSize), bold = +s.fontWeight >= 600;
    const fg = parse(s.color), bg = behind(e);
    if (fg && bg) {
      const c = ratio(blend(fg, bg), bg);
      const need = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5;
      if (c < need) add("contrast", e, hex(fg) + " text on " + hex(bg) + " is " + c.toFixed(1) + ":1 (needs " + need + ")");
      const a = hsl(fg), b = hsl(bg), dh = Math.min(Math.abs(a.h - b.h), 360 - Math.abs(a.h - b.h));
      if (a.s > 0.55 && b.s > 0.55 && dh > 100 && c < 3.5 && a.l > 0.2 && a.l < 0.8 && b.l > 0.2 && b.l < 0.8) add("clash", e, "saturated " + hex(fg) + " on saturated " + hex(bg) + " vibrates; tone one of them down");
      for (const c2 of [fg, bg]) { const h = hsl(c2); if (h.s > 0.45 && h.l > 0.15 && h.l < 0.85) colours.set(Math.round(h.h / 30) % 12, hex(c2)); }
    }
    if (size < 12 && (e.innerText || "").trim().length > 2) add("tiny-text", e, Math.round(size) + "px text is too small to read" + (W < 600 ? " on a phone" : ""));
    if ((s.overflow === "hidden" || s.overflowX === "hidden" || s.textOverflow === "ellipsis" || s.whiteSpace === "nowrap") && e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0) add("overflow", e, "text is cut off (" + e.scrollWidth + "px of text in a " + e.clientWidth + "px box)");
    else if (r.right > W + 2 && s.position !== "fixed") add("overflow", e, "text runs off the right edge of the screen");
  }
  // Buttons and other inputs: size and collisions.
  const targets = [...document.querySelectorAll("a[href], button, input:not([type=hidden]), select, textarea, [role=button], [onclick]")].filter((e) => visible(e));
  const min = W < 600 ? 40 : 24;
  for (const e of targets) {
    const r = e.getBoundingClientRect();
    const inline = e.tagName === "A" && getComputedStyle(e).display === "inline" && e.closest("p, li, td");
    if (!inline && (r.width < min || r.height < min) && !["checkbox", "radio"].includes(e.type)) add("tap", e, Math.round(r.width) + "x" + Math.round(r.height) + "px is too small to tap (aim for " + (W < 600 ? "44" : "32") + "px or more)");
  }
  for (let i = 0; i < targets.length; i++) for (let j = i + 1; j < targets.length; j++) {
    const a = targets[i], b = targets[j];
    if (a.contains(b) || b.contains(a)) continue;
    const p = a.getBoundingClientRect(), q = b.getBoundingClientRect();
    const w = Math.min(p.right, q.right) - Math.max(p.left, q.left), h = Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top);
    if (w > 4 && h > 4 && w * h > 0.3 * Math.min(p.width * p.height, q.width * q.height)) add("overlap", a, "sits on top of " + name(b));
  }
  if (document.documentElement.scrollWidth > W + 2) out.push({ kind: "wide", where: "the page", detail: "is " + document.documentElement.scrollWidth + "px wide on a " + W + "px screen, so it scrolls sideways" });
  for (const img of document.images) if (img.complete && !img.naturalWidth && visible(img)) add("broken-image", img, "does not load (" + (img.getAttribute("src") || "no src").slice(0, 60) + ")");
  if (colours.size >= 6) out.push({ kind: "clash", where: "the page", detail: colours.size + " different bright hues (" + [...colours.values()].slice(0, 6).join(" ") + "); pick 2 or 3 and use them everywhere" });
  return out;
})()`;

export async function findCrimes(browser: string, url: string, o: { signal?: AbortSignal; sizes?: ("phone" | "desktop")[] } = {}): Promise<Crime[]> {
  const all: Crime[] = [];
  for (const size of o.sizes ?? ["phone", "desktop"]) {
    const [width, height] = size === "phone" ? [390, 844] : [1280, 800];
    const page = await openPage(browser, { width, height, signal: o.signal });
    try {
      if (size === "phone") await page.call("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: true });
      const load = page.loaded(8000);
      await page.call("Page.navigate", { url });
      await load;
      await Bun.sleep(400);
      const r = await page.call("Runtime.evaluate", { expression: `window.__maxxW = ${width}; ${AUDIT}`, returnByValue: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description?.split("\n")[0] ?? "the audit failed");
      for (const c of r.result.value as Omit<Crime, "size">[]) all.push({ ...c, size });
      for (const e of page.errors.slice(0, 3)) all.push({ kind: "error", where: "the console", detail: e.slice(0, 200), size });
    } finally {
      await page.close();
    }
  }
  // The same crime at both sizes is one crime.
  const out: Crime[] = [];
  for (const c of all) {
    const twin = out.find((x) => x.kind === c.kind && x.where === c.where);
    if (!twin) out.push(c);
  }
  const order: Crime["kind"][] = ["error", "wide", "overlap", "contrast", "overflow", "tap", "broken-image", "tiny-text", "clash"];
  return out.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));
}

const LABEL: Record<Crime["kind"], string> = { contrast: "hard to read", tap: "too small to tap", overflow: "cut off", wide: "sideways scroll", "tiny-text": "tiny text", clash: "clashing colours", "broken-image": "broken image", overlap: "overlapping", error: "script error" };

export function crimeList(crimes: Crime[], max = 12): string {
  const lines = crimes.slice(0, max).map((c, i) => `${i + 1}. ${LABEL[c.kind]}: ${c.where} ${c.detail}${c.size === "phone" ? " (phone size)" : ""}`);
  if (crimes.length > max) lines.push(`...and ${crimes.length - max} more`);
  return lines.join("\n");
}
