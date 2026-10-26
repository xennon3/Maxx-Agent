import { z } from "zod";
import { defineTool } from "./types.ts";
import { inside } from "./paths.ts";

export const readFile = defineTool({
  name: "read_file",
  description:
    "Read a text file. Returns numbered lines. Use offset/limit (1-based line numbers) for large files.",
  schema: z.object({
    path: z.string().describe("File path relative to the workspace"),
    offset: z.number().int().min(1).optional().describe("First line to read, default 1"),
    limit: z.number().int().min(1).optional().describe("Max lines to read, default 400"),
  }),
  risk: "read",
  async run({ path, offset = 1, limit = 400 }, { cwd }) {
    const file = Bun.file(inside(cwd, path));
    if (!(await file.exists())) return `error: ${path} does not exist`;
    const lines = (await file.text()).split(/\r?\n/);
    const slice = lines.slice(offset - 1, offset - 1 + limit);
    const body = slice.map((l, i) => `${String(offset + i).padStart(5)}  ${l}`).join("\n");
    const more = offset - 1 + limit < lines.length ? `\n... ${lines.length} lines total` : "";
    return body + more;
  },
});
