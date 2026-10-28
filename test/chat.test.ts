import { expect, test } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chatPrompt } from "../src/chat.ts";
import { PAGE } from "../src/ui/page.ts";
import { visualKind } from "../src/ui/visuals-page.ts";
import { startUI } from "../src/ui/server.ts";

test("the chat prompt teaches the three visual blocks and stays small", () => {
  const p = chatPrompt();
  for (const lang of ["```chart", "```mermaid", "```html"]) expect(p).toContain(lang);
  expect(p).toContain("no tools");
  // ~4 characters a token: well under 500 tokens of a 16K context.
  expect(p.length).toBeLessThan(2000);
});

test("the page carries the visuals script without breaking out of its script tag", () => {
  const js = PAGE.split("<script>")[1]!.split("</script>")[0]!;
  expect(js).toContain("const visuals =");
  expect(PAGE.match(/<script>/g)!.length).toBe(1);
});

test("chat mode sends no tools, uses the chat prompt and lists its sessions apart from projects", async () => {
  process.env.MAXX_HOME = await mkdtemp(join(tmpdir(), "maxx-home-chat-"));
  const seen: any[] = [];
  const llm = Bun.serve({
    port: 0,
    async fetch(req) {
      if (new URL(req.url).pathname.endsWith("/models")) return Response.json({ data: [{ id: "fake" }] });
      seen.push(await req.json());
      const chunk = { choices: [{ delta: { content: 'Here:\n```chart\n{"type":"bar","data":{"labels":["a"],"datasets":[{"data":[1]}]}}\n```' } }] };
      return new Response(`data: ${JSON.stringify(chunk)}\n\ndata: [DONE]\n\n`, { headers: { "content-type": "text/event-stream" } });
    },
  });
  const ui = await startUI({ baseURL: `http://127.0.0.1:${llm.port}/v1`, port: 0, previewPort: 0, open: false, context: 16384 });
  const ws = new WebSocket(`ws://127.0.0.1:${ui.server.port}/ws?t=${ui.token}`);
  const inbox: any[] = [];
  const waitFor = async (pred: (m: any) => boolean) => {
    for (let i = 0; i < 200; i++) {
      const hit = inbox.find(pred);
      if (hit) return (inbox.splice(inbox.indexOf(hit), 1), hit);
      await Bun.sleep(20);
    }
    throw new Error("timed out; got " + inbox.map((m) => m.type).join(","));
  };
  try {
    await new Promise((res) => ((ws.onopen = res), (ws.onmessage = (e) => inbox.push(JSON.parse(String(e.data))))));
    ws.send(JSON.stringify({ type: "chat" }));
    const opened = await waitFor((m) => m.type === "state" && m.current);
    expect(opened.current.chat).toBe(true);
    expect(opened.current.toolsets).toEqual([]);

    ws.send(JSON.stringify({ type: "send", text: "chart something" }));
    const after = await waitFor((m) => m.type === "state" && m.current?.history.length === 2);
    expect(seen[0].tools).toBeUndefined();
    expect(seen[0].messages[0].content).toContain("```mermaid");
    expect(after.current.history[1].text).toContain("```chart");
    expect(after.chat.sessions.map((s: any) => s.id)).toEqual([after.current.session]);
    expect(after.projects).toEqual([]);

    // Templates belong to projects.
    ws.send(JSON.stringify({ type: "template", id: "webapp" }));
    expect((await waitFor((m) => m.type === "error")).text).toContain("project");

    // The bundled libraries are served behind the token, for offline drawing.
    const base = `http://127.0.0.1:${ui.server.port}`;
    expect((await fetch(`${base}/vendor/chart.js`)).status).toBe(403);
    const chart = await fetch(`${base}/vendor/chart.js?t=${ui.token}`);
    expect(chart.status).toBe(200);
    expect((await chart.text()).length).toBeGreaterThan(100_000);
    expect((await fetch(`${base}/vendor/mermaid.js?t=${ui.token}`)).status).toBe(200);
    expect((await fetch(`${base}/vendor/nope.js?t=${ui.token}`)).status).toBe(404);
  } finally {
    ws.close();
    ui.stop();
    llm.stop();
  }
});

test("a Chart.js config in a json block, or an unlabelled diagram, still draws", () => {
  const pie = '{\n  "type": "pie",\n  "data": {\n    "labels": ["CPU", "GPU"],\n    "datasets": [{ "data": [25, 30] }]\n  }\n}';
  expect(visualKind("json", pie)).toBe("chart");
  expect(visualKind("", pie)).toBe("chart");
  expect(visualKind("chart", pie)).toBe("chart");
  expect(visualKind("json", '{ "name": "maxx", "version": "1.0" }')).toBeUndefined();
  expect(visualKind("bash", "./main -m model.gguf")).toBeUndefined();
  expect(visualKind("", "flowchart TD\n  A --> B")).toBe("mermaid");
  expect(visualKind("Mermaid", "graph LR\n  A --> B")).toBe("mermaid");
  // The page runs the same function.
  const js = PAGE.split("<script>")[1]!.split("</script>")[0]!;
  expect(js).toContain("function visualKind(");
  expect(js).toContain("visualKind(m[1], m[2])");
});
