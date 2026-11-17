import { readFileSync, statSync } from "node:fs";
import { resolve, relative, isAbsolute } from "node:path";

// Models on Windows copy the Git Bash style from shell output (/c/Users/...);
// read it as C:/Users/... so file tools accept the same paths bash does.
export function fromGitBash(p: string, platform: NodeJS.Platform = process.platform): string {
  const m = platform === "win32" ? /^\/([a-zA-Z])(?:\/(.*))?$/.exec(p) : null;
  return m ? `${m[1]!.toUpperCase()}:/${m[2] ?? ""}` : p;
}

// Resolve a model-supplied path inside the workspace; refuse to escape it.
export function inside(cwd: string, p: string): string {
  const abs = resolve(cwd, fromGitBash(p));
  const rel = relative(cwd, abs);
  if (rel.startsWith("..") || isAbsolute(rel)) {
    throw new Error(`path ${p} is outside the workspace ${cwd}; use a path relative to it`);
  }
  return abs;
}

// A short fingerprint of a file's contents (for the repeat check: re-running a
// file the model just changed is not a repeat).
export function fileKey(path: string): string {
  try {
    const st = statSync(path);
    return `${st.size}:${Bun.hash(readFileSync(path)).toString(36)}`;
  } catch {
    return "none";
  }
}
