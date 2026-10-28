import { afterAll, expect, test } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Agent, type AgentIO } from "../src/loop.ts";
import { Permissions } from "../src/permissions.ts";
import { bash } from "../src/tools/bash.ts";
import { coach } from "../src/coach.ts";
import { fetches, loadNetwork, resolveNetwork, saveNetwork } from "../src/network.ts";

test("installs and downloads are spotted, everyday commands are not", () => {
  for (const c of [
    "pip install pandas matplotlib",
    "py -3.12 -m pip install openpyxl",
    "python3 -m pip install -r requirements.txt",
    "cd data && pip3 install seaborn",
    "uv add polars",
    "npm install chart.js",
    "npm i -D vite",
    "bun add d3",
    "yarn add plotly.js",
    "conda install scipy",
    "winget install Python.Python.3.12",
    "curl -L https://example.com/data.csv -o data.csv",
    "Invoke-WebRequest -Uri https://example.com/a.zip -OutFile a.zip",
    "git clone https://github.com/x/y",
  ]) expect(fetches(c)).not.toBeNull();
  for (const c of ["npm test", "npm run dev", "npm init -y", "pip list", "python analyze.py", "./gradlew assembleDebug", "curl http://localhost:8000/", "curl -s http://127.0.0.1:5173/api", "git status", "git push"])
    expect(fetches(c)).toBeNull();
});

test("with network off, bash refuses an install without running it, and package managers stay offline", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "maxx-net-"));
  const r = String(await bash.run({ command: "pip install pandas && touch ran" }, { cwd, network: false }));
  expect(r).toStartWith("refused: network access is off");
  expect(await Bun.file(join(cwd, "ran")).exists()).toBe(false);
  expect(String(await bash.run({ command: "echo $PIP_NO_INDEX $npm_config_offline" }, { cwd, network: false }))).toContain("1 true");
  // On (or unset, for callers outside the agent), commands run as before.
  expect(String(await bash.run({ command: "echo [$PIP_NO_INDEX]" }, { cwd, network: true }))).toContain("[]");
});

test("the coach doesn't tell the model to install when it can't", () => {
  const out = "exit code: 1\nstderr:\nTraceback (most recent call last):\nModuleNotFoundError: No module named 'pandas'";
  expect(coach("bash", { command: "python a.py" }, out, "linux").hint).toContain("pip install pandas");
  const off = coach("bash", { command: "python a.py" }, out, "linux", false).hint!;
  expect(off).toContain("network access is off");
  expect(off).not.toContain("pip install");
});

test("the setting: flag beats environment beats the saved choice, which starts off", async () => {
  const home = process.env.MAXX_HOME;
  process.env.MAXX_HOME = await mkdtemp(join(tmpdir(), "maxx-home-"));
  try {
    expect(await loadNetwork()).toBe(false);
    await saveNetwork(true);
    expect(await resolveNetwork(undefined, {})).toBe(true);
    expect(await resolveNetwork(undefined, { MAXX_NETWORK: "off" })).toBe(false);
    expect(await resolveNetwork("on", { MAXX_NETWORK: "off" })).toBe(true);
    expect(resolveNetwork("maybe", {})).rejects.toThrow("on or off");
  } finally {
    if (home === undefined) delete process.env.MAXX_HOME;
    else process.env.MAXX_HOME = home;
  }
});

// A scripted fake of LM Studio: one bash call, then a reply.
let script: object[] = [];
const requests: any[] = [];
const server = Bun.serve({
  port: 0,
  async fetch(req) {
    requests.push(await req.json());
    const r = script.shift() as { tool?: { name: string; args: object }; text?: string } | undefined;
    const delta = r?.tool
      ? { tool_calls: [{ index: 0, id: "call_1", function: { name: r.tool.name, arguments: JSON.stringify(r.tool.args) } }] }
      : { content: r?.text ?? "done" };
    return new Response(`data: ${JSON.stringify({ choices: [{ delta }] })}\n\ndata: [DONE]\n\n`, { headers: { "content-type": "text/event-stream" } });
  },
});
afterAll(() => server.stop());

test("the agent refuses installs before asking, says so in the system prompt, and can be switched on", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "maxx-net-agent-"));
  Bun.spawnSync(["git", "init", "-q"], { cwd });
  const log: string[] = [];
  const io: AgentIO = { token: () => {}, toolStart: () => {}, toolEnd: (n, r) => log.push(`end ${n}: ${r.split("\n")[0]}`), note: () => {}, ask: async (q) => (log.push(`ask ${q}`), "no") };
  const llm = { baseURL: `http://localhost:${server.port}/v1`, model: "fake" };
  // No real web or MCP servers in tests.
  const online = async () => ({ tools: [], notes: [], servers: [] });
  const agent = await new Agent({ llm, cwd, permissions: await new Permissions(cwd, "ask").load(), online }, io).init();
  expect(agent.network).toBe(false);
  expect(String(agent.history[0]!.content)).toContain("Network access is off");

  script = [{ tool: { name: "bash", args: { command: "pip install matplotlib" } } }, { text: "I used the standard library instead." }];
  await agent.send("chart my data");
  expect(log.some((l) => l.startsWith("ask"))).toBe(false);
  expect(log.some((l) => l.includes("refused: network access is off"))).toBe(true);

  await agent.setNetwork(true);
  expect(String(agent.history[0]!.content)).toContain("Network access is on");
  log.length = 0;
  script = [{ tool: { name: "bash", args: { command: "pip install matplotlib" } } }, { text: "ok" }];
  await agent.send("try again");
  // Now it goes through the normal permission prompt (answered no here, so nothing is installed).
  expect(log).toContain("ask Allow bash?");
});
