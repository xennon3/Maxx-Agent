import { expect, test } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { cancelAllRequests, openRequests, trackRequest } from "../src/inflight.ts";
import { complete } from "../src/llm.ts";
import { startUI } from "../src/ui/server.ts";

// A model server that starts answering and then goes quiet, the way a slow
// prompt or a stuck model looks. It notes when Maxx hangs up.
function quietServer() {
  const s = { open: 0, hungUp: 0 };
  const srv = Bun.serve({
    port: 0,
    idleTimeout: 0,
    fetch(req) {
      if (new URL(req.url).pathname.endsWith("/models")) return Response.json({ data: [{ id: "slow" }] });
      s.open++;
      req.signal.addEventListener("abort", () => (s.open--, s.hungUp++));
      return new Response(
        new ReadableStream({
          start(c) {
            c.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ choices: [{ delta: { content: "Thinking" } }] })}\n\n`));
          },
        }),
        { headers: { "content-type": "text/event-stream" } },
      );
    },
  });
  return { srv, s, baseURL: `http://127.0.0.1:${srv.port}/v1` };
}

const until = async (f: () => boolean, ms = 4000) => {
  for (let t = 0; t < ms && !f(); t += 20) await Bun.sleep(20);
  return f();
};

test("every model request is tracked, and cancelAllRequests ends them on the server too", async () => {
  const { srv, s, baseURL } = quietServer();
  try {
    const p = complete({ baseURL, model: "slow" }, [{ role: "user", content: "hi" }], [], () => {}).catch((e) => e);
    expect(await until(() => s.open === 1)).toBe(true);
    expect(openRequests().map((r) => r.model)).toEqual(["slow"]);
    expect(cancelAllRequests()).toBe(1);
    expect((await p).name).toBe("AbortError");
    expect(await until(() => s.hungUp === 1)).toBe(true);
    expect(openRequests()).toEqual([]);
  } finally {
    srv.stop(true);
  }
});

test("trackRequest's release forgets the request", () => {
  const release = trackRequest(new AbortController(), "m");
  expect(openRequests().length).toBe(1);
  release();
  expect(cancelAllRequests()).toBe(0);
});

test("closing the last window stops the turn and hangs up on the model", async () => {
  process.env.MAXX_HOME = await mkdtemp(join(tmpdir(), "maxx-home-orphan-"));
  process.env.MAXX_ORPHAN_MS = "150";
  const project = await mkdtemp(join(tmpdir(), "maxx-orphan-proj-"));
  const { srv, s, baseURL } = quietServer();
  const ui = await startUI({ baseURL, port: 0, previewPort: 0, open: false, context: 16384 });
  try {
    const ws = new WebSocket(`ws://127.0.0.1:${ui.server.port}/ws?t=${ui.token}`);
    const inbox: any[] = [];
    await new Promise((res) => ((ws.onopen = res), (ws.onmessage = (e) => inbox.push(JSON.parse(String(e.data))))));
    ws.send(JSON.stringify({ type: "open", cwd: project }));
    expect(await until(() => inbox.some((m) => m.type === "state" && m.current))).toBe(true);
    ws.send(JSON.stringify({ type: "send", text: "hello" }));
    expect(await until(() => s.open === 1)).toBe(true);
    ws.close();
    expect(await until(() => s.hungUp === 1)).toBe(true);
    expect(openRequests()).toEqual([]);
  } finally {
    delete process.env.MAXX_ORPHAN_MS;
    ui.stop();
    srv.stop(true);
  }
}, 15000);

test("the header's cancel button ends requests even when no turn is running", async () => {
  process.env.MAXX_HOME = await mkdtemp(join(tmpdir(), "maxx-home-cancel-"));
  const { srv, s, baseURL } = quietServer();
  const ui = await startUI({ baseURL, port: 0, previewPort: 0, open: false, context: 16384 });
  try {
    const ws = new WebSocket(`ws://127.0.0.1:${ui.server.port}/ws?t=${ui.token}`);
    const inbox: any[] = [];
    await new Promise((res) => ((ws.onopen = res), (ws.onmessage = (e) => inbox.push(JSON.parse(String(e.data))))));
    // A request outside any turn, the kind Stop used to miss.
    const p = complete({ baseURL, model: "slow" }, [{ role: "user", content: "hi" }], [], () => {}).catch((e) => e);
    expect(await until(() => inbox.some((m) => m.type === "requests" && m.open === 1))).toBe(true);
    ws.send(JSON.stringify({ type: "cancelRequests" }));
    expect((await p).name).toBe("AbortError");
    expect(await until(() => s.hungUp === 1)).toBe(true);
    expect(await until(() => inbox.some((m) => m.type === "requests" && m.open === 0))).toBe(true);
    ws.close();
  } finally {
    ui.stop();
    srv.stop(true);
  }
}, 15000);

test("a stopped app leaves no timer that cancels other requests later", async () => {
  process.env.MAXX_HOME = await mkdtemp(join(tmpdir(), "maxx-home-stopped-"));
  process.env.MAXX_ORPHAN_MS = "100";
  const ui = await startUI({ baseURL: "http://127.0.0.1:9/v1", port: 0, previewPort: 0, open: false, context: 16384 });
  const ws = new WebSocket(`ws://127.0.0.1:${ui.server.port}/ws?t=${ui.token}`);
  await new Promise((res) => (ws.onopen = res));
  // stop() closes the window's socket itself; that close must not arm the orphan timer.
  ui.stop();
  await Bun.sleep(50);
  const ctl = new AbortController();
  const release = trackRequest(ctl, "someone else's");
  try {
    await Bun.sleep(300);
    expect(ctl.signal.aborted).toBe(false);
  } finally {
    release();
    delete process.env.MAXX_ORPHAN_MS;
  }
});
