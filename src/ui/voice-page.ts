// The mic in the composer (see voice.ts): CSS, markup and script that page.ts
// splices into its one page. Like stage-page.ts, the script is a raw string
// that must not use backticks, and the markup stays a plain string.

export const VOICE_CSS = `
.mic { position: relative; width: 44px; height: 64px; flex: none; padding: 0; font-size: 20px; border-radius: 8px; }
.mic.on { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); box-shadow: 0 0 0 calc(var(--lvl, 0) * 14px) color-mix(in srgb, var(--accent) 30%, transparent); transition: box-shadow .08s; }
.mic.busy { color: var(--accent); }
.mic.busy::after { content: ""; position: absolute; inset: 6px; border: 2px solid var(--accent); border-right-color: transparent; border-radius: 50%; animation: micspin .8s linear infinite; }
.mic.off { opacity: .45; }
@keyframes micspin { to { transform: rotate(360deg); } }
.micwrap { position: relative; display: flex; flex-direction: column; gap: 4px; }
.micmore { padding: 0; height: 16px; font-size: 10px; line-height: 1; border: 0; background: none; color: var(--mute); }
#micMenu { display: none; position: absolute; bottom: 74px; left: 0; z-index: 5; width: 300px; background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius); box-shadow: 0 8px 24px rgba(0,0,0,.18); padding: 10px 12px; font-size: 13px; }
#micMenu.on { display: block; }
#micMenu h4 { margin: 4px 0 6px; font-size: 12px; color: var(--mute); font-weight: 600; text-transform: uppercase; letter-spacing: .4px; }
#micMenu label { display: flex; gap: 8px; align-items: flex-start; padding: 3px 0; cursor: pointer; }
#micMenu label.dis { opacity: .5; cursor: default; }
#micMenu .tip { color: var(--mute); font-size: 12px; margin-top: 8px; border-top: 1px solid var(--line); padding-top: 8px; }
#micHint { display: none; align-items: center; gap: 8px; padding: 6px 16px; border-top: 1px solid var(--line); background: var(--user); font-size: 13px; }
#micHint.on { display: flex; }
#micHint .bar { flex: 1; height: 3px; background: var(--line); border-radius: 3px; overflow: hidden; }
#micHint .bar i { display: block; height: 100%; width: 0; background: var(--accent); }
#micHint.go .bar i { width: 100%; transition: width var(--wait, 1.6s) linear; }
#micHint button { padding: 2px 10px; font-size: 12px; }
`;

export const VOICE_HINT = `<div id="micHint"><span id="micText"></span><span class="bar"><i></i></span><button id="micNow">Send now</button><button id="micEdit">Edit</button></div>`;

export const VOICE_HTML = `
    <div class="micwrap">
      <button class="mic" id="micBtn" title="Talk to Maxx (Ctrl+Space)">🎙</button>
      <button class="micmore" id="micMore" title="Voice settings">▾ voice</button>
      <div id="micMenu">
        <h4>Listen with</h4>
        <label><input type="radio" name="micEngine" value="auto"> Best available</label>
        <label id="micBrowserRow"><input type="radio" name="micEngine" value="browser"> <span>Edge speech recognition<br><span class="dim">built in; sends audio to Microsoft</span></span></label>
        <label id="micWhisperRow"><input type="radio" name="micEngine" value="whisper"> <span>Local Whisper<br><span class="dim" id="micWhisperNote"></span></span></label>
        <h4>After you speak</h4>
        <label><input type="checkbox" id="micAuto"> Send when I stop talking</label>
        <label><input type="checkbox" id="micRebuild"> <span>Rebuild and show the result<br><span class="dim">on the live phone, or the preview at phone size</span></span></label>
        <label><input type="checkbox" id="micSpeak"> Read Maxx's reply aloud</label>
        <div class="tip">Click to talk, or hold to talk and let go. Ctrl+Space works too. Say "stop" to stop Maxx, "send" to send, "cancel" to clear.</div>
      </div>
    </div>`;

export const VOICE_JS = String.raw`
const voice = (() => {
  const btn = $("micBtn"), menu = $("micMenu"), input = $("input");
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let prefs = { engine: "auto", autoSend: true, rebuild: true, speak: false };
  try { Object.assign(prefs, JSON.parse(localStorage.getItem("maxx.voice") || "{}")); } catch {}
  const keep = () => { try { localStorage.setItem("maxx.voice", JSON.stringify(prefs)); } catch {} };
  let whisper = null;     // what the server says its local Whisper is, or null
  let rec = null;         // the recording in progress: { stop, cancel }
  let base = "";          // what was already typed when the recording started
  let spoken = false;     // the text in the box came from the mic
  let timer = null;       // the countdown before an automatic send
  let downAt = 0;

  function engine() {
    if (prefs.engine === "whisper" && whisper) return "whisper";
    if (prefs.engine === "browser" && SR) return "browser";
    return whisper ? "whisper" : SR ? "browser" : null;
  }
  function paint(s) {
    btn.className = "mic" + (s ? " " + s : "") + (engine() ? "" : " off");
    btn.style.setProperty("--lvl", 0);
    const e = engine();
    btn.title = !e ? "Voice needs Edge's speech recognition or a local Whisper (run: maxx doctor voice)" :
      s === "on" ? "Listening… click to stop" : s === "busy" ? "Turning speech into text…" :
      "Talk to Maxx (Ctrl+Space) · " + (e === "whisper" ? "local Whisper" : "Edge speech");
  }
  function show(t) { input.value = base + (base && t ? " " : "") + t; input.scrollTop = input.scrollHeight; }
  function hint(text, opts) {
    const h = $("micHint");
    clearTimeout(timer); timer = null;
    h.classList.remove("go");
    if (!text) { h.classList.remove("on"); return; }
    $("micText").textContent = text;
    $("micNow").style.display = $("micEdit").style.display = opts && opts.send ? "" : "none";
    h.classList.add("on");
    if (opts && opts.send) {
      void h.offsetWidth; h.classList.add("go");
      timer = setTimeout(() => { hint(""); submit(); }, 1600);
    } else if (!opts || !opts.stay) timer = setTimeout(() => h.classList.remove("on"), 4000);
  }

  // Short spoken commands act on the window instead of going to the model.
  function command(t) {
    const w = t.toLowerCase().replace(/[^a-z ]/g, "").replace(/\s+/g, " ").trim().replace(/^(hey |ok |okay )?maxx /, "").replace(/ maxx$/, "");
    if (/^(stop|stop it|stop now|halt)$/.test(w)) { if (busy) send({ type: "stop" }); hint(busy ? "Stopping…" : "Nothing to stop"); return true; }
    if (/^(send|send it|go|go ahead|do it)$/.test(w)) { show(""); if (input.value.trim()) submit(); return true; }
    if (/^(cancel|clear|never mind|nevermind|scratch that)$/.test(w)) { base = ""; show(""); spoken = false; hint(""); return true; }
    if (/^(new session|start over|new chat)$/.test(w)) { show(""); $("newBtn").click(); return true; }
    return false;
  }

  function done(text) {
    rec = null; paint("");
    text = String(text || "").trim();
    if (!text) { show(""); return hint("Didn't catch that. Try again, a little closer to the mic."); }
    if (command(text)) return;
    show(text); spoken = true;
    if (busy) return hint("Maxx is still working. Say \"stop\" to stop it, or send this when it is done.");
    if (prefs.autoSend) hint("“" + text.slice(0, 90) + (text.length > 90 ? "…" : "") + "”", { send: true });
  }
  function fail(msg) { rec = null; paint(""); show(""); hint("🎙 " + msg, { stay: true }); }

  function start() {
    const e = engine();
    if (!e) return fail("Voice needs Edge's speech recognition or a local Whisper. Run maxx doctor voice to set one up.");
    if (window.speechSynthesis) speechSynthesis.cancel();
    hint("");
    base = input.value.trim();
    paint("on");
    (e === "whisper" ? whisperRec : browserRec)();
  }

  // Edge's recognizer: words appear as you say them.
  function browserRec() {
    const r = new SR();
    r.lang = navigator.language || "en-US"; r.interimResults = true; r.continuous = false; r.maxAlternatives = 1;
    let final = "", err = "", cancelled = false;
    r.onresult = (ev) => {
      let interim = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) { const t = ev.results[i][0].transcript; if (ev.results[i].isFinal) final += t; else interim += t; }
      show((final + interim).trim());
    };
    r.onerror = (ev) => { err = ev.error; };
    r.onend = () => {
      if (cancelled) { rec = null; paint(""); show(""); return; }
      if (err === "not-allowed" || err === "service-not-allowed") return fail("The microphone is blocked. Allow it for this window (the icon at the right of the title bar).");
      if (err === "network") return fail(whisper ? "Edge's speech service is unreachable; switch to Local Whisper under ▾ voice." : "Edge's speech service is unreachable (it runs online). For offline voice set up a local Whisper: maxx doctor voice.");
      if (err && err !== "no-speech" && err !== "aborted") return fail("Speech recognition failed: " + err);
      done(final);
    };
    try { r.start(); } catch (x) { return fail(x.message); }
    rec = { stop: () => r.stop(), cancel: () => { cancelled = true; r.abort(); } };
  }

  // Local Whisper: record 16 kHz mono, stop after a pause, send it to Maxx.
  async function whisperRec() {
    let stream;
    rec = { stop: () => {}, cancel: () => {} };
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true } }); }
    catch (x) { return fail("The microphone is blocked or missing: " + x.message); }
    const ctx = new AudioContext({ sampleRate: 16000 });
    const src = ctx.createMediaStreamSource(stream);
    const node = ctx.createScriptProcessor(2048, 1, 1);
    const chunks = [];
    const t0 = performance.now();
    let heard = false, quiet = 0, floor = 0.01, ended = false, cancelled = false;
    node.onaudioprocess = (ev) => {
      if (ended) return;
      const d = ev.inputBuffer.getChannelData(0);
      chunks.push(new Float32Array(d));
      let sum = 0; for (let i = 0; i < d.length; i++) sum += d[i] * d[i];
      const rms = Math.sqrt(sum / d.length), now = performance.now();
      // The first moments set the room's noise level (capped, in case you start talking at once).
      if (now - t0 < 400) floor = Math.min(0.03, Math.max(floor, rms * 1.5));
      btn.style.setProperty("--lvl", Math.min(1, rms * 8).toFixed(2));
      if (rms > Math.max(0.02, floor * 2)) { heard = true; quiet = 0; }
      else if (heard && !quiet) quiet = now;
      if ((heard && quiet && now - quiet > 1300) || now - t0 > 60000 || (!heard && now - t0 > 8000)) finish();
    };
    src.connect(node); node.connect(ctx.destination);
    async function finish() {
      if (ended) return;
      ended = true;
      node.disconnect(); src.disconnect(); stream.getTracks().forEach((t) => t.stop());
      const rate = ctx.sampleRate; ctx.close();
      if (cancelled) { rec = null; paint(""); return; }
      if (!heard) return done("");
      paint("busy"); show("…");
      let n = 0; for (const c of chunks) n += c.length;
      let all = new Float32Array(n), o = 0; for (const c of chunks) { all.set(c, o); o += c.length; }
      if (rate !== 16000) all = resample(all, rate, 16000);
      try {
        const res = await fetch("/voice?t=" + token, { method: "POST", headers: { "content-type": "audio/wav" }, body: wav(all) });
        const j = await res.json();
        if (!res.ok) throw new Error(j.error || res.statusText);
        done(j.text);
      } catch (x) { fail("Whisper: " + x.message); }
    }
    rec = { stop: finish, cancel: () => { cancelled = true; finish(); } };
  }
  function resample(s, from, to) {
    const out = new Float32Array(Math.floor(s.length * to / from));
    for (let i = 0; i < out.length; i++) out[i] = s[Math.floor(i * from / to)];
    return out;
  }
  function wav(s) {
    const b = new DataView(new ArrayBuffer(44 + s.length * 2));
    const str = (o, t) => { for (let i = 0; i < t.length; i++) b.setUint8(o + i, t.charCodeAt(i)); };
    str(0, "RIFF"); b.setUint32(4, 36 + s.length * 2, true); str(8, "WAVEfmt "); b.setUint32(16, 16, true);
    b.setUint16(20, 1, true); b.setUint16(22, 1, true); b.setUint32(24, 16000, true); b.setUint32(28, 32000, true);
    b.setUint16(32, 2, true); b.setUint16(34, 16, true); str(36, "data"); b.setUint32(40, s.length * 2, true);
    for (let i = 0; i < s.length; i++) b.setInt16(44 + i * 2, Math.max(-1, Math.min(1, s[i])) * 0x7fff, true);
    return b.buffer;
  }

  function toggle() { if (rec) rec.stop(); else start(); }
  btn.onpointerdown = (e) => { e.preventDefault(); downAt = Date.now(); toggle(); };
  // Held down: let go to stop. A click leaves it listening.
  btn.onpointerup = () => { if (rec && Date.now() - downAt > 450) rec.stop(); };
  addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.code === "Space") { e.preventDefault(); toggle(); }
    else if (e.key === "Escape" && (rec || timer)) { if (rec) rec.cancel(); hint(""); }
  });
  input.addEventListener("input", () => { if (timer) hint(""); if (!input.value.trim()) spoken = false; });
  $("micNow").onclick = () => { hint(""); submit(); };
  $("micEdit").onclick = () => { hint(""); input.focus(); };

  // Settings
  $("micMore").onclick = (e) => { e.stopPropagation(); menu.classList.toggle("on"); };
  document.addEventListener("click", (e) => { if (!menu.contains(e.target)) menu.classList.remove("on"); });
  function drawMenu() {
    for (const r of document.querySelectorAll("input[name=micEngine]")) {
      r.checked = r.value === prefs.engine;
      r.disabled = (r.value === "whisper" && !whisper) || (r.value === "browser" && !SR);
      r.onchange = () => { prefs.engine = r.value; keep(); paint(""); };
    }
    $("micBrowserRow").classList.toggle("dis", !SR);
    $("micWhisperRow").classList.toggle("dis", !whisper);
    $("micWhisperNote").textContent = whisper ? whisper + "; offline" : "not set up: run maxx doctor voice";
    const box = (id, k) => { $(id).checked = !!prefs[k]; $(id).onchange = () => { prefs[k] = $(id).checked; keep(); }; };
    box("micAuto", "autoSend"); box("micRebuild", "rebuild"); box("micSpeak", "speak");
  }
  drawMenu(); paint("");

  return {
    // What a send carries: whether it was spoken, and whether to rebuild after.
    flags() { const f = spoken ? { voice: true, rebuild: !!prefs.rebuild } : {}; spoken = false; base = ""; return f; },
    on(m) {
      if (m.type === "state") { const w = m.voice && m.voice.whisper; if (w !== whisper) { whisper = w; drawMenu(); paint(rec ? "on" : ""); } }
      if (m.type === "voiceShow") { if (m.where === "phone") stage.phone(); else stage.phoneView(); }
      if (m.type === "speak" && prefs.speak && m.text && window.speechSynthesis) {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(m.text); u.lang = navigator.language || "en-US"; u.rate = 1.05;
        speechSynthesis.speak(u);
      }
    },
  };
})();
`;
