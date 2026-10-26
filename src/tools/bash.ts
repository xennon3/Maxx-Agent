import { z } from "zod";
import { defineTool } from "./types.ts";
import { truncate } from "../context.ts";
import { shell } from "../shell.ts";

// Named "bash" because models are trained on that name; on Windows without
// Git Bash it runs PowerShell, and the system prompt says which.
export const bash = defineTool({
  name: "bash",
  description: "Run a shell command in the workspace and return stdout, stderr and the exit code. Use for tests, builds and git. The system prompt says which shell is in use.",
  schema: z.object({
    command: z.string().describe("The command to run"),
    timeout: z.number().int().min(1).max(600).optional().describe("Seconds before the command is killed, default 120"),
  }),
  risk: "exec",
  ruleKey: (a) => a.command,
  preview: ({ command }) => `${shell().kind === "powershell" ? "PS>" : "$"} ${command}`,
  async run({ command, timeout = 120 }, { cwd }) {
    const proc = Bun.spawn(shell().args(command), { cwd, stdout: "pipe", stderr: "pipe", stdin: "ignore" });
    const timer = setTimeout(() => proc.kill(), timeout * 1000);
    const [out, err] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()]);
    await proc.exited;
    clearTimeout(timer);
    const parts = [`exit code: ${proc.exitCode ?? "killed (timeout)"}`];
    if (out.trim()) parts.push(`stdout:\n${truncate(out)}`);
    if (err.trim()) parts.push(`stderr:\n${truncate(err)}`);
    return parts.join("\n");
  },
});
