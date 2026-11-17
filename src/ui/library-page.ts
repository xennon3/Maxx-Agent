// The 📚 Library tab: what Maxx has read on the web and what it learned from
// it. Pages show their kind, how long they stay fresh (a shelf-life bar) and
// how often they answered a lookup; lessons can be approved, edited, pinned or
// deleted. The same library serves every project, so it works with no folder open.
// LIB_JS is a raw string spliced into page.ts: no backticks inside it.

export const LIB_CSS = `
#libBody { flex: 1; overflow: auto; border-top: 1px solid var(--line); padding: 10px 12px 16px 14px; display: flex; flex-direction: column; gap: 10px; }
.lib-stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
.lib-stat { border: 1px solid var(--line); border-radius: var(--radius); background: var(--panel); padding: 7px 9px; display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.lib-stat b { font-size: 17px; line-height: 1.2; }
.lib-stat span { color: var(--mute); font-size: 11.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lib-stat.win b { color: var(--ok); }
.lib-views { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.lib-views .chip b { font-weight: 600; margin-left: 4px; opacity: .75; }
.lib-views .grow { margin-right: auto; }
.lib-filters { display: flex; gap: 4px; flex-wrap: wrap; }
.lib-filters .chip { font-size: 11.5px; padding: 2px 8px; }
.lib-list { display: flex; flex-direction: column; gap: 6px; }
.lib-card { border: 1px solid var(--line); border-radius: var(--radius); background: var(--panel); padding: 8px 10px; display: flex; flex-direction: column; gap: 5px; }
.lib-card.stale { opacity: .78; }
.lib-row { display: flex; gap: 8px; align-items: flex-start; }
.lib-row .ic { font-size: 16px; line-height: 1.3; flex: none; }
.lib-row .main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.lib-row .title { font-weight: 600; font-size: 13px; cursor: pointer; overflow-wrap: anywhere; }
.lib-row .title:hover { color: var(--accent); }
.lib-row .meta { color: var(--mute); font-size: 11.5px; display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
.lib-row .acts { display: flex; gap: 3px; flex: none; }
.lib-row .acts button { padding: 2px 6px; font-size: 12px; line-height: 1.3; }
.lib-row .acts button.on { border-color: var(--accent); background: var(--user); }
.lib-life { height: 4px; border-radius: 99px; background: var(--line); overflow: hidden; }
.lib-life i { display: block; height: 100%; border-radius: 99px; }
.lib-pass { font: 12px/1.5 var(--mono); background: var(--code); border-radius: 6px; padding: 6px 8px; white-space: pre-wrap; overflow-wrap: anywhere; max-height: 150px; overflow: auto; }
.lib-pass mark { background: color-mix(in srgb, var(--accent) 30%, transparent); color: inherit; border-radius: 3px; }
.lib-read { font: 12px/1.55 var(--mono); background: var(--code); border-radius: 6px; padding: 8px 10px; white-space: pre-wrap; overflow-wrap: anywhere; max-height: 340px; overflow: auto; }
.lib-tag { font-size: 10.5px; border-radius: 99px; padding: 1px 7px; border: 1px solid var(--line); white-space: nowrap; }
.lib-tag.ok { color: var(--ok); border-color: color-mix(in srgb, var(--ok) 45%, transparent); }
.lib-tag.warn { color: #c77700; border-color: #c7770066; }
.lib-tag.you { color: var(--accent); border-color: color-mix(in srgb, var(--accent) 45%, transparent); }
.lib-lesson .text { font-size: 13px; line-height: 1.45; overflow-wrap: anywhere; }
.lib-lesson .text[contenteditable="true"] { outline: 1px dashed var(--accent); border-radius: 4px; padding: 2px 4px; }
.lib-add { display: flex; gap: 6px; }
.lib-add input { flex: 1; font-size: 12.5px; }
.lib-set { border-top: 1px solid var(--line); padding-top: 8px; display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; }
.lib-set label { display: flex; gap: 7px; align-items: center; cursor: pointer; }
.lib-set .btns { display: flex; gap: 6px; flex-wrap: wrap; }
.lib-set .btns button { font-size: 12px; padding: 4px 9px; }
.lib-set .hint { color: var(--mute); font-size: 11.5px; }
#libFlash { color: var(--accent); font-size: 12px; min-height: 0; }
#libEmpty { color: var(--mute); text-align: center; padding: 26px 10px; display: flex; flex-direction: column; gap: 8px; align-items: center; }
#libEmpty h3 { margin: 0; color: var(--ink); }
`;

export const LIB_PANE = `
    <div class="spane" id="pane-library">
      <div class="stabs"><span class="t">Library</span><button id="stageHide7" title="Hide panel">✕</button></div>
      <div class="sbar">
        <input id="libQ" placeholder="Search what Maxx has read and learned…" spellcheck="false">
        <button id="libGo" title="Search the library">Search</button>
      </div>
      <div id="libBody">
        <div class="lib-stats" id="libStats"></div>
        <div class="lib-views">
          <span class="chip on" data-view="notes" id="libVNotes">📝 Notebook<b id="libNNotes">0</b></span>
          <span class="chip" data-view="pages" id="libVPages">📄 Pages<b id="libNPages">0</b></span>
          <span class="grow"></span>
          <span id="libFlash"></span>
        </div>
        <div id="libNotes">
          <div class="lib-add"><input id="libNew" placeholder="Teach Maxx a fact, e.g. Use py, not python, on this PC" spellcheck="false"><button id="libAdd">＋ Add</button></div>
          <div class="lib-list" id="libLessons" style="margin-top:6px"></div>
        </div>
        <div id="libPages" style="display:none">
          <div class="lib-filters" id="libFilters"></div>
          <div class="lib-list" id="libPageList" style="margin-top:6px"></div>
        </div>
        <div id="libEmpty" style="display:none"><h3>Nothing read yet</h3>Turn on 🌐 network and ask something Maxx has to look up. Every page it reads is kept here, so next time the answer comes from disk in a second instead of a search.</div>
        <div class="lib-set">
          <label><input type="checkbox" id="libSave"> Keep the pages Maxx reads</label>
          <label><input type="checkbox" id="libFirst"> Check the library before searching the web</label>
          <label><input type="checkbox" id="libLearn"> Write lessons after research</label>
          <div class="hint" id="libMeaning"></div>
          <div class="btns"><button id="libTidy" title="Delete pages that went stale long ago (pinned ones stay)">🧹 Clear stale</button><button id="libForget" class="danger" title="Delete every saved page (the notebook stays)">Forget all pages</button></div>
        </div>
      </div>
    </div>`;

export const LIB_RAIL = `<button data-tab="library" title="Library: what Maxx read and learned">📚<span class="dot" id="dotLibrary"></span></button>`;

export const LIB_JS = String.raw`
const libraryTab = (() => {
  let data = null, view = "notes", filter = "all", q = "", open = {}, editing = "";
  const KIND = { docs: ["📘", "docs"], qa: ["💬", "Q&A"], reference: ["📖", "reference"], release: ["🏷", "releases"], article: ["📄", "article"], news: ["📰", "news"], price: ["💲", "prices"] };
  const STATUS = { verified: ["ok", "✔ checked", "Its numbers and words are on the page it cites"], unverified: ["warn", "⚠ unconfirmed", "Not found on its page: it stays out of prompts until you approve it"], yours: ["you", "★ yours", "Written or approved by you"], study: ["ok", "🔬 study", "A corroborated finding from a Research study"] };
  const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return u; } };
  function ago(t) {
    const s = Math.max(0, (Date.now() - t) / 1000);
    if (s < 90) return "just now";
    const m = s / 60; if (m < 90) return Math.round(m) + " min ago";
    const h = m / 60; if (h < 36) return Math.round(h) + " h ago";
    const d = h / 24; if (d < 60) return Math.round(d) + " days ago";
    return Math.round(d / 30) + " months ago";
  }
  function left(t) {
    const d = (t - Date.now()) / 86400000;
    if (d <= 0) return "stale";
    if (d < 1) return "fresh for " + Math.max(1, Math.round(d * 24)) + " h";
    return "fresh for " + Math.round(d) + " days";
  }
  function mins(ms) { const m = ms / 60000; return m < 1 ? Math.round(ms / 1000) + " s" : m < 90 ? Math.round(m) + " min" : (m / 60).toFixed(1) + " h"; }
  function size(n) { return n > 1e6 ? (n / 1e6).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1e3)) + " KB"; }
  function mark(text) {
    const words = q.toLowerCase().split(/[^\p{L}\p{N}._+#-]+/u).filter((w) => w.length > 1);
    let h = esc(text);
    for (const w of words) h = h.replace(new RegExp("(" + w.replace(/[.*+?^$()|[\]\\{}]/g, "\\$&") + ")", "gi"), "<mark>$1</mark>");
    return h;
  }

  function stats() {
    const d = data, s = d.stats, served = s.servedSearches + s.servedFetches + s.cachedSearches + s.offline;
    const box = (cls, big, small, title) => '<div class="lib-stat ' + cls + '" title="' + esc(title || "") + '"><b>' + big + '</b><span>' + small + "</span></div>";
    $("libStats").innerHTML =
      box("", d.total, "pages · " + size(d.chars), d.stale + " of them stale") +
      box("", d.lessonCount, "lessons in the notebook", "") +
      box(served ? "win" : "", served, "lookups answered from disk", s.servedSearches + " searches skipped, " + s.servedFetches + " pages read from disk, " + s.cachedSearches + " repeat searches, " + s.offline + " while offline") +
      box(d.savedMs > 0 ? "win" : "", d.savedMs > 0 ? "~" + mins(d.savedMs) : "0 s", "of waiting saved", "From this PC's own average: a web search takes " + Math.round(d.avgSearch / 100) / 10 + " s here");
    $("libNNotes").textContent = d.lessonCount;
    $("libNPages").textContent = d.total;
    $("libMeaning").textContent = d.meaning.model ? "🧠 Search by meaning is on (" + d.meaning.model + "), plus keywords." : "🔤 Search by keywords. " + (d.meaning.why ? "For search by meaning too: " + d.meaning.why + "." : "");
    $("libSave").checked = d.settings.save; $("libFirst").checked = d.settings.recallFirst; $("libLearn").checked = d.settings.lessons;
  }

  function lessons() {
    const list = data.lessons;
    $("libLessons").innerHTML = list.length ? "" : '<div class="lib-set hint" style="border:0">' + (q ? "No lessons match." : "No lessons yet. After Maxx researches something it writes down what is worth keeping, and checks each lesson against its page.") + "</div>";
    for (const l of list) {
      const st = STATUS[l.status] || STATUS.unverified;
      const c = document.createElement("div");
      c.className = "lib-card lib-lesson";
      c.innerHTML = '<div class="lib-row"><div class="main"><div class="text"></div><div class="meta"><span class="lib-tag ' + st[0] + '" title="' + esc(st[2]) + '">' + st[1] + "</span>" + (l.url ? '<a href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(host(l.url)) + "</a>" : "") + "<span>" + ago(l.at) + "</span>" + (l.uses ? "<span>used " + l.uses + "×</span>" : "") + "</div></div>" +
        '<div class="acts">' + (l.status === "unverified" ? '<button data-a="ok" title="Approve: use it in prompts">✓</button>' : "") + '<button data-a="pin" class="' + (l.pinned ? "on" : "") + '" title="' + (l.pinned ? "Unpin" : "Pin: never dropped") + '">📌</button><button data-a="edit" title="Edit">✎</button><button data-a="del" title="Delete">🗑</button></div></div>';
      const t = c.querySelector(".text");
      t.innerHTML = q ? mark(l.text) : esc(l.text);
      c.querySelector(".acts").onclick = (e) => {
        const a = e.target.dataset && e.target.dataset.a;
        if (a === "ok") send({ type: "libLessonEdit", id: l.id, approve: true, q });
        if (a === "pin") send({ type: "libLessonEdit", id: l.id, pinned: !l.pinned, q });
        if (a === "del") send({ type: "libLessonDelete", id: l.id, q });
        if (a === "edit") {
          if (editing === l.id) { editing = ""; send({ type: "libLessonEdit", id: l.id, text: t.textContent, q }); return; }
          editing = l.id; t.textContent = l.text; t.contentEditable = "true"; t.focus(); e.target.textContent = "💾";
          t.onkeydown = (k) => { if (k.key === "Enter") { k.preventDefault(); e.target.click(); } if (k.key === "Escape") { editing = ""; draw(); } };
        }
      };
      $("libLessons").appendChild(c);
    }
  }

  function pages() {
    const kinds = {};
    for (const p of data.pages) kinds[p.kind] = (kinds[p.kind] || 0) + 1;
    const fs = [["all", "All"], ["fresh", "Fresh"], ["stale", "Stale"], ["pinned", "📌 Pinned"]].concat(Object.keys(kinds).map((k) => [k, KIND[k][0] + " " + KIND[k][1] + " " + kinds[k]]));
    $("libFilters").innerHTML = fs.map((f) => '<span class="chip' + (filter === f[0] ? " on" : "") + '" data-f="' + f[0] + '">' + esc(f[1]) + "</span>").join("");
    const keep = (p) => filter === "all" || (filter === "fresh" && p.fresh) || (filter === "stale" && !p.fresh) || (filter === "pinned" && p.pinned) || p.kind === filter;
    const list = data.pages.filter(keep);
    $("libPageList").innerHTML = list.length ? "" : '<div class="lib-set hint" style="border:0">' + (q ? "No saved page matches." : "No pages here.") + "</div>";
    for (const p of list) {
      const k = KIND[p.kind] || KIND.article;
      const life = p.pinned ? 1 : Math.max(0, Math.min(1, (p.expiresAt - Date.now()) / Math.max(1, p.expiresAt - p.savedAt)));
      const col = p.pinned ? "var(--accent)" : life > 0.5 ? "var(--ok)" : life > 0.15 ? "#e0a100" : "var(--bad)";
      const c = document.createElement("div");
      c.className = "lib-card" + (p.fresh ? "" : " stale");
      c.innerHTML = '<div class="lib-row"><span class="ic" title="' + k[1] + '">' + k[0] + '</span><div class="main"><div class="title"></div><div class="meta"><span>' + esc(host(p.url)) + "</span><span>· saved " + ago(p.savedAt) + "</span><span>· " + (p.pinned ? "📌 always fresh" : left(p.expiresAt)) + "</span>" + (p.uses ? "<span>· used " + p.uses + "×</span>" : "") + (p.meaning ? '<span title="Has meaning vectors">· 🧠</span>' : "") + "</div></div>" +
        '<div class="acts"><button data-a="pin" class="' + (p.pinned ? "on" : "") + '" title="' + (p.pinned ? "Unpin" : "Pin: always fresh, never cleared") + '">📌</button><button data-a="open" title="Open the page in the browser">↗</button><button data-a="del" title="Forget this page">🗑</button></div></div>' +
        '<div class="lib-life" title="Shelf life: ' + esc(k[1]) + " stays fresh for a while, then Maxx checks the web again" + '"><i style="width:' + Math.round(life * 100) + "%;background:" + col + '"></i></div>' +
        (p.passage ? '<div class="lib-pass"></div>' : "") + (open[p.id] ? '<div class="lib-read">' + esc(open[p.id]) + "</div>" : "");
      c.querySelector(".title").textContent = p.title;
      if (p.passage) c.querySelector(".lib-pass").innerHTML = mark(p.passage);
      c.querySelector(".title").onclick = () => { if (open[p.id]) { delete open[p.id]; draw(); } else send({ type: "libPage", id: p.id }); };
      c.querySelector(".acts").onclick = (e) => {
        const a = e.target.dataset && e.target.dataset.a;
        if (a === "pin") send({ type: "libPin", id: p.id, on: !p.pinned, q });
        if (a === "open") window.open(p.url, "_blank", "noopener");
        if (a === "del") send({ type: "libDelete", id: p.id, q });
      };
      $("libPageList").appendChild(c);
    }
  }

  function draw() {
    if (!data) return;
    stats();
    const empty = !data.total && !data.lessonCount && !q;
    $("libEmpty").style.display = empty ? "" : "none";
    $("libNotes").style.display = !empty && view === "notes" ? "" : "none";
    $("libPages").style.display = !empty && view === "pages" ? "" : "none";
    $("libVNotes").classList.toggle("on", view === "notes");
    $("libVPages").classList.toggle("on", view === "pages");
    if (view === "notes") lessons(); else pages();
  }

  const go = () => { q = $("libQ").value.trim(); send({ type: "libList", q }); };
  $("libGo").onclick = go;
  $("libQ").onkeydown = (e) => { if (e.key === "Enter") go(); if (e.key === "Escape") { $("libQ").value = ""; go(); } };
  $("libVNotes").onclick = () => { view = "notes"; draw(); };
  $("libVPages").onclick = () => { view = "pages"; draw(); };
  $("libFilters").onclick = (e) => { const f = e.target.dataset && e.target.dataset.f; if (f) { filter = f; draw(); } };
  $("libAdd").onclick = () => { const t = $("libNew").value.trim(); if (!t) return $("libNew").focus(); $("libNew").value = ""; send({ type: "libLessonAdd", text: t, q }); };
  $("libNew").onkeydown = (e) => { if (e.key === "Enter") $("libAdd").click(); };
  $("libSave").onchange = () => send({ type: "libSettings", save: $("libSave").checked, q });
  $("libFirst").onchange = () => send({ type: "libSettings", recallFirst: $("libFirst").checked, q });
  $("libLearn").onchange = () => send({ type: "libSettings", lessons: $("libLearn").checked, q });
  $("libTidy").onclick = () => send({ type: "libTidy", q });
  $("libForget").onclick = () => { if (confirm("Forget every saved page? The notebook of lessons stays.")) send({ type: "libForget", q }); };

  let flashTimer = 0;
  return {
    shown() { send({ type: "libList", q }); },
    on(m) {
      if (m.type === "library") {
        data = m;
        if (m.flash) { $("libFlash").textContent = m.flash; clearTimeout(flashTimer); flashTimer = setTimeout(() => ($("libFlash").textContent = ""), 4000); }
        return draw();
      }
      if (m.type === "libraryPage") { if (!m.missing) open[m.id] = m.text + (m.more ? "\n\n… " + m.more + " more characters" : ""); return draw(); }
      // A lookup or a new lesson: refresh if the tab is open, otherwise a dot on the rail.
      const touched = (m.type === "toolEnd" && /^(web_search|web_fetch|library_search)$/.test(m.name)) || (m.type === "note" && /📚/.test(m.text || ""));
      if (touched) {
        if ($("pane-library").classList.contains("on") && $("stage").classList.contains("on")) send({ type: "libList", q });
        else if (m.type === "note" && /Wrote \d+ lesson/.test(m.text || "")) $("dotLibrary").classList.add("on");
      }
    },
  };
})();
`;
