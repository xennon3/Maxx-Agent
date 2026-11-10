import { afterAll, beforeAll, expect, test } from "bun:test";
import { mkdtemp, readFile, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { PNG } from "pngjs";
import { HDRI_FILES, LOOK_JS, PRESET_INFO, hdriBytes, hdriScript, presetFor, usesThree, writeKit } from "../src/look/kit.ts";
import { issuesOf, pixelStats, report, score, type Audit } from "../src/look/score.ts";
import { artDoc, parseBrief, patchPage, pickFiles, rankAssets, wantsLook, inspect, lookCheck, lookAlarm, artDirection, gameLook, findAssets } from "../src/tools/look.ts";
import { TOOLSETS } from "../src/tools/index.ts";
import { findBrowser } from "../src/judge.ts";
// @ts-ignore: plain JS module
import { PRESETS, presetFor as runtimePresetFor } from "../src/look/runtime/presets.js";

const chromium = findBrowser() ?? (Bun.file("/opt/pw-browsers/chromium").size ? "/opt/pw-browsers/chromium" : null);
const tmp = () => mkdtemp(join(tmpdir(), "maxx-look-"));
const text = (r: any) => (typeof r === "string" ? r : r.text);

beforeAll(() => {
  if (chromium) process.env.MAXX_BROWSER ??= chromium;
});

const base: Audit = {
  three: "180", look: false, preset: null, quality: null, scenes: 1, renderers: 1, meshes: 40, triangles: 2000, materials: { MeshLambertMaterial: 36, MeshBasicMaterial: 4 },
  flatBig: 9, flatBigNames: ["ground (900 m)", "BoxGeometry (120 m)"], stretched: ["BoxGeometry (100 m, 1.3 px/m)"], boxes: 34, primitives: 38,
  shadowsOn: false, toneMapping: "none", colorSpace: "srgb", env: false, fog: false, lights: { DirectionalLight: 1, AmbientLight: 1 }, castShadow: 0, emissive: 0,
  bigPlanes: 1, people: [{ name: "player", height: 1.2 }], buildings: [200, 210, 220, 230], post: null, sky: false, extent: 900, instanced: 0, textures: 1,
};

test("the kit's preset list matches the runtime's, and words pick the same look", () => {
  expect(Object.keys(PRESET_INFO).sort()).toEqual(Object.keys(PRESETS).sort());
  for (const [k, v] of Object.entries(PRESET_INFO)) {
    expect(PRESETS[k].hdri).toBe(v.hdri);
    expect(HDRI_FILES[v.hdri]).toBeTruthy();
  }
  for (const t of ["GTA clone in a rainy city", "cyberpunk megacity", "sunset racing", "desert outpost", "foggy forest walk", "", "black and white detective"]) expect(presetFor(t)).toBe(runtimePresetFor(t));
  expect(presetFor("NEON TIDE open world")).toBe("neon-rain");
});

test("the bundle carries three.js, LOOK and the scene audit", () => {
  expect(LOOK_JS.length).toBeGreaterThan(500_000);
  expect(LOOK_JS).toContain("window.__LOOK_AUDIT__");
  expect(LOOK_JS).toContain("three.js r180");
});

test("game_look writes look/ and wires a page that used an old three.js", async () => {
  const dir = await tmp();
  await writeFile(join(dir, "index.html"), `<html><body>\n<script src="vendor/three.min.js"></script>\n<script src="game.js"></script>\n</body></html>`);
  const out = text(await gameLook.run({ page: "index.html", preset: "neon-rain" }, { cwd: dir }));
  expect(out).toContain("LOOK.stage");
  expect(out).toContain('preset: "neon-rain"');
  const html = await readFile(join(dir, "index.html"), "utf8");
  expect(html).not.toContain("three.min.js");
  expect(html.indexOf("look/look.js")).toBeLessThan(html.indexOf("game.js"));
  expect((await readFile(join(dir, "look", "look.js"), "utf8")).length).toBe(LOOK_JS.length);
  expect(await usesThree(dir)).toBe(true);
  // A sky script decodes back to the same EXR bytes.
  const js = await readFile(join(dir, "look", "hdri", "night.js"), "utf8");
  const b64 = /base64,([^"]+)"/.exec(js)![1]!;
  expect(Buffer.from(b64, "base64").equals(Buffer.from(hdriBytes("night")))).toBe(true);
  expect(patchPage(html).changes).toEqual([]); // running it twice changes nothing
});

test("a flat, unlit, toy-scale scene scores low with fixes that name LOOK", () => {
  const issues = issuesOf(base, { mean: 0.3, p5: 0.2, p95: 0.4, flat: 0.7, saturation: 0.2, colorful: 20, blown: 0, crushed: 0 });
  const n = score(issues);
  expect(n).toBeLessThan(20);
  const r = report(base, null);
  expect(r).toContain("Lambert");
  expect(r).toContain("tone mapping");
  expect(r).toContain("1.2 m tall");
  expect(r).toContain("LOOK.stage");
});

test("a LOOK scene with good pixels passes", () => {
  const good: Audit = { ...base, look: true, preset: "neon-rain", materials: { MeshStandardMaterial: 30, MeshPhysicalMaterial: 8, ShaderMaterial: 4 }, flatBig: 0, flatBigNames: [], stretched: [], boxes: 2, shadowsOn: true, toneMapping: "aces", env: true, fog: true, castShadow: 35, bigPlanes: 0, people: [{ name: "player", height: 1.76 }], buildings: [30, 40, 55, 70], post: true, sky: true };
  const px = { mean: 0.25, p5: 0.03, p95: 0.8, flat: 0.1, saturation: 0.3, colorful: 30, blown: 0.01, crushed: 0.05 };
  expect(score(issuesOf(good, px))).toBeGreaterThanOrEqual(90);
  expect(report({ ...good, scenes: 0, renderers: 0 }, null)).toContain("no three.js scene");
});

test("pixel stats see a flat grey picture as flat and washed out", () => {
  const w = 64, h = 48, data = new Uint8Array(w * h * 4).fill(128);
  const px = pixelStats({ width: w, height: h, data });
  expect(px.flat).toBe(1);
  expect(px.p95 - px.p5).toBeLessThan(0.01);
  const issues = issuesOf(null, px).map((i) => i.what).join(" ");
  expect(issues).toContain("washed out");
  expect(issues).toContain("flat");
});

test("art direction writes ART.md with the preset, the scale table and the brief", async () => {
  const dir = await tmp();
  const reply = '<think>hmm</think>{"mood":"wet and electric","palette":["#ff2a6d","nothex","#05d9e8"],"signature":["neon in puddles"],"camera":"low chase cam","references":["Tokyo at night"]}';
  const b = parseBrief(reply);
  expect(b.palette).toEqual(["#ff2a6d", "#05d9e8"]);
  const out = text(await artDirection.run({ theme: "GTA-style open world in a rainy port" }, { cwd: dir, think: async () => reply }));
  expect(out).toContain("preset neon-rain");
  const doc = await readFile(join(dir, "ART.md"), "utf8");
  expect(doc).toContain("preset: neon-rain");
  expect(doc).toContain("| person | 1.75 m");
  expect(doc).toContain("neon in puddles");
  expect(doc).toContain("low chase cam");
  expect(artDoc("x", "studio", {})).toContain("busy street edges");
});

test("Poly Haven search ranks by words and picks the right files", () => {
  const all = {
    red_brick_03: { name: "Red Brick 03", type: 1, categories: ["brick", "wall"], tags: ["red", "old"], download_count: 5000 },
    asphalt_02: { name: "Asphalt 02", type: 1, categories: ["road"], tags: ["street", "asphalt"], download_count: 9000 },
    brick_floor: { name: "Brick Floor", type: 1, categories: ["floor"], tags: ["brick"], download_count: 10 },
  };
  expect(rankAssets(all, "red brick").map(([id]) => id)).toEqual(["red_brick_03", "brick_floor"]);
  expect(rankAssets(all, "street").map(([id]) => id)).toEqual(["asphalt_02"]);
  const tex = pickFiles("texture", { Diffuse: { "1k": { jpg: { url: "https://dl.polyhaven.org/a/diff_1k.jpg" } } }, nor_gl: { "1k": { jpg: { url: "https://dl.polyhaven.org/a/nor_1k.jpg" } } }, Rough: { "1k": { jpg: { url: "https://dl.polyhaven.org/a/rough_1k.jpg" } } }, arm: { "1k": { jpg: { url: "https://x/arm.jpg" } } } }, "1k");
  expect(tex.map((f) => f.path)).toEqual(["color.jpg", "normal.jpg", "roughness.jpg"]);
  const model = pickFiles("model", { gltf: { "2k": { gltf: { url: "https://x/lamp_2k.gltf", include: { "textures/a.jpg": { url: "https://x/a.jpg" }, "lamp.bin": { url: "https://x/lamp.bin" } } } } } }, "2k");
  expect(model.map((f) => f.path)).toEqual(["lamp_2k.gltf", "textures/a.jpg", "lamp.bin"]);
  expect(pickFiles("hdri", { hdri: { "1k": { exr: { url: "https://x/night_1k.exr" } } } }, "4k")[0]!.path).toBe("night_1k.exr");
});

test("with the network off, find_assets says so and searches the local library", async () => {
  const lib = await tmp();
  process.env.MAXX_ASSETS = lib;
  await mkdir(join(lib, "kenney-cars"), { recursive: true });
  await writeFile(join(lib, "kenney-cars", "police-car.glb"), "glTF");
  const out = text(await findAssets.run({ kind: "model", query: "police car" }, { cwd: await tmp(), network: false }));
  expect(out).toContain("Network is off");
  expect(out).toContain("police-car.glb");
  const dir = await tmp();
  const got = text(await findAssets.run({ kind: "model", query: "car", get: join(lib, "kenney-cars", "police-car.glb") }, { cwd: dir, network: false }));
  expect(got).toContain("assets/library/police-car.glb");
  expect(await readFile(join(dir, "assets", "library", "police-car.glb"), "utf8")).toBe("glTF");
  delete process.env.MAXX_ASSETS;
});

test("3D game requests bring the look tools; other requests don't", () => {
  for (const t of ["make a GTA clone", "build a three.js racing game", "the graphics look terrible", "open world RPG in 3D"]) expect(wantsLook(t)).toBe(true);
  for (const t of ["fix the login form", "add a high score table to snake", "write a python script"]) expect(wantsLook(t)).toBe(false);
  expect(TOOLSETS.look!.tools.map((t) => t.name)).toEqual(["art_direction", "game_look", "look_check", "find_assets"]);
});

const OLD_PAGE = `<!doctype html><html><body style="margin:0"><script src="look/look.js"></script><script>
const r = new THREE.WebGLRenderer(); r.setSize(innerWidth, innerHeight); document.body.appendChild(r.domElement);
const s = new THREE.Scene(); s.background = new THREE.Color("#334");
const c = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 2000); c.position.set(0, 3, 12);
s.add(new THREE.AmbientLight(0xffffff, 0.6)); s.add(new THREE.DirectionalLight(0xffffff, 1));
const g = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshLambertMaterial({ color: "#555" })); g.rotation.x = -Math.PI / 2; s.add(g);
for (let i = 0; i < 30; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(30, 120, 30), new THREE.MeshLambertMaterial({ color: "#a98" })); b.position.set((i % 6) * 40 - 100, 60, -Math.floor(i / 6) * 40 - 30); s.add(b); }
const p = new THREE.Group(); p.name = "player"; const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.2, 0.4), new THREE.MeshLambertMaterial({ color: "#08f" })); body.position.y = 0.6; p.add(body); s.add(p);
r.render(s, c);
</script></body></html>`;

const LOOK_PAGE = `<!doctype html><html><body style="margin:0"><script src="look/look.js"></script><script>
const S = LOOK.stage({ preset: "golden-hour", quality: "low" });
S.scene.add(LOOK.ground({ material: "grass", size: 200 }));
const b = LOOK.building({ w: 16, d: 14, h: 24, style: "brick", seed: 2 }); b.position.set(0, 0, -14); S.scene.add(b);
const h = LOOK.human({ seed: 1 }); h.name = "player"; S.scene.add(h);
S.camera.position.set(3, 2, 8); S.camera.lookAt(0, 3, -6);
S.update(1 / 60); S.render();
</script></body></html>`;

test.skipIf(!chromium)("look_check reads a live three.js scene: the old way scores low, LOOK scores higher", async () => {
  const dir = await tmp();
  await writeKit(dir, "look", ["sunset"]);
  await writeFile(join(dir, "old.html"), OLD_PAGE);
  await writeFile(join(dir, "look.html"), LOOK_PAGE);
  const old = await inspect(process.env.MAXX_BROWSER!, pathToFileURL(join(dir, "old.html")).href, { waitMs: 2500, width: 640, height: 360 });
  expect(old.audit?.scenes).toBe(1);
  expect(old.audit?.materials.MeshLambertMaterial).toBeGreaterThan(20);
  expect(old.audit?.toneMapping).toBe("none");
  expect(old.audit?.people[0]?.height).toBeCloseTo(1.2, 1);
  const oldScore = score(issuesOf(old.audit, old.pixels));
  const alarm = await lookAlarm(dir, pathToFileURL(join(dir, "old.html")).href);
  expect(alarm!.score).toBeLessThan(70);
  expect(alarm!.text).toContain("Lambert");
  const good = await inspect(process.env.MAXX_BROWSER!, pathToFileURL(join(dir, "look.html")).href, { waitMs: 6000, width: 640, height: 360 });
  expect(good.errors).toEqual([]);
  expect(good.audit?.look).toBe(true);
  expect(good.audit?.preset).toBe("golden-hour");
  expect(good.audit?.env).toBe(true);
  expect(good.audit?.shadowsOn).toBe(true);
  const goodScore = score(issuesOf(good.audit, good.pixels));
  expect(oldScore).toBeLessThan(40);
  expect(goodScore).toBeGreaterThan(oldScore + 30);
  // The tool: the report, the picture and the vision critique.
  let asked = "";
  const r = await lookCheck.run({ target: "old.html", wait: 1500 }, { cwd: dir, see: async (_imgs, q) => ((asked = q), "lighting 2/10: flat ambient light. The street is a grey plane. Use LOOK.stage.") });
  expect(text(r)).toContain("Look score");
  expect(text(r)).toContain("Art director (vision model)");
  expect(text(r)).toContain("LOOK.stage isn't used");
  expect(asked).toContain("LOOK kit");
  expect((r as any).images.length).toBe(1);
}, 120_000);
