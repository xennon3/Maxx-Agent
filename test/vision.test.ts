import { afterAll, expect, test } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { z } from "zod";
import { PNG } from "pngjs";
import { Agent, type AgentIO } from "../src/loop.ts";
import { Permissions } from "../src/permissions.ts";
import { defineTool } from "../src/tools/types.ts";
import { toShot } from "../src/image.ts";
import { estimateTokens } from "../src/context.ts";
import type { Vision } from "../src/vision.ts";
import { setRunner } from "../src/devices/run.ts";
import { parseKeys, desktop } from "../src/devices/windows.ts";
import { desktopClick, desktopScreenshot } from "../src/tools/desktop.ts";

// Fake server: the "main" model calls look_tool `calls` times, then answers;
// the "eyes" model describes whatever it is shown.
let calls = 0;
const requests: any[] = [];
const server = Bun.serve({
  port: 0,
  async fetch(req) {
    const body = await req.json();
    requests.push(body);
    let delta: object;
    if (body.model === "eyes") delta = { content: "A login screen with a red Log in button." };
    else if (calls-- > 0) delta = { tool_calls: [{ index: 0, id: `c${calls}`, function: { name: "look_tool", arguments: "{}" } }] };
    else delta = { content: "done" };
    return new Response(`data: ${JSON.stringify({ choices: [{ delta }] })}\n\ndata: [DONE]\n\n`, { headers: { "content-type": "text/event-stream" } });
  },
});
afterAll(() => (server.stop(), setRunner(null)));

const png = (() => {
  const p = new PNG({ width: 64, height: 64 });
  p.data.fill(200);
  return new Uint8Array(PNG.sync.write(p));
})();

const lookTool = defineTool({
  name: "look_tool",
  description: "test",
  schema: z.object({}),
  risk: "read",
  run: async () => ({ text: "screen shown", images: [toShot(png)] }),
});

const io: AgentIO = { token() {}, toolStart() {}, toolEnd() {}, note() {}, ask: async () => "yes" };
const llm = () => ({ baseURL: `http://localhost:${server.port}/v1`, model: "main" });

async function agent(vision: Vision) {
  const dir = await mkdtemp(join(tmpdir(), "maxx-vision-"));
  return new Agent({ llm: llm(), cwd: dir, permissions: await new Permissions(dir, "ask").load(), tools: [lookTool], vision }, io).init();
}

const imageMessages = (msgs: any[]) => msgs.filter((m) => Array.isArray(m.content) && m.content.some((p: any) => p.type === "image_url"));

test("native vision: screenshots follow the tool results as a user message, pruned in batches", async () => {
  const a = await agent({ mode: "native" });
  calls = 4;
  requests.length = 0;
  expect(await a.send("test the app")).toBe("done");
  const second = requests[1];
  expect(second.messages.at(-2).role).toBe("tool");
  expect(second.messages.at(-2).content).toContain("attached in the next message");
  expect(second.messages.at(-1).content[1].image_url.url).toStartWith("data:image/jpeg;base64,");
  // Three screenshots stay put (the prompt cache survives); the fourth prunes back to two.
  expect(imageMessages(requests[3].messages)).toHaveLength(3);
  expect(imageMessages(requests.at(-1).messages)).toHaveLength(2);
  expect(a.history.some((m) => Array.isArray(m.content) && JSON.stringify(m.content).includes("older screenshot removed"))).toBe(true);
});

test("proxy vision: a second model describes the screenshot for a text-only model", async () => {
  const a = await agent({ mode: "proxy", llm: { ...llm(), model: "eyes" } });
  calls = 1;
  requests.length = 0;
  await a.send("test the app");
  const eyes = requests.find((r) => r.model === "eyes");
  expect(imageMessages(eyes.messages)).toHaveLength(1);
  const main = requests.filter((r) => r.model === "main").at(-1);
  expect(imageMessages(main.messages)).toHaveLength(0);
  expect(main.messages.find((m: any) => m.role === "tool").content).toContain("red Log in button");
});

test("vision off: the model is told it cannot see", async () => {
  const a = await agent({ mode: "off" });
  calls = 1;
  await a.send("test");
  expect(a.history.find((m) => m.role === "tool")!.content).toContain("cannot see images");
});

test("images count as a flat token cost, not their base64 length", () => {
  const shot = toShot(png);
  const n = estimateTokens([{ role: "user", content: [{ type: "text", text: "hi" }, { type: "image_url", image_url: { url: "data:," + shot.base64.repeat(100) } }] }]);
  expect(n).toBeLessThan(1100);
});

test("key combos map to virtual-key codes", () => {
  expect(parseKeys("ctrl+shift+s")).toEqual([0x11, 0x10, 0x53]);
  expect(parseKeys("alt+F4")).toEqual([0x12, 0x73]);
  expect(() => parseKeys("ctrl+banana")).toThrow(/unknown key/);
});

test("desktop: PowerShell results are parsed and clicks map back to screen pixels", async () => {
  process.env.MAXX_DESKTOP_FAKE = "1";
  const actions: { action: string; args: any }[] = [];
  const screen = (() => {
    const p = new PNG({ width: 2560, height: 1440 });
    p.data.fill(30);
    return PNG.sync.write(p);
  })();
  setRunner(async (argv) => {
    const action = argv[argv.indexOf("-Action") + 1]!;
    const args = JSON.parse(Buffer.from(argv[argv.indexOf("-ArgB64") + 1]!, "base64").toString("utf8"));
    actions.push({ action, args });
    let out: unknown = "ok";
    if (action === "screenshot") {
      await Bun.write(args.path, screen);
      // Windows PowerShell turns a one-item array into a bare object.
      out = { width: 2560, height: 1440, title: "Notepad", elements: { name: "Save", type: "Button", x1: 100, y1: 40, x2: 200, y2: 80 } };
    }
    return { code: 0, stdout: new TextEncoder().encode(JSON.stringify(out)), stderr: "" };
  });
  const res = await desktopScreenshot.run({}, { cwd: "." });
  if (typeof res === "string") throw new Error(res);
  expect(res.text).toContain('[1] Button "Save" @ 75,30');
  expect(desktop.scale).toBe(2);
  await desktopClick.run({ element: 1, screenshot: false }, { cwd: "." });
  await desktopClick.run({ x: 640, y: 360, double: true, screenshot: false }, { cwd: "." });
  expect(actions.filter((a) => a.action === "click").map((a) => a.args)).toEqual([
    { x: 150, y: 60, button: "left", count: 1 },
    { x: 1280, y: 720, button: "left", count: 2 },
  ]);

  setRunner(async () => ({ code: 3, stdout: new Uint8Array(), stderr: "failsafe" }));
  await expect(desktopClick.run({ x: 1, y: 1 }, { cwd: "." })).rejects.toThrow(/STOPPED/);
});

test("proxy vision skips screenshots that actions return on their own when elements are listed", async () => {
  const glancer = defineTool({
    name: "look_tool",
    description: "test",
    schema: z.object({}),
    risk: "read",
    run: async () => ({ text: "tapped\n[1] Button \"OK\" @ 10,10", images: [toShot(png)], glance: true }),
  });
  const dir = await mkdtemp(join(tmpdir(), "maxx-vision-"));
  const a = await new Agent({ llm: llm(), cwd: dir, permissions: new Permissions(dir, "ask"), tools: [glancer], vision: { mode: "proxy", llm: { ...llm(), model: "eyes" } } }, io).init();
  calls = 1;
  requests.length = 0;
  await a.send("tap ok");
  expect(requests.some((r) => r.model === "eyes")).toBe(false);
  expect(a.history.find((m) => m.role === "tool")!.content).toContain("screenshot not described");
});
