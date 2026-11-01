import { afterAll, beforeAll, expect, test } from "bun:test";
import { mkdtemp, readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Agent, type AgentIO } from "../src/loop.ts";
import { Permissions } from "../src/permissions.ts";
import { serialInstruments, type Instrument } from "../src/lab/instruments.ts";
import { runtimes } from "../src/lab/sandbox.ts";
import { labSettings, runStudy } from "../src/lab/lab.ts";
import { gapMapSvg, ideaTreeSvg, kindOf, listLeads, loadPredictions, outliers, parseAssumptions, parseHorizon, parseJudge, scoreSide, settlePrediction, trackRecord, type Prediction } from "../src/lab/discover.ts";
import { harness, listLabs, listRuns, parseDesign, parseSweeps, runSim, sweepRuns, sweepTable } from "../src/lab/sim.ts";
import { detect, runWatch } from "../src/lab/watch.ts";
import type { Claim } from "../src/lab/truth.ts";

process.env.MAXX_FAKE_SERIAL = "COM9=Test board";
const oldHome = process.env.MAXX_HOME;
beforeAll(async () => {
  process.env.MAXX_HOME = await mkdtemp(join(tmpdir(), "maxx-discover-home-"));
});
afterAll(() => {
  if (oldHome === undefined) delete process.env.MAXX_HOME;
  else process.env.MAXX_HOME = oldHome;
});

const js = runtimes().find((r) => r.lang === "js")!;
const LAB_CODE = `const LAB = {
  title: "Board heat", about: "a board heating with load and cooling to the room",
  params: { load: { min: 0, max: 100, step: 1, value: 50, unit: "%", label: "CPU load" } },
  outputs: { temp: { unit: "C", label: "Board temperature" } },
  steps: 200,
  init(p, rnd) { return { temp: 22 }; },
  step(s, p, rnd, t) { s.temp += 0.05 * (22 + 0.3 * p.load - s.temp) + (rnd() - 0.5) * 0.01; },
  measure(s) { return { temp: s.temp }; },
  draw(ctx, s, p, w, h) { ctx.fillRect(0, 0, w, h); }
};`;

// ---------- the virtual lab ----------

test("a lab design: NONE, REUSE or new code", () => {
  expect(parseDesign("NONE, a simulation adds nothing")).toEqual({ kind: "none" });
  expect(parseDesign("REUSE: Board-Heat")).toEqual({ kind: "reuse", slug: "board-heat" });
  expect(parseDesign("Here:\n```js\n" + LAB_CODE + "\n```")).toMatchObject({ kind: "new" });
  expect(parseDesign("```js\nconsole.log(1)\n```")).toEqual({ kind: "none" });
});

test("sweeps are read loosely, clamped to the parameter's range, and expanded into seeded runs", () => {
  const meta = { params: { load: { min: 0, max: 100, value: 50 } }, outputs: { temp: {}, noise: {} } };
  const sw = parseSweeps("1. sweep load from -20 to 100 in 3 steps | seeds=2 | watch=temp\nsweep banana 1 to 2\nsweep load 10..20", meta);
  expect(sw).toEqual([{ param: "load", from: 0, to: 100, count: 3, seeds: 2, steps: undefined, watch: ["temp"] }, { param: "load", from: 10, to: 20, count: 6, seeds: 3, steps: undefined, watch: ["temp", "noise"] }]);
  const runs = sweepRuns(sw[0]!);
  expect(runs.map((r) => r.params.load)).toEqual([0, 0, 50, 50, 100, 100]);
  expect(new Set(runs.map((r) => r.seed)).size).toBe(2);
});

test("the headless harness runs a lab with a seeded random, the same every time", async () => {
  const dir = await mkdtemp(join(tmpdir(), "maxx-sim-"));
  const runs = [{ params: { load: 0 }, seed: 1, steps: 200 }, { params: { load: 100 }, seed: 1, steps: 200 }, { params: { load: 100 }, seed: 1, steps: 200 }];
  const r = await runSim(dir, "t", LAB_CODE, runs, js, 30);
  expect(r.ok).toBe(true);
  expect(r.meta).toMatchObject({ title: "Board heat", steps: 200, draws: true });
  expect(r.runs[0]!.final.temp).toBeCloseTo(22, 0);
  expect(r.runs[1]!.final.temp).toBeCloseTo(52, 0);
  expect(r.runs[1]!.final.temp).toBe(r.runs[2]!.final.temp);
  const t = sweepTable({ param: "load", from: 0, to: 100, count: 2, seeds: 1, watch: ["temp"] }, r.runs.slice(0, 2));
  expect(t.keys).toEqual(["load", "seed", "temp"]);
  expect(t.text).toContain("load=100: temp=51.99");
  // A broken lab says what is wrong.
  const bad = await runSim(dir, "bad", "const LAB = { init() { return {}; }, step() {}, measure() { return { x: NaN }; } };", [{ params: {}, seed: 1, steps: 3 }], js, 30);
  expect(bad.ok).toBe(false);
  expect(bad.output).toContain("finite number");
  expect(harness("x", [])).toContain("const runs = [];");
});

// ---------- discovery ----------

test("hypothesis kinds and flipped assumptions", () => {
  expect(kindOf("[wildcard] The sensor heats itself")).toEqual({ kind: "wildcard", text: "The sensor heats itself", field: undefined });
  expect(kindOf("(borrowed from ant colonies) Fans share the load")).toEqual({ kind: "borrowed", text: "Fans share the load", field: "ant colonies" });
  expect(kindOf("[Flip]: Heat comes from the regulator").kind).toBe("flipped");
  expect(kindOf("Plain idea").kind).toBe("rival");
  expect(parseAssumptions("ASSUMPTION: heat comes from the CPU | FLIP: it comes from the regulator\n- **ASSUMPTION**: rooms are stable | FLIP: the room warms too")).toEqual([
    { text: "heat comes from the CPU", flip: "it comes from the regulator" },
    { text: "rooms are stable", flip: "the room warms too" },
  ]);
});

test("debate sides score only what they cite: measured beats opinion, inventions cost", () => {
  const claims = [{ id: "C1", status: "observed" }, { id: "C2", status: "opinion" }, { id: "C3", status: "fabricated" }] as Claim[];
  const a = scoreSide("H1", "- it rose [C1] [E1]\n- people say so [C2]\nsome preamble", claims, new Set(["E1"]), new Set(["H1"]));
  const b = scoreSide("H2", "1. a fake [C3]\n2. made up [E9]\n3. no citation", claims, new Set(["E1"]), new Set(["H1"]));
  expect(a.points.map((p) => p.score)).toEqual([5, 0]);
  expect(a.score).toBe(5);
  expect(b.score).toBe(-4);
  expect(parseJudge("WINNER: b\nWHY: louder", a, b)).toEqual({ winner: "B", why: "louder" });
  expect(parseJudge("I cannot decide", a, b)).toEqual({ winner: "A", why: "decided by the evidence scores" });
});

test("the horizon: gap map, dated predictions, experiments and what would change my mind", () => {
  const h = parseHorizon("KNOWN: board warms under load [C1, E1]\nPARTLY: role of the fan\nGAP: room temperature drift - nobody logged the room\nPREDICT: by 2026-12-01: the board stays under 60 C | check: log for a day | confidence: 70%\nEXPERIMENT: Fan off | uses: serial:COM9 | how: unplug the fan for 5 minutes\nCHANGE MY MIND: the board warms with the CPU idle", "s1", new Date("2026-11-01"));
  expect(h.map).toEqual([{ label: "board warms under load", state: "known", cites: ["C1", "E1"] }, { label: "role of the fan", state: "partly", cites: [] }, { label: "room temperature drift", state: "gap", cites: [] }]);
  expect(h.gaps).toEqual(["room temperature drift - nobody logged the room"]);
  expect(h.predictions).toEqual([{ id: "s1-p1", study: "s1", made: "2026-11-01T00:00:00.000Z", due: "2026-12-01", text: "the board stays under 60 C", check: "log for a day", confidence: 70, status: "open" }]);
  expect(h.experiments).toEqual([{ title: "Fan off", uses: "serial:COM9", how: "unplug the fan for 5 minutes" }]);
  expect(h.changeMind).toEqual(["the board warms with the CPU idle"]);
  expect(gapMapSvg("Q?", h.map)).toContain('class="node gap"');
  expect(ideaTreeSvg({ question: "Q", parent: "earlier", evidence: [{ id: "E1", icon: "🔌", title: "board" }], hypotheses: [{ id: "H1", text: "warms", status: "supported", because: ["E1"], prior: 50, posterior: 80 }] })).toContain("grew from: earlier");
});

test("the track record: right answers and the Brier score", () => {
  const p = (status: Prediction["status"], confidence: number, due = "2020-01-01"): Prediction => ({ id: "x", study: "s", made: "", due, text: "", check: "", confidence, status });
  expect(trackRecord([])).toEqual({ settled: 0, right: 0, brier: null, due: 0 });
  expect(trackRecord([p("right", 80), p("wrong", 80), p("open", 50), p("open", 50, "2999-01-01")])).toEqual({ settled: 2, right: 1, brier: 0.34, due: 1 });
});

test("outliers and overnight anomalies are found; steady noise is not", () => {
  const rows = Array.from({ length: 40 }, (_, i) => ({ t: i, temp: 20 + (i % 3) * 0.1 }));
  expect(outliers(rows, ["t", "temp"])).toEqual([]);
  rows[30]!.temp = 35;
  expect(outliers(rows, ["temp"])[0]).toContain("temp spiked to 35 at t=30");
  const hist: Record<string, number>[] = [];
  expect(detect(hist, rows.slice(0, 25).map((r) => ({ ...r, temp: 20 + (r.t % 3) * 0.1 })), ["temp"])).toEqual([]);
  const found = detect(hist, [{ t: 99, temp: 30 }], ["temp"], () => "T");
  expect(found).toHaveLength(1);
  expect(found[0]).toMatchObject({ at: "T", key: "temp", value: 30 });
  expect(found[0]!.z).toBeGreaterThan(4);
});

test("an overnight watch reads in chunks, logs anomalies as leads, and stops when asked", async () => {
  const root = await mkdtemp(join(tmpdir(), "maxx-watch-"));
  let calls = 0;
  const inst: Instrument = { id: "fake", kind: "command", label: "Fake sensor", about: "", usage: "", gated: false, run: async () => {
    calls++;
    await Bun.sleep(5);
    return { title: "x", text: "", keys: ["t", "level"], rows: Array.from({ length: 10 }, (_, i) => ({ t: i * 0.1, level: calls === 5 && i === 4 ? 90 : 10 + (i % 2) * 0.2 })) };
  } };
  const ctl = new AbortController();
  const seen: string[] = [];
  const w = await runWatch({ inst, args: "", hours: 1, chunkSeconds: 1, root, cwd: root, signal: ctl.signal, awake: () => ({ stop() {}, on: false }), update: (x) => { seen.push(x.state); if (x.chunks >= 8) ctl.abort(); } });
  expect(w.state).toBe("stopped");
  expect(w.rows).toBeGreaterThanOrEqual(80);
  expect(w.anomalies).toHaveLength(1);
  expect(w.anomalies[0]).toMatchObject({ key: "level", value: 90 });
  expect(seen[0]).toBe("running");
  const files = await readdir(join(root, w.id));
  expect(files.sort()).toEqual(["readings.csv", "readings.jsonl", "watch.json"]);
  expect((await listLeads()).some((l) => l.kind === "anomaly" && l.text.includes("level hit 90"))).toBe(true);
});

// ---------- a study with a virtual lab, a debate and a look ahead ----------

const requests: any[] = [];
function reply(body: any): string {
  const sys = String(body.messages[0]?.content ?? "");
  const user = String(body.messages.at(-1).content);
  if (sys.startsWith("You run a small research lab. You turn")) return "QUESTION: Does the board warm with load?\nMEASURE: temperature\n1. COM9 | seconds=2";
  if (sys.startsWith("You are the scientist")) return "ASSUMPTION: heat comes from the CPU | FLIP: it comes from the regulator\nH1: The board warms with load | predicts: rising temp | test: slope | because: E1 | prior: 60%\nH2: [wildcard] The sensor heats itself | predicts: warm at idle | test: idle | because: E1 | prior: 30%";
  if (sys.startsWith("You design virtual labs")) return user.includes("Labs already in the library") ? "REUSE: board-heat" : "```js\n" + LAB_CODE + "\n```";
  if (sys.startsWith("You plan experiments")) return "sweep load from 0 to 100 in 3 steps | seeds=2 | watch=temp";
  if (sys.startsWith("You write short")) return "```js\nconsole.log('RESULT: SUPPORTED - ok')\n```";
  if (sys.startsWith("You read the output")) return "VERDICT: supported\nCONFIDENCE: 75%\nWHY: ok";
  if (sys.startsWith("You argue")) return user.includes("Your side: H1") ? "- the temperature rose [E1]\n- the lab agrees [E2]" : "- maybe [E99]";
  if (sys.startsWith("You judge")) return "WINNER: A\nWHY: it cites measurements";
  if (sys.startsWith("You look past")) return "KNOWN: board warms [E1]\nGAP: room drift - nobody logged the room\nPREDICT: by 2026-12-01: under 60 C at full load | check: log it | confidence: 65%\nEXPERIMENT: Fan off | uses: serial:COM9 | how: unplug the fan\nCHANGE MY MIND: warming at idle";
  if (sys.startsWith("You write the conclusion")) return "## Answer\nIt warms with load [E1]. Overall confidence: 75%\n## Findings\n- warms [H1]\n## Strongest other view\n- self-heating [H2]";
  return "NONE";
}
const server = Bun.serve({
  port: 0,
  async fetch(req) {
    const body = await req.json();
    requests.push(body);
    return new Response(`data: ${JSON.stringify({ choices: [{ delta: { content: reply(body) } }] })}\n\ndata: [DONE]\n\n`, { headers: { "content-type": "text/event-stream" } });
  },
});
afterAll(() => server.stop());

async function agentIn() {
  const dir = await mkdtemp(join(tmpdir(), "maxx-disc-"));
  const io: AgentIO = { token: () => {}, toolStart: () => {}, toolEnd: () => {}, note: () => {}, ask: async () => "always" };
  const permissions = await new Permissions(dir, "ask").load();
  return new Agent({ llm: { baseURL: `http://localhost:${server.port}/v1`, model: "fake" }, cwd: dir, permissions, vision: { mode: "off" }, contextWindow: 16384 }, io).init();
}

test("a study designs a virtual lab, sweeps it, debates, looks ahead; the next study reuses the lab", async () => {
  const agent = await agentIn();
  const s = await runStudy(agent, "Does load warm my board?", { study: () => {} }, { settings: labSettings({ rounds: 1, skeptic: false }), instruments: await serialInstruments(), runtime: js, parent: { id: "lead-1", question: "an odd warm spot" } });
  expect(s.state).toBe("done");
  expect(s.assumptions).toEqual([{ text: "heat comes from the CPU", flip: "it comes from the regulator" }]);
  expect(s.hypotheses[1]).toMatchObject({ kind: "wildcard", text: "The sensor heats itself" });
  // The lab, its sweep as evidence, and the sweep's result as an unverified claim.
  expect(s.lab).toMatchObject({ slug: "board-heat", title: "Board heat", reused: false, sweeps: 1 });
  const sim = s.evidence.find((e) => e.kind === "sim")!;
  expect(sim.title).toBe("Board heat: sweep load 0→100");
  expect(sim.text).toContain("not what the world does");
  expect(sim.series![0]!.values[2]).toBeGreaterThan(sim.series![0]!.values[0]! + 20);
  expect(s.claims.find((c) => c.evidence === sim.id)).toMatchObject({ status: "unverified" });
  expect(existsSync(join(s.dir, "sim", "lab.js"))).toBe(true);
  expect((await readFile(join(s.dir, "sim", "runs.jsonl"), "utf8")).trim().split("\n")).toHaveLength(6);
  expect((await listRuns("board-heat")).length).toBe(6);
  // The debate is scored on evidence; the judge agrees.
  expect(s.debate).toMatchObject({ winner: "A", why: "it cites measurements" });
  expect(s.debate!.a.score).toBeGreaterThan(s.debate!.b.score);
  // The look ahead: map, predictions in the ledger, leads from gaps and experiments.
  expect(s.map!.map((n) => n.state)).toEqual(["known", "gap"]);
  expect(s.changeMind).toEqual(["warming at idle"]);
  expect((await loadPredictions()).map((p) => p.text)).toContain("under 60 C at full load");
  const leads = await listLeads();
  expect(leads.some((l) => l.kind === "gap" && l.question === "room drift")).toBe(true);
  expect(leads.some((l) => l.kind === "experiment")).toBe(true);
  expect(s.parent).toEqual({ id: "lead-1", question: "an odd warm spot" });
  // The notebook shows all of it.
  const html = await readFile(join(s.dir, "report.html"), "utf8");
  for (const bit of ["Virtual lab · Board heat", "Debate arena", 'class="gapmap"', "Prediction ledger", "Assumptions · flipped", "What would change my mind", "grew from: an odd warm spot", "6 runs on record"]) expect(html).toContain(bit);
  const md = await readFile(join(s.dir, "REPORT.md"), "utf8");
  expect(md).toContain("## 🧪 Virtual lab: Board heat");
  expect(md).toContain("**Winner:** H1");

  // Settling a prediction feeds the track record.
  const p = (await loadPredictions())[0]!;
  expect(trackRecord(await settlePrediction(p.id, true))).toMatchObject({ settled: 1, right: 1 });

  // A second study finds the lab in the library and reuses it.
  const s2 = await runStudy(agent, "At night does load warm it?", { study: () => {} }, { settings: labSettings({ rounds: 1, skeptic: false, debate: false, horizon: false }), instruments: await serialInstruments(), runtime: js });
  expect(s2.lab).toMatchObject({ slug: "board-heat", reused: true, sweeps: 1 });
  expect(s2.debate).toBeUndefined();
  const labs = await listLabs();
  expect(labs).toHaveLength(1);
  expect(labs[0]!.studies).toEqual([s.id, s2.id]);
  expect(labs[0]!.runs).toBe(12);
});

test("with virtual labs off, no lab is designed", async () => {
  const agent = await agentIn();
  const before = requests.length;
  const s = await runStudy(agent, "Quick one?", { study: () => {} }, { settings: labSettings({ rounds: 1, skeptic: false, sims: false, debate: false, horizon: false }), instruments: await serialInstruments(), runtime: js });
  expect(s.lab).toBeUndefined();
  expect(requests.slice(before).some((r) => String(r.messages[0].content).startsWith("You design virtual labs"))).toBe(false);
});
