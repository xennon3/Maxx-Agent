import { expect, test } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { bash, dropWorkspaceCd } from "../src/tools/bash.ts";

test("a cd into the project folder is dropped, however the model wrote the path", () => {
  const cwd = "C:\\Users\\me\\Desktop\\Maxx test code3";
  const run = "python -m http.server 8000";
  for (const dir of ["/Users/me/Desktop/Maxx test code3", "/c/Users/me/Desktop/Maxx test code3/", '"C:/Users/me/Desktop/Maxx test code3"', "/c/users/me/desktop/Maxx\\ test\\ code3", "."]) {
    expect(dropWorkspaceCd(`cd ${dir} && ${run}`, cwd, "win32")).toBe(run);
  }
  expect(dropWorkspaceCd(`cd app && ${run}`, cwd, "win32")).toBe(`cd app && ${run}`);
  expect(dropWorkspaceCd(run, cwd, "win32")).toBe(run);
  expect(dropWorkspaceCd("cd /home/me/proj; make", "/home/me/proj", "linux")).toBe("make");
  expect(dropWorkspaceCd("cd /home/me/other; make", "/home/me/proj", "linux")).toBe("cd /home/me/other; make");
});

test("a long-running command returns while it keeps running", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "maxx-bash-"));
  const started = Date.now();
  const out = await bash.run({ command: `bun -e "console.log('up'); setTimeout(() => {}, 8000)"`, background: true }, { cwd });
  expect(typeof out === "string" && out).toStartWith("started in the background");
  expect(Date.now() - started).toBeLessThan(10_000);
  const pid = Number(/pid (\d+)/.exec(out as string)?.[1]);
  if (pid) process.kill(pid);

  // One that exits right away is reported like any other command.
  expect(await bash.run({ command: "echo hi", background: true }, { cwd })).toContain("exit code: 0");
}, 20_000);
