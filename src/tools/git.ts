import { existsSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { defineTool } from "./types.ts";
import { truncate } from "../context.ts";

// git and git_commit: structured git, so a model asks "what changed?" or
// "who wrote this line?" without fighting pagers, colors and 5,000-line diffs
// in bash. Looking is free; committing changes history, so it asks.

export async function git(cwd: string, args: string[]): Promise<{ ok: boolean; out: string }> {
  let proc: ReturnType<typeof Bun.spawn>;
  try {
    proc = Bun.spawn(["git", "-c", "color.ui=never", "-c", "core.pager=cat", "-c", "core.quotepath=false", ...args], { cwd, stdout: "pipe", stderr: "pipe", stdin: "ignore", env: { ...process.env, GIT_TERMINAL_PROMPT: "0", GIT_PAGER: "cat" } });
  } catch (e) {
    return { ok: false, out: `git is not installed or not on PATH (${(e as Error).message}). Install Git for Windows from git-scm.com.` };
  }
  const [out, err] = await Promise.all([new Response(proc.stdout as ReadableStream).text(), new Response(proc.stderr as ReadableStream).text()]);
  await proc.exited;
  return { ok: proc.exitCode === 0, out: (out.trimEnd() || err.trim()).replace(/\r\n/g, "\n") };
}

const isRepo = async (cwd: string) => (await git(cwd, ["rev-parse", "--is-inside-work-tree"])).out === "true";

// Diffs are the big one: show which files changed, then as much of the patch as fits.
export function trimDiff(diff: string, maxLines = 220): string {
  const lines = diff.split("\n");
  if (lines.length <= maxLines) return diff;
  const kept: string[] = [];
  let file = 0;
  for (const l of lines) {
    if (l.startsWith("diff --git")) file++;
    if (kept.length < maxLines) kept.push(l);
  }
  return `${kept.join("\n")}\n... ${lines.length - maxLines} more lines in ${file} file(s); ask for one path to see the rest.`;
}

export const gitTool = defineTool({
  name: "git",
  description:
    "Look at the project's git history without changing it. action: status (changed files), diff (uncommitted changes, or against ref), log (recent commits), show (one commit), blame (who last changed each line of path), branches.",
  schema: z.object({
    action: z.enum(["status", "diff", "log", "show", "blame", "branches"]),
    path: z.string().optional().describe("Only this file or folder"),
    ref: z.string().optional().describe("A commit, branch or tag: diff against it, or the commit to show"),
    staged: z.boolean().optional().describe("diff: only what is staged"),
    lines: z.string().optional().describe('blame: a line range like "40,60"'),
    count: z.number().int().min(1).max(50).optional().describe("log: how many commits, default 10"),
  }),
  risk: "read",
  checkpoint: false,
  async run(a, { cwd }) {
    if (!(await isRepo(cwd))) return "This folder is not a git repository yet. git_commit creates one with the first commit.";
    if (a.ref && /^-/.test(a.ref)) return "error: ref must be a commit, branch or tag, not an option";
    const path = a.path ? ["--", a.path] : [];
    let r: { ok: boolean; out: string };
    switch (a.action) {
      case "status": {
        const branch = (await git(cwd, ["branch", "--show-current"])).out || "(detached)";
        r = await git(cwd, ["status", "--short", "--branch", ...path]);
        if (r.ok) return `branch ${branch}\n${r.out.split("\n").slice(1).join("\n") || "nothing changed since the last commit"}`;
        break;
      }
      case "diff": {
        const stat = await git(cwd, ["diff", "--stat", ...(a.staged ? ["--cached"] : []), ...(a.ref ? [a.ref] : []), ...path]);
        r = await git(cwd, ["diff", "--no-ext-diff", "-U3", ...(a.staged ? ["--cached"] : []), ...(a.ref ? [a.ref] : []), ...path]);
        if (r.ok) return r.out ? `${stat.out}\n\n${trimDiff(r.out)}` : `no differences${a.staged ? " staged" : ""}${a.ref ? ` against ${a.ref}` : ""}`;
        break;
      }
      case "log":
        r = await git(cwd, ["log", `-${a.count ?? 10}`, "--date=short", "--pretty=format:%h %ad %an: %s", ...(a.ref ? [a.ref] : []), ...path]);
        if (r.ok && !r.out) return "no commits yet";
        break;
      case "show":
        r = await git(cwd, ["show", "--stat", "--patch", "--date=short", a.ref ?? "HEAD", ...path]);
        if (r.ok) return trimDiff(r.out);
        break;
      case "blame":
        if (!a.path) return "error: blame needs path";
        r = await git(cwd, ["blame", "--date=short", "-c", ...(a.lines ? ["-L", a.lines] : []), "--", a.path]);
        if (r.ok) return truncate(r.out, 120, 20);
        break;
      case "branches":
        r = await git(cwd, ["branch", "-a", "-vv", "--no-color"]);
        break;
    }
    return r.ok ? truncate(r.out, 150, 30) : `error: ${r.out}`;
  },
});

export const gitCommit = defineTool({
  name: "git_commit",
  description:
    "Save the current changes as a git commit with a clear message (what changed and why). Commits every change unless files is given. branch makes or switches to that branch first. Creates the repository on first use.",
  schema: z.object({
    message: z.string().min(3).describe("First line: what changed, under 70 characters. Then a blank line and why, if useful"),
    files: z.array(z.string()).optional().describe("Only commit these paths"),
    branch: z.string().optional().describe("Commit on this branch (made if it does not exist)"),
  }),
  risk: "write",
  checkpoint: false,
  ruleKey: (a) => a.branch ?? "",
  preview: (a) => `git commit${a.branch ? ` on ${a.branch}` : ""}${a.files ? ` (${a.files.join(", ")})` : " (all changes)"}\n\n${a.message}`,
  async run({ message, files, branch }, { cwd }) {
    const notes: string[] = [];
    if (!(await isRepo(cwd))) {
      const init = await git(cwd, ["init", "-b", "main"]);
      if (!init.ok) return `error: ${init.out}`;
      notes.push("made a new git repository");
      if (!existsSync(join(cwd, ".gitignore"))) {
        await Bun.write(join(cwd, ".gitignore"), "node_modules/\n.maxx/\nbuild/\ndist/\n.gradle/\n__pycache__/\n.venv/\n*.apk\n*.jks\nkeystore.properties\n");
        notes.push("added a .gitignore");
      }
    }
    if (branch) {
      if (/^-|\s|\.\.|[~^:?*[\\]/.test(branch)) return `error: "${branch}" is not a valid branch name`;
      const exists = (await git(cwd, ["rev-parse", "--verify", "--quiet", `refs/heads/${branch}`])).ok;
      const sw = await git(cwd, exists ? ["switch", branch] : ["switch", "-c", branch]);
      if (!sw.ok) return `error switching to ${branch}: ${sw.out}`;
      notes.push(exists ? `on branch ${branch}` : `made branch ${branch}`);
    }
    const add = await git(cwd, files?.length ? ["add", "--", ...files] : ["add", "-A"]);
    if (!add.ok) return `error: ${add.out}`;
    const staged = await git(cwd, ["diff", "--cached", "--stat"]);
    if (!staged.out) return [...notes, "nothing to commit: no changes since the last commit"].join("\n");
    const who = (await git(cwd, ["config", "user.name"])).out ? [] : ["-c", "user.name=Maxx", "-c", "user.email=maxx@localhost"];
    const c = await git(cwd, [...who, "commit", "-q", "-m", message]);
    if (!c.ok) return `error: ${c.out}`;
    const head = (await git(cwd, ["log", "-1", "--pretty=format:%h %s"])).out;
    return [...notes, `committed ${head}`, staged.out.split("\n").pop()!.trim()].join("\n");
  },
});
