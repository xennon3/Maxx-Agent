import { z } from "zod";
import { defineTool } from "./types.ts";

export const IGNORE = /(^|\/)(node_modules|\.git|dist|build|\.next|target|__pycache__|\.venv)\//;
export const toPosix = (p: string) => p.replaceAll("\\", "/");

export const listFiles = defineTool({
  name: "list_files",
  description: "List files matching a glob pattern, e.g. 'src/**/*.ts'. Skips node_modules, .git and build output.",
  schema: z.object({
    pattern: z.string().default("**/*").describe("Glob pattern relative to the workspace"),
  }),
  risk: "read",
  async run({ pattern }, { cwd }) {
    const files: string[] = [];
    for await (const f of new Bun.Glob(toPosix(pattern)).scan({ cwd, dot: false })) {
      const rel = toPosix(f);
      if (IGNORE.test(rel)) continue;
      files.push(rel);
      if (files.length >= 500) break;
    }
    files.sort();
    if (!files.length) return "no files match";
    return files.join("\n") + (files.length >= 500 ? "\n... truncated at 500" : "");
  },
});
