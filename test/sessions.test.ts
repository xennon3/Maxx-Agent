import { expect, test } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { findSession, formatList, listProjects, listSessions, loadSession, projectKey, saveSession, titleFrom } from "../src/sessions.ts";
import { Agent } from "../src/loop.ts";
import { Permissions } from "../src/permissions.ts";
import type { Message } from "../src/llm.ts";

process.env.MAXX_HOME = await mkdtemp(join(tmpdir(), "maxx-home-"));

const convo = (ask: string): Message[] => [
  { role: "system", content: "sys" },
  { role: "user", content: ask },
  { role: "assistant", content: "ok, done" },
  { role: "user", content: [{ type: "text", text: "Screenshot from android_screen:" }, { type: "image_url", image_url: { url: "data:image/jpeg;base64,AAAA" } }] },
];

test("projects are keyed by folder", () => {
  expect(projectKey("/home/l/code/notes-app")).toMatch(/^notes-app-[0-9a-f]{1,8}$/);
  expect(projectKey("/home/l/code/notes-app")).toBe(projectKey("/home/l/code/notes-app/"));
  expect(projectKey("/home/l/code/notes-app")).not.toBe(projectKey("/home/l/other/notes-app"));
});

test("sessions are saved per project, newest first, without screenshots", async () => {
  const a = await mkdtemp(join(tmpdir(), "proj-a-")), b = await mkdtemp(join(tmpdir(), "proj-b-"));
  const base = { created: new Date().toISOString(), model: "m", toolsets: [] as string[] };
  await saveSession({ ...base, id: "s1", cwd: a, history: convo("build a login screen") });
  await Bun.sleep(5);
  await saveSession({ ...base, id: "s2", cwd: a, toolsets: ["android"], history: convo("add dark mode to the settings page and make it remember the choice") });
  await saveSession({ ...base, id: "s3", cwd: b, history: convo("fix the flaky test") });

  const list = await listSessions(a);
  expect(list.map((s) => s.id)).toEqual(["s2", "s1"]);
  expect(list[0]!.title).toBe("add dark mode to the settings page and make it remember t...");
  expect(list[0]!.turns).toBe(1);
  expect(formatList(list, "s2")).toContain("[android]");

  expect((await findSession(a, "2"))!.id).toBe("s1");
  expect((await findSession(a, "login"))!.id).toBe("s1");
  expect(await findSession(a, "nope")).toBeNull();

  const saved = await loadSession(a, "s2");
  expect(JSON.stringify(saved)).not.toContain("base64");
  expect(JSON.stringify(saved!.history.at(-1)!.content)).toContain("[screenshot not saved]");

  const projects = await listProjects();
  expect(projects.map((p) => p.cwd).sort()).toEqual([a, b].sort());
});

test("a restored session keeps its turns under today's system prompt", async () => {
  const dir = await mkdtemp(join(tmpdir(), "proj-c-"));
  await Bun.write(join(dir, "MAXX.md"), "Use Kotlin.");
  const agent = await new Agent({ llm: { baseURL: "http://x/v1", model: "m" }, cwd: dir, permissions: new Permissions(dir, "ask") }, {
    token() {}, toolStart() {}, toolEnd() {}, note() {}, ask: async () => "no",
  }).init();
  await agent.restore("old-id", convo("hello"));
  expect(agent.session).toBe("old-id");
  expect(agent.history[0]!.content).toContain("Use Kotlin.");
  expect(agent.history.filter((m) => m.role === "system")).toHaveLength(1);
  expect(titleFrom(agent.history)).toBe("hello");
});

test("deleted sessions go to the trash and come back with undo", async () => {
  const { deleteSession, restoreSession } = await import("../src/sessions.ts");
  const cwd = await mkdtemp(join(tmpdir(), "proj-del-"));
  const base = { created: new Date().toISOString(), model: "m", toolsets: [] as string[] };
  await saveSession({ ...base, id: "keep", cwd, history: convo("keep me") });
  await saveSession({ ...base, id: "gone1", cwd, history: convo("first to go") });
  await saveSession({ ...base, id: "gone2", cwd, history: convo("second to go") });
  expect(await deleteSession(cwd, "gone1")).toBe(true);
  await Bun.sleep(20);
  expect(await deleteSession(cwd, "gone2")).toBe(true);
  expect(await deleteSession(cwd, "gone2")).toBe(false);
  expect(await deleteSession(cwd, "../keep")).toBe(false);
  expect((await listSessions(cwd)).map((s) => s.id)).toEqual(["keep"]);
  // Undo brings back the one deleted last, then the one before.
  expect((await restoreSession(cwd))!.id).toBe("gone2");
  expect((await restoreSession(cwd, "gone1"))!.title).toBe("first to go");
  expect(await restoreSession(cwd)).toBeNull();
  expect((await listSessions(cwd)).length).toBe(3);
});

test("a turn with an attached image is saved as a typed turn", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "proj-img-"));
  const history: Message[] = [
    { role: "system", content: "sys" },
    { role: "user", content: [{ type: "text", text: "match this design\n\n[attached image: mock.jpg]" }, { type: "image_url", image_url: { url: "data:image/jpeg;base64,AAAA" } }] },
    { role: "assistant", content: "ok" },
  ];
  await saveSession({ id: "img", cwd, created: new Date().toISOString(), model: "m", toolsets: [], history });
  const s = (await loadSession(cwd, "img"))!;
  expect(s.title).toBe("match this design");
  expect(s.turns).toBe(1);
  expect(s.history[1]!.content).toBe("match this design\n\n[attached image: mock.jpg] [image not saved]");
});
