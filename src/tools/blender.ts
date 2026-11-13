import { existsSync, readdirSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative } from "node:path";
import { z } from "zod";
import { defineTool, type Tool, type ToolContext, type ToolResult } from "./types.ts";
import { inside } from "./paths.ts";
import { decodePng, toShot } from "../image.ts";
import { pixelStats, type Issue, type Pixels } from "../look/score.ts";
import { INSTALL_HELP, ensureKit, findBlender } from "../blender/find.ts";
import { findAssets } from "./look.ts";

// 🧊 Blender tools: Maxx writes a scene as a short Python script on top of its
// realism kit (maxx_scene.py: sky presets, real materials, bevelled shapes,
// terrain, grass, ocean, cameras), runs it in Blender without opening a window,
// saves the .blend and shows the render. The model looks at the picture, reads
// the realism notes, edits the script and runs it again.

export const QUALITIES = ["draft", "preview", "final", "4k"] as const;
type Quality = (typeof QUALITIES)[number];
const TIMEOUT: Record<Quality, number> = { draft: 4 * 60_000, preview: 8 * 60_000, final: 30 * 60_000, "4k": 60 * 60_000 };

const slugOf = (s: string) => s.toLowerCase().replace(/\.(py|blend)$/i, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "scene";
const posix = (p: string) => p.replace(/\\/g, "/");

export type Job = {
  kit: string;
  mode: "build" | "render" | "inspect";
  cwd: string;
  script?: string;
  blend?: string;
  save?: string;
  out?: string;
  still?: string;
  quality?: Quality;
  samples?: number;
  frames?: [number, number];
  video?: boolean;
  camera?: string;
  engine?: "cycles" | "eevee";
  width?: number;
  height?: number;
};

export type RunResult = {
  ok: boolean;
  mode: string;
  error?: { type: string; message: string; line: number | null; near: string[]; inside_kit: string[] };
  issues?: Issue[];
  facts?: {
    blender: string; kit: string; preset: string | null; engine: string; size: [number, number]; samples: number | null;
    objects: number; instances: number; lights: string[]; triangles: number; extent: number[];
    camera: { at: number[]; lens: number } | null; frames: [number, number]; materials: string[]; notes: string[]; list: string[];
  };
  device?: string;
  saved?: string;
  image?: string;
  video?: string;
  frames_dir?: string;
  render_seconds?: number;
};

// The result line runner.py prints, out of everything else Blender says.
export function parseResult(stdout: string): RunResult | null {
  const line = stdout.split(/\r?\n/).reverse().find((l) => l.startsWith("MAXX_RESULT "));
  if (!line) return null;
  try {
    return JSON.parse(line.slice("MAXX_RESULT ".length));
  } catch {
    return null;
  }
}

// Blender's last words when it crashed before the kit could report.
export function crashText(stdout: string, stderr: string): string {
  const lines = (stderr + "\n" + stdout).split(/\r?\n/).filter((l) => l.trim() && !/^(Fra:|\d\d:\d\d\.\d+ +render|Read prefs|Blender quit|Warning: )/.test(l));
  return lines.slice(-12).join("\n") || "Blender stopped without saying why";
}

async function runBlender(job: Job, ctx: ToolContext, timeoutMs: number): Promise<RunResult | string> {
  const found = await findBlender();
  if (!found) return `error: ${INSTALL_HELP}`;
  if (!found.ok) return `error: ${found.why}`;
  job.kit = await ensureKit();
  const jobFile = join(tmpdir(), `maxx-blender-${process.pid}-${Date.now()}.json`);
  await writeFile(jobFile, JSON.stringify(job));
  const runner = join(job.kit, "runner.py");
  const p = Bun.spawn([found.path, "-b", "--factory-startup", "--python-exit-code", "3", "--python", runner, "--", jobFile], {
    cwd: ctx.cwd, stdout: "pipe", stderr: "pipe", stdin: "ignore", windowsHide: true,
  } as any) as Bun.Subprocess<"ignore", "pipe", "pipe">;
  let killed = "";
  const timer = setTimeout(() => { killed = `timed out after ${Math.round(timeoutMs / 60000)} min`; p.kill(); }, timeoutMs);
  const stop = () => { killed = "stopped"; p.kill(); };
  ctx.signal?.addEventListener("abort", stop, { once: true });
  const [out, err] = await Promise.all([new Response(p.stdout).text(), new Response(p.stderr).text()]);
  await p.exited;
  clearTimeout(timer);
  ctx.signal?.removeEventListener("abort", stop);
  await rm(jobFile, { force: true });
  if (killed) return `error: Blender ${killed}.${killed.startsWith("timed") ? " Try quality \"draft\" or \"preview\", fewer samples, or a smaller size." : ""}`;
  return parseResult(out) ?? `error: Blender (${found.version}) crashed:\n${crashText(out, err)}`;
}

// Picture problems, told the Blender way.
export function pixelIssues(px: Pixels): Issue[] {
  const out: Issue[] = [];
  if (px.mean < 0.06) out.push({ cost: 10, what: "almost black", fix: "S.exposure(+1 or +2), more light (S.area_light / S.point_light), or a brighter S.stage preset" });
  else if (px.mean < 0.14) out.push({ cost: 4, what: "quite dark overall", fix: "S.exposure(0.5-1) unless it's meant to be moody" });
  if (px.blown > 0.12) out.push({ cost: 8, what: `${Math.round(px.blown * 100)}% of the picture is blown-out white`, fix: "S.exposure(-1), weaker lights or emission, or darker 'white' (#e8e8e4)" });
  if (px.p95 - px.p5 < 0.3) out.push({ cost: 6, what: `flat: only ${Math.round((px.p95 - px.p5) * 100)}% of the brightness range is used`, fix: "One strong key light from the side (S.stage golden-hour or a sun at 20-40°) and darker shadows" });
  if (px.flat > 0.45) out.push({ cost: 8, what: `${Math.round(px.flat * 100)}% of the lower picture is plain, featureless colour`, fix: "Fill the frame: textured ground (grass, dirt, planks), props, rocks, S.scatter, a closer camera" });
  if (px.colorful < 8 && px.saturation < 0.06) out.push({ cost: 3, what: "nearly colourless", fix: "Colour from the light (golden-hour, blue-hour) or coloured materials" });
  return out;
}

export function scoreOf(issues: Issue[]): number {
  return Math.max(0, Math.min(100, 100 - issues.reduce((s, i) => s + i.cost, 0)));
}

function readable(r: RunResult, rel: (p: string) => string, px: Pixels | null): string {
  const f = r.facts;
  const lines: string[] = [];
  const what = r.video ? `rendered ${rel(r.video)}` : r.frames_dir ? `rendered frames into ${rel(r.frames_dir)}/` : r.image ? `rendered ${rel(r.image)}` : "";
  const head = [r.saved ? `saved ${rel(r.saved)}` : "", what].filter(Boolean).join(" and ");
  if (f) {
    const how = [f.size ? `${f.size[0]}×${f.size[1]}` : "", f.samples ? `${f.samples} samples` : "", r.device ?? "", r.render_seconds != null ? `${r.render_seconds} s` : ""].filter(Boolean).join(", ");
    lines.push(`✓ ${head || "done"}${how ? ` (${how})` : ""} · Blender ${f.blender}`);
    lines.push(`Scene: ${f.objects} objects${f.instances ? ` + ${f.instances} scattered copies` : ""}, ${f.triangles >= 1000 ? `${Math.round(f.triangles / 1000)}k` : f.triangles} triangles, ${f.extent.map((x) => x.toFixed(1)).join("×")} m${f.preset ? `, light ${f.preset}` : ""}${f.lights.length ? `, lights: ${f.lights.join("; ")}` : ""}${f.camera ? `, camera at (${f.camera.at.join(", ")}) ${f.camera.lens} mm` : ""}`);
    if (f.list.length) lines.push("Objects:\n" + f.list.map((l) => "  " + l).join("\n"));
    for (const n of f.notes) lines.push("Note: " + n);
    if (r.device === "CPU") lines.push("Note: rendering on the CPU (no GPU found by Blender). It works, just slower; in Blender, Edit → Preferences → System → Cycles Render Devices shows why.");
  }
  const issues = [...(r.issues ?? []), ...(px ? pixelIssues(px) : [])].sort((a, b) => b.cost - a.cost);
  const n = scoreOf(issues);
  lines.push(`Realism ${n}/100${n >= 85 ? " (looks real)" : n >= 70 ? " (close)" : n >= 50 ? " (looks CG)" : " (looks unfinished)"}`);
  issues.slice(0, 8).forEach((i, k) => lines.push(`${k + 1}. ${i.what} (−${i.cost})\n   Fix: ${i.fix}`));
  return lines.join("\n");
}

async function picture(path: string | undefined): Promise<{ images: ReturnType<typeof toShot>[]; px: Pixels | null }> {
  if (!path || !existsSync(path)) return { images: [], px: null };
  try {
    const raw = decodePng(new Uint8Array(await readFile(path)));
    return { images: [toShot(raw, { maxSide: 1280, quality: 82 })], px: pixelStats(raw) };
  } catch {
    return { images: [], px: null };
  }
}

function errorText(r: RunResult, scriptRel?: string): string {
  const e = r.error!;
  const where = e.line && scriptRel ? `line ${e.line} of ${scriptRel}` : "the scene";
  const hints: string[] = [];
  if (/has no attribute/.test(e.message) && /'maxx_scene'/.test(e.message)) hints.push("That S.* function doesn't exist; the kit's functions are listed in the blender_scene description.");
  if (/unknown material/.test(e.message)) hints.push("Use one of the material kinds named in the message, or a folder of photo textures.");
  if (/unexpected keyword argument/.test(e.message)) hints.push("Check that function's arguments in the blender_scene description.");
  return [`error in ${where}: ${e.type}: ${e.message}`, ...e.near, ...(e.inside_kit.length ? [`(inside the kit: ${e.inside_kit.join(" → ")})`] : []), ...hints, scriptRel ? `Fix ${scriptRel} with edit_file, then call blender_scene again with just the name.` : ""].filter(Boolean).join("\n");
}

const sizeSchema = z.string().regex(/^\d{2,5}\s*[x×]\s*\d{2,5}$/).optional();
const parseSize = (s?: string) => {
  if (!s) return {};
  const [w, h] = s.split(/[x×]/).map((x) => Number(x.trim()));
  return { width: w, height: h };
};

export const API = `Scene scripts get S (the kit), bpy, math, random and Vector. Metres; z is up; "at" is where an object STANDS (its base), so nothing floats.
Light (pick one first): S.stage("clear-day"|"golden-hour"|"overcast"|"blue-hour"|"night"|"studio"|"interior"|"misty-forest"|"desert", sun_azimuth=135). Or S.sky(elevation, azimuth), S.hdri("studio"|"city"|"forest"|"night"|"sunset"|"park"|"warehouse"|... or a .exr path), S.exposure(stops), S.fog(density).
Lights: S.sun_lamp(elevation, azimuth, strength, kelvin), S.area_light(at, look, size, power_W, kelvin), S.point_light(at, power, kelvin), S.spot_light(at, look, power, angle).
Shapes (each takes at=(x,y,z), mat=, rot=(deg,deg,deg), name=, and colour/roughness for the material): S.box((w,d,h), bevel=0.01), S.cylinder(radius, height, top_radius=), S.sphere(radius, squash=), S.torus(radius, thickness), S.text("Hi", size, depth).
Ground & nature: S.ground(mat="grass"), S.terrain(size, height, mat, flat_middle), S.rock(size, at, seed), S.tree(height, at, kind="broadleaf"|"pine"), S.grass(on=ground_obj, density, height), S.ocean(size, waves), S.scatter(items, on, count, radius=, avoid=(x,y,r)).
Materials: mat="concrete|asphalt|pavement|brick|tiles|plaster|wood|oak|walnut|planks|metal|brushed-metal|steel|rust|chrome|gold|copper|glass|frosted-glass|water|plastic|rubber|car-paint|fabric|leather|marble|ceramic|skin|grass|dirt|sand|rock|snow|mud|paper|emissive|neon|screen", or S.mat(kind, color="#c03030", roughness=, scale=metres, wet=0-1, emit=strength), or S.pbr("assets/polyhaven/<id>") for downloaded photo textures.
Models: S.model("assets/x.glb", at, height=metres) for glb/gltf/fbx/obj/stl/blend.
Camera: S.camera(at, look, lens=35-50, fstop=2.8 for blur). Leave it out and Maxx frames everything. S.frame(w, h) sets the shape. S.orbit(seconds) makes a turntable; S.key(obj, frame, at=, rot=) animates.
Real sizes: door 2.0×0.9, table top 0.75 high, chair seat 0.45, person 1.75, car 4.5×1.8×1.45, storey 3.0, kerb 0.15.`;

export const blenderScene = defineTool({
  name: "blender_scene",
  description:
    "Build a realistic 3D scene in Blender from a Python script and render it: Maxx saves scenes/<name>.py and scenes/<name>.blend, renders renders/<name>.png and shows it, with a realism score and fixes. " +
    "To change a scene, edit scenes/<name>.py and call again with just the name. Work in quick previews, then render the final with quality \"final\".\n" + API,
  schema: z.object({
    name: z.string().describe("Short scene name, e.g. 'cabin' (files go in scenes/ and renders/)"),
    script: z.string().optional().describe("The whole scene script using S. Leave out to run scenes/<name>.py as it is"),
    quality: z.enum(QUALITIES).optional().describe("draft (fast, small), preview (default), final (1920×1080, clean), 4k"),
    size: sizeSchema.describe("Picture size like 1920x1080 or 1080x1350 (portrait)"),
    samples: z.number().int().min(1).max(8192).optional(),
  }),
  risk: "write",
  ruleKey: () => "blender",
  preview: (a) => `blender: build scenes/${slugOf(a.name)}.py → scenes/${slugOf(a.name)}.blend + renders/${slugOf(a.name)}.png (${a.quality ?? "preview"})${a.script ? `\n${a.script.split("\n").slice(0, 14).join("\n")}` : ""}`,
  async run(a, ctx) {
    const slug = slugOf(a.name);
    const rel = `scenes/${slug}.py`;
    const file = inside(ctx.cwd, rel);
    if (a.script) {
      await mkdir(dirname(file), { recursive: true });
      await writeFile(file, a.script.replace(/^```\w*\n|```\s*$/g, "").replace(/^\s*import maxx_scene as S\s*$/m, ""));
    } else if (!existsSync(file)) return `error: ${rel} doesn't exist yet. Pass the scene in "script".\n${API}`;
    const quality = a.quality ?? "preview";
    const out = join(ctx.cwd, "renders", quality === "final" || quality === "4k" ? `${slug}-${quality}.png` : `${slug}.png`);
    const r = await runBlender({ kit: "", mode: "build", cwd: ctx.cwd, script: file, save: join(ctx.cwd, "scenes", `${slug}.blend`), out, quality, samples: a.samples, ...parseSize(a.size) }, ctx, TIMEOUT[quality]);
    if (typeof r === "string") return r;
    if (!r.ok) return errorText(r, rel);
    const relp = (p: string) => posix(relative(ctx.cwd, p));
    const { images, px } = await picture(r.image);
    const text = readable(r, relp, px) + (quality === "final" || quality === "4k" ? "" : "\nNext: look at the render and fix the top items (edit the script, call again). When it looks right, render it with quality \"final\".");
    return images.length ? { text, images } : text;
  },
});

export const blenderRender = defineTool({
  name: "blender_render",
  description:
    "Render a .blend file (one Maxx built, or the user's own): a still at draft/preview/final/4k quality, or an animation (frames \"1-120\") to an .mp4. " +
    "Uses the file's own camera, lights and materials; shows the picture with realism notes. Rendering a turntable: build the scene with S.orbit(6), then render frames.",
  schema: z.object({
    file: z.string().describe("The .blend file, or a scene name from scenes/"),
    quality: z.enum(QUALITIES).optional().describe("Default final"),
    frames: z.string().regex(/^\d+\s*-\s*\d+$/).optional().describe("Animation frames like 1-180 (makes an .mp4); leave out for a still"),
    camera: z.string().optional().describe("Camera object to use, if the file has several"),
    size: sizeSchema.describe("Picture size like 1920x1080"),
    samples: z.number().int().min(1).max(8192).optional(),
    engine: z.enum(["cycles", "eevee"]).optional().describe("Default: the file's own engine. eevee is fast but less real"),
  }),
  risk: "write",
  ruleKey: () => "blender",
  preview: (a) => `blender: render ${a.file}${a.frames ? ` frames ${a.frames}` : ""} (${a.quality ?? "final"})`,
  async run(a, ctx) {
    const blendRel = /\.blend$/i.test(a.file) ? a.file : `scenes/${slugOf(a.file)}.blend`;
    const blend = inside(ctx.cwd, blendRel);
    if (!existsSync(blend)) return `error: ${blendRel} doesn't exist. Build it with blender_scene first, or give the path of a .blend file.`;
    const quality = a.quality ?? "final";
    const slug = slugOf(basename(blend));
    const frames = a.frames ? (a.frames.split("-").map((x) => Number(x.trim())) as [number, number]) : undefined;
    const job: Job = {
      kit: "", mode: "render", cwd: ctx.cwd, blend, quality, samples: a.samples, camera: a.camera, engine: a.engine, ...parseSize(a.size),
      ...(frames ? { frames, video: true, out: join(ctx.cwd, "renders", `${slug}.mp4`), still: join(ctx.cwd, "renders", `${slug}-frame.png`) } : { out: join(ctx.cwd, "renders", `${slug}-${quality}.png`) }),
    };
    const minutes = frames ? Math.min(120, 2 + (frames[1] - frames[0] + 1) * (quality === "draft" ? 0.15 : quality === "preview" ? 0.4 : 1.5)) : TIMEOUT[quality] / 60000;
    const r = await runBlender(job, ctx, minutes * 60_000);
    if (typeof r === "string") return r;
    if (!r.ok) return errorText(r);
    const { images, px } = await picture(r.image);
    const text = readable(r, (p) => posix(relative(ctx.cwd, p)), px);
    return images.length ? { text, images } : text;
  },
});

export const blenderInspect = defineTool({
  name: "blender_inspect",
  description: "Look inside a .blend file without changing it: objects with sizes and positions, materials, lights, camera, frame range, and what would make it look fake. look: also render a quick draft picture.",
  schema: z.object({
    file: z.string().describe("The .blend file, or a scene name from scenes/"),
    look: z.boolean().optional().describe("Also render a quick draft to see it"),
  }),
  risk: "read",
  async run(a, ctx) {
    const blendRel = /\.blend$/i.test(a.file) ? a.file : `scenes/${slugOf(a.file)}.blend`;
    const blend = inside(ctx.cwd, blendRel);
    if (!existsSync(blend)) return `error: ${blendRel} doesn't exist`;
    const out = a.look ? join(tmpdir(), `maxx-inspect-${process.pid}-${Date.now()}.png`) : undefined;
    const r = await runBlender({ kit: "", mode: "inspect", cwd: ctx.cwd, blend, out, quality: "draft" }, ctx, TIMEOUT.draft);
    if (typeof r === "string") return r;
    if (!r.ok) return errorText(r);
    const { images, px } = await picture(r.image);
    if (out) await rm(out, { force: true });
    const f = r.facts!;
    const text = [readable({ ...r, image: undefined, saved: undefined }, (p) => p, px).replace(/^✓ done/, `${blendRel}:`), `Materials: ${f.materials.join(", ") || "none"}`, `Frames ${f.frames[0]}-${f.frames[1]}, engine ${f.engine}`].join("\n");
    return images.length ? { text, images } : text;
  },
});

export const blenderOpen = defineTool({
  name: "blender_open",
  description: "Open a .blend file in Blender's own window for the user to look around, tweak by hand or keep working in.",
  schema: z.object({ file: z.string().describe("The .blend file, or a scene name from scenes/") }),
  risk: "read",
  checkpoint: false,
  async run(a, ctx) {
    const blendRel = /\.blend$/i.test(a.file) ? a.file : `scenes/${slugOf(a.file)}.blend`;
    const blend = inside(ctx.cwd, blendRel);
    if (!existsSync(blend)) return `error: ${blendRel} doesn't exist`;
    const found = await findBlender();
    if (!found) return `error: ${INSTALL_HELP}`;
    const p = Bun.spawn([found.path, blend], { cwd: ctx.cwd, stdout: "ignore", stderr: "ignore", stdin: "ignore" });
    p.unref();
    return `Opened ${blendRel} in Blender ${found.version}. If the user changes it there and saves, blender_render and blender_inspect see their changes (blender_scene would rebuild it from the script and overwrite them).`;
  },
});

// find_assets, with Blender usage in place of three.js.
export const blenderAssets = defineTool({
  ...findAssets,
  name: "blender_assets",
  description: "Find and download real CC0 assets for a Blender scene: scanned 3D models, photo textures and HDR skies from Poly Haven (or the user's own library in ~/.maxx/assets). Search first, then call again with get. Models: S.model(path, at, height). Textures: S.pbr(folder). Skies: S.hdri(path) (get 2k or 4k for a sharp background).",
  async run(a: any, ctx: ToolContext): Promise<ToolResult> {
    const r = await findAssets.run(a, ctx);
    const text = typeof r === "string" ? r : r.text;
    const fixed = text
      .replace(/Use it: const m = await LOOK\.model\("([^"]+)"[^\n]*/g, 'Use it: S.model("$1", at=(0, 0, 0), height=...)')
      .replace(/Use it: new LOOK\.addons\.EXRLoader\(\)\.load\("([^"]+)"[^\n]*/g, 'Use it: S.hdri("$1")')
      .replace(/Use it: const tl = new THREE\.TextureLoader\(\); const m = new THREE\.MeshStandardMaterial\(\{ map: tl\.load\("([^"]+)\/color\.jpg"\)[^\n]*/g, 'Use it: mat=S.pbr("$1", scale=2.0)  (scale: metres per repeat)')
      .replace(/Use it: S\.scene\.add[^\n]*/g, "")
      .replace(/LOOK\.model\(/g, "S.model(");
    return typeof r === "string" ? fixed : { ...r, text: fixed };
  },
}) as Tool<any>;

export const BLENDER_TOOLS: Tool<any>[] = [blenderScene, blenderRender, blenderInspect, blenderOpen, blenderAssets];
export const BLENDER_PROMPT = [
  "Blender tools, for realistic 3D scenes, stills and turntables: write the scene as a script with blender_scene (Maxx's kit S does the realism; never build from bare bpy cubes).",
  "Work like a photographer: S.stage(preset) first, real-world sizes in metres, real materials (S.mat kinds or blender_assets photo textures), bevelled edges, a ground, and a camera at eye height (1.6 m) with a 35-50 mm lens or lower for drama.",
  "Look at every render and fix the realism notes, then render quality \"final\". Fill the frame: small props, scattered rocks or grass, wear. blender_open shows the result in Blender's window.",
].join("\n");

export function wantsBlender(text: string): boolean {
  return /\bblender\b|\.blend\b|\b(3d|cgi|photo-?real(istic)?|product) (scene|render|still|shot|image|picture|artwork)s?\b|\brender (me )?(a|an) (scene|image|picture|still)\b|\bturntable\b|\barch-?viz\b/i.test(text);
}

// A project with .blend files at the top or in scenes/ is a Blender project.
export function hasBlendFiles(cwd: string): boolean {
  for (const d of [cwd, join(cwd, "scenes")]) {
    try {
      if (readdirSync(d).some((f) => f.toLowerCase().endsWith(".blend"))) return true;
    } catch {}
  }
  return false;
}
