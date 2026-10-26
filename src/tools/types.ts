import type { z } from "zod";

// "read" tools never prompt; "write" and "exec" go through the permission gate.
export type Risk = "read" | "write" | "exec";

export type ToolContext = { cwd: string };

export type Tool<S extends z.ZodObject = z.ZodObject> = {
  name: string;
  description: string;
  schema: S;
  risk: Risk;
  // What the user sees when asked to approve the call (a diff, a command...).
  preview?: (args: z.infer<S>, ctx: ToolContext) => Promise<string> | string;
  // A short key used for "always allow" rules, e.g. the command for bash.
  ruleKey?: (args: z.infer<S>) => string;
  run: (args: z.infer<S>, ctx: ToolContext) => Promise<string>;
};

export function defineTool<S extends z.ZodObject>(t: Tool<S>): Tool<S> {
  return t;
}
