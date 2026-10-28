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
.sess .x { display: none; border: 0; background: none; padding: 0 4px; color: var(--mute); line-height: 1; flex: none; }
.sess:hover .x { display: inline; }
.sess:hover .when { display: none; }
.sess .x:hover { color: var(--bad); }
.sess.confirm { background: var(--bg); cursor: default; align-items: center; }
.sess.confirm button { padding: 2px 8px; font-size: 12px; }
#toast { position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%); background: var(--ink); color: var(--bg); border-radius: 999px; padding: 8px 10px 8px 16px; display: none; gap: 12px; align-items: center; z-index: 10; box-shadow: 0 6px 24px rgba(0,0,0,.25); max-width: calc(100vw - 32px); }
#toast.on { display: flex; }
#toast span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#toast button { background: none; border: 0; color: var(--accent); font-weight: 700; padding: 2px 8px; }
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
.composer { display: flex; flex-direction: column; gap: 8px; padding: 12px 16px 16px; border-top: 1px solid var(--line); background: var(--panel); }
.composer .row { display: flex; gap: 8px; }
.composer textarea { flex: 1; resize: none; height: 64px; }
#clipBtn { padding: 7px 10px; font-size: 16px; line-height: 1; }
.files { display: flex; flex-wrap: wrap; gap: 6px; }
.files:empty { display: none; }
.file { display: flex; align-items: center; gap: 6px; border: 1px solid var(--line); border-radius: 8px; padding: 3px 4px 3px 6px; font-size: 12.5px; background: var(--bg); max-width: 100%; }
.file img { width: 28px; height: 28px; object-fit: cover; border-radius: 4px; }
.file .nm { max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.file .sz { color: var(--mute); }
.file .how { border: 1px solid var(--line); border-radius: 999px; padding: 0 8px; font-size: 11.5px; cursor: pointer; white-space: nowrap; }
.file .how.fixed { cursor: default; opacity: .8; }
.file .rm { border: 0; background: none; padding: 0 4px; color: var(--mute); }
.file.up { opacity: .6; } .file.bad { border-color: var(--bad); color: var(--bad); }
.msg .att { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
.msg .att span { font-size: 12px; border: 1px solid var(--line); border-radius: 6px; padding: 0 6px; background: var(--panel); }
#drop { position: fixed; inset: 8px; border: 3px dashed var(--accent); border-radius: 16px; background: rgba(217,72,15,.08); display: none; align-items: center; justify-content: center; font-size: 20px; font-weight: 600; color: var(--accent); z-index: 8; pointer-events: none; }
#drop.on { display: flex; }
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
  <div id="log"><div class="empty"><h2>Pick a project</h2>Open a folder on the left, or choose one of your recent sessions. Everything runs on this machine against LM Studio.</div></div>
  <div class="activity" id="activity"><span class="spin" id="actSpin">⠋</span><span class="what" id="actWhat"></span><span class="meta" id="actMeta"></span><span class="tail" id="actTail"></span></div>
  <div class="composer">
    <div class="files" id="files"></div>
    <div class="row">
      <button id="clipBtn" title="Attach files: images, code, anything. You can also drop or paste them.">📎</button>
      <input type="file" id="fileInput" multiple hidden>
      <textarea id="input" placeholder="Ask Maxx to build, fix or test something…  (Enter to send, Shift+Enter for a new line; drop or paste files to attach)"></textarea>
      <div style="display:flex;flex-direction:column;gap:6px">
        <button class="primary" id="sendBtn">Send</button>
        <button class="danger" id="stopBtn" disabled>Stop</button>
      </div>
    </div>
  </div>
</main>
${STAGE_HTML}
<div id="zoom"><img id="zoomImg" alt=""></div>
<div id="drop">Drop files to attach them to your message</div>
<div id="toast"><span id="toastText"></span><button id="toastBtn">Undo</button></div>
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
  preview: "Preview", start_server: "Start" };
function label(name, args) {
  let a = {}; try { a = JSON.parse(args || "{}"); } catch {}
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
        const meta = live.querySelector(".meta"); if (meta) meta.textContent = "";
        live.querySelector("pre").innerHTML = ansi(m.result);
        if (live.auto) live.open = false;
        live = null;
      }
      activity({ title: "Working" });
      return;
    case "note": return note(m.text);
    case "image": return stage.shot(m.images[m.images.length - 1], m.tool);
    case "ask": return askCard(m);
    case "busy":
      busy = m.busy; $("stopBtn").disabled = !busy; $("sendBtn").disabled = busy;
      if (!busy) { streaming = null; thinkCard = null; abandonWriting(); }
      activity(busy ? { title: "Starting" } : null);
      return;
    case "done": streaming = null; return;
    case "error": return note(m.text, "msg err");
    case "deleted":
      return toast("Deleted “" + (m.title || "session") + "”", "Undo", () => send({ type: "undelete", cwd: m.cwd, session: m.session, reopen: m.wasOpen }));
  }
}

let toastTimer = 0;
function toast(text, action, fn) {
  $("toastText").textContent = text;
  $("toastBtn").textContent = action;
  $("toastBtn").onclick = () => { $("toast").classList.remove("on"); fn(); };
  $("toast").classList.add("on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("toast").classList.remove("on"), 10000);
}

// Deleting asks once, right in the row, then offers Undo for ten seconds.
function confirmDelete(row, cwd, ss) {
  row.className = "sess confirm";
  row.onclick = (e) => e.stopPropagation();
  row.innerHTML = "<span>Delete “" + esc(ss.title) + "”?</span>";
  const yes = document.createElement("button"); yes.className = "danger"; yes.textContent = "Delete";
  const no = document.createElement("button"); no.textContent = "Keep";
  const cancel = () => state && render(state);
  yes.onclick = () => send({ type: "delete", cwd, session: ss.id, title: ss.title });
  no.onclick = cancel;
  const box = document.createElement("span"); box.style.cssText = "display:flex;gap:4px;flex:none"; box.append(yes, no);
  row.appendChild(box);
  yes.focus();
  row.onkeydown = (e) => { if (e.key === "Escape") cancel(); };
}

// Attachments: dropped, pasted or picked files, uploaded right away and sent with the message.
// Images are shrunk in the browser first (it can decode webp, gif, bmp...) and arrive as JPEG.
let files = [];
const TEXTISH = /\\.(txt|md|markdown|json|jsonc|ya?ml|toml|ini|cfg|conf|env|csv|tsv|log|xml|html?|css|scss|less|svg|js|mjs|cjs|jsx|ts|tsx|py|rb|go|rs|java|kt|kts|gradle|swift|c|h|cc|cpp|hpp|cs|php|lua|sh|bash|zsh|ps1|bat|cmd|sql|vue|svelte|dart|r|pl|ex|exs|hs|ml|clj|scala|groovy|properties|lock|gitignore|dockerfile|makefile)$/i;
function kindOf(f) {
  if (/^image\\//.test(f.type) && !/svg/.test(f.type)) return "image";
  if (/^text\\/|json|xml|javascript|typescript|yaml|toml|x-sh/.test(f.type) || TEXTISH.test(f.name) || /^(Dockerfile|Makefile|README|LICENSE)$/i.test(f.name)) return "text";
  return "other";
}
const fsize = (n) => n < 1024 ? n + " B" : n < 1048576 ? (n / 1024).toFixed(0) + " KB" : (n / 1048576).toFixed(1) + " MB";
async function toJpeg(f, side) {
  try {
    const bmp = await createImageBitmap(f);
    const k = Math.min(1, side / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas"); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    const g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.drawImage(bmp, 0, 0, c.width, c.height);
    return await new Promise((res) => c.toBlob(res, "image/jpeg", 0.88));
  } catch { return null; }
}
function attach(list) {
  if (!state || !state.current) return note("Open a project folder first, then attach files.", "msg err");
  for (const f of list) {
    if (f.size > state.maxUpload) { note(f.name + " is too big to attach (" + fsize(f.size) + "; the limit is " + fsize(state.maxUpload) + ").", "msg err"); continue; }
    // Pasted screenshots have no useful name.
    const name = f.name && f.name !== "image.png" ? f.name : "pasted-" + new Date().toTimeString().slice(0, 8).replace(/:/g, "") + ".png";
    const it = { raw: f, name, size: f.size, kind: kindOf(f) };
    it.mode = it.kind === "other" ? "save" : "attach";
    files.push(it);
    it.p = (async () => {
      if (it.kind === "image") {
        it.small = await toJpeg(f, state.imageSide || 1024);
        if (it.small) it.thumb = URL.createObjectURL(it.small);
        else it.kind = "other", it.mode = "save";
      }
      await upload(it);
    })();
  }
  drawFiles();
}
// Images go to the model as a small JPEG; saved into the project, they keep the original file.
async function upload(it) {
  if (it.id) send({ type: "discard", ids: [it.id] });
  const small = it.kind === "image" && it.mode === "attach" && it.small;
  const body = small || it.raw, name = small ? it.name.replace(/\\.[^.]+$/, "") + ".jpg" : it.name;
  it.id = null; it.status = "up"; it.size = body.size; drawFiles();
  try {
    const r = await fetch("/upload?t=" + token + "&name=" + encodeURIComponent(name), { method: "POST", body, headers: { "content-type": body.type || "application/octet-stream" } });
    const j = await r.json();
    if (j.error) throw new Error(j.error);
    it.id = j.id; it.status = "ok";
  } catch (e) { it.status = "bad"; it.err = e.message; }
  drawFiles();
}
const HOW = { attach: { image: "👁 Show to Maxx", text: "📄 Add to context" }, save: "💾 Save to project" };
function drawFiles() {
  const box = $("files"); box.innerHTML = "";
  for (const it of files) {
    const d = div("file" + (it.status === "up" ? " up" : it.status === "bad" ? " bad" : ""));
    d.title = it.status === "bad" ? "Upload failed: " + it.err : it.name;
    d.innerHTML = (it.thumb ? '<img alt="" src="' + it.thumb + '">' : "<span>" + (it.kind === "text" ? "📄" : it.kind === "image" ? "🖼" : "📦") + "</span>") +
      '<span class="nm">' + esc(it.name) + '</span><span class="sz">' + fsize(it.size) + "</span>";
    const how = div("how" + (it.kind === "other" ? " fixed" : ""), it.mode === "save" ? HOW.save : HOW.attach[it.kind]);
    how.title = it.kind === "other" ? "Maxx can't read this kind of file, so it is copied into the project folder" : "Click to switch between giving it to Maxx and saving it into the project folder";
    if (it.kind !== "other") how.onclick = () => {
      it.mode = it.mode === "save" ? "attach" : "save";
      if (it.kind === "image") it.p = it.p.then(() => upload(it));
      drawFiles();
    };
    const rm = document.createElement("button"); rm.className = "rm"; rm.textContent = "×"; rm.title = "Remove";
    rm.onclick = () => { files = files.filter((x) => x !== it); it.p.then(() => it.id && send({ type: "discard", ids: [it.id] })); drawFiles(); };
    d.append(how, rm);
    box.appendChild(d);
  }
}
function attachedNames(names) {
  if (!names || !names.length) return null;
  const a = div("att");
  for (const n of names) { const s = document.createElement("span"); s.textContent = "📎 " + n; a.appendChild(s); }
  return a;
}
function userMsg(text, names) {
  const d = add(div("msg user", text));
  const a = attachedNames(names); if (a) d.appendChild(a);
  return d;
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
      const x = document.createElement("button"); x.className = "x"; x.textContent = "×"; x.title = "Delete this session";
      x.onclick = (e) => { e.stopPropagation(); confirmDelete(r, proj.cwd, ss); };
      r.appendChild(x);
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
      if (h.role === "user") userMsg(h.text, h.files);
      else if (h.role === "assistant") {
        if (h.text) add(div("msg")).innerHTML = md(h.text);
        for (const t of h.tools || []) toolCard(t.name, t.args, results[ri++] ?? "");
      }
    }
    $("log").scrollTop = $("log").scrollHeight;
  }
}

async function submit() {
  const text = $("input").value.trim();
  if ((!text && !files.length) || busy) return;
  if (!state || !state.current) return note("Open a project folder first.", "msg err");
  const sending = files;
  $("sendBtn").disabled = true;
  await Promise.all(sending.map((f) => f.p));
  $("sendBtn").disabled = busy;
  const failed = sending.filter((f) => f.status !== "ok");
  if (failed.length) return note("Could not upload " + failed.map((f) => f.name).join(", ") + ". Remove it or attach it again.", "msg err");
  files = []; drawFiles();
  userMsg(text, sending.map((f) => f.name));
  $("input").value = "";
  send({ type: "send", text, files: sending.map((f) => ({ id: f.id, mode: f.mode })) });
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
$("clipBtn").onclick = () => $("fileInput").click();
$("fileInput").onchange = (e) => { attach([...e.target.files]); e.target.value = ""; };
$("input").onpaste = (e) => { const fs = [...(e.clipboardData && e.clipboardData.files || [])]; if (fs.length) { e.preventDefault(); attach(fs); } };
let dragDepth = 0;
const hasFiles = (e) => e.dataTransfer && [...e.dataTransfer.types].includes("Files");
addEventListener("dragenter", (e) => { if (hasFiles(e)) { dragDepth++; $("drop").classList.add("on"); } });
addEventListener("dragleave", () => { if (--dragDepth <= 0) dragDepth = 0, $("drop").classList.remove("on"); });
addEventListener("dragover", (e) => { if (hasFiles(e)) e.preventDefault(); });
addEventListener("drop", (e) => { if (!hasFiles(e)) return; e.preventDefault(); dragDepth = 0; $("drop").classList.remove("on"); attach([...e.dataTransfer.files]); });
connect();
</script>
</body>
</html>`;
