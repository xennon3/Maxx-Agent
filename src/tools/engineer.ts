import { existsSync, readFileSync, statSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, relative } from "node:path";
import { z } from "zod";
import { defineTool, type Tool } from "./types.ts";
import { inside } from "./paths.ts";
import { IGNORE, toPosix } from "./list.ts";
import { shell } from "../shell.ts";
import { OFFLINE_ENV } from "../network.ts";
import { detectRunner, summarizeTests } from "./tests.ts";
import { git } from "./git.ts";
import { codeNav, renameSymbol } from "./symbols.ts";
import { zip } from "../zip.ts";

// The engineer toolset: tools a senior developer reaches for when the easy
// path runs out. probe (print debugging without the mess), bisect (which commit
// broke it), mutate (do the tests actually catch bugs?), release (build,
// changelog and a zip), plus code_nav and rename_symbol.

type Run = { code: number | null; out: string; ms: number; killed: boolean };

export async function runCmd(cmd: string, cwd: string, timeoutS: number, network?: boolean): Promise<Run> {
  const env = { ...process.env, ...(network === false ? OFFLINE_ENV : {}), CI: "1", FORCE_COLOR: "0" };
  const t0 = Date.now();
  const proc = Bun.spawn(shell().args(cmd), { cwd, env, stdout: "pipe", stderr: "pipe", stdin: "ignore" });
  let killed = false;
  const timer = setTimeout(() => ((killed = true), proc.kill()), timeoutS * 1000);
  const [out, err] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()]);
  await proc.exited;
  clearTimeout(timer);
  return { code: killed ? null : proc.exitCode, out: out + (err ? `\n${err}` : ""), ms: Date.now() - t0, killed };
}

const testCommand = (cwd: string, given?: string) => given ?? detectRunner(cwd)?.command;

// ---- probe ----

export const MARK = "@@MAXX_PROBE@@";

export function probeLine(ext: string, indent: string, line: number, values: string[]): string | null {
  const tag = `${MARK} L${line}`;
  const q = (s: string) => JSON.stringify(s);
  switch (ext) {
    case ".js": case ".jsx": case ".ts": case ".tsx": case ".mjs": case ".cjs":
      return `${indent}try { console.log(${q(tag)}, JSON.stringify({ ${values.map((v) => `${q(v)}: ${v}`).join(", ")} })); } catch (__e) { console.log(${q(tag)}, "probe error: " + __e); }`;
    case ".py":
      return `${indent}print(${q(tag)}, ${values.map((v) => `${q(v + " =")}, repr(${v})`).join(", ")}, flush=True)`;
    case ".kt": case ".kts":
      return `${indent}println(${q(tag + " ")} + ${values.map((v) => `${q(v + "=")} + (${v}) + " "`).join(" + ")})`;
    case ".java":
      return `${indent}System.out.println(${q(tag + " ")} + ${values.map((v) => `${q(v + "=")} + (${v}) + " "`).join(" + ")});`;
    case ".go":
      return `${indent}println(${q(tag)}, ${values.map((v) => `${q(v + "=")}, ${v}`).join(", ")})`;
    case ".rs":
      return `${indent}eprintln!("${tag} ${values.map((v) => `${v.replace(/"/g, "")}={:?}`).join(" ")}", ${values.join(", ")});`;
    case ".cs":
      return `${indent}System.Console.WriteLine(${q(tag + " ")} + ${values.map((v) => `${q(v + "=")} + (${v}) + " "`).join(" + ")});`;
  }
  return null;
}

// What the probes printed: how often each fired, and the first and last values.
export function probeReport(out: string): string {
  const hits = out.split(/\r?\n/).filter((l) => l.includes(MARK)).map((l) => l.slice(l.indexOf(MARK) + MARK.length).trim());
  if (!hits.length) return "The probe never ran: that line was not reached by this command (or the program crashed before it).";
  const byLine = new Map<string, string[]>();
  for (const h of hits) {
    const [l, ...rest] = h.split(" ");
    byLine.set(l!, [...(byLine.get(l!) ?? []), rest.join(" ")]);
  }
  const parts: string[] = [];
  for (const [l, vals] of byLine) {
    const show = vals.length <= 8 ? vals : [...vals.slice(0, 4), `... ${vals.length - 6} more ...`, ...vals.slice(-2)];
    parts.push(`${l} ran ${vals.length} time(s):\n${show.map((v) => `  ${v.slice(0, 300)}`).join("\n")}`);
  }
  return parts.join("\n");
}

export const probe = defineTool({
  name: "probe",
  description:
    "Debug by looking inside: shows the values of variables at a line while a command runs (the tests by default), then removes the probe. Like a breakpoint for print debugging. values are expressions valid at that line.",
  schema: z.object({
    path: z.string(),
    line: z.number().int().min(1).describe("Probe runs just before this line"),
    values: z.array(z.string()).min(1).max(8).describe('Variables or expressions, e.g. ["total", "items.length"]'),
    command: z.string().optional().describe("What to run, default the project's tests"),
    timeout: z.number().int().min(5).max(900).optional().describe("Seconds, default 120"),
  }),
  risk: "exec",
  ruleKey: (a) => `probe ${a.command ?? ""}`.trim(),
  preview: (a) => `probe ${a.values.join(", ")} at ${a.path}:${a.line}, run ${a.command ?? "the tests"}, then remove the probe`,
  async run({ path, line, values, command, timeout = 120 }, ctx) {
    const abs = inside(ctx.cwd, path);
    if (!existsSync(abs)) return `error: ${path} does not exist`;
    const cmd = testCommand(ctx.cwd, command);
    if (!cmd) return "error: no test command found; pass command (e.g. node app.js)";
    const original = await readFile(abs, "utf8");
    const lines = original.split("\n");
    if (line > lines.length) return `error: ${path} has only ${lines.length} lines`;
    const target = lines[line - 1]!;
    const indent = /^\s*/.exec(target)![0];
    const p = probeLine(extname(abs).toLowerCase(), indent, line, values);
    if (!p) return `error: probe supports JS/TS, Python, Kotlin, Java, Go, Rust and C# files; add a print by hand for ${extname(abs)}`;
    lines.splice(line - 1, 0, p);
    try {
      await writeFile(abs, lines.join("\n"));
      const r = await runCmd(cmd, ctx.cwd, timeout, ctx.network);
      const status = r.killed ? `stopped after ${timeout}s` : `exit code ${r.code}`;
      const tail = r.code === 0 ? "" : `\n\nOutput (${status}), without the probe lines:\n${summarizeTests(r.out.split("\n").filter((l) => !l.includes(MARK)).join("\n"), r.code)}`;
      return `$ ${cmd}  (${status})\nProbe at ${path}:${line} \`${target.trim().slice(0, 100)}\`\n${probeReport(r.out)}${tail}`;
    } finally {
      await writeFile(abs, original);
    }
  },
});

// ---- bisect ----

export function firstBad(out: string): string | null {
  const m = /^([0-9a-f]{7,40}) is the first bad commit/m.exec(out);
  return m ? m[1]! : null;
}

export const bisect = defineTool({
  name: "bisect",
  description:
    "Find the commit that broke something: give a commit or tag that was good (and optionally the bad one, default HEAD). Runs the tests (or command) on commits in between with git bisect and names the first bad commit with its changes.",
  schema: z.object({
    good: z.string().describe("A commit, tag or branch where it still worked, e.g. HEAD~20 or v1.2"),
    bad: z.string().optional().describe("Where it is broken, default HEAD"),
    command: z.string().optional().describe("Exits 0 when things work; default the project's tests"),
  }),
  risk: "exec",
  checkpoint: false,
  ruleKey: (a) => `bisect ${a.command ?? ""}`.trim(),
  preview: (a) => `git bisect between ${a.good} (good) and ${a.bad ?? "HEAD"} (bad), testing with ${a.command ?? "the tests"}`,
  async run({ good, bad = "HEAD", command }, ctx) {
    const cwd = ctx.cwd;
    if ((await git(cwd, ["rev-parse", "--is-inside-work-tree"])).out !== "true") return "error: not a git repository";
    if ([good, bad].some((r) => /^-/.test(r))) return "error: good and bad must be commits, not options";
    const dirty = (await git(cwd, ["status", "--porcelain", "--untracked-files=no"])).out;
    if (dirty) return "error: there are uncommitted changes; commit them (git_commit) or undo them first, because bisect checks out old commits";
    const cmd = testCommand(cwd, command);
    if (!cmd) return "error: no test command found; pass command, e.g. a script that exits 1 when the bug shows";
    const branch = (await git(cwd, ["rev-parse", "--abbrev-ref", "HEAD"])).out;
    try {
      const start = await git(cwd, ["bisect", "start", bad, good]);
      if (!start.ok) return `error: ${start.out}`;
      const r = await git(cwd, ["bisect", "run", ...shell().args(cmd)]);
      const sha = firstBad(r.out);
      if (!sha) return `bisect did not find a single bad commit.\n${r.out.split("\n").slice(-12).join("\n")}\nhint: check that the test fails at ${bad} and passes at ${good}.`;
      const show = await git(cwd, ["show", "--stat", "--date=short", "--pretty=format:%h %ad %an%n%s%n%n%b", sha]);
      const steps = (r.out.match(/^Bisecting:/gm) ?? []).length;
      return `First bad commit (found in ${steps + 1} test runs):\n${show.out.trim()}\n\nNext: git with action show and ref ${sha.slice(0, 9)} to read its diff.`;
    } finally {
      await git(cwd, ["bisect", "reset", branch === "HEAD" ? "HEAD" : branch]);
    }
  },
});

// ---- mutate ----

export type Mutant = { line: number; from: string; to: string };
const SWAPS: [RegExp, string, string][] = [
  [/ <= /, " <= ", " < "], [/ >= /, " >= ", " > "], [/ < /, " < ", " <= "], [/ > /, " > ", " >= "],
  [/ === /, " === ", " !== "], [/ !== /, " !== ", " === "], [/ == /, " == ", " != "], [/ != /, " != ", " == "],
  [/ && /, " && ", " || "], [/ \|\| /, " || ", " && "], [/ and /, " and ", " or "], [/ or /, " or ", " and "],
  [/ \+ (?![+=])/, " + ", " - "], [/ - (?![-=])/, " - ", " + "], [/\btrue\b/, "true", "false"], [/\bfalse\b/, "false", "true"], [/\bTrue\b/, "True", "False"], [/\bFalse\b/, "False", "True"],
  [/ \* /, " * ", " / "],
];

export function mutants(text: string, max = 15): Mutant[] {
  const all: Mutant[] = [];
  text.split("\n").forEach((l, i) => {
    const code = l.replace(/(["'`])(?:\\.|(?!\1).)*\1/g, (s) => " ".repeat(s.length)); // blank out strings
    if (/^\s*(\/\/|#|\*|\/\*|import |from |package |using |export \{|require\()/.test(l) || /\b(console\.log|print|println|logger?\.)/.test(l)) return;
    for (const [re, from, to] of SWAPS) {
      const m = re.exec(code);
      if (m) {
        all.push({ line: i + 1, from, to });
        break;
      }
    }
  });
  if (all.length <= max) return all;
  // Spread over the file instead of the first screenful.
  return Array.from({ length: max }, (_, k) => all[Math.floor((k * all.length) / max)]!);
}

export function applyMutant(text: string, m: Mutant): string {
  const lines = text.split("\n");
  const l = lines[m.line - 1];
  if (l === undefined) return text;
  // Look in the code with strings blanked out, so a "<" inside a string is never touched.
  const code = l.replace(/(["'`])(?:\\.|(?!\1).)*\1/g, (s) => "\u0000".repeat(s.length));
  const i = m.from.startsWith(" ") ? code.indexOf(m.from) : (new RegExp(`\\b${m.from}\\b`).exec(code)?.index ?? -1);
  if (i < 0) return text;
  lines[m.line - 1] = l.slice(0, i) + m.to + l.slice(i + m.from.length);
  return lines.join("\n");
}

export const mutate = defineTool({
  name: "mutate",
  description:
    "Check whether the tests really protect a file: makes small bugs in it one at a time (< becomes <=, && becomes ||, true becomes false...) and runs the tests after each. Bugs the tests don't catch show where a test is missing. The file is always restored.",
  schema: z.object({
    path: z.string().describe("The source file to test (not a test file)"),
    max: z.number().int().min(1).max(40).optional().describe("How many bugs to try, default 12"),
    command: z.string().optional().describe("Test command, default the project's tests (a filter for this file's tests makes it faster)"),
  }),
  risk: "exec",
  ruleKey: (a) => `mutate ${a.command ?? ""}`.trim(),
  preview: (a) => `try up to ${a.max ?? 12} small bugs in ${a.path}, running ${a.command ?? "the tests"} after each, then restore it`,
  async run({ path, max = 12, command }, ctx) {
    const abs = inside(ctx.cwd, path);
    if (!existsSync(abs)) return `error: ${path} does not exist`;
    const cmd = testCommand(ctx.cwd, command);
    if (!cmd) return "error: no test command found; pass command";
    const original = await readFile(abs, "utf8");
    const ms = mutants(original, max);
    if (!ms.length) return `no operators to mutate in ${path} (no comparisons, logic or arithmetic found)`;
    const base = await runCmd(cmd, ctx.cwd, 600, ctx.network);
    if (base.code !== 0) return `The tests already fail before any change, so mutation testing can't judge them. Fix them first.\n${summarizeTests(base.out, base.code)}`;
    const limit = Math.max(30, Math.ceil((base.ms * 3) / 1000) + 10);
    const survived: (Mutant & { code: string })[] = [];
    let killed = 0;
    const lines = original.split("\n");
    try {
      for (const m of ms) {
        const changed = applyMutant(original, m);
        if (changed === original) continue;
        await writeFile(abs, changed);
        const r = await runCmd(cmd, ctx.cwd, limit, ctx.network);
        if (r.code === 0) survived.push({ ...m, code: lines[m.line - 1]!.trim().slice(0, 120) });
        else killed++;
      }
    } finally {
      await writeFile(abs, original);
    }
    const total = killed + survived.length;
    const score = total ? Math.round((killed / total) * 100) : 0;
    return [
      `Mutation score ${score}%: the tests caught ${killed} of ${total} small bugs in ${path} (each run about ${Math.round(base.ms / 1000)}s).`,
      survived.length
        ? `Not caught, so no test checks these:\n${survived.map((s) => `- line ${s.line}: \`${s.code}\` with "${s.from.trim()}" changed to "${s.to.trim()}"`).join("\n")}\nWrite a test for each that fails when that change is made (often an edge case: the boundary value, the empty list, the false branch).`
        : "Every bug was caught. These tests protect this file well.",
      `${path} is back as it was.`,
    ].join("\n");
  },
});

// ---- release ----

export function bumpGradle(text: string, version?: string): { text: string; code?: number; name?: string } {
  let code: number | undefined, name: string | undefined;
  let t = text.replace(/(versionCode\s*=?\s*)(\d+)/, (_, a, n) => ((code = Number(n) + 1), `${a}${code}`));
  if (version) t = t.replace(/(versionName\s*=?\s*)["'][^"']*["']/, (_, a) => ((name = version), `${a}"${version}"`));
  return { text: t, code, name };
}

export async function changelog(cwd: string): Promise<{ since: string; lines: string[] }> {
  const tag = await git(cwd, ["describe", "--tags", "--abbrev=0"]);
  const range = tag.ok ? [`${tag.out}..HEAD`] : ["-30"];
  const log = await git(cwd, ["log", ...range, "--no-merges", "--pretty=format:%s"]);
  const lines = log.ok && log.out ? log.out.split("\n").filter((l) => l && !/^(wip|fixup!|squash!)/i.test(l)) : [];
  return { since: tag.ok ? tag.out : "", lines };
}

function webFiles(root: string): string[] {
  const out: string[] = [];
  for (const f of new Bun.Glob("**/*").scanSync({ cwd: root, dot: false })) {
    const rel = toPosix(f);
    if (IGNORE.test(rel) || /^(releases|node_modules|icons\/android|sim|test|tests)\//.test(rel) || /\.(md|ts|tsx|map|lock|log|py|kt|gradle)$|^package(-lock)?\.json$|^tsconfig/.test(rel)) continue;
    out.push(rel);
  }
  return out.sort();
}

const kb = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export const release = defineTool({
  name: "release",
  description:
    "Ship a build: bumps the version, writes the changelog from the git history, builds (Android release APK, or the web build), and for the web packs a zip with index.html at its root (ready for itch.io or Netlify). Reports where the output is and how big.",
  schema: z.object({
    target: z.enum(["auto", "web", "android"]).optional().describe("Default auto: android when there is a gradlew"),
    version: z.string().optional().describe("New version, e.g. 1.2.0"),
    aab: z.boolean().optional().describe("Android: build an App Bundle for Google Play instead of an APK"),
  }),
  risk: "exec",
  ruleKey: (a) => `release ${a.target ?? "auto"}`,
  preview: (a) => `release ${a.target ?? "auto"}${a.version ? ` ${a.version}` : ""}: changelog, build${a.target === "android" ? "" : ", zip"}`,
  async run({ target = "auto", version, aab }, ctx) {
    const cwd = ctx.cwd;
    const kind = target !== "auto" ? target : existsSync(join(cwd, "gradlew")) || existsSync(join(cwd, "gradlew.bat")) ? "android" : "web";
    const notes: string[] = [];
    const date = new Date().toISOString().slice(0, 10);
    // Version.
    let ver = version;
    if (kind === "android") {
      const f = ["app/build.gradle.kts", "app/build.gradle"].map((p) => join(cwd, p)).find(existsSync);
      if (f) {
        const b = bumpGradle(await readFile(f, "utf8"), version);
        await writeFile(f, b.text);
        if (b.code) notes.push(`versionCode → ${b.code}${b.name ? `, versionName → ${b.name}` : ""}`);
        ver ??= /versionName\s*=?\s*["']([^"']+)/.exec(b.text)?.[1];
      }
    } else if (existsSync(join(cwd, "package.json"))) {
      const pkg = JSON.parse(await readFile(join(cwd, "package.json"), "utf8"));
      if (version) {
        pkg.version = version;
        await writeFile(join(cwd, "package.json"), JSON.stringify(pkg, null, 2) + "\n");
        notes.push(`package.json version → ${version}`);
      }
      ver ??= pkg.version;
    }
    ver ??= date;
    // Changelog.
    if ((await git(cwd, ["rev-parse", "--is-inside-work-tree"])).out === "true") {
      const c = await changelog(cwd);
      if (c.lines.length) {
        const file = join(cwd, "CHANGELOG.md");
        const old = existsSync(file) ? await readFile(file, "utf8") : "# Changelog\n";
        const entry = `## ${ver} (${date})\n\n${c.lines.map((l) => `- ${l}`).join("\n")}\n`;
        const at = old.indexOf("\n## ");
        await writeFile(file, at >= 0 ? `${old.slice(0, at + 1)}${entry}\n${old.slice(at + 1)}` : `${old.trimEnd()}\n\n${entry}`);
        notes.push(`CHANGELOG.md: ${c.lines.length} change(s)${c.since ? ` since ${c.since}` : ""}`);
      }
    }
    // Build.
    if (kind === "android") {
      const g = shell().kind === "powershell" ? ".\\gradlew.bat" : "./gradlew";
      const task = aab ? "bundleRelease" : "assembleRelease";
      const r = await runCmd(`${g} ${task} --console=plain`, cwd, 1200, ctx.network);
      if (r.code !== 0) return [...notes, `build failed (${task}):`, summarizeTests(r.out, r.code)].join("\n");
      const outDir = join(cwd, "app/build/outputs", aab ? "bundle/release" : "apk/release");
      const files = existsSync(outDir) ? [...new Bun.Glob(aab ? "*.aab" : "*.apk").scanSync({ cwd: outDir })] : [];
      if (!files.length) return [...notes, `built, but found nothing in ${relative(cwd, outDir)}`].join("\n");
      const out = files.map((f) => `${toPosix(relative(cwd, join(outDir, f)))} (${kb(statSync(join(outDir, f)).size)})`);
      const unsigned = files.some((f) => f.includes("unsigned"));
      return [...notes, `built ${out.join(", ")}`, ...(unsigned ? ["warning: it is unsigned, so phones won't install it. Follow the android-release recipe to add a signing key."] : [])].join("\n");
    }
    let root = cwd;
    const pkg = existsSync(join(cwd, "package.json")) ? JSON.parse(await readFile(join(cwd, "package.json"), "utf8")) : null;
    if (pkg?.scripts?.build) {
      const pm = existsSync(join(cwd, "bun.lock")) ? "bun" : existsSync(join(cwd, "pnpm-lock.yaml")) ? "pnpm" : existsSync(join(cwd, "yarn.lock")) ? "yarn" : "npm";
      const r = await runCmd(`${pm} run build`, cwd, 600, ctx.network);
      if (r.code !== 0) return [...notes, "build failed:", summarizeTests(r.out, r.code)].join("\n");
      root = ["dist", "build", "out", "public"].map((d) => join(cwd, d)).find((d) => existsSync(join(d, "index.html"))) ?? cwd;
      notes.push(`built with ${pm} run build → ${toPosix(relative(cwd, root)) || "."}`);
    }
    if (!existsSync(join(root, "index.html"))) return [...notes, "error: no index.html to ship; for a web release the page must be index.html"].join("\n");
    const files = webFiles(root);
    const data = await Promise.all(files.map(async (f) => ({ name: f, data: new Uint8Array(await readFile(join(root, f))) })));
    const name = `${(pkg?.name ?? basename(cwd)).replace(/[^\w.-]+/g, "-")}-${ver}.zip`;
    const outFile = join(cwd, "releases", name);
    await mkdir(dirname(outFile), { recursive: true });
    const z = zip(data);
    await writeFile(outFile, z);
    const big = data.filter((d) => d.data.length > 1048576).map((d) => `${d.name} ${kb(d.data.length)}`);
    return [
      ...notes,
      `packed ${files.length} files into releases/${name} (${kb(z.length)}), index.html at the root`,
      ...(big.length ? [`large files: ${big.join(", ")}; compress them to load faster`] : []),
      "Upload that zip to itch.io (kind: HTML) or drop it on Netlify.",
    ].join("\n");
  },
});

export const ENGINEER_TOOLS: Tool<any>[] = [codeNav, renameSymbol, probe, bisect, mutate, release];
export const ENGINEER_PROMPT =
  "Engineer tools: use code_nav (definition, references, hover) instead of grepping for names, and rename_symbol for renames. When a bug is unclear, probe the values at the suspect line instead of guessing. bisect finds which commit broke something. mutate shows which bugs the tests would miss. release builds and packs a version to share.";
