import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { run, text, record, type RunResult } from "./run.ts";
import { Screen, type Element } from "./screen.ts";

// Thin adb wrapper: find adb, pick a device, screenshots and the UI tree.

export const phone = new Screen("Android");
let serial: string | undefined = process.env.MAXX_ANDROID_SERIAL;

export function useDevice(s: string | undefined) {
  serial = s;
}

export function findAdb(env = process.env, exists = existsSync, which = (b: string) => Bun.which(b)): string | null {
  const exe = process.platform === "win32" ? "adb.exe" : "adb";
  const sdks = [
    env.ANDROID_HOME,
    env.ANDROID_SDK_ROOT,
    env.LOCALAPPDATA && join(env.LOCALAPPDATA, "Android", "Sdk"),
    join(homedir(), "Library", "Android", "sdk"),
    join(homedir(), "Android", "Sdk"),
  ];
  if (env.MAXX_ADB) return env.MAXX_ADB;
  return which("adb") ?? sdks.map((s) => s && join(s, "platform-tools", exe)).find((p): p is string => !!p && exists(p)) ?? null;
}

let adbPath: string | null | undefined;
const NO_ADB = "adb not found. Install Android platform-tools (Android Studio, or `winget install Google.PlatformTools`), or set ANDROID_HOME.";

export async function adb(args: string[], opts: { timeout?: number; device?: boolean } = {}): Promise<RunResult> {
  adbPath ??= findAdb();
  if (!adbPath) throw new Error(NO_ADB);
  const argv = [adbPath, ...(opts.device !== false && serial ? ["-s", serial] : []), ...args];
  return run(argv, { timeout: opts.timeout ?? 30 });
}

export async function adbText(args: string[], opts?: { timeout?: number; device?: boolean }) {
  const r = await adb(args, opts);
  const out = text(r);
  if (r.code !== 0) throw new Error(`adb ${args.join(" ")} failed (exit ${r.code}): ${(r.stderr || out).trim()}`);
  return out;
}

// Same as adbText, but recorded so `maxx replay` can run it again.
export async function act(args: string[], note: string) {
  await record({ kind: "adb", args, note });
  return adbText(args);
}

export type Device = { serial: string; state: string; model?: string };

export function parseDevices(out: string): Device[] {
  return out
    .split(/\r?\n/)
    .slice(1)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [s, state, ...rest] = l.split(/\s+/);
      const model = rest.find((r) => r.startsWith("model:"))?.slice(6);
      return { serial: s!, state: state!, ...(model ? { model } : {}) };
    });
}

export async function devices() {
  return parseDevices(await adbText(["devices", "-l"], { device: false }));
}

// Fail with instructions the model can relay, instead of adb's own errors.
export async function ensureDevice() {
  const list = (await devices()).filter((d) => d.state === "device");
  if (serial && list.some((d) => d.serial === serial)) return;
  if (list.length === 1) return void (serial = list[0]!.serial);
  if (!list.length) {
    throw new Error(
      "no Android device connected. Ask the user to plug the phone in with USB debugging on, or turn on Wireless debugging " +
        "(Settings > Developer options) and give you the IP:port and pairing code, then call android_connect.",
    );
  }
  throw new Error(`several devices are connected: ${list.map((d) => d.serial).join(", ")}. Call android_devices with use set to one of them.`);
}

export type UiNode = { text: string; desc: string; id: string; cls: string; clickable: boolean; scrollable: boolean; bounds: { x1: number; y1: number; x2: number; y2: number } };

export function parseUi(xml: string): UiNode[] {
  const nodes: UiNode[] = [];
  for (const m of xml.matchAll(/<node\b([^>]*?)\/?>/g)) {
    const attr = (k: string) => unescapeXml(m[1]!.match(new RegExp(`\\b${k}="([^"]*)"`))?.[1] ?? "");
    const b = attr("bounds").match(/\[(-?\d+),(-?\d+)\]\[(-?\d+),(-?\d+)\]/);
    if (!b) continue;
    const [x1, y1, x2, y2] = b.slice(1).map(Number) as [number, number, number, number];
    nodes.push({
      text: attr("text"),
      desc: attr("content-desc"),
      id: attr("resource-id").replace(/^.*:id\//, ""),
      cls: attr("class").split(".").pop() ?? "",
      clickable: attr("clickable") === "true" || attr("long-clickable") === "true" || attr("checkable") === "true",
      scrollable: attr("scrollable") === "true",
      bounds: { x1, y1, x2, y2 },
    });
  }
  return nodes;
}

const unescapeXml = (s: string) =>
  s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#10;/g, " ").replace(/&amp;/g, "&");

// Keep what a tester would point at: things you can press, and visible text.
export function elementsFrom(nodes: UiNode[], limit = 60): Omit<Element, "n">[] {
  const out: Omit<Element, "n">[] = [];
  for (const n of nodes) {
    const { x1, y1, x2, y2 } = n.bounds;
    if (x2 - x1 < 8 || y2 - y1 < 8) continue;
    const name = n.text || n.desc;
    if (!n.clickable && !n.scrollable && !name) continue;
    // A label inside a clickable row is usually the row itself; skip exact duplicates.
    if (out.some((o) => o.bounds.x1 === x1 && o.bounds.y1 === y1 && o.bounds.x2 === x2 && o.bounds.y2 === y2)) continue;
    const kind = n.cls === "EditText" ? "input" : n.scrollable ? "scrollable" : n.clickable ? (n.cls || "button") : "text";
    const label = [kind, name && JSON.stringify(name.slice(0, 60)), n.id && `#${n.id}`].filter(Boolean).join(" ");
    out.push({ label, bounds: n.bounds });
    if (out.length >= limit) break;
  }
  return out;
}

export async function screencap(): Promise<Uint8Array> {
  const r = await adb(["exec-out", "screencap", "-p"], { timeout: 20 });
  if (r.code !== 0 || r.stdout.length < 8) throw new Error(`screencap failed: ${r.stderr.trim() || "no image data"}`);
  return r.stdout;
}

// uiautomator fails while the screen is animating, and on some games/video; that's fine, the image still works.
export async function uiTree(): Promise<UiNode[]> {
  try {
    await adbText(["shell", "uiautomator", "dump", "/sdcard/maxx_ui.xml"], { timeout: 20 });
    return parseUi(await adbText(["exec-out", "cat", "/sdcard/maxx_ui.xml"]));
  } catch {
    return [];
  }
}

export async function look(opts: { marks?: boolean } = {}) {
  await ensureDevice();
  const [png, nodes] = await Promise.all([screencap(), uiTree()]);
  return { png, ...phone.look(png, elementsFrom(nodes), opts) };
}

// Before the first screenshot, the model may still pass coordinates; learn the scale from the screen size.
export async function ensureScale() {
  if (phone.seen) return;
  const m = (await adbText(["shell", "wm", "size"])).match(/(\d+)x(\d+)\s*$/m);
  if (m) phone.scale = Math.max(1, Math.max(Number(m[1]), Number(m[2])) / Number(process.env.MAXX_SCREEN_MAX ?? 1280));
  phone.seen = true;
}

// `input text` treats %s as a space and runs through the device shell, so
// single-quote everything. It only types ASCII.
export function escapeInputText(s: string): string {
  if (/[^\x20-\x7e\n]/.test(s)) throw new Error("adb can only type plain ASCII text; replace other characters or type them in pieces.");
  return "'" + s.replace(/%/g, "\\%").replace(/ /g, "%s").replace(/'/g, `'\\''`) + "'";
}

export const KEYCODES: Record<string, number> = {
  back: 4, home: 3, recents: 187, app_switch: 187, enter: 66, delete: 67, backspace: 67, tab: 61, escape: 111, menu: 82,
  up: 19, down: 20, left: 21, right: 22, volume_up: 24, volume_down: 25, power: 26, search: 84, space: 62,
};
