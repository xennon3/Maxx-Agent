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
let broke = false;
function reply(sys: string, user: string): string {
  if (sys.startsWith("You run a small research lab. You turn")) return "QUESTION: Does the desk warm up while the PC runs, and is the PC fan the loud part?\nMEASURE: temperature and sound level over time on the desk, plus what the camera sees\n1. serial:COM3 | seconds=20\n2. camera | frames=3 every=1\n3. mic | seconds=3";
  if (sys.startsWith("You are the scientist")) return "H1: The desk warms up steadily while the PC runs | predicts: temperature rises over the 20 s, about 0.1 °C/s | test: fit a line to temp over time | because: E1, C1 | prior: 55%\nH2: The noise comes from the PC fan switching on | predicts: sound jumps by more than 10 dB part way and stays up | test: compare the sound level before and after the jump | because: E1, E3, C3 | prior: 45%\nH3: The warming is sunlight, not the PC | predicts: temperature follows the light level | test: correlate temp with light | prior: 30%";
  if (sys.startsWith("You write short")) {
    if (user.includes("Hypothesis H1")) return "```python\n" + slope("temp", "E1-*.csv") + "\nprint('RESULT: SUPPORTED - temperature rises steadily' if slope > 0.02 else 'RESULT: REFUTED - flat')\n```";
    if (user.includes("Hypothesis H2")) return "```python\nimport csv, glob\nrows = list(csv.DictReader(open(glob.glob('data/E1-*.csv')[0])))\ns = [float(r['sound']) for r in rows]\nh = len(s)//2\na, b = sum(s[:h])/h, sum(s[h:])/(len(s)-h)\nprint(f'METRIC before_db={a:.1f}')\nprint(f'METRIC after_db={b:.1f}')\nprint(f'METRIC jump_db={b-a:.1f}')\nprint('RESULT: SUPPORTED - sound jumps by %.0f dB halfway and stays up' % (b-a) if b-a > 10 else 'RESULT: REFUTED - no jump')\n```";
    if (user.includes("The script failed")) return "```python\nimport csv, glob, math\nrows = list(csv.DictReader(open(glob.glob('data/E1-*.csv')[0])))\nx = [float(r['light']) for r in rows]; y = [float(r['temp']) for r in rows]\nmx, my = sum(x)/len(x), sum(y)/len(y)\nr = sum((a-mx)*(b-my) for a,b in zip(x,y)) / math.sqrt(sum((a-mx)**2 for a in x)*sum((b-my)**2 for b in y))\nprint(f'METRIC r_temp_light={r:.2f}')\nprint('RESULT: REFUTED - temperature does not follow light (r=%.2f)' % r if abs(r) < 0.5 else 'RESULT: SUPPORTED - r=%.2f' % r)\n```";
    if (!broke) return (broke = true), "```python\nimport numpy as np\nx = np.corrcoef(light, temp)\n```";
  }
  if (sys.startsWith("You read the output")) {
    if (user.includes("H1")) return "VERDICT: supported\nCONFIDENCE: 82%\nWHY: temperature rose 0.08 °C/s over 80 readings, from 22.4 to 24.0 °C.";
    if (user.includes("H2")) return "VERDICT: supported\nCONFIDENCE: 88%\nWHY: sound jumped 17 dB halfway, from 41 to 58 dB, and stayed up.";
    return "VERDICT: refuted\nCONFIDENCE: 12%\nWHY: temperature and light are barely correlated (r near 0).";
  }
  if (user.startsWith("Research question")) return "A desk with a monitor and a PC tower beside it. The room is lit by a window on the left. Nothing moves between frames except a slight change in light.";
  if (sys.startsWith("You are a skeptical")) return "- 20 seconds is far too short to call a trend; the 0.08 °C/s slope cannot continue for an hour.\n- The sensor sits next to the PC exhaust, so it may measure the fan's air, not the desk.\n- One noise jump could be anything that switched on; the mic heard it but nothing confirms it was the fan.\nWOULD CHANGE MY MIND: the temperature still rising with the PC off.";
  if (sys.startsWith("You write the conclusion")) return "## Answer\nYes, most likely. The desk sensor warmed steadily while the PC ran [E1] [H1], and the noise jumped 17 dB halfway through, which fits the fan kicking in [H2]. Sunlight does not explain the warming [H3]. Overall confidence: 78%\n## Findings\n- Temperature rose about 0.08 °C per second, from 22.4 to 24 °C [E1] [C1] [H1].\n- Sound went from 41 to 58 dB and stayed there [E1] [E3] [H2].\n- Temperature did not follow the light level (r near 0) [H3].\n- The camera shows the PC right next to the sensor [E2].\n## Strongest other view\nThe warming could be the sensor sitting in the PC's exhaust air rather than the desk itself warming; a reading 50 cm away would settle it [C1].\n## Caveats\n- 20 seconds is a very short window; the rise will level off.\n- The sensor may be in the PC's exhaust air.\n## Next experiments\n- Log COM3 for an hour with the PC on, then an hour with it off.\n- Move the sensor 50 cm away from the PC and repeat.\n- Record the mic while switching the fan profile in the BIOS.";
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
await p.click("#rtabs button[data-t=claims]");
await p.waitForTimeout(300);
await shot("4b-claims");
const href = await p.getAttribute("#rpane iframe", "src").catch(() => null) ?? (await p.click("#rtabs button[data-t=notebook]"), await p.getAttribute("#rpane iframe", "src"));
const nb = await ctx.newPage();
await nb.setViewportSize({ width: 1000, height: 1300 });
await nb.goto(new URL(href!, ui.link).toString());
await nb.screenshot({ path: join(OUT, "5-notebook.png") });
await nb.screenshot({ path: join(OUT, "5-notebook-full.png"), fullPage: true });
await p.click("#labCfg");
await p.waitForSelector("#labInst .inst");
await p.waitForTimeout(300);
await shot("6-settings");
await browser.close();
ui.stop();
lm.stop();
process.exit(0);
