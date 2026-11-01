import { expect, test } from "bun:test";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ENGINE_JS, RUNTIME_JS, addEffect, emptyBank, engine, findSoundFiles, parseSoundFile, soundFile, starterBank } from "../src/sound/index.ts";
import { makeSounds } from "../src/tools/sound.ts";
import { cleanBank } from "../src/ui/stage.ts";
import { findTemplate, scaffold } from "../src/templates/index.ts";

const tmp = () => mkdtemp(join(tmpdir(), "maxx-snd-"));
const stats = (a: Float32Array) => {
  let peak = 0, sum = 0, bad = 0;
  for (const v of a) { if (!Number.isFinite(v)) bad++; peak = Math.max(peak, Math.abs(v)); sum += v * v; }
  return { peak, rms: Math.sqrt(sum / a.length), bad };
};

test("every effect kind renders audible, finite, unclipped sound", () => {
  for (const kind of engine.KINDS) {
    for (const seed of [1, 2, 3]) {
      const { params } = engine.makeSfx(kind, kind, seed);
      const s = stats(engine.renderSfx(params, 22050));
      expect(s.bad).toBe(0);
      expect(s.peak).toBeLessThanOrEqual(1);
      expect(s.rms).toBeGreaterThan(0.01);
    }
  }
});

test("words pick the kind and nudge the numbers", () => {
  expect(engine.kindOf("pew pew")).toBe("laser");
  expect(engine.kindOf("game over")).toBe("gameover");
  expect(engine.kindOf("eat")).toBe("coin");
  const plain = engine.fill(engine.makeSfx("boom", "explosion", 4).params);
  const made = engine.makeSfx("boom", "deep crunchy explosion", 4);
  expect(made.kind).toBe("explosion");
  expect(made.words).toEqual(["lower", "crunchy"]);
  expect(Number(made.params.freq)).toBeLessThan(Number(plain.freq));
  expect(Number(made.params.crush)).toBeGreaterThan(Number(plain.crush));
  // The same description gives the same sound; another seed gives another take.
  expect(engine.makeSfx("x", "coin")).toEqual(engine.makeSfx("x", "coin"));
  expect(engine.makeSfx("x", "coin", 9).params).not.toEqual(engine.makeSfx("x", "coin", 10).params);
});

test("every mood composes a loop that fits its bars and stays in range", () => {
  for (const mood of engine.MOODS) {
    const song = engine.compose(engine.recipe({ mood, seed: 5 }));
    expect(song.steps).toBe(8 * 16);
    expect(song.parts.lead!.length).toBeGreaterThan(16);
    for (const n of song.parts.lead!) { expect(n.n as number).toBeGreaterThanOrEqual(50); expect(n.n as number).toBeLessThanOrEqual(92); }
    const audio = engine.renderSong(song.recipe, 22050);
    expect(audio.length).toBe(Math.ceil(song.steps * song.stepSec * 22050));
    const s = stats(audio);
    expect(s.bad).toBe(0);
    expect(s.peak).toBeLessThan(1);
    expect(s.rms).toBeGreaterThan(0.03);
  }
  expect(engine.moodOf("haunted dungeon")).toBe("spooky");
  expect(engine.compose(engine.recipe({ mood: "happy", seed: 1, drop: ["drums"] })).parts.drums).toEqual([]);
  for (const jingle of engine.JINGLES) expect(stats(engine.renderSong(engine.recipe({ mood: "happy", jingle }), 22050)).rms).toBeGreaterThan(0.02);
});

test("a WAV file has the right header and length", () => {
  const wav = engine.toWav(new Float32Array(100), 8000);
  expect(new TextDecoder().decode(wav.slice(0, 4))).toBe("RIFF");
  expect(wav.length).toBe(44 + 200);
});

test("sound.js round-trips its bank and runs in a page without audio", () => {
  const bank = starterBank();
  const text = soundFile(bank);
  expect(parseSoundFile(text)).toEqual(bank);
  // The engine is spliced into the app page, so it can't hold these.
  for (const src of [ENGINE_JS, RUNTIME_JS]) { expect(src).not.toContain("`"); expect(src).not.toContain("</script"); expect(src).not.toContain("${"); }
  // No window or AudioContext: playing must quietly do nothing.
  const Sound = new Function(text + "\nreturn Sound;")();
  expect(Sound.names()).toEqual({ sfx: ["eat", "turn", "die"], jingles: ["gameover"], music: ["theme"] });
  Sound.play("eat");
  Sound.music("theme");
  expect(parseSoundFile("var x = 1")).toBeNull();
});

test("make_sounds writes sound.js next to the game, links it, merges and removes", async () => {
  const dir = await tmp();
  await writeFile(join(dir, "index.html"), "<html><body><canvas></canvas><script src=\"game.js\"></script></body></html>");
  const out = String(await makeSounds.run({ effects: [{ name: "shoot", describe: "short laser" }, { name: "win", describe: "victory fanfare" }], music: [{ name: "theme", mood: "boss" }] }, { cwd: dir }));
  expect(out).toContain("Wrote sound.js with 2 effects and 1 song");
  expect(out).toContain('Sound.play("shoot")');
  expect(out).toContain('Sound.music("theme")');
  const html = await readFile(join(dir, "index.html"), "utf8");
  expect(html.indexOf('<script src="sound.js">')).toBeLessThan(html.indexOf('<script src="game.js">'));
  let bank = parseSoundFile(await readFile(join(dir, "sound.js"), "utf8"))!;
  expect(Object.keys(bank.sfx)).toEqual(["shoot"]);
  expect(bank.jingles.win!.jingle).toBe("win");
  expect(bank.jingles.win!.key).toBe(bank.music.theme!.key); // jingles play in the song's key
  expect(bank.music.theme!.mood).toBe("boss");

  await makeSounds.run({ effects: [{ name: "jump" }], remove: ["shoot"] }, { cwd: dir });
  bank = parseSoundFile(await readFile(join(dir, "sound.js"), "utf8"))!;
  expect(Object.keys(bank.sfx)).toEqual(["jump"]);
  expect(Object.keys(bank.music)).toEqual(["theme"]);
  expect((await readFile(join(dir, "index.html"), "utf8")).match(/sound\.js/g)).toHaveLength(1);
  expect(await findSoundFiles(dir)).toEqual(["sound.js"]);

  await writeFile(join(dir, "other.js"), "var x = 1");
  expect(makeSounds.run({ effects: [{ name: "a" }], file: "other.js" }, { cwd: dir })).rejects.toThrow("isn't a Maxx sound file");
  expect(makeSounds.run({ effects: [{ name: "a" }], file: "../x.js" }, { cwd: dir })).rejects.toThrow("outside the workspace");
});

test("make_sounds finds the game in a subfolder", async () => {
  const dir = await tmp();
  await scaffold(findTemplate("html-game"), join(dir, "snake"));
  expect(await makeSounds.preview!({ effects: [{ name: "boom" }] }, { cwd: dir })).toContain("snake/sound.js");
  await makeSounds.run({ effects: [{ name: "boom", describe: "explosion" }] }, { cwd: dir });
  const bank = parseSoundFile(await readFile(join(dir, "snake", "sound.js"), "utf8"))!;
  expect(Object.keys(bank.sfx)).toEqual(["eat", "turn", "die", "boom"]);
});

test("the Snake template plays only sounds its bank has", async () => {
  const dir = await tmp();
  await scaffold(findTemplate("html-game"), dir);
  const game = await readFile(join(dir, "game.js"), "utf8");
  const bank = parseSoundFile(await readFile(join(dir, "sound.js"), "utf8"))!;
  for (const [, n] of game.matchAll(/Sound\.play\("(\w+)"\)/g)) expect(bank.sfx[n!] ?? bank.jingles[n!]).toBeDefined();
  for (const [, n] of game.matchAll(/Sound\.music\("(\w+)"\)/g)) expect(bank.music[n!]).toBeDefined();
  expect(await readFile(join(dir, "index.html"), "utf8")).toContain('<script src="sound.js"></script>');
});

test("a bank saved from the Sound lab is cleaned before it is written", () => {
  const bank = cleanBank({ sfx: { "bad name!": { wave: "laser", freq: 1e9, evil: "x" } }, music: { t: { mood: "nope", bpm: 9999, jingle: "win" } }, jingles: "no" });
  expect(Object.keys(bank.sfx)).toEqual(["bad_name"]);
  expect(bank.sfx.bad_name).toMatchObject({ wave: "square", freq: 4000 });
  expect(bank.sfx.bad_name).not.toHaveProperty("evil");
  expect(bank.music.t).toMatchObject({ mood: "happy", bpm: 240 });
  expect(bank.music.t).not.toHaveProperty("jingle");
  expect(bank.jingles).toEqual({});
  expect(addEffect(emptyBank(), { name: "lose", describe: "game over" })).toContain("gameover jingle");
});
