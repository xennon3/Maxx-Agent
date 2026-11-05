// `maxx mcp ...` to manage MCP servers, and `maxx doctor web` to check that
// looking things up works from this machine.

import { approveProjectServer, loadMcpConfig, mcpFile, McpClient, mcpHub, PRESETS, presetConfig, saveMcpConfig, type ServerConfig } from "./mcp.ts";
import { approvalOf, cleanName, findInOtherApps, INSTALL, missing, projectServers } from "./mcp-presets.ts";
import { githubAuth, githubFile, loadGitHub, NO_AUTH, reposRoot, saveGitHub, whoami } from "./github.ts";
import { readPage, search } from "./web.ts";

export async function mcpCommand(args: string[], log = console.log, cwd = process.cwd()): Promise<number> {
  const [sub, name, ...rest] = args;
  const { servers, saved } = await loadMcpConfig();
  if (!sub || sub === "list" || sub === "ls") {
    const names = Object.keys(servers);
    log(names.length ? `MCP servers (${saved ? mcpFile() : "defaults; no " + mcpFile() + " yet"}):` : `No MCP servers in ${mcpFile()}.`);
    for (const n of names) log(`  ${n.padEnd(18)} ${describe(servers[n]!)}`);
    const project = projectServers(cwd);
    if (project.length) {
      const status = await mcpHub.status({ cwd });
      log(`\nThis project brings (${project[0]!.file}):`);
      for (const p of project) {
        const st = status.find((x) => x.source === "project" && x.name === p.name)?.state;
        log(`  ${p.name.padEnd(18)} ${describe(p.cfg)} · ${st === "unapproved" ? "waiting for your OK: maxx mcp approve " + p.name : st === "denied" ? "you said no" : "approved"}`);
      }
    }
    log(`\nStarters you can add with \`maxx mcp add <name>\`:`);
    for (const [n, p] of Object.entries(PRESETS)) {
      const miss = missing(p);
      log(`  ${p.icon} ${n.padEnd(18)} ${p.about}${servers[n] ? "  (added)" : ""}${p.needs?.some((x) => !x.optional) ? "  (needs a key)" : ""}${miss.length ? `  (needs ${miss.join(", ")})` : ""}`);
    }
    const found = findInOtherApps().filter((f) => !servers[f.name]);
    if (found.length) log(`\nIn your other apps (\`maxx mcp import\` copies them): ${found.map((f) => `${f.name} (${f.app})`).join(", ")}`);
    log(`\nOr any other server:  maxx mcp add <name> <url>   or   maxx mcp add <name> -- <command> [args...]`);
    log(`Also: maxx mcp test <name> · on|off <name> · approval <name> smart|ask|auto · approve|deny <name> (a project's server) · import`);
    log(`Servers at a URL are offered while network access is on (🌐 in the app, /network on); programs run either way.`);
    return 0;
  }
  if (sub === "add") {
    if (!name) return log("usage: maxx mcp add <preset> [KEY=value...] | <name> <url> | <name> -- <command> [args...]"), 1;
    const cmd = rest[0] === "--" ? rest.slice(1) : rest;
    const keys = Object.fromEntries(cmd.filter((x) => /^[\w-]+=/.test(x)).map((x) => [x.slice(0, x.indexOf("=")), x.slice(x.indexOf("=") + 1)]));
    const isPreset = PRESETS[name] && (!cmd.length || Object.keys(keys).length === cmd.length);
    const cfg: ServerConfig | undefined = isPreset ? presetConfig(name, keys) : !cmd.length ? undefined : /^https?:\/\//.test(cmd[0]!) ? { url: cmd[0] } : { command: cmd[0], args: cmd.slice(1) };
    if (!cfg) return log(`${name} is not a preset (${Object.keys(PRESETS).join(", ")}); give its URL or command too`), 1;
    const miss = PRESETS[name] && isPreset ? missing(PRESETS[name]) : [];
    await saveMcpConfig({ ...servers, [cleanName(name)]: cfg });
    log(`added ${cleanName(name)}: ${describe(cfg)}`);
    for (const m of miss) log(`  it needs ${INSTALL[m]}`);
    log(`Check it with \`maxx mcp test ${cleanName(name)}\`.`);
    return 0;
  }
  if (sub === "rm" || sub === "remove") {
    if (!name || !servers[name]) return log(`no MCP server named ${name ?? "(none)"}`), 1;
    const { [name]: _, ...left } = servers;
    await saveMcpConfig(left);
    log(`removed ${name}`);
    return 0;
  }
  if (sub === "on" || sub === "off" || sub === "approval") {
    if (!name || !servers[name]) return log(`no MCP server named ${name ?? "(none)"}`), 1;
    const c = { ...servers[name]! };
    if (sub === "approval") {
      if (!["smart", "ask", "auto"].includes(rest[0] ?? "")) return log("usage: maxx mcp approval <name> smart|ask|auto"), 1;
      c.approval = rest[0] as ServerConfig["approval"];
      delete c.trust;
    } else if (sub === "on") delete c.disabled;
    else c.disabled = true;
    await saveMcpConfig({ ...servers, [name]: c });
    log(`${name}: ${describe(c)}`);
    return 0;
  }
  if (sub === "approve" || sub === "deny") {
    if (!name) return log(`usage: maxx mcp ${sub} <name>`), 1;
    await approveProjectServer(cwd, name, sub === "approve");
    log(sub === "approve" ? `approved ${name} for ${cwd}; it starts with the next message (again after any change to its config)` : `${name} stays off in ${cwd}`);
    return 0;
  }
  if (sub === "import") {
    const found = findInOtherApps().filter((f) => !servers[f.name]);
    if (!found.length) return log("Nothing new to import from Claude Desktop, Claude Code, LM Studio, Cursor, Windsurf or VS Code."), 0;
    const add = Object.fromEntries(found.filter((f) => !name || f.name === name).map((f) => [f.name, { ...f.cfg, about: `from ${f.app}` }]));
    await saveMcpConfig({ ...servers, ...add });
    for (const f of found) if (add[f.name]) log(`  imported ${f.name} from ${f.app}: ${describe(f.cfg)}`);
    return 0;
  }
  if (sub === "test") {
    if (!name) return log("usage: maxx mcp test <name>"), 1;
    try {
      const c = await mcpHub.client(name, cwd);
      const st = (await mcpHub.status({ cwd })).find((x) => x.label === name || x.name === name);
      log(`ok  ${name}${c.server?.name ? ` (${c.server.name})` : ""}: ${st?.tools.length ?? 0} tools`);
      for (const t of st?.tools ?? []) log(`  ${t.on ? "•" : " "} ${t.name.padEnd(28)} ${t.readOnly ? "read-only " : ""}${t.danger ? "⚠ " : ""}${t.description.slice(0, 90)}`);
      return 0;
    } catch (e) {
      log(`FAIL  ${name}: ${(e as Error).message}`);
      return 1;
    } finally {
      mcpHub.reset();
    }
  }
  log("usage: maxx mcp [list] | add <name> [url | -- command args...] | rm <name> | test <name> | on|off <name> | approval <name> smart|ask|auto | approve|deny <name> | import");
  return 1;
}

// `maxx github login <token> | logout | status`
export async function githubCommand(args: string[], log = console.log): Promise<number> {
  const [sub, value] = args;
  if (sub === "login") {
    if (!value) return log("usage: maxx github login <token>   (make one at github.com/settings/tokens)"), 1;
    const who = await whoami({ token: value, source: "maxx" }).catch((e) => (log(`that token did not work: ${(e as Error).message}`), null));
    if (!who) return 1;
    await saveGitHub({ ...(await loadGitHub()), token: value, user: who.login });
    log(`signed in to GitHub as ${who.login}. The token is in ${githubFile()} and only goes to GitHub.`);
    return 0;
  }
  if (sub === "logout") {
    const { token: _, user: __, ...rest } = await loadGitHub();
    await saveGitHub(rest);
    log("forgot the saved GitHub token");
    return 0;
  }
  const auth = await githubAuth();
  if (!auth) return log(NO_AUTH), 1;
  const who = await whoami(auth).catch((e) => (log(`GitHub sign-in (${auth.source}) did not work: ${(e as Error).message}`), null));
  if (!who) return 1;
  log(`GitHub: ${who.login}${who.name ? ` (${who.name})` : ""}, from ${auth.source === "gh" ? "the GitHub CLI" : auth.source === "env" ? "$GH_TOKEN / $GITHUB_TOKEN" : githubFile()}. Repositories clone into ${reposRoot(await loadGitHub())}.`);
  return 0;
}

const describe = (c: ServerConfig) => `${c.url ?? [c.command, ...(c.args ?? [])].join(" ")} · ${approvalOf(c) === "auto" ? "never asks" : approvalOf(c) === "ask" ? "asks every call" : "smart approval"}${c.disabled ? " · off" : ""}${c.tools ? ` · ${c.tools.length} tools picked` : ""}`;

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
