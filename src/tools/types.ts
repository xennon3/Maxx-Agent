import type { z } from "zod";
import type { Image } from "../image.ts";

// "read" tools never prompt; "write" and "exec" go through the permission gate.
export type Risk = "read" | "write" | "exec";

// network: may commands install packages and download files? Unset means no limit.
export type ToolContext = { cwd: string; network?: boolean };

// Most tools return text. Screen tools also return images, which the loop
// shows to a vision model (see vision.ts). A "glance" is the screenshot an
// action returns on its own; a separate vision model skips those when the
// element list already says what is on screen.
export type ToolResult = string | { text: string; images?: Image[]; glance?: boolean };

export type Tool<S extends z.ZodObject = z.ZodObject> = {
  name: string;
  description: string;
  schema: S;
  risk: Risk;
  // Tools that only touch a device, not the workspace, skip the git checkpoint.
  checkpoint?: boolean;
  // What the user sees when asked to approve the call (a diff, a command...).
  preview?: (args: z.infer<S>, ctx: ToolContext) => Promise<string> | string;
  // A short key used for "always allow" rules, e.g. the command for bash.
  ruleKey?: (args: z.infer<S>) => string;
  // A reason the call must not run at all (checked before the user is asked).
  refuse?: (args: z.infer<S>, ctx: ToolContext) => string | undefined;
  run: (args: z.infer<S>, ctx: ToolContext) => Promise<ToolResult>;
};

export function defineTool<S extends z.ZodObject>(t: Tool<S>): Tool<S> {
  return t;
}
