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
