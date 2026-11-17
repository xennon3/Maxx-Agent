// 📚 Maxx's library: every web page it reads is kept on this PC, cleaned to
// text and cut into passages, so the next time the same question comes up the
// answer is a disk read away instead of a search and a download. Lives in
// ~/.maxx/library: one JSON file a page, plus stats and the search cache.

import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { maxxHome } from "../sessions.ts";
import { Bm25, chunk, tokens } from "./rank.ts";
import { classify, expiresAt, FRESH_DAYS, isFresh, timeSensitive, type Kind } from "./fresh.ts";
import { cosine, embedder, pack, unpack } from "./embed.ts";

export type Page = {
  id: string;
  url: string;
  title: string;
  kind: Kind;
  savedAt: number;
  expiresAt: number;
  pinned?: boolean;
  // Times a lookup was answered from it, and when last.
  uses: number;
  lastUsed?: number;
  // What read it: web_fetch, the research lab, `maxx lookup`.
  source: string;
  // Searches that led to it (they help find it again).
  queries: string[];
  text: string;
  chunks: string[];
  vecs?: string[];
  embedModel?: string;
};
export type PageInfo = Omit<Page, "text" | "chunks" | "vecs"> & { chars: number; passages: number; meaning: boolean; fresh: boolean };

export type Settings = { save: boolean; lessons: boolean; embed: string; recallFirst: boolean };
export const DEFAULT_SETTINGS: Settings = { save: true, lessons: true, embed: "auto", recallFirst: true };

export const libraryDir = () => join(maxxHome(), "library");
const pagesDir = () => join(libraryDir(), "pages");
const MAX_TEXT = 150_000;
const MAX_PAGES = 3000;
const MAX_VEC_CHUNKS = 48;
const MIN_TEXT = 200;

export async function loadSettings(): Promise<Settings> {
  try {
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(await readFile(join(maxxHome(), "library.json"), "utf8")) as Partial<Settings>) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(s: Partial<Settings>): Promise<Settings> {
  const next = { ...(await loadSettings()), ...s };
  await mkdir(maxxHome(), { recursive: true });
  await writeFile(join(maxxHome(), "library.json"), JSON.stringify(next, null, 2));
  return next;
}

// Same page, same entry: no #fragment, no tracking parameters, no trailing slash.
export function normalUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    for (const k of [...u.searchParams.keys()]) if (/^(utm_|fbclid|gclid|ref$|ref_src|mc_)/i.test(k)) u.searchParams.delete(k);
    u.hostname = u.hostname.toLowerCase();
    let s = u.toString();
    if (s.endsWith("/") && u.pathname !== "/") s = s.slice(0, -1);
    return s;
  } catch {
    return url.trim();
  }
}
export const pageId = (url: string) => createHash("sha1").update(normalUrl(url)).digest("hex").slice(0, 16);

// Never kept: this PC's own servers (the app being built), home networks, and sign-in pages.
export function keepable(url: string): boolean {
  try {
    const u = new URL(url);
    const h = u.hostname.toLowerCase();
    if (!/^https?:$/.test(u.protocol)) return false;
    if (h === "localhost" || h.endsWith(".local") || h.endsWith(".localhost") || h === "0.0.0.0" || h === "[::1]") return false;
    if (/^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h)) return false;
    if (/\/(login|signin|sign-in|auth|oauth|account|checkout|cart)(\/|$)/i.test(u.pathname)) return false;
    if (u.username || u.password || /[?&](token|key|sig|signature|access_token)=/i.test(u.search)) return false;
    return true;
  } catch {
    return false;
  }
}

// ---- the pages, in memory, reloaded when another Maxx window adds one ----
let cache: Map<string, Page> | null = null;
let cacheStamp = "";
let index: { bm: Bm25; refs: { page: string; i: number }[] } | null = null;

async function stamp(): Promise<string> {
  try {
    const s = await stat(pagesDir());
    return `${libraryDir()}|${s.mtimeMs}`;
  } catch {
    return `${libraryDir()}|none`;
  }
}

async function pages(): Promise<Map<string, Page>> {
  const now = await stamp();
  if (cache && now === cacheStamp) return cache;
  const m = new Map<string, Page>();
  const names = await readdir(pagesDir()).catch(() => [] as string[]);
  await Promise.all(
    names.filter((n) => n.endsWith(".json")).map(async (n) => {
      try {
        const p = JSON.parse(await readFile(join(pagesDir(), n), "utf8")) as Page;
        if (p?.id && p.url) m.set(p.id, p);
      } catch {}
    }),
  );
  cache = m;
  cacheStamp = now;
  index = null;
  return m;
}

async function write(p: Page) {
  await mkdir(pagesDir(), { recursive: true });
  const file = join(pagesDir(), `${p.id}.json`);
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmp, JSON.stringify(p));
  await rename(tmp, file);
  (await pages()).set(p.id, p);
  cacheStamp = await stamp();
  index = null;
}

async function bm25(): Promise<NonNullable<typeof index>> {
  const all = await pages();
  if (index) return index;
  const refs: { page: string; i: number }[] = [];
  const docs: { id: string; text: string; boost: string }[] = [];
  for (const p of all.values()) {
    p.chunks.forEach((c, i) => {
      refs.push({ page: p.id, i });
      docs.push({ id: String(refs.length - 1), text: c, boost: `${p.title} ${p.queries.join(" ")}` });
    });
  }
  index = { bm: new Bm25(docs), refs };
  return index;
}

export function info(p: Page, now = Date.now()): PageInfo {
  const { text, chunks, vecs, ...rest } = p;
  return { ...rest, chars: text.length, passages: chunks.length, meaning: !!vecs?.length, fresh: isFresh(p, "", now) };
}

export async function getPage(url: string): Promise<Page | undefined> {
  return (await pages()).get(pageId(url));
}

export async function pageById(id: string): Promise<Page | undefined> {
  return (await pages()).get(id);
}

export async function listPages(): Promise<PageInfo[]> {
  const now = Date.now();
  return [...(await pages()).values()].map((p) => info(p, now)).sort((a, b) => b.savedAt - a.savedAt);
}

// Keep a page Maxx just read. Returns null when it isn't worth keeping.
export async function savePage(o: { url: string; title: string; text: string; source: string; query?: string; now?: number }): Promise<Page | null> {
  if (!keepable(o.url)) return null;
  const text = o.text.trim().slice(0, MAX_TEXT);
  if (text.length < MIN_TEXT) return null;
  const s = await loadSettings();
  if (!s.save) return null;
  const now = o.now ?? Date.now();
  const id = pageId(o.url);
  const old = (await pages()).get(id);
  const kind = classify(o.url, o.title, text);
  const queries = [...new Set([...(old?.queries ?? []), ...(o.query ? [o.query] : []), ...(await searchesFor(o.url))])].slice(-8);
  const same = old && old.text === text;
  const p: Page = {
    id,
    url: normalUrl(o.url),
    title: o.title.trim().slice(0, 200) || new URL(o.url).hostname,
    kind,
    savedAt: now,
    expiresAt: expiresAt(kind, now),
    pinned: old?.pinned,
    uses: old?.uses ?? 0,
    lastUsed: old?.lastUsed,
    source: o.source,
    queries,
    text,
    chunks: same ? old!.chunks : chunk(text),
    vecs: same ? old!.vecs : undefined,
    embedModel: same ? old!.embedModel : undefined,
  };
  await write(p);
  void embedPage(p.id).catch(() => {});
  void tidy(now).catch(() => {});
  return p;
}

// Meaning vectors for a page's passages, in the background, when a model for that is loaded.
export async function embedPage(id: string): Promise<boolean> {
  const { e } = await embedder();
  const p = (await pages()).get(id);
  if (!e || !p || (p.vecs?.length && p.embedModel === e.model)) return false;
  const todo = p.chunks.slice(0, MAX_VEC_CHUNKS);
  const vecs: string[] = [];
  for (let i = 0; i < todo.length; i += 16) vecs.push(...(await e.embed(todo.slice(i, i + 16).map((c) => `search_document: ${c}`))).map(pack));
  const now = (await pages()).get(id);
  if (!now || now.savedAt !== p.savedAt) return false;
  await write({ ...now, vecs, embedModel: e.model });
  return true;
}

export async function deletePage(id: string): Promise<boolean> {
  const all = await pages();
  if (!all.has(id)) return false;
  await rm(join(pagesDir(), `${id}.json`), { force: true });
  all.delete(id);
  cacheStamp = await stamp();
  index = null;
  return true;
}

export async function pinPage(id: string, on: boolean): Promise<boolean> {
  const p = (await pages()).get(id);
  if (!p) return false;
  await write({ ...p, pinned: on || undefined });
  return true;
}

export async function forgetAll(): Promise<number> {
  const n = (await pages()).size;
  await rm(pagesDir(), { recursive: true, force: true });
  await rm(join(libraryDir(), "searches.json"), { force: true });
  cache = null;
  index = null;
  return n;
}

// Long-stale pages go (three times past their fresh date), and the oldest
// unused ones once there are too many. Pinned pages always stay.
export async function tidy(now = Date.now()): Promise<number> {
  const all = [...(await pages()).values()];
  const drop = all.filter((p) => !p.pinned && now > p.savedAt + FRESH_DAYS[p.kind] * 86_400_000 * 3);
  const left = all.filter((p) => !drop.includes(p));
  if (left.length > MAX_PAGES) drop.push(...left.filter((p) => !p.pinned).sort((a, b) => (a.lastUsed ?? a.savedAt) - (b.lastUsed ?? b.savedAt)).slice(0, left.length - MAX_PAGES));
  for (const p of drop) await deletePage(p.id);
  return drop.length;
}

export type Recalled = { page: Page; passage: string; score: number; cover: number; fresh: boolean; meaning?: number };

// The passages that best answer `query`, best first, one or two a page.
// `strong`: the best one covers the question well enough to skip the web.
export async function recall(query: string, o: { k?: number; now?: number } = {}): Promise<{ hits: Recalled[]; strong: boolean }> {
  const k = o.k ?? 4;
  const now = o.now ?? Date.now();
  const all = await pages();
  if (!all.size) return { hits: [], strong: false };
  const { bm, refs } = await bm25();
  const lex = bm.search(query, 40);
  const top = lex[0]?.score || 1;
  const scored = new Map<string, { score: number; cover: number; meaning?: number }>();
  for (const r of lex) scored.set(r.id, { score: (r.score / top) * 0.65 + r.cover * 0.35, cover: r.cover });
  // Meaning search, when the pages have vectors from the model that is loaded now.
  const { e } = await embedder().catch(() => ({ e: null }));
  if (e && [...all.values()].some((p) => p.vecs?.length && p.embedModel === e.model)) {
    try {
      const [qv] = await e.embed([`search_query: ${query}`], AbortSignal.timeout(10_000));
      const near: { id: string; cos: number }[] = [];
      refs.forEach((r, i) => {
        const p = all.get(r.page)!;
        const v = p.embedModel === e.model ? p.vecs?.[r.i] : undefined;
        if (v) near.push({ id: String(i), cos: cosine(qv!, unpack(v)) });
      });
      near.sort((a, b) => b.cos - a.cos);
      for (const n of near.slice(0, 40)) {
        const s = scored.get(n.id);
        const m = Math.max(0, n.cos);
        if (s) scored.set(n.id, { ...s, score: s.score * 0.6 + m * 0.4, meaning: n.cos });
        else if (n.cos > 0.55) scored.set(n.id, { score: m * 0.4, cover: 0, meaning: n.cos });
      }
    } catch {}
  }
  const ranked = [...scored.entries()].sort((a, b) => b[1].score - a[1].score);
  const perPage = new Map<string, number>();
  const hits: Recalled[] = [];
  for (const [id, s] of ranked) {
    const ref = refs[Number(id)]!;
    const n = perPage.get(ref.page) ?? 0;
    if (n >= 2) continue;
    perPage.set(ref.page, n + 1);
    const page = all.get(ref.page)!;
    hits.push({ page, passage: page.chunks[ref.i]!, score: s.score, cover: s.cover, fresh: isFresh(page, query, now), meaning: s.meaning });
    if (hits.length >= k) break;
  }
  const q = new Set(tokens(query)).size;
  const best = hits[0];
  const strong = !!best && best.fresh && (best.cover >= 0.8 || (best.cover >= 0.6 && (best.meaning ?? 0) >= 0.78)) && (q >= 2 || best.cover === 1) && !(timeSensitive(query) && !best.page.pinned && now - best.page.savedAt > 43_200_000);
  return { hits, strong };
}

export async function markUsed(ids: string[], now = Date.now()) {
  for (const id of new Set(ids)) {
    const p = (await pages()).get(id);
    if (p) await write({ ...p, uses: p.uses + 1, lastUsed: now });
  }
}

// ---- the search cache: the same question within a day costs no search ----
type Cached = { at: number; engine: string; hits: { title: string; url: string; snippet: string }[] };
const searchesFile = () => join(libraryDir(), "searches.json");
const qkey = (q: string) => tokens(q).sort().join(" ");

async function searches(): Promise<Record<string, Cached>> {
  try {
    return JSON.parse(await readFile(searchesFile(), "utf8")) as Record<string, Cached>;
  } catch {
    return {};
  }
}

export async function cachedSearch(query: string, now = Date.now()): Promise<Cached | null> {
  const c = (await searches())[qkey(query)];
  if (!c) return null;
  const ttl = timeSensitive(query) ? 3 * 3_600_000 : 3 * 86_400_000;
  return now - c.at < ttl ? c : null;
}

export async function cacheSearch(query: string, r: { engine: string; hits: Cached["hits"] }, now = Date.now()) {
  if (!r.hits.length || !(await loadSettings()).save) return;
  const all = await searches();
  all[qkey(query)] = { at: now, engine: r.engine, hits: r.hits };
  const keys = Object.keys(all).sort((a, b) => all[b]!.at - all[a]!.at);
  for (const k of keys.slice(500)) delete all[k];
  await mkdir(libraryDir(), { recursive: true });
  await writeFile(searchesFile(), JSON.stringify(all));
}

// The searches whose results listed this URL: a page fetched from a search is about that search.
async function searchesFor(url: string): Promise<string[]> {
  const u = normalUrl(url);
  const out: string[] = [];
  for (const [k, c] of Object.entries(await searches())) if (c.hits.some((h) => normalUrl(h.url) === u)) out.push(k);
  return out.slice(-4);
}

// ---- what the library saved: time and trips to the web ----
export type Stats = { searches: number; searchMs: number; fetches: number; fetchMs: number; servedSearches: number; servedFetches: number; cachedSearches: number; offline: number };
const ZERO: Stats = { searches: 0, searchMs: 0, fetches: 0, fetchMs: 0, servedSearches: 0, servedFetches: 0, cachedSearches: 0, offline: 0 };
const statsFile = () => join(libraryDir(), "stats.json");

export async function loadStats(): Promise<Stats> {
  try {
    return { ...ZERO, ...(JSON.parse(await readFile(statsFile(), "utf8")) as Partial<Stats>) };
  } catch {
    return { ...ZERO };
  }
}

export async function bump(what: Partial<Stats>) {
  const s = await loadStats();
  for (const [k, v] of Object.entries(what)) (s as any)[k] += v;
  await mkdir(libraryDir(), { recursive: true });
  await writeFile(statsFile(), JSON.stringify(s));
}

// Time saved, from how long this PC's own searches and page reads take (a guess until there are a few).
export function saved(s: Stats): { ms: number; avgSearch: number; avgFetch: number } {
  const avgSearch = s.searches >= 3 ? s.searchMs / s.searches : 8000;
  const avgFetch = s.fetches >= 3 ? s.fetchMs / s.fetches : 4000;
  // A skipped search usually skips the page read that would follow it too.
  return { ms: (s.servedSearches + s.cachedSearches * 0.5) * avgSearch + (s.servedSearches + s.servedFetches) * avgFetch, avgSearch, avgFetch };
}
