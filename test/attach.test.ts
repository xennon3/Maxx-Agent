import { expect, test } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PNG } from "pngjs";
import { buildTurn, looksLikeText, saveInProject } from "../src/attach.ts";
import { typedText } from "../src/context.ts";
import { stripAttachments } from "../src/sessions.ts";

const enc = (s: string) => new TextEncoder().encode(s);
const png = (w: number, h: number) => {
  const p = new PNG({ width: w, height: h });
  p.data.fill(200);
  return new Uint8Array(PNG.sync.write(p));
};
const dir = () => mkdtemp(join(tmpdir(), "maxx-attach-"));

test("no files: the message is just the text", async () => {
  expect(await buildTurn("hi", [], { cwd: await dir(), contextWindow: 16384, vision: { mode: "native" } })).toEqual({ content: "hi", notes: [] });
});

test("text files are inlined, and lists show only what was typed", async () => {
  const t = await buildTurn("why does this fail?", [{ name: "app.ts", data: enc("const a = 1;\nthrow a;") }], { cwd: await dir(), contextWindow: 16384, vision: { mode: "native" } });
  expect(t.content).toContain('<file name="app.ts" lines="2">\nconst a = 1;\nthrow a;\n</file>');
  expect(stripAttachments(t.content as string)).toEqual({ text: "why does this fail?", files: ["app.ts"] });
});

test("a file too big for a 16K window is saved and only its start is inlined", async () => {
  const cwd = await dir();
  const big = Array.from({ length: 5000 }, (_, i) => `line ${i} of a long log file`).join("\n");
  const t = await buildTurn("summarize", [{ name: "build.log", data: enc(big) }], { cwd, contextWindow: 16384, vision: { mode: "native" } });
  const text = t.content as string;
  expect(text.length).toBeLessThan(16384 * 0.3 * 4 + 1000);
  expect(text).toContain('saved=".maxx/uploads/build.log"');
  expect(text).toMatch(/more lines not shown/);
  expect(await Bun.file(join(cwd, ".maxx/uploads/build.log")).text()).toBe(big);
  expect(t.notes[0]).toContain("too big");
});

test("images go to a vision model as parts and stay a typed turn", async () => {
  const t = await buildTurn("make it look like this", [{ name: "mock.png", data: png(2000, 1000) }], { cwd: await dir(), contextWindow: 16384, vision: { mode: "native" } });
  expect(Array.isArray(t.content)).toBe(true);
  const parts = t.content as any[];
  expect(parts[1].image_url.url).toStartWith("data:image/jpeg;base64,");
  expect(typedText({ role: "user", content: parts })).toContain("make it look like this");
  expect(stripAttachments(typedText({ role: "user", content: parts })!)).toEqual({ text: "make it look like this", files: ["mock.png"] });
});

test("a model that can't see gets the image saved, and the user is told", async () => {
  const cwd = await dir();
  const t = await buildTurn("", [{ name: "shot.png", data: png(10, 10) }], { cwd, contextWindow: 16384, vision: { mode: "off" } });
  expect(typeof t.content).toBe("string");
  expect(t.content).toContain(".maxx/uploads/shot.png");
  expect(t.notes[0]).toContain("cannot see images");
});

test("binary files and 'save' files land in the project without overwriting", async () => {
  const cwd = await dir();
  await Bun.write(join(cwd, "logo.png"), "old");
  const t = await buildTurn("use these", [{ name: "app.zip", data: new Uint8Array([80, 75, 3, 4, 0, 0]) }, { name: "logo.png", data: png(4, 4), mode: "save" }], { cwd, contextWindow: 32768, vision: { mode: "native" } });
  expect(t.content).toContain("[file added to the project: app.zip");
  expect(t.content).toContain("[file added to the project: logo-1.png");
  expect(await Bun.file(join(cwd, "logo.png")).text()).toBe("old");
  expect(stripAttachments(t.content as string).files).toEqual(["app.zip", "logo-1.png"]);
});

test("upload names can't escape the project", async () => {
  const cwd = await dir();
  expect(await saveInProject(cwd, "", "../../etc/passwd", enc("x"))).toBe("passwd");
  expect(await saveInProject(cwd, "", "C:\\Windows\\evil.bat", enc("x"))).toBe("evil.bat");
  expect(looksLikeText(enc("héllo"))).toBe(true);
  expect(looksLikeText(new Uint8Array([0, 1, 2]))).toBe(false);
});
