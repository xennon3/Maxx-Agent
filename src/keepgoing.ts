// Keeping a turn going until the work is done. A turn used to stop dead at 50
// steps, in the middle of fixing 42 Kotlin compile errors, with the build still
// broken. Three things fix that:
// - momentum: at the step limit, a turn that is still changing things (files
//   edited, plan steps ticked, fewer build errors) gets more steps, up to a hard
//   cap; a turn that only reads and searches stops as before;
// - a build that fails with many errors gets a digest (how many, in which files)
//   and a nudge to fix a whole file in one edit_file call;
// - a file looked at again and again in slices (sed -n, grep -n, head) gets a
//   nudge to read it whole once.

// More steps at a time, and how far back a change still counts as "making progress".
export const CHUNK = 25;
export const WINDOW = 20;

// The most steps one turn may take: keepGoing when set (0 = never past the budget), else 4 budgets.
export function stepCap(budget: number, keepGoing?: number): number {
  if (keepGoing === 0) return budget;
  return Math.max(budget, keepGoing ?? budget * 4);
}

// At the limit: the new limit when the turn is still making progress, else 0.
export function moreSteps(o: { step: number; limit: number; cap: number; lastProgress: number }): number {
  if (o.limit >= o.cap) return 0;
  if (o.lastProgress < 0 || o.step - o.lastProgress > WINDOW) return 0;
  return Math.min(o.cap, o.limit + CHUNK);
}

export function extendNote(used: number, limit: number, cap: number): string {
  return `Maxx: you have used ${used} steps on this request. You are still making progress, so you have ${limit - used} more (at most ${cap} in all). Do not start over: carry on from where you are and finish the task. Work in bigger moves: make several tool calls in one step, put all the changes to one file in one edit_file call (edits: [...]), and read a file once, whole, instead of in slices.`;
}

// What a turn did lately, for the user's note.
export function progressSay(what: Map<string, number>): string {
  const bits = [...what].filter(([, n]) => n > 0).map(([k, n]) => `${n} ${k}`);
  return bits.length ? bits.join(", ") : "changes";
}

// ---- Build errors ----

export type Digest = { count: number; files: [string, number][] };

const base = (p: string) => p.replace(/^file:\/+/, "").split(/[\\/]/).pop() ?? p;
const SRC = String.raw`([^\s:()'"]+?\.[A-Za-z]{1,6})`;
const LINES: RegExp[] = [
  // Kotlin: "e: file:///C:/app/Sfx.kt:12:5 Type mismatch" or "e: C:\app\Sfx.kt: (12, 5): ..."
  new RegExp(String.raw`^e:\s+(?:file:\/+)?((?:[A-Za-z]:)?[^\s:()'"]+?\.[A-Za-z]{1,6})(?::\s*\(|:)\d+`),
  // gcc, clang, javac, tsc --pretty false, go, swift: "src/a.ts:12:5: error: ..." / "src/A.java:12: error: ..."
  new RegExp(String.raw`^(?:[A-Za-z]:)?${SRC}:\d+(?::\d+)?:?\s*(?:-\s*)?(?:fatal\s+)?error\b`, "i"),
  // tsc, msbuild: "src/a.ts(12,5): error TS2322: ..."
  new RegExp(String.raw`^(?:[A-Za-z]:)?${SRC}\(\d+,\d+\):\s*error\b`, "i"),
];

// The errors in a build's output: how many, and how many in each file (most first).
export function errorDigest(output: string): Digest | null {
  const seen = new Set<string>();
  const per = new Map<string, number>();
  const lines = output.split(/\r?\n/);
  const add = (line: string, file: string) => {
    if (seen.has(line)) return;
    seen.add(line);
    const f = base(file);
    per.set(f, (per.get(f) ?? 0) + 1);
  };
  for (const [i, raw] of lines.entries()) {
    const line = raw.trim();
    const m = LINES.map((r) => line.match(r)).find(Boolean);
    if (m) add(line, m[1]!);
    // Rust: "error[E0308]: ..." then "  --> src/main.rs:12:5"
    else if (/^error(\[E\d+\])?:/.test(line)) {
      const at = lines.slice(i + 1, i + 4).map((l) => l.match(/-->\s+(\S+?):\d+/)).find(Boolean);
      if (at) add(`${line}@${at[0]}`, at[1]!);
    }
  }
  const count = [...per.values()].reduce((a, b) => a + b, 0);
  if (!count) return null;
  return { count, files: [...per].sort((a, b) => b[1] - a[1]) };
}

// Added to a failed build with several errors: the whole picture, and how to clear it in few steps.
export function digestNote(d: Digest, before?: number): string {
  const top = d.files.slice(0, 8).map(([f, n]) => `${f} (${n})`).join(", ");
  const more = d.files.length > 8 ? ` and ${d.files.length - 8} more files` : "";
  const trend = before === undefined ? "" : d.count < before ? ` (down from ${before}: keep going)` : d.count > before ? ` (up from ${before}: the last change made it worse)` : ` (same as before)`;
  return `\n\nNote from Maxx: ${d.count} build error${d.count === 1 ? "" : "s"}${trend} in ${d.files.length} file${d.files.length === 1 ? "" : "s"}: ${top}${more}. Fix them one file at a time: read the file once, then fix all of its errors in a single edit_file call with edits: [{old_string, new_string}, ...]. Build again only after every file is fixed.`;
}

// ---- Looking at the same file again and again ----

const EXT = "kt|kts|java|ts|tsx|js|jsx|mjs|cjs|py|rs|go|c|cc|cpp|h|hpp|cs|swift|dart|xml|gradle|json|html|css|scss|vue|svelte|rb|php|lua|toml|ya?ml|md|txt|sh|ps1";
const FILE = new RegExp(String.raw`(?:^|[\s'"=])((?:[\w.@-]+[\\/])*[\w.@-]+\.(?:${EXT}))(?=$|[\s'"|;&)])`, "gi");

// A command that only looks at files: cd, sed -n, grep, cat, head... chained or piped, writing nothing.
const LOOK = /^\s*(cd|sed\s+-n|awk|ls|dir|cat|type|head|tail|grep|egrep|rg|find|wc|nl|tree|echo|printf|less|more|sort|uniq|cut|get-content|gc|select-string|get-childitem)\b/i;
export function onlyLooks(command: string): boolean {
  if (/\bsed\s+(-\w*\s+)*-i/.test(command)) return false;
  return command.split(/&&|\|\||;|\|/).every((p) => !p.trim() || (LOOK.test(p) && !/>(?!&)/.test(p.replace(/\d?>&\d|2>\s*\/dev\/null|>\s*\/dev\/null/g, ""))));
}

// The files a command that only looks (sed -n, grep, cat, head...) looks at.
export function peekedFiles(command: string): string[] {
  const out = new Set<string>();
  for (const m of command.matchAll(FILE)) out.add(base(m[1]!).toLowerCase());
  return [...out];
}

export const PEEK_WARN = 3;
export function peekNote(file: string, n: number): string {
  return `\n\nNote from Maxx: you have now looked at ${file} ${n} times this turn, in pieces, one step each. Read it whole once with read_file (no offset or limit) and work from that; look again only after you change it.`;
}
