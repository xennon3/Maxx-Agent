// The stage panel of the web UI (see stage.ts): CSS, markup and script that
// page.ts splices into its one page. The script is a raw string, so it is
// written as is, with no template-literal escaping; it must not use backticks.
// (Bun turns non-ASCII text in raw strings into \u escapes, which JavaScript
// reads back fine but HTML would show, so the markup is a plain string.)

import { VIS_PANE, VIS_RAIL } from "./visuals-page.ts";

export const STAGE_CSS = `
#stage { display: flex; border-left: 1px solid var(--line); background: var(--panel); min-height: 0; }
#stageBody { width: 0; overflow: hidden; display: flex; flex-direction: column; min-height: 0; position: relative; }
#stage.on #stageBody { width: var(--stage-w, 480px); }
#stageGrip { position: absolute; left: 0; top: 0; bottom: 0; width: 5px; cursor: ew-resize; z-index: 2; }
#stageGrip:hover, #stageGrip.drag { background: var(--accent); opacity: .4; }
#rail { width: 44px; flex: none; display: flex; flex-direction: column; gap: 4px; padding: 8px 4px; border-left: 1px solid var(--line); }
#rail button { width: 36px; height: 36px; padding: 0; border: 0; background: none; border-radius: 8px; font-size: 16px; position: relative; color: var(--mute); }
#rail button:hover { background: var(--bg); color: var(--ink); }
#rail button.on { background: var(--user); color: var(--accent); }
#rail .dot { position: absolute; top: 4px; right: 4px; min-width: 8px; height: 8px; border-radius: 99px; background: var(--accent); display: none; font-size: 9px; line-height: 8px; color: #fff; }
#rail .dot.bad { background: var(--bad); }
#rail .dot.on { display: block; }
.stabs { display: flex; align-items: center; gap: 6px; padding: 10px 12px 8px 14px; font-weight: 600; }
.stabs .t { margin-right: auto; }
.spane { display: none; flex: 1; flex-direction: column; min-height: 0; }
.spane.on { display: flex; }
.sbar { display: flex; gap: 6px; padding: 0 12px 8px 14px; align-items: center; }
.sbar input { flex: 1; font: 12.5px var(--mono); padding: 5px 8px; }
.sbar select { max-width: 40%; padding: 5px 6px; font-size: 12.5px; }
.sbar button { padding: 5px 9px; font-size: 13px; }
.sbar button.on { color: var(--accent); border-color: var(--accent); }
.frame { flex: 1; min-height: 0; position: relative; background: var(--bg); border-top: 1px solid var(--line); display: flex; justify-content: center; overflow: auto; }
.frame iframe { border: 0; width: 100%; height: 100%; background: #fff; }
.frame.mobile { padding: 16px 0; }
.frame.mobile iframe { width: 390px; height: 780px; flex: none; border-radius: 22px; box-shadow: 0 0 0 8px #222, 0 8px 30px rgba(0,0,0,.35); }
.frame .blank { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: var(--mute); padding: 24px; gap: 6px; background: var(--bg); }
.frame .blank h3 { margin: 0; color: var(--ink); }
.cons { border-top: 1px solid var(--line); max-height: 34%; display: flex; flex-direction: column; min-height: 0; }
.cons .h { display: flex; align-items: center; gap: 8px; padding: 5px 12px 5px 14px; font-size: 12px; color: var(--mute); cursor: pointer; user-select: none; }
.cons .h b { color: var(--ink); font-weight: 600; }
.cons .h .grow { margin-right: auto; }
.cons .h button { padding: 2px 8px; font-size: 12px; }
.cons .rows { overflow: auto; font: 12px/1.45 var(--mono); padding: 0 0 6px; }
.cons.shut .rows { display: none; }
.cons .row { padding: 1px 14px; white-space: pre-wrap; word-break: break-word; border-bottom: 1px solid var(--line); }
.cons .row.error { color: var(--bad); background: color-mix(in srgb, var(--bad) 8%, transparent); }
.cons .row.warn { color: #b8860b; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 12px 10px 14px; }
.chips .chip { font: 12px var(--mono); padding: 3px 9px; }
.chips .chip.saved::before { content: "★ "; color: var(--accent); }
#runList { flex: 1; overflow: auto; padding: 0 12px 12px 14px; display: flex; flex-direction: column; gap: 8px; border-top: 1px solid var(--line); padding-top: 10px; }
.proc { border: 1px solid var(--line); border-radius: var(--radius); background: var(--panel); display: flex; flex-direction: column; min-height: 0; }
.proc .h { display: flex; align-items: center; gap: 6px; padding: 6px 8px 6px 10px; font: 12.5px var(--mono); }
.proc .h .cmd { margin-right: auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: pointer; }
.proc .h button { padding: 2px 8px; font-size: 12px; font-family: system-ui, sans-serif; }
.proc .st { width: 8px; height: 8px; border-radius: 99px; background: var(--mute); flex: none; }
.proc.running .st { background: var(--ok); animation: pulse 1.4s infinite; }
.proc.failed .st { background: var(--bad); }
.proc pre { margin: 0; padding: 8px 10px; background: var(--code); font: 12px/1.45 var(--mono); white-space: pre-wrap; word-break: break-word; max-height: 320px; overflow: auto; border-top: 1px solid var(--line); border-radius: 0 0 var(--radius) var(--radius); }
.proc.fold pre { display: none; }
.proc .meta { padding: 0 10px 6px; font-size: 12px; color: var(--mute); }
.proc .meta a { color: var(--accent); cursor: pointer; }
@keyframes pulse { 50% { opacity: .35; } }
.phwrap { flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center; padding: 10px; border-top: 1px solid var(--line); background: var(--bg); }
.phwrap img { max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 14px; box-shadow: 0 0 0 6px #222; background: #000; cursor: zoom-in; user-select: none; -webkit-user-drag: none; }
.phwrap img.live { cursor: crosshair; }
.phwrap img:not([src]) { display: none; }
.phwrap .blank { color: var(--mute); text-align: center; max-width: 280px; }
.phkeys { justify-content: center; padding-top: 8px; }
.phkeys button { width: 54px; }
#phLive.on { color: #fff; background: var(--bad); border-color: var(--bad); }
.tap { position: fixed; width: 26px; height: 26px; margin: -13px 0 0 -13px; border-radius: 99px; border: 2px solid var(--accent); pointer-events: none; animation: tap .5s forwards; z-index: 8; }
@keyframes tap { to { transform: scale(1.8); opacity: 0; } }
@media (max-width: 860px) {
  #stage { border-left: 0; border-top: 1px solid var(--line); flex-direction: column-reverse; }
  #stage.on #stageBody { width: auto; height: 50vh; }
  #rail { flex-direction: row; width: auto; border-left: 0; padding: 4px 8px; }
}
`;

export const STAGE_HTML = `
<section id="stage">
  <div id="stageBody">
    <div id="stageGrip" title="Drag to resize"></div>
    <div class="spane" id="pane-preview">
      <div class="stabs"><span class="t">Preview</span><button id="stageHide" title="Hide panel">✕</button></div>
      <div class="sbar">
        <select id="pvFile" title="HTML files in this project"></select>
        <input id="pvUrl" placeholder="index.html or http://localhost:5173" spellcheck="false">
        <button id="pvReload" title="Reload">⟳</button>
      </div>
      <div class="sbar" style="padding-top:0">
        <button id="pvAuto" class="on" title="Reload when files change">● Live reload</button>
        <button id="pvSize" title="Show at phone size">📱 Phone size</button>
        <span style="margin-right:auto"></span>
        <button id="pvPop" title="Open in its own window">↗ Pop out</button>
      </div>
      <div class="frame" id="pvFrameBox">
        <iframe id="pvFrame" title="Preview" sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin allow-pointer-lock allow-downloads"></iframe>
        <div class="blank" id="pvBlank"><h3>Nothing to preview yet</h3>Ask Maxx to build a web page or a game, and it shows up here as it is written.<br>Or run a dev server from the Run tab.</div>
      </div>
      <div class="cons shut" id="pvCons">
        <div class="h" id="pvConsHead"><b>Console</b><span class="grow" id="pvConsSum">quiet</span><button id="pvFix" style="display:none">Ask Maxx to fix</button><button id="pvClear">Clear</button></div>
        <div class="rows" id="pvRows"></div>
      </div>
    </div>
    <div class="spane" id="pane-run">
      <div class="stabs"><span class="t">Run</span><button id="stageHide2" title="Hide panel">✕</button></div>
      <div class="sbar">
        <input id="runCmd" placeholder="Command, e.g. npm run dev, pytest, ./gradlew test" spellcheck="false">
        <button class="primary" id="runGo">▶ Run</button>
      </div>
      <div class="chips" id="runChips"></div>
      <div id="runList"><div class="status" id="runEmpty">Commands you run here keep going in the background, like a terminal tab. Dev servers open in Preview on their own.</div></div>
    </div>
    <div class="spane" id="pane-screen">
      <div class="stabs"><span class="t" id="scTitle">Screen</span><button id="stageHide3" title="Hide panel">✕</button></div>
      <div class="sbar">
        <button id="phLive" title="Mirror the phone live; click to tap, drag to swipe">● Live phone</button>
        <span class="status" id="scCap" style="margin-left:4px"></span>
      </div>
      <div class="phwrap"><img id="shot" alt="Latest screenshot" draggable="false"><div class="blank" id="scBlank">Screenshots from the phone or desktop show here while Maxx tests.<br><br>Turn on <b>Live phone</b> to mirror a connected Android phone and tap it yourself.</div></div>
      <div class="sbar phkeys" id="phKeys" style="display:none"><button data-key="back" title="Back">◀</button><button data-key="home" title="Home">●</button><button data-key="recents" title="Recent apps">■</button></div>
    </div>${VIS_PANE}
  </div>
  <nav id="rail">
    <button data-tab="preview" title="Preview">◧<span class="dot" id="dotPreview"></span></button>
    <button data-tab="run" title="Run">▶<span class="dot" id="dotRun"></span></button>
    <button data-tab="screen" title="Phone / desktop screen">📱<span class="dot" id="dotScreen"></span></button>
    ${VIS_RAIL}
  </nav>
</section>
`;

export const STAGE_JS = String.raw`
const stage = (() => {
  let info = { base: "", commands: [], html: [], procs: [] };
  let tab = "preview", shown = false;
  let cur = null;          // what the preview shows: { url, label, local }
  let logs = [];
  let waiting = null;      // the model's preview call waiting for a report: { id, timer }
  let live = true, mobile = false, mirror = false, reloadTimer = null, project = "";
  const procs = new Map(); // id -> { p, el, pre, size }
  const frame = $("pvFrame");
  const save = (k, v) => { try { localStorage.setItem("maxx." + k, v); } catch {} };
  const load = (k) => { try { return localStorage.getItem("maxx." + k); } catch { return null; } };

  function show(t) {
    if (t) tab = t;
    shown = true;
    $("stage").classList.add("on");
    for (const p of document.querySelectorAll(".spane")) p.classList.toggle("on", p.id === "pane-" + tab);
    for (const b of document.querySelectorAll("#rail button")) b.classList.toggle("on", b.dataset.tab === tab);
    $("dot" + tab[0].toUpperCase() + tab.slice(1)).classList.remove("on");
    save("tab", tab);
  }
  function hide() { shown = false; $("stage").classList.remove("on"); for (const b of document.querySelectorAll("#rail button")) b.classList.remove("on"); save("tab", ""); }
  function badge(t, bad) { if (shown && tab === t) return; const d = $("dot" + t[0].toUpperCase() + t.slice(1)); d.classList.add("on"); d.classList.toggle("bad", !!bad); }

  // ---- Preview ----
  const isUrl = (s) => /^https?:\/\//i.test(s);
  const rel = (url) => info.base && url.startsWith(info.base) ? decodeURIComponent(url.slice(info.base.length)) || "/" : url;
  const localUrl = (path) => info.base + String(path).replace(/^\.?\/+/, "").split("/").map(encodeURIComponent).join("/");
  function open(target, opts) {
    opts = opts || {};
    const url = isUrl(target) ? target : localUrl(target);
    cur = { url, label: rel(url), local: !!info.base && url.startsWith(info.base) };
    logs = []; renderLogs();
    $("pvBlank").style.display = "none";
    $("pvUrl").value = cur.label;
    $("pvFile").value = cur.local && info.html.includes(cur.label) ? cur.label : "";
    // A new src (with a cache-buster for the same page) makes the iframe navigate again.
    frame.src = url + (cur.local ? (url.includes("?") ? "&" : "?") + "_=" + Date.now() : "");
    if (opts.focus !== false) show("preview");
  }
  function reload() { if (cur) open(cur.url, { focus: false }); }
  function soon() { if (!cur || !live) return; clearTimeout(reloadTimer); reloadTimer = setTimeout(reload, 300); }

  function report(extra) {
    if (!waiting) return;
    clearTimeout(waiting.timer);
    send(Object.assign({ type: "previewReport", id: waiting.id, logs: logs.slice(-40) }, extra));
    waiting = null;
  }
  frame.addEventListener("load", () => { if (waiting && cur && !cur.local) report({ unbridged: true }); });
  addEventListener("message", (e) => {
    if (e.source !== frame.contentWindow || !e.data || e.data.maxx !== 1) return;
    const d = e.data;
    if (d.kind === "console") { logs.push({ level: d.level, text: String(d.text) }); if (logs.length > 300) logs.shift(); renderLogs(); if (d.level === "error") badge("preview", true); }
    if (d.kind === "loaded" && waiting) {
      clearTimeout(waiting.timer);
      // Errors from timers and first frames land just after load; wait for them.
      waiting.timer = setTimeout(() => report({ title: d.title, text: d.text }), 700);
    }
  });
  function renderLogs() {
    const rows = $("pvRows"); rows.innerHTML = "";
    for (const l of logs.slice(-200)) { const r = div("row " + l.level, l.text); rows.appendChild(r); }
    rows.scrollTop = rows.scrollHeight;
    const errs = logs.filter((l) => l.level === "error").length;
    $("pvConsSum").textContent = logs.length ? logs.length + " message" + (logs.length > 1 ? "s" : "") + (errs ? " · " + errs + " error" + (errs > 1 ? "s" : "") : "") : "quiet";
    $("pvConsSum").style.color = errs ? "var(--bad)" : "";
    $("pvFix").style.display = errs ? "" : "none";
    if (errs) $("pvCons").classList.remove("shut");
  }
  function ask(text) { const i = $("input"); i.value = text; i.focus(); i.setSelectionRange(text.length, text.length); }
  $("pvFix").onclick = (e) => {
    e.stopPropagation();
    const errs = logs.filter((l) => l.level === "error").map((l) => "- " + l.text).slice(-10).join("\n");
    ask("The preview of " + (cur ? cur.label : "the page") + " shows these errors:\n" + errs + "\nPlease fix them, then check it with the preview tool.");
  };
  $("pvClear").onclick = (e) => { e.stopPropagation(); logs = []; renderLogs(); };
  $("pvConsHead").onclick = () => $("pvCons").classList.toggle("shut");
  $("pvReload").onclick = reload;
  $("pvUrl").onkeydown = (e) => { if (e.key === "Enter" && e.target.value.trim()) open(e.target.value.trim()); };
  $("pvFile").onchange = (e) => { if (e.target.value) open(e.target.value); };
  $("pvAuto").onclick = () => { live = !live; $("pvAuto").classList.toggle("on", live); };
  $("pvSize").onclick = () => { mobile = !mobile; $("pvSize").classList.toggle("on", mobile); $("pvFrameBox").classList.toggle("mobile", mobile); save("mobile", mobile ? "1" : ""); };
  $("pvPop").onclick = () => cur && window.open(cur.url, "_blank", "width=1100,height=800");

  // ---- Run ----
  function strip(s) { return String(s).replace(/\x1b\[(?![0-9;]*m)[0-9;?]*[A-Za-z]/g, "").replace(/\r(?!\n)/g, "\n"); }
  function procCard(p) {
    let c = procs.get(p.id);
    if (!c) {
      const el = div("proc");
      el.innerHTML = '<div class="h"><span class="st"></span><span class="cmd"></span><button data-a="stop">Stop</button><button data-a="again" title="Run again">↻</button><button data-a="x" title="Remove">✕</button></div><div class="meta"></div><pre></pre>';
      el.querySelector(".cmd").onclick = () => el.classList.toggle("fold");
      el.querySelector("[data-a=stop]").onclick = () => send({ type: "runStop", id: p.id });
      el.querySelector("[data-a=again]").onclick = () => { if (c.p.status === "running") send({ type: "runStop", id: p.id }); send({ type: "runForget", id: p.id }); el.remove(); procs.delete(p.id); send({ type: "runStart", command: c.p.command }); };
      el.querySelector("[data-a=x]").onclick = () => { send({ type: "runForget", id: p.id }); el.remove(); procs.delete(p.id); empty(); };
      for (const o of procs.values()) o.el.classList.add("fold");
      $("runList").prepend(el);
      c = { p, el, pre: el.querySelector("pre"), size: 0 };
      procs.set(p.id, c);
      empty();
    }
    const firstUrl = p.url && !c.p.url;
    c.p = p;
    const failed = p.status === "exited" && p.code !== 0;
    c.el.className = "proc" + (c.el.classList.contains("fold") ? " fold" : "") + (p.status === "running" ? " running" : failed ? " failed" : "");
    c.el.querySelector(".cmd").textContent = "$ " + p.command;
    c.el.querySelector(".cmd").title = p.command + " (click to fold)";
    c.el.querySelector("[data-a=stop]").style.display = p.status === "running" ? "" : "none";
    const meta = c.el.querySelector(".meta"); meta.innerHTML = "";
    const bits = [];
    if (p.status === "running") bits.push("running");
    else if (p.status === "stopped") bits.push("stopped");
    else bits.push(p.code === 0 ? "finished ✓" : "failed, exit code " + p.code);
    meta.append(bits.join(" · "));
    if (p.url) { const a = document.createElement("a"); a.textContent = "  ◧ preview " + p.url; a.onclick = () => open(p.url); meta.append(a); }
    if (failed) { const a = document.createElement("a"); a.textContent = "  ✦ ask Maxx to fix"; a.onclick = () => ask("Running \x60" + p.command + "\x60 failed with exit code " + p.code + ". The end of its output:\n\x60\x60\x60\n" + strip(c.pre.textContent).trimEnd().split("\n").slice(-30).join("\n") + "\n\x60\x60\x60\nPlease fix it."); meta.append(a); badge("run", true); }
    // The first dev server URL fills an empty preview by itself.
    if (firstUrl && (!cur || !cur.local || cur.url === p.url)) open(p.url, { focus: !cur || tab === "preview" });
  }
  function empty() { $("runEmpty").style.display = procs.size ? "none" : ""; }
  function out(id, text, replace) {
    const c = procs.get(id); if (!c) return;
    const pre = c.pre, stick = pre.scrollHeight - pre.scrollTop - pre.clientHeight < 40;
    if (replace) { pre.innerHTML = ""; c.size = 0; }
    const s = document.createElement("span"); s.innerHTML = ansi(strip(text)); pre.appendChild(s);
    c.size += text.length;
    while (c.size > 150000 && pre.firstChild) { c.size -= pre.firstChild.textContent.length; pre.firstChild.remove(); }
    if (stick) pre.scrollTop = pre.scrollHeight;
  }
  function chips() {
    const box = $("runChips"); box.innerHTML = "";
    for (const c of info.commands) {
      const b = div("chip" + (c.saved ? " saved" : ""), c.label); b.title = c.command;
      b.onclick = () => send({ type: "runStart", command: c.command });
      box.appendChild(b);
    }
    const sel = $("pvFile"); sel.innerHTML = '<option value="">' + (info.html.length ? "Pages…" : "No pages yet") + "</option>";
    for (const f of info.html) { const o = document.createElement("option"); o.value = o.textContent = f; sel.appendChild(o); }
    if (cur && cur.local) sel.value = info.html.includes(cur.label) ? cur.label : "";
  }
  function run() { const v = $("runCmd").value.trim(); if (!v) return; send({ type: "runStart", command: v, save: true }); $("runCmd").value = ""; }
  $("runGo").onclick = run;
  $("runCmd").onkeydown = (e) => { if (e.key === "Enter") run(); };

  // ---- Screen ----
  let down = null;
  const img = $("shot");
  function frac(e) { const r = img.getBoundingClientRect(); return { fx: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), fy: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)) }; }
  img.onmousedown = (e) => { if (mirror) { e.preventDefault(); down = { x: e.clientX, y: e.clientY, t: Date.now(), f: frac(e) }; } };
  img.onmouseup = (e) => {
    if (!mirror || !down) return;
    const f = frac(e), moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    if (moved < 8) send(Object.assign({ type: "phoneTap" }, f));
    else send({ type: "phoneSwipe", fx1: down.f.fx, fy1: down.f.fy, fx2: f.fx, fy2: f.fy, ms: Math.min(1500, Math.max(120, Date.now() - down.t)) });
    const ring = div("tap"); ring.style.left = e.clientX + "px"; ring.style.top = e.clientY + "px"; document.body.appendChild(ring); setTimeout(() => ring.remove(), 600);
    down = null;
  };
  img.onclick = () => { if (!mirror && img.src) { $("zoomImg").src = img.src; $("zoom").style.display = "flex"; } };
  function setMirror(on) {
    mirror = on;
    $("phLive").classList.toggle("on", on);
    $("phLive").textContent = on ? "■ Stop live view" : "● Live phone";
    $("phKeys").style.display = on ? "" : "none";
    img.classList.toggle("live", on);
    send({ type: "mirror", on });
  }
  $("phLive").onclick = () => setMirror(!mirror);
  for (const b of document.querySelectorAll("#phKeys button")) b.onclick = () => send({ type: "phoneKey", key: b.dataset.key });
  function shot(src, tool, cap) {
    img.src = src; $("scBlank").style.display = "none";
    $("scTitle").textContent = tool && tool.startsWith("desktop") ? "Desktop" : "Phone";
    $("scCap").textContent = cap || (tool + " · " + new Date().toLocaleTimeString());
  }

  // ---- Panel ----
  for (const b of document.querySelectorAll("#rail button")) b.onclick = () => shown && tab === b.dataset.tab ? hide() : show(b.dataset.tab);
  for (const id of ["stageHide", "stageHide2", "stageHide3", "stageHide4"]) $(id).onclick = hide;
  const w = Number(load("width")); if (w > 280) document.documentElement.style.setProperty("--stage-w", w + "px");
  if (load("mobile")) $("pvSize").onclick();
  const grip = $("stageGrip");
  grip.onmousedown = (e) => {
    e.preventDefault(); grip.classList.add("drag"); frame.style.pointerEvents = $("visBox").style.pointerEvents = "none";
    const move = (ev) => { const nw = Math.max(300, Math.min(innerWidth - 560, innerWidth - ev.clientX - 44)); document.documentElement.style.setProperty("--stage-w", nw + "px"); save("width", nw); };
    const up = () => { grip.classList.remove("drag"); frame.style.pointerEvents = $("visBox").style.pointerEvents = ""; removeEventListener("mousemove", move); removeEventListener("mouseup", up); };
    addEventListener("mousemove", move); addEventListener("mouseup", up);
  };
  const t0 = load("tab"); if (t0) show(t0);

  const tools = {};
  return {
    // After a spoken change: the app on the live phone, or the page at phone size.
    phone() { show("screen"); if (!mirror) setMirror(true); },
    phoneView() { if (!mobile) $("pvSize").onclick(); show("preview"); },
    // A chart, diagram or widget from the chat, at the panel's full size.
    visual(kind, src) { const box = $("visBox"); box.innerHTML = ""; box.appendChild(visuals.card(kind, src, true)); show("visual"); },
    shot(src, tool) {
      shot(src, tool);
      if (!shown) show("screen"); else badge("screen");
    },
    on(m) {
      switch (m.type) {
        case "stage": {
          const now = m.base + "|" + (state && state.current ? state.current.cwd : "");
          const changedProject = now !== project;
          project = now;
          info = m;
          if (changedProject) { cur = null; frame.removeAttribute("src"); $("pvBlank").style.display = ""; $("pvUrl").value = ""; logs = []; renderLogs(); for (const c of procs.values()) c.el.remove(); procs.clear(); empty(); }
          chips();
          for (const p of m.procs) { const known = procs.has(p.id); procCard(p); if (!known) send({ type: "runOutput", id: p.id }); }
          if (!cur && m.html.length && changedProject) open(m.html[0], { focus: false });
          return;
        }
        case "proc": procCard(m.proc); if (!shown) show("run"); return;
        case "procOut": return out(m.id, m.text);
        case "procOutput": return out(m.id, m.text, true);
        case "preview":
          if (waiting) report({ error: "replaced by a newer preview" });
          waiting = { id: m.id, timer: setTimeout(() => report({ error: "the page did not finish loading" }), 7000) };
          return open(m.url);
        case "changed":
          if (cur && cur.local && m.paths.some((p) => /\.(html?|css|m?js|json|svg|png|jpe?g|gif|webp)$/i.test(p))) soon();
          if (m.paths.some((p) => /\.html?$/i.test(p))) send({ type: "stageInfo" });
          return;
        case "toolStart": tools.last = { name: m.name, args: m.args }; return;
        case "toolEnd": {
          const t = tools.last; tools.last = null;
          if (!t || !/^(write_file|edit_file)$/.test(t.name) || /^error/.test(m.result)) return;
          let path = ""; try { path = JSON.parse(t.args).path || ""; } catch {}
          // Like an artifact: the first page Maxx writes opens by itself, later edits reload it.
          if (/\.html?$/i.test(path) && !/^([a-z]:|[\\/])/i.test(path) && (!cur || !cur.local)) { send({ type: "stageInfo" }); open(path.replace(/\\/g, "/"), { focus: true }); }
          else if (/\.(html?|css|m?js|svg|json)$/i.test(path)) soon();
          return;
        }
        case "mirrorFrame":
          if (m.error) { if (mirror) setMirror(false); $("scCap").textContent = m.error; $("scBlank").style.display = ""; return; }
          if (mirror) shot(m.src, "android", "live · " + m.w + "×" + m.h);
          return;
      }
    },
  };
})();
`;
