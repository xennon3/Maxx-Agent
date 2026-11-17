// How long a saved page stays trustworthy, by what kind of page it is. Docs
// and how-tos change slowly, so they stay fresh for months; prices and news
// go stale in days. A stale page is not thrown away: Maxx goes online again,
// and keeps the old copy for when the network is off or the site is down.

export type Kind = "docs" | "qa" | "reference" | "release" | "article" | "news" | "price";

const DAY = 86_400_000;
export const FRESH_DAYS: Record<Kind, number> = { docs: 120, reference: 90, qa: 60, article: 30, release: 7, news: 3, price: 1 };
export const KIND_ICON: Record<Kind, string> = { docs: "📘", qa: "💬", reference: "📖", release: "🏷", article: "📄", news: "📰", price: "💲" };
export const KIND_SAY: Record<Kind, string> = { docs: "docs", qa: "Q&A", reference: "reference", release: "releases", article: "article", news: "news", price: "prices" };

const NEWS_HOSTS = /(^|\.)(reuters|apnews|bbc|cnn|nytimes|theguardian|washingtonpost|bloomberg|cnbc|theverge|techcrunch|engadget|arstechnica|wired|zdnet|9to5(mac|google)|macrumors|tomshardware|pcgamer|ign|polygon|gamespot|kotaku|news\.ycombinator|phoronix|neowin|windowscentral|xda-developers|axios|forbes|businessinsider|nbcnews|abcnews|foxnews|aljazeera|npr)\./i;
const SHOP_HOSTS = /(^|\.)(amazon|ebay|walmart|bestbuy|newegg|aliexpress|alibaba|etsy|target|costco|bhphotovideo|microcenter|pcpartpicker|camelcamelcamel|google\.[a-z.]+\/shopping|steampowered|store\.)/i;
const QA_HOSTS = /(^|\.)(stackoverflow|stackexchange|superuser|serverfault|askubuntu|reddit|quora|discourse|forum|forums|community)\./i;
const DOC_HOSTS = /(^|\.)(docs|developer|developers|learn|devdocs|readthedocs|api|reference|wiki\.archlinux|man7)\./i;
const DOC_SITES = /(developer\.mozilla\.org|learn\.microsoft\.com|docs\.python\.org|kotlinlang\.org|developer\.android\.com|threejs\.org\/docs|nodejs\.org\/(api|docs)|bun\.(sh|com)\/docs|typescriptlang\.org\/docs|react\.dev\/(reference|learn)|vuejs\.org\/guide|go\.dev\/doc|doc\.rust-lang\.org|docs\.rs|gradle\.org|blender\.org\/manual|docs\.blender\.org|godotengine\.org|unity\.com|w3schools\.com|cppreference\.com|php\.net\/manual|postgresql\.org\/docs|sqlite\.org)/i;

function parse(url: string): { host: string; path: string } {
  try {
    const u = new URL(url);
    return { host: u.hostname.replace(/^www\./, "").toLowerCase(), path: u.pathname.toLowerCase() };
  } catch {
    return { host: "", path: "" };
  }
}

export function classify(url: string, title = "", text = ""): Kind {
  const { host, path } = parse(url);
  const where = host + path;
  const head = `${title} ${text.slice(0, 1500)}`.toLowerCase();
  if (SHOP_HOSTS.test(where) || /\/(pricing|prices?|deals?|buy|shop|product|dp)\b/.test(path) || /\b(add to cart|in stock|out of stock|buy now)\b/.test(head)) return "price";
  if (NEWS_HOSTS.test(host) || /\/news\//.test(path) || /\/20\d\d\/\d{1,2}\/\d{1,2}\//.test(path)) return "news";
  if (/\/(releases?|changelog|release-notes|whats-?new|tags)\b/.test(path) || /(^|\.)(npmjs\.com|pypi\.org|crates\.io|nuget\.org|pkg\.go\.dev|rubygems\.org|packagist\.org|mvnrepository\.com|plugins\.gradle\.org)$/.test(host)) return "release";
  if (QA_HOSTS.test(host) || /github\.com\/[^/]+\/[^/]+\/(issues|discussions|pull)\//.test(where)) return "qa";
  if (/(^|\.)wikipedia\.org$|(^|\.)wiktionary\.org$|(^|\.)britannica\.com$/.test(host)) return "reference";
  if (DOC_HOSTS.test(host) || DOC_SITES.test(where) || /\/(docs?|documentation|manual|guide|guides|reference|api|tutorial|handbook|learn)(\/|$)/.test(path) || /^github\.com\/[^/]+\/[^/]+\/?$/.test(where) || /readme/i.test(path)) return "docs";
  return "article";
}

// Questions whose answer moves fast: a saved page only answers them when it is very new.
const TIME_WORDS = /\b(latest|newest|current(ly)?|today|tonight|yesterday|this (week|month|year)|right now|recent(ly)?|price|prices|cost|costs|cheapest|deal|deals|news|release date|released|in stock|stock price|score|weather|exchange rate|who (is|won)|upcoming|20\d\d)\b/i;
export const timeSensitive = (q: string) => TIME_WORDS.test(q);

// Until when the page counts as fresh. Pinned pages never go stale.
export function expiresAt(kind: Kind, savedAt: number): number {
  return savedAt + FRESH_DAYS[kind] * DAY;
}

export function isFresh(p: { expiresAt: number; pinned?: boolean; savedAt: number }, query = "", now = Date.now()): boolean {
  if (p.pinned) return true;
  if (query && timeSensitive(query) && now - p.savedAt > DAY / 2) return false;
  return now < p.expiresAt;
}

export function ago(at: number, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - at) / 1000));
  if (s < 90) return "just now";
  const m = Math.round(s / 60);
  if (m < 90) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 36) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.round(h / 24);
  if (d < 60) return `${d} day${d === 1 ? "" : "s"} ago`;
  const mo = Math.round(d / 30);
  return `${mo} month${mo === 1 ? "" : "s"} ago`;
}
