import { expect, test } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Agent, type AgentIO } from "../src/loop.ts";
import { Permissions } from "../src/permissions.ts";
import { chatPrompt } from "../src/chat.ts";
import { BREVITY_PROMPT, loadBrevity, parseBrevity, resolveBrevity, saveBrevity } from "../src/brevity.ts";

test("brevity is brief until changed, saved between runs, and the flag wins", async () => {
  const home = process.env.MAXX_HOME;
  process.env.MAXX_HOME = await mkdtemp(join(tmpdir(), "maxx-brevity-home-"));
  try {
    expect(await loadBrevity()).toBe("brief");
    await saveBrevity("detailed");
    expect(await loadBrevity()).toBe("detailed");
    expect(await resolveBrevity(undefined, {})).toBe("detailed");
    expect(await resolveBrevity(undefined, { MAXX_BREVITY: "normal" })).toBe("normal");
    expect(await resolveBrevity("b", { MAXX_BREVITY: "normal" })).toBe("brief");
    await expect(resolveBrevity("chatty", {})).rejects.toThrow("brief, normal or detailed");
    expect(parseBrevity("Detailed")).toBe("detailed");
  } finally {
    if (home === undefined) delete process.env.MAXX_HOME;
    else process.env.MAXX_HOME = home;
  }
});

test("the brevity line goes into the agent and chat prompts, and switches in place", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "maxx-brevity-"));
  const io: AgentIO = { token: () => {}, toolStart: () => {}, toolEnd: () => {}, note: () => {}, ask: async () => "no" };
  const llm = { baseURL: "http://localhost:1/v1", model: "fake" };
  const online = async () => ({ tools: [], notes: [], servers: [] });
  const agent = await new Agent({ llm, cwd, permissions: await new Permissions(cwd, "ask").load(), online }, io).init();
  expect(agent.brevity).toBe("brief");
  expect(String(agent.history[0]!.content)).toContain(BREVITY_PROMPT.brief);
  await agent.setBrevity("normal");
  expect(String(agent.history[0]!.content)).not.toContain("Be brief");
  await agent.setBrevity("detailed");
  expect(String(agent.history[0]!.content)).toContain("Be thorough");
  expect(agent.history.filter((m) => m.role === "system")).toHaveLength(1);

  const chat = await new Agent({ llm, cwd, permissions: await new Permissions(cwd, "ask").load(), online, chat: true, brevity: "brief" }, io).init();
  expect(String(chat.history[0]!.content)).toEndWith(BREVITY_PROMPT.brief);
  expect(chatPrompt()).not.toContain("Be brief");
});
