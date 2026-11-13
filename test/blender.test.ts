import { expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { INSTALL_HELP, KIT_SOURCE, KIT_VERSION, blenderCandidates, ensureKit, findBlender, kitDir, oldVersion } from "../src/blender/find.ts";
import { API, BLENDER_TOOLS, blenderAssets, blenderRender, blenderScene, crashText, hasBlendFiles, parseResult, pixelIssues, scoreOf, wantsBlender } from "../src/tools/blender.ts";
import { TOOLSETS } from "../src/tools/index.ts";
import { PRESETS } from "../src/mcp-presets.ts";

const tmp = () => mkdtemp(join(tmpdir(), "maxx-blender-"));
const text = (r: any) => (typeof r === "string" ? r : r.text);

test("the blender toolset is registered with its five tools", () => {
  expect(TOOLSETS.blender).toBeDefined();
  expect(BLENDER_TOOLS.map((t) => t.name)).toEqual(["blender_scene", "blender_render", "blender_inspect", "blender_open", "blender_assets"]);
  expect(blenderAssets.schema).toBeDefined();
});

test("asks about Blender scenes bring the tools, other asks don't", () => {
  for (const s of ["make a scene in blender", "open my house.blend", "render a 3D scene of a cabin", "a photorealistic product shot of a watch", "make a turntable of the chair", "archviz of a kitchen"]) expect(wantsBlender(s)).toBe(true);
  for (const s of ["fix the login bug", "make a 3d game", "blend the two colours"]) expect(wantsBlender(s)).toBe(false);
});

test("a project with .blend files counts as a Blender project", async () => {
  const dir = await tmp();
  expect(hasBlendFiles(dir)).toBe(false);
  await mkdir(join(dir, "scenes"));
  await writeFile(join(dir, "scenes", "room.blend"), "");
  expect(hasBlendFiles(dir)).toBe(true);
});

test("Blender is looked for where Windows installs it, newest first", async () => {
  const pf = await tmp();
  for (const v of ["Blender 4.2", "Blender 5.0", "Blender 4.5"]) await mkdir(join(pf, "Blender Foundation", v), { recursive: true });
  const list = blenderCandidates({ ProgramFiles: pf, MAXX_BLENDER: "X:\\b\\blender.exe" }, "win32", await tmp());
  expect(list[0]).toBe("X:\\b\\blender.exe");
  const ours = list.filter((p) => p.startsWith(pf) && p.includes("Blender Foundation"));
  expect(ours.map((p) => /Blender (\d\.\d)/.exec(p)![1])).toEqual(["5.0", "4.5", "4.2"]);
  expect(blenderCandidates({}, "darwin", "/Users/me")[0]).toBe("/Applications/Blender.app/Contents/MacOS/Blender");
});

test("versions older than 4.2 are turned away", () => {
  expect(oldVersion("4.1.1")).toBe(true);
  expect(oldVersion("3.6.5")).toBe(true);
  expect(oldVersion("4.2.0")).toBe(false);
  expect(oldVersion("5.3.0")).toBe(false);
});

test("with no Blender the tools say how to get it", async () => {
  const before = process.env.MAXX_BLENDER;
  process.env.MAXX_BLENDER = "/nowhere/blender";
  const path = process.env.PATH;
  process.env.PATH = "/nowhere";
  try {
    const found = await findBlender(true);
    if (found) return; // a real Blender is installed in a standard place here
    const r = text(await blenderScene.run({ name: "x", script: "S.stage('studio')" }, { cwd: await tmp() } as any));
    expect(r).toContain("blender.org/download");
    expect(r).toContain("winget install BlenderFoundation.Blender");
    expect(INSTALL_HELP).toContain("free");
  } finally {
    process.env.PATH = path;
    if (before === undefined) delete process.env.MAXX_BLENDER;
    else process.env.MAXX_BLENDER = before;
    await findBlender(true);
  }
});

test("the kit is written once per version into ~/.maxx/blender-kit", async () => {
  const home = await tmp();
  const before = process.env.MAXX_HOME;
  process.env.MAXX_HOME = home;
  try {
    const dir = await ensureKit();
    expect(dir).toBe(kitDir());
    expect(dir).toContain(KIT_VERSION);
    for (const f of ["maxx_scene.py", "runner.py", "hdri/studio.exr", "hdri/night.exr", "VERSION"]) expect(existsSync(join(dir, f))).toBe(true);
    expect(await readFile(join(dir, "maxx_scene.py"), "utf8")).toBe(KIT_SOURCE);
  } finally {
    if (before === undefined) delete process.env.MAXX_HOME;
    else process.env.MAXX_HOME = before;
  }
});

test("the API in the tool description matches the kit", () => {
  for (const fn of API.match(/S\.(\w+)\(/g)!.map((m) => m.slice(2, -1))) expect(KIT_SOURCE).toMatch(new RegExp(`^def ${fn}\\(|^${fn} = `, "m"));
  for (const kind of /mat="([^"]+)"/.exec(API.split("Materials: ")[1]!)![1]!.split("|")) expect(KIT_SOURCE).toContain(`"${kind}": (`);
  for (const p of ["clear-day", "golden-hour", "overcast", "blue-hour", "night", "studio", "interior", "misty-forest", "desert"]) expect(KIT_SOURCE).toContain(`"${p}": "`);
});

test("the kit is valid Python", async () => {
  const py = Bun.which("python3") ?? Bun.which("python");
  if (!py) return;
  const dir = await tmp();
  await writeFile(join(dir, "k.py"), KIT_SOURCE);
  const p = Bun.spawnSync([py, "-c", `import ast,sys; ast.parse(open(sys.argv[1]).read())`, join(dir, "k.py")]);
  expect(p.stderr.toString()).toBe("");
  expect(p.exitCode).toBe(0);
});

test("the result line is found among Blender's chatter", () => {
  const r = parseResult("Blender 5.0\nFra:1 Mem:12M\nSaved: x.png\n\nMAXX_RESULT {\"ok\":true,\"mode\":\"build\",\"image\":\"r.png\"}\nBlender quit\n");
  expect(r?.ok).toBe(true);
  expect(r?.image).toBe("r.png");
  expect(parseResult("no result here")).toBeNull();
  expect(crashText("Fra:1 x\nBlender quit", "EXCEPTION_ACCESS_VIOLATION\nWriting: crash.txt")).toContain("EXCEPTION_ACCESS_VIOLATION");
});

test("picture problems come with Blender fixes", () => {
  const dark = pixelIssues({ mean: 0.02, p5: 0, p95: 0.1, flat: 0.1, saturation: 0.2, colorful: 20, blown: 0, crushed: 0.8 });
  expect(dark[0]!.what).toContain("black");
  expect(dark[0]!.fix).toContain("S.exposure");
  expect(pixelIssues({ mean: 0.4, p5: 0.05, p95: 0.9, flat: 0.1, saturation: 0.3, colorful: 30, blown: 0.01, crushed: 0.01 })).toEqual([]);
  expect(scoreOf([{ cost: 30, what: "", fix: "" }, { cost: 15, what: "", fix: "" }])).toBe(55);
});

test("the Blender MCP starter uses the renamed package without telemetry", () => {
  expect(PRESETS.blender!.args).toEqual(["mcp-for-blender"]);
  expect(PRESETS.blender!.env?.DISABLE_TELEMETRY).toBe("true");
});

// With a real Blender (MAXX_BLENDER or an install), build, render and re-run a scene.
test("builds a scene, renders it and reports realism", async () => {
  const found = await findBlender(true);
  if (!found?.ok) return;
  const cwd = await tmp();
  const ctx = { cwd } as any;
  const bad = text(await blenderScene.run({ name: "Oops", script: "S.stage('studio')\nS.boxx((1, 1, 1))\n", quality: "draft" }, ctx));
  expect(bad).toContain("line 2 of scenes/oops.py");
  expect(bad).toContain("boxx");
  const r: any = await blenderScene.run({
    name: "desk",
    quality: "draft",
    size: "640x360",
    script: "S.stage('studio')\nS.box((1.2, 0.6, 0.05), at=(0, 0, 0.72), mat='oak')\nfor x in (-0.55, 0.55):\n    S.box((0.05, 0.55, 0.72), at=(x, 0, 0), mat='steel')\nS.sphere(0.08, at=(0, 0, 0.77), mat='gold')\n",
  }, ctx);
  expect(text(r)).toContain("saved scenes/desk.blend");
  expect(text(r)).toMatch(/Realism \d+\/100/);
  expect(r.images?.length).toBe(1);
  expect(existsSync(join(cwd, "renders", "desk.png"))).toBe(true);
  expect(text(r)).not.toContain("floating");
  // Re-run the saved script by name, then render the .blend.
  expect(text(await blenderScene.run({ name: "desk", quality: "draft", size: "320x180" }, ctx))).toContain("✓");
  const fin = text(await blenderRender.run({ file: "desk", quality: "draft", size: "320x180" }, ctx));
  expect(fin).toContain("renders/desk-draft.png");
}, 300_000);
