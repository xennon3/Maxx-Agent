import { existsSync } from "node:fs";
import { mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import type { Agent, AgentIO } from "./loop.ts";
import type { Message } from "./llm.ts";
import type { Image } from "./image.ts";
import { maxxHome, projectKey } from "./sessions.ts";
import { projectMap } from "./projectmap.ts";
import { TEMPLATES } from "./templates/index.ts";
import { briefing, outcome, runGoal, workTask, type AgentModeSettings, type Board } from "./agentmode.ts";
import { Gates, probeParallel, type GateState } from "./gate.ts";

// Crew mode. Like Agent mode, the model splits a goal into tasks, but here
// the tasks say which ones they need first and which files they touch, and
// several workers do them at the same time. Each worker gets its own git
// worktree (a second checkout of the project, outside it), works its task
// there with Agent mode's tries and rewinds, and hands it in. Maxx merges
// each hand-in into a shared integration worktree; when two workers changed
// the same lines, the later one pulls the other's work into its copy and
// sorts out the conflict itself. When everything is merged, one last pass
// checks the pieces fit, and the result lands in the project folder (with a
// snapshot first, so /rewind undoes the lot).
//
// LM Studio answers a fixed number of requests per model at once and queues
// the rest. Workers take turns through a gate per model (gate.ts) with that
// many slots, measured at the start unless set, so a worker running a build
// doesn't hold the model and the board shows who is waiting for it.

export type CrewTaskStatus = "waiting" | "ready" | "doing" | "checking" | "merging" | "fixing" | "done" | "failed";
export type CrewTask = {
  id: number;
  text: string;
  check: string;
  // Tasks (by id) that must be merged before this one starts.
  after: number[];
  // Files the planner expects it to touch; two tasks sharing one don't run at once.
  touches: string[];
  status: CrewTaskStatus;
  tries: number;
  worker?: string;
  note?: string;
  // The worker's one-line hand-in, which later workers read.
  summary?: string;
  files?: number;
};
export type WorkerState = "idle" | "queued" | "thinking" | "working" | "merging";
export type CrewWorker = { name: string; model: string; state: WorkerState; task?: number; doing?: string; tokens?: number; done: number };
export type CrewBoard = {
  kind: "crew";
  goal: string;
  state: "planning" | "running" | "checking" | "applying" | "done" | "stuck" | "stopped";
  tasks: CrewTask[];
  workers: CrewWorker[];
  models: GateState[];
  // Hand-ins and merges, newest last.
  log: string[];
  brief?: string;
  note?: string;
  started: number;
};

export type CrewSettings = {
  // Workers at the same time.
  workers: number;
  // Models the workers use, shared out in turn; empty: the session's model.
  models: string[];
  // Requests LM Studio runs at once per model; 0 measures it at the start.
  slots: number;
  // Most tasks the planner may write.
  maxTasks: number;
  // After the last merge, one pass that runs the build and fixes what doesn't fit together.
  finalCheck: boolean;
};

export const CREW_DEFAULTS: CrewSettings = { workers: 3, models: [], slots: 0, maxTasks: 8, finalCheck: true };
const LIMITS = { workers: [1, 8], slots: [0, 16], maxTasks: [2, 20] } as const;
const NAMES = ["Ada", "Bo", "Cy", "Dee", "Eli", "Flo", "Gus", "Hal"];

export const crewFile = () => join(maxxHome(), "crew.json");

export function cleanCrew(raw: Record<string, unknown>): Partial<CrewSettings> {
  const out: Partial<CrewSettings> = {};
  for (const [k, [lo, hi]] of Object.entries(LIMITS) as [keyof typeof LIMITS, readonly [number, number]][]) {
    const v = raw[k];
    if (v === undefined || v === null || v === "") continue;
    const n = Math.round(Number(v));
    if (Number.isFinite(n)) out[k] = Math.min(hi, Math.max(lo, n));
  }
  if (typeof raw.finalCheck === "boolean") out.finalCheck = raw.finalCheck;
  const models = typeof raw.models === "string" ? raw.models.split(",") : Array.isArray(raw.models) ? raw.models : null;
  if (models) out.models = [...new Set(models.map((m) => String(m).trim()).filter(Boolean))].slice(0, 8);
  return out;
}

export async function loadCrewSettings(): Promise<Partial<CrewSettings>> {
  try {
    return cleanCrew(JSON.parse(await readFile(crewFile(), "utf8")));
  } catch {
    return {};
  }
}

export async function saveCrewSettings(s: Partial<CrewSettings>) {
  await mkdir(maxxHome(), { recursive: true });
  await writeFile(crewFile(), JSON.stringify(cleanCrew(s as Record<string, unknown>), null, 2) + "\n");
}

export const crewSettings = (saved: Partial<CrewSettings> = {}): CrewSettings => ({ ...CREW_DEFAULTS, ...saved });

// "1. Add the form | check: it shows | after: 1 | files: index.html, app.js"
export function parseCrewTasks(text: string, max: number): Omit<CrewTask, "status" | "tries">[] {
  const lines = text.replace(/<think>[\s\S]*?<\/think>/g, "").split("\n").map((l) => l.trim()).filter(Boolean);
  const listed = lines.filter((l) => /^(?:\d+[.)]|[-*•])\s+/.test(l));
  const out: Omit<CrewTask, "status" | "tries">[] = [];
  for (const line of listed.length ? listed : lines) {
    const body = line.replace(/^(?:\d+[.)]|[-*•])\s*/, "").replace(/\*\*/g, "").trim();
    if (!body || /:$/.test(body) || /^(tasks?|plan|here|goal)\b/i.test(body)) continue;
    const parts = body.split(/\s+\|\s+|\s*\|\s*(?=(?:check|done when|after|needs|depends on|files?|touches)\s*:)/i);
    let text = parts[0]!.trim().replace(/[.;]$/, "");
    let check = "";
    let after: number[] = [];
    let touches: string[] = [];
    for (const p of parts.slice(1)) {
      const m = p.match(/^\s*(check|done when|after|needs|depends on|files?|touches)\s*:?\s*(.*)$/i);
      const key = m?.[1]?.toLowerCase() ?? "check";
      const val = (m ? m[2]! : p).trim();
      if (/^(after|needs|depends on)$/.test(key)) after = [...val.matchAll(/\d+/g)].map((x) => Number(x[0]));
      else if (/^(files?|touches)$/.test(key)) touches = val.split(/[,\s]+/).map((f) => f.replace(/^[`'"]|[`'".]$/g, "").replace(/^\.\//, "")).filter((f) => f && f !== "-" && !/^(none|n\/a)$/i.test(f));
      else check = val;
    }
    if (text.length < 3) continue;
    const id = out.length + 1;
    // Only earlier tasks count, so the order can never loop.
    out.push({ id, text: text.slice(0, 160), check: check.slice(0, 160), after: [...new Set(after.filter((a) => a >= 1 && a < id))], touches: touches.slice(0, 12) });
    if (out.length >= max) break;
  }
  return out;
}

export function crewPlanMessages(goal: string, map: string, max: number, workers: number, empty: boolean): Message[] {
  const templates = TEMPLATES.map((t) => `${t.id} (${t.about})`).join("; ");
  return [
    { role: "system", content: "You plan work for a crew of coding agents who work at the same time, each in their own copy of the project. You split a goal into tasks. You do not write code." },
    {
      role: "user",
      content:
        `Goal: ${goal}\n\n${map}\n\n` +
        `There are ${workers} workers. Write 2 to ${max} tasks, one per line, as:\nnumber. task | check: how to see it worked | after: tasks it needs first, or - | files: the files it will create or change\n` +
        "Each task is one small step a worker can finish and test on its own. Tasks that need nothing from each other and touch different files run at the same time, so split the work that way where you can. Put shared groundwork (a template, a data model, a common file) first and make the tasks that build on it come after it.\n" +
        (empty ? `The folder is empty, so task 1 should start from a template with use_template, and the other tasks come after 1. Templates: ${templates}.\n` : "") +
        "Example:\n1. Start from the web app template | check: index.html opens | after: - | files: index.html, style.css, app.js\n2. Add the bill and tip form | check: the page shows both fields | after: 1 | files: index.html, app.js\n3. Write a README | check: README.md explains how to open it | after: 1 | files: README.md\n" +
        "Reply with the list only.",
    },
  ];
}

const shortList = (ids: number[]) => ids.map((i) => `#${i}`).join(", ");

// What a worker reads besides its task: who it is, who else is busy, and what's been handed in.
export function crewBrief(board: CrewBoard, task: CrewTask, worker: CrewWorker): string {
  const others = board.tasks.filter((t) => t.id !== task.id && ["doing", "checking", "fixing", "merging"].includes(t.status));
  return [
    board.brief ?? "",
    `Crew mode: you are ${worker.name}, one of ${board.workers.length} Maxx workers on this goal at the same time. You work in your own copy of the project; when you reply DONE, Maxx merges your work into the shared project.`,
    others.length ? `Other workers are doing ${others.map((t) => `#${t.id} ${t.text} (${t.worker})`).join("; ")}. Leave those to them and only change the files your task needs.` : "",
    task.touches.length ? `The plan expects this task to touch: ${task.touches.join(", ")}.` : "",
    board.log.length ? `Handed in so far:\n${board.log.slice(-6).join("\n")}` : "",
  ].filter(Boolean).join("\n");
}

export function resolvePrompt(task: CrewTask, files: string[]): string {
  return [
    `Maxx: your work on task #${task.id} (${task.text}) clashes with work other workers already merged.`,
    `Maxx pulled their work into your copy, and git marked the clashes with <<<<<<<, ======= and >>>>>>> lines in: ${files.join(", ")}.`,
    "Read each of those files and edit it so it keeps both sides' changes working together (theirs is the part from the shared project, yours is HEAD). Remove every marker line. Don't change anything else.",
    "When no markers are left, reply with one line starting with DONE. If you cannot, reply STUCK: and why.",
  ].join("\n");
}

export function finalPrompt(board: CrewBoard): string {
  return [
    `Maxx: Crew mode. The workers' tasks are all merged into one copy of the project, for the goal: ${board.goal}`,
    board.tasks.map((t) => `${t.status === "done" ? "[x]" : "[!]"} #${t.id} ${t.text}${t.summary ? ` (${t.summary})` : ""}`).join("\n"),
    "They were written at the same time by different workers, so check the pieces fit together: run the build or the tests if the project has them, and look for names, imports, ids or links that one part uses and another part doesn't have. Fix only what is broken; don't redo the tasks.",
    "Reply with one short line starting with DONE, or STUCK: and why.",
  ].join("\n");
}

const hasMarkers = (text: string) => /^(<{7}|>{7})( |$)/m.test(text);

export type CrewEvents = {
  board(b: CrewBoard): void;
  image?(label: string, images: Image[]): void;
};

export type CrewOptions = {
  crew: CrewSettings;
  // Agent mode's budgets for each task: steps, tries, the judge, the map.
  settings: AgentModeSettings;
  signal?: AbortSignal;
  // Slots measured earlier, by model, so the probe runs once per app start.
  probed?: Map<string, number>;
};

// Git outside the user's index and hooks, with Maxx as the author.
async function git(cwd: string, args: string[], hooks: string) {
  let proc: ReturnType<typeof Bun.spawn>;
  try {
    proc = Bun.spawn(["git", "-c", "core.autocrlf=false", "-c", "core.safecrlf=false", "-c", `core.hooksPath=${hooks}`, "-c", "advice.detachedHead=false", ...args], {
      cwd,
      stdout: "pipe",
      stderr: "pipe",
      env: { ...process.env, GIT_AUTHOR_NAME: "maxx", GIT_AUTHOR_EMAIL: "maxx@localhost", GIT_COMMITTER_NAME: "maxx", GIT_COMMITTER_EMAIL: "maxx@localhost", GIT_TERMINAL_PROMPT: "0" },
    });
  } catch (e) {
    return { ok: false, out: (e as Error).message };
  }
  const [out, err] = await Promise.all([new Response(proc.stdout as ReadableStream).text(), new Response(proc.stderr as ReadableStream).text()]);
  await proc.exited;
  return { ok: proc.exitCode === 0, out: out.trim() || err.trim() };
}

// One at a time: merges, and adding or removing worktrees.
class Lock {
  private tail: Promise<unknown> = Promise.resolve();
  run<T>(fn: () => Promise<T>): Promise<T> {
    const next = this.tail.then(fn, fn);
    this.tail = next.catch(() => {});
    return next;
  }
}

const runId = () => new Date().toISOString().replace(/[-:]/g, "").replace(/\..*/, "").replace("T", "-") + "-" + Math.random().toString(36).slice(2, 6);

export async function runCrew(agent: Agent, goal: string, events: CrewEvents, o: CrewOptions): Promise<CrewBoard | Board> {
  const c = o.crew;
  const s = o.settings;
  const signal = o.signal;
  // Workers need worktrees, and worktrees need git.
  if (!(await agent.checkpoints.usable())) {
    agent.note(`(Crew mode needs git for the workers' copies of the project, so this runs as Agent mode, one task at a time. ${agent.checkpoints.off})`);
    return runGoal(agent, goal, { board: events.board as never, image: events.image }, { settings: s, signal });
  }
  const board: CrewBoard = { kind: "crew", goal, state: "planning", tasks: [], workers: [], models: [], log: [], started: Date.now() };
  agent.board = board as never;
  const emit = () => {
    board.models = gates.states();
    events.board(structuredClone(board));
  };
  // Workers stream for minutes; their token counts redraw the board at most four times a second.
  let soon: ReturnType<typeof setTimeout> | null = null;
  const emitSoon = () => void (soon ??= setTimeout(() => ((soon = null), emit()), 250));
  const gates = new Gates(emitSoon);
  emit();

  const perms = agent.permissions;
  const mode = perms.mode;
  if (mode === "ask") perms.mode = "auto-edit";
  const wait = agent.askWaitMs;
  agent.askWaitMs = s.askMinutes > 0 ? s.askMinutes * 60_000 : undefined;

  const id = runId();
  const root = join(maxxHome(), "crew", projectKey(agent.cwd), id);
  const hooks = join(root, ".no-hooks");
  const mainWt = join(root, "main");
  const gitDir = agent.checkpoints.gitDir;
  const lock = new Lock();
  const trees: string[] = [];
  const running = new Map<number, Promise<void>>();
  let prefix = "";
  let head = "";
  let baseSha = "";
  const ref = `refs/maxx/crew/${id}`;

  const addTree = (path: string, sha: string) =>
    lock.run(async () => {
      const r = await git(agent.cwd, [...gitDir, "worktree", "add", "--detach", "-f", path, sha], hooks);
      if (!r.ok) throw new Error(`could not make a worktree for the crew: ${r.out}`);
      trees.push(path);
    });

  try {
    const map = s.mapTokens > 0 ? await projectMap(agent.cwd, s.mapTokens).catch(() => "") : "";
    const empty = /folder is empty|\(0 files|\(1 file;/.test(map) || !map;
    const brief = s.briefing ? await briefing(agent, goal, map, signal) : "";
    if (brief) (board.brief = brief), emit();
    const planned = parseCrewTasks(await agent.think(crewPlanMessages(brief ? `${goal}\n${brief}` : goal, map, c.maxTasks, c.workers, empty), signal), c.maxTasks);
    board.tasks = (planned.length ? planned : [{ id: 1, text: goal, check: "", after: [], touches: [] }]).map((t) => ({ ...t, status: t.after.length ? "waiting" : "ready", tries: 0 }));

    // The crew, with the models shared out in turn.
    const models = c.models.length ? c.models : [agent.llm.model];
    const count = Math.max(1, Math.min(c.workers, board.tasks.length));
    board.workers = Array.from({ length: count }, (_, i) => ({ name: NAMES[i % NAMES.length]! + (i >= NAMES.length ? String(Math.floor(i / NAMES.length) + 1) : ""), model: models[i % models.length]!, state: "idle", done: 0 }));
    for (const m of new Set(board.workers.map((w) => w.model))) {
      const on = board.workers.filter((w) => w.model === m).length;
      let slots = c.slots || o.probed?.get(m) || 0;
      if (!slots && on > 1) {
        agent.note(`(👥 checking how many requests LM Studio runs at once for ${m}…)`);
        slots = await probeParallel({ ...agent.llm, model: m }, on, signal).then(
          (p) => p.slots,
          (e) => {
            if ((e as Error).name === "AbortError") throw e;
            return 1;
          },
        );
        o.probed?.set(m, slots);
        agent.note(slots >= on ? `(👥 ${m}: ${slots} at once, so the workers really think in parallel)` : `(👥 ${m}: LM Studio takes ${slots === 1 ? "one request at a time" : `${slots} at a time`}, so workers will take turns at the model while the others run commands. More at once: raise Max Concurrent Predictions in the model's load settings, or give the crew a second model.)`);
      }
      gates.get(m, Math.max(1, slots || on));
    }
    board.state = "running";
    emit();
    agent.history.push(
      { role: "user", content: `👥 ${goal}` },
      { role: "assistant", content: `Crew mode: ${board.tasks.length} task${board.tasks.length > 1 ? "s" : ""} for ${count} worker${count > 1 ? "s" : ""}.\n${board.brief ? `${board.brief}\n` : ""}${board.tasks.map((t) => `${t.id}. ${t.text}${t.after.length ? ` (after ${shortList(t.after)})` : ""}`).join("\n")}` },
    );

    // The shared copy every hand-in is merged into, from the folder as it is now (saved or not).
    const base = await agent.checkpoints.snapshot("crew: start");
    if (!base) throw new Error("could not snapshot the project for the crew");
    await mkdir(hooks, { recursive: true });
    prefix = (await git(agent.cwd, [...gitDir, "rev-parse", "--show-prefix"], hooks)).out.replace(/\/$/, "");
    if (gitDir.length) prefix = "";
    await addTree(mainWt, base);
    head = baseSha = base;

    const free = [...board.workers];
    const busyFiles = () => new Set(board.tasks.filter((t) => running.has(t.id)).flatMap((t) => t.touches));
    for (;;) {
      if (signal?.aborted) throw Object.assign(new Error("stopped"), { name: "AbortError" });
      for (const t of board.tasks) {
        if (t.status !== "waiting" && t.status !== "ready") continue;
        const bad = t.after.find((a) => board.tasks[a - 1]?.status === "failed");
        if (bad) (t.status = "failed"), (t.note = `needs #${bad}, which failed`);
        else if (t.after.every((a) => board.tasks[a - 1]?.status === "done")) t.status = "ready";
      }
      while (free.length) {
        const taken = busyFiles();
        const t = board.tasks.find((x) => x.status === "ready" && !running.has(x.id) && !x.touches.some((f) => taken.has(f)));
        if (!t) break;
        const w = free.shift()!;
        t.status = "doing";
        t.worker = w.name;
        w.task = t.id;
        w.state = "working";
        running.set(
          t.id,
          work(t, w).finally(() => {
            running.delete(t.id);
            w.task = undefined;
            w.state = "idle";
            w.doing = undefined;
            free.push(w);
            free.sort((a, b) => board.workers.indexOf(a) - board.workers.indexOf(b));
          }),
        );
      }
      emit();
      if (!running.size) break;
      await Promise.race(running.values());
    }

    const done = board.tasks.filter((t) => t.status === "done");
    if (!done.length) {
      board.state = "stuck";
      board.note = "No task could be finished, so nothing changed in the project.";
      agent.history.push({ role: "assistant", content: board.note });
      emit();
      return board;
    }
    if (c.finalCheck && done.length > 1) await finalCheck();
    board.state = "applying";
    emit();
    const applied = await apply();
    const failed = board.tasks.filter((t) => t.status === "failed");
    board.state = failed.length || !applied.ok ? "stuck" : "done";
    const secs = Math.round((Date.now() - board.started) / 1000);
    board.note = !applied.ok
      ? applied.why
      : (failed.length ? `${done.length} of ${board.tasks.length} tasks done; ${shortList(failed.map((t) => t.id))} failed (${failed[0]!.note ?? "see the board"}).` : `All ${board.tasks.length} tasks done by ${board.workers.length} worker${board.workers.length > 1 ? "s" : ""} in ${secs < 90 ? `${secs}s` : `${Math.round(secs / 60)} min`}.`) +
        ` The work is in the project folder; /rewind undoes it.`;
    agent.history.push({ role: "assistant", content: `${board.note}\n${board.log.join("\n")}` });
    emit();
    return board;
  } catch (e) {
    if ((e as Error).name !== "AbortError") throw e;
    board.state = "stopped";
    board.note = `Stopped. Nothing was changed in the project folder${head ? `; what was merged so far is kept in git as ${ref}` : ""}.`;
    for (const t of board.tasks) if (!["done", "failed"].includes(t.status)) t.status = t.after.length ? "waiting" : "ready";
    for (const w of board.workers) (w.state = "idle"), (w.task = undefined);
    emit();
    return board;
  } finally {
    if (soon) clearTimeout(soon);
    await Promise.allSettled(running.values());
    if (head) await agent.checkpoints.run(["update-ref", ref, head]).catch(() => {});
    for (const t of trees) await git(agent.cwd, [...gitDir, "worktree", "remove", "--force", t], hooks).catch(() => {});
    await git(agent.cwd, [...gitDir, "worktree", "prune"], hooks).catch(() => {});
    await rm(root, { recursive: true, force: true }).catch(() => {});
    if (perms.mode === "auto-edit" && mode === "ask") perms.mode = mode;
    agent.askWaitMs = wait;
  }

  // A worker's agent: the session's settings in its worktree, waiting its turn at the model.
  function hire(w: CrewWorker, cwd: string): Agent {
    const parent = agent.io;
    // A new state redraws now; a token count can wait for the next redraw.
    const set = (st: WorkerState) => (w.state === st ? emitSoon() : ((w.state = st), emit()));
    const io: AgentIO = {
      token: () => {},
      toolStart: (name, args) => {
        w.doing = `${name} ${toolArg(args)}`.trim().slice(0, 80);
        set("working");
      },
      toolEnd: () => {
        w.doing = undefined;
        emitSoon();
      },
      ask: (q, preview) => parent.ask(`[${w.name}, task #${w.task}] ${q}`, preview),
      note: () => {},
      image: (tool, images) => events.image?.(`${w.name}: ${tool}`, images),
      progress: (p) => {
        w.tokens = p.tokens;
        if (w.state !== "queued") set(p.phase === "done" ? "working" : "thinking");
        else emitSoon();
      },
      ...(parent.question ? { question: (q, sig) => parent.question!({ ...q, question: `[${w.name}] ${q.question}` }, sig) } : {}),
    };
    const gate = gates.get(w.model);
    const worker = agent.fork(
      {
        llm: {
          ...agent.llm,
          model: w.model,
          gate: {
            acquire: (sig) =>
              gate.acquire(sig, (queued) => set(queued ? "queued" : "thinking")),
          },
        },
        cwd,
        // Lessons in MAXX.md from three workers at once would clash on every merge.
        memory: false,
      },
      io,
    );
    worker.askWaitMs = agent.askWaitMs;
    return worker;
  }

  async function work(t: CrewTask, w: CrewWorker): Promise<void> {
    const tree = join(root, `t${t.id}`);
    try {
      await addTree(tree, head);
      const linked = await linkModules(tree);
      const cwd = prefix ? join(tree, prefix) : tree;
      const a = await hire(w, cwd).init();
      agent.note(`(👥 ${w.name} took #${t.id}: ${t.text})`);
      // Agent mode's task loop on a one-task view of the board.
      const view: Board = {
        goal: board.goal,
        state: "running",
        brief: crewBrief(board, t, w),
        current: t.id - 1,
        tasks: board.tasks.map((x) => ({ text: x.text, check: x.check, status: x.status === "done" ? "done" : "todo", tries: 0 })),
      };
      const mine = view.tasks[t.id - 1]!;
      const sync = () => {
        t.tries = mine.tries;
        t.note = mine.note;
        if (mine.status === "doing" || mine.status === "checking") t.status = mine.status;
        emitSoon();
      };
      const r = await workTask(a, view, { board: sync, image: (l, i) => events.image?.(`${w.name}: ${l}`, i) }, { settings: { ...s, mapTokens: Math.min(s.mapTokens, a.mapTokens) }, signal }, sync);
      sync();
      if (!r.ok) {
        t.status = "failed";
        t.note = r.why;
        agent.note(`(👥 #${t.id} failed with ${w.name}: ${r.why})`);
        return;
      }
      t.summary = mine.answer;
      // Hand in: commit in the worktree, then merge into the shared copy.
      let sha = await commit(tree, `crew #${t.id} (${w.name}): ${t.text}`, linked);
      for (let round = 0; ; round++) {
        t.status = "merging";
        w.state = "merging";
        emit();
        const m = await lock.run(() => mergeIn(sha, `crew: merge #${t.id} (${w.name}): ${t.text}`));
        if (m.ok) break;
        if (round >= 2) {
          t.status = "failed";
          t.note = `its changes still clash with the shared project in ${m.files.join(", ")}`;
          return;
        }
        // Pull the others' work into this copy, and let the worker sort out the clash.
        t.status = "fixing";
        t.note = `clashes with merged work in ${m.files.join(", ")}`;
        agent.note(`(👥 #${t.id} clashes with merged work in ${m.files.join(", ")}; ${w.name} is sorting it out)`);
        emit();
        const pull = await git(tree, ["merge", "--no-edit", head], hooks);
        if (!pull.ok) {
          const files = (await git(tree, ["diff", "--name-only", "--diff-filter=U"], hooks)).out.split("\n").filter(Boolean);
          const rel = files.map((f) => (prefix ? relative(prefix, f) : f));
          const answer = await a.send([{ type: "text", text: resolvePrompt(t, rel) }], signal, { maxSteps: s.stepsPerTask });
          const left = [];
          for (const f of files) if (hasMarkers(await readFile(join(tree, f), "utf8").catch(() => ""))) left.push(f);
          const r2 = outcome(answer, a.lastCheck);
          if (!r2.ok || left.length) {
            t.status = "failed";
            t.note = left.length ? `conflict markers left in ${left.join(", ")}` : r2.why;
            return;
          }
          sha = await commit(tree, `crew #${t.id} (${w.name}): merge the shared project`, linked);
        } else sha = (await git(tree, ["rev-parse", "HEAD"], hooks)).out;
      }
      t.status = "done";
      t.note = undefined;
      w.done++;
      const line = `#${t.id} ${w.name}: ${t.summary || t.text}`;
      board.log.push(line);
      agent.note(`(👥 merged #${t.id} from ${w.name}${t.files ? `, ${t.files} file${t.files > 1 ? "s" : ""}` : ""})`);
    } catch (e) {
      if ((e as Error).name === "AbortError") throw e;
      t.status = "failed";
      t.note = (e as Error).message.slice(0, 200);
    } finally {
      emit();
    }
  }

  // node_modules is ignored by git, so a worktree starts without it; borrow the project's.
  async function linkModules(tree: string): Promise<boolean> {
    const from = join(agent.cwd, "node_modules");
    const to = join(prefix ? join(tree, prefix) : tree, "node_modules");
    if (!existsSync(from) || existsSync(to)) return false;
    // A junction needs no admin rights on Windows.
    return symlink(from, to, "junction").then(() => true, () => false);
  }

  async function commit(tree: string, msg: string, linked: boolean): Promise<string> {
    await git(tree, ["add", "-A"], hooks);
    // A borrowed node_modules is a link, which the usual "node_modules/" ignore rule misses.
    if (linked) await git(tree, ["rm", "-r", "--cached", "-q", "--ignore-unmatch", "--", prefix ? `${prefix}/node_modules` : "node_modules"], hooks);
    const r = await git(tree, ["commit", "-q", "--no-verify", "--allow-empty", "-m", msg], hooks);
    if (!r.ok) throw new Error(`could not commit the worker's changes: ${r.out}`);
    return (await git(tree, ["rev-parse", "HEAD"], hooks)).out;
  }

  async function mergeIn(sha: string, msg: string): Promise<{ ok: true } | { ok: false; files: string[] }> {
    const r = await git(mainWt, ["merge", "--no-ff", "--no-edit", "-m", msg, sha], hooks);
    if (r.ok) {
      head = (await git(mainWt, ["rev-parse", "HEAD"], hooks)).out;
      return { ok: true };
    }
    const files = (await git(mainWt, ["diff", "--name-only", "--diff-filter=U"], hooks)).out.split("\n").filter(Boolean);
    await git(mainWt, ["merge", "--abort"], hooks);
    return { ok: false, files: files.length ? files : ["(git: " + r.out.split("\n")[0] + ")"] };
  }

  // One pass over the merged whole, by the first worker, before it reaches the project.
  async function finalCheck() {
    board.state = "checking";
    const w = board.workers[0]!;
    w.state = "working";
    w.task = undefined;
    w.doing = "checking the merged project";
    emit();
    agent.note(`(👥 ${w.name} is checking that the pieces fit together)`);
    const a = await hire(w, prefix ? join(mainWt, prefix) : mainWt).init();
    const answer = await a.send([{ type: "text", text: finalPrompt(board) }], signal, { maxSteps: s.stepsPerTask });
    const r = outcome(answer, a.lastCheck);
    board.log.push(r.ok ? `final check ${w.name}: ${answer.trim().replace(/^\W*DONE\b[\s:.,-]*/i, "").split("\n")[0]!.slice(0, 160) || "the pieces fit"}` : `final check ${w.name}: ${r.why}`);
    if ((await git(mainWt, ["status", "--porcelain"], hooks)).out) {
      await git(mainWt, ["add", "-A"], hooks);
      await git(mainWt, ["commit", "-q", "--no-verify", "-m", "crew: final check"], hooks);
      head = (await git(mainWt, ["rev-parse", "HEAD"], hooks)).out;
    }
    w.state = "idle";
    w.doing = undefined;
    emit();
  }

  // Into the project folder. If the user changed files meanwhile, their changes are merged in too.
  async function apply(): Promise<{ ok: true } | { ok: false; why: string }> {
    const now = await agent.checkpoints.snapshot("crew: before applying");
    if (!now) return { ok: false, why: `Could not snapshot the project folder, so the crew's work was not applied; it is kept in git as ${ref}.` };
    const tree = async (sha: string) => (await git(mainWt, ["rev-parse", `${sha}^{tree}`], hooks)).out;
    if ((await tree(now)) !== (await tree(baseSha))) {
      const m = await git(mainWt, ["merge", "--no-edit", "-m", "crew: your changes from while the crew worked", now], hooks);
      if (!m.ok) {
        await git(mainWt, ["merge", "--abort"], hooks);
        return { ok: false, why: `You changed files the crew also changed while it worked, so its work was not applied (yours is untouched). It is kept in git as ${ref}.` };
      }
      head = (await git(mainWt, ["rev-parse", "HEAD"], hooks)).out;
    }
    const back = await agent.checkpoints.rewind(head);
    return back.ok ? { ok: true } : { ok: false, why: `Could not write the crew's work into the folder (${back.error}); it is kept in git as ${ref}.` };
  }
}

function toolArg(args: string): string {
  try {
    const a = JSON.parse(args);
    return String(a.path ?? a.command ?? a.pattern ?? a.query ?? "").split("\n")[0]!;
  } catch {
    return "";
  }
}
