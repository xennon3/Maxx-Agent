import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { delimiter, join } from "node:path";

// Android Studio installs a JDK (its "jbr") and the SDK, but sets neither
// JAVA_HOME nor ANDROID_HOME, and puts neither on PATH. Gradle and adb then
// fail with "java: not found", which a small model cannot fix. Maxx looks in
// the usual places at startup and fills in what is missing for every command.

type Env = Record<string, string | undefined>;

export function javaHomes(env: Env = process.env, home = homedir()): string[] {
  return [
    env.JAVA_HOME,
    env.ProgramFiles && join(env.ProgramFiles, "Android", "Android Studio", "jbr"),
    env.LOCALAPPDATA && join(env.LOCALAPPDATA, "Programs", "Android Studio", "jbr"),
    "/Applications/Android Studio.app/Contents/jbr/Contents/Home",
    "/opt/android-studio/jbr",
    join(home, "android-studio", "jbr"),
  ].filter((d): d is string => !!d);
}

export function sdkDirs(env: Env = process.env, home = homedir()): string[] {
  return [
    env.ANDROID_HOME,
    env.ANDROID_SDK_ROOT,
    env.LOCALAPPDATA && join(env.LOCALAPPDATA, "Android", "Sdk"),
    join(home, "Library", "Android", "sdk"),
    join(home, "Android", "Sdk"),
  ].filter((d): d is string => !!d);
}

export type Found = { javaHome?: string; sdk?: string; changed: string[] };

// Returns what it set, so the caller can say so; never overrides a working setting.
export function useAndroidToolchain(env: Env = process.env, exists: (path: string) => boolean = existsSync, platform: NodeJS.Platform = process.platform): Found {
  const java = platform === "win32" ? "java.exe" : "java";
  const changed: string[] = [];
  const javaHome = javaHomes(env).find((d) => exists(join(d, "bin", java)));
  const sdk = sdkDirs(env).find((d) => exists(d));
  const pathKey = Object.keys(env).find((k) => k.toUpperCase() === "PATH") ?? "PATH";
  const path = (env[pathKey] ?? "").split(delimiter);
  const onPath = (dir: string) => path.some((p) => p.toLowerCase() === dir.toLowerCase());

  if (javaHome && env.JAVA_HOME !== javaHome) (env.JAVA_HOME = javaHome), changed.push(`JAVA_HOME=${javaHome}`);
  if (sdk && !env.ANDROID_HOME) (env.ANDROID_HOME = sdk), changed.push(`ANDROID_HOME=${sdk}`);
  const add = [javaHome && join(javaHome, "bin"), sdk && join(sdk, "platform-tools")].filter((d): d is string => !!d && exists(d) && !onPath(d));
  if (add.length) (env[pathKey] = [...add, ...path].filter(Boolean).join(delimiter)), changed.push(`PATH += ${add.join(", ")}`);
  return { javaHome, sdk, changed };
}
