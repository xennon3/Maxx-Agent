import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { z } from "zod";
import { defineTool } from "./types.ts";
import { inside } from "./paths.ts";
import { maxxHome } from "../sessions.ts";
import { toShot } from "../image.ts";
import { slug } from "../recipes.ts";
import { runCanvas } from "./canvas.ts";

// image_generate: pictures from the image model running on this machine.
// Maxx talks to whichever local server is up: ComfyUI (port 8188), Forge,
// Automatic1111 or SD.Next (port 7860), or anything with an OpenAI-style
// /v1/images/generations (LocalAI, sd.cpp server...). Nothing leaves the PC.

export type ImagesConfig = { backend?: "comfyui" | "a1111" | "openai"; url?: string; model?: string; steps?: number; cfg?: number; negative?: string };
export type Backend = { kind: "comfyui" | "a1111" | "openai"; url: string; models: string[] };

export const imagesFile = () => join(maxxHome(), "images.json");

export async function loadImagesConfig(): Promise<ImagesConfig> {
  try {
    return JSON.parse(await readFile(imagesFile(), "utf8"));
  } catch {
    return {};
  }
}

const get = async (url: string, ms = 1500) => {
  const r = await fetch(url, { signal: AbortSignal.timeout(ms) });
  if (!r.ok) throw new Error(`${r.status} from ${url}`);
  return r.json() as Promise<any>;
};

// Which server answers, and what models it has.
export async function findBackend(cfg: ImagesConfig = {}, env = process.env): Promise<Backend | null> {
  const tries: [Backend["kind"], string][] = [];
  const given = env.MAXX_IMAGES_URL ?? cfg.url;
  if (given) tries.push(...(cfg.backend ? [[cfg.backend, given] as [Backend["kind"], string]] : (["comfyui", "a1111", "openai"] as const).map((k) => [k, given] as [Backend["kind"], string])));
  else tries.push(["comfyui", "http://127.0.0.1:8188"], ["a1111", "http://127.0.0.1:7860"], ["a1111", "http://127.0.0.1:7861"], ["comfyui", "http://127.0.0.1:8000"]);
  for (const [kind, raw] of tries) {
    const url = raw.replace(/\/+$/, "");
    try {
      if (kind === "comfyui") {
        await get(`${url}/system_stats`);
        const info = await get(`${url}/object_info/CheckpointLoaderSimple`);
        const models: string[] = info?.CheckpointLoaderSimple?.input?.required?.ckpt_name?.[0] ?? [];
        return { kind, url, models };
      }
      if (kind === "a1111") {
        const models = ((await get(`${url}/sdapi/v1/sd-models`)) as { title: string }[]).map((m) => m.title);
        return { kind, url, models };
      }
      const base = /\/v1$/.test(url) ? url : `${url}/v1`;
      const list = await get(`${base}/models`);
      return { kind, url: base, models: (list.data ?? []).map((m: { id: string }) => m.id) };
    } catch {}
  }
  return null;
}

// Few-step models (turbo, lightning, schnell, LCM) want few steps and a low CFG.
export function defaultsFor(model = ""): { steps: number; cfg: number } {
  if (/schnell|flux/i.test(model)) return { steps: 4, cfg: 1 };
  if (/turbo|lightning|lcm|hyper/i.test(model)) return { steps: 6, cfg: 1.5 };
  return { steps: 24, cfg: 6 };
}

export const STYLES: Record<string, string> = {
  "pixel-art": "pixel art, 16-bit video game sprite, crisp pixels, limited palette, no anti-aliasing",
  "flat-icon": "flat vector icon, simple shapes, bold clean outlines, centered, minimal, app icon style",
  "game-sprite": "2D game sprite, full body, centered, clean silhouette, cel shaded",
  photo: "photograph, natural light, sharp focus, high detail",
  illustration: "digital illustration, vibrant colors, clean linework",
  "ui-illustration": "flat UI illustration for a website hero, soft gradients, friendly, modern",
  watercolor: "watercolor painting, soft edges, paper texture",
  "3d": "3D render, soft studio lighting, clay material, isometric",
  background: "game background, wide scenic landscape, parallax layer, no characters",
  texture: "seamless tileable texture, top-down, even lighting",
};
const NEGATIVE = "blurry, low quality, watermark, text, signature, jpeg artifacts, deformed, extra limbs";

export function buildPrompt(prompt: string, style?: string, transparent?: boolean): string {
  return [prompt, style ? (STYLES[style] ?? style) : "", transparent ? "isolated on a plain solid magenta (#ff00ff) background, nothing else in the background" : ""].filter(Boolean).join(", ");
}

// ComfyUI's API takes a graph; this is the standard text-to-image one.
export function comfyGraph(o: { ckpt: string; prompt: string; negative: string; width: number; height: number; steps: number; cfg: number; seed: number; n: number }) {
  return {
    "4": { class_type: "CheckpointLoaderSimple", inputs: { ckpt_name: o.ckpt } },
    "5": { class_type: "EmptyLatentImage", inputs: { width: o.width, height: o.height, batch_size: o.n } },
    "6": { class_type: "CLIPTextEncode", inputs: { text: o.prompt, clip: ["4", 1] } },
    "7": { class_type: "CLIPTextEncode", inputs: { text: o.negative, clip: ["4", 1] } },
    "3": { class_type: "KSampler", inputs: { seed: o.seed, steps: o.steps, cfg: o.cfg, sampler_name: o.steps <= 8 ? "euler_ancestral" : "dpmpp_2m", scheduler: o.steps <= 8 ? "sgm_uniform" : "karras", denoise: 1, model: ["4", 0], positive: ["6", 0], negative: ["7", 0], latent_image: ["5", 0] } },
    "8": { class_type: "VAEDecode", inputs: { samples: ["3", 0], vae: ["4", 2] } },
    "9": { class_type: "SaveImage", inputs: { filename_prefix: "maxx", images: ["8", 0] } },
  };
}

type Ask = { prompt: string; negative: string; width: number; height: number; steps: number; cfg: number; seed: number; n: number; model?: string };

export async function generate(b: Backend, a: Ask, signal?: AbortSignal): Promise<Uint8Array[]> {
  if (b.kind === "a1111") {
    const body = { prompt: a.prompt, negative_prompt: a.negative, width: a.width, height: a.height, steps: a.steps, cfg_scale: a.cfg, seed: a.seed, batch_size: a.n, ...(a.model ? { override_settings: { sd_model_checkpoint: a.model } } : {}) };
    const r = await fetch(`${b.url}/sdapi/v1/txt2img`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), signal });
    if (!r.ok) throw new Error(`${b.url} said ${r.status}: ${(await r.text()).slice(0, 200)}`);
    return ((await r.json()) as { images: string[] }).images.map((s) => Buffer.from(s, "base64"));
  }
  if (b.kind === "openai") {
    const r = await fetch(`${b.url}/images/generations`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ model: a.model ?? b.models[0], prompt: a.prompt, n: a.n, size: `${a.width}x${a.height}`, response_format: "b64_json" }), signal });
    if (!r.ok) throw new Error(`${b.url} said ${r.status}: ${(await r.text()).slice(0, 200)}`);
    return ((await r.json()) as { data: { b64_json: string }[] }).data.map((d) => Buffer.from(d.b64_json, "base64"));
  }
  const ckpt = a.model ?? b.models[0];
  if (!ckpt) throw new Error("ComfyUI has no checkpoint models; put one in ComfyUI/models/checkpoints");
  const sub = await fetch(`${b.url}/prompt`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prompt: comfyGraph({ ...a, ckpt }), client_id: "maxx" }), signal });
  if (!sub.ok) throw new Error(`ComfyUI refused the job: ${(await sub.text()).slice(0, 300)}`);
  const { prompt_id } = (await sub.json()) as { prompt_id: string };
  const until = Date.now() + 10 * 60_000;
  while (Date.now() < until) {
    if (signal?.aborted) throw new Error("stopped");
    const h = (await get(`${b.url}/history/${prompt_id}`, 5000).catch(() => ({}))) as Record<string, any>;
    const job = h[prompt_id];
    if (job?.status?.status_str === "error") throw new Error(`ComfyUI failed: ${JSON.stringify(job.status.messages ?? "").slice(0, 300)}`);
    const imgs = Object.values(job?.outputs ?? {}).flatMap((o: any) => o.images ?? []) as { filename: string; subfolder: string; type: string }[];
    if (imgs.length) return Promise.all(imgs.map(async (i) => new Uint8Array(await (await fetch(`${b.url}/view?${new URLSearchParams({ filename: i.filename, subfolder: i.subfolder, type: i.type })}`)).arrayBuffer())));
    await Bun.sleep(700);
  }
  throw new Error("ComfyUI took over 10 minutes");
}

// The magenta backdrop asked for in the prompt becomes see-through.
export const KEY_OUT = `(img, c, g) => {
  const d = g.getImageData(0, 0, c.width, c.height), p = d.data;
  for (let i = 0; i < p.length; i += 4) {
    const r = p[i], gr = p[i + 1], b = p[i + 2];
    const mag = Math.min(r, b) - gr;
    if (mag > 90 && r > 120 && b > 120) p[i + 3] = 0;
    else if (mag > 40) { p[i + 3] = Math.max(0, 255 - (mag - 40) * 5); p[i] = p[i + 2] = Math.max(gr, Math.min(r, b) - mag); }
  }
  g.putImageData(d, 0, 0);
}`;

const NO_SERVER = `No local image model is running. Start one of these on this PC, then try again:
- ComfyUI (port 8188) with a checkpoint such as SDXL-Turbo or FLUX.1-schnell in models/checkpoints
- Stable Diffusion WebUI Forge or Automatic1111 started with --api (port 7860)
- Any OpenAI-style images server: set "url" in ${imagesFile()}
Run \`maxx doctor media\` to check.`;

export const imageGenerate = defineTool({
  name: "image_generate",
  description:
    "Make a picture with the local image model (game sprites, backgrounds, textures, app art, website illustrations) and save it as a file. Describe the subject plainly; style adds a look (pixel-art, flat-icon, game-sprite, photo, illustration, ui-illustration, watercolor, 3d, background, texture). transparent: true removes the background, for sprites and icons.",
  schema: z.object({
    prompt: z.string().describe("What to draw, e.g. 'a red fox knight with a sword'"),
    path: z.string().optional().describe("Where to save it, e.g. assets/fox.png; default assets/<prompt>.png"),
    style: z.string().optional(),
    transparent: z.boolean().optional(),
    width: z.number().int().min(256).max(2048).optional().describe("Default 1024 (512 for pixel art)"),
    height: z.number().int().min(256).max(2048).optional(),
    count: z.number().int().min(1).max(4).optional().describe("How many versions to make, default 1"),
    seed: z.number().int().optional().describe("Same seed and prompt give the same picture"),
  }),
  risk: "write",
  ruleKey: () => "image",
  preview: (a) => `generate ${a.count ?? 1} image(s): "${a.prompt}"${a.style ? ` (${a.style})` : ""} → ${a.path ?? "assets/"}`,
  async run(a, ctx) {
    const cfg = await loadImagesConfig();
    const b = await findBackend(cfg);
    if (!b) return NO_SERVER;
    const model = cfg.model ?? b.models.find((m) => /turbo|schnell|lightning/i.test(m)) ?? b.models[0];
    const d = defaultsFor(model);
    const size = a.style === "pixel-art" ? 512 : 1024;
    const seed = a.seed ?? Math.floor(Math.random() * 2 ** 31);
    const n = a.count ?? 1;
    let pngs: Uint8Array[];
    const t0 = Date.now();
    try {
      pngs = await generate(b, { prompt: buildPrompt(a.prompt, a.style, a.transparent), negative: cfg.negative ?? NEGATIVE, width: a.width ?? size, height: a.height ?? size, steps: cfg.steps ?? d.steps, cfg: cfg.cfg ?? d.cfg, seed, n, model });
    } catch (e) {
      return `error from ${b.kind} at ${b.url}: ${(e as Error).message}`;
    }
    const base = a.path ?? `assets/${slug(a.prompt).slice(0, 40) || "image"}.png`;
    const ext = extname(base) || ".png";
    const stem = base.slice(0, base.length - extname(base).length);
    const saved: string[] = [];
    const shots = [];
    for (const [i, raw] of pngs.entries()) {
      let png = raw;
      if (a.transparent || /\.(webp|jpe?g)$/i.test(ext)) png = (await runCanvas(png, { draw: a.transparent ? KEY_OUT : undefined, mime: ext })) ?? png;
      const file = pngs.length > 1 ? `${stem}-${i + 1}${ext}` : `${stem}${ext}`;
      const abs = inside(ctx.cwd, file);
      await mkdir(dirname(abs), { recursive: true });
      await writeFile(abs, png);
      saved.push(file);
      try {
        shots.push(toShot(png, { maxSide: 512, quality: 70 }));
      } catch {}
    }
    return {
      text: `made ${saved.length} image(s) in ${Math.round((Date.now() - t0) / 1000)}s with ${model ?? b.kind} (seed ${seed}): ${saved.join(", ")}${a.transparent ? "\nbackground removed; check the edges in the preview" : ""}\nLook at it: if it is wrong, change the prompt or seed and make it again. image_edit can crop, resize, recolor or pixelate it.`,
      images: shots,
    };
  },
});

export async function imagesDoctor(): Promise<string> {
  const cfg = await loadImagesConfig();
  const b = await findBackend(cfg);
  if (!b) return NO_SERVER;
  const model = cfg.model ?? b.models.find((m) => /turbo|schnell|lightning/i.test(m)) ?? b.models[0];
  return `images: ${b.kind} at ${b.url}, ${b.models.length} model(s)${model ? `, using ${model} (${defaultsFor(model).steps} steps)` : ""}${existsSync(imagesFile()) ? `; settings in ${imagesFile()}` : ""}`;
}
