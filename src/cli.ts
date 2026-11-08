#!/usr/bin/env bun
import { createInterface } from "node:readline/promises";
import { parseArgs } from "node:util";
import { Agent, type AgentIO } from "./loop.ts";
import { Permissions, MODE_SAY, parseMode, resolveMode, saveMode, type Mode, type Answer } from "./permissions.ts";
import { basename, join, relative, resolve } from "node:path";
import { doctor, doctorDevices } from "./doctor.ts";
import type { LLMConfig } from "./llm.ts";
import { TOOLSETS } from "./tools/index.ts";
import { closest, loadRecipes } from "./recipes.ts";
import { pickVision } from "./vision.ts";
import { textOf } from "./context.ts";
import { fitContext } from "./modelctx.ts";
import { recordTo } from "./devices/run.ts";
import { replay } from "./replay.ts";
import { startUI } from "./ui/server.ts";
import { doctorVoice } from "./ui/voice.ts";
import { doctorWeb, githubCommand, mcpCommand } from "./lookup-cli.ts";
import { mcpHub } from "./mcp.ts";
import { repoClone } from "./tools/repo.ts";
import { doctorMedia } from "./tools/media-doctor.ts";
import { describe, SPINNER, statusLine, type StreamProgress } from "./progress.ts";
import { launchedFromExplorer } from "./ui/launch.ts";
import { ago, deleteSession, findSession, newSessionId, formatList, listProjects, listSessions, loadSession, restoreSession, saveSession, type Session, type SessionInfo } from "./sessions.ts";
import { buildTurn, type Upload } from "./attach.ts";
import { TEMPLATES, findTemplate, scaffold } from "./templates/index.ts";
import { describeHelper, resolveHelper, type Helper } from "./escalate.ts";
import { useAndroidToolchain } from "./toolchain.ts";
import { parseSwitch, resolveNetwork, saveNetwork } from "./network.ts";
import { BREVITY, parseBrevity, resolveBrevity, saveBrevity } from "./brevity.ts";
import { parseThinking, resolveThinking, saveThinking, THINKING, THINKING_SAY } from "./thinking.ts";
import { loadRules, resolveLearn, saveLearn, saveRules, tidyRules } from "./learn.ts";
import { describePalette, parsePalette, presetList, resolvePalette, savePalette, swatches } from "./palette.ts";
import { agentSettings, cleanSettings, loadAgentSettings, runGoal, type Board } from "./agentmode.ts";
import { cleanCrew, crewSettings, loadCrewSettings, runCrew, type CrewBoard } from "./crew.ts";
import { formatStudy, labSettings, loadLab, runStudy, type Study } from "./lab/lab.ts";
import { discover, ffmpegCapture } from "./lab/instruments.ts";
import { labCommand } from "./lab/cli.ts";

// Before any command runs, so Gradle and adb find Android Studio's JDK and SDK.
useAndroidToolchain();

const C = { dim: "\x1b[2m", cyan: "\x1b[36m", yellow: "\x1b[33m", bold: "\x1b[1m", reset: "\x1b[0m" };

const HELP = `maxx: a local coding agent

usage:
  maxx [options]              start an interactive session in the current directory
  maxx ui [--port n]          open the app window (also what double-clicking maxx.exe does)
  maxx -p "fix the tests"     run one prompt and exit
  maxx --agent "build a tip calculator web app"
                              Agent mode: split the goal into tasks and work through them alone
  maxx --lab "does my desk get warmer in the afternoon sun?"
                              Research lab: collect data (web, COM-port sensors, camera, mic, files),
                              test rival hypotheses with sandboxed scripts, write a lab notebook
  maxx lab [instruments|ports|sketch]
                              what the lab can measure from here; an Arduino starter sketch
  maxx doctor                 check that the model makes valid tool calls
  maxx doctor android         check adb, the JDK and the connected phone
  maxx doctor desktop         check screenshots and UI Automation on Windows
  maxx doctor vision          check that the model (or --vision-model) can read an image
  maxx doctor web             check that web search, page reading and the MCP servers work from here
  maxx mcp [add|rm|test|import|approve] [name]   MCP servers: list, add (starters: playwright, memory, blender, github...), test, import from Claude/Cursor/LM Studio
  maxx clone <owner/name|url> [folder]  get a repository and start Maxx in it, with the 🐙 repo tools
  maxx github [login <token>|logout]    GitHub sign-in for pushes and pull requests (or use the GitHub CLI's)
  maxx doctor voice           check the local Whisper used by the mic button in maxx ui
  maxx doctor media           check the browser, image model, voices and ffmpeg the design and media tools use
  maxx replay <file.jsonl>    re-run the phone/desktop actions of an earlier session
  maxx sessions [--all]       list saved sessions for this project (or every project)
  maxx sessions rm <ref...>   delete sessions (asks first; -y skips that); they stay in the trash for 7 days
  maxx sessions undo          bring back the session deleted last
  maxx new [template] [dir]   start a project from a working template (no template: list them)
  maxx sound <words>          make a game sound effect as a .wav ("deep crunchy explosion")
  maxx sound music <mood> [seed]  make a chiptune loop as a .wav (happy, spooky, boss, chill...)

options:
  --base-url <url>   OpenAI-compatible server (default $MAXX_BASE_URL or http://localhost:1234/v1)
  --model <id>       model id (default $MAXX_MODEL or the first model the server lists)
  --mode <mode>      ask | auto-edit | yolo: ask before edits and commands, only before commands,
                     or never (auto-run; risky commands like git push, sudo or deleting a whole
                     drive still ask). Default $MAXX_MODE or the saved setting, which starts at ask;
                     saved with /auto, /mode or the app's ⚡ Auto-run switch
  --auto-run         same as --mode yolo
  --context <n>      context window in tokens (default 32768)
  --with <sets>      extra tools: android, desktop (comma-separated; default $MAXX_WITH)
  --vision <v>       auto | native | off: can the model see screenshots? (default auto)
                     with --vision-model: auto describes screenshots the model asks for, always describes every one
  --vision-model <id>  a second model that looks at screenshots for a text-only main model
  --check <cmd>      build command Maxx runs after the model edits files (default: detected,
                     or a \`check:\` line in MAXX.md); --check off for syntax checks only
  --fix-tries <n>    times a failed check goes back to the model (default 3, 0 = off)
  --steps <n>        model steps one turn starts with (default 50)
  --max-steps <n>    most steps a turn may take while it keeps making progress (default 4 × --steps; 0 = stop at --steps)
  --no-plan          don't offer the plan checklist tool
  --no-alarm         don't check changed web pages for design crimes before finishing
  --no-timelapse     don't save a screenshot after each visible change (for timelapse GIFs)
  --helper <id>      a bigger model to hand the hard step to when the local one is stuck
                     (default $MAXX_HELPER or the app's saved setting; "off" disables it)
                     claude-* ids use the Claude API ($ANTHROPIC_API_KEY); with --helper-url, any
                     OpenAI-compatible API ($MAXX_HELPER_KEY or $OPENAI_API_KEY); otherwise another LM Studio model
  --helper-url <url>   OpenAI-compatible API for the helper
  --helper-kind <k>    lmstudio | openai | anthropic (guessed from the model id and URL)
  --helper-after <n>   failed tool calls in a row before escalating (default 3)
  --network <on|off> let the model look things up (web_search, web_fetch, MCP servers), install
                     packages (pip, npm...) and download files (default $MAXX_NETWORK or the saved
                     setting, which starts off); installs still ask first in ask mode
  --brevity <level>  how much Maxx says: brief (default), normal or detailed; saved with
                     /brevity or the app's ✂ switch (default $MAXX_BREVITY or the saved setting)
  --thinking <level> how much a reasoning model thinks before acting: auto (default: little for
                     simple asks, more for bugs and after failures), off, low, high or max (no
                     limit); saved with /thinking or the app's 💭 switch ($MAXX_THINKING)
  --learn <on|off>   learn a rule for MAXX.md when you correct Maxx ("no, use pnpm", a denial
                     with a reason, a hand fix, /undo); /rules to review them (default on,
                     $MAXX_LEARN or the saved setting)
  --palette <p>      the colors Maxx designs with (charts, diagrams, pages, games): a preset
                     (sunset, synthwave, pico, colorblind... see /palette list), hex colors
                     "#264653 #2a9d8f #e9c46a", one color and a harmony "#ff6600 triad", a coolors.co
                     link, random, or auto (default $MAXX_PALETTE or the saved setting)
  --whisper <x>      offline speech-to-text for the mic button: a Whisper server URL
                     (whisper.cpp's whisper-server) or the path to whisper-cli (default $MAXX_WHISPER,
                     else whisper-cli on PATH with a model in ~/.maxx/whisper)
  --whisper-model <f>  ggml model file for whisper-cli (default $MAXX_WHISPER_MODEL)
  -p, --prompt <s>   one-shot prompt
  --agent <goal>     run one goal in Agent mode and exit (in a session: /agent <goal>)
                     Each task starts from a snapshot; a failed task is rewound and tried another
                     way; edits need no approval (commands still follow --mode). Budgets default
                     from --context (saved ones in ~/.maxx/agent.json, or the app's 🤖 settings):
  --crew <goal>      run one goal in Crew mode and exit (in a session: /crew <goal>): the tasks
                     are shared out to several workers at once, each in its own git worktree,
                     and merged back. Saved settings in ~/.maxx/crew.json, or the app's 👥 settings:
  --workers <n>      workers at the same time (default 3)
  --crew-models <a,b> models the workers use, in turn (default: the session's model)
  --slots <n>        requests LM Studio runs at once per model (default: measured at the start;
                     LM Studio's "Max Concurrent Predictions" load setting)
  --max-tasks <n>    most tasks a goal is split into (default 6 at 16K context, 12 at 64K+)
  --task-steps <n>   model steps per try at a task (default 20 at 16K, 60 at 64K+)
  --task-tries <n>   tries per task before Agent mode stops (default 2, 3 at 64K+)
  --judge <on|off>   screenshot web pages (headless Edge/Chrome) and the phone after UI changes
                     and let the vision model check them (default on; $MAXX_BROWSER picks the browser)
  --briefing <on|off> ask about anything the goal leaves unclear before planning (default on)
  --ask-wait <min>   minutes a question waits in Agent mode before Maxx goes with its own guess
                     (default 5; 0 waits for ever). Outside Agent mode questions always wait.
  --map-tokens <n>   size of the project map of files and functions the model gets (default 5%
                     of --context; 0 turns it off)
  --lab <question>   run one study in the research lab and exit (in a session: /lab <question>)
                     Settings in ~/.maxx/lab.json or the app's 🔬 ⚙; your own instruments in
                     ~/.maxx/instruments.json. Sensors, camera and mic ask first (Always saves a rule).
  -c, --continue     continue the latest session in this project
  --resume <ref>     continue a session by number (from \`maxx sessions\`), id, or words from its title

in a session:
  /agent <goal>  /crew <goal>  /lab <question>  /help  /auto [on|off]  /mode <m>  /with <sets|none>  /plan  /tools  /recipe [name|save]  /helper [off|on]  /network [on|off]  /brevity [brief|normal|detailed]  /thinking [auto|off|low|high|max]  /palette [name|#hex...|random|auto|list]  /rules [on|off|add <rule>|rm <n>]  /undo  /checkpoints  /rewind <n>  /clear  /exit
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
    mode: { type: "string" },
    "auto-run": { type: "boolean" },
    context: { type: "string", default: "32768" },
    with: { type: "string" },
    vision: { type: "string", default: "auto" },
    "vision-model": { type: "string" },
    check: { type: "string" },
    "fix-tries": { type: "string" },
    steps: { type: "string" },
    "max-steps": { type: "string" },
    "no-plan": { type: "boolean" },
    "no-alarm": { type: "boolean" },
    "no-timelapse": { type: "boolean" },
    helper: { type: "string" },
    "helper-url": { type: "string" },
    "helper-kind": { type: "string" },
    "helper-after": { type: "string" },
    network: { type: "string" },
    brevity: { type: "string" },
    thinking: { type: "string" },
    learn: { type: "string" },
    palette: { type: "string" },
    prompt: { type: "string", short: "p" },
    agent: { type: "string" },
    crew: { type: "string" },
    workers: { type: "string" },
    "crew-models": { type: "string" },
    slots: { type: "string" },
    lab: { type: "string" },
    "max-tasks": { type: "string" },
    "task-steps": { type: "string" },
    "task-tries": { type: "string" },
    judge: { type: "string" },
    briefing: { type: "string" },
    "ask-wait": { type: "string" },
    "map-tokens": { type: "string" },
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

if (positionals[0] === "sound") {
  const { engine } = await import("./sound/index.ts");
  const words = positionals.slice(1);
  if (!words.length) die(`usage: maxx sound <words>   or   maxx sound music <mood> [seed]\neffects: ${engine.KINDS.join(", ")}\nmoods: ${engine.MOODS.join(", ")}`);
  const music = words[0] === "music";
  const rate = 44100;
  let samples: Float32Array, name: string, about: string;
  if (music) {
    const r = engine.recipe({ mood: words[1] ?? "happy", seed: Number(words[2] ?? 1) });
    samples = engine.renderSong(r, rate);
    name = `${r.mood}-${r.seed}`;
    about = engine.describeSong(r);
  } else {
    const text = words.join(" ");
    const s = engine.makeSfx(words[0]!, text);
    samples = engine.renderSfx(s.params, rate);
    name = words.join("-").replace(/[^\w-]/g, "").slice(0, 40) || "sound";
    about = `${s.kind}: ${engine.describeSfx(s.params)}`;
  }
  const file = resolve(`${name}.wav`);
  await Bun.write(file, engine.toWav(samples, rate));
  console.log(`${about}\nwrote ${relative(process.cwd(), file)}`);
  process.exit(0);
}

const baseURL = values["base-url"] ?? process.env.MAXX_BASE_URL ?? "http://localhost:1234/v1";

// `maxx ui`, or double-clicking maxx.exe: the app window instead of the terminal.
const fromExplorer = launchedFromExplorer();
const voice = { whisper: values.whisper ?? process.env.MAXX_WHISPER, whisperModel: values["whisper-model"] ?? process.env.MAXX_WHISPER_MODEL };

if (positionals[0] === "doctor" && positionals[1] === "web") process.exit((await doctorWeb()) ? 0 : 1);
if (positionals[0] === "doctor" && positionals[1] === "media") process.exit((await doctorMedia()) ? 0 : 1);
if (positionals[0] === "github") process.exit(await githubCommand(positionals.slice(1)).catch((e) => (console.error(String((e as Error).message)), 1)));
if (positionals[0] === "mcp") process.exit(await mcpCommand(positionals.slice(1)).catch((e) => (console.error(String((e as Error).message)), 1)));
if (positionals[0] === "lab") process.exit(await labCommand(positionals.slice(1), await resolveNetwork(values.network).catch(() => false)));
if (positionals[0] === "doctor" && positionals[1] === "voice") process.exit((await doctorVoice({ whisper: voice.whisper, model: voice.whisperModel })) ? 0 : 1);

if (positionals[0] === "ui" || (fromExplorer && !positionals.length && !values.prompt && !values.agent && !values.lab)) {
  const port = values.port ? Number(values.port) : 4317;
  let ui;
  try {
    ui = await startUI({ baseURL, model: values.model ?? process.env.MAXX_MODEL, port, visionModel: values["vision-model"] ?? process.env.MAXX_VISION_MODEL, context: Number(values.context), network: values.network, brevity: values.brevity, thinking: values.thinking, learn: values.learn, palette: values.palette, mode: values["auto-run"] ? "yolo" : values.mode, ...voice });
  } catch {
    ui = await startUI({ baseURL, model: values.model ?? process.env.MAXX_MODEL, port: 0, visionModel: values["vision-model"] ?? process.env.MAXX_VISION_MODEL, context: Number(values.context), network: values.network, brevity: values.brevity, thinking: values.thinking, learn: values.learn, palette: values.palette, mode: values["auto-run"] ? "yolo" : values.mode, ...voice });
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

const mode: Mode = await resolveMode(values["auto-run"] ? "yolo" : values.mode).catch((e) => die((e as Error).message));
// `maxx clone owner/name`: get it, then carry on as `maxx` inside it.
if (positionals[0] === "clone") {
  if (!positionals[1]) die("usage: maxx clone <owner/name | git URL> [folder]");
  console.log(`${C.dim}cloning ${positionals[1]}...${C.reset}`);
  const out = String(await repoClone.run({ url: positionals[1]!, folder: positionals[2] }, { cwd: process.cwd(), network: true }));
  console.log(out);
  const dir = out.match(/(?:into|cloned at) (.+?)(?:;|$)/m)?.[1];
  if (out.startsWith("error") || !dir) process.exit(1);
  process.chdir(dir);
  values.with = [...new Set([...(values.with ?? "").split(",").filter(Boolean), "repo"])].join(",");
  positionals.length = 0;
}
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
    const next = steps.some((s) => s.missed) ? -1 : steps.findIndex((s) => !s.done);
    status.say(steps.map((s, i) => (s.done ? `${C.dim}  ✓ ${s.text}${C.reset}` : s.missed ? `${C.yellow}  ✗ ${s.text}${s.why ? ` (not done: ${s.why})` : " (not done)"}${C.reset}` : i === next ? `${C.bold}  ▸ ${s.text}${C.reset}` : `  ○ ${s.text}`)).join("\n"));
  },
  async ask(question, preview) {
    status.stop();
    if (preview) console.log(preview);
    for (;;) {
      const raw = (await rl.question(`${C.bold}${question}${C.reset} [y]es / [n]o / [a]lways / [r]un all from now on  (or "n <why>", and Maxx learns from it): `)).trim();
      const a = raw.toLowerCase();
      if (a === "y" || a === "yes" || a === "") return "yes";
      if (a === "r" || a === "run all" || a === "auto") {
        permissions.mode = "yolo";
        await saveMode("yolo");
        console.log(`${C.dim}auto-run on: ${MODE_SAY.yolo}. /auto off to ask again.${C.reset}`);
        return "yes";
      }
      if (a === "n" || a === "no") return "no";
      const why = raw.match(/^no?[\s,:.-]+(.+)$/i)?.[1]?.trim();
      if (why) return `no: ${why}`;
      if (a === "a" || a === "always") return "always";
    }
  },
  // A follow-up question: a number picks a choice, Enter alone lets Maxx go with its guess.
  async question(q, signal) {
    status.stop();
    console.log(`\n${C.bold}? ${q.question}${C.reset}`);
    q.choices.forEach((c, i) => console.log(`  ${i + 1}. ${c}${q.guess && c.toLowerCase() === q.guess.toLowerCase() ? ` ${C.dim}(Maxx's guess)${C.reset}` : ""}`));
    const wait = q.deadline ? ` ${C.dim}(no answer in ${Math.round((q.deadline - Date.now()) / 60_000)} min and Maxx goes ahead)${C.reset}` : "";
    const hint = q.choices.length ? `1-${q.choices.length} or your own answer` : "your answer";
    try {
      const a = (await rl.question(`${hint}${q.guess ? `, Enter for "${q.guess}"` : ", Enter to skip"}${wait}: `, { signal })).trim();
      const n = /^\d$/.test(a) ? q.choices[Number(a) - 1] : undefined;
      return n ?? (a || null);
    } catch {
      console.log(`\n${C.dim}(no answer${q.guess ? `; going with "${q.guess}"` : ""})${C.reset}`);
      return null;
    }
  },
};

// Piped input can't answer questions, so the model isn't offered ask_user then.
if (!process.stdin.isTTY) delete io.question;

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
const stepsFlag = (v: string | undefined, env?: string) => { const n = Number(v ?? env); return (v ?? env) !== undefined && Number.isFinite(n) && n >= 0 ? Math.floor(n) : undefined; };
const maxSteps = stepsFlag(values.steps, process.env.MAXX_STEPS) || undefined;
const keepGoing = stepsFlag(values["max-steps"], process.env.MAXX_MAX_STEPS);
let helper: Helper | null = null;
try {
  helper = await resolveHelper({ model: values.helper, url: values["helper-url"], kind: values["helper-kind"], after: values["helper-after"] });
} catch (e) {
  die((e as Error).message);
}
const network = await resolveNetwork(values.network).catch((e) => die((e as Error).message));
const brevity = await resolveBrevity(values.brevity).catch((e) => die((e as Error).message));
const thinking = await resolveThinking(values.thinking).catch((e) => die((e as Error).message));
const learn = await resolveLearn(values.learn).catch((e) => die((e as Error).message));
const palette = await resolvePalette(values.palette).catch((e) => die((e as Error).message));
// Agent mode budgets: the context window's defaults, then saved choices, then flags.
const judgeFlag = values.judge === undefined ? undefined : parseSwitch(values.judge);
if (values.judge !== undefined && judgeFlag === undefined) die("--judge is on or off");
const briefingFlag = values.briefing === undefined ? undefined : parseSwitch(values.briefing);
if (values.briefing !== undefined && briefingFlag === undefined) die("--briefing is on or off");
// The context the model was really loaded with, when the server says (never more than --context).
const fit = await fitContext(baseURL, llm.model, Number(values.context));
if (fit.note) console.log(`${C.dim}${fit.note}${C.reset}`);
const goalSettings = agentSettings(fit.context, {
  ...(await loadAgentSettings()),
  ...cleanSettings({ maxTasks: values["max-tasks"], stepsPerTask: values["task-steps"], tries: values["task-tries"], mapTokens: values["map-tokens"], judge: judgeFlag, briefing: briefingFlag, askMinutes: values["ask-wait"] }),
});
const crew = crewSettings({ ...(await loadCrewSettings()), ...cleanCrew({ workers: values.workers, slots: values.slots, models: values["crew-models"] }) });
if (values["max-tasks"]) crew.maxTasks = goalSettings.maxTasks;
const probed = new Map<string, number>();
const agent = await new Agent({ llm, cwd, permissions, contextWindow: fit.context, toolsets, vision, check, fixTries, maxSteps, keepGoing, plan: !values["no-plan"], alarm: !values["no-alarm"] && process.env.MAXX_ALARM !== "0", timelapse: !values["no-timelapse"] && process.env.MAXX_TIMELAPSE !== "0", helper, network, brevity, thinking, palette, learn, mapTokens: goalSettings.mapTokens }, io).init();
let created = new Date().toISOString();
let title = "";
if (resumed) await resumeInto(resumed);
let replayFile = "";
// Declared before the -p path below, which runs a turn right away.
let controller: AbortController | null = null;
// Files from /attach, sent with the next message. Also declared before the -p path:
// turn() reads it, and the compiled maxx.exe hoists it as undefined, not a TDZ error.
let staged: Upload[] = [];
// The Agent mode board as last printed.
let shownBoard = "";
// The research lab's study as last printed (declared up here for the same reason).
let shownStudy = "";
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

if (values.prompt || values.agent || values.crew || values.lab) {
  await (values.lab ? study(values.lab) : values.crew ? goal(values.crew, true) : values.agent ? goal(values.agent) : turn(values.prompt!));
  rl.close();
  process.exit(0);
}

const extras = (toolsets.length ? ` · with ${toolsets.join(",")} · vision ${vision.mode === "proxy" ? vision.llm.model : vision.mode}` : "") + (helper ? ` · helper ${describeHelper(helper)}` : "") + (network ? " · network on" : "") + (brevity !== "brief" ? ` · ${brevity}` : "") + (thinking !== "auto" ? ` · thinking ${thinking}` : "") + (palette ? ` · palette ${palette.name}` : "");
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

async function turn(text: string) {
  controller = new AbortController();
  status.bol = true;
  try {
    const files = staged;
    staged = [];
    const t = await buildTurn(text, files, { cwd, contextWindow: agent.contextWindow, vision, signal: controller.signal });
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

// The crew board: one line per worker, then the tasks.
function printCrew(b: CrewBoard) {
  const icon: Record<string, string> = { done: "✓", failed: "✗", doing: "▸", checking: "👁", merging: "⇢", fixing: "⚡", ready: "○", waiting: "·" };
  const say: Record<string, string> = { idle: "idle", queued: "waiting for the model", thinking: "thinking", working: "working", merging: "merging" };
  const head = b.state === "planning" ? "planning…" : b.state === "running" ? `${b.tasks.filter((t) => t.status === "done").length} of ${b.tasks.length} done` : b.note ?? b.state;
  const text = [
    `${C.bold}👥 ${b.goal}${C.reset} ${C.dim}${head}${C.reset}`,
    ...b.workers.map((w) => `  ${C.cyan}${w.name}${C.reset} ${C.dim}${w.model}${C.reset} ${say[w.state]}${w.task ? ` #${w.task}` : ""}${w.doing && w.state === "working" ? `${C.dim} · ${w.doing}${C.reset}` : ""}`),
    ...b.tasks.map((t) => `  ${icon[t.status] ?? "○"} ${t.id}. ${t.text}${t.after.length && t.status === "waiting" ? `${C.dim} (after ${t.after.map((a) => "#" + a).join(", ")})${C.reset}` : ""}${t.worker && t.status !== "ready" ? ` ${C.dim}[${t.worker}]${C.reset}` : ""}${t.note ? `${C.dim} · ${t.note}${C.reset}` : ""}`),
  ].join("\n");
  // Token counts change all the time; only a change of state reprints.
  if (text === shownBoard) return;
  shownBoard = text;
  status.say(`${status.bol ? "" : "\n"}${text}`);
}

// The task board, printed again whenever a task moves.
function printBoard(b: Board) {
  const icon = (i: number) => { const t = b.tasks[i]!; return t.status === "done" ? "✓" : t.status === "failed" ? "✗" : t.status === "checking" ? "👁" : t.status === "doing" ? "▸" : "○"; };
  const head = b.state === "planning" ? "planning…" : b.state === "running" ? `task ${b.current + 1} of ${b.tasks.length}` : b.note ?? b.state;
  const text = [`${C.bold}🤖 ${b.goal}${C.reset} ${C.dim}${head}${C.reset}`, ...b.tasks.map((t, i) => `  ${icon(i)} ${i + 1}. ${t.text}${t.tries > 1 ? ` (try ${t.tries})` : ""}${t.note ? `${C.dim} · ${t.note}${C.reset}` : ""}`)].join("\n");
  if (text === shownBoard) return;
  shownBoard = text;
  status.say(`${status.bol ? "" : "\n"}${text}`);
}

async function goal(text: string, asCrew = false) {
  controller = new AbortController();
  status.bol = true;
  shownBoard = "";
  try {
    const show = (b: Board | CrewBoard) => ("kind" in b ? printCrew(b) : printBoard(b));
    const b = asCrew
      ? await runCrew(agent, text, { board: show }, { crew, settings: goalSettings, signal: controller.signal, probed })
      : await runGoal(agent, text, { board: printBoard }, { settings: goalSettings, signal: controller.signal });
    if (b.note) io.note(b.note);
  } catch (e) {
    console.log(`\n${C.yellow}error: ${(e as Error).message}${C.reset}`);
  } finally {
    status.stop();
    controller = null;
    await save();
  }
}

// The research lab: the study's picture, printed again whenever it moves.
async function study(question: string) {
  controller = new AbortController();
  status.bol = true;
  shownStudy = "";
  const show = (s: Study) => {
    const text = `${C.bold}🔬 ${s.question}${C.reset} ${C.dim}${s.state}${C.reset}\n${formatStudy(s)}`;
    if (text === shownStudy) return;
    shownStudy = text;
    status.say(`${status.bol ? "" : "\n"}${text}`);
  };
  try {
    const s = await runStudy(agent, question, { study: show }, { settings: labSettings(await loadLab()), instruments: await discover({ network: agent.network, capture: ffmpegCapture() }), signal: controller.signal });
    if (s.answer) console.log(`\n${s.answer}\n`);
    io.note(`${s.note ?? ""}\nLab notebook: ${join(s.dir, "report.html")}`);
  } catch (e) {
    console.log(`\n${C.yellow}error: ${(e as Error).message}${C.reset}`);
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
    case "/auto": {
      const want = arg ? parseMode(cmd === "/auto" && ["on", "off"].includes(arg) ? (arg === "on" ? "yolo" : "ask") : arg) : undefined;
      if (arg && !want) return console.log(cmd === "/auto" ? "usage: /auto on | off" : "usage: /mode ask | auto-edit | yolo");
      if (want) {
        permissions.mode = want;
        await saveMode(want);
      }
      return console.log(`mode: ${permissions.mode} (${MODE_SAY[permissions.mode]})`);
    }
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
    case "/lab": {
      const q = line.slice(cmd!.length).trim();
      if (q) return study(q);
      return console.log("Research lab: /lab <question>. `maxx lab` lists the instruments; settings are in ~/.maxx/lab.json.");
    }
    case "/agent": {
      const g = line.slice(cmd!.length).trim();
      if (g) return goal(g);
      const s = goalSettings;
      return console.log(`Agent mode: /agent <goal>. Up to ${s.maxTasks} tasks, ${s.stepsPerTask} steps per try, ${s.tries} tries per task, screenshot judge ${s.judge ? "on" : "off"}, project map ${s.mapTokens} tokens, ask first ${s.briefing ? "on" : "off"}, questions wait ${s.askMinutes ? `${s.askMinutes} min` : "for ever"}.`);
    }
    case "/crew": {
      const g = line.slice(cmd!.length).trim();
      if (g) return goal(g, true);
      return console.log(`Crew mode: /crew <goal>. ${crew.workers} workers on ${crew.models.length ? crew.models.join(", ") : llm.model}, up to ${crew.maxTasks} tasks, ${crew.slots ? `${crew.slots} request(s) at once per model` : "requests at once measured at the start"}, final check ${crew.finalCheck ? "on" : "off"}. Each task uses Agent mode's budgets (/agent).`);
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
    case "/recipe":
    case "/recipes": {
      // List them, show one, or record the last task as a new one.
      const [sub, ...rest] = line.slice(cmd!.length).trim().split(/\s+/).filter(Boolean);
      if (sub === "save") {
        console.log("(writing a recipe from this session...)");
        const { recipe, path } = await agent.recordRecipe(rest.join(" "));
        return console.log(`saved recipe ${recipe.name} (${recipe.when})\n  ${path}\n  edit the file to tune it; Maxx offers it for similar tasks`);
      }
      const all = await loadRecipes(cwd);
      if (sub) {
        const r = closest(all, sub);
        return console.log(r ? `${r.name} (${r.from}): ${r.when}\n\n${r.body}` : `no recipe called ${sub}`);
      }
      for (const r of all) console.log(`  ${r.name.padEnd(22)} ${r.when}  (${r.from})`);
      return console.log("  /recipe <name> shows one; /recipe save [what it is for] records the last task as a recipe");
    }
    case "/tools": {
      const names = agent.toolNames;
      const off = Object.keys(TOOLSETS).filter((n) => !agent.toolsets.includes(n));
      const mcp = await mcpHub.status({ network: agent.network, cwd });
      const own = new Set(mcp.flatMap((m) => m.tools.map((t) => `${m.label}_${t.name}`.replace(/[^\w-]/g, "_").slice(0, 64))));
      console.log(`tools (${names.length}): ${names.filter((n) => !own.has(n)).join(", ") || "none"}`);
      for (const m of mcp) {
        const on = m.tools.filter((t) => t.on);
        const say = m.state === "ready" ? `${on.length} tools: ${on.map((t) => t.name + (t.danger ? "⚠" : "")).join(", ")}` : m.state === "offline" ? "needs /network on" : m.state === "unapproved" ? `waiting for your OK (maxx mcp approve ${m.name})` : m.state === "failed" ? `failed: ${m.error}` : m.state;
        console.log(`  🔌 ${m.label}${m.source === "project" ? " (this project)" : ""}: ${say}`);
      }
      if (names.includes("mcp_more")) console.log("  mcp_more holds the MCP tools past the first 12; pick fewer per server in ~/.maxx/mcp.json (\"tools\") to list them directly");
      if (!agent.network) console.log("  /network on adds web_search, web_fetch and the MCP servers at a URL (maxx mcp list)");
      if (off.length) console.log(`  /with ${off.join(",")} adds: ${off.map((n) => `${n} (${TOOLSETS[n]!.about})`).join("; ")}`);
      return;
    }
    case "/network": {
      // Saved, so the next `maxx` and `maxx ui` start the same way.
      const on = arg === undefined ? undefined : parseSwitch(arg);
      if (arg !== undefined && on === undefined) return console.log("usage: /network on | off");
      if (on !== undefined) {
        await agent.setNetwork(on);
        await saveNetwork(on);
      }
      return console.log(agent.network ? "network: on, Maxx may look things up on the web, install packages (pip, npm...) and download files (/network off to stop)" : "network: off, no web lookups, installs or downloads (/network on to allow them)");
    }
    case "/brevity": {
      const level = arg === undefined ? undefined : parseBrevity(arg);
      if (arg !== undefined && !level) return console.log(`usage: /brevity ${BREVITY.join(" | ")}`);
      if (level) {
        await agent.setBrevity(level);
        await saveBrevity(level);
      }
      return console.log(`brevity: ${agent.brevity} (${{ brief: "short answers, no padding", normal: "the model's own style", detailed: "explanations, background and examples" }[agent.brevity]})`);
    }
    case "/thinking": {
      const level = arg === undefined ? undefined : parseThinking(arg);
      if (arg !== undefined && !level) return console.log(`usage: /thinking ${THINKING.join(" | ")}`);
      if (level) {
        await agent.setThinking(level);
        await saveThinking(level);
      }
      return console.log(`thinking: ${agent.thinking} (${THINKING_SAY[agent.thinking]})`);
    }
    case "/palette": {
      // The whole rest of the line: "/palette #264653 #2a9d8f #e9c46a".
      const spec = line.slice(cmd!.length).trim();
      if (spec === "list") {
        for (const p of presetList()) console.log(`  ${p.name.padEnd(11)} ${swatches(p)}  ${p.vibe}`);
        return console.log("  random      a fresh one every time\n  auto        the model picks\n(or any hex colors, \"#ff6600 triad\", or a coolors.co link)");
      }
      if (spec) {
        let p;
        try { p = parsePalette(spec); } catch (e) { return console.log((e as Error).message); }
        await agent.setPalette(p);
        await savePalette(p);
      }
      const p = agent.palette;
      return console.log(`palette: ${p ? `${swatches(p)} ` : ""}${describePalette(p)}${p ? "" : "  (/palette list for presets)"}`);
    }
    case "/checkpoints": {
      const list = agent.checkpoints.list();
      return console.log(list.length ? list.join("\n") : "(no checkpoints yet; one is taken before every write or command)");
    }
    case "/rewind": {
      const r = await agent.checkpoints.restore(Number(arg ?? -1));
      if (r.startsWith("restored")) agent.markUndone();
      return console.log(r);
    }
    case "/undo": return console.log(await agent.undoTurn());
    case "/rules": {
      const rest = line.slice(cmd!.length).trim();
      const rules = await loadRules(cwd);
      if (arg === "on" || arg === "off") {
        agent.setLearn(arg === "on");
        await saveLearn(arg === "on");
      } else if (arg === "add" || arg === "rm") {
        const what = rest.slice(arg.length).trim();
        const n = Number(what);
        if (arg === "rm" && !(n >= 1 && n <= rules.length)) return console.log(`usage: /rules rm <1-${rules.length || 1}>`);
        if (arg === "add" && !what) return console.log("usage: /rules add <rule>");
        await saveRules(cwd, arg === "rm" ? rules.filter((_, i) => i !== n - 1) : tidyRules([...rules, { text: what }]));
        await agent.refreshSystemPrompt();
      } else if (rest) return console.log("usage: /rules [on|off|add <rule>|rm <n>]");
      const now = await loadRules(cwd);
      console.log(`learning from corrections: ${agent.learning ? "on" : "off"}  (rules live in MAXX.md)`);
      return console.log(now.length ? now.map((r, i) => `  ${i + 1}. ${r.text}${r.times > 1 ? ` ${C.dim}x${r.times}${C.reset}` : ""}`).join("\n") : "  (no rules yet: when you correct Maxx, it writes one here)");
    }
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
