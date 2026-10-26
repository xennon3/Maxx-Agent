import { resolve, relative, isAbsolute } from "node:path";

// Resolve a model-supplied path inside the workspace; refuse to escape it.
export function inside(cwd: string, p: string): string {
  const abs = resolve(cwd, p);
  const rel = relative(cwd, abs);
  if (rel.startsWith("..") || isAbsolute(rel)) {
    throw new Error(`path ${p} is outside the workspace ${cwd}`);
  }
  return abs;
}
