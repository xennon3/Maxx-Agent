import { z } from "zod";
import { defineTool } from "./types.ts";

export const grep = defineTool({
  name: "grep",
  description: "Search file contents with a regular expression (ripgrep). Returns file:line:text matches.",
  schema: z.object({
    pattern: z.string().describe("Regular expression"),
    path: z.string().default(".").describe("Directory or file to search"),
    glob: z.string().optional().describe("Only search files matching this glob, e.g. '*.ts'"),
  }),
  risk: "read",
  async run({ pattern, path, glob }, { cwd }) {
    const args = ["rg", "--line-number", "--no-heading", "--color=never", "--max-count=50"];
    if (glob) args.push("--glob", glob);
    args.push("--", pattern, path);
    const proc = Bun.spawn(args, { cwd, stdout: "pipe", stderr: "pipe" });
    const [out, err] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()]);
    await proc.exited;
    if (proc.exitCode === 1) return "no matches";
    if (proc.exitCode !== 0) return `error: ${err.trim() || "ripgrep failed (is rg installed?)"}`;
    const lines = out.trimEnd().split("\n");
    return lines.slice(0, 200).join("\n") + (lines.length > 200 ? `\n... ${lines.length} matches, showing 200` : "");
  },
});
