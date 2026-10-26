import { z } from "zod";
import { defineTool } from "./types.ts";
import { inside } from "./paths.ts";
import { lineDiff } from "../diff.ts";

export const writeFile = defineTool({
  name: "write_file",
  description: "Create a file or overwrite it completely. Prefer edit_file for changes to existing files.",
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
    await Bun.write(inside(cwd, path), content);
    return `wrote ${path} (${content.split("\n").length} lines)`;
  },
});
