import { mkdir, readFile, writeFile, appendFile } from "node:fs/promises";
import { join } from "node:path";
import type { Message } from "../llm.ts";
import { maxxHome } from "../sessions.ts";
import type { Claim, ClaimStatus } from "./truth.ts";

// The lab as a discovery engine, not only a fact finder:
//   assumptions   the topic's core assumptions, each flipped ("what if friction helped?")
//   kinds         every study tests a rival, a wildcard (strange but testable), a
//                 flipped assumption and an idea borrowed from an unrelated field
//   contradictions where trusted sources disagree, chased in the follow-up rounds
//   debate        two advocates argue, scored only on the evidence they cite
//   horizon       a gap map of what is known and not, dated predictions to
//                 check later, cheap experiments with what is on your desk, and
//                 exactly what would change Maxx's mind
//   leads         a serendipity log: odd things seen in passing, outliers,
//                 gaps, overnight anomalies, kept to come back to
//   genealogy     ideas and studies remember where they came from

export type HKind = "rival" | "wildcard" | "flipped" | "borrowed";
export type Assumption = { text: string; flip: string };
export type MapNode = { label: string; state: "known" | "partly" | "gap"; cites: string[] };
export type Prediction = { id: string; study: string; made: string; due: string; text: string; check: string; confidence: number; status: "open" | "right" | "wrong"; settled?: string };
export type Experiment = { title: string; uses: string; how: string };
export type Lead = { id: string; at: string; text: string; kind: "odd" | "outlier" | "gap" | "anomaly" | "experiment"; source: string; question?: string };
export type Side = { h: string; text: string; points: { text: string; cites: string[]; score: number }[]; score: number };
export type Debate = { a: Side; b: Side; winner: "A" | "B" | "TIE"; why: string; judge: string };

const strip = (t: string) => t.replace(/<think>[\s\S]*?<\/think>/g, "").replace(/\*\*/g, "").trim();

export const HYPOTHESIS_KINDS =
  "Write them as a deliberately varied set:\n" +
  "- at least one RIVAL that would make the obvious answer wrong (another cause, chance, a faulty sensor),\n" +
  "- exactly one WILDCARD: a strange idea that still makes a testable prediction,\n" +
  "- one FLIPPED: take one of the assumptions below, suppose it is false, and say what follows,\n" +
  "- one BORROWED: how an unrelated field (biology, traffic, economics, ants, music...) would explain or solve this.\n" +
  "Start the line with the kind, e.g. H3: [wildcard] ... ; plain ones need no tag.";

export const ASSUMPTION_ASK = "Before the hypotheses, list the 2 or 3 core assumptions people make about this topic and flip each one, as lines:\nASSUMPTION: <assumption> | FLIP: <what if it were false>";

export function parseAssumptions(text: string): Assumption[] {
  return [...strip(text).matchAll(/^\W*ASSUMPTION\s*:\s*(.+?)\s*\|\s*FLIP\s*:\s*(.+)$/gim)].slice(0, 4).map((m) => ({ text: m[1]!.trim().slice(0, 200), flip: m[2]!.trim().slice(0, 200) }));
}

// "[wildcard] Bats..." or "(borrowed from ant colonies) ..." at the start of a hypothesis.
export function kindOf(text: string): { kind: HKind; text: string; field?: string } {
  const m = text.match(/^\s*[[(]\s*(rival|wild\s*-?card|flip(?:ped)?|borrow(?:ed)?)(?:\s+from\s+([^\])]+))?\s*[\])]\s*:?\s*(.*)$/i);
  if (!m) return { kind: "rival", text };
  const k = m[1]!.toLowerCase().replace(/\s|-/g, "");
  return { kind: k.startsWith("wild") ? "wildcard" : k.startsWith("flip") ? "flipped" : k.startsWith("borrow") ? "borrowed" : "rival", text: m[3]!.trim(), field: m[2]?.trim() };
}

// ---------- debate ----------

export function advocateMessages(question: string, h: { id: string; text: string }, other: { id: string; text: string }, evidence: string, ledger: string): Message[] {
  return [
    { role: "system", content: "You argue one side of a scientific debate. You may only use the evidence given; every point must cite it as [E#], [C#] or [H#]. Uncited points score nothing, and citing something that does not exist costs points." },
    { role: "user", content: `Question: ${question}\nYour side: ${h.id}: ${h.text}\nThe other side: ${other.id}: ${other.text}\n\nEvidence:\n${evidence.slice(0, 3000)}\n\nClaims:\n${ledger.slice(0, 3000)}\n\nMake your 3 strongest points, one per line starting with - , each citing evidence. Address the other side's best evidence in one of them.` },
  ];
}

const WEIGHT: Record<ClaimStatus, number> = { observed: 3, corroborated: 3, verified: 2, unverified: 0.5, contested: 0.5, opinion: 0, fabricated: -2 };

// Points are worth what they cite: measurements and confirmed facts most, opinions nothing, fakes less than nothing.
export function scoreSide(h: string, text: string, claims: Claim[], evidence: Set<string>, hypotheses: Set<string>): Side {
  const points = strip(text).split("\n").filter((l) => /^\s*[-*•]|\d+[.)]/.test(l)).slice(0, 5).map((l) => {
    const cites = [...new Set([...l.matchAll(/\[([ECH]\d+)\]/g)].map((m) => m[1]!))];
    let score = 0;
    for (const c of cites) {
      const claim = claims.find((x) => x.id === c);
      score += claim ? WEIGHT[claim.status] : evidence.has(c) ? 2 : hypotheses.has(c) ? 1 : -2;
    }
    return { text: l.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").slice(0, 400), cites, score: Math.round(Math.min(score, 6) * 10) / 10 };
  });
  return { h, text, points, score: Math.round(points.reduce((a, p) => a + p.score, 0) * 10) / 10 };
}

export function judgeMessages(question: string, a: Side, b: Side): Message[] {
  return [
    { role: "system", content: "You judge a scientific debate on evidence alone: what was measured and confirmed beats what was asserted. Style, confidence and length earn nothing." },
    { role: "user", content: `Question: ${question}\n\nSide A (${a.h}):\n${a.points.map((p) => `- ${p.text}`).join("\n")}\n\nSide B (${b.h}):\n${b.points.map((p) => `- ${p.text}`).join("\n")}\n\nReply in two lines:\nWINNER: A, B or TIE\nWHY: <one sentence on whose evidence is stronger>` },
  ];
}

export function parseJudge(text: string, a: Side, b: Side): { winner: "A" | "B" | "TIE"; why: string } {
  const t = strip(text);
  const w = t.match(/WINNER\s*:\s*(A|B|TIE)\b/i)?.[1]?.toUpperCase() as "A" | "B" | "TIE" | undefined;
  const why = t.match(/WHY\s*:\s*(.+)/i)?.[1]?.trim() ?? "";
  // No clear verdict: the evidence score decides.
  return { winner: w ?? (a.score > b.score ? "A" : b.score > a.score ? "B" : "TIE"), why: why.slice(0, 300) || "decided by the evidence scores" };
}

// ---------- horizon: gap map, predictions, experiments, what would change my mind ----------

export function horizonMessages(question: string, answer: string, ledger: string, instruments: string, today: string): Message[] {
  return [
    { role: "system", content: "You look past a finished study: what is known, what nobody has checked, what to predict and how to test it cheaply. You are concrete and honest." },
    {
      role: "user",
      content:
        `Question: ${question}\n\nConclusion:\n${answer.slice(0, 2500)}\n\nClaims:\n${ledger.slice(0, 2500)}\n\nInstruments on this desk:\n${instruments}\n\nToday is ${today}. Reply with lines only:\n` +
        "KNOWN: <2-6 word topic> [C#/E#]   (3 to 6 lines: what the evidence settles)\n" +
        "PARTLY: <2-6 word topic>          (1 to 3 lines: half-known)\n" +
        "GAP: <2-6 word topic> - <why it matters>   (2 to 4 lines: what nobody here measured or found)\n" +
        "PREDICT: by <YYYY-MM-DD>: <a specific, checkable prediction> | check: <how to check it> | confidence: <0-100>%   (1 to 3 lines)\n" +
        "EXPERIMENT: <short title> | uses: <instrument ids from the list> | how: <steps a person can do today for free>   (2 or 3 lines)\n" +
        "CHANGE MY MIND: <the exact observation that would overturn the conclusion>   (1 or 2 lines)",
    },
  ];
}

export function parseHorizon(text: string, studyId: string, now = new Date()): { map: MapNode[]; predictions: Prediction[]; experiments: Experiment[]; changeMind: string[]; gaps: string[] } {
  const t = strip(text);
  const map: MapNode[] = [];
  const gaps: string[] = [];
  for (const m of t.matchAll(/^\W*(KNOWN|PARTLY|GAP)\s*:\s*(.+)$/gim)) {
    const body = m[2]!.trim();
    const cites = [...body.matchAll(/\b([ECH]\d+)\b/g)].map((x) => x[1]!);
    const label = body.replace(/\[[^\]]*\]/g, "").split(/\s+[-—–]\s+/)[0]!.trim().slice(0, 48);
    if (!label) continue;
    const state = m[1]!.toLowerCase() as MapNode["state"];
    map.push({ label, state, cites });
    if (state === "gap") gaps.push(body.replace(/\[[^\]]*\]/g, "").trim());
  }
  const predictions: Prediction[] = [];
  for (const m of t.matchAll(/^\W*PREDICT\s*:\s*(?:by\s+)?(\d{4}-\d{2}-\d{2})\s*:?\s*(.+?)(?:\s*\|\s*check\s*:\s*(.+?))?(?:\s*\|\s*confidence\s*:\s*(\d+))?\s*%?\s*$/gim)) {
    predictions.push({ id: `${studyId}-p${predictions.length + 1}`, study: studyId, made: now.toISOString(), due: m[1]!, text: m[2]!.trim().slice(0, 300), check: (m[3] ?? "").trim().slice(0, 300), confidence: Math.min(99, Math.max(1, Number(m[4] ?? 60))), status: "open" });
  }
  const experiments = [...t.matchAll(/^\W*EXPERIMENT\s*:\s*(.+?)\s*\|\s*uses\s*:\s*(.+?)\s*\|\s*how\s*:\s*(.+)$/gim)].slice(0, 3).map((m) => ({ title: m[1]!.trim().slice(0, 100), uses: m[2]!.trim().slice(0, 100), how: m[3]!.trim().slice(0, 400) }));
  const changeMind = [...t.matchAll(/^\W*CHANGE MY MIND\s*:\s*(.+)$/gim)].slice(0, 2).map((m) => m[1]!.trim().slice(0, 300));
  return { map, predictions, experiments, changeMind, gaps };
}

// ---------- the serendipity log and the prediction ledger ----------

const researchHome = () => join(maxxHome(), "research");
export const leadsFile = () => join(researchHome(), "leads.jsonl");
export const predictionsFile = () => join(researchHome(), "predictions.json");

export async function addLeads(leads: Omit<Lead, "id" | "at">[]) {
  if (!leads.length) return;
  await mkdir(researchHome(), { recursive: true });
  const now = new Date().toISOString();
  await appendFile(leadsFile(), leads.map((l, i) => JSON.stringify({ ...l, id: `${Date.now().toString(36)}${i}`, at: now })).join("\n") + "\n");
}
export async function listLeads(max = 60): Promise<Lead[]> {
  const raw = await readFile(leadsFile(), "utf8").catch(() => "");
  return raw.trim().split("\n").filter(Boolean).map((l) => JSON.parse(l) as Lead).slice(-max).reverse();
}

export async function loadPredictions(): Promise<Prediction[]> {
  try {
    return JSON.parse(await readFile(predictionsFile(), "utf8")) as Prediction[];
  } catch {
    return [];
  }
}
export async function savePredictions(p: Prediction[]) {
  await mkdir(researchHome(), { recursive: true });
  await writeFile(predictionsFile(), JSON.stringify(p, null, 2));
}
export async function addPredictions(p: Prediction[]) {
  if (p.length) await savePredictions([...(await loadPredictions()), ...p]);
}
export async function settlePrediction(id: string, right: boolean): Promise<Prediction[]> {
  const all = await loadPredictions();
  const p = all.find((x) => x.id === id);
  if (p) Object.assign(p, { status: right ? "right" : "wrong", settled: new Date().toISOString() });
  await savePredictions(all);
  return all;
}
// Maxx's track record: how often it was right, and the Brier score (0 is perfect, 0.25 is a coin flip).
export function trackRecord(p: Prediction[]): { settled: number; right: number; brier: number | null; due: number } {
  const done = p.filter((x) => x.status !== "open");
  const brier = done.length ? done.reduce((a, x) => a + (x.confidence / 100 - (x.status === "right" ? 1 : 0)) ** 2, 0) / done.length : null;
  const today = new Date().toISOString().slice(0, 10);
  return { settled: done.length, right: done.filter((x) => x.status === "right").length, brier: brier === null ? null : Math.round(brier * 1000) / 1000, due: p.filter((x) => x.status === "open" && x.due <= today).length };
}

// Outliers in a reading (beyond 4 standard deviations of the rest): worth a second look.
export function outliers(rows: Record<string, number>[], keys: string[]): string[] {
  const out: string[] = [];
  for (const k of keys.filter((k) => k !== "t")) {
    const v = rows.map((r) => r[k]).filter((x): x is number => Number.isFinite(x));
    if (v.length < 12) continue;
    const mean = v.reduce((a, b) => a + b, 0) / v.length;
    const sd = Math.sqrt(v.reduce((a, b) => a + (b - mean) ** 2, 0) / (v.length - 1));
    if (!sd) continue;
    const hit = rows.find((r) => Number.isFinite(r[k]) && Math.abs(r[k]! - mean) / sd > 4);
    if (hit) out.push(`${k} spiked to ${+hit[k]!.toPrecision(4)} at t=${hit.t} (mean ${+mean.toPrecision(4)}, ${(Math.abs(hit[k]! - mean) / sd).toFixed(1)} sd away)`);
  }
  return out;
}

// ---------- pictures for the notebook ----------

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

// The gap map: the question in the middle, the known around it, the gaps glowing at the edge.
export function gapMapSvg(question: string, map: MapNode[]): string {
  if (!map.length) return "";
  const W = 820, H = 420, cx = W / 2, cy = H / 2;
  const ring = { known: 120, partly: 165, gap: 200 };
  const nodes = map.map((n, i) => {
    const a = (i / map.length) * Math.PI * 2 - Math.PI / 2;
    const r = ring[n.state];
    return { ...n, x: cx + Math.cos(a) * r * 1.7, y: cy + Math.sin(a) * r * 0.85 };
  });
  const lines = nodes.map((n) => `<line x1="${cx}" y1="${cy}" x2="${n.x.toFixed(0)}" y2="${n.y.toFixed(0)}" class="ln ${n.state}"/>`).join("");
  const dots = nodes.map((n) => {
    const w = Math.max(70, n.label.length * 6.6 + 18);
    return `<g class="node ${n.state}"><rect x="${(n.x - w / 2).toFixed(0)}" y="${(n.y - 13).toFixed(0)}" width="${w.toFixed(0)}" height="26" rx="13"/><text x="${n.x.toFixed(0)}" y="${(n.y + 4).toFixed(0)}">${esc(n.label)}</text></g>`;
  }).join("");
  const q = question.length > 46 ? question.slice(0, 44) + "…" : question;
  return `<svg class="gapmap" viewBox="0 0 ${W} ${H}" role="img" aria-label="Map of what is known and unknown"><defs><filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>${lines}<g class="center"><circle cx="${cx}" cy="${cy}" r="58"/><foreignObject x="${cx - 54}" y="${cy - 30}" width="108" height="60"><div xmlns="http://www.w3.org/1999/xhtml" class="cq">${esc(q)}</div></foreignObject></g>${dots}</svg>`;
}

// The idea tree: evidence → hypotheses (by what they cite) → verdicts; where the study came from on top.
export function ideaTreeSvg(o: { question: string; parent?: string; evidence: { id: string; icon: string; title: string }[]; hypotheses: { id: string; text: string; status: string; because?: string[]; kind?: string; posterior?: number; prior: number }[] }): string {
  if (!o.hypotheses.length) return "";
  const rowH = 34, top = o.parent ? 64 : 24;
  const H = top + Math.max(o.evidence.length, o.hypotheses.length) * rowH + 20, W = 820;
  const ey = (i: number) => top + i * rowH + 14, hy = (i: number) => top + i * rowH + 14;
  const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
  const edges: string[] = [];
  o.hypotheses.forEach((h, i) => (h.because ?? []).forEach((b) => {
    const j = o.evidence.findIndex((e) => e.id === b);
    if (j >= 0) edges.push(`<path class="edge" d="M 250 ${ey(j)} C 330 ${ey(j)}, 330 ${hy(i)}, 410 ${hy(i)}"/>`);
  }));
  const ev = o.evidence.map((e, i) => `<g class="enode"><rect x="10" y="${ey(i) - 12}" width="240" height="24" rx="6"/><text x="20" y="${ey(i) + 4}">${esc(`${e.icon} ${e.id} ${cut(e.title, 28)}`)}</text></g>`).join("");
  const hs = o.hypotheses.map((h, i) => `<g class="hnode ${h.status} ${h.kind ?? ""}"><rect x="410" y="${hy(i) - 12}" width="400" height="24" rx="12"/><text x="422" y="${hy(i) + 4}">${esc(`${h.id}${h.kind && h.kind !== "rival" ? ` [${h.kind}]` : ""} ${cut(h.text, 40)} · ${Math.round(h.posterior ?? h.prior)}%`)}</text></g>`).join("");
  const parent = o.parent ? `<g class="pnode"><rect x="10" y="8" width="800" height="28" rx="8"/><text x="20" y="27">${esc(`↳ grew from: ${cut(o.parent, 100)}`)}</text></g>` : "";
  return `<svg class="tree" viewBox="0 0 ${W} ${H}" role="img" aria-label="How the ideas connect">${parent}${edges.join("")}${ev}${hs}</svg>`;
}
