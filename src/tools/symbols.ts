import { existsSync, readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { extname, relative } from "node:path";
import { z } from "zod";
import { defineTool } from "./types.ts";
import { inside } from "./paths.ts";
import { IGNORE, toPosix } from "./list.ts";
import { applyEdits, clientFor, dropClient, editsByFile, FAMILY, familyOf, findServer, formatLocs, hoverText, toLocs, type Loc, type Server } from "../lsp.ts";

// code_nav and rename_symbol: find a definition, its callers, its type, or
// rename it in every file. Small models are bad at line and column numbers,
// so they name the symbol and the file it appears in; Maxx finds the spot.
// A language server does the work when one is installed (TypeScript, Python,
// Rust, Go, Kotlin); otherwise a careful text search answers instead.

const EXTS_OF = (fam: string) => Object.entries(FAMILY).filter(([, f]) => f === fam).map(([e]) => e);

// Where `symbol` sits in the file: on `line` if given, else its first definition, else its first use.
export function locate(text: string, symbol: string, line?: number): { line: number; character: number } | null {
  const lines = text.split("\n");
  const word = new RegExp(`(^|[^\\w$])(${symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})(?![\\w$])`);
  const at = (i: number) => {
    const m = word.exec(lines[i]!);
    return m ? { line: i, character: m.index + m[1]!.length } : null;
  };
  if (line) {
    for (const d of [0, -1, 1, -2, 2]) {
      const i = line - 1 + d;
      if (i >= 0 && i < lines.length && at(i)) return at(i);
    }
  }
  const def = defPattern(symbol);
  for (let i = 0; i < lines.length; i++) if (def.test(lines[i]!)) return at(i);
  for (let i = 0; i < lines.length; i++) if (at(i)) return at(i);
  return null;
}

export function defPattern(symbol: string): RegExp {
  const s = symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    [
      `\\b(function\\*?|class|interface|type|enum|struct|trait|impl|def|fun|func|fn|object|module|namespace|record)\\s+${s}\\b`,
      `\\b(const|let|var|val)\\s+${s}\\s*[:=]`,
      `^\\s*(export\\s+)?(default\\s+)?(async\\s+)?${s}\\s*[:=]\\s*(async\\s*)?(function|\\(|[\\w$]+\\s*=>)`,
      `^\\s*(public|private|protected|static|async|override|suspend|\\s)*${s}\\s*\\([^)]*\\)\\s*(:[^={]+)?\\{\\s*$`,
      `^\\s*func\\s+\\([^)]*\\)\\s*${s}\\b`,
      `^${s}\\s*=`,
    ].join("|"),
  );
}

function projectFiles(cwd: string, exts: string[]): string[] {
  const out: string[] = [];
  const glob = new Bun.Glob(`**/*{${exts.join(",")}}`);
  for (const f of glob.scanSync({ cwd, dot: false })) {
    const rel = toPosix(f);
    if (IGNORE.test(rel)) continue;
    out.push(rel);
    if (out.length >= 4000) break;
  }
  return out.sort();
}

// The text-search answer when no language server is installed.
export function searchFallback(cwd: string, fam: string, symbol: string, what: "definition" | "references"): Loc[] {
  const word = new RegExp(`(^|[^\\w$])${symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\w$])`);
  const def = defPattern(symbol);
  const out: Loc[] = [];
  for (const rel of projectFiles(cwd, EXTS_OF(fam))) {
    let text: string;
    try {
      text = readFileSync(inside(cwd, rel), "utf8");
    } catch {
      continue;
    }
    if (!text.includes(symbol)) continue;
    text.split("\n").forEach((l, i) => {
      if (what === "definition" ? def.test(l) : word.test(l)) {
        // Skip comments for references; they are not uses.
        if (what === "references" && /^\s*(\/\/|#|\*|\/\*)/.test(l)) return;
        out.push({ path: rel, line: i + 1, col: Math.max(1, l.indexOf(symbol) + 1), text: l.trim().slice(0, 160) });
      }
    });
    if (out.length > 300) break;
  }
  return out;
}

const how = (m: Server[]) => `No language server is installed for this language, so this is a text search (it can miss or over-match). For exact answers install: ${m[0]!.install}.`;

export const codeNav = defineTool({
  name: "code_nav",
  description:
    "Navigate code like an IDE. action: definition (where symbol is defined), references (every use of it), hover (its type and docs), symbols (outline of path), diagnostics (type errors in path). Give the symbol's name and a file where it appears.",
  schema: z.object({
    action: z.enum(["definition", "references", "hover", "symbols", "diagnostics"]),
    path: z.string().describe("A file where the symbol appears (or the file to outline or check)"),
    symbol: z.string().optional().describe("The function, class or variable name"),
    line: z.number().int().optional().describe("Line where it appears, if you know it"),
  }),
  risk: "read",
  checkpoint: false,
  async run({ action, path, symbol, line }, { cwd }) {
    const abs = inside(cwd, path);
    if (!existsSync(abs)) return `error: ${path} does not exist`;
    const fam = familyOf(abs);
    if (!fam) return `error: code_nav knows ${[...new Set(Object.keys(FAMILY))].join(" ")} files; use grep for ${extname(abs) || "this file"}`;
    if (["definition", "references", "hover"].includes(action) && !symbol) return `error: ${action} needs symbol`;
    const found = findServer(abs, undefined, cwd);
    const text = readFileSync(abs, "utf8");
    if (!found || "missing" in found) {
      const missing = found && "missing" in found ? found.missing : [];
      if (action === "definition" || action === "references") {
        const locs = searchFallback(cwd, fam, symbol!, action);
        return `${locs.length ? formatLocs(locs) : `no ${action} found for ${symbol}`}\n\n(${how(missing)})`;
      }
      if (action === "symbols") {
        const outline = text.split("\n").map((l, i) => ({ l, i })).filter(({ l }) => /^\s*(export\s+)?(default\s+)?(async\s+)?(function|class|interface|type|enum|def|fun|func|fn|struct|trait|object|const\s+\w+\s*=\s*(async\s*)?\()/.test(l));
        return `${outline.map(({ l, i }) => `${i + 1}: ${l.trim().slice(0, 120)}`).join("\n") || "no definitions found"}\n\n(${how(missing)})`;
      }
      return `${action} needs a language server. ${how(missing)} Meanwhile, run the build or run_tests to see errors.`;
    }
    const c = clientFor(cwd, found);
    try {
      const uri = await c.open(abs);
      if (action === "diagnostics") {
        // Newer servers answer when asked (pull); older ones push after a file opens.
        const pulled = await c.request("textDocument/diagnostic", { textDocument: { uri } }, 20_000).catch(() => null);
        let all: any[] | undefined = pulled?.items;
        if (!all) {
          for (let i = 0; i < 40 && !c.diagnostics.has(uri); i++) await Bun.sleep(250);
          await Bun.sleep(300);
          all = c.diagnostics.get(uri) ?? [];
        }
        const ds = all.filter((d: any) => (d.severity ?? 1) <= 2);
        return ds.length ? ds.slice(0, 40).map((d: any) => `${path}:${d.range.start.line + 1}:${d.range.start.character + 1} ${d.severity === 2 ? "warning" : "error"}: ${d.message.split("\n")[0]}`).join("\n") : `no errors in ${path} (${found.lang} server)`;
      }
      if (action === "symbols") {
        const r = await c.request("textDocument/documentSymbol", { textDocument: { uri } });
        const out: string[] = [];
        const walk = (xs: any[], depth: number) => {
          for (const x of xs ?? []) {
            const start = (x.selectionRange ?? x.range ?? x.location?.range)?.start;
            out.push(`${"  ".repeat(depth)}${start ? `${start.line + 1}: ` : ""}${KIND[x.kind] ?? "symbol"} ${x.name}`);
            if (out.length < 200) walk(x.children, depth + 1);
          }
        };
        walk(r, 0);
        return out.join("\n") || "no symbols";
      }
      const pos = locate(text, symbol!, line);
      if (!pos) return `${symbol} does not appear in ${path}; give a file where it is used or defined`;
      const params = { textDocument: { uri }, position: pos };
      if (action === "hover") return hoverText(await c.request("textDocument/hover", params)) || `no type information for ${symbol}`;
      const r = await c.request(action === "definition" ? "textDocument/definition" : "textDocument/references", action === "references" ? { ...params, context: { includeDeclaration: true } } : params);
      const locs = toLocs(cwd, r);
      return locs.length ? formatLocs(locs) : `the ${found.lang} server found no ${action} for ${symbol}`;
    } catch (e) {
      const msg = (e as Error).message;
      if (/initialize|stopped/.test(msg)) dropClient(cwd, found);
      // A broken server should not leave the model empty-handed.
      if (action === "definition" || action === "references") {
        const locs = searchFallback(cwd, fam, symbol!, action);
        return `${locs.length ? formatLocs(locs) : `no ${action} found for ${symbol}`}\n\n(The ${found.lang} language server failed (${msg.slice(0, 160)}), so this is a text search.)`;
      }
      return `error from the ${found.lang} server: ${msg}`;
    }
  },
});

const KIND: Record<number, string> = { 2: "module", 3: "namespace", 5: "class", 6: "method", 7: "property", 8: "field", 9: "constructor", 10: "enum", 11: "interface", 12: "function", 13: "variable", 14: "constant", 23: "struct", 26: "type" };

export const renameSymbol = defineTool({
  name: "rename_symbol",
  description: "Rename a function, class, variable or type everywhere it is used, safely (uses the language server, so other names that merely look the same are left alone).",
  schema: z.object({
    path: z.string().describe("A file where the symbol appears"),
    symbol: z.string().describe("Its current name"),
    new_name: z.string().describe("The new name"),
    line: z.number().int().optional().describe("Line where it appears, if you know it"),
  }),
  risk: "write",
  preview: (a) => `rename ${a.symbol} → ${a.new_name} everywhere (from ${a.path})`,
  async run({ path, symbol, new_name, line }, { cwd }) {
    if (!/^[\p{L}_$][\p{L}\p{N}_$]*$/u.test(new_name)) return `error: "${new_name}" is not a valid name`;
    const abs = inside(cwd, path);
    if (!existsSync(abs)) return `error: ${path} does not exist`;
    const found = findServer(abs, undefined, cwd);
    if (!found) return "error: rename_symbol works on TypeScript, JavaScript, Python, Rust, Go and Kotlin files";
    if ("missing" in found) return `error: no language server installed, so a safe rename is not possible. Install one (${found.missing[0]!.install}), or use code_nav references and edit_file each use.`;
    const text = readFileSync(abs, "utf8");
    const pos = locate(text, symbol, line);
    if (!pos) return `error: ${symbol} does not appear in ${path}`;
    const c = clientFor(cwd, found);
    try {
      const uri = await c.open(abs);
      const we = await c.request("textDocument/rename", { textDocument: { uri }, position: pos, newName: new_name });
      const files = editsByFile(we);
      if (!files.size) return `the ${found.lang} server found nothing to rename for ${symbol}`;
      const changed: string[] = [];
      for (const [file, edits] of files) {
        const rel = relative(cwd, file);
        if (rel.startsWith("..")) continue; // never edit outside the project (library type files)
        await writeFile(file, applyEdits(readFileSync(file, "utf8"), edits));
        changed.push(`${toPosix(rel)} (${edits.length})`);
        await c.open(file);
      }
      return `renamed ${symbol} to ${new_name} in ${changed.length} file(s): ${changed.join(", ")}`;
    } catch (e) {
      return `error from the ${found.lang} server: ${(e as Error).message}`;
    }
  },
});
