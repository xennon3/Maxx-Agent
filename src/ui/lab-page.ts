// The research lab in `maxx ui`: the 🔬 chip, the live study board (phase
// pipeline, evidence chips, hypothesis meters), the settings and instruments
// dialog, and the camera and microphone bridge (getUserMedia in the window,
// so nothing needs installing). Plain strings spliced into page.ts; no
// backticks or dollar-braces in the JS below.

export const LAB_CSS = /* css */ `
.chip.lab.on { background: #5f3dc4; border-color: #5f3dc4; color: #fff; }
body.lab .composer textarea { border-color: #5f3dc4; }
.study { display: none; margin: 10px 16px 0; padding: 8px 12px 10px; border: 1px solid var(--line); border-left: 3px solid #5f3dc4; border-radius: var(--radius); background: var(--panel); font-size: 13px; max-width: 860px; background-image: linear-gradient(color-mix(in srgb, var(--line) 45%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--line) 45%, transparent) 1px, transparent 1px); background-size: 18px 18px; }
.study.on { display: block; max-height: 48vh; overflow: auto; }
.study.failed { border-left-color: var(--bad); } .study.done { border-left-color: var(--ok); }
.study .head { display: flex; gap: 8px; align-items: baseline; font-weight: 600; }
.study .head .q { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.study .head .st { color: var(--mute); font-weight: 400; flex: none; font-size: 12px; }
.study .sharp { color: var(--mute); font-size: 12px; margin: 2px 0 0; }
.study .pipe { display: flex; gap: 4px; margin: 8px 0 6px; flex-wrap: wrap; }
.study .pipe span { flex: 1; min-width: 80px; text-align: center; padding: 3px 4px; border-radius: 6px; border: 1px solid var(--line); color: var(--mute); background: var(--panel); font-size: 12px; white-space: nowrap; }
.study .pipe span.past { color: var(--ink); border-color: color-mix(in srgb, #5f3dc4 40%, var(--line)); }
.study .pipe span.now { color: #fff; background: #5f3dc4; border-color: #5f3dc4; animation: labPulse 1.6s ease-in-out infinite; }
@keyframes labPulse { 50% { opacity: .72; } }
.study .evs { display: flex; flex-wrap: wrap; gap: 4px; margin: 4px 0; }
.study .ev { border: 1px solid var(--line); border-radius: 999px; padding: 1px 8px; font-size: 12px; background: var(--panel); max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.study .ev.bad { border-color: var(--bad); color: var(--bad); }
.study .hy { display: grid; grid-template-columns: 1.4em 2.2em 1fr 120px 70px; gap: 6px; align-items: center; padding: 3px 0; }
.study .hy .ic { text-align: center; }
.study .hy .id { font: 600 11px ui-monospace, Consolas, monospace; color: #5f3dc4; }
.study .hy .t .why { display: block; color: var(--mute); font-size: 12px; }
.study .hy.testing { font-weight: 600; } .study .hy.supported .ic { color: var(--ok); } .study .hy.refuted .ic, .study .hy.error .ic { color: var(--bad); }
.study .meter { position: relative; height: 6px; background: var(--line); border-radius: 3px; }
.study .meter i { position: absolute; top: -3px; width: 3px; height: 12px; margin-left: -1px; border-radius: 2px; background: var(--mute); transition: left .6s; }
.study .meter i.post { background: var(--ink); }
.study .meter b { position: absolute; top: 0; height: 100%; border-radius: 3px; transition: all .6s; }
.study .meter b.up { background: color-mix(in srgb, var(--ok) 60%, transparent); } .study .meter b.down { background: color-mix(in srgb, var(--bad) 60%, transparent); }
.study .pc { font: 12px ui-monospace, Consolas, monospace; color: var(--mute); text-align: right; }
.study .foot { display: flex; gap: 10px; align-items: baseline; margin-top: 6px; color: var(--mute); flex-wrap: wrap; }
.study .foot a { color: #5f3dc4; font-weight: 600; }
.study .conf { font-weight: 600; color: var(--ink); }
.study .rec { color: var(--bad); font-weight: 600; }
#labDlg .inst { display: grid; grid-template-columns: 1.6em 1fr auto; gap: 2px 8px; font-size: 13px; padding: 4px 0; border-bottom: 1px dashed var(--line); }
#labDlg .inst .u { grid-column: 2 / 4; color: var(--mute); font-size: 12px; }
#labDlg .inst .off { color: var(--bad); font-size: 12px; }
#labDlg .inst code { font-size: 11.5px; }
#labDlg pre { max-height: 180px; overflow: auto; font-size: 11.5px; background: var(--bg); padding: 6px 8px; border-radius: 6px; }
`;

export const LAB_CHIP = `<span class="chip lab" id="labBtn" title="Research lab: ask a question. Maxx collects data (the web, COM-port sensors, the camera, the microphone, your files), draws up rival hypotheses, tests each one with a script in a sandbox, has a skeptic review it, and writes a lab notebook.">🔬 Lab</span><span class="chip gear" id="labCfg" title="Research lab settings and instruments">⚙</span>`;

export const LAB_HTML = `<dialog id="labDlg"><form method="dialog" id="labForm">
  <h3>🔬 Research lab</h3>
  <p class="hint">Ask a question with 🔬 Lab on. Maxx sharpens it, collects data with the instruments below, writes rival hypotheses, tests each with a short script in a sandbox, lets a skeptic pick holes in it, and writes a lab notebook (.maxx/research in the project). Sensors, the camera and the microphone ask before every use unless you pick Always; every reading is logged.</p>
  <div class="row">
    <label>Rounds <input id="lRounds" type="number" min="1" max="4" title="Collect and test rounds; later rounds chase what is still unclear"></label>
    <label>Hypotheses <input id="lHyp" type="number" min="1" max="6"></label>
    <label>Readings per round <input id="lRead" type="number" min="1" max="12"></label>
  </div>
  <div class="row">
    <label>Tests at once <input id="lPar" type="number" min="1" max="4" title="LM Studio serves up to 4 requests at once (Max Concurrent Predictions); load the model with enough context for them"></label>
    <label>Test time limit (s) <input id="lSec" type="number" min="5" max="600"></label>
    <label>Script fix tries <input id="lFix" type="number" min="0" max="4"></label>
  </div>
  <div class="row"><label>Serial listen (s) <input id="lSer" type="number" min="1" max="300" title="How long a COM port is read when the plan does not say"></label></div>
  <label class="check"><input type="checkbox" id="lSkep"> Skeptic review before the conclusion (by the vision model when it is a different model, for a real second opinion)</label>
  <h4 style="margin:12px 0 4px">Instruments</h4>
  <div id="labInst" class="hint">Looking…</div>
  <details style="margin-top:8px"><summary class="hint">Add your own instrument</summary><p class="hint">Any command that prints readings becomes an instrument. Put it in <code id="labFile"></code>:</p><pre>{ "instruments": [
  { "id": "station", "about": "backyard weather station",
    "command": "python C:/tools/station.py --seconds {seconds}", "seconds": 10 } ] }</pre></details>
  <details><summary class="hint">Arduino starter sketch</summary><p class="hint">Prints readings as key=value lines at 9600 baud, which the lab turns into columns.</p><pre id="labSketch"></pre></details>
  <div class="btns"><button class="left" id="lReset" value="reset" formnovalidate>Defaults</button><button value="cancel" formnovalidate>Cancel</button><button class="primary" value="save">Save</button></div>
</form></dialog>`;

export const LAB_JS = /* js */ `
let labMode = false;
try { labMode = localStorage.getItem("maxx.lab") === "1"; } catch {}
const labOn = () => labMode && !!(state && state.current);
const LAB_TOKEN = new URLSearchParams(location.search).get("t") || "";
function drawLabChip() {
  const on = labOn();
  $("labBtn").classList.toggle("on", on);
  document.body.classList.toggle("lab", on);
  if (on) $("input").placeholder = "Ask a research question, e.g. \\u201cdoes my desk get warmer in the afternoon sun?\\u201d Maxx collects data, tests hypotheses and writes a lab notebook.";
}
$("labBtn").onclick = () => {
  labMode = !labMode;
  if (labMode && typeof agentMode !== "undefined" && (agentMode || (typeof crewMode !== "undefined" && crewMode))) { agentMode = false; try { localStorage.setItem("maxx.agent", "0"); } catch {} if (typeof crewMode !== "undefined") { crewMode = false; try { localStorage.setItem("maxx.crew", "0"); } catch {} } drawAgent(); }
  try { localStorage.setItem("maxx.lab", labMode ? "1" : "0"); } catch {}
  drawLabChip();
  if (!labMode) drawAgent();
};
const PHASES = [["framing", "❓ Question"], ["collecting", "📡 Data"], ["hypothesizing", "💡 Hypotheses"], ["testing", "🧪 Tests"], ["reviewing", "🧐 Review"], ["concluding", "📜 Conclusion"]];
const H_ICON = { untested: "○", testing: "▸", supported: "✓", refuted: "✗", inconclusive: "?", error: "!" };
let recording = "";
function drawLab(s) {
  const box = $("lab");
  if (!s) { box.className = "study"; box.innerHTML = ""; return; }
  box.className = "study on " + s.state;
  const at = PHASES.findIndex((p) => p[0] === s.state);
  const ended = ["done", "stopped", "failed"].includes(s.state);
  const pipe = PHASES.map((p, i) => '<span class="' + (s.state === "done" || (at >= 0 && i < at) ? "past" : i === at ? "now" : "") + '">' + p[1] + "</span>").join("");
  const evs = s.evidence.map((e) => '<span class="ev' + (e.error ? " bad" : "") + '" title="' + esc((e.error || e.text || "").slice(0, 600)) + '">' + e.icon + " " + e.id + " " + esc(e.title) + "</span>").join("");
  const hys = s.hypotheses.map((h) => {
    const a = Math.round(h.prior), b = Math.round(h.posterior == null ? h.prior : h.posterior);
    return '<div class="hy ' + h.status + '"><span class="ic">' + H_ICON[h.status] + '</span><span class="id">' + h.id + '</span><span class="t">' + esc(h.text) + (h.why ? '<span class="why">' + esc(h.why) + "</span>" : h.status === "testing" ? '<span class="why">writing and running a test' + (h.tries > 1 ? " (try " + h.tries + ")" : "") + "…</span>" : "") + "</span>" +
      '<span class="meter" title="' + a + "% before, " + b + '% after"><b class="' + (b >= a ? "up" : "down") + '" style="left:' + Math.min(a, b) + "%;width:" + Math.abs(b - a) + '%"></b><i style="left:' + a + '%"></i>' + (h.posterior == null ? "" : '<i class="post" style="left:' + b + '%"></i>') + "</span>" +
      '<span class="pc">' + a + "%" + (h.posterior == null ? "" : " → " + b + "%") + "</span></div>";
  }).join("");
  const report = ended && LAB_TOKEN ? '<a href="/lab/' + LAB_TOKEN + "/" + encodeURIComponent(s.id) + '/report.html" target="_blank">📒 Open the lab notebook</a>' : "";
  const st = ended ? s.state : (s.rounds > 1 && s.round ? "round " + s.round + " of " + s.rounds + " · " : "") + (PHASES[at] ? PHASES[at][1].slice(2).toLowerCase() + "…" : "");
  box.innerHTML = '<div class="head"><span>🔬</span><span class="q"></span><span class="st">' + esc(st) + "</span></div>" +
    (s.sharpened && s.sharpened !== s.question ? '<div class="sharp">→ ' + esc(s.sharpened) + "</div>" : "") +
    '<div class="pipe">' + pipe + "</div>" + (evs ? '<div class="evs">' + evs + "</div>" : "") + hys +
    '<div class="foot">' + (recording ? '<span class="rec">● ' + esc(recording) + "</span>" : "") + (s.confidence != null ? '<span class="conf">Confidence ' + s.confidence + "%</span>" : "") + (ended && s.note ? "<span>" + esc(s.note) + "</span>" : "") + report + "</div>";
  box.querySelector(".q").textContent = s.question;
  box.querySelector(".q").title = s.question;
}
let lastStudy = null;
function onStudy(s) { lastStudy = s; drawLab(s); }
// Camera and microphone readings for the lab, taken in this window.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function b64(bytes) { let s = ""; for (let i = 0; i < bytes.length; i += 32768) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 32768)); return btoa(s); }
function wav16(samples, rate) {
  const buf = new ArrayBuffer(44 + samples.length * 2), d = new DataView(buf);
  const str = (o, t) => { for (let i = 0; i < t.length; i++) d.setUint8(o + i, t.charCodeAt(i)); };
  str(0, "RIFF"); d.setUint32(4, 36 + samples.length * 2, true); str(8, "WAVE"); str(12, "fmt "); d.setUint32(16, 16, true); d.setUint16(20, 1, true); d.setUint16(22, 1, true);
  d.setUint32(24, rate, true); d.setUint32(28, rate * 2, true); d.setUint16(32, 2, true); d.setUint16(34, 16, true); str(36, "data"); d.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) d.setInt16(44 + i * 2, Math.max(-1, Math.min(1, samples[i])) * 32767, true);
  return new Uint8Array(buf);
}
async function labCapture(m) {
  const a = m.args || {};
  try {
    if (m.kind === "camera") {
      const n = Math.max(1, Math.min(8, a.frames || 1)), every = a.every || 2;
      recording = "camera: " + n + " photo" + (n > 1 ? "s" : "");
      if (lastStudy) drawLab(lastStudy);
      const st = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 960 } }, audio: false });
      const v = document.createElement("video"); v.muted = true; v.playsInline = true; v.srcObject = st; await v.play();
      await sleep(700);
      const frames = [];
      for (let i = 0; i < n; i++) {
        if (i) await sleep(every * 1000);
        const c = document.createElement("canvas"); c.width = v.videoWidth || 640; c.height = v.videoHeight || 480;
        c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
        frames.push(c.toDataURL("image/jpeg", 0.85).split(",")[1]);
      }
      const device = (st.getVideoTracks()[0] || {}).label || "";
      st.getTracks().forEach((t) => t.stop());
      send({ type: "captured", id: m.id, frames, device });
    } else {
      const secs = Math.max(1, Math.min(30, a.seconds || 5));
      recording = "microphone: " + secs + "s";
      if (lastStudy) drawLab(lastStudy);
      const st = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(st);
      const proc = ctx.createScriptProcessor(4096, 1, 1);
      const parts = [];
      proc.onaudioprocess = (e) => parts.push(new Float32Array(e.inputBuffer.getChannelData(0)));
      src.connect(proc); proc.connect(ctx.destination);
      await sleep(secs * 1000);
      proc.disconnect(); src.disconnect(); st.getTracks().forEach((t) => t.stop());
      const rate = ctx.sampleRate; await ctx.close();
      const all = new Float32Array(parts.reduce((n, p) => n + p.length, 0)); let o = 0; for (const p of parts) { all.set(p, o); o += p.length; }
      // Down to 16 kHz: plenty for loudness and pitch, and a quarter of the size.
      const step = rate / 16000, out = new Float32Array(Math.floor(all.length / step));
      for (let i = 0; i < out.length; i++) { const s0 = Math.floor(i * step), s1 = Math.max(s0 + 1, Math.floor((i + 1) * step)); let acc = 0; for (let j = s0; j < s1; j++) acc += all[j] || 0; out[i] = acc / (s1 - s0); }
      const device = (st.getAudioTracks()[0] || {}).label || "";
      send({ type: "captured", id: m.id, wav: b64(wav16(out, 16000)), device });
    }
  } catch (e) {
    send({ type: "captured", id: m.id, error: (e && e.name === "NotAllowedError" ? "the window was not allowed to use the " + (m.kind === "camera" ? "camera" : "microphone") : (e && e.message) || String(e)) });
  } finally {
    recording = "";
    if (lastStudy) drawLab(lastStudy);
  }
}
// Settings and the instruments that are plugged in.
const LAB_FIELDS = { lRounds: "rounds", lHyp: "hypotheses", lRead: "readings", lPar: "parallel", lSec: "testSeconds", lFix: "fixes", lSer: "serialSeconds" };
function labForm(values) {
  const v = values || (state && state.labMode && state.labMode.settings) || {};
  for (const [id, k] of Object.entries(LAB_FIELDS)) $(id).value = v[k];
  $("lSkep").checked = v.skeptic !== false;
}
function drawInstruments(m) {
  const ICONS = { web: "🌐", serial: "🔌", camera: "📷", mic: "🎙", file: "📄", command: "🧰" };
  $("labInst").innerHTML = m.list.map((i) => '<div class="inst"><span>' + ICONS[i.kind] + "</span><span><b>" + esc(i.label) + "</b> " + (i.gated ? "🔒" : "") + "</span>" + (i.unavailable ? '<span class="off">' + esc(i.unavailable) + "</span>" : "<span></span>") + '<span class="u">' + esc(i.about) + " · <code>" + esc(i.usage) + "</code></span></div>").join("") +
    (m.list.some((i) => i.kind === "serial") ? "" : '<p class="hint">No COM ports found. Plug in an Arduino or another USB serial device and open this again.</p>');
  $("labFile").textContent = m.file;
  $("labSketch").textContent = m.sketch;
}
$("labCfg").onclick = () => { labForm(); $("labInst").textContent = "Looking…"; send({ type: "instruments" }); $("labDlg").showModal(); };
$("labForm").onsubmit = (e) => {
  const how = e.submitter && e.submitter.value;
  if (how === "reset") { e.preventDefault(); return labForm((state && state.labMode && state.labMode.defaults) || {}); }
  if (how !== "save") return;
  const d = (state && state.labMode && state.labMode.defaults) || {}, out = {};
  for (const [id, k] of Object.entries(LAB_FIELDS)) { const n = Number($(id).value); if ($(id).value !== "" && n !== d[k]) out[k] = n; }
  if ($("lSkep").checked !== (d.skeptic !== false)) out.skeptic = $("lSkep").checked;
  send({ type: "labSettings", settings: out });
};
`;
