import { expect, test } from "bun:test";
import { mkdtemp, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { TEMPLATES, findTemplate, freeFolder, scaffold, varsFor } from "../src/templates/index.ts";
import { GRADLE_WRAPPER_SHA256 } from "../src/templates/gradle-wrapper-jar.ts";
import { useTemplate } from "../src/tools/template.ts";
import { startUI } from "../src/ui/server.ts";

const tmp = () => mkdtemp(join(tmpdir(), "maxx-tpl-"));
const python = Bun.which("python3") ?? Bun.which("python");

test("names become a title, a folder slug and a Java package", () => {
  expect(varsFor("/x/tip-calc")).toMatchObject({ name: "Tip Calc", slug: "tip-calc", pkg: "tipcalc" });
  expect(varsFor("/x/y", "2048 clone!")).toMatchObject({ name: "2048 Clone", slug: "2048-clone", pkg: "app2048clone" });
  expect(varsFor("/x/y", `"; rm -rf /`)).toMatchObject({ name: "Rm Rf", pkg: "rmrf" });
});

for (const t of TEMPLATES) {
  test(`${t.id} writes a complete project with notes for the model`, async () => {
    const dir = join(await tmp(), "Snake Pit");
    const files = await scaffold(t, dir);
    expect(files).toContain("MAXX.md");
    for (const f of files) expect((await stat(join(dir, f))).isFile()).toBe(true);
    for (const f of files.filter((f) => !f.endsWith(".jar"))) {
      const text = await readFile(join(dir, f), "utf8");
      expect(text).not.toContain("${"); // nothing left uninterpolated
      expect(text).not.toContain("[object");
    }
    expect(await readFile(join(dir, "MAXX.md"), "utf8")).toStartWith("# Snake Pit");
  });
}

test("the Android template has a working Gradle wrapper for Windows and Unix", async () => {
  const dir = await tmp();
  const files = await scaffold(findTemplate("android-compose"), join(dir, "tip-calc"));
  const root = join(dir, "tip-calc");
  expect(files).toContain("app/src/main/java/com/example/tipcalc/MainActivity.kt");
  expect(await readFile(join(root, "app/build.gradle.kts"), "utf8")).toContain('applicationId = "com.example.tipcalc"');
  const bat = await readFile(join(root, "gradlew.bat"), "utf8");
  expect(bat.split("\n").every((l, i, all) => i === all.length - 1 || l.endsWith("\r"))).toBe(true);
  if (process.platform !== "win32") expect((await stat(join(root, "gradlew"))).mode & 0o111).toBeTruthy();
  const jar = await readFile(join(root, "gradle/wrapper/gradle-wrapper.jar"));
  expect(new Bun.CryptoHasher("sha256").update(jar).digest("hex")).toBe(GRADLE_WRAPPER_SHA256);
});

test("the game's script parses", async () => {
  const dir = await tmp();
  await scaffold(findTemplate("html-game"), dir);
  expect(() => new Function(require("node:fs").readFileSync(join(dir, "game.js"), "utf8"))).not.toThrow();
});

test("templates never overwrite files", async () => {
  const dir = await tmp();
  await writeFile(join(dir, "main.py"), "mine");
  expect(scaffold(findTemplate("python-script"), dir)).rejects.toThrow("already has main.py");
  expect(await readFile(join(dir, "main.py"), "utf8")).toBe("mine");
  expect(freeFolder(dir, "main.py")).toBe(join(dir, "main.py-2"));
});

for (const id of ["python-script", "web-app"]) {
  test.skipIf(!python)(`${id}'s own tests pass`, async () => {
    const dir = await tmp();
    await scaffold(findTemplate(id), dir);
    const p = Bun.spawnSync([python!, "-m", "unittest", "-v"], { cwd: dir, stderr: "pipe" });
    expect(p.stderr.toString()).toContain("OK");
    expect(p.exitCode).toBe(0);
  }, 20_000);
}

test("use_template fills an empty workspace, else makes a folder beside what is there", async () => {
  const dir = await tmp();
  const first = await useTemplate.run({ template: "html-game" }, { cwd: dir });
  expect(first).toContain("Created the HTML game template in the workspace");
  expect(first).toContain("Tweak me"); // the MAXX.md notes come back to the model
  const second = String(await useTemplate.run({ template: "python-script" }, { cwd: dir }));
  expect(second).toContain("in my-script");
  expect(second).toContain("cd my-script");
  expect(await readdir(join(dir, "my-script"))).toContain("main.py");
  expect(await useTemplate.preview!({ template: "web-app", folder: "notes" }, { cwd: dir })).toContain("create 7 files in notes");
  expect(useTemplate.run({ template: "web-app", folder: "../out" }, { cwd: dir })).rejects.toThrow("outside the workspace");
});

test("the app window starts a template from a new session", async () => {
  const lm = Bun.serve({ port: 0, fetch: () => Response.json({ data: [{ id: "tiny-model" }] }) });
  const ui = await startUI({ baseURL: `http://127.0.0.1:${lm.port}/v1`, port: 0, open: false });
  const dir = await tmp();
  await writeFile(join(dir, "notes.txt"), "not empty");
  const ws = new WebSocket(`ws://127.0.0.1:${ui.server.port}/ws?t=${ui.token}`);
  const got: any[] = [];
  const wait = (type: string) =>
    new Promise<any>((res) => {
      const check = () => {
        const m = got.find((m) => m.type === type);
        m ? (got.splice(got.indexOf(m), 1), res(m)) : setTimeout(check, 10);
      };
      check();
    });
  try {
    ws.onmessage = (e) => got.push(JSON.parse(String(e.data)));
    await new Promise((r) => (ws.onopen = r));
    ws.send(JSON.stringify({ type: "open", cwd: dir }));
    expect((await wait("state")).templates.map((t: any) => t.id)).toEqual(TEMPLATES.map((t) => t.id));
    ws.send(JSON.stringify({ type: "template", id: "html-game" }));
    const done = await wait("templated");
    expect(done.cwd).toBe(join(dir, "snake-game"));
    expect(done.try.length).toBeGreaterThan(0);
    const state = got.filter((m) => m.type === "state").pop();
    expect(state.current.cwd).toBe(join(dir, "snake-game")); // the new folder is now the open project
  } finally {
    ws.close();
    ui.stop();
    lm.stop(true);
  }
});
