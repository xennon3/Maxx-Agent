import { expect, test, beforeAll, afterAll } from "bun:test";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { findBrowser } from "../src/judge.ts";
import { evaluate } from "../src/browser.ts";
import { closeBrowser } from "../src/tools/browse.ts";
import { EDITOR, imageEdit, runCanvas, spriteSheet } from "../src/tools/canvas.ts";
import { drawSvg, designTokens, moodBoard, PAIRS, pickFonts, pickPair, svgProblems, toAndroidXml, toCompose, toCss, toTailwind, tokensFrom } from "../src/tools/design.ts";
import { buildPrompt, comfyGraph, defaultsFor, findBackend, imageGenerate, KEY_OUT } from "../src/tools/imagegen.ts";
import { ffmpegArgs, findVoice, sapiScript, video } from "../src/tools/media.ts";
import { TOOLSETS } from "../src/tools/index.ts";

const tmp = (p = "maxx-t3-") => mkdtemp(join(tmpdir(), p));
const chromium = findBrowser() ?? (Bun.file("/opt/pw-browsers/chromium").size ? "/opt/pw-browsers/chromium" : null);
const ffmpeg = Bun.which("ffmpeg");
const text = (r: unknown) => (typeof r === "string" ? r : (r as { text: string }).text);

beforeAll(() => {
  if (chromium) process.env.MAXX_BROWSER ??= chromium;
  process.env.MAXX_HOME = join(tmpdir(), `maxx-t3-home-${process.pid}`);
});
afterAll(() => closeBrowser());

// Draw a PNG in the browser: a red square on whatever background.
async function makePng(w: number, h: number, bg: string, box?: { x: number; y: number; w: number; h: number; color: string }): Promise<Uint8Array> {
  const b64 = await evaluate<string>(process.env.MAXX_BROWSER!, `(() => { const c = document.createElement("canvas"); c.width = ${w}; c.height = ${h}; const g = c.getContext("2d");
    ${bg === "transparent" ? "" : `g.fillStyle = ${JSON.stringify(bg)}; g.fillRect(0, 0, ${w}, ${h});`}
    ${box ? `g.fillStyle = ${JSON.stringify(box.color)}; g.fillRect(${box.x}, ${box.y}, ${box.w}, ${box.h});` : ""}
    return c.toDataURL("image/png").split(",")[1]; })()`);
  return Buffer.from(b64, "base64");
}

// Size and the RGBA at some points of an image file.
async function pixels(bytes: Uint8Array, points: [number, number][] = []) {
  return evaluate<{ w: number; h: number; px: number[][] }>(process.env.MAXX_BROWSER!, `(async () => { ${EDITOR}
    const c = fromImg(await load("data:image/png;base64,${Buffer.from(bytes).toString("base64")}"));
    const g = c.getContext("2d");
    return { w: c.width, h: c.height, px: ${JSON.stringify(points)}.map(([x, y]) => [...g.getImageData(x, y, 1, 1).data]) };
  })()`);
}

test("the studio and media toolsets hold the new tools", () => {
  expect(TOOLSETS.studio!.tools.map((t) => t.name)).toEqual(["draw_svg", "image_edit", "sprite_sheet", "make_icons", "design_tokens", "pick_fonts", "mood_board"]);
  expect(TOOLSETS.media!.tools.map((t) => t.name)).toEqual(["image_generate", "speak", "video"]);
  for (const t of [...TOOLSETS.studio!.tools, ...TOOLSETS.media!.tools]) expect(t.description.length).toBeLessThan(700);
});

// ---- image editing ----

test.skipIf(!chromium)("image_edit chains ops: remove the background, trim, pad, scale up pixel art", async () => {
  const dir = await tmp();
  await writeFile(join(dir, "hero.png"), await makePng(64, 64, "#ffffff", { x: 16, y: 24, w: 20, h: 10, color: "#ff0000" }));
  const r = await imageEdit.run({ input: "hero.png", output: "out/hero.png", ops: [{ op: "remove_bg" }, { op: "trim" }, { op: "pad", size: 2 }, { op: "scale", factor: 4, smooth: false }] }, { cwd: dir });
  expect(text(r)).toContain("saved out/hero.png (96x56");
  const p = await pixels(await readFile(join(dir, "out/hero.png")), [[0, 0], [48, 28]]);
  expect(p.px[0]![3]).toBe(0); // padding is see-through
  expect(p.px[1]!.slice(0, 4)).toEqual([255, 0, 0, 255]);
}, 60_000);

test.skipIf(!chromium)("image_edit recolors, rotates, writes JPEG, and reports unknown ops", async () => {
  const dir = await tmp();
  await writeFile(join(dir, "a.png"), await makePng(40, 20, "#336699"));
  expect(text(await imageEdit.run({ input: "a.png", output: "b.png", ops: [{ op: "grayscale" }, { op: "rotate", degrees: 90 }] }, { cwd: dir }))).toContain("20x40");
  const g = await pixels(await readFile(join(dir, "b.png")), [[10, 20]]);
  expect(g.px[0]![0]).toBe(g.px[0]![1]);
  expect(g.px[0]![1]).toBe(g.px[0]![2]);
  expect(text(await imageEdit.run({ input: "a.png", output: "c.jpg", ops: [{ op: "palette", colors: ["#000000", "#ffffff"] }] }, { cwd: dir }))).toContain("saved c.jpg");
  expect([...(await readFile(join(dir, "c.jpg"))).subarray(0, 2)]).toEqual([0xff, 0xd8]);
  expect(text(await imageEdit.run({ input: "missing.png", ops: [{ op: "trim" }] }, { cwd: dir }))).toContain("does not exist");
}, 60_000);

test.skipIf(!chromium)("sprite_sheet packs frames from a glob and writes an atlas", async () => {
  const dir = await tmp();
  await mkdir(join(dir, "art"));
  for (let i = 1; i <= 5; i++) await writeFile(join(dir, `art/walk-${i}.png`), await makePng(16, 24, "transparent", { x: i, y: 0, w: 4, h: 4, color: "#00ff00" }));
  const r = await spriteSheet.run({ frames: ["art/walk-*.png"], output: "assets/walk.png", pixel: true }, { cwd: dir });
  expect(text(r)).toContain("packed 5 frames");
  const atlas = JSON.parse(await readFile(join(dir, "assets/walk.json"), "utf8"));
  expect(atlas.columns).toBe(3);
  expect(atlas.size).toEqual({ w: 48, h: 48 });
  expect(atlas.frames["walk-5"]).toEqual({ x: 16, y: 24, w: 16, h: 24 });
  expect(text(await spriteSheet.run({ frames: ["nope/*.png"], output: "x.png" }, { cwd: dir }))).toContain("no frames matched");
}, 60_000);

test.skipIf(!chromium)("runCanvas keys out the magenta backdrop of a generated sprite", async () => {
  const src = await makePng(32, 32, "#ff00ff", { x: 8, y: 8, w: 16, h: 16, color: "#2266ff" });
  const out = (await runCanvas(src, { draw: KEY_OUT }))!;
  const p = await pixels(out, [[1, 1], [16, 16]]);
  expect(p.px[0]![3]).toBe(0);
  expect(p.px[1]).toEqual([34, 102, 255, 255]);
}, 60_000);

// ---- design ----

test("svgProblems names what makes SVG art break", () => {
  expect(svgProblems('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"/>')).toEqual([]);
  const p = svgProblems('<svg><script>x()</script><image href="https://x/y.png"/></svg>').join(" ");
  expect(p).toContain("xmlns");
  expect(p).toContain("viewBox");
  expect(p).toContain("<script>");
  expect(p).toContain("on the web");
});

test.skipIf(!chromium)("draw_svg saves the SVG, renders it, and writes PNG copies", async () => {
  const dir = await tmp();
  const r = await drawSvg.run({ path: "assets/logo.svg", svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="#e11d48"/></svg>', png: [32, 128] }, { cwd: dir });
  expect(typeof r === "string" ? [] : r.images).toHaveLength(1);
  expect(existsSync(join(dir, "assets/logo.svg"))).toBe(true);
  const p = await pixels(await readFile(join(dir, "assets/logo-128.png")).catch(() => readFile(join(dir, "assets/logo.128.png"))), [[64, 64], [1, 1]]);
  expect(p.w).toBe(128);
  expect(p.px[0]!.slice(0, 3)).toEqual([225, 29, 72]);
  expect(p.px[1]![3]).toBe(0);
}, 60_000);

test("tokens come out as CSS, Tailwind, Android XML and Compose", () => {
  const t = tokensFrom({ name: "forest", colors: ["#264653", "#2a9d8f", "#e9c46a"], bg: "#ffffff" } as any, { radius: "round" });
  expect(t.color.primary).toMatch(/^#[0-9a-f]{6}$/);
  expect(t.radius.md).toBe("16px");
  expect(t.color["on-primary"]).toMatch(/#ffffff|#111111/);
  expect(toCss(t)).toContain("--color-primary:");
  expect(toCss(t)).toContain("--space-4: 16px;");
  expect(toTailwind(t)).toContain('"primary": "var(--color-primary)"');
  const x = toAndroidXml(t);
  expect(x.colors).toContain('<color name="token_on_primary">');
  expect(x.dimens).toContain('<dimen name="token_space_4">16dp</dimen>');
  expect(x.dimens).toContain('<dimen name="token_text_base">16sp</dimen>');
  const k = toCompose(t, "com.example.app");
  expect(k).toStartWith("package com.example.app");
  expect(k).toContain("val onPrimary = Color(0xFF");
  expect(k).toContain("val space4 = 16.dp");
});

test("design_tokens writes the files the project uses, and re-exports after an edit", async () => {
  const dir = await tmp();
  await mkdir(join(dir, "app/src/main/res"), { recursive: true });
  await writeFile(join(dir, "app/build.gradle.kts"), 'android { namespace = "com.fox.game" }\ndependencies { implementation("androidx.compose.ui:ui") }\n');
  await writeFile(join(dir, "tailwind.config.js"), "module.exports = {}\n");
  const r = text(await designTokens.run({ palette: "#264653 #2a9d8f #e9c46a" }, { cwd: dir }));
  expect(r).toContain("wrote");
  for (const f of ["design/tokens.json", "design/tokens.css", "design/tailwind.tokens.cjs", "app/src/main/res/values/tokens_colors.xml", "app/src/main/res/values/tokens_dimens.xml"]) expect(existsSync(join(dir, f))).toBe(true);
  const kt = [...new Bun.Glob("**/Tokens.kt").scanSync({ cwd: dir })];
  expect(kt).toHaveLength(1);
  expect(await readFile(join(dir, kt[0]!), "utf8")).toContain("package com.fox.game");
  const t = JSON.parse(await readFile(join(dir, "design/tokens.json"), "utf8"));
  t.color.primary = "#123456";
  await writeFile(join(dir, "design/tokens.json"), JSON.stringify(t));
  await designTokens.run({ export: true }, { cwd: dir });
  expect(await readFile(join(dir, "design/tokens.css"), "utf8")).toContain("--color-primary: #123456;");
  expect(text(await designTokens.run({ palette: "not a color at all ###" }, { cwd: await tmp() }))).toBeTruthy();
}, 60_000);

test("pick_fonts matches a mood, and works offline with fallbacks", async () => {
  expect(PAIRS.length).toBeGreaterThanOrEqual(20);
  expect(pickPair("developer docs for a terminal tool").heading).toBe("JetBrains Mono");
  expect(pickPair("relaxed beach cafe").heading).toBe("Pacifico");
  const dir = await tmp();
  await mkdir(join(dir, "design"));
  await writeFile(join(dir, "design/tokens.json"), JSON.stringify(tokensFrom({ name: "x", colors: ["#ff0000"] } as any)));
  const r = text(await pickFonts.run({ mood: "developer terminal" }, { cwd: dir, network: false }));
  expect(r).toContain("JetBrains Mono for headings");
  expect(r).toContain("Not downloaded");
  expect(await readFile(join(dir, "fonts/fonts.css"), "utf8")).toContain("--font-heading: 'JetBrains Mono', ui-monospace");
  expect(JSON.parse(await readFile(join(dir, "design/tokens.json"), "utf8")).font.heading).toContain("JetBrains Mono");
}, 60_000);

test.skipIf(!chromium)("mood_board pulls the main colors out of reference images", async () => {
  const dir = await tmp();
  await writeFile(join(dir, "a.png"), await makePng(100, 100, "#1e3a8a", { x: 0, y: 0, w: 100, h: 30, color: "#f59e0b" }));
  await writeFile(join(dir, "b.png"), await makePng(100, 100, "#1e3a8a"));
  const r = text(await moodBoard.run({ sources: ["a.png", "b.png", "gone.png"], name: "night market" }, { cwd: dir, network: false }));
  expect(r).toContain("from 2 reference(s)");
  expect(r).toContain("gone.png (not found)");
  expect(r).toMatch(/#1e3a8a \(\d+%\)/);
  expect(r).toContain("mostly dark");
  expect(await readFile(join(dir, "design/moodboard.html"), "utf8")).toContain("night market");
}, 90_000);

// ---- image generation ----

test("prompts, step defaults and the ComfyUI graph", () => {
  expect(buildPrompt("a fox", "pixel-art", true)).toContain("magenta");
  expect(buildPrompt("a fox", "my own look")).toBe("a fox, my own look");
  expect(defaultsFor("flux1-schnell.safetensors")).toEqual({ steps: 4, cfg: 1 });
  expect(defaultsFor("sd_xl_turbo_1.0")).toEqual({ steps: 6, cfg: 1.5 });
  expect(defaultsFor("dreamshaper")).toEqual({ steps: 24, cfg: 6 });
  const g = comfyGraph({ ckpt: "m.safetensors", prompt: "p", negative: "n", width: 512, height: 512, steps: 4, cfg: 1, seed: 7, n: 2 });
  expect(g["3"].inputs.sampler_name).toBe("euler_ancestral");
  expect(g["5"].inputs.batch_size).toBe(2);
  expect(g["9"].class_type).toBe("SaveImage");
});

test.skipIf(!chromium)("image_generate talks to an Automatic1111/Forge server and removes the background", async () => {
  const png = Buffer.from(await makePng(64, 64, "#ff00ff", { x: 16, y: 16, w: 32, h: 32, color: "#22aa22" })).toString("base64");
  const seen: any[] = [];
  const srv = Bun.serve({
    port: 0,
    async fetch(req) {
      const u = new URL(req.url);
      if (u.pathname === "/sdapi/v1/sd-models") return Response.json([{ title: "sd_xl_turbo_1.0.safetensors" }]);
      if (u.pathname === "/sdapi/v1/txt2img") {
        seen.push(await req.json());
        return Response.json({ images: [png, png] });
      }
      return new Response("no", { status: 404 });
    },
  });
  process.env.MAXX_IMAGES_URL = `http://127.0.0.1:${srv.port}`;
  try {
    expect(await findBackend()).toMatchObject({ kind: "a1111", models: ["sd_xl_turbo_1.0.safetensors"] });
    const dir = await tmp();
    const r = await imageGenerate.run({ prompt: "a green slime", style: "game-sprite", transparent: true, count: 2, seed: 42, width: 512, height: 512 }, { cwd: dir });
    expect(text(r)).toContain("made 2 image(s)");
    expect(text(r)).toContain("seed 42");
    expect(seen[0]).toMatchObject({ steps: 6, cfg_scale: 1.5, seed: 42, batch_size: 2, width: 512 });
    expect(seen[0].prompt).toContain("2D game sprite");
    const p = await pixels(await readFile(join(dir, "assets/a-green-slime-1.png")), [[2, 2], [32, 32]]);
    expect(p.px[0]![3]).toBe(0);
    expect(p.px[1]![3]).toBe(255);
    expect(existsSync(join(dir, "assets/a-green-slime-2.png"))).toBe(true);
  } finally {
    delete process.env.MAXX_IMAGES_URL;
    srv.stop(true);
  }
}, 60_000);

test("image_generate runs a ComfyUI job: submit, wait on history, fetch the picture", async () => {
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
  let polls = 0;
  let graph: any;
  const srv = Bun.serve({
    port: 0,
    async fetch(req) {
      const u = new URL(req.url);
      if (u.pathname === "/system_stats") return Response.json({ system: {} });
      if (u.pathname === "/object_info/CheckpointLoaderSimple") return Response.json({ CheckpointLoaderSimple: { input: { required: { ckpt_name: [["flux1-schnell.safetensors"]] } } } });
      if (u.pathname === "/prompt") {
        graph = ((await req.json()) as any).prompt;
        return Response.json({ prompt_id: "job1" });
      }
      if (u.pathname === "/history/job1") return Response.json(++polls < 2 ? {} : { job1: { status: { status_str: "success" }, outputs: { "9": { images: [{ filename: "maxx_0001.png", subfolder: "", type: "output" }] } } } });
      if (u.pathname === "/view" && u.searchParams.get("filename") === "maxx_0001.png") return new Response(png);
      return new Response("no", { status: 404 });
    },
  });
  process.env.MAXX_IMAGES_URL = `http://127.0.0.1:${srv.port}`;
  try {
    const dir = await tmp();
    const r = await imageGenerate.run({ prompt: "castle", path: "bg/castle.png", seed: 1 }, { cwd: dir });
    expect(text(r)).toContain("bg/castle.png");
    expect(graph["4"].inputs.ckpt_name).toBe("flux1-schnell.safetensors");
    expect(graph["3"].inputs.steps).toBe(4);
    expect(await readFile(join(dir, "bg/castle.png"))).toEqual(png);
  } finally {
    delete process.env.MAXX_IMAGES_URL;
    srv.stop(true);
  }
}, 30_000);

test("image_generate explains how to start a model when none is running", async () => {
  process.env.MAXX_IMAGES_URL = "http://127.0.0.1:9";
  try {
    expect(text(await imageGenerate.run({ prompt: "x" }, { cwd: await tmp() }))).toContain("No local image model is running");
  } finally {
    delete process.env.MAXX_IMAGES_URL;
  }
});

// ---- voice and video ----

test("voices: Piper first, then the system's own", () => {
  const none = () => null;
  expect(findVoice(none, { MAXX_PIPER: "/x/piper", MAXX_PIPER_VOICE: "/v/en.onnx" }, "linux")).toEqual({ kind: "piper", bin: "/x/piper", model: "/v/en.onnx" });
  expect(findVoice(none, {}, "win32")!.kind).toBe("sapi");
  expect(findVoice((b) => (b === "say" ? "/usr/bin/say" : null), {}, "darwin")!.kind).toBe("say");
  expect(findVoice((b) => (b === "espeak-ng" ? "/usr/bin/espeak-ng" : null), {}, "linux")).toEqual({ kind: "espeak", bin: "/usr/bin/espeak-ng" });
  expect(findVoice(none, {}, "linux")).toBeNull();
  const s = sapiScript("C:\\t\\it's.txt", "C:\\o.wav", 30, "Zira");
  expect(s).toContain("'C:\\t\\it''s.txt'");
  expect(s).toContain("$s.Rate = 10");
  expect(s).toContain("*Zira*");
});

test("ffmpeg recipes", () => {
  const abs = (p: string) => `/p/${p}`;
  expect(ffmpegArgs({ action: "trim", input: "a.mp4", output: "b.mp4", start: "00:00:02", end: "00:00:05" }, abs)).toEqual(["-ss", "00:00:02", "-to", "00:00:05", "-i", "/p/a.mp4", "-c:v", "libx264", "-crf", "24", "-preset", "veryfast", "-c:a", "aac", "-movflags", "+faststart", "/p/b.mp4"]);
  expect((ffmpegArgs({ action: "gif", input: "a.mp4", output: "a.gif", fps: 10, width: 320 }, abs) as string[]).join(" ")).toContain("fps=10,scale=320:-1:flags=lanczos,split");
  expect(ffmpegArgs({ action: "frames_to_video", output: "o.mp4" }, abs)).toContain("needs pattern");
  expect(ffmpegArgs({ action: "concat", output: "o.mp4" }, abs)).toContain("needs inputs");
  expect(ffmpegArgs({ action: "extract_audio", input: "a.mp4", output: "a.wav" }, abs)).toEqual(["-i", "/p/a.mp4", "-vn", "/p/a.wav"]);
  expect(ffmpegArgs({ action: "compress", input: "a.mp4", output: "s.mp4", quality: "small" }, abs)).toContain("36");
});

test.skipIf(!ffmpeg)("video makes a clip from frames, then a GIF and a thumbnail from it", async () => {
  const dir = await tmp();
  const ff = (args: string[]) => Bun.spawnSync([ffmpeg!, "-y", "-loglevel", "error", ...args], { cwd: dir });
  await mkdir(join(dir, "frames"));
  ff(["-f", "lavfi", "-i", "testsrc=size=160x120:rate=10", "-frames:v", "12", "frames/f-%03d.png"]);
  expect(text(await video.run({ action: "frames_to_video", pattern: "frames/f-%03d.png", output: "out/clip.mp4", fps: 10 }, { cwd: dir }))).toContain("saved out/clip.mp4");
  expect(text(await video.run({ action: "gif", input: "out/clip.mp4", output: "out/clip.gif", width: 120 }, { cwd: dir }))).toContain("saved out/clip.gif");
  expect((await readFile(join(dir, "out/clip.gif"))).subarray(0, 6).toString()).toBe("GIF89a");
  expect(text(await video.run({ action: "thumbnail", input: "out/clip.mp4", output: "out/thumb.png", start: "0.5" }, { cwd: dir }))).toContain("saved");
  expect(existsSync(join(dir, "out/thumb.png"))).toBe(true);
  expect(text(await video.run({ action: "trim", input: "nope.mp4", output: "x.mp4" }, { cwd: dir }))).toContain("does not exist");
}, 60_000);
