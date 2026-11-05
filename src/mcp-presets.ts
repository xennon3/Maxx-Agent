// Starter MCP servers, and finding the ones the user already set up elsewhere:
// in another app (Claude Desktop, Cursor, VS Code, LM Studio, Windsurf, Claude
// Code) or in a project they cloned (.mcp.json, .vscode/mcp.json). All of them
// share one shape, so a server pasted from any README works here too.

import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export type Approval = "smart" | "ask" | "auto";

export type ServerConfig = {
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  headers?: Record<string, string>;
  // Old spelling of approval "auto": read-only lookups that never ask.
  trust?: boolean;
  // smart (the default): tools the server marks read-only just run, the rest
  // follow the permission setting, and ones marked destructive still ask under
  // ⚡ auto-run. ask: every call asks, auto-run too. auto: nothing asks.
  approval?: Approval;
  disabled?: boolean;
  // Only offered while 🌐 network is on. Default: on for URLs, off for programs.
  network?: boolean;
  // Only these tools (by their name on the server); small models do better with fewer.
  tools?: string[];
  // What it is for, in the user's words (shown in the app).
  about?: string;
  // The preset it came from, if any.
  preset?: string;
};

export type Need = { key: string; label: string; where: "env" | "header"; template?: string; optional?: boolean; help?: string };

export type Preset = ServerConfig & {
  icon: string;
  title: string;
  about: string;
  kind: "docs" | "browser" | "think" | "files" | "make" | "code" | "hub";
  // Programs it needs on PATH (checked in the app before you add it).
  requires?: ("node" | "uv" | "docker")[];
  // Keys the user fills in when adding it.
  needs?: Need[];
};

const REQUIRES_BIN = { node: "npx", uv: "uvx", docker: "docker" } as const;
export const missing = (p: Preset) => (p.requires ?? []).filter((r) => !Bun.which(REQUIRES_BIN[r]));
export const INSTALL: Record<string, string> = {
  node: "Node.js from nodejs.org (it brings npx)",
  uv: "uv from docs.astral.sh/uv (it brings uvx): powershell -c \"irm https://astral.sh/uv/install.ps1 | iex\"",
  docker: "Docker Desktop, then turn on its MCP Toolkit",
};

export const PRESETS: Record<string, Preset> = {
  context7: { icon: "📚", title: "Context7", kind: "docs", url: "https://mcp.context7.com/mcp", approval: "auto", about: "current docs and code examples for libraries and frameworks (React, Next.js, Bun, pandas, Android...)" },
  deepwiki: { icon: "🗺", title: "DeepWiki", kind: "docs", url: "https://mcp.deepwiki.com/mcp", approval: "auto", tools: ["ask_question"], about: "questions about any public GitHub repository: how it works, where things are" },
  gitmcp: { icon: "📖", title: "GitMCP", kind: "docs", url: "https://gitmcp.io/docs", approval: "auto", about: "read the docs and README of any GitHub project, so the model stops guessing APIs" },
  "microsoft-learn": { icon: "🪟", title: "Microsoft Learn", kind: "docs", url: "https://learn.microsoft.com/api/mcp", approval: "auto", about: "Microsoft docs: Windows, PowerShell, .NET, C#, Azure" },
  huggingface: {
    icon: "🤗", title: "Hugging Face", kind: "docs", url: "https://huggingface.co/mcp", approval: "auto",
    needs: [{ key: "Authorization", label: "Hugging Face token (optional, more tools)", where: "header", template: "Bearer {}", optional: true, help: "huggingface.co/settings/tokens" }],
    about: "search models, datasets, papers and Spaces: find the next model to load in LM Studio",
  },
  // A real browser the model drives by the page's accessibility tree (no vision
  // needed). Clicks and typing ask first in ask mode. Trimmed to the tools a
  // small model actually needs.
  playwright: {
    icon: "🎭", title: "Playwright", kind: "browser", requires: ["node"], network: true,
    command: "npx", args: ["-y", "@playwright/mcp@latest", "--browser", "msedge"],
    tools: ["browser_navigate", "browser_snapshot", "browser_click", "browser_type", "browser_press_key", "browser_take_screenshot", "browser_console_messages", "browser_wait_for", "browser_close"],
    about: "drive a real Edge browser: open pages, click, type, read console errors, take screenshots",
  },
  "chrome-devtools": {
    icon: "🩺", title: "Chrome DevTools", kind: "browser", requires: ["node"], network: true,
    command: "npx", args: ["-y", "chrome-devtools-mcp@latest"],
    tools: ["new_page", "navigate_page", "take_snapshot", "click", "fill", "list_console_messages", "list_network_requests", "performance_start_trace", "performance_stop_trace", "take_screenshot"],
    about: "DevTools for the model: console, network requests and performance traces of your web app or game",
  },
  memory: {
    icon: "🧠", title: "Memory graph", kind: "think", requires: ["node"], approval: "auto",
    command: "npx", args: ["-y", "@modelcontextprotocol/server-memory"], env: { MEMORY_FILE_PATH: "${MAXX_HOME}/mcp-memory.jsonl" },
    about: "a knowledge graph that lasts between sessions and projects: people, decisions, facts",
  },
  "sequential-thinking": {
    icon: "🪜", title: "Step by step", kind: "think", requires: ["node"], approval: "auto",
    command: "npx", args: ["-y", "@modelcontextprotocol/server-sequential-thinking"],
    about: "a scratchpad for thinking in numbered steps and revising them: helps small models plan",
  },
  markitdown: {
    icon: "📄", title: "MarkItDown", kind: "files", requires: ["uv"], approval: "auto",
    command: "uvx", args: ["markitdown-mcp"],
    about: "turn PDF, Word, Excel, PowerPoint, images and audio into Markdown the model can read",
  },
  blender: {
    icon: "🧊", title: "Blender", kind: "make", requires: ["uv"],
    command: "uvx", args: ["blender-mcp"],
    about: "build 3D scenes and game assets in Blender (install the blender-mcp add-on in Blender and click Connect)",
  },
  github: {
    icon: "🐙", title: "GitHub", kind: "code", url: "https://api.githubcopilot.com/mcp/",
    needs: [{ key: "Authorization", label: "GitHub token (Maxx's own GitHub sign-in is used if you leave this empty)", where: "header", template: "Bearer {}", optional: true, help: "github.com/settings/tokens" }],
    tools: ["search_repositories", "search_code", "get_file_contents", "list_issues", "get_issue", "list_pull_requests", "get_pull_request", "search_issues"],
    about: "search GitHub, read code, issues and pull requests in any repository",
  },
  docker: {
    icon: "🐳", title: "Docker MCP Toolkit", kind: "hub", requires: ["docker"],
    command: "docker", args: ["mcp", "gateway", "run"],
    about: "one door to every server you switched on in Docker Desktop's MCP Toolkit, each in its own container",
  },
  everything: {
    icon: "🧪", title: "Test server", kind: "hub", requires: ["node"], approval: "auto",
    command: "npx", args: ["-y", "@modelcontextprotocol/server-everything"], tools: ["echo", "get-sum", "get-tiny-image", "get-roots-list"],
    about: "the MCP reference server: check that MCP works before trying a real one",
  },
};
export const DEFAULT_SERVERS = ["context7"];

// A preset as it goes into mcp.json, with the keys the user typed filled in.
export function presetConfig(name: string, keys: Record<string, string> = {}): ServerConfig | undefined {
  const p = PRESETS[name];
  if (!p) return undefined;
  const { icon, title, kind, requires, needs, about, ...cfg } = p;
  const out: ServerConfig = structuredClone(cfg);
  out.preset = name;
  for (const n of needs ?? []) {
    const v = keys[n.key]?.trim();
    if (!v) continue;
    const value = n.template && !/^(bearer|basic|token)\s/i.test(v) ? n.template.replace("{}", v) : v;
    if (n.where === "env") out.env = { ...out.env, [n.key]: value };
    else out.headers = { ...out.headers, [n.key]: value };
  }
  return out;
}

// ${VAR} and ${env:VAR} in a config come from the environment (Claude Code and VS Code write them).
export function expand(s: string, env: Record<string, string | undefined> = process.env): string {
  return s.replace(/\$\{(?:env:)?(\w+)(?::-([^}]*))?\}/g, (_, k: string, d?: string) => (k === "MAXX_HOME" ? (env.MAXX_HOME ?? join(homedir(), ".maxx")) : env[k] ?? d ?? ""));
}

export function expandConfig(c: ServerConfig, env: Record<string, string | undefined> = process.env): ServerConfig {
  const map = (r?: Record<string, string>) => (r ? Object.fromEntries(Object.entries(r).map(([k, v]) => [k, expand(String(v), env)])) : undefined);
  return { ...c, command: c.command && expand(c.command, env), args: c.args?.map((a) => expand(String(a), env)), url: c.url && expand(c.url, env), env: map(c.env), headers: map(c.headers) };
}

export const needsNetwork = (c: ServerConfig) => c.network ?? !!c.url;
export const approvalOf = (c: ServerConfig): Approval => c.approval ?? (c.trust ? "auto" : "smart");

// One server entry from any app's config, or null when it isn't one.
export function normalize(raw: unknown): ServerConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const url = typeof r.url === "string" ? r.url : typeof r.serverUrl === "string" ? r.serverUrl : typeof r.httpUrl === "string" ? r.httpUrl : undefined;
  const command = typeof r.command === "string" ? r.command : undefined;
  if (!url && !command) return null;
  const strs = (x: unknown) => (x && typeof x === "object" && !Array.isArray(x) ? Object.fromEntries(Object.entries(x as object).filter(([, v]) => typeof v === "string" || typeof v === "number").map(([k, v]) => [k, String(v)])) : undefined);
  const c: ServerConfig = url ? { url } : { command, args: Array.isArray(r.args) ? r.args.map(String) : [] };
  const env = strs(r.env), headers = strs(r.headers);
  if (env && Object.keys(env).length) c.env = env;
  if (headers && Object.keys(headers).length) c.headers = headers;
  if (r.disabled === true || r.enabled === false) c.disabled = true;
  if (Array.isArray(r.tools) && r.tools.every((t) => typeof t === "string") && !r.tools.includes("*")) c.tools = r.tools as string[];
  if (r.trust === true) c.approval = "auto";
  if (r.approval === "ask" || r.approval === "auto" || r.approval === "smart") c.approval = r.approval;
  if (typeof r.network === "boolean") c.network = r.network;
  if (typeof r.about === "string") c.about = r.about;
  if (typeof r.preset === "string") c.preset = r.preset;
  return c;
}

// {"mcpServers": {...}} (Claude, Cursor, LM Studio), {"servers": {...}} (VS Code), or one bare map.
export function parseServers(text: string): Record<string, ServerConfig> {
  let j: unknown;
  try {
    j = JSON.parse(text.replace(/^\uFEFF/, ""));
  } catch {
    // VS Code files allow comments and trailing commas.
    j = JSON.parse(text.replace(/^\uFEFF/, "").replace(/("(?:\\.|[^"\\])*")|\/\/[^\n]*|\/\*[\s\S]*?\*\//g, (_, s) => s ?? "").replace(/,(\s*[}\]])/g, "$1"));
  }
  const o = j as Record<string, unknown>;
  const map = (o?.mcpServers ?? o?.servers ?? (o?.mcp as Record<string, unknown>)?.servers ?? o) as Record<string, unknown>;
  const out: Record<string, ServerConfig> = {};
  if (!map || typeof map !== "object") return out;
  for (const [name, raw] of Object.entries(map)) {
    const c = normalize(raw);
    if (c) out[cleanName(name)] = c;
  }
  // A single server pasted on its own: {"command": "npx", ...}.
  if (!Object.keys(out).length) {
    const c = normalize(o);
    if (c) out[cleanName(guessName(c))] = c;
  }
  return out;
}

export const cleanName = (s: string) => s.trim().toLowerCase().replace(/[^\w-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "server";
export function guessName(c: ServerConfig): string {
  if (c.url) {
    try {
      const u = new URL(c.url);
      return u.hostname.replace(/^(www|mcp|api)\./, "").split(".")[0]!;
    } catch {}
  }
  const pkg = (c.args ?? []).find((a) => !a.startsWith("-")) ?? c.command ?? "server";
  return pkg.replace(/^@[^/]+\//, "").replace(/@.*$/, "").replace(/^(mcp-server-|server-)|(-mcp|-mcp-server)$/g, "");
}

// Where other apps keep theirs.
export function otherApps(home = homedir(), env = process.env): { app: string; path: string }[] {
  const appdata = env.APPDATA ?? join(home, "AppData", "Roaming");
  const list = [
    { app: "Claude Desktop", path: process.platform === "win32" ? join(appdata, "Claude", "claude_desktop_config.json") : process.platform === "darwin" ? join(home, "Library", "Application Support", "Claude", "claude_desktop_config.json") : join(home, ".config", "Claude", "claude_desktop_config.json") },
    { app: "Claude Code", path: join(home, ".claude.json") },
    { app: "LM Studio", path: join(home, ".lmstudio", "mcp.json") },
    { app: "Cursor", path: join(home, ".cursor", "mcp.json") },
    { app: "Windsurf", path: join(home, ".codeium", "windsurf", "mcp_config.json") },
    { app: "VS Code", path: process.platform === "win32" ? join(appdata, "Code", "User", "mcp.json") : process.platform === "darwin" ? join(home, "Library", "Application Support", "Code", "User", "mcp.json") : join(home, ".config", "Code", "User", "mcp.json") },
  ];
  return list.filter((l) => existsSync(l.path));
}

export type Found = { app: string; path: string; name: string; cfg: ServerConfig };

export function findInOtherApps(home = homedir(), env = process.env): Found[] {
  const out: Found[] = [];
  for (const { app, path } of otherApps(home, env)) {
    try {
      const text = readFileSync(path, "utf8");
      // Claude Code keeps its user servers at the top of a much bigger file.
      const servers = app === "Claude Code" ? parseServers(JSON.stringify({ mcpServers: (JSON.parse(text) as { mcpServers?: unknown }).mcpServers ?? {} })) : parseServers(text);
      for (const [name, cfg] of Object.entries(servers)) out.push({ app, path, name, cfg });
    } catch {}
  }
  return out;
}

// Servers a project brings with it: a cloned repo can carry them, so each one
// waits for the user's OK before Maxx starts it.
export const PROJECT_FILES = [".mcp.json", join(".vscode", "mcp.json"), join(".cursor", "mcp.json"), join(".maxx", "mcp.json")];

export function projectServers(cwd: string): { file: string; name: string; cfg: ServerConfig }[] {
  const out: { file: string; name: string; cfg: ServerConfig }[] = [];
  const seen = new Set<string>();
  for (const f of PROJECT_FILES) {
    const path = join(cwd, f);
    if (!existsSync(path)) continue;
    try {
      for (const [name, cfg] of Object.entries(parseServers(readFileSync(path, "utf8")))) {
        if (seen.has(name)) continue;
        seen.add(name);
        out.push({ file: f.replaceAll("\\", "/"), name, cfg });
      }
    } catch {}
  }
  return out;
}

// What the user approved, by project folder: name → fingerprint of the exact config.
export function fingerprint(c: ServerConfig): string {
  const { disabled, about, ...rest } = c;
  return new Bun.CryptoHasher("sha256").update(stable(rest)).digest("hex").slice(0, 16);
}
const stable = (v: unknown): string =>
  Array.isArray(v) ? `[${v.map(stable).join(",")}]` : v && typeof v === "object" ? `{${Object.keys(v).sort().filter((k) => (v as any)[k] !== undefined).map((k) => `${JSON.stringify(k)}:${stable((v as any)[k])}`).join(",")}}` : JSON.stringify(v);
