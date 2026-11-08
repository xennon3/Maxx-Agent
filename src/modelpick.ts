// Which model a new session starts on. The OpenAI-style /models list is not
// "what is running": LM Studio lists every model on disk, in its own order, so
// "the first one listed" was often a model nobody had used, and the picker
// went back to it every time. Maxx now asks the server which model is really
// loaded, remembers the last one picked, and only then falls back.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { maxxHome } from "./sessions.ts";

export interface ModelList {
  ids: string[]; // what the server lists, chat models only
  loaded: string[]; // the ones it says are in memory right now (empty when it won't say)
  ok: boolean; // false when the server did not answer
}

async function getJSON(url: string, ms: number): Promise<any> {
  const res = await fetch(url, { signal: AbortSignal.timeout(ms) });
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

const chatModel = (m: any) => !/embed/i.test(String(m?.id ?? m?.name ?? "")) && !/embed/i.test(String(m?.type ?? ""));

export async function listModels(baseURL: string, ms = 3000): Promise<ModelList> {
  const base = baseURL.replace(/\/$/, "");
  const root = base.replace(/\/v\d+$/, "");
  const list = await getJSON(`${base}/models`, ms).catch(() => null);
  const rows: any[] = Array.isArray(list?.data) ? list.data : Array.isArray(list?.models) ? list.models : [];
  const ids = [...new Set(rows.filter(chatModel).map((m) => String(m.id ?? m.name)).filter(Boolean))];
  // Only ask a server's own API when the list says which server it is.
  const owner = String(rows[0]?.owned_by ?? "");
  const short = Math.min(ms, 1500);
  // LM Studio: every model with state "loaded" or "not-loaded".
  const lms = owner === "organization_owner" ? await getJSON(`${root}/api/v0/models`, short).catch(() => null) : null;
  // Ollama: the models in memory.
  const ollama = owner === "library" || /:11434\b/.test(base) ? await getJSON(`${root}/api/ps`, short).catch(() => null) : null;
  const loaded = new Set<string>();
  for (const m of Array.isArray(lms?.data) ? lms.data : []) if (m?.state === "loaded" && chatModel(m)) loaded.add(String(m.id));
  for (const m of Array.isArray(ollama?.models) ? ollama.models : []) if (chatModel(m)) loaded.add(String(m.model ?? m.name));
  // A server that serves just one model (llama.cpp, Strata, vLLM) has that one loaded.
  if (!loaded.size && ids.length === 1) loaded.add(ids[0]!);
  return { ids, loaded: [...loaded].filter((id) => ids.includes(id)), ok: !!list };
}

// The model a new session (or a session whose model has gone) should use.
// Order: the one model in memory; the last pick, if it is listed (and among
// the loaded ones when several are); one that is loaded; $MAXX_MODEL if
// listed; the first listed. With no list at all, the last pick or $MAXX_MODEL.
export function chooseModel(l: ModelList, last?: string | null, env?: string | null): string | undefined {
  const listed = (id?: string | null): id is string => !!id && l.ids.includes(id);
  if (!l.ids.length) return last || env || undefined;
  if (l.loaded.length === 1) return l.loaded[0];
  if (l.loaded.length > 1) return [last, env].find((id) => !!id && l.loaded.includes(id)) ?? l.loaded[0];
  return [last, env].find(listed) ?? l.ids[0];
}

const lastFile = () => join(maxxHome(), "model.json");

export async function lastModel(): Promise<string | null> {
  try {
    return (JSON.parse(await readFile(lastFile(), "utf8")) as { model?: string }).model || null;
  } catch {
    return null;
  }
}

export async function rememberModel(model: string): Promise<void> {
  if (!model) return;
  try {
    if ((await lastModel()) === model) return;
    await mkdir(maxxHome(), { recursive: true });
    await writeFile(lastFile(), JSON.stringify({ model, at: new Date().toISOString() }, null, 2) + "\n");
  } catch {}
}
