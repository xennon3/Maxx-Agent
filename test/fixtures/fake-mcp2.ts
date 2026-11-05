// A richer stdio MCP server for tests: tools with safety annotations, one that
// returns a picture, one that asks Maxx for its roots, and as many filler tools
// as $FAKE_TOOLS says.
let buf = "";
let nextId = 1000;
const waiting = new Map<number, (r: any) => void>();
const send = (m: unknown) => process.stdout.write(JSON.stringify(m) + "\n");
const PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
const tools = [
  { name: "read_notes", description: "Read the notes", annotations: { readOnlyHint: true }, inputSchema: { type: "object", properties: {} } },
  { name: "wipe_notes", description: "Erase every note", annotations: { destructiveHint: true }, inputSchema: { type: "object", properties: {} } },
  { name: "delete_note", description: "Remove one note", inputSchema: { type: "object", properties: { id: { type: "string" } } } },
  { name: "snapshot", description: "A picture", annotations: { readOnlyHint: true }, inputSchema: { type: "object", properties: {} } },
  { name: "whereami", description: "Which folder Maxx works in", annotations: { readOnlyHint: true }, inputSchema: { type: "object", properties: {} } },
  ...Array.from({ length: Number(process.env.FAKE_TOOLS ?? 0) }, (_, i) => ({ name: `filler_${i}`, description: `Filler tool number ${i}`, annotations: { readOnlyHint: true }, inputSchema: { type: "object", properties: { n: { type: "number" } } } })),
];
process.stdin.on("data", (d) => {
  buf += d;
  let nl;
  while ((nl = buf.indexOf("\n")) >= 0) {
    const m = JSON.parse(buf.slice(0, nl));
    buf = buf.slice(nl + 1);
    if (m.id !== undefined && !m.method) { waiting.get(m.id)?.(m.result); continue; }
    if (m.id === undefined) continue;
    if (m.method === "initialize") send({ jsonrpc: "2.0", id: m.id, result: { protocolVersion: m.params.protocolVersion, capabilities: { tools: {} }, serverInfo: { name: "notes", version: "2.1" }, instructions: "Use read_notes first." } });
    else if (m.method === "tools/list") send({ jsonrpc: "2.0", id: m.id, result: { tools } });
    else if (m.method === "tools/call") {
      const name = m.params.name;
      if (name === "snapshot") send({ jsonrpc: "2.0", id: m.id, result: { content: [{ type: "text", text: "here it is" }, { type: "image", data: PNG, mimeType: "image/png" }] } });
      else if (name === "whereami") {
        const id = nextId++;
        waiting.set(id, (r) => send({ jsonrpc: "2.0", id: m.id, result: { content: [{ type: "text", text: `roots: ${r.roots.map((x: any) => x.uri).join(", ")}` }] } }));
        send({ jsonrpc: "2.0", id, method: "roots/list" });
      } else send({ jsonrpc: "2.0", id: m.id, result: { content: [{ type: "text", text: `${name} ran with ${JSON.stringify(m.params.arguments)}` }] } });
    } else send({ jsonrpc: "2.0", id: m.id, error: { code: -32601, message: "nope" } });
  }
});
export {};
