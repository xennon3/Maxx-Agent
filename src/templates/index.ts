import { existsSync } from "node:fs";
import { chmod, mkdir, readdir, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { androidCompose } from "./android.ts";
import { htmlGame } from "./game.ts";
import { pythonScript } from "./python.ts";
import { webApp } from "./webapp.ts";

// Starter projects. A small model is much better at changing a project that
// already builds than at writing Gradle files from nothing, so new apps start
// from one of these. Each one is tiny, works as written, and carries a MAXX.md
// that tells the model where things live and how to run them.

export type Vars = {
  name: string; // shown to people: "Snake Game"
  slug: string; // folder and file friendly: "snake-game"
  pkg: string; // a Java package segment: "snakegame"
  sdk?: string; // the Android SDK, when one is installed
};

export type Template = {
  id: string;
  name: string;
  icon: string;
  about: string;
  folder: string; // default folder name when the workspace isn't empty
  try: string[]; // first things to ask for, shown in the app window
  files: (v: Vars) => Record<string, string | Uint8Array>;
};

export const TEMPLATES: Template[] = [androidCompose, htmlGame, pythonScript, webApp];

export function findTemplate(id: string): Template {
  const t = TEMPLATES.find((t) => t.id === id);
  if (!t) throw new Error(`unknown template ${id}; available: ${TEMPLATES.map((t) => t.id).join(", ")}`);
  return t;
}

export function varsFor(dir: string, name?: string): Vars {
  const words = (name ?? basename(dir)).replace(/[^\p{L}\p{N} _-]/gu, " ").split(/[\s_-]+/).filter(Boolean);
  const title = words.map((w) => w[0]!.toUpperCase() + w.slice(1)).join(" ") || "My App";
  const slug = words.join("-").toLowerCase() || "my-app";
  let pkg = slug.replace(/[^a-z0-9]/g, "");
  if (!/^[a-z]/.test(pkg)) pkg = "app" + pkg;
  return { name: title, slug, pkg, sdk: androidSdk() };
}

function androidSdk(): string | undefined {
  const env = process.env;
  const dirs = [env.ANDROID_HOME, env.ANDROID_SDK_ROOT, env.LOCALAPPDATA && join(env.LOCALAPPDATA, "Android", "Sdk"), env.HOME && join(env.HOME, "Android", "Sdk"), env.HOME && join(env.HOME, "Library", "Android", "sdk")];
  return dirs.find((d): d is string => !!d && existsSync(d));
}

// Things that don't make a folder "used": git, Maxx's own state, OS litter.
const IGNORABLE = new Set([".git", ".maxx", ".DS_Store", "desktop.ini", "Thumbs.db"]);

export async function isEmptyFolder(dir: string): Promise<boolean> {
  if (!existsSync(dir)) return true;
  return (await readdir(dir)).every((f) => IGNORABLE.has(f));
}

// snake-game, then snake-game-2, snake-game-3...
export function freeFolder(parent: string, base: string): string {
  for (let i = 1; ; i++) {
    const dir = join(parent, i === 1 ? base : `${base}-${i}`);
    if (!existsSync(dir)) return dir;
  }
}

export function plan(t: Template, dir: string, name?: string): string[] {
  return Object.keys(t.files(varsFor(dir, name)));
}

// Write the template into dir. Refuses to overwrite anything.
export async function scaffold(t: Template, dir: string, name?: string): Promise<string[]> {
  const files = t.files(varsFor(dir, name));
  const taken = Object.keys(files).filter((f) => existsSync(join(dir, f)));
  if (taken.length) throw new Error(`${dir} already has ${taken.slice(0, 5).join(", ")}; pick an empty or new folder`);
  for (const [path, body] of Object.entries(files)) {
    const file = join(dir, path);
    await mkdir(dirname(file), { recursive: true });
    // Batch files only run reliably with Windows line endings.
    await writeFile(file, typeof body === "string" && path.endsWith(".bat") ? body.replace(/\r?\n/g, "\r\n") : body);
    if (basename(path) === "gradlew") await chmod(file, 0o755);
  }
  return Object.keys(files);
}

// One line per template, for the tool description and `maxx new`.
export const catalog = () => TEMPLATES.map((t) => `${t.id}: ${t.about}`).join("\n");
