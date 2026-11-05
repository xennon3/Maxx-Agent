import { existsSync, readdirSync, readFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { homedir } from "node:os";
import { z } from "zod";
import { defineTool, type Tool } from "./types.ts";
import { killTree } from "./bash.ts";
import { api, authArgs, githubAuth, loadGitHub, NO_AUTH, parseRepo, reposRoot, scrub, type Auth } from "../github.ts";
import { projectServers } from "../mcp-presets.ts";

// The 🐙 repo toolset: get a repository from GitHub (or any git URL), work on
// it on a branch, push, and open a pull request. Reading is free; anything that
// reaches GitHub on the user's behalf (push, PR, comment) still asks under
// ⚡ auto-run, like `git push` in bash does.

type Run = { ok: boolean; out: string; code: number | null };

export async function gitx(cwd: string, args: string[], o: { signal?: AbortSignal; timeout?: number; auth?: Auth | null; host?: string } = {}): Promise<Run> {
  const auth = o.host ? authArgs(o.auth ?? null, o.host) : [];
  let proc: ReturnType<typeof Bun.spawn>;
  try {
    proc = Bun.spawn(["git", "-c", "color.ui=never", "-c", "core.pager=cat", "-c", "core.quotepath=false", ...auth, ...args], {
      cwd,
      stdout: "pipe",
      stderr: "pipe",
      stdin: "ignore",
      env: { ...process.env, GIT_TERMINAL_PROMPT: "0", GIT_PAGER: "cat", GCM_INTERACTIVE: "never" },
    });
  } catch (e) {
    return { ok: false, code: null, out: `git is not installed or not on PATH (${(e as Error).message}). Install Git for Windows from git-scm.com.` };
  }
  const kill = () => killTree(proc as any);
  o.signal?.addEventListener("abort", kill, { once: true });
  const timer = setTimeout(kill, o.timeout ?? 120_000);
  try {
    const [out, err] = await Promise.all([new Response(proc.stdout as ReadableStream).text(), new Response(proc.stderr as ReadableStream).text()]);
    await proc.exited;
    const text = [out.trimEnd(), err.trim()].filter(Boolean).join("\n").replace(/\r\n/g, "\n").replace(/^.*\r(?!\n)/gm, "");
    return { ok: proc.exitCode === 0, code: proc.exitCode, out: scrub(o.signal?.aborted ? "(stopped)" : text, o.auth ?? null) };
  } finally {
    clearTimeout(timer);
    o.signal?.removeEventListener("abort", kill);
  }
}

const one = async (cwd: string, args: string[]) => (await gitx(cwd, args)).out.trim();

// The host and GitHub owner/name of a remote, so pushes and PRs know where to go.
export async function remoteOf(cwd: string, remote = "origin") {
  const url = await one(cwd, ["remote", "get-url", remote]);
  if (!url || /^(error|fatal)/.test(url)) return null;
  const r = parseRepo(url);
  return { ...r, remote, url };
}

const authFor = async (host: string) => (host === "github.com" || host === new URL((await loadGitHub()).apiURL ?? "https://api.github.com").hostname.replace(/^api\./, "") ? await githubAuth() : null);

// What a fresh clone is, in a few lines: so the model knows how to build it before reading every file.
export function sizeUp(dir: string): string {
  const has = (f: string) => existsSync(join(dir, f));
  const lines: string[] = [];
  const stack: string[] = [];
  if (has("package.json")) {
    try {
      const p = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
      const scripts = Object.keys(p.scripts ?? {}).slice(0, 8);
      const pm = has("bun.lock") || has("bun.lockb") ? "bun" : has("pnpm-lock.yaml") ? "pnpm" : has("yarn.lock") ? "yarn" : "npm";
      stack.push(`Node/${pm}${scripts.length ? ` (scripts: ${scripts.join(", ")})` : ""}`);
    } catch {
      stack.push("Node");
    }
  }
  if (has("settings.gradle") || has("settings.gradle.kts") || has("build.gradle") || has("build.gradle.kts")) stack.push(has("app/src/main/AndroidManifest.xml") ? "Android (Gradle)" : "Gradle");
  if (has("pyproject.toml") || has("requirements.txt") || has("setup.py")) stack.push("Python");
  if (has("Cargo.toml")) stack.push("Rust (cargo)");
  if (has("go.mod")) stack.push("Go");
  if (has("project.godot")) stack.push("Godot");
  if (has("ProjectSettings/ProjectVersion.txt")) stack.push("Unity");
  if (readdirSafe(dir).some((f) => /\.(sln|csproj)$/.test(f))) stack.push(".NET");
  if (has("index.html") && !stack.length) stack.push("static web page");
  if (stack.length) lines.push(`stack: ${stack.join(", ")}`);
  const guides = ["MAXX.md", "CLAUDE.md", "AGENTS.md", "CONTRIBUTING.md", ".github/copilot-instructions.md"].filter(has);
  if (guides.length) lines.push(`instructions for agents: ${guides.join(", ")} (read before changing code)`);
  const readme = readdirSafe(dir).find((f) => /^readme(\.md|\.txt)?$/i.test(f));
  if (readme) {
    const text = readFileSync(join(dir, readme), "utf8").replace(/<[^>]+>/g, "").replace(/!\[[^\]]*\]\([^)]*\)/g, "");
    const para = text.split(/\n\s*\n/).map((p) => p.trim()).filter((p) => p && !/^[#=\-\s[]/.test(p) && p.length > 30)[0];
    const title = text.match(/^#\s+(.+)$/m)?.[1];
    lines.push(`readme: ${[title, para?.replace(/\s+/g, " ").slice(0, 260)].filter(Boolean).join(": ")}`);
  }
  const mcp = projectServers(dir);
  if (mcp.length) lines.push(`MCP servers it brings: ${mcp.map((m) => m.name).join(", ")} (they start only after the user approves them)`);
  return lines.join("\n");
}
const readdirSafe = (d: string) => {
  try {
    return readdirSync(d);
  } catch {
    return [];
  }
};

// Messages that are about getting or publishing code bring the repo tools along.
export function wantsRepo(text: string): boolean {
  return /\bgithub\.com\/|\bgit@[\w.-]+:|\bgitlab\.com\/|\bcodeberg\.org\/|https?:\/\/\S+\.git\b|\b(clone|fork)\b.{0,40}\b(repo|repository|project|github)|\b(pull request|open a pr|make a pr|create a pr|push (it|this|my|the) (changes|branch|code)?\s*(to|up)|\bgh\s+pr\b)/i.test(text) ||
    /\b(clone|get|grab|download|check out)\s+[\w.-]+\/[\w.-]+\b/i.test(text);
}

function expandHome(p: string) {
  return p.replace(/^~(?=$|[\\/])/, homedir());
}

export const repoClone = defineTool({
  name: "repo_clone",
  description:
    "Get a repository: clone a GitHub repo (owner/name or a github.com link) or any git URL onto this computer, then report what it is and how it builds. The user can open the folder as the project afterwards. If it is already there, it is updated instead.",
  schema: z.object({
    url: z.string().min(2).describe("owner/name, a github.com link, or any git URL"),
    folder: z.string().optional().describe("Where to put it; default ~/maxx-repos/<name>"),
    branch: z.string().optional().describe("Check out this branch or tag"),
    shallow: z.boolean().optional().describe("Only the latest commit (faster for big repos; no history)"),
  }),
  risk: "exec",
  checkpoint: false,
  ruleKey: (a) => a.url,
  preview: async (a) => {
    const r = parseRepo(a.url);
    return `git clone ${r.url}${a.branch ? ` (branch ${a.branch})` : ""}${a.shallow ? " --depth 1" : ""}\ninto ${a.folder ? expandHome(a.folder) : join(reposRoot(await loadGitHub()), r.name)}`;
  },
  refuse: (_a, ctx) => (ctx.network === false ? "Network access is off, so Maxx can't download a repository. Turn on 🌐 Network in ⚙ Settings (or /network on), then ask again." : undefined),
  async run(a, ctx) {
    const r = parseRepo(a.url);
    const dest = resolve(a.folder ? expandHome(a.folder) : join(reposRoot(await loadGitHub()), r.name));
    const auth = await authFor(r.host);
    const notes: string[] = [];
    if (existsSync(join(dest, ".git"))) {
      const same = (await remoteOf(dest))?.url;
      if (same && parseRepo(same).url !== r.url) return `error: ${dest} already holds another repository (${same}). Pass a different folder.`;
      const pull = await gitx(dest, ["pull", "--ff-only"], { signal: ctx.signal, auth, host: r.host, timeout: 300_000 });
      notes.push(pull.ok ? `already cloned at ${dest}; pulled the latest (${pull.out.split("\n").pop()})` : `already cloned at ${dest}; could not pull: ${pull.out.split("\n").slice(-2).join(" ")}`);
    } else {
      if (existsSync(dest) && readdirSafe(dest).length) return `error: ${dest} exists and is not empty. Pass a different folder.`;
      await mkdir(dirname(dest), { recursive: true });
      const args = ["clone", ...(a.shallow ? ["--depth", "1"] : []), ...(a.branch ? ["--branch", a.branch] : []), "--", r.url, dest];
      const c = await gitx(dirname(dest), args, { signal: ctx.signal, auth, host: r.host, timeout: 900_000 });
      if (!c.ok) {
        const why = c.out.split("\n").filter((l) => /fatal|error|denied|not found/i.test(l)).join(" ") || c.out.slice(-300);
        const hint = /not found|could not read|Authentication|403|401/i.test(why) && r.github && !auth ? ` If it is private: ${NO_AUTH}` : "";
        return `error: the clone failed: ${why}${hint}`;
      }
      notes.push(`cloned ${r.url} into ${dest}`);
    }
    const branch = await one(dest, ["branch", "--show-current"]);
    const last = await one(dest, ["log", "-1", "--date=short", "--pretty=format:%h %ad %s"]);
    const files = (await one(dest, ["ls-files"])).split("\n").filter(Boolean).length;
    notes.push(`branch ${branch || "(detached)"}, ${files} files, last commit ${last}`);
    const about = sizeUp(dest);
    if (about) notes.push(about);
    ctx.offerWorkspace?.(dest, r.name);
    notes.push(ctx.offerWorkspace ? "The app shows the user an Open button for it. To work on it here instead, use paths under that folder." : `To work on it as a project: cd "${dest}" and run maxx.`);
    return notes.join("\n");
  },
});

const REPO_ACTIONS = ["status", "branch", "switch", "pull", "push", "fork"] as const;

export const repoTool = defineTool({
  name: "repo",
  description:
    "Work with the project's remote repository. status: branch, ahead/behind the remote, open pull request. branch: make a new branch (from base, default the main branch) and switch to it; do this before changing someone's repository. switch: go to an existing branch. pull: bring in new commits. push: send this branch's commits to the remote (commit first with git_commit). fork: make your own copy on GitHub to push to when you can't push to the original.",
  schema: z.object({
    action: z.enum(REPO_ACTIONS),
    branch: z.string().optional().describe("branch, switch: its name"),
    base: z.string().optional().describe("branch: start from this branch (default the remote's main branch)"),
    remote: z.string().optional().describe("push: which remote (default origin, or fork after a fork)"),
  }),
  risk: "exec",
  riskOf: (a) => (a.action === "status" ? "read" : a.action === "push" || a.action === "fork" ? "exec" : "write"),
  danger: (a) => (a.action === "push" ? "publishes commits to a remote" : a.action === "fork" ? "makes a fork on your GitHub account" : null),
  checkpoint: false,
  ruleKey: (a) => `${a.action}${a.branch ? ` ${a.branch}` : ""}`,
  preview: async (a, ctx) => {
    const cur = await one(ctx.cwd, ["branch", "--show-current"]);
    if (a.action === "push") {
      const remote = a.remote ?? ((await remoteOf(ctx.cwd, "fork")) ? "fork" : "origin");
      const ahead = await one(ctx.cwd, ["log", "--oneline", `${remote}/${cur}..HEAD`]).catch(() => "");
      return `git push ${remote} ${cur}\n${ahead && !/^fatal/.test(ahead) ? ahead : "(the branch is new on the remote: all its commits)"}`;
    }
    return `repo ${a.action}${a.branch ? ` ${a.branch}` : ""}${a.base ? ` from ${a.base}` : ""} (now on ${cur || "no branch"})`;
  },
  refuse: (a, ctx) => (ctx.network === false && a.action !== "branch" && a.action !== "switch" ? "Network access is off, so Maxx can't reach the remote. Turn on 🌐 Network in ⚙ Settings, then ask again." : undefined),
  async run(a, ctx) {
    const cwd = ctx.cwd;
    if ((await one(cwd, ["rev-parse", "--is-inside-work-tree"])) !== "true") return "This folder is not a git repository. Use repo_clone to get one, or git_commit to start one.";
    const origin = await remoteOf(cwd);
    const auth = origin ? await authFor(origin.host) : null;
    const o = { signal: ctx.signal, auth, host: origin?.host };
    const cur = await one(cwd, ["branch", "--show-current"]);
    const main = async () => (await one(cwd, ["symbolic-ref", "--short", "refs/remotes/origin/HEAD"])).replace(/^origin\//, "") || ((await gitx(cwd, ["rev-parse", "--verify", "--quiet", "main"])).ok ? "main" : "master");
    switch (a.action) {
      case "status": {
        if (origin) await gitx(cwd, ["fetch", "--quiet", "origin"], { ...o, timeout: 60_000 });
        const sb = (await one(cwd, ["status", "--short", "--branch"])).split("\n");
        const changed = sb.slice(1).filter(Boolean).length;
        const out = [`branch ${cur || "(detached)"}: ${sb[0]!.replace(/^## /, "")}`, `${changed ? `${changed} file(s) changed and not committed` : "nothing uncommitted"}`];
        out.push(origin ? `origin: ${origin.url}${origin.github ? ` (GitHub ${origin.owner}/${origin.name})` : ""}` : "no remote: this repository is only on this computer");
        const fork = await remoteOf(cwd, "fork");
        if (fork) out.push(`fork: ${fork.url} (pushes go here)`);
        if (origin?.github && auth && cur) {
          try {
            const owner = fork?.owner ?? origin.owner;
            const prs = await api<any[]>(`/repos/${origin.owner}/${origin.name}/pulls?head=${owner}:${encodeURIComponent(cur)}&state=open`, { auth, signal: ctx.signal });
            if (prs[0]) out.push(`pull request #${prs[0].number}: ${prs[0].title} (${prs[0].html_url})`);
          } catch {}
        }
        if (origin?.github && !auth) out.push(`(no GitHub sign-in, so no pull requests: ${NO_AUTH})`);
        return out.join("\n");
      }
      case "branch": {
        if (!a.branch) return "error: branch needs a name, like fix-login or add-dark-mode";
        if (/^-|\s|\.\.|[~^:?*[\\]/.test(a.branch)) return `error: "${a.branch}" is not a valid branch name`;
        const base = a.base ?? (origin ? await main() : cur);
        if (origin) await gitx(cwd, ["fetch", "--quiet", "origin", base], { ...o, timeout: 120_000 });
        const from = origin && (await gitx(cwd, ["rev-parse", "--verify", "--quiet", `origin/${base}`])).ok ? `origin/${base}` : base;
        const sw = await gitx(cwd, ["switch", "-c", a.branch, ...(from ? [from] : [])]);
        if (!sw.ok) return `error: ${sw.out}`;
        if (from.startsWith("origin/")) await gitx(cwd, ["branch", "--unset-upstream"]);
        return `made branch ${a.branch} from ${from} and switched to it. Commit with git_commit, then repo push.`;
      }
      case "switch": {
        if (!a.branch) return "error: switch needs the branch name";
        let sw = await gitx(cwd, ["switch", a.branch]);
        if (!sw.ok && origin) {
          await gitx(cwd, ["fetch", "--quiet", "origin", a.branch], { ...o, timeout: 120_000 });
          sw = await gitx(cwd, ["switch", a.branch]);
        }
        return sw.ok ? `on branch ${a.branch}` : `error: ${sw.out}${/overwritten|local changes/.test(sw.out) ? " (commit or stash the changes first)" : ""}`;
      }
      case "pull": {
        if (!origin) return "error: no remote to pull from";
        const p = await gitx(cwd, ["pull", "--ff-only"], { ...o, timeout: 300_000 });
        if (p.ok) return p.out.split("\n").slice(-6).join("\n") || "up to date";
        if (/not possible to fast-forward|diverge/i.test(p.out)) return `error: this branch and the remote both have new commits. Ask the user before merging or rebasing.\n${p.out.slice(-300)}`;
        return `error: ${p.out.slice(-400)}`;
      }
      case "push": {
        if (!cur) return "error: not on a branch (detached HEAD). Make one with repo branch first.";
        const remote = a.remote ?? ((await remoteOf(cwd, "fork")) ? "fork" : "origin");
        const r = await remoteOf(cwd, remote);
        if (!r) return `error: no remote called ${remote}. ${origin ? "" : "This repository has no remote yet; make one on GitHub and add it (git remote add origin <url>)."}`;
        const pAuth = await authFor(r.host);
        const p = await gitx(cwd, ["push", "-u", remote, `HEAD:refs/heads/${cur}`], { signal: ctx.signal, auth: pAuth, host: r.host, timeout: 300_000 });
        if (p.ok) return `pushed ${cur} to ${remote} (${r.url})${r.github ? `. Open a pull request with github pr_create.` : ""}`;
        if (/rejected|non-fast-forward|fetch first/i.test(p.out)) return `error: the remote has commits this branch doesn't. Use repo pull first (never force-push).\n${p.out.slice(-300)}`;
        if (/403|denied|permission/i.test(p.out) && r.github) return `error: no permission to push to ${r.owner}/${r.name}. ${pAuth ? "Use repo fork to make your own copy, then push again." : NO_AUTH}\n${p.out.slice(-200)}`;
        return `error: ${p.out.slice(-400)}`;
      }
      case "fork": {
        if (!origin?.github) return "error: forking needs a GitHub origin";
        if (!auth) return `error: ${NO_AUTH}`;
        const f = await api<any>(`/repos/${origin.owner}/${origin.name}/forks`, { method: "POST", body: { default_branch_only: true }, auth, signal: ctx.signal });
        const url = f.clone_url as string;
        const has = await remoteOf(cwd, "fork");
        await gitx(cwd, has ? ["remote", "set-url", "fork", url] : ["remote", "add", "fork", url]);
        return `forked to ${f.full_name} (${f.html_url}); it is the "fork" remote now, and repo push goes there. Pull requests still go to ${origin.owner}/${origin.name}.`;
      }
    }
  },
});

const GH_ACTIONS = ["pr_create", "pr_list", "pr_view", "pr_checkout", "pr_comment", "issue_list", "issue_view", "issue_create", "issue_comment", "my_repos"] as const;
const READS = new Set(["pr_list", "pr_view", "issue_list", "issue_view", "my_repos"]);

const cut = (s: string | null | undefined, n: number) => {
  const t = (s ?? "").replace(/\r\n/g, "\n").trim();
  return t.length > n ? `${t.slice(0, n)}…` : t;
};

export const githubTool = defineTool({
  name: "github",
  description:
    "GitHub for the project's repository (or repo: owner/name). pr_create: open a pull request from the current branch (pushes it first; title, body). pr_list, pr_view (number: the description, changed files, checks and review comments, to fix what reviewers or CI said), pr_checkout (number: get a PR's branch to test or fix it), pr_comment. issue_list, issue_view (number), issue_create, issue_comment. my_repos: the user's repositories.",
  schema: z.object({
    action: z.enum(GH_ACTIONS),
    number: z.number().int().positive().optional(),
    title: z.string().optional(),
    body: z.string().optional().describe("Markdown: for a PR, what changed, why, and how it was tested"),
    base: z.string().optional().describe("pr_create: the branch to merge into (default the repo's main branch)"),
    draft: z.boolean().optional(),
    state: z.enum(["open", "closed", "all"]).optional(),
    repo: z.string().optional().describe("owner/name when it is not this project's origin"),
  }),
  risk: "exec",
  riskOf: (a) => (READS.has(a.action) ? "read" : a.action === "pr_checkout" ? "write" : "exec"),
  danger: (a) =>
    a.action === "pr_create" ? "opens a pull request on GitHub (and pushes the branch)" : a.action === "pr_comment" || a.action === "issue_comment" ? "posts a comment on GitHub as you" : a.action === "issue_create" ? "opens an issue on GitHub as you" : null,
  checkpoint: false,
  ruleKey: (a) => a.action,
  preview: async (a, ctx) => {
    const cur = await one(ctx.cwd, ["branch", "--show-current"]).catch(() => "");
    if (a.action === "pr_create") return `pull request from ${cur}${a.base ? ` into ${a.base}` : ""}${a.draft ? " (draft)" : ""}\n\n${a.title ?? ""}\n\n${a.body ?? ""}`;
    if (a.action.endsWith("comment")) return `comment on #${a.number}:\n\n${a.body ?? ""}`;
    if (a.action === "issue_create") return `new issue: ${a.title ?? ""}\n\n${a.body ?? ""}`;
    return `github ${a.action}${a.number ? ` #${a.number}` : ""}`;
  },
  refuse: (_a, ctx) => (ctx.network === false ? "Network access is off, so Maxx can't reach GitHub. Turn on 🌐 Network in ⚙ Settings, then ask again." : undefined),
  async run(a, ctx) {
    const auth = await githubAuth();
    const s = ctx.signal;
    if (a.action === "my_repos") {
      if (!auth) return `error: ${NO_AUTH}`;
      const rs = await api<any[]>("/user/repos?sort=pushed&per_page=30", { auth, signal: s });
      return rs.map((r) => `${r.full_name}${r.private ? " (private)" : ""}${r.fork ? " (fork)" : ""}: ${cut(r.description, 90) || "no description"} · pushed ${String(r.pushed_at).slice(0, 10)}`).join("\n") || "no repositories";
    }
    const origin = await remoteOf(ctx.cwd).catch(() => null);
    const ref = a.repo ? parseRepo(a.repo) : origin;
    if (!ref?.github || !ref.owner) return "error: this project has no GitHub origin. Pass repo: owner/name, or clone one with repo_clone.";
    const base = `/repos/${ref.owner}/${ref.name}`;
    if (!auth && !READS.has(a.action)) return `error: ${NO_AUTH}`;
    const need = (what: string) => `error: ${a.action} needs ${what}`;
    switch (a.action) {
      case "pr_list":
      case "issue_list": {
        const pr = a.action === "pr_list";
        const items = await api<any[]>(`${base}/${pr ? "pulls" : "issues"}?state=${a.state ?? "open"}&per_page=20`, { auth, signal: s });
        const list = items.filter((i) => pr || !i.pull_request);
        return list.map((i) => `#${i.number} ${i.title} (${i.user?.login}${pr ? `, ${i.head?.ref} → ${i.base?.ref}${i.draft ? ", draft" : ""}` : i.labels?.length ? `, ${i.labels.map((l: any) => l.name).join(", ")}` : ""})`).join("\n") || `no ${a.state ?? "open"} ${pr ? "pull requests" : "issues"}`;
      }
      case "issue_view":
      case "pr_view": {
        if (!a.number) return need("number");
        const i = await api<any>(`${base}/${a.action === "pr_view" ? "pulls" : "issues"}/${a.number}`, { auth, signal: s });
        const out = [`#${i.number} ${i.title} [${i.state}${i.merged ? ", merged" : ""}${i.draft ? ", draft" : ""}] by ${i.user?.login}`, i.html_url];
        if (a.action === "pr_view") out.push(`${i.head?.label} → ${i.base?.ref}, ${i.commits} commit(s), +${i.additions} −${i.deletions} in ${i.changed_files} file(s)${i.mergeable === false ? ", has merge conflicts" : ""}`);
        out.push("", cut(i.body, 2500) || "(no description)");
        if (a.action === "pr_view") {
          const files = await api<any[]>(`${base}/pulls/${a.number}/files?per_page=50`, { auth, signal: s }).catch(() => []);
          if (files.length) out.push("", "files:", ...files.slice(0, 30).map((f) => `  ${f.status} ${f.filename} (+${f.additions} −${f.deletions})`));
          const checks = await api<any>(`${base}/commits/${i.head?.sha}/check-runs?per_page=30`, { auth, signal: s }).catch(() => null);
          const runs: any[] = checks?.check_runs ?? [];
          if (runs.length) out.push("", "checks:", ...runs.map((c) => `  ${c.conclusion ?? c.status} ${c.name}${c.conclusion === "failure" && c.output?.summary ? `: ${cut(c.output.summary, 200)}` : ""}`));
          const reviews = await api<any[]>(`${base}/pulls/${a.number}/comments?per_page=30`, { auth, signal: s }).catch(() => []);
          if (reviews.length) out.push("", "review comments:", ...reviews.slice(-12).map((c) => `  ${c.user?.login} on ${c.path}:${c.line ?? c.original_line ?? "?"}: ${cut(c.body, 300)}`));
        }
        const comments = await api<any[]>(`${base}/issues/${a.number}/comments?per_page=30`, { auth, signal: s }).catch(() => []);
        if (comments.length) out.push("", "comments:", ...comments.slice(-10).map((c) => `  ${c.user?.login}: ${cut(c.body, 400)}`));
        return out.join("\n");
      }
      case "pr_checkout": {
        if (!a.number) return need("number");
        const host = origin?.host ?? "github.com";
        const f = await gitx(ctx.cwd, ["fetch", "origin", `pull/${a.number}/head:pr-${a.number}`], { signal: s, auth, host, timeout: 180_000 });
        if (!f.ok && !/already exists|refusing to fetch into/.test(f.out)) return `error: ${f.out.slice(-300)}`;
        const sw = await gitx(ctx.cwd, ["switch", `pr-${a.number}`]);
        return sw.ok ? `on branch pr-${a.number} with pull request #${a.number}'s code. Run the tests, or fix and commit; pushing it needs the PR author's branch, so open a new PR instead.` : `error: ${sw.out}`;
      }
      case "pr_create": {
        if (!a.title) return need("a title");
        const cur = await one(ctx.cwd, ["branch", "--show-current"]);
        if (!cur) return "error: not on a branch. Make one with repo branch, commit, then pr_create.";
        const info = await api<any>(base, { auth, signal: s });
        const into = a.base ?? info.default_branch;
        if (cur === into) return `error: you are on ${into}, the branch the PR would go into. Make a branch first (repo branch), move the commits there, then try again.`;
        const dirty = (await one(ctx.cwd, ["status", "--porcelain"])).split("\n").filter(Boolean).length;
        const fork = await remoteOf(ctx.cwd, "fork");
        const pushTo = fork ?? origin!;
        const p = await gitx(ctx.cwd, ["push", "-u", pushTo.remote, `HEAD:refs/heads/${cur}`], { signal: s, auth, host: pushTo.host, timeout: 300_000 });
        if (!p.ok) return `error: could not push ${cur} first: ${p.out.slice(-300)}${/403|denied|permission/i.test(p.out) ? " (use repo fork, then pr_create again)" : ""}`;
        const head = fork ? `${fork.owner}:${cur}` : cur;
        try {
          const pr = await api<any>(`${base}/pulls`, { method: "POST", body: { title: a.title, body: a.body ?? "", head, base: into, draft: !!a.draft }, auth, signal: s });
          return `opened pull request #${pr.number}: ${pr.html_url}${dirty ? `\n(note: ${dirty} changed file(s) were not committed, so they are not in the PR)` : ""}`;
        } catch (e) {
          if (/already exists/i.test((e as Error).message)) {
            const open = await api<any[]>(`${base}/pulls?head=${(fork?.owner ?? ref.owner)}:${encodeURIComponent(cur)}&state=open`, { auth, signal: s }).catch(() => []);
            return `the branch was pushed; a pull request for it is already open${open[0] ? `: #${open[0].number} ${open[0].html_url}` : ""}`;
          }
          throw e;
        }
      }
      case "pr_comment":
      case "issue_comment": {
        if (!a.number || !a.body) return need("number and body");
        const c = await api<any>(`${base}/issues/${a.number}/comments`, { method: "POST", body: { body: a.body }, auth, signal: s });
        return `commented: ${c.html_url}`;
      }
      case "issue_create": {
        if (!a.title) return need("a title");
        const i = await api<any>(`${base}/issues`, { method: "POST", body: { title: a.title, body: a.body ?? "" }, auth, signal: s });
        return `opened issue #${i.number}: ${i.html_url}`;
      }
    }
    return "error: unknown action";
  },
});

export const REPO_TOOLS: Tool<any>[] = [repoClone, repoTool, githubTool];
export const REPO_PROMPT =
  "Repo tools: repo_clone gets a repository (owner/name or any git URL) and says how it builds. To change someone's repository: repo branch first (a short name for the change), edit, run the tests, git_commit, then github pr_create with a title and a body that says what changed and how you tested it (it pushes the branch). repo status shows where you are; github pr_view shows a PR's checks and review comments so you can fix them. Never force-push, and never commit to the main branch of a cloned repository.";
