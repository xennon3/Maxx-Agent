// GitHub sign-in and API for the repo tools. A token comes from (first found):
// $GH_TOKEN or $GITHUB_TOKEN, the one saved in ~/.maxx/github.json (the app's
// GitHub sign-in, or `maxx github login`), or the GitHub CLI (`gh auth token`).
// The token is only ever sent to GitHub: as the API's Authorization header and
// as a one-off git header for pushes and clones, never written into a remote URL.

import { mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { maxxHome } from "./sessions.ts";

export type GitHubSaved = { token?: string; user?: string; apiURL?: string; reposRoot?: string };
export const githubFile = () => join(maxxHome(), "github.json");

export async function loadGitHub(): Promise<GitHubSaved> {
  try {
    return JSON.parse(await readFile(githubFile(), "utf8")) as GitHubSaved;
  } catch {
    return {};
  }
}

export async function saveGitHub(g: GitHubSaved) {
  await mkdir(maxxHome(), { recursive: true });
  const clean = Object.fromEntries(Object.entries(g).filter(([, v]) => v !== undefined && v !== ""));
  if (!Object.keys(clean).length) return void (await rm(githubFile(), { force: true }));
  await writeFile(githubFile(), JSON.stringify(clean, null, 2) + "\n", { mode: 0o600 });
}

export const apiURL = (g: GitHubSaved = {}) => (process.env.MAXX_GITHUB_API ?? g.apiURL ?? "https://api.github.com").replace(/\/+$/, "");
// Where repo_clone puts repositories when no folder is given.
export const reposRoot = (g: GitHubSaved = {}) => process.env.MAXX_REPOS ?? g.reposRoot ?? join(homedir(), "maxx-repos");

export type Auth = { token: string; source: "env" | "maxx" | "gh" };

let ghCache: { at: number; token: string | null } | null = null;
async function ghToken(): Promise<string | null> {
  if (process.env.MAXX_NO_GH === "1" || !Bun.which("gh")) return null;
  if (ghCache && Date.now() - ghCache.at < 60_000) return ghCache.token;
  try {
    const p = Bun.spawn(["gh", "auth", "token"], { stdout: "pipe", stderr: "ignore", stdin: "ignore" });
    const out = (await new Response(p.stdout).text()).trim();
    await p.exited;
    ghCache = { at: Date.now(), token: p.exitCode === 0 && out ? out : null };
  } catch {
    ghCache = { at: Date.now(), token: null };
  }
  return ghCache.token;
}

export async function githubAuth(): Promise<Auth | null> {
  const env = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  if (env) return { token: env, source: "env" };
  const saved = (await loadGitHub()).token;
  if (saved) return { token: saved, source: "maxx" };
  const gh = await ghToken();
  return gh ? { token: gh, source: "gh" } : null;
}

export const NO_AUTH =
  "No GitHub sign-in yet. Add a token in the app (sidebar ⤓ Clone → GitHub sign-in), run `maxx github login <token>`, or install the GitHub CLI and run `gh auth login`. Make the token at github.com/settings/tokens (fine-grained: Contents and Pull requests read & write).";

export class GitHubError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

export async function api<T = any>(path: string, o: { method?: string; body?: unknown; auth?: Auth | null; signal?: AbortSignal } = {}): Promise<T> {
  const g = await loadGitHub();
  const auth = o.auth === undefined ? await githubAuth() : o.auth;
  const res = await fetch(`${apiURL(g)}${path}`, {
    method: o.method ?? "GET",
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "maxx-agent",
      ...(auth ? { Authorization: `Bearer ${auth.token}` } : {}),
      ...(o.body ? { "Content-Type": "application/json" } : {}),
    },
    body: o.body ? JSON.stringify(o.body) : undefined,
    signal: o.signal ?? AbortSignal.timeout(30_000),
  });
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  let j: any;
  try {
    j = text ? JSON.parse(text) : undefined;
  } catch {
    j = { message: text.slice(0, 200) };
  }
  if (!res.ok) {
    const detail = [j?.message, ...(Array.isArray(j?.errors) ? j.errors.map((e: any) => e.message ?? e.code ?? JSON.stringify(e)) : [])].filter(Boolean).join("; ");
    const hint = res.status === 401 ? " (the token is wrong or expired)" : res.status === 403 || res.status === 404 ? (auth ? " (the token may not have access to this repository)" : ` (${NO_AUTH})`) : "";
    throw new GitHubError(res.status, `GitHub answered ${res.status}: ${detail || res.statusText}${hint}`);
  }
  return j as T;
}

// Who the token belongs to, for the app's sign-in row.
export async function whoami(auth?: Auth | null): Promise<{ login: string; name?: string } | null> {
  const a = auth === undefined ? await githubAuth() : auth;
  if (!a) return null;
  const u = await api<{ login: string; name?: string }>("/user", { auth: a });
  return { login: u.login, name: u.name ?? undefined };
}

export type RepoRef = { url: string; host: string; owner?: string; name: string; github: boolean };

// owner/name, github.com/owner/name, https://..., git@host:owner/name.git, or a local path.
export function parseRepo(input: string): RepoRef {
  let s = input.trim().replace(/^git\s+clone\s+/, "").split(/\s+/)[0]!.replace(/\/+$/, "");
  const short = s.match(/^([\w.-]+)\/([\w.-]+?)(?:\.git)?$/);
  if (short && !s.startsWith(".") && !/^[A-Za-z]:/.test(s)) return { url: `https://github.com/${short[1]}/${short[2]}.git`, host: "github.com", owner: short[1], name: short[2]!, github: true };
  if (/^(?:www\.)?github\.com\//i.test(s)) s = `https://${s.replace(/^www\./i, "")}`;
  const ssh = s.match(/^[\w.-]+@([\w.-]+):([\w.-]+)\/([\w.-]+?)(?:\.git)?$/);
  if (ssh) return { url: s, host: ssh[1]!, owner: ssh[2], name: ssh[3]!, github: ssh[1] === "github.com" };
  try {
    if (/^[A-Za-z]:[\\/]/.test(s)) throw 0; // a Windows path, not a c: URL
    const u = new URL(s);
    if (u.protocol === "file:") throw 0;
    const [owner, repo] = u.pathname.replace(/^\/+/, "").split("/");
    // A browser link into a repo (…/tree/main/src) clones the repo.
    const name = (repo ?? owner ?? "repo").replace(/\.git$/, "");
    const github = u.hostname === "github.com";
    const url = github && owner && repo ? `https://github.com/${owner}/${name}.git` : s;
    return { url, host: u.hostname, owner: repo ? owner : undefined, name, github };
  } catch {}
  const name = s.split(/[\\/]/).filter(Boolean).pop()?.replace(/\.git$/, "") || "repo";
  return { url: s, host: "", name, github: false };
}

// git -c ... arguments that send the token to this host only, for this one command.
export function authArgs(auth: Auth | null, host: string): string[] {
  if (!auth || !host) return [];
  const basic = Buffer.from(`x-access-token:${auth.token}`).toString("base64");
  return ["-c", `http.https://${host}/.extraheader=AUTHORIZATION: basic ${basic}`];
}

// The token stays out of anything shown to the model or the user.
export const scrub = (s: string, auth: Auth | null) => (auth ? s.split(auth.token).join("•••") : s).replace(/AUTHORIZATION: basic [\w=+/]+/gi, "AUTHORIZATION: •••");
