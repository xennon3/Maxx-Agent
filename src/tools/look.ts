import { existsSync, readdirSync, statSync } from "node:fs";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, relative } from "node:path";
import { z } from "zod";
import { defineTool, type Tool, type ToolContext, type ToolResult } from "./types.ts";
import { inside } from "./paths.ts";
import { findBrowser } from "../judge.ts";
import { openPage } from "../browser.ts";
import { decodePng, toShot, type Image } from "../image.ts";
import { pageUrl } from "./studio.ts";
import { maxxHome } from "../sessions.ts";
import { AUDIT_JS, HOOK_JS, PRESET_INFO, PRESET_NAMES, README, kitVersion, LOOK_VERSION, presetFor, writeKit } from "../look/kit.ts";
import { pixelStats, report, issuesOf, score, type Audit, type Pixels } from "../look/score.ts";

// The 🎬 look tools: make 3D web games look like games. game_look installs
// LOOK (three.js + a realism kit: skies, PBR materials, post effects, city,
// car and people builders), art_direction writes ART.md before any code,
// look_check reads the live scene and screenshot and scores them (with a
// vision critique when a model can see), and find_assets fetches CC0 models,
// textures and skies from Poly Haven or the user's own asset folder.

const NO_BROWSER = "error: no Edge or Chrome found for headless rendering. Install one, or set MAXX_BROWSER.";

// ---- game_look ----

// Add <script src="look/look.js"> to a page and take out other three.js scripts.
export function patchPage(html: string, dir = "look"): { html: string; changes: string[] } {
  const changes: string[] = [];
  let out = html;
  const tag = `<script src="${dir}/look.js"></script>`;
  out = out.replace(/[ \t]*<script[^>]*src=["'][^"']*three(\.min)?\.js["'][^>]*>\s*<\/script>\s*\n?/gi, (m) => {
    changes.push(`removed ${m.trim()} (LOOK brings three.js r180 as THREE)`);
    return "";
  });
  if (!out.includes(`${dir}/look.js`)) {
    const at = out.search(/<script\b/i);
    if (at >= 0) out = out.slice(0, at) + tag + "\n" + out.slice(at);
    else out = out.replace(/<\/body>/i, `${tag}\n</body>`);
    changes.push(`added ${tag}`);
  }
  if (/from\s+["']three["']|import\s*\(\s*["']three["']/.test(out)) changes.push("note: the page imports 'three' as a module; use the global THREE that look.js sets instead (window.THREE), so there is one three.js");
  return { html: out, changes };
}

export const gameLook = defineTool({
  name: "game_look",
  description:
    "Install LOOK, Maxx's realism kit for three.js games, into the project's look/ folder: three.js r180 + a stage with a photographed sky light, filmic tone mapping, soft shadows, ambient occlusion, bloom, colour grade, fog, rain and night lamps from one preset; PBR materials sized in metres (asphalt, brick, facades with lit rooms behind windows...); and builders for a whole city, buildings, cars, people, trees and lamps. Returns the API. page: also add the script tag to that HTML file.",
  schema: z.object({
    page: z.string().optional().describe("HTML file to add <script src=\"look/look.js\"> to, e.g. index.html"),
    preset: z.enum(PRESET_NAMES).optional().describe("The look to suggest in the reply"),
  }),
  risk: "write",
  ruleKey: () => "look",
  preview: (a) => `write look/ (three.js + LOOK, about 3 MB)${a.page ? ` and add it to ${a.page}` : ""}`,
  async run({ page, preset }, ctx) {
    const before = await kitVersion(ctx.cwd);
    const files = await writeKit(ctx.cwd);
    const notes: string[] = [before ? (before === LOOK_VERSION ? `look/ was already there (v${before}); refreshed it` : `updated look/ from v${before} to v${LOOK_VERSION}`) : `wrote look/: ${files.length} files (look.js, 12 skies, README.md)`];
    if (page) {
      const abs = inside(ctx.cwd, page);
      if (!existsSync(abs)) notes.push(`${page} does not exist, so nothing was added to it`);
      else {
        const { html, changes } = patchPage(await readFile(abs, "utf8"));
        await writeFile(abs, html);
        notes.push(...changes.map((c) => `${page}: ${c}`));
      }
    }
    const p = preset ?? (existsSync(join(ctx.cwd, "ART.md")) ? (/preset:\s*([\w-]+)/.exec(await readFile(join(ctx.cwd, "ART.md"), "utf8"))?.[1] ?? "clear-day") : "clear-day");
    return `${notes.join("\n")}\nSuggested preset: LOOK.stage({ preset: "${p}" }) (${PRESET_INFO[p]?.about ?? ""}).\n\n${README}`;
  },
});

// ---- art_direction ----

export function artDoc(theme: string, preset: string, brief: { mood?: string; palette?: string[]; signature?: string[]; camera?: string; references?: string[] }): string {
  const p = PRESET_INFO[preset]!;
  const lines = [
    `# Art direction: ${theme}`,
    "",
    `preset: ${preset}`,
    `Look: ${p.about}.`,
    brief.mood ? `Mood: ${brief.mood}` : "",
    brief.references?.length ? `Feels like: ${brief.references.join("; ")}` : "",
    brief.palette?.length ? `Accent colours (neon, signs, cars, clothes): ${brief.palette.join(" ")}` : "",
    "",
    "## Signature details (the things a player remembers)",
    ...(brief.signature?.length ? brief.signature : ["light that pools and reflects", "busy street edges: lamps, trees, parked cars, signs", "a skyline with depth that fades into haze"]).map((s) => `- ${s}`),
    "",
    "## Rendering (do not hand-roll these)",
    `- One stage: \`const S = LOOK.stage({ preset: "${preset}" })\`. It owns the renderer, sky, sun, sky light, fog, shadows, bloom, grade and rain.`,
    "- Surfaces: LOOK.mat.* (asphalt, pavement, concrete, brick, plaster, metal, grass, wood...) and LOOK.mat.facade(style) for buildings.",
    "- Things: LOOK.city / LOOK.building / LOOK.car / LOOK.human / LOOK.tree / LOOK.streetLamp / LOOK.neonSign, or real models via find_assets + LOOK.model.",
    `- Camera: ${brief.camera ?? "third person, FOV 60, 5.5 m behind and 2.2 m above the player, smoothed (LOOK.chaseCamera)"}.`,
    "",
    "## Scale (1 unit = 1 metre)",
    "| thing | size |",
    "|---|---|",
    "| person | 1.75 m tall, walks 1.4 m/s, runs 5 m/s |",
    "| door / storey | 2.1 m / 3.2 m |",
    "| car | 4.6 × 1.85 × 1.45 m, 15-40 m/s |",
    "| lane / street / pavement | 3.5 m / 12-16 m / 4 m |",
    "| city block | 60-80 m; buildings 12-90 m, taller downtown |",
    "",
    "## Never",
    "- MeshBasic/Lambert/Phong on scenery, one flat colour on anything over 5 m, a small texture stretched over a wall.",
    "- Boxes or capsules standing in for people, cars or buildings.",
    "- Your own renderer, lights, fog or tone mapping next to LOOK.stage.",
    "",
    "## Done means",
    "- look_check scores 80 or more, and the vision critique names no problem with lighting, materials or scale.",
    "",
  ];
  return lines.filter((l, i, a) => l !== "" || a[i - 1] !== "").join("\n");
}

export function parseBrief(reply: string): { mood?: string; palette?: string[]; signature?: string[]; camera?: string; references?: string[] } {
  try {
    const m = /\{[\s\S]*\}/.exec(reply.replace(/<think>[\s\S]*?<\/think>/g, ""));
    if (!m) return {};
    const j = JSON.parse(m[0]);
    const strs = (a: unknown, n: number) => (Array.isArray(a) ? a.filter((x) => typeof x === "string" && x.trim()).map((x: string) => x.trim()).slice(0, n) : undefined);
    return {
      mood: typeof j.mood === "string" ? j.mood.slice(0, 200) : undefined,
      palette: strs(j.palette, 6)?.filter((h) => /^#[0-9a-f]{6}$/i.test(h)),
      signature: strs(j.signature, 5),
      camera: typeof j.camera === "string" ? j.camera.slice(0, 160) : undefined,
      references: strs(j.references, 4),
    };
  } catch {
    return {};
  }
}

export const artDirection = defineTool({
  name: "art_direction",
  description:
    "Before writing a 3D game's code: decide how it should look and write ART.md (the LOOK preset, mood, accent colours, signature details, camera, real-world scale table, and what is banned). Read it back before building scenery; look_check judges against it.",
  schema: z.object({
    theme: z.string().describe("The game and its feel, e.g. 'GTA-style open world in a rainy neon port city'"),
    preset: z.enum(PRESET_NAMES).optional().describe("A LOOK preset; default: picked from the theme"),
  }),
  risk: "write",
  ruleKey: () => "art",
  preview: (a) => `write ART.md for "${a.theme}"`,
  async run({ theme, preset }, ctx) {
    const p = preset ?? presetFor(theme);
    let brief = {};
    if (ctx.think) {
      const reply = await ctx.think([
        { role: "system", content: "You are a game art director. Reply with only JSON." },
        { role: "user", content: `Game: "${theme}". Its lighting look is "${p}" (${PRESET_INFO[p]!.about}). Reply with JSON: {"mood": "one sentence", "references": ["2-3 films, photographers or real places with this look"], "palette": ["#hex", 4-5 accent colours for signs, cars, clothes], "signature": ["3-4 concrete visual details a player will remember"], "camera": "one line"}` },
      ]).catch(() => "");
      brief = parseBrief(reply);
    }
    const doc = artDoc(theme, p, brief);
    await writeFile(join(ctx.cwd, "ART.md"), doc);
    return `wrote ART.md (preset ${p})\n\n${doc}`;
  },
});

// ---- look_check ----

export type LookResult = { audit: Audit | null; pixels: Pixels | null; png: Uint8Array | null; errors: string[] };

export async function inspect(browser: string, url: string, o: { width?: number; height?: number; waitMs?: number; keys?: string[]; click?: boolean; signal?: AbortSignal } = {}): Promise<LookResult> {
  const page = await openPage(browser, { width: o.width ?? 1280, height: o.height ?? 720, timeoutMs: 60_000, signal: o.signal });
  try {
    await page.call("Page.addScriptToEvaluateOnNewDocument", { source: HOOK_JS });
    const load = page.loaded(20_000);
    await page.call("Page.navigate", { url });
    await load;
    await Bun.sleep(600);
    if (o.click) {
      for (const type of ["mousePressed", "mouseReleased"]) await page.call("Input.dispatchMouseEvent", { type, x: (o.width ?? 1280) / 2, y: (o.height ?? 720) / 2, button: "left", clickCount: 1 }).catch(() => {});
    }
    for (const k of o.keys ?? []) {
      const code = k.length === 1 ? `Key${k.toUpperCase()}` : k;
      for (const type of ["keyDown", "keyUp"]) await page.call("Input.dispatchKeyEvent", { type, key: k, code, windowsVirtualKeyCode: k === "Enter" ? 13 : k === " " ? 32 : k.toUpperCase().charCodeAt(0) }).catch(() => {});
    }
    await Bun.sleep(o.waitMs ?? 3500);
    const r = await page.call("Runtime.evaluate", { expression: AUDIT_JS, returnByValue: true }).catch(() => null);
    const audit = (r?.result?.value as Audit) ?? null;
    const shot = await page.call("Page.captureScreenshot", { format: "png" }).catch(() => null);
    const png = shot ? Uint8Array.from(Buffer.from(shot.data, "base64")) : null;
    let pixels: Pixels | null = null;
    if (png) try { pixels = pixelStats(decodePng(png)); } catch {}
    return { audit, pixels, png, errors: [...new Set(page.errors)] };
  } finally {
    await page.close();
  }
}

export function critiqueQuestion(art: string): string {
  return [
    "You are a strict game art director. This is a screenshot of a 3D game in development.",
    art ? `It is meant to look like this (from ART.md):\n${art.slice(0, 1200)}` : "",
    "Judge only the visuals. Score each 1-10: lighting, materials and texture, scale and proportion, detail density, atmosphere, cohesion.",
    "Then give the 3 changes that would improve it most, as concrete code changes with the LOOK kit (LOOK.stage presets, LOOK.mat.* surfaces, LOOK.city/building/car/human/tree/streetLamp, S.addLamp, S.addGlow).",
    "Be blunt and specific about what you see (e.g. 'the street is a flat grey plane', 'the player is a box'). Under 170 words.",
  ].filter(Boolean).join("\n");
}

export const lookCheck = defineTool({
  name: "look_check",
  description:
    "Judge how a 3D web game looks: opens it in a headless browser, reads the live three.js scene (materials, lighting, shadows, tone mapping, sky light, flat or stretched surfaces, scale) and the screenshot (contrast, flat areas, exposure), and returns a look score out of 100 with numbered fixes, plus a vision model's art-director critique when one can see. Run it after changing scenery, and fix the top items.",
  schema: z.object({
    target: z.string().optional().describe("Project HTML file or http://localhost URL, with any query to start play (e.g. index.html?play); default index.html"),
    critique: z.boolean().optional().describe("Ask the vision model for an art-director critique (default true)"),
    wait: z.number().int().min(500).max(20000).optional().describe("Milliseconds to let the scene build and render, default 3500"),
    keys: z.array(z.string()).max(4).optional().describe("Keys to press first to get past a title screen, e.g. [\"Enter\"]"),
    click: z.boolean().optional().describe("Click the middle of the page first (to start the game)"),
  }),
  risk: "read",
  checkpoint: false,
  async run({ target, critique = true, wait, keys, click }, ctx): Promise<ToolResult> {
    const browser = findBrowser();
    if (!browser) return NO_BROWSER;
    let url: string;
    try {
      url = await lookUrl(ctx.cwd, target, ctx.network);
    } catch (e) {
      return `error: ${(e as Error).message}`;
    }
    let r: LookResult;
    try {
      r = await inspect(browser, url, { waitMs: wait, keys, click, signal: ctx.signal });
    } catch (e) {
      return `error: could not open ${target ?? "index.html"}: ${(e as Error).message}`;
    }
    const text = [report(r.audit, r.pixels)];
    if (r.errors.length) text.push(`Console errors:\n${r.errors.slice(0, 5).map((e) => `- ${e}`).join("\n")}`);
    const images: Image[] = r.png ? [toShot(r.png, { maxSide: 960, quality: 78 })] : [];
    if (critique && ctx.see && images.length) {
      const art = await readFile(join(ctx.cwd, "ART.md"), "utf8").catch(() => "");
      const c = await ctx.see(images, critiqueQuestion(art)).catch(() => null);
      if (c) text.push(`Art director (vision model):\n${c.replace(/<think>[\s\S]*?<\/think>/g, "").trim()}`);
    }
    if (r.audit && r.audit.scenes > 0 && !r.audit.preset) text.push(r.audit.look ? "look.js is loaded but LOOK.stage isn't used: replace your renderer, lights and render loop with const S = LOOK.stage({ preset }); S.run(update). That fixes most of the list above." : "This game doesn't use LOOK yet: game_look installs it, and LOOK.stage({ preset }) fixes most of the list above in one line.");
    text.push("Fix the top items, then run look_check again.");
    return { text: text.join("\n\n"), images };
  },
});

async function lookUrl(cwd: string, target: string | undefined, network?: boolean): Promise<string> {
  if (target && !/^https?:/i.test(target) && /[?#]/.test(target)) {
    const [file, rest] = [target.replace(/[?#].*$/, ""), target.slice(target.search(/[?#]/))];
    return (await pageUrl(cwd, file, network)) + rest;
  }
  return pageUrl(cwd, target, network);
}

// The look alarm in the agent loop: a quick audit (no vision) after changes to a 3D page.
export async function lookAlarm(cwd: string, url: string, signal?: AbortSignal): Promise<{ score: number; text: string } | null> {
  const browser = findBrowser();
  if (!browser) return null;
  const r = await inspect(browser, url, { waitMs: 3000, signal });
  if (!r.audit || r.audit.scenes === 0) return null;
  const n = score(issuesOf(r.audit, r.pixels));
  return { score: n, text: report(r.audit, r.pixels, 6) };
}

// ---- find_assets ----

type PolyAsset = { name: string; type: number; categories: string[]; tags: string[]; authors?: Record<string, string>; download_count?: number };
const KIND = { hdri: "hdris", texture: "textures", model: "models" } as const;
const UA = { "User-Agent": "maxx-agent (local coding assistant)" };

export function rankAssets(all: Record<string, PolyAsset>, query: string, n = 10): [string, PolyAsset][] {
  const words = query.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  return Object.entries(all)
    .map(([id, a]) => {
      const hay = [id, a.name, ...(a.tags ?? []), ...(a.categories ?? [])].join(" ").toLowerCase();
      const hits = words.filter((w) => hay.includes(w)).length;
      return [id, a, hits + Math.log10((a.download_count ?? 0) + 10) * 0.05] as const;
    })
    .filter(([, , s]) => !words.length || s >= 1)
    .sort((x, y) => y[2] - x[2])
    .slice(0, n)
    .map(([id, a]) => [id, a]);
}

// Which files of a Poly Haven asset to fetch at a resolution.
export function pickFiles(kind: keyof typeof KIND, files: any, res: string): { path: string; url: string }[] {
  const out: { path: string; url: string }[] = [];
  const at = (o: any) => o?.[res] ?? o?.["1k"] ?? o?.[Object.keys(o ?? {})[0] ?? ""];
  if (kind === "hdri") {
    const f = at(files.hdri);
    const e = f?.exr ?? f?.hdr;
    if (e) out.push({ path: basename(new URL(e.url).pathname), url: e.url });
  } else if (kind === "texture") {
    const want: Record<string, string> = { Diffuse: "color", nor_gl: "normal", Rough: "roughness", AO: "ao", Displacement: "height", arm: "arm" };
    for (const [k, name] of Object.entries(want)) {
      const f = at(files[k]);
      const j = f?.jpg ?? f?.png;
      if (j && (name !== "arm" || !files.Rough)) out.push({ path: `${name}${extname(new URL(j.url).pathname)}`, url: j.url });
    }
  } else {
    const f = at(files.gltf)?.gltf;
    if (f) {
      out.push({ path: basename(new URL(f.url).pathname), url: f.url });
      for (const [p, inc] of Object.entries<any>(f.include ?? {})) out.push({ path: p, url: inc.url });
    }
  }
  return out;
}

function localLibrary(): string {
  return process.env.MAXX_ASSETS ?? join(maxxHome(), "assets");
}

function walk(dir: string, depth = 4, out: string[] = []): string[] {
  if (depth < 0 || !existsSync(dir)) return out;
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    try {
      if (statSync(p).isDirectory()) walk(p, depth - 1, out);
      else if (/\.(glb|gltf|fbx|obj|hdr|exr|png|jpe?g|webp|ktx2)$/i.test(f)) out.push(p);
    } catch {}
    if (out.length > 5000) break;
  }
  return out;
}

export const findAssets = defineTool({
  name: "find_assets",
  description:
    "Find and download real CC0 3D assets for a game: photo-scanned PBR textures, 3D models (glTF) and HDR skies from Poly Haven (needs network), or files from the user's own asset library (~/.maxx/assets, any packs they bought or downloaded). Search first, then call again with get to download into assets/. Load models with LOOK.model(path, { height }).",
  schema: z.object({
    kind: z.enum(["model", "texture", "hdri"]).describe("What to look for"),
    query: z.string().describe("Words to search, e.g. 'brick wall', 'street lamp', 'car', 'night city'"),
    get: z.string().optional().describe("An id from the search results to download (or a path from the local library)"),
    res: z.enum(["1k", "2k", "4k"]).optional().describe("Resolution to download, default 1k (2k for close-up textures)"),
  }),
  risk: "write",
  riskOf: (a) => (a.get ? "write" : "read"),
  ruleKey: () => "assets",
  preview: (a) => (a.get ? `download ${a.kind} "${a.get}" into assets/` : `search ${a.kind}s for "${a.query}"`),
  async run({ kind, query, get, res = "1k" }, ctx) {
    const lib = localLibrary();
    // A file from the user's own library.
    if (get && (get.startsWith(lib) || existsSync(get))) {
      const src = get.startsWith(lib) || existsSync(get) ? get : join(lib, get);
      const dest = join("assets", "library", basename(src));
      await mkdir(dirname(inside(ctx.cwd, dest)), { recursive: true });
      await copyFile(src, inside(ctx.cwd, dest));
      // glTF files bring their textures and .bin alongside.
      if (/\.gltf$/i.test(src)) {
        const t = await readFile(src, "utf8").catch(() => "");
        for (const m of t.matchAll(/"uri"\s*:\s*"([^"]+)"/g)) {
          const rel = decodeURIComponent(m[1]!);
          if (/^data:|^https?:/.test(rel)) continue;
          const from = join(dirname(src), rel), to = inside(ctx.cwd, join(dirname(dest), rel));
          if (existsSync(from)) { await mkdir(dirname(to), { recursive: true }); await copyFile(from, to); }
        }
      }
      return `copied ${src} to ${dest}. Use it: const m = await LOOK.model("${dest.replace(/\\/g, "/")}", { height: 1.8 }); S.scene.add(m);`;
    }
    const local = walk(lib).filter((p) => {
      const ok = kind === "model" ? /\.(glb|gltf|fbx|obj)$/i.test(p) : kind === "hdri" ? /\.(hdr|exr)$/i.test(p) : /\.(png|jpe?g|webp|ktx2)$/i.test(p);
      const words = query.toLowerCase().split(/\W+/).filter(Boolean);
      return ok && words.some((w) => relative(lib, p).toLowerCase().includes(w));
    }).slice(0, 8);
    const localText = local.length ? `\nIn your own library (${lib}):\n${local.map((p) => `- ${p}`).join("\n")}` : "";
    if (ctx.network === false) return `Network is off, so Poly Haven can't be searched.${localText || `\nYour asset library ${lib} has nothing matching "${query}". Put asset packs there (glb/gltf models, textures, hdr skies) to use them offline.`}`;
    try {
      const all = (await (await fetch(`https://api.polyhaven.com/assets?t=${KIND[kind]}`, { headers: UA, signal: ctx.signal })).json()) as Record<string, PolyAsset>;
      if (!get) {
        const hits = rankAssets(all, query);
        if (!hits.length) return `Poly Haven has no ${kind} matching "${query}".${localText}`;
        return `Poly Haven ${kind}s for "${query}" (all CC0, free for any use):\n${hits.map(([id, a]) => `- ${id}: ${a.name} [${(a.categories ?? []).slice(0, 3).join(", ")}]`).join("\n")}${localText}\nDownload one with find_assets({ kind: "${kind}", query: "${query}", get: "<id>" }).`;
      }
      if (!all[get]) return `error: no Poly Haven ${kind} with id "${get}". Search first.`;
      const files = await (await fetch(`https://api.polyhaven.com/files/${encodeURIComponent(get)}`, { headers: UA, signal: ctx.signal })).json();
      const list = pickFiles(kind, files, res);
      if (!list.length) return `error: ${get} has no downloadable ${kind} files at ${res}`;
      const dir = join("assets", "polyhaven", get);
      let bytes = 0;
      for (const f of list) {
        const r = await fetch(f.url, { headers: UA, signal: ctx.signal });
        if (!r.ok) return `error: download failed (${r.status}) for ${f.url}`;
        const b = new Uint8Array(await r.arrayBuffer());
        bytes += b.length;
        const abs = inside(ctx.cwd, join(dir, f.path));
        await mkdir(dirname(abs), { recursive: true });
        await writeFile(abs, b);
      }
      const a = all[get]!;
      const credits = join(ctx.cwd, "assets", "CREDITS.md");
      const prev = await readFile(credits, "utf8").catch(() => "# Asset credits\n\n");
      if (!prev.includes(`polyhaven.com/a/${get}`)) await writeFile(credits, `${prev}- ${a.name} by ${Object.keys(a.authors ?? {}).join(", ") || "Poly Haven"}, CC0, https://polyhaven.com/a/${get}\n`);
      const d = dir.replace(/\\/g, "/");
      const use =
        kind === "model" ? `const m = await LOOK.model("${d}/${list[0]!.path}", { height: 2 }); S.scene.add(m);`
        : kind === "hdri" ? `new LOOK.addons.EXRLoader().load("${d}/${list[0]!.path}", (t) => { t.mapping = THREE.EquirectangularReflectionMapping; S.scene.environment = t; }); (needs the page served over http, not file://)`
        : `const tl = new THREE.TextureLoader(); const m = new THREE.MeshStandardMaterial({ map: tl.load("${d}/color.jpg"), normalMap: tl.load("${d}/normal.jpg"), roughnessMap: tl.load("${d}/roughness.jpg") }); m.map.colorSpace = THREE.SRGBColorSpace; m.userData.look = { uv: "meters", tile: 2 }; // LOOK lays UVs in metres, 2 m per repeat; set wrapS/wrapT = THREE.RepeatWrapping on each map`;
      return `downloaded ${a.name} (${list.length} files, ${(bytes / 1048576).toFixed(1)} MB) into ${d}/, credited in assets/CREDITS.md.\nUse it: ${use}`;
    } catch (e) {
      return `error: Poly Haven could not be reached: ${(e as Error).message}${localText}`;
    }
  },
});

export const LOOK_TOOLS: Tool<any>[] = [artDirection, gameLook, lookCheck, findAssets];
export const LOOK_PROMPT = [
  "Look tools, for 3D games and scenes: before coding scenery, call art_direction (writes ART.md) and game_look (installs LOOK: three.js plus a realism kit; read its API in the reply).",
  "Build with LOOK, never from bare boxes: const S = LOOK.stage({ preset }); LOOK.city / LOOK.building / LOOK.car / LOOK.human / LOOK.tree; LOOK.mat.* PBR surfaces in metres. 1 unit = 1 metre; a person is 1.75 m.",
  "After changing how the game looks, run look_check and fix its top items until it scores 80+. find_assets downloads real CC0 models, textures and skies.",
].join("\n");

// Messages about 3D games and scenes bring the look tools along.
export function wantsLook(text: string): boolean {
  return /\b(3d|three\.?js|webgl|open[- ]world|gta|first[- ]person|third[- ]person|fps|racing game|driving game|flight sim|voxel|low[- ]?poly|realistic graphics|graphics|shaders?|lighting|textures?|game assets?|art style|looks? (bad|ugly|cheap|terrible|flat))\b/i.test(text);
}
