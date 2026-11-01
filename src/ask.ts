import { z } from "zod";
import { defineTool, type Tool } from "./tools/types.ts";
import type { Message } from "./llm.ts";

// Follow-up questions. When a request leaves something only the user can
// decide (which framework, keep or replace the old page, what the app is
// called), the model calls ask_user instead of guessing or ending its turn
// with a question. The turn pauses, the user picks a choice or types an
// answer, and the work carries on with it. Questions never need permission
// and are asked in every mode, even "Never ask", which is about approvals.

export type Question = {
  id: string;
  question: string;
  // Up to four short answers to click; the user may always type their own.
  choices: string[];
  // What the model would pick. It is preselected, and used when nobody answers in time.
  guess?: string;
  // When an unanswered question gives up and the guess is used (epoch ms). Unset: wait for ever.
  deadline?: number;
};

// The answer, or null when nobody answered (no one there, timed out, stopped).
export type AskFn = (q: Question, signal: AbortSignal) => Promise<string | null>;

// Weak models like to ask about everything; past this many in one turn, they decide.
export const MAX_QUESTIONS = 3;
const MAX_CHOICES = 4;

export const ASK_PROMPT =
  "If the request leaves an important choice open that only the user can make (and guessing wrong would waste real work), call ask_user with one short question, a few choices, and your guess. Do not ask about things you can find out by reading the files, and do not ask for permission to do what was asked. Never end your reply with a question while there is still work to do; use ask_user instead.";

const askSchema = z.object({
  question: z.string().min(3).describe("One short, specific question"),
  choices: z.array(z.string()).optional().describe("2 to 4 short answers the user can click (they can also type their own)"),
  guess: z.string().optional().describe("The answer you would pick yourself; used if the user does not answer"),
});

// Small models send choices as one string ("React, Vue or Svelte") or with numbering.
export function cleanChoices(raw: unknown): string[] {
  const list = Array.isArray(raw) ? raw.map(String) : typeof raw === "string" ? raw.split(/\s*(?:\n|;|\||,|\bor\b)\s*/i) : [];
  const out: string[] = [];
  for (const c of list) {
    const t = c.replace(/^\s*(?:\d+[.)]|[-*•]|[a-d][.)])\s*/i, "").replace(/\*\*/g, "").trim().slice(0, 80);
    if (t && !out.some((o) => o.toLowerCase() === t.toLowerCase())) out.push(t);
  }
  return out.slice(0, MAX_CHOICES);
}

// What the model reads back. A typed answer that matches a choice by its number counts as that choice.
export function answerText(q: Pick<Question, "choices" | "guess">, answer: string | null, why: "none" | "timeout" | "stopped" | "limit" = "none"): string {
  if (answer !== null && answer.trim()) {
    const a = answer.trim();
    const n = /^\d$/.test(a) ? q.choices[Number(a) - 1] : undefined;
    return `The user answered: ${n ?? a}`;
  }
  if (why === "limit") return `You have already asked ${MAX_QUESTIONS} questions this turn. Do not ask more; ${q.guess ? `go with your guess (${q.guess})` : "make the most sensible choice"}, carry on, and say what you chose in your final reply.`;
  const who = why === "timeout" ? "The user did not answer in time" : why === "stopped" ? "The user skipped the question" : "Nobody can answer questions right now";
  return `${who}. ${q.guess ? `Go with your guess (${q.guess})` : "Make the most sensible choice yourself"}, carry on, and say what you assumed in your final reply.`;
}

// The tool itself. `ask` comes from the Agent, which knows the IO, the turn's
// signal and Agent mode's wait; `count` how many were asked this turn.
export function askTool(ask: (q: Omit<Question, "id" | "deadline">) => Promise<string>): Tool<typeof askSchema> {
  return defineTool({
    name: "ask_user",
    description: "Ask the user a short follow-up question when the request leaves an important choice open. The work pauses until they answer. Give a few choices and your own guess.",
    schema: askSchema,
    risk: "read",
    checkpoint: false,
    async run(args) {
      const choices = cleanChoices(args.choices);
      const guess = args.guess?.trim() || undefined;
      return ask({ question: args.question.trim(), choices, guess });
    },
  });
}

// For a redrawn transcript: each ask_user call in the history with its answer.
export function questionsIn(history: Message[]): { question: string; answer: string }[] {
  const out: { question: string; answer: string }[] = [];
  for (const [i, m] of history.entries()) {
    if (m.role !== "assistant" || !m.tool_calls) continue;
    for (const c of m.tool_calls) {
      if (c.function.name !== "ask_user") continue;
      let question = "";
      try {
        question = String(JSON.parse(c.function.arguments || "{}").question ?? "");
      } catch {}
      const r = history.slice(i + 1).find((h) => h.role === "tool" && h.tool_call_id === c.id);
      out.push({ question, answer: r && r.role === "tool" ? String(r.content) : "" });
    }
  }
  return out;
}

// Agent mode's briefing: before planning, the questions that would change the plan.
export function briefingMessages(goal: string, map: string): Message[] {
  return [
    { role: "system", content: "You help a coding agent understand a goal before it starts. You do not write code or plans." },
    {
      role: "user",
      content:
        `Goal: ${goal}\n\n${map}\n\n` +
        "Is anything important about this goal unclear, where a wrong guess would mean redoing work (what kind of app, which platform, what it must do)? " +
        "If so, write at most 3 questions, one per line, as:\nQ: question | choices: a; b; c | guess: your pick\n" +
        "If the goal is clear enough to start, reply with the single word CLEAR. Do not ask about details the agent can decide itself (colors, file names, libraries).",
    },
  ];
}

export function parseBriefing(text: string): Omit<Question, "id" | "deadline">[] {
  const body = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  if (/^\W*CLEAR\W*$/i.test(body)) return [];
  const out: Omit<Question, "id" | "deadline">[] = [];
  for (const line of body.split("\n")) {
    const m = line.trim().match(/^(?:\d+[.)]\s*)?(?:\*\*)?Q(?:uestion)?\s*\d*\s*(?:\*\*)?\s*[:.)-]\s*(.+)$/i);
    if (!m) continue;
    const parts = m[1]!.split("|").map((p) => p.trim());
    const question = parts[0]!.replace(/\*\*/g, "").trim();
    if (question.length < 5) continue;
    const field = (name: string) => parts.find((p) => new RegExp(`^${name}\\s*:`, "i").test(p))?.replace(/^\w+\s*:\s*/, "");
    const choices = cleanChoices(field("choices")?.split(/\s*;\s*/) ?? []);
    out.push({ question: question.slice(0, 300), choices, guess: field("guess")?.trim() || undefined });
    if (out.length >= MAX_QUESTIONS) break;
  }
  return out;
}
