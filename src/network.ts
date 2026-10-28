// Network access: may the model install packages and download files? Off by
// default, so a plain install never fetches anything on its own. On, the model
// can pip/npm install what a task needs (pandas and matplotlib for data
// analysis and charts, pillow or pypdf for file processing).
//
// This is a guardrail for the model, not a firewall: install and download
// commands are refused before they run, and pip, npm, yarn and uv are told to
// stay offline, but a script that opens its own connection is not stopped.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { maxxHome } from "./sessions.ts";

export const networkFile = () => join(maxxHome(), "network.json");

export async function loadNetwork(): Promise<boolean> {
  try {
    return (JSON.parse(await readFile(networkFile(), "utf8")) as { on?: boolean }).on === true;
  } catch {
    return false;
  }
}

// Saved for both `maxx` and `maxx ui`.
export async function saveNetwork(on: boolean) {
  await mkdir(maxxHome(), { recursive: true });
  await writeFile(networkFile(), JSON.stringify({ on }, null, 2) + "\n");
}

export function parseSwitch(v: string): boolean | undefined {
  if (/^(on|true|yes|1)$/i.test(v)) return true;
  if (/^(off|false|no|0)$/i.test(v)) return false;
  return undefined;
}

// The flag beats the environment ($MAXX_NETWORK), which beats the saved setting.
export async function resolveNetwork(flag?: string, env = process.env): Promise<boolean> {
  const v = flag ?? env.MAXX_NETWORK;
  if (v === undefined || v === "") return loadNetwork();
  const on = parseSwitch(v);
  if (on === undefined) throw new Error(`--network takes on or off, not "${v}"`);
  return on;
}

// A URL that leaves this machine; curl against the app's own dev server is fine.
const REMOTE = String.raw`(?:https?|ftp)://(?!localhost\b|127\.|0\.0\.0\.0|\[::1\])`;
const FETCHES: RegExp[] = [
  /\b(?:pip[\d.]*|pipx|(?:python[\d.]*|py(?:\s+-[\d.]+)?)\s+-m\s+pip|uv\s+pip)\s+(?:install|download)\b/,
  /\b(?:uv|poetry|pdm|rye)\s+(?:add|sync)\b|\b(?:conda|mamba|micromamba)\s+(?:install|create)\b/,
  /\b(?:npm|pnpm|yarn|bun)\s+(?:install|i|add|ci)\b/,
  /\b(?:cargo\s+(?:install|add)|go\s+(?:get|install)|gem\s+install|composer\s+(?:require|install)|dotnet\s+add\s+\S+\s+package|install\.packages)\b/,
  /\b(?:winget|choco|scoop|brew|apt(?:-get)?|dnf|yum)\s+install\b|\bpacman\s+-S/,
  new RegExp(String.raw`\b(?:curl|wget|Invoke-WebRequest|iwr|Invoke-RestMethod|irm|Start-BitsTransfer)\b.*${REMOTE}`, "i"),
  new RegExp(String.raw`\bgit\s+clone\b.*(?:${REMOTE}|git@)`),
];

// The install or download in a command, if there is one.
export function fetches(command: string): string | null {
  for (const re of FETCHES) {
    const m = command.match(re);
    if (m) return m[0].replace(/\s+/g, " ").slice(0, 60);
  }
  return null;
}

// Not an "error:", so a refusal never counts toward handing the step to the helper.
export const blocked = (what: string) =>
  `refused: network access is off, so Maxx did not run \`${what}\`. Do not retry it. Use the standard library and the packages already installed, or tell the user that this needs network access (turn it on with the 🌐 Network switch in the app, or /network on in the terminal).`;

// Package managers that read these never reach the internet, even when a script runs them.
export const OFFLINE_ENV: Record<string, string> = {
  PIP_NO_INDEX: "1",
  npm_config_offline: "true",
  YARN_ENABLE_OFFLINE_MODE: "1",
  UV_OFFLINE: "1",
};

export const NETWORK_PROMPT = {
  on: "Network access is on: when a task needs a library (pandas, matplotlib, pillow...), install it with pip or npm and use it. Install only what the task needs, and tell the user what you installed. Save charts and visualizations as PNG or HTML files in the project.",
  off: "Network access is off: do not install packages or download files. Use the standard library and what is already installed.",
};
