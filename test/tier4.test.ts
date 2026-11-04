import { afterAll, beforeAll, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { Agent, type AgentIO } from "../src/loop.ts";
import { Permissions } from "../src/permissions.ts";
import { findBrowser } from "../src/judge.ts";
import { closeBrowser } from "../src/tools/browse.ts";
import { encodeGif, letterbox, pickPalette } from "../src/gif.ts";
import { clearReel, listFrames, makeTimelapse, saveFrame, thin, timelapseTool, timing } from "../src/timelapse.ts";
import { crimeList, findCrimes } from "../src/crimes.ts";
import { toShot, type Image, type Raw } from "../src/image.ts";
import {
  assetKit, dims, extractHtml, extractSvg, kitMessages, loadTaste, parseFeedback, parseKit, parseScores, personaPrompt, personaTest, pickRivals,
  rivalDesigns, sketchToApp, tasteFile, tasteSummary, uglyCheck, DESIGNERS,
} from "../src/tools/director.ts";
import { TOOLSETS } from "../src/tools/index.ts";
import type { ToolContext, ToolResult } from "../src/tools/types.ts";

const tmp = (p = "maxx-t4-") => mkdtemp(join(tmpdir(), p));
const chromium = findBrowser() ?? (Bun.file("/opt/pw-browsers/chromium").size ? "/opt/pw-browsers/chromium" : null);
const ffmpeg = Bun.which("ffmpeg");
const text = (r: ToolResult) => (typeof r === "string" ? r : r.text);
const images = (r: ToolResult) => (typeof r === "string" ? [] : (r.images ?? []));

// A scripted fake of LM Studio's streaming chat endpoint (see loop.test.ts).
type Reply = { text?: string; tool?: { name: string; args: object } };
let script: Reply[] = [];
const requests: any[] = [];
const server = Bun.serve({
  port: 0,
  async fetch(req) {
    requests.push(await req.json());
    const r = script.shift() ?? { text: "DONE" };
    const chunks: object[] = [];
    if (r.text) chunks.push({ choices: [{ delta: { content: r.text } }] });
    if (r.tool) chunks.push({ choices: [{ delta: { tool_calls: [{ index: 0, id: `call_${requests.length}`, function: { name: r.tool.name, arguments: JSON.stringify(r.tool.args) } }] } }] });
    return new Response(chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join("") + "data: [DONE]\n\n", { headers: { "content-type": "text/event-stream" } });
  },
});
const llm = { baseURL: `http://localhost:${server.port}/v1`, model: "fake" };

beforeAll(() => {
  if (chromium) process.env.MAXX_BROWSER ??= chromium;
  process.env.MAXX_HOME = join(tmpdir(), `maxx-t4-home-${process.pid}`);
  process.env.MAXX_IMAGES_URL = "http://127.0.0.1:9";
});
afterAll(async () => {
  server.stop();
  await closeBrowser();
});

const solid = (w: number, h: number, rgb: [number, number, number], stripe?: [number, number, number]): Raw => {
  const data = new Uint8Array(w * h * 4);
  for (let i = 0; i < w * h; i++) data.set([...(stripe && i % w < w / 3 ? stripe : rgb), 255], i * 4);
  return { width: w, height: h, data };
};

const UGLY = `<!doctype html><meta name=viewport content="width=device-width"><body style="margin:0;font-family:sans-serif">
<h1 style="color:#bbb;background:#fff">Pale title</h1>
<button style="width:20px;height:20px">x</button>
<div style="width:900px;height:10px;background:#333"></div>
<small style="font-size:9px">fine print here</small></body>`;
const CLEAN = `<!doctype html><meta name=viewport content="width=device-width, initial-scale=1"><body style="margin:0;padding:16px;font:16px/1.5 sans-serif;background:#fff;color:#1c1917">
<h1>Fresh bread daily</h1><p>Order before noon and we bake it for you.</p><button style="padding:12px 20px;font-size:16px;background:#1d4ed8;color:#fff;border:0;border-radius:8px">Order now</button></body>`;

test("the director toolset", () => {
  expect(TOOLSETS.director!.tools.map((t) => t.name)).toEqual(["rival_designs", "sketch_to_app", "asset_kit", "persona_test", "ugly_check", "timelapse"]);
});

// ---- GIF and time-lapse ----

test("the palette keeps an accent colour next to big flat areas", () => {
  const p = pickPalette([solid(100, 100, [250, 250, 250], [200, 20, 60])]);
  expect(p.length).toBeGreaterThanOrEqual(2);
  expect(p.some((c) => c[0] > 190 && c[1] < 40)).toBe(true);
});

test.skipIf(!ffmpeg)("GIFs decode in ffmpeg with the right frames, timing and colours", async () => {
  const dir = await tmp();
  // A noisy frame forces the LZW table to fill and reset.
  const noise = solid(120, 90, [0, 0, 0]);
  for (let i = 0; i < noise.data.length; i += 4) noise.data.set([(i * 7) % 256, (i * 13) % 256, (i * 29) % 256], i);
  const gif = encodeGif([solid(120, 90, [220, 30, 30]), noise, solid(120, 90, [30, 30, 220], [255, 255, 255])], [200, 200, 1000]);
  await writeFile(join(dir, "t.gif"), gif);
  const probe = Bun.spawnSync(["ffprobe", "-v", "error", "-count_frames", "-show_entries", "stream=nb_read_frames,width,height", "-of", "csv=p=0", join(dir, "t.gif")]);
  expect(probe.stdout.toString().trim()).toBe("120,90,3");
  Bun.spawnSync([ffmpeg!, "-v", "error", "-i", join(dir, "t.gif"), "-vf", "select=eq(n\\,2)", "-frames:v", "1", "-pix_fmt", "rgb24", "-f", "rawvideo", "-y", join(dir, "f.rgb")]);
  const raw = new Uint8Array(await readFile(join(dir, "f.rgb")));
  const at = (x: number, y: number) => [...raw.subarray((y * 120 + x) * 3, (y * 120 + x) * 3 + 3)];
  for (const [v, want] of [[at(100, 50), [30, 30, 220]], [at(5, 5), [255, 255, 255]]] as const) for (let k = 0; k < 3; k++) expect(Math.abs(v[k]! - want[k]!)).toBeLessThanOrEqual(8);
});

test("letterboxing and film timing", () => {
  const l = letterbox(solid(40, 80, [255, 0, 0]), 100, 100);
  expect([l.width, l.height]).toEqual([100, 100]);
  expect([...l.data.subarray(0, 3)]).toEqual([17, 17, 20]);
  expect([...l.data.subarray((50 * 100 + 50) * 4, (50 * 100 + 50) * 4 + 3)]).toEqual([255, 0, 0]);
  expect(thin([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 4)).toEqual([1, 4, 7, 10]);
  const t = timing(400, 20);
  expect(t.keep).toBeLessThanOrEqual(120);
  expect(t.keep * t.delay).toBeLessThanOrEqual(20_000);
  expect(timing(3, 20)).toMatchObject({ keep: 3, delay: 1200, hold: 2500 });
});

test("frames are saved once per change and become a looping GIF", async () => {
  const dir = await tmp();
  const a = toShot(solid(200, 120, [240, 240, 240])), b = toShot(solid(200, 120, [20, 120, 220]));
  expect(await saveFrame(dir, a, "index.html")).toContain("00001");
  expect(await saveFrame(dir, a)).toBeNull(); // the same picture again
  expect(await saveFrame(dir, b)).toContain("00002");
  expect(await saveFrame(dir, toShot(solid(100, 200, [10, 200, 10])))).toContain("00003"); // a phone-shaped frame
  expect(await readFile(join(dir, ".maxx/timelapse/.gitignore"), "utf8")).toBe("*\n");
  expect(text(await timelapseTool.run({ action: "status" }, { cwd: dir }))).toContain("3 frame(s)");
  const r = await timelapseTool.run({ action: "make", output: "docs/build.gif" }, { cwd: dir });
  expect(text(r)).toContain("saved docs/build.gif: 3 of 3 frames");
  expect((await readFile(join(dir, "docs/build.gif"))).subarray(0, 6).toString()).toBe("GIF89a");
  expect(images(r)).toHaveLength(1);
  await timelapseTool.run({ action: "clear" }, { cwd: dir });
  expect(await listFrames(dir)).toEqual([]);
  expect(await makeTimelapse(dir, "x.gif")).toBeNull();
  expect(text(await timelapseTool.run({ action: "make" }, { cwd: dir }))).toContain("no frames yet");
});

// ---- ugliness alarm ----

test.skipIf(!chromium)("the alarm finds design crimes and passes a clean page", async () => {
  const dir = await tmp();
  await writeFile(join(dir, "ugly.html"), UGLY);
  await writeFile(join(dir, "clean.html"), CLEAN);
  const crimes = await findCrimes(process.env.MAXX_BROWSER!, pathToFileURL(join(dir, "ugly.html")).href);
  expect(crimes.map((c) => c.kind).sort()).toEqual(["contrast", "tap", "tiny-text", "wide"]);
  expect(crimeList(crimes)).toContain("is 900px wide on a 390px screen");
  expect(crimeList(crimes)).toContain("20x20px is too small to tap (aim for 44px");
  expect(await findCrimes(process.env.MAXX_BROWSER!, pathToFileURL(join(dir, "clean.html")).href)).toEqual([]);
  expect(text(await uglyCheck.run({ target: "clean.html" }, { cwd: dir }))).toContain("no design crimes");
  expect(text(await uglyCheck.run({ target: "ugly.html" }, { cwd: dir }))).toContain("4 design crime(s)");
}, 60_000);

test.skipIf(!chromium)("after a page changes, the loop sends the crimes back before the model may finish, and films the change", async () => {
  const dir = await tmp();
  const log: string[] = [];
  const io: AgentIO = { token: () => {}, toolStart: (n) => log.push(`start ${n}`), toolEnd: (n, r) => log.push(`end ${n}: ${r.split("\n")[0]}`), note: (t) => log.push(`note ${t}`), ask: async () => "yes" };
  const permissions = await new Permissions(dir, "yolo").load();
  const agent = await new Agent({ llm, cwd: dir, permissions, vision: { mode: "off" }, fixTries: 1, check: false, contextWindow: 16384, alarm: true, timelapse: true, plan: false, memory: false, mapTokens: 0 }, io).init();
  script = [{ tool: { name: "write_file", args: { path: "index.html", content: UGLY } } }, { text: "Done!" }, { tool: { name: "write_file", args: { path: "index.html", content: CLEAN } } }, { text: "Fixed the crimes." }];
  requests.length = 0;
  const answer = await agent.send("make a page");
  expect(answer).toBe("Fixed the crimes.");
  expect(log.some((l) => l.startsWith("end ugly_check: 1. sideways scroll"))).toBe(true);
  const alarm = requests[2].messages.at(-1).content;
  expect(JSON.stringify(alarm)).toContain("ugliness alarm");
  expect(JSON.stringify(alarm)).toContain("too small to tap");
  // One round per turn: the fixed page is not checked again.
  expect(log.filter((l) => l.startsWith("start ugly_check"))).toHaveLength(1);
  await agent.framesSettled();
  expect(await listFrames(dir)).toHaveLength(2);
  await clearReel(dir);
}, 90_000);

// ---- rival designer ----

const page = (title: string, bg: string) => `<!doctype html><html><head><meta name="viewport" content="width=device-width"></head><body style="margin:0;padding:20px;background:${bg};color:#111;font:18px sans-serif"><h1>${title}</h1><button style="padding:14px 22px;font-size:16px">Play</button></body></html>`;

test("rival helpers: html and svg from replies, scores, picks and taste", () => {
  expect(extractHtml("Sure!\n```html\n<!DOCTYPE html><html><body>x</body></html>\n```")).toBe("<!DOCTYPE html><html><body>x</body></html>\n");
  expect(extractHtml("<div>only a fragment</div>")).toContain("<body>\n<div>only a fragment</div>");
  expect(extractHtml("no html at all")).toBeNull();
  expect(extractSvg('here: <svg viewBox="0 0 4 4"><rect/></svg> ok')).toBe('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 4"><rect/></svg>');
  expect(parseScores("A: 8 - clean and calm\nB: 6/10 - busy")).toMatchObject({ a: 8, b: 6 });
  const seq = [0.1, 0.0, 0.3];
  const [a, b] = pickRivals(['- 2026-11-01 picked "Editorial" over "Brutalist" for "x"'], () => seq.shift() ?? 0);
  expect(a).toBe("Editorial");
  expect(b).not.toBe("Editorial");
  expect(Object.keys(DESIGNERS)).toContain(b);
  expect(tasteSummary(['- d picked "Editorial" over "Brutalist" for "x"', '- d picked "Editorial" over "Neon arcade" for "y"', '- d mixed "A" and "B" for "z"; said: warmer colours'])).toBe('The user\'s design taste, from their picks: liked Editorial (2); passed over Brutalist, Neon arcade; said "warmer colours".');
});

test.skipIf(!chromium)("rival_designs builds two designs, asks the user, saves the winner and learns the taste", async () => {
  const dir = await tmp();
  const asked: any[] = [];
  const shown: Image[][] = [];
  const ctx: ToolContext = {
    cwd: dir,
    think: async (m) => (String(m[0]!.content).includes("Swiss minimalist") ? "```html\n" + page("Swiss", "#ffffff") + "\n```" : page("Neon", "#f0f0ff")),
    see: async (imgs) => (imgs.length === 2 ? "A: 7 - tidy\nB: 9 - fun" : null),
    ask: async (q) => (asked.push(q), "B: Neon arcade"),
    show: (i) => shown.push(i),
  };
  const r = await rivalDesigns.run({ brief: "a landing page for a pinball game", path: "index.html", styles: ["Swiss minimalist", "Neon arcade"] }, ctx);
  expect(text(r)).toContain("The user picked B (Neon arcade). It is now index.html");
  expect(await readFile(join(dir, "index.html"), "utf8")).toContain("<h1>Neon</h1>");
  expect(await readFile(join(dir, "design/rivals/a.html"), "utf8")).toContain("<h1>Swiss</h1>");
  expect(await readFile(join(dir, "design/rivals/index.html"), "utf8")).toContain('<iframe src="b.html">');
  expect(asked[0].guess).toBe("B: Neon arcade");
  expect(asked[0].question).toContain("vision 9/10");
  expect(shown[0]).toHaveLength(2);
  expect(images(r)).toHaveLength(2);
  expect((await loadTaste()).at(-1)).toContain('picked "Neon arcade" over "Swiss minimalist" for "a landing page for a pinball game"');
  // A typed answer is a mix, and is remembered as said.
  ctx.ask = async () => "A's layout with B's colours";
  expect(text(await rivalDesigns.run({ brief: "a menu", styles: ["Swiss minimalist", "Neon arcade"] }, ctx))).toContain('The user wants a mix: "A\'s layout with B\'s colours"');
  expect(await readFile(tasteFile(), "utf8")).toContain("said: A's layout with B's colours");
  expect(text(await rivalDesigns.run({ brief: "x" }, { cwd: dir }))).toContain("needs the agent loop");
}, 90_000);

// ---- sketch to app ----

test.skipIf(!chromium)("sketch_to_app reads the sketch (or asks the eyes to), writes the page and shows both", async () => {
  const dir = await tmp();
  const sketch = toShot(solid(300, 520, [250, 250, 245], [40, 40, 40]));
  await writeFile(join(dir, "sketch.jpg"), Buffer.from(sketch.base64, "base64"));
  expect(dims(sketch)).toEqual({ width: 300, height: 520 });
  let seen: any;
  const native: ToolContext = { cwd: dir, vision: { mode: "native" }, think: async (m) => ((seen = m), "```html\n" + page("From sketch", "#fff") + "\n```") };
  const r = await sketchToApp.run({ path: "web/index.html", image: "sketch.jpg", notes: "a recipe app" }, native);
  expect(text(r)).toContain("wrote web/index.html from the sketch (phone layout)");
  expect(images(r)).toHaveLength(2);
  expect(seen[1].content[1].type).toBe("image_url");
  expect(seen[1].content[0].text).toContain("Notes from the user: a recipe app");
  // A text-only main model gets the vision model's description instead.
  await mkdir(join(dir, "design"));
  await writeFile(join(dir, "design/tokens.css"), ":root { --color-primary: #e11d48; }");
  const proxy: ToolContext = { cwd: dir, vision: { mode: "proxy", llm }, attached: () => [sketch], see: async () => "Header with title, a big list, a tab bar at the bottom", think: async (m) => ((seen = m), page("Proxy", "#fff")) };
  expect(text(await sketchToApp.run({ path: "b.html" }, proxy))).toContain("wrote b.html");
  expect(seen[1].content).toContain("a tab bar at the bottom");
  expect(seen[1].content).toContain("--color-primary: #e11d48");
  // Compose, and the errors.
  const kt: ToolContext = { cwd: dir, vision: { mode: "native" }, attached: () => [sketch], think: async () => "```kotlin\npackage a\n@Composable fun Home() {}\n```" };
  expect(text(await sketchToApp.run({ path: "app/Home.kt" }, kt))).toContain("wrote app/Home.kt");
  expect(await readFile(join(dir, "app/Home.kt"), "utf8")).toBe("package a\n@Composable fun Home() {}\n");
  expect(text(await sketchToApp.run({ path: "x.html" }, { ...native, attached: () => [] }))).toContain("no sketch");
  expect(text(await sketchToApp.run({ path: "x.html", image: "sketch.jpg" }, { ...native, vision: { mode: "off" } }))).toContain("needs a model that can see");
}, 60_000);

// ---- persona testers ----

test("personas: prompts and feedback parsing", () => {
  const p = personaPrompt("grandma", "buy a ticket", 8, false);
  expect(p).toContain("Rose, 78");
  expect(p).toContain("at most 8 actions");
  expect(personaPrompt("a busy nurse", "x", 5, true)).toContain("You are a busy nurse");
  expect(parseFeedback("Feedback: The buttons were tiny and I got lost.\nScore: 4/10\nBugs:\n- Back button does nothing\n- Typo in 'Sumbit'")).toEqual({ feedback: "The buttons were tiny and I got lost.", score: 4, bugs: ["Back button does nothing", "Typo in 'Sumbit'"] });
  expect(parseFeedback("Loved it!\nScore: 9/10\nBugs: none")).toEqual({ feedback: "Loved it!", score: 9, bugs: [] });
});

test.skipIf(!chromium)("persona_test drives the page as each persona and writes a report", async () => {
  const dir = await tmp();
  await writeFile(join(dir, "index.html"), `<!doctype html><body><h1>Counter</h1><button onclick="n.textContent=+n.textContent+1">Add one</button><p id=n>0</p></body>`);
  script = [
    { tool: { name: "browser_act", args: { action: "click", element: 1 } } },
    { text: "Feedback: I pressed the button and the number went up. Nice and big.\nScore: 8/10\nBugs: none" },
    { tool: { name: "browser_look", args: {} } },
    { tool: { name: "browser_act", args: { action: "click", element: 1 } } },
    { text: "Feedback: Too slow, no high score.\nScore: 5/10\nBugs:\n- no way to reset" },
  ];
  requests.length = 0;
  const r = await personaTest.run({ personas: ["grandma", "speedrunner"], steps: 5 }, { cwd: dir, llm, vision: { mode: "off" } });
  expect(text(r)).toContain("## Rose, 78 · 8/10");
  expect(text(r)).toContain("## Kai, 19, a speedrunner · 5/10");
  expect(text(r)).toContain("- no way to reset");
  expect(text(r)).toContain("Average 6.5/10");
  expect(requests[0].messages[0].content).toContain("Rose, 78");
  expect(JSON.stringify(requests[1].messages)).toContain("clicked");
  const saved = [...new Bun.Glob(".maxx/personas/*.md").scanSync({ cwd: dir, dot: true })];
  expect(saved).toHaveLength(1);
  // Out of steps: the persona is told to stop and give feedback.
  script = [{ tool: { name: "browser_look", args: {} } }, { tool: { name: "browser_look", args: {} } }, { tool: { name: "browser_look", args: {} } }, { text: "Feedback: ok\nScore: 6/10" }];
  requests.length = 0;
  expect(text(await personaTest.run({ personas: ["kid"], steps: 3 }, { cwd: dir, llm, vision: { mode: "off" } }))).toContain("6/10");
  expect(requests.at(-1).messages.at(-1).content).toContain("Time is up");
  expect(requests.at(-1).tools ?? []).toEqual([]);
}, 90_000);

// ---- asset vending machine ----

test("kit plans come from the model's JSON, with sensible fallbacks", () => {
  expect(String(kitMessages("space shooter")[1]!.content)).toContain('"space shooter"');
  const k = parseKit('{"palette":["#0b132b","#ff5d8f","#3a506b","#5bc0be","nope"],"background":"#000010","font_mood":"retro arcade","sprites":[{"name":"Player Ship","look":"a sleek ship"}],"effects":[{"name":"laser","describe":"zap"}],"music":[{"name":"theme","mood":"epic"}]}', "space");
  expect(k.palette).toEqual(["#0b132b", "#ff5d8f", "#3a506b", "#5bc0be"]);
  expect(k.sprites).toEqual([{ name: "player-ship", look: "a sleek ship" }]);
  expect(k.background).toBe("#000010");
  const f = parseKit("sorry, no", "cozy farm");
  expect(f.palette.length).toBeGreaterThanOrEqual(3);
  expect(f.sprites.map((s) => s.name)).toEqual(["player", "enemy", "pickup", "background"]);
  expect(f.effects.length).toBe(4);
  expect(f.music[0]!.mood).toBe("cozy farm");
});

test.skipIf(!chromium)("asset_kit makes tokens, fonts, SVG sprites, sounds and a preview page from one line", async () => {
  const dir = await tmp();
  let calls = 0;
  const ctx: ToolContext = {
    cwd: dir,
    network: false,
    think: async (m) => {
      calls++;
      if (String(m[0]!.content).includes("art director")) return '{"palette":["#0b132b","#ff5d8f","#5bc0be","#f7d488"],"background":"#050816","font_mood":"retro arcade","sprites":[{"name":"ship","look":"a small ship"},{"name":"background","look":"stars"}],"effects":[{"name":"laser","describe":"short zap"},{"name":"boom","describe":"deep explosion"}],"music":[{"name":"theme","mood":"epic"}]}';
      return String(m[1]!.content).includes('"ship"') ? '<svg viewBox="0 0 64 64"><polygon points="32,4 60,60 4,60" fill="#ff5d8f"/></svg>' : "I can't draw that.";
    },
  };
  const r = await assetKit.run({ theme: "retro space shooter" }, ctx);
  const t = text(r);
  expect(t).toContain("Asset kit for \"retro space shooter\" in assets/kit/");
  expect(t).toContain("palette #0b132b #ff5d8f #5bc0be #f7d488");
  expect(t).toContain("fonts Press Start 2P");
  expect(t).toContain("1 sprite(s) as SVG");
  expect(t).toContain("Skipped: background: the model did not draw SVG");
  expect(t).toContain("2 sound effect(s) and 1 song(s)");
  expect(calls).toBe(3);
  for (const f of ["assets/kit/index.html", "assets/kit/kit.json", "assets/kit/sound.js", "assets/kit/ship.svg", "assets/kit/ship-128.png", "design/tokens.json", "fonts/fonts.css"]) expect(existsSync(join(dir, f))).toBe(true);
  const html = await readFile(join(dir, "assets/kit/index.html"), "utf8");
  expect(html).toContain('href="../../fonts/fonts.css"');
  expect(html).toContain("Sound.play('laser')");
  expect(JSON.parse(await readFile(join(dir, "assets/kit/kit.json"), "utf8")).files.sprites).toEqual(["ship.svg"]);
  expect(images(r)).toHaveLength(1);
}, 90_000);
