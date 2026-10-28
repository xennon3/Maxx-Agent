import { existsSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { checkFromNotes } from "./memory.ts";
import { shell } from "./shell.ts";

// The fix-it loop. When the model says it is done after changing files, Maxx
// checks the work itself and hands back the first error, so a small model
// fixes its own typo instead of declaring victory over a broken build.
//
// Two kinds of check: a quick one that needs nothing installed (does each
// changed .js/.ts/.html/.json file still parse?) and the project's own build
// command, when there is an obvious one or MAXX.md names one with `check:`.

export type CheckResult = { ok: true; what: string } | { ok: false; what: string; output: string };

const JS = new Set([".js", ".mjs", ".cjs", ".jsx", ".ts", ".tsx", ".mts"]);

function loaderFor(ext: string): "js" | "jsx" | "ts" | "tsx" {
  return ext === ".tsx" ? "tsx" : ext === ".jsx" ? "jsx" : /^\.[mc]?ts$/.test(ext) ? "ts" : "js";
}

function parseError(code: string, loader: "js" | "jsx" | "ts" | "tsx"): string | null {
  try {
    new Bun.Transpiler({ loader }).transformSync(code);
    return null;
  } catch (e) {
    const err = e as { message?: string; errors?: { message?: string; position?: { line?: number; column?: number } }[] };
    const first = err.errors?.[0];
    const where = first?.position?.line ? `line ${first.position.line}` : "";
    return `${where ? where + ": " : ""}${first?.message ?? err.message ?? String(e)}`;
  }
}

// Inline scripts, with the line where each starts, so errors point at the page's own line numbers.
export function inlineScripts(html: string): { code: string; line: number }[] {
  const out: { code: string; line: number }[] = [];
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  for (let m; (m = re.exec(html)); ) {
    const attrs = m[1]!;
    if (/\bsrc\s*=/.test(attrs)) continue;
    const type = attrs.match(/\btype\s*=\s*["']?([^"'\s>]+)/i)?.[1]?.toLowerCase();
    if (type && !/^(module|text\/javascript|application\/javascript)$/.test(type)) continue;
    const before = html.slice(0, m.index + m[0].indexOf(">") + 1);
    out.push({ code: m[2]!, line: before.split("\n").length });
  }
  return out;
}

export function syntaxCheck(path: string, text: string): string | null {
  const ext = extname(path).toLowerCase();
  if (JS.has(ext)) {
    const e = parseError(text, loaderFor(ext));
    return e && `${path}: ${e}`;
  }
  if (ext === ".json") {
    try {
      JSON.parse(text);
      return null;
    } catch (e) {
      return `${path}: ${(e as Error).message}`;
    }
  }
  if (ext === ".html" || ext === ".htm") {
    for (const s of inlineScripts(text)) {
      const e = parseError(s.code, "js");
      if (!e) continue;
      // Shift "line N" inside the script to the line in the page.
      return `${path}: ${e.replace(/^line (\d+)/, (_, n) => `line ${Number(n) + s.line - 1}`)}`;
    }
  }
  return null;
}

export async function quickCheck(cwd: string, files: string[]): Promise<CheckResult | null> {
  const checked: string[] = [];
  for (const f of files) {
    const abs = join(cwd, f);
    if (!existsSync(abs)) continue;
    const ext = extname(f).toLowerCase();
    if (!JS.has(ext) && ![".json", ".html", ".htm"].includes(ext)) continue;
    checked.push(f);
    const err = syntaxCheck(f, readFileSync(abs, "utf8"));
    if (err) return { ok: false, what: `syntax check of ${f}`, output: `error: ${err}` };
  }
  return checked.length ? { ok: true, what: `syntax check of ${checked.join(", ")}` } : null;
}

// The project's build or type check, if one is obvious. Tests are left out on
// purpose: some start in watch mode and never return.
export function detectCheck(cwd: string, kind: "bash" | "powershell" = shell().kind): string | undefined {
  const has = (f: string) => existsSync(join(cwd, f));
  for (const f of ["MAXX.md", "AGENTS.md"]) {
    if (!has(f)) continue;
    const c = checkFromNotes(readFileSync(join(cwd, f), "utf8"));
    if (c) return /^(none|off)$/i.test(c) ? undefined : c;
  }
  if (has("package.json")) {
    let scripts: Record<string, string> = {};
    try {
      scripts = JSON.parse(readFileSync(join(cwd, "package.json"), "utf8")).scripts ?? {};
    } catch {}
    const pm = has("bun.lock") || has("bun.lockb") ? "bun" : has("pnpm-lock.yaml") ? "pnpm" : has("yarn.lock") ? "yarn" : "npm";
    const name = ["typecheck", "check", "build"].find((n) => scripts[n] && !/--watch|\bwatch\b/.test(scripts[n]!));
    if (name) return pm === "yarn" ? `yarn ${name}` : `${pm} run ${name}`;
    return undefined;
  }
  if (has("gradlew") || has("gradlew.bat")) return `${kind === "powershell" ? ".\\gradlew.bat" : "./gradlew"} assembleDebug --console=plain -q`;
  if (has("Cargo.toml")) return "cargo build --quiet";
  if (has("go.mod")) return "go build ./...";
  return undefined;
}

// Builds print a lot; the model gets the part around the first error.
export function excerpt(output: string, first: string | undefined, max = 1200): string {
  const lines = output.split("\n");
  const at = first ? lines.findIndex((l) => l.includes(first.slice(0, 60))) : -1;
  const from = Math.max(0, at < 0 ? lines.length - 15 : at - 2);
  const part = lines.slice(from, from + 15).join("\n");
  return part.length > max ? part.slice(0, max) + "\n..." : part;
}
