// The app's 🔌 MCP servers and ⤓ Clone dialogs: everything they ask the server
// for, in one place. Keys and tokens never go back to the page (see mask()).

import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { approveProjectServer, loadMcpConfig, MAX_TOOLS, mcpFile, mcpHub, saveMcpConfig, unmask } from "../mcp.ts";
import { cleanName, findInOtherApps, guessName, INSTALL, missing, parseServers, PRESETS, presetConfig, type ServerConfig } from "../mcp-presets.ts";
import { api, githubAuth, githubFile, loadGitHub, reposRoot, saveGitHub, whoami } from "../github.ts";
import { repoClone } from "../tools/repo.ts";
import type { Agent } from "../loop.ts";

type Deps = {
  send: (m: Record<string, unknown> & { type: string }) => void;
  agent: () => Agent | undefined;
  cwd: () => string | undefined;
  network: () => boolean;
  open: (cwd: string, toolsets: string[]) => Promise<void>;
  refresh: () => Promise<void>;
};

// "npx -y pkg --flag" → command and args, keeping "quoted words" together.
export function splitCommand(line: string): string[] {
  return [...line.matchAll(/"([^"]*)"|'([^']*)'|(\S+)/g)].map((m) => m[1] ?? m[2] ?? m[3]!);
}

// KEY=value lines (or KEY: value for headers).
export function parsePairs(text: string): Record<string, string> | undefined {
  const out: Record<string, string> = {};
  for (const line of String(text ?? "").split(/\r?\n/)) {
    const m = line.match(/^\s*([\w.-]+)\s*[=:]\s*(.*?)\s*$/);
    if (m) out[m[1]!] = m[2]!;
  }
  return Object.keys(out).length ? out : undefined;
}

export function connectHandler(d: Deps) {
  const note = (text: string) => d.send({ type: "note", text });

  async function info() {
    const { servers } = await loadMcpConfig();
    const found = findInOtherApps().filter((f) => !servers[f.name]).map((f) => ({ app: f.app, name: f.name, what: f.cfg.url ?? [f.cfg.command, ...(f.cfg.args ?? [])].join(" ") }));
    d.send({
      type: "mcp",
      servers: await mcpHub.status({ network: d.network(), cwd: d.cwd() }),
      presets: Object.entries(PRESETS).map(([id, p]) => ({ id, icon: p.icon, title: p.title, about: p.about, kind: p.kind, url: !!p.url, needs: p.needs ?? [], missing: missing(p).map((m) => INSTALL[m]), added: !!servers[id] })),
      found,
      file: mcpFile(),
      maxTools: MAX_TOOLS,
      network: d.network(),
    });
  }

  // Connect it now, so the dialog shows its tools (or why it failed) without waiting for a message.
  async function check(name: string) {
    try {
      const r = await mcpHub.test(name, d.cwd());
      note(`🔌 ${name} connected: ${r.tools} tools${r.server ? ` (${r.server})` : ""}.`);
    } catch (e) {
      note(`🔌 ${name} did not connect: ${(e as Error).message}`);
    }
    await d.agent()?.refreshTools();
    await info();
    await d.refresh();
  }

  async function githubInfo(withRepos = false) {
    const g = await loadGitHub();
    const auth = await githubAuth();
    let login: string | undefined, error: string | undefined;
    if (auth) await whoami(auth).then((w) => (login = w?.login), (e) => (error = (e as Error).message));
    const root = reposRoot(g);
    let local: { name: string; cwd: string }[] = [];
    try {
      local = readdirSync(root).filter((n) => existsSync(join(root, n, ".git"))).map((n) => ({ name: n, cwd: join(root, n) }));
    } catch {}
    let mine: { full: string; about: string; private: boolean; pushed: string }[] = [];
    if (withRepos && auth && login) {
      mine = (await api<any[]>("/user/repos?sort=pushed&per_page=40", { auth }).catch(() => [])).map((r) => ({ full: r.full_name, about: r.description ?? "", private: !!r.private, pushed: String(r.pushed_at ?? "").slice(0, 10) }));
    }
    d.send({ type: "github", signedIn: !!login, login, source: auth?.source, error, hasSaved: !!g.token, root, local, mine, gh: !!Bun.which("gh"), file: githubFile(), network: d.network() });
  }

  return async function handle(m: any): Promise<boolean> {
    switch (m.type) {
      case "mcp":
        await info();
        return true;
      case "mcpAdd": {
        const { servers } = await loadMcpConfig();
        let add: Record<string, ServerConfig> = {};
        if (m.preset) {
          const cfg = presetConfig(String(m.preset), m.keys ?? {});
          if (!cfg) throw new Error(`no preset called ${m.preset}`);
          add[String(m.preset)] = cfg;
        } else if (m.json) {
          add = parseServers(String(m.json));
          if (!Object.keys(add).length) throw new Error("no MCP server in that text: paste a {\"mcpServers\": {...}} block, or one server's {\"command\": ...} or {\"url\": ...}");
        } else if (m.found) {
          const want = new Set<string>(m.found);
          for (const f of findInOtherApps()) if (want.has(f.name) && !servers[f.name]) add[f.name] = { ...f.cfg, about: `from ${f.app}` };
        } else {
          const target = String(m.target ?? "").trim();
          if (!target) throw new Error("give the server's URL or the command that starts it");
          const cfg: ServerConfig = /^https?:\/\//.test(target) ? { url: target } : (([command, ...args]) => ({ command, args }))(splitCommand(target));
          const env = parsePairs(m.env), headers = parsePairs(m.headers);
          if (env) cfg.env = env;
          if (headers) cfg.headers = headers;
          if (m.about) cfg.about = String(m.about);
          add[cleanName(String(m.name || guessName(cfg)))] = cfg;
        }
        await saveMcpConfig({ ...servers, ...add });
        await info();
        for (const name of Object.keys(add)) void check(name);
        return true;
      }
      case "mcpUpdate": {
        const { servers } = await loadMcpConfig();
        const prev = servers[m.name];
        if (!prev) throw new Error(`no MCP server called ${m.name}`);
        const next: ServerConfig = { ...prev };
        const p = m.patch ?? {};
        if ("disabled" in p) p.disabled ? (next.disabled = true) : delete next.disabled;
        if (p.approval) (next.approval = p.approval), delete next.trust;
        if ("tools" in p) p.tools ? (next.tools = p.tools) : delete next.tools;
        if ("network" in p) next.network = !!p.network;
        if ("env" in p) next.env = parsePairs(p.env);
        if ("headers" in p) next.headers = parsePairs(p.headers);
        await saveMcpConfig({ ...servers, [m.name]: unmask(next, prev) });
        await d.agent()?.refreshTools();
        await info();
        await d.refresh();
        return true;
      }
      case "mcpRemove": {
        const { servers } = await loadMcpConfig();
        const { [m.name]: _, ...left } = servers;
        await saveMcpConfig(left);
        await d.agent()?.refreshTools();
        await info();
        await d.refresh();
        return true;
      }
      case "mcpTest":
        await check(String(m.name));
        return true;
      case "mcpApprove": {
        const cwd = d.cwd();
        if (!cwd) throw new Error("open the project first");
        await approveProjectServer(cwd, String(m.name), !!m.yes);
        if (m.yes) void check(String(m.name));
        else await info();
        return true;
      }
      case "mcpCall": {
        // The tester: run one tool by hand, as the user (no approval card: they pressed Run).
        const started = Date.now();
        try {
          const c = await mcpHub.client(String(m.server), d.cwd());
          const out = await c.callFull(String(m.tool), m.args ?? {});
          d.send({ type: "mcpResult", server: m.server, tool: m.tool, text: out.text.slice(0, 20_000), images: out.images.map((i) => `data:${i.mime};base64,${i.base64}`), ms: Date.now() - started });
        } catch (e) {
          d.send({ type: "mcpResult", server: m.server, tool: m.tool, text: `error: ${(e as Error).message}`, images: [], ms: Date.now() - started });
        }
        return true;
      }
      case "github":
        await githubInfo(!!m.repos);
        return true;
      case "githubToken": {
        const g = await loadGitHub();
        if (m.clear) await saveGitHub({ ...g, token: undefined, user: undefined });
        else {
          const token = String(m.token ?? "").trim();
          if (!token) throw new Error("paste a token first");
          const who = await whoami({ token, source: "maxx" }).catch((e) => {
            throw new Error(`GitHub did not take that token: ${(e as Error).message}`);
          });
          await saveGitHub({ ...g, token, user: who?.login });
        }
        if (m.root !== undefined) await saveGitHub({ ...(await loadGitHub()), reposRoot: String(m.root).trim() || undefined });
        await githubInfo(true);
        return true;
      }
      case "reposRoot":
        await saveGitHub({ ...(await loadGitHub()), reposRoot: String(m.root ?? "").trim().replace(/^~(?=$|[\\/])/, homedir()) || undefined });
        await githubInfo(false);
        return true;
      case "clone": {
        // The user asked in the dialog, so this runs whatever the 🌐 switch says.
        d.send({ type: "cloning", url: m.url, busy: true });
        let out: string;
        try {
          out = String(await repoClone.run({ url: String(m.url ?? ""), folder: m.folder || undefined, branch: m.branch || undefined, shallow: !!m.shallow }, { cwd: homedir(), network: true }));
        } catch (e) {
          out = `error: ${(e as Error).message}`;
        }
        const dir = out.match(/(?:into|cloned at) (.+?)(?:;|$)/m)?.[1];
        d.send({ type: "cloning", url: m.url, busy: false, ok: !out.startsWith("error") && !!dir, text: out, cwd: dir });
        if (!out.startsWith("error") && dir) {
          await d.open(dir, ["repo"]);
          note(`⤓ ${out.split("\n").slice(0, 4).join("\n")}`);
        }
        return true;
      }
    }
    return false;
  };
}
