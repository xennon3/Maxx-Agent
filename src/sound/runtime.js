// The player games use: plays SOUND_BANK's effects, jingles and songs through
// WebAudio. Sounds are drawn the first time they play and kept.
var Sound = (function () {
  "use strict";
  var bank = typeof SOUND_BANK !== "undefined" ? SOUND_BANK : { sfx: {}, jingles: {}, music: {} };
  var ctx = null, master = null, musicGain = null, cache = {}, current = null, wanted = null;
  var muted = false, vol = 0.8, musicVol = 0.6;
  try { muted = localStorage.getItem("sound-muted") === "1"; } catch (e) {}

  function audio() {
    if (ctx) return ctx;
    var AC = typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext);
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = muted ? 0 : vol; master.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.gain.value = musicVol; musicGain.connect(master);
    return ctx;
  }

  function buffer(kind, name) {
    var id = kind + ":" + name;
    if (cache[id]) return cache[id];
    var rate = ctx.sampleRate, data;
    if (kind === "sfx") data = MaxxSound.renderSfx(bank.sfx[name], rate);
    else data = MaxxSound.renderSong(kind === "jingle" ? bank.jingles[name] : bank.music[name], rate);
    var b = ctx.createBuffer(1, data.length, rate);
    b.getChannelData(0).set(data);
    return (cache[id] = b);
  }

  // Browsers only let a page make sound after the player clicks or presses a
  // key, so a song asked for earlier starts on the first one.
  function unlock() {
    if (!audio()) return;
    if (ctx.state === "suspended") ctx.resume();
    if (wanted && !current) startMusic(wanted);
  }
  if (typeof window !== "undefined") {
    ["pointerdown", "keydown", "touchstart"].forEach(function (e) { window.addEventListener(e, unlock, { capture: true }); });
    window.addEventListener("keydown", function (e) {
      if ((e.key === "m" || e.key === "M") && !e.ctrlKey && !e.metaKey && !/^(INPUT|TEXTAREA|SELECT)$/.test((e.target && e.target.tagName) || "")) Sound.toggleMute();
    });
  }

  function startMusic(name) {
    if (!audio() || ctx.state !== "running") return;
    stopMusic();
    var src = ctx.createBufferSource();
    src.buffer = buffer("music", name);
    src.loop = true;
    src.connect(musicGain);
    src.start();
    current = { name: name, src: src };
  }
  function stopMusic() {
    if (current) { try { current.src.stop(); } catch (e) {} current = null; }
  }

  var Sound = {
    // Play an effect or a jingle by name: Sound.play("eat"). Unknown names are ignored.
    play: function (name, opts) {
      var kind = bank.sfx && bank.sfx[name] ? "sfx" : bank.jingles && bank.jingles[name] ? "jingle" : null;
      if (!kind) { if (typeof console !== "undefined") console.warn("Sound.play: no sound named " + name); return; }
      if (!audio()) return;
      if (ctx.state === "suspended") ctx.resume();
      var src = ctx.createBufferSource();
      src.buffer = buffer(kind, name);
      if (opts && opts.pitch) src.playbackRate.value = opts.pitch;
      var g = ctx.createGain();
      g.gain.value = opts && opts.volume !== undefined ? opts.volume : 1;
      src.connect(g); g.connect(master);
      src.start();
    },
    // Loop a song: Sound.music("theme"). Sound.music() stops it.
    music: function (name) {
      if (!name) { wanted = null; return stopMusic(); }
      if (!bank.music || !bank.music[name]) { if (typeof console !== "undefined") console.warn("Sound.music: no song named " + name); return; }
      wanted = name;
      if (current && current.name === name) return;
      startMusic(name);
    },
    stopMusic: function () { Sound.music(null); },
    mute: function (on) {
      muted = on === undefined ? true : !!on;
      try { localStorage.setItem("sound-muted", muted ? "1" : "0"); } catch (e) {}
      if (master) master.gain.value = muted ? 0 : vol;
    },
    toggleMute: function () { Sound.mute(!muted); return muted; },
    isMuted: function () { return muted; },
    volume: function (v) { vol = Math.max(0, Math.min(1, v)); if (master && !muted) master.gain.value = vol; },
    musicVolume: function (v) { musicVol = Math.max(0, Math.min(1, v)); if (musicGain) musicGain.gain.value = musicVol; },
    names: function () { return { sfx: Object.keys(bank.sfx || {}), jingles: Object.keys(bank.jingles || {}), music: Object.keys(bank.music || {}) }; }
  };
  return Sound;
})();
