#!/usr/bin/env bun
import { createInterface } from "node:readline/promises";
import { parseArgs } from "node:util";
import { Agent, type AgentIO } from "./loop.ts";
import { Permissions, type Mode, type Answer } from "./permissions.ts";
import { basename, join, relative, resolve } from "node:path";
import { doctor, doctorDevices } from "./doctor.ts";
import type { LLMConfig } from "./llm.ts";
import { TOOLSETS } from "./tools/index.ts";
import { pickVision } from "./vision.ts";
import { textOf } from "./context.ts";
import { recordTo } from "./devices/run.ts";
import { replay } from "./replay.ts";
import { startUI } from "./ui/server.ts";
import { doctorVoice } from "./ui/voice.ts";
import { describe, SPINNER, statusLine, type StreamProgress } from "./progress.ts";
import { launchedFromExplorer } from "./ui/launch.ts";
import { ago, deleteSession, findSession, newSessionId, formatList, listProjects, listSessions, loadSession, restoreSession, saveSession, type Session, type SessionInfo } from "./sessions.ts";
import { buildTurn, type Upload } from "./attach.ts";
import { TEMPLATES, findTemplate, scaffold } from "./templates/index.ts";
import { describeHelper, resolveHelper, type Helper } from "./escalate.ts";
import { useAndroidToolchain } from "./toolchain.ts";
import { parseSwitch, resolveNetwork, saveNetwork } from "./network.ts";

// Before any command runs, so Gradle and adb find Android Studio's JDK and SDK.
useAndroidToolchain();

const C = { dim: "\x1b[2m", cyan: "\x1b[36m", yellow: "\x1b[33m", bold: "\x1b[1m", reset: "\x1b[0m" };

const HELP = `maxx: a local coding agent

usage:
  maxx [options]              start an interactive session in the current directory
  maxx ui [--port n]          open the app window (also what double-clicking maxx.exe does)
  maxx -p "fix the tests"     run one prompt and exit
  maxx doctor                 check that the model makes valid tool calls
  maxx doctor android         check adb, the JDK and the connected phone
  maxx doctor desktop         check screenshots and UI Automation on Windows
  maxx doctor vision          check that the model (or --vision-model) can read an image
  maxx doctor voice           check the local Whisper used by the mic button in maxx ui
  maxx replay <file.jsonl>    re-run the phone/desktop actions of an earlier session
  maxx sessions [--all]       list saved sessions for this project (or every project)
  maxx sessions rm <ref...>   delete sessions (asks first; -y skips that); they stay in the trash for 7 days
  maxx sessions undo          bring back the session deleted last
  maxx new [template] [dir]   start a project from a working template (no template: list them)

options:
  --base-url <url>   OpenAI-compatible server (default $MAXX_BASE_URL or http://localhost:1234/v1)
  --model <id>       model id (default $MAXX_MODEL or the first model the server lists)
  --mode <mode>      ask | auto-edit | yolo (default ask)
  --context <n>      context window in tokens (default 32768)
  --with <sets>      extra tools: android, desktop (comma-separated; default $MAXX_WITH)
  --vision <v>       auto | native | off: can the model see screenshots? (default auto)
                     with --vision-model: auto describes screenshots the model asks for, always describes every one
  --vision-model <id>  a second model that looks at screenshots for a text-only main model
  --check <cmd>      build command Maxx runs after the model edits files (default: detected,
                     or a \`check:\` line in MAXX.md); --check off for syntax checks only
  --fix-tries <n>    times a failed check goes back to the model (default 3, 0 = off)
  --no-plan          don't offer the plan checklist tool
  --helper <id>      a bigger model to hand the hard step to when the local one is stuck
                     (default $MAXX_HELPER or the app's saved setting; "off" disables it)
                     claude-* ids use the Claude API ($ANTHROPIC_API_KEY); with --helper-url, any
                     OpenAI-compatible API ($MAXX_HELPER_KEY or $OPENAI_API_KEY); otherwise another LM Studio model
  --helper-url <url>   OpenAI-compatible API for the helper
  --helper-kind <k>    lmstudio | openai | anthropic (guessed from the model id and URL)
  --helper-after <n>   failed tool calls in a row before escalating (default 3)
  --network <on|off> let the model install packages (pip, npm...) and download files, for data
                     analysis, charts and file processing (default $MAXX_NETWORK or the saved
                     setting, which starts off); installs still ask first in ask mode
  --whisper <x>      offline speech-to-text for the mic button: a Whisper server URL
                     (whisper.cpp's whisper-server) or the path to whisper-cli (default $MAXX_WHISPER,
                     else whisper-cli on PATH with a model in ~/.maxx/whisper)
  --whisper-model <f>  ggml model file for whisper-cli (default $MAXX_WHISPER_MODEL)
  -p, --prompt <s>   one-shot prompt
  -c, --continue     continue the latest session in this project
  --resume <ref>     continue a session by number (from \`maxx sessions\`), id, or words from its title

in a session:
  /help  /mode <m>  /with <sets|none>  /plan  /helper [off|on]  /network [on|off]  /checkpoints  /rewind <n>  /clear  /exit
  /sessions  /resume <ref>  /new  /title <text>   (sessions are saved per project after every turn)
  /delete <ref>  /undelete     delete a session (this one if no ref), bring it back
  /attach <file...>            send files with your next message: images to the vision model, text inline
  /attach save <file...>       copy files into the project and tell Maxx about them;  /attach clear
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
    check: { type: "string" },
    "fix-tries": { type: "string" },
    "no-plan": { type: "boolean" },
    helper: { type: "string" },
    "helper-url": { type: "string" },
    "helper-kind": { type: "string" },
    "helper-after": { type: "string" },
    network: { type: "string" },
    prompt: { type: "string", short: "p" },
    continue: { type: "boolean", short: "c" },
    resume: { type: "string" },
    all: { type: "boolean" },
    port: { type: "string" },
    whisper: { type: "string" },
    "whisper-model": { type: "string" },
    help: { type: "boolean", short: "h" },
    yes: { type: "boolean", short: "y" },
  },
});

if (values.help) {
  console.log(HELP);
  process.exit(0);
}

if (positionals[0] === "sessions" && ["rm", "delete", "del"].includes(positionals[1] ?? "")) {
  const cwd = process.cwd();
  const refs = positionals.slice(2);
  if (!refs.length) die("usage: maxx sessions rm <ref...>   (numbers from `maxx sessions`, ids, or words from a title)");
  const found: SessionInfo[] = [];
  for (const ref of refs) {
    const s = await findSession(cwd, ref);
    if (!s) die(`no session matching "${ref}" in this project; see \`maxx sessions\``);
    if (!found.some((f) => f.id === s.id)) found.push(s);
  }
  console.log(formatList(found));
  if (!values.yes) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const a = (await rl.question(`Delete ${found.length === 1 ? "this session" : `these ${found.length} sessions`}? [y/N] `)).trim().toLowerCase();
    rl.close();
    if (a !== "y" && a !== "yes") (console.log("kept"), process.exit(0));
  }
  for (const s of found) await deleteSession(cwd, s.id);
  console.log(`deleted ${found.length}; \`maxx sessions undo\` brings back the last one (kept for 7 days)`);
  process.exit(0);
}
if (positionals[0] === "sessions" && positionals[1] === "undo") {
  const s = await restoreSession(process.cwd());
  console.log(s ? `restored "${s.title}" (${s.turns} turns); maxx --resume ${s.id.slice(0, 19)} to continue it` : "nothing to undo in this project");
  process.exit(s ? 0 : 1);
}
if (positionals[0] === "sessions") {
  if (values.all) {
    const projects = await listProjects();
    if (!projects.length) console.log("(no saved sessions yet)");
    for (const p of projects) console.log(`${C.bold}${p.cwd}${C.reset}\n${formatList(p.sessions.slice(0, 5))}${p.sessions.length > 5 ? `\n     ... ${p.sessions.length - 5} more` : ""}\n`);
  } else console.log(formatList(await listSessions(process.cwd())));
  process.exit(0);
}

if (positionals[0] === "new") {
  const [, id, folder] = positionals;
  if (!id) {
    console.log("templates:\n" + TEMPLATES.map((t) => `  ${t.icon} ${C.bold}${t.id.padEnd(16)}${C.reset} ${t.about}`).join("\n") + `\n\nusage: maxx new <template> [dir]`);
    process.exit(0);
  }
  const t = findTemplateOrDie(id);
  const dir = resolve(folder ?? t.folder);
  const files = await scaffold(t, dir).catch((e) => die((e as Error).message));
  const rel = relative(process.cwd(), dir) || ".";
  console.log(`${C.bold}${t.name}${C.reset} created in ${rel} (${files.length} files). Next:\n  cd ${rel}\n  maxx\n${C.dim}Try: ${t.try.map((x) => `"${x}"`).join(", ")}${C.reset}`);
  process.exit(0);
}

const baseURL = values["base-url"] ?? process.env.MAXX_BASE_URL ?? "http://localhost:1234/v1";

// `maxx ui`, or double-clicking maxx.exe: the app window instead of the terminal.
const fromExplorer = launchedFromExplorer();
const voice = { whisper: values.whisper ?? process.env.MAXX_WHISPER, whisperModel: values["whisper-model"] ?? process.env.MAXX_WHISPER_MODEL };

if (positionals[0] === "doctor" && positionals[1] === "voice") process.exit((await doctorVoice({ whisper: voice.whisper, model: voice.whisperModel })) ? 0 : 1);

if (positionals[0] === "ui" || (fromExplorer && !positionals.length && !values.prompt)) {
  const port = values.port ? Number(values.port) : 4317;
  let ui;
  try {
    ui = await startUI({ baseURL, port, visionModel: values["vision-model"] ?? process.env.MAXX_VISION_MODEL, context: Number(values.context), network: values.network, ...voice });
  } catch {
    ui = await startUI({ baseURL, port: 0, visionModel: values["vision-model"] ?? process.env.MAXX_VISION_MODEL, context: Number(values.context), network: values.network, ...voice });
  }
  // Dev servers started from the Run panel go down with Maxx.
  for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"] as const) process.on(sig, () => (ui.stop(), process.exit(0)));
  console.log(`${C.bold}maxx${C.reset} is running at ${ui.link}\n${C.dim}The window opened on its own; if not, open that link. Close this window (or Ctrl-C) to quit.${C.reset}`);
  await new Promise(() => {});
}
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

// A Claude Code style status line while the model works but shows nothing:
// reading the prompt, thinking, or writing a tool call. It is redrawn in place
// and wiped before anything else prints.
const status = {
  p: null as StreamProgress | null,
  at: 0,
  drawn: false,
  // Is the cursor at the start of a line? The status line only ever takes a line of its own.
  bol: true,
  timer: null as ReturnType<typeof setInterval> | null,
  frame: 0,
  set(p: StreamProgress) {
    if (!process.stdout.isTTY) return;
    if (p.phase === "done" || p.phase === "text") return this.stop();
    this.p = p;
    this.at = Date.now();
    this.timer ??= setInterval(() => this.draw(), 100);
  },
  draw() {
    if (!this.p) return;
    // Time keeps counting between chunks, which is when it matters most.
    const p = { ...this.p, elapsedMs: this.p.elapsedMs + Date.now() - this.at };
    const a = describe(p);
    const cols = process.stdout.columns || 100;
    let line = `${SPINNER[this.frame++ % SPINNER.length]} ${statusLine(p, a)}`;
    const last = (a.preview.split("\n").filter((l) => l.trim()).pop() ?? "").replace(/\s+/g, " ").trim();
    if (last) line += ` │ ${last}`;
    if (line.length > cols - 1) line = line.slice(0, cols - 2) + "…";
    const pre = line.indexOf(" │ ");
    const colored = pre < 0 ? `${C.cyan}${line}${C.reset}` : `${C.cyan}${line.slice(0, pre)}${C.reset}${C.dim}${line.slice(pre)}${C.reset}`;
    if (!this.drawn && !this.bol) process.stdout.write("\n");
    process.stdout.write(`\r\x1b[2K${colored}`);
    this.drawn = true;
    this.bol = true;
  },
  clear() {
    if (this.drawn) process.stdout.write("\r\x1b[2K");
    this.drawn = false;
  },
  write(t: string) {
    this.clear();
    process.stdout.write(t);
    if (t) this.bol = t.endsWith("\n");
  },
  say(text: string) {
    this.stop();
    console.log(text);
    this.bol = true;
  },
  stop() {
    this.clear();
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.p = null;
  },
};

const io: AgentIO = {
  token: (t) => status.write(t),
  progress: (p) => status.set(p),
  toolStart: (name, args) => status.say(`${status.bol ? "" : "\n"}${C.cyan}> ${name}${C.reset} ${C.dim}${args.slice(0, 160)}${C.reset}`),
  toolEnd: (_name, result) => {
    const lines = result.split("\n");
    status.say(C.dim + lines.slice(0, 6).map((l) => "  " + l).join("\n") + (lines.length > 6 ? `\n  ... ${lines.length - 6} more lines` : "") + C.reset);
  },
  note: (text) => status.say(`${C.yellow}${text}${C.reset}`),
  plan: (steps) => {
    if (!steps.length) return;
    const next = steps.findIndex((s) => !s.done);
    status.say(steps.map((s, i) => (s.done ? `${C.dim}  ✓ ${s.text}${C.reset}` : i === next ? `${C.bold}  ▸ ${s.text}${C.reset}` : `  ○ ${s.text}`)).join("\n"));
  },
  async ask(question, preview) {
    status.stop();
    if (preview) console.log(preview);
    for (;;) {
      const a = (await rl.question(`${C.bold}${question}${C.reset} [y]es / [n]o / [a]lways: `)).trim().toLowerCase();
      if (a === "y" || a === "yes" || a === "") return "yes";
      if (a === "n" || a === "no") return "no";
      if (a === "a" || a === "always") return "always";
    }
  },
};

// Resuming brings back the session's turns and its toolsets (unless --with says otherwise).
let resumed: Session | null = null;
if (values.continue || values.resume) {
  const info = values.resume ? await findSession(cwd, values.resume) : (await listSessions(cwd))[0];
  if (!info) die(values.resume ? `no session matching "${values.resume}" in this project; see \`maxx sessions\`` : "no saved session in this project yet");
  resumed = await loadSession(cwd, info.id);
}
const toolsets = parseSets(values.with ?? (resumed?.toolsets.join(",") || process.env.MAXX_WITH) ?? "");
const { vision, note: visionNote } = await pickVision(llm, { flag: values.vision, visionModel: values["vision-model"] ?? process.env.MAXX_VISION_MODEL });
const check = values.check === undefined ? undefined : /^(off|none|false)$/i.test(values.check) ? false : values.check;
const fixTries = values["fix-tries"] === undefined ? undefined : Number(values["fix-tries"]);
let helper: Helper | null = null;
try {
  helper = await resolveHelper({ model: values.helper, url: values["helper-url"], kind: values["helper-kind"], after: values["helper-after"] });
} catch (e) {
  die((e as Error).message);
}
const network = await resolveNetwork(values.network).catch((e) => die((e as Error).message));
const agent = await new Agent({ llm, cwd, permissions, contextWindow: Number(values.context), toolsets, vision, check, fixTries, plan: !values["no-plan"], helper, network }, io).init();
let created = new Date().toISOString();
let title = "";
if (resumed) await resumeInto(resumed);
let replayFile = "";
// Declared before the -p path below, which runs a turn right away.
let controller: AbortController | null = null;
setReplayFile();

function setReplayFile() {
  replayFile = join(cwd, ".maxx", "replays", `${agent.session}.jsonl`);
  recordTo(replayFile);
}

async function resumeInto(s: Session) {
  await agent.restore(s.id, s.history);
  created = s.created;
  title = s.title;
  const last = [...s.history].reverse().find((m) => m.role === "assistant" && typeof m.content === "string" && m.content.trim());
  const recap = last ? textOf(last.content).trim().split("\n")[0]!.slice(0, 160) : "";
  io.note(`(resumed "${s.title}", ${s.turns} turns, ${ago(s.updated)})${recap ? `\nlast reply: ${recap}` : ""}`);
}

async function save() {
  if (agent.history.length < 2) return;
  try {
    const s = await saveSession({ id: agent.session, cwd, created, model: llm.model, toolsets: agent.toolsets, history: agent.history, title });
    title ||= s.title;
  } catch (e) {
    io.note(`(could not save the session: ${(e as Error).message})`);
  }
}
if (toolsets.length && visionNote) io.note(visionNote);

if (values.prompt) {
  await turn(values.prompt);
  rl.close();
  process.exit(0);
}

const extras = (toolsets.length ? ` · with ${toolsets.join(",")} · vision ${vision.mode === "proxy" ? vision.llm.model : vision.mode}` : "") + (helper ? ` · helper ${describeHelper(helper)}` : "") + (network ? " · network on" : "");
console.log(`${C.bold}maxx${C.reset} ${C.dim}${llm.model} via ${baseURL} · mode ${permissions.mode}${extras} · /help${C.reset}`);
if (!resumed) {
  const prev = (await listSessions(cwd))[0];
  if (prev) console.log(`${C.dim}last session here: "${prev.title}" (${ago(prev.updated)}) · maxx -c to continue it${C.reset}`);
}
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

// Files from /attach, sent with the next message.
let staged: Upload[] = [];

async function turn(text: string) {
  controller = new AbortController();
  status.bol = true;
  try {
    const files = staged;
    staged = [];
    const t = await buildTurn(text, files, { cwd, contextWindow: Number(values.context), vision, signal: controller.signal });
    for (const n of t.notes) io.note(n);
    await agent.send(t.content, controller.signal);
    process.stdout.write("\n");
  } catch (e) {
    const err = e as Error;
    console.log(`\n${C.yellow}${err.name === "AbortError" ? "(stopped)" : "error: " + err.message}${C.reset}`);
  } finally {
    status.stop();
    controller = null;
    await save();
  }
}

async function command(line: string) {
  const [cmd, arg] = line.split(/\s+/, 2);
  switch (cmd) {
    case "/help": return console.log(HELP);
    case "/exit": rl.close(); process.exit(0);
    case "/clear": await agent.init(); return console.log("(history cleared)");
    case "/new":
      await agent.init();
      agent.session = newSessionId();
      created = new Date().toISOString();
      title = "";
      setReplayFile();
      return console.log("(new session; the previous one is saved, /sessions to go back)");
    case "/sessions": return console.log(formatList(await listSessions(cwd), agent.session));
    case "/resume": {
      const info = arg ? await findSession(cwd, line.slice(cmd!.length).trim()) : (await listSessions(cwd)).find((s) => s.id !== agent.session);
      const s = info && (await loadSession(cwd, info.id));
      if (!s) return console.log("no such session; /sessions lists them");
      await save();
      if (s.toolsets.join() !== agent.toolsets.join()) agent.useToolsets(s.toolsets);
      await resumeInto(s);
      setReplayFile();
      return;
    }
    case "/delete": {
      const ref = line.slice(cmd!.length).trim();
      const info = ref ? await findSession(cwd, ref) : { id: agent.session, title: title || "this session" };
      if (!info) return console.log("no such session; /sessions lists them");
      if (!(await deleteSession(cwd, info.id))) return console.log("that session was never saved; nothing to delete");
      if (info.id === agent.session) {
        await agent.init();
        agent.session = newSessionId();
        created = new Date().toISOString();
        title = "";
        setReplayFile();
      }
      return console.log(`(deleted "${info.title}"; /undelete brings it back)`);
    }
    case "/undelete": {
      const s = await restoreSession(cwd);
      return console.log(s ? `(restored "${s.title}"; /resume ${s.id.slice(0, 19)} to switch to it)` : "nothing to undo");
    }
    case "/attach": {
      const words = line.slice(cmd!.length).trim().match(/"[^"]+"|\S+/g)?.map((w) => w.replace(/^"|"$/g, "")) ?? [];
      if (words[0] === "clear") return (staged = []), console.log("(attachments cleared)");
      const mode = words[0] === "save" ? "save" : "attach";
      for (const p of mode === "save" ? words.slice(1) : words) {
        const f = Bun.file(resolve(cwd, p));
        if (!(await f.exists())) return console.log(`no such file: ${p}`);
        staged.push({ name: basename(p), data: new Uint8Array(await f.arrayBuffer()), mode });
      }
      return console.log(staged.length ? `(attached ${staged.map((f) => f.name + (f.mode === "save" ? " [save]" : "")).join(", ")}; they go with your next message)` : "usage: /attach [save] <file...>");
    }
    case "/title":
      title = line.slice(cmd!.length).trim();
      await save();
      return console.log(`title: ${title}`);
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
    case "/plan": return agent.plan.length ? io.plan!(agent.plan) : console.log("(no plan yet; the model writes one for bigger tasks)");
    case "/helper": {
      if (arg === "off" || arg === "on") {
        if (!helper) return console.log("no helper configured; start with --helper <model>, or set one in the app (maxx ui)");
        agent.setHelper(arg === "off" ? null : helper);
      }
      const h = agent.helper;
      return console.log(h ? `helper: ${describeHelper(h)}, after ${h.afterFailures ?? 3} failed calls in a row or a repeat loop (/helper off to stay local)` : `helper: off, everything stays on this machine${helper ? " (/helper on)" : ""}`);
    }
    case "/network": {
      // Saved, so the next `maxx` and `maxx ui` start the same way.
      const on = arg === undefined ? undefined : parseSwitch(arg);
      if (arg !== undefined && on === undefined) return console.log("usage: /network on | off");
      if (on !== undefined) {
        await agent.setNetwork(on);
        await saveNetwork(on);
      }
      return console.log(agent.network ? "network: on, Maxx may install packages (pip, npm...) and download files (/network off to stop)" : "network: off, no installs or downloads (/network on to allow them)");
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
  // Double-clicked maxx.exe: keep the window open long enough to read why.
  if (launchedFromExplorer()) {
    console.error("\nPress Enter to close.");
    Bun.spawnSync(["cmd.exe", "/c", "pause >nul"], { stdin: "inherit", stdout: "inherit" });
  }
  process.exit(1);
}

function findTemplateOrDie(id: string) {
  try {
    return findTemplate(id);
  } catch (e) {
    return die((e as Error).message);
  }
}
