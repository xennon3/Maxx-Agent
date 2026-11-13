import { existsSync, readFileSync, readdirSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { maxxHome } from "../sessions.ts";
import { HDRI_FILES, hdriBytes } from "../look/kit.ts";
// @ts-ignore: a text import has no type declarations
import KIT_PY from "./maxx_scene.py" with { type: "text" };
// @ts-ignore
import RUNNER_PY from "./runner.py" with { type: "text" };

// Finding Blender on this computer, and the scene kit Maxx runs inside it.

export const KIT_VERSION = /KIT_VERSION = "([^"]+)"/.exec(KIT_PY as string)?.[1] ?? "0";
export const MIN_VERSION: [number, number] = [4, 2];

export const INSTALL_HELP = [
  "Blender isn't installed on this computer (or Maxx can't find it). It's free:",
  "  1. Go to https://www.blender.org/download/ and press the big Download Blender button (the Windows installer).",
  "  2. Open the downloaded file and click Next until it's done. About 400 MB; no account needed.",
  "     Or in a terminal:  winget install BlenderFoundation.Blender",
  "  3. Ask again. Maxx finds Blender by itself; there's nothing to set up.",
  "Installed it somewhere unusual (a portable zip, Steam)? Set MAXX_BLENDER to blender.exe, or put {\"path\": \"D:\\\\Blender\\\\blender.exe\"} in ~/.maxx/blender.json.",
].join("\n");

type Env = Record<string, string | undefined>;

// Version numbers in a folder name like "Blender 4.2" or "blender-5.0.1-windows-x64".
const versionIn = (s: string): number[] => (/(\d+)\.(\d+)(?:\.(\d+))?/.exec(s)?.slice(1).map((x) => Number(x ?? 0)) ?? [0, 0, 0]);
const newestFirst = (a: string, b: string) => {
  const x = versionIn(a), y = versionIn(b);
  for (let i = 0; i < 3; i++) if ((y[i] ?? 0) !== (x[i] ?? 0)) return (y[i] ?? 0) - (x[i] ?? 0);
  return 0;
};

function subdirs(dir: string): string[] {
  try {
    return readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => join(dir, d.name));
  } catch {
    return [];
  }
}

// Every place Blender is usually installed, best guesses first.
export function blenderCandidates(env: Env = process.env, platform: NodeJS.Platform = process.platform, home = homedir()): string[] {
  const out: string[] = [];
  if (env.MAXX_BLENDER) out.push(env.MAXX_BLENDER);
  try {
    const cfg = JSON.parse(readFileSync(join(env.MAXX_HOME ?? join(home, ".maxx"), "blender.json"), "utf8"));
    if (cfg?.path) out.push(String(cfg.path));
  } catch {}
  if (platform === "win32") {
    const roots = [env.ProgramFiles ?? "C:\\Program Files", env["ProgramFiles(x86)"] ?? "C:\\Program Files (x86)", env.ProgramW6432, "D:\\Program Files"].filter(Boolean) as string[];
    for (const r of roots) {
      const bf = join(r, "Blender Foundation");
      for (const d of subdirs(bf).sort(newestFirst)) out.push(join(d, "blender.exe"));
      out.push(join(r, "Steam", "steamapps", "common", "Blender", "blender.exe"));
    }
    const local = env.LOCALAPPDATA ?? join(home, "AppData", "Local");
    // Portable zips unpacked in the usual spots.
    for (const base of [join(home, "Desktop"), join(home, "Downloads"), join(home, "Documents"), "C:\\", join(maxxHome(), "blender"), join(local, "Programs")]) {
      for (const d of subdirs(base).filter((p) => /blender/i.test(p)).sort(newestFirst)) out.push(join(d, "blender.exe"));
    }
    out.push(join(local, "Microsoft", "WindowsApps", "blender.exe"));
  } else if (platform === "darwin") {
    out.push("/Applications/Blender.app/Contents/MacOS/Blender", join(home, "Applications/Blender.app/Contents/MacOS/Blender"));
  } else {
    out.push("/usr/bin/blender", "/usr/local/bin/blender", "/snap/bin/blender", "/var/lib/flatpak/exports/bin/org.blender.Blender");
    for (const d of subdirs(join(home, "blender")).concat(subdirs("/opt")).filter((p) => /blender/i.test(p)).sort(newestFirst)) out.push(join(d, "blender"));
  }
  return out;
}

export type Found = { path: string; version: string; ok: boolean; why?: string };
let cached: Found | null | undefined;

async function versionOf(path: string): Promise<string | null> {
  try {
    const p = Bun.spawn([path, "--factory-startup", "-b", "--version"], { stdout: "pipe", stderr: "pipe", stdin: "ignore" });
    const timer = setTimeout(() => p.kill(), 60_000);
    const out = await new Response(p.stdout).text();
    await p.exited;
    clearTimeout(timer);
    return /Blender\s+(\d+\.\d+(?:\.\d+)?)/.exec(out)?.[1] ?? null;
  } catch {
    return null;
  }
}

export function oldVersion(v: string): boolean {
  const [a = 0, b = 0] = versionIn(v);
  return a < MIN_VERSION[0] || (a === MIN_VERSION[0] && b < MIN_VERSION[1]);
}

// Blender's path and version, or null when it isn't installed. Cached; pass fresh after an install.
export async function findBlender(fresh = false): Promise<Found | null> {
  if (cached !== undefined && !fresh) return cached;
  const seen = new Set<string>();
  const list = [...blenderCandidates()];
  const onPath = Bun.which("blender");
  if (onPath) list.splice(list.length && process.env.MAXX_BLENDER ? 1 : 0, 0, onPath);
  for (const p of list) {
    if (!p || seen.has(p) || !existsSync(p)) continue;
    seen.add(p);
    const v = await versionOf(p);
    if (!v) continue;
    cached = oldVersion(v) ? { path: p, version: v, ok: false, why: `Blender ${v} is too old for Maxx's scene kit (needs ${MIN_VERSION.join(".")} or newer). Get the current one from https://www.blender.org/download/` } : { path: p, version: v, ok: true };
    return cached;
  }
  cached = null;
  return null;
}

// The kit lives in ~/.maxx/blender-kit/<version>/ so every project shares it.
export function kitDir(): string {
  return join(maxxHome(), "blender-kit", KIT_VERSION);
}

export async function ensureKit(): Promise<string> {
  const dir = kitDir();
  const stamp = join(dir, "VERSION");
  const have = await readFile(stamp, "utf8").catch(() => "");
  // Rewrite while developing (the version stays the same but the text changes).
  const same = have.trim() === KIT_VERSION && (await readFile(join(dir, "maxx_scene.py"), "utf8").catch(() => "")) === KIT_PY;
  if (same) return dir;
  await mkdir(join(dir, "hdri"), { recursive: true });
  await writeFile(join(dir, "maxx_scene.py"), KIT_PY as string);
  await writeFile(join(dir, "runner.py"), RUNNER_PY as string);
  for (const name of Object.keys(HDRI_FILES)) {
    const f = join(dir, "hdri", `${name}.exr`);
    if (!existsSync(f)) await writeFile(f, hdriBytes(name));
  }
  await writeFile(join(dir, "LICENSES.md"), "Skies in hdri/: CC0 from Poly Haven (polyhaven.com), resized by pmndrs/assets (CC0).\nmaxx_scene.py: made by Maxx.\n");
  await writeFile(stamp, KIT_VERSION + "\n");
  return dir;
}

export const KIT_SOURCE = KIT_PY as string;
