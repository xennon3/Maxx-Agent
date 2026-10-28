import { afterAll, expect, test } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ENDPOINTS, formatHits, formatPage, htmlToText, parseDuckHtml, parseDuckLite, passages, search, WEB_TOOLS } from "../src/web.ts";
import { loadMcpConfig, McpClient, McpHub, saveMcpConfig, slimSchema, toolName } from "../src/mcp.ts";
import { Agent, type AgentIO } from "../src/loop.ts";
import { Permissions } from "../src/permissions.ts";
import { toolSpecs } from "../src/tools/index.ts";
import { chatPrompt } from "../src/chat.ts";

process.env.MAXX_HOME = await mkdtemp(join(tmpdir(), "maxx-home-web-"));

const DDG_HTML = `<html><body>
<div class="result results_links results_links_deep result--ad ">
  <div class="links_main links_deep result__body"><h2 class="result__title"><a rel="nofollow" class="result__a" href="https://duckduckgo.com/y.js?ad_domain=ads.example&amp;u3=x">Buy Bun</a></h2></div></div>
<div class="result results_links results_links_deep web-result ">
  <div class="links_main links_deep result__body">
    <h2 class="result__title"><a rel="nofollow" class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fbun.sh%2Fblog%2Fbun%2Dv1.3&amp;rut=abc">Bun <b>v1.3</b> &amp; more</a></h2>
    <a class="result__snippet" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fbun.sh">Bun 1.3 is the <b>latest</b> release&#x27;s notes.</a>
  </div></div>
<div class="result results_links results_links_deep web-result ">
  <div class="links_main links_deep result__body">
    <h2 class="result__title"><a rel="nofollow" class="result__a" href="https://github.com/oven-sh/bun/releases">Releases · oven-sh/bun</a></h2>
  </div></div>
</body></html>`;

const DDG_LITE = `<table>
<tr><td>1.&nbsp;</td><td><a rel="nofollow" href="https://react.dev/blog" class='result-link'>React Blog</a></td></tr>
<tr><td>&nbsp;</td><td class='result-snippet'>React 19 is now <b>stable</b>.</td></tr>
<tr><td>2.&nbsp;</td><td><a rel="nofollow" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fexample.org%2Fx" class='result-link'>Example</a></td></tr>
</table>`;

test("DuckDuckGo result pages turn into titles, real URLs and snippets, without the ads", () => {
  expect(parseDuckHtml(DDG_HTML)).toEqual([
    { title: "Bun v1.3 & more", url: "https://bun.sh/blog/bun-v1.3", snippet: "Bun 1.3 is the latest release's notes." },
    { title: "Releases · oven-sh/bun", url: "https://github.com/oven-sh/bun/releases", snippet: "" },
  ]);
  expect(parseDuckLite(DDG_LITE)).toEqual([
    { title: "React Blog", url: "https://react.dev/blog", snippet: "React 19 is now stable." },
    { title: "Example", url: "https://example.org/x", snippet: "" },
  ]);
});

test("a page becomes short readable text, and find returns only the passages that matter", () => {
  const filler = Array.from({ length: 40 }, (_, i) => `<p>Paragraph ${i} about nothing in particular, just words to fill the page up.</p>`).join("");
  const html = `<html><head><title>Install Bun</title><style>.x{}</style></head><body><nav>Home Docs Blog</nav>
    <main><h1>Installation</h1>${filler}<p>To install, run <code>powershell -c "irm bun.sh/install.ps1 | iex"</code> on Windows.</p>
    <ul><li>macOS</li><li>Linux</li></ul>${filler}<script>alert(1)</script></main><footer>© 2026</footer></body></html>`;
  const page = htmlToText(html);
  expect(page.title).toBe("Install Bun");
  expect(page.text).toStartWith("# Installation");
  expect(page.text).toContain("- macOS");
  expect(page.text).not.toContain("alert");
  expect(page.text).not.toContain("Home Docs");
  const found = passages(page.text, "install windows")!;
  expect(found).toContain("irm bun.sh/install.ps1");
  expect(found).not.toContain("Paragraph 20");
  expect(found.length).toBeLessThan(600);
  const whole = formatPage("https://bun.sh/docs/installation", page);
  expect(whole).toContain("call again with start=");
  expect(whole.length).toBeLessThan(3500);
  expect(formatPage("https://x", page, "kubernetes")).toContain('nothing on this page mentions "kubernetes"');
});

const fake = Bun.serve({
  port: 0,
  async fetch(req) {
    const u = new URL(req.url);
    if (u.pathname === "/html/") return new Response("anomaly", { status: 403 });
    if (u.pathname === "/lite/") return new Response("<html>no results</html>", { headers: { "content-type": "text/html" } });
    if (u.pathname === "/w/api.php") return Response.json({ query: { search: [{ title: "Bun (software)", snippet: 'Bun is a <span class="searchmatch">JavaScript</span> runtime' }] } });
    if (u.pathname === "/wiki/Bun_(software)") return new Response("<html><title>Bun</title><body><p>Bun 1.3 was released in 2025.</p></body></html>", { headers: { "content-type": "text/html" } });
    return new Response("not found", { status: 404 });
  },
});
const base = `http://127.0.0.1:${fake.port}`;
Object.assign(ENDPOINTS, { ddgHtml: `${base}/html/`, ddgLite: `${base}/lite/`, wikipedia: base });
afterAll(() => fake.stop(true));

test("search falls through to the next engine and says which ones failed", async () => {
  const r = await search("bun runtime");
  expect(r.engine).toBe("Wikipedia");
  expect(r.hits[0]).toEqual({ title: "Bun (software)", url: `${base}/wiki/Bun_(software)`, snippet: "Bun is a JavaScript runtime" });
  expect(r.failed[0]).toContain("DuckDuckGo (");
  const text = formatHits("bun runtime", r);
  expect(text).toStartWith("[1] Bun (software)");
  expect(text).toContain("web_fetch");
});

// A chat turn: the model searches, reads the page, then answers with sources.
test("with network on, chat mode can search the web and is told to cite sources; off, it can't", async () => {
  const requests: any[] = [];
  const replies = [
    { tool_calls: [{ index: 0, id: "a", function: { name: "web_search", arguments: '{"query":"bun latest version"}' } }] },
    { tool_calls: [{ index: 0, id: "b", function: { name: "web_fetch", arguments: JSON.stringify({ url: `${base}/wiki/Bun_(software)`, find: "released" }) } }] },
    { content: "Bun 1.3 (2025).\nSources: " + base },
  ];
  const llm = Bun.serve({
    port: 0,
    async fetch(req) {
      requests.push(await req.json());
      const delta = replies[requests.length - 1]!;
      return new Response(`data: ${JSON.stringify({ choices: [{ delta }] })}\n\ndata: [DONE]\n\n`, { headers: { "content-type": "text/event-stream" } });
    },
  });
  const results: string[] = [];
  const io: AgentIO = { token() {}, toolStart() {}, toolEnd: (_, r) => results.push(r), ask: async () => "yes", note() {} };
  const cwd = await mkdtemp(join(tmpdir(), "maxx-chat-web-"));
  const online = async () => ({ tools: WEB_TOOLS, notes: [], servers: [] });
  try {
    const agent = await new Agent({ llm: { baseURL: `http://127.0.0.1:${llm.port}/v1`, model: "fake" }, cwd, permissions: new Permissions(cwd, "ask"), chat: true, plan: false, memory: false, fixTries: 0, network: true, online }, io).init();
    expect(await agent.send("what is the latest bun?")).toContain("Sources:");
    expect(requests[0].tools.map((t: any) => t.function.name)).toEqual(["web_search", "web_fetch"]);
    expect(requests[0].messages[0].content).toContain("Sources:");
    expect(results[0]).toContain("[1] Bun (software)");
    expect(results[1]).toContain("Bun 1.3 was released in 2025.");

    await agent.setNetwork(false);
    expect(agent.history[0]!.content).toContain("turning on 🌐 Network");
    expect(agent.history[0]!.content).not.toContain("web_search");
  } finally {
    llm.stop(true);
  }
});

test("the lookup prompt keeps chat small", () => {
  expect(chatPrompt(new Date(), "x".repeat(10)).length).toBeLessThan(2000);
});

test("MCP: a stdio server's tools become model tools, banners on stdout are skipped", async () => {
  const c = new McpClient("fake", { command: process.execPath, args: [join(import.meta.dir, "fixtures", "fake-mcp.ts")] });
  try {
    await c.connect(10_000);
    expect((await c.listTools()).map((t) => t.name)).toEqual(["echo"]);
    expect(await c.call("echo", { text: "hi" })).toBe("echo: hi");
  } finally {
    c.close();
  }
});

test("MCP: a Streamable HTTP server answering with SSE, a session id, and long docs cut short", async () => {
  const seen: { method: string; session: string | null }[] = [];
  const srv = Bun.serve({
    port: 0,
    async fetch(req) {
      const m = (await req.json()) as any;
      seen.push({ method: m.method, session: req.headers.get("mcp-session-id") });
      if (m.id === undefined) return new Response(null, { status: 202 });
      const result =
        m.method === "initialize" ? { protocolVersion: "2025-06-18", capabilities: {}, serverInfo: { name: "docs", version: "1" } }
        : m.method === "tools/list" ? { tools: [{ name: "get-library-docs", description: "Fetch docs. " + "Very long. ".repeat(100), inputSchema: { $schema: "x", type: "object", properties: { id: { type: "string", description: "d ".repeat(200) } } } }] }
        : { content: [{ type: "text", text: "docs ".repeat(3000) }] };
      const body = `event: message\ndata: ${JSON.stringify({ jsonrpc: "2.0", id: m.id, result })}\n\n`;
      return new Response(body, { headers: { "content-type": "text/event-stream", "mcp-session-id": "s1" } });
    },
  });
  try {
    await saveMcpConfig({ docs: { url: `http://127.0.0.1:${srv.port}/mcp`, trust: true }, off: { url: "http://x", disabled: true } });
    expect(Object.keys((await loadMcpConfig()).servers)).toEqual(["docs", "off"]);
    const hub = new McpHub();
    const { tools, notes } = await hub.tools();
    expect(notes).toEqual([]);
    expect(tools.map((t) => t.name)).toEqual(["docs_get-library-docs"]);
    expect(tools[0]!.risk).toBe("read");
    expect(tools[0]!.description.length).toBeLessThanOrEqual(401);
    const spec = toolSpecs(tools)[0]!.function.parameters as any;
    expect(spec.$schema).toBeUndefined();
    expect(spec.properties.id.description.length).toBeLessThanOrEqual(161);
    const out = String(await tools[0]!.run({ id: "/oven-sh/bun" }, { cwd: "." }));
    expect(out).toContain("cut at 4000");
    expect(out.length).toBeLessThan(4200);
    expect(seen.map((s) => s.method)).toEqual(["initialize", "notifications/initialized", "tools/list", "tools/call"]);
    expect(seen.slice(1).every((s) => s.session === "s1")).toBe(true);
    hub.reset();
  } finally {
    srv.stop(true);
  }
});

test("MCP: an unreachable server is a note, not a crash; untrusted tools ask first", async () => {
  await saveMcpConfig({ gone: { url: "http://127.0.0.1:9/mcp" }, local: { command: process.execPath, args: [join(import.meta.dir, "fixtures", "fake-mcp.ts")] } });
  const hub = new McpHub();
  const { tools, notes } = await hub.tools();
  expect(notes[0]).toContain("MCP server gone is unavailable");
  expect(tools.map((t) => [t.name, t.risk])).toEqual([["local_echo", "exec"]]);
  hub.reset();
  expect(toolName("my server", "do.thing")).toBe("my_server_do_thing");
  expect(slimSchema({ a: [{ description: "x" }] })).toEqual({ a: [{ description: "x" }] });
});

test("no mcp.json means the free context7 docs server", async () => {
  process.env.MAXX_HOME = await mkdtemp(join(tmpdir(), "maxx-home-web2-"));
  const c = await loadMcpConfig();
  expect(c.saved).toBe(false);
  expect(c.servers.context7?.url).toBe("https://mcp.context7.com/mcp");
});
