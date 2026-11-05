import { expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { authArgs, parseRepo, scrub } from "../src/github.ts";
import { gitx, githubTool, repoClone, repoTool, sizeUp, wantsRepo } from "../src/tools/repo.ts";
import { gitCommit } from "../src/tools/git.ts";
import { Permissions } from "../src/permissions.ts";
import { TOOLSETS } from "../src/tools/index.ts";

process.env.MAXX_HOME = await mkdtemp(join(tmpdir(), "maxx-home-repo-"));
process.env.MAXX_NO_GH = "1";
delete process.env.GH_TOKEN;
delete process.env.GITHUB_TOKEN;
const who = ["-c", "user.name=T", "-c", "user.email=t@t"];

test("repository names: owner/name, links into a repo, ssh, other hosts, local paths", () => {
  expect(parseRepo("xennon3/maxx-agent")).toEqual({ url: "https://github.com/xennon3/maxx-agent.git", host: "github.com", owner: "xennon3", name: "maxx-agent", github: true });
  expect(parseRepo("https://github.com/oven-sh/bun/tree/main/src").url).toBe("https://github.com/oven-sh/bun.git");
  expect(parseRepo("github.com/a/b.git").name).toBe("b");
  expect(parseRepo("git clone git@github.com:me/app.git")).toMatchObject({ host: "github.com", owner: "me", name: "app", github: true });
  expect(parseRepo("https://gitlab.com/group/proj.git")).toMatchObject({ host: "gitlab.com", name: "proj", github: false });
  expect(parseRepo("C:\\code\\thing")).toMatchObject({ name: "thing", github: false });
  expect(parseRepo("./local/repo.git").name).toBe("repo");
});

test("messages about repositories bring the repo tools; others don't", () => {
  for (const t of ["clone https://github.com/a/b and fix the tests", "get xennon3/maxx-agent and add dark mode", "open a PR for this", "fork the repo and push my changes", "git@github.com:me/app.git"]) expect([t, wantsRepo(t)]).toEqual([t, true]);
  for (const t of ["make a tip calculator", "why does the build fail?", "push the button color to blue"]) expect([t, wantsRepo(t)]).toEqual([t, false]);
  expect(TOOLSETS.repo!.tools.map((t) => t.name)).toEqual(["repo_clone", "repo", "github"]);
});

test("the token only ever goes to GitHub as a one-off header, and is scrubbed from output", () => {
  const auth = { token: "ghp_SECRET", source: "maxx" as const };
  const args = authArgs(auth, "github.com");
  expect(args[1]).toStartWith("http.https://github.com/.extraheader=AUTHORIZATION: basic ");
  expect(args.join(" ")).not.toContain("ghp_SECRET");
  expect(scrub("fatal: ghp_SECRET and AUTHORIZATION: basic eHg6eXk=", auth)).toBe("fatal: ••• and AUTHORIZATION: •••");
  expect(authArgs(null, "github.com")).toEqual([]);
});

test("pushes, pull requests and comments still ask under auto-run; reading never asks", async () => {
  const yolo = new Permissions(process.env.MAXX_HOME!, "yolo");
  expect(yolo.needsPrompt(repoTool, { action: "push" })).toBe(true);
  expect(yolo.needsPrompt(repoTool, { action: "branch", branch: "x" })).toBe(false);
  expect(yolo.needsPrompt(githubTool, { action: "pr_create", title: "x" })).toBe(true);
  expect(yolo.needsPrompt(githubTool, { action: "issue_comment", number: 1, body: "x" })).toBe(true);
  const ask = new Permissions(process.env.MAXX_HOME!, "ask");
  expect(ask.needsPrompt(githubTool, { action: "pr_view", number: 1 })).toBe(false);
  expect(ask.needsPrompt(repoTool, { action: "status" })).toBe(false);
  expect(ask.needsPrompt(repoClone, { url: "a/b" })).toBe(true);
  expect(repoClone.refuse!({ url: "a/b" }, { cwd: ".", network: false })).toContain("Network access is off");
});

test("clone, size it up, branch, commit, push, and open a pull request", async () => {
  const root = await mkdtemp(join(tmpdir(), "maxx-repo-e2e-"));
  // The "remote": a bare repository with one commit on main.
  const seed = join(root, "seed");
  const bare = join(root, "origin.git");
  await gitx(root, ["init", "-b", "main", seed]);
  await writeFile(join(seed, "package.json"), JSON.stringify({ name: "app", scripts: { test: "bun test", dev: "vite" } }));
  await writeFile(join(seed, "README.md"), "# Space Game\n\nA small shooter where you dodge asteroids and collect stars for points.\n");
  await writeFile(join(seed, "CLAUDE.md"), "Use bun.\n");
  await writeFile(join(seed, ".mcp.json"), JSON.stringify({ mcpServers: { level: { command: "node", args: ["level.js"] } } }));
  await gitx(seed, ["add", "-A"]);
  await gitx(seed, [...who, "commit", "-m", "first"]);
  await gitx(root, ["clone", "--bare", seed, bare]);

  const offered: string[] = [];
  const dest = join(root, "work", "app");
  const out = String(await repoClone.run({ url: bare, folder: dest }, { cwd: root, network: true, offerWorkspace: (d) => offered.push(d) }));
  expect(out).toContain(`cloned ${bare} into ${dest}`);
  expect(out).toContain("stack: Node/npm (scripts: test, dev)");
  expect(out).toContain("instructions for agents: CLAUDE.md");
  expect(out).toContain("readme: Space Game: A small shooter");
  expect(out).toContain("MCP servers it brings: level");
  expect(offered).toEqual([dest]);
  expect(sizeUp(dest)).toContain("Node");
  // Cloning again updates it instead of failing.
  expect(String(await repoClone.run({ url: bare, folder: dest }, { cwd: root, network: true }))).toContain("already cloned");

  // Pretend origin is on GitHub for the API, while pushes really go to the bare repo.
  await gitx(dest, ["remote", "set-url", "origin", "https://github.com/me/app.git"]);
  await gitx(dest, ["remote", "set-url", "--push", "origin", bare]);
  await gitx(dest, ["config", "user.name", "T"]);
  await gitx(dest, ["config", "user.email", "t@t"]);
  const ctx = { cwd: dest, network: true };
  expect(String(await repoTool.run({ action: "branch", branch: "add-stars", base: "main" }, ctx))).toContain("made branch add-stars");
  await writeFile(join(dest, "stars.ts"), "export const stars = 3;\n");
  expect(String(await gitCommit.run({ message: "Add stars" }, ctx))).toContain("committed");

  const calls: { method: string; path: string; body: any; auth: string | null }[] = [];
  const api = Bun.serve({
    port: 0,
    async fetch(req) {
      const url = new URL(req.url);
      const body = req.method === "POST" ? await req.json() : null;
      calls.push({ method: req.method, path: url.pathname + url.search, body, auth: req.headers.get("authorization") });
      if (url.pathname === "/repos/me/app" && req.method === "GET") return Response.json({ default_branch: "main" });
      if (url.pathname === "/repos/me/app/pulls" && req.method === "POST") return Response.json({ number: 7, html_url: "https://github.com/me/app/pull/7" }, { status: 201 });
      if (url.pathname === "/repos/me/app/pulls/7") return Response.json({ number: 7, title: "Add stars", state: "open", user: { login: "me" }, html_url: "https://github.com/me/app/pull/7", head: { label: "me:add-stars", sha: "abc" }, base: { ref: "main" }, commits: 1, additions: 1, deletions: 0, changed_files: 1, body: "Adds stars." });
      if (url.pathname === "/repos/me/app/pulls/7/files") return Response.json([{ status: "added", filename: "stars.ts", additions: 1, deletions: 0 }]);
      if (url.pathname === "/repos/me/app/commits/abc/check-runs") return Response.json({ check_runs: [{ name: "test", status: "completed", conclusion: "failure", output: { summary: "1 test failed: stars > 2" } }] });
      if (url.pathname === "/repos/me/app/pulls/7/comments") return Response.json([{ user: { login: "rev" }, path: "stars.ts", line: 1, body: "Make it 5" }]);
      if (url.pathname.endsWith("/comments")) return Response.json([]);
      return Response.json({ message: "Not Found" }, { status: 404 });
    },
  });
  process.env.MAXX_GITHUB_API = `http://127.0.0.1:${api.port}`;
  try {
    // Without a sign-in, writing to GitHub says how to sign in.
    expect(String(await githubTool.run({ action: "pr_create", title: "Add stars" }, ctx))).toContain("No GitHub sign-in");
    process.env.GH_TOKEN = "ghp_TEST";
    const pr = String(await githubTool.run({ action: "pr_create", title: "Add stars", body: "Adds stars." }, ctx));
    expect(pr).toBe("opened pull request #7: https://github.com/me/app/pull/7");
    expect((await gitx(bare, ["branch", "--list", "add-stars"])).out).toContain("add-stars");
    const post = calls.find((c) => c.method === "POST")!;
    expect(post.body).toEqual({ title: "Add stars", body: "Adds stars.", head: "add-stars", base: "main", draft: false });
    expect(post.auth).toBe("Bearer ghp_TEST");
    const view = String(await githubTool.run({ action: "pr_view", number: 7 }, ctx));
    expect(view).toContain("failure test: 1 test failed: stars > 2");
    expect(view).toContain("rev on stars.ts:1: Make it 5");
    expect(view).toContain("added stars.ts (+1 −0)");
    const st = String(await repoTool.run({ action: "status" }, ctx));
    expect(st).toContain("branch add-stars");
    expect(st).toContain("GitHub me/app");
    // Pushing again is fine; force-pushing is never offered.
    expect(String(await repoTool.run({ action: "push" }, ctx))).toContain("pushed add-stars to origin");
  } finally {
    delete process.env.GH_TOKEN;
    delete process.env.MAXX_GITHUB_API;
    api.stop(true);
  }
  expect(existsSync(join(dest, ".git"))).toBe(true);
}, 60_000);
