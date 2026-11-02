// How much context the loaded model really has. --context (and the app's
// shortcut) says one number for every model, but the server may have loaded
// this one with less: DeepSeek in Strata ran at 8192 while Maxx planned for
// 65536, so compaction never started and replies ran out of room. Maxx asks
// the server, and failing that, reads the number out of a "too long" error.

const FIELDS = ["loaded_context_length", "context_length", "max_model_len", "n_ctx", "context_window", "max_context_length", "context_size", "num_ctx"];

function pick(o: any): number | null {
  if (!o || typeof o !== "object") return null;
  for (const f of FIELDS) {
    const v = Number(o[f]);
    if (Number.isFinite(v) && v >= 512) return v;
  }
  return pick(o.meta) ?? pick(o.details) ?? pick(o.settings) ?? null;
}

async function getJSON(url: string, signal?: AbortSignal): Promise<any> {
  const s = AbortSignal.any([AbortSignal.timeout(2500), ...(signal ? [signal] : [])]);
  const res = await fetch(url, { signal: s });
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

// The context the server says this model was loaded with, or null when it won't say.
export async function probeContext(baseURL: string, model: string, signal?: AbortSignal): Promise<number | null> {
  const base = baseURL.replace(/\/$/, "");
  const root = base.replace(/\/v\d+$/, "");
  // OpenAI-style list: vLLM's max_model_len, others' context_length.
  const j = await getJSON(`${base}/models`, signal).catch(() => null);
  const list: any[] = Array.isArray(j?.data) ? j.data : Array.isArray(j?.models) ? j.models : [];
  const entry = list.find((m) => m?.id === model || m?.name === model || m?.model === model);
  const listed = pick(entry);
  if (listed) return listed;
  // Only ask a server's own API when the list says which server it is.
  const owner = String(entry?.owned_by ?? list[0]?.owned_by ?? "");
  if (owner === "organization_owner") {
    // LM Studio knows what was loaded.
    const m = await getJSON(`${root}/api/v0/models/${encodeURIComponent(model)}`, signal).catch(() => null);
    const n = Number(m?.loaded_context_length);
    return Number.isFinite(n) && n >= 512 ? n : null;
  }
  if (owner === "llamacpp") {
    const p = await getJSON(`${root}/props`, signal).catch(() => null);
    return pick(p?.default_generation_settings) ?? pick(p);
  }
  return null;
}

// The window to plan for: never more than the server has; the setting when it won't say.
export async function fitContext(baseURL: string, model: string, wanted: number, signal?: AbortSignal): Promise<{ context: number; note?: string }> {
  const real = await probeContext(baseURL, model, signal);
  if (!real || real >= wanted) return { context: wanted };
  return { context: real, note: `(${model} is loaded with ${real} tokens of context, not ${wanted}; Maxx plans for ${real})` };
}

// "exceeds the available context size (8192 tokens)", "maximum context length is 8192 tokens",
// "n_ctx: 8192", "context window of 8192": the real window, from a refused request.
export function contextFromError(message: string): number | null {
  if (!/context|n_ctx|too long|too many tokens|maximum.*tokens/i.test(message)) return null;
  const m =
    message.match(/(?:context(?: size| length| window)?|n_ctx(?:_slot)?|max(?:imum)?(?: context)?(?: length)?)\D{0,30}?(\d{3,7})/i) ??
    message.match(/(\d{3,7})\s*tokens? (?:of )?context/i);
  const n = m ? Number(m[1]) : NaN;
  return Number.isFinite(n) && n >= 512 ? n : null;
}
