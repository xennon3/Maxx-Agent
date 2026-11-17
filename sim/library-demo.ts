#!/usr/bin/env bun
// The 📚 library in `maxx ui`: a library seeded with pages and lessons, a turn
// whose web_search is answered from disk, and the Library tab's notebook, pages
// and search. Shots go to sim/out/library.
//   bun sim/library-demo.ts [skin]
import { mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
const ROOT = resolve(import.meta.dir, "..");
const SKIN = process.argv[2] ?? "abduction";
const OUT = join(ROOT, "sim", "out", "library");
rmSync(OUT, { recursive: true, force: true });
const proj = join(OUT, "android-app");
mkdirSync(proj, { recursive: true });
process.env.MAXX_HOME = join(OUT, "home");
Bun.spawnSync(["git", "init", "-q"], { cwd: proj });

const L = await import(ROOT + "/src/library/index.ts");
const DAY = 86_400_000;
const now = Date.now();
const para = (s: string, n = 6) => Array.from({ length: n }, () => s).join(" ");
const PAGES: { url: string; title: string; days: number; text: string; uses?: number; pin?: boolean }[] = [
  { url: "https://docs.gradle.org/9.1/release-notes.html", title: "Gradle 9.1 Release Notes", days: 2, uses: 4, text: `# Gradle 9.1 release notes\n\n## Compatibility\n\nGradle 9.1 requires the Android Gradle Plugin (AGP) 8.13 or newer. Older AGP versions fail with "Unsupported class file major version 69".\n\nKotlin 2.2 is the embedded Kotlin version. Java 17 or newer is needed to run Gradle, and Java 25 is supported.\n\n## Configuration cache\n\n${para("The configuration cache is on by default for new builds and speeds up repeat builds.")}` },
  { url: "https://developer.android.com/build/releases/gradle-plugin", title: "Android Gradle plugin 8.13 release notes", days: 5, uses: 2, text: `# AGP 8.13\n\n## Compatibility\n\nAGP 8.13 needs Gradle 9.0 or higher, SDK Build Tools 35, and JDK 17. Android Studio Narwhal 3 Feature Drop or newer.\n\n${para("Notes on the build system, R8 and lint changes in this release.")}` },
  { url: "https://threejs.org/docs/#api/en/materials/MeshPhysicalMaterial", title: "MeshPhysicalMaterial – three.js docs", days: 21, uses: 6, pin: true, text: `# MeshPhysicalMaterial\n\nAn extension of MeshStandardMaterial with clearcoat, transmission, sheen and iridescence.\n\n## Properties\n\n.transmission: Degree of transmission (0-1) for glass and water. Use with .thickness and .ior (default 1.5).\n\n${para("Physically based rendering settings and examples for realistic materials.")}` },
  { url: "https://docs.blender.org/manual/en/latest/render/cycles/render_settings/sampling.html", title: "Sampling — Blender Manual", days: 40, uses: 1, text: `# Sampling\n\n## Denoising\n\nOpenImageDenoise runs on the CPU or GPU and works best with the Albedo and Normal passes. OptiX denoising needs an NVIDIA RTX card.\n\n${para("Adaptive sampling stops rendering pixels that are already clean.")}` },
  { url: "https://stackoverflow.com/questions/79112233/unsupported-class-file-major-version-69", title: "Unsupported class file major version 69 - Stack Overflow", days: 9, uses: 1, text: `# Unsupported class file major version 69\n\nThe error means Gradle runs on Java 25 but your AGP is too old. Update to AGP 8.13, or point org.gradle.java.home to JDK 21.\n\n${para("Answer details, comments and alternative fixes from other users.")}` },
  { url: "https://www.theverge.com/2026/11/14/qwen-new-model-release", title: "Alibaba's new Qwen model runs on a laptop", days: 4, text: `# Alibaba's new Qwen model\n\n${para("A news story about a new open model release and how it compares with others.", 8)}` },
  { url: "https://www.amazon.com/dp/B0EVOX3", title: "GMKtec EVO-X3 Mini PC 128GB", days: 3, text: `# GMKtec EVO-X3\n\nAdd to Cart. In stock.\n\n${para("Product details, ratings and price history for this mini PC.", 6)}` },
  { url: "https://bun.com/docs/runtime/shell", title: "Bun Shell – Bun docs", days: 12, uses: 3, text: `# Bun Shell\n\nBun Shell runs shell commands from JavaScript with $ and works the same on Windows, macOS and Linux.\n\n${para("Examples of piping, redirection and environment variables.")}` },
];
for (const p of PAGES) {
  const saved = await L.savePage({ url: p.url, title: p.title, text: p.text, source: "web_fetch", now: now - p.days * DAY });
  if (saved && p.pin) await L.pinPage(saved.id, true);
  if (saved && p.uses) for (let i = 0; i < p.uses; i++) await L.markUsed([saved.id], now - DAY);
}
const LESSONS: { text: string; url?: string; status: "verified" | "unverified" | "yours" | "study"; days: number }[] = [
  { text: "Gradle 9.1 needs the Android Gradle Plugin 8.13 or newer; older AGP fails with class file major version 69.", url: "https://docs.gradle.org/9.1/release-notes.html", status: "verified", days: 2 },
  { text: "For glass in three.js, use MeshPhysicalMaterial with transmission 1, thickness and ior 1.5.", url: "https://threejs.org/docs/#api/en/materials/MeshPhysicalMaterial", status: "verified", days: 21 },
  { text: "OptiX denoising in Blender needs an NVIDIA RTX card; on AMD use OpenImageDenoise.", url: "https://docs.blender.org/manual/en/latest/render/cycles/render_settings/sampling.html", status: "verified", days: 40 },
  { text: "AGP 8.13 needs SDK Build Tools 36 and JDK 21.", url: "https://developer.android.com/build/releases/gradle-plugin", status: "unverified", days: 5 },
  { text: "Use py, not python, on this PC.", status: "yours", days: 30 },
  { text: "Solar panels lose about 0.4% of their output per °C above 25 °C.", url: "https://www.energy.gov/eere/solar/solar-performance", status: "study", days: 15 },
];
for (const l of LESSONS) await L.addLesson(l, now - l.days * DAY);
await L.bump({ searches: 31, searchMs: 31 * 11_800, fetches: 44, fetchMs: 44 * 5200, servedSearches: 17, servedFetches: 26, cachedSearches: 5, offline: 2 });

// The model: one turn that looks something up (answered by the library), then an answer.
let calls = 0;
const lm = Bun.serve({ port: 0, async fetch(req) {
  if (new URL(req.url).pathname.endsWith("/models")) return Response.json({ data: [{ id: "qwen-agentworld-35b" }] });
  const body = await req.json();
  const last = JSON.stringify(body.messages.at(-1));
  const chunks: object[] = [];
  if (body.tools?.length && !/tool_call_id/.test(last) && calls === 0) {
    calls++;
    chunks.push({ choices: [{ delta: { tool_calls: [{ index: 0, id: "c1", function: { name: "web_search", arguments: JSON.stringify({ query: "gradle 9.1 agp version" }) } }] } }] });
  } else chunks.push({ choices: [{ delta: { content: "Use **AGP 8.13 or newer** with Gradle 9.1. Older plugins fail with *Unsupported class file major version 69*, because Gradle 9.1 runs on Java 25.\n\nIn `gradle/libs.versions.toml`:\n\n```toml\nagp = \"8.13.0\"\n```\n\nSources: https://docs.gradle.org/9.1/release-notes.html" } }] });
  return new Response(chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join("") + "data: [DONE]\n\n", { headers: { "content-type": "text/event-stream" } });
} });

const { startUI } = await import(ROOT + "/src/ui/server.ts");
const ui = await startUI({ baseURL: `http://127.0.0.1:${lm.port}/v1`, port: 0, open: false, cwd: proj });
const { chromium } = require("playwright");
const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1360, height: 900 }, colorScheme: "dark", deviceScaleFactor: 2 });
p.on("pageerror", (e: any) => console.log("PAGE ERROR", e.message));
await p.goto(ui.link);
await p.waitForTimeout(1200);
await p.evaluate((id: string) => (0, eval)("skinApply")(id), SKIN);
await p.evaluate((proj: string) => (0, eval)("send")({ type: "open", cwd: proj, model: "qwen-agentworld-35b", network: true }), proj);
await p.waitForTimeout(1200);
// Network on, so the web tools are offered.
await p.evaluate(() => (0, eval)("send")({ type: "network", on: true }));
await p.waitForTimeout(600);
await p.fill("#input", "Which AGP version do I need with Gradle 9.1? My build says unsupported class file major version 69");
await p.keyboard.press("Enter");
await p.waitForTimeout(3500);
// Open the tool card so the 📚 result shows.
await p.evaluate(() => { for (const d of document.querySelectorAll("details.tool")) (d as HTMLDetailsElement).open = true; });
await p.click('#rail button[data-tab="library"]');
await p.waitForTimeout(900);
await p.screenshot({ path: join(OUT, "1-turn-and-notebook.png") });
await p.click("#libVPages");
await p.waitForTimeout(300);
await p.screenshot({ path: join(OUT, "2-pages.png") });
await p.fill("#libQ", "agp java version");
await p.press("#libQ", "Enter");
await p.waitForTimeout(800);
await p.screenshot({ path: join(OUT, "3-search.png") });
await p.click("#libVNotes");
await p.waitForTimeout(300);
await p.screenshot({ path: join(OUT, "4-search-notebook.png") });
console.log("shots in", OUT);
await browser.close(); ui.stop(); lm.stop(); process.exit(0);
