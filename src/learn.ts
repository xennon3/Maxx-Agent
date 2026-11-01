// Learning from corrections. When the user corrects Maxx (says "no, use X",
// denies a call and says why, fixes a file Maxx wrote by hand, or undoes a
// turn), the model turns that into one short standing rule. Rules live in
// their own section of MAXX.md, so the next session (and a small model that
// forgets) starts out knowing them. A rule learned again is not added twice:
// it gets stronger instead ("(x3)"), and the weakest, oldest rule makes room
// when the list is full. The user can read, edit and remove every rule.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Message } from "./llm.ts";
import { lineDiff } from "./diff.ts";
import { maxxHome } from "./sessions.ts";

export const RULES_HEADING = "## Rules from your corrections";
export const MAX_RULES = 15;
const MAX_WORDS = 30;

export type Rule = { text: string; times: number };

// What happened, in the user's terms: what they did to correct Maxx, and what Maxx had done.
export type Correction = {
  kind: "said" | "denied" | "handfix" | "undid";
  // What Maxx did just before ("edit_file src/app.ts", its last answer...).
  did: string[];
  // The user's words: the message, or why they denied a call.
  said?: string;
  // The user's own edit to a file Maxx wrote, as a small diff.
  diff?: string;
};

// ---- the rules section of MAXX.md ----

const TIMES = /\s*\(x(\d+)\)$/;

export function rulesIn(md: string): Rule[] {
  const at = md.indexOf(RULES_HEADING);
  if (at < 0) return [];
  const body = md.slice(at + RULES_HEADING.length).split(/\n#{1,2} /)[0]!;
  return body
    .split("\n")
    .filter((l) => l.startsWith("- "))
    .map((l) => {
      const t = l.slice(2).trim();
      const m = t.match(TIMES);
      return { text: m ? t.slice(0, m.index).trim() : t, times: m ? Number(m[1]) : 1 };
    })
    .filter((r) => r.text);
}

const line = (r: Rule) => `- ${r.text}${r.times > 1 ? ` (x${r.times})` : ""}`;

// The MAXX.md text with its rules section replaced (removed when there are none).
export function withRules(md: string, rules: Rule[]): string {
  const block = rules.length ? `${RULES_HEADING}\n\nMaxx learned these when you corrected it. Edit or delete any of them.\n\n${rules.map(line).join("\n")}\n` : "";
  const at = md.indexOf(RULES_HEADING);
  if (at < 0) {
    if (!block) return md;
    const base = md.trimEnd();
    return `${base ? base + "\n\n" : "# Notes for Maxx\n\n"}${block}`;
  }
  const after = md.slice(at + RULES_HEADING.length);
  const next = after.search(/\n#{1,2} /);
  const rest = next < 0 ? "" : after.slice(next + 1);
  const head = md.slice(0, at);
  if (!block) return (head.trimEnd() + (rest ? "\n\n" + rest : "\n")).replace(/^\n+/, "");
  return `${head}${block}${rest ? "\n" + rest : ""}`;
}

// ---- deduplication ----

const STOP = new Set("a an the to of in on for and or but with when is are be it this that use do not dont don't never always instead please file files code".split(" "));
const words = (s: string) => new Set(s.toLowerCase().replace(/[`'"().,:;!?]/g, " ").split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w)));
const negated = (s: string) => /^(?:never|don'?t|do not|avoid|stop|no longer)\b/i.test(s.trim());

// How alike two rules are: shared content words over all of them (0..1).
export function similarity(a: string, b: string): number {
  const x = words(a), y = words(b);
  if (!x.size || !y.size) return a.trim().toLowerCase() === b.trim().toLowerCase() ? 1 : 0;
  let shared = 0;
  for (const w of x) if (y.has(w)) shared++;
  return shared / (x.size + y.size - shared);
}

// The same idea, said again? "Never use var" and "Use var" share words but not meaning.
export function sameRule(a: string, b: string): boolean {
  return similarity(a, b) >= 0.6 && negated(a) === negated(b);
}

// Add a rule, or strengthen the one that already says it. A newer rule that
// contradicts an old one ("Use tabs" after "Use spaces") replaces it.
export function mergeRule(rules: Rule[], text: string): { rules: Rule[]; rule: Rule; isNew: boolean; replaced?: string } {
  const clean = cleanRule(text);
  if (!clean) throw new Error("empty rule");
  const i = rules.findIndex((r) => sameRule(r.text, clean));
  if (i >= 0) {
    const rule = { text: rules[i]!.text, times: rules[i]!.times + 1 };
    // The strongest rules sink to the bottom, closest to where the model reads next.
    return { rules: [...rules.slice(0, i), ...rules.slice(i + 1), rule], rule, isNew: false };
  }
  const rival = rules.findIndex((r) => similarity(r.text, clean) >= 0.5 && negated(r.text) !== negated(clean));
  const kept = rival >= 0 ? rules.filter((_, k) => k !== rival) : [...rules];
  const rule = { text: clean, times: 1 };
  let next = [...kept, rule];
  // Full: the least confirmed, oldest rule goes (never the new one).
  while (next.length > MAX_RULES) {
    let drop = 0;
    for (let k = 1; k < next.length - 1; k++) if (next[k]!.times < next[drop]!.times) drop = k;
    next = next.filter((_, k) => k !== drop);
  }
  return { rules: next, rule, isNew: true, replaced: rival >= 0 ? rules[rival]!.text : undefined };
}

export function cleanRule(text: string): string {
  let t = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim().split("\n").find((l) => l.trim()) ?? "";
  t = t.replace(/^\s*(?:[-*•]|\d+[.)]|rule\s*\d*\s*:|new rule\s*:)\s*/i, "").replace(/^["'`]+|["'`]+$/g, "").replace(TIMES, "").replace(/\s+/g, " ").trim();
  if (!t) return "";
  t = t[0]!.toUpperCase() + t.slice(1);
  if (!/[.!?]$/.test(t)) t += ".";
  return t.slice(0, 200);
}

// ---- reading and writing MAXX.md ----

const maxxMd = (cwd: string) => join(cwd, "MAXX.md");
const readMd = async (cwd: string) => readFile(maxxMd(cwd), "utf8").catch(() => "");

export async function loadRules(cwd: string): Promise<Rule[]> {
  return rulesIn(await readMd(cwd));
}

export async function saveRules(cwd: string, rules: Rule[]) {
  const md = await readMd(cwd);
  const next = withRules(md, rules);
  if (next !== md) await writeFile(maxxMd(cwd), next);
}

export async function addRule(cwd: string, text: string) {
  const r = mergeRule(await loadRules(cwd), text);
  await saveRules(cwd, r.rules);
  return r;
}

// Take back a rule just learned: a new one goes, a strengthened one weakens.
export async function forgetRule(cwd: string, text: string): Promise<boolean> {
  const rules = await loadRules(cwd);
  const i = rules.findIndex((r) => r.text === text);
  if (i < 0) return false;
  const r = rules[i]!;
  await saveRules(cwd, r.times > 1 ? rules.map((x, k) => (k === i ? { ...x, times: x.times - 1 } : x)) : rules.filter((_, k) => k !== i));
  return true;
}

// What the user typed in the rules dialog: one rule per entry, deduplicated.
export function tidyRules(list: { text: string; times?: number }[]): Rule[] {
  const out: Rule[] = [];
  for (const r of list.slice(0, MAX_RULES * 2)) {
    const text = cleanRule(String(r.text ?? ""));
    if (!text) continue;
    const times = Math.max(1, Math.min(99, Math.round(Number(r.times) || 1)));
    const same = out.find((o) => o.text.toLowerCase() === text.toLowerCase());
    if (same) same.times += times;
    else out.push({ text, times });
  }
  return out.slice(-MAX_RULES);
}

// ---- noticing a correction ----

const OPENERS = /^(?:no\b|nope\b|nah\b|wrong\b|incorrect\b|not (?:like )?that\b|not what\b|that'?s (?:not|wrong)\b|that is (?:not|wrong)\b|stop\b|don'?t\b|do not\b|never\b|undo\b|revert\b|put it back\b|actually\b|instead\b|why did you\b|you (?:forgot|broke|missed|deleted|removed|changed|should(?:n'?t)?|need to|have to)\b|please (?:don'?t|stop|never|always)\b|i (?:said|told you|asked for|wanted|meant)\b)/i;
const ANYWHERE = /\b(?:instead of|rather than|not what i|i told you|i already said|like i said|you keep|again\?|don'?t ever|stop using|from now on|every time|in future|next time)\b/i;
const STANDING = /^(?:always|never|from now on|in this project|in future)\b|\bfrom now on\b/i;

// Does a message sound like the user correcting what Maxx just did?
export function soundsLikeCorrection(text: string): boolean {
  const t = text.trim().replace(/^[^a-z]+/i, "");
  return t.length > 2 && (OPENERS.test(t) || ANYWHERE.test(t));
}

// "Always use pnpm here" is worth keeping even when nothing went wrong.
export const isStanding = (text: string) => STANDING.test(text.trim());

// The user's edit to a file Maxx wrote, small enough to show the model.
export function handDiff(path: string, before: string, after: string, maxLines = 40): string | null {
  if (before === after) return null;
  const d = lineDiff(before, after, 1).replace(/\x1b\[[0-9;]*m/g, "").split("\n");
  const changes = d.filter((l) => /^[+-] /.test(l)).length;
  if (!changes) return null;
  return `${path}:\n${d.slice(0, maxLines).join("\n")}${d.length > maxLines ? `\n... ${d.length - maxLines} more lines` : ""}`;
}

// ---- turning it into a rule ----

export function correctionPrompt(c: Correction, rules: Rule[]): Message[] {
  const what =
    c.kind === "denied" ? `The user said no to this step and gave a reason: "${c.said}"` :
    c.kind === "handfix" ? `Afterwards the user fixed Maxx's work by hand:\n${c.diff}${c.said ? `\nThen they wrote: "${c.said}"` : ""}` :
    c.kind === "undid" ? `The user undid those changes${c.said ? `, then wrote: "${c.said}"` : "."}` :
    `Then the user wrote: "${c.said}"`;
  const saved = rules.length ? `Rules already saved:\n${rules.map((r, i) => `${i + 1}. ${r.text}`).join("\n")}\n\n` : "";
  return [
    { role: "system", content: "You turn a user's correction of a coding assistant called Maxx into one short standing rule, so Maxx stops making the same mistake. Reply with the rule only." },
    {
      role: "user",
      content:
        `What Maxx did:\n${c.did.length ? c.did.map((d) => `- ${d}`).join("\n") : "- (nothing yet)"}\n\n${what}\n\n${saved}` +
        `Write ONE rule Maxx should follow from now on in this project: an instruction of at most 20 words, like "Use pnpm, not npm, to install packages." or "Keep game constants in src/config.ts." ` +
        `Keep the specific names (files, commands, libraries, styles). ` +
        `If this is only a change of mind about this one task and teaches nothing for next time, reply NONE.` +
        (rules.length ? ` If one of the saved rules already says it, reply with just its number.` : ""),
    },
  ];
}

// The model's reply: a rule, a saved rule's number, or nothing to learn.
export function parseRule(reply: string, rules: Rule[]): { rule: string } | { again: number } | null {
  const t = reply.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  if (!t || /^none\b/i.test(t) || /^["'`]?none["'`.]?$/i.test(t)) return null;
  const n = t.match(/^#?(\d{1,2})\.?$/);
  if (n) {
    const i = Number(n[1]) - 1;
    return rules[i] ? { again: i } : null;
  }
  const rule = cleanRule(t);
  if (!rule || rule.split(/\s+/).length > MAX_WORDS || /^none\b/i.test(rule)) return null;
  return { rule };
}

// Without a model reply (it failed or rambled): the user's own words, when they read as a rule.
export function fallbackRule(c: Correction): string | null {
  const s = (c.said ?? "").replace(/^(?:no|nope|nah|wrong|actually)[,.!:\s-]+/i, "").trim();
  if (!s || s.split(/\s+/).length > 20 || s.includes("\n")) return null;
  return /^(?:always|never|don'?t|do not|use|keep|put|call|run|prefer|avoid|stop|write|make|name|only)\b/i.test(s) ? cleanRule(s) : null;
}

// ---- the setting ----

export const learnFile = () => join(maxxHome(), "learn.json");

export async function loadLearn(): Promise<boolean> {
  try {
    return (JSON.parse(await readFile(learnFile(), "utf8")) as { on?: boolean }).on !== false;
  } catch {
    return true;
  }
}

export async function saveLearn(on: boolean) {
  await mkdir(maxxHome(), { recursive: true });
  await writeFile(learnFile(), JSON.stringify({ on }, null, 2) + "\n");
}

// The flag beats the environment ($MAXX_LEARN), which beats the saved setting. On by default.
export async function resolveLearn(flag?: string, env = process.env): Promise<boolean> {
  const v = (flag ?? env.MAXX_LEARN ?? "").trim().toLowerCase();
  if (!v) return loadLearn();
  if (["on", "1", "true", "yes"].includes(v)) return true;
  if (["off", "0", "false", "no"].includes(v)) return false;
  throw new Error(`--learn takes on or off, not "${v}"`);
}

// The rules, pulled out of MAXX.md and put last in the system prompt, where a small model heeds them most.
export function rulesPrompt(rules: Rule[]): string {
  if (!rules.length) return "";
  return `The user corrected you before. Follow these rules (higher xN = corrected more often):\n${rules.map(line).join("\n")}`;
}
