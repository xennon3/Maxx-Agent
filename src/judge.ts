import { existsSync } from "node:fs";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { LLMConfig, Message } from "./llm.ts";
import { decodePng, toShot, type Image } from "./image.ts";
import { imagePart, type Vision } from "./vision.ts";
import { htmlFiles } from "./ui/preview.ts";
import * as A from "./devices/adb.ts";

// The screenshot judge. After a task changes what the user sees, Maxx takes a
// screenshot (the web page in a headless browser, or the phone over adb) and
// asks the vision model one question: does this match what was asked? A FAIL
// goes back to the model as a fix request. A 4B judge is often wrong, so its
// verdict never rewinds work on its own; a bigger vision model judges better.

export type Verdict = { pass: boolean; why: string };
export type Surface = { kind: "web" | "phone"; label: string; shoot(signal?: AbortSignal): Promise<Image> };

// Files whose change shows on screen.
export function isUiFile(path: string): boolean {
  return /\.(html?|css|scss|jsx|tsx|vue|svelte)$/i.test(path) || /\.kt$/i.test(path) || /(^|\/)res\/(layout|values|drawable)[^/]*\/[^/]+\.xml$/i.test(path);
}

const isAndroidFile = (p: string) => /\.(kt|java)$/i.test(p) || /(^|\/)res\//.test(p) || /AndroidManifest\.xml$|\.gradle(\.kts)?$/.test(p);

// The first line that says PASS or FAIL decides; anything else counts as a pass.
export function parseVerdict(text: string): Verdict {
  const clean = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  for (const line of clean.split("\n")) {
    const m = line.replace(/[*_`#>]/g, "").match(/\b(PASS|FAIL)\b\s*[:\-–—,.]?\s*(.*)$/i);
    if (!m) continue;
    const pass = m[1]!.toUpperCase() === "PASS";
    return { pass, why: m[2]!.trim() || (pass ? "looks right" : "the screenshot does not match the request") };
  }
  return { pass: true, why: `unclear answer from the judge: ${clean.slice(0, 120)}` };
}

export function judgeMessages(goal: string, task: string, image: Image, where: string): Message[] {
  return [
    { role: "system", content: "You are a careful software tester. You compare a screenshot of an app with what the user asked for, and you say plainly whether it works." },
    {
      role: "user",
      content: [
        {
          type: "text",
          text:
            `The user's goal: ${goal}\nThe task that was just done: ${task}\nThis is a screenshot of ${where}.\n\n` +
            "Does it show the task done and working? Look for missing parts, error messages, blank or white screens, and overlapping or cut-off text. " +
            "Reply with exactly one line: PASS, or FAIL: followed by the most important thing to fix.",
        },
        imagePart(image),
      ],
    },
  ];
}

// The model that looks: the main one when it sees images, else the vision helper.
export function judgeLLM(main: LLMConfig, vision: Vision): LLMConfig | null {
  if (vision.mode === "off") return null;
  return { ...(vision.mode === "proxy" ? vision.llm : main), temperature: 0.1 };
}

// A Chromium browser for headless screenshots: Edge ships with Windows.
export function findBrowser(env = process.env, exists: (p: string) => boolean = existsSync, which = (b: string) => Bun.which(b), platform = process.platform): string | null {
  if (env.MAXX_BROWSER) return exists(env.MAXX_BROWSER) ? env.MAXX_BROWSER : null;
  const win = [env["ProgramFiles(x86)"], env.ProgramFiles, env.LOCALAPPDATA].filter(Boolean).flatMap((p) => [join(p!, "Microsoft", "Edge", "Application", "msedge.exe"), join(p!, "Google", "Chrome", "Application", "chrome.exe")]);
  const mac = ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge", "/Applications/Chromium.app/Contents/MacOS/Chromium"];
  const found = (platform === "win32" ? win : platform === "darwin" ? mac : []).find((p) => exists(p));
  if (found) return found;
  for (const b of ["google-chrome", "chromium", "chromium-browser", "microsoft-edge", "msedge", "chrome"]) {
    const p = which(b);
    if (p) return p;
  }
  return null;
}

// Load a page in a headless browser at phone size and return a PNG. Talks the
// DevTools protocol, which works the same in Edge, Chrome and Chromium.
export async function browserShot(browser: string, url: string, o: { width?: number; height?: number; settleMs?: number; timeoutMs?: number; signal?: AbortSignal } = {}): Promise<Uint8Array> {
  const width = o.width ?? 412, height = o.height ?? 860;
  const profile = await mkdtemp(join(tmpdir(), "maxx-shot-"));
  const args = [
    browser, "--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`, `--window-size=${width},${height}`,
    "--no-first-run", "--no-default-browser-check", "--disable-background-networking", "--disable-component-update", "--disable-sync", "--hide-scrollbars", "--mute-audio",
    ...(process.platform === "linux" && process.getuid?.() === 0 ? ["--no-sandbox"] : []),
    "about:blank",
  ];
  const proc = Bun.spawn(args, { stdout: "ignore", stderr: "ignore", stdin: "ignore" });
  const deadline = Date.now() + (o.timeoutMs ?? 25_000);
  let ws: WebSocket | null = null;
  try {
    let port = "";
    while (!port) {
      if (Date.now() > deadline || o.signal?.aborted) throw new Error("the browser did not start in time");
      port = (await readFile(join(profile, "DevToolsActivePort"), "utf8").catch(() => "")).split("\n")[0]!.trim();
      if (!port) await Bun.sleep(100);
    }
    const targets = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()) as { type: string; webSocketDebuggerUrl: string }[];
    const page = targets.find((t) => t.type === "page");
    if (!page) throw new Error("the browser opened no page");
    ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((res, rej) => ((ws!.onopen = res), (ws!.onerror = () => rej(new Error("could not reach the browser")))));
    let n = 0;
    const waiting = new Map<number, (r: any) => void>();
    let loaded: () => void = () => {};
    const load = new Promise<void>((res) => (loaded = res));
    ws.onmessage = (e) => {
      const m = JSON.parse(String(e.data));
      if (m.id && waiting.has(m.id)) waiting.get(m.id)!(m), waiting.delete(m.id);
      if (m.method === "Page.loadEventFired") loaded();
    };
    const call = (method: string, params: object = {}) =>
      new Promise<any>((res, rej) => {
        const id = ++n;
        const t = setTimeout(() => rej(new Error(`the browser did not answer ${method}`)), Math.max(1000, deadline - Date.now()));
        waiting.set(id, (m) => (clearTimeout(t), m.error ? rej(new Error(m.error.message)) : res(m.result)));
        ws!.send(JSON.stringify({ id, method, params }));
      });
    await call("Page.enable");
    await call("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: true });
    await call("Page.navigate", { url });
    await Promise.race([load, Bun.sleep(Math.max(0, Math.min(10_000, deadline - Date.now())))]);
    // Scripts often draw just after load (a game's first frame, a chart).
    await Bun.sleep(o.settleMs ?? 800);
    const shot = await call("Page.captureScreenshot", { format: "png" });
    return Uint8Array.from(Buffer.from(shot.data, "base64"));
  } finally {
    try {
      ws?.close();
    } catch {}
    proc.kill();
    await proc.exited.catch(() => {});
    await rm(profile, { recursive: true, force: true }).catch(() => {});
  }
}

export type SurfaceOptions = {
  cwd: string;
  changed: string[];
  android: boolean;
  // The Preview panel's address for a project file (maxx ui); else a file:// URL.
  previewUrl?: (path: string) => string;
  // A dev server started from the Run panel.
  serverUrl?: () => string | undefined;
  browser?: string | null;
};

// What to screenshot after a task, or null when nothing visible changed.
export async function pickSurface(o: SurfaceOptions): Promise<Surface | null> {
  const ui = o.changed.filter(isUiFile);
  if (!ui.length) return null;
  if (o.android && o.changed.some(isAndroidFile)) {
    const online = await A.devices().then((d) => d.some((x) => x.state === "device"), () => false);
    if (online) return { kind: "phone", label: "the app on the phone", shoot: async () => toShot(decodePng(await A.screencap()), { maxSide: 900, quality: 70 }) };
  }
  const browser = o.browser === undefined ? findBrowser() : o.browser;
  if (!browser) return null;
  const server = o.serverUrl?.();
  const page = server ? null : (ui.find((p) => /\.html?$/i.test(p)) ?? (await htmlFiles(o.cwd))[0]);
  if (!server && !page) return null;
  const url = server ?? (o.previewUrl ? o.previewUrl(page!) : pathToFileURL(join(o.cwd, page!)).href);
  return {
    kind: "web",
    label: `${server ?? page} in a browser at phone size`,
    shoot: async (signal) => toShot(decodePng(await browserShot(browser, url, { signal })), { maxSide: 900, quality: 70 }),
  };
}
