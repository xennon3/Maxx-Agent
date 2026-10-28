import { existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { shell } from "../shell.ts";

// The Run panel: long-running project commands (dev servers, tests, builds)
// with their output streamed to the UI. Unlike the bash tool, nothing waits
// for them to finish, so `npm run dev` can keep serving while Maxx works.

export type Proc = {
  id: string;
  command: string;
  status: "running" | "exited" | "stopped";
  code: number | null;
  url?: string;
  started: number;
  output: string;
};

export type RunEvents = {
  output(id: string, text: string): void;
  changed(p: Proc): void;
};

const KEEP = 200_000; // characters of output kept per process

// Dev servers print where they listen; the first such URL is what to preview.
export function findUrl(text: string): string | undefined {
  const plain = text.replace(/\x1b\[[0-9;]*[A-Za-z]/g, "");
  const m = plain.match(/https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1?\])(?::\d+)?(?:\/[^\s"'<>)]*)?/);
  return m?.[0].replace("0.0.0.0", "localhost").replace(/\[::1?\]/, "localhost").replace(/[.,;]+$/, "");
}

export type Suggestion = { label: string; command: string };

// One-click commands from what is in the folder. Saved custom commands come first.
export function detectCommands(cwd: string, kind: "bash" | "powershell" = shell().kind): Suggestion[] {
  const out: Suggestion[] = [];
  const has = (f: string) => existsSync(join(cwd, f));
  if (has("package.json")) {
    let scripts: Record<string, string> = {};
    try {
      scripts = JSON.parse(readFileSync(join(cwd, "package.json"), "utf8")).scripts ?? {};
    } catch {}
    const pm = has("bun.lock") || has("bun.lockb") ? "bun" : has("pnpm-lock.yaml") ? "pnpm" : has("yarn.lock") ? "yarn" : "npm";
    const order = ["dev", "start", "test", "build", "preview", "lint"];
    const names = Object.keys(scripts).sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99));
    for (const n of names.slice(0, 8)) out.push({ label: n, command: pm === "yarn" ? `yarn ${n}` : n === "test" && pm !== "bun" ? `${pm} test` : `${pm} run ${n}` });
  }
  if (has("gradlew") || has("gradlew.bat")) {
    const g = kind === "powershell" ? ".\\gradlew.bat" : "./gradlew";
    out.push({ label: "assembleDebug", command: `${g} assembleDebug` }, { label: "gradle test", command: `${g} test` });
  }
  if (has("Cargo.toml")) out.push({ label: "cargo run", command: "cargo run" }, { label: "cargo test", command: "cargo test" });
  if (has("go.mod")) out.push({ label: "go run", command: "go run ." }, { label: "go test", command: "go test ./..." });
  const py = process.platform === "win32" ? "python" : "python3";
  for (const f of ["main.py", "app.py", "manage.py"]) if (has(f)) out.push({ label: f, command: f === "manage.py" ? `${py} manage.py runserver` : `${py} ${f}` });
  if (has("pyproject.toml") || has("pytest.ini") || has("tests")) if (!has("package.json")) out.push({ label: "pytest", command: `${py} -m pytest` });
  if (has("Makefile")) out.push({ label: "make", command: "make" });
  return out;
}

// Commands typed into the Run box are kept per project in .maxx/run.json.
export async function savedCommands(cwd: string): Promise<string[]> {
  try {
    const j = JSON.parse(await readFile(join(cwd, ".maxx", "run.json"), "utf8"));
    return Array.isArray(j.commands) ? j.commands.filter((c: unknown) => typeof c === "string") : [];
  } catch {
    return [];
  }
}

export async function saveCommand(cwd: string, command: string) {
  const list = [command, ...(await savedCommands(cwd)).filter((c) => c !== command)].slice(0, 8);
  await mkdir(join(cwd, ".maxx"), { recursive: true });
  await writeFile(join(cwd, ".maxx", "run.json"), JSON.stringify({ commands: list }, null, 2) + "\n");
}

export class Runner {
  procs = new Map<string, Proc>();
  private handles = new Map<string, ReturnType<typeof Bun.spawn>>();
  private n = 0;

  constructor(public cwd: string, private ev: RunEvents) {}

  start(command: string): Proc {
    const id = `p${++this.n}`;
    const p: Proc = { id, command, status: "running", code: null, started: Date.now(), output: "" };
    this.procs.set(id, p);
    // FORCE_COLOR keeps colored output; CI=1 stops tools waiting on a keypress.
    const env = { ...process.env, FORCE_COLOR: "1", CI: process.env.CI ?? "1", BROWSER: "none" };
    const proc = Bun.spawn(shell().args(command), { cwd: this.cwd, stdout: "pipe", stderr: "pipe", stdin: "ignore", env });
    this.handles.set(id, proc);
    this.ev.changed(p);
    const pump = async (stream: ReadableStream<Uint8Array>) => {
      const dec = new TextDecoder();
      for await (const chunk of stream) this.append(p, dec.decode(chunk, { stream: true }));
    };
    Promise.all([pump(proc.stdout as ReadableStream<Uint8Array>), pump(proc.stderr as ReadableStream<Uint8Array>)])
      .catch(() => {})
      .then(() => proc.exited)
      .then((code) => {
        this.handles.delete(id);
        if (p.status === "running") p.status = "exited";
        p.code = code;
        this.ev.changed(p);
      });
    return p;
  }

  private append(p: Proc, text: string) {
    p.output = (p.output + text).slice(-KEEP);
    this.ev.output(p.id, text);
    if (!p.url) {
      const url = findUrl(p.output.slice(-4000));
      if (url) (p.url = url), this.ev.changed(p);
    }
  }

  // Wait until the process prints a URL, exits, or time runs out.
  async settle(id: string, ms: number): Promise<Proc> {
    const p = this.procs.get(id)!;
    const end = Date.now() + ms;
    while (Date.now() < end && p.status === "running" && !p.url) await Bun.sleep(100);
    // Give a server that printed its URL a moment to finish starting.
    if (p.url && p.status === "running") await Bun.sleep(300);
    return p;
  }

  stop(id: string) {
    const h = this.handles.get(id);
    const p = this.procs.get(id);
    if (!h || !p) return;
    p.status = "stopped";
    // npm/bun start children of their own; on Windows only taskkill /T takes the whole tree down.
    if (process.platform === "win32") Bun.spawnSync(["taskkill", "/pid", String(h.pid), "/T", "/F"], { stdout: "ignore", stderr: "ignore" });
    else killTree(h.pid);
  }

  forget(id: string) {
    this.stop(id);
    this.procs.delete(id);
  }

  stopAll() {
    for (const id of this.handles.keys()) this.stop(id);
  }

  list(): Omit<Proc, "output">[] {
    return [...this.procs.values()].map(({ output, ...p }) => p);
  }
}

// The shell's children first, so a dev server doesn't outlive the shell that started it.
function killTree(pid: number) {
  const kids = Bun.which("pgrep") ? new TextDecoder().decode(Bun.spawnSync(["pgrep", "-P", String(pid)]).stdout).split(/\s+/).filter(Boolean).map(Number) : [];
  for (const k of kids) killTree(k);
  try {
    process.kill(pid, "SIGTERM");
  } catch {}
}
