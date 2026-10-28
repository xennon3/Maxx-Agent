#!/usr/bin/env bun
// Simulated test run of Maxx on an EVO-X2: a fake LM Studio with Strix Halo
// speeds, a fake Pixel 9 behind adb, and a fake Gradle. Runs the real Maxx CLI
// through three sessions in two projects for each model setup, then writes
// sim/REPORT.md with the time each step would take on the real machine.
//
//   bun sim/run.ts            all setups
//   SIM_SPEEDUP=10 bun sim/run.ts   slower, closer to real pacing

import { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { MACHINE, SETUPS, memoryCheck, type Setup } from "./profile.ts";
import { startServer } from "./server.ts";
import type { Entry } from "./ledger.ts";

const ROOT = resolve(import.meta.dir, "..");
const OUT = join(ROOT, "sim", "out");
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

type RunResult = { label: string; cmd: string; ok: boolean; wall: number; virtual: number; entries: Entry[]; transcript: string };

function script(path: string, target: string) {
  writeFileSync(path, `#!/bin/sh\nexec bun "${target}" "$@"\n`);
  chmodSync(path, 0o755);
}

async function maxx(label: string, args: string[], cwd: string, env: Record<string, string>, dir: string): Promise<RunResult> {
  const ledger = join(dir, `ledger-${label.replace(/\W+/g, "_")}.jsonl`);
  process.env.SIM_LEDGER = ledger; // the model server runs in this process
  const started = performance.now();
  const proc = Bun.spawn(["bun", join(ROOT, "src/cli.ts"), ...args], { cwd, env: { ...process.env, ...env, SIM_LEDGER: ledger, NO_COLOR: "1" }, stdout: "pipe", stderr: "pipe", stdin: "ignore" });
  const [out, err] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()]);
  await proc.exited;
  const wall = (performance.now() - started) / 1000;
  const entries: Entry[] = existsSync(ledger) ? readFileSync(ledger, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l)) : [];
  const real = entries.reduce((n, e) => n + e.real, 0), virt = entries.reduce((n, e) => n + e.virtual, 0);
  // Everything not simulated (Maxx itself, its settle waits, JPEG encoding) counts at face value.
  const virtual = wall - real + virt;
  const transcript = (out + (err.trim() ? `\n[stderr]\n${err}` : "")).replace(/\x1b\[[0-9;]*m/g, "");
  return { label, cmd: `maxx ${args.join(" ")}`, ok: proc.exitCode === 0, wall, virtual, entries, transcript };
}

async function simulate(setup: Setup, letter: string) {
  const dir = join(OUT, letter);
  mkdirSync(dir, { recursive: true });
  const mem = memoryCheck(setup);
  if (!mem.fits) return { setup, mem, runs: [] as RunResult[], sessions: "" };

  const bin = join(dir, "bin");
  mkdirSync(bin);
  script(join(bin, "adb"), join(ROOT, "sim/fake-adb.ts"));
  const app = join(dir, "projects", "tipcalc"), notes = join(dir, "projects", "notes");
  mkdirSync(app, { recursive: true });
  mkdirSync(notes, { recursive: true });
  script(join(app, "gradlew"), join(ROOT, "sim/fake-gradle.ts"));
  writeFileSync(join(app, "settings.gradle.kts"), `rootProject.name = "TipCalc"\ninclude(":app")\n`);
  writeFileSync(join(notes, "README.md"), "# Notes\n\nYou will recieve a reminder every morning.\n");
  for (const p of [app, notes]) Bun.spawnSync(["git", "init", "-q"], { cwd: p });

  const server = startServer(setup);
  const env = {
    MAXX_HOME: join(dir, "home"),
    MAXX_ADB: join(bin, "adb"),
    MAXX_BASE_URL: `http://localhost:${server.port}/v1`,
    SIM_PHONE: join(dir, "phone.json"),
  };
  const model = ["--model", setup.main.id, "--mode", "yolo", ...(setup.eyes ? ["--vision-model", setup.eyes.id] : [])];
  const runs: RunResult[] = [];
  try {
    runs.push(await maxx("1 build and test", ["-p", "Create an Android tip calculator app and test it on my phone", "--with", "android", ...model], app, env, dir));
    // No --with: the toolset comes back with the session.
    runs.push(await maxx("2 continue", ["-c", "-p", "What did we build last time? Is it still on the phone?", ...model], app, env, dir));
    runs.push(await maxx("3 other project", ["-p", "Fix the typo in the README", ...model], notes, env, dir));
  } finally {
    server.stop(true);
  }
  const s = Bun.spawnSync(["bun", join(ROOT, "src/cli.ts"), "sessions", "--all"], { cwd: app, env: { ...process.env, ...env, NO_COLOR: "1" } });
  const sessions = s.stdout.toString().replace(/\x1b\[[0-9;]*m/g, "").replaceAll(dir, "<sim>");
  for (const r of runs) writeFileSync(join(dir, `transcript-${r.label.replace(/\W+/g, "_")}.txt`), `$ ${r.cmd}\n\n${r.transcript}`);
  return { setup, mem, runs, sessions };
}

const fmt = (s: number) => (s >= 60 ? `${Math.floor(s / 60)}m ${String(Math.round(s % 60)).padStart(2, "0")}s` : `${s.toFixed(1)}s`);

const results = [];
for (const [i, setup] of SETUPS.entries()) {
  const letter = String.fromCharCode(65 + i);
  console.log(`\n== Setup ${setup.name}`);
  const r = await simulate(setup, letter);
  console.log(`   memory: ${r.mem.usedGB} GB of ${MACHINE.gpuGB} GB GPU memory: ${r.mem.fits ? "fits" : "DOES NOT FIT"}`);
  for (const run of r.runs) console.log(`   ${run.ok ? "ok  " : "FAIL"} ${run.label.padEnd(18)} ${fmt(run.virtual).padStart(8)} on the EVO-X2 (simulated in ${run.wall.toFixed(1)}s)`);
  results.push(r);
}

// The report.
const lines: string[] = [
  `# Maxx on a simulated ${MACHINE.name}`,
  "",
  `Generated by \`bun sim/run.ts\`. The real Maxx CLI ran against a simulated LM Studio, phone (adb) and Gradle; times are what each step would take on the EVO-X2 according to the profile in \`sim/profile.ts\`.`,
  "",
  "## Setups",
  "",
  "| Setup | Models | GPU memory | Task 1: build + crash + fix + test | Task 2: resume | Task 3: other project |",
  "| --- | --- | --- | --- | --- | --- |",
];
for (const r of results) {
  const t = (i: number) => (r.runs[i] ? `${r.runs[i]!.ok ? "" : "FAILED "}${fmt(r.runs[i]!.virtual)}` : "n/a");
  lines.push(`| ${r.setup.name} | ${r.mem.models.map((m) => `${m.label} (${m.pp} pp / ${m.tg} tg tok/s)`).join(" + ")} | ${r.mem.usedGB} / ${MACHINE.gpuGB} GB ${r.mem.fits ? "✅" : "❌ does not fit"} | ${t(0)} | ${t(1)} | ${t(2)} |`);
}
for (const [i, r] of results.entries()) {
  if (!r.runs.length) continue;
  lines.push("", `## Setup ${r.setup.name}: where the time goes in task 1`, "", "| # | Who | Step | EVO-X2 time | Detail |", "| --- | --- | --- | --- | --- |");
  r.runs[0]!.entries.forEach((e, n) => {
    const x = e.extra as any;
    const detail = x ? `${x.fresh} new + ${x.cached} cached tokens${x.images ? `, ${x.images} image(s) = ${x.imageTok} tok` : ""}, ${x.outTokens}+${x.think} out` : "";
    lines.push(`| ${n + 1} | ${e.who} | ${e.what} | ${fmt(e.virtual)} | ${detail} |`);
  });
  const by = (who: string) => r.runs[0]!.entries.filter((e) => e.who === who).reduce((s, e) => s + e.virtual, 0);
  lines.push("", `Model ${fmt(by("model"))}, vision model ${fmt(by("eyes"))}, Gradle ${fmt(by("gradle"))}, phone ${fmt(by("phone"))}. Transcripts: \`sim/out/${String.fromCharCode(65 + i)}/\`.`);
}
const withSessions = results.find((r) => r.sessions);
if (withSessions) lines.push("", "## Sessions after the run (`maxx sessions --all`)", "", "```", withSessions.sessions.trim(), "```");
lines.push(
  "",
  "## Assumptions",
  "",
  `- ${MACHINE.gpuGB} GB of the 64 GB is given to the GPU in the BIOS; 16 GB stays with Windows, Gradle and Maxx.`,
  "- Speeds are scaled from published llama.cpp Strix Halo results (Qwen2.5-32B Q4_K_M: 242 pp / 11.3 tg; Qwen3-30B-A3B Q4_K_M: 1142 pp / 86.1 tg, Vulkan). Prefill slows by up to 35% as the context fills.",
  "- Thinking: each step includes hidden reasoning tokens (220 for Qwen3.8-27B, 90 for AgentWorld). With thinking off, setup A gets roughly twice as fast.",
  "- LM Studio reuses the cached prompt prefix between steps, so each step only prefills what is new.",
  "- Images cost one token per 32×32 pixels (Qwen-VL patching); a 576×1280 screenshot is about 720 tokens.",
  "- Gradle: 75 s for a cold first build, 14 s incremental (warm daemon, dependencies cached). The first download of Gradle and the Android SDK packages is not included.",
  "- The model's decisions are scripted (sim/brain.ts) from what Maxx sends it; this tests Maxx's plumbing and timing, not how clever a real model is.",
);
writeFileSync(join(ROOT, "sim", "REPORT.md"), lines.join("\n") + "\n");
console.log(`\nreport: ${join(ROOT, "sim", "REPORT.md")}`);
process.exit(results.every((r) => r.runs.every((x) => x.ok)) ? 0 : 1);
