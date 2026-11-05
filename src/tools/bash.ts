import { z } from "zod";
import { defineTool } from "./types.ts";
import { truncate } from "../context.ts";
import { shell } from "../shell.ts";
import { fromGitBash } from "./paths.ts";
import { blocked, fetches, OFFLINE_ENV } from "../network.ts";

// Servers and watchers never exit; waiting for them hangs the turn until the
// timeout. These start in the background even when the model does not ask.
const LONG_RUNNING = /\b(http\.server|(npm|pnpm|yarn|bun)( run)? (dev|start|serve|preview)|vite( dev)?$|next dev|webpack serve|live-server|flask run|uvicorn|manage\.py runserver|php -S)\b/;
const BACKGROUND_WAIT_MS = 4000;
// After a kill, how long to wait for the last output before giving up on the pipes.
const KILL_GRACE_MS = 2000;

// proc.kill() ends only the shell; on Windows its children (java, node, gradle)
// live on and keep the output pipes open. taskkill /T ends the whole tree.
export function killTree(proc: { pid: number; kill(): void }) {
  if (process.platform === "win32") {
    try {
      Bun.spawn(["taskkill", "/T", "/F", "/PID", String(proc.pid)], { stdout: "ignore", stderr: "ignore", stdin: "ignore" });
      return;
    } catch {}
  }
  try {
    proc.kill();
  } catch {}
}

// Background processes die with Maxx instead of holding ports after it exits.
const running = new Set<{ kill(): void }>();
process.on("exit", () => running.forEach((p) => p.kill()));

// Models often start with `cd <the project> &&`, which is redundant (commands
// already run there) and breaks on unquoted paths with spaces. Drop that cd.
export function dropWorkspaceCd(command: string, cwd: string, platform: NodeJS.Platform = process.platform): string {
  const m = /^\s*cd\s+(?:"([^"]+)"|'([^']+)'|((?:\\ |[^&;|])+?))\s*(?:&&|;)\s*/.exec(command);
  if (!m) return command;
  let dir = (m[1] ?? m[2] ?? m[3]!.replaceAll("\\ ", " ")).trim();
  // "/Users/me/..." on Windows is the cwd's drive with the drive letter left off.
  if (platform === "win32" && /^\/users\//i.test(dir) && /^[a-z]:/i.test(cwd)) dir = cwd.slice(0, 2) + dir;
  const norm = (p: string) => fromGitBash(p, platform).replaceAll("\\", "/").replace(/\/+$/, "");
  const same = platform === "win32" ? norm(dir).toLowerCase() === norm(cwd).toLowerCase() : norm(dir) === norm(cwd);
  return same || dir === "." ? command.slice(m[0].length) : command;
}

// A command that never ends on its own: a server, a watcher, or a stream (a sensor
// monitor, tail -f, ping -t). Cutting its output with | head does not stop it on
// Windows, where nothing tells the writer the reader has gone.
export function timeoutHint(command: string, timeout: number): string {
  const cut = /\|\s*(head\b|select-object\s+-first\b|select\s+-first\b)/i.test(command);
  return cut
    ? `hint: this was killed after ${timeout}s. Piping a never-ending command into head does not stop it on Windows: the command keeps running after head exits. Give the command its own limit instead (a count, a duration, -Samples N, -Count N), or start it with background: true and read its output file.`
    : "hint: if this is a server, watcher or stream that never ends, run it with background: true, or give it its own limit (a count or a duration).";
}

function hints(command: string, err: string): string {
  const out: string[] = [];
  if (/\bcd: (too many arguments|.*No such file or directory)/.test(err)) out.push("Commands already run in the project folder, so there is no need to cd into it. Quote paths that contain spaces.");
  if (/command not found|is not recognized/.test(err) && /^\s*(dir|copy|del|type|findstr)\b/.test(command) && shell().kind === "bash") out.push("This shell is bash: use ls, cp, rm, cat, grep.");
  return out.length ? `\nhint: ${out.join(" ")}` : "";
}

// Keep reading a stream to its end, so a chatty server never blocks on a full
// pipe; only the first part is kept, and can be looked at any time.
function drain(stream: ReadableStream<Uint8Array>, keep = 40_000, cut = false) {
  const decoder = new TextDecoder();
  const sink = { text: "", done: Promise.resolve() };
  sink.done = (async () => {
    for await (const chunk of stream as unknown as AsyncIterable<Uint8Array>) {
      if (sink.text.length < keep) sink.text += decoder.decode(chunk, { stream: true });
      // A command's output keeps going: drop the middle, keep the end (where the errors are).
      else if (cut) sink.text = sink.text.slice(0, keep / 4) + sink.text.slice(-keep / 2) + decoder.decode(chunk, { stream: true });
    }
  })().catch(() => {});
  return sink;
}

// With network access off, installs and downloads are refused before they run.
function refuseFetch(command: string, network?: boolean): string | undefined {
  const what = network === false ? fetches(command) : null;
  return what ? blocked(what) : undefined;
}

// Named "bash" because models are trained on that name; on Windows without
// Git Bash it runs PowerShell, and the system prompt says which.
export const bash = defineTool({
  name: "bash",
  description:
    "Run a shell command in the project folder and return stdout, stderr and the exit code. Use for tests, builds and git. Servers and watchers (python -m http.server, npm run dev...) start in the background and return after a few seconds. A command that never ends on its own (a monitor, a sensor stream, tail -f, ping -t) needs background: true or its own limit (a sample count or duration); piping it into head does not stop it on Windows. The system prompt says which shell is in use.",
  schema: z.object({
    command: z.string().describe("The command to run"),
    timeout: z.number().int().min(1).max(600).optional().describe("Seconds before the command is killed, default 120"),
    background: z.boolean().optional().describe("Start a long-running process and return its first output instead of waiting for it to exit"),
  }),
  risk: "exec",
  ruleKey: (a) => a.command,
  refuse: ({ command }, { network }) => refuseFetch(command, network),
  preview: ({ command }) => `${shell().kind === "powershell" ? "PS>" : "$"} ${command}`,
  async run({ command, timeout = 120, background }, ctx) {
    const { cwd } = ctx;
    const refused = refuseFetch(command, ctx.network);
    if (refused) return refused;
    const cmd = dropWorkspaceCd(command, cwd);
    const env = ctx.network === false ? { ...process.env, ...OFFLINE_ENV } : undefined;
    const proc = Bun.spawn(shell().args(cmd), { cwd, env, stdout: "pipe", stderr: "pipe", stdin: "ignore" });
    const parts: string[] = [];

    if (background || LONG_RUNNING.test(cmd)) {
      const stdout = drain(proc.stdout), stderr = drain(proc.stderr);
      const stopped = new Promise<"stopped">((r) => (ctx.signal?.aborted ? r("stopped") : ctx.signal?.addEventListener("abort", () => r("stopped"), { once: true })));
      const first = await Promise.race([proc.exited.then(() => "exited" as const), Bun.sleep(BACKGROUND_WAIT_MS).then(() => "running" as const), stopped]);
      if (first === "stopped") {
        killTree(proc);
        throw Object.assign(new Error("stopped"), { name: "AbortError" });
      }
      const exited = first === "exited";
      // The shell is done, but a server it started with a trailing & can still hold the
      // output pipes (on Windows every inheritable handle goes to the child, even with
      // >/dev/null). Waiting for those pipes to close is what hung Maxx on
      // `cd app && python -m http.server 8765 >/dev/null 2>&1 &`.
      const drained = exited && (await Promise.race([Promise.all([stdout.done, stderr.done]).then(() => true), Bun.sleep(KILL_GRACE_MS).then(() => false)]));
      const out = stdout.text, err = stderr.text;
      if (exited && !drained && proc.exitCode === 0) {
        parts.push("started in the background and still running (the shell has returned); do not start it again");
        if (out.trim()) parts.push(`stdout so far:\n${truncate(out)}`);
        if (err.trim()) parts.push(`stderr so far:\n${truncate(err)}`);
        return parts.join("\n");
      }
      if (!exited) {
        running.add(proc);
        proc.exited.then(() => running.delete(proc));
        parts.push(`started in the background (pid ${proc.pid}) and still running; do not start it again`);
        if (out.trim()) parts.push(`stdout so far:\n${truncate(out)}`);
        if (err.trim()) parts.push(`stderr so far:\n${truncate(err)}`);
        return parts.join("\n");
      }
      // It exited quickly (a typo, a port in use...): report it like any command.
      parts.push(`exit code: ${proc.exitCode}`);
      if (out.trim()) parts.push(`stdout:\n${truncate(out)}`);
      if (err.trim()) parts.push(`stderr:\n${truncate(err)}`);
      return parts.join("\n") + hints(cmd, err);
    }

    // Stop (the user) and the timeout both end the whole process tree. Output is
    // read as it comes, so a child that keeps the pipe open (a Gradle daemon, a
    // server started with &) can't hold the turn after the command is gone.
    let ended = "" as "" | "timeout" | "stopped";
    let endNow = () => {};
    const gone = new Promise<void>((r) => (endNow = r));
    const end = (why: "timeout" | "stopped") => {
      if (ended) return;
      ended = why;
      killTree(proc);
      endNow();
    };
    const timer = setTimeout(() => end("timeout"), timeout * 1000);
    const onStop = () => end("stopped");
    if (ctx.signal?.aborted) onStop();
    ctx.signal?.addEventListener("abort", onStop, { once: true });
    const stdout = drain(proc.stdout, 4_000_000, true), stderr = drain(proc.stderr, 4_000_000, true);
    try {
      await Promise.race([proc.exited, gone]);
      // The last output, but not forever: something it started may still hold the pipes.
      await Promise.race([Promise.all([stdout.done, stderr.done]), Bun.sleep(KILL_GRACE_MS)]);
    } finally {
      clearTimeout(timer);
      ctx.signal?.removeEventListener("abort", onStop);
    }
    if (ended === "stopped") throw Object.assign(new Error("stopped"), { name: "AbortError" });
    const out = stdout.text, err = stderr.text;
    parts.push(`exit code: ${ended === "timeout" ? `killed after ${timeout}s` : proc.exitCode}`);
    if (out.trim()) parts.push(`stdout:\n${truncate(out)}`);
    if (err.trim()) parts.push(`stderr:\n${truncate(err)}`);
    if (ended === "timeout") parts.push(timeoutHint(cmd, timeout));
    return parts.join("\n") + hints(cmd, err);
  },
});
