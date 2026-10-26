#!/usr/bin/env bun
import { createInterface } from "node:readline/promises";
import { parseArgs } from "node:util";
import { Agent, type AgentIO } from "./loop.ts";
import { Permissions, type Mode, type Answer } from "./permissions.ts";
import { join } from "node:path";
import { doctor, doctorDevices } from "./doctor.ts";
import type { LLMConfig } from "./llm.ts";
import { TOOLSETS } from "./tools/index.ts";
import { pickVision } from "./vision.ts";
import { recordTo } from "./devices/run.ts";
import { replay } from "./replay.ts";

const C = { dim: "\x1b[2m", cyan: "\x1b[36m", yellow: "\x1b[33m", bold: "\x1b[1m", reset: "\x1b[0m" };

const HELP = `maxx: a local coding agent

usage:
  maxx [options]              start an interactive session in the current directory
  maxx -p "fix the tests"     run one prompt and exit
  maxx doctor                 check that the model makes valid tool calls
  maxx doctor android         check adb, the JDK and the connected phone
  maxx doctor desktop         check screenshots and UI Automation on Windows
  maxx doctor vision          check that the model (or --vision-model) can read an image
  maxx replay <file.jsonl>    re-run the phone/desktop actions of an earlier session

options:
  --base-url <url>   OpenAI-compatible server (default $MAXX_BASE_URL or http://localhost:1234/v1)
  --model <id>       model id (default $MAXX_MODEL or the first model the server lists)
  --mode <mode>      ask | auto-edit | yolo (default ask)
  --context <n>      context window in tokens (default 32768)
  --with <sets>      extra tools: android, desktop (comma-separated; default $MAXX_WITH)
  --vision <v>       auto | native | off: can the model see screenshots? (default auto)
  --vision-model <id>  a second model that looks at screenshots for a text-only main model
  -p, --prompt <s>   one-shot prompt

in a session:
  /help  /mode <m>  /with <sets|none>  /checkpoints  /rewind <n>  /clear  /exit
  Ctrl-C stops the current turn; Ctrl-C at an empty prompt exits.`;

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    "base-url": { type: "string" },
    model: { type: "string" },
    mode: { type: "string", default: "ask" },
    context: { type: "string", default: "32768" },
    with: { type: "string" },
    vision: { type: "string", default: "auto" },
    "vision-model": { type: "string" },
    prompt: { type: "string", short: "p" },
    help: { type: "boolean", short: "h" },
  },
});

if (values.help) {
  console.log(HELP);
  process.exit(0);
}

const baseURL = values["base-url"] ?? process.env.MAXX_BASE_URL ?? "http://localhost:1234/v1";
const llm: LLMConfig = { baseURL, model: values.model ?? process.env.MAXX_MODEL ?? (await firstModel(baseURL)) };

if (positionals[0] === "doctor") {
  const what = positionals[1];
  process.exit((what ? await doctorDevices(what, llm, values["vision-model"] ?? process.env.MAXX_VISION_MODEL) : await doctor(llm)) ? 0 : 1);
}
if (positionals[0] === "replay") {
  if (!positionals[1]) die("usage: maxx replay <file.jsonl>");
  process.exit((await replay(positionals[1])) ? 0 : 1);
}

const mode = values.mode as Mode;
if (!["ask", "auto-edit", "yolo"].includes(mode)) die(`unknown mode ${mode}`);
const cwd = process.cwd();
const permissions = await new Permissions(cwd, mode).load();
const rl = createInterface({ input: process.stdin, output: process.stdout });

const io: AgentIO = {
  token: (t) => process.stdout.write(t),
  toolStart: (name, args) => console.log(`\n${C.cyan}> ${name}${C.reset} ${C.dim}${args.slice(0, 160)}${C.reset}`),
  toolEnd: (_name, result) => {
    const lines = result.split("\n");
    console.log(C.dim + lines.slice(0, 6).map((l) => "  " + l).join("\n") + (lines.length > 6 ? `\n  ... ${lines.length - 6} more lines` : "") + C.reset);
  },
  note: (text) => console.log(`${C.yellow}${text}${C.reset}`),
  async ask(question, preview) {
    if (preview) console.log(preview);
    for (;;) {
      const a = (await rl.question(`${C.bold}${question}${C.reset} [y]es / [n]o / [a]lways: `)).trim().toLowerCase();
      if (a === "y" || a === "yes" || a === "") return "yes";
      if (a === "n" || a === "no") return "no";
      if (a === "a" || a === "always") return "always";
    }
  },
};

const toolsets = parseSets(values.with ?? process.env.MAXX_WITH ?? "");
const { vision, note: visionNote } = await pickVision(llm, { flag: values.vision, visionModel: values["vision-model"] ?? process.env.MAXX_VISION_MODEL });
const agent = await new Agent({ llm, cwd, permissions, contextWindow: Number(values.context), toolsets, vision }, io).init();
const replayFile = join(cwd, ".maxx", "replays", `${agent.session}.jsonl`);
recordTo(replayFile);
if (toolsets.length && visionNote) io.note(visionNote);

if (values.prompt) {
  await turn(values.prompt);
  rl.close();
  process.exit(0);
}

const extras = toolsets.length ? ` · with ${toolsets.join(",")} · vision ${vision.mode === "proxy" ? vision.llm.model : vision.mode}` : "";
console.log(`${C.bold}maxx${C.reset} ${C.dim}${llm.model} via ${baseURL} · mode ${permissions.mode}${extras} · /help${C.reset}`);
let controller: AbortController | null = null;
rl.on("SIGINT", () => {
  if (controller) controller.abort();
  else (rl.close(), process.exit(0));
});

for (;;) {
  const line = (await rl.question(`\n${C.cyan}›${C.reset} `)).trim();
  if (!line) continue;
  if (line.startsWith("/")) {
    await command(line);
    continue;
  }
  await turn(line);
}

async function turn(text: string) {
  controller = new AbortController();
  try {
    await agent.send(text, controller.signal);
    process.stdout.write("\n");
  } catch (e) {
    const err = e as Error;
    console.log(`\n${C.yellow}${err.name === "AbortError" ? "(stopped)" : "error: " + err.message}${C.reset}`);
  } finally {
    controller = null;
  }
}

async function command(line: string) {
  const [cmd, arg] = line.split(/\s+/, 2);
  switch (cmd) {
    case "/help": return console.log(HELP);
    case "/exit": rl.close(); process.exit(0);
    case "/clear": await agent.init(); return console.log("(history cleared)");
    case "/mode":
      if (arg && ["ask", "auto-edit", "yolo"].includes(arg)) permissions.mode = arg as Mode;
      return console.log(`mode: ${permissions.mode}`);
    case "/with": {
      if (arg) {
        try {
          agent.useToolsets(arg === "none" ? [] : arg.split(",").map((x) => x.trim().toLowerCase()).filter(Boolean));
          await agent.refreshSystemPrompt();
        } catch (e) {
          return console.log((e as Error).message);
        }
      }
      const sets = Object.entries(TOOLSETS).map(([n, t]) => `  ${agent.toolsets.includes(n) ? "*" : " "} ${n.padEnd(8)} ${t.about}`);
      return console.log(`toolsets (* = on; /with android,desktop or /with none):\n${sets.join("\n")}\nreplay of this session: ${replayFile}`);
    }
    case "/checkpoints": {
      const list = agent.checkpoints.list();
      return console.log(list.length ? list.join("\n") : "(no checkpoints yet; one is taken before every write or command)");
    }
    case "/rewind": return console.log(await agent.checkpoints.restore(Number(arg ?? -1)));
    default: console.log(`unknown command ${cmd}; try /help`);
  }
}

async function firstModel(url: string): Promise<string> {
  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/models`);
    const json = (await res.json()) as { data?: { id: string }[] };
    const id = json.data?.find((m) => !/embed/i.test(m.id))?.id;
    if (id) return id;
  } catch {}
  die(`no model found at ${url}. Start LM Studio's server (Developer tab) and load a model, or pass --model.`);
}

function parseSets(s: string): string[] {
  const sets = s.split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
  const bad = sets.filter((x) => !TOOLSETS[x]);
  if (bad.length) die(`unknown toolset ${bad.join(", ")}; available: ${Object.keys(TOOLSETS).join(", ")}`);
  return sets;
}

function die(msg: string): never {
  console.error(msg);
  process.exit(1);
}
