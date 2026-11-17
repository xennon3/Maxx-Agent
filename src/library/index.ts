// What the model sees when an answer comes from the library instead of the web.

import { ago, KIND_SAY } from "./fresh.ts";
import type { Lesson } from "./lessons.ts";
import type { Recalled } from "./store.ts";

export * from "./store.ts";
export * from "./lessons.ts";
export { classify, isFresh, timeSensitive, ago, KIND_ICON, KIND_SAY, FRESH_DAYS, type Kind } from "./fresh.ts";

const host = (u: string) => {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
};

export function formatRecall(hits: Recalled[], lessons: Lesson[], o: { budget?: number; now?: number } = {}): string {
  const budget = o.budget ?? 3200;
  const now = o.now ?? Date.now();
  const per = Math.max(500, Math.floor((budget - 300) / Math.max(1, hits.length)));
  const blocks = hits.map((h, i) => {
    const age = `${KIND_SAY[h.page.kind]}, saved ${ago(h.page.savedAt, now)}${h.page.pinned ? ", 📌 pinned" : h.fresh ? "" : ", may be out of date"}`;
    const text = h.passage.length > per ? h.passage.slice(0, per).replace(/\s\S*$/, "") + " …" : h.passage;
    return `[L${i + 1}] ${h.page.title.slice(0, 110)} — ${host(h.page.url)} (${age})\n${h.page.url}\n${text}`;
  });
  const notes = lessons.length ? `\n\nLessons in your notebook:\n${lessons.map((l) => `- ${l.text}${l.url ? ` <${l.url}>` : ""}`).join("\n")}` : "";
  return blocks.join("\n\n") + notes;
}
