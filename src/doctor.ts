import { complete, toWire, type LLMConfig, type Message } from "./llm.ts";
import { toolSpecs, findTool } from "./tools/index.ts";
import { drawMarks, toShot } from "./image.ts";
import { imagePart } from "./vision.ts";
import * as A from "./devices/adb.ts";
import * as W from "./devices/windows.ts";

// Canned tool-call probes: does this model + template + server produce real,
// valid tool calls? Run it whenever you switch models or update LM Studio.
export const PROBES = [
  { ask: "Show me the contents of package.json.", tool: "read_file", check: (a: any) => /package\.json$/.test(a.path) },
  { ask: "Find every place the word TODO appears in the src folder.", tool: "grep", check: (a: any) => /TODO/.test(a.pattern) },
  { ask: "Run the test suite with `bun test`.", tool: "bash", check: (a: any) => /bun test/.test(a.command) },
  { ask: "In src/app.ts, change the line `const port = 3000;` to `const port = 8080;`.", tool: "edit_file", check: (a: any) => /3000/.test(a.old_string) && /8080/.test(a.new_string) },
];

// A careful model looks before it acts (reading src/app.ts before editing it is
// what the agent loop wants), so a probe answers up to LOOKS look-ups from this
// pretend project and judges the call that follows.
const LOOKS = 2;
const LOOKUP_TOOLS = new Set(["read_file", "list_files", "grep"]);
const FAKE: Record<string, string> = {
  "package.json": '{\n  "name": "demo",\n  "scripts": { "test": "bun test" }\n}',
  "src/app.ts": '// TODO: read the port from the environment\nconst port = 3000;\n\nBun.serve({ port, fetch: () => new Response("hi") });',
};
const numbered = (t: string) => t.split("\n").map((l, i) => `${String(i + 1).padStart(5)}  ${l}`).join("\n");

export function fakeLookup(name: string, args: any): string {
  const path = String(args?.path ?? ".").replace(/^\.\//, "").replace(/\\/g, "/");
  if (name === "read_file") {
    const hit = Object.keys(FAKE).find((f) => f === path || path.endsWith("/" + f));
    return hit ? numbered(FAKE[hit]!) : `error: ${path} does not exist`;
  }
  if (name === "list_files") return Object.keys(FAKE).join("\n");
  let re: RegExp;
  try {
    re = new RegExp(String(args?.pattern ?? ""));
  } catch {
    return "error: invalid pattern";
  }
  const hits = Object.entries(FAKE).flatMap(([f, t]) => t.split("\n").flatMap((l, i) => (re.test(l) ? [`${f}:${i + 1}:${l}`] : [])));
  return hits.join("\n") || "no matches";
}

export async function probe(llm: LLMConfig, p: (typeof PROBES)[number], specs = toolSpecs()): Promise<{ pass: boolean; verdict: string }> {
  const messages: Message[] = [
    { role: "system", content: "You are a coding agent. Use the provided tools to act; do not explain." },
    { role: "user", content: p.ask },
  ];
  const looked: string[] = [];
  for (;;) {
    const res = await complete(llm, messages, specs);
    const call = res.toolCalls[0];
    const first = looked.length ? ` (after ${looked.join(", ")})` : "";
    if (!call) return { pass: false, verdict: `FAIL  no tool call${first} (replied: ${res.content.slice(0, 80).replace(/\n/g, " ")})` };
    let args: unknown;
    try {
      args = JSON.parse(call.arguments || "{}");
    } catch {
      return { pass: false, verdict: `FAIL  invalid arguments ${call.arguments}` };
    }
    if (call.name !== p.tool && LOOKUP_TOOLS.has(call.name) && looked.length < LOOKS) {
      looked.push(call.name);
      messages.push({ role: "assistant", content: res.content || null, tool_calls: toWire([call]) });
      messages.push({ role: "tool", tool_call_id: call.id, content: fakeLookup(call.name, args) });
      continue;
    }
    if (call.name !== p.tool) return { pass: false, verdict: `FAIL  called ${call.name}${first}, expected ${p.tool}` };
    const parsed = findTool(call.name)!.schema.safeParse(args);
    if (!parsed.success) return { pass: false, verdict: `FAIL  invalid arguments ${call.arguments}` };
    if (!p.check(parsed.data)) return { pass: false, verdict: `FAIL  unexpected arguments ${call.arguments}` };
    return { pass: true, verdict: `pass${first}${res.rescued ? " (rescued from text)" : ""}` };
  }
}

export async function doctor(llm: LLMConfig, log = console.log): Promise<boolean> {
  log(`Probing ${llm.model} at ${llm.baseURL}\n`);
  const specs = toolSpecs();
  let passed = 0;
  for (const p of PROBES) {
    const started = performance.now();
    try {
      const { pass, verdict } = await probe(llm, p, specs);
      if (pass) passed++;
      log(`  ${p.tool.padEnd(10)} ${verdict}  ${((performance.now() - started) / 1000).toFixed(1)}s`);
    } catch (e) {
      log(`  ${p.tool.padEnd(10)} ERROR ${(e as Error).message}`);
    }
  }
  log(`\n${passed}/${PROBES.length} probes passed.`);
  return passed === PROBES.length;
}

// `maxx doctor android|desktop|vision`: check the pieces the screen tools need.
export async function doctorDevices(what: string, llm: LLMConfig, visionModel?: string, log = console.log): Promise<boolean> {
  if (what === "vision") return doctorVision(visionModel ? { ...llm, model: visionModel } : llm, log);
  if (what === "desktop") {
    if (process.platform !== "win32") return (log("desktop tools need Windows"), false);
    try {
      const l = await W.look();
      log(`screenshot ok: ${l.shot.width}x${l.shot.height} (scale ${l.shot.scale.toFixed(2)}), ${W.desktop.elements.length} elements in ${JSON.stringify(l.title)}`);
      return true;
    } catch (e) {
      return (log(`FAIL ${(e as Error).message}`), false);
    }
  }
  const adbPath = A.findAdb();
  log(`adb      ${adbPath ?? "MISSING: install Android platform-tools or set ANDROID_HOME"}`);
  const java = Bun.which("java") ?? (process.env.JAVA_HOME ? `${process.env.JAVA_HOME} (JAVA_HOME)` : null);
  log(`java     ${java ?? "missing: Gradle builds need a JDK 17+ (Android Studio bundles one; set JAVA_HOME to it)"}`);
  log(`sdk      ${process.env.ANDROID_HOME ?? process.env.ANDROID_SDK_ROOT ?? "ANDROID_HOME not set (Gradle reads it, or local.properties sdk.dir)"}`);
  if (!adbPath) return false;
  try {
    const list = await A.devices();
    if (!list.length) return (log("devices  none: enable USB debugging, or Wireless debugging and use android_connect"), false);
    for (const d of list) log(`device   ${d.serial} ${d.state}${d.model ? " " + d.model : ""}`);
    const ready = list.filter((d) => d.state === "device");
    if (ready.length !== 1) return (log("set MAXX_ANDROID_SERIAL to pick a device"), ready.length > 0);
    const l = await A.look();
    log(`screen   ok: ${l.shot.width}x${l.shot.height}, ${A.phone.elements.length} elements found`);
    return true;
  } catch (e) {
    return (log(`FAIL ${(e as Error).message}`), false);
  }
}

// Draw a numbered box and ask the model to read the number back.
async function doctorVision(llm: LLMConfig, log: (s: string) => void): Promise<boolean> {
  const n = 10 + Math.floor(Math.random() * 89);
  const img = { width: 320, height: 200, data: new Uint8Array(320 * 200 * 4).fill(255) };
  drawMarks(img, [{ n, bounds: { x1: 60, y1: 50, x2: 260, y2: 150 } }], 1, 6);
  const shot = toShot(img);
  log(`Showing ${llm.model} a box labelled ${n}...`);
  try {
    const res = await complete(llm, [
      { role: "user", content: [{ type: "text", text: "What number is written in the label of the box? Answer with just the number." }, imagePart(shot)] },
    ], []);
    const said = res.content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    const pass = said.includes(String(n));
    log(`${pass ? "pass" : "FAIL"}  the model said ${JSON.stringify(said.slice(0, 80))}`);
    return pass;
  } catch (e) {
    log(`FAIL  ${(e as Error).message}  (the server may not accept images for this model)`);
    return false;
  }
}
