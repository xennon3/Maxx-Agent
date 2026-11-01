import { afterAll, expect, test } from "bun:test";
import { mkdtemp, readFile, readdir, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Agent, type AgentIO } from "../src/loop.ts";
import { Permissions } from "../src/permissions.ts";
import { audioStats, decodeWav, encodeWav, frameStats, parseLines, stats, toCSV } from "../src/lab/data.ts";
import { cameraInstrument, commandInstrument, fileInstrument, micInstrument, parseArgs, serialInstruments, webInstrument, type Capture } from "../src/lab/instruments.ts";
import { extractCode, parseOutput, runTest, runtimes, findPython } from "../src/lab/sandbox.ts";
import { cleanLab, labSettings, parseFrame, parseHypotheses, parseInterpretation, parsePlan, runStudy, studyId, type Study } from "../src/lab/lab.ts";
import { md, reportHtml, sparkline } from "../src/lab/report.ts";
import { fakePorts } from "../src/lab/serial.ts";
import jpeg from "jpeg-js";

process.env.MAXX_FAKE_SERIAL = "COM9=Test board";

// A fake LM Studio that answers by which lab phase is asking (tests run in parallel).
const requests: any[] = [];
let brokenOnce = true;
const PY_SLOPE = `import csv, glob
rows = list(csv.DictReader(open(glob.glob("data/E1-*.csv")[0])))
t = [float(r["t"]) for r in rows]; y = [float(r["temp"]) for r in rows]
n = len(t); mt = sum(t)/n; my = sum(y)/n
slope = sum((a-mt)*(b-my) for a, b in zip(t, y)) / sum((a-mt)**2 for a in t)
print(f"METRIC slope={slope:.4f}")
print("RESULT: SUPPORTED - temperature rises" if slope > 0 else "RESULT: REFUTED - flat")`;
function reply(body: any): string {
  const sys = String(body.messages[0]?.content ?? "");
  const last = body.messages.at(-1);
  const user = typeof last.content === "string" ? last.content : last.content.map((p: any) => p.text ?? "").join(" ");
  if (sys.startsWith("You run a small research lab. You turn")) return "QUESTION: Does the board's temperature rise while it runs?\nMEASURE: temperature over time\n1. COM9 | seconds=3\n2. banana | x\n3. mic | seconds=2\n4. web | board heat";
  if (sys.startsWith("You are the scientist")) return "Here you go:\nH1: The temperature rises over time | predicts: a positive slope | test: fit a line | prior: 60%\n2. The sound jump is a fan | predicts: louder second half | test: compare halves | prior: 0.4";
  if (sys.startsWith("You write short")) {
    if (user.includes("The script failed")) return "```python\nprint('METRIC halves=1')\nprint('RESULT: INCONCLUSIVE - too little sound')\n```";
    if (user.includes("H2") && brokenOnce) return (brokenOnce = false), "```python\nprint(undefined_name)\n```";
    return "```python\n" + PY_SLOPE + "\n```";
  }
  if (sys.startsWith("You read the output")) return user.includes("H1") ? "VERDICT: supported\nCONFIDENCE: 85%\nWHY: slope is positive" : "VERDICT: inconclusive\nWHY: not enough";
  if (sys.startsWith("You are a skeptical")) return "- only 3 seconds of data\nWOULD CHANGE MY MIND: a flat reading over an hour";
  if (sys.startsWith("You write the conclusion")) return "## Answer\nYes, it warms up slowly [E1]. Overall confidence: 80%\n## Findings\n- temp rose [H1]\n## Caveats\n- short\n## Next experiments\n- log for an hour";
  return "NONE";
}
const server = Bun.serve({
  port: 0,
  async fetch(req) {
    const body = await req.json();
    requests.push(body);
    const chunks = [{ choices: [{ delta: { content: reply(body) } }] }];
    return new Response(chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join("") + "data: [DONE]\n\n", { headers: { "content-type": "text/event-stream" } });
  },
});
afterAll(() => server.stop());

function tone(hz: number, seconds: number, rate = 16000) {
  const s = new Float32Array(seconds * rate);
  for (let i = 0; i < s.length; i++) s[i] = 0.3 * Math.sin((2 * Math.PI * hz * i) / rate);
  return s;
}

async function setup(answer: "yes" | "no" | "always" = "always", mode: "ask" | "yolo" = "ask") {
  const dir = await mkdtemp(join(tmpdir(), "maxx-lab-"));
  const asked: string[] = [];
  const notes: string[] = [];
  const io: AgentIO = { token: () => {}, toolStart: () => {}, toolEnd: () => {}, note: (t) => notes.push(t), ask: async (q) => (asked.push(q), answer) };
  const permissions = await new Permissions(dir, mode).load();
  const agent = await new Agent({ llm: { baseURL: `http://localhost:${server.port}/v1`, model: "fake" }, cwd: dir, permissions, vision: { mode: "off" }, contextWindow: 16384 }, io).init();
  return { dir, agent, asked, notes, permissions };
}

test("parseLines reads key=value, key: value, CSV with a header and bare numbers", () => {
  const at = (texts: string[]) => texts.map((text, i) => ({ t: i, text }));
  expect(parseLines(at(["temp=21.5,hum=40", "T: 22 Hum%: 41", "booting...", "temp=22.1"])).rows).toEqual([{ t: 0, temp: 21.5, hum: 40 }, { t: 1, t_value: 22, hum: 41 }, { t: 3, temp: 22.1 }]);
  const csv = parseLines(at(["time,light,sound", "0,610,41", "1,620,42.5"]));
  expect(csv.keys).toEqual(["time", "light", "sound"]);
  expect(csv.rows[1]).toEqual({ t: 2, time: 1, light: 620, sound: 42.5 });
  expect(parseLines(at(["512 300", "515 290"])).rows[0]).toEqual({ t: 0, v1: 512, v2: 300 });
  expect(toCSV([{ t: 0, a: 1 }, { t: 1, a: 2.5 }], ["a"])).toBe("t,a\n0,1\n1,2.5\n");
});

test("parseLines keeps the time as t when a sensor prints its own T:", () => {
  const r = parseLines([{ t: 5, text: "T: 22 Hum%: 41" }]);
  expect(r.rows[0]).toEqual({ t: 5, t_value: 22, hum: 41 });
});

test("stats give the mean, spread and the trend per second", () => {
  const rows = [0, 1, 2, 3].map((t) => ({ t, temp: 20 + 0.5 * t }));
  const [s] = stats(rows, ["temp"]);
  expect(s!.mean).toBeCloseTo(20.75);
  expect(s!.slope).toBeCloseTo(0.5);
  expect(s!.min).toBe(20);
  expect(s!.last).toBe(21.5);
});

test("audio: a WAV round-trips and a 440 Hz tone is found", () => {
  const wav = encodeWav(tone(440, 1), 16000);
  const { samples, rate } = decodeWav(wav);
  expect(rate).toBe(16000);
  const a = audioStats(samples, rate);
  expect(Math.abs(a.dominantHz - 440)).toBeLessThan(8);
  expect(a.rows).toHaveLength(10);
  expect(a.rmsDb).toBeCloseTo(-13.5, 0);
});

test("camera frames: brightness and motion between frames", () => {
  const frame = (v: number) => jpeg.encode({ width: 32, height: 32, data: new Uint8Array(32 * 32 * 4).fill(v) }, 90).data;
  const dark = frameStats(frame(20));
  expect(dark.brightness).toBeLessThan(10);
  expect(dark.motion).toBeUndefined();
  const lit = frameStats(frame(220), frame(20));
  expect(lit.brightness).toBeGreaterThan(80);
  expect(lit.motion).toBeGreaterThan(70);
});

test("parseArgs takes key=value pairs and free words", () => {
  expect(parseArgs('seconds=10 baud=115200 send="R 1"')).toEqual({ seconds: "10", baud: "115200", send: "R 1" });
  expect(parseArgs("solar panel output vs temperature")).toEqual({ q: "solar panel output vs temperature" });
});

test("the planner's instrument names are matched forgivingly, unknown ones dropped", () => {
  const inst = [webInstrument(true), cameraInstrument(null), micInstrument(null), { ...webInstrument(true), id: "serial:COM3" }];
  const f = parseFrame("**QUESTION:** Is it warm?\nMEASURE: degrees\n1. COM3 | seconds=5\n2. webcam | frames=2\n- microphone | seconds=3\n3. thermometer | x\n4. web | warm rooms", inst, 10);
  expect(f.question).toBe("Is it warm?");
  expect(f.plan.map((p) => p.instrument)).toEqual(["serial:COM3", "camera", "mic", "web"]);
  expect(f.dropped).toEqual(["thermometer"]);
  expect(parsePlan("NONE", inst, 5).plan).toEqual([]);
  expect(parsePlan("1. web | a\n2. web | b\n3. web | c", inst, 2).plan).toHaveLength(2);
});

test("hypotheses: claim, prediction, test and prior, in loose spellings", () => {
  const hs = parseHypotheses("H1: Sun heats the desk | predicts: warmer at 3pm | test: compare | prior: 70%\nHypothesis 2. The PC heats it | prior: 0.3\n- H3: chance | predicts: no trend", 5);
  expect(hs.map((h) => [h.id, h.text, h.prior])).toEqual([["H1", "Sun heats the desk", 70], ["H2", "The PC heats it", 30], ["H3", "chance", 50]]);
  expect(hs[0]!.predicts).toBe("warmer at 3pm");
});

test("test output: the last RESULT line and METRIC lines; code fences found", () => {
  const o = parseOutput("METRIC slope=0.08\nMETRIC: r2 = 0.91\nRESULT: refuted - no\nRESULT: **SUPPORTED** — slope 0.08 > 0");
  expect(o.verdict).toEqual({ result: "supported", why: "slope 0.08 > 0" });
  expect(o.metrics).toEqual({ slope: 0.08, r2: 0.91 });
  expect(parseOutput("all good").verdict).toBeUndefined();
  expect(extractCode("Sure:\n```python\nprint(1)\n```\nand ```js\nx\n```", "python")).toBe("print(1)");
  expect(extractCode("```\nconsole.log(2)\n```", "js")).toBe("console.log(2)");
  expect(extractCode("```python\nprint(3)", "python")).toBe("print(3)");
  expect(extractCode("I can't", "python")).toBeNull();
});

test("interpretation: a stated confidence wins, else the verdict nudges the prior", () => {
  const run = { ok: true, code: 0, output: "", ms: 1, timedOut: false, metrics: {}, verdict: { result: "refuted" as const, why: "flat" } };
  expect(parseInterpretation("VERDICT: supported\nCONFIDENCE: 88%\nWHY: big slope", run, 50)).toEqual({ status: "supported", posterior: 88, why: "big slope" });
  expect(parseInterpretation("hmm", run, 50)).toEqual({ status: "refuted", posterior: 20, why: "flat" });
});

test("settings are clamped and filled from the defaults", () => {
  expect(cleanLab({ rounds: 9, parallel: "2", skeptic: false, bogus: 1 })).toEqual({ rounds: 4, parallel: 2, skeptic: false });
  expect(labSettings({ rounds: 1 }).hypotheses).toBe(3);
  expect(studyId("Does my desk get warmer in the sun?", new Date(2026, 10, 1, 9, 5, 3))).toBe("20261101-090503-does-my-desk-get-warmer");
});

test("the simulated board shows up as a COM port and prints readings", async () => {
  expect(fakePorts()).toEqual([{ path: "COM9", name: "Test board (simulated)" }]);
  const [board] = (await serialInstruments()).filter((i) => i.id === "serial:COM9");
  expect(board!.gated).toBe(true);
  const r = await board!.run({ seconds: "2" }, { cwd: tmpdir() });
  expect(r.keys).toEqual(["temp", "light", "sound"]);
  expect(r.text).toContain("temp: n=8");
});

test("a custom command is an instrument; a data file too", async () => {
  const dir = await mkdtemp(join(tmpdir(), "maxx-lab-inst-"));
  const cmd = commandInstrument({ id: "station", command: `echo "wind=3.5" && echo "wind=4.5"`, about: "a weather station" });
  const r = await cmd.run({}, { cwd: dir });
  expect(r.rows!.map((x) => x.wind)).toEqual([3.5, 4.5]);
  await Bun.write(join(dir, "data.csv"), "x,y\n1,2\n2,4\n");
  const f = await fileInstrument().run({ path: "data.csv" }, { cwd: dir });
  expect(f.keys).toEqual(["x", "y"]);
  await expect(fileInstrument().run({ path: "../etc/passwd" }, { cwd: dir })).rejects.toThrow("inside the project");
});

test("camera and mic need a capture route; without one they say why", async () => {
  expect(cameraInstrument(null).unavailable).toContain("no camera");
  const frame = jpeg.encode({ width: 16, height: 16, data: new Uint8Array(16 * 16 * 4).fill(128) }, 90).data;
  const capture: Capture = async (kind) => (kind === "camera" ? { frames: [frame, frame], device: "Fake cam" } : { wav: encodeWav(tone(1000, 2), 16000) });
  const c = await cameraInstrument(capture).run({ frames: "2", every: "1" }, { cwd: tmpdir() });
  expect(c.title).toBe("2 photos from Fake cam");
  expect(c.files!.map((f) => f.name)).toEqual(["frame-1.jpg", "frame-2.jpg"]);
  const m = await micInstrument(capture).run({ seconds: "2" }, { cwd: tmpdir() });
  expect(m.text).toContain("loudest pitch 1000 Hz");
});

const py = findPython();
test.skipIf(!py)("the sandbox runs Python, reads METRIC/RESULT and blocks the network while it is off", async () => {
  const dir = await mkdtemp(join(tmpdir(), "maxx-lab-sb-"));
  await mkdir(join(dir, "tests"));
  const runtime = runtimes().find((r) => r.lang === "python")!;
  const ok = await runTest({ dir, name: "t1", code: "print('METRIC x=2')\nprint('RESULT: SUPPORTED - fine')", runtime, seconds: 20, network: false });
  expect(ok.ok).toBe(true);
  expect(ok.metrics).toEqual({ x: 2 });
  const net = await runTest({ dir, name: "t2", code: "import socket\ntry:\n    socket.create_connection(('example.com', 80), 2)\n    print('RESULT: SUPPORTED - reached it')\nexcept OSError as e:\n    print('RESULT: INCONCLUSIVE -', e)", runtime, seconds: 20, network: false });
  expect(net.verdict!.why).toContain("network access is off");
  const slow = await runTest({ dir, name: "t3", code: "import time\ntime.sleep(10)", runtime, seconds: 1, network: false });
  expect(slow.timedOut).toBe(true);
  expect(slow.ok).toBe(false);
});

test("the sandbox's JavaScript fallback runs on Maxx's own runtime", async () => {
  const dir = await mkdtemp(join(tmpdir(), "maxx-lab-js-"));
  await mkdir(join(dir, "tests"));
  const runtime = runtimes().find((r) => r.lang === "js")!;
  const r = await runTest({ dir, name: "j1", code: "console.log('METRIC y=' + (6*7)); console.log('RESULT: REFUTED - nope')", runtime, seconds: 20, network: false });
  expect(r.ok).toBe(true);
  expect(r.metrics.y).toBe(42);
  expect(r.verdict!.result).toBe("refuted");
});

test("camera and mic ask even in never-ask mode; Always saves a rule", async () => {
  const { agent, asked } = await setup("always", "yolo");
  expect(await agent.approve("instrument", "camera", "Let Maxx use Camera?", "", true)).toBe("you");
  expect(await agent.approve("instrument", "camera", "Let Maxx use Camera?", "", true)).toBe("saved rule");
  expect(await agent.approve("instrument", "serial:COM3", "Let Maxx use COM3?", "")).toBe("not needed");
  expect(asked).toEqual(["Let Maxx use Camera?"]);
});

test.skipIf(!py)("a whole study: frame, collect, hypothesize, test (with a fix), review, conclude, notebook", async () => {
  const { dir, agent, asked, notes } = await setup("always");
  const capture: Capture = async () => ({ wav: encodeWav(tone(220, 2), 16000) });
  const seen: Study[] = [];
  const s = await runStudy(agent, "Does my board warm up?", { study: (x) => seen.push(x) }, {
    settings: labSettings({ rounds: 1, parallel: 2 }),
    instruments: [webInstrument(false), ...(await serialInstruments()), micInstrument(capture)],
  });
  expect(s.state).toBe("done");
  expect(s.sharpened).toBe("Does the board's temperature rise while it runs?");
  // banana is not an instrument; web is off so it is skipped and logged.
  expect(notes.some((n) => n.includes("banana"))).toBe(true);
  expect(s.evidence.map((e) => e.instrument)).toEqual(["serial:COM9", "mic"]);
  expect(s.log.map((l) => [l.instrument, l.approval, l.ok])).toEqual([["serial:COM9", "you", true], ["mic", "you", true], ["web", "unavailable", false]]);
  expect(asked).toEqual(["Let Maxx use Test board (simulated) (COM9)?", "Let Maxx use Microphone?"]);
  const [h1, h2] = s.hypotheses;
  expect(h1).toMatchObject({ status: "supported", prior: 60, posterior: 85 });
  expect(h1!.metrics!.slope).toBeGreaterThan(0);
  expect(h2).toMatchObject({ status: "inconclusive", prior: 40, posterior: 40, tries: 2 });
  expect(s.skeptic).toContain("WOULD CHANGE MY MIND");
  expect(s.confidence).toBe(80);
  // The phases came by in order.
  const phases = [...new Set(seen.map((x) => x.state))];
  expect(phases).toEqual(["framing", "collecting", "hypothesizing", "testing", "reviewing", "concluding", "done"]);
  // The notebook on disk.
  const files = await readdir(s.dir);
  expect(files.sort()).toEqual(["REPORT.md", "data", "instruments.jsonl", "raw", "report.html", "study.json", "tests"]);
  expect((await readdir(join(s.dir, "data"))).sort()).toEqual(["E1-serial-COM9.csv", "E2-mic.csv"]);
  expect(existsSync(join(s.dir, "raw", "E2", "sound.wav"))).toBe(true);
  expect((await readFile(join(s.dir, "instruments.jsonl"), "utf8")).trim().split("\n")).toHaveLength(3);
  const html = await readFile(join(s.dir, "report.html"), "utf8");
  expect(html).toContain('<a class="cite" href="#E1">E1</a>');
  expect(html).toContain("<svg");
  expect(await readFile(join(s.dir, "REPORT.md"), "utf8")).toContain("| H1 | The temperature rises over time | supported | 60% → 85%");
  // It is part of the conversation too.
  expect(agent.history.at(-2)).toEqual({ role: "user", content: "🔬 Does my board warm up?" });
  expect(String(agent.history.at(-1)!.content)).toContain(`.maxx/research/${s.id}/report.html`);
});

test("denying an instrument carries on without it", async () => {
  const { agent } = await setup("no");
  const s = await runStudy(agent, "Is it warm?", { study: () => {} }, { settings: labSettings({ rounds: 1, skeptic: false }), instruments: [...(await serialInstruments())], runtime: runtimes().find((r) => r.lang === "js")! });
  expect(s.log[0]).toMatchObject({ instrument: "serial:COM9", approval: "denied" });
  expect(s.evidence).toHaveLength(0);
  expect(s.state).toBe("done");
});

test("report helpers: markdown with citations, sparklines", () => {
  expect(md("## Answer\n- **yes** [E2]\nplain <b>")).toBe('<h3>Answer</h3>\n<ul>\n<li><b>yes</b> <a class="cite" href="#E2">E2</a></li>\n</ul>\n<p>plain &lt;b&gt;</p>');
  expect(sparkline([1])).toBe("");
  expect(sparkline([1, 2, 3])).toContain("polyline");
});

test("reportHtml draws an unfinished study too", async () => {
  const s: Study = { id: "x", question: "Q?", state: "stopped", round: 1, rounds: 2, plan: [], evidence: [], hypotheses: [], log: [], dir: tmpdir(), started: new Date().toISOString(), model: "m", note: "Stopped." };
  expect(await reportHtml(s)).toContain("Stopped.");
});
