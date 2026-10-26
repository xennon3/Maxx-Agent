import { z } from "zod";
import { join, relative } from "node:path";
import { stat } from "node:fs/promises";
import { defineTool } from "./types.ts";
import { inside } from "./paths.ts";
import { IGNORE, toPosix } from "./list.ts";

const MAX = 200;

export const grep = defineTool({
  name: "grep",
  description: "Search file contents with a regular expression. Returns file:line:text matches.",
  schema: z.object({
    pattern: z.string().describe("Regular expression"),
    path: z.string().default(".").describe("Directory or file to search"),
    glob: z.string().optional().describe("Only search files matching this glob, e.g. '*.ts'"),
  }),
  risk: "read",
  async run(args, { cwd }) {
    return Bun.which("rg") ? ripgrep(args, cwd) : jsGrep(args, cwd);
  },
});

async function ripgrep({ pattern, path, glob }: { pattern: string; path: string; glob?: string }, cwd: string) {
  const args = ["rg", "--line-number", "--no-heading", "--color=never", "--max-count=50", "--path-separator", "/"];
  if (glob) args.push("--glob", glob);
  args.push("--", pattern, path);
  const proc = Bun.spawn(args, { cwd, stdout: "pipe", stderr: "pipe" });
  const [out, err] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()]);
  await proc.exited;
  if (proc.exitCode === 1) return "no matches";
  if (proc.exitCode !== 0) return `error: ${err.trim() || "ripgrep failed"}`;
  return cap(out.trimEnd().split(/\r?\n/));
}

// Used when ripgrep is not installed (common on a fresh Windows machine). Slower, same output.
export async function jsGrep({ pattern, path, glob }: { pattern: string; path: string; glob?: string }, cwd: string) {
  let re: RegExp;
  try {
    re = new RegExp(pattern);
  } catch (e) {
    return `error: invalid regular expression: ${(e as Error).message}`;
  }
  const root = inside(cwd, path);
  const info = await stat(root).catch(() => null);
  if (!info) return `error: ${path} does not exist`;
  const files: string[] = [];
  if (info.isFile()) files.push(root);
  else {
    const filter = glob ? new Bun.Glob(glob.includes("/") ? glob : `**/${glob}`) : null;
    for await (const f of new Bun.Glob("**/*").scan({ cwd: root, dot: false })) {
      const rel = toPosix(f);
      if (IGNORE.test(rel) || (filter && !filter.match(rel))) continue;
      files.push(join(root, f));
    }
  }
  const hits: string[] = [];
  for (const file of files.sort()) {
    const f = Bun.file(file);
    if (f.size > 2_000_000) continue;
    const text = await f.text();
    if (text.includes("\0")) continue; // binary
    const name = toPosix(relative(cwd, file));
    text.split(/\r?\n/).forEach((line, i) => {
      if (hits.length <= MAX && re.test(line)) hits.push(`${name}:${i + 1}:${line}`);
    });
    if (hits.length > MAX) break;
  }
  return hits.length ? cap(hits) : "no matches";
}

function cap(lines: string[]) {
  return lines.slice(0, MAX).join("\n") + (lines.length > MAX ? `\n... more than ${MAX} matches, showing ${MAX}` : "");
}
