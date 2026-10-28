import { watch, type FSWatcher } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { inside } from "../tools/paths.ts";

// The Preview panel shows the project's own files (index.html, a game, a
// chart) like a Claude artifact. They are served from a second port, so the
// page is a different origin from the Maxx UI and its scripts can't reach the
// agent's socket; a random token in the path keeps other sites out.
// Every HTML page gets a small bridge script that forwards console output and
// errors to the panel, which is how the model learns whether its page works.

const SKIP = new Set(["node_modules", ".git", ".maxx", "dist", "build", ".gradle", "target", ".venv", "__pycache__"]);

export const BRIDGE = `(() => {
  const post = (m) => { try { parent.postMessage(Object.assign({ maxx: 1 }, m), "*"); } catch {} };
  const fmt = (a) => { if (a instanceof Error) return a.stack || String(a); if (typeof a === "object" && a) { try { return JSON.stringify(a); } catch {} } return String(a); };
  for (const level of ["log", "info", "warn", "error", "debug"]) {
    const orig = console[level].bind(console);
    console[level] = (...args) => { post({ kind: "console", level, text: args.map(fmt).join(" ").slice(0, 2000) }); orig(...args); };
  }
  addEventListener("error", (e) => {
    if (e.target && e.target !== window && (e.target.src || e.target.href)) post({ kind: "console", level: "error", text: "failed to load " + (e.target.src || e.target.href) });
    else post({ kind: "console", level: "error", text: (e.message || "error") + (e.filename ? " (" + e.filename.split("/").pop().split("?")[0] + ":" + e.lineno + ")" : "") });
  }, true);
  addEventListener("unhandledrejection", (e) => post({ kind: "console", level: "error", text: "unhandled promise rejection: " + fmt(e.reason) }));
  addEventListener("load", () => setTimeout(() => post({ kind: "loaded", title: document.title, text: (document.body ? document.body.innerText : "").replace(/\\s+\\n/g, "\\n").slice(0, 1500), path: location.pathname }), 50));
})();`;

export function injectBridge(html: string, src: string): string {
  const tag = `<script src="${src}"></script>`;
  const head = html.match(/<head[^>]*>/i);
  if (head) return html.replace(head[0], head[0] + tag);
  const doc = html.match(/<html[^>]*>/i);
  if (doc) return html.replace(doc[0], doc[0] + tag);
  return tag + html;
}

// HTML files in the project, nearest first, for the panel's file menu.
export async function htmlFiles(cwd: string, limit = 30): Promise<string[]> {
  const out: string[] = [];
  async function walk(dir: string, depth: number) {
    if (depth > 4 || out.length >= limit) return;
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    entries.sort((a, b) => Number(a.isDirectory()) - Number(b.isDirectory()) || a.name.localeCompare(b.name));
    for (const e of entries) {
      if (out.length >= limit) return;
      if (e.isDirectory()) {
        if (!SKIP.has(e.name) && !e.name.startsWith(".")) await walk(join(dir, e.name), depth + 1);
      } else if (/\.html?$/i.test(e.name)) out.push(relative(cwd, join(dir, e.name)).split("\\").join("/"));
    }
  }
  await walk(cwd, 0);
  // index.html files first, shallowest first.
  return out.sort((a, b) => Number(!/(^|\/)index\.html?$/i.test(a)) - Number(!/(^|\/)index\.html?$/i.test(b)) || a.split("/").length - b.split("/").length);
}

export class PreviewServer {
  readonly token = crypto.randomUUID().replace(/-/g, "");
  private server: ReturnType<typeof Bun.serve>;
  private watcher: FSWatcher | null = null;
  private pending = new Set<string>();
  private timer: ReturnType<typeof setTimeout> | null = null;
  cwd: string | null = null;

  constructor(private onChange: (paths: string[]) => void, port = 0) {
    this.server = Bun.serve({ hostname: "127.0.0.1", port, fetch: (req) => this.fetch(req) });
  }

  get base() {
    return `http://127.0.0.1:${this.server.port}/${this.token}/`;
  }

  url(path: string) {
    return this.base + path.replace(/^\.?\/+/, "").split("/").map(encodeURIComponent).join("/");
  }

  use(cwd: string) {
    this.cwd = cwd;
    this.watcher?.close();
    this.watcher = null;
    try {
      this.watcher = watch(cwd, { recursive: true }, (_, file) => {
        if (!file) return;
        const f = String(file).split("\\").join("/");
        if (f.split("/").some((part) => SKIP.has(part))) return;
        this.pending.add(f);
        // Editors and builds write in bursts; report once things go quiet.
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          const paths = [...this.pending];
          this.pending.clear();
          this.onChange(paths);
        }, 200);
      });
    } catch {
      // No watching on this filesystem; the panel still reloads after Maxx's own edits.
    }
  }

  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const [, tok, ...rest] = url.pathname.split("/");
    if (tok !== this.token || !this.cwd) return new Response("not found", { status: 404 });
    const path = rest.map((p) => decodeURIComponent(p)).join("/");
    if (path === "__maxx/bridge.js") return new Response(BRIDGE, { headers: { "content-type": "text/javascript; charset=utf-8", "cache-control": "no-store" } });
    let file: string;
    try {
      file = inside(this.cwd, path || ".");
    } catch {
      return new Response("outside the project", { status: 403 });
    }
    let st = await stat(file).catch(() => null);
    if (st?.isDirectory()) {
      if (!url.pathname.endsWith("/")) return Response.redirect(url.pathname + "/" + url.search, 302);
      const index = ["index.html", "index.htm"].map((f) => join(file, f)).find((f) => Bun.file(f).size > 0);
      if (!index) return this.listing(file, path);
      file = index;
      st = await stat(file).catch(() => null);
    }
    if (!st) return new Response(`${path || "/"} does not exist (yet)`, { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
    const headers = { "cache-control": "no-store" };
    if (/\.html?$/i.test(file)) {
      const html = injectBridge(await Bun.file(file).text(), `/${this.token}/__maxx/bridge.js`);
      return new Response(html, { headers: { ...headers, "content-type": "text/html; charset=utf-8" } });
    }
    const type = MIME[extname(file).toLowerCase()];
    return new Response(Bun.file(file), { headers: type ? { ...headers, "content-type": type } : headers });
  }

  private async listing(dir: string, path: string) {
    const entries = (await readdir(dir, { withFileTypes: true })).filter((e) => !SKIP.has(e.name)).sort((a, b) => Number(b.isDirectory()) - Number(a.isDirectory()) || a.name.localeCompare(b.name));
    const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
    const rows = entries.map((e) => `<li><a href="${encodeURIComponent(e.name)}${e.isDirectory() ? "/" : ""}">${esc(e.name)}${e.isDirectory() ? "/" : ""}</a></li>`).join("");
    const html = `<!doctype html><meta charset="utf-8"><title>${esc(path || "project")}</title><style>body{font:14px system-ui;margin:20px;color:#444}a{color:#d9480f}</style><h3>No index.html in /${esc(path)}</h3><ul>${rows}</ul>`;
    return new Response(injectBridge(html, `/${this.token}/__maxx/bridge.js`), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
  }

  stop() {
    this.watcher?.close();
    this.server.stop(true);
  }
}

const MIME: Record<string, string> = {
  ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".gif": "image/gif", ".webp": "image/webp", ".ico": "image/x-icon", ".wasm": "application/wasm", ".txt": "text/plain; charset=utf-8",
  ".md": "text/plain; charset=utf-8", ".mp3": "audio/mpeg", ".wav": "audio/wav", ".mp4": "video/mp4", ".woff2": "font/woff2",
};
