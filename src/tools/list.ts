import { z } from "zod";
import { defineTool } from "./types.ts";

export const IGNORE = /(^|\/)(node_modules|\.git|\.maxx|dist|build|\.next|target|__pycache__|\.venv)\//;
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
    const glob = new Bun.Glob(toPosix(pattern));
    for await (const f of glob.scan({ cwd, dot: true })) {
      const rel = toPosix(f);
      if (IGNORE.test(rel)) continue;
      files.push(rel);
      if (files.length >= 500) break;
    }
    files.sort();
    if (!files.length) {
      // An empty answer reads as "wrong folder" to a model; show what is there.
      const dirs: string[] = [];
      for await (const d of glob.scan({ cwd, dot: true, onlyFiles: false })) {
        const rel = toPosix(d);
        if (!IGNORE.test(rel + "/") && dirs.length < 100) dirs.push(rel + "/");
      }
      return dirs.length ? `no files match; these directories exist:\n${dirs.sort().join("\n")}` : "no files match";
    }
    return files.join("\n") + (files.length >= 500 ? "\n... truncated at 500" : "");
  },
});
