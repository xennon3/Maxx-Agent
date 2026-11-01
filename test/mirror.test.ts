import { afterAll, beforeEach, expect, test } from "bun:test";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PNG } from "pngjs";
import { setRunner, type Runner } from "../src/devices/run.ts";
import * as A from "../src/devices/adb.ts";
import { AccessUnits, captureSize, codecFromSps, screenrecordArgs, setSpawner, splitNals, type Frame } from "../src/devices/stream.ts";
import { describe as describeExplore, explore, route, signature } from "../src/devices/explore.ts";
import { contactSheet } from "../src/image.ts";
import { Stage } from "../src/ui/stage.ts";

process.env.MAXX_ADB = "adb";

// ---- H.264 stream splitting ----

const SPS = [0x67, 0x42, 0xc0, 0x1f, 0xda, 0x01];
const PPS = [0x68, 0xce, 0x3c, 0x80];
const IDR = [0x65, 0x88, 0x84, 0x00, 0x33];
const P1 = [0x41, 0x9a, 0x02, 0x03];
const P2 = [0x41, 0x9a, 0x07];
const sc = (n: number[]) => [0, 0, 0, 1, ...n];
const STREAM = new Uint8Array([...sc(SPS), ...sc(PPS), ...sc(IDR), ...sc(P1), ...sc(P2)]);

test("reads the codec string from a sequence parameter set", () => {
  expect(codecFromSps(new Uint8Array(SPS))).toBe("avc1.42c01f");
});

test("splits Annex B into NAL units and keeps the unfinished tail", () => {
  const { nals, rest } = splitNals(STREAM);
  expect(nals.map((n) => n[0])).toEqual([0x67, 0x68, 0x65, 0x41]);
  expect([...rest]).toEqual(sc(P2));
});

test("groups NAL units into frames, however the pipe cuts the bytes", () => {
  for (const size of [1, 3, 7, STREAM.length]) {
    const frames: Frame[] = [];
    const au = new AccessUnits((f) => frames.push(f));
    for (let i = 0; i < STREAM.length; i += size) au.push(STREAM.subarray(i, i + size));
    au.flush();
    expect(frames.map((f) => f.key)).toEqual([true, false, false]);
    expect(frames[0]!.codec).toBe("avc1.42c01f");
    expect([...frames[0]!.data]).toEqual([...sc(SPS), ...sc(PPS), ...sc(IDR)]);
    expect([...frames[2]!.data]).toEqual(sc(P2));
  }
});

test("a quiet pipe flushes the last frame instead of holding it back", () => {
  const frames: Frame[] = [];
  const au = new AccessUnits((f) => frames.push(f));
  au.push(new Uint8Array([...sc(SPS), ...sc(PPS), ...sc(IDR)]));
  expect(frames).toHaveLength(0);
  au.flush();
  expect(frames).toHaveLength(1);
});

test("asks the phone for a size its encoder takes", () => {
  expect(captureSize(1080, 1920)).toBeNull();
  // Many phone H.264 encoders stop at 1920 on the long side.
  expect(captureSize(1080, 2400)).toEqual({ w: 864, h: 1920 });
  expect(captureSize(1440, 3120)).toEqual({ w: 880, h: 1920 });
  expect(screenrecordArgs(null, 4_000_000)).toEqual(["exec-out", "screenrecord", "--output-format=h264", "--bit-rate=4000000", "--time-limit=180", "-"]);
});

// ---- A pretend app with a few screens ----

type El = { text: string; cls?: string; id?: string; b: [number, number, number, number]; click?: boolean };
type App = { fg: string; screen: "home" | "settings" | "about"; dark: boolean; crash: string[]; typed: string; inputs: string[][] };
const PKG = "com.example.notes";
let app: App;

function els(a: App): El[] {
  if (a.fg !== PKG) return [{ text: "Notes", b: [100, 1900, 300, 2100], click: true }];
  if (a.screen === "home")
    return [
      { text: "My notes", b: [60, 100, 1020, 200] },
      { text: "", cls: "EditText", id: "title", b: [60, 300, 1020, 420], click: true },
      { text: "Settings", b: [60, 500, 1020, 620], click: true },
      { text: "Save", b: [60, 700, 1020, 820], click: true },
      { text: "Sync", b: [60, 900, 1020, 1020], click: true },
      { text: "Delete all", b: [60, 1100, 1020, 1220], click: true },
      { text: "Help", b: [60, 1300, 1020, 1420], click: true },
    ];
  if (a.screen === "settings")
    return [
      { text: "Settings", b: [60, 100, 1020, 200] },
      { text: a.dark ? "Dark mode: on" : "Dark mode: off", b: [60, 300, 1020, 420], click: true },
      { text: "About", b: [60, 500, 1020, 620], click: true },
    ];
  return [{ text: "About Notes", b: [60, 100, 1020, 200] }, { text: "Version 1.0", b: [60, 300, 1020, 400] }];
}

const xml = (a: App) =>
  `<hierarchy rotation="0"><node class="android.widget.FrameLayout" package="${a.fg}" text="" content-desc="" clickable="false" bounds="[0,0][1080,2400]">` +
  els(a).map((e) => `<node text="${e.text}" resource-id="${e.id ? PKG + ":id/" + e.id : ""}" class="android.widget.${e.cls ?? (e.click ? "Button" : "TextView")}" package="${a.fg}" content-desc="" clickable="${!!e.click}" bounds="[${e.b[0]},${e.b[1]}][${e.b[2]},${e.b[3]}]" />`).join("") +
  `</node></hierarchy>`;

const png = (() => {
  const p = new PNG({ width: 108, height: 240 });
  p.data.fill(200);
  return new Uint8Array(PNG.sync.write(p));
})();

function tap(a: App, x: number, y: number) {
  const hit = els(a).find((e) => e.click && x >= e.b[0] && x < e.b[2] && y >= e.b[1] && y < e.b[3]);
  if (!hit) return;
  if (a.fg !== PKG) return void (hit.text === "Notes" && ((a.fg = PKG), (a.screen = "home")));
  if (hit.text === "Settings") a.screen = "settings";
  else if (hit.text === "About") a.screen = "about";
  else if (hit.text.startsWith("Dark mode")) a.dark = !a.dark;
  else if (hit.text === "Sync") (a.crash.push(`E/AndroidRuntime: FATAL EXCEPTION: main`, `E/AndroidRuntime: Process: ${PKG}, PID: 7`, `E/AndroidRuntime: java.lang.IllegalStateException: no network`), (a.fg = "com.android.launcher"));
  else if (hit.text === "Help") a.fg = "com.android.chrome";
  // "Save" does nothing at all: the bug the explorer should spot.
}

const phone: Runner = async (argv) => {
  const args = argv.slice(argv[1] === "-s" ? 3 : 1);
  const cmd = args.join(" ");
  const out = (s: string) => ({ code: 0, stdout: new TextEncoder().encode(s), stderr: "" });
  if (cmd === "devices -l") return out("List of devices attached\nEMU1   device model:Pixel_7\n\n");
  if (cmd === "shell wm size") return out("Physical size: 1080x2400\n");
  if (cmd === "exec-out screencap -p") return { code: 0, stdout: png, stderr: "" };
  if (cmd.startsWith("shell uiautomator dump")) return out("dumped");
  if (cmd.startsWith("exec-out cat")) return out(xml(app));
  if (cmd === "shell dumpsys input_method") return out("mInputShown=false\n");
  if (args[1] === "input") {
    app.inputs.push(args.slice(2));
    if (args[2] === "tap") tap(app, Number(args[3]), Number(args[4]));
    if (args[2] === "keyevent" && args[3] === "4") {
      if (app.fg !== PKG) app.fg = PKG;
      else if (app.screen === "about") app.screen = "settings";
      else if (app.screen === "settings") app.screen = "home";
      else app.fg = "com.android.launcher";
    }
    if (args[2] === "text") app.typed += args[3];
  }
  return out("");
};

const launch = async () => {
  app.fg = PKG;
  app.screen = "home";
  return null;
};
const crashLog = async () => {
  if (!app.crash.length) return null;
  const c = app.crash.join("\n");
  app.crash = [];
  return c;
};

beforeEach(() => {
  app = { fg: "com.android.launcher", screen: "home", dark: false, crash: [], typed: "", inputs: [] };
  setRunner(phone);
  A.useDevice(undefined);
});
afterAll(() => (setRunner(null), setSpawner(null)));

test("screens are told apart by their buttons, not by changing text", () => {
  const a = A.parseUi(xml({ ...app, fg: PKG, screen: "settings", dark: false }));
  const b = A.parseUi(xml({ ...app, fg: PKG, screen: "settings", dark: true }));
  // The toggle's label is part of a button, so these differ; text-only changes would not.
  expect(signature(a)).not.toBe(signature(A.parseUi(xml({ ...app, fg: PKG, screen: "home" }))));
  expect(signature(a).startsWith(PKG)).toBe(true);
  expect(b[0]!.pkg).toBe(PKG);
});

test("explores every screen and finds the crash, the dead button and the exit", async () => {
  const cwd = mkdtempSync(join(tmpdir(), "maxx-explore-"));
  const r = await explore({ pkg: PKG, steps: 40, settleMs: 0, cwd, launch, crashLog });
  const titles = r.screens.map((s) => s.title);
  expect(titles).toContain("My notes");
  expect(titles).toContain("Settings");
  expect(titles).toContain("About Notes");
  expect(r.crashes).toHaveLength(1);
  expect(r.crashes[0]!.steps.at(-1)).toBe('tap "Sync"');
  expect(r.crashes[0]!.log).toContain("no network");
  expect(existsSync(r.crashes[0]!.replay!)).toBe(true);
  const replay = readFileSync(r.crashes[0]!.replay!, "utf8").trim().split("\n").map((l) => JSON.parse(l));
  expect(replay[0]).toEqual({ kind: "launch", package: PKG });
  expect(replay.at(-1).note).toBe('tap "Sync"');
  expect(r.dead.map((d) => d.label)).toContain('"Save"');
  expect(r.left).toEqual([{ screen: 1, label: '"Help"', to: "com.android.chrome" }]);
  expect(r.skipped.map((d) => d.label)).toEqual(['"Delete all"']);
  expect(app.typed).toBe("'42'");
  // Delete all was never pressed.
  expect(app.inputs.some((i) => i[2] === "tap" && i[4] === "1160")).toBe(false);

  const { text, images } = describeExplore(r, (p) => p.slice(cwd.length + 1).replace(/\\/g, "/"));
  expect(text).toMatch(/^Explored com\.example\.notes with \d+ actions/);
  expect(text).toContain("CRASHES");
  expect(text).toContain("reproduce: maxx replay .maxx/replays/crash-");
  expect(text).toContain('[1] "Settings" → [2]');
  expect(text).toContain("TAPS THAT CHANGED NOTHING");
  expect(images).toHaveLength(1);
});

test("bold also presses the risky buttons", async () => {
  const r = await explore({ pkg: PKG, steps: 40, settleMs: 0, bold: true, launch, crashLog });
  expect(r.skipped).toHaveLength(0);
  expect(r.dead.map((d) => d.label)).toContain('"Delete all"');
});

test("stops when the action budget runs out", async () => {
  const r = await explore({ pkg: PKG, steps: 5, settleMs: 0, launch, crashLog });
  expect(r.actions).toBeLessThanOrEqual(6);
  expect(r.stoppedBecause).toContain("budget");
});

test("finds the way back to a screen with buttons left to try", () => {
  const s = (n: number, left: boolean) => ({ n, title: "", els: [{ key: "k" + n, label: "", x: 0, y: 0, input: false }], tried: new Set(left ? [] : ["k" + n]) });
  const hop = route(1, {
    screens: [s(1, false), s(2, false), s(3, true)],
    edges: [{ from: 1, to: 2, label: "A", x: 1, y: 1 }, { from: 2, to: 3, label: "B", x: 2, y: 2 }],
  });
  expect(hop?.label).toBe("A");
});

test("a contact sheet numbers every screen", () => {
  const t = { width: 100, height: 200, data: new Uint8Array(100 * 200 * 4) };
  const { img, marks } = contactSheet([t, t, t], { tileSide: 100, gap: 10 });
  expect(img.width).toBe(3 * 50 + 4 * 10);
  expect(marks.map((m) => m.n)).toEqual([1, 2, 3]);
});

// ---- The live view in the app window ----

test("taps Maxx makes are described for the ghost finger", () => {
  expect(A.describeAct(["shell", "input", "tap", "540", "1200"], "tap x")).toEqual({ kind: "tap", x: 540, y: 1200, note: "tap x" });
  expect(A.describeAct(["shell", "input", "swipe", "5", "6", "5", "6", "800"], "n")).toMatchObject({ kind: "tap", long: true });
  expect(A.describeAct(["shell", "input", "swipe", "1", "2", "3", "4", "300"], "n")).toMatchObject({ kind: "swipe", x2: 3, ms: 300 });
  expect(A.describeAct(["shell", "input", "keyevent", "4"], "n")).toMatchObject({ kind: "key", key: "back" });
  expect(A.describeAct(["shell", "input", "text", A.escapeInputText("it's 5%")], "n")).toMatchObject({ kind: "type", text: "it's 5%" });
  expect(A.describeAct(["install", "x.apk"], "n")).toBeNull();
});

test("the stage streams phone video and draws Maxx's taps", async () => {
  const sent: any[] = [];
  const stage = new Stage((m) => sent.push(m), () => 1);
  let spawned: string[] = [];
  let killed = false;
  setSpawner((argv) => {
    spawned = argv;
    let ctl!: ReadableStreamDefaultController<Uint8Array>;
    let done!: (n: number) => void;
    const exited = new Promise<number | null>((r) => (done = r));
    const stdout = new ReadableStream<Uint8Array>({ start: (c) => void (ctl = c) });
    setTimeout(() => ctl.enqueue(STREAM.subarray(0, 20)), 5);
    setTimeout(() => ctl.enqueue(STREAM.subarray(20)), 10);
    return { stdout, exited, kill: () => { if (killed) return; killed = true; ctl.close(); done(0); } };
  });
  await stage.handle({ type: "mirror", on: true, video: true });
  for (let i = 0; i < 50 && sent.filter((m) => m.type === "mirrorVideo").length < 3; i++) await Bun.sleep(10);
  expect(spawned.slice(3)).toEqual(screenrecordArgs({ w: 864, h: 1920 }));
  const video = sent.filter((m) => m.type === "mirrorVideo");
  expect(video.map((v) => v.key)).toEqual([true, false, false]);
  expect(video[0].codec).toBe("avc1.42c01f");
  expect(video[0].w).toBe(1080);

  await A.act(["shell", "input", "tap", "540", "600"], 'tap "Save"');
  await Bun.sleep(5);
  expect(sent.find((m) => m.type === "phoneAct")).toMatchObject({ kind: "tap", fx: 0.5, fy: 0.25, note: 'tap "Save"' });

  await stage.handle({ type: "mirror", on: false });
  expect(killed).toBe(true);
  stage.stop();
});
