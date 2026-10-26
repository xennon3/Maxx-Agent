import { expect, test } from "bun:test";
import { mkdtemp, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pickShell } from "../src/shell.ts";
import { applyEdit } from "../src/tools/edit.ts";
import { jsGrep } from "../src/tools/grep.ts";

const win = (over: { files?: string[]; path?: Record<string, string> } = {}) => ({
  platform: "win32" as const,
  env: { ProgramFiles: "C:\\Program Files", LOCALAPPDATA: "C:\\Users\\l\\AppData\\Local" },
  exists: (p: string) => (over.files ?? []).includes(p),
  which: (b: string) => over.path?.[b] ?? null,
});

test("windows prefers Git Bash", () => {
  const s = pickShell(win({ files: [join("C:\\Program Files", "Git", "bin", "bash.exe")] }));
  expect(s.kind).toBe("bash");
  expect(s.args("ls")).toEqual([join("C:\\Program Files", "Git", "bin", "bash.exe"), "-c", "ls"]);
});

test("windows skips the WSL bash launcher and falls back to PowerShell", () => {
  const s = pickShell(win({ path: { bash: "C:\\Windows\\System32\\bash.exe", pwsh: "C:\\Program Files\\PowerShell\\7\\pwsh.exe" } }));
  expect(s.kind).toBe("powershell");
  expect(s.args("Get-ChildItem").at(-1)).toBe("Get-ChildItem");
  expect(s.path).toContain("pwsh");
});

test("windows with nothing installed still gets Windows PowerShell", () => {
  expect(pickShell(win()).path).toBe("powershell.exe");
});

test("MAXX_SHELL overrides detection", () => {
  const s = pickShell({ ...win(), env: { MAXX_SHELL: "C:\\tools\\pwsh.exe" } });
  expect(s.kind).toBe("powershell");
});

test("edits keep CRLF line endings", () => {
  const src = "a\r\n  b\r\nc\r\n";
  const exact = applyEdit(src, "b\nc", "B\nC");
  expect(exact.ok && exact.text).toBe("a\r\n  B\r\nC\r\n");
  const fuzzy = applyEdit(src, "b", "B");
  expect(fuzzy.ok && fuzzy.text).toBe("a\r\n  B\r\nc\r\n");
});

test("grep works without ripgrep", async () => {
  const dir = await mkdtemp(join(tmpdir(), "maxx-grep-"));
  await mkdir(join(dir, "src"));
  await mkdir(join(dir, "node_modules"));
  await Bun.write(join(dir, "src", "a.ts"), "// TODO: one\r\nconst x = 1;\r\n");
  await Bun.write(join(dir, "src", "b.md"), "TODO two\n");
  await Bun.write(join(dir, "node_modules", "c.ts"), "TODO ignored\n");
  expect(await jsGrep({ pattern: "TODO", path: "." }, dir)).toBe("src/a.ts:1:// TODO: one\nsrc/b.md:1:TODO two");
  expect(await jsGrep({ pattern: "TODO", path: ".", glob: "*.ts" }, dir)).toBe("src/a.ts:1:// TODO: one");
  expect(await jsGrep({ pattern: "nope", path: "src" }, dir)).toBe("no matches");
});
