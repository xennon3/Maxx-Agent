import { afterAll, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { androidDir, clean, failed, findWhisper, planRebuild, speakable, transcribe, wav, type TurnCall } from "../src/ui/voice.ts";
import { VOICE_JS } from "../src/ui/voice-page.ts";
import { startUI } from "../src/ui/server.ts";

const dir = () => mkdtempSync(join(tmpdir(), "maxx-voice-"));
const call = (name: string, args: object, result = "ok"): TurnCall => ({ name, args: JSON.stringify(args), result });

// A fake whisper.cpp server: answers on /inference only, like the real one.
const got: { path: string; type: string; size: number; lang?: string }[] = [];
const whisper = Bun.serve({
  port: 0,
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname !== "/inference") return new Response("not found", { status: 404 });
    const form = await req.formData();
    const f = form.get("file") as File;
    got.push({ path: url.pathname, type: f.type, size: f.size, lang: (form.get("language") as string) ?? undefined });
    return Response.json({ text: " [BLANK_AUDIO] make the snake faster\n" });
  },
});
afterAll(() => whisper.stop());

test("finds a Whisper: a server URL, or whisper-cli with a model in ~/.maxx/whisper", () => {
  expect(findWhisper({ whisper: "http://127.0.0.1:8178" })).toEqual({ kind: "url", url: "http://127.0.0.1:8178" });
  const home = dir();
  expect(findWhisper({}, () => "/usr/bin/whisper-cli", home)).toBeNull();
  mkdirSync(join(home, ".maxx", "whisper"), { recursive: true });
  writeFileSync(join(home, ".maxx", "whisper", "ggml-base.en.bin"), "");
  expect(findWhisper({}, () => "/usr/bin/whisper-cli", home)).toEqual({ kind: "cli", bin: "/usr/bin/whisper-cli", model: join(home, ".maxx", "whisper", "ggml-base.en.bin") });
  expect(findWhisper({}, () => null, home)).toBeNull();
});

test("sends a WAV to a whisper.cpp server, finding /inference from a bare host", async () => {
  const audio = wav(new Float32Array(16000));
  expect(new TextDecoder().decode(audio.slice(0, 4))).toBe("RIFF");
  expect(new DataView(audio.buffer).getUint32(24, true)).toBe(16000);
  expect(await transcribe({ kind: "url", url: `http://127.0.0.1:${whisper.port}` }, audio, "en")).toBe("make the snake faster");
  expect(got.at(-1)).toEqual({ path: "/inference", type: expect.stringMatching(/wav$/), size: audio.length, lang: "en" });
});

test("runs whisper-cli on a temporary file", async () => {
  if (process.platform === "win32") return;
  const d = dir();
  const bin = join(d, "whisper-cli");
  // Prints the size of the file it was given, the way whisper-cli prints the text.
  writeFileSync(bin, `#!/bin/sh\nwhile [ "$1" != "-f" ]; do shift; done\necho " heard $(wc -c < "$2" | tr -d ' ') bytes"\n`, { mode: 0o755 });
  expect(await transcribe({ kind: "cli", bin, model: "m.bin" }, wav(new Float32Array(100)))).toBe("heard 244 bytes");
});

test("drops Whisper's noise markers", () => {
  expect(clean("[BLANK_AUDIO]")).toBe("");
  expect(clean(" (music) add a score  counter [ Silence ]")).toBe("add a score counter");
});

test("plans the rebuild after a spoken change", () => {
  const web = dir();
  writeFileSync(join(web, "index.html"), "<h1>hi</h1>");
  const o = { android: false, phone: false, html: ["index.html", "about.html"] };
  expect(planRebuild(web, [call("read_file", { path: "game.js" })], o)).toEqual({ kind: "none", why: "nothing changed" });
  expect(planRebuild(web, [call("edit_file", { path: "game.js" })], o)).toEqual({ kind: "preview", args: { path: "index.html" } });
  expect(planRebuild(web, [call("write_file", { path: "about.html" })], o)).toEqual({ kind: "preview", args: { path: "about.html" } });
  expect(planRebuild(web, [call("edit_file", { path: "game.js" })], { ...o, serverUrl: "http://localhost:5173/" })).toEqual({ kind: "preview", args: { url: "http://localhost:5173/" } });
  expect(planRebuild(web, [call("edit_file", { path: "game.js" }), call("preview", { path: "index.html" })], o).kind).toBe("none");
  expect(planRebuild(web, [call("edit_file", { path: "game.js" }, "error: old_string not found")], o).kind).toBe("none");

  const app = dir();
  // Gradle projects carry both wrappers; Windows looks for gradlew.bat.
  for (const w of ["gradlew", "gradlew.bat"]) writeFileSync(join(app, w), "");
  const kt = [call("edit_file", { path: "app/src/main/java/com/x/MainActivity.kt" })];
  expect(planRebuild(app, kt, { android: true, phone: true, html: [] })).toEqual({ kind: "android", args: {} });
  expect(planRebuild(app, kt, { android: false, phone: true, html: [] })).toMatchObject({ kind: "none", why: expect.stringContaining("Android") });
  expect(planRebuild(app, kt, { android: true, phone: false, html: [] })).toMatchObject({ kind: "none", why: expect.stringContaining("no phone") });
  expect(planRebuild(app, [...kt, call("android_run", {}, "built in 40s\nlaunched com.x")], { android: true, phone: true, html: [] })).toMatchObject({ kind: "none", shown: "android" });

  const cap = dir();
  mkdirSync(join(cap, "android"));
  for (const w of ["gradlew", "gradlew.bat"]) writeFileSync(join(cap, "android", w), "");
  expect(androidDir(cap)).toBe("android");
  expect(planRebuild(cap, [call("edit_file", { path: "android/app/build.gradle" })], { android: true, phone: true, html: [] })).toEqual({ kind: "android", args: { project_dir: "android" } });
});

test("knows when a rebuild went wrong", () => {
  expect(failed("android", "build failed (exit 1):\n...")).toBe(true);
  expect(failed("android", "built in 3s\nlaunched com.x\nTHE APP CRASHED:\n...")).toBe(true);
  expect(failed("android", "built in 3s\nlaunched com.x")).toBe(false);
  expect(failed("preview", "opened index.html in the Preview panel.\ntitle: x\n2 error(s):\n  boom")).toBe(true);
  expect(failed("preview", "opened index.html in the Preview panel.\nno errors in the console.")).toBe(false);
});

test("reads the gist of a reply aloud, not code", () => {
  expect(speakable("Done. I made the **snake** faster in `game.js`:\n```js\nconst speed = 2;\n```\nTry it.")).toBe("Done. I made the snake faster in game.js: Try it.");
  const long = "First sentence here. " + "word ".repeat(100);
  expect(speakable(long, 80)).toBe("First sentence here.");
});

test("the mic script is valid JavaScript", () => {
  expect(VOICE_JS).not.toContain("`");
  expect(() => new Function("$", "token", "busy", "submit", "send", "stage", VOICE_JS)).not.toThrow();
});

test("the UI turns speech into text through its local Whisper, with its token only", async () => {
  const ui = await startUI({ baseURL: "http://127.0.0.1:9/v1", port: 0, open: false, whisper: `http://127.0.0.1:${whisper.port}` });
  try {
    const base = `http://127.0.0.1:${ui.server.port}`;
    const body = wav(new Float32Array(8000));
    expect((await fetch(`${base}/voice`, { method: "POST", body })).status).toBe(403);
    expect((await fetch(`${base}/voice?t=${ui.token}`, { method: "POST", body, headers: { origin: "https://evil.example" } })).status).toBe(403);
    const res = await fetch(`${base}/voice?t=${ui.token}`, { method: "POST", body, headers: { origin: base } });
    expect(await res.json()).toEqual({ text: "make the snake faster" });
  } finally {
    ui.stop();
  }
  const none = await startUI({ baseURL: "http://127.0.0.1:9/v1", port: 0, open: false, whisper: "/nonexistent/whisper-cli" });
  try {
    expect((await fetch(`http://127.0.0.1:${none.server.port}/voice?t=${none.token}`, { method: "POST", body: wav(new Float32Array(10)) })).status).toBe(404);
  } finally {
    none.stop();
  }
});
