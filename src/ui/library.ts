// The 📚 Library tab's side of the WebSocket: list, search, pin and delete
// saved pages, and read, write, approve and delete notebook lessons. The
// library is the same for every project, so this works with no folder open.

import * as L from "../library/index.ts";
import { embedder } from "../library/embed.ts";

type Out = Record<string, unknown> & { type: string };
const LIST_MAX = 400;

export const isLibraryMessage = (t: string) => t.startsWith("lib");

export async function libraryMessage(m: any): Promise<Out> {
  let flash = "";
  const id = String(m.id ?? "");
  switch (m.type) {
    case "libPin":
      await L.pinPage(id, !!m.on);
      break;
    case "libDelete":
      if (await L.deletePage(id)) flash = "Forgot that page.";
      break;
    case "libLessonAdd": {
      const r = await L.addLesson({ text: String(m.text ?? ""), url: typeof m.url === "string" && /^https?:/.test(m.url) ? m.url : undefined, status: "yours" });
      flash = r ? (r.isNew ? "Added to the notebook." : "That one is already in the notebook.") : "A lesson needs a little more than that.";
      break;
    }
    case "libLessonEdit":
      await L.editLesson(id, { text: typeof m.text === "string" ? m.text : undefined, pinned: typeof m.pinned === "boolean" ? m.pinned : undefined, status: m.approve ? "yours" : undefined });
      break;
    case "libLessonDelete":
      await L.deleteLesson(id);
      break;
    case "libSettings":
      await L.saveSettings(Object.fromEntries(Object.entries({ save: m.save, lessons: m.lessons, recallFirst: m.recallFirst }).filter(([, v]) => typeof v === "boolean")));
      break;
    case "libTidy": {
      const n = await L.tidy();
      flash = n ? `Cleared ${n} long-stale page${n > 1 ? "s" : ""}.` : "Nothing is stale enough to clear yet.";
      break;
    }
    case "libForget": {
      const n = await L.forgetAll();
      flash = `Forgot ${n} page${n === 1 ? "" : "s"}. The notebook stays.`;
      break;
    }
    case "libPage": {
      const p = await L.pageById(id);
      if (!p) return { type: "libraryPage", id, missing: true };
      return { type: "libraryPage", id, url: p.url, title: p.title, text: p.text.slice(0, 20_000), more: Math.max(0, p.text.length - 20_000) };
    }
  }
  return snapshot(String(m.q ?? ""), flash);
}

export async function snapshot(q = "", flash = ""): Promise<Out> {
  const [pages, lessons, stats, settings, e] = await Promise.all([L.listPages(), L.loadLessons(), L.loadStats(), L.loadSettings(), embedder().catch(() => ({ e: null, why: "" }))]);
  let found: { id: string; passage: string; fresh: boolean }[] | null = null;
  let lessonHits: string[] | null = null;
  if (q.trim()) {
    const r = await L.recall(q, { k: 12 });
    found = r.hits.map((h) => ({ id: h.page.id, passage: h.passage.slice(0, 700), fresh: h.fresh }));
    lessonHits = (await L.relevantLessons(q, 12, { all: true })).map((l) => l.id);
  }
  const size = pages.reduce((n, p) => n + p.chars, 0);
  const s = L.saved(stats);
  return {
    type: "library",
    q,
    flash,
    pages: found ? found.map((f) => ({ ...pages.find((p) => p.id === f.id)!, passage: f.passage })).filter((p) => p.id) : pages.slice(0, LIST_MAX),
    total: pages.length,
    stale: pages.filter((p) => !p.fresh).length,
    chars: size,
    lessons: lessonHits ? lessonHits.map((id) => lessons.find((l) => l.id === id)!).filter(Boolean) : lessons.slice().sort((a, b) => b.at - a.at),
    lessonCount: lessons.length,
    stats,
    savedMs: Math.round(s.ms),
    avgSearch: Math.round(s.avgSearch),
    settings,
    meaning: e.e ? { model: e.e.model } : { why: e.why },
  };
}
