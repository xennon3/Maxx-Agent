import { existsSync, readFileSync, realpathSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

// A small Language Server Protocol client, so Maxx can ask the same engine VS
// Code uses: where is this defined, who calls it, rename it everywhere, what
// are the type errors. It starts whichever server is installed for the file's
// language and keeps it running for the session. With no server installed,
// code_nav falls back to a careful text search (see symbols.ts).

export type Server = { lang: string; cmd: string[]; install: string; init?: (root: string) => object; usable?: (root: string) => boolean };

// TypeScript 7 (the native compiler) is its own language server: tsc --lsp --stdio.
let tscMajor: number | undefined;
export function tscVersion(): number {
  if (tscMajor !== undefined) return tscMajor;
  try {
    const cmd = process.platform === "win32" ? ["cmd", "/c", "tsc", "--version"] : ["tsc", "--version"];
    const out = Bun.spawnSync(cmd, { stdout: "pipe", stderr: "pipe" }).stdout.toString();
    tscMajor = Number(/Version (\d+)/.exec(out)?.[1] ?? 0);
  } catch {
    tscMajor = 0;
  }
  return tscMajor;
}

// typescript-language-server needs a TypeScript to drive. A project without
// node_modules/typescript gets the global one installed next to the server.
export function globalTsserver(which = (b: string) => Bun.which(b)): string | null {
  const bin = which("typescript-language-server");
  if (!bin) return null;
  let real = bin;
  try {
    real = realpathSync(bin);
  } catch {}
  const dirs = [dirname(bin), dirname(real)];
  const tries = dirs.flatMap((d) => [join(d, "node_modules", "typescript", "lib", "tsserver.js"), join(d, "..", "lib", "node_modules", "typescript", "lib", "tsserver.js"), join(d, "..", "..", "typescript", "lib", "tsserver.js"), join(d, "..", "node_modules", "typescript", "lib", "tsserver.js")]);
  return tries.find((p) => existsSync(p)) ?? null;
}

// The first one found on PATH wins.
const SERVERS: Record<string, Server[]> = {
  ts: [
    {
      lang: "typescript",
      cmd: ["typescript-language-server", "--stdio"],
      install: "npm i -g typescript typescript-language-server",
      init: (root) => {
        if (existsSync(join(root, "node_modules", "typescript", "lib", "tsserver.js"))) return {};
        const p = globalTsserver();
        return p ? { tsserver: { path: p } } : {};
      },
      // It drives tsserver.js, which TypeScript 7 no longer ships.
      usable: (root) => existsSync(join(root, "node_modules", "typescript", "lib", "tsserver.js")) || !!globalTsserver(),
    },
    { lang: "typescript", cmd: ["tsc", "--lsp", "--stdio"], install: "npm i -g typescript (version 7 or newer has the language server built in)", usable: () => tscVersion() >= 7 },
  ],
  py: [
    { lang: "python", cmd: ["pyright-langserver", "--stdio"], install: "npm i -g pyright" },
    { lang: "python", cmd: ["pylsp"], install: "pip install python-lsp-server" },
  ],
  rs: [{ lang: "rust", cmd: ["rust-analyzer"], install: "rustup component add rust-analyzer" }],
  go: [{ lang: "go", cmd: ["gopls"], install: "go install golang.org/x/tools/gopls@latest" }],
  kt: [{ lang: "kotlin", cmd: ["kotlin-language-server"], install: "download kotlin-language-server from GitHub (fwcd/kotlin-language-server) and put its bin folder on PATH" }],
};

export const FAMILY: Record<string, string> = { ".ts": "ts", ".tsx": "ts", ".js": "ts", ".jsx": "ts", ".mjs": "ts", ".cjs": "ts", ".py": "py", ".rs": "rs", ".go": "go", ".kt": "kt", ".kts": "kt" };
const LANG_ID: Record<string, string> = { ".ts": "typescript", ".tsx": "typescriptreact", ".js": "javascript", ".jsx": "javascriptreact", ".mjs": "javascript", ".cjs": "javascript", ".py": "python", ".rs": "rust", ".go": "go", ".kt": "kotlin", ".kts": "kotlin" };

export const familyOf = (path: string) => FAMILY[extname(path).toLowerCase()];

export function findServer(path: string, which = (b: string) => Bun.which(b), root = ""): Server | { missing: Server[] } | null {
  const fam = familyOf(path);
  if (!fam) return null;
  for (const s of SERVERS[fam]!) if (which(s.cmd[0]!) && (!s.usable || s.usable(root))) return s;
  return { missing: SERVERS[fam]! };
}

type Pending = { resolve: (v: any) => void; reject: (e: Error) => void };

export class LspClient {
  private proc: Bun.Subprocess<"pipe", "pipe", "pipe">;
  private n = 0;
  private pending = new Map<number, Pending>();
  private opened = new Map<string, number>();
  readonly diagnostics = new Map<string, any[]>();
  private buf = new Uint8Array(0);
  ready: Promise<void>;

  constructor(readonly root: string, readonly server: Server) {
    const cmd = process.platform === "win32" ? ["cmd", "/c", ...server.cmd] : server.cmd;
    this.proc = Bun.spawn(cmd, { cwd: root, stdin: "pipe", stdout: "pipe", stderr: "pipe" });
    this.pump();
    this.ready = this.request("initialize", {
      processId: process.pid,
      initializationOptions: server.init?.(root) ?? {},
      rootUri: pathToFileURL(root).href,
      workspaceFolders: [{ uri: pathToFileURL(root).href, name: "project" }],
      capabilities: {
        textDocument: { definition: {}, references: {}, hover: { contentFormat: ["plaintext", "markdown"] }, rename: { prepareSupport: false }, documentSymbol: { hierarchicalDocumentSymbolSupport: true }, publishDiagnostics: {}, diagnostic: { dynamicRegistration: false } },
        workspace: { workspaceEdit: { documentChanges: true }, workspaceFolders: true },
      },
    }, 60_000).then(() => this.notify("initialized", {}));
  }

  private async pump() {
    const dec = new TextDecoder();
    for await (const chunk of this.proc.stdout as unknown as AsyncIterable<Uint8Array>) {
      const next = new Uint8Array(this.buf.length + chunk.length);
      next.set(this.buf);
      next.set(chunk, this.buf.length);
      this.buf = next;
      for (;;) {
        const head = dec.decode(this.buf.slice(0, Math.min(this.buf.length, 200)));
        const end = head.indexOf("\r\n\r\n");
        if (end < 0) break;
        const len = Number(/Content-Length:\s*(\d+)/i.exec(head.slice(0, end))?.[1] ?? NaN);
        const start = new TextEncoder().encode(head.slice(0, end + 4)).length;
        if (!Number.isFinite(len) || this.buf.length < start + len) break;
        const body = JSON.parse(dec.decode(this.buf.slice(start, start + len)));
        this.buf = this.buf.slice(start + len);
        this.onMessage(body);
      }
    }
    for (const p of this.pending.values()) p.reject(new Error(`${this.server.cmd[0]} stopped`));
    this.pending.clear();
  }

  private onMessage(m: any) {
    if (m.id !== undefined && this.pending.has(m.id) && (m.result !== undefined || m.error)) {
      const p = this.pending.get(m.id)!;
      this.pending.delete(m.id);
      return m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result);
    }
    if (m.method === "textDocument/publishDiagnostics") this.diagnostics.set(m.params.uri, m.params.diagnostics);
    // Servers ask things of the client (configuration, progress tokens); a plain answer keeps them going.
    if (m.id !== undefined && m.method) this.send({ jsonrpc: "2.0", id: m.id, result: m.method === "workspace/configuration" ? (m.params?.items ?? []).map(() => null) : null });
  }

  private send(msg: object) {
    const body = JSON.stringify(msg);
    this.proc.stdin.write(`Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`);
    this.proc.stdin.flush();
  }

  request(method: string, params: unknown, timeout = 30_000): Promise<any> {
    const id = ++this.n;
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => (this.pending.delete(id), reject(new Error(`${this.server.cmd[0]} did not answer ${method} in ${timeout / 1000}s`))), timeout);
      this.pending.set(id, { resolve: (v) => (clearTimeout(t), resolve(v)), reject: (e) => (clearTimeout(t), reject(e)) });
      this.send({ jsonrpc: "2.0", id, method, params });
    });
  }

  notify(method: string, params: unknown) {
    this.send({ jsonrpc: "2.0", method, params });
  }

  // Open (or refresh) a file so the server knows its current text.
  async open(abs: string): Promise<string> {
    await this.ready;
    const uri = pathToFileURL(abs).href;
    const text = readFileSync(abs, "utf8");
    const v = this.opened.get(uri);
    if (v === undefined) this.notify("textDocument/didOpen", { textDocument: { uri, languageId: LANG_ID[extname(abs).toLowerCase()] ?? "plaintext", version: 1, text } });
    else this.notify("textDocument/didChange", { textDocument: { uri, version: v + 1 }, contentChanges: [{ text }] });
    this.opened.set(uri, (v ?? 0) + 1);
    return uri;
  }

  close() {
    try {
      this.notify("exit", {});
    } catch {}
    this.proc.kill();
  }
}

const clients = new Map<string, LspClient>();
process.on("exit", () => clients.forEach((c) => c.close()));

// A server that failed to start is dropped, so the next call tries again.
export function dropClient(root: string, server: Server) {
  const key = `${resolve(root)}|${server.cmd[0]}`;
  clients.get(key)?.close();
  clients.delete(key);
}

export function clientFor(root: string, server: Server): LspClient {
  const key = `${resolve(root)}|${server.cmd[0]}`;
  let c = clients.get(key);
  if (!c) clients.set(key, (c = new LspClient(root, server)));
  return c;
}

// ---- turning answers into text a model can use ----

export type Loc = { path: string; line: number; col: number; text: string };

export function toLocs(root: string, result: any): Loc[] {
  const arr = !result ? [] : Array.isArray(result) ? result : [result];
  const out: Loc[] = [];
  for (const r of arr) {
    const uri = r.uri ?? r.targetUri;
    const range = r.range ?? r.targetSelectionRange ?? r.targetRange;
    if (!uri || !range) continue;
    let abs: string;
    try {
      abs = fileURLToPath(uri);
    } catch {
      continue;
    }
    const line = range.start.line;
    let text = "";
    try {
      text = (existsSync(abs) ? readFileSync(abs, "utf8").split("\n")[line] ?? "" : "").trim().slice(0, 160);
    } catch {}
    const rel = relative(root, abs).replaceAll("\\", "/");
    out.push({ path: rel.startsWith("..") ? abs : rel, line: line + 1, col: range.start.character + 1, text });
  }
  return out;
}

export const formatLocs = (locs: Loc[], max = 40) =>
  locs.slice(0, max).map((l) => `${l.path}:${l.line}: ${l.text}`).join("\n") + (locs.length > max ? `\n... and ${locs.length - max} more` : "");

export function hoverText(h: any): string {
  const c = h?.contents;
  if (!c) return "";
  const one = (x: any): string => (typeof x === "string" ? x : x?.value ?? "");
  return (Array.isArray(c) ? c.map(one).join("\n") : one(c)).replace(/```\w*\n?/g, "").trim().slice(0, 1500);
}

export type TextEdit = { range: { start: { line: number; character: number }; end: { line: number; character: number } }; newText: string };

// Apply a rename's edits to text, last first so positions stay right.
export function applyEdits(text: string, edits: TextEdit[]): string {
  const lines = text.split("\n");
  const offset = (p: { line: number; character: number }) => lines.slice(0, p.line).reduce((n, l) => n + l.length + 1, 0) + p.character;
  const sorted = [...edits].sort((a, b) => offset(b.range.start) - offset(a.range.start));
  for (const e of sorted) text = text.slice(0, offset(e.range.start)) + e.newText + text.slice(offset(e.range.end));
  return text;
}

export function editsByFile(we: any): Map<string, TextEdit[]> {
  const out = new Map<string, TextEdit[]>();
  for (const [uri, edits] of Object.entries(we?.changes ?? {})) out.set(fileURLToPath(uri), edits as TextEdit[]);
  for (const dc of we?.documentChanges ?? []) if (dc.textDocument && dc.edits) out.set(fileURLToPath(dc.textDocument.uri), dc.edits);
  return out;
}
