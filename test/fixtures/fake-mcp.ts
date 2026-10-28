// A stdio MCP server for tests: one tool that echoes, after a banner line on stdout.
console.log("fake-mcp starting");
let buf = "";
const send = (m: unknown) => process.stdout.write(JSON.stringify(m) + "\n");
process.stdin.on("data", (d) => {
  buf += d;
  let nl;
  while ((nl = buf.indexOf("\n")) >= 0) {
    const m = JSON.parse(buf.slice(0, nl));
    buf = buf.slice(nl + 1);
    if (m.id === undefined) continue;
    if (m.method === "initialize") send({ jsonrpc: "2.0", id: m.id, result: { protocolVersion: m.params.protocolVersion, capabilities: { tools: {} }, serverInfo: { name: "fake", version: "1" } } });
    else if (m.method === "tools/list") send({ jsonrpc: "2.0", id: m.id, result: { tools: [{ name: "echo", description: "Echo back", inputSchema: { type: "object", properties: { text: { type: "string" } } } }] } });
    else if (m.method === "tools/call") send({ jsonrpc: "2.0", id: m.id, result: { content: [{ type: "text", text: `echo: ${m.params.arguments.text}` }] } });
    else send({ jsonrpc: "2.0", id: m.id, error: { code: -32601, message: "nope" } });
  }
});
