import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { existsSync } from "node:fs";
import { mkdir, rm, rmdir, writeFile } from "node:fs/promises";

// Shadow commits: snapshot the working tree under refs/maxx/<session> without
// touching the user's index, branch or stash. `/rewind` can restore any step.
// A folder that is not a git repository gets a private one in .maxx/git, so
// Agent mode can always undo a task that went wrong.

// Never worth snapshotting, and slow to hash (dependencies, build output).
const SHADOW_EXCLUDE = [".maxx/", ".git/", "node_modules/", ".gradle/", "build/", "dist/", "target/", ".venv/", "venv/", "__pycache__/", ".idea/", "*.apk"];

export class Checkpoints {
  readonly ref: string;
  private enabled: boolean | null = null;
  private shadow: string[] = [];
  private steps: { sha: string; label: string }[] = [];
  // Why snapshots are off, once ready() has found out (git missing or broken).
  off = "";

  constructor(private cwd: string, session: string) {
    this.ref = `refs/maxx/${session}`;
  }

  private async git(args: string[], env: Record<string, string> = {}) {
    // Byte-exact snapshots: Git for Windows turns LF into CRLF on restore by default.
    let proc: ReturnType<typeof Bun.spawn>;
    try {
      proc = Bun.spawn(["git", "-c", "core.autocrlf=false", "-c", "core.safecrlf=false", ...this.shadow, ...args], { cwd: this.cwd, stdout: "pipe", stderr: "pipe", env: { ...process.env, ...env } });
    } catch (e) {
      // Bun throws "Executable not found in $PATH" here when git is missing.
      return { ok: false, out: (e as Error).message };
    }
    const [out, err] = await Promise.all([new Response(proc.stdout as ReadableStream).text(), new Response(proc.stderr as ReadableStream).text()]);
    await proc.exited;
    return { ok: proc.exitCode === 0, out: out.trim() || err.trim() };
  }

  private async ready(): Promise<boolean> {
    if (this.enabled !== null) return this.enabled;
    if (!Bun.which("git", { PATH: process.env.PATH ?? "" })) {
      this.off = "git is not installed (or not on PATH), so Maxx can't take snapshots: /rewind and Agent mode's undo are off. Install Git (git-scm.com) and restart Maxx to turn them on.";
      return (this.enabled = false);
    }
    // A folder the enclosing repository ignores (a project under build/ or out/) gets its own, too.
    if ((await this.git(["rev-parse", "--is-inside-work-tree"])).ok && !(await this.git(["check-ignore", "-q", "."])).ok) return (this.enabled = true);
    const dir = join(this.cwd, ".maxx", "git");
    this.shadow = [`--git-dir=${dir}`, `--work-tree=${this.cwd}`];
    if (!existsSync(join(dir, "HEAD"))) {
      await mkdir(dir, { recursive: true });
      const init = await this.git(["init", "-q"]);
      if (!init.ok) return (this.shadow = [], (this.off = `git could not set up snapshots here (${init.out}), so /rewind and Agent mode's undo are off.`), (this.enabled = false));
      await mkdir(join(dir, "info"), { recursive: true });
      await writeFile(join(dir, "info", "exclude"), SHADOW_EXCLUDE.join("\n") + "\n");
    }
    return (this.enabled = true);
  }

  // A private index, so the user's staged changes stay as they are.
  private async withIndex<T>(fn: (env: Record<string, string>) => Promise<T>): Promise<T> {
    const index = join(tmpdir(), `maxx-index-${process.pid}-${Math.random().toString(36).slice(2)}`);
    try {
      return await fn({ GIT_INDEX_FILE: index });
    } finally {
      await rm(index, { force: true });
    }
  }

  async snapshot(label: string): Promise<string | null> {
    if (!(await this.ready())) return null;
    const tree = await this.withIndex(async (env) => {
      await this.git(["read-tree", "HEAD"], env); // fails harmlessly in a repo with no commits
      await this.git(["add", "-A", "."], env);
      return this.git(["write-tree"], env);
    });
    if (!tree.ok) return null;
    const parent = this.steps.at(-1)?.sha;
    const commit = await this.git(
      ["commit-tree", tree.out, ...(parent ? ["-p", parent] : []), "-m", `maxx: ${label}`],
      { GIT_AUTHOR_NAME: "maxx", GIT_AUTHOR_EMAIL: "maxx@localhost", GIT_COMMITTER_NAME: "maxx", GIT_COMMITTER_EMAIL: "maxx@localhost" },
    );
    if (!commit.ok) return null;
    await this.git(["update-ref", this.ref, commit.out]);
    this.steps.push({ sha: commit.out, label });
    return commit.out;
  }

  // How many snapshots this session has, and one of them (for undoing a whole turn).
  get count() {
    return this.steps.length;
  }

  shaAt(step: number): string | undefined {
    return this.steps[step]?.sha;
  }

  // For crew mode, which adds worktrees to the same repository (shadow or real).
  async usable(): Promise<boolean> {
    return this.ready();
  }

  // Git on this folder's repository; `worktree` commands need the git dir alone, not the work tree.
  run(args: string[], env: Record<string, string> = {}) {
    return this.git(args, env);
  }

  get gitDir(): string[] {
    return this.shadow.filter((a) => a.startsWith("--git-dir="));
  }

  list() {
    return this.steps.map((s, i) => `${i}: ${s.sha.slice(0, 8)}  ${s.label}`);
  }

  // Restore tracked and new files to a step. Files created after it are left in place.
  async restore(step: number): Promise<string> {
    const s = this.steps.at(step);
    if (!s) return `no checkpoint ${step}`;
    const r = await this.git(["restore", "--source", s.sha, "--worktree", "--", "."]);
    return r.ok ? `restored files to checkpoint ${step} (${s.label})` : `restore failed: ${r.out}`;
  }

  // Put the folder back exactly as it was at a snapshot: changed files restored,
  // files created since then removed. Ignored files (node_modules, builds) stay.
  async rewind(sha: string): Promise<{ ok: boolean; removed: string[]; error?: string }> {
    if (!(await this.ready())) return { ok: false, removed: [], error: "no snapshots in this folder (git is not installed)" };
    const removed = await this.withIndex(async (env) => {
      const read = await this.git(["read-tree", sha], env);
      if (!read.ok) return null;
      const r = await this.git(["ls-files", "--others", "--exclude-standard", "--", "."], env);
      return r.ok ? r.out.split("\n").filter(Boolean) : [];
    });
    if (removed === null) return { ok: false, removed: [], error: `unknown snapshot ${sha.slice(0, 8)}` };
    for (const f of removed) {
      await rm(join(this.cwd, f), { force: true });
      // And the folders that held only new files.
      for (let d = dirname(f); d && d !== "."; d = dirname(d)) if (!(await rmdir(join(this.cwd, d)).then(() => true, () => false))) break;
    }
    // Only this folder: files elsewhere in a bigger repository are left alone.
    const r = await this.git(["restore", "--source", sha, "--worktree", "--", "."]);
    // A snapshot of an empty folder has nothing to write back.
    return r.ok || /did not match any file/.test(r.out) ? { ok: true, removed } : { ok: false, removed, error: r.out };
  }

  // Files that differ between two snapshots (or a snapshot and now).
  async changed(from: string, to?: string): Promise<string[]> {
    if (!(await this.ready())) return [];
    const target = to ?? (await this.snapshot("compare"));
    if (!target) return [];
    const r = await this.git(["diff", "--name-only", "--relative", from, target]);
    return r.ok ? r.out.split("\n").filter(Boolean) : [];
  }
}
