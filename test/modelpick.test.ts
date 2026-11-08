import { expect, test } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chooseModel, lastModel, listModels, rememberModel } from "../src/modelpick.ts";
import { startUI } from "../src/ui/server.ts";

const L = (ids: string[], loaded: string[] = []) => ({ ids, loaded, ok: true });

test("a new session starts on the loaded model, not the first one listed", () => {
  expect(chooseModel(L(["never-used", "qwen", "deepseek"], ["qwen"]), "deepseek", "never-used")).toBe("qwen");
  // Several loaded: the last pick among them.
  expect(chooseModel(L(["a", "b", "c"], ["b", "c"]), "c")).toBe("c");
  expect(chooseModel(L(["a", "b", "c"], ["b", "c"]), "a")).toBe("b");
  // Nothing loaded (or the server won't say): the last pick, then $MAXX_MODEL, then the first.
  expect(chooseModel(L(["a", "b", "c"]), "c", "b")).toBe("c");
  expect(chooseModel(L(["a", "b", "c"]), "gone", "b")).toBe("b");
  expect(chooseModel(L(["a", "b", "c"]), "gone", "gone-too")).toBe("a");
  // No list at all: what was asked for.
  expect(chooseModel({ ids: [], loaded: [], ok: false }, "c", "b")).toBe("c");
  expect(chooseModel({ ids: [], loaded: [], ok: false }, null, null)).toBeUndefined();
});

function fakeLMStudio(loaded: { v: string }) {
  const ids = ["aaa-never-used", "qwen-27b", "deepseek-flash", "nomic-embed"];
  return Bun.serve({
    port: 0,
    fetch(req) {
      const p = new URL(req.url).pathname;
      if (p === "/v1/models") return Response.json({ data: ids.map((id) => ({ id, owned_by: "organization_owner" })) });
      if (p === "/api/v0/models") return Response.json({ data: ids.map((id) => ({ id, type: /embed/.test(id) ? "embeddings" : "llm", state: id === loaded.v ? "loaded" : "not-loaded" })) });
      return new Response("nope", { status: 404 });
    },
  });
}

test("listModels reads LM Studio's loaded state and drops embedding models", async () => {
  const loaded = { v: "deepseek-flash" };
  const srv = fakeLMStudio(loaded);
  try {
    const l = await listModels(`http://127.0.0.1:${srv.port}/v1`);
    expect(l).toEqual({ ids: ["aaa-never-used", "qwen-27b", "deepseek-flash"], loaded: ["deepseek-flash"], ok: true });
  } finally {
    srv.stop(true);
  }
});

test("the picker shows the loaded model, ⟳ picks up a swap, and a pick is remembered", async () => {
  process.env.MAXX_HOME = await mkdtemp(join(tmpdir(), "maxx-home-pick-"));
  const project = await mkdtemp(join(tmpdir(), "maxx-pick-proj-"));
  const loaded = { v: "qwen-27b" };
  const llm = fakeLMStudio(loaded);
  const ui = await startUI({ baseURL: `http://127.0.0.1:${llm.port}/v1`, port: 0, previewPort: 0, open: false, context: 16384 });
  const ws = new WebSocket(`ws://127.0.0.1:${ui.server.port}/ws?t=${ui.token}`);
  const inbox: any[] = [];
  const waitFor = async (pred: (m: any) => boolean) => {
    for (let i = 0; i < 300; i++) {
      const hit = inbox.find(pred);
      if (hit) return (inbox.splice(inbox.indexOf(hit), 1), hit);
      await Bun.sleep(20);
    }
    throw new Error("timed out; got " + inbox.map((m) => m.type).join(","));
  };
  try {
    await new Promise((res) => ((ws.onopen = res), (ws.onmessage = (e) => inbox.push(JSON.parse(String(e.data))))));
    ws.send(JSON.stringify({ type: "models" }));
    await waitFor((m) => m.type === "modelsRefreshed");
    const first = await waitFor((m) => m.type === "state");
    expect(first.defaultModel).toBe("qwen-27b");
    expect(first.loadedModels).toEqual(["qwen-27b"]);

    // Luther loads another model in LM Studio, then presses ⟳.
    loaded.v = "deepseek-flash";
    ws.send(JSON.stringify({ type: "models" }));
    const done = await waitFor((m) => m.type === "modelsRefreshed");
    expect(done).toMatchObject({ ok: true, count: 3, loaded: ["deepseek-flash"] });
    const fresh = inbox.filter((m) => m.type === "state").at(-1);
    expect(fresh.defaultModel).toBe("deepseek-flash");

    // Picked with no session open: saved, and the next session starts on it.
    loaded.v = "none";
    ws.send(JSON.stringify({ type: "settings", model: "aaa-never-used" }));
    await Bun.sleep(100);
    expect(await lastModel()).toBe("aaa-never-used");
    ws.send(JSON.stringify({ type: "models" }));
    await waitFor((m) => m.type === "modelsRefreshed");
    ws.send(JSON.stringify({ type: "open", cwd: project }));
    const opened = await waitFor((m) => m.type === "state" && m.current);
    expect(opened.current.model).toBe("aaa-never-used");

    // Switching in a session remembers the new one too.
    ws.send(JSON.stringify({ type: "settings", model: "qwen-27b" }));
    await waitFor((m) => m.type === "state" && m.current?.model === "qwen-27b");
    expect(await lastModel()).toBe("qwen-27b");
  } finally {
    ws.close();
    ui.stop();
    llm.stop(true);
  }
}, 20000);

test("rememberModel ignores blanks", async () => {
  process.env.MAXX_HOME = await mkdtemp(join(tmpdir(), "maxx-home-pick2-"));
  await rememberModel("");
  expect(await lastModel()).toBeNull();
});
