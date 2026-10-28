// Brain swap: the local model does the routine steps, and when it gets stuck
// Maxx hands the hard step to a bigger "helper" model, then hands back.
// Off unless a helper is configured, so a plain install never leaves the machine.

import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { LLMConfig } from "./llm.ts";
import { maxxHome } from "./sessions.ts";

export type HelperKind = "lmstudio" | "openai" | "anthropic";

export type Helper = {
  kind: HelperKind;
  // Turned off in settings, but remembered for next time.
  off?: boolean;
  model: string;
  // openai: the API's base URL. lmstudio uses the main server; anthropic the default endpoint.
  baseURL?: string;
  apiKey?: string;
  // Consecutive failed tool calls before escalating (a repeat loop or invalid calls escalate right away).
  afterFailures?: number;
  // Escalations allowed in one user turn, which bounds what a stuck turn can cost.
  maxPerTurn?: number;
  // Steps the helper may take on one escalation before handing back anyway.
  maxSteps?: number;
};

export const HELPER_DEFAULTS = { afterFailures: 3, maxPerTurn: 3, maxSteps: 4 };
// Suggestions for the settings form; any model id works.
export const CLAUDE_MODELS = ["claude-opus-5-5", "claude-sonnet-5-5", "claude-haiku-5-5", "claude-fable-5-1"];

export const helperFile = () => join(maxxHome(), "helper.json");

export function helperLLM(h: Helper, mainBaseURL: string): LLMConfig {
  if (h.kind === "anthropic") return { provider: "anthropic", baseURL: h.baseURL ?? "", model: h.model, apiKey: h.apiKey || process.env.ANTHROPIC_API_KEY };
  if (h.kind === "openai") return { baseURL: h.baseURL || "https://api.openai.com/v1", model: h.model, apiKey: h.apiKey || process.env.OPENAI_API_KEY };
  return { baseURL: mainBaseURL, model: h.model };
}

export const describeHelper = (h: Helper) =>
  `${h.model} (${h.kind === "anthropic" ? "Claude API" : h.kind === "openai" ? new URL(h.baseURL || "https://api.openai.com/v1").host : "LM Studio"})`;

// The helper's model id says which kind it probably is.
export const guessKind = (model: string, baseURL?: string): HelperKind => (/^claude-/.test(model) && !baseURL ? "anthropic" : baseURL ? "openai" : "lmstudio");

export async function loadHelper(): Promise<Helper | null> {
  try {
    const h = JSON.parse(await readFile(helperFile(), "utf8")) as Helper;
    return h?.model ? h : null;
  } catch {
    return null;
  }
}

// Saved for both `maxx` and `maxx ui`. The file can hold an API key, so it is
// readable by this user only (on Windows, the profile folder already is).
export async function saveHelper(h: Helper | null) {
  await mkdir(maxxHome(), { recursive: true });
  await writeFile(helperFile(), JSON.stringify(h ?? {}, null, 2));
  await chmod(helperFile(), 0o600).catch(() => {});
}

// Flags beat the environment, which beats the saved settings. `--helper off` turns it off.
export async function resolveHelper(flags: { model?: string; url?: string; kind?: string; after?: string }, env = process.env): Promise<Helper | null> {
  const model = flags.model ?? env.MAXX_HELPER;
  if (model === "off" || model === "none") return null;
  const saved = await loadHelper();
  if (!model) return saved && !saved.off ? saved : null;
  const baseURL = flags.url ?? env.MAXX_HELPER_URL;
  const kind = (flags.kind ?? env.MAXX_HELPER_KIND ?? guessKind(model, baseURL)) as HelperKind;
  if (!["lmstudio", "openai", "anthropic"].includes(kind)) throw new Error(`unknown helper kind ${kind}; use lmstudio, openai or anthropic`);
  const after = Number(flags.after ?? env.MAXX_HELPER_AFTER);
  return {
    ...(saved?.kind === kind ? saved : {}),
    off: false,
    kind,
    model,
    ...(baseURL ? { baseURL } : {}),
    ...(env.MAXX_HELPER_KEY ? { apiKey: env.MAXX_HELPER_KEY } : {}),
    ...(after > 0 ? { afterFailures: after } : {}),
  };
}

// A tool result that means the step did not work.
export const failed = (result: string) => /^error\b/.test(result) || /^exit code: (?!0$)\S/m.test(result);

export function brief(reason: string, local: string): string {
  return `Note from Maxx: the local model (${local}) got stuck on this step: ${reason}. You are a stronger model brought in for the hard part. Work out what went wrong from the conversation above, then fix the blocker with as few tool calls as possible. Control goes back to the local model as soon as one of your steps works, so leave things in a state it can continue from. If the whole task is already done, reply to the user instead.`;
}
