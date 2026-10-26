#!/usr/bin/env bun
import { createInterface } from "node:readline/promises";
import { parseArgs } from "node:util";
import { Agent, type AgentIO } from "./loop.ts";
import { Permissions, type Mode, type Answer } from "./permissions.ts";
import { doctor } from "./doctor.ts";
import type { LLMConfig } from "./llm.ts";

const C = { dim: "\x1b[2m", cyan: "\x1b[36m", yellow: "\x1b[33m", bold: "\x1b[1m", reset: "\x1b[0m" };

const HELP = `maxx: a local coding agent

usage:
  maxx [options]              start an interactive session in the current directory
  maxx -p "fix the tests"     run one prompt and exit
  maxx doctor                 check that the model makes valid tool calls

options:
  --base-url <url>   OpenAI-compatible server (default $MAXX_BASE_URL or http://localhost:1234/v1)
  --model <id>       model id (default $MAXX_MODEL or the first model the server lists)
  --mode <mode>      ask | auto-edit | yolo (default ask)
  --context <n>      context window in tokens (default 32768)
  -p, --prompt <s>   one-shot prompt

in a session:
  /help  /mode <m>  /checkpoints  /rewind <n>  /clear  /exit
  Ctrl-C stops the current turn; Ctrl-C at an empty prompt exits.`;

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    "base-url": { type: "string" },
    model: { type: "string" },
    mode: { type: "string", default: "ask" },
    context: { type: "string", default: "32768" },
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

if (positionals[0] === "doctor") process.exit((await doctor(llm)) ? 0 : 1);

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

const agent = await new Agent({ llm, cwd, permissions, contextWindow: Number(values.context) }, io).init();

if (values.prompt) {
  await turn(values.prompt);
  rl.close();
  process.exit(0);
}

console.log(`${C.bold}maxx${C.reset} ${C.dim}${llm.model} via ${baseURL} · mode ${permissions.mode} · /help${C.reset}`);
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

function die(msg: string): never {
  console.error(msg);
  process.exit(1);
}
