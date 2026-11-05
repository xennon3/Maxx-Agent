import { expect, test } from "bun:test";
import { bash } from "../src/tools/bash.ts";
import { complete, STALL } from "../src/llm.ts";

// Stop must reach a running command, a command whose child keeps the pipes, and a quiet model server.

test("Stop ends a running command at once", async () => {
  const ctl = new AbortController();
  const t0 = Date.now();
  const run = bash.run({ command: "sleep 30" }, { cwd: process.cwd(), signal: ctl.signal });
  setTimeout(() => ctl.abort(), 200);
  await expect(run).rejects.toThrow("stopped");
  expect(Date.now() - t0).toBeLessThan(5000);
});

test("a command that leaves a child holding the output still returns", async () => {
  const t0 = Date.now();
  const out = String(await bash.run({ command: "(sleep 30 &) ; echo built" }, { cwd: process.cwd() }));
  expect(out).toContain("exit code: 0");
  expect(out).toContain("built");
  expect(Date.now() - t0).toBeLessThan(6000);
});

test("the timeout still ends a command", async () => {
  const out = String(await bash.run({ command: "sleep 30", timeout: 1 }, { cwd: process.cwd() }));
  expect(out).toContain("killed after 1s");
});

test("a long build keeps the end of its output, where the errors are", async () => {
  const out = String(await bash.run({ command: "seq 1 900000; echo THE-ERROR >&2; echo last-line" }, { cwd: process.cwd() }));
  expect(out).toContain("last-line");
  expect(out).toContain("THE-ERROR");
});

test("a model server that goes quiet ends the request with a clear error", async () => {
  const server = Bun.serve({ port: 0, fetch: () => new Promise<Response>(() => {}) });
  const saved = { ...STALL };
  STALL.firstMs = 300;
  try {
    const run = complete({ baseURL: `http://127.0.0.1:${server.port}/v1`, model: "quiet" }, [{ role: "user", content: "hi" }], []);
    await expect(run).rejects.toThrow(/stopped answering/);
  } finally {
    Object.assign(STALL, saved);
    server.stop(true);
  }
});

test("Stop still wins over the stall timer", async () => {
  const server = Bun.serve({ port: 0, fetch: () => new Promise<Response>(() => {}) });
  const ctl = new AbortController();
  try {
    const run = complete({ baseURL: `http://127.0.0.1:${server.port}/v1`, model: "quiet" }, [{ role: "user", content: "hi" }], [], () => {}, ctl.signal);
    setTimeout(() => ctl.abort(), 100);
    const e = (await run.catch((x) => x)) as Error;
    expect(e.name).toBe("AbortError");
  } finally {
    server.stop(true);
  }
});

// Luther's stuck run: `powershell -File monitor.ps1 | head -2`, a stream that never ends.
test("a stream piped into head is stopped by Stop, and by the timeout with a clear hint", async () => {
  const ctl = new AbortController();
  const t0 = Date.now();
  const run = bash.run({ command: "sleep 30 | head -2" }, { cwd: process.cwd(), signal: ctl.signal });
  setTimeout(() => ctl.abort(), 200);
  await expect(run).rejects.toThrow("stopped");
  expect(Date.now() - t0).toBeLessThan(5000);
  const out = String(await bash.run({ command: "sleep 30 | head -2", timeout: 1 }, { cwd: process.cwd() }));
  expect(out).toContain("killed after 1s");
  expect(out).toContain("does not stop it on Windows");
  expect(Date.now() - t0).toBeLessThan(10000);
}, 15000);

// Luther's second hang: `cd "weather-card" && python -m http.server 8765 >/dev/null 2>&1 &`.
// The shell returns at once, but the server it left behind keeps the output pipes open.
test("a server started with a trailing & does not hold the turn", async () => {
  const t0 = Date.now();
  const out = String(await bash.run({ command: "sleep 30 & echo started", background: true }, { cwd: process.cwd() }));
  expect(out).toContain("started in the background");
  expect(out).toContain("started");
  expect(Date.now() - t0).toBeLessThan(5000);
}, 15000);

test("the http.server form is taken as a server and returns", async () => {
  const t0 = Date.now();
  const out = String(await bash.run({ command: 'mkdir -p "/tmp/wc test" && cd "/tmp/wc test" && python3 -m http.server 0 &' }, { cwd: process.cwd() }));
  expect(out).toContain("background");
  expect(Date.now() - t0).toBeLessThan(6000);
}, 15000);

test("Stop reaches a server while it starts", async () => {
  const ctl = new AbortController();
  const run = bash.run({ command: "sleep 30", background: true }, { cwd: process.cwd(), signal: ctl.signal });
  setTimeout(() => ctl.abort(), 200);
  await expect(run).rejects.toThrow("stopped");
});
