import { join } from "node:path";
import { tmpdir } from "node:os";
import { rm } from "node:fs/promises";

// Shadow commits: snapshot the working tree under refs/maxx/<session> without
// touching the user's index, branch or stash. `/rewind` can restore any step.
export class Checkpoints {
  readonly ref: string;
  private enabled: boolean | null = null;
  private steps: { sha: string; label: string }[] = [];

  constructor(private cwd: string, session: string) {
    this.ref = `refs/maxx/${session}`;
  }

  private async git(args: string[], env: Record<string, string> = {}) {
    const proc = Bun.spawn(["git", ...args], { cwd: this.cwd, stdout: "pipe", stderr: "pipe", env: { ...process.env, ...env } });
    const out = (await new Response(proc.stdout).text()).trim();
    await proc.exited;
    return { ok: proc.exitCode === 0, out };
  }

  async snapshot(label: string): Promise<string | null> {
    if (this.enabled === null) this.enabled = (await this.git(["rev-parse", "--is-inside-work-tree"])).ok;
    if (!this.enabled) return null;
    const index = join(tmpdir(), `maxx-index-${process.pid}`);
    const env = { GIT_INDEX_FILE: index };
    await rm(index, { force: true });
    await this.git(["read-tree", "HEAD"], env); // fails harmlessly in a repo with no commits
    await this.git(["add", "-A", "."], env);
    const tree = await this.git(["write-tree"], env);
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
}
