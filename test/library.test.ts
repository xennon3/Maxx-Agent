import { afterAll, beforeEach, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

process.env.MAXX_HOME = await mkdtemp(join(tmpdir(), "maxx-home-library-"));

const L = await import("../src/library/index.ts");
const { chunk, tokens, Bm25 } = await import("../src/library/rank.ts");
const { pack, unpack, cosine, normalize } = await import("../src/library/embed.ts");
const web = await import("../src/web.ts");
const { Agent } = await import("../src/loop.ts");
const { Permissions } = await import("../src/permissions.ts");
const { typedText } = await import("../src/context.ts");

const DAY = 86_400_000;
const GRADLE = `# Gradle 9.1 release notes

## Compatibility

Gradle 9.1 requires the Android Gradle Plugin (AGP) 8.13 or newer. Older AGP versions fail with "Unsupported class file major version".

Kotlin 2.2 is the embedded Kotlin version. Java 17 or newer is needed to run Gradle.

## Configuration cache

The configuration cache is now on by default for new builds. ${"Filler text about caches and builds. ".repeat(30)}

## Other changes

${"More words about unrelated improvements to the daemon and toolchains. ".repeat(40)}`;

// Pages from the "internet" in these tests: a fake fetch for every host that isn't this machine.
const realFetch = globalThis.fetch;
const web404 = new Set<string>();
let downloads: string[] = [];
const SITE: Record<string, string> = {
  "https://docs.gradle.org/9.1/release-notes.html": `<html><head><title>Gradle 9.1 Release Notes</title></head><body><main>${GRADLE.split("\n\n").map((p) => (p.startsWith("#") ? `<h${p.match(/^#+/)![0].length}>${p.replace(/^#+ /, "")}</h${p.match(/^#+/)![0].length}>` : `<p>${p}</p>`)).join("")}</main></body></html>`,
};
globalThis.fetch = (async (input: any, init?: any) => {
  const url = typeof input === "string" ? input : input.url;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)/.test(url)) return realFetch(input, init);
  if (/context7/.test(url)) return new Response("no", { status: 503 });
  downloads.push(url);
  if (web404.has(url) || !SITE[url]) return new Response("nope", { status: 503 });
  return new Response(SITE[url], { headers: { "content-type": "text/html" } });
}) as typeof fetch;
afterAll(() => {
  globalThis.fetch = realFetch;
});

beforeEach(async () => {
  await L.forgetAll();
  await rm(join(L.libraryDir(), "lessons.json"), { force: true });
  await rm(join(L.libraryDir(), "stats.json"), { force: true });
  downloads = [];
  web404.clear();
  web.forgetRecentPages();
  // Other test files point these at their own local servers; here the "internet" is the fake fetch.
  Object.assign(web.ENDPOINTS, { ddgHtml: "https://html.duckduckgo.com/html/", ddgLite: "https://lite.duckduckgo.com/lite/", wikipedia: "https://en.wikipedia.org" });
});

// ---- kinds and freshness ----

test("pages are sorted by kind, and each kind stays fresh for its own time", () => {
  expect(L.classify("https://docs.gradle.org/9.1/release-notes.html")).toBe("release");
  expect(L.classify("https://developer.android.com/build/releases/gradle-plugin")).toBe("release");
  expect(L.classify("https://developer.mozilla.org/en-US/docs/Web/API/fetch")).toBe("docs");
  expect(L.classify("https://threejs.org/docs/#api/en/core/Object3D")).toBe("docs");
  expect(L.classify("https://stackoverflow.com/questions/123/gradle-fails")).toBe("qa");
  expect(L.classify("https://github.com/oven-sh/bun/issues/42")).toBe("qa");
  expect(L.classify("https://en.wikipedia.org/wiki/Gradle")).toBe("reference");
  expect(L.classify("https://www.theverge.com/2026/11/2/some-story")).toBe("news");
  expect(L.classify("https://www.amazon.com/dp/B0ABC")).toBe("price");
  expect(L.classify("https://example.com/blog/my-thoughts")).toBe("article");
  expect(L.classify("https://www.npmjs.com/package/three")).toBe("release");
  const saved = Date.now() - 10 * DAY;
  expect(L.isFresh({ savedAt: saved, expiresAt: saved + L.FRESH_DAYS.docs * DAY })).toBe(true);
  expect(L.isFresh({ savedAt: saved, expiresAt: saved + L.FRESH_DAYS.news * DAY })).toBe(false);
  expect(L.isFresh({ savedAt: saved, expiresAt: saved + L.FRESH_DAYS.news * DAY, pinned: true })).toBe(true);
  // "latest" questions want a very new copy, whatever the page.
  expect(L.isFresh({ savedAt: saved, expiresAt: saved + L.FRESH_DAYS.docs * DAY }, "latest three.js version")).toBe(false);
});

test("passages keep their heading, and version numbers stay whole in search", () => {
  expect(tokens("Gradle 9.1 needs AGP 8.13; three.js errors")).toEqual(["gradle", "9.1", "need", "agp", "8.13", "three.js", "three", "js", "error"]);
  const parts = chunk(GRADLE);
  expect(parts.length).toBeGreaterThan(2);
  expect(parts.find((p) => p.includes("AGP"))!).toStartWith("## Compatibility");
  for (const p of parts) expect(p.length).toBeLessThan(1500);
  const bm = new Bm25(parts.map((text, i) => ({ id: String(i), text })));
  const [best] = bm.search("which agp version for gradle 9.1");
  expect(parts[Number(best!.id)]).toContain("AGP) 8.13");
  expect(best!.cover).toBe(1);
});

test("meaning vectors survive being stored as 8-bit numbers", () => {
  const a = normalize(Float32Array.from({ length: 64 }, (_, i) => Math.sin(i)));
  const b = normalize(Float32Array.from({ length: 64 }, (_, i) => Math.sin(i) + 0.05 * Math.cos(i * 3)));
  const c = normalize(Float32Array.from({ length: 64 }, (_, i) => Math.cos(i * 7)));
  expect(cosine(a, unpack(pack(b)))).toBeGreaterThan(0.95);
  expect(Math.abs(cosine(a, unpack(pack(c))))).toBeLessThan(0.4);
});

// ---- the library ----

test("a page read is kept, found again by its words, and never this PC's own servers", async () => {
  const p = await L.savePage({ url: "https://docs.gradle.org/9.1/release-notes.html#compat", title: "Gradle 9.1 Release Notes", text: GRADLE, source: "web_fetch" });
  expect(p!.url).toBe("https://docs.gradle.org/9.1/release-notes.html");
  expect(p!.kind).toBe("release");
  expect(await L.savePage({ url: "http://localhost:5173/", title: "My app", text: GRADLE, source: "web_fetch" })).toBeNull();
  expect(await L.savePage({ url: "http://192.168.1.20/admin", title: "Router", text: GRADLE, source: "web_fetch" })).toBeNull();
  expect(await L.savePage({ url: "https://example.com/login", title: "Sign in", text: GRADLE, source: "web_fetch" })).toBeNull();
  expect(await L.savePage({ url: "https://example.com/tiny", title: "Tiny", text: "too short", source: "web_fetch" })).toBeNull();
  const r = await L.recall("gradle 9.1 agp version");
  expect(r.strong).toBe(true);
  expect(r.hits[0]!.passage).toContain("AGP) 8.13");
  // Off-topic: found nothing worth skipping the web for.
  const off = await L.recall("blender cycles denoise settings");
  expect(off.strong).toBe(false);
  expect((await L.listPages()).length).toBe(1);
});

test("web_search answers from the library when it can, and goes online when it can't", async () => {
  await L.savePage({ url: "https://docs.gradle.org/9.1/release-notes.html", title: "Gradle 9.1 Release Notes", text: GRADLE, source: "web_fetch" });
  const out = await web.searchFirstInLibrary("gradle 9.1 agp version");
  expect(out).toStartWith("📚 From your library");
  expect(out).toContain("AGP) 8.13");
  expect(out).toContain("https://docs.gradle.org/9.1/release-notes.html");
  expect(downloads).toEqual([]);
  expect((await L.loadStats()).servedSearches).toBe(1);
  expect((await L.listPages())[0]!.uses).toBe(1);
  // fresh: true goes online (here the "internet" is down, so it falls back to the saved copy).
  const online = await web.searchFirstInLibrary("gradle 9.1 agp version", true);
  expect(downloads.length).toBeGreaterThan(0);
  expect(online).toStartWith("📚 The web search found nothing");
  expect(online).toContain("may be out of date");
  // A question the library can't answer goes to the web.
  downloads = [];
  await web.searchFirstInLibrary("rust borrow checker lifetimes");
  expect(downloads.length).toBeGreaterThan(0);
});

test("web_fetch reads a saved page from disk, and a stale one again from the web", async () => {
  const url = "https://docs.gradle.org/9.1/release-notes.html";
  await L.savePage({ url, title: "Gradle 9.1 Release Notes", text: GRADLE, source: "web_fetch" });
  const out = await web.fetchFirstFromLibrary(url, "agp");
  expect(out).toStartWith("📚 ");
  expect(out).toContain("8.13");
  expect(out).toContain("saved copy from your library");
  expect(downloads).toEqual([]);
  // A month later the release notes are stale: downloaded again (and saved again).
  await L.savePage({ url, title: "Gradle 9.1 Release Notes", text: GRADLE, source: "web_fetch", now: Date.now() - 30 * DAY });
  const again = await web.fetchFirstFromLibrary(url, "agp");
  expect(downloads).toEqual([url]);
  expect(again).not.toStartWith("📚");
  expect((await L.getPage(url))!.savedAt).toBeGreaterThan(Date.now() - 60_000);
  // Stale and the site is down: the old copy, said to be old.
  await L.savePage({ url, title: "Gradle 9.1 Release Notes", text: GRADLE, source: "web_fetch", now: Date.now() - 30 * DAY });
  web404.add(url);
  web.forgetRecentPages();
  const down = await web.fetchFirstFromLibrary(url, "agp");
  expect(down).toStartWith("📚 Couldn't download it");
  expect(down).toContain("8.13");
});

test("a page read with web_fetch lands in the library on its own, with the search that found it", async () => {
  await L.cacheSearch("gradle agp compatibility", { engine: "test", hits: [{ title: "Gradle 9.1", url: "https://docs.gradle.org/9.1/release-notes.html", snippet: "" }] });
  await web.fetchFirstFromLibrary("https://docs.gradle.org/9.1/release-notes.html", "agp");
  const [p] = await L.listPages();
  expect(p!.title).toBe("Gradle 9.1 Release Notes");
  expect(p!.queries).toContain(["agp", "compatibility", "gradle"].join(" "));
  // The same search again within a day costs no search.
  expect((await L.cachedSearch("gradle compatibility agp"))?.engine).toBe("test");
});

test("pins keep a page fresh and safe from tidying; deleting forgets it", async () => {
  const old = Date.now() - 400 * DAY;
  const a = await L.savePage({ url: "https://www.theverge.com/2025/1/1/story", title: "Old news", text: GRADLE, source: "web_fetch", now: old });
  const b = await L.savePage({ url: "https://www.theverge.com/2025/1/2/other", title: "Other old news", text: GRADLE, source: "web_fetch", now: old });
  await L.pinPage(a!.id, true);
  expect(await L.tidy()).toBe(1);
  expect((await L.listPages()).map((p) => p.id)).toEqual([a!.id]);
  expect((await L.listPages())[0]!.fresh).toBe(true);
  expect(await L.deletePage(a!.id)).toBe(true);
  expect(await L.pageById(b!.id)).toBeUndefined();
  expect(await L.listPages()).toEqual([]);
});

test("turning saving off keeps the library as it is", async () => {
  await L.saveSettings({ save: false });
  expect(await L.savePage({ url: "https://docs.gradle.org/x", title: "x", text: GRADLE, source: "web_fetch" })).toBeNull();
  await L.saveSettings({ save: true });
});

// ---- the notebook ----

test("lessons are read from the model's reply, with their source", () => {
  expect(L.parseLessons("<think>hmm</think>\nLESSON: Gradle 9.1 needs AGP 8.13 or newer. <https://docs.gradle.org/9.1/release-notes.html>\n- LESSON: **Use py, not python, on Windows.**\nnot a lesson\nLESSON: short")).toEqual([
    { text: "Gradle 9.1 needs AGP 8.13 or newer.", url: "https://docs.gradle.org/9.1/release-notes.html" },
    { text: "Use py, not python, on Windows.", url: undefined },
  ]);
  expect(L.parseLessons("NONE")).toEqual([]);
});

test("a lesson is checked against its page: numbers that aren't there make it unconfirmed", () => {
  expect(L.verifyLesson("Gradle 9.1 needs AGP 8.13 or newer.", GRADLE)).toBe("verified");
  expect(L.verifyLesson("Gradle 9.1 needs AGP 8.12 or newer.", GRADLE)).toBe("unverified");
  expect(L.verifyLesson("Gradle 9.1 requires Java 21 to run.", GRADLE)).toBe("unverified");
  expect(L.verifyLesson("Blender renders faster with OptiX denoising enabled.", GRADLE)).toBe("unverified");
  expect(L.verifyLesson("Gradle 9.1 needs AGP 8.13.", undefined)).toBe("unverified");
});

test("the notebook merges repeats and finds the lessons that fit a request", async () => {
  await L.addLesson({ text: "Gradle 9.1 needs AGP 8.13 or newer.", url: "https://docs.gradle.org/9.1/release-notes.html", status: "verified" });
  expect((await L.addLesson({ text: "gradle 9.1 needs AGP 8.13 or newer", status: "unverified" }))!.isNew).toBe(false);
  await L.addLesson({ text: "Three.js r180 removed the Geometry class; use BufferGeometry.", status: "verified" });
  await L.addLesson({ text: "Blender 4.2 renamed Eevee to Eevee Next.", status: "unverified" });
  expect((await L.loadLessons()).length).toBe(3);
  expect((await L.relevantLessons("set up an android app with gradle 9.1")).map((l) => l.text)).toEqual(["Gradle 9.1 needs AGP 8.13 or newer."]);
  expect(await L.relevantLessons("make a snake game in python")).toEqual([]);
  // Unconfirmed lessons stay out until approved.
  expect(await L.relevantLessons("blender eevee render")).toEqual([]);
  const b = (await L.loadLessons()).find((l) => l.text.startsWith("Blender"))!;
  await L.editLesson(b.id, { status: "yours" });
  expect((await L.relevantLessons("blender eevee render")).length).toBe(1);
  expect(await L.deleteLesson(b.id)).toBe(true);
});

// ---- in a real turn ----

let script: { text?: string; tool?: { name: string; args: unknown } }[] = [];
const requests: any[] = [];
const server = Bun.serve({
  port: 0,
  async fetch(req) {
    if (req.method === "GET") return Response.json({ data: [{ id: "fake" }] });
    requests.push(await req.json());
    const r = script.shift() ?? { text: "done" };
    const chunks: object[] = [];
    if (r.text) chunks.push({ choices: [{ delta: { content: r.text } }] });
    if (r.tool) chunks.push({ choices: [{ delta: { tool_calls: [{ index: 0, id: "call_1", function: { name: r.tool.name, arguments: JSON.stringify(r.tool.args) } }] } }] });
    return new Response(chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join("") + "data: [DONE]\n\n", { headers: { "content-type": "text/event-stream" } });
  },
});
afterAll(() => server.stop());

async function agent(network = true) {
  const dir = await mkdtemp(join(tmpdir(), "maxx-lib-"));
  Bun.spawnSync(["git", "init", "-q"], { cwd: dir });
  const notes: string[] = [];
  const io = { token: () => {}, toolStart: () => {}, toolEnd: () => {}, note: (n: string) => notes.push(n), ask: async () => "yes" as const };
  const a = await new Agent({ llm: { baseURL: `http://localhost:${server.port}/v1`, model: "fake" }, cwd: dir, permissions: await new Permissions(dir, "ask").load(), fixTries: 0, mapTokens: 0, network }, io as any).init();
  requests.length = 0;
  return { a, notes };
}

test("after research, Maxx writes a checked lesson; the next request on the topic gets it", async () => {
  const { a, notes } = await agent();
  const url = "https://docs.gradle.org/9.1/release-notes.html";
  script = [
    { tool: { name: "web_fetch", args: { url, find: "agp" } } },
    { text: "Gradle 9.1 needs AGP 8.13 or newer. Sources: " + url },
    { text: `LESSON: Gradle 9.1 needs AGP 8.13 or newer. <${url}>\nLESSON: Gradle 9.1 needs AGP 7.0 to build Android apps. <${url}>` },
  ];
  await a.send("which AGP works with gradle 9.1?");
  expect(downloads).toEqual([url]);
  const lessons = await L.loadLessons();
  expect(lessons.map((l) => [l.text, l.status])).toEqual([
    ["Gradle 9.1 needs AGP 8.13 or newer.", "verified"],
    ["Gradle 9.1 needs AGP 7.0 to build Android apps.", "unverified"],
  ]);
  expect(notes.some((n) => n.includes("📚 Wrote 2 lessons"))).toBe(true);
  // Next time: the checked lesson rides along, and the page comes from disk.
  downloads = [];
  requests.length = 0;
  script = [{ tool: { name: "web_fetch", args: { url, find: "kotlin" } } }, { text: "Kotlin 2.2." }];
  await a.send("start an android project with gradle 9.1");
  const sent = JSON.stringify(requests.at(-1).messages);
  expect(sent).toContain("From Maxx's notebook");
  expect(sent).toContain("Gradle 9.1 needs AGP 8.13 or newer.");
  expect(sent).not.toContain("AGP 7.0");
  expect(downloads).toEqual([]);
  // The user's bubble shows only what they typed.
  const user = a.history.filter((m) => m.role === "user").at(-1)!;
  expect(typedText(user)).toBe("start an android project with gradle 9.1");
  // Reading only from the library is no research: no extra model call for lessons.
  expect(requests.length).toBe(2);
});

test("with the network off, the library is still searchable", async () => {
  await L.savePage({ url: "https://docs.gradle.org/9.1/release-notes.html", title: "Gradle 9.1 Release Notes", text: GRADLE, source: "web_fetch" });
  const { a } = await agent(false);
  expect(a.toolNames).toContain("library_search");
  expect(a.toolNames).not.toContain("web_search");
  const out = String(await web.librarySearch.run({ query: "gradle agp" }, { cwd: "." }));
  expect(out).toContain("8.13");
  expect(downloads).toEqual([]);
});
