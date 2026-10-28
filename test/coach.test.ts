import { expect, test } from "bun:test";
import { coach, coachNote, firstError } from "../src/coach.ts";

const run = (out: string, command = "x", win = false) => coach("bash", { command }, out, win ? "win32" : "linux");

test("missing python on Windows suggests py", () => {
  const c = run("exit code: 1\nstderr:\npython : The term 'python' is not recognized as the name of a cmdlet, function", "python main.py", true);
  expect(c.hint).toContain("`py`");
});

test("command not found in bash", () => {
  expect(run("exit code: 127\nstderr:\nbash: gradle: command not found").hint).toContain("gradlew");
  expect(run("exit code: 127\nstderr:\nbash: dir: command not found").hint).toContain("use ls");
  expect(run("exit code: 127\nstderr:\nbash: foo: command not found").hint).toContain("`foo` is not installed");
});

test("busy port, missing module, missing file", () => {
  expect(run("exit code: 1\nstderr:\nError: listen EADDRINUSE: address already in use :::8000").hint).toContain("already running");
  expect(run("exit code: 1\nstderr:\nError: Cannot find module 'express'").hint).toContain("npm install express");
  expect(run("exit code: 1\nstderr:\nError: Cannot find module './util'").hint).toContain("import path ./util is wrong");
  expect(coach("read_file", { path: "src/a.ts" }, "error: src/a.ts does not exist").hint).toContain("src/a.ts does not exist. Call list_files");
});

test("code errors point at the file and line", () => {
  const tsc = run("exit code: 2\nstdout:\nsrc/app.ts(12,5): error TS2304: Cannot find name 'foo'.");
  expect(tsc.hint).toBe("Fix line 12 of src/app.ts: Cannot find name 'foo'. Read that part of the file first.");
  const py = run('exit code: 1\nstderr:\nTraceback (most recent call last):\n  File "game.py", line 7, in <module>\n    print(x)\nNameError: name \'x\' is not defined');
  expect(py.hint).toBe("Fix line 7 of game.py: NameError: name 'x' is not defined.");
  expect(py.first).toBe("NameError: name 'x' is not defined");
});

test("successful results get nothing", () => {
  expect(run("exit code: 0\nstdout:\nall good")).toEqual({});
  expect(coachNote(run("exit code: 0\nstdout:\nerror in the logs is fine"), "")).toBe("");
});

test("an existing hint is not doubled; unknown failures still show the first error", () => {
  const out = "exit code: 1\nstderr:\nbash: cd: too many arguments\nhint: Quote paths";
  expect(coachNote(run(out), out)).toBe("");
  const odd = "exit code: 3\nstdout:\nbuilding...\nsomething failed badly\nmore";
  expect(coachNote(run(odd), odd)).toBe("\n\nFirst error: something failed badly");
});

test("firstError skips banners and success counts", () => {
  expect(firstError("Compiling...\n0 errors so far\nwarning: x\nerror: expected ;")).toBe("error: expected ;");
});
