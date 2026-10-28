// `maxx mcp ...` to manage MCP servers, and `maxx doctor web` to check that
// looking things up works from this machine.

import { loadMcpConfig, mcpFile, McpClient, PRESETS, presetConfig, saveMcpConfig, type ServerConfig } from "./mcp.ts";
import { readPage, search } from "./web.ts";

export async function mcpCommand(args: string[], log = console.log): Promise<number> {
  const [sub, name, ...rest] = args;
  const { servers, saved } = await loadMcpConfig();
  if (!sub || sub === "list" || sub === "ls") {
    const names = Object.keys(servers);
    log(names.length ? `MCP servers (${saved ? mcpFile() : "defaults; no " + mcpFile() + " yet"}):` : `No MCP servers in ${mcpFile()}.`);
    for (const n of names) log(`  ${n.padEnd(16)} ${describe(servers[n]!)}`);
    log(`\nFree ones you can add with \`maxx mcp add <name>\` (no key, nothing to install):`);
    for (const [n, p] of Object.entries(PRESETS)) log(`  ${n.padEnd(16)} ${p.about}${servers[n] ? "  (added)" : ""}`);
    log(`\nOr any other server:  maxx mcp add <name> <url>   or   maxx mcp add <name> -- <command> [args...]`);
    log(`MCP tools are offered only while network access is on (🌐 in the app, /network on in the terminal).`);
    return 0;
  }
  if (sub === "add") {
    if (!name) return log("usage: maxx mcp add <preset> | <name> <url> | <name> -- <command> [args...]"), 1;
    const cmd = rest[0] === "--" ? rest.slice(1) : rest;
    const cfg: ServerConfig | undefined = !cmd.length ? presetConfig(name) : /^https?:\/\//.test(cmd[0]!) ? { url: cmd[0] } : { command: cmd[0], args: cmd.slice(1) };
    if (!cfg) return log(`${name} is not a preset (${Object.keys(PRESETS).join(", ")}); give its URL or command too`), 1;
    await saveMcpConfig({ ...servers, [name]: cfg });
    log(`added ${name}: ${describe(cfg)}\nCheck it with \`maxx doctor web\`. Mark read-only servers "trust": true in ${mcpFile()} to skip the approval prompt.`);
    return 0;
  }
  if (sub === "rm" || sub === "remove") {
    if (!name || !servers[name]) return log(`no MCP server named ${name ?? "(none)"}`), 1;
    const { [name]: _, ...left } = servers;
    await saveMcpConfig(left);
    log(`removed ${name}`);
    return 0;
  }
  log("usage: maxx mcp [list] | add <name> [url | -- command args...] | rm <name>");
  return 1;
}

const describe = (c: ServerConfig) => `${c.url ?? [c.command, ...(c.args ?? [])].join(" ")}${c.trust ? " · trusted" : ""}${c.disabled ? " · disabled" : ""}`;

export async function doctorWeb(log = console.log): Promise<boolean> {
  let ok = true;
  const q = "Bun JavaScript runtime latest release";
  log(`Searching for "${q}"...`);
  const r = await search(q);
  if (r.hits.length) log(`  ok  ${r.engine}: ${r.hits.length} results, first ${r.hits[0]!.url}`);
  else (ok = false), log(`  FAIL  no results${r.failed.length ? `: ${r.failed.join("; ")}` : ""}`);
  for (const f of r.hits.length ? r.failed : []) log(`  (skipped ${f})`);
  if (r.hits[0]) {
    try {
      const page = await readPage(r.hits[0].url);
      log(`  ok  read the first result: ${page.text.length} characters of text`);
    } catch (e) {
      log(`  warn  could not read the first result: ${(e as Error).message}`);
    }
  }
  const { servers } = await loadMcpConfig();
  for (const [name, cfg] of Object.entries(servers)) {
    if (cfg.disabled) continue;
    const c = new McpClient(name, cfg);
    try {
      await c.connect();
      const tools = await c.listTools();
      log(`  ok  MCP ${name}: ${tools.map((t) => t.name).join(", ") || "no tools"}`);
    } catch (e) {
      ok = false;
      log(`  FAIL  MCP ${name}: ${(e as Error).message}`);
    } finally {
      c.close();
    }
  }
  return ok;
}
