import { join, dirname } from "node:path";
import { mkdir } from "node:fs/promises";
import type { Tool } from "./tools/types.ts";

export type Mode = "ask" | "auto-edit" | "yolo";
export type Answer = "yes" | "no" | "always";

type Settings = { allow: string[] };

// Rules look like `bash(npm test*)` or `edit_file(src/*)`; `*` matches anything.
export class Permissions {
  private rules: string[] = [];
  constructor(private cwd: string, public mode: Mode) {}

  private get file() {
    return join(this.cwd, ".maxx", "settings.json");
  }

  async load() {
    const f = Bun.file(this.file);
    if (await f.exists()) this.rules = ((await f.json()) as Settings).allow ?? [];
    return this;
  }

  needsPrompt(tool: Tool<any>, args: unknown): boolean {
    if (tool.risk === "read" || this.mode === "yolo") return false;
    if (tool.risk === "write" && this.mode === "auto-edit") return false;
    const key = tool.ruleKey?.(args as never) ?? "";
    return !this.rules.some((r) => matches(r, tool.name, key));
  }

  async remember(tool: Tool<any>, args: unknown) {
    const key = tool.ruleKey?.(args as never) ?? "";
    // For bash, trust the program and first word ("npm test*"), not the exact line.
    const pattern = tool.name === "bash" ? key.split(/\s+/).slice(0, 2).join(" ") + "*" : key;
    this.rules.push(`${tool.name}(${pattern})`);
    await mkdir(dirname(this.file), { recursive: true });
    await Bun.write(this.file, JSON.stringify({ allow: this.rules } satisfies Settings, null, 2) + "\n");
  }
}

export function matches(rule: string, name: string, key: string): boolean {
  const m = rule.match(/^([\w-]+)(?:\((.*)\))?$/);
  if (!m || m[1] !== name) return false;
  if (m[2] === undefined) return true;
  const re = new RegExp("^" + m[2].split("*").map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*") + "$");
  return re.test(key);
}
