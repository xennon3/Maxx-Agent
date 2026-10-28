import { z } from "zod";
import { defineTool, type Tool } from "./tools/types.ts";
import type { Message } from "./llm.ts";

// Plan first, then type. A 4B model wanders off after a few tool calls; a
// short checklist that it writes up front, sees again every time it ticks a
// step, and that the UI pins above the chat keeps it on the task.

export type Step = { text: string; done: boolean };

export const PLAN_PROMPT =
  "For a task with more than two steps, first call plan with 3 to 5 short steps (one per line). After finishing each step, call plan with done set to its number. Keep going until every step is done.";

export function parseSteps(text: string): Step[] {
  return text
    .split("\n")
    .map((l) => l.replace(/^\s*(?:(?:[-*•]|\d+[.)]|\[[ xX]?\])\s*)+/, "").trim())
    .filter(Boolean)
    .slice(0, 8)
    .map((t) => ({ text: t.slice(0, 120), done: false }));
}

export function formatPlan(steps: Step[]): string {
  return steps.map((s, i) => `${s.done ? "[x]" : "[ ]"} ${i + 1}. ${s.text}`).join("\n");
}

// Apply one plan call. Returns the text the model sees.
export function applyPlan(steps: Step[], args: { steps?: string; done?: number }): { steps: Step[]; text: string } {
  let next = steps;
  if (args.steps?.trim()) {
    const fresh = parseSteps(args.steps);
    // Rewriting the plan keeps the ticks on steps whose wording did not change.
    next = fresh.map((s) => ({ ...s, done: steps.some((o) => o.done && o.text === s.text) }));
  }
  if (args.done !== undefined) {
    if (!next[args.done - 1]) return { steps: next, text: `error: there is no step ${args.done}; the plan has ${next.length} steps.\n${formatPlan(next)}` };
    next = next.map((s, i) => (i === args.done! - 1 ? { ...s, done: true } : s));
  }
  if (!next.length) return { steps: next, text: "error: give steps, one short step per line" };
  const left = next.findIndex((s) => !s.done);
  const tail = left < 0 ? "All steps are done. Check the result, then reply to the user with a short summary." : `Now do step ${left + 1}: ${next[left]!.text}`;
  return { steps: next, text: `Plan:\n${formatPlan(next)}\n${tail}` };
}

export const planSchema = z.object({
  steps: z.string().optional().describe("The whole plan, one short step per line. Only when making or changing the plan"),
  done: z.number().int().min(1).optional().describe("Number of the step you just finished"),
});

export function planTool(get: () => Step[], set: (s: Step[]) => void): Tool<typeof planSchema> {
  return defineTool({
    name: "plan",
    description: "Write a short step-by-step plan before starting a bigger task, and tick steps off as you finish them. The user sees it pinned on screen.",
    schema: planSchema,
    risk: "read",
    checkpoint: false,
    async run(args) {
      const r = applyPlan(get(), args);
      set(r.steps);
      return r.text;
    },
  });
}

// A resumed session gets its plan back by replaying the plan calls in its history.
export function planFromHistory(history: Message[]): Step[] {
  let steps: Step[] = [];
  for (const m of history) {
    if (m.role !== "assistant" || !m.tool_calls) continue;
    for (const c of m.tool_calls) {
      if (c.function.name !== "plan") continue;
      try {
        const parsed = planSchema.safeParse(JSON.parse(c.function.arguments || "{}"));
        if (parsed.success) steps = applyPlan(steps, parsed.data).steps;
      } catch {}
    }
  }
  return steps;
}
