import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

// A headless Edge/Chrome page driven over the DevTools protocol, which works
// the same in Edge, Chrome and Chromium. Used for screenshots (the judge,
// snap_page) and for drawing images with a real canvas (make_icons), so Maxx
// needs no image library and no Node for any of it.

export type Page = {
  call(method: string, params?: object): Promise<any>;
  // Errors the page printed or threw, in order.
  errors: string[];
  // Resolves on the next load event (or after `ms`).
  loaded(ms?: number): Promise<void>;
  close(): Promise<void>;
};

export async function openPage(browser: string, o: { width?: number; height?: number; timeoutMs?: number; signal?: AbortSignal } = {}): Promise<Page> {
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
  const close = async () => {
    try {
      ws?.close();
    } catch {}
    proc.kill();
    await proc.exited.catch(() => {});
    await rm(profile, { recursive: true, force: true }).catch(() => {});
  };
  try {
    let port = "";
    while (!port) {
      if (Date.now() > deadline || o.signal?.aborted) throw new Error("the browser did not start in time");
      port = (await readFile(join(profile, "DevToolsActivePort"), "utf8").catch(() => "")).split("\n")[0]!.trim();
      if (!port) await Bun.sleep(100);
    }
    const targets = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()) as { type: string; webSocketDebuggerUrl: string }[];
    const target = targets.find((t) => t.type === "page");
    if (!target) throw new Error("the browser opened no page");
    ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((res, rej) => ((ws!.onopen = res), (ws!.onerror = () => rej(new Error("could not reach the browser")))));
    let n = 0;
    const waiting = new Map<number, (r: any) => void>();
    const loads: (() => void)[] = [];
    const errors: string[] = [];
    ws.onmessage = (e) => {
      const m = JSON.parse(String(e.data));
      if (m.id && waiting.has(m.id)) waiting.get(m.id)!(m), waiting.delete(m.id);
      if (m.method === "Page.loadEventFired") loads.splice(0).forEach((f) => f());
      if (m.method === "Runtime.exceptionThrown") {
        const d = m.params.exceptionDetails;
        errors.push(`${d.exception?.description?.split("\n")[0] ?? d.text}${d.url ? ` (${d.url.split("/").pop()}:${d.lineNumber + 1})` : ""}`);
      }
      if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") errors.push(`console.error: ${m.params.args.map((a: any) => a.value ?? a.description ?? "").join(" ").slice(0, 300)}`);
      if (m.method === "Log.entryAdded" && m.params.entry.level === "error") errors.push(`${m.params.entry.text.slice(0, 300)}${m.params.entry.url ? ` (${m.params.entry.url.split("/").pop()})` : ""}`);
    };
    const call = (method: string, params: object = {}) =>
      new Promise<any>((res, rej) => {
        const id = ++n;
        const t = setTimeout(() => rej(new Error(`the browser did not answer ${method}`)), Math.max(1000, deadline - Date.now()));
        waiting.set(id, (m) => (clearTimeout(t), m.error ? rej(new Error(m.error.message)) : res(m.result)));
        ws!.send(JSON.stringify({ id, method, params }));
      });
    await call("Page.enable");
    await call("Runtime.enable");
    await call("Log.enable").catch(() => {});
    await call("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 600 });
    const loaded = (ms = 10_000) => Promise.race([new Promise<void>((r) => loads.push(r)), Bun.sleep(Math.max(0, Math.min(ms, deadline - Date.now())))]);
    return { call, errors, loaded, close };
  } catch (e) {
    await close();
    throw e;
  }
}

// Load a page and screenshot it. `full` captures the whole scrolling page.
export async function screenshot(browser: string, url: string, o: { width?: number; height?: number; settleMs?: number; timeoutMs?: number; signal?: AbortSignal; full?: boolean } = {}): Promise<{ png: Uint8Array; errors: string[]; title: string; overflow: number }> {
  const page = await openPage(browser, o);
  try {
    const load = page.loaded();
    await page.call("Page.navigate", { url });
    await load;
    // Scripts often draw just after load (a game's first frame, a chart).
    await Bun.sleep(o.settleMs ?? 800);
    const probe = await page.call("Runtime.evaluate", { expression: "JSON.stringify({t: document.title, w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight})", returnByValue: true }).catch(() => null);
    const info = probe ? JSON.parse(probe.result.value) : { t: "", w: 0, h: 0 };
    const width = o.width ?? 412;
    let clip: object | undefined;
    if (o.full && info.h > (o.height ?? 860)) {
      const h = Math.min(info.h, 4000);
      await page.call("Emulation.setDeviceMetricsOverride", { width, height: h, deviceScaleFactor: 1, mobile: width < 600 });
      await Bun.sleep(200);
      clip = { x: 0, y: 0, width, height: h, scale: 1 };
    }
    const shot = await page.call("Page.captureScreenshot", { format: "png", ...(clip ? { clip } : {}) });
    return { png: Uint8Array.from(Buffer.from(shot.data, "base64")), errors: [...new Set(page.errors)], title: info.t, overflow: Math.max(0, info.w - width) };
  } finally {
    await page.close();
  }
}

// Run a script in a blank page and return what it resolves to (JSON-able).
export async function evaluate<T>(browser: string, expression: string, o: { timeoutMs?: number; signal?: AbortSignal } = {}): Promise<T> {
  const page = await openPage(browser, { ...o, width: 800, height: 600 });
  try {
    const r = await page.call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description?.split("\n")[0] ?? r.exceptionDetails.text);
    return r.result.value as T;
  } finally {
    await page.close();
  }
}
