// The 🎹 Music tab: play, see and edit the project's songs. Scores (.score)
// show as a piano roll you can play, mute tracks in, and edit as text; the
// same engine as the compose tool renders them here, so the app plays exactly
// what the tool wrote. Audio files (from make_song or mix_audio) get a player.
// MUSIC_JS is a raw string spliced into page.ts: no backticks inside it.

import { SCORE_JS } from "../music/index.ts";

export const MUSIC_CSS = `
#musBody { flex: 1; overflow: auto; border-top: 1px solid var(--line); padding: 10px 12px 16px 14px; display: flex; flex-direction: column; gap: 10px; }
#musBody .mus-head { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
#musBody .mus-head b { font-size: 15px; }
#musBody .mus-head span { color: var(--mute); font-size: 12.5px; }
#musRoll { width: 100%; height: 220px; background: var(--code); border-radius: 8px; display: block; cursor: pointer; }
.mus-tracks { display: flex; flex-wrap: wrap; gap: 5px; }
.mus-tracks button { padding: 3px 9px; font-size: 12px; border-radius: 99px; display: flex; gap: 6px; align-items: center; }
.mus-tracks button i { width: 9px; height: 9px; border-radius: 99px; display: inline-block; }
.mus-tracks button.off { opacity: .45; text-decoration: line-through; }
.mus-bar { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.mus-bar button { padding: 4px 10px; font-size: 12.5px; }
.mus-bar .grow { margin-right: auto; }
.mus-bar input { flex: 1; min-width: 140px; padding: 5px 8px; font-size: 12.5px; }
#musPlay.on { box-shadow: 0 0 0 2px var(--accent) inset; filter: brightness(1.1); }
#musText { width: 100%; min-height: 220px; resize: vertical; font: 12.5px/1.5 var(--mono); padding: 8px 10px; border: 1px solid var(--line); border-radius: 8px; background: var(--code); color: var(--ink); tab-size: 2; white-space: pre; }
.mus-msgs { font-size: 12.5px; display: flex; flex-direction: column; gap: 2px; }
.mus-msgs .bad { color: var(--bad); }
.mus-msgs .warn { color: var(--mute); }
#musSave.dirty { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
#musAudio { width: 100%; }
.mus-song { border: 1px solid var(--line); border-radius: var(--radius); background: var(--panel); padding: 10px; display: flex; flex-direction: column; gap: 8px; }
.mus-song .hint { color: var(--mute); font-size: 12px; }
#musEmpty { color: var(--mute); text-align: center; padding: 30px 10px; display: flex; flex-direction: column; gap: 10px; align-items: center; }
#musEmpty h3 { margin: 0; color: var(--ink); }
#musBusy { font-size: 12.5px; color: var(--accent); }
`;

export const MUSIC_PANE = `
    <div class="spane" id="pane-music">
      <div class="stabs"><span class="t">Music</span><button id="stageHide6" title="Hide panel">✕</button></div>
      <div class="sbar">
        <select id="musFile" title="Songs in this project"></select>
        <span style="margin-right:auto"></span>
        <button id="musStop" title="Stop">■ Stop</button>
        <button id="musSave" title="Save the score and render its .wav and .mid again">Save</button>
      </div>
      <div id="musBody">
        <div id="musEmpty"><h3>No music yet</h3>Ask Maxx: <i>"compose a chill lo-fi loop for the menu"</i> or <i>"make a synthwave song with vocals about night driving"</i>.<button class="primary" id="musStarter">＋ Start a song</button></div>
        <div id="musScore" style="display:none">
          <div class="mus-head"><b id="musTitle"></b><span id="musFacts"></span></div>
          <canvas id="musRoll" title="Click to play from here"></canvas>
          <div class="mus-tracks" id="musTracks"></div>
          <div class="mus-bar">
            <button id="musPlay" class="primary">▶ Play</button>
            <button id="musLoop" title="Play it again when it ends">🔁</button>
            <span class="grow" id="musBusy"></span>
            <button id="musWav" title="Download as .wav">⬇ wav</button>
            <button id="musMid" title="Download as .mid for any music app">⬇ midi</button>
          </div>
          <div class="mus-song" id="musAce" style="display:none">
            <div class="mus-bar"><input id="musStyle" placeholder="Make it a real song: style, e.g. dreamy synthwave, female vocals" spellcheck="false"><button id="musCover" title="ACE-Step re-makes this tune as a produced song">🎤 Produce</button></div>
            <div class="hint">Uses ACE-Step on this PC. Your tune stays; the model plays and sings it in the style you write.</div>
          </div>
          <textarea id="musText" spellcheck="false" title="The score: edit it, then ▶ Play (Ctrl+Enter) or Save"></textarea>
          <div class="mus-msgs" id="musMsgs"></div>
        </div>
        <div id="musFileView" style="display:none" class="mus-song">
          <div class="mus-head"><b id="musAudioName"></b><span id="musAudioFacts"></span></div>
          <audio id="musAudio" controls preload="metadata"></audio>
        </div>
      </div>
    </div>`;

export const MUSIC_RAIL = `<button data-tab="music" title="Music">🎹<span class="dot" id="dotMusic"></span></button>`;

export const MUSIC_JS = String.raw`
const musicTab = (() => {
  ${SCORE_JS}
  const S = MaxxScore;
  const COLORS = ["#7c5cff", "#2fb67c", "#1c7ed6", "#f08c00", "#e64980", "#15aabf", "#94d82d", "#fab005", "#be4bdb", "#ff6b6b"];
  let files = { scores: [], audio: [] }, file = "", base = "", text = "", saved = "", project = "", ace = null;
  let ac = null, playing = null, raf = 0, loop = false, muted = {}, ev = null, rendered = null, renderedFor = "";

  function audio() { if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === "suspended") ac.resume(); return ac; }
  function stop() { if (playing) { try { playing.src.stop(); } catch {} playing = null; } cancelAnimationFrame(raf); $("musPlay").textContent = "▶ Play"; $("musPlay").classList.remove("on"); draw(); }
  const isScore = (f) => /\.score$/i.test(f);
  const dirty = () => text !== saved;
  function markDirty() { $("musSave").classList.toggle("dirty", dirty()); $("musSave").textContent = "Save"; }

  function list(m) {
    files = { scores: m.scores || [], audio: m.audio || [] };
    base = m.base || base; ace = m.ace || null;
    const all = files.scores.concat(files.audio);
    if (m.file !== undefined && m.file) file = m.file;
    if (!all.includes(file)) file = all[0] || "";
    const opt = (f) => '<option' + (f === file ? " selected" : "") + ">" + esc(f) + "</option>";
    $("musFile").innerHTML = (files.scores.length ? '<optgroup label="Scores">' + files.scores.map(opt).join("") + "</optgroup>" : "") + (files.audio.length ? '<optgroup label="Audio">' + files.audio.map(opt).join("") + "</optgroup>" : "");
    $("musFile").style.visibility = all.length ? "" : "hidden";
    $("musEmpty").style.display = all.length ? "none" : "";
    $("musSave").style.visibility = isScore(file) ? "" : "hidden";
    if (!file) { $("musScore").style.display = "none"; $("musFileView").style.display = "none"; return; }
    if (isScore(file)) {
      $("musScore").style.display = ""; $("musFileView").style.display = "none";
      $("musAce").style.display = ace ? "" : "none";
      if (typeof m.text === "string" && (!dirty() || m.saved || m.fresh)) { text = saved = m.text; $("musText").value = text; muted = m.fresh ? {} : muted; markDirty(); }
      if (m.saved) { $("musSave").textContent = "Saved ✓"; }
      refresh();
    } else {
      stop();
      $("musScore").style.display = "none"; $("musFileView").style.display = "";
      $("musAudioName").textContent = file.split("/").pop();
      $("musAudioFacts").textContent = file;
      const url = base + file.split("/").map(encodeURIComponent).join("/") + "?_=" + Date.now();
      if ($("musAudio").dataset.file !== file) { $("musAudio").src = url; $("musAudio").dataset.file = file; }
    }
  }

  // Parse the text, apply mutes, and redraw: cheap, so it runs on every edit.
  function refresh() {
    let score;
    try { score = S.parse(text); } catch (e) { $("musMsgs").innerHTML = '<div class="bad">' + esc(e.message) + "</div>"; return; }
    for (const n of Object.keys(score.tracks)) if (muted[n]) score.tracks[n].mute = true;
    ev = S.events(score);
    const a = S.analyze(ev);
    $("musTitle").textContent = a.title || file.split("/").pop().replace(/\.score$/i, "");
    const secs = Math.round(a.seconds);
    $("musFacts").textContent = Math.round(a.bars) + " bars · " + a.bpm + " bpm · " + Math.floor(secs / 60) + ":" + String(secs % 60).padStart(2, "0") + (a.key ? " · " + a.key : "") + (ev.sections.length > 1 ? " · " + ev.sections.map((s) => s.name).join(" ") : "");
    const names = Object.keys(score.tracks);
    $("musTracks").innerHTML = "";
    names.forEach((n, i) => {
      const t = score.tracks[n], b = document.createElement("button");
      b.className = muted[n] ? "off" : "";
      b.title = (muted[n] ? "Turn on " : "Mute ") + n + " (" + t.inst + ")";
      b.innerHTML = '<i style="background:' + COLORS[i % COLORS.length] + '"></i>' + esc(n.replace(/~.*/, "")) + (t.inst === n.replace(/~.*/, "") ? "" : ' <span style="color:var(--mute)">' + esc(t.inst) + "</span>");
      b.onclick = () => { muted[n] = !muted[n]; const was = !!playing; const at = was ? position() : 0; refresh(); if (was) play(at); };
      $("musTracks").appendChild(b);
    });
    $("musMsgs").innerHTML = a.errors.map((e) => '<div class="bad">⚠ ' + (e.line ? "line " + e.line + ": " : "") + esc(e.msg) + "</div>").join("") + a.warnings.map((w) => '<div class="warn">· ' + esc(w) + "</div>").join("");
    draw();
  }

  function position() {
    if (!playing) return 0;
    const t = ac.currentTime - playing.at + playing.from;
    return Math.max(0, Math.min(t, playing.dur));
  }
  function play(from) {
    stop();
    if (!ev || !ev.notes.length) return;
    $("musBusy").textContent = "Rendering…";
    setTimeout(() => {
      const key = text + "|" + JSON.stringify(muted);
      const a = audio();
      if (renderedFor !== key || !rendered || rendered.rate !== a.sampleRate) { rendered = S.render(ev, { rate: a.sampleRate }); renderedFor = key; }
      $("musBusy").textContent = "";
      const b = a.createBuffer(2, rendered.L.length, rendered.rate);
      b.getChannelData(0).set(rendered.L); b.getChannelData(1).set(rendered.R);
      const src = a.createBufferSource(); src.buffer = b; src.connect(a.destination);
      from = Math.max(0, Math.min(from || 0, b.duration - 0.05));
      src.start(0, from);
      playing = { src, at: a.currentTime, from, dur: b.duration, spb: 60 / ev.score.bpm };
      src.onended = () => { if (playing && playing.src === src) { playing = null; stop(); if (loop) play(0); } };
      $("musPlay").textContent = "■ Pause"; $("musPlay").classList.add("on");
      const tick = () => { if (!playing) return; draw(position() / playing.spb); raf = requestAnimationFrame(tick); };
      tick();
    }, 20);
  }

  // ---- the piano roll ----
  function size(cv) { const w = cv.clientWidth * devicePixelRatio, h = cv.clientHeight * devicePixelRatio; if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; } return [w, h]; }
  const css = (v) => getComputedStyle(document.body).getPropertyValue(v).trim() || "#888";
  function draw(headBeat) {
    const cv = $("musRoll");
    if (!cv || !cv.isConnected || !ev || $("musScore").style.display === "none") return;
    const [w, h] = size(cv), c = cv.getContext("2d");
    c.clearRect(0, 0, w, h);
    const beats = ev.beats || 1, names = Object.keys(ev.score.tracks);
    const tonal = ev.notes.filter((x) => !x.drum), drums = ev.notes.filter((x) => x.drum);
    const drumNames = [...new Set(drums.map((x) => x.drum))];
    const drumH = drumNames.length ? Math.min(h * 0.22, drumNames.length * 7 * devicePixelRatio) : 0;
    let lo = 127, hi = 0;
    for (const x of tonal) { if (x.n < lo) lo = x.n; if (x.n > hi) hi = x.n; }
    if (lo > hi) { lo = 48; hi = 72; }
    lo -= 2; hi += 2;
    const top = 14 * devicePixelRatio, rows = h - drumH - top - 4, sx = w / beats, ny = rows / (hi - lo + 1);
    // bars and sections
    c.fillStyle = css("--ink");
    for (let b = 0; b <= beats; b += ev.score.meter) { c.globalAlpha = 0.08; c.fillRect(b * sx, top, 1, h - top); }
    c.font = (10 * devicePixelRatio) + "px sans-serif"; c.textBaseline = "top";
    for (const s of ev.sections) { c.globalAlpha = 0.5; c.fillRect(s.beat * sx, 0, 1.5 * devicePixelRatio, h); if (ev.sections.length > 1) { c.globalAlpha = 0.7; c.fillText(s.name, s.beat * sx + 4, 2); } }
    // C rows
    c.globalAlpha = 0.05;
    for (let n = lo; n <= hi; n++) if (n % 12 === 0) c.fillRect(0, top + rows - (n - lo + 1) * ny, w, ny);
    for (const x of tonal) {
      const i = names.indexOf(x.track);
      c.globalAlpha = ev.score.tracks[x.track].mute ? 0.12 : 0.85;
      c.fillStyle = COLORS[i % COLORS.length];
      c.fillRect(x.t * sx, top + rows - (x.n - lo + 1) * ny, Math.max(1.5, x.d * sx - 1), Math.max(2, ny - 0.5));
    }
    for (const x of drums) {
      const i = names.indexOf(x.track), r = drumNames.indexOf(x.drum);
      c.globalAlpha = ev.score.tracks[x.track].mute ? 0.12 : 0.7;
      c.fillStyle = COLORS[i % COLORS.length];
      c.fillRect(x.t * sx, h - drumH + r * (drumH / drumNames.length), Math.max(1.5, Math.min(sx * 0.4, 6 * devicePixelRatio)), Math.max(2, drumH / drumNames.length - 1));
    }
    c.globalAlpha = 1;
    if (headBeat !== undefined) { c.fillStyle = css("--bad"); c.fillRect(headBeat * sx, 0, 2 * devicePixelRatio, h); }
  }

  function download(name, bytes, type) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([bytes], { type }));
    a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }
  const stem = () => file.split("/").pop().replace(/\.score$/i, "");

  // ---- wiring ----
  $("musPlay").onclick = () => { if (playing) stop(); else play(0); };
  $("musLoop").onclick = () => { loop = !loop; $("musLoop").classList.toggle("on", loop); };
  $("musStop").onclick = () => { stop(); $("musAudio").pause(); };
  $("musRoll").onclick = (e) => { if (!ev) return; const r = e.target.getBoundingClientRect(); play((e.clientX - r.left) / r.width * ev.beats * 60 / ev.score.bpm); };
  $("musText").oninput = () => { text = $("musText").value; markDirty(); clearTimeout(musicTab._t); musicTab._t = setTimeout(refresh, 250); };
  $("musText").onkeydown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); text = $("musText").value; refresh(); play(0); }
    if (e.key === "s" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); $("musSave").onclick(); }
    if (e.key === "Tab") { e.preventDefault(); const t = e.target, s = t.selectionStart; t.setRangeText("  ", s, t.selectionEnd, "end"); t.oninput(); }
  };
  $("musSave").onclick = () => { if (!isScore(file)) return; send({ type: "musicSave", file, text }); $("musSave").textContent = "Saving…"; };
  $("musWav").onclick = () => { if (!ev) return; const r = S.render(ev, { rate: 44100 }); download(stem() + ".wav", S.toWav(r.L, r.R, r.rate), "audio/wav"); };
  $("musMid").onclick = () => { if (ev) download(stem() + ".mid", S.toMidi(ev), "audio/midi"); };
  $("musCover").onclick = () => {
    const style = $("musStyle").value.trim();
    if (!style) { $("musStyle").focus(); return; }
    if (dirty()) send({ type: "musicSave", file, text });
    send({ type: "musicSong", file, prompt: style });
    $("musBusy").textContent = "🎤 Producing with ACE-Step…";
    $("musCover").disabled = true;
  };
  $("musStarter").onclick = () => send({ type: "musicNew" });
  $("musFile").onchange = () => {
    if (dirty() && !confirm("Drop unsaved changes to " + file + "?")) { $("musFile").value = file; return; }
    stop(); file = $("musFile").value; muted = {}; text = saved = "";
    send({ type: "musicList", file });
  };

  return {
    shown() { send({ type: "musicList", file }); setTimeout(draw, 30); },
    on(m) {
      if (m.type === "music") return list(m);
      if (m.type === "musicBusy") {
        $("musBusy").textContent = m.text || "";
        if (m.done) $("musCover").disabled = false;
        return;
      }
      if (m.type === "toolEnd" && /^(compose|make_song|mix_audio)$/.test(m.name) && !/^error/i.test(m.result || "")) {
        const made = /(?:Wrote|Made[^:]*:|saved)\s+([^\s,;(]+\.(?:score|mp3|wav|ogg|flac))/i.exec(m.result || "");
        if (made && !dirty()) { file = made[1]; text = saved = ""; }
        send({ type: "musicList", file, fresh: true });
        if (!$("pane-music").classList.contains("on") || !$("stage").classList.contains("on")) $("dotMusic").classList.add("on");
        return;
      }
      if (m.type === "stage") {
        const now = m.base + "|" + (state && state.current ? state.current.cwd : "");
        if (now !== project) { project = now; stop(); file = ""; text = saved = ""; send({ type: "musicList" }); }
      }
    },
  };
})();
`;
