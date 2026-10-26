import { z } from "zod";
import { defineTool } from "./types.ts";
import { inside } from "./paths.ts";
import { lineDiff } from "../diff.ts";

export type EditResult = { ok: true; text: string; how: "exact" | "whitespace" } | { ok: false; error: string };

// Apply a search/replace edit, forgiving the indentation slips local models make.
export function applyEdit(source: string, oldStr: string, newStr: string, replaceAll = false): EditResult {
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

  return { ok: false, error: `old_string not found.${closest(src, want[0]!)} Re-read the file and copy the text exactly.` };
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
    return result.ok ? lineDiff(before, result.text) : `(this edit will fail: ${result.error})`;
  },
  async run(args, { cwd }) {
    const { result } = await plan(args, cwd);
    if (!result.ok) return `error: ${result.error}`;
    await Bun.write(inside(cwd, args.path), result.text);
    return `edited ${args.path}${result.how === "whitespace" ? " (matched ignoring whitespace)" : ""}`;
  },
});
