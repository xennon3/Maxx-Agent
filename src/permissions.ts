import { join, dirname } from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import type { Tool } from "./tools/types.ts";
import { maxxHome } from "./sessions.ts";

// ask: every edit and command waits for an OK. auto-edit: edits run, commands
// ask. yolo ("Auto-run" in the app): everything runs, except the few commands
// the safety net below still stops.
export type Mode = "ask" | "auto-edit" | "yolo";
export const MODES: Mode[] = ["ask", "auto-edit", "yolo"];
// "no: <why>" is a denial with the user's reason, which the model reads and Maxx learns from.
export type Answer = "yes" | "no" | "always" | `no: ${string}`;
export const isNo = (a: Answer) => a === "no" || a.startsWith("no:");
export const whyNo = (a: Answer) => (a.startsWith("no:") ? a.slice(3).trim() : "");

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
    if (tool.risk === "read") return false;
    if (this.mode === "yolo") return !!this.risky(tool, args) && !this.allows(tool, args);
    if (tool.risk === "write" && this.mode === "auto-edit") return false;
    const key = tool.ruleKey?.(args as never) ?? "";
    return !this.rules.some((r) => matches(r, tool.name, key));
  }

  // A saved rule covers this call.
  allows(tool: Tool<any>, args: unknown): boolean {
    const key = tool.ruleKey?.(args as never) ?? "";
    return this.rules.some((r) => matches(r, tool.name, key));
  }

  // Why auto-run still stops this call, or null when it may just run.
  risky(tool: Tool<any>, args: unknown): string | null {
    if (tool.name !== "bash") return null;
    return riskyCommand(tool.ruleKey?.(args as never) ?? "");
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

// The safety net: commands that can't be undone by ↶ Undo or a checkpoint,
// or that reach outside the project. Auto-run asks for these anyway. The list
// is short on purpose: anything inside the project folder can be rewound.
const ROOT = String.raw`(?:\/\*?|~\/?\*?|\$HOME\/?|\$env:USERPROFILE\\?|%USERPROFILE%\\?|\.\.[\\/]?\*?|\*|[A-Za-z]:[\\/]?\*?)`;
const RISKY: [RegExp, string][] = [
  [new RegExp(String.raw`\brm\s+(?:-[a-zA-Z]*\s+)*-[a-zA-Z]*[rR][a-zA-Z]*\s+(?:-[a-zA-Z]+\s+)*["']?` + ROOT + String.raw`["']?(?:\s|$|;|&|\|)`), "deletes a whole drive, a home folder, everything around the project or everything in it (git history too)"],
  [new RegExp(String.raw`\b(?:rd|rmdir)\s+/s\b.*?\s["']?` + ROOT + String.raw`["']?(?:\s|$)`, "i"), "deletes a whole drive or home folder"],
  [new RegExp(String.raw`\bRemove-Item\b(?=.*-Recurse)(?=.*\s["']?` + ROOT + String.raw`["']?(?:\s|$))`, "i"), "deletes a whole drive or home folder"],
  [/\bdel\s+(?=.*\/s)(?=.*\s[A-Za-z]:\\?\*?(?:\s|$))/i, "deletes files across a whole drive"],
  [/\b(?:mkfs(?:\.\w+)?|diskpart|fdisk|wipefs)\b|\bformat\s+[A-Za-z]:/i, "formats or repartitions a disk"],
  [/\bdd\b.*\bof=\/dev\//, "writes straight onto a disk"],
  [/\b(?:shutdown|reboot|poweroff|Restart-Computer|Stop-Computer)\b/i, "shuts down or restarts the computer"],
  [/\breg(?:\.exe)?\s+(?:delete|add)\b/i, "changes the Windows registry"],
  [/\bgit\s+push\b.*(?:\s-f\b|--force|\s\+\w)/, "force-pushes, which can erase commits on the remote"],
  [/\bgit\s+push\b/, "publishes commits to a remote"],
  [/\b(?:npm|pnpm|yarn|bun|cargo|twine|gem)\s+publish\b/, "publishes a package for everyone"],
  [/\b(?:curl|wget|iwr|Invoke-WebRequest|irm|Invoke-RestMethod)\b[^|]*\|\s*(?:sudo\s+)?(?:sh|bash|zsh|iex|Invoke-Expression|python3?|node)\b/i, "runs a script straight from the internet"],
  [/\bsudo\b/, "runs as administrator"],
  [/:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}/, "is a fork bomb"],
];

export function riskyCommand(command: string): string | null {
  for (const [re, why] of RISKY) if (re.test(command)) return why;
  return null;
}

// The mode is one setting for every project, saved like the other switches:
// --mode / --auto-run beat $MAXX_MODE, which beats the saved choice.
const modeFile = () => join(maxxHome(), "permissions.json");

export function parseMode(v: string): Mode | undefined {
  const s = v.trim().toLowerCase();
  if (["auto", "auto-run", "autorun", "on", "never", "never-ask", "yes"].includes(s)) return "yolo";
  if (["edits", "auto-edits", "autoedit"].includes(s)) return "auto-edit";
  if (["off", "no", "always"].includes(s)) return "ask";
  return MODES.find((m) => m === s);
}

export async function loadMode(): Promise<Mode> {
  try {
    const saved = (JSON.parse(await readFile(modeFile(), "utf8")) as { mode?: string }).mode;
    return (saved && parseMode(saved)) || "ask";
  } catch {
    return "ask";
  }
}

export async function saveMode(mode: Mode) {
  await mkdir(maxxHome(), { recursive: true });
  await writeFile(modeFile(), JSON.stringify({ mode }, null, 2) + "\n");
}

export async function resolveMode(flag?: string, env = process.env): Promise<Mode> {
  const v = flag ?? env.MAXX_MODE;
  if (v === undefined || v === "") return loadMode();
  const mode = parseMode(v);
  if (!mode) throw new Error(`--mode takes ask, auto-edit or yolo (auto-run), not "${v}"`);
  return mode;
}

export const MODE_SAY: Record<Mode, string> = {
  ask: "Maxx asks before every edit and command",
  "auto-edit": "edits run on their own, commands still ask",
  yolo: "edits and commands run on their own (↶ Undo puts files back); risky ones like git push, sudo or deleting a whole drive still ask",
};
