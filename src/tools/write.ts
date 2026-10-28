import { z } from "zod";
import { defineTool } from "./types.ts";
import { inside } from "./paths.ts";
import { lineDiff } from "../diff.ts";

export const writeFile = defineTool({
  name: "write_file",
  description: "Create a file or overwrite it completely; missing parent folders are created. Prefer edit_file for changes to existing files.",
  schema: z.object({
    path: z.string().describe("File path relative to the workspace"),
    content: z.string().describe("Full file contents"),
  }),
  risk: "write",
  ruleKey: (a) => a.path,
  async preview({ path, content }, { cwd }) {
    const file = Bun.file(inside(cwd, path));
    const before = (await file.exists()) ? await file.text() : "";
    return before ? lineDiff(before, content) : `new file, ${content.split("\n").length} lines:\n${lineDiff("", content)}`;
  },
  async run({ path, content }, { cwd }) {
    // Keep Windows line endings when overwriting a CRLF file.
    const file = Bun.file(inside(cwd, path));
    if ((await file.exists()) && (await file.text()).includes("\r\n")) content = content.replace(/\r?\n/g, "\r\n");
    await Bun.write(file, content);
    return `wrote ${path} (${content.split("\n").length} lines)`;
  },
});
