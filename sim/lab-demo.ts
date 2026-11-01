#!/usr/bin/env bun
// Drives the research lab in `maxx ui` with a scripted model, a simulated
// Arduino on COM3 and Chromium's fake camera and microphone. The question is
// framed, the board, camera and mic are read (each asks first), three rival
// hypotheses are tested by Python scripts (one breaks and is fixed), a
// skeptic reviews, and the notebook opens. Screenshots go to sim/out/lab.
//   bun sim/lab-demo.ts        (THEME=dark for dark mode)
import { mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
const ROOT = resolve(import.meta.dir, "..");
const OUT = join(ROOT, "sim", "out", "lab");
rmSync(OUT, { recursive: true, force: true });
const desk = join(OUT, "desk");
mkdirSync(desk, { recursive: true });
process.env.MAXX_HOME = join(OUT, "home");
process.env.MAXX_FAKE_SERIAL = "COM3=Arduino Uno";

const slope = (col: string, file: string) => `import csv, glob
rows = list(csv.DictReader(open(glob.glob("data/${file}")[0])))
t = [float(r["t"]) for r in rows]; y = [float(r["${col}"]) for r in rows]
n = len(t); mt = sum(t)/n; my = sum(y)/n
slope = sum((a-mt)*(b-my) for a, b in zip(t, y)) / sum((a-mt)**2 for a in t)
print(f"METRIC n={n}")
print(f"METRIC ${col}_slope_per_s={slope:.4f}")
print(f"METRIC ${col}_rise_per_hour={slope*3600:.1f}")`;
// The virtual lab the scripted model "designs": warm air parcels drifting from the PC to the sensor.
const DESK_LAB = String.raw`const LAB = {
  title: "Desk heat and airflow",
  about: "Air parcels warmed at the PC exhaust drift across the desk; the fan pushes them toward the sensor and adds noise.",
  params: {
    watts: { min: 50, max: 400, step: 10, value: 200, unit: "W", label: "PC power" },
    fan: { min: 0, max: 100, step: 5, value: 40, unit: "%", label: "Fan speed" },
    distance: { min: 10, max: 100, step: 5, value: 30, unit: "cm", label: "Sensor distance" }
  },
  outputs: { sensor: { unit: "°C", label: "Sensor temperature" }, noise: { unit: "dB", label: "Fan noise" } },
  steps: 600,
  init(p, rnd) {
    const parts = [];
    for (let i = 0; i < 180; i++) parts.push({ x: rnd(), y: rnd(), h: 22 });
    return { parts, sensor: 22 };
  },
  step(s, p, rnd, t) {
    const push = 0.002 + (p.fan / 100) * 0.01;
    for (const q of s.parts) {
      if (q.x > 0.88) q.h += (p.watts / 400) * 0.5;
      q.h += (22 - q.h) * 0.012;
      q.x -= push * (0.5 + rnd());
      q.y = Math.min(1, Math.max(0, q.y + (rnd() - 0.5) * 0.02));
      if (q.x < 0) { q.x = 1; q.y = rnd(); q.h = 22 + (p.watts / 400) * 2; }
    }
    const sx = 0.88 - (p.distance / 100) * 0.8;
    const near = s.parts.filter((q) => Math.abs(q.x - sx) < 0.07 && Math.abs(q.y - 0.5) < 0.25);
    const avg = near.length ? near.reduce((a, q) => a + q.h, 0) / near.length : 22;
    s.sensor += (avg - s.sensor) * 0.05;
  },
  measure(s, p) { return { sensor: s.sensor, noise: 30 + p.fan * 0.3 + Math.log10(1 + p.watts) * 4 }; },
  draw(ctx, s, p, w, h) {
    ctx.fillStyle = "#f1f3f5"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#343a40"; ctx.fillRect(w * 0.9, h * 0.15, w * 0.08, h * 0.7);
    ctx.fillStyle = "#fff"; ctx.font = "12px system-ui"; ctx.fillText("PC", w * 0.92, h * 0.5);
    for (const q of s.parts) {
      const k = Math.max(0, Math.min(1, (q.h - 22) / 8));
      ctx.fillStyle = "hsl(" + (220 - k * 220) + ",80%,55%)";
      ctx.beginPath(); ctx.arc(q.x * w * 0.9, q.y * h, 3 + k * 3, 0, 7); ctx.fill();
    }
    const sx = (0.88 - (p.distance / 100) * 0.8) * w * 0.9;
    ctx.strokeStyle = "#5f3dc4"; ctx.lineWidth = 2; ctx.strokeRect(sx - 14, h * 0.5 - 14, 28, 28);
    ctx.fillStyle = "#5f3dc4"; ctx.fillText("sensor " + s.sensor.toFixed(1) + " °C", sx - 30, h * 0.5 - 20);
  }
};`;
let broke = false;
function reply(sys: string, user: string): string {
  if (sys.startsWith("You run a small research lab. You turn")) return "QUESTION: Does the desk warm up while the PC runs, and is the PC fan the loud part?\nMEASURE: temperature and sound level over time on the desk, plus what the camera sees\n1. serial:COM3 | seconds=20\n2. camera | frames=3 every=1\n3. mic | seconds=3";
  if (sys.startsWith("You design virtual labs")) return "A particle model of warm air will show whether the PC can heat a sensor this far away.\n```js\n" + DESK_LAB + "\n```";
  if (sys.startsWith("You plan experiments")) return "sweep fan from 0 to 100 in 6 steps | seeds=2 | watch=sensor,noise\nsweep distance from 10 to 100 in 5 steps | seeds=2 | watch=sensor";
  if (sys.startsWith("You argue")) return user.includes("Your side: H2") ? "- The sound jumped 17 dB halfway and stayed there, on the board's sensor [E1] and the microphone [E3].\n- The board's own reading confirms the jump [C3].\n- H1's rise is real but only 20 seconds long [E1], so it cannot explain a steady loud sound." : "- The temperature rose steadily for 20 seconds [E1] [C1].\n- The virtual lab warms the sensor only when the fan pushes PC air toward it [E4].\n- The noise jump fits a fan reacting to that heat [H2].";
  if (sys.startsWith("You judge")) return "WINNER: A\nWHY: Both cite measurements, but the 17 dB jump is confirmed by two instruments, while the warming rests on 20 seconds and a simulation.";
  if (sys.startsWith("You look past")) return "KNOWN: desk sensor warms with PC on [E1, C1]\nKNOWN: noise jumps when fan starts [E3]\nKNOWN: sunlight not the cause [H3]\nPARTLY: fan pushes warm air [E4]\nGAP: desk surface vs exhaust air - the sensor may read air, not the desk\nGAP: behaviour over an hour - nobody logged past 20 seconds\nPREDICT: by 2026-11-08: with the PC off for an hour, the desk sensor reads within 0.5 °C of the room | check: log COM3 overnight with the PC off | confidence: 75%\nPREDICT: by 2026-11-15: moving the sensor 50 cm away halves the warming | check: repeat the 20 s reading at 50 cm | confidence: 60%\nEXPERIMENT: Exhaust or desk? | uses: serial:COM3 | how: tape the sensor flat to the desk under a folded cloth, then repeat\nEXPERIMENT: Fan profile switch | uses: mic | how: record 30 s, switch the fan profile to silent, record 30 s more\nCHANGE MY MIND: the desk sensor still warming at the same rate with the PC switched off";
  if (sys.startsWith("You are the scientist")) return "ASSUMPTION: heat on the desk comes from the PC | FLIP: the desk warms on its own from the room or the sun\nASSUMPTION: the loudest sound is the biggest machine | FLIP: a small fan close to the mic sounds loudest\nH1: The desk warms up steadily while the PC runs | predicts: temperature rises over the 20 s, about 0.1 °C/s | test: fit a line to temp over time | because: E1, C1 | prior: 55%\nH2: The noise comes from the PC fan switching on | predicts: sound jumps by more than 10 dB part way and stays up | test: compare the sound level before and after the jump | because: E1, E3, C3 | prior: 45%\nH3: The warming is sunlight, not the PC | predicts: temperature follows the light level | test: correlate temp with light | prior: 30%\nH4: [borrowed from meteorology] Warm air pools around the sensor like a temperature inversion, so it keeps rising even when the fan slows | predicts: temperature keeps rising in the second half | test: compare slopes of the two halves | because: E1 | prior: 25%";
  if (sys.startsWith("You write short")) {
    if (user.includes("Hypothesis H1")) return "```python\n" + slope("temp", "E1-*.csv") + "\nprint('RESULT: SUPPORTED - temperature rises steadily' if slope > 0.02 else 'RESULT: REFUTED - flat')\n```";
    if (user.includes("Hypothesis H2")) return "```python\nimport csv, glob\nrows = list(csv.DictReader(open(glob.glob('data/E1-*.csv')[0])))\ns = [float(r['sound']) for r in rows]\nh = len(s)//2\na, b = sum(s[:h])/h, sum(s[h:])/(len(s)-h)\nprint(f'METRIC before_db={a:.1f}')\nprint(f'METRIC after_db={b:.1f}')\nprint(f'METRIC jump_db={b-a:.1f}')\nprint('RESULT: SUPPORTED - sound jumps by %.0f dB halfway and stays up' % (b-a) if b-a > 10 else 'RESULT: REFUTED - no jump')\n```";
    if (user.includes("Hypothesis H4")) return "```python\nimport csv, glob\nrows = list(csv.DictReader(open(glob.glob('data/E1-*.csv')[0])))\ny = [float(r['temp']) for r in rows]\nh = len(y)//2\nprint(f'METRIC first_half_rise={y[h-1]-y[0]:.2f}')\nprint(f'METRIC second_half_rise={y[-1]-y[h]:.2f}')\nprint('RESULT: INCONCLUSIVE - both halves rise about the same; 20 s is too short to see pooling')\n```";
    if (user.includes("The script failed")) return "```python\nimport csv, glob, math\nrows = list(csv.DictReader(open(glob.glob('data/E1-*.csv')[0])))\nx = [float(r['light']) for r in rows]; y = [float(r['temp']) for r in rows]\nmx, my = sum(x)/len(x), sum(y)/len(y)\nr = sum((a-mx)*(b-my) for a,b in zip(x,y)) / math.sqrt(sum((a-mx)**2 for a in x)*sum((b-my)**2 for b in y))\nprint(f'METRIC r_temp_light={r:.2f}')\nprint('RESULT: REFUTED - temperature does not follow light (r=%.2f)' % r if abs(r) < 0.5 else 'RESULT: SUPPORTED - r=%.2f' % r)\n```";
    if (!broke) return (broke = true), "```python\nimport numpy as np\nx = np.corrcoef(light, temp)\n```";
  }
  if (sys.startsWith("You read the output")) {
    if (user.includes("H4")) return "VERDICT: inconclusive\nCONFIDENCE: 30%\nWHY: both halves rise about the same; 20 seconds is too short to see pooling.";
    if (user.includes("H1")) return "VERDICT: supported\nCONFIDENCE: 82%\nWHY: temperature rose 0.08 °C/s over 80 readings, from 22.4 to 24.0 °C.";
    if (user.includes("H2")) return "VERDICT: supported\nCONFIDENCE: 88%\nWHY: sound jumped 17 dB halfway, from 41 to 58 dB, and stayed up.";
    return "VERDICT: refuted\nCONFIDENCE: 12%\nWHY: temperature and light are barely correlated (r near 0).";
  }
  if (user.startsWith("Research question")) return "A desk with a monitor and a PC tower beside it. The room is lit by a window on the left. Nothing moves between frames except a slight change in light.";
  if (sys.startsWith("You are a skeptical")) return "- 20 seconds is far too short to call a trend; the 0.08 °C/s slope cannot continue for an hour.\n- The sensor sits next to the PC exhaust, so it may measure the fan's air, not the desk.\n- One noise jump could be anything that switched on; the mic heard it but nothing confirms it was the fan.\nWOULD CHANGE MY MIND: the temperature still rising with the PC off.";
  if (sys.startsWith("You write the conclusion")) return "## Answer\nYes, most likely. The desk sensor warmed steadily while the PC ran [E1] [H1], and the noise jumped 17 dB halfway through, which fits the fan kicking in [H2]. Sunlight does not explain the warming [H3]. Overall confidence: 78%\n## Findings\n- Temperature rose about 0.08 °C per second, from 22.4 to 24 °C [E1] [C1] [H1].\n- Sound went from 41 to 58 dB and stayed there [E1] [E3] [H2].\n- Temperature did not follow the light level (r near 0) [H3].\n- The camera shows the PC right next to the sensor [E2].\n- In the virtual lab the sensor only warms when the fan pushes PC air toward it, and less the farther away it sits [E4] [E5].\n## Strongest other view\nThe warming could be the sensor sitting in the PC's exhaust air rather than the desk itself warming; a reading 50 cm away would settle it [C1].\n## Caveats\n- 20 seconds is a very short window; the rise will level off.\n- The sensor may be in the PC's exhaust air.\n## Next experiments\n- Log COM3 for an hour with the PC on, then an hour with it off.\n- Move the sensor 50 cm away from the PC and repeat.\n- Record the mic while switching the fan profile in the BIOS.";
  return "NONE";
}
const lm = Bun.serve({ port: 0, async fetch(req) {
  const u = new URL(req.url);
  if (u.pathname.endsWith("/models")) return Response.json({ data: [{ id: "qwen-agentworld-35b-a3b" }] });
  const body = await req.json() as any;
  const sys = String(body.messages[0]?.content ?? "");
  const last = body.messages.at(-1);
  const user = typeof last.content === "string" ? last.content : last.content.map((p: any) => p.text ?? "").join(" ");
  await Bun.sleep(700);
  const text = reply(sys, typeof body.messages[0].content === "string" ? user : String(body.messages[0].content[0]?.text ?? ""));
  return new Response(`data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\ndata: [DONE]\n\n`, { headers: { "content-type": "text/event-stream" } });
} });
const { startUI } = await import(ROOT + "/src/ui/server.ts");
const ui = await startUI({ baseURL: `http://127.0.0.1:${lm.port}/v1`, port: 0, open: false, context: 32768 });
const { chromium } = require("playwright");
const browser = await chromium.launch({ args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 940 }, colorScheme: process.env.THEME ?? "light", permissions: ["camera", "microphone"] });
const p = await ctx.newPage();
p.on("pageerror", (e: any) => console.log("PAGE ERROR", e.message));
const shot = (n: string) => p.screenshot({ path: join(OUT, n + ".png") });
await p.goto(ui.link);
await p.waitForSelector("#model option", { state: "attached" });
await p.click("#researchBtn");
await p.waitForSelector("body.research #rq");
await p.fill("#rq", "Does my desk get warmer while the PC runs, and is the fan what I hear?");
await shot("1-question");
await p.click("#rgo");
// Each instrument asks first: Always for the board, Allow for camera and mic.
await p.waitForSelector(".ask:not(.answered) button[data-a=always]", { timeout: 60000 });
await shot("2-permission");
await p.click(".ask:not(.answered) button[data-a=always]");
for (let i = 0; i < 2; i++) {
  await p.waitForSelector(".ask:not(.answered) button[data-a=yes]", { timeout: 60000 });
  await p.click(".ask:not(.answered) button[data-a=yes]");
}
await p.waitForSelector("#lab .hy.testing", { timeout: 120000 });
await p.waitForTimeout(900);
await shot("3-testing");
await p.waitForSelector("#lab.done", { timeout: 180000 });
await p.waitForTimeout(1200);
await shot("4-done");
console.log(await p.locator("#lab").innerText());
// The virtual lab, live: play it, pin a run, run a quick sweep.
await p.click("#rtabs button[data-t=sim]");
const fr = p.frameLocator("#simFrame");
await fr.locator("#play").waitFor({ timeout: 20000 });
await fr.locator("#play").click();
await p.waitForTimeout(2600);
await p.locator("#rpane").scrollIntoViewIfNeeded();
await p.evaluate(() => document.getElementById("rpane")!.scrollIntoView({ block: "start" }));
await shot("7-virtual-lab");
await fr.locator("#note").fill("default knobs, fan at 40%");
await fr.locator("#pin").click();
await p.waitForSelector("#simRuns tr.you", { timeout: 10000 });
await fr.locator("#sp").selectOption("distance");
await fr.locator("#sgo").click();
await p.waitForTimeout(800);
await p.evaluate(() => document.getElementById("simFrame")!.scrollIntoView({ block: "end" }));
await shot("8-virtual-lab-sweep");
// The landing cards: leads, predictions, the lab library, an overnight watch.
await p.evaluate(() => document.getElementById("rdisc")!.scrollIntoView({ block: "start" }));
await p.selectOption("#wInst", { label: "Arduino Uno (simulated) (COM3)" }).catch(async () => { await p.focus("#wInst"); await p.waitForTimeout(800); await p.selectOption("#wInst", { index: 1 }); });
await p.fill("#wHours", "0.02");
await p.fill("#wChunk", "3");
await p.click("#wGo");
await p.waitForSelector(".ask:not(.answered) button[data-a=always]", { timeout: 20000 });
await p.click(".ask:not(.answered) button[data-a=always]");
await p.waitForSelector("#watchCard .live", { timeout: 20000 });
await p.waitForTimeout(7000);
await p.evaluate(() => document.getElementById("rdisc")!.scrollIntoView({ block: "start" }));
await shot("9-discovery-cards");
await p.click("#rtabs button[data-t=claims]");
await p.waitForTimeout(300);
await shot("4b-claims");
const href = await p.getAttribute("#rpane iframe", "src").catch(() => null) ?? (await p.click("#rtabs button[data-t=notebook]"), await p.getAttribute("#rpane iframe", "src"));
const nb = await ctx.newPage();
await nb.setViewportSize({ width: 1000, height: 1300 });
await nb.goto(new URL(href!, ui.link).toString());
await nb.screenshot({ path: join(OUT, "5-notebook.png") });
await nb.screenshot({ path: join(OUT, "5-notebook-full.png"), fullPage: true });
for (const [sel, name] of [[".gapmap", "5c-gap-map"], [".arena", "5d-debate"], [".tree", "5e-idea-tree"]] as const) {
  const el = nb.locator(sel).first();
  if (await el.count()) { await el.scrollIntoViewIfNeeded(); await nb.screenshot({ path: join(OUT, name + ".png") }); }
}
await p.click("#labCfg");
await p.waitForSelector("#labInst .inst");
await p.waitForTimeout(300);
await shot("6-settings");
await browser.close();
ui.stop();
lm.stop();
process.exit(0);
