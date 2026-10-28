import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

// Every device command goes through one swappable runner, so tests can fake
// adb and PowerShell without a phone or a Windows desktop.
export type RunResult = { code: number | null; stdout: Uint8Array; stderr: string };
export type Runner = (argv: string[], opts?: { timeout?: number; cwd?: string }) => Promise<RunResult>;

const spawnRunner: Runner = async (argv, { timeout = 60, cwd } = {}) => {
  const proc = Bun.spawn(argv, { cwd, stdout: "pipe", stderr: "pipe", stdin: "ignore" });
  const timer = setTimeout(() => proc.kill(), timeout * 1000);
  const [out, err] = await Promise.all([new Response(proc.stdout).arrayBuffer(), new Response(proc.stderr).text()]);
  await proc.exited;
  clearTimeout(timer);
  return { code: proc.exitCode, stdout: new Uint8Array(out), stderr: err };
};

let runner: Runner = spawnRunner;
export const run: Runner = (argv, opts) => runner(argv, opts);
export function setRunner(r: Runner | null) {
  runner = r ?? spawnRunner;
}

export const text = (r: RunResult) => new TextDecoder().decode(r.stdout);

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Replays: every action that changes a device is appended to a JSONL file in
// device pixels, so `maxx replay <file>` can re-run a test the agent explored.
export type ReplayStep =
  | { kind: "adb"; args: string[]; note?: string }
  | { kind: "launch"; package: string }
  | { kind: "desktop"; action: string; args: Record<string, unknown>; note?: string };

let replayFile: string | null = null;
export function recordTo(file: string | null) {
  replayFile = file;
}
export async function record(step: ReplayStep) {
  if (!replayFile) return;
  await mkdir(dirname(replayFile), { recursive: true });
  await appendFile(replayFile, JSON.stringify({ ...step, t: Date.now() }) + "\n");
}
