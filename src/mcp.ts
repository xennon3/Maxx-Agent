// A small MCP client, so free MCP servers (library docs, wikis, anything that
// speaks the Model Context Protocol) become tools for the model. Servers are
// listed in ~/.maxx/mcp.json in the same shape Claude Desktop and Cursor use,
// so a config can be pasted across:
//
//   { "mcpServers": {
//       "context7": { "url": "https://mcp.context7.com/mcp" },
//       "fetch":    { "command": "uvx", "args": ["mcp-server-fetch"] } } }
//
// Both transports are here: stdio (a program Maxx starts) and Streamable HTTP
// (a URL). Like web_search, MCP tools are only offered while network access is
// on. Calls ask first in ask mode unless the server is marked "trust": true.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import { maxxHome } from "./sessions.ts";
import type { Tool } from "./tools/types.ts";

export type ServerConfig = {
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  headers?: Record<string, string>;
  // Read-only lookups: call without asking, like web_search.
  trust?: boolean;
  disabled?: boolean;
  // Only these tools (by their name on the server); small models do better with fewer.
  tools?: string[];
};
type Config = { mcpServers: Record<string, ServerConfig> };

// Free, no key, no install: they run as URLs. Used until mcp.json exists.
export const PRESETS: Record<string, ServerConfig & { about: string }> = {
  context7: { url: "https://mcp.context7.com/mcp", trust: true, about: "current docs and code examples for libraries and frameworks (React, Next.js, Bun, pandas, Android...)" },
  deepwiki: { url: "https://mcp.deepwiki.com/mcp", trust: true, tools: ["ask_question"], about: "questions about any public GitHub repository" },
  "microsoft-learn": { url: "https://learn.microsoft.com/api/mcp", trust: true, about: "Microsoft docs: Windows, PowerShell, .NET, C#, Azure" },
};
export const DEFAULT_SERVERS = ["context7"];

export const mcpFile = () => join(maxxHome(), "mcp.json");

export async function loadMcpConfig(): Promise<{ servers: Record<string, ServerConfig>; saved: boolean }> {
  try {
    const c = JSON.parse(await readFile(mcpFile(), "utf8")) as Partial<Config>;
    return { servers: c.mcpServers ?? {}, saved: true };
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw new Error(`${mcpFile()} is not valid JSON: ${(e as Error).message}`);
    return { servers: Object.fromEntries(DEFAULT_SERVERS.map((n) => [n, strip(PRESETS[n]!)])), saved: false };
  }
}

export async function saveMcpConfig(servers: Record<string, ServerConfig>) {
  await mkdir(maxxHome(), { recursive: true });
  await writeFile(mcpFile(), JSON.stringify({ mcpServers: servers } satisfies Config, null, 2) + "\n");
}

const strip = ({ about, ...c }: ServerConfig & { about?: string }): ServerConfig => c;
export const presetConfig = (name: string) => (PRESETS[name] ? strip(PRESETS[name]) : undefined);

type Pending = { resolve: (v: any) => void; reject: (e: Error) => void };
type RpcError = { code: number; message: string };
type Rpc = { jsonrpc: "2.0"; id?: number | string; method?: string; params?: unknown; result?: unknown; error?: RpcError };

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

// A program on this machine, talking newline-delimited JSON-RPC on stdin/stdout.
class StdioTransport implements Transport {
  private proc: Bun.Subprocess<"pipe", "pipe", "pipe">;
  private pending = new Map<number | string, Pending>();
  private stderr = "";
  private exited = false;

  constructor(cfg: ServerConfig) {
    // npx, uvx and friends are .cmd scripts on Windows, which only start through cmd.
    const cmd = process.platform === "win32" ? ["cmd", "/c", cfg.command!, ...(cfg.args ?? [])] : [cfg.command!, ...(cfg.args ?? [])];
    const proc = (this.proc = Bun.spawn(cmd, { stdin: "pipe", stdout: "pipe", stderr: "pipe", env: { ...process.env, ...cfg.env } }));
    this.pump();
    void (async () => {
      for await (const chunk of proc.stderr) this.stderr = (this.stderr + new TextDecoder().decode(chunk)).slice(-600);
    })().catch(() => {});
    void this.proc.exited.then((code) => {
      this.exited = true;
      const err = new Error(`the server exited (code ${code})${this.stderr.trim() ? `: ${this.stderr.trim().split("\n").slice(-2).join(" ")}` : ""}`);
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
        if (m.method && m.id !== undefined) this.write({ jsonrpc: "2.0", id: m.id, ...(m.method === "ping" ? { result: {} } : { error: { code: -32601, message: "not supported by maxx" } }) });
        else if (m.id !== undefined) {
          settle(this.pending.get(m.id), m);
          this.pending.delete(m.id);
        }
      }
    }
  }

  private write(m: Rpc) {
    this.proc.stdin.write(JSON.stringify(m) + "\n");
    this.proc.stdin.flush();
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
      this.proc.kill();
    } catch {}
  }
}

// A URL speaking Streamable HTTP: POST each message, the answer comes back as
// JSON or as a short server-sent-events stream.
class HttpTransport implements Transport {
  private session?: string;
  private version?: string;
  constructor(private cfg: ServerConfig) {}

  private async post(m: Rpc, timeout: number): Promise<Response> {
    const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json, text/event-stream", ...this.cfg.headers };
    if (this.session) headers["Mcp-Session-Id"] = this.session;
    if (this.version) headers["MCP-Protocol-Version"] = this.version;
    const res = await fetch(this.cfg.url!, { method: "POST", headers, body: JSON.stringify(m), signal: AbortSignal.timeout(timeout) });
    this.session = res.headers.get("mcp-session-id") ?? this.session;
    if (!res.ok && res.status !== 202) throw new Error(`${new URL(this.cfg.url!).host} answered ${res.status}${res.status === 401 ? " (it wants a key: add it under headers in mcp.json)" : ""}`);
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
          if (m.id === id && !m.method) return await new Promise((resolve, reject) => settle({ resolve, reject }, m));
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

type McpTool = { name: string; description?: string; inputSchema?: Record<string, unknown> };
type McpContent = { type: string; text?: string; resource?: { uri?: string; text?: string } };

export class McpClient {
  private t: Transport;
  constructor(readonly name: string, readonly cfg: ServerConfig) {
    if (!cfg.url && !cfg.command) throw new Error("needs a url or a command");
    this.t = cfg.url ? new HttpTransport(cfg) : new StdioTransport(cfg);
  }

  // First starts of npx/uvx servers download packages, so stdio gets longer.
  async connect(timeout = this.cfg.url ? 15_000 : 60_000) {
    await this.t.request("initialize", { protocolVersion: PROTOCOL, capabilities: {}, clientInfo: { name: "maxx", version: "0.1.0" } }, timeout);
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

  async call(tool: string, args: Record<string, unknown>): Promise<string> {
    const r = (await this.t.request("tools/call", { name: tool, arguments: args }, 60_000)) as { content?: McpContent[]; structuredContent?: unknown; isError?: boolean };
    let text = (r.content ?? []).map((c) => (c.type === "text" ? c.text ?? "" : c.type === "resource" ? c.resource?.text ?? `[resource ${c.resource?.uri ?? ""}]` : `[${c.type}]`)).join("\n").trim();
    if (!text && r.structuredContent !== undefined) text = JSON.stringify(r.structuredContent);
    return r.isError ? `error: ${text || "the tool failed"}` : text || "(no output)";
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
const MAX_TOOLS = 12;
const RETRY_MS = 2 * 60_000;

function asTool(client: McpClient, t: McpTool): Tool<any> {
  const name = toolName(client.name, t.name);
  return {
    name,
    description: short(`(${client.name}) ${t.description ?? t.name}`.replace(/\s+/g, " "), 400),
    schema: z.looseObject({}),
    parameters: (slimSchema(t.inputSchema ?? { type: "object", properties: {} }) as Record<string, unknown>),
    risk: client.cfg.trust ? "read" : "exec",
    checkpoint: false,
    ruleKey: () => "",
    preview: (args) => `${client.name} → ${t.name}\n${JSON.stringify(args, null, 2)}`,
    async run(args) {
      const out = await client.call(t.name, args);
      return out.length > MCP_CHARS ? `${out.slice(0, MCP_CHARS)}\n… (cut at ${MCP_CHARS} of ${out.length} characters; ask for something narrower if this misses it)` : out;
    },
  };
}

// One set of connections per Maxx process, shared by every session.
export class McpHub {
  // Servers that connected, with their tools; the ones that failed are tried again later.
  private ready = new Map<string, { client: McpClient; tools: Tool<any>[] }>();
  private loading?: Promise<{ tools: Tool<any>[]; notes: string[] }>;
  private failedAt = 0;

  // A server that was down (offline laptop, a slow first npx) gets another try after a while.
  tools() {
    if (this.failedAt && Date.now() - this.failedAt > RETRY_MS) this.loading = undefined;
    return (this.loading ??= this.load());
  }

  private async load() {
    const notes: string[] = [];
    let servers: Record<string, ServerConfig>;
    try {
      servers = (await loadMcpConfig()).servers;
    } catch (e) {
      return { tools: [], notes: [`MCP: ${(e as Error).message}`] };
    }
    const wanted = Object.entries(servers).filter(([, c]) => !c.disabled);
    let failed = false;
    await Promise.all(
      wanted
        .filter(([name]) => !this.ready.has(name))
        .map(async ([name, cfg]) => {
          let c: McpClient | undefined;
          try {
            c = new McpClient(name, cfg);
            await c.connect();
            const list = (await c.listTools()).filter((t) => !cfg.tools || cfg.tools.includes(t.name));
            this.ready.set(name, { client: c, tools: list.map((t) => asTool(c!, t)) });
          } catch (e) {
            c?.close();
            failed = true;
            notes.push(`MCP server ${name} is unavailable: ${(e as Error).message}`);
          }
        }),
    );
    this.failedAt = failed ? Date.now() : 0;
    // In config order, whichever connected first.
    let tools = wanted.flatMap(([name]) => this.ready.get(name)?.tools ?? []);
    if (tools.length > MAX_TOOLS) {
      notes.push(`MCP: using the first ${MAX_TOOLS} of ${tools.length} tools (list the ones you want under "tools" in ${mcpFile()})`);
      tools = tools.slice(0, MAX_TOOLS);
    }
    return { tools, notes };
  }

  // After the config changes: the next tools() call connects again.
  reset() {
    for (const { client } of this.ready.values()) client.close();
    this.ready.clear();
    this.loading = undefined;
    this.failedAt = 0;
  }
}

export const mcpHub = new McpHub();
process.on("exit", () => mcpHub.reset());
