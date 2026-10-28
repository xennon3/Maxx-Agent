// The error coach. Small models skim past a wall of stderr, but they follow
// one plain sentence. When a tool call fails, Maxx finds the first real error
// line and, when it recognizes the problem, adds a hint that says what to do.

import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export type Coaching = { first?: string; hint?: string };

// Programs only the user can install. Retrying never helps, and a small model
// will otherwise wander (look for gradle, list folders...) until it is stopped.
export type Missing = { what: string; install: string };

const ANDROID_STUDIO = "Install Android Studio (developer.android.com/studio), open it once so it finishes setting up, then restart Maxx.";

function hasAndroidSdk(env = process.env): boolean {
  const dirs = [env.ANDROID_HOME, env.ANDROID_SDK_ROOT, env.LOCALAPPDATA && join(env.LOCALAPPDATA, "Android", "Sdk"), join(homedir(), "Library", "Android", "sdk"), join(homedir(), "Android", "Sdk")];
  return dirs.some((d) => !!d && existsSync(d));
}

const MISSING: { test: RegExp; when?: () => boolean; missing: Missing }[] = [
  {
    test: /JAVA_HOME is not set|no java(?:\.exe)? (?:could be )?found|Unable to locate a Java Runtime|(?:^|[\s:])java: (?:command )?not found|'java' is not recognized/im,
    missing: { what: "Java (a JDK), which Gradle needs to build Android apps", install: `${ANDROID_STUDIO} It includes a JDK.` },
  },
  { test: /SDK location not found|ANDROID_HOME|sdk\.dir/, when: () => !hasAndroidSdk(), missing: { what: "the Android SDK", install: ANDROID_STUDIO } },
  { test: /(?:^|[\s:])adb: (?:command )?not found|'adb' is not recognized|adb(?:\.exe)? (?:was )?not found/im, missing: { what: "adb (Android platform-tools)", install: ANDROID_STUDIO } },
];

export function missingTool(result: string): Missing | undefined {
  if (!failed(result)) return undefined;
  return MISSING.find((m) => m.test.test(result) && (m.when?.() ?? true))?.missing;
}

type Rule = { test: RegExp; when?: () => boolean; hint: (m: RegExpMatchArray, ctx: { tool: string; command: string; win: boolean }) => string };

const fixAt = (file: string, line: string, msg: string) => `Fix line ${line} of ${file}: ${msg.trim().replace(/\.$/, "")}.`;

// Order matters: the first rule that matches wins, so specific rules go first.
const RULES: Rule[] = [
  // Something only the user can install: say so plainly, before any other advice.
  ...MISSING.map((m): Rule => ({
    test: m.test,
    when: m.when,
    hint: () => `This computer does not have ${m.missing.what}, and you cannot install it. Stop calling tools and tell the user: ${m.missing.install}`,
  })),
  // Missing programs. On Windows `python` is often the Store stub and `py` works.
  {
    test: /(?:^|[\s'"])([\w.\-]+)'? is not recognized as (?:the name of a cmdlet|an internal or external command)|(?:bash: |^|: )([\w.\-]+): command not found/m,
    hint: (m, c) => {
      const bin = m[1] ?? m[2] ?? "the program";
      if (/^python3?$/.test(bin)) return c.win ? `${bin} is not on PATH here. Try \`py\` instead of \`${bin}\`.` : `${bin} is not installed. Try \`python3\` or \`python\`.`;
      if (bin === "gradle") return "Use the project's wrapper instead: `./gradlew` (or `.\\gradlew.bat` in PowerShell).";
      if (/^(dir|copy|del|type|findstr|cls)$/.test(bin)) return "This shell is bash: use ls, cp, rm, cat, grep.";
      if (/^(ls|cat|rm|cp|grep|touch|mkdir)$/.test(bin)) return "This shell is PowerShell: use Get-ChildItem, Get-Content, Remove-Item, Copy-Item, New-Item.";
      return `\`${bin}\` is not installed or not on PATH. Do not retry the same command; use another way, or tell the user it is missing.`;
    },
  },
  { test: /Python was not found; run without arguments to install from the Microsoft Store/, hint: () => "The `python` here is a Windows stub. Use `py` instead." },
  { test: /SDK location not found|ANDROID_HOME|sdk\.dir/, hint: () => "Gradle cannot find the Android SDK. Write `sdk.dir=<path to the SDK>` into local.properties (forward slashes), or set ANDROID_HOME." },
  { test: /JAVA_HOME is not set|no java(?:\.exe)? (?:could be )?found|Unable to locate a Java Runtime/i, hint: () => "No Java found. Gradle needs a JDK (17 for Android); set JAVA_HOME or tell the user to install one." },
  { test: /permission denied: '?\.\/gradlew|\.\/gradlew: Permission denied/, hint: () => "Run `chmod +x gradlew` once, then run it again." },
  { test: /EADDRINUSE|address already in use|Only one usage of each socket address|port \d+ is (?:already )?in use/i, hint: () => "That port is busy, probably because the server is already running in the background. Use it as it is, or pick another port. Do not start it again." },
  { test: /npm ERR! Missing script: "?([\w:-]+)"?|error: Script not found "([\w:-]+)"/, hint: (m) => `There is no "${m[1] ?? m[2]}" script. Read package.json to see which scripts exist.` },
  { test: /Cannot find module '([^']+)'|Cannot find package '([^']+)'|Module not found: (?:Error: )?Can't resolve '([^']+)'/, hint: (m) => {
    const mod = m[1] ?? m[2] ?? m[3]!;
    return mod.startsWith(".") || mod.startsWith("/") ? `The import path ${mod} is wrong. List the folder to find the real file name.` : `The package ${mod} is not installed. Install it (npm install ${mod}), or remove the import.`;
  } },
  { test: /ModuleNotFoundError: No module named '([^']+)'/, hint: (m, c) => `The Python package ${m[1]!.split(".")[0]} is not installed. Run \`${c.win ? "py" : "python3"} -m pip install ${m[1]!.split(".")[0]}\`, or use only the standard library.` },
  { test: /IndentationError|TabError/, hint: () => "Python indentation is wrong. Read the lines around the error and use 4 spaces consistently." },
  { test: /old_string not found/, hint: () => "Call read_file on this file again and copy old_string from the fresh output, a few whole lines, without the line numbers." },
  { test: /old_string matches \d+ places/, hint: () => "Include one or two neighbouring lines in old_string so it matches only one place." },
  { test: /is outside the workspace/, hint: () => "Use a path relative to the project folder, like src/app.js." },
  { test: /(?:^|error: )(\S+) does not exist|ENOENT[^\n]*?'([^']+)'|No such file or directory|Cannot find path '([^']+)'/m, hint: (m, c) => {
    const p = m[1] ?? m[2] ?? m[3];
    return `${p ? `${p} does not exist.` : "A path in that command does not exist."} Call list_files to see the real file names before trying again.${c.tool === "bash" ? " Quote paths that contain spaces." : ""}`;
  } },
  { test: /fatal: not a git repository/, hint: () => "This folder is not a git repository. Skip git, or run `git init` if the user wants one." },
  { test: /EACCES|Access is denied|Permission denied/i, hint: () => "Permission denied. The file may be open in another program, or need other rights. Do not retry the same thing; try another path or tell the user." },
  { test: /killed after \d+s/, hint: () => "The command took too long. If it is a server or watcher, run it with background: true; otherwise use a smaller command." },
  { test: /Could not resolve (?:all files|dependencies|host)|getaddrinfo|ENOTFOUND|Network is unreachable/i, hint: () => "A download failed; the network may be offline. Do not retry in a loop; tell the user." },
  // Code errors: point at the exact place.
  { test: /([\w./\\-]+\.(?:ts|tsx|js|jsx|mjs))[(:](\d+)[,:](\d+)\)?:? (?:- )?error(?: TS\d+)?:? (.+)/, hint: (m) => `${fixAt(m[1]!, m[2]!, m[4]!)} Read that part of the file first.` },
  { test: /File "([^"]+)", line (\d+)[^\n]*\n(?:[^\n]*\n)*?(\w+Error: .+)/, hint: (m) => fixAt(m[1]!, m[2]!, m[3]!) },
  { test: /e: (?:file:\/\/\/?)?([^\s:]+\.kts?):(\d+):\d+ (.+)/, hint: (m) => fixAt(m[1]!, m[2]!, m[3]!) },
  { test: /([\w./\\-]+\.(?:java|c|cpp|go|rs)):(\d+)(?::\d+)?: (?:error: )?(.+)/, hint: (m) => fixAt(m[1]!, m[2]!, m[3]!) },
];

const ERROR_LINE = /\b(error|failed|failure|exception|traceback|cannot|could not|not found|not recognized|denied|undefined|unexpected|fatal)\b|^e: |^\s*\^/i;

// The first line that looks like the real problem, skipping banners and progress.
export function firstError(text: string): string | undefined {
  const lines = text.split("\n").map((l) => l.replace(/\x1b\[[0-9;]*m/g, "").trimEnd());
  // A Python traceback's useful line is its last one.
  const tb = lines.findIndex((l) => l.startsWith("Traceback (most recent call last)"));
  if (tb >= 0) return lines.slice(tb).find((l) => /^\w+(Error|Exception)\b/.test(l));
  const hit = lines.find((l) => ERROR_LINE.test(l) && !/^(exit code|stdout|stderr):/.test(l) && !/^\s*(at |>)/.test(l) && !/\b0 (errors?|failed)\b/i.test(l));
  return hit?.trim().slice(0, 300);
}

// Did this tool result fail? Tools report errors as "error: ..." or a nonzero exit.
export function failed(result: string): boolean {
  return /^error: /.test(result) || /^exit code: (?!0\b)/m.test(result);
}

export function coach(tool: string, args: Record<string, unknown>, result: string, platform: NodeJS.Platform = process.platform): Coaching {
  if (!failed(result)) return {};
  const ctx = { tool, command: String(args.command ?? ""), win: platform === "win32" };
  const first = firstError(result.replace(/^exit code: .*$/m, ""));
  for (const r of RULES) {
    const m = result.match(r.test);
    if (m && (r.when?.() ?? true)) return { first, hint: r.hint(m, ctx) };
  }
  return { first };
}

// What goes after the raw result. Tools that already gave a hint keep theirs.
export function coachNote(c: Coaching, result: string): string {
  if (!c.hint && !c.first) return "";
  if (/^hint: /m.test(result)) return "";
  const out: string[] = [];
  // Long output gets cut in the middle; repeat the first error so it is not lost.
  if (c.first && (result.length > 1500 || !c.hint) && !result.startsWith(`error: ${c.first}`)) out.push(`First error: ${c.first}`);
  if (c.hint) out.push(`Maxx hint: ${c.hint}`);
  return out.length ? "\n\n" + out.join("\n") : "";
}
