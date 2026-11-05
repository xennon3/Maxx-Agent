// How a turn ends. Maxx used to stop as soon as the model stopped: on a bare
// "ok", on the step limit (which the app never even showed), on a model that
// went quiet, with the Plan still half unticked. Now every work turn ends the
// same way: the Plan is reconciled (each open step marked done or not done,
// with why), and the last line says plainly whether the task is done.

import { formatPlan, type Step } from "./plan.ts";

// Why the turn ended. Only "answered" means the model chose to stop.
export type Ending = "answered" | "steps" | "repeats" | "badcalls" | "blocked" | "empty" | "checkfail";

export const ENDING_SAY: Record<Ending, string> = {
  answered: "",
  steps: "it used all the steps one turn gets",
  repeats: "the model kept repeating the same tool call",
  badcalls: "the model kept writing broken tool calls",
  blocked: "a program it needs is not installed",
  empty: "the model stopped without writing an answer",
  checkfail: "Maxx's check still fails",
};

// A reply that admits it didn't work: worth asking the model for a verdict.
const DOUBT = /\b(could ?n[o']t|can ?n[o']t|cannot|unable|not able|did ?n[o']t (work|manage|finish|get)|does ?n[o']t work|still (fails?|failing|broken|errors?)|failed|not (yet )?(done|finished|working|complete)|stuck|gave up|ran out)\b/i;
export const doubtful = (answer: string) => DOUBT.test(answer);

// Sent once, with no tools, after the turn is over. Small models answer a
// fixed form far more reliably than an open question.
export function wrapPrompt(plan: Step[], why: string, summary: boolean): string {
  const open = plan.some((s) => !s.done);
  return [
    `Maxx: this turn is over${why ? ` (${why})` : ""}. Do not call tools and do not carry on with the work. Report on it, going only by what you actually did above.`,
    ...(open ? ["Plan:", formatPlan(plan), "For each step that is not ticked ([ ]), write one line: `3: done` if you really finished it, or `3: not done: <why, in a few words>`."] : []),
    "Then one line: `RESULT: done` if the user's request is fully done and works, or `RESULT: not done: <what is left>`.",
    ...(summary ? ["Then one line: `SUMMARY: <what you did, in one sentence>`."] : []),
    "Write only those lines.",
  ].join("\n");
}

export type Verdict = { done: boolean; left?: string };
export type Wrap = { steps: Step[]; result?: Verdict; summary?: string };

const clean = (s: string) => s.replace(/^[\s:–—-]+/, "").replace(/[`*]/g, "").trim().slice(0, 200);

// Read the model's report. Anything it didn't answer stays as it was.
export function parseWrap(text: string, plan: Step[]): Wrap {
  const steps = plan.map((s) => ({ ...s }));
  let result: Verdict | undefined;
  let summary: string | undefined;
  for (const raw of text.replace(/<think>[\s\S]*?<\/think>/g, "").split("\n")) {
    const l = raw.replace(/^[\s>*_`-]+/, "").replace(/[*_`]+$/, "").trim();
    const r = l.match(/^result\b\W*(not\s+done|done)\b(.*)$/i);
    if (r) {
      result = /^not/i.test(r[1]!) ? { done: false, left: clean(r[2]!) || undefined } : { done: true };
      continue;
    }
    const s = l.match(/^summary\b\s*[:–-]\s*(.+)$/i);
    if (s) {
      summary = clean(s[1]!) || undefined;
      continue;
    }
    const m = l.match(/^(?:step\s*)?(\d+)\s*[.:)\]-]*\s*(?:\[[ xX]?\]\s*)?(.*)$/i);
    if (!m) continue;
    const step = steps[Number(m[1]) - 1];
    if (!step || step.done) continue;
    // "3: not done: why", "3. Run it - not done (why)", "3: done"
    const rest = m[2]!;
    const no = rest.match(/\b(not\s+done|not\s+finished|skipped|failed|no)\b\W*(.*)$/i);
    if (no) Object.assign(step, { missed: true, why: clean(no[2]!) || undefined });
    else if (/\b(done|finished|yes|complete)\b/i.test(rest)) Object.assign(step, { done: true, missed: undefined, why: undefined });
  }
  return { steps, result, summary };
}

// Whatever is still open when the turn ends is not done.
export const closeOpen = (steps: Step[]): Step[] => steps.map((s) => (s.done || s.missed ? s : { ...s, missed: true }));

export type Report = {
  ending: Ending;
  // The Plan, if this turn used one (already closed).
  plan: Step[];
  result?: Verdict;
  // Maxx's own check of the changed files, if it ran this turn.
  check?: { what: string; ok: boolean };
  files: number;
};

export function isDone(r: Report): boolean {
  return r.ending === "answered" && !r.plan.some((s) => !s.done) && r.check?.ok !== false && r.result?.done !== false;
}

// The last line of the turn. Starts with ✅ or ⚠ so it reads at a glance (and the app styles it).
export function reportLine(r: Report): string {
  const done = isDone(r);
  const bits: string[] = [];
  if (!done && r.ending !== "answered") bits.push(`stopped because ${ENDING_SAY[r.ending]}`);
  if (r.plan.length) bits.push(`plan ${r.plan.filter((s) => s.done).length} of ${r.plan.length} step${r.plan.length > 1 ? "s" : ""} done`);
  if (r.check) bits.push(`${r.check.what} ${r.check.ok ? "passed" : "fails"}`);
  else if (r.files) bits.push(`changed ${r.files} file${r.files > 1 ? "s" : ""}`);
  const left = r.plan.flatMap((s, i) => (s.done ? [] : [`${i + 1}. ${s.text}${s.why ? ` (${s.why})` : ""}`]));
  if (!done && left.length) bits.push(`left: ${left.join("; ")}`);
  else if (!done && r.result?.left) bits.push(`left: ${r.result.left}`);
  return `${done ? "✅ Done" : "⚠ Not finished"}${bits.length ? ` · ${bits.join(" · ")}` : ""}`;
}

export const REPORT_LINE = /^(✅ Done|⚠ Not finished)\b/;
