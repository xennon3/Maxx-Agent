import { expect, test } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Permissions, matches } from "../src/permissions.ts";
import { bash } from "../src/tools/bash.ts";
import { readFile } from "../src/tools/read.ts";
import { editFile } from "../src/tools/edit.ts";

test("rule matching", () => {
  expect(matches("bash(npm test*)", "bash", "npm test -- --watch")).toBe(true);
  expect(matches("bash(npm test*)", "bash", "npm publish")).toBe(false);
  expect(matches("edit_file", "edit_file", "anything")).toBe(true);
  expect(matches("bash(git status)", "bash", "git status; rm -rf /")).toBe(false);
});

test("modes and remembered rules", async () => {
  const dir = await mkdtemp(join(tmpdir(), "maxx-perm-"));
  const p = await new Permissions(dir, "ask").load();
  expect(p.needsPrompt(readFile, { path: "a" })).toBe(false);
  expect(p.needsPrompt(bash, { command: "bun test src" })).toBe(true);
  await p.remember(bash, { command: "bun test src" });
  expect(p.needsPrompt(bash, { command: "bun test other" })).toBe(false);
  expect(p.needsPrompt(bash, { command: "bun install" })).toBe(true);

  const reloaded = await new Permissions(dir, "auto-edit").load();
  expect(reloaded.needsPrompt(bash, { command: "bun test x" })).toBe(false);
  expect(reloaded.needsPrompt(editFile, { path: "a", old_string: "x", new_string: "y" })).toBe(false);
});
