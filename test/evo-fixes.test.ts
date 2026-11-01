import { expect, test } from "bun:test";
import { mkdtemp, readFile, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Checkpoints } from "../src/checkpoint.ts";
import { PROBES, probe, fakeLookup } from "../src/doctor.ts";
import { startUI } from "../src/ui/server.ts";

// Bugs found testing the combined build on the EVO-X3.

const sse = (delta: any) =>
  new Response(`data: ${JSON.stringify({ choices: [{ delta }] })}\n\ndata: ${JSON.stringify({ choices: [{ delta: {}, finish_reason: "stop" }] })}\n\ndata: [DONE]\n\n`, { headers: { "content-type": "text/event-stream" } });
const call = (name: string, args: unknown) => sse({ tool_calls: [{ index: 0, id: "c" + Math.random().toString(36).slice(2, 8), type: "function", function: { name, arguments: JSON.stringify(args) } }] });

// Hides git (and everything else) from Bun.which and Bun.spawn for the duration.
async function withoutGit<T>(fn: () => Promise<T>): Promise<T> {
  const path = process.env.PATH;
  process.env.PATH = await mkdtemp(join(tmpdir(), "maxx-nogit-"));
  try {
    return await fn();
  } finally {
    process.env.PATH = path;
  }
}

test("-p runs a turn before the REPL's declarations below it (no 'files.length' crash)", async () => {
  const src = await readFile(join(import.meta.dir, "..", "src", "cli.ts"), "utf8");
  const oneShot = src.indexOf("if (values.prompt || values.agent || values.crew)");
  expect(oneShot).toBeGreaterThan(0);
  // Everything turn() and goal() read at module level must be declared above the -p path,
  // because the compiled maxx.exe hoists a later `let` as undefined.
  expect(src.indexOf("let staged")).toBeGreaterThan(0);
  expect(src.indexOf("let staged")).toBeLessThan(oneShot);
  expect(src.slice(oneShot).match(/^(let|var) /m)).toBeNull();
});

test("without git, snapshots are off with a reason instead of throwing", async () => {
  const dir = await mkdtemp(join(tmpdir(), "maxx-cp-"));
  await withoutGit(async () => {
    const cp = new Checkpoints(dir, "s1");
    expect(await cp.snapshot("before edit_file")).toBeNull();
    expect(cp.off).toContain("git is not installed");
    expect((await cp.rewind("abc")).ok).toBe(false);
    expect(await cp.changed("abc")).toEqual([]);
  });
});

test("the app finishes an edit and says why snapshots are off when git is missing", async () => {
  process.env.MAXX_HOME = await mkdtemp(join(tmpdir(), "maxx-home-evo-"));
  const project = await mkdtemp(join(tmpdir(), "maxx-evo-proj-"));
  await mkdir(join(project, "src"));
  await writeFile(join(project, "src", "app.ts"), "const port = 3000;\n");
  const llm = Bun.serve({
    port: 0,
    async fetch(req) {
      if (new URL(req.url).pathname.endsWith("/models")) return Response.json({ data: [{ id: "first" }, { id: "wanted" }] });
      const body: any = await req.json();
      const tools = body.messages.filter((m: any) => m.role === "tool").length;
      return tools ? sse({ content: `Done with ${body.model}.` }) : call("edit_file", { path: "src/app.ts", old_string: "const port = 3000;", new_string: "const port = 8080;" });
    },
  });
  const ui = await startUI({ baseURL: `http://127.0.0.1:${llm.port}/v1`, model: "wanted", port: 0, previewPort: 0, open: false, context: 16384 });
  const ws = new WebSocket(`ws://127.0.0.1:${ui.server.port}/ws?t=${ui.token}`);
  const inbox: any[] = [];
  const waitFor = async (pred: (m: any) => boolean) => {
    for (let i = 0; i < 250; i++) {
      const hit = inbox.find(pred);
      if (hit) return (inbox.splice(inbox.indexOf(hit), 1), hit);
      await Bun.sleep(20);
    }
    throw new Error("timed out; got " + inbox.map((m) => m.type).join(","));
  };
  try {
    await new Promise((res) => ((ws.onopen = res), (ws.onmessage = (e) => inbox.push(JSON.parse(String(e.data))))));
    ws.send(JSON.stringify({ type: "hello" }));
    // $MAXX_MODEL / --model, not the first model the server lists.
    expect((await waitFor((m) => m.type === "state")).defaultModel).toBe("wanted");
    ws.send(JSON.stringify({ type: "open", cwd: project }));
    expect((await waitFor((m) => m.type === "state" && m.current)).current.model).toBe("wanted");
    ws.send(JSON.stringify({ type: "settings", mode: "auto-edit" }));
    await waitFor((m) => m.type === "state" && m.current?.mode === "auto-edit");

    await withoutGit(async () => {
      ws.send(JSON.stringify({ type: "send", text: "use port 8080" }));
      const end = await waitFor((m) => m.type === "toolEnd");
      expect(end.result).toContain("8080");
      expect((await waitFor((m) => m.type === "done")).text).toContain("wanted");
    });
    expect(inbox.some((m) => JSON.stringify(m).includes("git is not installed"))).toBe(true);
    expect(await readFile(join(project, "src", "app.ts"), "utf8")).toBe("const port = 8080;\n");
  } finally {
    ws.close();
    ui.stop();
    llm.stop();
  }
});

test("doctor's edit probe accepts reading the file first, but not a wrong edit", async () => {
  let script: ((tools: number) => Response)[] = [];
  const llm = Bun.serve({
    port: 0,
    async fetch(req) {
      const body: any = await req.json();
      return script[body.messages.filter((m: any) => m.role === "tool").length]!(0);
    },
  });
  const cfg = { baseURL: `http://127.0.0.1:${llm.port}/v1`, model: "m" };
  const edit = PROBES.find((p) => p.tool === "edit_file")!;
  try {
    script = [() => call("read_file", { path: "src/app.ts" }), () => call("edit_file", { path: "src/app.ts", old_string: "const port = 3000;", new_string: "const port = 8080;" })];
    expect(await probe(cfg, edit)).toEqual({ pass: true, verdict: "pass (after read_file)" });

    script = [() => call("edit_file", { path: "src/app.ts", old_string: "const port = 3000;", new_string: "const port = 8080;" })];
    expect((await probe(cfg, edit)).pass).toBe(true);

    script = [() => call("read_file", { path: "src/app.ts" }), () => call("edit_file", { path: "src/app.ts", old_string: "const port = 3000;", new_string: "const port = 9090;" })];
    expect((await probe(cfg, edit)).pass).toBe(false);

    // Looking forever is still a fail.
    script = [() => call("read_file", { path: "src/app.ts" }), () => call("list_files", {}), () => call("read_file", { path: "src/app.ts" })];
    expect((await probe(cfg, edit)).verdict).toContain("called read_file (after read_file, list_files), expected edit_file");
  } finally {
    llm.stop();
  }
  expect(fakeLookup("read_file", { path: "./src/app.ts" })).toContain("    2  const port = 3000;");
  expect(fakeLookup("grep", { pattern: "TODO" })).toContain("src/app.ts:1:");
});
