import { z } from "zod";
import { defineTool } from "./types.ts";
import { inside } from "./paths.ts";
import { lineDiff } from "../diff.ts";

// "already": old_string is gone but new_string is there, so the edit was made before.
export type EditResult = { ok: true; text: string; how: "exact" | "whitespace" | "already" } | { ok: false; error: string };

// Apply a search/replace edit, forgiving the indentation slips local models make.
// Files with Windows (CRLF) line endings keep them; the model always works in LF.
export function applyEdit(source: string, oldStr: string, newStr: string, replaceAll = false): EditResult {
  const crlf = source.includes("\r\n");
  const lf = (s: string) => s.replace(/\r\n/g, "\n");
  const r = applyEditLF(crlf ? lf(source) : source, lf(oldStr), lf(newStr), replaceAll);
  return r.ok && crlf ? { ...r, text: r.text.replace(/\n/g, "\r\n") } : r;
}

function applyEditLF(source: string, oldStr: string, newStr: string, replaceAll: boolean): EditResult {
  if (oldStr === "") return { ok: false, error: "old_string is empty; use write_file to create a file" };

  const count = source.split(oldStr).length - 1;
  if (count === 1 || (count > 1 && replaceAll)) {
    return { ok: true, text: source.split(oldStr).join(newStr), how: "exact" };
  }
  if (count > 1) {
    return { ok: false, error: `old_string matches ${count} places; add surrounding lines to make it unique, or set replace_all` };
  }

  // Fallback: match line by line ignoring leading/trailing whitespace.
  const src = source.split("\n");
  const want = oldStr.replace(/\n$/, "").split("\n");
  const norm = (s: string) => s.trim();
  const hits: number[] = [];
  for (let i = 0; i + want.length <= src.length; i++) {
    if (want.every((w, k) => norm(src[i + k]!) === norm(w))) hits.push(i);
  }
  if (hits.length === 1) {
    const at = hits[0]!;
    // Shift the replacement by however much the model's indentation was off.
    const indentOf = (s: string) => s.match(/^\s*/)![0];
    const have = indentOf(src[at]!), gave = indentOf(want[0]!);
    const repl = newStr.replace(/\n$/, "").split("\n").map((l) => {
      if (!l.trim()) return l;
      return l.startsWith(gave) ? have + l.slice(gave.length) : have + l.trimStart();
    });
    src.splice(at, want.length, ...repl);
    return { ok: true, text: src.join("\n"), how: "whitespace" };
  }
  if (hits.length > 1) return { ok: false, error: `old_string matches ${hits.length} places (ignoring whitespace); include more context` };

  // Small models resend an edit that already worked; failing it sends them back
  // to re-read and re-apply in a loop. Say it is done instead.
  if (newStr.trim() && contains(src, newStr)) return { ok: true, text: source, how: "already" };

  return { ok: false, error: `old_string not found.${closest(src, want[0]!)} Re-read the file and copy the text exactly.` };
}

function contains(src: string[], text: string): boolean {
  const want = text.replace(/\n$/, "").split("\n").map((l) => l.trim());
  for (let i = 0; i + want.length <= src.length; i++) if (want.every((w, k) => src[i + k]!.trim() === w)) return true;
  return false;
}

// The changed lines with a little context, so the model sees the edit landed.
export function changedLines(before: string, after: string, context = 2, max = 20): string {
  const a = before.split(/\r?\n/), b = after.split(/\r?\n/);
  let top = 0;
  while (top < a.length && top < b.length && a[top] === b[top]) top++;
  let tail = 0;
  while (tail < a.length - top && tail < b.length - top && a[a.length - 1 - tail] === b[b.length - 1 - tail]) tail++;
  const from = Math.max(0, top - context), to = Math.min(b.length, b.length - tail + context);
  const shown = b.slice(from, Math.min(to, from + max)).map((l, i) => `${String(from + i + 1).padStart(5)}  ${l}`);
  return shown.join("\n") + (to - from > max ? `\n... ${to - from - max} more changed lines` : "");
}

function closest(lines: string[], first: string): string {
  const target = first.trim();
  if (!target) return "";
  let best = -1, score = 0;
  lines.forEach((l, i) => {
    const s = similarity(l.trim(), target);
    if (s > score) (score = s), (best = i);
  });
  return score > 0.6 ? ` The closest line is ${best + 1}: "${lines[best]!.trim()}".` : "";
}

function similarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const grams = (s: string) => new Set(Array.from({ length: Math.max(1, s.length - 1) }, (_, i) => s.slice(i, i + 2)));
  const A = grams(a), B = grams(b);
  let common = 0;
  for (const g of A) if (B.has(g)) common++;
  return (2 * common) / (A.size + B.size);
}

const schema = z.object({
  path: z.string().describe("File to edit"),
  old_string: z.string().describe("Exact text to replace, including a few lines of context"),
  new_string: z.string().describe("Replacement text"),
  replace_all: z.boolean().optional().describe("Replace every occurrence"),
});

async function plan(args: z.infer<typeof schema>, cwd: string) {
  const file = Bun.file(inside(cwd, args.path));
  if (!(await file.exists())) return { before: "", result: { ok: false, error: `${args.path} does not exist` } as EditResult };
  const before = await file.text();
  return { before, result: applyEdit(before, args.old_string, args.new_string, args.replace_all) };
}

export const editFile = defineTool({
  name: "edit_file",
  description:
    "Replace old_string with new_string in a file. old_string must match exactly once; include surrounding lines to make it unique. Read the file first.",
  schema,
  risk: "write",
  ruleKey: (a) => a.path,
  async preview(args, { cwd }) {
    const { before, result } = await plan(args, cwd);
    if (!result.ok) return `(this edit will fail: ${result.error})`;
    return result.text === before ? "(no change: the file already has this text)" : lineDiff(before, result.text);
  },
  async run(args, { cwd }) {
    const { before, result } = await plan(args, cwd);
    if (!result.ok) return `error: ${result.error}`;
    const done = `Do not repeat this edit; go on with the next step.`;
    if (result.how === "already") return `no change: ${args.path} already contains new_string, so this edit was made earlier. ${done}`;
    if (result.text === before) return `no change: new_string is the same as the text it replaces in ${args.path}. ${done}`;
    await Bun.write(inside(cwd, args.path), result.text);
    return `edited ${args.path}${result.how === "whitespace" ? " (matched ignoring whitespace)" : ""}. It now reads:\n${changedLines(before, result.text)}`;
  },
});
