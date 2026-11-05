import { expect, test } from "bun:test";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { approveProjectServer, mask, McpHub, saveMcpConfig, unmask, MAX_TOOLS } from "../src/mcp.ts";
import { expand, findInOtherApps, guessName, parseServers, presetConfig, PRESETS, projectServers } from "../src/mcp-presets.ts";
import { Permissions } from "../src/permissions.ts";
import { riskOf } from "../src/tools/types.ts";
import { splitCommand, parsePairs } from "../src/ui/connect.ts";

process.env.MAXX_HOME = await mkdtemp(join(tmpdir(), "maxx-home-connect-"));
const FAKE = join(import.meta.dir, "fixtures", "fake-mcp2.ts");
const notes = (extra: Record<string, unknown> = {}) => ({ command: process.execPath, args: [FAKE], ...extra });

test("MCP: the server's safety hints decide what asks, and auto-run still asks for destructive tools", async () => {
  await saveMcpConfig({ notes: notes() });
  const hub = new McpHub();
  try {
    const { tools, servers } = await hub.tools({ network: false });
    expect(servers).toEqual(["notes"]);
    const t = (n: string) => tools.find((x) => x.name === `notes_${n}`)!;
    expect(t("read_notes").risk).toBe("read");
    expect(t("wipe_notes").risk).toBe("exec");
    const yolo = new Permissions(process.env.MAXX_HOME!, "yolo");
    expect(yolo.needsPrompt(t("read_notes"), {})).toBe(false);
    expect(yolo.needsPrompt(t("wipe_notes"), {})).toBe(true);
    expect(yolo.risky(t("wipe_notes"), {})).toContain("destructive");
    // No hint, but the name says it deletes.
    expect(yolo.risky(t("delete_note"), { id: "1" })).toContain("delete_note");
    const ask = new Permissions(process.env.MAXX_HOME!, "ask");
    expect(ask.needsPrompt(t("delete_note"), {})).toBe(true);
    expect(ask.needsPrompt(t("read_notes"), {})).toBe(false);
    // Pictures come back for the vision model.
    const shot = await t("snapshot").run({}, { cwd: "." });
    expect(typeof shot === "object" && shot.images?.[0]?.mime).toBe("image/png");
  } finally {
    hub.reset();
  }
});

test("MCP: approval ask makes every call ask, even on auto-run; auto never asks", async () => {
  const hub = new McpHub();
  try {
    await saveMcpConfig({ careful: notes({ approval: "ask" }), easy: notes({ approval: "auto" }) });
    const { tools } = await hub.tools({ network: false });
    const yolo = new Permissions(process.env.MAXX_HOME!, "yolo");
    expect(yolo.needsPrompt(tools.find((x) => x.name === "careful_read_notes")!, {})).toBe(true);
    expect(tools.find((x) => x.name === "easy_wipe_notes")!.risk).toBe("read");
  } finally {
    hub.reset();
  }
});

test("MCP: past the first tools, the rest wait behind mcp_more", async () => {
  const hub = new McpHub();
  try {
    await saveMcpConfig({ big: notes({ env: { FAKE_TOOLS: "15" } }) });
    const { tools } = await hub.tools({ network: false });
    expect(tools.length).toBe(MAX_TOOLS);
    const more = tools.at(-1)!;
    expect(more.name).toBe("mcp_more");
    expect(String(await more.run({ action: "list", find: "number 14" }, { cwd: "." }))).toContain("big_filler_14");
    expect(String(await more.run({ action: "call", tool: "big_filler_14", args: { n: 2 } }, { cwd: "." }))).toBe('filler_14 ran with {"n":2}');
    expect(riskOf(more, { action: "list" })).toBe("read");
    expect(riskOf(more, { action: "call", tool: "big_filler_13" })).toBe("read");
  } finally {
    hub.reset();
  }
});

test("MCP: servers at a URL wait for network; programs run either way; roots point at the project", async () => {
  const hub = new McpHub();
  const cwd = await mkdtemp(join(tmpdir(), "maxx-roots-"));
  try {
    await saveMcpConfig({ web: { url: "http://127.0.0.1:9/mcp" }, local: notes() });
    const off = await hub.tools({ network: false, cwd });
    expect(off.notes.join()).not.toContain("web");
    expect(off.servers).toEqual(["local"]);
    const st = await hub.status({ network: false, cwd });
    expect(st.find((s) => s.name === "web")!.state).toBe("offline");
    expect(st.find((s) => s.name === "local")!.tools.length).toBe(5);
    const where = off.tools.find((t) => t.name === "local_whereami")!;
    expect(String(await where.run({}, { cwd }))).toBe(`roots: ${pathToFileURL(cwd).href}`);
    const on = await hub.tools({ network: true, cwd, wait: 5000 });
    expect(on.notes.join()).toContain("MCP server web is unavailable");
  } finally {
    hub.reset();
  }
});

test("MCP: a project's .mcp.json waits for the user's OK, and asks again when it changes", async () => {
  await saveMcpConfig({});
  const hub = new McpHub();
  const cwd = await mkdtemp(join(tmpdir(), "maxx-proj-mcp-"));
  try {
    await writeFile(join(cwd, ".mcp.json"), JSON.stringify({ mcpServers: { notes: notes() } }));
    let r = await hub.tools({ network: false, cwd });
    expect(r.tools).toEqual([]);
    expect(r.notes.join()).toContain("this project brings MCP server notes");
    expect((await hub.status({ cwd }))[0]!.state).toBe("unapproved");
    await approveProjectServer(cwd, "notes", true);
    r = await hub.tools({ network: false, cwd });
    expect(r.servers).toEqual(["notes"]);
    // Someone edits the file: the old OK no longer covers it.
    await writeFile(join(cwd, ".mcp.json"), JSON.stringify({ mcpServers: { notes: notes({ env: { SNEAKY: "1" } }) } }));
    r = await hub.tools({ network: false, cwd });
    expect(r.tools).toEqual([]);
    await approveProjectServer(cwd, "notes", false);
    expect((await hub.status({ cwd }))[0]!.state).toBe("denied");
  } finally {
    hub.reset();
  }
});

test("MCP configs from other apps: Claude Desktop, VS Code (comments, servers, type), a single server, and LM Studio/Cursor files", async () => {
  expect(parseServers(JSON.stringify({ mcpServers: { "My Fetch": { command: "uvx", args: ["mcp-server-fetch"], env: { A: 1 } } } }))).toEqual({ "my-fetch": { command: "uvx", args: ["mcp-server-fetch"], env: { A: "1" } } });
  const vscode = `{
    // my servers
    "inputs": [],
    "servers": { "gh": { "type": "http", "url": "https://api.githubcopilot.com/mcp/", "headers": { "Authorization": "Bearer \${input:tok}" } }, },
  }`;
  expect(parseServers(vscode).gh!.url).toBe("https://api.githubcopilot.com/mcp/");
  const one = parseServers(JSON.stringify({ command: "npx", args: ["-y", "@modelcontextprotocol/server-memory"] }));
  expect(Object.keys(one)).toEqual(["memory"]);
  expect(guessName({ url: "https://mcp.context7.com/mcp" })).toBe("context7");
  const home = await mkdtemp(join(tmpdir(), "maxx-apps-"));
  await mkdir(join(home, ".lmstudio"), { recursive: true });
  await mkdir(join(home, ".cursor"), { recursive: true });
  await writeFile(join(home, ".lmstudio", "mcp.json"), JSON.stringify({ mcpServers: { blender: { command: "uvx", args: ["blender-mcp"] } } }));
  await writeFile(join(home, ".cursor", "mcp.json"), JSON.stringify({ mcpServers: { linear: { url: "https://mcp.linear.app/mcp" } } }));
  await writeFile(join(home, ".claude.json"), JSON.stringify({ numStartups: 4, mcpServers: { sentry: { type: "http", url: "https://mcp.sentry.dev/mcp" } } }));
  const found = findInOtherApps(home, { APPDATA: join(home, "nope") });
  expect(found.map((f) => `${f.app}:${f.name}`).sort()).toEqual(["Claude Code:sentry", "Cursor:linear", "LM Studio:blender"]);
});

test("presets fill in keys, ${VAR} comes from the environment, and the page never sees a key", () => {
  const gh = presetConfig("github", { Authorization: "ghp_abc123" })!;
  expect(gh.headers).toEqual({ Authorization: "Bearer ghp_abc123" });
  expect(presetConfig("github", { Authorization: "Bearer x" })!.headers!.Authorization).toBe("Bearer x");
  expect(presetConfig("memory")!.env!.MEMORY_FILE_PATH).toContain("${MAXX_HOME}");
  expect(expand("${MAXX_HOME}/m.jsonl", { MAXX_HOME: "/h" })).toBe("/h/m.jsonl");
  expect(expand("${env:TOKEN}-${MISSING:-dflt}", { TOKEN: "t" })).toBe("t-dflt");
  for (const p of Object.values(PRESETS)) expect(!!(p.url || p.command)).toBe(true);
  const m = mask({ headers: { Authorization: "Bearer supersecretvalue1234" }, env: { MODE: "fast", API_KEY: "k-123456789" } });
  expect(m.headers!.Authorization).toBe("••••1234");
  expect(m.env).toEqual({ MODE: "fast", API_KEY: "••••6789" });
  expect(unmask(m, { headers: { Authorization: "Bearer supersecretvalue1234" }, env: { API_KEY: "k-123456789" } }).headers!.Authorization).toBe("Bearer supersecretvalue1234");
  expect(splitCommand('npx -y "@scope/pkg" --dir "C:\\My Files"')).toEqual(["npx", "-y", "@scope/pkg", "--dir", "C:\\My Files"]);
  expect(parsePairs("A=1\nAuthorization: Bearer x\n\n")).toEqual({ A: "1", Authorization: "Bearer x" });
  expect(projectServers("/definitely/not/here")).toEqual([]);
});

test("the agent: a server added mid-session joins on the next message, and a repo message brings the repo tools", async () => {
  const { Agent } = await import("../src/loop.ts");
  const { mcpHub } = await import("../src/mcp.ts");
  const requests: any[] = [];
  const llm = Bun.serve({
    port: 0,
    async fetch(req) {
      requests.push(await req.json());
      return new Response(`data: ${JSON.stringify({ choices: [{ delta: { content: "ok" } }] })}\n\ndata: [DONE]\n\n`, { headers: { "content-type": "text/event-stream" } });
    },
  });
  const cwd = await mkdtemp(join(tmpdir(), "maxx-agent-mcp-"));
  Bun.spawnSync(["git", "init", "-q"], { cwd });
  const notesSeen: string[] = [];
  const io = { token: () => {}, toolStart: () => {}, toolEnd: () => {}, note: (t: string) => notesSeen.push(t), ask: async () => "no" as const };
  try {
    await saveMcpConfig({});
    const agent = await new Agent({ llm: { baseURL: `http://127.0.0.1:${llm.port}/v1`, model: "m" }, cwd, permissions: new Permissions(cwd, "ask"), plan: false, memory: false, fixTries: 0, learn: false, mapTokens: 0 }, io).init();
    expect(agent.toolNames.some((n) => n.startsWith("notes_"))).toBe(false);
    await saveMcpConfig({ notes: notes() });
    await agent.send("hello");
    expect(agent.toolNames).toContain("notes_read_notes");
    expect(requests.at(-1).tools.map((t: any) => t.function.name)).toContain("notes_wipe_notes");
    expect(String(agent.history[0]!.content)).toContain("MCP servers: notes");
    await agent.send("clone xennon3/maxx-agent and add a test");
    expect(agent.toolsets).toContain("repo");
    expect(agent.toolNames).toContain("repo_clone");
    expect(notesSeen.join()).toContain("added the 🐙 repo tools");
  } finally {
    llm.stop(true);
    mcpHub.reset();
  }
});
