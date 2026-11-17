// The lessons notebook: what Maxx learned from its web research, in one
// sentence each ("Gradle 9.1 needs AGP 8.13 or newer"), so the useful part of a
// search survives and not only the raw pages. After a turn that looked things
// up, the model writes down at most three; each is checked against the page it
// cites the way the research lab checks claims (truth.ts), and lessons that
// fit the next request ride along with it.

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Message } from "../llm.ts";
import { numbersIn, supported } from "../lab/truth.ts";
import { libraryDir, normalUrl } from "./store.ts";
import { NOTEBOOK_MARK } from "../context.ts";
export { NOTEBOOK_MARK, stripNotebook } from "../context.ts";
import { Bm25, tokens } from "./rank.ts";

// verified: its numbers and words are on the page it cites. unverified: they are not (or it cites nothing).
// yours: written or approved by you. study: a corroborated finding from a Research tab study.
export type LessonStatus = "verified" | "unverified" | "yours" | "study";
export type Lesson = { id: string; text: string; url?: string; status: LessonStatus; at: number; uses: number; lastUsed?: number; pinned?: boolean; topic?: string };

const MAX_LESSONS = 400;
const file = () => join(libraryDir(), "lessons.json");
const norm = (s: string) => s.toLowerCase().replace(/[`'".,;:!?()]/g, "").replace(/\s+/g, " ").trim();

export async function loadLessons(): Promise<Lesson[]> {
  try {
    const l = JSON.parse(await readFile(file(), "utf8")) as Lesson[];
    return Array.isArray(l) ? l : [];
  } catch {
    return [];
  }
}

async function store(list: Lesson[]) {
  await mkdir(libraryDir(), { recursive: true });
  const tmp = `${file()}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(list, null, 1));
  await rename(tmp, file());
}

// Nearly the same sentence: most of the words of the shorter one are in the longer one.
function overlap(a: string, b: string): number {
  const A = new Set(tokens(a)), B = new Set(tokens(b));
  if (!A.size || !B.size) return 0;
  let n = 0;
  for (const t of A) if (B.has(t)) n++;
  return n / Math.min(A.size, B.size);
}

export async function addLesson(l: { text: string; url?: string; status: LessonStatus; topic?: string }, now = Date.now()): Promise<{ lesson: Lesson; isNew: boolean } | null> {
  const text = l.text.replace(/\s+/g, " ").trim().replace(/^[-*•]\s*/, "").slice(0, 280);
  if (text.length < 12) return null;
  const list = await loadLessons();
  const same = list.find((x) => norm(x.text) === norm(text) || overlap(x.text, text) >= 0.85);
  if (same) {
    // Seen again: it is newer now, and a better status wins.
    same.at = now;
    if (l.url && !same.url) same.url = l.url;
    if (rankOf(l.status) > rankOf(same.status)) same.status = l.status;
    await store(list);
    return { lesson: same, isNew: false };
  }
  const lesson: Lesson = { id: randomUUID().slice(0, 8), text, url: l.url ? normalUrl(l.url) : undefined, status: l.status, at: now, uses: 0, topic: l.topic };
  list.push(lesson);
  if (list.length > MAX_LESSONS) {
    const drop = list.filter((x) => !x.pinned && x.status !== "yours").sort((a, b) => (a.lastUsed ?? a.at) - (b.lastUsed ?? b.at)).slice(0, list.length - MAX_LESSONS);
    for (const d of drop) list.splice(list.indexOf(d), 1);
  }
  await store(list);
  return { lesson, isNew: true };
}
const rankOf = (s: LessonStatus) => ({ unverified: 0, verified: 1, study: 2, yours: 3 })[s];

export async function editLesson(id: string, change: { text?: string; pinned?: boolean; status?: LessonStatus }): Promise<Lesson | null> {
  const list = await loadLessons();
  const l = list.find((x) => x.id === id);
  if (!l) return null;
  if (change.text !== undefined) {
    const t = change.text.replace(/\s+/g, " ").trim().slice(0, 280);
    if (t) (l.text = t), (l.status = "yours");
  }
  if (change.pinned !== undefined) l.pinned = change.pinned || undefined;
  if (change.status) l.status = change.status;
  await store(list);
  return l;
}

export async function deleteLesson(id: string): Promise<boolean> {
  const list = await loadLessons();
  const at = list.findIndex((x) => x.id === id);
  if (at < 0) return false;
  list.splice(at, 1);
  await store(list);
  return true;
}

// The lessons that fit a request: unverified ones stay out until you approve them.
export async function relevantLessons(query: string, k = 4, o: { all?: boolean } = {}): Promise<Lesson[]> {
  const list = (await loadLessons()).filter((l) => o.all || l.status !== "unverified");
  if (!list.length) return [];
  const bm = new Bm25(list.map((l) => ({ id: l.id, text: l.text, boost: l.topic })));
  const q = new Set(tokens(query)).size;
  // Two words of the request in common (or all of a short one), not one stray word.
  const hits = bm.search(query, k * 3).filter((h) => h.cover >= (q <= 2 ? 1 : Math.min(0.5, 2 / q)) && (q <= 1 || h.cover * q >= 2));
  return hits.slice(0, k).map((h) => list.find((l) => l.id === h.id)!);
}

export async function markLessonsUsed(ids: string[], now = Date.now()) {
  if (!ids.length) return;
  const list = await loadLessons();
  for (const l of list) if (ids.includes(l.id)) (l.uses++, (l.lastUsed = now));
  await store(list);
}

// ---- riding along with a request ----
export function notebookNote(lessons: Lesson[]): string {
  if (!lessons.length) return "";
  const lines = lessons.map((l) => `- ${l.text}${l.url ? ` <${l.url}>` : ""}`);
  return `${NOTEBOOK_MARK} (lessons from earlier web research; use them if they fit, and look it up again if something may have changed):\n${lines.join("\n")}]`;
}

// ---- writing lessons after research ----
export type WebCall = { name: string; args: Record<string, unknown>; result: string };

// Worth a lesson: the turn read a page, or searched more than once.
export const researched = (calls: WebCall[]) => calls.some((c) => c.name === "web_fetch" && !/^error/i.test(c.result) && !c.result.startsWith("📚")) || calls.filter((c) => c.name === "web_search" && !c.result.startsWith("📚")).length >= 2;

export function lessonMessages(ask: string, calls: WebCall[], answer: string, known: Lesson[]): Message[] {
  const budget = 7000;
  let used = 0;
  const parts: string[] = [];
  for (const c of calls) {
    const head = c.name === "web_search" ? `SEARCH "${String(c.args.query ?? "")}"` : `PAGE ${String(c.args.url ?? "")}${c.args.find ? ` (looking for: ${c.args.find})` : ""}`;
    const body = c.result.slice(0, Math.max(400, Math.floor(budget / Math.max(1, calls.length))));
    if (used + body.length > budget) break;
    used += body.length;
    parts.push(`${head}\n${body}`);
  }
  return [
    {
      role: "system",
      content:
        "You keep a notebook of durable facts learned from web research, for a coding assistant that will meet the same topics again. Each lesson is one plain sentence of at most 30 words: a version requirement, a correct command, an API that changed, a fix that worked, a gotcha. Copy numbers, names and versions exactly as the page has them. Leave out anything that will be out of date within a month (prices, news, scores) and anything everyone knows.",
    },
    {
      role: "user",
      content: `The request was: ${ask.slice(0, 600)}\n\nWhat the research found:\n\n${parts.join("\n\n---\n\n")}\n\nThe answer given: ${answer.replace(/\s+/g, " ").slice(0, 800)}\n\n${known.length ? `Already in the notebook (don't repeat these):\n${known.map((l) => `- ${l.text}`).join("\n")}\n\n` : ""}Write at most 3 new lessons, one per line, each as:\nLESSON: <the sentence> <https://the page it came from>\nIf nothing is worth keeping, write only NONE.`,
    },
  ];
}

export function parseLessons(text: string): { text: string; url?: string }[] {
  const clean = text.replace(/<think>[\s\S]*?<\/think>/g, "");
  if (/^\s*NONE\b/i.test(clean.trim())) return [];
  const out: { text: string; url?: string }[] = [];
  for (const raw of clean.split("\n")) {
    const m = raw.trim().match(/^(?:[-*•]\s*)?(?:\d+[.)]\s*)?LESSON\s*[:\-]\s*(.+)$/i);
    if (!m) continue;
    let body = m[1]!.replace(/\*\*/g, "").trim();
    const u = body.match(/<?(https?:\/\/[^\s>)\]]+)>?\)?\.?\s*$/);
    const url = u ? u[1]!.replace(/[.,;]+$/, "") : undefined;
    if (u) body = body.slice(0, u.index).trim();
    body = body.replace(/[\s(\[—–-]+(source|from)?:?\s*$/i, "").trim();
    if (body.length >= 12 && !/^none\b/i.test(body)) out.push({ text: body, url });
  }
  return out.slice(0, 3);
}

// The truth check, as the research lab does it: the numbers in a lesson must
// be on the page it cites, and so must most of its words.
export function verifyLesson(text: string, page: string | undefined): LessonStatus {
  if (!page) return "unverified";
  const corpus = numbersIn(page);
  const nums = numbersIn(text).filter((n) => !(Number.isInteger(n) && Math.abs(n) <= 3));
  if (nums.some((n) => !supported(n, corpus))) return "unverified";
  // Versions like 8.13 must appear as written, not only near some other number.
  for (const v of text.match(/\b\d+\.\d+(?:\.\d+)*\b/g) ?? []) if (!page.includes(v)) return "unverified";
  const words = [...new Set(tokens(text))].filter((w) => w.length > 3 && !/^\d/.test(w));
  const have = new Set(tokens(page));
  const share = words.length ? words.filter((w) => have.has(w)).length / words.length : 1;
  return share >= 0.5 ? "verified" : "unverified";
}
