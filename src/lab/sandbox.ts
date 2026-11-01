import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { OFFLINE_ENV } from "../network.ts";

// Virtual testing: the model writes a small script per hypothesis (a
// statistic on the readings, a simulation, a model of the physics) and the
// lab runs it in the study folder with a time limit, a clean environment and,
// while network access is off, sockets blocked inside the script. Like the
// network switch, that block is a guardrail for the model, not a jail.
//
// Python when there is one (numpy and friends if installed); otherwise
// JavaScript, run by maxx.exe itself (Bun's BUN_BE_BUN), so it always works.

export type Lang = "python" | "js";
export type Runtime = { lang: Lang; cmd: string[] };
export type TestRun = { ok: boolean; code: number; output: string; ms: number; timedOut: boolean; verdict?: Verdict; metrics: Record<string, number> };
export type Verdict = { result: "supported" | "refuted" | "inconclusive"; why: string };

export function findPython(platform = process.platform, which = (b: string) => Bun.which(b), env = process.env): string[] | null {
  if (env.MAXX_PYTHON) return [env.MAXX_PYTHON];
  // The Microsoft Store's python.exe stub opens the Store instead of running.
  const real = (p: string | null) => !!p && !/WindowsApps/i.test(p);
  if (platform === "win32") {
    const py = which("py");
    if (real(py)) return [py!, "-3"];
    for (const b of ["python", "python3"]) if (real(which(b))) return [which(b)!];
    for (const v of ["313", "312", "311", "310"]) {
      const p = env.LOCALAPPDATA && join(env.LOCALAPPDATA, "Programs", "Python", `Python${v}`, "python.exe");
      if (p && existsSync(p)) return [p];
    }
    return null;
  }
  for (const b of ["python3", "python"]) if (real(which(b))) return [which(b)!];
  return null;
}

export function runtimes(): Runtime[] {
  const py = findPython();
  return [...(py ? [{ lang: "python" as const, cmd: [...py, "-I", "-X", "utf8"] }] : []), { lang: "js" as const, cmd: [process.execPath] }];
}

const PY_GUARD = `import socket as _maxx_socket
def _maxx_no_net(*a, **k):
    raise OSError("network access is off in the Maxx lab; use the data files")
_maxx_socket.socket.connect = _maxx_no_net
_maxx_socket.create_connection = _maxx_no_net
del _maxx_socket
`;
const JS_GUARD = `globalThis.fetch = () => { throw new Error("network access is off in the Maxx lab; use the data files"); };
`;

// The fenced code block in the model's answer (or all of it when it skipped the fence).
export function extractCode(text: string, lang: Lang): string | null {
  const t = text.replace(/<think>[\s\S]*?<\/think>/g, "");
  const blocks = [...t.matchAll(/```([\w+-]*)[^\n]*\n([\s\S]*?)```/g)];
  const want = lang === "python" ? /^(py|python3?)$/i : /^(js|javascript|ts|typescript|mjs)$/i;
  const block = blocks.find((b) => want.test(b[1]!)) ?? blocks.find((b) => !b[1]) ?? blocks[0];
  if (block) return block[2]!.trim();
  const open = t.match(/```[\w+-]*\n([\s\S]+)$/);
  if (open) return open[1]!.trim();
  return /\bprint\(|console\.log\(/.test(t) ? t.trim() : null;
}

// "RESULT: SUPPORTED - the slope is positive" and the METRIC lines.
export function parseOutput(out: string): { verdict?: Verdict; metrics: Record<string, number> } {
  const metrics: Record<string, number> = {};
  for (const m of out.matchAll(/^\s*METRIC:?\s+([\w.%-]+)\s*[=:]\s*([-+]?[\d.]+(?:e[-+]?\d+)?)/gim)) metrics[m[1]!] = Number(m[2]);
  const r = [...out.matchAll(/^\s*RESULT\s*:?\s*\**\s*(SUPPORTED|REFUTED|INCONCLUSIVE|TRUE|FALSE|CONFIRMED|REJECTED)\b\**\s*[-—–:,.]*\s*(.*)$/gim)].at(-1);
  if (!r) return { metrics };
  const word = r[1]!.toLowerCase();
  const result = /supported|true|confirmed/.test(word) ? "supported" : /refuted|false|rejected/.test(word) ? "refuted" : "inconclusive";
  return { verdict: { result, why: r[2]!.trim().slice(0, 300) }, metrics };
}

export async function runTest(o: { dir: string; name: string; code: string; runtime: Runtime; seconds: number; network: boolean; signal?: AbortSignal; folder?: string; needResult?: boolean }): Promise<TestRun> {
  const ext = o.runtime.lang === "python" ? "py" : "js";
  const file = join(o.dir, o.folder ?? "tests", `${o.name}.${ext}`);
  const guard = o.network ? "" : o.runtime.lang === "python" ? PY_GUARD : JS_GUARD;
  await writeFile(file, guard + o.code + "\n");
  // A clean environment: no API keys or tokens leak into model-written code.
  const keep = ["PATH", "Path", "SYSTEMROOT", "SystemRoot", "WINDIR", "TEMP", "TMP", "HOME", "USERPROFILE", "LANG", "PYTHONHOME", "LOCALAPPDATA", "APPDATA"];
  const env: Record<string, string> = Object.fromEntries(keep.filter((k) => process.env[k]).map((k) => [k, process.env[k]!]));
  Object.assign(env, o.network ? {} : OFFLINE_ENV, { PYTHONIOENCODING: "utf-8", MPLBACKEND: "Agg", MAXX_LAB: "1" });
  if (o.runtime.lang === "js") env.BUN_BE_BUN = "1";
  const started = Date.now();
  const p = Bun.spawn([...o.runtime.cmd, file], { cwd: o.dir, env, stdout: "pipe", stderr: "pipe", stdin: "ignore" });
  let timedOut = false;
  const kill = () => p.kill();
  const timer = setTimeout(() => ((timedOut = true), kill()), o.seconds * 1000);
  o.signal?.addEventListener("abort", kill);
  const [out, err] = await Promise.all([new Response(p.stdout).text(), new Response(p.stderr).text()]);
  const code = await p.exited;
  clearTimeout(timer);
  o.signal?.removeEventListener("abort", kill);
  if (o.signal?.aborted) throw Object.assign(new Error("stopped"), { name: "AbortError" });
  const output = clip(out + (err.trim() ? `\n[stderr]\n${err}` : "") + (timedOut ? `\n[stopped after ${o.seconds}s]` : ""));
  const parsed = parseOutput(out);
  return { ok: code === 0 && !timedOut && (o.needResult === false || !!parsed.verdict), code, output, ms: Date.now() - started, timedOut, ...parsed };
}

// The start and the end matter most (the RESULT line is last).
const clip = (s: string, max = 4000) => (s.length <= max ? s.trim() : `${s.slice(0, max * 0.4)}\n…\n${s.slice(-max * 0.6)}`.trim());
