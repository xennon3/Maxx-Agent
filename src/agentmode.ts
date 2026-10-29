import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Agent } from "./loop.ts";
import type { ContentPart, Message } from "./llm.ts";
import type { Image } from "./image.ts";
import type { CheckResult } from "./fixit.ts";
import { maxxHome } from "./sessions.ts";
import { mapBudget, projectMap } from "./projectmap.ts";
import { TEMPLATES } from "./templates/index.ts";
import { judgeLLM, judgeMessages, parseVerdict, pickSurface, type SurfaceOptions, type Verdict } from "./judge.ts";

// Agent mode. The user gives a goal ("build a weather app and run it on my
// phone"); Maxx has the model split it into a few tasks, then works through
// them one by one with no approvals for edits: each task starts from a
// snapshot, its result is checked (the model's own word, the build, and a
// screenshot when the screen changed), and a task that fails is rewound and
// tried again a different way. It stops when every task is done, or when one
// still fails after its tries. The budgets grow with the context window, so
// the same code drives a 4B model on a laptop and a big one on a workstation.

export type TaskStatus = "todo" | "doing" | "checking" | "done" | "failed";
export type Task = { text: string; check: string; status: TaskStatus; tries: number; note?: string; files?: number };
export type Board = { goal: string; state: "planning" | "running" | "done" | "stuck" | "stopped"; tasks: Task[]; current: number; note?: string };

export type AgentModeSettings = {
  // Most tasks the planner may write.
  maxTasks: number;
  // Model steps (tool calls) one try at a task may take.
  stepsPerTask: number;
  // Tries per task; each failed one is rewound before the next.
  tries: number;
  // Screenshot the result after UI changes and let the vision model check it.
  judge: boolean;
  // Fix rounds the judge may ask for per task.
  judgeFixes: number;
  // Tokens of project map in the planner's and the tasks' prompts.
  mapTokens: number;
};

// Defaults by context window: what fits a 4B model at 16K, and what a 70B+ model at 128K can take.
export function agentDefaults(contextWindow: number): AgentModeSettings {
  const map = mapBudget(contextWindow);
  if (contextWindow < 32_000) return { maxTasks: 6, stepsPerTask: 20, tries: 2, judge: true, judgeFixes: 1, mapTokens: map };
  if (contextWindow < 64_000) return { maxTasks: 8, stepsPerTask: 35, tries: 2, judge: true, judgeFixes: 2, mapTokens: map };
  return { maxTasks: 12, stepsPerTask: 60, tries: 3, judge: true, judgeFixes: 2, mapTokens: map };
}

const LIMITS: Record<Exclude<keyof AgentModeSettings, "judge">, [number, number]> = { maxTasks: [1, 30], stepsPerTask: [3, 200], tries: [1, 5], judgeFixes: [0, 5], mapTokens: [0, 20_000] };

// Saved choices only; anything left out follows the defaults for the context window.
export type SavedAgentSettings = Partial<AgentModeSettings>;
export const agentFile = () => join(maxxHome(), "agent.json");

export function cleanSettings(raw: Record<string, unknown>): SavedAgentSettings {
  const out: SavedAgentSettings = {};
  for (const [k, [lo, hi]] of Object.entries(LIMITS) as [keyof typeof LIMITS, [number, number]][]) {
    const v = raw[k];
    if (v === undefined || v === null || v === "") continue;
    const n = Math.round(Number(v));
    if (Number.isFinite(n)) out[k] = Math.min(hi, Math.max(lo, n));
  }
  if (typeof raw.judge === "boolean") out.judge = raw.judge;
  return out;
}

export async function loadAgentSettings(): Promise<SavedAgentSettings> {
  try {
    return cleanSettings(JSON.parse(await readFile(agentFile(), "utf8")));
  } catch {
    return {};
  }
}

export async function saveAgentSettings(s: SavedAgentSettings) {
  await mkdir(maxxHome(), { recursive: true });
  await writeFile(agentFile(), JSON.stringify(cleanSettings(s as Record<string, unknown>), null, 2) + "\n");
}

export const agentSettings = (contextWindow: number, saved: SavedAgentSettings = {}): AgentModeSettings => ({ ...agentDefaults(contextWindow), ...saved });

// "1. Add the form | check: it shows two fields" and its many small-model variants.
export function parseTasks(text: string, max: number): { text: string; check: string }[] {
  const lines = text.replace(/<think>[\s\S]*?<\/think>/g, "").split("\n").map((l) => l.trim()).filter(Boolean);
  const listed = lines.filter((l) => /^(?:\d+[.)]|[-*•]|\[[ xX]?\])\s+/.test(l));
  const out: { text: string; check: string }[] = [];
  for (const line of listed.length ? listed : lines) {
    const body = line.replace(/^(?:(?:\d+[.)]|[-*•]|\[[ xX]?\])\s*)+/, "").replace(/\*\*/g, "").trim();
    if (!body || /:$/.test(body) || /^(tasks?|plan|here|goal)\b/i.test(body)) continue;
    const m = body.match(/^(.*?)\s*(?:\||—|–|--|->|;)\s*(?:check|done when|verify|test|done if)?\s*:?\s*(.+)$/i) ?? body.match(/^(.*?)\s*\((?:check|done when|verify)\s*:?\s*(.+)\)$/i);
    const task = (m ? m[1]! : body).trim().replace(/[.;]$/, "");
    if (task.length < 3) continue;
    out.push({ text: task.slice(0, 160), check: (m ? m[2]! : "").trim().slice(0, 160) });
    if (out.length >= max) break;
  }
  return out;
}

export function planMessages(goal: string, map: string, max: number, empty: boolean): Message[] {
  const templates = TEMPLATES.map((t) => `${t.id} (${t.about})`).join("; ");
  return [
    { role: "system", content: "You plan work for a coding agent. You split a goal into a short list of concrete tasks, in order. You do not write code." },
    {
      role: "user",
      content:
        `Goal: ${goal}\n\n${map}\n\n` +
        `Write 2 to ${max} tasks, one per line, as: number. task | check\n` +
        "Each task is one small step the agent can finish and test on its own. The check says how to see it worked (a build passes, a page shows something, the app runs on the phone).\n" +
        (empty ? `The folder is empty, so the first task should start from a template with use_template. Templates: ${templates}.\n` : "") +
        "Example:\n1. Start from the web app template | check: index.html opens in the preview\n2. Add a tip percentage field | check: the page shows the field and no console errors\n" +
        "Reply with the list only.",
    },
  ];
}

const mark = (t: Task, i: number, cur: number) => (t.status === "done" ? "[x]" : i === cur ? "[>]" : t.status === "failed" ? "[!]" : "[ ]");
export const formatBoard = (b: Board) => b.tasks.map((t, i) => `${mark(t, i, b.current)} ${i + 1}. ${t.text}`).join("\n");

export function taskPrompt(b: Board, map: string, retry: string): string {
  const t = b.tasks[b.current]!;
  return [
    `Maxx: Agent mode, task ${b.current + 1} of ${b.tasks.length}.`,
    `Goal: ${b.goal}`,
    formatBoard(b),
    "",
    `Do task ${b.current + 1} now: ${t.text}`,
    t.check ? `Done when: ${t.check}` : "",
    retry ? `Your last try at this task failed (${retry}), so Maxx put the files back the way they were before it. Do not repeat that approach; try a different one.` : "",
    map,
    "Work on this task only. When it is done and checked, reply with one short line starting with DONE. If you cannot do it, reply STUCK: and why.",
  ].filter(Boolean).join("\n");
}

// Did the try work? The model's own word and the fix-it loop's last check decide.
export function outcome(answer: string, check: CheckResult | null): { ok: boolean; why: string } {
  if (/^Stopped:/.test(answer.trim())) return { ok: false, why: answer.trim().replace(/^Stopped:\s*/, "").split("\n")[0]!.slice(0, 200) };
  const stuck = answer.match(/^\W*STUCK\b\W*(.*)$/im);
  if (stuck) return { ok: false, why: `the model is stuck: ${stuck[1]!.trim().slice(0, 200) || "no reason given"}` };
  if (check && !check.ok) return { ok: false, why: `${check.what} still fails` };
  return { ok: true, why: "" };
}

export type GoalEvents = {
  board(b: Board): void;
  // The screenshot the judge looked at, for UIs that can show it.
  image?(label: string, images: Image[]): void;
};

export type GoalOptions = {
  settings: AgentModeSettings;
  signal?: AbortSignal;
  // Where the judge can take screenshots; without it the judge only uses file:// pages and the phone.
  surfaces?: Omit<SurfaceOptions, "cwd" | "changed" | "android">;
};

const asReport = (text: string): ContentPart[] => [{ type: "text", text }];

export async function runGoal(agent: Agent, goal: string, events: GoalEvents, o: GoalOptions): Promise<Board> {
  const s = o.settings;
  const board: Board = { goal, state: "planning", tasks: [], current: 0 };
  agent.board = board;
  const emit = () => events.board(structuredClone(board));
  emit();
  // Every task can be rewound, so edits need no approval; commands still follow the mode.
  const perms = agent.permissions;
  const mode = perms.mode;
  if (mode === "ask") perms.mode = "auto-edit";
  try {
    const map = s.mapTokens > 0 ? await projectMap(agent.cwd, s.mapTokens).catch(() => "") : "";
    const empty = /folder is empty|\(0 files|\(1 file;/.test(map) || !map;
    const planned = parseTasks(await agent.think(planMessages(goal, map, s.maxTasks, empty), o.signal), s.maxTasks);
    board.tasks = (planned.length ? planned : [{ text: goal, check: "" }]).map((t) => ({ ...t, status: "todo" as const, tries: 0 }));
    board.state = "running";
    emit();
    // The goal as the user's turn (it titles the session) and the tasks as the answer to it.
    agent.history.push({ role: "user", content: `🤖 ${goal}` }, { role: "assistant", content: `Agent mode: I split this into ${board.tasks.length} task${board.tasks.length > 1 ? "s" : ""} and will work through them one by one.\n${formatBoard(board)}` });

    for (; board.current < board.tasks.length; board.current++) {
      const task = board.tasks[board.current]!;
      task.status = "doing";
      emit();
      agent.clearPlan();
      const before = await agent.checkpoints.snapshot(`agent: before task ${board.current + 1}`);
      let retry = "";
      for (;;) {
        task.tries++;
        task.status = "doing";
        emit();
        // The map costs context, so it goes with the first task and with retries only.
        const fresh = s.mapTokens > 0 && (board.current === 0 || retry) ? await projectMap(agent.cwd, s.mapTokens).catch(() => "") : "";
        let answer = await agent.send(asReport(taskPrompt(board, fresh, retry)), o.signal, { maxSteps: s.stepsPerTask });
        let r = outcome(answer, agent.lastCheck);
        if (r.ok && s.judge) {
          const j = await judgeTask(agent, board, task, before, events, o, emit);
          if (j && !j.pass) task.note = `screenshot judge: ${j.why}`;
          for (let fix = 0; j && !j.pass && fix < s.judgeFixes && r.ok; fix++) {
            task.status = "doing";
            emit();
            answer = await agent.send(asReport(`Maxx checked a screenshot of the result. The vision model says: FAIL: ${j.why}\nFix this, then reply with one line starting with DONE.`), o.signal, { maxSteps: s.stepsPerTask });
            r = outcome(answer, agent.lastCheck);
            if (!r.ok) break;
            const again = await judgeTask(agent, board, task, before, events, o, emit);
            if (!again) break;
            Object.assign(j, again);
            task.note = again.pass ? undefined : `screenshot judge: ${again.why}`;
          }
        }
        if (r.ok) {
          task.status = "done";
          if (!task.note?.startsWith("screenshot")) task.note = task.tries > 1 ? `done on try ${task.tries}` : undefined;
          task.files = before ? (await agent.checkpoints.changed(before)).length : undefined;
          emit();
          break;
        }
        // Keep the failed try (/checkpoints lists it), then rewind to before the task.
        await agent.checkpoints.snapshot(`agent: task ${board.current + 1} try ${task.tries} (failed)`);
        const back = before ? await agent.checkpoints.rewind(before) : { ok: false, removed: [], error: "no snapshot" };
        if (back.ok) agent.note(`(Agent mode: rewound the files to before task ${board.current + 1})`);
        if (task.tries >= s.tries || !back.ok) {
          task.status = "failed";
          task.note = r.why;
          board.state = "stuck";
          board.note = `Stuck on task ${board.current + 1} after ${task.tries} ${task.tries > 1 ? "tries" : "try"}: ${r.why}.${back.ok ? " The files are back the way they were before it." : ""}`;
          agent.history.push({ role: "assistant", content: board.note });
          emit();
          return board;
        }
        retry = r.why;
        task.note = `try ${task.tries} failed: ${r.why}; rewound`;
        emit();
      }
    }
    board.state = "done";
    board.current = board.tasks.length;
    board.note = `All ${board.tasks.length} tasks done.`;
    emit();
    return board;
  } catch (e) {
    if ((e as Error).name !== "AbortError") throw e;
    board.state = "stopped";
    board.note = "Stopped.";
    const t = board.tasks[board.current];
    if (t && t.status !== "done") t.status = "todo";
    emit();
    return board;
  } finally {
    if (perms.mode === "auto-edit" && mode === "ask") perms.mode = mode;
  }
}

// Screenshot what the task changed and ask the vision model about it. Null: nothing to look at.
async function judgeTask(agent: Agent, board: Board, task: Task, before: string | null, events: GoalEvents, o: GoalOptions, emit: () => void): Promise<Verdict | null> {
  const llm = judgeLLM(agent.llm, agent.vision);
  if (!llm || !before) return null;
  const changed = await agent.checkpoints.changed(before);
  const surface = await pickSurface({ cwd: agent.cwd, changed, android: agent.toolsets.includes("android"), ...o.surfaces }).catch(() => null);
  if (!surface) return null;
  task.status = "checking";
  emit();
  try {
    agent.note(`(Agent mode: checking a screenshot of ${surface.label})`);
    const image = await surface.shoot(o.signal);
    events.image?.("judge", [image]);
    const v = parseVerdict(await agent.think(judgeMessages(board.goal, task.text, image, surface.label), o.signal, llm));
    agent.note(`(screenshot judge: ${v.pass ? "PASS" : "FAIL"}${v.why ? `, ${v.why}` : ""})`);
    return v;
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    agent.note(`(screenshot judge skipped: ${(e as Error).message})`);
    return null;
  }
}
