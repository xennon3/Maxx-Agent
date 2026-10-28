import { z } from "zod";
import type { Tool } from "./types.ts";
import type { ToolSpec } from "../llm.ts";
import { readFile } from "./read.ts";
import { listFiles } from "./list.ts";
import { grep } from "./grep.ts";
import { editFile } from "./edit.ts";
import { writeFile } from "./write.ts";
import { bash } from "./bash.ts";
import { useTemplate } from "./template.ts";
import { ANDROID_TOOLS, ANDROID_PROMPT } from "./android.ts";
import { DESKTOP_TOOLS, DESKTOP_PROMPT } from "./desktop.ts";

export const TOOLS: Tool<any>[] = [readFile, listFiles, grep, editFile, writeFile, bash, useTemplate];

// Opt-in groups (--with android,desktop or /with), so small models are not
// handed twenty tools when they are only editing code.
export type Toolset = { tools: Tool<any>[]; prompt: string; about: string };
export const TOOLSETS: Record<string, Toolset> = {
  android: { tools: ANDROID_TOOLS, prompt: ANDROID_PROMPT, about: "build, install, screenshot and drive apps on an Android phone over adb" },
  desktop: { tools: DESKTOP_TOOLS, prompt: DESKTOP_PROMPT, about: "see and control the Windows desktop (screenshot, mouse, keyboard)" },
};

export function withToolsets(names: string[]): { tools: Tool<any>[]; prompts: string[] } {
  const unknown = names.filter((n) => !TOOLSETS[n]);
  if (unknown.length) throw new Error(`unknown toolset ${unknown.join(", ")}; available: ${Object.keys(TOOLSETS).join(", ")}`);
  return {
    tools: names.flatMap((n) => TOOLSETS[n]!.tools),
    prompts: names.map((n) => TOOLSETS[n]!.prompt),
  };
}

export function toolSpecs(tools: Tool<any>[] = TOOLS): ToolSpec[] {
  return tools.map((t) => {
    if (t.parameters) return { type: "function", function: { name: t.name, description: t.description, parameters: t.parameters } };
    const { $schema, ...parameters } = z.toJSONSchema(t.schema, { io: "input" }) as Record<string, unknown>;
    return { type: "function", function: { name: t.name, description: t.description, parameters } };
  });
}

export function findTool(name: string, tools: Tool<any>[] = TOOLS) {
  return tools.find((t) => t.name === name);
}
