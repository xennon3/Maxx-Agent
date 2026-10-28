import { expect, test } from "bun:test";
import { PAGE } from "../src/ui/page.ts";
import { startUI } from "../src/ui/server.ts";

test("the page's script is valid JavaScript", () => {
  const js = PAGE.split("<script>")[1]!.split("</script>")[0]!;
  expect(() => new Function(js)).not.toThrow();
});

test("the UI only answers requests that carry its token, from its own origin", async () => {
  const ui = await startUI({ baseURL: "http://127.0.0.1:9/v1", port: 0, open: false });
  try {
    const base = `http://127.0.0.1:${ui.server.port}`;
    expect((await fetch(`${base}/`)).status).toBe(403);
    expect((await fetch(`${base}/?t=wrong`)).status).toBe(403);
    expect(await (await fetch(ui.link)).text()).toContain("<title>Maxx</title>");
    const cross = await fetch(`${base}/ws?t=${ui.token}`, { headers: { origin: "https://evil.example", upgrade: "websocket", connection: "Upgrade", "sec-websocket-key": "dGhlIHNhbXBsZSBub25jZQ==", "sec-websocket-version": "13" } });
    expect(cross.status).toBe(403);

    const ws = new WebSocket(`ws://127.0.0.1:${ui.server.port}/ws?t=${ui.token}`);
    const first = await new Promise<any>((res, rej) => {
      ws.onopen = () => ws.send(JSON.stringify({ type: "hello" }));
      ws.onmessage = (e) => res(JSON.parse(String(e.data)));
      ws.onerror = rej;
    });
    expect(first.type).toBe("state");
    expect(first.toolsets.map((t: any) => t.name)).toEqual(["android", "desktop"]);
    ws.close();
  } finally {
    ui.stop();
  }
});

test("attach a file, send it, delete the session and undo", async () => {
  const { mkdtemp } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  process.env.MAXX_HOME = await mkdtemp(join(tmpdir(), "maxx-home-ui-"));
  const project = await mkdtemp(join(tmpdir(), "maxx-ui-proj-"));
  const seen: any[] = [];
  const llm = Bun.serve({
    port: 0,
    async fetch(req) {
      if (new URL(req.url).pathname.endsWith("/models")) return Response.json({ data: [{ id: "fake" }] });
      seen.push(await req.json());
      const chunk = { choices: [{ delta: { content: "It throws on line 2." } }] };
      return new Response(`data: ${JSON.stringify(chunk)}\n\ndata: [DONE]\n\n`, { headers: { "content-type": "text/event-stream" } });
    },
  });
  const ui = await startUI({ baseURL: `http://127.0.0.1:${llm.port}/v1`, port: 0, previewPort: 0, open: false, context: 16384 });
  const base = `http://127.0.0.1:${ui.server.port}`;
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
    ws.send(JSON.stringify({ type: "open", cwd: project }));
    const opened = await waitFor((m) => m.type === "state" && m.current);
    expect(opened.imageSide).toBe(1024);

    expect((await fetch(`${base}/upload?name=x`, { method: "POST", body: "x" })).status).toBe(403);
    const up = await (await fetch(`${base}/upload?t=${ui.token}&name=app.ts`, { method: "POST", body: "const a = 1;\nthrow a;" })).json();
    ws.send(JSON.stringify({ type: "send", text: "why does this fail?", files: [{ id: up.id, mode: "attach" }] }));
    const after = await waitFor((m) => m.type === "state" && m.current?.history.length === 2);
    expect(JSON.stringify(seen[0].messages)).toContain("throw a;");
    expect(after.current.history[0]).toEqual({ role: "user", text: "why does this fail?", files: ["app.ts"] });
    const session = after.current.session;
    expect(after.projects[0].sessions[0].id).toBe(session);

    // Deleting the open session leaves an empty one open, and it is not saved back.
    ws.send(JSON.stringify({ type: "delete", cwd: after.current.cwd, session, title: "why" }));
    const deleted = await waitFor((m) => m.type === "deleted");
    expect(deleted.wasOpen).toBe(true);
    const empty = await waitFor((m) => m.type === "state");
    expect(empty.projects).toEqual([]);
    expect(empty.current.history).toEqual([]);

    ws.send(JSON.stringify({ type: "undelete", cwd: after.current.cwd, session, reopen: true }));
    const back = await waitFor((m) => m.type === "state" && m.current?.session === session);
    expect(back.current.history.length).toBe(2);
  } finally {
    ws.close();
    ui.stop();
    llm.stop();
  }
});
