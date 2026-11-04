// Keeping Maxx from doing finished work twice. Four ways it used to happen:
// - Agent mode rewound a task that only ran out of steps, so the app was built again from scratch;
// - a compaction summary left out that the app was already built, so the model started over;
// - the fix-it check ran the very build the model had just run (and passed);
// - the plan nudge said "do the next step now" when the step was done but not ticked.
// The helpers here are the plain-text side of those fixes.

// Who ran what that worked, kept by Maxx itself (not the model), with the turn it happened in.
export type Done = { turn: number; text: string };
export const KEEP_DONE = 60;

// Add one finished call to the record; the same call again moves to the end instead of repeating.
export function noteDone(done: Done[], turn: number, text: string): Done[] {
  const t = text.trim().slice(0, 160);
  if (!t) return done;
  const next = done.filter((d) => d.text !== t);
  next.push({ turn, text: t });
  return next.slice(-KEEP_DONE);
}

// Appended to a compaction summary: facts from Maxx's own records, which a weak
// summarizer can't drop, plus the request in the user's own words.
export function doneRecord(done: Done[], ask: string): string {
  const lines: string[] = [];
  if (done.length) {
    lines.push(
      "Maxx's own record of what already worked in this session (taken from the tool results, not from the summary above):",
      ...done.map((d) => `- ${d.text}`),
      "That work is done and on disk. Do not build or write it again; read a file if you need to see it. Carry on from what is left.",
    );
  }
  const a = ask.trim();
  if (a) lines.push(`The request being worked on, in the user's words: """${a.slice(0, 1500)}"""`);
  return lines.join("\n");
}

// How much transcript fits in the summarizer's prompt: about half the window, at ~4 characters a token.
export const summaryChars = (window: number) => Math.max(8_000, Math.min(60_000, window * 2));

// Did the model's own command run the same build as Maxx's check? Then a check
// right after it (with no change in between) would only build the app again.
export function sameCheck(ran: string, check: string): boolean {
  const words = (c: string) =>
    c
      .trim()
      .replace(/^cd\s+\.\/?\s*(&&|;)\s*/i, "")
      .split(/\s+/)
      .map((w) => w.replace(/^\.[\\/]/, "").replace(/^gradlew\.bat$/i, "gradlew").toLowerCase())
      .filter(Boolean);
  // A build in another folder, or piped or chained into something else, is not the project's check.
  if (/(^|&&|;|\|\|?)\s*cd\s+(?!\.\/?\s*(&&|;|$))/i.test(ran) || /\|/.test(ran.replace(/\|\|/g, ""))) return false;
  const r = words(ran.split(/&&|;/).pop() ?? ran);
  const c = words(check);
  const cmd = c.filter((w) => !w.startsWith("-"));
  if (!cmd.length || r[0] !== cmd[0]) return false;
  const have = new Set(r);
  return cmd.every((w) => have.has(w));
}

// Agent mode: a try that ran out of steps is not a failed try.
export const STEP_LIMIT = "Stopped: reached the step limit for one turn.";
export const outOfSteps = (answer: string) => answer.trim().startsWith(STEP_LIMIT);

export function finishUpPrompt(task: number, steps: number): string {
  return `Maxx: you used all ${steps} steps for task ${task}, but your work so far is kept (nothing was rewound). Do not start over. If the task is already done, check it in one step and reply DONE. If something is left, finish only that, then reply with one line starting with DONE. If you cannot finish it, reply STUCK: and why.`;
}

// The plan nudge, worded so a finished-but-unticked step gets ticked, not redone.
export function planNudge(open: number[], plan: string): string {
  const s = open.length > 1 ? "s" : "";
  return `Maxx: plan step${s} ${open.join(", ")} not ticked yet.\n${plan}\nLook at what you already did above first. A step that is already done: call plan with done set to its number, and do not do it again. A step that is not done: do it now.`;
}

// Commands that only look (or start what was built) and change no project files.
const LOOKS = /^\s*(ls|dir|cat|type|head|tail|less|more|find|grep|rg|tree|wc|stat|file|pwd|which|where|whoami|date|echo(?![^|]*>)|git\s+(status|diff|log|show|branch)|get-childitem|get-content|test-path|adb\s+(devices|install|shell\s+(am|input|screencap|dumpsys|pm\s+list))|start|open|xdg-open|curl\s+(-s\S*\s+)?(-I\s+)?https?:\/\/(localhost|127\.0\.0\.1))\b/i;
const looksOnly = (c: string) => c.split(/&&|;/).every((p) => LOOKS.test(p) && !/>(?!&)/.test(p.replace(/2>&1/g, "")));

// The model's runs since its last file change. A failed run, or one that may
// have changed files after a passing build, makes the record start over.
export function afterRun(runs: string[], command: string, ok: boolean): string[] {
  if (!ok) return looksOnly(command) ? runs : [];
  if (looksOnly(command)) return runs.length ? [...runs, command] : runs;
  // Anything else may write files (a code generator, sed -i, npm install), so only it counts from here.
  return [command];
}

// The run that already did Maxx's check, if the record has one: the first run
// (everything after it only looked) and it matches the check.
export function builtAlready(runs: string[], check: string): string | null {
  return runs[0] && sameCheck(runs[0], check) ? runs[0] : null;
}
