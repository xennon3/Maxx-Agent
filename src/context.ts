import { join } from "node:path";
import type { ContentPart, Message } from "./llm.ts";
import { describeShell } from "./shell.ts";

// Rough but dependency-free: ~4 characters per token for code and English.
// An image is counted as a flat ~1000 tokens, not by the length of its base64.
const IMAGE_TOKENS = 1000;
export const estimateTokens = (msgs: Message[]) =>
  msgs.reduce((n, m) => {
    if (!Array.isArray(m.content)) return n + Math.ceil(JSON.stringify(m).length / 4);
    return n + m.content.reduce((k, p) => k + (p.type === "text" ? Math.ceil(p.text.length / 4) : IMAGE_TOKENS), 4);
  }, 0);

export const textOf = (content: string | ContentPart[] | null): string =>
  !content ? "" : typeof content === "string" ? content : content.map((p) => (p.type === "text" ? p.text : "[image]")).join(" ");

// Marks a user turn that carries images the user attached, so it reads as
// something the user said rather than a screenshot a tool took.
export const ATTACHED_IMAGE = "[attached image: ";

// What the user typed in a turn (attachments included), or null when the
// message is not a typed turn (screenshots that follow tool results).
export function typedText(m: Message): string | null {
  if (m.role !== "user") return null;
  if (typeof m.content === "string") return m.content;
  const first = m.content[0];
  return first?.type === "text" && first.text.includes(ATTACHED_IMAGE) ? first.text : null;
}

// Big tool outputs are cut when they are produced, so they never bloat history.
export function truncate(text: string, head = 100, tail = 100): string {
  const lines = text.split("\n");
  if (lines.length <= head + tail) return text.length > 40_000 ? text.slice(0, 40_000) + "\n... truncated" : text;
  return [...lines.slice(0, head), `... ${lines.length - head - tail} lines omitted ...`, ...lines.slice(-tail)].join("\n");
}

export async function systemPrompt(cwd: string, toolsetNotes: string[] = []): Promise<string> {
  const memory = await loadMemory(cwd);
  return [
    "You are Maxx, a coding agent working in the user's terminal on the project in " + cwd + ".",
    "You can read, search and edit files and run shell commands through tools.",
    `Environment: ${describeShell()}.`,
    "Tools and shell commands already run in the project folder: use paths relative to it (like src/main.ts), never absolute paths.",
    "",
    "How to work:",
    "- Look before you change: list or grep, then read the relevant files. In an empty or new project, start right away.",
    "- To make a new app, game, script or web app, call use_template first and change the working starter it creates instead of writing every file yourself.",
    "- Make small, targeted edits with edit_file; copy old_string exactly from read_file output, without the line numbers.",
    "- After changing code, run the tests or a build with bash when the project has them.",
    "- If a tool returns an error, fix the arguments and try again instead of giving up.",
    "- When you are done, reply in plain text with a short summary of what changed. Do not call tools in that final reply.",
    "- If the user denies a tool call, respect it and ask how they want to proceed.",
    ...toolsetNotes.map((n) => "\n" + n),
    memory ? `\nProject notes from ${memory.file}:\n${memory.text}` : "",
  ].join("\n");
}

async function loadMemory(cwd: string) {
  for (const file of ["MAXX.md", "AGENTS.md", "CLAUDE.md"]) {
    const f = Bun.file(join(cwd, file));
    if (await f.exists()) return { file, text: truncate(await f.text(), 200, 0) };
  }
  return null;
}

// Replace the oldest turns with a model-written summary, keeping the system
// prompt and the most recent turns byte-identical (so prefix caching still hits
// for everything after the summary, and the model keeps its working memory).
export async function compact(
  history: Message[],
  summarize: (transcript: string) => Promise<string>,
  keepRecent = 6,
): Promise<Message[]> {
  const [system, ...rest] = history;
  if (!system || rest.length <= keepRecent + 2) return history;
  let cut = rest.length - keepRecent;
  // Never split an assistant tool call from its tool results.
  while (cut < rest.length && rest[cut]!.role === "tool") cut++;
  const old = rest.slice(0, cut), recent = rest.slice(cut);
  const transcript = old
    .map((m) => `${m.role}: ${textOf(m.content)}${"tool_calls" in m && m.tool_calls ? " [tools: " + m.tool_calls.map((t) => t.function.name + " " + t.function.arguments).join("; ") + "]" : ""}`)
    .join("\n")
    .slice(-60_000);
  const summary = await summarize(transcript);
  return [system, { role: "user", content: `Summary of the earlier conversation (older turns were compacted):\n${summary}` }, ...recent];
}
