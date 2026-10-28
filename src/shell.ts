import { existsSync } from "node:fs";
import { join } from "node:path";

export type Shell = { kind: "bash" | "powershell"; path: string; args: (cmd: string) => string[] };

type Env = { platform: NodeJS.Platform; env: Record<string, string | undefined>; exists: (p: string) => boolean; which: (b: string) => string | null };

// On Windows, prefer Git Bash (models write bash far better than PowerShell),
// skipping C:\Windows\System32\bash.exe, which is the WSL launcher.
// Fall back to PowerShell 7 (pwsh), then Windows PowerShell 5.
export function pickShell(e: Env = realEnv()): Shell {
  if (e.env.MAXX_SHELL) return fromPath(e.env.MAXX_SHELL);
  if (e.platform !== "win32") return { kind: "bash", path: "bash", args: (c) => ["bash", "-lc", c] };

  const gitBash = [
    e.env.ProgramFiles && join(e.env.ProgramFiles, "Git", "bin", "bash.exe"),
    e.env["ProgramFiles(x86)"] && join(e.env["ProgramFiles(x86)"], "Git", "bin", "bash.exe"),
    e.env.LOCALAPPDATA && join(e.env.LOCALAPPDATA, "Programs", "Git", "bin", "bash.exe"),
  ].find((p): p is string => !!p && e.exists(p));
  if (gitBash) return bashAt(gitBash);

  const onPath = e.which("bash");
  if (onPath && !/\\system32\\bash\.exe$/i.test(onPath)) return bashAt(onPath);

  const pwsh = e.which("pwsh") ?? e.which("powershell") ?? "powershell.exe";
  return { kind: "powershell", path: pwsh, args: (c) => [pwsh, "-NoLogo", "-NoProfile", "-NonInteractive", "-Command", c] };
}

function bashAt(path: string): Shell {
  return { kind: "bash", path, args: (c) => [path, "-c", c] };
}

function fromPath(path: string): Shell {
  return /pwsh|powershell/i.test(path)
    ? { kind: "powershell", path, args: (c) => [path, "-NoLogo", "-NoProfile", "-NonInteractive", "-Command", c] }
    : bashAt(path);
}

function realEnv(): Env {
  return { platform: process.platform, env: process.env, exists: existsSync, which: (b) => Bun.which(b) };
}

let cached: Shell | undefined;
export const shell = () => (cached ??= pickShell());

export function describeShell(s: Shell = shell()): string {
  const os = process.platform === "win32" ? "Windows" : process.platform === "darwin" ? "macOS" : "Linux";
  return s.kind === "bash"
    ? `${os}; shell commands run in bash${os === "Windows" ? " (Git Bash: use forward slashes in paths)" : ""}`
    : `${os}; shell commands run in PowerShell (use PowerShell syntax: ; not &&, Get-ChildItem, $env:VAR)`;
}
