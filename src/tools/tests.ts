import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { defineTool } from "./types.ts";
import { inside } from "./paths.ts";
import { shell } from "../shell.ts";
import { OFFLINE_ENV } from "../network.ts";

// run_tests: find the project's test runner, run it, and hand back only what
// a model needs, which is whether it passed and, if not, each failure with a
// few lines around it. A raw Gradle or pytest log is thousands of lines;
// a 16K-context model drowns in it and fixes the wrong thing.

export type Runner = { name: string; command: string; filter?: (f: string) => string };

const has = (dir: string, f: string) => existsSync(join(dir, f));
const read = (dir: string, f: string) => {
  try {
    return readFileSync(join(dir, f), "utf8");
  } catch {
    return "";
  }
};

export function detectRunner(dir: string, kind: "bash" | "powershell" = shell().kind): Runner | null {
  if (has(dir, "package.json")) {
    let pkg: { scripts?: Record<string, string> } = {};
    try {
      pkg = JSON.parse(read(dir, "package.json"));
    } catch {}
    const script = pkg.scripts?.test;
    const pm = has(dir, "bun.lock") || has(dir, "bun.lockb") ? "bun" : has(dir, "pnpm-lock.yaml") ? "pnpm" : has(dir, "yarn.lock") ? "yarn" : "npm";
    const real = script && !/no test specified/.test(script);
    if (real) {
      const sep = pm === "npm" ? " -- " : " ";
      return { name: `${pm} test (${script})`, command: `${pm} ${pm === "bun" ? "run " : ""}test`, filter: (f) => `${pm} ${pm === "bun" ? "run " : ""}test${sep}${quote(f)}` };
    }
    if (pm === "bun") return { name: "bun test", command: "bun test", filter: (f) => `bun test ${quote(f)}` };
  }
  if (has(dir, "pytest.ini") || has(dir, "conftest.py") || /pytest/.test(read(dir, "pyproject.toml") + read(dir, "requirements.txt") + read(dir, "setup.cfg")) || (has(dir, "tests") && !has(dir, "package.json") && !has(dir, "Cargo.toml"))) {
    return { name: "pytest", command: "python -m pytest -q", filter: (f) => `python -m pytest -q -k ${quote(f)}` };
  }
  if (has(dir, "Cargo.toml")) return { name: "cargo test", command: "cargo test", filter: (f) => `cargo test ${quote(f)}` };
  if (has(dir, "go.mod")) return { name: "go test", command: "go test ./...", filter: (f) => `go test ./... -run ${quote(f)}` };
  if (has(dir, "gradlew") || has(dir, "gradlew.bat")) {
    const g = kind === "powershell" ? ".\\gradlew.bat" : "./gradlew";
    return { name: "gradle test", command: `${g} test --console=plain`, filter: (f) => `${g} test --console=plain --tests ${quote(f)}` };
  }
  if (has(dir, "pom.xml")) return { name: "maven", command: "mvn -q test", filter: (f) => `mvn -q test -Dtest=${quote(f)}` };
  if (has(dir, "Makefile") && /^test:/m.test(read(dir, "Makefile"))) return { name: "make test", command: "make test" };
  return null;
}

const quote = (s: string) => (/^[\w./:=-]+$/.test(s) ? s : `"${s.replace(/"/g, '\\"')}"`);

// Lines that start or mark a failure, across bun/jest/vitest, pytest, cargo, go, gradle/JUnit and mocha.
const FAIL_LINE = /(\(fail\)|✗|✕|×\s|\bFAIL(ED)?\b|\bfailed\b.*\btests?\b|^E\s{2,}|AssertionError|Error:|panicked at|--- FAIL|Expected:|Received:|expected .* (but|to)|Traceback|> Task .*FAILED|Tests? .*FAILED|\bat .*\(.*:\d+:\d+\)|^\s+at .*:\d+|\.(test|spec)\.\w+:\d+)/i;
const SUMMARY = /(\d+\s+(pass(ed)?|fail(ed)?|errors?|skipped|tests?)\b.*){1,}|test result:|Tests run:|BUILD (SUCCESSFUL|FAILED)|^ok\s+\S+|^FAIL\s+\S+\s+[\d.]+s|Ran \d+ tests?/i;
const NOISE = /^\s*(\(pass\)|✓|✔|PASSED|ok \d|\.+$|=+ test session starts|platform |rootdir|collected \d+|plugins:|cachedir|> Task .*(UP-TO-DATE|NO-SOURCE|SKIPPED)|Download|Downloading)/i;

export function summarizeTests(output: string, exitCode: number | null, maxLines = 70): string {
  const lines = output.replace(/\x1b\[[0-9;]*m/g, "").split(/\r?\n/);
  const summary = [...new Set(lines.filter((l) => SUMMARY.test(l) && l.trim().length < 200).map((l) => l.trim()))].slice(-4);
  if (exitCode === 0) return `PASSED${summary.length ? `\n${summary.join("\n")}` : ""}`;
  const keep = new Set<number>();
  lines.forEach((l, i) => {
    if (!FAIL_LINE.test(l) || NOISE.test(l)) return;
    for (let j = Math.max(0, i - 2); j <= Math.min(lines.length - 1, i + 6); j++) keep.add(j);
  });
  const out: string[] = [];
  let last = -2;
  for (const i of [...keep].sort((a, b) => a - b)) {
    if (NOISE.test(lines[i]!) || !lines[i]!.trim()) continue;
    if (i > last + 1 && out.length) out.push("  ...");
    out.push(lines[i]!.slice(0, 220));
    last = i;
  }
  let body = out.length ? out : lines.filter((l) => l.trim() && !NOISE.test(l)).slice(-30);
  if (body.length > maxLines) body = [...body.slice(0, maxLines - 10), `  ... ${body.length - maxLines + 10} more lines ...`, ...body.slice(-10)];
  return [`FAILED (exit code ${exitCode ?? "killed"})`, ...(summary.length ? ["Summary: " + summary.join(" | ")] : []), "Failures:", ...body].join("\n");
}

export const runTests = defineTool({
  name: "run_tests",
  description:
    "Run the project's tests (finds bun/npm/pnpm/yarn, pytest, cargo, go, Gradle, Maven or make) and return PASSED or just the failures with their file and line. Use this instead of bash for tests. Set filter to run one test or file.",
  schema: z.object({
    filter: z.string().optional().describe("Only tests whose name or file matches this"),
    command: z.string().optional().describe("Test command to use when the runner is not detected"),
    dir: z.string().optional().describe("Folder with the tests, relative to the project (default: the project)"),
    timeout: z.number().int().min(10).max(1800).optional().describe("Seconds before the run is stopped, default 300"),
  }),
  risk: "exec",
  ruleKey: (a) => `run_tests ${a.command ?? ""}`.trim(),
  preview: (a, { cwd }) => {
    const r = detectRunner(a.dir ? join(cwd, a.dir) : cwd);
    return `${shell().kind === "powershell" ? "PS>" : "$"} ${a.command ?? (a.filter && r?.filter ? r.filter(a.filter) : r?.command ?? "(no test runner found)")}`;
  },
  async run({ filter, command, dir, timeout = 300 }, ctx) {
    const where = dir ? inside(ctx.cwd, dir) : ctx.cwd;
    const r = detectRunner(where);
    const cmd = command ?? (filter && r?.filter ? r.filter(filter) : r?.command);
    if (!cmd) return "error: no test runner found (no package.json test script, pytest, Cargo.toml, go.mod, gradlew, pom.xml or Makefile test target). Pass command, or write tests first.";
    const env = ctx.network === false ? { ...process.env, ...OFFLINE_ENV, CI: "1", FORCE_COLOR: "0" } : { ...process.env, CI: "1", FORCE_COLOR: "0" };
    const proc = Bun.spawn(shell().args(cmd), { cwd: where, env, stdout: "pipe", stderr: "pipe", stdin: "ignore" });
    let killed = false;
    const timer = setTimeout(() => ((killed = true), proc.kill()), timeout * 1000);
    const [out, err] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()]);
    await proc.exited;
    clearTimeout(timer);
    const head = `$ ${cmd}${r && !command ? `  (${r.name})` : ""}\n`;
    if (killed) return head + `stopped after ${timeout}s. ${summarizeTests(out + "\n" + err, 1)}\nhint: a test may be waiting forever (a server, an open handle, a prompt), or raise timeout.`;
    if (/command not found|is not recognized|No module named pytest/.test(err) && proc.exitCode !== 0) return head + `error: the test runner is not installed.\n${err.trim().split("\n").slice(-3).join("\n")}`;
    return head + summarizeTests(out + "\n" + err, proc.exitCode);
  },
});
