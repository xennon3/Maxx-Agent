import { describe, expect, test } from "bun:test";
import { mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { music, EXAMPLE_SCORE, findMusicFiles, SCORE_JS } from "../src/music/index.ts";
import { compose, makeSongTool, mixArgs, wantsMusic, MUSIC_TOOLS } from "../src/tools/music.ts";
import { taskFields, readResults, findSongServer } from "../src/music/acestep.ts";
import { TOOLSETS } from "../src/tools/index.ts";

const notes = (src: string, track?: string) => music.events(src).notes.filter((n) => !track || n.track === track);

describe("score language", () => {
  test("steps share a bar, and brackets split a step", () => {
    const n = notes("lead: c4 [d4 e4] ~ g4");
    expect(n.map((x) => x.n)).toEqual([60, 62, 64, 67]);
    expect(n.map((x) => x.t)).toEqual([0, 1, 1.5, 3]);
    expect(n[1]!.d).toBe(0.5);
  });
  test("_ holds, @ stretches, * repeats, ! copies", () => {
    expect(notes("x (piano): c4 _ _ e4").map((x) => [x.t, x.d])).toEqual([[0, 3], [3, 1]]);
    expect(notes("x (piano): c4@3 e4").map((x) => x.d)).toEqual([3, 1]);
    expect(notes("drums: hh*8").length).toBe(8);
    expect(notes("x (piano): c4!3 e4").map((x) => x.n)).toEqual([60, 60, 60, 64]);
  });
  test("<a b> takes turns bar by bar, also when a short track loops", () => {
    const n = notes("x (piano): <c4 e4 g4>\ny (piano): c4 | c4 | c4 | c4");
    expect(n.filter((x) => x.track === "x").map((x) => x.n)).toEqual([60, 64, 67, 60]);
  });
  test("chords are voiced close together; slash chords add the bass", () => {
    const n = notes("chords (pad): C | G/B");
    const bars = [n.filter((x) => x.t < 4).map((x) => x.n), n.filter((x) => x.t >= 4).map((x) => x.n)];
    expect(bars[0]!.length).toBe(3);
    expect(bars[1]!.length).toBe(4);
    expect(bars[1]![0]! % 12).toBe(11);
    const mid = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;
    expect(Math.abs(mid(bars[0]!) - mid(bars[1]!.slice(1)))).toBeLessThan(4);
  });
  test("a comma stacks layers; drums take names and aliases", () => {
    const n = notes("drums: bd ~ sd ~, hh*4, kick");
    expect(n.filter((x) => x.drum === "bd").length).toBe(2);
    expect(n.filter((x) => x.drum === "hh").length).toBe(4);
  });
  test("sections and form arrange the song", () => {
    const ev = music.events("section A\nx (piano): c4\nsection B\nx (piano): e4 | f4\nform: A B A");
    expect(ev.beats).toBe(16);
    expect(ev.sections.map((s) => s.name)).toEqual(["A", "B", "A"]);
    expect(ev.notes.map((x) => x.n)).toEqual([60, 64, 65, 60]);
  });
  test("a track whose instrument changes in another section is its own track", () => {
    const s = music.parse("section A\nlead (epiano): c5\nsection B\nlead (flute): e5\nform: A B");
    expect(Object.values(s.tracks).map((t) => t.inst).sort()).toEqual(["epiano", "flute"]);
  });
  test("instruments come from options, names or aliases", () => {
    const s = music.parse("bass: c2\nmelody (rhodes, vol 0.5, pan -0.3): c5\nbeat: bd");
    expect(s.tracks.bass!.inst).toBe("bass");
    expect(s.tracks.melody!.inst).toBe("epiano");
    expect(s.tracks.melody!.vol).toBe(0.5);
    expect(s.tracks.beat!.inst).toBe("drums");
  });
  test("mistakes are reported with their line, the rest still plays", () => {
    const a = music.analyze("lead: c4 [e4 g4\ndrums: bd zz\npiano (banjo): c4 xx4");
    const msgs = a.errors.map((e) => `${e.line}:${e.msg}`).join("\n");
    expect(msgs).toContain("1:lead: missing ]");
    expect(msgs).toContain("2:drums: \"zz\" isn't a drum");
    expect(msgs).toContain("unknown instrument \"banjo\"");
    expect(msgs).toContain("can't read \"xx4\"");
    expect(music.events("lead: c4 [e4 g4").notes.length).toBe(3);
  });
  test("warnings: a bass too high, one bar on repeat, notes outside the key", () => {
    const w = music.analyze("key: C major\nbass: c5 d5 | c5 d5\nlead (piano): c#5 f#5 g#5 a#5\nx (piano): " + Array(8).fill("c4").join(" | ")).warnings.join("\n");
    expect(w).toContain("bass is a bass but reaches");
    expect(w).toContain("lead repeats one bar");
    expect(w).toContain("outside C major");
  });
  test("the key is detected from the notes", () => {
    expect(music.analyze("x (piano): a3 c4 e4 a4 | e4 g#4 b4 e5 | a3 c4 e4 a4 | d4 f4 a4 d5").detected).toBe("A minor");
  });
});

describe("rendering", () => {
  test("every instrument makes sound, with no NaN", () => {
    for (const inst of Object.keys(music.INSTRUMENTS)) {
      const r = music.render(`bpm: 160\nx (${inst}): ${inst === "drums" ? "bd sd hh oh cp rim lt mt ht crash ride sh cb" : "c e g C"}`, { rate: 22050 });
      expect(r.rms).toBeGreaterThan(0.02);
      let bad = 0;
      for (const v of r.L) if (!Number.isFinite(v) || Math.abs(v) > 1) bad++;
      expect(bad).toBe(0);
    }
  });
  test("the example song renders in stereo, about as long as its bars", () => {
    const r = music.render(EXAMPLE_SCORE, { rate: 22050 });
    const a = music.analyze(EXAMPLE_SCORE);
    expect(a.errors).toEqual([]);
    expect(r.seconds).toBeGreaterThan(a.seconds);
    expect(r.seconds).toBeLessThan(a.seconds + 3);
    let diff = 0;
    for (let i = 0; i < r.L.length; i += 50) diff += Math.abs(r.L[i]! - r.R[i]!);
    expect(diff).toBeGreaterThan(1);
  });
  test("WAV and MIDI files are well formed", () => {
    const r = music.render("x (piano): c4", { rate: 8000 });
    const wav = music.toWav(r.L, r.R, r.rate);
    expect(new TextDecoder().decode(wav.slice(0, 4))).toBe("RIFF");
    expect(new DataView(wav.buffer).getUint16(22, true)).toBe(2);
    const mid = music.toMidi("chords (pad): Am F\ndrums: bd sd");
    expect(new TextDecoder().decode(mid.slice(0, 4))).toBe("MThd");
    expect(mid[11]).toBe(3); // tempo track + two tracks
    // drums go on channel 10
    expect([...mid].some((b, i) => b === 0x99 && mid[i + 1] === 36)).toBe(true);
  });
  test("the engine has no backticks, so the app page can embed it", () => {
    expect(SCORE_JS.includes("`")).toBe(false);
  });
});

describe("tools", () => {
  test("music is a toolset with three tools, added when someone talks about songs", () => {
    expect(TOOLSETS.music!.tools.map((t) => t.name)).toEqual(["compose", "make_song", "mix_audio"]);
    expect(MUSIC_TOOLS.length).toBe(3);
    expect(wantsMusic("make a chill lofi song for the menu")).toBe(true);
    expect(wantsMusic("compose a soundtrack")).toBe(true);
    expect(wantsMusic("edit theme.score so the bass is louder")).toBe(true);
    expect(wantsMusic("fix the high score counter")).toBe(false);
    expect(wantsMusic("add a login page")).toBe(false);
  });

  test("compose writes the score, wav and midi, and re-renders an edited file", async () => {
    const dir = await mkdtemp(join(tmpdir(), "maxx-music-"));
    try {
      const out = String(await compose.run({ score: "title: Tiny Tune\nbpm: 140\nlead (chip): c5 e5 g5 c6\ndrums: bd sd" }, { cwd: dir }));
      expect(out).toContain("Wrote music/tiny-tune.score");
      for (const ext of ["score", "wav", "mid"]) expect(existsSync(join(dir, "music", `tiny-tune.${ext}`))).toBe(true);
      await writeFile(join(dir, "music/tiny-tune.score"), "title: Tiny Tune\nlead (chip): c5 qq\n");
      const again = String(await compose.run({ file: "music/tiny-tune.score" }, { cwd: dir }));
      expect(again).toContain("problem");
      expect(again).toContain("line 2");
      expect(String(await compose.run({ score: "bpm: 100" }, { cwd: dir }))).toMatch(/^error: the score has no notes/);
      const found = await findMusicFiles(dir);
      expect(found.scores).toEqual(["music/tiny-tune.score"]);
      expect(found.audio).toEqual(["music/tiny-tune.wav"]);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test("mix_audio builds the right ffmpeg filters", () => {
    const abs = (p: string) => "/w/" + p;
    expect((mixArgs({ action: "layer", inputs: ["a.wav", "b.wav"], volumes: [1, 0.5], output: "m.mp3" }, abs) as string[]).join(" ")).toContain("[1:a]volume=0.5[a1];[a0][a1]amix=inputs=2");
    expect((mixArgs({ action: "join", inputs: ["a.wav", "b.wav", "c.wav"], crossfade: 2, output: "j.wav" }, abs) as string[]).join(" ")).toContain("[0:a][1:a]acrossfade=d=2[x1];[x1][2:a]acrossfade=d=2[out]");
    expect((mixArgs({ action: "loop", input: "a.ogg", times: 4, output: "l.ogg" }, abs) as string[]).slice(0, 2)).toEqual(["-stream_loop", "3"]);
    expect((mixArgs({ action: "tempo", input: "a.wav", factor: 3, output: "t.wav" }, abs) as string[]).join(" ")).toContain("atempo=2,atempo=1.5000");
    expect(mixArgs({ action: "fade", input: "a.wav", fade_out: 3, output: "f.wav" }, abs)).toMatch(/could not read/);
    expect((mixArgs({ action: "fade", input: "a.wav", fade_out: 3, output: "f.wav" }, abs, 10) as string[]).join(" ")).toContain("afade=t=out:st=7:d=3");
    expect(mixArgs({ action: "layer", inputs: ["a.wav"], output: "x.wav" }, abs)).toMatch(/two or more/);
  });

  test("make_song fields for ACE-Step", () => {
    const f = taskFields({ prompt: "synthwave", seconds: 90, bpm: 110, key: "A minor", seed: 7, takes: 9 });
    expect(f).toMatchObject({ task_type: "text2music", prompt: "synthwave", lyrics: "[Instrumental]", audio_duration: "90", bpm: "110", key_scale: "A minor", seed: "7", use_random_seed: "false", batch_size: "4" });
    expect(taskFields({ prompt: "x", mode: "cover", strength: 0.4 })).toMatchObject({ task_type: "cover", audio_cover_strength: "0.4" });
    expect(taskFields({ prompt: "x", mode: "repaint", start: 10, end: 20 })).toMatchObject({ task_type: "repaint", repainting_start: "10", repainting_end: "20" });
    expect(readResults('[{"file":"/v1/audio?path=a.mp3"},{"file":"/v1/audio?path=b.mp3"}]').length).toBe(2);
    expect(readResults({ file: "/v1/audio?path=a.mp3", seed_value: 3 })[0]!.seed_value).toBe(3);
  });

  test("make_song talks to a running ACE-Step server and saves the takes", async () => {
    const dir = await mkdtemp(join(tmpdir(), "maxx-song-"));
    let polls = 0, got: any = null, upload = false;
    const server = Bun.serve({
      port: 0,
      async fetch(req) {
        const u = new URL(req.url);
        if (u.pathname === "/health") return Response.json({ data: { status: "ok" }, code: 200 });
        if (u.pathname === "/v1/models") return Response.json({ data: { models: [{ name: "acestep-v15-turbo" }] }, code: 200 });
        if (u.pathname === "/release_task") {
          if ((req.headers.get("content-type") ?? "").includes("multipart")) { const f = await req.formData(); got = Object.fromEntries([...f.entries()].filter(([, v]) => typeof v === "string")); upload = f.get("src_audio") instanceof Blob; }
          else got = await req.json();
          return Response.json({ data: { task_id: "t1", status: "queued" }, code: 200, error: null });
        }
        if (u.pathname === "/query_result") {
          polls++;
          return Response.json({ code: 200, data: [polls < 2 ? { task_id: "t1", status: 0 } : { task_id: "t1", status: 1, result: JSON.stringify([{ file: "/v1/audio?path=%2Ftmp%2Fa.mp3", seed_value: 42, metas: { bpm: 120, keyscale: "C major", duration: 30 } }, { file: "/v1/audio?path=%2Ftmp%2Fb.mp3" }]) }] });
        }
        if (u.pathname === "/v1/audio") return new Response(new Uint8Array([0x49, 0x44, 0x33, 1, 2, 3]));
        return new Response("no", { status: 404 });
      },
    });
    const old = process.env.MAXX_SONG_URL;
    process.env.MAXX_SONG_URL = `http://127.0.0.1:${server.port}`;
    try {
      expect((await findSongServer())!.models).toEqual(["acestep-v15-turbo"]);
      const out = String(await makeSongTool.run({ prompt: "happy chiptune pop, female vocals", lyrics: "[verse]\nla la", takes: 2, path: "music/pop.mp3" }, { cwd: dir }));
      expect(out).toContain("Made 2 takes");
      expect(out).toContain("music/pop.mp3");
      expect(out).toContain("120 bpm");
      expect(existsSync(join(dir, "music/pop-2.mp3"))).toBe(true);
      expect(got.prompt).toBe("happy chiptune pop, female vocals");
      expect(got.batch_size).toBe(2);
      // a cover of a score renders it first and uploads the audio
      await mkdir(join(dir, "music"), { recursive: true });
      await writeFile(join(dir, "music/tune.score"), "lead (piano): c4 e4 g4 c5");
      polls = 0;
      const cover = String(await makeSongTool.run({ prompt: "jazz trio", from: "music/tune.score", path: "music/tune-jazz.mp3" }, { cwd: dir }));
      expect(cover).toContain("Made 2 takes");
      expect(upload).toBe(true);
      expect(got.task_type).toBe("cover");
    } finally {
      if (old === undefined) delete process.env.MAXX_SONG_URL; else process.env.MAXX_SONG_URL = old;
      server.stop(true);
      await rm(dir, { recursive: true, force: true });
    }
  }, 20000);

  test("make_song without a server says how to get one", async () => {
    const old = process.env.MAXX_SONG_URL;
    process.env.MAXX_SONG_URL = "http://127.0.0.1:9";
    try {
      const out = String(await makeSongTool.run({ prompt: "anything" }, { cwd: tmpdir() }));
      expect(out).toContain("ACE-Step");
      expect(out).toContain("start_api_server.bat");
    } finally {
      if (old === undefined) delete process.env.MAXX_SONG_URL; else process.env.MAXX_SONG_URL = old;
    }
  });
});
