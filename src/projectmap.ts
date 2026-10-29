import { readdir, readFile, stat } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { z } from "zod";
import { defineTool } from "./tools/types.ts";
import { inside } from "./tools/paths.ts";

// The project map. A small model with 16K of context can't afford to list
// folders and open files just to find where things are, so Maxx keeps a short
// index of the project's files and the functions and classes in them, cut to
// a token budget. A bigger budget (a bigger model, a bigger context) gets more
// of the project in the same format.

const SKIP = new Set(["node_modules", ".git", ".maxx", "dist", "build", ".gradle", "target", ".venv", "venv", "__pycache__", ".idea", ".next", "out", "coverage"]);
const BINARY = /\.(png|jpe?g|gif|webp|ico|bmp|svg|mp3|wav|ogg|mp4|webm|zip|gz|tar|7z|jar|apk|aab|so|dll|exe|class|o|a|lib|pdf|ttf|otf|woff2?|lock|lockb|keystore|jks|db|sqlite)$/i;
const MAX_FILES = 2000;
const MAX_READ = 200_000;

type Entry = { path: string; size: number; symbols: string[] };
const cache = new Map<string, { mtime: number; symbols: string[] }>();

// Top-level names, with () for functions. One regex per language family.
const RULES: { ext: RegExp; re: RegExp }[] = [
  {
    ext: /^\.(m?[jt]sx?|cjs|mts)$/,
    re: /^(?:export\s+(?:default\s+)?)?(?:async\s+)?(function\*?|class|interface|type|enum|const|let)\s+([A-Za-z_$][\w$]*)/,
  },
  { ext: /^\.py$/, re: /^(?:async\s+)?(def|class)\s+([A-Za-z_]\w*)/ },
  { ext: /^\.(kt|kts)$/, re: /^\s{0,4}(?:(?:private|internal|public|protected|override|suspend|data|sealed|abstract|open|enum|inline)\s+)*(fun|class|object|interface)\s+(?:<[^>]+>\s*)?(?:[\w.]+\.)?([A-Za-z_]\w*)/ },
  { ext: /^\.java$/, re: /^\s{0,4}(?:(?:public|private|protected|static|final|abstract)\s+)*(class|interface|enum|record)\s+([A-Za-z_]\w*)/ },
  { ext: /^\.go$/, re: /^(func|type)\s+(?:\([^)]*\)\s*)?([A-Za-z_]\w*)/ },
  { ext: /^\.rs$/, re: /^\s*(?:pub(?:\([^)]*\))?\s+)?(fn|struct|enum|trait|mod)\s+([A-Za-z_]\w*)/ },
  { ext: /^\.cs$/, re: /^\s{0,8}(?:(?:public|private|protected|internal|static|sealed|abstract|partial)\s+)*(class|interface|enum|record|struct)\s+([A-Za-z_]\w*)/ },
];

export function symbolsOf(path: string, text: string): string[] {
  const ext = extname(path).toLowerCase();
  if (ext === ".html" || ext === ".htm") {
    const title = text.match(/<title>([^<]{1,60})<\/title>/i)?.[1]?.trim();
    const ids = [...text.matchAll(/\bid=["']([\w-]{1,30})["']/g)].map((m) => `#${m[1]}`);
    return [...(title ? [`"${title}"`] : []), ...new Set(ids)];
  }
  const rule = RULES.find((r) => r.ext.test(ext));
  if (!rule) return [];
  const out: string[] = [];
  for (const line of text.split("\n")) {
    const m = line.match(rule.re);
    if (!m) continue;
    const [, kind, name] = m as unknown as [string, string, string];
    // `const x = () =>` and `const x = function` are functions; other consts are names.
    const isFn = /^(function|def|fun|func|fn)/.test(kind) || (kind === "const" && /=\s*(?:async\s*)?(?:\([^)]*\)|\w+)\s*=>|=\s*(?:async\s+)?function/.test(line));
    // Composables read better with their annotation.
    // Inside a module, only exported names and functions are worth a line.
    if ((kind === "const" || kind === "let") && !isFn && !line.startsWith("export")) continue;
    const composable = ext.startsWith(".kt") && kind === "fun" && /^[A-Z]/.test(name);
    out.push(`${name}${isFn ? "()" : ""}${composable ? "@" : ""}`);
  }
  return [...new Set(out)];
}

async function walk(cwd: string, dir: string, depth: number, out: { abs: string; size: number; mtime: number }[]) {
  if (depth > 6 || out.length >= MAX_FILES) return;
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  entries.sort((a, b) => Number(a.isDirectory()) - Number(b.isDirectory()) || a.name.localeCompare(b.name));
  for (const e of entries) {
    if (out.length >= MAX_FILES) return;
    if (e.name.startsWith(".") && e.name !== ".env.example") continue;
    const abs = join(dir, e.name);
    if (e.isDirectory()) {
      if (!SKIP.has(e.name)) await walk(cwd, abs, depth + 1, out);
    } else if (e.isFile() && !BINARY.test(e.name)) {
      const s = await stat(abs).catch(() => null);
      if (s) out.push({ abs, size: s.size, mtime: s.mtimeMs });
    }
  }
}

export async function scanProject(cwd: string, dir = "."): Promise<Entry[]> {
  const files: { abs: string; size: number; mtime: number }[] = [];
  await walk(cwd, inside(cwd, dir), 0, files);
  const out: Entry[] = [];
  for (const f of files) {
    let hit = cache.get(f.abs);
    if (!hit || hit.mtime !== f.mtime) {
      const text = f.size <= MAX_READ ? await readFile(f.abs, "utf8").catch(() => "") : "";
      hit = { mtime: f.mtime, symbols: symbolsOf(f.abs, text) };
      cache.set(f.abs, hit);
    }
    out.push({ path: relative(cwd, f.abs).split("\\").join("/"), size: f.size, symbols: hit.symbols });
  }
  // Shallow files first: they say most about the project.
  return out.sort((a, b) => a.path.split("/").length - b.path.split("/").length || a.path.localeCompare(b.path));
}

const size = (n: number) => (n < 1000 ? `${n}B` : n < 1_000_000 ? `${(n / 1000).toFixed(1)}k` : `${(n / 1e6).toFixed(1)}M`);

// The map as text, within about `budget` tokens (4 characters each).
export function formatMap(entries: Entry[], budget: number): string {
  if (!entries.length) return "Project map: the folder is empty.";
  const chars = Math.max(200, budget * 4);
  const head = `Project map (${entries.length} file${entries.length > 1 ? "s" : ""}; name() is a function, Name@ a Compose screen):`;
  // Fewer symbols per file until it fits, then fewer files.
  for (const per of [12, 6, 3, 0]) {
    const lines = entries.map((e) => `${e.path} ${size(e.size)}${per && e.symbols.length ? ": " + e.symbols.slice(0, per).join(", ") + (e.symbols.length > per ? ", …" : "") : ""}`);
    const text = [head, ...lines].join("\n");
    if (text.length <= chars) return text;
    if (per) continue;
    const kept: string[] = [head];
    let used = head.length;
    for (const l of lines) {
      if (used + l.length + 60 > chars) break;
      kept.push(l);
      used += l.length + 1;
    }
    return `${kept.join("\n")}\n… and ${lines.length - kept.length + 1} more files (list_files shows them)`;
  }
  return head;
}

export async function projectMap(cwd: string, budget: number, dir = "."): Promise<string> {
  return formatMap(await scanProject(cwd, dir), budget);
}

// Budget for the map: a slice of the context window, so it grows with the model.
export const mapBudget = (contextWindow: number) => Math.min(8000, Math.round(contextWindow * 0.05));

export const projectMapTool = (budget: () => number) =>
  defineTool({
    name: "project_map",
    description: "Show the project's files with the functions and classes in each, in one short list. Cheaper than listing folders and reading files to find where something is.",
    schema: z.object({ dir: z.string().optional().describe("Only this folder, e.g. src (default: the whole project)") }),
    risk: "read",
    checkpoint: false,
    async run({ dir }, { cwd }) {
      return projectMap(cwd, budget(), dir || ".");
    },
  });
