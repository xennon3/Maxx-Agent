// Looking things up: a web search and a page reader that need no API key, so a
// small local model can check what its training data got wrong or never knew
// (new versions, changed APIs, news). Only offered while network access is on.
//
// Search tries a SearXNG server if you run one ($MAXX_SEARXNG or "searxng" in
// ~/.maxx/web.json), then DuckDuckGo's HTML pages, then Wikipedia. Pages come
// back as plain text, and `find` returns only the passages that mention what
// the model is after: a 4B model at 16K context can't read a whole page.

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import { maxxHome } from "./sessions.ts";
import { defineTool } from "./tools/types.ts";

export type Hit = { title: string; url: string; snippet: string };

// Overridable, so tests can point them at a local server.
export const ENDPOINTS = {
  ddgHtml: "https://html.duckduckgo.com/html/",
  ddgLite: "https://lite.duckduckgo.com/lite/",
  wikipedia: "https://en.wikipedia.org",
};

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 Maxx";
const TIMEOUT = 15_000;
const MAX_RESULTS = 5;
// About 800 tokens: enough to answer from, small enough to leave room for the answer.
export const PAGE_CHARS = 3200;

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "–", mdash: "—", hellip: "…", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", copy: "©", reg: "®", trade: "™", middot: "·", bull: "•" };
export function decode(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const n = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}
const strip = (html: string) => decode(html.replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim();

// DuckDuckGo wraps result links in a redirect: //duckduckgo.com/l/?uddg=<the real URL>.
function unwrap(href: string): string {
  const h = decode(href);
  const m = h.match(/[?&]uddg=([^&]+)/);
  if (m) return decodeURIComponent(m[1]!);
  return h.startsWith("//") ? "https:" + h : h;
}
const isAd = (url: string) => /duckduckgo\.com\/y\.js|[?&]ad_(?:domain|provider)=/.test(url);
const attr = (tag: string, name: string) => tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i"))?.slice(1).find((v) => v !== undefined);

export function parseDuckHtml(html: string): Hit[] {
  const hits: Hit[] = [];
  // Each result is a block with a result__a link and, usually, a result__snippet.
  for (const block of html.split(/<div[^>]+class="[^"]*\bresult\b(?!__)[^"]*"/i).slice(1)) {
    const a = block.match(/<a([^>]*class\s*=\s*["'][^"']*result__a[^"']*["'][^>]*)>([\s\S]*?)<\/a>/i);
    if (!a) continue;
    const url = unwrap(attr(a[1]!, "href") ?? "");
    if (!/^https?:/.test(url) || isAd(url)) continue;
    const sn = block.match(/class\s*=\s*["'][^"']*result__snippet[^"']*["'][^>]*>([\s\S]*?)<\/(?:a|div|td)>/i);
    hits.push({ title: strip(a[2]!), url, snippet: sn ? strip(sn[1]!) : "" });
  }
  return hits;
}

export function parseDuckLite(html: string): Hit[] {
  const hits: Hit[] = [];
  const links = [...html.matchAll(/<a([^>]*class\s*=\s*["'][^"']*result-link[^"']*["'][^>]*)>([\s\S]*?)<\/a>/gi)];
  links.forEach((m, i) => {
    const url = unwrap(attr(m[1]!, "href") ?? "");
    if (!/^https?:/.test(url) || isAd(url)) return;
    const rest = html.slice(m.index! + m[0].length, links[i + 1]?.index ?? html.length);
    const sn = rest.match(/class\s*=\s*["'][^"']*result-snippet[^"']*["'][^>]*>([\s\S]*?)<\/td>/i);
    hits.push({ title: strip(m[2]!), url, snippet: sn ? strip(sn[1]!) : "" });
  });
  return hits;
}

async function get(url: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, { ...init, redirect: "follow", signal: AbortSignal.timeout(TIMEOUT), headers: { "User-Agent": UA, "Accept-Language": "en-US,en;q=0.8", ...(init.headers as Record<string, string>) } });
  if (!res.ok) throw new Error(`${new URL(url).host} answered ${res.status}`);
  return res;
}

async function searxngURL(): Promise<string | undefined> {
  if (process.env.MAXX_SEARXNG) return process.env.MAXX_SEARXNG;
  try {
    return (JSON.parse(await readFile(join(maxxHome(), "web.json"), "utf8")) as { searxng?: string }).searxng || undefined;
  } catch {
    return undefined;
  }
}

const ENGINES: { name: string; search: (q: string) => Promise<Hit[]> }[] = [
  {
    name: "SearXNG",
    async search(q) {
      const base = await searxngURL();
      if (!base) return [];
      const r = (await (await get(`${base.replace(/\/$/, "")}/search?format=json&q=${encodeURIComponent(q)}`)).json()) as { results?: { title?: string; url?: string; content?: string }[] };
      return (r.results ?? []).map((x) => ({ title: x.title ?? "", url: x.url ?? "", snippet: x.content ?? "" })).filter((x) => x.url);
    },
  },
  {
    name: "DuckDuckGo",
    search: async (q) => parseDuckHtml(await (await get(ENDPOINTS.ddgHtml, { method: "POST", body: new URLSearchParams({ q, kl: "us-en" }), headers: { "Content-Type": "application/x-www-form-urlencoded" } })).text()),
  },
  {
    name: "DuckDuckGo Lite",
    search: async (q) => parseDuckLite(await (await get(`${ENDPOINTS.ddgLite}?q=${encodeURIComponent(q)}&kl=us-en`)).text()),
  },
  {
    // Not the open web, but always up and never asks for a captcha.
    name: "Wikipedia",
    async search(q) {
      const r = (await (await get(`${ENDPOINTS.wikipedia}/w/api.php?action=query&list=search&format=json&srlimit=${MAX_RESULTS}&srsearch=${encodeURIComponent(q)}`)).json()) as { query?: { search?: { title: string; snippet: string }[] } };
      return (r.query?.search ?? []).map((x) => ({ title: x.title, url: `${ENDPOINTS.wikipedia}/wiki/${encodeURIComponent(x.title.replace(/ /g, "_"))}`, snippet: strip(x.snippet) }));
    },
  },
];

// The first engine that answers wins; the ones that failed are named so a
// "no results" is never a mystery.
export async function search(query: string): Promise<{ engine: string; hits: Hit[]; failed: string[] }> {
  const failed: string[] = [];
  for (const e of ENGINES) {
    try {
      const hits = (await e.search(query)).slice(0, MAX_RESULTS);
      if (hits.length) return { engine: e.name, hits, failed };
    } catch (err) {
      failed.push(`${e.name} (${(err as Error).message})`);
    }
  }
  return { engine: "", hits: [], failed };
}

export function formatHits(query: string, r: Awaited<ReturnType<typeof search>>): string {
  if (!r.hits.length) return `No results for "${query}"${r.failed.length ? `; failed: ${r.failed.join(", ")}` : ""}. Try fewer or different words.`;
  const list = r.hits.map((h, i) => `[${i + 1}] ${h.title.slice(0, 120)}\n${h.url}\n${h.snippet.slice(0, 240)}`).join("\n\n");
  return `${list}\n\n(${r.engine}. Snippets can be old or partial: call web_fetch on the best URL, with find set to what you need, before relying on a detail.)`;
}

// Readable text from a page: scripts, menus and footers out, headings and list
// items kept as Markdown-ish lines, and the <main> or <article> when there is one.
export function htmlToText(html: string): { title: string; text: string } {
  const title = strip(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
  let body = html.replace(/<!--[\s\S]*?-->/g, "").replace(/<(script|style|noscript|svg|template|iframe|head)\b[\s\S]*?<\/\1>/gi, "");
  const main = body.match(/<main\b[\s\S]*?<\/main>/i)?.[0] ?? body.match(/<article\b[\s\S]*?<\/article>/i)?.[0];
  if (main && strip(main).length > 200) body = main;
  else body = body.replace(/<(nav|header|footer|aside|form)\b[\s\S]*?<\/\1>/gi, "");
  const text = decode(
    body
      .replace(/<h([1-6])[^>]*>/gi, (_, n) => "\n\n" + "#".repeat(Number(n)) + " ")
      .replace(/<li[^>]*>/gi, "\n- ")
      .replace(/<(br|hr)[^>]*>/gi, "\n")
      .replace(/<\/(p|div|section|h[1-6]|ul|ol|table|tr|pre|blockquote|dl|dd|dt)>/gi, "\n")
      .replace(/<(td|th)[^>]*>/gi, " | ")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/[ \t ]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return { title, text };
}

// The lines that mention the most of the words asked for, each with the line
// before and after it for context, in page order.
export function passages(text: string, find: string, budget = PAGE_CHARS): string | null {
  const words = [...new Set(find.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}._+#-]*/gu) ?? [])].filter((w) => w.length > 1);
  if (!words.length) return null;
  // Long lines are cut into pieces so one giant block can't eat the budget.
  const lines = text.split("\n").flatMap((l) => (l.length <= 400 ? [l] : l.match(/[\s\S]{1,350}(?:\s|$)/g) ?? [l]));
  const hits = lines.map((l) => {
    const low = l.toLowerCase();
    return words.filter((w) => low.includes(w)).length;
  });
  const top = Math.max(...hits);
  if (!top) return null;
  // Lines with the most words first; a line with only one of several words is a weak match.
  const order = hits.map((h, i) => ({ h, i })).filter((x) => x.h > 0 && x.h >= Math.min(top, Math.max(1, top - 1))).sort((a, b) => b.h - a.h || a.i - b.i);
  const keep = new Set<number>();
  let used = 0;
  for (const { i } of order) {
    const add = [i - 1, i, i + 1].filter((j) => j >= 0 && j < lines.length && !keep.has(j) && lines[j]!.trim());
    const size = add.reduce((n, j) => n + lines[j]!.length + 1, 0);
    if (used + size > budget) continue;
    add.forEach((j) => keep.add(j));
    used += size;
  }
  if (!keep.size) return lines[order[0]!.i]!.slice(0, budget);
  const idx = [...keep].sort((a, b) => a - b);
  return idx.map((j, k) => (k && j !== idx[k - 1]! + 1 ? "…\n" : "") + lines[j]!.trim()).join("\n");
}

// Pages read this run, so a second look with a different `find` costs no download.
const pages = new Map<string, { title: string; text: string; at: number }>();
const PAGE_TTL = 10 * 60_000;

export async function readPage(url: string): Promise<{ title: string; text: string }> {
  const hit = pages.get(url);
  if (hit && Date.now() - hit.at < PAGE_TTL) return hit;
  const res = await get(url, { headers: { Accept: "text/html,application/xhtml+xml,text/plain,application/json;q=0.9,*/*;q=0.5" } });
  const type = res.headers.get("content-type") ?? "";
  if (/pdf|image\/|audio\/|video\/|zip|octet-stream/.test(type)) throw new Error(`that is a ${type.split(";")[0]} file, not a page Maxx can read`);
  const raw = await res.text();
  const page = /html|xml/.test(type) || /^\s*<(!doctype|html)/i.test(raw) ? htmlToText(raw) : { title: "", text: raw.trim() };
  if (pages.size > 30) pages.delete(pages.keys().next().value!);
  pages.set(url, { ...page, at: Date.now() });
  return page;
}

export function formatPage(url: string, page: { title: string; text: string }, find?: string, start = 0): string {
  const head = `${page.title ? page.title + "\n" : ""}${url}\n\n`;
  if (!page.text) return `${head}(the page has no readable text; it may need JavaScript. Try another result.)`;
  if (find) {
    const found = passages(page.text, find);
    if (found) return `${head}Passages about "${find}":\n${found}`;
    return `${head}(nothing on this page mentions "${find}"; here is the start)\n${page.text.slice(0, PAGE_CHARS)}`;
  }
  const end = Math.min(page.text.length, start + PAGE_CHARS);
  const more = end < page.text.length ? `\n\n(showing ${start}-${end} of ${page.text.length} characters; call again with start=${end} for more, or use find)` : "";
  return head + page.text.slice(start, end) + more;
}

export const webSearch = defineTool({
  name: "web_search",
  description: "Search the web. Use it when you are unsure, or the answer depends on versions, releases, prices, news, dates or anything that may have changed since you were trained. Returns titles, URLs and snippets.",
  schema: z.object({ query: z.string().min(1).describe("a few keywords, e.g. 'bun latest version' or 'react 19 useActionState'") }),
  risk: "read",
  checkpoint: false,
  run: async ({ query }) => formatHits(query, await search(query)),
});

export const webFetch = defineTool({
  name: "web_fetch",
  description: "Read a web page as text. Set find to the words you need (e.g. 'install command' or 'release date') to get only the passages that mention them.",
  schema: z.object({
    url: z.string().describe("the full http(s) URL, usually from web_search"),
    find: z.string().optional().describe("words to look for; returns only the matching passages"),
    start: z.number().int().min(0).optional().describe("character offset to continue reading from"),
  }),
  risk: "read",
  checkpoint: false,
  refuse: ({ url }) => (/^https?:\/\//i.test(url) ? undefined : `error: web_fetch needs a full http(s) URL, not "${url.slice(0, 80)}"`),
  run: async ({ url, find, start }) => formatPage(url, await readPage(url), find, start),
});

export const WEB_TOOLS = [webSearch, webFetch];

// Kept short for small models; the date is what makes "is this outdated?" answerable.
export function lookupPrompt(now = new Date(), extra: string[] = []): string {
  return [
    `Today is ${now.toDateString()}. Your training data is older than that, so facts that change (latest versions, APIs, prices, news, who holds a job, release dates) may be out of date.`,
    `When you are not sure, or the question depends on something recent, look it up first with web_search${extra.length ? `, ${extra.join(", ")}` : ""} and web_fetch (set find to what you need). Don't search for things that never change (math, basic syntax, definitions).`,
    "When you used the web, say so and end your answer with a Sources: line listing the URLs you used. If sources disagree with what you remember, trust the newer source.",
  ].join(" ");
}
