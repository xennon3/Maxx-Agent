import { z } from "zod";
import { join, relative, resolve } from "node:path";
import { existsSync, readFileSync, statSync } from "node:fs";
import { defineTool, type ToolResult } from "./types.ts";
import { truncate } from "../context.ts";
import { run, text, record, sleep } from "../devices/run.ts";
import * as A from "../devices/adb.ts";

// Android: build, install, launch, look at and drive an app on a real phone
// over adb (USB or wireless debugging). Coordinates are screenshot pixels.

const shot = z.boolean().optional().describe("Return a new screenshot after the action (default true)");
const target = {
  element: z.number().int().optional().describe("Element number from the last screenshot (preferred)"),
  text: z.string().optional().describe("Or: visible text or description of the element"),
  x: z.number().optional().describe("Or: x in screenshot pixels"),
  y: z.number().optional().describe("Or: y in screenshot pixels"),
};
const NO_CKPT = { checkpoint: false } as const;

async function observe(note: string, screenshot = true, settleMs = 700, glance = true): Promise<ToolResult> {
  if (!screenshot) return note;
  await sleep(settleMs);
  const l = await A.look();
  return { text: `${note}\n\n${l.text}`, images: [l.shot], glance };
}

export const androidDevices = defineTool({
  name: "android_devices",
  description: "List connected Android devices, or pick which one to use.",
  schema: z.object({ use: z.string().optional().describe("Serial of the device to use for the following calls") }),
  risk: "read",
  async run({ use }) {
    if (use) A.useDevice(use);
    const list = await A.devices();
    if (!list.length) return "no devices. USB: enable USB debugging and accept the prompt on the phone. Wireless: Developer options > Wireless debugging, then android_connect.";
    return list.map((d) => `${d.serial}  ${d.state}${d.model ? "  " + d.model : ""}${d.state === "unauthorized" ? "  (accept the debugging prompt on the phone)" : ""}`).join("\n") + (use ? `\nusing ${use}` : "");
  },
});

export const androidConnect = defineTool({
  name: "android_connect",
  description: "Connect to a phone over Wi-Fi (Wireless debugging). Pairing is needed once: pass pair_address and code from the phone's 'Pair device with pairing code' screen, then address from the Wireless debugging screen.",
  schema: z.object({
    address: z.string().optional().describe("IP:port shown under Wireless debugging, e.g. 192.168.1.20:37011"),
    pair_address: z.string().optional().describe("IP:port from the pairing dialog (different port)"),
    code: z.string().optional().describe("Six-digit pairing code"),
  }),
  risk: "exec",
  ...NO_CKPT,
  ruleKey: (a) => a.address ?? a.pair_address ?? "",
  preview: (a) => [a.pair_address && `adb pair ${a.pair_address} ******`, a.address && `adb connect ${a.address}`].filter(Boolean).join("\n"),
  async run({ address, pair_address, code }) {
    const out: string[] = [];
    if (pair_address) {
      if (!code) return "error: pairing needs the six-digit code shown on the phone";
      out.push((await A.adbText(["pair", pair_address, code], { device: false })).trim());
    }
    if (address) {
      out.push((await A.adbText(["connect", address], { device: false })).trim());
      A.useDevice(address);
    }
    return out.join("\n") || "error: give address, or pair_address and code";
  },
});

export const androidRun = defineTool({
  name: "android_run",
  description:
    "Build the app with Gradle (assembleDebug), install it on the phone, launch it, check for a crash, and return a screenshot. " +
    "Use apk to install a prebuilt APK instead. Works for native, Capacitor (project_dir android) and Expo prebuild projects.",
  schema: z.object({
    project_dir: z.string().optional().describe("Directory with gradlew, relative to the workspace (default: the workspace)"),
    apk: z.string().optional().describe("Install this APK instead of building"),
    package: z.string().optional().describe("Application id, e.g. com.example.app (read from build.gradle when omitted)"),
    task: z.string().optional().describe("Gradle task, default assembleDebug"),
    wait: z.number().min(0).max(30).optional().describe("Seconds to let the app start before the screenshot, default 3"),
  }),
  risk: "exec",
  ...NO_CKPT,
  ruleKey: (a) => a.project_dir ?? a.apk ?? ".",
  preview: (a) => (a.apk ? `adb install -r ${a.apk}` : `gradlew ${a.task ?? "assembleDebug"} in ${a.project_dir ?? "."}`) + " → install → launch → screenshot",
  async run(a, { cwd }) {
    const dir = resolve(cwd, a.project_dir ?? ".");
    const log: string[] = [];
    let apk = a.apk ? resolve(cwd, a.apk) : null;

    if (!apk) {
      const gradle = gradleCommand(dir);
      if (!gradle) return `error: no gradlew in ${dir}. Create the project first (a Gradle wrapper is needed) or pass apk.`;
      const started = Date.now();
      const r = await run([...gradle, a.task ?? "assembleDebug", "--console=plain"], { cwd: dir, timeout: 1500 });
      const out = text(r) + r.stderr;
      if (r.code !== 0) return `build failed (exit ${r.code}):\n${truncate(out, 20, 80)}`;
      log.push(`built in ${Math.round((Date.now() - started) / 1000)}s`);
      apk = newestApk(dir);
      if (!apk) return `build succeeded but no APK was found under ${dir}/**/build/outputs/apk`;
    }
    if (!existsSync(apk)) return `error: ${apk} does not exist`;

    await A.ensureDevice();
    const pkg = a.package ?? applicationId(dir);
    log.push(`installing ${relative(cwd, apk) || apk}`);
    await record({ kind: "adb", args: ["install", "-r", "-t", apk], note: "install" });
    const inst = await A.adb(["install", "-r", "-t", apk], { timeout: 300 });
    const instOut = (text(inst) + inst.stderr).trim();
    if (inst.code !== 0 || /Failure/.test(instOut)) return `install failed: ${instOut}${/UPDATE_INCOMPATIBLE|SIGNATURES/.test(instOut) ? "\nThe installed copy is signed differently; uninstall it first with bash: adb uninstall <package>" : ""}`;
    if (!pkg) return `${log.join("\n")}\ninstalled, but the application id is unknown; call android_run again with package to launch it.`;

    const crash = await launch(pkg, a.wait ?? 3);
    log.push(`launched ${pkg}`);
    if (crash) log.push(`THE APP CRASHED:\n${crash}`);
    return observe(log.join("\n"), true, 0, false);
  },
});

export async function launch(pkg: string, wait: number): Promise<string | null> {
  await A.adbText(["logcat", "-c"]).catch(() => {});
  await record({ kind: "launch", package: pkg });
  await A.adbText(["shell", "am", "force-stop", pkg]);
  const out = await A.adbText(["shell", "monkey", "-p", pkg, "-c", "android.intent.category.LAUNCHER", "1"]);
  if (/No activities found/.test(out)) throw new Error(`${pkg} has no launcher activity (is the package name right, and is the app installed?)`);
  await sleep(wait * 1000);
  return crashLog(pkg);
}

export async function crashLog(pkg?: string): Promise<string | null> {
  const out = await A.adbText(["logcat", "-d", "-b", "crash", "-v", "brief"]).catch(() => "");
  const lines = out.split(/\r?\n/).filter((l) => l.trim() && !l.startsWith("---------"));
  if (!lines.length || (pkg && !out.includes(pkg))) return null;
  return truncate(lines.join("\n"), 40, 0);
}

export function gradleCommand(dir: string): string[] | null {
  if (process.platform === "win32") return existsSync(join(dir, "gradlew.bat")) ? ["cmd.exe", "/c", join(dir, "gradlew.bat")] : null;
  return existsSync(join(dir, "gradlew")) ? ["sh", join(dir, "gradlew")] : null;
}

function newestApk(dir: string): string | null {
  let best: { path: string; t: number } | null = null;
  for (const p of new Bun.Glob("**/build/outputs/apk/**/*.apk").scanSync({ cwd: dir, absolute: true })) {
    const t = statSync(p).mtimeMs;
    if (!best || t > best.t) best = { path: p, t };
  }
  return best?.path ?? null;
}

export function applicationId(dir: string): string | null {
  for (const f of ["app/build.gradle.kts", "app/build.gradle", "build.gradle.kts", "build.gradle"]) {
    const p = join(dir, f);
    if (!existsSync(p)) continue;
    const m = readFileSync(p, "utf8").match(/applicationId\s*[=(]?\s*["']([\w.]+)["']/);
    if (m) return m[1];
  }
  for (const f of ["app/src/main/AndroidManifest.xml", "src/main/AndroidManifest.xml"]) {
    const p = join(dir, f);
    if (!existsSync(p)) continue;
    const m = readFileSync(p, "utf8").match(/package="([\w.]+)"/);
    if (m) return m[1];
  }
  return null;
}

export const androidScreen = defineTool({
  name: "android_screen",
  description: "Take a screenshot of the phone with numbered boxes on the elements you can interact with, plus the element list. Use zoom to read small text.",
  schema: z.object({
    marks: z.boolean().optional().describe("Draw numbered element boxes (default true)"),
    zoom: z.string().optional().describe('Region "x1,y1,x2,y2" of the last screenshot to show at full resolution'),
  }),
  risk: "read",
  async run({ marks, zoom }) {
    if (zoom) {
      await A.ensureDevice();
      const img = A.phone.zoom(await A.screencap(), zoom);
      return { text: `zoomed region ${zoom} of the phone screen (${img.width}x${img.height}); coordinates in it are not screenshot coordinates.`, images: [img] };
    }
    const l = await A.look({ marks });
    return { text: l.text, images: [l.shot] };
  },
});

export const androidTap = defineTool({
  name: "android_tap",
  description: "Tap an element on the phone by its number from the last screenshot, by its text, or at x,y. Returns a new screenshot.",
  schema: z.object({ ...target, long: z.boolean().optional().describe("Long-press instead of tap"), screenshot: shot }),
  risk: "exec",
  ...NO_CKPT,
  ruleKey: () => "tap",
  preview: (a) => `tap ${a.element !== undefined ? `element ${a.element}` : a.text ?? `${a.x},${a.y}`}${a.long ? " (long)" : ""}`,
  async run(a) {
    await A.ensureDevice();
    await A.ensureScale();
    const p = A.phone.point(a);
    const args = a.long ? ["shell", "input", "swipe", `${p.x}`, `${p.y}`, `${p.x}`, `${p.y}`, "800"] : ["shell", "input", "tap", `${p.x}`, `${p.y}`];
    await A.act(args, `tap ${p.what}`);
    return observe(`${a.long ? "long-pressed" : "tapped"} ${p.what}`, a.screenshot);
  },
});

export const androidSwipe = defineTool({
  name: "android_swipe",
  description: "Swipe or scroll on the phone. Give direction to scroll the content (up = see what is below), or exact x1,y1,x2,y2 in screenshot pixels.",
  schema: z.object({
    direction: z.enum(["up", "down", "left", "right"]).optional(),
    x1: z.number().optional(), y1: z.number().optional(), x2: z.number().optional(), y2: z.number().optional(),
    duration_ms: z.number().int().min(50).max(5000).optional(),
    screenshot: shot,
  }),
  risk: "exec",
  ...NO_CKPT,
  ruleKey: () => "swipe",
  preview: (a) => `swipe ${a.direction ?? `${a.x1},${a.y1} → ${a.x2},${a.y2}`}`,
  async run(a) {
    await A.ensureDevice();
    await A.ensureScale();
    let from: { x: number; y: number }, to: { x: number; y: number };
    if (a.direction) {
      const size = (await A.adbText(["shell", "wm", "size"])).match(/(\d+)x(\d+)\s*$/m);
      const w = Number(size?.[1] ?? 1080), h = Number(size?.[2] ?? 2400);
      const cx = w / 2, cy = h / 2, dx = w * 0.3, dy = h * 0.3;
      // Scrolling "up" (to see lower content) means the finger moves up.
      const v = { up: [0, dy, 0, -dy], down: [0, -dy, 0, dy], left: [dx, 0, -dx, 0], right: [-dx, 0, dx, 0] }[a.direction];
      from = { x: Math.round(cx + v[0]!), y: Math.round(cy + v[1]!) };
      to = { x: Math.round(cx + v[2]!), y: Math.round(cy + v[3]!) };
    } else if ([a.x1, a.y1, a.x2, a.y2].every((v) => v !== undefined)) {
      from = A.phone.toScreen({ x: a.x1!, y: a.y1! });
      to = A.phone.toScreen({ x: a.x2!, y: a.y2! });
    } else return "error: give direction, or all of x1, y1, x2, y2";
    await A.act(["shell", "input", "swipe", `${from.x}`, `${from.y}`, `${to.x}`, `${to.y}`, `${a.duration_ms ?? 300}`], `swipe ${a.direction ?? ""}`);
    return observe(`swiped ${a.direction ?? "as asked"}`, a.screenshot, 900);
  },
});

export const androidType = defineTool({
  name: "android_type",
  description: "Type text into the focused field on the phone (tap the field first, or pass its element number). ASCII only.",
  schema: z.object({
    text: z.string(),
    element: z.number().int().optional().describe("Tap this element first"),
    submit: z.boolean().optional().describe("Press Enter afterwards"),
    screenshot: shot,
  }),
  risk: "exec",
  ...NO_CKPT,
  ruleKey: () => "type",
  preview: (a) => `type ${JSON.stringify(a.text)}${a.element !== undefined ? ` into element ${a.element}` : ""}${a.submit ? " + Enter" : ""}`,
  async run(a) {
    await A.ensureDevice();
    if (a.element !== undefined) {
      const p = A.phone.point({ element: a.element });
      await A.act(["shell", "input", "tap", `${p.x}`, `${p.y}`], `tap ${p.what}`);
      await sleep(400);
    }
    // Long strings are sent in pieces; `input text` drops characters on some phones otherwise.
    for (const piece of a.text.split(/(?<=\n)/)) {
      const line = piece.replace(/\n$/, "");
      for (let i = 0; i < line.length; i += 40) await A.act(["shell", "input", "text", A.escapeInputText(line.slice(i, i + 40))], "type");
      if (piece.endsWith("\n")) await A.act(["shell", "input", "keyevent", "66"], "enter");
    }
    if (a.submit) await A.act(["shell", "input", "keyevent", "66"], "enter");
    return observe(`typed ${a.text.length} characters${a.submit ? " and pressed Enter" : ""}`, a.screenshot);
  },
});

export const androidKey = defineTool({
  name: "android_key",
  description: `Press a key on the phone: ${Object.keys(A.KEYCODES).join(", ")}, or a numeric Android keycode.`,
  schema: z.object({ key: z.string(), screenshot: shot }),
  risk: "exec",
  ...NO_CKPT,
  ruleKey: (a) => a.key,
  preview: (a) => `press ${a.key}`,
  async run({ key, screenshot }) {
    await A.ensureDevice();
    const code = A.KEYCODES[key.toLowerCase()] ?? (/^\d+$/.test(key) ? Number(key) : undefined);
    if (code === undefined) return `error: unknown key "${key}". Use one of: ${Object.keys(A.KEYCODES).join(", ")}`;
    await A.act(["shell", "input", "keyevent", `${code}`], `key ${key}`);
    return observe(`pressed ${key}`, screenshot);
  },
});

export const androidLogcat = defineTool({
  name: "android_logcat",
  description: "Read the phone's log: recent crashes, or the last lines for an app. Use after a crash or when something does not work.",
  schema: z.object({
    package: z.string().optional().describe("Only lines from this app's process"),
    crashes: z.boolean().optional().describe("Only the crash buffer (default false)"),
    lines: z.number().int().min(10).max(1000).optional().describe("Default 150"),
    filter: z.string().optional().describe("Only lines containing this text"),
  }),
  risk: "read",
  async run(a) {
    await A.ensureDevice();
    if (a.crashes) return (await crashLog(a.package)) ?? "no crashes logged since the last launch";
    const pid = a.package ? (await A.adbText(["shell", "pidof", a.package]).catch(() => "")).trim().split(/\s+/)[0] : "";
    if (a.package && !pid) return `${a.package} is not running. Check crashes with crashes: true, or launch it with android_run.`;
    const args = ["logcat", "-d", "-v", "brief", "-t", `${a.lines ?? 150}`, ...(pid ? [`--pid=${pid}`] : [])];
    let out = await A.adbText(args);
    if (a.filter) out = out.split(/\r?\n/).filter((l) => l.includes(a.filter!)).join("\n");
    return out.trim() || "(no log lines)";
  },
});

export const ANDROID_TOOLS = [androidDevices, androidConnect, androidRun, androidScreen, androidTap, androidSwipe, androidType, androidKey, androidLogcat];

export const ANDROID_PROMPT = `Android tools are enabled. The user's phone is reachable over adb.
- To build and test an app: write the code, call android_run (it builds, installs, launches, reports crashes and returns a screenshot), then look at the screenshot.
- Drive the app with android_tap / android_type / android_swipe / android_key, preferring element numbers from the latest screenshot. Each action returns a new screenshot: check that it did what you expected before the next step.
- New apps: prefer Kotlin + Jetpack Compose with the Gradle wrapper (gradlew), minSdk 26, applicationId set in app/build.gradle.kts.
- If the app crashes, read android_logcat with crashes: true, fix the code, and run again.
- Never open other apps' private data, send messages, make calls or purchases on the phone unless the user asked.`;
