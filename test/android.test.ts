import { afterAll, beforeEach, expect, test } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PNG } from "pngjs";
import jpeg from "jpeg-js";
import { setRunner, recordTo, text, type Runner } from "../src/devices/run.ts";
import * as A from "../src/devices/adb.ts";
import { androidScreen, androidTap, androidType, androidSwipe, androidRun } from "../src/tools/android.ts";
import { replay } from "../src/replay.ts";

process.env.MAXX_ADB = "adb";

// A fake phone: 1080x2400 screen, a login form, and a log of input commands.
export function phonePng(w = 1080, h = 2400) {
  const png = new PNG({ width: w, height: h });
  png.data.fill(240);
  return new Uint8Array(PNG.sync.write(png));
}

export const LOGIN_XML = `<?xml version='1.0' encoding='UTF-8' standalone='yes' ?><hierarchy rotation="0">
<node index="0" text="" resource-id="" class="android.widget.FrameLayout" package="com.example.app" content-desc="" clickable="false" scrollable="false" bounds="[0,0][1080,2400]">
<node index="0" text="Welcome &amp; hello" resource-id="com.example.app:id/title" class="android.widget.TextView" clickable="false" bounds="[100,300][980,400]" />
<node index="1" text="" resource-id="com.example.app:id/email" class="android.widget.EditText" clickable="true" bounds="[100,800][980,950]" />
<node index="2" text="Log in" resource-id="com.example.app:id/login" class="android.widget.Button" clickable="true" bounds="[100,1800][980,1960]" />
<node index="3" text="" resource-id="" class="android.view.View" clickable="false" bounds="[0,0][4,4]" />
</node></hierarchy>`;

export const inputs: string[][] = [];
const png = phonePng();
export const fakeAdb: Runner = async (argv) => {
  const args = argv.slice(argv[1] === "-s" ? 3 : 1);
  const out = (s: string) => ({ code: 0, stdout: new TextEncoder().encode(s), stderr: "" });
  const cmd = args.join(" ");
  if (cmd === "devices -l") return out("List of devices attached\nR5CT123   device usb:1-1 product:x model:Pixel_8 device:x\n\n");
  if (cmd === "exec-out screencap -p") return { code: 0, stdout: png, stderr: "" };
  if (cmd.startsWith("shell uiautomator dump")) return out("UI hierchary dumped to: /sdcard/maxx_ui.xml");
  if (cmd === "exec-out cat /sdcard/maxx_ui.xml") return out(LOGIN_XML);
  if (cmd === "shell wm size") return out("Physical size: 1080x2400\n");
  if (args[0] === "shell" && args[1] === "input") return (inputs.push(args.slice(2)), out(""));
  if (args[0] === "install") return (inputs.push(args), out("Performing Streamed Install\nSuccess\n"));
  if (cmd.includes("monkey")) return (inputs.push(["launch", args[3]!]), out("Events injected: 1"));
  return out("");
};

beforeEach(() => {
  setRunner(fakeAdb);
  inputs.length = 0;
  A.useDevice(undefined);
});
afterAll(() => setRunner(null));

test("UI dump becomes a numbered element list", () => {
  const els = A.elementsFrom(A.parseUi(LOGIN_XML));
  expect(els.map((e) => e.label)).toEqual(['text "Welcome & hello" #title', "input #email", 'Button "Log in" #login']);
});

test("text for adb input is quoted for the device shell", () => {
  expect(A.escapeInputText("it's 100% ok")).toBe(`'it'\\''s%s100\\%%sok'`);
  expect(() => A.escapeInputText("héllo")).toThrow(/ASCII/);
});

test("screenshot is downscaled, marked and listed in screenshot coordinates", async () => {
  const res = await androidScreen.run({}, { cwd: "." });
  if (typeof res === "string") throw new Error("expected an image");
  const img = jpeg.decode(Buffer.from(res.images![0]!.base64, "base64"));
  expect([img.width, img.height]).toEqual([576, 1280]);
  expect(res.text).toContain("576x1280");
  // Log in button center is 540,1880 on the phone = 288,1003 in the screenshot.
  expect(res.text).toContain('[3] Button "Log in" #login @ 288,1003');
  // The box border is drawn in a mark color, not the grey background.
  const i = (Math.round(1800 / 1.875) * img.width + 150) * 4;
  expect([img.data[i], img.data[i + 1], img.data[i + 2]]).not.toEqual([240, 240, 240]);
});

test("taps by element number, text, or screenshot pixels map back to the phone", async () => {
  await androidScreen.run({}, { cwd: "." });
  await androidTap.run({ element: 3, screenshot: false }, { cwd: "." });
  await androidTap.run({ text: "log in", screenshot: false }, { cwd: "." });
  await androidTap.run({ x: 288, y: 1003, screenshot: false }, { cwd: "." });
  expect(inputs).toEqual([["tap", "540", "1880"], ["tap", "540", "1880"], ["tap", "540", "1881"]]);
  await expect(androidTap.run({ element: 9 }, { cwd: "." })).rejects.toThrow(/no element 9/);
});

test("typing taps the field first and splits long text", async () => {
  await androidScreen.run({}, { cwd: "." });
  await androidType.run({ text: "a".repeat(50), element: 2, submit: true, screenshot: false }, { cwd: "." });
  expect(inputs).toEqual([["tap", "540", "875"], ["text", `'${"a".repeat(40)}'`], ["text", `'${"a".repeat(10)}'`], ["keyevent", "66"]]);
});

test("swipe up scrolls content by moving the finger up", async () => {
  await androidSwipe.run({ direction: "up", screenshot: false }, { cwd: "." });
  expect(inputs[0]).toEqual(["swipe", "540", "1920", "540", "480", "300"]);
});

test("android_run installs, launches and returns a screenshot", async () => {
  const dir = await mkdtemp(join(tmpdir(), "maxx-apk-"));
  await Bun.write(join(dir, "app.apk"), "fake");
  await Bun.write(join(dir, "app", "build.gradle.kts"), `android {\n  defaultConfig {\n    applicationId = "com.example.app"\n  }\n}\n`);
  const res = await androidRun.run({ apk: "app.apk", wait: 0 }, { cwd: dir });
  if (typeof res === "string") throw new Error(res);
  expect(res.text).toContain("launched com.example.app");
  expect(res.images).toHaveLength(1);
  expect(inputs.map((i) => i[0])).toEqual(["install", "launch"]);
});

test("device actions are recorded and can be replayed", async () => {
  const dir = await mkdtemp(join(tmpdir(), "maxx-replay-"));
  const file = join(dir, "s.jsonl");
  recordTo(file);
  await androidScreen.run({}, { cwd: "." });
  await androidTap.run({ element: 3, screenshot: false }, { cwd: "." });
  await androidType.run({ text: "hi", screenshot: false }, { cwd: "." });
  recordTo(null);
  expect((await Bun.file(file).text()).trim().split("\n")).toHaveLength(2);

  inputs.length = 0;
  const log: string[] = [];
  expect(await replay(file, { delayMs: 0, log: (s) => log.push(s) })).toBe(true);
  expect(inputs).toEqual([["tap", "540", "1880"], ["text", "'hi'"]]);
  expect(await Bun.file(join(dir, "s", "step-02.jpg")).exists()).toBe(true);
});

test("no device gives instructions instead of an adb error", async () => {
  setRunner(async (argv) => ({ code: 0, stdout: new TextEncoder().encode(argv.includes("devices") ? "List of devices attached\n\n" : ""), stderr: "" }));
  await expect(androidScreen.run({}, { cwd: "." })).rejects.toThrow(/Wireless debugging/);
  expect(text({ code: 0, stdout: new TextEncoder().encode("x"), stderr: "" })).toBe("x");
});
