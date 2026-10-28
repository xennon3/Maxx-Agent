import { expect, test } from "bun:test";
import { delimiter, join } from "node:path";
import { useAndroidToolchain } from "../src/toolchain.ts";

const studio = join("/pf", "Android", "Android Studio", "jbr");
const sdk = join("/lad", "Android", "Sdk");
const disk = new Set([join(studio, "bin", "java.exe"), join(studio, "bin"), sdk, join(sdk, "platform-tools")]);
const exists = (p: string) => disk.has(p);

test("Android Studio's JDK and SDK are found when nothing is set", () => {
  const env: Record<string, string | undefined> = { ProgramFiles: "/pf", LOCALAPPDATA: "/lad", Path: "/windows" };
  const found = useAndroidToolchain(env, exists, "win32");
  expect(found.javaHome).toBe(studio);
  expect(env.JAVA_HOME).toBe(studio);
  expect(env.ANDROID_HOME).toBe(sdk);
  expect(env.Path!.split(delimiter)).toEqual([join(studio, "bin"), join(sdk, "platform-tools"), "/windows"]);

  // Running it again changes nothing.
  expect(useAndroidToolchain(env, exists, "win32").changed).toEqual([]);
});

test("a JAVA_HOME that works is kept, and a broken one is replaced", () => {
  const mine = "/jdk-21";
  const ok = { JAVA_HOME: mine, ProgramFiles: "/pf", PATH: "" } as Record<string, string | undefined>;
  useAndroidToolchain(ok, (p) => p === join(mine, "bin", "java.exe") || exists(p), "win32");
  expect(ok.JAVA_HOME).toBe(mine);

  const broken = { JAVA_HOME: "/gone", ProgramFiles: "/pf", PATH: "" } as Record<string, string | undefined>;
  useAndroidToolchain(broken, exists, "win32");
  expect(broken.JAVA_HOME).toBe(studio);
});
