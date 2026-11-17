// Search by meaning, when the model server has an embedding model loaded
// (LM Studio ships nomic-embed-text; llama.cpp serves one with --embedding).
// It is optional: without one, the library still finds passages by their words.
// Vectors are stored as 8-bit numbers, about 1 KB a passage.

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { maxxHome } from "../sessions.ts";

export type EmbedServer = { baseURL: string; apiKey?: string };
export type Embedder = { model: string; embed(texts: string[], signal?: AbortSignal): Promise<Float32Array[]> };

let server: EmbedServer | null = null;
let found: { at: number; e: Embedder | null; why: string } | null = null;
const RECHECK = 10 * 60_000;

// The agent says where its model server is; the library looks there for an embedding model.
export function useEmbedServer(s: EmbedServer | null) {
  if (s?.baseURL === server?.baseURL && s?.apiKey === server?.apiKey) return;
  server = s;
  found = null;
}

const EMBED_ID = /embed|bge-|\bbge\b|\be5-|gte-|minilm|mxbai|nomic|arctic-embed|jina-emb|snowflake/i;

type Config = { embed?: "auto" | "off" | string; embedURL?: string };
async function config(): Promise<Config> {
  try {
    return JSON.parse(await readFile(join(maxxHome(), "library.json"), "utf8")) as Config;
  } catch {
    return {};
  }
}

async function post(base: string, key: string | undefined, model: string, input: string[], signal?: AbortSignal): Promise<Float32Array[]> {
  const res = await fetch(`${base.replace(/\/$/, "")}/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(key ? { Authorization: `Bearer ${key}` } : {}) },
    body: JSON.stringify({ model, input }),
    signal: signal ?? AbortSignal.timeout(60_000),
  });
  if (!res.ok) throw new Error(`embeddings answered ${res.status}`);
  const j = (await res.json()) as { data?: { embedding: number[]; index?: number }[] };
  const data = (j.data ?? []).slice().sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  if (data.length !== input.length) throw new Error("embeddings came back short");
  return data.map((d) => normalize(Float32Array.from(d.embedding)));
}

export async function embedder(): Promise<{ e: Embedder | null; why: string }> {
  if (found && Date.now() - found.at < RECHECK) return found;
  const c = await config();
  const base = c.embedURL || server?.baseURL;
  const key = server?.apiKey;
  let e: Embedder | null = null;
  let why = "";
  if (c.embed === "off") why = "meaning search is off in ~/.maxx/library.json";
  else if (!base) why = "no model server";
  else {
    try {
      let model = c.embed && c.embed !== "auto" ? c.embed : "";
      if (!model) {
        const r = await fetch(`${base.replace(/\/$/, "")}/models`, { headers: key ? { Authorization: `Bearer ${key}` } : {}, signal: AbortSignal.timeout(4000) });
        const list = ((await r.json()) as { data?: { id: string; type?: string }[] }).data ?? [];
        model = list.find((m) => m.type === "embeddings" || EMBED_ID.test(m.id))?.id ?? "";
      }
      if (!model) why = "no embedding model loaded (load nomic-embed-text in LM Studio for meaning search)";
      else {
        await post(base, key, model, ["test"]);
        e = { model, embed: (texts, signal) => post(base, key, model, texts, signal) };
      }
    } catch (err) {
      why = `the model server has no embeddings (${(err as Error).message})`;
    }
  }
  found = { at: Date.now(), e, why };
  return found;
}

export function normalize(v: Float32Array): Float32Array {
  let n = 0;
  for (const x of v) n += x * x;
  n = Math.sqrt(n) || 1;
  for (let i = 0; i < v.length; i++) v[i]! /= n;
  return v;
}

// 8-bit: each value of a unit vector times 127. Cosine survives this well.
export function pack(v: Float32Array): string {
  const b = new Int8Array(v.length);
  for (let i = 0; i < v.length; i++) b[i] = Math.max(-127, Math.min(127, Math.round(v[i]! * 127)));
  return Buffer.from(b.buffer).toString("base64");
}

export function unpack(s: string): Int8Array {
  const buf = Buffer.from(s, "base64");
  return new Int8Array(buf.buffer, buf.byteOffset, buf.length);
}

export function cosine(q: Float32Array, v: Int8Array): number {
  if (q.length !== v.length) return 0;
  let dot = 0, n = 0;
  for (let i = 0; i < v.length; i++) {
    dot += q[i]! * v[i]!;
    n += v[i]! * v[i]!;
  }
  return n ? dot / Math.sqrt(n) : 0;
}
