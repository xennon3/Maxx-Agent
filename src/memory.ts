import { join } from "node:path";
import { z } from "zod";
import { defineTool } from "./tools/types.ts";

// Memory notes. Lessons about this project and this machine ("use py, not
// python", "the app is in app/src/main") go into a section of MAXX.md that
// Maxx keeps itself, so the next session starts out knowing them. The system
// prompt already includes MAXX.md; it is not rewritten mid-session, because
// that would throw away the server's prompt cache (slow on a CPU), and the
// model has the lesson in its history anyway.

export const LESSONS_HEADING = "## Lessons (Maxx keeps this list)";
const MAX_LESSONS = 20;

export const MEMORY_PROMPT = "When you learn something about this project or machine that would save time next session (which command works, where things are), call remember with one short sentence.";

const norm = (s: string) => s.toLowerCase().replace(/[`'".]/g, "").replace(/\s+/g, " ").trim();

export function lessonsIn(md: string): string[] {
  const at = md.indexOf(LESSONS_HEADING);
  if (at < 0) return [];
  const body = md.slice(at + LESSONS_HEADING.length).split(/\n#{1,2} /)[0]!;
  return body.split("\n").filter((l) => l.startsWith("- ")).map((l) => l.slice(2).trim());
}

// Add a lesson to the MAXX.md text; the oldest drop off past the limit.
export function withLesson(md: string, lesson: string): { md: string; added: boolean } {
  const text = lesson.replace(/\s+/g, " ").trim().replace(/^- /, "").slice(0, 200);
  const old = lessonsIn(md);
  if (!text || old.some((l) => norm(l) === norm(text))) return { md, added: false };
  const list = [...old, text].slice(-MAX_LESSONS).map((l) => `- ${l}`).join("\n");
  const at = md.indexOf(LESSONS_HEADING);
  if (at < 0) {
    const base = md.trimEnd();
    return { md: `${base ? base + "\n\n" : "# Notes for Maxx\n\n"}${LESSONS_HEADING}\n\n${list}\n`, added: true };
  }
  const after = md.slice(at + LESSONS_HEADING.length);
  const next = after.search(/\n#{1,2} /);
  const rest = next < 0 ? "" : after.slice(next);
  return { md: `${md.slice(0, at)}${LESSONS_HEADING}\n\n${list}\n${rest}`, added: true };
}

export async function addLesson(cwd: string, lesson: string): Promise<boolean> {
  const file = Bun.file(join(cwd, "MAXX.md"));
  const md = (await file.exists()) ? await file.text() : "";
  const r = withLesson(md, lesson);
  if (r.added) await Bun.write(join(cwd, "MAXX.md"), r.md);
  return r.added;
}

export const rememberTool = defineTool({
  name: "remember",
  description: "Save a short lesson about this project or machine to MAXX.md, so future sessions know it. Example: \"Use py, not python, on this PC.\"",
  schema: z.object({ note: z.string().describe("One short sentence") }),
  // It only appends a bullet to MAXX.md, so it never asks first.
  risk: "read",
  checkpoint: false,
  async run({ note }, { cwd }) {
    return (await addLesson(cwd, note)) ? "Saved to MAXX.md. Carry on with the task." : "Already in MAXX.md. Carry on with the task.";
  },
});

// A command failed and a near copy of it then worked, with only the program
// swapped (`python a.py` -> `py a.py`, `./gradlew build` -> `.\gradlew.bat build`).
// That is a fact about this machine worth keeping.
export function swapLesson(failed: string, worked: string): string | null {
  const split = (c: string) => {
    const m = c.trim().match(/^(\S+)\s*(.*)$/);
    return m ? [m[1]!, m[2]!.trim()] : ["", ""];
  };
  const [a, restA] = split(failed), [b, restB] = split(worked);
  if (!a || !b || a === b || restA !== restB) return null;
  return `Use \`${b}\` instead of \`${a}\` here (\`${a}\` did not work).`;
}

// `check: <command>` in MAXX.md sets the command the fix-it loop runs.
export function checkFromNotes(md: string): string | undefined {
  return md.match(/^check:\s*(.+)$/im)?.[1]?.trim().replace(/^`(.*)`$/, "$1");
}
