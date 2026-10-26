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
