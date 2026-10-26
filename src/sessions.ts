import { homedir } from "node:os";
import { basename, join, resolve } from "node:path";
import { mkdir, readdir } from "node:fs/promises";
import type { Message } from "./llm.ts";
import { textOf } from "./context.ts";

// Saved sessions, grouped by project directory:
//   ~/.maxx/projects/<name>-<hash>/sessions/<id>.json
// Every turn is saved, so `maxx -c` picks up where you left off in this
// project and `maxx sessions --all` shows what you were doing everywhere.

export type Session = {
  id: string;
  cwd: string;
  title: string;
  created: string;
  updated: string;
  model: string;
  toolsets: string[];
  turns: number;
  history: Message[];
};

export type SessionInfo = Omit<Session, "history">;

export const maxxHome = () => process.env.MAXX_HOME ?? join(homedir(), ".maxx");

// Windows paths are case-insensitive, so the same folder always maps to one key.
export function projectKey(cwd: string): string {
  const abs = resolve(cwd);
  const norm = process.platform === "win32" ? abs.toLowerCase().replace(/\\/g, "/") : abs;
  const name = (basename(abs) || "root").replace(/[^\w.-]+/g, "_").slice(0, 40);
  return `${name}-${Bun.hash(norm).toString(16).slice(0, 8)}`;
}

const projectsDir = () => join(maxxHome(), "projects");
const sessionsDir = (cwd: string) => join(projectsDir(), projectKey(cwd), "sessions");

export function newSessionId(now = new Date()): string {
  return now.toISOString().replace(/[:.]/g, "-").replace("Z", "") + "-" + Math.random().toString(36).slice(2, 6);
}

// Screenshots are not worth keeping on disk; the text around them is.
function forDisk(history: Message[]): Message[] {
  return history.map((m) =>
    m.role === "user" && Array.isArray(m.content) && m.content.some((p) => p.type === "image_url")
      ? { role: "user", content: [{ type: "text", text: `${textOf(m.content.filter((p) => p.type === "text"))} [screenshot not saved]` }] }
      : m,
  );
}

export function titleFrom(history: Message[]): string {
  const first = history.find((m) => m.role === "user" && typeof m.content === "string" && !m.content.startsWith("Summary of the earlier"));
  const t = first ? textOf(first.content).replace(/\s+/g, " ").trim() : "";
  return t.length > 60 ? t.slice(0, 57) + "..." : t || "(empty)";
}

export async function saveSession(s: Omit<Session, "updated" | "title" | "turns"> & { title?: string }) {
  const dir = sessionsDir(s.cwd);
  await mkdir(dir, { recursive: true });
  const turns = s.history.filter((m) => m.role === "user" && typeof m.content === "string").length;
  const full: Session = { ...s, title: s.title || titleFrom(s.history), turns, updated: new Date().toISOString(), history: forDisk(s.history) };
  await Bun.write(join(dir, `${s.id}.json`), JSON.stringify(full));
  // Lets `sessions --all` show the real path without reading every session.
  await Bun.write(join(projectsDir(), projectKey(s.cwd), "project.json"), JSON.stringify({ cwd: resolve(s.cwd) }));
  return full;
}

export async function loadSession(cwd: string, id: string): Promise<Session | null> {
  const f = Bun.file(join(sessionsDir(cwd), `${id}.json`));
  return (await f.exists()) ? ((await f.json()) as Session) : null;
}

// Newest first.
export async function listSessions(cwd: string): Promise<SessionInfo[]> {
  return listIn(sessionsDir(cwd));
}

async function listIn(dir: string): Promise<SessionInfo[]> {
  let files: string[];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
  const out: SessionInfo[] = [];
  for (const f of files) {
    try {
      const { history: _, ...info } = (await Bun.file(join(dir, f)).json()) as Session;
      out.push(info);
    } catch {}
  }
  return out.sort((a, b) => b.updated.localeCompare(a.updated));
}

export async function listProjects(): Promise<{ cwd: string; sessions: SessionInfo[] }[]> {
  let keys: string[];
  try {
    keys = await readdir(projectsDir());
  } catch {
    return [];
  }
  const out = [];
  for (const k of keys) {
    const sessions = await listIn(join(projectsDir(), k, "sessions"));
    if (!sessions.length) continue;
    out.push({ cwd: sessions[0]!.cwd, sessions });
  }
  return out.sort((a, b) => b.sessions[0]!.updated.localeCompare(a.sessions[0]!.updated));
}

// "3", an id, or the start of an id or title.
export async function findSession(cwd: string, ref: string): Promise<SessionInfo | null> {
  const list = await listSessions(cwd);
  if (/^\d+$/.test(ref) && Number(ref) >= 1 && Number(ref) <= list.length) return list[Number(ref) - 1]!;
  const r = ref.toLowerCase();
  return list.find((s) => s.id === ref) ?? list.find((s) => s.id.startsWith(ref)) ?? list.find((s) => s.title.toLowerCase().includes(r)) ?? null;
}

export function ago(iso: string, now = Date.now()): string {
  const s = Math.max(0, (now - Date.parse(iso)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function formatList(list: SessionInfo[], current?: string): string {
  if (!list.length) return "(no saved sessions in this project yet)";
  return list
    .map((s, i) => `${s.id === current ? "*" : " "}${String(i + 1).padStart(3)}  ${ago(s.updated).padEnd(9)} ${String(s.turns).padStart(3)} turns  ${s.title}${s.toolsets.length ? `  [${s.toolsets.join(",")}]` : ""}`)
    .join("\n");
}
