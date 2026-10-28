// How much Maxx says: small local models pad every answer with background,
// recaps and offers of more help, which costs tokens a 16K context can't spare.
// Brief by default. The setting only shapes the prompt; nothing is cut off, so
// a tool call or a file write is never truncated.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { maxxHome } from "./sessions.ts";

export const BREVITY = ["brief", "normal", "detailed"] as const;
export type Brevity = (typeof BREVITY)[number];
export const DEFAULT_BREVITY: Brevity = "brief";

export const brevityFile = () => join(maxxHome(), "brevity.json");

export function parseBrevity(v: string): Brevity | undefined {
  const s = v.trim().toLowerCase();
  return BREVITY.find((b) => b === s || b[0] === s);
}

export async function loadBrevity(): Promise<Brevity> {
  try {
    const saved = (JSON.parse(await readFile(brevityFile(), "utf8")) as { level?: string }).level;
    return (saved && parseBrevity(saved)) || DEFAULT_BREVITY;
  } catch {
    return DEFAULT_BREVITY;
  }
}

// Saved for both `maxx` and `maxx ui`.
export async function saveBrevity(level: Brevity) {
  await mkdir(maxxHome(), { recursive: true });
  await writeFile(brevityFile(), JSON.stringify({ level }, null, 2) + "\n");
}

// The flag beats the environment ($MAXX_BREVITY), which beats the saved setting.
export async function resolveBrevity(flag?: string, env = process.env): Promise<Brevity> {
  const v = flag ?? env.MAXX_BREVITY;
  if (v === undefined || v === "") return loadBrevity();
  const level = parseBrevity(v);
  if (!level) throw new Error(`--brevity takes brief, normal or detailed, not "${v}"`);
  return level;
}

// One line each: the model reads it on every call.
export const BREVITY_PROMPT: Record<Brevity, string> = {
  brief: "Be brief. Answer in as few words as it takes: a sentence or a short list. No preamble, no restating the question, no background nobody asked for, no recap, no offers of more help. Do not announce a tool call, just make it. A final summary is one or two lines.",
  normal: "",
  detailed: "Be thorough: explain your reasoning, give useful background and examples, and mention trade-offs and alternatives.",
};

export const BREVITY_LABEL: Record<Brevity, string> = { brief: "✂ Brief", normal: "✎ Normal", detailed: "📖 Detailed" };
