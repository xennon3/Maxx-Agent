import { STAGE_CSS, STAGE_HTML, STAGE_JS } from "./stage-page.ts";

// The whole web UI in one string, so the compiled maxx.exe carries it.
export const PAGE = /* html */ `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Maxx</title>
<style>
:root {
  --bg: #f6f6f3; --panel: #ffffff; --ink: #1d1d1b; --mute: #6d6d68; --line: #e3e2dc;
  --accent: #d9480f; --accent-ink: #fff; --ok: #2b8a3e; --bad: #c92a2a; --code: #f0efe9; --user: #fff4e6;
  --radius: 10px; --mono: ui-monospace, "Cascadia Code", Consolas, monospace;
}
@media (prefers-color-scheme: dark) {
  :root { --bg: #141413; --panel: #1d1d1b; --ink: #ecebe6; --mute: #9a9991; --line: #2f2e2b; --code: #252422; --user: #2b2117; }
}
* { box-sizing: border-box; }
html, body { height: 100%; margin: 0; }
body { background: var(--bg); color: var(--ink); font: 14px/1.5 system-ui, "Segoe UI", sans-serif; display: grid; grid-template-columns: 260px 1fr auto; grid-template-rows: 100vh; overflow: hidden; }
#sets { display: flex; gap: 6px; }
.msg code { font-family: var(--mono); font-size: 12.5px; background: var(--code); padding: 1px 4px; border-radius: 4px; }
.msg pre { background: var(--code); padding: 8px 10px; border-radius: 8px; overflow: auto; font: 12px/1.45 var(--mono); }
.tool summary .arg { color: var(--mute); }
aside { border-right: 1px solid var(--line); background: var(--panel); display: flex; flex-direction: column; min-height: 0; }
.brand { padding: 14px 16px; font-weight: 700; font-size: 18px; letter-spacing: .5px; display: flex; gap: 8px; align-items: center; }
.brand b { color: var(--accent); }
.openbox { padding: 0 12px 12px; display: flex; gap: 6px; }
input, select, textarea, button { font: inherit; color: inherit; }
input, select, textarea { background: var(--bg); border: 1px solid var(--line); border-radius: 8px; padding: 7px 9px; min-width: 0; }
button { border: 1px solid var(--line); background: var(--panel); border-radius: 8px; padding: 7px 12px; cursor: pointer; }
button:hover { border-color: var(--mute); }
button.primary { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
button.danger { color: var(--bad); }
.projects { overflow: auto; padding: 0 8px 12px; flex: 1; }
.proj { margin-top: 10px; }
.proj > .name { font-weight: 600; padding: 4px 8px; cursor: pointer; border-radius: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.proj > .name:hover, .sess:hover { background: var(--bg); }
.proj .path { color: var(--mute); font-size: 11px; padding: 0 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sess { padding: 4px 8px 4px 16px; cursor: pointer; border-radius: 6px; font-size: 13px; display: flex; justify-content: space-between; gap: 6px; }
.sess span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sess .when { color: var(--mute); font-size: 11px; flex: none; }
.sess.on { background: var(--user); }
main { display: flex; flex-direction: column; min-width: 0; min-height: 0; }
header { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding: 10px 16px; border-bottom: 1px solid var(--line); background: var(--panel); }
header .where { font-weight: 600; margin-right: auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 40%; }
.chip { border: 1px solid var(--line); border-radius: 999px; padding: 4px 10px; cursor: pointer; user-select: none; font-size: 13px; }
.chip.on { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
#log { flex: 1; overflow: auto; padding: 18px 16px 8px; display: flex; flex-direction: column; gap: 10px; }
.msg { max-width: 860px; white-space: pre-wrap; word-wrap: break-word; }
.msg.user { align-self: flex-end; background: var(--user); padding: 8px 12px; border-radius: var(--radius); }
.msg.note { color: var(--mute); font-size: 13px; }
.msg.err { color: var(--bad); }
.tool { max-width: 860px; border: 1px solid var(--line); border-radius: var(--radius); background: var(--panel); }
.tool summary { padding: 6px 10px; cursor: pointer; font-family: var(--mono); font-size: 12.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tool summary b { color: var(--accent); font-weight: 600; }
.tool pre, .ask pre { margin: 0; padding: 8px 10px; background: var(--code); font: 12px/1.45 var(--mono); white-space: pre-wrap; max-height: 320px; overflow: auto; border-top: 1px solid var(--line); }
.tool.run summary::after { content: " …"; }
.ask { max-width: 860px; border: 2px solid var(--accent); border-radius: var(--radius); background: var(--panel); }
.ask .q { padding: 8px 12px; font-weight: 600; }
.ask .btns { display: flex; gap: 8px; padding: 8px 12px; }
.ask.answered { border-color: var(--line); opacity: .7; }
.add { color: var(--ok); } .del { color: var(--bad); } .dim { color: var(--mute); }
.composer { display: flex; gap: 8px; padding: 12px 16px 16px; border-top: 1px solid var(--line); background: var(--panel); }
.composer textarea { flex: 1; resize: none; height: 64px; }
.empty { margin: auto; text-align: center; color: var(--mute); max-width: 420px; }
.empty h2 { color: var(--ink); margin: 0 0 6px; }
#zoom { position: fixed; inset: 0; background: rgba(0,0,0,.85); display: none; align-items: center; justify-content: center; cursor: zoom-out; z-index: 9; }
#zoom img { max-width: 95vw; max-height: 95vh; }
.status { font-size: 12px; color: var(--mute); }
.activity { display: none; align-items: center; gap: 8px; padding: 6px 16px; border-top: 1px solid var(--line); background: var(--panel); font-size: 13px; min-width: 0; }
.activity.on { display: flex; }
.activity .spin { color: var(--accent); font-family: var(--mono); width: 1ch; flex: none; }
.activity .what { font-weight: 600; flex: none; max-width: 50%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.activity .meta { color: var(--mute); flex: none; font-variant-numeric: tabular-nums; }
.activity .tail { color: var(--mute); font-family: var(--mono); font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.tool.live { border-color: var(--accent); }
.tool.live summary::after { content: ""; }
.tool summary .meta { color: var(--mute); font-family: system-ui, "Segoe UI", sans-serif; font-size: 12px; margin-left: 6px; }
.tool.live pre::after { content: "▍"; color: var(--accent); animation: blink 1s steps(1) infinite; }
.tool.skipped { opacity: .6; }
.think { max-width: 860px; color: var(--mute); }
.think summary { cursor: pointer; font-size: 13px; font-style: italic; }
.think pre { margin: 4px 0 0; padding: 6px 10px; border-left: 2px solid var(--line); font: 12px/1.45 var(--mono); white-space: pre-wrap; max-height: 240px; overflow: auto; }
.plan { display: none; margin: 10px 16px 0; padding: 8px 12px; border: 1px solid var(--line); border-left: 3px solid var(--accent); border-radius: var(--radius); background: var(--panel); font-size: 13px; max-width: 860px; }
.plan.on { display: block; }
.plan .head { display: flex; justify-content: space-between; font-weight: 600; margin-bottom: 2px; }
.plan .head span { color: var(--mute); font-weight: 400; }
.plan .step { display: flex; gap: 8px; padding: 1px 0; }
.plan .step .box { flex: none; width: 1.2em; color: var(--mute); }
.plan .step.done { color: var(--mute); }
.plan .step.done span + span { text-decoration: line-through; }
.plan .step.done .box { color: var(--ok); }
.plan .step.next { font-weight: 600; }
.plan .step.next .box { color: var(--accent); }
.tool.check summary b { color: var(--ok); }
.tool.check.bad summary b { color: var(--bad); }
@keyframes blink { 50% { opacity: 0; } }
@media (max-width: 860px) {
  body { grid-template-columns: 1fr; grid-template-rows: auto 1fr auto; }
  aside { max-height: 34vh; border-right: 0; border-bottom: 1px solid var(--line); }
  header .where { max-width: 100%; }
}
${STAGE_CSS}
</style>
</head>
<body>
<aside>
  <div class="brand"><b>◆</b> Maxx</div>
  <div class="openbox">
    <input id="folder" placeholder="Project folder, e.g. C:\\code\\app" style="flex:1">
    <button id="openBtn">Open</button>
  </div>
  <div class="openbox" id="pickRow" style="display:none"><button id="pickBtn" style="flex:1">Choose folder…</button></div>
  <div class="projects" id="projects"></div>
</aside>
<main>
  <header>
    <div class="where" id="where">No project open</div>
    <select id="model" title="Model"></select>
    <select id="mode" title="Permissions">
      <option value="ask">Ask before acting</option>
      <option value="auto-edit">Auto-approve edits</option>
      <option value="yolo">Never ask</option>
    </select>
    <span id="sets"></span>
    <button id="newBtn" title="Start a new session in this project">New</button>
  </header>
  <div class="plan" id="plan"></div>
  <div id="log"><div class="empty"><h2>Pick a project</h2>Open a folder on the left, or choose one of your recent sessions. Everything runs on this machine against LM Studio.</div></div>
  <div class="activity" id="activity"><span class="spin" id="actSpin">⠋</span><span class="what" id="actWhat"></span><span class="meta" id="actMeta"></span><span class="tail" id="actTail"></span></div>
  <div class="composer">
    <textarea id="input" placeholder="Ask Maxx to build, fix or test something…  (Enter to send, Shift+Enter for a new line)"></textarea>
    <div style="display:flex;flex-direction:column;gap:6px">
      <button class="primary" id="sendBtn">Send</button>
      <button class="danger" id="stopBtn" disabled>Stop</button>
    </div>
  </div>
</main>
${STAGE_HTML}
<div id="zoom"><img id="zoomImg" alt=""></div>
<script>
const $ = (id) => document.getElementById(id);
const token = new URLSearchParams(location.search).get("t");
let ws, state = null, busy = false, live = null, streaming = null;
// While the model streams: tool cards being written (by call index, not run yet), the thinking block, the status bar.
let writing = [], thinkCard = null, act = null;

function connect() {
  ws = new WebSocket((location.protocol === "https:" ? "wss://" : "ws://") + location.host + "/ws?t=" + token);
  ws.onopen = () => ws.send(JSON.stringify({ type: "hello" }));
  ws.onmessage = (e) => on(JSON.parse(e.data));
  ws.onclose = () => { note("Disconnected from Maxx. Is it still running? Retrying…", "err"); setTimeout(connect, 2000); };
}
const send = (m) => ws.send(JSON.stringify(m));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// Diffs and previews come with terminal colors; turn them into spans.
function ansi(s) {
  let out = "", open = false;
  for (const part of String(s).split(/(\\x1b\\[[0-9;]*m)/)) {
    const m = part.match(/^\\x1b\\[([0-9;]*)m$/);
    if (!m) { out += esc(part); continue; }
    if (open) out += "</span>", open = false;
    const c = m[1];
    const cls = /(^|;)32/.test(c) ? "add" : /(^|;)31/.test(c) ? "del" : /(^|;)(2|90)/.test(c) ? "dim" : "";
    if (cls) out += '<span class="' + cls + '">', open = true;
  }
  return out + (open ? "</span>" : "");
}
const ago = (iso) => { const s = (Date.now() - Date.parse(iso)) / 1000; return s < 60 ? "now" : s < 3600 ? Math.floor(s / 60) + "m" : s < 86400 ? Math.floor(s / 3600) + "h" : Math.floor(s / 86400) + "d"; };

function clearEmpty() { const e = document.querySelector("#log .empty"); if (e) e.remove(); }
function add(el) { clearEmpty(); const log = $("log"); const stick = log.scrollHeight - log.scrollTop - log.clientHeight < 80; log.appendChild(el); if (stick) log.scrollTop = log.scrollHeight; return el; }
function div(cls, text) { const d = document.createElement("div"); d.className = cls; if (text !== undefined) d.textContent = text; return d; }
function note(text, cls = "note") { add(div("msg " + cls, text)); }
// Claude Code style labels: "Write app/build.gradle.kts", "Tap Calculate".
const VERBS = { read_file: "Read", write_file: "Write", edit_file: "Edit", list_files: "List", grep: "Search", bash: "Run",
  android_run: "Build & run on phone", android_screen: "Look at phone", android_tap: "Tap", android_type: "Type", android_swipe: "Swipe",
  android_key: "Press", android_logcat: "Read phone log", android_devices: "List devices", android_connect: "Connect phone",
  desktop_screenshot: "Look at desktop", desktop_click: "Click", desktop_type: "Type", desktop_key: "Press", desktop_scroll: "Scroll", desktop_open: "Open",
  preview: "Preview", start_server: "Start", plan: "Plan", remember: "Remember", check: "Check" };
function label(name, args) {
  let a = {}; try { a = JSON.parse(args || "{}"); } catch {}
  if (name === "plan") return ["Plan", a.done ? "step " + a.done + " done" : "write the steps"];
  if (name === "remember") return ["Remember", String(a.note ?? "")];
  const main = a.path ?? a.url ?? a.command ?? a.pattern ?? a.keys ?? a.key ?? a.target ?? a.direction ?? (a.text !== undefined ? JSON.stringify(a.text) : undefined) ??
    (a.element !== undefined ? "element " + a.element : a.x !== undefined ? a.x + "," + a.y : a.crashes ? "crashes" : a.project_dir ?? a.apk ?? "");
  return [VERBS[name] || name, String(main)];
}
function md(text) {
  return esc(text)
    .replace(/\`\`\`[\\w-]*\\n([\\s\\S]*?)\`\`\`/g, (_, c) => "<pre>" + c + "</pre>")
    .replace(/\`([^\`\\n]+)\`/g, "<code>$1</code>")
    .replace(/\\*\\*([^*\\n]+)\\*\\*/g, "<b>$1</b>");
}
// The pinned checklist, Claude Code style: what is done, what is next.
function drawPlan(steps) {
  const box = $("plan");
  steps = steps || [];
  box.classList.toggle("on", steps.length > 0);
  if (!steps.length) return box.innerHTML = "";
  const done = steps.filter((x) => x.done).length, next = steps.findIndex((x) => !x.done);
  box.innerHTML = '<div class="head">Plan <span>' + done + " of " + steps.length + " done</span></div>" +
    steps.map((x, i) => '<div class="step' + (x.done ? " done" : i === next ? " next" : "") + '"><span class="box">' + (x.done ? "✓" : i === next ? "▸" : "○") + "</span><span>" + esc(x.text) + "</span></div>").join("");
}
function toolCard(name, args, result) {
  const d = document.createElement("details");
  d.className = "tool" + (result === undefined ? " run" : "");
  const [verb, arg] = label(name, args);
  d.innerHTML = "<summary><b>" + esc(verb) + "</b> <span class=arg>" + esc(arg.slice(0, 160)) + "</span></summary><pre></pre>";
  d.title = name + " " + (args || "");
  if (result !== undefined) d.querySelector("pre").innerHTML = ansi(result);
  return add(d);
}

// The status bar under the transcript, Claude Code style: what, how much, how long.
const SPIN = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
let spinFrame = 0;
const clock = (ms) => { const s = Math.floor(ms / 1000); return s < 60 ? s + "s" : Math.floor(s / 60) + "m" + String(s % 60).padStart(2, "0") + "s"; };
function activity(a) { act = a && Object.assign({ at: Date.now(), elapsedMs: 0 }, a); drawActivity(); }
function drawActivity() {
  const bar = $("activity");
  bar.classList.toggle("on", !!(busy && act));
  if (!busy || !act) return;
  const ms = act.elapsedMs + Date.now() - act.at;
  const meta = [];
  if (act.lines > 1) meta.push(act.lines + " lines");
  if (act.tokens && act.phase !== "waiting") { meta.push(act.tokens + " tokens"); if (act.generatingMs >= 2000) meta.push((act.tokens / (act.generatingMs / 1000)).toFixed(1) + " tok/s"); }
  meta.push(clock(ms));
  $("actSpin").textContent = SPIN[spinFrame++ % SPIN.length];
  $("actWhat").textContent = act.title || "Working";
  $("actMeta").textContent = meta.join(" · ");
  $("actTail").textContent = act.tail || "";
}
setInterval(drawActivity, 100);

function progress(m) {
  if (m.phase !== "thinking" && thinkCard) {
    thinkCard.querySelector("summary").textContent = "Thought for " + clock(thinkCard.ms);
    thinkCard = null;
  }
  if (m.phase === "waiting") abandonWriting();
  if (m.phase === "done") return activity({ title: "Working" });
  const tail = (m.preview || "").split("\\n").filter((l) => l.trim()).pop() || "";
  activity({ phase: m.phase, title: m.title, tokens: m.tokens, elapsedMs: m.elapsedMs, generatingMs: m.generatingMs || 0, lines: m.lines, tail: m.phase === "tool" ? "" : tail.trim().slice(-160) });
  if (m.phase === "thinking") {
    if (!thinkCard) { streaming = null; thinkCard = add(document.createElement("details")); thinkCard.className = "think"; thinkCard.innerHTML = "<summary></summary><pre></pre>"; }
    thinkCard.ms = m.elapsedMs;
    thinkCard.querySelector("summary").textContent = "Thinking… " + m.tokens + " tokens";
    const pre = thinkCard.querySelector("pre"); pre.textContent = m.preview; pre.scrollTop = pre.scrollHeight;
  }
  if (m.phase === "tool" && m.tool) {
    let d = writing[m.tool.index];
    if (!d) {
      streaming = null;
      d = writing[m.tool.index] = add(document.createElement("details"));
      d.className = "tool run live"; d.open = d.auto = true;
      d.innerHTML = "<summary><b></b> <span class=arg></span><span class=meta></span></summary><pre></pre>";
    }
    const [verb, ...rest] = m.title.split(" ");
    d.tool = m.tool.name;
    d.querySelector("b").textContent = verb;
    d.querySelector(".arg").textContent = rest.join(" ").slice(0, 160);
    d.querySelector(".meta").textContent = (m.lines > 1 ? m.lines + " lines · " : "") + m.tokens + " tokens · " + clock(m.elapsedMs);
    const pre = d.querySelector("pre"); const stick = pre.scrollHeight - pre.scrollTop - pre.clientHeight < 40;
    pre.textContent = m.preview; if (stick) pre.scrollTop = pre.scrollHeight;
    const log = $("log"); if (log.scrollHeight - log.scrollTop - log.clientHeight < 200) log.scrollTop = log.scrollHeight;
  }
}
// Calls that were written but never ran (bad arguments, or the turn stopped).
function abandonWriting() {
  for (const d of writing) if (d) { d.classList.remove("run", "live"); d.classList.add("skipped"); d.querySelector(".meta").textContent = "not run"; }
  writing = [];
}

function on(m) {
  stage.on(m);
  switch (m.type) {
    case "state": return render(m);
    case "progress": return progress(m);
    case "token":
      if (!streaming) streaming = add(div("msg")), streaming.raw = "";
      streaming.raw += m.text;
      streaming.innerHTML = md(streaming.raw);
      return;
    case "toolStart": {
      streaming = null;
      const [verb, arg] = label(m.name, m.args);
      activity({ title: verb + " " + arg.slice(0, 80) });
      // The card that showed the call being written becomes the card that runs it.
      let i = writing.findIndex((d) => d && d.tool === m.name);
      if (i < 0) i = writing.findIndex(Boolean);
      if (i < 0) { live = toolCard(m.name, m.args); return; }
      live = writing[i]; writing[i] = undefined;
      if (!writing.some(Boolean)) writing = [];
      live.classList.remove("live");
      live.querySelector("b").textContent = verb;
      live.querySelector(".arg").textContent = arg.slice(0, 160);
      live.title = m.name + " " + (m.args || "");
      return;
    }
    case "toolEnd":
      if (live) {
        live.classList.remove("run");
        if (m.name === "check") live.classList.add("check"), live.classList.toggle("bad", /^error: |^exit code: (?!0\\b)/m.test(m.result));
        const meta = live.querySelector(".meta"); if (meta) meta.textContent = "";
        live.querySelector("pre").innerHTML = ansi(m.result);
        if (live.auto) live.open = false;
        live = null;
      }
      activity({ title: "Working" });
      return;
    case "note": return note(m.text);
    case "plan": return drawPlan(m.steps);
    case "image": return stage.shot(m.images[m.images.length - 1], m.tool);
    case "ask": return askCard(m);
    case "busy":
      busy = m.busy; $("stopBtn").disabled = !busy; $("sendBtn").disabled = busy;
      if (!busy) { streaming = null; thinkCard = null; abandonWriting(); }
      activity(busy ? { title: "Starting" } : null);
      return;
    case "done": streaming = null; return;
    case "error": return note(m.text, "msg err");
  }
}

function askCard(m) {
  streaming = null;
  activity({ title: "Waiting for your OK" });
  const d = add(div("ask"));
  d.innerHTML = '<div class="q">' + esc(m.question) + "</div>" + (m.preview ? "<pre>" + ansi(m.preview) + "</pre>" : "") +
    '<div class="btns"><button class="primary" data-a="yes">Allow</button><button data-a="always">Always allow</button><button class="danger" data-a="no">Deny</button></div>';
  d.querySelectorAll("button").forEach((b) => b.onclick = () => {
    send({ type: "answer", id: m.id, answer: b.dataset.a });
    d.classList.add("answered");
    d.querySelector(".btns").textContent = b.dataset.a === "no" ? "Denied" : b.dataset.a === "always" ? "Always allowed" : "Allowed";
  });
  if (document.hidden && "Notification" in window && Notification.permission === "granted") new Notification("Maxx needs your OK", { body: m.question });
}

${STAGE_JS}

function render(s) {
  state = s;
  const cur = s.current;
  $("pickRow").style.display = s.platform === "win32" ? "flex" : "none";
  // Sidebar
  const p = $("projects"); p.innerHTML = "";
  if (!s.projects.length) p.appendChild(div("status", "No sessions yet. Open a folder to start."));
  for (const proj of s.projects) {
    const box = div("proj");
    const name = proj.cwd.split(/[\\\\/]/).filter(Boolean).pop() || proj.cwd;
    const n = div("name", name); n.title = "Open " + proj.cwd; n.onclick = () => send({ type: "open", cwd: proj.cwd });
    box.append(n, div("path", proj.cwd));
    for (const ss of proj.sessions) {
      const r = div("sess" + (cur && cur.session === ss.id ? " on" : ""));
      r.innerHTML = "<span>" + esc(ss.title) + "</span><span class=when>" + ago(ss.updated) + "</span>";
      r.title = ss.turns + " turns" + (ss.toolsets.length ? " · " + ss.toolsets.join(", ") : "");
      r.onclick = () => send({ type: "open", cwd: proj.cwd, session: ss.id });
      box.appendChild(r);
    }
    p.appendChild(box);
  }
  // Header
  const sel = $("model"); sel.innerHTML = "";
  const models = s.models.length ? s.models : cur ? [cur.model] : [];
  if (!models.length) sel.innerHTML = "<option>No model: start LM Studio's server</option>";
  for (const id of models) { const o = document.createElement("option"); o.value = o.textContent = id; if (cur && cur.model === id) o.selected = true; sel.appendChild(o); }
  $("where").textContent = cur ? cur.cwd : "No project open";
  $("where").title = cur ? cur.cwd : "";
  if (cur) $("mode").value = cur.mode;
  const sets = $("sets"); sets.innerHTML = "";
  for (const t of s.toolsets) {
    const c = div("chip" + (cur && cur.toolsets.includes(t.name) ? " on" : ""), t.name === "android" ? "📱 Android" : t.name === "desktop" ? "🖥 Desktop" : t.name);
    c.title = t.about;
    c.onclick = () => { if (!cur) return; const on = cur.toolsets.includes(t.name) ? cur.toolsets.filter((x) => x !== t.name) : [...cur.toolsets, t.name]; send({ type: "settings", toolsets: on }); };
    sets.appendChild(c);
  }
  drawPlan(cur && cur.plan);
  busy = !!(cur && cur.busy);
  $("stopBtn").disabled = !busy; $("sendBtn").disabled = busy;
  // Transcript, redrawn from the agent's history whenever a turn ends or a session opens
  if (!busy) {
    const log = $("log"); log.innerHTML = ""; live = null; streaming = null; writing = []; thinkCard = null;
    if (!cur) { log.innerHTML = '<div class="empty"><h2>Pick a project</h2>Open a folder on the left, or choose one of your recent sessions.</div>'; return; }
    if (!cur.history.length) log.innerHTML = '<div class="empty"><h2>' + esc(cur.cwd.split(/[\\\\/]/).filter(Boolean).pop() || "") + '</h2>Ask for something: "make a tip calculator app and test it on my phone", "why does the build fail?"</div>';
    const results = cur.history.filter((h) => h.role === "tool").map((h) => h.text);
    let ri = 0;
    for (const h of cur.history) {
      if (h.role === "user") add(div("msg user", h.text));
      else if (h.role === "note") note(h.text.split("\\n")[0]);
      else if (h.role === "assistant") {
        if (h.text) add(div("msg")).innerHTML = md(h.text);
        for (const t of h.tools || []) toolCard(t.name, t.args, results[ri++] ?? "");
      }
    }
    $("log").scrollTop = $("log").scrollHeight;
  }
}

function submit() {
  const text = $("input").value.trim();
  if (!text || busy) return;
  if (!state || !state.current) return note("Open a project folder first.", "msg err");
  add(div("msg user", text));
  $("input").value = "";
  send({ type: "send", text });
  if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
}

$("sendBtn").onclick = submit;
$("input").onkeydown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } };
$("stopBtn").onclick = () => send({ type: "stop" });
$("openBtn").onclick = () => { const v = $("folder").value.trim(); if (v) send({ type: "open", cwd: v }); };
$("folder").onkeydown = (e) => { if (e.key === "Enter") $("openBtn").onclick(); };
$("pickBtn").onclick = () => send({ type: "pick" });
$("newBtn").onclick = () => send({ type: "new" });
$("model").onchange = (e) => state && state.current && send({ type: "settings", model: e.target.value });
$("mode").onchange = (e) => send({ type: "settings", mode: e.target.value });
$("zoom").onclick = () => $("zoom").style.display = "none";
connect();
</script>
</body>
</html>`;
