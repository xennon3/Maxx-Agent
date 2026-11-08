// make_song's engine: ACE-Step 1.5, the open music model that writes whole
// songs (vocals included) from a style description and lyrics. It runs on
// this PC as its own API server (start_api_server.bat, port 8001), and Maxx
// only talks to it: nothing leaves the machine.
// API: POST /release_task -> task_id; POST /query_result until status 1; GET /v1/audio?path=...

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { maxxHome } from "../sessions.ts";

export type SongConfig = { url?: string; steps?: number; model?: string; thinking?: boolean };
export type SongServer = { url: string; models: string[] };

export const songFile = () => join(maxxHome(), "music.json");

export async function loadSongConfig(): Promise<SongConfig> {
  try {
    return JSON.parse(await readFile(songFile(), "utf8"));
  } catch {
    return {};
  }
}

export const INSTALL_HELP = [
  "No local song model is running. Maxx uses ACE-Step 1.5 (free, runs on your GPU, under 4 GB of VRAM):",
  "  1. git clone https://github.com/ACE-Step/ACE-Step-1.5",
  "  2. In that folder: start_api_server.bat (Windows) or `uv sync` then `uv run acestep-api`.",
  "     The first start downloads the model (several GB).",
  "  3. Leave it running; it listens on http://127.0.0.1:8001. Then try again.",
  "Another address: set MAXX_SONG_URL, or put {\"url\": \"http://host:port\"} in ~/.maxx/music.json.",
].join("\n");

async function getJson(url: string, ms = 1500): Promise<any> {
  const r = await fetch(url, { signal: AbortSignal.timeout(ms) });
  if (!r.ok) throw new Error(`${r.status} from ${url}`);
  return r.json();
}

// The server that answers, or null.
export async function findSongServer(cfg: SongConfig = {}, env = process.env): Promise<SongServer | null> {
  const given = env.MAXX_SONG_URL ?? cfg.url;
  const tries = given ? [given] : ["http://127.0.0.1:8001", "http://127.0.0.1:8002"];
  for (const raw of tries) {
    const url = raw.replace(/\/+$/, "");
    try {
      await getJson(`${url}/health`);
      let models: string[] = [];
      try {
        const m = await getJson(`${url}/v1/models`);
        const list = m?.data?.models ?? m?.data ?? m?.models ?? [];
        models = (Array.isArray(list) ? list : []).map((x: any) => (typeof x === "string" ? x : x?.name ?? x?.id ?? "")).filter(Boolean);
      } catch {}
      return { url, models };
    } catch {}
  }
  return null;
}

export type SongAsk = {
  mode?: "new" | "cover" | "repaint" | "extend";
  prompt: string;
  lyrics?: string;
  seconds?: number;
  bpm?: number;
  key?: string;
  meter?: string;
  language?: string;
  seed?: number;
  takes?: number;
  format?: "mp3" | "wav" | "flac" | "ogg";
  from?: string; // absolute path of the audio to cover, repaint or extend
  start?: number;
  end?: number;
  strength?: number;
  steps?: number;
  thinking?: boolean;
};

const TASK: Record<string, string> = { new: "text2music", cover: "cover", repaint: "repaint", extend: "complete" };

// The form fields for /release_task (all as strings, for multipart).
export function taskFields(a: SongAsk, cfg: SongConfig = {}): Record<string, string> {
  const mode = a.mode ?? "new";
  const f: Record<string, string> = {
    task_type: TASK[mode] ?? "text2music",
    prompt: a.prompt,
    lyrics: a.lyrics?.trim() ? a.lyrics : "[Instrumental]",
    audio_format: a.format === "ogg" ? "opus" : (a.format ?? "mp3"),
    batch_size: String(Math.max(1, Math.min(4, a.takes ?? 1))),
    inference_steps: String(a.steps ?? cfg.steps ?? 8),
    vocal_language: a.language ?? "en",
    thinking: String(a.thinking ?? cfg.thinking ?? mode === "new"),
  };
  if (a.seconds) f.audio_duration = String(Math.max(10, Math.min(600, a.seconds)));
  if (a.bpm) f.bpm = String(Math.round(Math.max(30, Math.min(300, a.bpm))));
  if (a.key) f.key_scale = a.key;
  if (a.meter) f.time_signature = a.meter;
  if (a.seed !== undefined && a.seed >= 0) { f.seed = String(a.seed); f.use_random_seed = "false"; }
  if (cfg.model) f.model = cfg.model;
  if (mode === "cover") f.audio_cover_strength = String(a.strength ?? 0.7);
  if (mode === "repaint") {
    f.repainting_start = String(a.start ?? 0);
    if (a.end !== undefined) f.repainting_end = String(a.end);
  }
  return f;
}

type Wrapped<T> = { code?: number; data?: T; error?: string | null } & Record<string, unknown>;
const unwrap = <T>(j: Wrapped<T>): T => {
  if (j && typeof j === "object" && "data" in j) {
    if (j.code !== undefined && j.code !== 200 && j.error) throw new Error(String(j.error));
    return j.data as T;
  }
  return j as unknown as T;
};

export type SongResult = { files: { url: string; seed?: number; metas?: Record<string, unknown> }[]; seconds: number };

// Results come back as a JSON string holding one result or a list of them.
export function readResults(raw: unknown): { file: string; seed_value?: number; metas?: Record<string, unknown> }[] {
  let r: any = raw;
  if (typeof r === "string") {
    try { r = JSON.parse(r); } catch { return []; }
  }
  const list = Array.isArray(r) ? r : r?.results ?? [r];
  return list.filter((x: any) => x && typeof x.file === "string");
}

export async function makeSong(server: SongServer, a: SongAsk, cfg: SongConfig = {}, opts: { signal?: AbortSignal; progress?: (s: string) => void } = {}): Promise<SongResult> {
  const fields = taskFields(a, cfg);
  const started = Date.now();
  let body: BodyInit, headers: Record<string, string> = {};
  if (a.from) {
    if (!existsSync(a.from)) throw new Error(`${a.from} does not exist`);
    const form = new FormData();
    for (const [k, v] of Object.entries(fields)) form.append(k, v);
    form.append("src_audio", new Blob([await readFile(a.from)]), basename(a.from));
    body = form;
  } else {
    body = JSON.stringify({ ...fields, batch_size: Number(fields.batch_size), inference_steps: Number(fields.inference_steps), thinking: fields.thinking === "true", ...(fields.audio_duration ? { audio_duration: Number(fields.audio_duration) } : {}), ...(fields.bpm ? { bpm: Number(fields.bpm) } : {}), ...(fields.seed ? { seed: Number(fields.seed), use_random_seed: false } : {}) });
    headers = { "content-type": "application/json" };
  }
  const sub = await fetch(`${server.url}/release_task`, { method: "POST", headers, body, signal: opts.signal });
  if (!sub.ok) throw new Error(`the song model refused the job (${sub.status}): ${(await sub.text()).slice(0, 300)}`);
  const task = unwrap<{ task_id: string; queue_position?: number }>(await sub.json());
  if (!task?.task_id) throw new Error("the song model gave no task id");
  opts.progress?.(`queued${task.queue_position ? ` (#${task.queue_position})` : ""}`);
  const until = Date.now() + 20 * 60_000;
  while (Date.now() < until) {
    if (opts.signal?.aborted) throw new Error("stopped");
    await Bun.sleep(2000);
    const q = await fetch(`${server.url}/query_result`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ task_id_list: [task.task_id] }), signal: opts.signal });
    if (!q.ok) continue;
    const items = unwrap<any[]>(await q.json());
    const item = (Array.isArray(items) ? items : []).find((x) => x?.task_id === task.task_id) ?? (Array.isArray(items) ? items[0] : null);
    if (!item) continue;
    if (item.status === 2) throw new Error(`the song model failed: ${String(item.error ?? item.result ?? "no reason given").slice(0, 300)}`);
    if (item.status !== 1) { opts.progress?.(`working… ${Math.round((Date.now() - started) / 1000)}s`); continue; }
    const results = readResults(item.result);
    if (!results.length) throw new Error("the song model finished but returned no audio");
    return {
      files: results.map((x) => ({ url: x.file.startsWith("http") ? x.file : `${server.url}${x.file.startsWith("/") ? "" : "/"}${x.file}`, seed: x.seed_value, metas: x.metas })),
      seconds: (Date.now() - started) / 1000,
    };
  }
  throw new Error("the song model took more than 20 minutes");
}

export async function download(url: string, signal?: AbortSignal): Promise<Uint8Array> {
  const r = await fetch(url, { signal });
  if (!r.ok) throw new Error(`could not fetch the song (${r.status})`);
  return new Uint8Array(await r.arrayBuffer());
}
