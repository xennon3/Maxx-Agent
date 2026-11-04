import { existsSync } from "node:fs";
import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { z } from "zod";
import { defineTool, type Tool, type ToolContext, type ToolResult } from "./types.ts";
import { inside } from "./paths.ts";
import { complete, toWire, type ContentPart, type Message } from "../llm.ts";
import { imagePart } from "../vision.ts";
import { decodePng, toShot, type Image } from "../image.ts";
import { findBrowser, webPage } from "../judge.ts";
import { screenshot } from "../browser.ts";
import { crimeList, findCrimes } from "../crimes.ts";
import { maxxHome } from "../sessions.ts";
import { contrast, harmony, HARMONIES, mentionedPalette, normHex, randomPalette } from "../palette.ts";
import { browserAct, browserLook, browserOpen } from "./browse.ts";
import { androidKey, androidScreen, androidSwipe, androidTap, androidType } from "./android.ts";
import { designTokens, drawSvg, pickFonts, pickPair } from "./design.ts";
import { findBackend, imageGenerate, loadImagesConfig } from "./imagegen.ts";
import { makeSounds } from "./sound.ts";
import { timelapseTool } from "../timelapse.ts";
import jpeg from "jpeg-js";

// ✨ Director: tools that make design decisions with you rather than for you.
// rival_designs has two designers compete, sketch_to_app turns a napkin
// drawing into a page, persona_test sends made-up users through the app,
// asset_kit makes a whole matched set of game assets from one line, and
// ugly_check / timelapse expose the alarm and the film the loop runs anyway.

const text = (r: ToolResult) => (typeof r === "string" ? r : r.text);
const imgs = (r: ToolResult) => (typeof r === "string" ? [] : (r.images ?? []));
const NO_MODEL = "error: this tool needs the agent loop (it asks the model itself); run it from maxx or maxx ui.";

// A whole HTML page out of a model's reply (fenced or not).
export function extractHtml(reply: string): string | null {
  const fence = /```(?:html)?[ \t]*\n([\s\S]*?)```/i.exec(reply);
  const body = fence ? fence[1]! : reply;
  const i = body.search(/<!doctype html|<html[\s>]/i);
  if (i < 0) return /<(body|main|div|section)[\s>]/i.test(body) ? `<!doctype html>\n<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body>\n${body.trim()}\n</body></html>\n` : null;
  const end = body.toLowerCase().lastIndexOf("</html>");
  return body.slice(i, end >= 0 ? end + 7 : undefined).trim() + "\n";
}

export function extractSvg(reply: string): string | null {
  const m = /<svg[\s\S]*<\/svg>/i.exec(reply);
  if (!m) return null;
  let svg = m[0];
  if (!/xmlns=/.test(svg)) svg = svg.replace(/<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"');
  return svg;
}

// The project's design tokens and fonts, for prompts and pages.
async function brand(cwd: string): Promise<{ css: string; fontsHref: (fromDir: string) => string | null }> {
  const tokens = join(cwd, "design", "tokens.css");
  const css = existsSync(tokens) ? (await readFile(tokens, "utf8")).replace(/\/\*[\s\S]*?\*\//g, "").trim() : "";
  const fonts = join(cwd, "fonts", "fonts.css");
  return { css, fontsHref: (fromDir) => (existsSync(fonts) ? relative(fromDir, fonts).replace(/\\/g, "/") : null) };
}

async function shoot(url: string, size: "phone" | "desktop" = "desktop"): Promise<Image | null> {
  const browser = findBrowser();
  if (!browser) return null;
  const [width, height] = size === "phone" ? [390, 844] : [1280, 800];
  try {
    const s = await screenshot(browser, url, { width, height, settleMs: 500 });
    return toShot(s.png, { maxSide: 900, quality: 75 });
  } catch {
    return null;
  }
}

// ---- taste: what the user picked, so later designs lean their way ----

export const tasteFile = () => join(maxxHome(), "taste.md");

export async function loadTaste(): Promise<string[]> {
  try {
    return (await readFile(tasteFile(), "utf8")).split("\n").filter((l) => l.startsWith("- ")).slice(-20);
  } catch {
    return [];
  }
}

export function tasteSummary(lines: string[]): string {
  const won = new Map<string, number>(), lost = new Map<string, number>();
  const said: string[] = [];
  for (const l of lines) {
    const m = /picked "([^"]+)" over "([^"]+)"/.exec(l);
    if (m) won.set(m[1]!, (won.get(m[1]!) ?? 0) + 1), lost.set(m[2]!, (lost.get(m[2]!) ?? 0) + 1);
    const s = /said: (.+)$/.exec(l);
    if (s) said.push(s[1]!.trim());
  }
  const fmt = (m: Map<string, number>) => [...m.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k}${n > 1 ? ` (${n})` : ""}`).join(", ");
  const parts = [won.size ? `liked ${fmt(won)}` : "", lost.size ? `passed over ${fmt(lost)}` : "", said.length ? `said ${said.slice(-3).map((s) => `"${s}"`).join("; ")}` : ""].filter(Boolean);
  return parts.length ? `The user's design taste, from their picks: ${parts.join("; ")}.` : "";
}

export async function recordTaste(line: string) {
  await mkdir(dirname(tasteFile()), { recursive: true });
  if (!existsSync(tasteFile())) await writeFile(tasteFile(), "# Design taste\nMaxx adds a line each time you pick between rival designs. Edit or delete lines freely.\n\n");
  await appendFile(tasteFile(), line.replace(/\n/g, " ") + "\n");
}

// ---- rival designer ----

export const DESIGNERS: Record<string, string> = {
  "Swiss minimalist": "a strict grid, lots of white space, one accent colour, big confident sans-serif type, no decoration",
  "Playful maximalist": "bold colours, rounded shapes, big friendly buttons, emoji and sticker-like details, a bit of bounce",
  Editorial: "a magazine layout: serif headlines, columns, pull quotes, refined spacing, restrained colour",
  Brutalist: "raw and honest: thick black borders, monospace type, hard shadows, high contrast, blocky layout",
  "Soft glass": "frosted-glass cards over a gentle gradient, soft shadows, rounded corners, airy and calm",
  "Neon arcade": "a dark background with glowing neon accents, chunky pixel-ish headings, energetic",
  "Pro dashboard": "a dense, dark, professional UI: compact cards, muted colours with one bright accent, data first",
  "Warm organic": "earthy colours, rounded hand-made feel, generous padding, cosy and welcoming",
};

// Two different designers; a style the user liked before gets a seat half the time.
export function pickRivals(taste: string[], rnd = Math.random): [string, string] {
  const names = Object.keys(DESIGNERS);
  const liked = taste.map((l) => /picked "([^"]+)"/.exec(l)?.[1]).filter((n): n is string => !!n && n in DESIGNERS);
  const a = liked.length && rnd() < 0.5 ? liked[Math.floor(rnd() * liked.length)]! : names[Math.floor(rnd() * names.length)]!;
  const rest = names.filter((n) => n !== a);
  return [a, rest[Math.floor(rnd() * rest.length)]!];
}

export function rivalMessages(brief: string, style: string, tokensCss: string, taste: string): Message[] {
  return [
    {
      role: "system",
      content:
        `You are a web designer with a strong personal style: ${style} (${DESIGNERS[style] ?? style}). ` +
        "Write ONE complete, self-contained HTML page with all CSS in a <style> tag and no external files or images (draw with CSS, SVG or emoji). " +
        "Mobile first: it must look right at 390px wide and at 1280px. Use real-sounding content, never lorem ipsum. Readable contrast, buttons at least 44px tall. " +
        "Reply with only the HTML.",
    },
    { role: "user", content: `Design this: ${brief}${tokensCss ? `\n\nKeep the brand: use these CSS variables (paste the :root block into your <style>):\n${tokensCss.slice(0, 2500)}` : ""}${taste ? `\n\n${taste} Lean your style toward what they liked, without losing your own voice.` : ""}` },
  ];
}

export function parseScores(reply: string): { a?: number; b?: number; why: string } {
  const a = /\bA\b[^0-9\n]{0,12}(\d+(?:\.\d+)?)\s*(?:\/\s*10)?/i.exec(reply), b = /\bB\b[^0-9\n]{0,12}(\d+(?:\.\d+)?)\s*(?:\/\s*10)?/i.exec(reply);
  const n = (m: RegExpExecArray | null) => (m ? Math.min(10, parseFloat(m[1]!)) : undefined);
  return { a: n(a), b: n(b), why: reply.replace(/<think>[\s\S]*?<\/think>/g, "").trim().split("\n").filter(Boolean).slice(0, 3).join(" ").slice(0, 300) };
}

export const rivalDesigns = defineTool({
  name: "rival_designs",
  description:
    "Before building a screen, have two designers with different styles each make it as a full HTML page. Maxx screenshots both, checks them for design crimes, scores them with vision, then asks the user to pick on a split screen. Their pick teaches Maxx their taste. path: where the winner goes (e.g. index.html).",
  schema: z.object({
    brief: z.string().describe("What the screen is and must contain, e.g. 'landing page for a cozy farming game with a play button and screenshots'"),
    path: z.string().optional().describe("Where to save the winning design; default only design/rivals/"),
    styles: z.array(z.string()).length(2).optional().describe(`Two designer styles; default two different ones from: ${Object.keys(DESIGNERS).join(", ")}`),
  }),
  risk: "write",
  ruleKey: () => "rivals",
  preview: (a) => `two rival designs for "${a.brief.slice(0, 80)}"${a.path ? ` → ${a.path}` : ""}`,
  async run({ brief, path, styles }, ctx) {
    if (!ctx.think) return NO_MODEL;
    const taste = await loadTaste();
    const [sa, sb] = (styles as [string, string] | undefined) ?? pickRivals(taste);
    const { css } = await brand(ctx.cwd);
    const dir = join(ctx.cwd, "design", "rivals");
    await mkdir(dir, { recursive: true });
    const made: { key: "A" | "B"; style: string; html: string; file: string; shot: Image | null; crimes: number; list: string }[] = [];
    for (const [key, style] of [["A", sa], ["B", sb]] as const) {
      const html = extractHtml(await ctx.think(rivalMessages(brief, style, css, tasteSummary(taste))));
      if (!html) return `error: designer ${key} (${style}) did not reply with HTML; try again or pick other styles`;
      const file = join(dir, `${key.toLowerCase()}.html`);
      await writeFile(file, html);
      const url = pathToFileURL(file).href;
      const shot = await shoot(url);
      const browser = findBrowser();
      const crimes = browser ? await findCrimes(browser, url, { sizes: ["phone"], signal: ctx.signal }).catch(() => []) : [];
      made.push({ key, style, html, file, shot, crimes: crimes.length, list: crimeList(crimes, 4) });
    }
    const [A, B] = made as [(typeof made)[0], (typeof made)[0]];
    // A split screen to compare them live.
    await writeFile(join(dir, "index.html"), `<!doctype html><meta charset="utf-8"><title>Rival designs</title><style>body{margin:0;font:14px system-ui;background:#18181b;color:#fafafa}header{padding:10px 16px}main{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 8px 8px;height:calc(100vh - 52px)}section{display:flex;flex-direction:column}h2{margin:6px 0;font-size:15px}iframe{flex:1;border:0;border-radius:8px;background:#fff}@media(max-width:800px){main{grid-template-columns:1fr;height:auto}iframe{height:80vh}}</style><header>${brief.replace(/</g, "&lt;")}</header><main><section><h2>A · ${A.style}</h2><iframe src="a.html"></iframe></section><section><h2>B · ${B.style}</h2><iframe src="b.html"></iframe></section></main>`);
    const shots = made.map((m) => m.shot).filter((s): s is Image => !!s);
    let score: { a?: number; b?: number; why: string } = { why: "" };
    if (shots.length === 2 && ctx.see) {
      const r = await ctx.see(shots, `Two designs for: ${brief}\nThe first image is A, the second is B. Score each from 1 to 10 for how clear, good-looking and fitting it is. Reply in exactly this form:\nA: <score> - <one short reason>\nB: <score> - <one short reason>`).catch(() => null);
      if (r) score = parseScores(r);
    }
    // Fewer crimes wins a tie; vision scores count more.
    const total = (m: typeof A, s?: number) => (s ?? 5) * 2 - m.crimes;
    const lead = total(A, score.a) >= total(B, score.b) ? A : B;
    if (shots.length) ctx.show?.(shots);
    const line = (m: typeof A, s?: number) => `${m.key} (${m.style}): ${s !== undefined ? `vision ${s}/10, ` : ""}${m.crimes ? `${m.crimes} design crime(s)` : "no design crimes"}`;
    const choiceA = `A: ${A.style}`, choiceB = `B: ${B.style}`;
    let answer: string | null = null;
    if (ctx.ask) answer = await ctx.ask({ question: `Two designs for "${brief.slice(0, 80)}". Which should Maxx build? (Open design/rivals/index.html to compare them side by side.)\n${line(A, score.a)}\n${line(B, score.b)}`, choices: [choiceA, choiceB, "Mix the two"], guess: lead === A ? choiceA : choiceB });
    // "A", "b.", "A: Swiss minimalist", "option B" pick one; anything longer is a mix in the user's words.
    const which = (k: string) => answer === (k === "A" ? choiceA : choiceB) || new RegExp(`^\\s*(option\\s+)?${k}\\s*([:.)!-]|$)`, "i").test(answer!);
    const picked = !answer ? lead : which("A") ? A : which("B") ? B : null;
    const date = new Date().toISOString().slice(0, 10);
    if (answer && picked) await recordTaste(`- ${date} picked "${picked.style}" over "${(picked === A ? B : A).style}" for "${brief.slice(0, 80)}"`);
    else if (answer) await recordTaste(`- ${date} mixed "${A.style}" and "${B.style}" for "${brief.slice(0, 80)}"; said: ${answer.slice(0, 160)}`);
    const out = [`Two rival designs in design/rivals/ (a.html, b.html, and index.html side by side):`, line(A, score.a), line(B, score.b), ...(score.why ? [`Vision: ${score.why}`] : [])];
    if (picked) {
      if (path) {
        await mkdir(dirname(inside(ctx.cwd, path)), { recursive: true });
        await writeFile(inside(ctx.cwd, path), picked.html);
      }
      out.push(`${answer ? "The user picked" : "Nobody answered, so Maxx picked the higher score:"} ${picked.key} (${picked.style}).${path ? ` It is now ${path}; build on it from here.` : ` Build on design/rivals/${picked.key.toLowerCase()}.html.`}`);
      if (picked.crimes) out.push(`Fix its design crimes first:\n${picked.list}`);
    } else out.push(`The user wants a mix: "${answer}". Combine design/rivals/a.html and b.html as they describe${path ? ` into ${path}` : ""}.`);
    return { text: out.join("\n"), images: shots };
  },
});

// ---- sketch to app ----

function imageFrom(bytes: Uint8Array, name: string): Image {
  if (/\.png$/i.test(name) || bytes[0] === 0x89) return toShot(bytes, { maxSide: 1024, quality: 80 });
  const j = jpeg.decode(bytes, { useTArray: true, formatAsRGBA: true });
  return toShot({ width: j.width, height: j.height, data: j.data }, { maxSide: 1024, quality: 80 });
}

// Width and height of an image, from its header.
export function dims(img: Image): { width: number; height: number } {
  const b = Buffer.from(img.base64.slice(0, 80_000), "base64");
  if (b[0] === 0x89) return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  for (let i = 2; i < b.length - 9; ) {
    if (b[i] !== 0xff) break;
    const m = b[i + 1]!, len = b.readUInt16BE(i + 2);
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { width: b.readUInt16BE(i + 7), height: b.readUInt16BE(i + 5) };
    i += 2 + len;
  }
  return { width: 1, height: 1 };
}

const SKETCH_SPEC = "This is a hand-drawn sketch of an app or web screen. Describe it as a precise layout spec, top to bottom: every box, its position and rough size (as a share of the screen), the words written in or next to it, and what it most likely is (header, nav, button, image, list, card, input, tab bar). Say whether it is a phone or a desktop layout. Do not invent parts that are not drawn.";

export const sketchToApp = defineTool({
  name: "sketch_to_app",
  description:
    "Turn a photo of a hand-drawn sketch (napkin, whiteboard, paper) into a real screen: a web page, or a Jetpack Compose screen when path ends in .kt. Uses the project's design tokens and fonts when they exist. image: the sketch file, or leave it out to use the image the user just attached. Returns the sketch and the result side by side to compare.",
  schema: z.object({
    path: z.string().describe("Where to write it, e.g. index.html or app/src/main/java/.../HomeScreen.kt"),
    image: z.string().optional().describe("The sketch image in the project; default the latest attached image"),
    notes: z.string().optional().describe("Anything the sketch doesn't say: what the app is, colours, what buttons do"),
  }),
  risk: "write",
  ruleKey: () => "sketch",
  preview: (a) => `build ${a.path} from ${a.image ?? "the attached sketch"}`,
  async run({ path, image, notes }, ctx) {
    if (!ctx.think) return NO_MODEL;
    let sketch: Image | undefined;
    if (image) {
      const abs = inside(ctx.cwd, image);
      if (!existsSync(abs)) return `error: ${image} does not exist`;
      try {
        sketch = imageFrom(new Uint8Array(await readFile(abs)), image);
      } catch (e) {
        return `error: could not read ${image} as a PNG or JPEG image (${(e as Error).message})`;
      }
    } else sketch = ctx.attached?.()[0];
    if (!sketch) return "error: no sketch. Attach a photo of it to your message, or give image: the path of one in the project.";
    const vision = ctx.vision?.mode ?? "off";
    if (vision === "off") return "error: reading a sketch needs a model that can see. Load a vision model (or start Maxx with --vision-model).";
    const compose = /\.kt$/i.test(path);
    const { css, fontsHref } = await brand(ctx.cwd);
    const tokensKt = compose && existsSync(join(ctx.cwd, "app")) ? [...new Bun.Glob("app/src/**/Tokens.kt").scanSync({ cwd: ctx.cwd })][0] : undefined;
    const fonts = compose ? null : fontsHref(dirname(inside(ctx.cwd, path)));
    const ask =
      (compose
        ? `Write a Jetpack Compose screen (one Kotlin file: package line, imports, a @Composable function named after the file, and a @Preview) that matches the sketch's layout exactly.${tokensKt ? ` Use the Tokens object from ${tokensKt} for colours, spacing and radius.` : ""} Reply with only the Kotlin code.`
        : `Write one complete HTML page (CSS in a <style> tag, no external files except the fonts link below) that matches the sketch's layout exactly, with sensible real content where the sketch has scribbles. Mobile first; it must also work at desktop width.${css ? `\nUse these design tokens (paste the :root block into your <style> and use the variables):\n${css.slice(0, 2500)}` : ""}${fonts ? `\nAdd <link rel="stylesheet" href="${fonts}"> for the fonts.` : ""} Reply with only the HTML.`) + (notes ? `\nNotes from the user: ${notes}` : "");
    let reply: string;
    if (vision === "native") {
      reply = await ctx.think([{ role: "system", content: "You turn UI sketches into real, working screens." }, { role: "user", content: [{ type: "text", text: `${SKETCH_SPEC}\nThen, using that, ${ask[0]!.toLowerCase()}${ask.slice(1)}` }, imagePart(sketch)] }]);
    } else {
      const spec = await ctx.see?.([sketch], SKETCH_SPEC);
      if (!spec) return "error: the vision model did not describe the sketch";
      reply = await ctx.think([{ role: "system", content: "You turn UI layout specs into real, working screens." }, { role: "user", content: `The layout, read from the user's sketch:\n${spec}\n\n${ask}` }]);
    }
    const abs = inside(ctx.cwd, path);
    await mkdir(dirname(abs), { recursive: true });
    if (compose) {
      const code = /```(?:kotlin|kt)?[ \t]*\n([\s\S]*?)```/i.exec(reply)?.[1] ?? reply;
      if (!/@Composable/.test(code)) return `error: the model did not write a Compose screen; its reply began: ${reply.slice(0, 200)}`;
      await writeFile(abs, code.trim() + "\n");
      return { text: `wrote ${path} from the sketch. Build and run it on the phone to compare (android_run, then android_screen).`, images: [sketch] };
    }
    const html = extractHtml(reply);
    if (!html) return `error: the model did not write HTML; its reply began: ${reply.slice(0, 200)}`;
    await writeFile(abs, html);
    const d = dims(sketch);
    const tall = d.height > d.width;
    const shot = await shoot(pathToFileURL(abs).href, tall ? "phone" : "desktop");
    return { text: `wrote ${path} from the sketch (${tall ? "phone" : "desktop"} layout). Compare the two pictures: the sketch first, then the page. Fix anything that doesn't match.`, images: shot ? [sketch, shot] : [sketch] };
  },
});

// ---- persona testers ----

export const PERSONAS: Record<string, { who: string; does: string }> = {
  grandma: { who: "Rose, 78", does: "reads every word slowly, distrusts icons without labels, taps the biggest obvious thing, gets lost with jargon or tiny text, and wants to know she did it right" },
  speedrunner: { who: "Kai, 19, a speedrunner", does: "never reads, clicks as fast as possible, mashes keys, double-clicks, skips steps, types weird input and tries to break things or find shortcuts" },
  "angry-reviewer": { who: "a grumpy app-store reviewer", does: "hunts for anything to complain about: bugs, ugly bits, slow parts, typos, confusing words, and writes a sharp but fair review" },
  kid: { who: "Mia, 8", does: "can barely read, clicks colourful things, wants it to be fun, and gives up fast when bored or confused" },
  "screen-reader": { who: "Sam, who is blind and uses a screen reader", does: "goes only by the element list (ignores pictures), and checks that every button has a clear name and the order makes sense" },
  commuter: { who: "a commuter on a bumpy bus", does: "uses a phone with one thumb, wants to finish a quick task, hates typing and small buttons" },
};

export function personaPrompt(name: string, task: string, steps: number, phone: boolean): string {
  const p = PERSONAS[name] ?? { who: name, does: "uses the app the way this person would" };
  return [
    `You are ${p.who}. You ${p.does}. You are trying out an app${phone ? " on a phone" : " in a web browser"} for the first time.`,
    `Your goal: ${task}`,
    `Use the tools to actually use the app as this person would: look, ${phone ? "tap, swipe and type" : "click, type and press keys"}. Stay in character. You have at most ${steps} actions.`,
    "When you are done (or stuck, or bored), stop calling tools and write your feedback in this form:",
    "Feedback: one paragraph in your own voice about what it was like.",
    "Score: <1-10>/10",
    "Bugs: a short list of anything broken or confusing (or 'none').",
  ].join("\n");
}

export function parseFeedback(reply: string): { feedback: string; score?: number; bugs: string[] } {
  const clean = reply.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  const score = /score\s*[:=]?\s*(\d+(?:\.\d+)?)\s*\/\s*10/i.exec(clean);
  const fb = /feedback\s*:\s*([\s\S]*?)(?:\n\s*score\b|\n\s*bugs\b|$)/i.exec(clean);
  const bugs = /bugs\s*:\s*([\s\S]*)$/i.exec(clean)?.[1] ?? "";
  return {
    feedback: (fb?.[1] ?? clean.split(/\n\s*score\b/i)[0]!).trim(),
    score: score ? Math.min(10, parseFloat(score[1]!)) : undefined,
    bugs: bugs.split("\n").map((l) => l.replace(/^\s*[-*\d.)]+\s*/, "").trim()).filter((l) => l && !/^none\.?$/i.test(l)),
  };
}

type Run = { name: string; feedback: string; score?: number; bugs: string[]; actions: number; last?: Image };

async function runPersona(name: string, target: string, task: string, steps: number, phone: boolean, ctx: ToolContext): Promise<Run> {
  const tools: Tool<any>[] = phone ? [androidScreen, androidTap, androidSwipe, androidType, androidKey] : [browserOpen, browserAct, browserLook];
  const specs = tools.map((t) => {
    const { $schema: _, ...parameters } = z.toJSONSchema(t.schema, { io: "input" }) as Record<string, unknown>;
    return { type: "function" as const, function: { name: t.name, description: t.description, parameters } };
  });
  const sees = ctx.vision?.mode === "native";
  const first = phone ? await androidScreen.run({}, ctx) : await browserOpen.run({ target, size: "phone" }, ctx);
  let last = imgs(first)[0];
  const look = (r: ToolResult): ContentPart[] => (sees && imgs(r)[0] ? [imagePart(imgs(r)[0]!)] : []);
  const messages: Message[] = [
    { role: "system", content: personaPrompt(name, task, steps, phone) },
    { role: "user", content: [{ type: "text", text: `The app is open in front of you:\n${text(first).slice(0, 6000)}` }, ...look(first)] },
  ];
  // Keep only the newest screenshot in the conversation.
  const dropOldImages = () => {
    for (const m of messages) if (m.role === "user" && Array.isArray(m.content)) m.content = m.content.filter((p) => p.type === "text");
  };
  let actions = 0;
  for (let step = 0; step <= steps; step++) {
    const final = step === steps;
    if (final) messages.push({ role: "user", content: "Time is up. Stop using the app now and write your Feedback, Score and Bugs." });
    const res = await complete(ctx.llm!, messages, final ? [] : specs, () => {}, ctx.signal);
    if (!res.toolCalls.length || final) {
      const f = parseFeedback(res.content);
      return { name, ...f, actions, last };
    }
    messages.push({ role: "assistant", content: res.content || null, tool_calls: toWire(res.toolCalls) });
    let newest: ContentPart[] = [];
    for (const call of res.toolCalls) {
      const tool = tools.find((t) => t.name === call.name);
      let out: ToolResult;
      if (!tool) out = `error: no tool ${call.name}; use ${tools.map((t) => t.name).join(", ")}`;
      else {
        let raw: unknown = {};
        try {
          raw = call.arguments.trim() ? JSON.parse(call.arguments) : {};
        } catch {}
        const parsed = tool.schema.safeParse(raw);
        out = parsed.success ? await tool.run(parsed.data, ctx).catch((e: Error) => `error: ${e.message}`) : `error: invalid arguments: ${parsed.error.issues.map((i: { message: string }) => i.message).join("; ")}`;
        actions++;
      }
      if (imgs(out)[0]) last = imgs(out)[0];
      messages.push({ role: "tool", tool_call_id: call.id, content: text(out).slice(0, 5000) });
      if (look(out).length) newest = look(out);
    }
    if (newest.length) {
      dropOldImages();
      messages.push({ role: "user", content: [{ type: "text", text: "What you see now:" }, ...newest] });
    }
  }
  return { name, feedback: "(no feedback)", bugs: [], actions, last };
}

export const personaTest = defineTool({
  name: "persona_test",
  description: `Send made-up users through the app and get one paragraph of honest feedback, a score and a bug list from each. Built-in personas: ${Object.keys(PERSONAS).join(", ")} (default grandma, speedrunner, angry-reviewer), or describe your own. target: a project page or URL for the browser, or "phone" for the app on the connected phone.`,
  schema: z.object({
    target: z.string().optional().describe('index.html, a URL like http://localhost:5173, or "phone"; default index.html'),
    task: z.string().optional().describe("What each persona tries to do, e.g. 'sign up and post a photo'; default: explore and try the main thing"),
    personas: z.array(z.string()).min(1).max(4).optional(),
    steps: z.number().int().min(3).max(30).optional().describe("Most actions per persona, default 10"),
  }),
  risk: "exec",
  checkpoint: false,
  ruleKey: () => "personas",
  preview: (a) => `${(a.personas ?? ["grandma", "speedrunner", "angry-reviewer"]).join(", ")} try ${a.target ?? "index.html"}${a.task ? `: ${a.task}` : ""}`,
  async run({ target = "index.html", task, personas, steps = 10 }, ctx) {
    if (!ctx.llm) return NO_MODEL;
    const phone = target.toLowerCase() === "phone";
    const runs: Run[] = [];
    for (const name of personas ?? ["grandma", "speedrunner", "angry-reviewer"]) {
      if (ctx.signal?.aborted) break;
      try {
        runs.push(await runPersona(name, target, task ?? "explore the app and try to do the main thing it is for", steps, phone, ctx));
      } catch (e) {
        runs.push({ name, feedback: `(could not test: ${(e as Error).message})`, bugs: [], actions: 0 });
      }
    }
    const report = runs.map((r) => `## ${PERSONAS[r.name]?.who ?? r.name}${r.score !== undefined ? ` · ${r.score}/10` : ""}\n${r.feedback}\n${r.bugs.length ? `\nBugs:\n${r.bugs.map((b) => `- ${b}`).join("\n")}\n` : ""}(${r.actions} actions)`).join("\n\n");
    const file = join(".maxx", "personas", `${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}.md`);
    await mkdir(dirname(join(ctx.cwd, file)), { recursive: true });
    await writeFile(join(ctx.cwd, file), `# Persona test: ${target}\n\n${report}\n`);
    const scored = runs.filter((r) => r.score !== undefined);
    const avg = scored.length ? scored.reduce((n, r) => n + r.score!, 0) / scored.length : undefined;
    const bugs = [...new Set(runs.flatMap((r) => r.bugs))];
    return {
      text: `${report}\n\n${avg !== undefined ? `Average ${avg.toFixed(1)}/10. ` : ""}${bugs.length ? `${bugs.length} bug(s) or confusing bits to look at.` : "No bugs reported."} Saved in ${file}.`,
      images: runs.map((r) => r.last).filter((i): i is Image => !!i).slice(0, 3),
    };
  },
});

// ---- ugly_check ----

export const uglyCheck = defineTool({
  name: "ugly_check",
  description: "Check a web page for design crimes at phone and desktop size: unreadable contrast, tap targets too small, cut-off text, sideways scrolling, tiny type, clashing colours, broken images, overlapping buttons, script errors. Maxx also runs this on its own after changing a page.",
  schema: z.object({ target: z.string().optional().describe("Project HTML file or URL; default index.html") }),
  risk: "read",
  async run({ target = "index.html" }, ctx) {
    const browser = findBrowser();
    if (!browser) return "error: this needs Edge or Chrome; set MAXX_BROWSER";
    let url = target;
    if (!/^https?:|^file:/i.test(target)) {
      const w = await webPage({ cwd: ctx.cwd, changed: [target], android: false });
      if (!w || !existsSync(inside(ctx.cwd, target))) return `error: ${target} does not exist`;
      url = w.url;
    }
    const crimes = await findCrimes(browser, url, { signal: ctx.signal });
    return crimes.length ? `${crimes.length} design crime(s) on ${target}:\n${crimeList(crimes, 20)}` : `no design crimes on ${target} at phone or desktop size`;
  },
});

// ---- asset vending machine ----

export type KitPlan = { palette: string[]; background?: string; font_mood: string; sprites: { name: string; look: string }[]; effects: { name: string; describe: string }[]; music: { name: string; mood: string }[] };

export function kitMessages(theme: string): Message[] {
  return [
    { role: "system", content: "You are a game art director. Reply with only JSON, no other text." },
    {
      role: "user",
      content: `Plan a matched asset kit for a game: "${theme}". Reply with JSON of this shape:
{"palette": ["#hex", 5 colours that fit the theme], "background": "#hex", "font_mood": "a few words for the font's feel",
 "sprites": [{"name": "player", "look": "short visual description"}, 3 to 5 sprites including one called background],
 "effects": [{"name": "jump", "describe": "a few words"}, 4 to 6 sound effects the game needs],
 "music": [{"name": "theme", "mood": "one word: happy, epic, spooky, chill, tense, retro or a word like dungeon"}]}`,
    },
  ];
}

export function parseKit(reply: string, theme: string): KitPlan {
  let j: Partial<KitPlan> = {};
  try {
    const m = /\{[\s\S]*\}/.exec(reply.replace(/<think>[\s\S]*?<\/think>/g, ""));
    if (m) j = JSON.parse(m[0]);
  } catch {}
  const hexes = (Array.isArray(j.palette) ? j.palette : []).map((h) => normHex(String(h))).filter((h): h is string => !!h).slice(0, 6);
  const pal = hexes.length >= 3 ? hexes : (mentionedPalette(theme) ?? harmony(randomPalette().colors[0]!, HARMONIES[Math.floor(Math.random() * HARMONIES.length)])).colors;
  const named = <T extends { name?: unknown }>(a: unknown, ok: (x: T) => boolean): T[] => (Array.isArray(a) ? (a as T[]).filter((x) => x && typeof x.name === "string" && ok(x)) : []);
  const sprites = named<{ name: string; look: string }>(j.sprites, (s) => typeof s.look === "string").slice(0, 6);
  const effects = named<{ name: string; describe: string }>(j.effects, () => true).slice(0, 8);
  const music = named<{ name: string; mood: string }>(j.music, () => true).slice(0, 2);
  const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "sprite";
  return {
    palette: pal,
    background: normHex(String(j.background ?? "")) ?? undefined,
    font_mood: typeof j.font_mood === "string" && j.font_mood ? j.font_mood : theme,
    sprites: (sprites.length ? sprites : [{ name: "player", look: `the hero of a ${theme} game` }, { name: "enemy", look: `an enemy in a ${theme} game` }, { name: "pickup", look: `a collectible item in a ${theme} game` }, { name: "background", look: `a ${theme} game background scene` }]).map((s) => ({ name: slug(s.name), look: s.look })),
    effects: (effects.length ? effects : [{ name: "jump", describe: "short bouncy jump" }, { name: "pickup", describe: "bright coin" }, { name: "hit", describe: "crunchy hit" }, { name: "win", describe: "victory fanfare" }]).map((e) => ({ name: slug(e.name), describe: String(e.describe ?? e.name) })),
    music: (music.length ? music : [{ name: "theme", mood: theme }]).map((m) => ({ name: slug(m.name), mood: String(m.mood ?? theme) })),
  };
}

function kitPage(theme: string, plan: KitPlan, sprites: string[], fontsHref: string | null, accent: string, onAccent: string): string {
  const esc = (s: string) => s.replace(/[<&"]/g, (c) => ({ "<": "&lt;", "&": "&amp;", '"': "&quot;" })[c]!);
  const bg = plan.background ?? "#111827";
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Asset kit: ${esc(theme)}</title>${fontsHref ? `<link rel="stylesheet" href="${fontsHref}">` : ""}
<style>body{margin:0;padding:24px;background:${bg};color:#f8fafc;font-family:var(--font-body,system-ui)}h1{font-family:var(--font-heading,system-ui);margin:0 0 4px;font-size:34px}h2{font-size:15px;opacity:.8;margin:22px 0 8px;text-transform:uppercase;letter-spacing:.08em}.pal{display:flex;border-radius:12px;overflow:hidden;height:64px}.pal div{flex:1;display:flex;align-items:end;padding:6px;font:12px ui-monospace,Consolas,monospace}.grid{display:flex;flex-wrap:wrap;gap:12px}.sprite{background:#ffffff14;border-radius:12px;padding:10px;text-align:center;font-size:12px}.sprite img{width:128px;height:128px;object-fit:contain;image-rendering:pixelated;display:block;margin-bottom:6px}button{background:${accent};color:${onAccent};border:0;border-radius:10px;padding:12px 16px;margin:0 8px 8px 0;font:600 14px system-ui;min-height:44px;cursor:pointer}</style></head><body>
<h1>${esc(theme)}</h1><div style="opacity:.8">Asset kit made by Maxx · fonts, palette, sprites, sounds</div>
<h2>Palette</h2><div class="pal">${plan.palette.map((c) => `<div style="background:${c};color:${contrast("#ffffff", c) >= contrast("#111111", c) ? "#ffffff" : "#111111"}">${c}</div>`).join("")}</div>
<h2>Sprites</h2><div class="grid">${sprites.map((s) => `<div class="sprite"><img src="${s}" alt="${esc(basename(s))}">${esc(basename(s).replace(/\.\w+$/, ""))}</div>`).join("")}</div>
<h2>Sounds</h2><div>${plan.effects.map((e) => `<button onclick="Sound.play('${e.name}')">▶ ${esc(e.name)}</button>`).join("")}${plan.music.map((m) => `<button onclick="Sound.music('${m.name}')">♫ ${esc(m.name)}</button>`).join("")}<button onclick="Sound.music()">■ stop</button></div>
<script src="sound.js"></script></body></html>
`;
}

export const assetKit = defineTool({
  name: "asset_kit",
  description:
    "One line in, a whole matched asset kit out: give a theme like 'retro space shooter' or 'cozy mushroom farm' and Maxx makes the palette (design tokens), a font pair, sprites (with the local image model if one is running, else SVG art), sound effects and title music, plus a preview page. Everything goes in dir.",
  schema: z.object({
    theme: z.string().describe("The game or app's theme and feel"),
    dir: z.string().optional().describe("Folder for the kit, default assets/kit"),
  }),
  risk: "write",
  ruleKey: () => "kit",
  preview: (a) => `make an asset kit for "${a.theme}" in ${a.dir ?? "assets/kit"}`,
  async run({ theme, dir = "assets/kit" }, ctx) {
    if (!ctx.think) return NO_MODEL;
    const plan = parseKit(await ctx.think(kitMessages(theme)).catch(() => ""), theme);
    const done: string[] = [];
    const notes: string[] = [];
    const absDir = inside(ctx.cwd, dir);
    await mkdir(absDir, { recursive: true });
    // Palette and fonts first: the sprites use the colours.
    const t = text(await designTokens.run({ palette: plan.palette.join(" ") }, ctx));
    done.push(t.startsWith("error") ? `palette: ${t}` : `palette ${plan.palette.join(" ")} → design/tokens.json and tokens.css`);
    const f = text(await pickFonts.run({ mood: plan.font_mood }, ctx));
    const pair = pickPair(plan.font_mood);
    done.push(`fonts ${pair.heading} + ${pair.body} → fonts/fonts.css${/Not downloaded/.test(f) ? " (not downloaded: network is off)" : ""}`);
    // Sprites: the image model when there is one, else SVG drawn by the model.
    const backend = await findBackend(await loadImagesConfig()).catch(() => null);
    const sprites: string[] = [];
    for (const s of plan.sprites) {
      if (ctx.signal?.aborted) break;
      const isBg = /background|backdrop|sky|level/.test(s.name);
      if (backend) {
        const out = `${dir}/${s.name}.png`;
        const r = text(await imageGenerate.run({ prompt: `${s.look}, ${theme}, colours ${plan.palette.join(" ")}`, path: out, style: isBg ? "background" : "game-sprite", transparent: !isBg, ...(isBg ? { width: 1024, height: 576 } : { width: 512, height: 512 }) }, ctx));
        if (r.startsWith("made")) sprites.push(`${s.name}.png`);
        else notes.push(`${s.name}: ${r.slice(0, 160)}`);
      } else {
        const reply = await ctx.think([
          { role: "system", content: "You draw simple, bold game art as SVG. Reply with only the SVG." },
          { role: "user", content: `Draw "${s.name}": ${s.look}, for a ${theme} game. viewBox="0 0 ${isBg ? "160 90" : "64 64"}", flat shapes, a clear silhouette, ${isBg ? "filling the whole frame" : "centred on a transparent background"}. Use only these colours: ${plan.palette.join(", ")}${plan.background ? `, ${plan.background}` : ""}, plus black or white for details.` },
        ]).catch(() => "");
        const svg = extractSvg(reply);
        if (!svg) {
          notes.push(`${s.name}: the model did not draw SVG`);
          continue;
        }
        await drawSvg.run({ path: `${dir}/${s.name}.svg`, svg, png: [isBg ? 512 : 128] }, ctx);
        sprites.push(`${s.name}.svg`);
      }
    }
    done.push(sprites.length ? `${sprites.length} sprite(s) ${backend ? `from ${backend.kind}` : "as SVG (no image model running; start ComfyUI or Forge for painted sprites)"}: ${sprites.join(", ")}` : "no sprites");
    const snd = text(await makeSounds.run({ effects: plan.effects, music: plan.music, file: `${dir}/sound.js` }, ctx));
    done.push(snd.startsWith("Wrote") ? `${plan.effects.length} sound effect(s) and ${plan.music.length} song(s) → ${dir}/sound.js` : `sounds: ${snd.slice(0, 160)}`);
    const fontsHref = existsSync(join(ctx.cwd, "fonts", "fonts.css")) ? relative(absDir, join(ctx.cwd, "fonts", "fonts.css")).replace(/\\/g, "/") : null;
    // The buttons take the tokens' brand colour, which is picked to read well.
    const tok = await readFile(join(ctx.cwd, "design", "tokens.json"), "utf8").then((j) => JSON.parse(j).color as Record<string, string>).catch(() => null);
    await writeFile(join(absDir, "index.html"), kitPage(theme, plan, sprites, fontsHref, tok?.primary ?? plan.palette[1] ?? "#2563eb", tok?.["on-primary"] ?? "#ffffff"));
    await writeFile(join(absDir, "kit.json"), JSON.stringify({ theme, ...plan, files: { sprites, sounds: "sound.js", tokens: "design/tokens.json", fonts: "fonts/fonts.css" } }, null, 2) + "\n");
    const shot = await shoot(pathToFileURL(join(absDir, "index.html")).href);
    return {
      text: `Asset kit for "${theme}" in ${dir}/ (open ${dir}/index.html to see and hear it):\n${done.map((d) => `- ${d}`).join("\n")}${notes.length ? `\nSkipped: ${notes.join("; ")}` : ""}\nkit.json lists every file. In the game: <script src="${dir}/sound.js"></script>, Sound.play("${plan.effects[0]?.name}"), Sound.music("${plan.music[0]?.name}"), and the sprites from ${dir}/.`,
      images: shot ? [shot] : [],
    };
  },
});

export const DIRECTOR_TOOLS: Tool<any>[] = [rivalDesigns, sketchToApp, assetKit, personaTest, uglyCheck, timelapseTool];
export const DIRECTOR_PROMPT =
  "Director tools: before building a new screen, rival_designs lets the user pick between two designs (their picks teach you their taste). sketch_to_app turns a sketch photo into a screen. asset_kit makes a matched palette, fonts, sprites and sounds from one theme. persona_test sends made-up users (grandma, speedrunner, angry reviewer) through the app for honest feedback; fix what they find. ugly_check lists design crimes. timelapse makes a GIF of the app being built.";
