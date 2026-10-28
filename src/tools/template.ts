import { relative } from "node:path";
import { z } from "zod";
import { defineTool } from "./types.ts";
import { inside } from "./paths.ts";
import { TEMPLATES, catalog, findTemplate, freeFolder, isEmptyFolder, plan, scaffold } from "../templates/index.ts";

const ids = TEMPLATES.map((t) => t.id) as [string, ...string[]];

// Where a template goes: the folder the model named, else the workspace when
// it is empty, else a new folder next to what is there.
async function target(cwd: string, template: string, folder?: string): Promise<string> {
  if (folder && folder !== ".") return inside(cwd, folder);
  if (folder === "." || (await isEmptyFolder(cwd))) return cwd;
  return freeFolder(cwd, findTemplate(template).folder);
}

export const useTemplate = defineTool({
  name: "use_template",
  description:
    "Start a new project from a small working starter instead of writing it from scratch, then change it to what the user wants. " +
    "Templates:\n" + catalog(),
  schema: z.object({
    template: z.enum(ids).describe("Template id"),
    folder: z.string().optional().describe("Folder to create it in, relative to the workspace. Default: the workspace if it is empty, else a new folder"),
    name: z.string().optional().describe("App name shown to people, e.g. Tip Calculator (default: from the folder name)"),
  }),
  risk: "write",
  ruleKey: (a) => a.template,
  async preview({ template, folder, name }, { cwd }) {
    const dir = await target(cwd, template, folder);
    const files = plan(findTemplate(template), dir, name);
    return `create ${files.length} files in ${relative(cwd, dir) || "."}:\n  ${files.join("\n  ")}`;
  },
  async run({ template, folder, name }, { cwd }) {
    const t = findTemplate(template);
    const dir = await target(cwd, template, folder);
    const files = await scaffold(t, dir, name);
    const rel = relative(cwd, dir).replace(/\\/g, "/");
    const notes = await Bun.file(`${dir}/MAXX.md`).text();
    return [
      `Created the ${t.name} template in ${rel || "the workspace"} (${files.length} files):`,
      ...files.map((f) => "  " + (rel ? `${rel}/${f}` : f)),
      rel ? `\nIts files are under ${rel}/: use paths like ${rel}/${files.find((f) => f !== "MAXX.md")}, and cd ${rel} before running its commands.` : "",
      "",
      notes.trim(),
      "",
      "It already works. Now read the file you need to change and edit it; don't rewrite the project.",
    ].join("\n");
  },
});
