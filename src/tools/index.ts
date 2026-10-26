import { z } from "zod";
import type { Tool } from "./types.ts";
import type { ToolSpec } from "../llm.ts";
import { readFile } from "./read.ts";
import { listFiles } from "./list.ts";
import { grep } from "./grep.ts";
import { editFile } from "./edit.ts";
import { writeFile } from "./write.ts";
import { bash } from "./bash.ts";

export const TOOLS: Tool<any>[] = [readFile, listFiles, grep, editFile, writeFile, bash];

export function toolSpecs(tools: Tool<any>[] = TOOLS): ToolSpec[] {
  return tools.map((t) => {
    const { $schema, ...parameters } = z.toJSONSchema(t.schema, { io: "input" }) as Record<string, unknown>;
    return { type: "function", function: { name: t.name, description: t.description, parameters } };
  });
}

export function findTool(name: string, tools: Tool<any>[] = TOOLS) {
  return tools.find((t) => t.name === name);
}
