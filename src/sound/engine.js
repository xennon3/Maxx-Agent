// Maxx's sound engine: game sound effects and chiptune music made from numbers,
// with no audio files, downloads or models. The same file runs in three places:
// inside games (sound.js), in the app's Sound lab, and in Bun (tests and
// maxx sound), so it is plain browser-safe JavaScript with no imports.
// Keep it free of backticks and of the closing script tag: it is spliced into pages.
var MaxxSound = (function () {
  "use strict";

  // ---- small helpers ------------------------------------------------------

  // A seeded random number generator (mulberry32), so a sound or song made from
  // the same seed comes out the same every time.
  function rng(seed) {
    var a = (seed >>> 0) || 1;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hash(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return h >>> 0;
  }
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  function between(r, lo, hi) { return lo + r() * (hi - lo); }
  function pick(r, list) { return list[Math.floor(r() * list.length) % list.length]; }
  function round(v, digits) { var m = Math.pow(10, digits); return Math.round(v * m) / m; }
  function midiHz(n) { return 440 * Math.pow(2, (n - 69) / 12); }

  // ---- sound effects ------------------------------------------------------

  // Every effect is these numbers. Times are seconds, pitches Hz.
  var WAVES = ["square", "triangle", "saw", "sine", "noise"];
  var DEFAULTS = {
    wave: "square",
    freq: 440,     // start pitch
    to: 440,       // end pitch: the pitch glides here over the sound
    attack: 0,     // fade in
    sustain: 0.1,  // full volume
    decay: 0.2,    // fade out
    punch: 0,      // 0..1 extra loudness at the start of the sustain
    duty: 0.5,     // square width: 0.5 is hollow, 0.1 thin and nasal
    vibrato: 0,    // wobble depth in semitones
    vibRate: 6,    // wobbles per second
    arp: 0,        // jump by this many semitones partway through (a coin's "ding-DING")
    arpAt: 0.3,    // when to jump, as a share of the sound's length
    repeat: 0,     // restart the pitch glide every this many seconds (laser bursts, power-ups)
    lowpass: 0,    // cut highs above this Hz (0: off)
    highpass: 0,   // cut lows below this Hz (0: off)
    crush: 0,      // 0..1 lo-fi crunch
    echo: 0,       // 0..1 echo amount
    volume: 0.5
  };
  // Slider ranges for the Sound lab: [min, max, step].
  var RANGES = {
    freq: [30, 4000, 1], to: [30, 4000, 1], attack: [0, 1, 0.005], sustain: [0, 1.5, 0.005],
    decay: [0, 2, 0.005], punch: [0, 1, 0.01], duty: [0.05, 0.5, 0.01], vibrato: [0, 12, 0.1],
    vibRate: [0, 30, 0.5], arp: [-24, 24, 1], arpAt: [0, 1, 0.01], repeat: [0, 1, 0.005],
    lowpass: [0, 12000, 10], highpass: [0, 4000, 10], crush: [0, 1, 0.01], echo: [0, 0.9, 0.01],
    volume: [0, 1, 0.01]
  };

  function fill(p) {
    var o = {};
    for (var k in DEFAULTS) o[k] = p && p[k] !== undefined && p[k] !== null ? p[k] : DEFAULTS[k];
    if (WAVES.indexOf(o.wave) < 0) o.wave = "square";
    for (var key in RANGES) {
      var v = Number(o[key]);
      o[key] = isFinite(v) ? clamp(v, RANGES[key][0], RANGES[key][1]) : DEFAULTS[key];
    }
    if (o.attack + o.sustain + o.decay < 0.01) o.decay = 0.05;
    return o;
  }

  function length(p) {
    p = fill(p);
    return p.attack + p.sustain + p.decay + (p.echo > 0 ? 0.15 + p.echo * 0.6 : 0);
  }

  // Draw an effect into a Float32Array at rate samples per second.
  function renderSfx(input, rate) {
    rate = rate || 44100;
    var p = fill(input);
    var body = p.attack + p.sustain + p.decay;
    var total = Math.ceil(length(p) * rate);
    var bodyN = Math.ceil(body * rate);
    var out = new Float32Array(total);
    var r = rng(hash(JSON.stringify(p)));
    var phase = 0, noise = 0, slot = -1;
    var lpA = p.lowpass > 0 ? 1 - Math.exp(-2 * Math.PI * p.lowpass / rate) : 1, lp = 0;
    var hpA = p.highpass > 0 ? Math.exp(-2 * Math.PI * p.highpass / rate) : 0, hpIn = 0, hpOut = 0;
    var hold = 1 + Math.floor(p.crush * p.crush * 24), held = 0;
    var bits = Math.pow(2, 16 - Math.round(p.crush * 12));
    var glide = p.to / p.freq;
    var gain = p.volume * (p.wave === "noise" ? 0.9 : p.wave === "square" || p.wave === "saw" ? 0.6 : 1);
    for (var i = 0; i < bodyN; i++) {
      var t = i / rate;
      var tt = p.repeat > 0 ? t % p.repeat : t;
      var span = p.repeat > 0 ? p.repeat : body;
      var f = p.freq * Math.pow(glide, Math.min(1, tt / span));
      if (p.arp && tt >= p.arpAt * span) f *= Math.pow(2, p.arp / 12);
      if (p.vibrato) f *= Math.pow(2, (p.vibrato * Math.sin(2 * Math.PI * p.vibRate * t)) / 12);
      phase += f / rate;
      phase -= Math.floor(phase);
      var s;
      switch (p.wave) {
        case "triangle": s = 4 * Math.abs(phase - 0.5) - 1; break;
        case "saw": s = 2 * phase - 1; break;
        case "sine": s = Math.sin(2 * Math.PI * phase); break;
        case "noise": {
          // New random values 16 times a cycle, so the pitch still shapes the noise.
          var k = Math.floor(phase * 16) + Math.floor(t * f) * 16;
          if (k !== slot) { slot = k; noise = r() * 2 - 1; }
          s = noise; break;
        }
        default: s = phase < p.duty ? 1 : -1;
      }
      var env;
      if (t < p.attack) env = t / p.attack;
      else if (t < p.attack + p.sustain) env = 1 + p.punch * (1 - (t - p.attack) / Math.max(p.sustain, 1e-6));
      else { env = Math.max(0, 1 - (t - p.attack - p.sustain) / Math.max(p.decay, 1e-6)); env *= env; }
      s *= env;
      lp += lpA * (s - lp); s = lp;
      if (hpA) { var h = hpA * (hpOut + s - hpIn); hpIn = s; hpOut = h; s = h; }
      if (hold > 1) { if (i % hold === 0) held = s; s = held; }
      if (p.crush) s = Math.round(s * bits) / bits;
      out[i] = s * gain;
    }
    if (p.echo > 0) {
      var d = Math.floor(rate * 0.11);
      for (var j = d; j < total; j++) out[j] += out[j - d] * p.echo * 0.6;
    }
    for (var m = 0; m < total; m++) out[m] = clamp(out[m], -1, 1);
    return out;
  }

  // ---- making effects from words -------------------------------------------

  // Each kind is a recipe with some randomness, so "coin" with seed 1 and
  // seed 2 are two different coins of the same family.
  var KINDS = {
    coin: function (r) {
      var f = between(r, 800, 1500);
      return { wave: "square", duty: pick(r, [0.25, 0.5]), freq: f, to: f, arp: pick(r, [4, 5, 7, 12]), arpAt: between(r, 0.15, 0.4), sustain: between(r, 0.03, 0.08), decay: between(r, 0.12, 0.25), punch: between(r, 0.3, 0.6) };
    },
    jump: function (r) {
      var f = between(r, 220, 420);
      return { wave: "square", duty: pick(r, [0.25, 0.5]), freq: f, to: f * between(r, 1.8, 2.8), sustain: between(r, 0.05, 0.1), decay: between(r, 0.1, 0.2) };
    },
    laser: function (r) {
      var f = between(r, 900, 1800);
      return { wave: pick(r, ["square", "saw", "square"]), duty: between(r, 0.1, 0.4), freq: f, to: f * between(r, 0.12, 0.3), sustain: between(r, 0.04, 0.12), decay: between(r, 0.06, 0.18), volume: 0.4 };
    },
    explosion: function (r) {
      var f = between(r, 180, 500);
      return { wave: "noise", freq: f, to: f * between(r, 0.15, 0.4), sustain: between(r, 0.08, 0.25), decay: between(r, 0.4, 0.8), punch: between(r, 0.4, 0.8), lowpass: between(r, 1800, 5000), crush: between(r, 0, 0.3), volume: 0.6 };
    },
    powerup: function (r) {
      var f = between(r, 280, 480);
      return { wave: pick(r, ["square", "triangle"]), duty: 0.5, freq: f, to: f * between(r, 2.5, 3.5), repeat: between(r, 0.08, 0.14), sustain: between(r, 0.25, 0.4), decay: between(r, 0.15, 0.3) };
    },
    hurt: function (r) {
      var f = between(r, 300, 600);
      return { wave: pick(r, ["saw", "square", "noise"]), duty: 0.3, freq: f, to: f * between(r, 0.3, 0.5), sustain: between(r, 0.03, 0.08), decay: between(r, 0.1, 0.2), punch: 0.5, crush: between(r, 0.1, 0.3), volume: 0.5 };
    },
    blip: function (r) {
      var f = between(r, 500, 1200);
      return { wave: pick(r, ["square", "triangle"]), duty: 0.5, freq: f, to: f, sustain: between(r, 0.015, 0.04), decay: between(r, 0.02, 0.06), volume: 0.35 };
    },
    select: function (r) {
      var f = between(r, 500, 800);
      return { wave: "square", duty: pick(r, [0.25, 0.5]), freq: f, to: f, arp: 12, arpAt: 0.45, sustain: between(r, 0.04, 0.07), decay: between(r, 0.05, 0.1), volume: 0.4 };
    },
    bounce: function (r) {
      var f = between(r, 160, 280);
      return { wave: pick(r, ["triangle", "square"]), duty: 0.5, freq: f, to: f * between(r, 2.5, 4), vibrato: between(r, 0, 1), vibRate: 18, sustain: between(r, 0.03, 0.07), decay: between(r, 0.1, 0.18) };
    },
    warp: function (r) {
      var f = between(r, 180, 400);
      return { wave: pick(r, ["sine", "triangle"]), freq: f, to: between(r, 1400, 2600), vibrato: between(r, 0.5, 2), vibRate: between(r, 10, 20), attack: 0.02, sustain: between(r, 0.18, 0.35), decay: between(r, 0.15, 0.3), echo: 0.3 };
    },
    alarm: function (r) {
      var f = between(r, 600, 900);
      return { wave: "square", duty: 0.5, freq: f, to: f, vibrato: between(r, 2, 4), vibRate: between(r, 4, 8), sustain: between(r, 0.5, 0.8), decay: 0.1, volume: 0.35 };
    },
    splash: function (r) {
      var f = between(r, 800, 1600);
      return { wave: "noise", freq: f, to: f * between(r, 0.3, 0.6), attack: 0.01, sustain: between(r, 0.05, 0.1), decay: between(r, 0.25, 0.45), highpass: between(r, 300, 900), lowpass: between(r, 3000, 7000), volume: 0.45 };
    }
  };

  // Short tunes that play once, in a key and mood. They live with the songs.
  var JINGLES = ["win", "levelup", "gameover"];

  // Words people (and small models) use for each kind. Longer phrases first.
  var WORDS = [
    ["levelup", ["level up", "level-up", "levelup", "next level", "rank up"]],
    ["gameover", ["game over", "game-over", "gameover", "defeat", "you lose", "lose", "lost", "fail", "death jingle"]],
    ["win", ["you win", "victory", "fanfare", "win", "winner", "complete", "cleared", "success", "celebrat"]],
    ["powerup", ["power up", "power-up", "powerup", "upgrade", "bonus", "grow", "heal", "extra life", "1up", "magic"]],
    ["explosion", ["explosion", "explode", "boom", "blast", "bomb", "crash", "destroy", "smash", "break", "thunder", "rumble"]],
    ["laser", ["laser", "shoot", "shot", "zap", "pew", "fire", "blaster", "gun", "bullet", "beam"]],
    ["coin", ["coin", "pickup", "pick up", "collect", "eat", "gem", "point", "ding", "score", "ring", "treasure", "food", "star"]],
    ["jump", ["jump", "hop", "leap", "flap", "fly"]],
    ["hurt", ["hurt", "hit", "damage", "ouch", "die", "death", "dead", "lose life", "wrong", "error", "bump", "crash into"]],
    ["bounce", ["bounce", "boing", "spring", "paddle", "ball", "wall"]],
    ["warp", ["warp", "teleport", "portal", "whoosh", "swoosh", "dash", "spawn", "appear", "vanish"]],
    ["alarm", ["alarm", "siren", "warning", "alert", "timer", "countdown", "danger"]],
    ["splash", ["splash", "water", "swim", "drop", "rain"]],
    ["select", ["select", "menu", "confirm", "ok", "start", "button", "click", "choose", "pause"]],
    ["blip", ["blip", "beep", "tick", "turn", "move", "step", "type", "text", "talk", "chat", "cursor", "tap", "place"]]
  ];

  function kindOf(text) {
    var t = " " + String(text || "").toLowerCase().replace(/[_]+/g, " ") + " ";
    for (var i = 0; i < WORDS.length; i++) {
      var list = WORDS[i][1];
      for (var j = 0; j < list.length; j++) if (t.indexOf(list[j]) >= 0) return WORDS[i][0];
    }
    return null;
  }

  // Adjectives that nudge a sound: "deep crunchy explosion", "short soft blip".
  var TWEAKS = [
    [["higher", "high", "squeaky", "tiny", "small", "little", "cute", "chirp"], function (p) { p.freq *= 1.6; p.to *= 1.6; }],
    [["lower", "low", "deep", "big", "huge", "heavy", "bass", "giant", "boss"], function (p) { p.freq *= 0.55; p.to *= 0.55; }],
    [["shorter", "short", "quick", "snappy", "tight", "fast"], function (p) { p.sustain *= 0.55; p.decay *= 0.55; p.repeat *= 0.7; }],
    [["longer", "long", "slow", "lingering", "epic"], function (p) { p.sustain *= 1.7; p.decay *= 1.7; p.repeat *= 1.3; }],
    [["softer", "soft", "quiet", "gentle", "subtle"], function (p) { p.volume *= 0.55; }],
    [["louder", "loud", "strong"], function (p) { p.volume = Math.min(1, p.volume * 1.4); }],
    [["crunchy", "gritty", "8-bit", "8bit", "lofi", "lo-fi", "retro", "dirty", "bitcrush"], function (p) { p.crush = Math.min(1, p.crush + 0.45); }],
    [["smooth", "clean", "pure", "round", "mellow"], function (p) { if (p.wave !== "noise") p.wave = pick(rng(p.freq), ["sine", "triangle"]); p.crush = 0; }],
    [["bright", "sharp", "crisp", "sparkly", "shiny"], function (p) { p.lowpass = 0; p.freq *= 1.15; p.to *= 1.15; }],
    [["dark", "muffled", "dull", "underwater", "warm", "distant"], function (p) { p.lowpass = 1100; }],
    [["echo", "echoey", "spacey", "cave", "reverb", "dungeon", "space"], function (p) { p.echo = 0.5; }],
    [["wobbly", "wobble", "vibrato", "wavy", "warbly", "ghost"], function (p) { p.vibrato = Math.max(p.vibrato, 0.8); p.vibRate = 8; }],
    [["punchy", "punch", "impact"], function (p) { p.punch = Math.max(p.punch, 0.7); }],
    [["rising", "ascending", "upward", "up"], function (p) { p.to = Math.max(p.to, p.freq * 2.2); }],
    [["falling", "descending", "downward", "down", "sad"], function (p) { p.to = Math.min(p.to, p.freq * 0.4); }],
    [["buzzy", "harsh", "angry", "robot"], function (p) { if (p.wave !== "noise") p.wave = "saw"; }],
    [["thin", "nasal", "reedy"], function (p) { p.duty = 0.125; }],
    [["fat", "thick", "full", "hollow"], function (p) { p.duty = 0.5; }],
    [["rapid", "repeat", "stutter", "machine gun", "burst", "trill"], function (p) { p.repeat = p.repeat || 0.06; p.sustain = Math.max(p.sustain, 0.25); }]
  ];

  function applyWords(p, text) {
    var t = " " + String(text || "").toLowerCase() + " ";
    var used = [];
    for (var i = 0; i < TWEAKS.length; i++) {
      var hit = TWEAKS[i][0].some(function (w) { return new RegExp("[^a-z]" + w.replace(/[-]/g, "\\-") + "[^a-z]").test(t); });
      if (hit) { TWEAKS[i][1](p); used.push(TWEAKS[i][0][0]); }
    }
    return used;
  }

  function tidy(p) {
    var o = fill(p);
    var out = {};
    for (var k in o) {
      if (k === "wave") { out.wave = o.wave; continue; }
      var v = round(o[k], k === "freq" || k === "to" || k === "lowpass" || k === "highpass" ? 0 : 3);
      // Only what differs from the defaults, so a bank stays short and readable.
      if (v !== DEFAULTS[k] || k === "freq" || k === "to" || k === "sustain" || k === "decay") out[k] = v;
    }
    return out;
  }

  // "short bright coin" -> { kind, params, words }. The kind comes from the
  // description, else from the name ("eat" -> coin), else it is a blip.
  function makeSfx(name, describe, seed) {
    var text = (describe || "") + " " + (name || "");
    var kind = kindOf(describe) || kindOf(name) || "blip";
    if (JINGLES.indexOf(kind) >= 0) kind = kind === "gameover" ? "hurt" : "powerup";
    var r = rng(seed !== undefined && seed !== null ? seed : hash(text.trim().toLowerCase()));
    var p = fill(KINDS[kind](r));
    var words = applyWords(p, describe || "");
    return { kind: kind, params: tidy(p), words: words };
  }

  // Nudge every number a little, for the lab's dice button.
  function mutate(params, amount, seed) {
    var r = rng(seed || Date.now());
    var p = fill(params);
    var same = Math.round(p.freq) === Math.round(p.to);
    amount = amount === undefined ? 0.15 : amount;
    for (var k in RANGES) {
      if (k === "arp") continue;
      var v = p[k];
      if (!v && k !== "duty" && k !== "volume") continue;
      p[k] = v * (1 + (r() * 2 - 1) * amount);
    }
    if (same) p.to = p.freq;
    return tidy(p);
  }

  function describeSfx(params) {
    var p = fill(params);
    var bits = [p.wave];
    bits.push(Math.round(p.freq) === Math.round(p.to) ? Math.round(p.freq) + " Hz" : Math.round(p.freq) + "→" + Math.round(p.to) + " Hz");
    if (p.arp) bits.push((p.arp > 0 ? "+" : "") + p.arp + " st jump");
    if (p.repeat) bits.push("repeats every " + round(p.repeat, 3) + "s");
    if (p.vibrato) bits.push("vibrato");
    if (p.crush) bits.push("crunch " + round(p.crush, 2));
    if (p.echo) bits.push("echo");
    bits.push(round(p.attack + p.sustain + p.decay, 2) + "s");
    return bits.join(", ");
  }

  // ---- chiptune music -------------------------------------------------------

  // Scales are semitones from the key note. Progressions are scale degrees
  // (0 = the key's own chord). Each mood is a small set of habits.
  var MOODS = {
    happy:  { scaleName: "major", scale: [0, 2, 4, 5, 7, 9, 11], progs: [[0, 4, 5, 3], [0, 3, 4, 4], [0, 5, 3, 4], [0, 3, 0, 4]], bpm: 140, lead: ["square", 0.5], bass: "bounce", arp: 16, drums: "pop", rhythm: "bouncy" },
    heroic: { scaleName: "mixolydian", scale: [0, 2, 4, 5, 7, 9, 10], progs: [[0, 6, 3, 0], [0, 3, 6, 4], [0, 6, 0, 4], [3, 6, 0, 0]], bpm: 150, lead: ["square", 0.25], bass: "octave", arp: 16, drums: "march", rhythm: "bold" },
    chill:  { scaleName: "major", scale: [0, 2, 4, 5, 7, 9, 11], progs: [[0, 5, 1, 4], [3, 2, 1, 4], [0, 2, 3, 4], [3, 4, 2, 5]], bpm: 92, lead: ["triangle", 0.5], bass: "long", arp: 8, drums: "lazy", rhythm: "laid", seventh: true },
    spooky: { scaleName: "harmonic minor", scale: [0, 2, 3, 5, 7, 8, 11], progs: [[0, 5, 3, 4], [0, 3, 0, 4], [0, 5, 0, 4], [0, 1, 0, 4]], bpm: 100, lead: ["triangle", 0.5], bass: "long", arp: 8, drums: "sparse", rhythm: "creep" },
    tense:  { scaleName: "minor", scale: [0, 2, 3, 5, 7, 8, 10], progs: [[0, 0, 5, 4], [0, 5, 6, 4], [0, 6, 5, 6], [0, 0, 6, 5]], bpm: 160, lead: ["square", 0.25], bass: "drive", arp: 16, drums: "drive", rhythm: "bold" },
    sad:    { scaleName: "minor", scale: [0, 2, 3, 5, 7, 8, 10], progs: [[0, 5, 2, 6], [0, 3, 5, 4], [5, 3, 0, 4], [0, 6, 5, 4]], bpm: 78, lead: ["triangle", 0.5], bass: "long", arp: 0, drums: "soft", rhythm: "laid", seventh: true },
    boss:   { scaleName: "phrygian dominant", scale: [0, 1, 4, 5, 7, 8, 10], progs: [[0, 1, 0, 6], [0, 0, 1, 0], [0, 6, 5, 1], [0, 1, 6, 0]], bpm: 172, lead: ["saw", 0.5], bass: "drive", arp: 16, drums: "drive", rhythm: "bold" },
    space:  { scaleName: "lydian", scale: [0, 2, 4, 6, 7, 9, 11], progs: [[0, 1, 0, 4], [0, 1, 5, 4], [0, 5, 1, 0], [3, 1, 0, 0]], bpm: 112, lead: ["sine", 0.5], bass: "long", arp: 16, drums: "lazy", rhythm: "laid" },
    cute:   { scaleName: "major", scale: [0, 2, 4, 5, 7, 9, 11], progs: [[0, 3, 4, 0], [0, 5, 3, 4], [3, 4, 0, 0]], bpm: 128, lead: ["square", 0.125], bass: "bounce", arp: 8, drums: "pop", rhythm: "bouncy" }
  };
  var MOOD_WORDS = [
    ["boss", ["boss", "final", "battle", "fight", "metal"]],
    ["spooky", ["spooky", "scary", "horror", "haunted", "ghost", "creepy", "dark", "dungeon", "halloween", "mystery"]],
    ["tense", ["tense", "action", "chase", "danger", "fast", "urgent", "race", "racing", "hurry", "time"]],
    ["heroic", ["heroic", "epic", "adventure", "brave", "quest", "knight", "triumph", "march", "title"]],
    ["sad", ["sad", "melancholy", "lonely", "rain", "ending", "loss", "gentle"]],
    ["space", ["space", "stars", "cosmic", "dream", "float", "ethereal", "sci-fi", "scifi", "alien"]],
    ["chill", ["chill", "calm", "relax", "lofi", "lo-fi", "peaceful", "cozy", "puzzle", "shop", "menu", "garden"]],
    ["cute", ["cute", "kawaii", "toy", "candy", "bubbly", "pet", "kids"]],
    ["happy", ["happy", "cheerful", "upbeat", "fun", "sunny", "bright", "joy", "level", "platformer"]]
  ];
  function moodOf(text) {
    var t = String(text || "").toLowerCase();
    if (MOODS[t]) return t;
    for (var i = 0; i < MOOD_WORDS.length; i++) for (var j = 0; j < MOOD_WORDS[i][1].length; j++) if (t.indexOf(MOOD_WORDS[i][1][j]) >= 0) return MOOD_WORDS[i][0];
    return "happy";
  }

  var KEYS = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };
  var KEY_NAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

  // Rhythms for one bar of melody: [start step, length] in 16th notes.
  var RHYTHMS = {
    bouncy: [[[0, 2], [2, 2], [4, 2], [6, 1], [7, 1], [8, 4], [12, 2], [14, 2]], [[0, 3], [3, 1], [4, 2], [6, 2], [8, 2], [10, 2], [12, 4]], [[0, 2], [2, 1], [3, 1], [4, 4], [8, 2], [10, 2], [12, 2], [14, 2]], [[0, 4], [4, 2], [6, 2], [8, 3], [11, 1], [12, 4]]],
    bold:   [[[0, 3], [3, 3], [6, 2], [8, 4], [12, 2], [14, 2]], [[0, 2], [2, 2], [4, 4], [8, 2], [10, 1], [11, 1], [12, 4]], [[0, 6], [6, 2], [8, 6], [14, 2]], [[0, 2], [2, 2], [4, 2], [6, 2], [8, 8]]],
    laid:   [[[0, 6], [6, 2], [8, 8]], [[0, 4], [4, 4], [8, 6], [14, 2]], [[2, 4], [6, 2], [8, 4], [12, 4]], [[0, 8], [8, 4], [12, 4]]],
    creep:  [[[0, 3], [3, 3], [6, 6], [12, 4]], [[0, 2], [4, 2], [8, 2], [12, 4]], [[0, 6], [8, 2], [10, 2], [12, 4]], [[0, 4], [6, 2], [8, 8]]]
  };

  var DRUMS = {
    pop:    { k: "x.......x.x.....", s: "....x.......x...", h: "x.x.x.x.x.x.x.x." },
    march:  { k: "x...x...x...x...", s: "....x..x....x.xx", h: "x.x.x.x.x.x.x.x." },
    lazy:   { k: "x.........x.....", s: "........x.......", h: "..x...x...x...x." },
    drive:  { k: "x.x.x.x.x.x.x.x.", s: "....x.......x...", h: "xxxxxxxxxxxxxxxx" },
    sparse: { k: "x...............", s: "............x...", h: "......x.......x." },
    soft:   { k: "x...............", s: "................", h: "....x.......x..." },
    none:   { k: "", s: "", h: "" }
  };

  var PARTS = ["lead", "arp", "bass", "drums"];

  function noteIn(scale, root, degree) {
    var oct = Math.floor(degree / scale.length);
    var i = ((degree % scale.length) + scale.length) % scale.length;
    return root + scale[i] + 12 * oct;
  }

  // Normalize a song recipe: { mood, bpm, bars, seed, key, drop }.
  function recipe(r) {
    r = r || {};
    var mood = MOODS[r.mood] ? r.mood : moodOf(r.mood || r.describe || "");
    var m = MOODS[mood];
    var bars = clamp(Math.round(Number(r.bars) || 8), 2, 32);
    bars = bars > 4 ? Math.ceil(bars / 4) * 4 : bars;
    var key = KEYS[r.key] !== undefined ? r.key : KEY_NAMES[((Number(r.seed) || 0) + hash(mood)) % 12];
    var out = { mood: mood, bpm: Math.round(clamp(Number(r.bpm) || m.bpm, 50, 240)), bars: bars, seed: Math.floor(Number(r.seed) || 0) >>> 0, key: key };
    if (r.drop && r.drop.length) out.drop = r.drop.filter(function (x) { return PARTS.indexOf(x) >= 0; });
    if (r.jingle && JINGLES.indexOf(r.jingle) >= 0) out.jingle = r.jingle;
    return out;
  }

  // Write a song: notes per part as { at: step, n: midi note, len: steps, v: 0..1 }.
  function compose(input) {
    var R = recipe(input);
    if (R.jingle) return composeJingle(R);
    var m = MOODS[R.mood];
    var r = rng(R.seed * 7919 + hash(R.mood));
    var root = 60 + KEYS[R.key];
    if (root > 66) root -= 12;
    var steps = R.bars * 16;
    var song = { recipe: R, steps: steps, stepSec: 60 / R.bpm / 4, parts: { lead: [], arp: [], bass: [], drums: [] }, chords: [] };
    var progA = pick(r, m.progs), progB = pick(r, m.progs);
    var rhythms = RHYTHMS[m.rhythm];
    var motifs = [0, 1, 2].map(function () { return makeMotif(r, pick(r, rhythms)); });
    var prev = 7;
    for (var bar = 0; bar < R.bars; bar++) {
      var phrase = Math.floor(bar / 4), inPhrase = bar % 4;
      var section = R.bars >= 8 && phrase % 2 === 1 ? "B" : "A";
      var prog = section === "B" ? progB : progA;
      var deg = prog[inPhrase % prog.length];
      song.chords.push(deg);
      var at = bar * 16;
      // Melody: motif A, A again, a second motif, then A with a new ending.
      var motif = section === "B" ? (inPhrase % 2 ? motifs[2] : motifs[1]) : inPhrase === 2 ? motifs[1] : motifs[0];
      var last = inPhrase === 3;
      var lift = section === "B" ? 2 : 0;
      for (var i = 0; i < motif.length; i++) {
        var note = motif[i];
        var rel = note.rel;
        if (last && i >= motif.length - 2) rel = i === motif.length - 1 ? 0 : pick(r, [1, 2, -1]);
        var d = deg + rel + lift + 7;
        // Keep the tune from wandering out of a singable range.
        while (d - prev > 5) d -= 7;
        while (prev - d > 5) d += 7;
        if (d < 0) d += 7;
        if (d > 14) d -= 7;
        prev = d;
        song.parts.lead.push({ at: at + note.at, n: noteIn(m.scale, root, d), len: note.len, v: note.accent ? 1 : 0.8 });
      }
      var tones = [0, 2, 4].concat(m.seventh ? [6] : []).map(function (x) { return noteIn(m.scale, root - 12, deg + x); });
      if (m.arp) {
        var stepLen = 16 / m.arp;
        var order = [0, 1, 2, 1, 0, 2, 1, 2];
        for (var a = 0; a < m.arp; a++) song.parts.arp.push({ at: at + a * stepLen, n: tones[order[a % order.length] % tones.length] + 12, len: stepLen, v: 0.7 });
      }
      var b = noteIn(m.scale, root - 24, deg);
      if (b < 33) b += 12;
      var fifth = noteIn(m.scale, root - 24, deg + 4);
      if (fifth - b > 12) fifth -= 12;
      if (m.bass === "bounce") [0, 4, 8, 12].forEach(function (s, k) { song.parts.bass.push({ at: at + s, n: k % 2 ? fifth : b, len: 3, v: 1 }); });
      else if (m.bass === "octave") for (var o = 0; o < 8; o++) song.parts.bass.push({ at: at + o * 2, n: o % 2 ? b + 12 : b, len: 2, v: 1 });
      else if (m.bass === "drive") for (var q = 0; q < 8; q++) song.parts.bass.push({ at: at + q * 2, n: b, len: 1.5, v: q % 2 ? 0.8 : 1 });
      else { song.parts.bass.push({ at: at, n: b, len: 8, v: 1 }); song.parts.bass.push({ at: at + 8, n: r() < 0.5 ? fifth : b, len: 8, v: 0.9 }); }
      var pat = DRUMS[m.drums];
      var fill16 = last && phrase * 4 + 3 === bar && m.drums !== "soft" && m.drums !== "sparse";
      for (var s = 0; s < 16; s++) {
        if (fill16 && s >= 12) { song.parts.drums.push({ at: at + s, n: "s", len: 1, v: 0.6 + (s - 12) * 0.1 }); continue; }
        if (pat.k[s] === "x") song.parts.drums.push({ at: at + s, n: "k", len: 1, v: 1 });
        if (pat.s[s] === "x") song.parts.drums.push({ at: at + s, n: "s", len: 1, v: 0.9 });
        if (pat.h[s] === "x") song.parts.drums.push({ at: at + s, n: "h", len: 1, v: s % 4 ? 0.5 : 0.8 });
      }
    }
    (R.drop || []).forEach(function (p) { song.parts[p] = []; });
    return song;
  }

  // A motif is a bar of melody as scale steps above the chord's root, so it
  // moves with the chords. Strong beats land on chord tones.
  function makeMotif(r, rhythm) {
    var out = [];
    var rel = pick(r, [0, 2, 4]);
    for (var i = 0; i < rhythm.length; i++) {
      var at = rhythm[i][0];
      if (i > 0) {
        if (at % 4 === 0) rel = pick(r, [0, 2, 4, 2, 4, 7]);
        else rel += pick(r, [1, -1, 1, -1, 2, -2, 0]);
      }
      out.push({ at: at, len: rhythm[i][1], rel: rel, accent: at % 8 === 0 });
    }
    return out;
  }

  function composeJingle(R) {
    var m = MOODS[R.mood];
    var root = 60 + KEYS[R.key];
    if (root > 66) root -= 12;
    var song = { recipe: R, steps: 0, stepSec: 60 / R.bpm / 4, once: true, parts: { lead: [], arp: [], bass: [], drums: [] }, chords: [] };
    var L = song.parts.lead, B = song.parts.bass, D = song.parts.drums;
    var major = [0, 2, 4, 5, 7, 9, 11], minor = [0, 2, 3, 5, 7, 8, 10];
    if (R.jingle === "win") {
      [0, 2, 4, 7].forEach(function (d, i) { L.push({ at: i * 2, n: noteIn(major, root + 12, d), len: 2, v: 1 }); });
      L.push({ at: 8, n: noteIn(major, root + 12, 5), len: 2, v: 0.9 }, { at: 10, n: noteIn(major, root + 12, 6), len: 2, v: 0.9 }, { at: 12, n: root + 24, len: 12, v: 1 });
      B.push({ at: 0, n: root - 12, len: 8, v: 1 }, { at: 8, n: root - 7, len: 4, v: 1 }, { at: 12, n: root - 12, len: 12, v: 1 });
      D.push({ at: 0, n: "k", len: 1, v: 1 }, { at: 8, n: "s", len: 1, v: 0.8 }, { at: 12, n: "k", len: 1, v: 1 }, { at: 12, n: "s", len: 1, v: 1 });
      song.steps = 24;
    } else if (R.jingle === "levelup") {
      for (var i = 0; i < 8; i++) L.push({ at: i, n: noteIn(m.scale, root + 12, i), len: 1, v: 0.9 });
      L.push({ at: 8, n: noteIn(m.scale, root + 12, 7), len: 6, v: 1 });
      song.parts.arp.push({ at: 8, n: noteIn(m.scale, root + 12, 4), len: 6, v: 0.6 });
      B.push({ at: 0, n: root - 12, len: 8, v: 1 }, { at: 8, n: root - 12, len: 6, v: 1 });
      D.push({ at: 8, n: "s", len: 1, v: 1 });
      song.steps = 16;
    } else {
      var notes = [7, 6, 5, 4];
      notes.forEach(function (d, i) { L.push({ at: i * 3, n: noteIn(minor, root, d), len: 3, v: 1 - i * 0.1 }); });
      L.push({ at: 12, n: root - 1, len: 4, v: 0.8 }, { at: 16, n: root - 12, len: 12, v: 0.8 });
      B.push({ at: 0, n: root - 17, len: 12, v: 1 }, { at: 12, n: root - 13, len: 4, v: 1 }, { at: 16, n: root - 24, len: 12, v: 1 });
      D.push({ at: 16, n: "k", len: 1, v: 1 });
      song.steps = 28;
    }
    return song;
  }

  // Draw a song into one Float32Array. A loop wraps note tails around to the
  // start, so it repeats without a click.
  function renderSong(input, rate) {
    rate = rate || 44100;
    var song = input && input.parts ? input : compose(input);
    var m = MOODS[song.recipe.mood];
    var stepN = song.stepSec * rate;
    var extra = song.once ? Math.ceil(rate * 0.4) : 0;
    var total = Math.ceil(song.steps * stepN) + extra;
    var out = new Float32Array(total);
    var r = rng(song.recipe.seed + 1);
    function add(i, v) { if (song.once) { if (i < total) out[i] += v; } else out[i % total] += v; }
    function tone(note, wave, duty, vol, opts) {
      var start = Math.floor(note.at * stepN);
      var len = Math.floor(note.len * stepN * (opts.gate || 0.9));
      var rel = Math.floor(rate * (opts.release || 0.02));
      var f = midiHz(note.n), ph = 0;
      for (var i = 0; i < len + rel; i++) {
        var t = i / rate;
        var ff = f;
        if (opts.vib && t > 0.18) ff *= Math.pow(2, (0.25 * Math.sin(2 * Math.PI * 5.5 * t)) / 12);
        ph += ff / rate; ph -= Math.floor(ph);
        var s = wave === "triangle" ? 4 * Math.abs(ph - 0.5) - 1 : wave === "saw" ? 2 * ph - 1 : wave === "sine" ? Math.sin(2 * Math.PI * ph) : ph < duty ? 1 : -1;
        var env = i < 40 ? i / 40 : 1;
        if (opts.fall) env *= Math.max(0.35, 1 - t * opts.fall);
        if (i >= len) env *= 1 - (i - len) / rel;
        add(start + i, s * env * vol * note.v);
      }
    }
    var lead = m.lead;
    song.parts.lead.forEach(function (n) { tone(n, lead[0], lead[1], lead[0] === "triangle" || lead[0] === "sine" ? 0.3 : 0.16, { vib: true, gate: 0.92, fall: 0.6 }); });
    song.parts.arp.forEach(function (n) { tone(n, "square", 0.125, 0.07, { gate: 0.7, release: 0.01 }); });
    song.parts.bass.forEach(function (n) { tone(n, "triangle", 0.5, 0.34, { gate: 0.95 }); });
    song.parts.drums.forEach(function (n) {
      var start = Math.floor(n.at * stepN), i, t, s, env;
      if (n.n === "k") {
        var ph = 0;
        for (i = 0; i < rate * 0.14; i++) {
          t = i / rate;
          ph += (45 + 120 * Math.exp(-t * 40)) / rate;
          env = Math.exp(-t * 22);
          add(start + i, Math.sin(2 * Math.PI * ph) * env * 0.55 * n.v);
        }
      } else if (n.n === "s") {
        var lp = 0;
        for (i = 0; i < rate * 0.13; i++) {
          t = i / rate; env = Math.exp(-t * 28);
          s = r() * 2 - 1; lp += 0.5 * (s - lp);
          add(start + i, (lp * 0.8 + 0.25 * Math.sin(2 * Math.PI * 190 * t)) * env * 0.3 * n.v);
        }
      } else {
        var prev = 0;
        for (i = 0; i < rate * 0.035; i++) {
          t = i / rate; env = Math.exp(-t * 120);
          s = r() * 2 - 1; var hp = s - prev; prev = s;
          add(start + i, hp * env * 0.1 * n.v);
        }
      }
    });
    // Gentle limiting: quiet parts pass through, peaks bend instead of clipping.
    for (var k = 0; k < total; k++) { var x = out[k] * 0.75; out[k] = x / (1 + Math.abs(x) * 0.35); }
    return out;
  }

  function describeSong(rec) {
    var R = recipe(rec);
    if (R.jingle) return R.jingle + " jingle in " + R.key + " (" + R.mood + ")";
    return R.mood + " loop, " + R.bars + " bars at " + R.bpm + " bpm in " + R.key + " " + MOODS[R.mood].scaleName + ", seed " + R.seed + (R.drop ? ", without " + R.drop.join(" and ") : "");
  }

  // ---- WAV files --------------------------------------------------------------

  function toWav(samples, rate) {
    rate = rate || 44100;
    var n = samples.length, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
    function str(o, s) { for (var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); }
    str(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); str(8, "WAVE"); str(12, "fmt ");
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
    str(36, "data"); v.setUint32(40, n * 2, true);
    for (var i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.round(clamp(samples[i], -1, 1) * 32767), true);
    return new Uint8Array(buf);
  }

  return {
    DEFAULTS: DEFAULTS, RANGES: RANGES, WAVES: WAVES, KINDS: Object.keys(KINDS), JINGLES: JINGLES,
    MOODS: Object.keys(MOODS), KEYS: KEY_NAMES, PARTS: PARTS,
    fill: fill, tidy: tidy, length: length, renderSfx: renderSfx, makeSfx: makeSfx, mutate: mutate,
    kindOf: kindOf, moodOf: moodOf, applyWords: applyWords, describeSfx: describeSfx,
    recipe: recipe, compose: compose, renderSong: renderSong, describeSong: describeSong,
    toWav: toWav, rng: rng, hash: hash
  };
})();
if (typeof module !== "undefined" && module.exports) module.exports = MaxxSound;
