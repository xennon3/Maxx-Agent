// The discovery side of the Research tab: the virtual lab playground (a
// study's simulated lab, live in a sandboxed frame with a slider per
// parameter, play/step/reset, a seed, a live chart, quick sweeps and a record
// of every run you pin), and the landing cards: leads to follow up, the
// prediction ledger, the lab library and the overnight watch.
//
// Written with String.raw so backslashes survive; no backticks or
// dollar-braces inside, and never a literal closing script tag (the page
// itself sits in a script element).

export const SIM_CSS = /* css */ `
.rdisc { max-width: 900px; margin-top: 16px; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px; }
.rdisc .dcard { border: 1px solid var(--line); border-radius: 12px; padding: 10px 12px; background: var(--panel); font-size: 13px; min-width: 0; }
.rdisc .dcard h4 { margin: 0 0 6px; font-size: 13px; display: flex; gap: 6px; align-items: baseline; }
.rdisc .dcard h4 .n { color: var(--mute); font-weight: 400; font-size: 12px; margin-left: auto; }
.rdisc .dcard .empty { color: var(--mute); font-size: 12px; }
.rdisc .li { display: flex; gap: 6px; align-items: flex-start; padding: 5px 0; border-top: 1px dashed var(--line); }
.rdisc .li:first-of-type { border-top: 0; }
.rdisc .li .tx { flex: 1; min-width: 0; }
.rdisc .li .k { font-size: 10.5px; padding: 0 6px; border-radius: 8px; border: 1px solid var(--line); color: var(--mute); white-space: nowrap; }
.rdisc .li button { padding: 2px 8px; font-size: 12px; white-space: nowrap; }
.rdisc .list { max-height: 260px; overflow: auto; }
.rdisc .rec { font-size: 12px; color: var(--mute); margin-bottom: 4px; }
.rdisc .pr.right .tx { color: var(--ok); } .rdisc .pr.wrong .tx { color: var(--bad); text-decoration: line-through; }
.rdisc .due { color: #b08400; font-weight: 600; }
.rdisc .wrow { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; margin-top: 6px; }
.rdisc .wrow select, .rdisc .wrow input { padding: 4px 6px; font-size: 12px; }
.rdisc .wrow input[type=number] { width: 64px; }
.rdisc .wstat { font-size: 12px; margin-top: 6px; }
.rdisc .wstat .live { color: #5f3dc4; font-weight: 600; }
.rdisc .anom { font-size: 12px; color: #b08400; }
.rdisc canvas.wspark { width: 100%; height: 40px; display: block; margin-top: 4px; }
.rbranch { display: none; font-size: 12px; margin-top: 6px; color: #5f3dc4; }
.rbranch.on { display: flex; gap: 6px; align-items: center; }
.rbranch button { padding: 0 6px; font-size: 12px; }
.simwrap { border: 1px solid var(--line); border-radius: 12px; overflow: hidden; background: var(--panel); }
.simwrap iframe { width: 100%; height: 640px; border: 0; display: block; background: transparent; }
.simhead { display: flex; gap: 8px; align-items: baseline; padding: 8px 12px; border-bottom: 1px solid var(--line); flex-wrap: wrap; }
.simhead b { font-size: 14px; } .simhead .sub { flex: 1; }
.simruns { margin-top: 8px; max-height: 260px; overflow: auto; }
.simruns tr.you td { background: color-mix(in srgb, #5f3dc4 8%, transparent); }
#rplay { max-width: 900px; margin-top: 12px; }
.study .disc { font-size: 12px; margin: 6px 0 0; display: grid; gap: 2px; }
.study .disc b { color: #5f3dc4; font-weight: 600; }
.study .foot button { padding: 2px 8px; font-size: 12px; }
`;

// Runs inside the sandboxed frame, after the lab's own code (const LAB = ...).
const SIM_RT = String.raw`
(function () {
  var C = THEME;
  var $ = function (id) { return document.getElementById(id); };
  var fmt = function (v) { return typeof v !== "number" || !isFinite(v) ? "–" : Math.abs(v) >= 1000 || (Math.abs(v) < 0.01 && v !== 0) ? v.toExponential(2) : +v.toPrecision(4) + ""; };
  var rng = function (a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  var PAL = ["#7048e8", "#e8590c", "#0ca678", "#1c7ed6", "#d6336c", "#f59f00"];
  var fail = function (e) { $("err").textContent = "The lab stopped: " + (e && e.message || e); playing = false; $("play").textContent = "▶"; };
  if (typeof LAB !== "object" || !LAB) { document.body.textContent = "This lab does not define const LAB."; return; }
  var params = LAB.params || {}, outputs = LAB.outputs || {}, maxSteps = LAB.steps || 400;
  var okeys = Object.keys(outputs), pkeys = Object.keys(params);
  var p = {}, s = null, t = 0, rnd = null, playing = false, hist = {};
  pkeys.forEach(function (k) { p[k] = params[k].value; });
  $("title").textContent = LAB.title || "Virtual lab";
  $("about").textContent = LAB.about || "";
  // A slider per parameter.
  var box = $("params");
  pkeys.forEach(function (k) {
    var d = params[k], row = document.createElement("label"); row.className = "prm";
    var step = d.step || (d.max - d.min) / 100;
    row.innerHTML = "<span class=pl></span><input type=range><output></output>";
    row.firstChild.textContent = d.label || k;
    var inp = row.children[1], out = row.children[2];
    inp.min = d.min; inp.max = d.max; inp.step = step; inp.value = d.value;
    var show = function () { out.textContent = fmt(p[k]) + (d.unit ? " " + d.unit : ""); };
    inp.oninput = function () { p[k] = +inp.value; show(); reset(); };
    show(); box.appendChild(row);
  });
  // The outputs, live.
  var obox = $("outs");
  okeys.forEach(function (k, i) {
    var r = document.createElement("div"); r.className = "out";
    r.innerHTML = "<i></i><span class=ol></span><b></b>";
    r.firstChild.style.background = PAL[i % PAL.length];
    r.children[1].textContent = (outputs[k].label || k) + (outputs[k].unit ? " (" + outputs[k].unit + ")" : "");
    r.id = "o_" + k; obox.appendChild(r);
  });
  function measure() { try { return LAB.measure(s, p) || {}; } catch (e) { fail(e); return {}; } }
  function reset() {
    try {
      rnd = rng(+$("seed").value || 1); s = LAB.init(p, rnd); t = 0;
      okeys.forEach(function (k) { hist[k] = []; });
      sample(); $("err").textContent = "";
    } catch (e) { fail(e); }
    frame();
  }
  function sample() { var m = measure(); okeys.forEach(function (k) { var v = m[k]; if (typeof v === "number" && isFinite(v)) { hist[k].push(v); if (hist[k].length > 600) hist[k].shift(); } }); return m; }
  function tick(n) {
    for (var i = 0; i < n && t < maxSteps; i++) { try { LAB.step(s, p, rnd, t); } catch (e) { return fail(e); } t++; }
    sample();
    if (t >= maxSteps && playing) { playing = false; $("play").textContent = "▶"; }
  }
  var cv = $("cv"), ctx = cv.getContext("2d"), ch = $("chart"), cx = ch.getContext("2d");
  function fit(c) { var r = c.getBoundingClientRect(), d = window.devicePixelRatio || 1; if (c.width !== Math.round(r.width * d)) { c.width = Math.round(r.width * d); c.height = Math.round(r.height * d); } return d; }
  function frame() {
    var d = fit(cv), w = cv.width / d, h = cv.height / d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    ctx.clearRect(0, 0, w, h);
    var m = measure();
    if (typeof LAB.draw === "function") { try { ctx.save(); LAB.draw(ctx, s, p, w, h); ctx.restore(); } catch (e) { fail(e); } }
    else {
      // No picture of its own: a bar per output.
      okeys.forEach(function (k, i) {
        var all = hist[k], lo = Math.min.apply(null, all.concat([0])), hi = Math.max.apply(null, all.concat([1e-9]));
        var bw = w / okeys.length, v = m[k] || 0, bh = (h - 30) * (v - lo) / ((hi - lo) || 1);
        ctx.fillStyle = PAL[i % PAL.length]; ctx.fillRect(i * bw + 12, h - 20 - bh, bw - 24, bh);
        ctx.fillStyle = C.mute; ctx.font = "12px system-ui"; ctx.fillText(k, i * bw + 12, h - 6);
      });
    }
    okeys.forEach(function (k) { var el = $("o_" + k); if (el) el.lastChild.textContent = fmt(m[k]); });
    $("tick").textContent = "step " + t + " / " + maxSteps;
    chart();
  }
  function chart() {
    var d = fit(ch), w = ch.width / d, h = ch.height / d;
    cx.setTransform(d, 0, 0, d, 0, 0); cx.clearRect(0, 0, w, h);
    cx.strokeStyle = C.line; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(0, h - 0.5); cx.lineTo(w, h - 0.5); cx.stroke();
    okeys.forEach(function (k, i) {
      var a = hist[k]; if (!a || a.length < 2) return;
      var lo = Math.min.apply(null, a), hi = Math.max.apply(null, a), span = (hi - lo) || 1;
      cx.strokeStyle = PAL[i % PAL.length]; cx.lineWidth = 1.6; cx.beginPath();
      a.forEach(function (v, j) { var x = j / (a.length - 1) * w, y = h - 6 - (v - lo) / span * (h - 12); j ? cx.lineTo(x, y) : cx.moveTo(x, y); });
      cx.stroke();
    });
  }
  function loop() { if (playing) { tick(+$("speed").value); frame(); } requestAnimationFrame(loop); }
  $("play").onclick = function () { if (t >= maxSteps) reset(); playing = !playing; this.textContent = playing ? "⏸" : "▶"; };
  $("stepb").onclick = function () { playing = false; $("play").textContent = "▶"; tick(1); frame(); };
  $("reset").onclick = function () { playing = false; $("play").textContent = "▶"; reset(); };
  $("seed").onchange = reset;
  $("dice").onclick = function () { $("seed").value = 1 + Math.floor(Math.random() * 99999); reset(); };
  $("runall").onclick = function () { playing = false; $("play").textContent = "▶"; var t0 = Date.now(); while (t < maxSteps && Date.now() - t0 < 3000) tick(50); frame(); };
  // Pin: the run goes to the lab's record (and the study's) through the app.
  $("pin").onclick = function () {
    var m = measure(), fin = {};
    okeys.forEach(function (k) { if (typeof m[k] === "number" && isFinite(m[k])) fin[k] = m[k]; });
    parent.postMessage({ maxxSim: "run", params: Object.assign({}, p), seed: +$("seed").value || 1, steps: t, final: fin, note: $("note").value }, "*");
    $("note").value = ""; this.textContent = "📌 Recorded"; var b = this; setTimeout(function () { b.textContent = "📌 Record this run"; }, 1400);
  };
  // Quick sweep: one parameter across its range, three seeds each, run to the end.
  var sp = $("sp"), sw = $("sw");
  pkeys.forEach(function (k) { var o = document.createElement("option"); o.value = k; o.textContent = params[k].label || k; sp.appendChild(o); });
  okeys.forEach(function (k) { var o = document.createElement("option"); o.value = k; o.textContent = outputs[k].label || k; sw.appendChild(o); });
  var syncRange = function () { var d = params[sp.value]; if (d) { $("sa").value = d.min; $("sb").value = d.max; } };
  sp.onchange = syncRange; syncRange();
  var lastSweep = null;
  $("sgo").onclick = function () {
    var k = sp.value, a = +$("sa").value, b = +$("sb").value, n = Math.max(2, Math.min(15, +$("sn").value || 6)), seeds = 3, rows = [], t0 = Date.now();
    try {
      for (var i = 0; i < n; i++) {
        var v = a + (b - a) * i / (n - 1), acc = {};
        for (var sd = 1; sd <= seeds; sd++) {
          var q = Object.assign({}, p); q[k] = v;
          var r = rng(sd * 7919), st = LAB.init(q, r);
          for (var j = 0; j < maxSteps; j++) LAB.step(st, q, r, j);
          var m = LAB.measure(st, q);
          okeys.forEach(function (o) { acc[o] = (acc[o] || 0) + (m[o] || 0) / seeds; });
          if (Date.now() - t0 > 8000) throw new Error("the sweep took too long; try fewer points");
        }
        rows.push({ v: v, m: acc });
      }
    } catch (e) { return fail(e); }
    lastSweep = { k: k, rows: rows };
    plotSweep(); $("spin").disabled = false;
  };
  function plotSweep() {
    var c = $("sc"), d = fit(c), w = c.width / d, h = c.height / d, g = c.getContext("2d"), o = sw.value, rows = lastSweep.rows;
    g.setTransform(d, 0, 0, d, 0, 0); g.clearRect(0, 0, w, h);
    var ys = rows.map(function (r) { return r.m[o]; }), lo = Math.min.apply(null, ys), hi = Math.max.apply(null, ys), span = (hi - lo) || 1;
    var X = function (i) { return 40 + i / (rows.length - 1) * (w - 56); }, Y = function (y) { return h - 22 - (y - lo) / span * (h - 36); };
    g.strokeStyle = C.line; g.beginPath(); g.moveTo(40, 6); g.lineTo(40, h - 22); g.lineTo(w - 10, h - 22); g.stroke();
    g.fillStyle = C.mute; g.font = "11px system-ui"; g.fillText(fmt(hi), 2, 14); g.fillText(fmt(lo), 2, h - 24);
    g.fillText(lastSweep.k + " " + fmt(rows[0].v), 40, h - 6); var lab2 = fmt(rows[rows.length - 1].v); g.fillText(lab2, w - 10 - g.measureText(lab2).width, h - 6);
    g.strokeStyle = PAL[Math.max(0, okeys.indexOf(o)) % PAL.length]; g.lineWidth = 2; g.beginPath();
    rows.forEach(function (r, i) { i ? g.lineTo(X(i), Y(r.m[o])) : g.moveTo(X(i), Y(r.m[o])); }); g.stroke();
    g.fillStyle = g.strokeStyle; rows.forEach(function (r, i) { g.beginPath(); g.arc(X(i), Y(r.m[o]), 3, 0, 7); g.fill(); });
  }
  sw.onchange = function () { if (lastSweep) plotSweep(); };
  $("spin").onclick = function () {
    if (!lastSweep) return;
    lastSweep.rows.forEach(function (r) { var q = Object.assign({}, p); q[lastSweep.k] = +r.v.toPrecision(6); parent.postMessage({ maxxSim: "run", params: q, seed: 0, steps: maxSteps, final: r.m, note: "quick sweep (mean of 3 seeds)" }, "*"); });
    this.disabled = true;
  };
  window.addEventListener("resize", frame);
  reset(); loop();
})();
`;

const SIM_FRAME_CSS = String.raw`
*{box-sizing:border-box}body{margin:0;padding:12px;background:BG;color:INK;font:13px/1.45 system-ui,"Segoe UI",sans-serif}
h3{margin:0;font-size:15px}.ab{color:MUTE;margin:2px 0 10px}#err{color:#e03131;font-size:12px;min-height:0}
.grid{display:grid;grid-template-columns:minmax(0,1fr) 250px;gap:12px}@media (max-width:640px){.grid{grid-template-columns:1fr}}
canvas{width:100%;display:block;border:1px solid LINE;border-radius:10px;background:PANEL}#cv{height:300px}#chart{height:90px;margin-top:8px}#sc{height:130px;margin-top:6px}
.prm{display:grid;grid-template-columns:1fr auto;gap:0 6px;margin:0 0 8px;font-size:12px}.prm input{grid-column:1/3;width:100%;accent-color:#7048e8}.prm output{font-family:ui-monospace,Consolas,monospace;color:MUTE}
.ctl{display:flex;gap:4px;flex-wrap:wrap;align-items:center;margin:6px 0}button{font:inherit;border:1px solid LINE;background:PANEL;color:INK;border-radius:7px;padding:4px 9px;cursor:pointer}button:hover{border-color:#7048e8}button:disabled{opacity:.5;cursor:default}
input,select{font:inherit;background:BG;color:INK;border:1px solid LINE;border-radius:6px;padding:3px 5px}input[type=number]{width:72px}
.out{display:grid;grid-template-columns:10px 1fr auto;gap:6px;align-items:center;font-size:12px;padding:2px 0}.out i{width:10px;height:10px;border-radius:3px}.out b{font-family:ui-monospace,Consolas,monospace}
.box{border:1px dashed LINE;border-radius:10px;padding:8px 10px;margin-top:10px}.box .row{display:flex;gap:6px;flex-wrap:wrap;align-items:center}.mute{color:MUTE;font-size:12px}#tick{font-family:ui-monospace,Consolas,monospace;color:MUTE;font-size:12px}
`;

// A plain template: Bun turns non-ASCII inside String.raw into \u escapes, which HTML would show as text.
const SIM_FRAME_BODY = `<h3 id=title></h3><div class=ab id=about></div><div id=err></div>
<div class=grid><div><canvas id=cv></canvas><canvas id=chart></canvas><div id=tick></div></div>
<div><div id=params></div><div class=ctl><button id=play title="Play / pause">▶</button><button id=stepb title="One step">⏭</button><button id=runall title="Run to the end">⏩</button><button id=reset title="Start again">↺</button></div>
<div class=ctl>seed <input id=seed type=number value=1><button id=dice title="Another seed">🎲</button></div><div class=ctl>speed <input id=speed type=range min=1 max=60 value=4></div>
<div id=outs></div><div class=box><input id=note placeholder="note (optional)" style="width:100%"><div class=row style="margin-top:6px"><button id=pin>📌 Record this run</button></div></div></div></div>
<div class=box><div class=row><b>Quick sweep</b><select id=sp></select>from <input id=sa type=number step=any> to <input id=sb type=number step=any> in <input id=sn type=number value=6 min=2 max=15> steps, watch <select id=sw></select><button id=sgo>Run</button><button id=spin disabled title="Save the sweep points to the run record">📌 Record sweep</button></div><canvas id=sc></canvas><div class=mute>Each point is the mean of three seeds, run to the end. A simulation shows what its assumptions imply; it is a prediction, not a measurement.</div></div>`;

const SIM_RT_JSON = JSON.stringify(SIM_RT).replace(/</g, "\\u003c");
const SIM_CSS_JSON = JSON.stringify(SIM_FRAME_CSS).replace(/</g, "\\u003c");
const SIM_BODY_JSON = JSON.stringify(SIM_FRAME_BODY).replace(/</g, "\\u003c");

export const SIM_JS = "const SIM_RT = " + SIM_RT_JSON + ", SIM_FCSS = " + SIM_CSS_JSON + ", SIM_FBODY = " + SIM_BODY_JSON + ";\n" + String.raw`
// The frame: the lab's code plus the runtime, no network, no access to the app.
function simDoc(code) {
  const cs = getComputedStyle(document.documentElement), v = (k, d) => (cs.getPropertyValue(k) || d).trim();
  const theme = { bg: v("--bg", "#fff"), ink: v("--ink", "#111"), mute: v("--mute", "#777"), line: v("--line", "#ddd"), panel: v("--panel", "#fff") };
  const css = SIM_FCSS.split("BG").join(theme.bg).split("INK").join(theme.ink).split("MUTE").join(theme.mute).split("LINE").join(theme.line).split("PANEL").join(theme.panel);
  const safe = (s) => s.replace(/<\/(script)/gi, "<\\/$1").replace(/<!--/g, "<\\!--");
  const open = "<scr" + "ipt>", close = "</scr" + "ipt>";
  return "<!doctype html><html><head><meta charset=utf-8><meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:\"><style>" + css + "</style></head><body>" + SIM_FBODY +
    open + safe(code) + "\n;var THEME = " + JSON.stringify(theme) + ";" + close + open + safe(SIM_RT) + close + "</body></html>";
}
let simOpen = null; // { slug, study, meta, runs, where }
function drawPlayground(where, m) {
  simOpen = { slug: m.slug, study: m.study, meta: m.meta, runs: m.runs || [], where };
  const box = where === "pane" ? $("rpane") : $("rplay");
  box.innerHTML = "";
  const head = div("simhead");
  head.innerHTML = "<b></b><span class=sub></span>" + (where === "play" ? "<button id=simClose>Close</button>" : "");
  head.firstChild.textContent = "🧪 " + m.meta.title;
  head.children[1].textContent = (m.meta.studies || []).length + " stud" + ((m.meta.studies || []).length === 1 ? "y" : "ies") + " · " + (m.meta.runs || 0) + " runs on record · ~/.maxx/labs/" + m.slug;
  const wrap = div("simwrap"); wrap.appendChild(head);
  const fr = document.createElement("iframe");
  fr.setAttribute("sandbox", "allow-scripts"); fr.title = "Virtual lab"; fr.id = "simFrame";
  fr.srcdoc = simDoc(m.code);
  wrap.appendChild(fr); box.appendChild(wrap);
  const runs = div("simruns"); runs.id = "simRuns"; box.appendChild(runs);
  drawSimRuns();
  const c = $("simClose"); if (c) c.onclick = () => { simOpen = null; $("rplay").innerHTML = ""; };
  if (where === "play") box.scrollIntoView({ behavior: "smooth", block: "start" });
}
function drawSimRuns() {
  const box = $("simRuns"); if (!box || !simOpen) return;
  const rs = simOpen.runs.slice(0, 60);
  if (!rs.length) { box.innerHTML = '<p class="sub">No runs on record yet. Move the sliders, press ▶, and 📌 record the runs worth keeping.</p>'; return; }
  const keys = [...new Set(rs.flatMap((r) => Object.keys(r.params).concat(Object.keys(r.final))))].slice(0, 8);
  const f = (v) => (typeof v === "number" ? +v.toPrecision(4) : "");
  box.innerHTML = "<table><tr><th></th><th>when</th><th>seed</th>" + keys.map((k) => "<th>" + esc(k) + "</th>").join("") + "<th>note</th></tr>" + rs.map((r) => '<tr class="' + r.source + '"><td>' + (r.source === "you" ? "📌" : "⚙") + "</td><td>" + esc(r.at.slice(5, 16).replace("T", " ")) + "</td><td>" + (r.seed || "–") + "</td>" + keys.map((k) => "<td>" + (k in r.params ? "<b>" + f(r.params[k]) + "</b>" : f(r.final[k])) + "</td>").join("") + '<td class="sub">' + esc(r.note || "") + "</td></tr>").join("") + "</table>";
}
window.addEventListener("message", (e) => {
  const fr = $("simFrame");
  if (!fr || e.source !== fr.contentWindow || !simOpen || !e.data || e.data.maxxSim !== "run") return;
  const d = e.data;
  send({ type: "simRun", slug: simOpen.slug, study: simOpen.study, params: d.params, seed: d.seed, steps: d.steps, final: d.final, note: d.note });
});
function onSimRuns(m) { if (simOpen && simOpen.slug === m.slug) { simOpen.runs = m.runs; drawSimRuns(); } }

// Branching: a new study that remembers where it came from.
let pendingParent = null;
function setParent(p) {
  pendingParent = p;
  const b = $("rbranch");
  b.classList.toggle("on", !!p);
  if (p) { b.innerHTML = "<span></span><button title='Not a branch after all'>✕</button>"; b.firstChild.textContent = "↳ grows from: " + p.question.slice(0, 120); b.lastChild.onclick = () => setParent(null); }
}
function studyThis(question, parent) { $("rq").value = question; setParent(parent); $("rq").focus(); $("rmain").scrollTop = 0; }

// The landing cards.
const LEAD_KIND = { odd: "✨ odd", outlier: "📈 outlier", gap: "🕳 gap", anomaly: "🌙 anomaly", experiment: "🧰 experiment" };
function drawDiscover() {
  const box = $("rdisc"), r = (state && state.research) || {};
  if (!box) return;
  box.innerHTML = "";
  const card = (title, n) => { const c = div("dcard"); c.innerHTML = "<h4>" + title + "<span class=n>" + (n || "") + "</span></h4>"; box.appendChild(c); return c; };
  // Leads.
  const leads = r.leads || [];
  const lc = card("✨ Leads to follow", leads.length ? leads.length + "" : "");
  if (!leads.length) lc.insertAdjacentHTML("beforeend", '<div class="empty">Odd facts, outliers, gaps and overnight anomalies land here as studies run. Each one is a question waiting to be asked.</div>');
  const ll = div("list"); lc.appendChild(ll);
  for (const l of leads.slice(0, 25)) {
    const row = div("li");
    row.innerHTML = '<span class="k">' + (LEAD_KIND[l.kind] || l.kind) + '</span><span class="tx"></span><button>Study this</button>';
    row.children[1].textContent = l.text; row.children[1].title = "from " + l.source;
    row.lastChild.onclick = () => studyThis(l.question || l.text, { id: l.source, question: l.text });
    ll.appendChild(row);
  }
  // Predictions.
  const preds = r.predictions || [], rec = r.record || {};
  const pc = card("🔮 Prediction ledger", preds.length ? preds.length + "" : "");
  if (rec.settled) pc.insertAdjacentHTML("beforeend", '<div class="rec">Track record: ' + rec.right + " of " + rec.settled + " right" + (rec.brier != null ? " · Brier " + rec.brier.toFixed(2) + " (0 is perfect, 0.25 is guessing)" : "") + "</div>");
  if (!preds.length) pc.insertAdjacentHTML("beforeend", '<div class="empty">Every finished study makes dated predictions. Mark them right or wrong when they come due, and Maxx learns how calibrated it is.</div>');
  const pl = div("list"); pc.appendChild(pl);
  const today = new Date().toISOString().slice(0, 10);
  for (const p of preds.slice(0, 25)) {
    const row = div("li pr " + p.status);
    const due = p.status === "open" && p.due <= today;
    row.innerHTML = '<span class="tx"><span></span><div class="sub"></div></span>' + (p.status === "open" ? "<button title='It happened'>✓</button><button title='It did not'>✗</button>" : '<span class="k">' + p.status + "</span>");
    row.querySelector(".tx span").textContent = p.text + " (" + p.confidence + "%)";
    const sub = row.querySelector(".sub"); sub.textContent = (due ? "due now · " : "due " + p.due + " · ") + p.check; if (due) sub.className = "sub due";
    const bs = row.querySelectorAll("button");
    if (bs[0]) bs[0].onclick = () => send({ type: "predict", id: p.id, right: true });
    if (bs[1]) bs[1].onclick = () => send({ type: "predict", id: p.id, right: false });
    pl.appendChild(row);
  }
  // The lab library.
  const labs = r.labs || [];
  const bc = card("🧪 Lab library", labs.length ? labs.length + "" : "");
  if (!labs.length) bc.insertAdjacentHTML("beforeend", '<div class="empty">The virtual labs Maxx designs are kept here. Open one to play with it, or let the next study reuse it.</div>');
  const bl = div("list"); bc.appendChild(bl);
  for (const l of labs) {
    const row = div("li");
    row.innerHTML = '<span class="tx"><b></b><div class="sub"></div></span><button>Open</button>';
    row.querySelector("b").textContent = l.title;
    row.querySelector(".sub").textContent = l.about + " · " + Object.keys(l.params).length + " knobs · " + l.runs + " runs · " + l.studies.length + " stud" + (l.studies.length === 1 ? "y" : "ies");
    row.lastChild.onclick = () => send({ type: "simLab", slug: l.slug });
    bl.appendChild(row);
  }
  // The overnight watch.
  const wc = card("🌙 Overnight watch", "");
  wc.id = "watchCard";
  drawWatch(r.watch);
}
let watchInstruments = null;
function drawWatch(w) {
  const c = $("watchCard"); if (!c) return;
  c.querySelectorAll(":scope > :not(h4)").forEach((x) => x.remove());
  const running = w && w.state === "running";
  if (!running) {
    c.insertAdjacentHTML("beforeend", '<div class="empty">Leave a sensor running (the Arduino, the camera, the microphone) and Maxx flags anything far outside the usual. Surprises go to Leads. On Windows the PC is kept awake until it ends.</div><div class="wrow"><select id="wInst"><option value="">instrument…</option></select><input id="wArgs" placeholder="arguments" style="flex:1;min-width:80px"></div><div class="wrow">for <input id="wHours" type="number" min="0.05" max="24" step="0.5" value="8"> h, a reading every <input id="wChunk" type="number" min="2" max="600" value="20"> s <button id="wGo">Start</button></div>');
    const sel = $("wInst");
    const fill = (list) => { for (const i of list.filter((i) => !["web", "file"].includes(i.kind) && !i.unavailable)) { const o = document.createElement("option"); o.value = i.id; o.textContent = i.label; sel.appendChild(o); } };
    if (watchInstruments) fill(watchInstruments); else { sel.onfocus = () => { if (!watchInstruments) send({ type: "instruments" }); }; }
    $("wGo").onclick = () => { if (!sel.value) return toast("Pick an instrument to watch"); send({ type: "watch", instrument: sel.value, args: $("wArgs").value, hours: +$("wHours").value, chunk: +$("wChunk").value }); };
  }
  if (w) {
    const st = div("wstat");
    const last = w.last ? Object.entries(w.last).filter((x) => x[0] !== "t").slice(0, 4).map((x) => x[0] + "=" + (+x[1]).toPrecision(4)).join(" ") : "";
    st.innerHTML = (running ? '<span class="live">● watching</span> ' : "<b>Last watch</b> ") + "<span></span>";
    st.lastChild.textContent = w.instrument + " · " + w.rows + " readings · " + w.anomalies.length + " anomal" + (w.anomalies.length === 1 ? "y" : "ies") + (running ? " · until " + w.ends.slice(11, 16) + (w.awake ? " · keeping the PC awake" : "") : " · " + w.state) + (last ? " · now " + last : "") + (w.note && !running ? " · " + w.note : "");
    c.appendChild(st);
    for (const a of (w.anomalies || []).slice(-4).reverse()) { const x = div("anom"); x.textContent = "⚡ " + a.at.slice(11, 19) + " " + a.key + " = " + (+a.value).toPrecision(4) + " (" + (a.z > 0 ? "+" : "") + a.z + " sd)"; c.appendChild(x); }
    if (running) { const b = document.createElement("button"); b.textContent = "Stop watching"; b.className = "danger"; b.style.marginTop = "6px"; b.onclick = () => send({ type: "unwatch" }); c.appendChild(b); }
  }
}
function onWatch(w) { if (state && state.research) state.research.watch = w; drawWatch(w); }
function onInstrumentsForWatch(m) { watchInstruments = m.list; const sel = $("wInst"); if (sel && sel.options.length <= 1) { for (const i of m.list.filter((i) => !["web", "file"].includes(i.kind) && !i.unavailable)) { const o = document.createElement("option"); o.value = i.id; o.textContent = i.label; sel.appendChild(o); } } }
// The study board's extra lines: the lab, the debate, what would change its mind.
function labExtras(s) {
  const out = [];
  if (s.parent) out.push("<div>↳ grew from: " + esc(s.parent.question.slice(0, 140)) + "</div>");
  if (s.lab) out.push("<div><b>🧪 Virtual lab</b> " + esc(s.lab.title) + (s.lab.reused ? " (from the library)" : " (designed for this study)") + " · " + s.lab.sweeps + " sweep" + (s.lab.sweeps === 1 ? "" : "s") + "</div>");
  if (s.debate) { const d = s.debate, win = d.winner === "TIE" ? "a tie" : (d.winner === "A" ? d.a.h : d.b.h) + " wins"; out.push("<div><b>⚔ Debate</b> " + esc(d.a.h) + " " + d.a.score.toFixed(1) + " vs " + esc(d.b.h) + " " + d.b.score.toFixed(1) + " pts · " + esc(win) + "</div>"); }
  if (s.assumptions && s.assumptions.length) out.push("<div><b>⇄ Flipped</b> " + s.assumptions.map((a) => esc(a.text)).join(" · ") + "</div>");
  if (s.changeMind && s.changeMind.length) out.push("<div><b>🧭 Would change my mind</b> " + esc(s.changeMind[0]) + "</div>");
  return out.length ? '<div class="disc">' + out.join("") + "</div>" : "";
}
`;
