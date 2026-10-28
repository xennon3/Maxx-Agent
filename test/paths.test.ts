import { expect, test } from "bun:test";
import { mkdtemp, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fromGitBash } from "../src/tools/paths.ts";
import { listFiles } from "../src/tools/list.ts";

test("Git Bash paths read as Windows drive paths, only on Windows", () => {
  expect(fromGitBash("/c/Users/me/proj/app.ts", "win32")).toBe("C:/Users/me/proj/app.ts");
  expect(fromGitBash("/d", "win32")).toBe("D:/");
  expect(fromGitBash("/usr/bin", "win32")).toBe("/usr/bin");
  expect(fromGitBash("src/app.ts", "win32")).toBe("src/app.ts");
  expect(fromGitBash("/c/Users/me", "linux")).toBe("/c/Users/me");
});

test("list_files shows dotfiles and, with no files, the directories that exist", async () => {
  const dir = await mkdtemp(join(tmpdir(), "maxx-list-"));
  await mkdir(join(dir, "app", "src", "main"), { recursive: true });
  expect(await listFiles.run({ pattern: "**/*" }, { cwd: dir })).toBe("no files match; these directories exist:\napp/\napp/src/\napp/src/main/");

  await Bun.write(join(dir, ".env.example"), "PORT=1\n");
  await Bun.write(join(dir, ".maxx", "settings.json"), "{}");
  expect(await listFiles.run({ pattern: "**/*" }, { cwd: dir })).toBe(".env.example");
});
