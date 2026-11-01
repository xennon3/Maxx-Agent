// The Sound lab: a stage tab (🔊) for hearing and tweaking a game's sounds.
// It edits the bank in the project's sound.js (see src/sound) and saves it back,
// so the game in Preview reloads with the new sounds. The engine that games use
// runs here too, so what you hear is exactly what the game plays.
// SOUND_JS is a raw string spliced into page.ts: no backticks inside it.

import { ENGINE_JS } from "../sound/index.ts";

export const SOUND_CSS = `
#sndBody { flex: 1; overflow: auto; border-top: 1px solid var(--line); padding: 10px 12px 16px 14px; display: flex; flex-direction: column; gap: 10px; }
#sndBody h4 { margin: 6px 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: var(--mute); display: flex; align-items: center; gap: 6px; }
#sndBody h4 span { margin-right: auto; }
#sndBody h4 button { padding: 2px 8px; font-size: 12px; text-transform: none; letter-spacing: 0; }
.snd-list { display: flex; flex-direction: column; gap: 4px; }
.snd-row { display: flex; align-items: center; gap: 6px; padding: 4px 6px; border: 1px solid var(--line); border-radius: 8px; background: var(--panel); cursor: pointer; }
.snd-row.on { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent) inset; }
.snd-row .nm { font: 600 12.5px var(--mono); }
.snd-row .ds { color: var(--mute); font-size: 12px; margin-right: auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; flex: 1; }
.snd-row button { padding: 2px 7px; font-size: 12px; flex: none; }
.snd-row .play { width: 28px; }
.snd-ed { border: 1px solid var(--line); border-radius: var(--radius); background: var(--panel); padding: 10px; display: flex; flex-direction: column; gap: 8px; }
.snd-ed canvas { width: 100%; height: 72px; background: var(--code); border-radius: 6px; display: block; }
.snd-ed canvas.roll { height: 120px; }
.snd-grid { display: grid; grid-template-columns: 64px 1fr 52px; gap: 3px 8px; align-items: center; font-size: 12px; }
.snd-grid label { color: var(--mute); }
.snd-grid input[type=range] { width: 100%; accent-color: var(--accent); }
.snd-grid .v { font: 11.5px var(--mono); text-align: right; }
.snd-bar { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.snd-bar button, .snd-bar select { padding: 4px 9px; font-size: 12.5px; }
.snd-bar button.on { color: var(--accent); border-color: var(--accent); }
.snd-bar input { flex: 1; min-width: 120px; padding: 5px 8px; font-size: 12.5px; }
.snd-bar .grow { margin-right: auto; }
#sndSave.dirty { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
#sndEmpty { color: var(--mute); text-align: center; padding: 30px 10px; display: flex; flex-direction: column; gap: 10px; align-items: center; }
#sndEmpty h3 { margin: 0; color: var(--ink); }
`;

export const SOUND_PANE = `
    <div class="spane" id="pane-sound">
      <div class="stabs"><span class="t">Sound lab</span><button id="stageHide5" title="Hide panel">✕</button></div>
      <div class="sbar">
        <select id="sndFile" title="Sound files in this project"></select>
        <span style="margin-right:auto"></span>
        <button id="sndStop" title="Stop all sound">■ Stop</button>
        <button id="sndSave" title="Write the changes to the sound file; the game reloads with them">Save</button>
      </div>
      <div id="sndBody">
        <div id="sndEmpty"><h3>No sounds yet</h3>Ask Maxx: <i>"add sound effects and spooky music"</i>, or start with a set of game sounds here and tweak them.<button class="primary" id="sndStarter">＋ Add starter sounds</button></div>
        <div id="sndMain" style="display:none">
          <h4><span>Effects</span></h4>
          <div class="snd-bar"><input id="sndAsk" placeholder="New sound: name, then words, e.g. shoot short laser" spellcheck="false"><button id="sndAdd">＋ Add</button></div>
          <div class="snd-list" id="sndFx"></div>
          <h4><span>Music</span><button id="sndAddSong">＋ Song</button></h4>
          <div class="snd-list" id="sndSongs"></div>
          <div id="sndEd"></div>
        </div>
      </div>
    </div>`;

export const SOUND_RAIL = `<button data-tab="sound" title="Sound lab">🔊<span class="dot" id="dotSound"></span></button>`;

export const SOUND_JS = String.raw`
const soundLab = (() => {
  ${ENGINE_JS}
  const E = MaxxSound;
  let files = [], file = "", bank = null, dirty = false, sel = null; // sel: { group, name }
  let ac = null, playing = null, rollTimer = 0, project = "";

  function audio() { if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === "suspended") ac.resume(); return ac; }
  function stop() { if (playing) { try { playing.src.stop(); } catch {} playing = null; } cancelAnimationFrame(rollTimer); renderLists(); }
  function playData(data, loop, key) {
    stop();
    const a = audio(), b = a.createBuffer(1, data.length, a.sampleRate);
    b.getChannelData(0).set(data);
    const src = a.createBufferSource(); src.buffer = b; src.loop = !!loop; src.connect(a.destination); src.start();
    playing = { src, key, at: a.currentTime, dur: b.duration, loop: !!loop };
    src.onended = () => { if (playing && playing.src === src) { playing = null; renderLists(); } };
    renderLists();
    return playing;
  }
  const keyOf = (g, n) => g + ":" + n;
  function render(g, n) {
    const rate = audio().sampleRate;
    return g === "sfx" ? E.renderSfx(bank.sfx[n], rate) : E.renderSong(bank[g][n], rate);
  }
  function play(g, n) {
    const k = keyOf(g, n);
    if (playing && playing.key === k && g === "music") return stop();
    playData(render(g, n), g === "music", k);
    if (g === "music" && sel && sel.group === "music" && sel.name === n) roll();
  }

  function touch() { dirty = true; $("sndSave").classList.add("dirty"); $("sndSave").textContent = "Save"; }
  function load(m) {
    files = m.files || []; file = m.file || "";
    bank = m.bank; dirty = false;
    $("sndSave").classList.remove("dirty");
    $("sndFile").innerHTML = files.map((f) => '<option' + (f === file ? " selected" : "") + ">" + esc(f) + "</option>").join("");
    $("sndFile").style.visibility = files.length > 1 ? "" : "hidden";
    $("sndEmpty").style.display = bank ? "none" : "";
    $("sndMain").style.display = bank ? "" : "none";
    if (sel && (!bank || !bank[sel.group] || !bank[sel.group][sel.name])) sel = null;
    renderLists(); editor();
  }

  function row(g, n, desc) {
    const d = document.createElement("div");
    const k = keyOf(g, n), on = playing && playing.key === k;
    d.className = "snd-row" + (sel && sel.group === g && sel.name === n ? " on" : "");
    d.innerHTML = '<button class="play" title="Play">' + (on && g === "music" ? "■" : "▶") + '</button><span class="nm">' + esc(n) + '</span><span class="ds">' + esc(desc) + "</span>" +
      (g === "sfx" ? '<button class="dice" title="Another take">🎲</button>' : "") + '<button class="del" title="Delete">✕</button>';
    d.querySelector(".play").onclick = (e) => { e.stopPropagation(); play(g, n); };
    const dice = d.querySelector(".dice");
    if (dice) dice.onclick = (e) => { e.stopPropagation(); bank.sfx[n] = E.mutate(bank.sfx[n], 0.25, Date.now()); touch(); select(g, n); play(g, n); };
    d.querySelector(".del").onclick = (e) => { e.stopPropagation(); delete bank[g][n]; if (sel && sel.name === n) sel = null; touch(); renderLists(); editor(); };
    d.onclick = () => { select(g, n); play(g, n); };
    return d;
  }
  function renderLists() {
    if (!bank) return;
    const fx = $("sndFx"), songs = $("sndSongs");
    fx.innerHTML = ""; songs.innerHTML = "";
    for (const n of Object.keys(bank.sfx)) fx.appendChild(row("sfx", n, E.describeSfx(bank.sfx[n])));
    for (const n of Object.keys(bank.jingles)) fx.appendChild(row("jingles", n, "♪ " + E.describeSong(bank.jingles[n])));
    for (const n of Object.keys(bank.music)) songs.appendChild(row("music", n, E.describeSong(bank.music[n])));
    if (!Object.keys(bank.music).length) songs.innerHTML = '<div class="status">No songs yet.</div>';
  }
  function select(g, n) { sel = { group: g, name: n }; renderLists(); editor(); }

  // ---- editors ----
  function slider(grid, label, key, val, range, onInput, onChange) {
    const l = document.createElement("label"); l.textContent = label;
    const r = document.createElement("input"); r.type = "range"; r.min = range[0]; r.max = range[1]; r.step = range[2]; r.value = val;
    const v = document.createElement("span"); v.className = "v"; v.textContent = fmt(val);
    r.oninput = () => { v.textContent = fmt(Number(r.value)); onInput(Number(r.value)); };
    r.onchange = onChange;
    grid.append(l, r, v);
  }
  const fmt = (x) => Math.abs(x) >= 100 ? String(Math.round(x)) : String(Math.round(x * 1000) / 1000);
  const LABELS = { freq: "pitch", to: "glide to", attack: "attack", sustain: "hold", decay: "fade", punch: "punch", duty: "width", vibrato: "vibrato", vibRate: "vib speed", arp: "jump st", arpAt: "jump at", repeat: "repeat", lowpass: "low-pass", highpass: "high-pass", crush: "crunch", echo: "echo", volume: "volume" };

  function editor() {
    const box = $("sndEd"); box.innerHTML = "";
    if (!sel || !bank) return;
    const ed = document.createElement("div"); ed.className = "snd-ed"; box.appendChild(ed);
    if (sel.group === "sfx") sfxEditor(ed, sel.name); else songEditor(ed, sel.group, sel.name);
  }

  function sfxEditor(ed, n) {
    const p = E.fill(bank.sfx[n]);
    const head = document.createElement("div"); head.className = "snd-bar";
    head.innerHTML = '<b class="grow">' + esc(n) + "</b>" + E.WAVES.map((w) => '<button data-w="' + w + '"' + (p.wave === w ? ' class="on"' : "") + ">" + w + "</button>").join("");
    ed.appendChild(head);
    const cv = document.createElement("canvas"); ed.appendChild(cv);
    const grid = document.createElement("div"); grid.className = "snd-grid"; ed.appendChild(grid);
    const words = document.createElement("div"); words.className = "snd-bar";
    words.innerHTML = '<input placeholder="Describe a change: deeper, shorter, crunchy, echo, rising..." spellcheck="false"><button data-a="words">Apply</button><button data-a="mutate" title="Nudge every number">🎲</button><button data-a="wav" title="Download as a .wav file">⬇ wav</button>';
    ed.appendChild(words);
    const commit = (q) => { bank.sfx[n] = E.tidy(q); touch(); renderLists(); };
    const draw = () => wave(cv, E.renderSfx(bank.sfx[n], 22050));
    for (const k of Object.keys(E.RANGES)) {
      slider(grid, LABELS[k] || k, k, p[k], E.RANGES[k], (v) => { const q = E.fill(bank.sfx[n]); q[k] = v; commit(q); draw(); }, () => play("sfx", n));
    }
    for (const b of head.querySelectorAll("button")) b.onclick = () => { const q = E.fill(bank.sfx[n]); q.wave = b.dataset.w; commit(q); editor(); play("sfx", n); };
    const input = words.querySelector("input");
    const apply = () => { const q = E.fill(bank.sfx[n]); const used = E.applyWords(q, input.value); if (!used.length) { input.value = ""; input.placeholder = "Try words like deeper, softer, crunchy, echo, wobbly, rising"; return; } commit(q); editor(); play("sfx", n); };
    words.querySelector('[data-a="words"]').onclick = apply;
    input.onkeydown = (e) => { if (e.key === "Enter") apply(); };
    words.querySelector('[data-a="mutate"]').onclick = () => { bank.sfx[n] = E.mutate(bank.sfx[n], 0.2, Date.now()); touch(); editor(); play("sfx", n); };
    words.querySelector('[data-a="wav"]').onclick = () => download(n + ".wav", E.toWav(E.renderSfx(bank.sfx[n], 44100), 44100));
    requestAnimationFrame(draw);
  }

  function songEditor(ed, g, n) {
    const r = E.recipe(bank[g][n]);
    const head = document.createElement("div"); head.className = "snd-bar";
    const opts = (list, cur) => list.map((x) => '<option' + (x === cur ? " selected" : "") + ">" + x + "</option>").join("");
    head.innerHTML = '<b class="grow">' + esc(n) + "</b>" +
      (g === "jingles" ? '<select data-k="jingle" title="Kind">' + opts(E.JINGLES, r.jingle) + "</select>" : "") +
      '<select data-k="mood" title="Mood">' + opts(E.MOODS, r.mood) + '</select><select data-k="key" title="Key">' + opts(E.KEYS, r.key) + "</select>" +
      (g === "music" ? '<select data-k="bars" title="Bars">' + opts(["4", "8", "12", "16"], String(r.bars)) + "</select>" : "");
    ed.appendChild(head);
    const cv = document.createElement("canvas"); cv.className = "roll"; ed.appendChild(cv);
    const grid = document.createElement("div"); grid.className = "snd-grid"; ed.appendChild(grid);
    const bar = document.createElement("div"); bar.className = "snd-bar"; ed.appendChild(bar);
    bar.innerHTML = (g === "music" ? E.PARTS.map((p) => '<button data-p="' + p + '"' + ((r.drop || []).includes(p) ? "" : ' class="on"') + ' title="Turn this part on or off">' + p + "</button>").join("") : "") +
      '<span class="grow"></span><button data-a="seed" title="A new tune in the same mood">🎲 New tune</button><button data-a="wav" title="Download as a .wav file">⬇ wav</button>';
    const commit = (q, replay) => { bank[g][n] = E.recipe(q); if (g === "jingles") delete bank[g][n].bars; touch(); renderLists(); editor(); if (replay) play(g, n); };
    slider(grid, "tempo", "bpm", r.bpm, [50, 240, 1], () => {}, (e) => commit(Object.assign({}, r, { bpm: Number(e.target.value) }), true));
    for (const s of head.querySelectorAll("select")) s.onchange = () => { const q = Object.assign({}, r); q[s.dataset.k] = s.dataset.k === "bars" ? Number(s.value) : s.value; if (s.dataset.k === "mood") delete q.bpm; commit(q, true); };
    for (const b of bar.querySelectorAll("[data-p]")) b.onclick = () => { const drop = new Set(r.drop || []); drop.has(b.dataset.p) ? drop.delete(b.dataset.p) : drop.add(b.dataset.p); commit(Object.assign({}, r, { drop: [...drop] }), true); };
    bar.querySelector('[data-a="seed"]').onclick = () => commit(Object.assign({}, r, { seed: Math.floor(Math.random() * 100000) }), true);
    bar.querySelector('[data-a="wav"]').onclick = () => download(n + ".wav", E.toWav(E.renderSong(bank[g][n], 44100), 44100));
    requestAnimationFrame(() => pianoRoll(cv, E.compose(bank[g][n])));
    if (playing && playing.key === keyOf(g, n)) roll();
  }

  // ---- drawing ----
  function size(cv) { const w = cv.clientWidth * devicePixelRatio, h = cv.clientHeight * devicePixelRatio; cv.width = w; cv.height = h; return [w, h]; }
  const css = (v) => getComputedStyle(document.body).getPropertyValue(v).trim() || "#888";
  function wave(cv, data) {
    const [w, h] = size(cv), c = cv.getContext("2d");
    c.clearRect(0, 0, w, h); c.fillStyle = css("--accent");
    const per = data.length / w;
    for (let x = 0; x < w; x++) {
      let lo = 0, hi = 0;
      for (let i = Math.floor(x * per); i < Math.floor((x + 1) * per); i++) { const v = data[i] || 0; if (v < lo) lo = v; if (v > hi) hi = v; }
      c.fillRect(x, h / 2 - hi * h / 2, 1, Math.max(1, (hi - lo) * h / 2));
    }
  }
  const PART_COLORS = { lead: "--accent", arp: "--ok", bass: "#1c7ed6", drums: "--mute" };
  function pianoRoll(cv, song, head) {
    const [w, h] = size(cv), c = cv.getContext("2d");
    c.clearRect(0, 0, w, h);
    const notes = [].concat(song.parts.lead, song.parts.arp, song.parts.bass).map((x) => x.n);
    if (!song.steps) return;
    const lo = Math.min.apply(null, notes.concat([48])) - 1, hi = Math.max.apply(null, notes.concat([72])) + 1;
    const drumH = 10 * devicePixelRatio, rows = h - drumH - 4, sx = w / song.steps, ny = rows / (hi - lo);
    c.globalAlpha = 0.15; c.fillStyle = css("--ink");
    for (let b = 0; b < song.steps; b += 16) c.fillRect(b * sx, 0, 1, h);
    c.globalAlpha = 0.9;
    for (const part of ["bass", "arp", "lead"]) {
      const col = PART_COLORS[part]; c.fillStyle = col.startsWith("--") ? css(col) : col;
      c.globalAlpha = part === "arp" ? 0.45 : 0.9;
      for (const x of song.parts[part]) c.fillRect(x.at * sx, rows - (x.n - lo) * ny, Math.max(1.5, x.len * sx - 1), Math.max(2, ny));
    }
    c.globalAlpha = 0.6; c.fillStyle = css("--mute");
    for (const x of song.parts.drums) { const y = x.n === "k" ? h - drumH : x.n === "s" ? h - drumH * 0.66 : h - drumH * 0.33; c.fillRect(x.at * sx, y, Math.max(1.5, sx * 0.6), drumH * 0.3); }
    c.globalAlpha = 1;
    if (head !== undefined) { c.fillStyle = css("--bad"); c.fillRect(head * w, 0, 2 * devicePixelRatio, h); }
  }
  function roll() {
    cancelAnimationFrame(rollTimer);
    const cv = document.querySelector("#sndEd canvas.roll");
    if (!cv || !playing || !sel) return;
    const song = E.compose(bank[sel.group][sel.name]);
    const tick = () => {
      if (!playing || !cv.isConnected) return;
      let t = (ac.currentTime - playing.at) / playing.dur;
      if (playing.loop) t %= 1; else if (t > 1) return pianoRoll(cv, song);
      pianoRoll(cv, song, t);
      rollTimer = requestAnimationFrame(tick);
    };
    tick();
  }
  function download(name, bytes) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([bytes], { type: "audio/wav" }));
    a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }

  // ---- wiring ----
  function addFromText() {
    const text = $("sndAsk").value.trim();
    if (!text || !bank) return;
    const [first, ...rest] = text.split(/\s+/);
    const name = first.replace(/[^\w-]/g, "_");
    const describe = rest.join(" ") || first;
    const kind = E.kindOf(describe) || E.kindOf(name);
    if (kind && E.JINGLES.includes(kind)) {
      const key = (Object.values(bank.music)[0] || {}).key;
      bank.jingles[name] = E.recipe({ mood: E.moodOf(describe), jingle: kind, key });
      delete bank.jingles[name].bars;
      select("jingles", name);
    } else {
      bank.sfx[name] = E.makeSfx(name, describe).params;
      select("sfx", name);
    }
    $("sndAsk").value = ""; touch(); play(sel.group, name);
  }
  $("sndAdd").onclick = addFromText;
  $("sndAsk").onkeydown = (e) => { if (e.key === "Enter") addFromText(); };
  $("sndAddSong").onclick = () => {
    let i = 1; while (bank.music["song" + i]) i++;
    const moods = E.MOODS, mood = moods[Math.floor(Math.random() * moods.length)];
    bank.music["song" + i] = E.recipe({ mood, seed: Math.floor(Math.random() * 100000) });
    touch(); select("music", "song" + i); play("music", "song" + i);
  };
  $("sndStop").onclick = stop;
  $("sndSave").onclick = () => { if (!bank || !file) return; send({ type: "soundSave", file, bank }); $("sndSave").textContent = "Saving…"; };
  $("sndStarter").onclick = () => send({ type: "soundNew" });
  $("sndFile").onchange = () => { if (dirty && !confirm("Drop unsaved sound changes?")) return; send({ type: "soundList", file: $("sndFile").value }); };

  return {
    shown() { send({ type: "soundList", file }); },
    on(m) {
      if (m.type === "sounds") {
        if (dirty && m.file === file && !m.saved) return; // keep edits the person hasn't saved
        load(m);
        if (m.saved) { $("sndSave").textContent = "Saved ✓"; }
        return;
      }
      if (m.type === "toolEnd" && m.name === "make_sounds" && !/^error/i.test(m.result || "")) {
        send({ type: "soundList" });
        if (!$("pane-sound").classList.contains("on") || !$("stage").classList.contains("on")) $("dotSound").classList.add("on");
        return;
      }
      // A new project (or the first connect): look for its sounds.
      if (m.type === "stage") {
        const now = m.base + "|" + (state && state.current ? state.current.cwd : "");
        if (now !== project) { project = now; sel = null; stop(); send({ type: "soundList" }); }
      }
    },
  };
})();
`;
