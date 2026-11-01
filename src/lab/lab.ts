import { mkdir, readFile, readdir, writeFile, appendFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { Agent } from "../loop.ts";
import type { LLMConfig, Message } from "../llm.ts";
import type { Image } from "../image.ts";
import { imagePart } from "../vision.ts";
import { judgeLLM } from "../judge.ts";
import { maxxHome } from "../sessions.ts";
import { toCSV, series } from "./data.ts";
import { ICON, menu, parseArgs, type Instrument, type Kind } from "./instruments.ts";
import { extractCode, runTest, runtimes, type Runtime, type TestRun } from "./sandbox.ts";
import { reportHtml, reportMarkdown } from "./report.ts";
import { applyCrossCheck, audit, auditNote, crossCheckMessages, ledger, parseCrossCheck, parseFacts, RULES, verify, type Audit, type Claim } from "./truth.ts";

// The research lab. A question goes round a small scientific loop:
//
//   frame      sharpen the question, pick instruments, plan the readings
//   collect    web pages, COM-port sensors, camera, mic, files, custom commands
//   hypothesize  2-4 rival explanations, each with a prediction and a prior
//   test       one script per hypothesis, run in a sandbox against the data
//              (or a simulation when there is no data); broken scripts go back
//   follow up  still unsure? plan more readings and test again (rounds)
//   review     a skeptic (a second model when there is one) finds the weak spots
//   conclude   the answer, with confidence, citations and next experiments
//   fact-check the conclusion's numbers and citations against the evidence
//
// Every fact goes into a claim ledger (truth.ts) tagged observed, verified,
// corroborated, opinion, unverified, contested or fabricated, checked against
// the pages actually fetched and against each other. Hypotheses must cite
// what they rest on; the judge never sees the prior, so it cannot anchor on it.
//
// Every phase is a short one-off request with a line-by-line answer format,
// which small local models follow far better than one long tool-calling run.
// Everything lands in .maxx/research/<id>: data CSVs, test scripts, the
// instrument log, REPORT.md and a self-contained report.html notebook.

export type LabSettings = {
  // Collect → test rounds; later rounds chase what is still inconclusive.
  rounds: number;
  // Most hypotheses drafted.
  hypotheses: number;
  // Most instrument readings per round.
  readings: number;
  // Hypotheses tested at the same time (LM Studio serves up to 4 at once).
  parallel: number;
  // Time limit for one test script.
  testSeconds: number;
  // Times a failing script goes back to the model.
  fixes: number;
  // A skeptical review before the conclusion.
  skeptic: boolean;
  // Default listening time for serial ports.
  serialSeconds: number;
};

export const LAB_DEFAULTS: LabSettings = { rounds: 2, hypotheses: 3, readings: 5, parallel: 1, testSeconds: 60, fixes: 2, skeptic: true, serialSeconds: 10 };
const LIMITS: Record<Exclude<keyof LabSettings, "skeptic">, [number, number]> = { rounds: [1, 4], hypotheses: [1, 6], readings: [1, 12], parallel: [1, 4], testSeconds: [5, 600], fixes: [0, 4], serialSeconds: [1, 300] };

export const labFile = () => join(maxxHome(), "lab.json");
export function cleanLab(raw: Record<string, unknown>): Partial<LabSettings> {
  const out: Partial<LabSettings> = {};
  for (const [k, [lo, hi]] of Object.entries(LIMITS) as [keyof typeof LIMITS, [number, number]][]) {
    const v = raw[k];
    if (v === undefined || v === null || v === "") continue;
    const n = Math.round(Number(v));
    if (Number.isFinite(n)) out[k] = Math.min(hi, Math.max(lo, n));
  }
  if (typeof raw.skeptic === "boolean") out.skeptic = raw.skeptic;
  return out;
}
export async function loadLab(): Promise<Partial<LabSettings>> {
  try {
    return cleanLab(JSON.parse(await readFile(labFile(), "utf8")));
  } catch {
    return {};
  }
}
export async function saveLab(s: Partial<LabSettings>) {
  await mkdir(maxxHome(), { recursive: true });
  await writeFile(labFile(), JSON.stringify(cleanLab(s as Record<string, unknown>), null, 2) + "\n");
}
export const labSettings = (saved: Partial<LabSettings> = {}): LabSettings => ({ ...LAB_DEFAULTS, ...saved });

export type Phase = "framing" | "collecting" | "hypothesizing" | "testing" | "reviewing" | "concluding" | "done" | "stopped" | "failed";
export type Evidence = {
  id: string;
  instrument: string;
  kind: Kind;
  icon: string;
  title: string;
  // What the model read (facts, statistics, a description).
  text: string;
  at: string;
  round: number;
  data?: string;
  keys?: string[];
  files?: string[];
  series?: { name: string; values: number[] }[];
  images?: string[];
  urls?: string[];
  error?: string;
};
export type LogEntry = { at: string; instrument: string; args: string; approval: "not needed" | "you" | "saved rule" | "denied" | "unavailable"; ms: number; ok: boolean; note: string };
export type HStatus = "untested" | "testing" | "supported" | "refuted" | "inconclusive" | "error";
export type Hypothesis = {
  id: string; text: string; predicts: string; test: string; prior: number; posterior?: number; status: HStatus; why?: string; script?: string; lang?: string; output?: string; metrics?: Record<string, number>; tries: number; round?: number;
  // The evidence and claims it rests on; none means it is speculative (allowed, but labelled and its prior capped).
  because?: string[];
  speculative?: boolean;
  // A perspective added in a later round that nobody had considered.
  wildcard?: boolean;
  // Confidence after each test, starting with the prior: truth may move.
  trail?: number[];
};
export type PlanItem = { instrument: string; args: string };
export type Study = {
  id: string;
  question: string;
  sharpened?: string;
  measure?: string;
  state: Phase;
  round: number;
  rounds: number;
  plan: PlanItem[];
  evidence: Evidence[];
  hypotheses: Hypothesis[];
  claims: Claim[];
  audit?: Audit;
  log: LogEntry[];
  skeptic?: string;
  skepticModel?: string;
  answer?: string;
  confidence?: number;
  dir: string;
  started: string;
  finished?: string;
  model: string;
  note?: string;
};

export type StudyEvents = { study(s: Study): void; image?(label: string, images: Image[]): void };
export type StudyOptions = { settings: LabSettings; instruments: Instrument[]; signal?: AbortSignal; runtime?: Runtime; now?: Date };

export function studyId(question: string, now = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  const slug = question.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").split("-").slice(0, 5).join("-") || "study";
  return `${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}-${p(now.getHours())}${p(now.getMinutes())}${p(now.getSeconds())}-${slug}`;
}

// ---------- prompts and the parsers for their answers ----------

const strip = (t: string) => t.replace(/<think>[\s\S]*?<\/think>/g, "").replace(/\*\*/g, "").trim();

export function frameMessages(question: string, instruments: Instrument[], max: number, now = new Date()): Message[] {
  return [
    { role: "system", content: `You run a small research lab. You turn a question into a measurable one and plan how to collect data. Today is ${now.toISOString().slice(0, 10)}.` },
    {
      role: "user",
      content:
        `Question: ${question}\n\nInstruments you can use:\n${menu(instruments)}\n\n` +
        "Reply in this format and nothing else:\n" +
        "QUESTION: <the question made specific and measurable>\n" +
        "MEASURE: <what numbers or facts would answer it>\n" +
        `then 1 to ${max} readings, one per line, as: number. instrument | arguments\n` +
        "Use only instruments that are available. Prefer real measurements when an instrument can take them; use web for background facts and published numbers.\n" +
        "Example:\nQUESTION: Does my desk get warmer in the afternoon sun?\nMEASURE: temperature over time next to the light level\n1. serial:COM3 | seconds=30\n2. web | how much does direct sunlight heat a room per hour",
    },
  ];
}

export function parseFrame(text: string, instruments: Instrument[], max: number): { question?: string; measure?: string; plan: PlanItem[]; dropped: string[] } {
  const t = strip(text);
  const question = t.match(/^\W*QUESTION\s*:\s*(.+)$/im)?.[1]?.trim();
  const measure = t.match(/^\W*MEASURE\s*:\s*(.+)$/im)?.[1]?.trim();
  return { question, measure, ...parsePlan(t, instruments, max) };
}

export function parsePlan(text: string, instruments: Instrument[], max: number): { plan: PlanItem[]; dropped: string[] } {
  const plan: PlanItem[] = [];
  const dropped: string[] = [];
  const ids = instruments.map((i) => i.id);
  for (const raw of strip(text).split("\n")) {
    const line = raw.trim().replace(/^(?:\d+[.)]|[-*•])\s*/, "");
    const m = line.match(/^`?([\w.:/\\-]+)`?\s*(?:\||:|—|-)\s*(.*)$/);
    if (!m || /^(QUESTION|MEASURE|NONE)$/i.test(m[1]!)) continue;
    // "COM3" for "serial:COM3", "webcam" for "camera", any case.
    const want = m[1]!.toLowerCase();
    const id = ids.find((i) => i.toLowerCase() === want) ?? ids.find((i) => i.toLowerCase() === `serial:${want}`) ?? ({ webcam: "camera", photo: "camera", microphone: "mic", audio: "mic", search: "web", internet: "web", csv: "file" } as Record<string, string>)[want];
    if (!id) {
      if (raw.trim() !== line || /\|/.test(line)) dropped.push(m[1]!);
      continue;
    }
    plan.push({ instrument: id, args: m[2]!.trim() });
    if (plan.length >= max) break;
  }
  return { plan, dropped };
}

const claimBlock = (s: Study) => (s.claims.length ? `\n\nClaim ledger (status says how far each can be trusted):\n${ledger(s.claims)}` : "");
const evidenceBlock = (ev: Evidence[], max = 1400) =>
  ev.map((e) => `${e.id} [${e.instrument}] ${e.title}${e.error ? ` (failed: ${e.error})` : ""}:\n${e.text.slice(0, max)}${e.data ? `\nData file: ${e.data} (columns: t,${(e.keys ?? []).join(",")})` : ""}`).join("\n\n");

export function hypothesisMessages(s: Study, max: number): Message[] {
  return [
    { role: "system", content: "You are the scientist in a small research lab. You propose hypotheses that a short script can test against the collected data, or with a simulation built from the facts." },
    {
      role: "user",
      content:
        `Question: ${s.sharpened ?? s.question}\n${s.measure ? `What would answer it: ${s.measure}\n` : ""}\nEvidence so far:\n${evidenceBlock(s.evidence)}${claimBlock(s)}\n\n` +
        `Write 2 to ${max} hypotheses, one per line, as:\nH1: <claim> | predicts: <what we would see in the data or a simulation> | test: <how a short script checks it> | because: <the E# and C# it rests on> | prior: <0-100>%\n` +
        "Make them rivals: include at least one that would make the obvious answer wrong (another cause, chance, a faulty sensor). Ground each one in evidence with because:. A hypothesis with nothing to rest on is allowed if it is genuinely worth testing, but write because: none. Base the prior on the strength of that evidence, not on what sounds likely. Reply with the lines only.",
    },
  ];
}

export function parseHypotheses(text: string, max: number): Omit<Hypothesis, "status" | "tries">[] {
  const out: Omit<Hypothesis, "status" | "tries">[] = [];
  for (const raw of strip(text).split("\n")) {
    const line = raw.trim();
    const m = line.match(/^(?:[-*•]\s*)?(?:H(?:ypothesis)?\s*)?(\d+)\s*[:.)]\s*(.+)$/i);
    if (!m) continue;
    const parts = m[2]!.split(/\s*\|\s*/);
    const field = (name: RegExp) => parts.find((p) => name.test(p))?.replace(name, "").trim() ?? "";
    const claim = parts.find((p) => !/^(predicts?|test|prior|because|evidence)\s*:/i.test(p))?.trim() ?? "";
    if (claim.length < 4) continue;
    const prior = Number(field(/^prior\s*:\s*/i).match(/(\d+(?:\.\d+)?)/)?.[1] ?? NaN);
    out.push({
      id: `H${out.length + 1}`,
      text: claim.slice(0, 300),
      predicts: field(/^predicts?\s*:\s*/i).slice(0, 300),
      test: field(/^test\s*:\s*/i).slice(0, 300),
      prior: Number.isFinite(prior) ? Math.max(1, Math.min(99, prior <= 1 && /\./.test(String(prior)) ? prior * 100 : prior)) : 50,
      because: [...field(/^(?:because|evidence)\s*:\s*/i).matchAll(/\b[EC]\d+\b/g)].map((x) => x[0]),
    });
    if (out.length >= max) break;
  }
  return out;
}

export function testMessages(s: Study, h: Hypothesis, lang: "python" | "js"): Message[] {
  const files = s.evidence.filter((e) => e.data).map((e) => `- ${e.data}: columns t,${(e.keys ?? []).join(",")} (t in seconds; ${e.title})`).join("\n");
  const L = lang === "python" ? "Python 3 (standard library; numpy only inside try/except ImportError)" : "JavaScript for Bun (use require('fs') to read files)";
  return [
    { role: "system", content: `You write short, self-contained test scripts for a research lab, in ${L}. You never invent measurements: you compute from the data files, or you simulate and say what you assumed.` },
    {
      role: "user",
      content:
        `Question: ${s.sharpened ?? s.question}\nHypothesis ${h.id}: ${h.text}\n${h.predicts ? `It predicts: ${h.predicts}\n` : ""}${h.test ? `Planned test: ${h.test}\n` : ""}\n` +
        (files ? `Data files (CSV with a header row, paths relative to the working folder):\n${files}\n\n` : "There are no data files; test it with a calculation or simulation from the facts below.\n\n") +
        `Facts collected:\n${evidenceBlock(s.evidence, 700)}\n\n` +
        "Write one script that tests the hypothesis. Print the important numbers as lines like: METRIC name=value\n" +
        "The last line printed must be RESULT: SUPPORTED, RESULT: REFUTED or RESULT: INCONCLUSIVE, then a dash and one sentence why. Use INCONCLUSIVE when the data cannot tell.\n" +
        `Keep it under 60 lines. Reply with the code in one \`\`\`${lang === "python" ? "python" : "js"} block.`,
    },
  ];
}

export function interpretMessages(h: Hypothesis, run: TestRun): Message[] {
  return [
    { role: "system", content: "You read the output of a test script and judge a hypothesis. You judge from the output alone: strong evidence earns high or low confidence, weak or tiny samples stay near 50%. An output that assumed its numbers instead of measuring them is weak evidence." },
    {
      role: "user",
      content:
        `Hypothesis ${h.id}: ${h.text}\n\nTest output:\n${run.output.slice(-2500)}\n\n` +
        "Reply in exactly three lines:\nVERDICT: supported, refuted or inconclusive\nCONFIDENCE: <0-100>% that the hypothesis is true now\nWHY: <one sentence that cites the numbers>",
    },
  ];
}

export function parseInterpretation(text: string, fallback: TestRun, prior: number): { status: HStatus; posterior: number; why: string } {
  const t = strip(text);
  const v = t.match(/VERDICT\s*:\s*(supported|refuted|inconclusive)/i)?.[1]?.toLowerCase() as HStatus | undefined;
  const c = Number(t.match(/CONFIDENCE\s*:\s*(\d+(?:\.\d+)?)/i)?.[1] ?? NaN);
  const why = t.match(/WHY\s*:\s*(.+)/i)?.[1]?.trim() ?? fallback.verdict?.why ?? "";
  const status = v ?? fallback.verdict?.result ?? "inconclusive";
  // Without a number, nudge the prior the way the verdict points.
  const posterior = Number.isFinite(c) ? Math.max(0, Math.min(100, c)) : status === "supported" ? Math.min(95, prior + 25) : status === "refuted" ? Math.max(5, prior - 30) : prior;
  return { status, posterior, why: why.slice(0, 300) };
}

export function followupMessages(s: Study, instruments: Instrument[], max: number): Message[] {
  const open = s.hypotheses.filter((h) => h.status === "inconclusive" || h.status === "error");
  return [
    { role: "system", content: "You run a small research lab. You decide what extra data would settle open hypotheses." },
    {
      role: "user",
      content:
        `Question: ${s.sharpened ?? s.question}\nStill open:\n${open.map((h) => `${h.id}: ${h.text} (${h.status}${h.why ? `: ${h.why}` : ""})`).join("\n")}\n\nEvidence so far:\n${evidenceBlock(s.evidence, 400)}\n\n` +
        `Instruments:\n${menu(instruments)}\n\n` +
        `List 1 to ${max} more readings that would settle them, one per line, as: number. instrument | arguments (longer recordings, a different condition, a better search, a source that could prove the leading idea wrong). If nothing more can be measured, reply NONE.\n` +
        "Then, to stay open-minded, you may add one line for an explanation nobody has considered yet:\nWILDCARD: <claim> | predicts: <...> | test: <...> | because: <E#/C# or none> | prior: <0-100>%",
    },
  ];
}

export function skepticMessages(s: Study): Message[] {
  return [
    { role: "system", content: "You are a skeptical peer reviewer. You look for the weakest link in a study: confounders, too little data, a sensor that may be wrong, a test that checks the wrong thing, sources that disagree, opinions treated as facts, a conclusion that goes further than the evidence. You are brief and concrete." },
    {
      role: "user",
      content:
        `Question: ${s.sharpened ?? s.question}\n\nEvidence:\n${evidenceBlock(s.evidence, 500)}${claimBlock(s)}\n\nHypotheses after testing:\n${s.hypotheses.map((h) => `${h.id}: ${h.text} → ${h.status}, ${Math.round(h.prior)}% → ${Math.round(h.posterior ?? h.prior)}%${h.why ? ` (${h.why})` : ""}`).join("\n")}\n\n` +
        "List at most 3 weaknesses as lines starting with - . Then one line: WOULD CHANGE MY MIND: <the one observation that would flip the conclusion>.",
    },
  ];
}

export function concludeMessages(s: Study): Message[] {
  return [
    { role: "system", content: `You write the conclusion of a small research study for a curious non-expert. Plain words, numbers where they matter, and honest about uncertainty. Cite evidence as [E1], claims as [C3] and hypotheses as [H2]. ${RULES}` },
    {
      role: "user",
      content:
        `Question: ${s.question}\n${s.sharpened && s.sharpened !== s.question ? `Made measurable as: ${s.sharpened}\n` : ""}\nEvidence:\n${evidenceBlock(s.evidence, 600)}${claimBlock(s)}\n\n` +
        `Hypotheses after testing:\n${s.hypotheses.map((h) => `${h.id}: ${h.text} → ${h.status}, confidence ${Math.round(h.prior)}% → ${Math.round(h.posterior ?? h.prior)}%${h.why ? `. ${h.why}` : ""}${h.metrics && Object.keys(h.metrics).length ? ` [${Object.entries(h.metrics).map(([k, v]) => `${k}=${v}`).join(", ")}]` : ""}`).join("\n")}\n` +
        (s.skeptic ? `\nA reviewer said:\n${s.skeptic}\n` : "") +
        "\nWrite markdown with exactly these five sections:\n## Answer\n2 to 4 sentences that answer the question, ending with: Overall confidence: <0-100>%\n## Findings\n3 to 6 bullets, each citing [E#], [C#] or [H#]\n## Strongest other view\nThe best case for a different answer, fairly put, and what evidence would make it win\n## Caveats\n1 to 3 bullets\n## Next experiments\n2 or 3 bullets: what to measure next and with which instrument",
    },
  ];
}

// ---------- the loop ----------

export async function runStudy(agent: Agent, question: string, events: StudyEvents, o: StudyOptions): Promise<Study> {
  const set = o.settings;
  const now = o.now ?? new Date();
  const id = studyId(question, now);
  const dir = join(agent.cwd, ".maxx", "research", id);
  const s: Study = { id, question, state: "framing", round: 0, rounds: set.rounds, plan: [], evidence: [], hypotheses: [], claims: [], log: [], dir, started: now.toISOString(), model: agent.llm.model };
  agent.lab = s;
  const emit = () => events.study(structuredClone(s));
  const save = () => writeFile(join(dir, "study.json"), JSON.stringify(s, null, 2)).catch(() => {});
  emit();
  await mkdir(join(dir, "data"), { recursive: true });
  await mkdir(join(dir, "tests"), { recursive: true });
  await mkdir(join(dir, "raw"), { recursive: true });
  const runtime = o.runtime ?? runtimes()[0]!;
  const usable = o.instruments;
  try {
    const f = parseFrame(await agent.think(frameMessages(question, usable, set.readings, now), o.signal), usable, set.readings);
    s.sharpened = f.question;
    s.measure = f.measure;
    s.plan = f.plan;
    if (f.dropped.length) agent.note(`(lab: no instrument called ${f.dropped.join(", ")}; skipped)`);
    // A plan with nothing usable still gets the web when it is there.
    if (!s.plan.some((p) => !usable.find((i) => i.id === p.instrument)?.unavailable)) {
      const web = usable.find((i) => i.id === "web" && !i.unavailable);
      if (web) s.plan.push({ instrument: "web", args: s.sharpened ?? question });
    }
    emit();

    for (s.round = 1; s.round <= set.rounds; s.round++) {
      s.state = "collecting";
      emit();
      for (const item of s.plan) await collect(agent, s, item, usable, events, emit, o.signal, set);
      await crossCheck(agent, s, o.signal);
      emit();
      await save();

      if (!s.hypotheses.length) {
        s.state = "hypothesizing";
        emit();
        const hs = parseHypotheses(await agent.think(hypothesisMessages(s, set.hypotheses), o.signal), set.hypotheses);
        s.hypotheses = (hs.length ? hs : [{ id: "H1", text: s.sharpened ?? question, predicts: "", test: "", prior: 50 }]).map((h) => ground(s, { ...h, status: "untested" as const, tries: 0 }));
        emit();
      }

      s.state = "testing";
      const todo = s.hypotheses.filter((h) => h.status === "untested" || h.status === "inconclusive" || h.status === "error");
      for (const h of todo) h.status = "untested";
      emit();
      await pool(todo, set.parallel, (h) => testOne(agent, s, h, runtime, set, emit, o.signal));
      await save();

      const open = s.hypotheses.some((h) => h.status === "inconclusive" || h.status === "error");
      if (!open || s.round >= set.rounds) break;
      const fu = await agent.think(followupMessages(s, usable, set.readings), o.signal);
      const next = parsePlan(fu.replace(/^.*WILDCARD.*$/gim, ""), usable, set.readings).plan;
      const wild = fu.match(/^\W*WILDCARD\s*:\s*(.+)$/im)?.[1];
      if (wild) {
        const [w] = parseHypotheses(`H1: ${wild}`, 1);
        if (w) {
          s.hypotheses.push(ground(s, { ...w, id: `H${s.hypotheses.length + 1}`, status: "inconclusive", tries: 0, wildcard: true }));
          agent.note(`(lab: a new perspective to test: ${w.text})`);
        }
      }
      if (!next.length && !wild) break;
      s.plan = next;
      agent.note(`(lab: round ${s.round + 1}, ${next.length} more reading${next.length > 1 ? "s" : ""} for what is still open)`);
    }
    s.round = Math.min(s.round, set.rounds);

    if (set.skeptic) {
      s.state = "reviewing";
      emit();
      const second = secondOpinion(agent);
      try {
        s.skeptic = strip(await agent.think(skepticMessages(s), o.signal, second ?? undefined)).slice(0, 1500);
        s.skepticModel = (second ?? agent.llm).model;
      } catch (e) {
        if ((e as Error).name === "AbortError") throw e;
        agent.note(`(lab: the review failed: ${(e as Error).message})`);
      }
      emit();
    }

    s.state = "concluding";
    emit();
    s.answer = strip(await agent.think(concludeMessages(s), o.signal));
    // Fact-check the conclusion; anything invented goes back once.
    const corpus = corpusOf(s);
    const known = new Set([...s.evidence.map((e) => e.id), ...s.hypotheses.map((h) => h.id), ...s.claims.map((c) => c.id)]);
    let a = audit(s.answer, corpus, known);
    let revised = false;
    if (!a.ok) {
      const fixed = strip(await agent.think([...concludeMessages(s), { role: "assistant", content: s.answer }, { role: "user", content: `A fact check of your conclusion found problems:\n${auditNote(a)}\nRewrite the whole conclusion with the same five sections, fixing them.` }], o.signal));
      const b = audit(fixed, corpus, known);
      if (/##\s*Answer/i.test(fixed) && b.unsupported.length + b.fakeCitations.length + b.uncited.length <= a.unsupported.length + a.fakeCitations.length + a.uncited.length) (s.answer = fixed), (a = b), (revised = true);
    }
    s.audit = { ...a, revised };
    const c = s.answer.match(/overall confidence\s*:?\s*(\d+(?:\.\d+)?)\s*%/i);
    if (c) s.confidence = Math.max(0, Math.min(100, Number(c[1])));
    s.state = "done";
    s.finished = new Date().toISOString();
    s.note = `Study done: ${s.evidence.filter((e) => !e.error).length} readings, ${s.claims.length} claims checked, ${s.hypotheses.length} hypotheses tested${s.confidence !== undefined ? `, ${s.confidence}% confident` : ""}.${s.audit && !s.audit.ok ? " The fact check still flags parts of the conclusion (see the notebook)." : ""}`;
  } catch (e) {
    if ((e as Error).name !== "AbortError") {
      s.state = "failed";
      s.note = `The study stopped with an error: ${(e as Error).message}`;
    } else {
      s.state = "stopped";
      s.note = "Stopped.";
    }
    for (const h of s.hypotheses) if (h.status === "testing") h.status = "untested";
    s.finished = new Date().toISOString();
  }
  // Whatever happened, the notebook shows how far it got.
  await writeFile(join(dir, "REPORT.md"), reportMarkdown(s)).catch(() => {});
  await writeFile(join(dir, "report.html"), await reportHtml(s)).catch(() => {});
  await save();
  emit();
  agent.history.push({ role: "user", content: `🔬 ${question}` }, { role: "assistant", content: `${s.answer ?? s.note ?? ""}\n\n${hypothesisTable(s)}\n\n(Lab notebook: .maxx/research/${s.id}/report.html)`.trim() });
  return s;
}

export const hypothesisTable = (s: Study) =>
  s.hypotheses.length
    ? ["| | Hypothesis | Result | Confidence |", "|---|---|---|---|", ...s.hypotheses.map((h) => `| ${h.id} | ${h.text.replace(/\|/g, "/")} | ${h.status} | ${Math.round(h.prior)}% → ${Math.round(h.posterior ?? h.prior)}% |`)].join("\n")
    : "";

// The vision helper is a different model: let it be the skeptic, a genuine second opinion.
function secondOpinion(agent: Agent): LLMConfig | null {
  const v = agent.vision;
  return v.mode === "proxy" && v.llm.model !== agent.llm.model ? { ...v.llm, temperature: 0.4 } : null;
}

async function collect(agent: Agent, s: Study, item: PlanItem, all: Instrument[], events: StudyEvents, emit: () => void, signal: AbortSignal | undefined, set: LabSettings) {
  const inst = all.find((i) => i.id === item.instrument)!;
  const id = `E${s.evidence.length + 1}`;
  const at = new Date().toISOString();
  const ev: Evidence = { id, instrument: inst.id, kind: inst.kind, icon: ICON[inst.kind], title: item.args || inst.label, text: "", at, round: s.round };
  const log = (approval: LogEntry["approval"], ok: boolean, ms: number, note: string) => {
    const entry: LogEntry = { at, instrument: inst.id, args: item.args, approval, ms, ok, note };
    s.log.push(entry);
    appendFile(join(s.dir, "instruments.jsonl"), JSON.stringify(entry) + "\n").catch(() => {});
  };
  if (inst.unavailable) {
    log("unavailable", false, 0, inst.unavailable);
    agent.note(`(lab: skipped ${inst.id}: ${inst.unavailable})`);
    return;
  }
  let approval: LogEntry["approval"] = "not needed";
  if (inst.gated) {
    const how = await agent.approve("instrument", inst.id, `Let Maxx use ${inst.label}?`, `${ICON[inst.kind]} ${inst.id} | ${item.args}\n${inst.about}.\nThe reading is saved in .maxx/research/${s.id} and listed in the study's instrument log.`, inst.kind === "camera" || inst.kind === "mic");
    if (how === "denied") {
      log("denied", false, 0, "you said no");
      agent.note(`(lab: you said no to ${inst.id}; carrying on without it)`);
      return;
    }
    approval = how;
  }
  s.evidence.push(ev);
  emit();
  const t0 = Date.now();
  try {
    const r = await inst.run(parseArgs(item.args), { cwd: agent.cwd, signal, serialSeconds: set.serialSeconds });
    ev.title = r.title;
    ev.urls = r.urls;
    const raw = join(s.dir, "raw", id);
    const files: string[] = [];
    if (r.files?.length) {
      await mkdir(raw, { recursive: true });
      for (const f of r.files) {
        await writeFile(join(raw, f.name), f.data);
        files.push(`raw/${id}/${f.name}`);
      }
    }
    if (r.rows?.length && r.keys?.length) {
      const name = `data/${id}-${inst.id.replace(/[^\w]+/g, "-").replace(/^-|-$/g, "")}.csv`;
      await writeFile(join(s.dir, name), toCSV(r.rows, r.keys));
      ev.data = name;
      ev.keys = r.keys;
      ev.series = series(r.rows, r.keys);
    }
    ev.files = files;
    ev.images = files.filter((f) => /\.jpe?g$|\.png$/i.test(f));
    if (r.images?.length) events.image?.(inst.id, r.images);
    ev.text = r.text;
    if (inst.kind === "web") {
      // Web text is boiled down to tagged facts, each checked against the page it came from.
      await writeFile(join(s.dir, "raw", `${id}.txt`), r.text).catch(() => {});
      const facts = parseFacts(await distill(agent, s, r.text, signal));
      const pages = splitPages(r.text);
      for (const f of facts) addClaim(s, { ...f, kind: f.kind, evidence: id }, verify(f, pages));
      const mine = s.claims.filter((c) => c.evidence === id);
      if (mine.length) ev.text = mine.map((c) => `${c.id} [${c.status}] ${c.text}`).join("\n");
      else if (r.text.length > 900) ev.text = r.text.slice(0, 1200);
    } else if (r.rows?.length && r.keys?.length) {
      // A measurement: each column's statistics are an observed claim.
      for (const line of r.text.split("\n").filter((l) => /^[\w.]+: n=\d+/.test(l))) addClaim(s, { kind: "observed", text: line, evidence: id }, { status: "observed" });
    }
    // Pictures: the vision model says what is in them, in the question's terms.
    if (r.images?.length) {
      const look = judgeLLM(agent.llm, agent.vision);
      if (look) {
        try {
          const said = await agent.think([{ role: "user", content: [{ type: "text", text: `Research question: ${s.sharpened ?? s.question}\nDescribe what these camera frames show that matters for the question, in at most 4 short sentences. Mention changes between frames.` }, ...r.images.map(imagePart)] }], signal, look);
          ev.text += `\nThe vision model sees: ${strip(said).slice(0, 600)}`;
          // What a model sees in a picture is an interpretation, not a measurement.
          addClaim(s, { kind: "sourced", text: `In the photos: ${strip(said).slice(0, 300)}`, evidence: id }, { status: "unverified", note: "the vision model's description" });
        } catch (e) {
          if ((e as Error).name === "AbortError") throw e;
        }
      }
    }
    log(approval, true, Date.now() - t0, r.rows?.length ? `${r.rows.length} rows` : `${r.text.length} chars`);
  } catch (e) {
    if ((e as Error).name === "AbortError" || signal?.aborted) throw Object.assign(new Error("stopped"), { name: "AbortError" });
    ev.error = (e as Error).message.slice(0, 300);
    ev.text = "";
    log(approval, false, Date.now() - t0, ev.error);
    agent.note(`(lab: ${inst.id} failed: ${ev.error})`);
  }
  emit();
}

async function distill(agent: Agent, s: Study, text: string, signal?: AbortSignal): Promise<string> {
  const out = await agent.think([
    { role: "system", content: "You extract claims for a research study, without bias. Only what the text says; copy numbers and units exactly as written. Separate checkable facts from opinions, predictions and marketing." },
    { role: "user", content: `Question: ${s.sharpened ?? s.question}\n\nText:\n${text.slice(0, 6000)}\n\nList up to 6 claims from the text that bear on the question, for and against, one per line as:\n- FACT: <a checkable statement> <source URL>\n- OPINION: <a judgement, recommendation or prediction, and whose> <source URL>\nIf none, reply NONE.` },
  ], signal);
  const t = strip(out);
  return /^NONE\b/i.test(t) ? "" : t.slice(0, 2400);
}

async function testOne(agent: Agent, s: Study, h: Hypothesis, runtime: Runtime, set: LabSettings, emit: () => void, signal?: AbortSignal) {
  h.status = "testing";
  h.round = s.round;
  h.lang = runtime.lang;
  emit();
  const convo: Message[] = testMessages(s, h, runtime.lang);
  let run: TestRun | null = null;
  const name = `${h.id.toLowerCase()}-r${s.round}`;
  for (let attempt = 0; attempt <= set.fixes; attempt++) {
    h.tries++;
    const answer = await agent.think(convo, signal);
    const code = extractCode(answer, runtime.lang);
    if (!code) {
      convo.push({ role: "assistant", content: answer }, { role: "user", content: `Reply with the whole script in one \`\`\`${runtime.lang === "python" ? "python" : "js"} code block.` });
      continue;
    }
    h.script = `tests/${name}.${runtime.lang === "python" ? "py" : "js"}`;
    run = await runTest({ dir: s.dir, name, code, runtime, seconds: set.testSeconds, network: agent.network, signal });
    h.output = run.output;
    h.metrics = run.metrics;
    emit();
    if (run.ok) break;
    const why = run.timedOut ? `it ran longer than ${set.testSeconds}s` : run.code !== 0 ? `it exited with code ${run.code}` : "it did not print a RESULT: line at the end";
    convo.push({ role: "assistant", content: "```" + runtime.lang + "\n" + code + "\n```" }, { role: "user", content: `The script failed: ${why}. Output:\n${run.output.slice(-1800)}\n\nFix it. Reply with the whole fixed script in one code block.` });
  }
  if (!run?.ok) {
    h.status = "error";
    h.posterior = h.posterior ?? h.prior;
    h.why = run ? `the test script kept failing (${run.timedOut ? "timeout" : `exit ${run.code}`})` : "the model wrote no script";
    emit();
    return;
  }
  const verdict = parseInterpretation(await agent.think(interpretMessages(h, run), signal), run, h.prior);
  Object.assign(h, { status: verdict.status, posterior: verdict.posterior, why: verdict.why });
  h.trail = [...(h.trail ?? [h.prior]), verdict.posterior];
  emit();
}

async function pool<T>(items: T[], n: number, fn: (t: T) => Promise<void>) {
  const queue = [...items];
  await Promise.all(Array.from({ length: Math.max(1, Math.min(n, queue.length)) }, async () => {
    for (let t = queue.shift(); t !== undefined; t = queue.shift()) await fn(t);
  }));
}

// For the terminal: a short picture of where the study is.
export function formatStudy(s: Study): string {
  const phase = ["framing", "collecting", "hypothesizing", "testing", "reviewing", "concluding"].indexOf(s.state);
  const steps = ["❓ question", "📡 data", "💡 hypotheses", "🧪 tests", "🧐 review", "📜 conclusion"].map((p, i) => (s.state === "done" || i < phase ? `✓${p.slice(2)}` : i === phase ? `▸${p.slice(2)}` : ` ${p.slice(2)}`)).join("  ");
  const ev = s.evidence.map((e) => `  ${e.icon} ${e.id} ${e.title}${e.error ? ` ✗ ${e.error}` : ""}`);
  const hy = s.hypotheses.map((h) => `  ${({ untested: "○", testing: "▸", supported: "✓", refuted: "✗", inconclusive: "?", error: "!" } as const)[h.status]} ${h.id} ${h.text} ${Math.round(h.prior)}%${h.posterior !== undefined ? ` → ${Math.round(h.posterior)}%` : ""}`);
  return [steps, ...ev, ...hy].join("\n");
}


// ---------- the claim ledger ----------

function addClaim(s: Study, c: { kind: Claim["kind"]; text: string; url?: string; evidence: string }, v: { status: Claim["status"]; note?: string }) {
  const id = `C${s.claims.length + 1}`;
  s.claims.push({ id, text: c.text, kind: c.kind, status: v.status, evidence: c.evidence, url: c.url, note: v.note, history: [{ round: s.round, status: v.status, why: v.note ?? (c.kind === "observed" ? "measured" : c.kind === "opinion" ? "a judgement, not a fact" : "found on the page it cites") }] });
}

// The web instrument's text holds several pages: "From <title> <url>:" blocks, and the result list.
export function splitPages(text: string): { url: string; text: string }[] {
  const pages: { url: string; text: string }[] = [];
  const re = /^From .*?<(https?:\/\/[^>]+)>:\n([\s\S]*?)(?=^From .*?<https?:\/\/|$(?![\s\S]))/gm;
  for (const m of text.matchAll(re)) pages.push({ url: m[1]!, text: m[2]! });
  // Search-result snippets count as their own (thin) pages.
  for (const m of text.matchAll(/^- (.+?) <(https?:\/\/[^>]+)>$/gm)) if (!pages.some((p) => p.url === m[2])) pages.push({ url: m[2]!, text: m[1]! });
  return pages;
}

async function crossCheck(agent: Agent, s: Study, signal?: AbortSignal) {
  const checkable = s.claims.filter((c) => c.status !== "fabricated" && c.status !== "opinion");
  if (checkable.filter((c) => c.kind === "sourced").length < 2 && checkable.length < 3) return;
  try {
    applyCrossCheck(s.claims, parseCrossCheck(await agent.think(crossCheckMessages(checkable), signal)), s.round);
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    agent.note(`(lab: the cross-check failed: ${(e as Error).message})`);
  }
}

// Hypotheses rest on evidence; one that rests on nothing (or only on opinions and fabrications) is labelled speculative.
function ground(s: Study, h: Hypothesis): Hypothesis {
  const ok = (id: string) => s.evidence.some((e) => e.id === id && !e.error) || s.claims.some((c) => c.id === id && c.status !== "fabricated" && c.status !== "opinion");
  h.because = (h.because ?? []).filter((id) => s.evidence.some((e) => e.id === id) || s.claims.some((c) => c.id === id));
  h.speculative = !h.because.some(ok);
  if (h.speculative) h.prior = Math.min(h.prior, 35);
  h.trail = [h.prior];
  return h;
}

// Everything the conclusion may take numbers from.
function corpusOf(s: Study): string {
  return [s.question, s.sharpened ?? "", ...s.evidence.map((e) => `${e.title}\n${e.text}`), ...s.claims.map((c) => c.text), ...s.hypotheses.map((h) => `${h.text} ${h.predicts} ${h.why ?? ""} ${h.output ?? ""} ${Object.values(h.metrics ?? {}).join(" ")} ${h.prior} ${h.posterior ?? ""}`), s.skeptic ?? ""].join("\n");
}

// ---------- the Research tab's own workspace ----------

// Studies started from the Research tab live in one folder of their own
// (like chat), so they list and reopen without a project.
export const researchDir = () => join(maxxHome(), "research");
export const isResearchDir = (dir: string) => resolve(dir).toLowerCase() === resolve(researchDir()).toLowerCase();
export async function ensureResearchDir() {
  await mkdir(researchDir(), { recursive: true });
  return researchDir();
}

export type StudySummary = { id: string; question: string; state: Phase; confidence?: number; started: string; claims: number; hypotheses: number };
export async function listStudies(cwd: string, max = 40): Promise<StudySummary[]> {
  const root = join(cwd, ".maxx", "research");
  const ids = await readdir(root).catch(() => [] as string[]);
  const out: StudySummary[] = [];
  for (const id of ids.sort().reverse().slice(0, max)) {
    const s = await loadStudy(cwd, id);
    if (s) out.push({ id: s.id, question: s.question, state: s.state, confidence: s.confidence, started: s.started, claims: s.claims?.length ?? 0, hypotheses: s.hypotheses.length });
  }
  return out;
}
export async function loadStudy(cwd: string, id: string): Promise<Study | null> {
  if (!/^[\w-]+$/.test(id)) return null;
  try {
    const s = JSON.parse(await readFile(join(cwd, ".maxx", "research", id, "study.json"), "utf8")) as Study;
    s.claims ??= [];
    return s;
  } catch {
    return null;
  }
}
