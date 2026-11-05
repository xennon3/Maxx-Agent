// A small MCP client, so any server that speaks the Model Context Protocol
// (library docs, a real browser, Blender, GitHub, a knowledge graph...) becomes
// tools for the model. Servers are listed in ~/.maxx/mcp.json in the same shape
// Claude Desktop, Cursor and LM Studio use, so a config can be pasted across:
//
//   { "mcpServers": {
//       "context7": { "url": "https://mcp.context7.com/mcp" },
//       "memory":   { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-memory"] } } }
//
// Both transports are here: stdio (a program Maxx starts) and Streamable HTTP
// (a URL). URL servers are offered only while 🌐 network is on; programs run
// either way unless they say "network": true. A project can bring its own in
// .mcp.json or .vscode/mcp.json; those wait for the user's OK (see approve()).
//
// How calls are approved (approval in mcp.json, or the app's MCP dialog):
//   smart  tools the server marks read-only run, the rest follow the permission
//          setting, and ones marked destructive (or named like delete_x,
//          push_x, send_x) still ask under ⚡ auto-run.
//   ask    every call asks, auto-run too.
//   auto   nothing asks (read-only lookups like docs servers).

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";
import { z } from "zod";
import { maxxHome } from "./sessions.ts";
import type { Tool, ToolResult } from "./tools/types.ts";
import type { Image } from "./image.ts";
import { approvalOf, DEFAULT_SERVERS, expandConfig, fingerprint, needsNetwork, PRESETS, presetConfig, projectServers, type ServerConfig } from "./mcp-presets.ts";

export { DEFAULT_SERVERS, PRESETS, presetConfig, type ServerConfig } from "./mcp-presets.ts";

type Config = { mcpServers: Record<string, ServerConfig> };

export const mcpFile = () => join(maxxHome(), "mcp.json");

export async function loadMcpConfig(): Promise<{ servers: Record<string, ServerConfig>; saved: boolean }> {
  try {
    const c = JSON.parse(await readFile(mcpFile(), "utf8")) as Partial<Config>;
    return { servers: c.mcpServers ?? {}, saved: true };
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw new Error(`${mcpFile()} is not valid JSON: ${(e as Error).message}`);
    return { servers: Object.fromEntries(DEFAULT_SERVERS.map((n) => [n, presetConfig(n)!])), saved: false };
  }
}

export async function saveMcpConfig(servers: Record<string, ServerConfig>) {
  await mkdir(maxxHome(), { recursive: true });
  await writeFile(mcpFile(), JSON.stringify({ mcpServers: servers } satisfies Config, null, 2) + "\n");
  mcpHub.changed();
}

// Project servers the user said yes (or no) to: folder → name → fingerprint, or "no".
const approvedFile = () => join(maxxHome(), "mcp-approved.json");
type Approved = Record<string, Record<string, string>>;
async function loadApproved(): Promise<Approved> {
  try {
    return JSON.parse(await readFile(approvedFile(), "utf8")) as Approved;
  } catch {
    return {};
  }
}

// Yes starts the server from now on (until its config changes); no hides it.
export async function approveProjectServer(cwd: string, name: string, yes: boolean) {
  const found = projectServers(cwd).find((s) => s.name === name);
  if (!found) throw new Error(`no server called ${name} in this project`);
  const all = await loadApproved();
  all[cwd] = { ...all[cwd], [name]: yes ? fingerprint(found.cfg) : "no" };
  await mkdir(maxxHome(), { recursive: true });
  await writeFile(approvedFile(), JSON.stringify(all, null, 2) + "\n");
  mcpHub.changed();
}

type Pending = { resolve: (v: any) => void; reject: (e: Error) => void };
type RpcError = { code: number; message: string };
type Rpc = { jsonrpc: "2.0"; id?: number | string; method?: string; params?: unknown; result?: unknown; error?: RpcError };
export type Root = { uri: string; name: string };

interface Transport {
  request(method: string, params: unknown, timeout: number): Promise<any>;
  notify(method: string, params?: unknown): Promise<void>;
  close(): void;
}

const PROTOCOL = "2025-06-18";
let nextId = 1;

function settle(p: Pending | undefined, m: Rpc) {
  if (!p) return;
  if (m.error) p.reject(new Error(m.error.message || `error ${m.error.code}`));
  else p.resolve(m.result);
}

function withTimeout<T>(p: Promise<T>, ms: number, what: string): Promise<T> {
  let t: ReturnType<typeof setTimeout>;
  return Promise.race([p, new Promise<T>((_, rej) => (t = setTimeout(() => rej(new Error(`${what} timed out after ${ms / 1000}s`)), ms)))]).finally(() => clearTimeout(t));
}

// What Maxx answers when a server asks it something (roots, ping).
type Answerer = (method: string, params: unknown) => { result?: unknown; error?: RpcError };

// A program on this machine, talking newline-delimited JSON-RPC on stdin/stdout.
class StdioTransport implements Transport {
  private proc: Bun.Subprocess<"pipe", "pipe", "pipe">;
  private pending = new Map<number | string, Pending>();
  private stderr = "";
  private exited = false;

  constructor(cfg: ServerConfig, private answer: Answerer) {
    // npx, uvx and friends are .cmd scripts on Windows, which only start through cmd.
    const cmd = process.platform === "win32" ? ["cmd", "/c", cfg.command!, ...(cfg.args ?? [])] : [cfg.command!, ...(cfg.args ?? [])];
    let proc: Bun.Subprocess<"pipe", "pipe", "pipe">;
    try {
      proc = Bun.spawn(cmd, { stdin: "pipe", stdout: "pipe", stderr: "pipe", env: { ...process.env, ...cfg.env }, windowsHide: true } as any) as Bun.Subprocess<"pipe", "pipe", "pipe">;
    } catch (e) {
      throw new Error(`could not start ${cfg.command}: ${(e as Error).message}${/npx|uvx|docker/.test(cfg.command ?? "") ? ` (is ${cfg.command === "npx" ? "Node.js" : cfg.command === "uvx" ? "uv" : "Docker"} installed?)` : ""}`);
    }
    this.proc = proc;
    this.pump();
    void (async () => {
      for await (const chunk of proc.stderr) this.stderr = (this.stderr + new TextDecoder().decode(chunk)).slice(-600);
    })().catch(() => {});
    void this.proc.exited.then((code) => {
      this.exited = true;
      const why = this.stderr.trim() ? `: ${this.stderr.trim().split("\n").slice(-2).join(" ")}` : "";
      const notFound = /not recognized|not found|ENOENT/i.test(why) ? ` (is ${cfg.command} installed and on PATH?)` : "";
      const err = new Error(`the server exited (code ${code})${why}${notFound}`);
      for (const p of this.pending.values()) p.reject(err);
      this.pending.clear();
    });
  }

  private async pump() {
    let buf = "";
    const dec = new TextDecoder();
    for await (const chunk of this.proc.stdout) {
      buf += dec.decode(chunk, { stream: true });
      let nl;
      while ((nl = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line.startsWith("{")) continue; // some servers print banners
        let m: Rpc;
        try {
          m = JSON.parse(line);
        } catch {
          continue;
        }
        if (m.method && m.id !== undefined) this.write({ jsonrpc: "2.0", id: m.id, ...this.answer(m.method, m.params) });
        else if (m.id !== undefined) {
          settle(this.pending.get(m.id), m);
          this.pending.delete(m.id);
        }
      }
    }
  }

  private write(m: Rpc) {
    if (this.exited) return;
    try {
      this.proc.stdin.write(JSON.stringify(m) + "\n");
      this.proc.stdin.flush();
    } catch {}
  }

  request(method: string, params: unknown, timeout: number) {
    if (this.exited) return Promise.reject(new Error("the server is not running"));
    const id = nextId++;
    const p = new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
    this.write({ jsonrpc: "2.0", id, method, params });
    return withTimeout(p, timeout, method).finally(() => this.pending.delete(id));
  }

  async notify(method: string, params?: unknown) {
    this.write({ jsonrpc: "2.0", method, ...(params ? { params } : {}) });
  }

  close() {
    try {
      this.proc.stdin.end();
    } catch {}
    try {
      // On Windows the server runs under cmd /c; kill the whole tree.
      if (process.platform === "win32" && this.proc.pid) Bun.spawn(["taskkill", "/T", "/F", "/PID", String(this.proc.pid)], { stdout: "ignore", stderr: "ignore" });
      else this.proc.kill();
    } catch {}
  }
}

// A URL speaking Streamable HTTP: POST each message, the answer comes back as
// JSON or as a short server-sent-events stream.
class HttpTransport implements Transport {
  private session?: string;
  private version?: string;
  constructor(private cfg: ServerConfig, private answer: Answerer) {}

  private async post(m: Rpc, timeout: number): Promise<Response> {
    const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json, text/event-stream", ...this.cfg.headers };
    if (this.session) headers["Mcp-Session-Id"] = this.session;
    if (this.version) headers["MCP-Protocol-Version"] = this.version;
    const res = await fetch(this.cfg.url!, { method: "POST", headers, body: JSON.stringify(m), signal: AbortSignal.timeout(timeout) });
    this.session = res.headers.get("mcp-session-id") ?? this.session;
    if (!res.ok && res.status !== 202) throw new Error(`${new URL(this.cfg.url!).host} answered ${res.status}${res.status === 401 || res.status === 403 ? " (it wants a key or token: add it in the MCP dialog, or under headers in mcp.json)" : ""}`);
    return res;
  }

  async request(method: string, params: unknown, timeout: number) {
    const id = nextId++;
    const res = await this.post({ jsonrpc: "2.0", id, method, params }, timeout);
    if (method === "initialize") this.version = PROTOCOL;
    const type = res.headers.get("content-type") ?? "";
    if (!type.includes("text/event-stream")) {
      const body = (await res.json()) as Rpc | Rpc[];
      const m = (Array.isArray(body) ? body : [body]).find((x) => x.id === id);
      if (!m) throw new Error(`no answer to ${method}`);
      return new Promise((resolve, reject) => settle({ resolve, reject }, m));
    }
    // Read events until the one that answers this request.
    const reader = res.body!.getReader();
    const dec = new TextDecoder();
    let buf = "";
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true }).replace(/\r\n/g, "\n");
        let end;
        while ((end = buf.indexOf("\n\n")) >= 0) {
          const event = buf.slice(0, end);
          buf = buf.slice(end + 2);
          const data = event.split("\n").filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trimStart()).join("\n");
          if (!data) continue;
          let m: Rpc;
          try {
            m = JSON.parse(data);
          } catch {
            continue;
          }
          // A server asking Maxx something mid-call (roots, ping): answer with a POST.
          if (m.method && m.id !== undefined) void this.post({ jsonrpc: "2.0", id: m.id, ...this.answer(m.method, m.params) }, 10_000).then((r) => r.body?.cancel()).catch(() => {});
          else if (m.id === id && !m.method) return await new Promise((resolve, reject) => settle({ resolve, reject }, m));
        }
      }
    } finally {
      reader.cancel().catch(() => {});
    }
    throw new Error(`the stream ended without an answer to ${method}`);
  }

  async notify(method: string, params?: unknown) {
    await this.post({ jsonrpc: "2.0", method, ...(params ? { params } : {}) }, 10_000).then((r) => r.body?.cancel());
  }

  close() {
    if (!this.session) return;
    const headers: Record<string, string> = { "Mcp-Session-Id": this.session, ...this.cfg.headers };
    fetch(this.cfg.url!, { method: "DELETE", headers, signal: AbortSignal.timeout(3000) }).catch(() => {});
  }
}

export type McpTool = {
  name: string;
  title?: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
  annotations?: { title?: string; readOnlyHint?: boolean; destructiveHint?: boolean; idempotentHint?: boolean; openWorldHint?: boolean };
};
type McpContent = { type: string; text?: string; data?: string; mimeType?: string; uri?: string; name?: string; resource?: { uri?: string; text?: string } };

export class McpClient {
  private t: Transport;
  server?: { name?: string; version?: string };
  instructions?: string;
  constructor(readonly name: string, readonly cfg: ServerConfig, roots: () => Root[] = () => []) {
    if (!cfg.url && !cfg.command) throw new Error("needs a url or a command");
    const answer: Answerer = (method) => (method === "ping" ? { result: {} } : method === "roots/list" ? { result: { roots: roots() } } : { error: { code: -32601, message: "not supported by maxx" } });
    const c = expandConfig(cfg);
    this.t = c.url ? new HttpTransport(c, answer) : new StdioTransport(c, answer);
  }

  // First starts of npx/uvx servers download packages, so stdio gets longer.
  async connect(timeout = this.cfg.url ? 15_000 : 60_000) {
    const r = (await this.t.request("initialize", { protocolVersion: PROTOCOL, capabilities: { roots: { listChanged: true } }, clientInfo: { name: "maxx", version: "0.1.0" } }, timeout)) as { serverInfo?: { name?: string; version?: string }; instructions?: string };
    this.server = r?.serverInfo;
    this.instructions = r?.instructions;
    await this.t.notify("notifications/initialized");
  }

  async listTools(): Promise<McpTool[]> {
    const out: McpTool[] = [];
    let cursor: string | undefined;
    do {
      const r = (await this.t.request("tools/list", cursor ? { cursor } : {}, 15_000)) as { tools?: McpTool[]; nextCursor?: string };
      out.push(...(r.tools ?? []));
      cursor = r.nextCursor;
    } while (cursor && out.length < 200);
    return out;
  }

  // Text for the model, plus any pictures (Playwright screenshots, charts) for the vision model.
  async callFull(tool: string, args: Record<string, unknown>, timeout = 120_000): Promise<{ text: string; images: Image[] }> {
    const r = (await this.t.request("tools/call", { name: tool, arguments: args }, timeout)) as { content?: McpContent[]; structuredContent?: unknown; isError?: boolean };
    const images: Image[] = [];
    const parts = (r.content ?? []).map((c) => {
      if (c.type === "text") return c.text ?? "";
      if (c.type === "resource") return c.resource?.text ?? `[resource ${c.resource?.uri ?? ""}]`;
      if (c.type === "resource_link") return `[${c.name ?? "link"}: ${c.uri ?? ""}]`;
      if (c.type === "image" && c.data && (c.mimeType === "image/png" || c.mimeType === "image/jpeg")) {
        images.push({ mime: c.mimeType, base64: c.data });
        return "[image attached]";
      }
      return `[${c.type}]`;
    });
    let text = parts.join("\n").trim();
    if (!text && r.structuredContent !== undefined) text = JSON.stringify(r.structuredContent);
    return { text: r.isError ? `error: ${text || "the tool failed"}` : text || "(no output)", images };
  }

  async call(tool: string, args: Record<string, unknown>): Promise<string> {
    return (await this.callFull(tool, args)).text;
  }

  async rootsChanged() {
    await this.t.notify("notifications/roots/list_changed").catch(() => {});
  }

  close() {
    this.t.close();
  }
}

// Long schema descriptions cost context on every request; trim them.
export function slimSchema(s: unknown): unknown {
  if (Array.isArray(s)) return s.map(slimSchema);
  if (!s || typeof s !== "object") return s;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(s)) {
    if (k === "$schema" || k === "examples") continue;
    out[k] = k === "description" && typeof v === "string" ? short(v, 160) : slimSchema(v);
  }
  return out;
}
const short = (s: string, n: number) => (s.length <= n ? s : s.slice(0, s.lastIndexOf(" ", n) > n / 2 ? s.lastIndexOf(" ", n) : n) + "…");

// Model-facing names: server_tool, in the characters every server accepts.
export const toolName = (server: string, tool: string) => `${server}_${tool}`.replace(/[^\w-]/g, "_").slice(0, 64);

// About 1000 tokens; docs servers happily return ten times that.
export const MCP_CHARS = 4000;
// Tools offered by name; the rest wait behind mcp_more, so a small model isn't
// handed fifty tools at once.
export const MAX_TOOLS = 12;
const RETRY_MS = 2 * 60_000;
// How long opening a project waits for slow servers; the late ones join on the next message.
const WAIT_MS = 20_000;

// Names that sound like they change or send something you can't take back.
const DANGER_NAME = /(?:^|[_\-.])(delete|remove|rm|drop|destroy|purge|wipe|truncate|kill|terminate|reset|force|push|merge|publish|deploy|release|send|post|email|tweet|transfer|pay|buy|order|revoke|uninstall|format|execute_sql|run_command|exec)(?:$|[_\-.])/i;

export function dangerOf(t: McpTool, approval: string): string | null {
  if (approval === "auto") return null;
  if (approval === "ask") return "comes from an MCP server set to ask before every call";
  if (t.annotations?.destructiveHint === true && t.annotations.readOnlyHint !== true) return "is marked destructive by its MCP server";
  const m = t.annotations?.readOnlyHint ? null : t.name.match(DANGER_NAME);
  return m ? `looks like it ${m[1]!.toLowerCase() === "post" || m[1]!.toLowerCase() === "send" || m[1]!.toLowerCase() === "email" ? "sends something" : "changes something you can't undo"} (${t.name})` : null;
}

export function riskOfMcp(t: McpTool, approval: string): "read" | "exec" {
  if (approval === "auto") return "read";
  if (approval === "ask") return "exec";
  return t.annotations?.readOnlyHint === true && t.annotations.destructiveHint !== true ? "read" : "exec";
}

const MCP_TOOL = Symbol("mcp");
export type McpModelTool = Tool<any> & { [MCP_TOOL]: { server: string; tool: McpTool } };
export const mcpInfo = (t: Tool<any>) => (t as McpModelTool)[MCP_TOOL];

function asTool(client: McpClient, label: string, t: McpTool, approval: string): McpModelTool {
  const name = toolName(label, t.name);
  const danger = dangerOf(t, approval);
  return {
    name,
    description: short(`(${label}) ${t.description ?? t.annotations?.title ?? t.name}`.replace(/\s+/g, " "), 400),
    schema: z.looseObject({}),
    parameters: slimSchema(t.inputSchema ?? { type: "object", properties: {} }) as Record<string, unknown>,
    risk: riskOfMcp(t, approval),
    danger: () => danger,
    checkpoint: false,
    ruleKey: () => "",
    preview: (args) => `${label} → ${t.name}${danger ? `  (${danger})` : ""}\n${JSON.stringify(args, null, 2)}`,
    async run(args): Promise<ToolResult> {
      const out = await client.callFull(t.name, args);
      const text = out.text.length > MCP_CHARS ? `${out.text.slice(0, MCP_CHARS)}\n… (cut at ${MCP_CHARS} of ${out.text.length} characters; ask for something narrower if this misses it)` : out.text;
      return out.images.length ? { text, images: out.images.slice(-2) } : text;
    },
    [MCP_TOOL]: { server: label, tool: t },
  };
}

// The tools past MAX_TOOLS, behind one tool: list them, then call one by name.
export function moreTool(extra: McpModelTool[]): Tool<any> {
  const find = (n: unknown) => extra.find((t) => t.name === n || mcpInfo(t).tool.name === n);
  const servers = [...new Set(extra.map((t) => mcpInfo(t).server))];
  return {
    name: "mcp_more",
    description: `${extra.length} more MCP tools (from ${servers.join(", ")}) that are not listed directly. action "list" shows their names and parameters (find narrows by a word); action "call" runs one: tool is its name, args its arguments.`,
    schema: z.object({ action: z.enum(["list", "call"]), find: z.string().optional(), tool: z.string().optional(), args: z.record(z.string(), z.unknown()).optional() }),
    risk: "exec",
    riskOf: (a: any) => (a.action === "list" ? "read" : find(a.tool)?.risk ?? "exec"),
    danger: (a: any) => (a.action === "call" ? find(a.tool)?.danger?.({}) ?? null : null),
    checkpoint: false,
    ruleKey: (a: any) => String(a.tool ?? ""),
    preview: (a: any) => (find(a.tool)?.preview?.(a.args ?? {}, { cwd: "." }) as string) ?? `${a.tool}\n${JSON.stringify(a.args ?? {}, null, 2)}`,
    async run(a: any, ctx) {
      if (a.action === "list") {
        const words = String(a.find ?? "").toLowerCase().split(/\s+/).filter(Boolean);
        const hits = extra.filter((t) => words.every((w) => `${t.name} ${t.description}`.toLowerCase().includes(w)));
        if (!hits.length) return `no MCP tool matches "${a.find}". Tools: ${extra.map((t) => t.name).join(", ")}`;
        return hits.slice(0, 15).map((t) => `${t.name}: ${t.description}\n  args: ${JSON.stringify((t.parameters as any)?.properties ?? {})}`).join("\n");
      }
      const t = find(a.tool);
      if (!t) return `error: no MCP tool called "${a.tool}". Use action "list" first.`;
      return t.run(a.args ?? {}, ctx);
    },
  };
}

type Entry = {
  key: string;
  name: string;
  label: string;
  source: "maxx" | "project";
  file?: string;
  cfg: ServerConfig;
  fp: string;
  state: "connecting" | "ready" | "failed";
  client?: McpClient;
  list?: McpTool[];
  tools?: McpModelTool[];
  error?: string;
  at: number;
  done: Promise<void>;
};

export type ServerStatus = {
  name: string;
  label: string;
  source: "maxx" | "project";
  file?: string;
  cfg: ServerConfig;
  state: "ready" | "failed" | "connecting" | "off" | "offline" | "unapproved" | "denied" | "idle";
  error?: string;
  server?: string;
  tools: { name: string; description: string; readOnly: boolean; danger: string | null; on: boolean }[];
  network: boolean;
  approval: string;
};

// One set of connections per Maxx process, shared by every session. Each call
// re-reads the config (cheap), so a server added in the app or with `maxx mcp`
// joins without a restart, and one whose config changed reconnects.
export class McpHub {
  private entries = new Map<string, Entry>();
  private root?: string;
  // Goes up whenever the tools on offer may have changed; the agent loop looks before each message.
  version = 0;

  changed() {
    this.version++;
  }

  // The project folder, which servers that ask for "roots" (filesystem, git) work in.
  setRoot(cwd: string | undefined) {
    if (!cwd || cwd === this.root) return;
    this.root = cwd;
    for (const e of this.entries.values()) if (e.state === "ready") void e.client!.rootsChanged();
  }

  private roots = (): Root[] => (this.root ? [{ uri: pathToFileURL(this.root).href, name: basename(this.root) || this.root }] : []);

  // Every server for this folder: Maxx's own, then the project's approved ones.
  private async wanted(cwd?: string) {
    const out: { key: string; name: string; label: string; source: "maxx" | "project"; file?: string; cfg: ServerConfig; approved: boolean | null }[] = [];
    const notes: string[] = [];
    let servers: Record<string, ServerConfig> = {};
    try {
      servers = (await loadMcpConfig()).servers;
    } catch (e) {
      notes.push(`MCP: ${(e as Error).message}`);
    }
    for (const [name, cfg] of Object.entries(servers)) out.push({ key: name, name, label: name, source: "maxx", cfg, approved: true });
    if (cwd) {
      const ok = (await loadApproved())[cwd] ?? {};
      for (const p of projectServers(cwd)) {
        const fp = fingerprint(p.cfg);
        const label = servers[p.name] ? `${p.name}-project` : p.name;
        out.push({ key: `${cwd}\0${p.name}`, name: p.name, label, source: "project", file: p.file, cfg: p.cfg, approved: ok[p.name] === fp ? true : ok[p.name] === "no" ? false : null });
      }
    }
    return { list: out, notes };
  }

  private start(w: { key: string; name: string; label: string; source: "maxx" | "project"; file?: string; cfg: ServerConfig }): Entry {
    const fp = fingerprint(w.cfg);
    const old = this.entries.get(w.key);
    if (old && old.fp === fp && (old.state !== "failed" || Date.now() - old.at < RETRY_MS)) return old;
    old?.client?.close();
    const e: Entry = { ...w, fp, state: "connecting", at: Date.now(), done: Promise.resolve() };
    e.done = (async () => {
      let c: McpClient | undefined;
      try {
        c = new McpClient(w.label, w.cfg, this.roots);
        await c.connect(w.cfg.url ? 15_000 : 60_000);
        e.list = await c.listTools();
        e.client = c;
        const approval = approvalOf(w.cfg);
        e.tools = e.list.filter((t) => !w.cfg.tools || w.cfg.tools.includes(t.name)).map((t) => asTool(c!, w.label, t, approval));
        e.state = "ready";
      } catch (err) {
        c?.close();
        e.state = "failed";
        e.error = (err as Error).message;
      }
      e.at = Date.now();
      if (this.entries.get(w.key) === e) this.changed();
    })();
    this.entries.set(w.key, e);
    return e;
  }

  // network: URL servers (and programs marked network) only join while it is on.
  // Unset means on, for `maxx doctor web` and older callers.
  async tools(o: { network?: boolean; cwd?: string; wait?: number } = {}): Promise<{ tools: Tool<any>[]; notes: string[]; servers: string[] }> {
    const network = o.network ?? true;
    if (o.cwd) this.setRoot(o.cwd);
    const { list, notes } = await this.wanted(o.cwd);
    const live = list.filter((w) => w.approved === true && !w.cfg.disabled && (network || !needsNetwork(w.cfg)));
    // Servers that went away from the config stop.
    const keep = new Set(list.filter((w) => w.approved === true && !w.cfg.disabled).map((w) => w.key));
    for (const [k, e] of this.entries) if (!keep.has(k) && (e.source === "maxx" || k.startsWith(`${o.cwd}\0`))) e.client?.close(), this.entries.delete(k);
    const started = live.map((w) => this.start(w));
    const wait = o.wait ?? WAIT_MS;
    let timer: ReturnType<typeof setTimeout> | undefined;
    await Promise.race([Promise.all(started.map((e) => e.done)), new Promise((r) => (timer = setTimeout(r, wait)))]);
    clearTimeout(timer);
    for (const e of started) {
      if (e.state === "failed") notes.push(`MCP server ${e.label} is unavailable: ${e.error}`);
      if (e.state === "connecting") notes.push(`MCP server ${e.label} is still starting; its tools join on your next message`);
    }
    const asks = list.filter((w) => w.approved === null);
    if (asks.length) notes.push(`this project brings MCP server${asks.length > 1 ? "s" : ""} ${asks.map((a) => a.name).join(", ")} (in ${asks[0]!.file}); approve ${asks.length > 1 ? "them" : "it"} in 🧰 Tools → MCP servers, or with \`maxx mcp approve <name>\``);
    const ready = started.filter((e) => e.state === "ready");
    let tools: Tool<any>[] = ready.flatMap((e) => e.tools ?? []);
    // Two servers with a tool of the same name: keep the first.
    const seen = new Set<string>();
    tools = tools.filter((t) => !seen.has(t.name) && seen.add(t.name));
    if (tools.length > MAX_TOOLS) {
      const extra = tools.slice(MAX_TOOLS - 1) as McpModelTool[];
      tools = [...tools.slice(0, MAX_TOOLS - 1), moreTool(extra)];
    }
    return { tools, notes, servers: ready.map((e) => e.label) };
  }

  // For the app's MCP dialog: every server, how it is doing, and its tools.
  async status(o: { network?: boolean; cwd?: string } = {}): Promise<ServerStatus[]> {
    const network = o.network ?? true;
    const { list } = await this.wanted(o.cwd);
    return list.map((w) => {
      const e = this.entries.get(w.key);
      const approval = approvalOf(w.cfg);
      const state: ServerStatus["state"] =
        w.approved === null ? "unapproved" : w.approved === false ? "denied" : w.cfg.disabled ? "off" : !network && needsNetwork(w.cfg) ? "offline" : e && e.fp === fingerprint(w.cfg) ? e.state : "idle";
      return {
        name: w.name,
        label: w.label,
        source: w.source,
        file: w.file,
        cfg: mask(w.cfg),
        state,
        error: e?.error,
        server: e?.client?.server ? [e.client.server.name, e.client.server.version].filter(Boolean).join(" ") : undefined,
        tools: (e?.list ?? []).map((t) => ({ name: t.name, description: short((t.description ?? "").replace(/\s+/g, " "), 200), readOnly: riskOfMcp(t, approval) === "read", danger: dangerOf(t, approval), on: !w.cfg.tools || w.cfg.tools.includes(t.name) })),
        network: needsNetwork(w.cfg),
        approval,
      };
    });
  }

  // A connected client for the app's tester, connecting if needed.
  async client(name: string, cwd?: string): Promise<McpClient> {
    const { list } = await this.wanted(cwd);
    const w = list.find((x) => x.label === name || x.name === name);
    if (!w) throw new Error(`no MCP server called ${name}`);
    if (w.approved !== true) throw new Error(`${name} is waiting for your OK`);
    const e = this.start(w);
    await e.done;
    if (e.state !== "ready") throw new Error(e.error ?? "it did not connect");
    return e.client!;
  }

  // Connect now and report, without waiting for the next message.
  async test(name: string, cwd?: string): Promise<{ tools: number; server?: string }> {
    const { list } = await this.wanted(cwd);
    const w = list.find((x) => x.label === name || x.name === name);
    if (!w) throw new Error(`no MCP server called ${name}`);
    this.entries.get(w.key)?.client?.close();
    this.entries.delete(w.key);
    const c = await this.client(name, cwd);
    return { tools: this.entries.get(w.key)?.list?.length ?? 0, server: c.server?.name };
  }

  reset() {
    for (const e of this.entries.values()) e.client?.close();
    this.entries.clear();
    this.changed();
  }
}

// The page never sees a key: it gets the last four characters to recognize it by.
export const MASK = "••••";
export function mask(c: ServerConfig): ServerConfig {
  const hide = (r?: Record<string, string>) => (r ? Object.fromEntries(Object.entries(r).map(([k, v]) => [k, /^\$\{/.test(v) || (!/key|token|secret|auth|pass/i.test(k) && v.length < 24) ? v : MASK + v.slice(-4)])) : undefined);
  return { ...c, env: hide(c.env), headers: hide(c.headers) };
}
// A value that comes back still masked keeps what was saved.
export function unmask(next: ServerConfig, prev?: ServerConfig): ServerConfig {
  const keep = (r?: Record<string, string>, p?: Record<string, string>) => (r ? Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.startsWith(MASK) && p?.[k] ? p[k]! : v])) : undefined);
  return { ...next, env: keep(next.env, prev?.env), headers: keep(next.headers, prev?.headers) };
}

export const mcpHub = new McpHub();
process.on("exit", () => mcpHub.reset());

export { PRESETS as MCP_PRESETS };
