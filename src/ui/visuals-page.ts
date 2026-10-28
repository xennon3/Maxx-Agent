// Visuals in the transcript: fenced ```chart, ```mermaid and ```html blocks in
// the model's answers are drawn right in the message, like artifacts. page.ts
// splices this in. The script is a raw string, so it must not use backticks
// (a fence is written \x60\x60\x60) or a literal closing script tag.
//
// Safety: Mermaid draws with securityLevel "strict", and chart configs are
// parsed as JSON, never run. Anything that is code (html blocks, and chart
// configs that are JavaScript rather than JSON) runs in an iframe sandboxed
// without allow-same-origin, under a CSP that allows no network at all, so it
// can't reach this page, its token, or the internet.

export const VIS_CSS = `
.msg .vis { white-space: normal; margin: 8px 0; border: 1px solid var(--line); border-radius: var(--radius); background: var(--panel); overflow: hidden; }
.vis .vbar { display: flex; align-items: center; gap: 4px; padding: 4px 6px 4px 10px; border-bottom: 1px solid var(--line); font-size: 12px; color: var(--mute); }
.vis .vbar .k { margin-right: auto; font-weight: 600; }
.vis .vbar button { padding: 1px 7px; font-size: 12px; border-color: transparent; background: none; color: var(--mute); }
.vis .vbar button:hover { border-color: var(--line); color: var(--ink); }
.vis .body { padding: 10px; overflow: auto; }
.vis .body.chart { height: 340px; position: relative; }
.vis .body.mermaid { text-align: center; }
.vis .body.mermaid svg { max-width: 100%; max-height: 560px; height: auto; }
#visBox .vis .body.mermaid svg { max-height: none; }
.vis .body.html { padding: 0; }
.vis iframe { border: 0; width: 100%; height: 360px; display: block; background: #fff; }
.vis pre.src { margin: 0; border-radius: 0; max-height: 300px; border-top: 1px solid var(--line); }
.vis.pending .body { color: var(--mute); font-style: italic; padding: 14px; }
.vis.pending .body::after { content: "▍"; color: var(--accent); animation: blink 1s steps(1) infinite; font-style: normal; }
.vis.bad { border-color: var(--bad); }
.vis.bad .err { color: var(--bad); padding: 8px 10px; font: 12px/1.45 var(--mono); white-space: pre-wrap; }
.vis.bad .err button { margin-left: 8px; font-family: system-ui, "Segoe UI", sans-serif; }
.chatnav { padding: 0 12px 4px; display: flex; flex-direction: column; gap: 2px; }
.chatnav .go { text-align: left; display: flex; gap: 8px; align-items: center; font-weight: 600; }
.chatnav .go.on { background: var(--user); border-color: var(--accent); }
.chatnav .sess { padding-left: 12px; }
.chathead { font-size: 11px; text-transform: uppercase; letter-spacing: .6px; color: var(--mute); padding: 8px 20px 0; }
body.chat .projonly { display: none !important; }
#visBox { flex: 1; min-height: 0; overflow: auto; border-top: 1px solid var(--line); background: var(--bg); padding: 12px; }
#visBox .vis { margin: 0; height: 100%; display: flex; flex-direction: column; }
#visBox .vis .body { flex: 1; }
#visBox .vis .body.chart { height: auto; min-height: 300px; }
#visBox .vis iframe { height: 100%; min-height: 400px; }
`;

export const VIS_PANE = `
    <div class="spane" id="pane-visual">
      <div class="stabs"><span class="t">Visual</span><button id="stageHide4" title="Hide panel">✕</button></div>
      <div id="visBox"><div class="status">Charts, diagrams and widgets from the chat open here, big, when you click ⤢.</div></div>
    </div>`;

export const VIS_RAIL = `<button data-tab="visual" title="Visual">✦<span class="dot" id="dotVisual"></span></button>`;

export const VIS_JS = String.raw`
const visuals = (() => {
  const FENCE = /\x60\x60\x60[ \t]*([\w-]*)[^\n]*\n([\s\S]*?)(\n\x60\x60\x60|$)/g;
  const KINDS = { chart: "chart", chartjs: "chart", mermaid: "mermaid", html: "html", svg: "html" };
  const NAMES = { chart: "Chart", mermaid: "Diagram", html: "Interactive" };
  const libs = {};
  // Visuals finish drawing after the transcript is laid out and make it taller.
  // If the reader was at the bottom, keep them there; if they scrolled up, leave them be.
  let atEnd = true;
  $("log").addEventListener("scroll", () => { const l = $("log"); atEnd = l.scrollHeight - l.scrollTop - l.clientHeight < 80; });
  const follow = () => { if (atEnd) $("log").scrollTop = $("log").scrollHeight; };
  const frames = new Set(); // { frame, card, kind } for each html iframe
  let mermaidQueue = Promise.resolve(), seq = 0;
  const dark = () => matchMedia("(prefers-color-scheme: dark)").matches;
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

  function lib(name) {
    if (!libs[name]) libs[name] = new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "/vendor/" + name + ".js?t=" + token;
      s.onload = () => res(name === "chart" ? window.Chart : window.mermaid);
      s.onerror = () => { libs[name] = null; rej(new Error("could not load " + name)); };
      document.head.appendChild(s);
    });
    return libs[name];
  }
  // Kept so a chart in an iframe can have Chart.js inline (the iframe can't fetch).
  let chartText = null;
  async function chartSource() {
    if (chartText === null) chartText = await fetch("/vendor/chart.js?t=" + token).then((r) => r.text()).catch(() => "");
    return chartText;
  }

  // The message split into text and visual blocks. Code blocks in other languages stay text.
  function split(raw, html) {
    const out = [];
    let last = 0, text = "";
    FENCE.lastIndex = 0;
    for (let m; (m = FENCE.exec(raw)); ) {
      const kind = KINDS[m[1].toLowerCase()];
      if (!kind || (kind === "html" && !html)) continue;
      text += raw.slice(last, m.index);
      if (text) out.push({ text }), text = "";
      out.push({ kind, lang: m[1].toLowerCase(), src: m[2], closed: !!m[3] });
      last = m.index + m[0].length;
      if (!m[0].length) break;
    }
    text += raw.slice(last);
    if (text) out.push({ text });
    return out;
  }

  // Draws raw into el, keeping blocks that did not change, so a chart drawn
  // mid-answer is not redrawn on every token. html: run html blocks (chat only).
  function paint(el, raw, html) {
    const parts = split(raw, html);
    el.classList.toggle("rich", parts.some((p) => p.kind));
    if (!parts.some((p) => p.kind)) { el.innerHTML = md(raw); el.parts = null; return; }
    if (!el.parts) el.innerHTML = "", el.parts = [];
    parts.forEach((p, i) => {
      const key = p.kind ? p.kind + "|" + p.closed + "|" + (p.closed ? p.src : "") : "t|" + p.text;
      const old = el.children[i];
      if (old && el.parts[i] === key && !(p.kind && !p.closed)) return;
      let node;
      // Blank lines next to a visual would show as gaps (messages keep their line breaks).
      if (!p.kind) { node = document.createElement("span"); node.innerHTML = md(trim(p.text, i > 0, i < parts.length - 1)); }
      else if (!p.closed) node = old && old.classList.contains("pending") ? old : pending(p);
      else node = card(p.kind, p.src);
      if (!p.closed && p.kind) node.querySelector(".body").textContent = "Drawing " + NAMES[p.kind].toLowerCase() + "… " + p.src.split("\n").length + " lines";
      if (old !== node) old ? el.replaceChild(node, old) : el.appendChild(node);
      el.parts[i] = key;
    });
    while (el.children.length > parts.length) el.lastChild.remove();
    el.parts.length = parts.length;
  }
  function trim(t, start, end) {
    if (start) t = t.replace(/^\s*\n/, "");
    if (end) t = t.replace(/\n\s*$/, "");
    return t;
  }
  function pending(p) { const d = div("vis pending"); d.innerHTML = '<div class="vbar"><span class="k"></span></div><div class="body"></div>'; d.querySelector(".k").textContent = NAMES[p.kind]; return d; }

  function card(kind, src, big) {
    const d = div("vis");
    d.innerHTML = '<div class="vbar"><span class="k"></span></div><div class="body ' + kind + '"></div>';
    d.querySelector(".k").textContent = NAMES[kind];
    const bar = d.querySelector(".vbar"), body = d.querySelector(".body");
    const btn = (label, title, fn) => { const b = document.createElement("button"); b.textContent = label; b.title = title; b.onclick = fn; bar.appendChild(b); return b; };
    btn("</>", "Show the source", () => {
      const s = d.querySelector("pre.src");
      if (s) return s.remove();
      const pre = document.createElement("pre"); pre.className = "src"; pre.textContent = src; d.appendChild(pre);
    });
    btn("⬇", "Save it as a file", () => save(kind, src, d));
    if (!big) btn("⤢", "Open it big in the side panel", () => stage.visual(kind, src));
    draw(kind, src, body, d).catch((e) => fail(d, kind, e)).then(follow);
    return d;
  }

  async function draw(kind, src, body, d) {
    if (kind === "mermaid") return drawMermaid(src, body);
    if (kind === "chart") {
      const cfg = parseConfig(src);
      if (cfg) return drawChart(cfg, body);
      // Not JSON: likely a JavaScript object literal with functions. Run it sandboxed.
      return drawFrame(body, d, "<canvas id=c></canvas><scr" + "ipt>new Chart(document.getElementById('c'), (" + src.replace(/<\/script/gi, "<\\/script") + "\n));<\/script>", true, "chart");
    }
    return drawFrame(body, d, src, /\bChart\b/.test(src), "html");
  }

  // Small models write JSON with trailing commas, comments and single quotes; forgive that much.
  function parseConfig(src) {
    const s = src.trim();
    try { return JSON.parse(s); } catch {}
    try {
      const loose = s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "")
        .replace(/'([^'\\\n]*)'/g, (_, x) => JSON.stringify(x))
        .replace(/([{,]\s*)([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":')
        .replace(/,(\s*[}\]])/g, "$1");
      return JSON.parse(loose);
    } catch { return null; }
  }

  async function drawChart(cfg, body) {
    const Chart = await lib("chart");
    Chart.defaults.color = css("--mute"); Chart.defaults.borderColor = css("--line");
    Chart.defaults.font.family = 'system-ui, "Segoe UI", sans-serif';
    if (!cfg || typeof cfg !== "object" || !cfg.type || !cfg.data) throw new Error('a chart needs "type" and "data"');
    colorize(cfg);
    cfg.options = Object.assign({ responsive: true, maintainAspectRatio: false, animation: { duration: 400 } }, cfg.options || {});
    const c = document.createElement("canvas");
    body.innerHTML = ""; body.appendChild(c);
    body.chart = new Chart(c, cfg);
  }

  // Models rarely pick colors; without them every series is grey.
  const PALETTE = ["#d9480f", "#1c7ed6", "#2b8a3e", "#ae3ec9", "#f59f00", "#0c8599", "#e64980", "#5c7cfa", "#74b816", "#868e96"];
  function colorize(cfg) {
    const round = /^(pie|doughnut|polarArea)$/.test(cfg.type);
    (cfg.data.datasets || []).forEach((ds, i) => {
      if (ds.backgroundColor || ds.borderColor) return;
      const n = Array.isArray(ds.data) ? ds.data.length : 0;
      if (round) { ds.backgroundColor = Array.from({ length: n }, (_, k) => PALETTE[k % PALETTE.length]); ds.borderColor = css("--panel"); return; }
      const c = PALETTE[i % PALETTE.length];
      ds.borderColor = c;
      ds.backgroundColor = /^(line|radar|scatter|bubble)$/.test(ds.type || cfg.type) ? c + "33" : c + "cc";
    });
  }

  function drawMermaid(src, body) {
    // One at a time: Mermaid keeps global state while it lays a diagram out.
    const job = mermaidQueue.then(async () => {
      const mermaid = await lib("mermaid");
      if (!mermaid.ready) mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: dark() ? "dark" : "default", fontFamily: 'system-ui, "Segoe UI", sans-serif' }), mermaid.ready = true;
      const id = "mmd" + ++seq;
      try {
        const { svg } = await mermaid.render(id, src.trim());
        body.innerHTML = svg;
      } finally {
        // A failed render leaves its error drawing in the page body.
        const stray = document.getElementById("d" + id); if (stray) stray.remove();
      }
    });
    mermaidQueue = job.catch(() => {});
    return job;
  }

  const CSP = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; media-src data: blob:";
  const REPORT = "(function(){var p=function(m){m.maxxVis=1;parent.postMessage(m,'*')};" +
    "addEventListener('error',function(e){p({kind:'error',text:String(e.message||e)+(e.lineno?' (line '+e.lineno+')':'')})});" +
    "addEventListener('unhandledrejection',function(e){p({kind:'error',text:String(e.reason)})});" +
    "var h=function(){p({kind:'size',h:Math.max(document.documentElement.scrollHeight,document.body?document.body.scrollHeight:0)})};" +
    "addEventListener('load',function(){h();new ResizeObserver(h).observe(document.documentElement)})})();";
  async function drawFrame(body, d, src, withChart, kind) {
    const head = '<meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="' + CSP + '">' +
      "<style>html{color-scheme:" + (dark() ? "dark" : "light") + "}body{margin:12px;font:14px/1.5 system-ui,'Segoe UI',sans-serif}" + (kind === "chart" ? "body{height:316px}canvas{max-height:316px}" : "") + "</style>" +
      "<scr" + "ipt>" + REPORT + "<\/script>" + (withChart ? "<scr" + "ipt>" + (await chartSource()) + "<\/script>" : "");
    let doc = src;
    if (/<head[^>]*>/i.test(doc)) doc = doc.replace(/<head[^>]*>/i, (h) => h + head);
    else if (/<html[^>]*>/i.test(doc)) doc = doc.replace(/<html[^>]*>/i, (h) => h + "<head>" + head + "</head>");
    else doc = "<!doctype html><html><head>" + head + "</head><body>" + doc + "</body></html>";
    const f = document.createElement("iframe");
    f.setAttribute("sandbox", "allow-scripts allow-modals allow-forms allow-pointer-lock");
    f.title = NAMES[kind];
    f.srcdoc = doc;
    body.innerHTML = ""; body.appendChild(f);
    frames.add({ frame: f, card: d, kind });
  }
  addEventListener("message", (e) => {
    if (!e.data || e.data.maxxVis !== 1) return;
    let hit = null;
    for (const x of frames) { if (!x.frame.isConnected) frames.delete(x); else if (x.frame.contentWindow === e.source) hit = x; }
    if (!hit) return;
    if (e.data.kind === "size" && !hit.frame.closest("#visBox")) {
      hit.frame.style.height = Math.min(720, Math.max(120, Number(e.data.h) + 4)) + "px";
      follow();
    }
    if (e.data.kind === "error" && !hit.card.classList.contains("bad")) fail(hit.card, hit.kind, new Error(String(e.data.text)), true);
  });

  // A visual that didn't draw says why, and one click sends the error back to the model.
  function fail(d, kind, e, keep) {
    d.classList.add("bad");
    if (!keep) d.querySelector(".body").innerHTML = "";
    const msg = String((e && e.message) || e).split("\n").slice(0, 6).join("\n");
    const box = div("err", "Couldn't draw this " + NAMES[kind].toLowerCase() + ": " + msg);
    const b = document.createElement("button"); b.textContent = "Ask Maxx to fix it";
    b.onclick = () => {
      if (busy) return;
      $("input").value = "The " + ({ chart: "chart", mermaid: "Mermaid diagram", html: "HTML" })[kind] + " you sent didn't work: " + msg + "\nSend a corrected version of the whole block.";
      submit();
    };
    box.appendChild(b);
    d.insertBefore(box, d.querySelector(".body"));
  }

  function save(kind, src, d) {
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
    const canvas = d.querySelector(".body canvas"), svg = d.querySelector(".body svg");
    if (kind === "chart" && canvas) { a.href = canvas.toDataURL("image/png"); a.download = "maxx-chart-" + stamp + ".png"; }
    else if (kind === "mermaid" && svg) { a.href = URL.createObjectURL(new Blob([svg.outerHTML], { type: "image/svg+xml" })); a.download = "maxx-diagram-" + stamp + ".svg"; }
    else { a.href = URL.createObjectURL(new Blob([src], { type: "text/plain" })); a.download = "maxx-" + kind + "-" + stamp + (kind === "html" ? ".html" : kind === "chart" ? ".json" : ".mmd"); }
    a.click();
  }

  return { paint, card };
})();
`;
