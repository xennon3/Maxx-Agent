// How much the model thinks before it acts. Reasoning models (DeepSeek, Qwen
// with thinking on) spend a thousand tokens musing over "make the button
// blue", which at 20 tok/s is most of a minute. Three things keep that down:
//
// 1. Ask the server: every request carries the usual switches (Qwen's
//    enable_thinking chat-template flag, reasoning_effort). Servers that don't
//    know a field ignore it; one that rejects them gets the plain request
//    again, and Maxx stops sending them to that server.
// 2. A budget: whatever the server does, Maxx counts the thinking as it
//    streams. Past the budget, or when the model starts going round in
//    circles ("Wait, ..." for the third time), Maxx cuts the request off and
//    asks again with thinking off and the gist of what it thought so far.
// 3. Auto (the default) sizes the budget per step: a short, plain ask gets
//    almost none, a "why does this crash" gets plenty, a step that just
//    follows a tool call that worked gets less, and a step after a failure
//    gets more.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { maxxHome } from "./sessions.ts";

export const THINKING = ["auto", "off", "low", "high", "max"] as const;
export type Thinking = (typeof THINKING)[number];
export const DEFAULT_THINKING: Thinking = "auto";

// 0 none, 1 low, 2 medium, 3 high, 4 unlimited.
export type Tier = 0 | 1 | 2 | 3 | 4;

export type ThinkPlan = {
  tier: Tier;
  // Thinking tokens before Maxx cuts the request off (Infinity: never).
  budget: number;
  // Why this much, for the note when a cut happens.
  why: string;
};

// Tier 0 still allows a little, because a server that ignores the "off"
// switch would otherwise be cut before it said anything.
export const BUDGET: Record<Tier, number> = { 0: 96, 1: 400, 2: 1500, 3: 4000, 4: Infinity };
const EFFORT: Record<Tier, "low" | "medium" | "high" | undefined> = { 0: "low", 1: "low", 2: "medium", 3: "high", 4: undefined };

export const thinkingFile = () => join(maxxHome(), "thinking.json");

export function parseThinking(v: string): Thinking | undefined {
  const s = v.trim().toLowerCase();
  if (s === "on" || s === "unlimited" || s === "free") return "max";
  if (s === "none" || s === "0") return "off";
  return THINKING.find((t) => t === s) ?? (s.length === 1 ? THINKING.find((t) => t[0] === s) : undefined);
}

export async function loadThinking(): Promise<Thinking> {
  try {
    const saved = (JSON.parse(await readFile(thinkingFile(), "utf8")) as { level?: string }).level;
    return (saved && parseThinking(saved)) || DEFAULT_THINKING;
  } catch {
    return DEFAULT_THINKING;
  }
}

export async function saveThinking(level: Thinking) {
  await mkdir(maxxHome(), { recursive: true });
  await writeFile(thinkingFile(), JSON.stringify({ level }, null, 2) + "\n");
}

// The flag beats the environment ($MAXX_THINKING), which beats the saved setting.
export async function resolveThinking(flag?: string, env = process.env): Promise<Thinking> {
  const v = flag ?? env.MAXX_THINKING;
  if (v === undefined || v === "") return loadThinking();
  const level = parseThinking(v);
  if (!level) throw new Error(`--thinking takes ${THINKING.join(", ")}, not "${v}"`);
  return level;
}

export const THINKING_LABEL: Record<Thinking, string> = { auto: "💭 Think: auto", off: "💭 Think: off", low: "💭 Think: low", high: "💭 Think: high", max: "💭 Think: max" };
export const THINKING_SAY: Record<Thinking, string> = {
  auto: "as much as each step needs: little for simple asks, more after a failure",
  off: "no thinking, straight to the answer",
  low: `a short think (about ${BUDGET[1]} tokens)`,
  high: `a long think (about ${BUDGET[3]} tokens)`,
  max: "no limit, the model's own habit",
};

// One line for the system prompt; reasoning models read it before they start.
export const THINKING_PROMPT: Record<Thinking, string> = {
  auto: "Think only as much as the step needs. For a simple, clear step (a small edit, a rename, running a command, reading a file) act at once without deliberating; save careful thought for bugs, design and anything that failed.",
  off: "Do not deliberate. Act or answer directly.",
  low: "Keep your thinking short: a few lines, then act.",
  high: "",
  max: "",
};

export type AskSize = "simple" | "normal" | "hard";

const HARD = /\b(why|debug|crash(es|ed|ing)?|bug|broken|doesn'?t work|not working|fails?|failing|error|exception|stack ?trace|design|architect\w*|refactor|optimi[sz]e|performance|slow|algorithm|race condition|deadlock|security|migrat\w*|plan|compare|trade-?offs?|explain how|from scratch|whole|entire|complex)\b/i;
const SIMPLE = /^(please\s+)?(rename|change|make|set|add|remove|delete|move|open|run|start|stop|show|list|print|read|what('?s| is)|where|which|fix (the |a )?typo|update|bump|turn|increase|decrease|swap|replace|hide|center|thanks|thank you|ok|okay|yes|no|hi|hello|undo|commit|install)\b/i;

// How hard an ask looks, from its words alone. Cheap and wrong sometimes,
// which is why a failure raises the budget again (see planFor).
export function sizeAsk(text: string): AskSize {
  const t = text.trim();
  if (!t) return "normal";
  const lines = t.split("\n").length;
  if (t.length > 600 || lines > 8 || /```/.test(t) || HARD.test(t)) return "hard";
  // One thing, plainly said: "make the button blue", not "add X with Y that Z".
  const words = t.split(/\s+/).length;
  if (words <= 12 && lines <= 2 && SIMPLE.test(t) && !/\b(and then|with|that|which|so that|while)\b/i.test(t)) return "simple";
  return "normal";
}

export type StepState = {
  // 0 for the turn's first request.
  step: number;
  // The last round of tool calls failed (or the fix-it loop sent a failed check back).
  failed: boolean;
  // Failures in a row so far.
  failures: number;
};

// The thinking plan for one request.
export function planFor(level: Thinking, size: AskSize, s: StepState): ThinkPlan {
  if (level === "off") return { tier: 0, budget: BUDGET[0], why: "thinking is off" };
  if (level === "low") return { tier: 1, budget: BUDGET[1], why: "thinking is set to low" };
  if (level === "high") return { tier: 3, budget: BUDGET[3], why: "thinking is set to high" };
  if (level === "max") return { tier: 4, budget: Infinity, why: "no limit" };
  const base: Record<AskSize, number> = { simple: 0, normal: 1, hard: 2 };
  let tier = base[size];
  let why = `a ${size} ask`;
  // The first look at a hard ask is where planning pays off.
  if (s.step === 0 && size === "hard") (tier = 3), (why = "the first step of a hard ask");
  if (s.failed) {
    tier += Math.min(2, s.failures);
    why = `${s.failures > 1 ? `${s.failures} failures in a row` : "the last step failed"} on ${why}`;
  }
  const t = Math.max(0, Math.min(3, tier)) as Tier;
  return { tier: t, budget: BUDGET[t], why };
}

// The request fields that ask a server to think less (or not at all).
// Unknown fields are ignored by LM Studio, llama.cpp, vLLM and Ollama.
export function thinkingFields(p: ThinkPlan): Record<string, unknown> {
  if (p.tier === 4) return {};
  const on = p.tier > 0;
  return {
    // Qwen3 / Qwen3.5 templates read enable_thinking, DeepSeek's read thinking.
    chat_template_kwargs: { enable_thinking: on, thinking: on },
    reasoning_effort: EFFORT[p.tier],
  };
}

// Servers that rejected the extra fields once (by base URL); they get plain requests from then on.
const plainServers = new Set<string>();
export const sendsFields = (baseURL: string) => !plainServers.has(baseURL);
export const markPlain = (baseURL: string) => plainServers.add(baseURL);
export const resetPlainServers = () => plainServers.clear();

// The model is going round in circles: the same sentence (give or take case
// and punctuation) a third time, or "wait"/"actually"/"hmm" restarts piling up.
export function ruminating(thinking: string): boolean {
  const sentences = thinking
    .split(/(?<=[.!?\n])\s+/)
    .map((s) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, "").replace(/\s+/g, " ").trim())
    .filter((s) => s.length >= 16);
  const seen = new Map<string, number>();
  for (const s of sentences) {
    const n = (seen.get(s) ?? 0) + 1;
    if (n >= 3) return true;
    seen.set(s, n);
  }
  const restarts = thinking.match(/(^|[.!?\n]\s*)(wait|actually|hmm+|but wait|let me re-?(check|think|consider|read))\b/gi)?.length ?? 0;
  return restarts >= 8;
}

// What goes back to the model after a cut: the end of its thinking, which is
// usually the conclusion it was circling, and an order to act.
export function cutNote(thinking: string, why: "budget" | "loop"): string {
  const gist = thinking.trim().slice(-900).replace(/^\S*\s/, "");
  const reason = why === "loop" ? "you started repeating yourself" : "this step needs no more thought";
  return `Note from Maxx: your thinking was stopped because ${reason}. The end of what you thought:\n"""\n${gist}\n"""\nDo not think any further. Make the next tool call now, or answer the user if the task is done.`;
}
