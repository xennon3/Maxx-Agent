// The Research tab in `maxx ui`: a workspace of its own (sidebar entry, a
// question box, past studies, the live study board with its phase pipeline,
// evidence chips and hypothesis meters, panes for the claim ledger, evidence,
// instrument log and the finished notebook), the settings and instruments
// dialog, and the camera and microphone bridge (getUserMedia in the window,
// so nothing needs installing). Plain strings spliced into page.ts; no
// backticks or dollar-braces in the JS below.

import { SIM_CSS, SIM_JS } from "./sim-page.ts";

export const LAB_CSS = SIM_CSS + /* css */ `
#rview { display: none; flex: 1; min-height: 0; }
body.research #rview { display: grid; grid-template-columns: minmax(0, 1fr) 300px; }
body.research { grid-template-columns: 260px 1fr; }
body.research #stage, body.research #rfeed .msg:not(.user):not(.note):not(.err), body.research #board, body.research #plan, body.research .composer, body.research .projonly, body.research #micHint { display: none !important; }
#rmain { overflow: auto; padding: 16px 16px 24px; min-width: 0; }
#rfeed { border-left: 1px solid var(--line); display: flex; flex-direction: column; min-height: 0; background: var(--panel); }
#rfeed > .fh { padding: 10px 14px; font-weight: 600; border-bottom: 1px solid var(--line); font-size: 13px; }
#rfeed #log { padding: 10px 12px; }
.rhero { max-width: 900px; border: 1px solid var(--line); border-radius: 12px; padding: 14px 16px; background: var(--panel); background-image: linear-gradient(color-mix(in srgb, var(--line) 45%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--line) 45%, transparent) 1px, transparent 1px); background-size: 18px 18px; }
.rhero h2 { margin: 0 0 2px; font-size: 18px; display: flex; gap: 8px; align-items: center; }
.rhero h2 .sp { flex: 1; }
.rhero h2 button { font-size: 13px; font-weight: 400; padding: 5px 10px; }
.rhero p { margin: 0 0 10px; color: var(--mute); font-size: 13px; }
.rhero textarea { width: 100%; min-height: 64px; resize: vertical; border-color: #5f3dc4; }
.rhero .row { display: flex; gap: 8px; align-items: center; margin-top: 8px; flex-wrap: wrap; }
.rhero .row .grow { flex: 1; color: var(--mute); font-size: 12px; }
.rhero button.go { background: #5f3dc4; border-color: #5f3dc4; color: #fff; }
.rrules { display: flex; flex-wrap: wrap; gap: 4px 10px; font-size: 12px; color: var(--mute); margin-top: 8px; }
.rpast { max-width: 900px; margin-top: 16px; display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 8px; }
.rpast .card { border: 1px solid var(--line); border-radius: 10px; padding: 8px 10px; cursor: pointer; background: var(--panel); font-size: 13px; }
.rpast .card:hover { border-color: #5f3dc4; }
.rpast .card .m { color: var(--mute); font-size: 12px; margin-top: 4px; display: flex; gap: 8px; }
.rpast h4 { grid-column: 1 / -1; margin: 6px 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: var(--mute); }
.rtabs { display: none; gap: 4px; max-width: 900px; margin: 14px 0 0; border-bottom: 1px solid var(--line); }
.rtabs.on { display: flex; }
.rtabs button { border: 0; border-bottom: 2px solid transparent; border-radius: 0; background: none; padding: 6px 12px; color: var(--mute); }
.rtabs button.on { color: var(--ink); border-bottom-color: #5f3dc4; font-weight: 600; }
#rpane { max-width: 900px; padding-top: 8px; font-size: 13px; }
#rpane iframe { width: 100%; height: 70vh; border: 1px solid var(--line); border-radius: 10px; background: #fff; }
#rpane table { width: 100%; border-collapse: collapse; }
#rpane td, #rpane th { border-bottom: 1px solid var(--line); padding: 5px 6px; text-align: left; vertical-align: top; }
#rpane .sub { color: var(--mute); font-size: 12px; }
#rpane td.st { white-space: nowrap; }
#rpane .observed td.st, #rpane .verified td.st, #rpane .corroborated td.st { color: var(--ok); }
#rpane .unverified td.st, #rpane .contested td.st { color: #b08400; }
#rpane .fabricated td.st { color: var(--bad); } #rpane .fabricated td:nth-child(2) { text-decoration: line-through; }
#rpane .evc { border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; margin: 6px 0; }
#rpane .evc pre { white-space: pre-wrap; margin: 6px 0 0; font: 12px/1.45 var(--mono); }
.chip.research.on, button#researchBtn.on { background: #5f3dc4; border-color: #5f3dc4; color: #fff; }
.study .tally { font-size: 12px; color: var(--mute); margin: 2px 0 4px; }
.study .audit { font-size: 12px; } .study .audit.ok { color: var(--ok); } .study .audit.bad { color: #b08400; }
.study .pill { font-size: 10.5px; padding: 0 6px; border-radius: 8px; border: 1px dashed var(--mute); color: var(--mute); margin-left: 4px; font-weight: 400; }
.study { display: none; margin: 14px 0 0; padding: 8px 12px 10px; border: 1px solid var(--line); border-left: 3px solid #5f3dc4; border-radius: var(--radius); background: var(--panel); font-size: 13px; max-width: 860px; background-image: linear-gradient(color-mix(in srgb, var(--line) 45%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--line) 45%, transparent) 1px, transparent 1px); background-size: 18px 18px; }
.study.on { display: block; }
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

export const LAB_NAV = `<div class="chathead">Research</div>
  <div class="chatnav" id="researchNav"><button class="go" id="researchBtn" title="The research lab: ask a question; Maxx collects data from the web and your instruments, tests rival hypotheses in a sandbox, fact-checks everything and writes a lab notebook.">🔬 Research lab</button></div>`;

export const LAB_VIEW = `<section id="rview">
  <div id="rmain">
    <div class="rhero">
      <h2>🔬 Research lab<span class="sp"></span><button id="labInstBtn" title="What Maxx can measure from here">🧰 Instruments</button><button id="labCfg" title="Research lab settings">⚙</button></h2>
      <p>Ask something that evidence can answer. Maxx sharpens the question, gathers data from the web and your instruments, writes rival hypotheses that must cite their evidence, tests each with a script in a sandbox, fact-checks every claim and number, lets a skeptic attack it, and writes a lab notebook.</p>
      <textarea id="rq" placeholder="e.g. Does my desk get warmer while the PC runs, and is the fan what I hear?"></textarea>
      <div class="rbranch" id="rbranch"></div>
      <div class="row"><span class="grow" id="rsettings"></span><button class="danger" id="rstop" disabled>Stop</button><button class="go" id="rgo">Start study</button></div>
      <div class="rrules"><span>📏 measured</span><span>✔ checked on its page</span><span>🔁 confirmed by another site</span><span>💬 opinion</span><span>⚠ unconfirmed</span><span>⚖ disputed</span><span>✗ fabricated</span></div>
    </div>
    <div class="study" id="lab"></div>
    <div class="rtabs" id="rtabs"><button data-t="notebook">📒 Notebook</button><button data-t="claims">⚖ Claims</button><button data-t="evidence">📡 Evidence</button><button data-t="sim">🧪 Virtual lab</button><button data-t="log">🗒 Instrument log</button></div>
    <div id="rpane"></div>
    <div id="rplay"></div>
    <div class="rdisc" id="rdisc"></div>
    <div class="rpast" id="rpast"></div>
  </div>
  <div id="rfeed"><div class="fh">Lab feed · approvals and notes</div></div>
</section>`;

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
  <label class="check"><input type="checkbox" id="lSims"> Virtual labs: Maxx designs (or reuses) a simulation for the study and sweeps its parameters</label>
  <label class="check"><input type="checkbox" id="lDeb"> Debate arena: the two leading hypotheses argue it out, scored only on cited evidence</label>
  <label class="check"><input type="checkbox" id="lHor"> Look ahead: gap map, dated predictions, experiments to try, and what would change Maxx's mind</label>
  <h4 style="margin:12px 0 4px">Instruments</h4>
  <div id="labInst" class="hint">Looking…</div>
  <details style="margin-top:8px"><summary class="hint">Add your own instrument</summary><p class="hint">Any command that prints readings becomes an instrument. Put it in <code id="labFile"></code>:</p><pre>{ "instruments": [
  { "id": "station", "about": "backyard weather station",
    "command": "python C:/tools/station.py --seconds {seconds}", "seconds": 10 } ] }</pre></details>
  <details><summary class="hint">Arduino starter sketch</summary><p class="hint">Prints readings as key=value lines at 9600 baud, which the lab turns into columns.</p><pre id="labSketch"></pre></details>
  <div class="btns"><button class="left" id="lReset" value="reset" formnovalidate>Defaults</button><button value="cancel" formnovalidate>Cancel</button><button class="primary" value="save">Save</button></div>
</form></dialog>`;

export const LAB_JS = SIM_JS + /* js */ `
const LAB_TOKEN = new URLSearchParams(location.search).get("t") || "";
const inResearch = () => !!(state && state.current && state.current.research);
let rtab = "claims";
// Entering the tab moves the transcript into the feed column (approvals land there); leaving puts it back.
function drawResearch() {
  const on = inResearch();
  document.body.classList.toggle("research", on);
  $("researchBtn").classList.toggle("on", on);
  const log = $("log");
  if (on && log.parentElement !== $("rfeed")) $("rfeed").appendChild(log);
  if (!on && log.parentElement === $("rfeed")) $("rview").parentElement.insertBefore(log, $("activity"));
  if (!on) return;
  $("where").textContent = "🔬 Research";
  $("where").title = "Studies are saved in " + ((state.research && state.research.cwd) || "~/.maxx/research");
  const st = (state.labMode && state.labMode.settings) || {};
  $("rsettings").textContent = (st.rounds || 2) + " rounds · up to " + (st.hypotheses || 3) + " hypotheses · " + (st.readings || 5) + " readings per round · " + (st.parallel || 1) + " test" + (st.parallel > 1 ? "s" : "") + " at once · skeptic " + (st.skeptic === false ? "off" : "on") + " · 🧪 labs " + (st.sims === false ? "off" : "on") + " · ⚔ debate " + (st.debate === false ? "off" : "on") + " · 🌐 web " + (state.network ? "on" : "off (turn on Network above)");
  $("rgo").disabled = busy; $("rstop").disabled = !busy;
  drawPast();
  drawDiscover();
}
function drawPast() {
  const list = (state && state.research && state.research.studies) || [];
  const box = $("rpast");
  box.innerHTML = list.length ? "<h4>Studies</h4>" : "";
  for (const x of list) {
    const c = div("card");
    c.innerHTML = "<div></div><div class=m><span>" + esc(x.started.slice(0, 16).replace("T", " ")) + "</span><span>" + (x.confidence != null ? x.confidence + "% confident" : esc(x.state)) + "</span><span>" + x.claims + " claims</span></div>";
    c.firstChild.textContent = "🔬 " + x.question;
    c.onclick = () => send({ type: "study", id: x.id });
    box.appendChild(c);
  }
  const nav = $("researchNav"); nav.querySelectorAll(".sess").forEach((r) => r.remove());
  for (const x of list.slice(0, 6)) {
    const r = div("sess" + (lastStudy && lastStudy.id === x.id ? " on" : ""));
    r.innerHTML = "<span></span><span class=when>" + (x.confidence != null ? x.confidence + "%" : "") + "</span>";
    r.firstChild.textContent = x.question; r.title = x.question;
    r.onclick = () => { if (!inResearch()) send({ type: "research" }); send({ type: "study", id: x.id }); };
    nav.appendChild(r);
  }
}
$("researchBtn").onclick = () => send({ type: "research" });
$("rgo").onclick = () => {
  const text = $("rq").value.trim();
  if (!text || busy) return;
  lastStudy = null; drawLab(null); $("rpane").innerHTML = "";
  userMsg("🔬 " + text, []);
  send({ type: "send", text, files: [], lab: true, parent: pendingParent || undefined });
  setParent(null);
};
$("rq").onkeydown = (e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); $("rgo").onclick(); } };
$("rstop").onclick = () => send({ type: "stop" });
$("rtabs").onclick = (e) => { const t = e.target.closest("button"); if (t) { rtab = t.dataset.t; drawPane(); } };
const ST_ICON = { observed: "📏", verified: "✔", corroborated: "🔁", opinion: "💬", unverified: "⚠", contested: "⚖", fabricated: "✗" };
function tallyOf(claims) {
  return ["observed", "corroborated", "verified", "opinion", "unverified", "contested", "fabricated"].map((k) => [k, claims.filter((c) => c.status === k).length]).filter((x) => x[1]).map((x) => ST_ICON[x[0]] + " " + x[1] + " " + x[0]).join(" · ");
}
function drawPane() {
  const s = lastStudy, pane = $("rpane");
  $("rtabs").classList.toggle("on", !!s);
  if (!s) return pane.innerHTML = "";
  const ended = ["done", "stopped", "failed"].includes(s.state);
  $("rtabs").querySelectorAll("button").forEach((b) => { b.classList.toggle("on", b.dataset.t === rtab); if (b.dataset.t === "notebook") b.disabled = !ended; if (b.dataset.t === "sim") b.disabled = !s.lab; });
  if (rtab === "sim" && s.lab) {
    // Drawn once: redrawing would restart the simulation on every update.
    if (simOpen && simOpen.where === "pane" && simOpen.study === s.id) return;
    pane.innerHTML = '<p class="sub">Opening the virtual lab…</p>';
    simOpen = { where: "pane", study: s.id, slug: s.lab.slug, runs: [], loading: true };
    send({ type: "simLab", study: s.id });
    return;
  }
  if (simOpen && simOpen.where === "pane") simOpen = null;
  if (rtab === "notebook" && ended) {
    const src = "/lab/" + LAB_TOKEN + "/" + encodeURIComponent(s.id) + "/report.html";
    if (!pane.querySelector("iframe") || pane.querySelector("iframe").dataset.src !== src) pane.innerHTML = '<iframe title="Lab notebook" data-src="' + src + '" src="' + src + '"></iframe><p class="sub"><a href="' + src + '" target="_blank">Open in its own window</a></p>';
    return;
  }
  if (rtab === "claims") {
    const cl = s.claims || [];
    pane.innerHTML = cl.length ? '<p class="sub">' + esc(tallyOf(cl)) + "</p><table><tr><th></th><th>Claim</th><th>Status</th><th>From</th></tr>" + cl.map((c) => '<tr class="' + c.status + '"><td><b>' + c.id + "</b></td><td>" + esc(c.text) + (c.history && c.history.length > 1 ? '<div class="sub">' + c.history.map((h) => "round " + h.round + ": " + ST_ICON[h.status] + " " + esc(h.why)).join(" → ") + "</div>" : c.note ? '<div class="sub">' + esc(c.note) + "</div>" : "") + '</td><td class="st">' + ST_ICON[c.status] + " " + c.status + "</td><td>" + c.evidence + (c.url ? '<div class="sub">' + esc(c.url.split("//").pop().replace("www.", "").slice(0, 36)) + "</div>" : "") + "</td></tr>").join("") + "</table>" : '<p class="sub">No claims yet. Every fact Maxx collects lands here, tagged by how far it can be trusted.</p>';
  } else if (rtab === "evidence") {
    pane.innerHTML = s.evidence.length ? s.evidence.map((e) => '<div class="evc"><b>' + e.icon + " " + e.id + "</b> " + esc(e.title) + (e.error ? ' <span style="color:var(--bad)">failed: ' + esc(e.error) + "</span>" : "<pre>" + esc(e.text) + "</pre>") + "</div>").join("") : '<p class="sub">Nothing collected yet.</p>';
  } else {
    pane.innerHTML = s.log.length ? "<table><tr><th>Time</th><th>Instrument</th><th>Arguments</th><th>Approved</th><th>Result</th></tr>" + s.log.map((l) => "<tr><td>" + l.at.slice(11, 19) + "</td><td>" + esc(l.instrument) + "</td><td>" + esc(l.args) + "</td><td>" + l.approval + "</td><td>" + (l.ok ? "✓ " : "✗ ") + esc(l.note) + "</td></tr>").join("") + "</table>" : '<p class="sub">No readings yet.</p>';
  }
}
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
    return '<div class="hy ' + h.status + '"><span class="ic">' + H_ICON[h.status] + '</span><span class="id">' + h.id + '</span><span class="t">' + esc(h.text) + (h.speculative ? '<span class="pill" title="Cites no evidence, so its prior is capped at 35%">speculative</span>' : "") + (h.wildcard ? '<span class="pill" title="A new perspective added in a later round">wildcard</span>' : "") + (h.kind && h.kind !== "rival" && !(h.wildcard && h.kind === "wildcard") ? '<span class="pill" title="' + (h.kind === "flipped" ? "One of the topic's assumptions, turned around" : h.kind === "borrowed" ? "An explanation borrowed from another field" : "A strange idea that still makes a testable prediction") + '">' + h.kind + (h.field ? " from " + esc(h.field) : "") + "</span>" : "") + (h.why ? '<span class="why">' + esc(h.why) + "</span>" : h.status === "testing" ? '<span class="why">writing and running a test' + (h.tries > 1 ? " (try " + h.tries + ")" : "") + "…</span>" : "") + "</span>" +
      '<span class="meter" title="' + a + "% before, " + b + '% after"><b class="' + (b >= a ? "up" : "down") + '" style="left:' + Math.min(a, b) + "%;width:" + Math.abs(b - a) + '%"></b><i style="left:' + a + '%"></i>' + (h.posterior == null ? "" : '<i class="post" style="left:' + b + '%"></i>') + "</span>" +
      '<span class="pc">' + (h.trail && h.trail.length > 1 ? h.trail.map((x) => Math.round(x) + "%").join(" → ") : a + "%" + (h.posterior == null ? "" : " → " + b + "%")) + "</span></div>";
  }).join("");
  const report = (ended && LAB_TOKEN ? '<a href="#" id="rnb">📒 Read the lab notebook</a>' : "") + (s.lab ? ' <a href="#" id="rsimgo">🧪 Play with the lab</a>' : "") + (ended ? ' <button id="rbr" title="Start a new study that grows from this one">🌱 Branch from this</button>' : "");
  const a = s.audit;
  const audit = a ? '<span class="audit ' + (a.ok ? "ok" : "bad") + '">' + (a.ok ? "✔ Fact check passed: " + a.numbers + " numbers traced to the evidence" : "⚠ Fact check: " + [a.unsupported.length ? a.unsupported.length + " number(s) not in the evidence" : "", a.fakeCitations.length ? a.fakeCitations.length + " citation(s) to nothing" : "", a.uncited.length ? a.uncited.length + " uncited finding(s)" : ""].filter(Boolean).join(", ")) + (a.revised ? " (after one revision)" : "") + "</span>" : "";
  const st = ended ? s.state : (s.rounds > 1 && s.round ? "round " + s.round + " of " + s.rounds + " · " : "") + (PHASES[at] ? PHASES[at][1].slice(2).toLowerCase() + "…" : "");
  box.innerHTML = '<div class="head"><span>🔬</span><span class="q"></span><span class="st">' + esc(st) + "</span></div>" +
    (s.sharpened && s.sharpened !== s.question ? '<div class="sharp">→ ' + esc(s.sharpened) + "</div>" : "") +
    '<div class="pipe">' + pipe + "</div>" + (evs ? '<div class="evs">' + evs + "</div>" : "") + (s.claims && s.claims.length ? '<div class="tally">Claims: ' + esc(tallyOf(s.claims)) + "</div>" : "") + hys + labExtras(s) +
    '<div class="foot">' + (recording ? '<span class="rec">● ' + esc(recording) + "</span>" : "") + (s.confidence != null ? '<span class="conf">Confidence ' + s.confidence + "%</span>" : "") + audit + (ended && s.note ? "<span>" + esc(s.note) + "</span>" : "") + report + "</div>";
  box.querySelector(".q").textContent = s.question;
  box.querySelector(".q").title = s.question;
  const nb = box.querySelector("#rnb");
  if (nb) nb.onclick = (e) => { e.preventDefault(); rtab = "notebook"; drawPane(); };
  const sg = box.querySelector("#rsimgo");
  if (sg) sg.onclick = (e) => { e.preventDefault(); rtab = "sim"; drawPane(); };
  const br = box.querySelector("#rbr");
  if (br) br.onclick = () => studyThis("", { id: s.id, question: s.sharpened || s.question });
}
let lastStudy = null;
let studyEnded = false;
function onStudy(s, viewing) {
  const ended = ["done", "stopped", "failed"].includes(s.state);
  // Opening a finished study, or one finishing: show its notebook.
  if (ended && (viewing || !studyEnded)) rtab = "notebook";
  else if (!ended && (!lastStudy || lastStudy.id !== s.id)) rtab = "claims";
  studyEnded = ended;
  lastStudy = s; drawLab(s); drawPane(); drawPast();
}
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
  $("lSims").checked = v.sims !== false;
  $("lDeb").checked = v.debate !== false;
  $("lHor").checked = v.horizon !== false;
}
function onSimLab(m) {
  if (m.study && lastStudy && m.study === lastStudy.id && rtab === "sim") return drawPlayground("pane", m);
  if (simOpen && simOpen.where === "pane") return;
  drawPlayground("play", m);
}
function drawInstruments(m) {
  const ICONS = { web: "🌐", serial: "🔌", camera: "📷", mic: "🎙", file: "📄", command: "🧰" };
  $("labInst").innerHTML = m.list.map((i) => '<div class="inst"><span>' + ICONS[i.kind] + "</span><span><b>" + esc(i.label) + "</b> " + (i.gated ? "🔒" : "") + "</span>" + (i.unavailable ? '<span class="off">' + esc(i.unavailable) + "</span>" : "<span></span>") + '<span class="u">' + esc(i.about) + " · <code>" + esc(i.usage) + "</code></span></div>").join("") +
    (m.list.some((i) => i.kind === "serial") ? "" : '<p class="hint">No COM ports found. Plug in an Arduino or another USB serial device and open this again.</p>');
  $("labFile").textContent = m.file;
  $("labSketch").textContent = m.sketch;
}
$("labCfg").onclick = () => { labForm(); $("labInst").textContent = "Looking…"; send({ type: "instruments" }); $("labDlg").showModal(); };
$("labInstBtn").onclick = () => { $("labCfg").onclick(); setTimeout(() => { const el = $("labInst"); if (el) el.scrollIntoView({ block: "start" }); }, 50); };
$("labForm").onsubmit = (e) => {
  const how = e.submitter && e.submitter.value;
  if (how === "reset") { e.preventDefault(); return labForm((state && state.labMode && state.labMode.defaults) || {}); }
  if (how !== "save") return;
  const d = (state && state.labMode && state.labMode.defaults) || {}, out = {};
  for (const [id, k] of Object.entries(LAB_FIELDS)) { const n = Number($(id).value); if ($(id).value !== "" && n !== d[k]) out[k] = n; }
  for (const [id, k] of [["lSkep", "skeptic"], ["lSims", "sims"], ["lDeb", "debate"], ["lHor", "horizon"]]) if ($(id).checked !== (d[k] !== false)) out[k] = $(id).checked;
  send({ type: "labSettings", settings: out });
};
`;
