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
