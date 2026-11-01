import { mkdir, readFile, readdir, writeFile, appendFile } from "node:fs/promises";
import { join } from "node:path";
import type { Message } from "../llm.ts";
import { maxxHome } from "../sessions.ts";
import { extractCode, runTest, type Runtime } from "./sandbox.ts";
import { toCSV, stats, describeStats, type Row } from "./data.ts";

// Virtual labs. For a question a simulation can shed light on, Maxx designs
// its own lab: a small model of the world (particles, agents, a circuit, a
// heat flow, a Monte Carlo game...) written to one contract, so the same code
//   - runs headless in the sandbox for parameter sweeps (evidence for the study),
//   - runs live in the Research tab: an animated canvas, a slider per
//     parameter, play/step/reset, a seed, a live chart, quick sweeps, and a
//     record of every run you pin,
//   - and is saved to a library (~/.maxx/labs) to reuse in later studies.
//
// The contract (plain JavaScript, no imports):
//   const LAB = {
//     title, about,
//     params:  { name: { min, max, step, value, unit, label } },
//     outputs: { name: { unit, label } },
//     steps: 400,
//     init(p, rnd) -> state,          rnd() is a seeded random in [0, 1)
//     step(s, p, rnd, t),             advance one tick (mutate s)
//     measure(s, p) -> { output: number },
//     draw(ctx, s, p, w, h)           optional: paint a frame on a canvas
//   };

export type Param = { min: number; max: number; step?: number; value: number; unit?: string; label?: string };
export type LabMeta = { slug: string; title: string; about: string; kind?: string; params: Record<string, Param>; outputs: Record<string, { unit?: string; label?: string }>; steps: number; created: string; studies: string[]; runs: number; draws: boolean };
export type SimRun = { at: string; source: "sweep" | "you"; params: Record<string, number>; seed: number; steps: number; final: Record<string, number>; note?: string };
export type Sweep = { param: string; from: number; to: number; count: number; seeds: number; steps?: number; watch: string[] };

export const labsDir = () => join(maxxHome(), "labs");
export const slugOf = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "lab";

export const CONTRACT = `const LAB = {
  title: "Short name", about: "what it models, in one sentence",
  params: { fan: { min: 0, max: 100, step: 1, value: 50, unit: "%", label: "Fan speed" } },
  outputs: { temp: { unit: "°C", label: "Desk temperature" } },
  steps: 400,
  init(p, rnd) { return { temp: 22, t: 0 }; },
  step(s, p, rnd, t) { s.temp += 0.02 * (35 - s.temp) - 0.0004 * p.fan * (s.temp - 22) + (rnd() - 0.5) * 0.05; },
  measure(s, p) { return { temp: s.temp }; },
  draw(ctx, s, p, w, h) { ctx.fillStyle = "hsl(" + (240 - (s.temp - 20) * 12) + ",70%,55%)"; ctx.fillRect(0, 0, w, h); }
};`;

export function designMessages(question: string, hypotheses: string, evidence: string, library: LabMeta[]): Message[] {
  return [
    { role: "system", content: "You design virtual labs: small, honest simulations that let a study test ideas it cannot measure directly. You model mechanisms with simple rules and stated assumptions. You never hard-code the answer you hope to see." },
    {
      role: "user",
      content:
        `Question: ${question}\nHypotheses:\n${hypotheses}\n\nEvidence (use its numbers to set realistic ranges):\n${evidence.slice(0, 2500)}\n\n` +
        (library.length ? `Labs already in the library:\n${library.map((l) => `- ${l.slug}: ${l.about} (params: ${Object.keys(l.params).join(", ")}; outputs: ${Object.keys(l.outputs).join(", ")})`).join("\n")}\n\n` : "") +
        "Would a simulation help test these hypotheses (a physics or particle model, agents, a circuit, heat flow, a queue, a Monte Carlo game...)? Reply with one of:\n" +
        "NONE (a simulation would not add anything)\n" +
        (library.length ? "REUSE: <slug> (a library lab fits as it is)\n" : "") +
        "or a new lab as one ```js block that defines const LAB exactly like this example:\n```js\n" + CONTRACT + "\n```\n" +
        "Give every parameter a realistic range, include the parameters the hypotheses are about, and make outputs things the hypotheses predict. draw() should show what is going on (dots, bars, a gauge). Under 120 lines, no imports, no network, no DOM other than the ctx you are given.",
    },
  ];
}

export function parseDesign(text: string): { kind: "none" } | { kind: "reuse"; slug: string } | { kind: "new"; code: string } {
  const t = text.replace(/<think>[\s\S]*?<\/think>/g, "");
  const reuse = t.match(/^\W*REUSE\s*:\s*([\w-]+)/im);
  if (reuse) return { kind: "reuse", slug: reuse[1]!.toLowerCase() };
  const code = extractCode(t, "js");
  if (code && /\bLAB\s*=/.test(code)) return { kind: "new", code };
  return { kind: "none" };
}

// Runs the lab headless and prints one JSON line per run. Also the smoke test of a new design.
export function harness(code: string, runs: { params: Record<string, number>; seed: number; steps: number }[]): string {
  return `${code}
;(function () {
  if (typeof LAB !== "object" || !LAB) throw new Error("the code must define const LAB = {...}");
  for (const k of ["init", "step", "measure"]) if (typeof LAB[k] !== "function") throw new Error("LAB." + k + " must be a function");
  const meta = { title: LAB.title, about: LAB.about, params: LAB.params || {}, outputs: LAB.outputs || {}, steps: LAB.steps || 400, draws: typeof LAB.draw === "function" };
  console.log("META " + JSON.stringify(meta));
  const rng = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const runs = ${JSON.stringify(runs)};
  for (const r of runs) {
    const p = {};
    for (const [k, d] of Object.entries(meta.params)) p[k] = d.value;
    Object.assign(p, r.params);
    const rnd = rng(r.seed);
    const s = LAB.init(p, rnd);
    const steps = r.steps || meta.steps;
    for (let t = 0; t < steps; t++) LAB.step(s, p, rnd, t);
    const m = LAB.measure(s, p);
    for (const [k, v] of Object.entries(m)) if (typeof v !== "number" || !isFinite(v)) throw new Error("measure() gave " + k + "=" + v + " (must be a finite number)");
    console.log("RUN " + JSON.stringify({ params: p, seed: r.seed, steps, final: m }));
  }
})();
`;
}

export async function runSim(dir: string, name: string, code: string, runs: { params: Record<string, number>; seed: number; steps: number }[], runtime: Runtime, seconds: number, signal?: AbortSignal): Promise<{ ok: boolean; meta?: Omit<LabMeta, "slug" | "created" | "studies" | "runs">; runs: { params: Record<string, number>; seed: number; steps: number; final: Record<string, number> }[]; output: string }> {
  await mkdir(join(dir, "sim"), { recursive: true });
  const r = await runTest({ dir, name, code: harness(code, runs), runtime, seconds, network: false, signal, folder: "sim", needResult: false });
  const meta = r.output.match(/^META (.+)$/m)?.[1];
  const out = [...r.output.matchAll(/^RUN (.+)$/gm)].map((m) => JSON.parse(m[1]!));
  return { ok: r.ok && !!meta && out.length === runs.length, meta: meta ? JSON.parse(meta) : undefined, runs: out, output: r.output };
}

// "sweep fan from 0 to 100 in 6 steps | seeds=3 | steps=400 | watch=temp,noise"
export function parseSweeps(text: string, meta: Pick<LabMeta, "params" | "outputs">, max = 3): Sweep[] {
  const out: Sweep[] = [];
  for (const raw of text.replace(/<think>[\s\S]*?<\/think>/g, "").split("\n")) {
    const m = raw.match(/sweep\s+([\w.]+)\s+(?:from\s+)?([-\d.]+)\s*(?:to|-|\.\.|…)\s*([-\d.]+)(?:\s*(?:in|x|×)\s*(\d+))?/i);
    if (!m || !meta.params[m[1]!]) continue;
    const kv = (k: string) => raw.match(new RegExp(`${k}\\s*=\\s*([\\w.,-]+)`, "i"))?.[1];
    const p = meta.params[m[1]!]!;
    const clampP = (v: number) => Math.min(p.max, Math.max(p.min, v));
    const watch = (kv("watch") ?? "").split(",").map((w) => w.trim()).filter((w) => meta.outputs[w]);
    out.push({ param: m[1]!, from: clampP(Number(m[2])), to: clampP(Number(m[3])), count: Math.min(12, Math.max(2, Number(m[4] ?? 6))), seeds: Math.min(8, Math.max(1, Number(kv("seeds") ?? 3))), steps: kv("steps") ? Math.min(20000, Number(kv("steps"))) : undefined, watch: watch.length ? watch : Object.keys(meta.outputs) });
    if (out.length >= max) break;
  }
  return out;
}

export function sweepRuns(sw: Sweep): { params: Record<string, number>; seed: number; steps: number }[] {
  const runs: { params: Record<string, number>; seed: number; steps: number }[] = [];
  for (let i = 0; i < sw.count; i++) {
    const v = sw.from + ((sw.to - sw.from) * i) / (sw.count - 1);
    for (let s = 1; s <= sw.seeds; s++) runs.push({ params: { [sw.param]: +v.toPrecision(6) }, seed: s * 7919, steps: sw.steps ?? 0 });
  }
  return runs;
}

// The sweep as a table (one row per run) and the per-value averages the model reads.
export function sweepTable(sw: Sweep, runs: { params: Record<string, number>; seed: number; final: Record<string, number> }[]): { rows: Row[]; keys: string[]; text: string } {
  const rows: Row[] = runs.map((r, i) => ({ t: i, [sw.param]: r.params[sw.param]!, seed: r.seed, ...Object.fromEntries(sw.watch.map((w) => [w, r.final[w]!])) }));
  const by = new Map<number, Row[]>();
  for (const r of rows) by.set(r[sw.param]!, [...(by.get(r[sw.param]!) ?? []), r]);
  const means = [...by.entries()].map(([v, rs]) => `${sw.param}=${+v.toPrecision(4)}: ${sw.watch.map((w) => `${w}=${+(rs.reduce((a, r) => a + r[w]!, 0) / rs.length).toPrecision(4)}`).join(" ")}`);
  // Trend of each output against the parameter (the slope per unit of the parameter).
  const trend = stats(rows.map((r) => ({ ...r, t: r[sw.param]! })), sw.watch);
  return { rows, keys: [sw.param, "seed", ...sw.watch], text: `Simulated sweep of ${sw.param} from ${sw.from} to ${sw.to} (${sw.count} values × ${sw.seeds} seeds). Averages:\n${means.join("\n")}\nAgainst ${sw.param} (trend = change per unit of ${sw.param}):\n${describeStats(trend).replace(/\/s\b/g, ` per ${sw.param}`)}` };
}

export function sweepMessages(question: string, hypotheses: string, meta: LabMeta): Message[] {
  return [
    { role: "system", content: "You plan experiments in a virtual lab. Each experiment sweeps one parameter and watches outputs." },
    {
      role: "user",
      content:
        `Question: ${question}\nHypotheses:\n${hypotheses}\n\nLab: ${meta.title}: ${meta.about}\nParameters: ${Object.entries(meta.params).map(([k, p]) => `${k} (${p.label ?? k}, ${p.min} to ${p.max}${p.unit ? ` ${p.unit}` : ""}, default ${p.value})`).join("; ")}\nOutputs: ${Object.entries(meta.outputs).map(([k, o]) => `${k}${o.unit ? ` (${o.unit})` : ""}`).join(", ")}\n\n` +
        "Plan 1 to 3 sweeps that would tell the hypotheses apart, one per line:\nsweep <parameter> from <a> to <b> in <n> steps | seeds=3 | watch=<outputs>\nReply with the lines only.",
    },
  ];
}

// ---------- the library ----------

export async function saveLab(code: string, meta: Omit<LabMeta, "slug" | "created" | "studies" | "runs">, study: string): Promise<LabMeta> {
  let slug = slugOf(meta.title ?? "lab");
  const existing = await loadLabMeta(slug);
  if (existing && (await readFile(join(labsDir(), slug, "lab.js"), "utf8").catch(() => "")) !== code) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  const full: LabMeta = { ...meta, slug, title: meta.title ?? slug, about: meta.about ?? "", created: existing?.created ?? new Date().toISOString(), studies: [...new Set([...(existing?.studies ?? []), study])], runs: existing?.runs ?? 0 };
  await mkdir(join(labsDir(), slug), { recursive: true });
  await writeFile(join(labsDir(), slug, "lab.js"), code);
  await writeFile(join(labsDir(), slug, "meta.json"), JSON.stringify(full, null, 2));
  return full;
}

export async function loadLabMeta(slug: string): Promise<LabMeta | null> {
  if (!/^[\w-]+$/.test(slug)) return null;
  try {
    return JSON.parse(await readFile(join(labsDir(), slug, "meta.json"), "utf8")) as LabMeta;
  } catch {
    return null;
  }
}
export async function loadLabCode(slug: string): Promise<string | null> {
  if (!/^[\w-]+$/.test(slug)) return null;
  return readFile(join(labsDir(), slug, "lab.js"), "utf8").catch(() => null);
}
export async function listLabs(): Promise<LabMeta[]> {
  const out: LabMeta[] = [];
  for (const slug of await readdir(labsDir()).catch(() => [] as string[])) {
    const m = await loadLabMeta(slug);
    if (m) out.push(m);
  }
  return out.sort((a, b) => b.created.localeCompare(a.created));
}

// A run pinned in the Research tab (or a sweep), kept with the lab and the study.
export async function recordRun(slug: string, run: SimRun, studyDir?: string): Promise<void> {
  const line = JSON.stringify(run) + "\n";
  await mkdir(join(labsDir(), slug), { recursive: true });
  await appendFile(join(labsDir(), slug, "runs.jsonl"), line);
  if (studyDir) await mkdir(join(studyDir, "sim"), { recursive: true }).then(() => appendFile(join(studyDir, "sim", "runs.jsonl"), line));
  const m = await loadLabMeta(slug);
  if (m) await writeFile(join(labsDir(), slug, "meta.json"), JSON.stringify({ ...m, runs: m.runs + 1 }, null, 2));
}
export async function listRuns(slug: string, max = 200): Promise<SimRun[]> {
  const raw = await readFile(join(labsDir(), slug, "runs.jsonl"), "utf8").catch(() => "");
  return raw.trim().split("\n").filter(Boolean).slice(-max).map((l) => JSON.parse(l) as SimRun);
}

export { toCSV };
