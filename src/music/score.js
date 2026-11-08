// Maxx's score engine: songs written as text, in a pattern language close to
// Strudel's mini-notation, rendered to stereo audio and MIDI with no samples,
// no downloads and no audio libraries. The same file runs in Bun (the compose
// tool, maxx music) and in the app page (the 🎹 Music tab), so what the
// person hears in the app is exactly what the tool wrote.
// Plain JS on purpose: it is imported as text and spliced into the page, so it
// must contain no backticks.
//
// A score looks like this:
//
//   title: Night drive
//   bpm: 96
//   key: A minor
//   chords (pad): Am | F | C | G
//   bass (synthbass, vol 0.9): a1 ~ a1 a2 | f1 ~ f1 f2 | c2 ~ c2 c3 | g1 ~ g1 g2
//   lead (epiano, echo 0.3): e5 ~ [d5 c5] a4 | c5@3 ~ | <g4 e5> _ ~ c5 | b4 ~ ~ ~
//   drums: bd ~ sd ~, hh*8
//
// Each "|" is a bar. The steps of a bar share it equally; [a b] splits a step,
// x*3 plays x three times in its step, x@3 makes a step three times as long,
// x!3 repeats a step, _ holds the note before, ~ is a rest, <a b> takes turns
// bar by bar, x? plays only sometimes, and a comma stacks layers. Notes are
// c4, f#3, bb2 (or MIDI numbers); chords are Am, F, Cmaj7, G7/B; drums are
// bd sd hh oh cp rim lt mt ht crash ride sh cb. A track shorter than the song
// loops. "section A" starts a section and "form: A A B A" orders them.

var MaxxScore = (function () {
  "use strict";

  // ---- small helpers --------------------------------------------------------
  function rng(seed) {
    var s = (seed >>> 0) || 1;
    return function () {
      s = (s + 0x6d2b79f5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hash(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  function hz(n) { return 440 * Math.pow(2, (n - 69) / 12); }
  var NAMES = ["c", "c#", "d", "eb", "e", "f", "f#", "g", "ab", "a", "bb", "b"];
  function noteName(n) { return NAMES[((n % 12) + 12) % 12] + (Math.floor(n / 12) - 1); }
  var PC = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };

  // ---- instruments ----------------------------------------------------------
  // gm: General MIDI program (0-based) for the .mid file; oct: the octave a
  // note without one lands in; lo/hi: the comfortable range, for warnings.
  var INSTRUMENTS = {
    piano:     { gm: 0,  oct: 4, lo: 21, hi: 108, about: "acoustic piano" },
    epiano:    { gm: 4,  oct: 4, lo: 28, hi: 103, about: "electric piano, warm and bell-like" },
    organ:     { gm: 16, oct: 4, lo: 36, hi: 96,  about: "drawbar organ" },
    strings:   { gm: 48, oct: 4, lo: 28, hi: 100, about: "string section, slow bow" },
    pad:       { gm: 89, oct: 4, lo: 28, hi: 96,  about: "soft synth pad for chords" },
    choir:     { gm: 52, oct: 4, lo: 40, hi: 84,  about: "aah voices" },
    pluck:     { gm: 45, oct: 4, lo: 36, hi: 96,  about: "plucked synth / harp" },
    guitar:    { gm: 25, oct: 3, lo: 40, hi: 88,  about: "acoustic guitar" },
    bell:      { gm: 14, oct: 5, lo: 48, hi: 108, about: "glassy bell" },
    marimba:   { gm: 12, oct: 4, lo: 45, hi: 96,  about: "marimba" },
    flute:     { gm: 73, oct: 5, lo: 60, hi: 96,  about: "flute" },
    brass:     { gm: 61, oct: 4, lo: 34, hi: 82,  about: "brass section" },
    lead:      { gm: 81, oct: 5, lo: 40, hi: 100, about: "saw synth lead" },
    chip:      { gm: 80, oct: 5, lo: 36, hi: 100, about: "8-bit square wave" },
    bass:      { gm: 33, oct: 2, lo: 24, hi: 60,  about: "round electric bass" },
    synthbass: { gm: 38, oct: 2, lo: 24, hi: 60,  about: "squelchy filtered synth bass" },
    sub:       { gm: 38, oct: 1, lo: 16, hi: 48,  about: "pure sub bass (808 style)" },
    drums:     { gm: 0,  oct: 0, lo: 0,  hi: 127, about: "drum kit: bd sd hh oh cp rim lt mt ht crash ride sh cb" }
  };
  var DRUMS = { bd: 36, sd: 38, hh: 42, oh: 46, cp: 39, rim: 37, lt: 45, mt: 47, ht: 50, crash: 49, ride: 51, sh: 70, cb: 56 };
  var DRUM_ALIAS = { kick: "bd", k: "bd", snare: "sd", s: "sd", hat: "hh", h: "hh", hihat: "hh", openhat: "oh", o: "oh", clap: "cp", tom: "mt", shaker: "sh", cowbell: "cb", cymbal: "crash", x: "cp", rs: "rim" };
  var INST_ALIAS = { keys: "epiano", rhodes: "epiano", ep: "epiano", synth: "lead", saw: "lead", square: "chip", "8bit": "chip", nes: "chip", harp: "pluck", violin: "strings", cello: "strings", orchestra: "strings", voice: "choir", voices: "choir", vox: "choir", trumpet: "brass", horn: "brass", horns: "brass", glock: "bell", celesta: "bell", vibes: "marimba", acid: "synthbass", "808": "sub", kit: "drums", drum: "drums", perc: "drums", percussion: "drums", beat: "drums", beats: "drums" };
  function instOf(word) {
    var w = String(word || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    if (INSTRUMENTS[w]) return w;
    if (INST_ALIAS[w]) return INST_ALIAS[w];
    var names = Object.keys(INSTRUMENTS);
    for (var i = 0; i < names.length; i++) if (w.indexOf(names[i]) >= 0) return names[i];
    var al = Object.keys(INST_ALIAS);
    for (var j = 0; j < al.length; j++) if (w.indexOf(al[j]) >= 0) return INST_ALIAS[al[j]];
    return null;
  }
  // A track called "bass" or "drums" with no instrument gets the obvious one.
  function guessInst(name) {
    var n = String(name).toLowerCase();
    if (/drum|beat|perc|kit|groove/.test(n)) return "drums";
    if (/sub|808/.test(n)) return "sub";
    if (/bass/.test(n)) return "bass";
    if (/chord|pad|harm/.test(n)) return "pad";
    if (/arp/.test(n)) return "pluck";
    if (/mel|lead|tune|hook|top/.test(n)) return "lead";
    return instOf(n) || "piano";
  }

  // ---- chords ---------------------------------------------------------------
  var QUALITIES = {
    "": [0, 4, 7], maj: [0, 4, 7], M: [0, 4, 7], m: [0, 3, 7], min: [0, 3, 7], "-": [0, 3, 7],
    "5": [0, 7], dim: [0, 3, 6], o: [0, 3, 6], aug: [0, 4, 8], "+": [0, 4, 8],
    sus2: [0, 2, 7], sus4: [0, 5, 7], sus: [0, 5, 7],
    "6": [0, 4, 7, 9], m6: [0, 3, 7, 9], "7": [0, 4, 7, 10], maj7: [0, 4, 7, 11], M7: [0, 4, 7, 11], "^7": [0, 4, 7, 11], "^": [0, 4, 7, 11],
    m7: [0, 3, 7, 10], min7: [0, 3, 7, 10], "-7": [0, 3, 7, 10], mmaj7: [0, 3, 7, 11], dim7: [0, 3, 6, 9], o7: [0, 3, 6, 9], m7b5: [0, 3, 6, 10], "ø": [0, 3, 6, 10],
    "9": [0, 4, 7, 10, 14], maj9: [0, 4, 7, 11, 14], m9: [0, 3, 7, 10, 14], add9: [0, 4, 7, 14], madd9: [0, 3, 7, 14],
    "11": [0, 4, 7, 10, 14, 17], m11: [0, 3, 7, 10, 14, 17], "13": [0, 4, 7, 10, 14, 21], "7sus4": [0, 5, 7, 10]
  };
  // "Am7/G" -> { root: 9, tones: [0,3,7,10], bass: 7 } or null.
  function parseChord(tok) {
    var m = /^([A-G])(#|b)?([^/]*)(?:\/([A-G])(#|b)?)?$/.exec(tok);
    if (!m) return null;
    var q = m[3];
    if (!Object.prototype.hasOwnProperty.call(QUALITIES, q)) return null;
    var root = (PC[m[1].toLowerCase()] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0) + 12) % 12;
    var bass = m[4] ? (PC[m[4].toLowerCase()] + (m[5] === "#" ? 1 : m[5] === "b" ? -1 : 0) + 12) % 12 : null;
    return { root: root, tones: QUALITIES[q], bass: bass };
  }
  // Voice a chord near the last one, so chord changes move as little as possible.
  function voiceChord(ch, oct, prev) {
    var base = 12 * (oct + 1) + ch.root;
    var notes = ch.tones.map(function (t) { return base + t; });
    var center = prev && prev.length ? prev.reduce(function (a, b) { return a + b; }, 0) / prev.length : 12 * (oct + 1) + 7;
    var best = notes, bestD = 1e9;
    for (var inv = -3; inv <= 3; inv++) {
      var v = notes.map(function (n, i) {
        var k = i + inv, shift = Math.floor(k / notes.length);
        return notes[((k % notes.length) + notes.length) % notes.length] + 12 * shift;
      }).sort(function (a, b) { return a - b; });
      var mid = v.reduce(function (a, b) { return a + b; }, 0) / v.length;
      var d = Math.abs(mid - center) + (v[v.length - 1] - v[0] > 19 ? 6 : 0);
      if (d < bestD) { bestD = d; best = v; }
    }
    if (ch.bass !== null) {
      var b = 12 * oct + ch.bass;
      while (b >= best[0]) b -= 12;
      best = [b].concat(best);
    }
    return best;
  }

  // ---- the pattern language -------------------------------------------------
  // Tokens become a tree: seq (steps share time), stack (layers at once),
  // alt (one child per bar, in turn), and leaves.
  function tokenize(src) {
    var out = [], i = 0;
    while (i < src.length) {
      var c = src[i];
      if (/\s/.test(c)) { i++; continue; }
      if ("[]<>,|".indexOf(c) >= 0) { out.push({ t: c, at: i }); i++; continue; }
      if (c === "*" || c === "@" || c === "!" || c === "/") {
        var m = /^[*@!/](\d+(?:\.\d+)?)?/.exec(src.slice(i));
        out.push({ t: c, n: m[1] ? Number(m[1]) : null, at: i }); i += m[0].length; continue;
      }
      if (c === "?") { out.push({ t: "?", at: i }); i++; continue; }
      var w = /^[^\s[\]<>,|*@!?]+/.exec(src.slice(i));
      if (!w) { out.push({ t: "bad", v: c, at: i }); i++; continue; }
      out.push({ t: "word", v: w[0], at: i }); i += w[0].length;
    }
    return out;
  }

  function Parser(src, ctx) {
    this.toks = tokenize(src); this.i = 0; this.ctx = ctx; this.src = src;
  }
  Parser.prototype.err = function (msg, tok) { this.ctx.errors.push({ msg: msg, col: tok ? tok.at : this.src.length }); };
  Parser.prototype.peek = function () { return this.toks[this.i]; };
  // stack := seq (',' seq)*   until close
  Parser.prototype.stack = function (close) {
    var layers = [this.seq(close)];
    while (this.peek() && this.peek().t === ",") { this.i++; layers.push(this.seq(close)); }
    return layers.length === 1 ? layers[0] : { k: "stack", items: layers };
  };
  Parser.prototype.seq = function (close) {
    var steps = [];
    for (;;) {
      var t = this.peek();
      if (!t || t.t === "," || t.t === close || t.t === "|") break;
      if (t.t === "]" || t.t === ">") { this.err("unexpected " + t.t, t); this.i++; continue; }
      if (t.t === "word" && t.v === "_") {
        this.i++;
        if (steps.length) steps[steps.length - 1].w += 1; else this.err("_ holds the note before it, but nothing came before", t);
        continue;
      }
      var node = this.atom();
      if (!node) continue;
      var step = { node: node, w: 1 };
      // modifiers
      for (;;) {
        var m = this.peek();
        if (!m) break;
        if (m.t === "*") { this.i++; step.node = { k: "fast", n: m.n || 2, node: step.node }; }
        else if (m.t === "/") { this.i++; step.node = { k: "slow", n: m.n || 2, node: step.node }; }
        else if (m.t === "@") { this.i++; step.w = m.n || 2; }
        else if (m.t === "?") { this.i++; step.node = { k: "maybe", node: step.node, seed: m.at }; }
        else if (m.t === "!") {
          this.i++;
          var n = m.n || 2;
          for (var r = 1; r < n; r++) steps.push({ node: step.node, w: step.w });
        } else break;
      }
      steps.push(step);
    }
    return { k: "seq", steps: steps };
  };
  Parser.prototype.atom = function () {
    var t = this.toks[this.i++];
    if (t.t === "[") {
      var inner = this.stack("]");
      if (this.peek() && this.peek().t === "]") this.i++; else this.err("missing ]", t);
      return inner;
    }
    if (t.t === "<") {
      var s = this.seq(">");
      if (this.peek() && this.peek().t === ">") this.i++; else this.err("missing >", t);
      return { k: "alt", items: s.steps.map(function (x) { return x.node; }) };
    }
    if (t.t === "word") return this.leaf(t);
    if (t.t === "bad") { this.err("can't read " + JSON.stringify(t.v), t); return null; }
    this.err("unexpected " + t.t, t);
    return null;
  };
  Parser.prototype.leaf = function (t) {
    var v = t.v, ctx = this.ctx;
    var sl = /^(.+)\/(\d+)$/.exec(v);
    if (sl && !parseChord(v)) return { k: "slow", n: Number(sl[2]), node: this.leaf({ t: "word", v: sl[1], at: t.at }) };
    if (v === "~" || v === "." || v === "-" || v === "r" || v === "rest") return { k: "rest" };
    var vel = 1;
    var acc = /^(.*?)(\^+)$/.exec(v);
    if (acc && acc[1]) { v = acc[1]; vel = 1.25; }
    var soft = /^\((.*)\)$/.exec(v);
    if (soft) { v = soft[1]; vel = 0.55; }
    if (ctx.drums) {
      var d = v.toLowerCase();
      d = DRUM_ALIAS[d] || d;
      if (DRUMS[d] !== undefined) return { k: "hit", d: d, v: vel };
      this.err(JSON.stringify(v) + " isn't a drum; use " + Object.keys(DRUMS).join(" "), t);
      return { k: "rest" };
    }
    var ch = parseChord(v);
    if (ch) return { k: "chord", ch: ch, v: vel, tok: v };
    var m = /^([a-gA-G])(#|s|b)?(-?\d)?$/.exec(v);
    if (m && (m[3] !== undefined || /^[a-g]/.test(v))) {
      var pc = PC[m[1].toLowerCase()] + (m[2] === "#" || m[2] === "s" ? 1 : m[2] === "b" ? -1 : 0);
      var oct = m[3] !== undefined ? Number(m[3]) : ctx.oct;
      return { k: "note", n: 12 * (oct + 1) + pc, v: vel };
    }
    if (/^\d{1,3}$/.test(v) && Number(v) <= 127) return { k: "note", n: Number(v), v: vel };
    if (DRUMS[DRUM_ALIAS[v.toLowerCase()] || v.toLowerCase()] !== undefined) {
      this.err(JSON.stringify(v) + " is a drum; put drums on a track with (drums)", t);
      return { k: "rest" };
    }
    this.err("can't read " + JSON.stringify(v) + ": notes look like c4 f#3 bb2, chords like Am F C7 G/B", t);
    return { k: "rest" };
  };

  // Events of a node over [t0, t0+span) of bar number bar (for <> turns).
  function query(node, t0, span, bar, out, depth) {
    switch (node.k) {
      case "rest": return;
      case "note": out.push({ t: t0, d: span, n: node.n, v: node.v }); return;
      case "hit": out.push({ t: t0, d: span, drum: node.d, v: node.v }); return;
      case "chord": out.push({ t: t0, d: span, chord: node.ch, v: node.v }); return;
      case "seq": {
        var total = 0, i;
        for (i = 0; i < node.steps.length; i++) total += node.steps[i].w;
        if (!total) return;
        var at = t0;
        for (i = 0; i < node.steps.length; i++) {
          var len = span * node.steps[i].w / total;
          query(node.steps[i].node, at, len, bar, out, depth);
          at += len;
        }
        return;
      }
      case "stack": for (var j = 0; j < node.items.length; j++) query(node.items[j], t0, span, bar, out, depth); return;
      case "alt": if (node.items.length) query(node.items[((bar + depth) % node.items.length + node.items.length) % node.items.length], t0, span, Math.floor(bar / node.items.length), out, 0); return;
      case "fast": {
        var n = Math.max(1, Math.round(node.n));
        for (var r = 0; r < n; r++) query(node.node, t0 + r * span / n, span / n, bar * n + r, out, 0);
        return;
      }
      case "slow": {
        // x/2: x spread over two of these steps; only this half sounds here.
        var k = Math.max(1, Math.round(node.n)), part = bar % k, tmp = [];
        query(node.node, t0 - part * span, span * k, Math.floor(bar / k), tmp, 0);
        for (var q = 0; q < tmp.length; q++) {
          var e = tmp[q];
          if (e.t >= t0 - 1e-9 && e.t < t0 + span - 1e-9) out.push(e);
        }
        return;
      }
      case "maybe": {
        var tmp2 = [];
        query(node.node, t0, span, bar, tmp2, depth);
        var r2 = rng(node.seed * 7919 + bar * 104729 + Math.round(t0 * 1000));
        for (var z = 0; z < tmp2.length; z++) if (r2() < 0.5) out.push(tmp2[z]);
        return;
      }
    }
  }

  // ---- reading a whole score -------------------------------------------------
  var GLOBALS = ["title", "bpm", "tempo", "key", "meter", "time", "swing", "reverb", "form", "section", "by", "seed", "out"];

  function parseOpts(text, track, errors, line) {
    text.split(/[,;]/).forEach(function (raw) {
      var s = raw.trim();
      if (!s) return;
      var kv = /^([a-z]+)\s*[=: ]\s*(-?\d+(?:\.\d+)?)$/i.exec(s);
      if (kv) {
        var k = kv[1].toLowerCase(), v = Number(kv[2]);
        if (k === "vol" || k === "volume" || k === "gain") track.vol = clamp(v, 0, 2);
        else if (k === "pan") track.pan = clamp(v, -1, 1);
        else if (k === "oct" || k === "octave") track.oct = Math.round(clamp(v, 0, 8));
        else if (k === "rev" || k === "reverb" || k === "room") track.rev = clamp(v, 0, 1);
        else if (k === "echo" || k === "delay") track.echo = clamp(v, 0, 0.9);
        else if (k === "cut" || k === "cutoff" || k === "tone" || k === "bright") track.tone = clamp(v, 0, 1);
        else if (k === "glide" || k === "legato") track.legato = clamp(v, 0, 1);
        else if (k === "transpose" || k === "shift") track.transpose = Math.round(clamp(v, -36, 36));
        else errors.push({ line: line, msg: "unknown option " + kv[1] + " (vol, pan, oct, rev, echo, tone, transpose)" });
        return;
      }
      var word = s.toLowerCase();
      if (word === "mute" || word === "off") { track.mute = true; return; }
      var inst = instOf(word);
      if (inst) { track.inst = inst; return; }
      errors.push({ line: line, msg: "unknown instrument " + JSON.stringify(s) + "; try " + Object.keys(INSTRUMENTS).join(", ") });
    });
  }

  function parse(text) {
    var score = { title: "", bpm: 110, key: "", meter: 4, swing: 0, reverb: 0.25, seed: 0, form: null, sections: {}, order: [], tracks: {}, errors: [] };
    var section = "main", last = null, lines = String(text).replace(/\r/g, "").split("\n");
    function sec(name) {
      if (!score.sections[name]) { score.sections[name] = { name: name, parts: {} }; score.order.push(name); }
      return score.sections[name];
    }
    for (var li = 0; li < lines.length; li++) {
      var raw = lines[li], lineNo = li + 1;
      var line = raw.replace(/(^|\s)(#|\/\/).*$/, "").replace(/\s+$/, "");
      if (!line.trim()) { continue; }
      // continuation of the last track: starts with space or a bar line
      if (last && (/^\s/.test(line) || /^\|/.test(line.trim())) && !/^\s*[\w.-]+\s*(\([^)]*\))?\s*:/.test(line)) {
        last.src += " | " + line.trim().replace(/^\|\s*/, "");
        last.lines.push(lineNo);
        continue;
      }
      var sm = /^\s*(?:section|part|\[)\s*([\w-]+)\s*\]?\s*:?\s*$/i.exec(line);
      if (sm && !/^\s*\w+\s*:/.test(line.replace(/^\s*\[/, ""))) { section = sm[1]; sec(section); last = null; continue; }
      var hm = /^\s*([\w.-]+)\s*(?:\(([^)]*)\))?\s*:\s*(.*)$/.exec(line);
      if (!hm) { score.errors.push({ line: lineNo, msg: "expected  name (instrument): pattern  or  bpm: 120" }); continue; }
      var name = hm[1], opts = hm[2], body = hm[3].trim(), lname = name.toLowerCase();
      if (!opts && GLOBALS.indexOf(lname) >= 0) {
        last = null;
        if (lname === "title" || lname === "by") { if (lname === "title") score.title = body; }
        else if (lname === "bpm" || lname === "tempo") { var b = parseFloat(body); if (b >= 20 && b <= 400) score.bpm = b; else score.errors.push({ line: lineNo, msg: "bpm should be between 20 and 400" }); }
        else if (lname === "key") score.key = body;
        else if (lname === "meter" || lname === "time") { var mm = /^(\d+)\s*(?:\/\s*(\d+))?/.exec(body); if (mm) score.meter = clamp(Number(mm[1]) * (mm[2] ? 4 / Number(mm[2]) : 1), 1, 16); }
        else if (lname === "swing") score.swing = clamp(parseFloat(body) || 0, 0, 0.5);
        else if (lname === "reverb") score.reverb = clamp(parseFloat(body) || 0, 0, 1);
        else if (lname === "seed") score.seed = parseInt(body, 10) || 0;
        else if (lname === "form") score.form = body.split(/[\s,]+/).filter(Boolean);
        else if (lname === "section") { section = body.split(/\s+/)[0] || "main"; sec(section); }
        continue;
      }
      var fresh = function (key) { return { name: key, inst: null, vol: 0.8, pan: 0, oct: null, rev: null, echo: 0, tone: 0.6, legato: 0, transpose: 0, mute: false, line: lineNo }; };
      var key = name, track = score.tracks[name];
      if (opts) {
        // the same name with other settings in another section is another track
        var trial = fresh(name);
        parseOpts(opts, trial, score.errors, lineNo);
        if (!trial.inst) trial.inst = guessInst(name);
        if (track && (track.inst !== trial.inst || opts.trim() !== track.opts)) {
          key = name + "~" + section;
          var at = 2;
          while (score.tracks[key] && score.tracks[key].opts !== opts.trim()) key = name + "~" + section + at++;
          track = score.tracks[key];
        }
        if (!track) { track = score.tracks[key] = trial; track.opts = opts.trim(); }
      }
      if (!track) { track = score.tracks[key] = fresh(name); track.inst = guessInst(name); track.opts = ""; }
      var part = { src: body, lines: [lineNo] };
      sec(section).parts[key] = part;
      last = part;
    }
    if (!score.order.length) sec("main");
    // default pans spread the tracks a little, so the mix isn't all in the middle
    var names = Object.keys(score.tracks), spread = [0, -0.25, 0.25, -0.4, 0.4, -0.15, 0.15];
    names.forEach(function (n, i) {
      var t = score.tracks[n];
      if (t.oct === null) t.oct = INSTRUMENTS[t.inst].oct;
      if (t.rev === null) t.rev = /pad|strings|choir|bell|flute|epiano|pluck/.test(t.inst) ? 0.45 : t.inst === "drums" ? 0.12 : /bass|sub/.test(t.inst) ? 0.02 : 0.25;
      if (!t.pan && !/bass|sub|drums/.test(t.inst) && t.pan === 0) t.pan = spread[i % spread.length];
    });
    if (score.form) {
      score.form = score.form.filter(function (f) {
        if (score.sections[f]) return true;
        score.errors.push({ line: 0, msg: "form names section " + f + ", but there is no \"section " + f + "\"" });
        return false;
      });
      if (!score.form.length) score.form = null;
    }
    // turn each part's text into bars of events
    score.order.forEach(function (sn) {
      var S = score.sections[sn], most = 0;
      Object.keys(S.parts).forEach(function (tn) {
        var part = S.parts[tn], tr = score.tracks[tn];
        var ctx = { drums: tr.inst === "drums", oct: tr.oct, errors: [] };
        var bars = splitBars(part.src).map(function (b) {
          var p = new Parser(b, ctx), n = p.stack(null);
          while (p.i < p.toks.length) { p.err("unexpected " + (p.toks[p.i].v || p.toks[p.i].t), p.toks[p.i]); p.i++; if (p.i < p.toks.length && p.toks[p.i].t !== "|") { var more = p.stack(null); n = { k: "seq", steps: [{ node: n, w: 1 }, { node: more, w: 1 }] }; } }
          return n;
        });
        ctx.errors.forEach(function (e) { score.errors.push({ line: part.lines[0], msg: tn + ": " + e.msg }); });
        part.bars = bars;
        if (bars.length > most) most = bars.length;
      });
      S.bars = Math.max(1, most);
    });
    return score;
  }
  function splitBars(src) {
    // split on | that isn't inside brackets
    var out = [], depth = 0, cur = "";
    for (var i = 0; i < src.length; i++) {
      var c = src[i];
      if (c === "[" || c === "<") depth++;
      if ((c === "]" || c === ">") && depth > 0) depth--;
      if (c === "|" && depth <= 0) { out.push(cur); cur = ""; continue; }
      cur += c;
    }
    out.push(cur);
    return out.filter(function (b, i) { return b.trim() || i < out.length - 1; }).map(function (b) { return b.trim() ? b : "~"; });
  }

  // Every note of the song, in beats, with chords voiced and holds merged.
  function events(input) {
    var score = typeof input === "string" ? parse(input) : input;
    var form = score.form || score.order;
    var notes = [], at = 0, sectionsAt = [], prevChord = {};
    form.forEach(function (sn, fi) {
      var S = score.sections[sn];
      sectionsAt.push({ name: sn, beat: at, bars: S.bars });
      Object.keys(S.parts).forEach(function (tn) {
        var tr = score.tracks[tn], part = S.parts[tn];
        if (tr.mute || !part.bars.length) return;
        for (var b = 0; b < S.bars; b++) {
          var node = part.bars[b % part.bars.length], evs = [];
          // loops of a short part take their <> turns from the bar count
          query(node, 0, 1, Math.floor(b / part.bars.length), evs, 0);
          evs.sort(function (x, y) { return x.t - y.t; });
          for (var i = 0; i < evs.length; i++) {
            var e = evs[i], t = (b + e.t) * score.meter + at, d = e.d * score.meter;
            if (score.swing) t += swingShift(e.t * score.meter, score.swing);
            if (e.drum) notes.push({ track: tn, t: t, d: d, n: DRUMS[e.drum], drum: e.drum, v: e.v });
            else if (e.chord) {
              var v = voiceChord(e.chord, tr.oct, prevChord[tn]);
              prevChord[tn] = v;
              for (var c = 0; c < v.length; c++) notes.push({ track: tn, t: t, d: d, n: v[c] + tr.transpose, v: e.v * 0.8 });
            } else notes.push({ track: tn, t: t, d: d, n: e.n + tr.transpose, v: e.v });
          }
        }
      });
      at += S.bars * score.meter;
    });
    notes.sort(function (x, y) { return x.t - y.t || x.n - y.n; });
    return { score: score, notes: notes, beats: at, sections: sectionsAt };
  }
  // Swing pushes every off-beat eighth later.
  function swingShift(beat, amount) {
    var pos = beat % 1;
    return Math.abs(pos - 0.5) < 0.02 ? amount * 0.5 : 0;
  }

  // ---- synthesis ------------------------------------------------------------
  function env(i, n, a, d, s, r, rate) {
    var t = i / rate, len = n / rate;
    var v;
    if (t < a) v = t / a;
    else if (t < a + d) v = 1 - (1 - s) * (t - a) / d;
    else v = s;
    var rel = len - r;
    if (t > rel) v *= Math.max(0, 1 - (t - rel) / r);
    return v;
  }
  function onePole(cut, rate) { return 1 - Math.exp(-2 * Math.PI * cut / rate); }

  // One note of a pitched instrument: returns mono samples (the tail included).
  function voice(inst, n, secs, vel, rate, tone, r) {
    var f = hz(n), tail = { piano: 1.2, epiano: 1.0, organ: 0.08, strings: 0.45, pad: 1.2, choir: 0.5, pluck: 0.9, guitar: 1.4, bell: 2.2, marimba: 0.5, flute: 0.15, brass: 0.15, lead: 0.12, chip: 0.04, bass: 0.12, synthbass: 0.1, sub: 0.2 }[inst] || 0.2;
    var len = Math.max(1, Math.floor((secs + tail) * rate)), held = secs * rate, out = new Float32Array(len);
    var TAU = 2 * Math.PI, i, ph = r() * TAU;
    function rel(i, rt) { return i < held ? 1 : Math.max(0, 1 - (i - held) / (rt * rate)); }
    switch (inst) {
      case "piano": {
        // partials as rotating phasors (no sin() per sample), each with its own decay
        var parts = [1, 0.55, 0.32, 0.22, 0.12, 0.08, 0.05], B = 0.0004, P = [];
        for (var h = 0; h < parts.length; h++) {
          var k = h + 1, fk = f * k * Math.sqrt(1 + B * k * k);
          if (fk > rate / 2.2) break;
          var w = TAU * fk / rate;
          P.push({ c: Math.cos(w), s: Math.sin(w), x: Math.cos(h), y: Math.sin(h), a: parts[h], m: Math.exp(-(1.2 + k * 0.9) * (f > 600 ? 1.6 : 1) / rate) });
        }
        var hamN = Math.floor(rate * 0.004), att = rate * 0.002;
        for (i = 0; i < len; i++) {
          var s = 0;
          for (var q = 0; q < P.length; q++) {
            var o = P[q], nx = o.x * o.c - o.y * o.s;
            o.y = o.x * o.s + o.y * o.c; o.x = nx; o.a *= o.m;
            s += o.a * o.y;
          }
          var ham = i < hamN ? (r() * 2 - 1) * 0.2 * (1 - i / hamN) : 0;
          out[i] = (s * 0.5 + ham) * (i < att ? i / att : 1) * rel(i, 0.25);
        }
        break;
      }
      case "epiano": {
        for (i = 0; i < len; i++) {
          var t2 = i / rate, idx = 1.6 * Math.exp(-t2 * 4) + 0.15;
          var mod = Math.sin(TAU * f * t2) * idx;
          var tine = Math.sin(TAU * f * 14 * t2) * 0.08 * Math.exp(-t2 * 30);
          out[i] = (Math.sin(TAU * f * t2 + mod + ph) + tine) * Math.exp(-t2 * 1.1) * 0.45 * Math.min(1, i / (rate * 0.003)) * rel(i, 0.3) * (1 + 0.15 * Math.sin(TAU * 4.5 * t2));
        }
        break;
      }
      case "organ": {
        var bars = [[0.5, 0.5], [1, 1], [2, 0.6], [3, 0.4], [4, 0.3], [6, 0.2], [8, 0.15]];
        for (i = 0; i < len; i++) {
          var t3 = i / rate, s3 = 0, vib = 1 + 0.003 * Math.sin(TAU * 6.5 * t3);
          for (var b = 0; b < bars.length; b++) if (f * bars[b][0] < rate / 2.2) s3 += bars[b][1] * Math.sin(TAU * f * bars[b][0] * vib * t3);
          var click = i < rate * 0.003 ? 0.15 * (r() * 2 - 1) : 0;
          out[i] = (s3 * 0.22 + click) * Math.min(1, i / (rate * 0.006)) * rel(i, 0.05);
        }
        break;
      }
      case "strings": case "pad": case "choir": case "brass": case "lead": case "synthbass": {
        var detune = inst === "pad" ? [-0.12, 0, 0.11] : inst === "strings" ? [-0.07, 0.06, 0.0] : inst === "choir" ? [-0.09, 0.08] : inst === "brass" ? [-0.04, 0.04] : inst === "lead" ? [-0.05, 0.05] : [0];
        var phs = detune.map(function () { return r(); });
        var A = { strings: 0.18, pad: 0.6, choir: 0.25, brass: 0.04, lead: 0.008, synthbass: 0.004 }[inst];
        var R = { strings: 0.4, pad: 1.1, choir: 0.45, brass: 0.12, lead: 0.1, synthbass: 0.08 }[inst];
        var lp = 0, lp2 = 0, bp1 = [0, 0], bp2 = [0, 0];
        var baseCut = { strings: 2400, pad: 900, choir: 1800, brass: 1400, lead: 3500, synthbass: 500 }[inst] * (0.5 + tone);
        for (i = 0; i < len; i++) {
          var t4 = i / rate, s4 = 0, vib4 = 1 + (inst === "strings" || inst === "choir" || inst === "lead" ? 0.004 * Math.sin(TAU * 5.2 * t4) * Math.min(1, t4 * 2) : 0);
          for (var dd = 0; dd < detune.length; dd++) {
            var fr = f * Math.pow(2, detune[dd] / 12) * vib4;
            phs[dd] = (phs[dd] + fr / rate) % 1;
            s4 += 2 * phs[dd] - 1;
          }
          s4 /= detune.length;
          var cut = baseCut;
          if (inst === "brass") cut *= 0.4 + 1.6 * Math.min(1, t4 / 0.08) * Math.exp(-t4 * 2);
          if (inst === "synthbass") cut *= 1 + 5 * Math.exp(-t4 * 9);
          if (inst === "pad") cut *= 1 + 0.4 * Math.sin(TAU * 0.25 * t4);
          var a1 = onePole(Math.min(cut, rate * 0.45), rate);
          lp += a1 * (s4 - lp); lp2 += a1 * (lp - lp2);
          var y = inst === "synthbass" ? lp2 * 1.6 : lp2;
          if (inst === "choir") {
            // two formants of "aah": about 750 Hz and 1200 Hz
            y = formant(bp1, s4, 750, rate) * 0.9 + formant(bp2, s4, 1200, rate) * 0.5;
          }
          var e4 = Math.min(1, t4 / A) * rel(i, R);
          if (inst === "synthbass") y = Math.tanh(y * 1.8) * 0.7;
          out[i] = y * e4 * (inst === "pad" ? 0.55 : 0.5);
        }
        break;
      }
      case "pluck": case "guitar": {
        // Karplus-Strong: a burst of noise in a delay line that filters itself
        var period = Math.max(2, Math.round(rate / f)), buf = new Float32Array(period), p = 0;
        var bright = inst === "guitar" ? 0.5 : 0.7 + tone * 0.25;
        for (i = 0; i < period; i++) buf[i] = (r() * 2 - 1) * (inst === "guitar" ? 0.8 : 1);
        if (inst === "guitar") { var sm = 0; for (i = 0; i < period; i++) { sm += 0.5 * (buf[i] - sm); buf[i] = sm; } }
        var decay = inst === "guitar" ? 0.996 : 0.992, prevS = 0;
        for (i = 0; i < len; i++) {
          var cur = buf[p];
          var nxt = decay * (bright * cur + (1 - bright) * prevS);
          prevS = cur; buf[p] = nxt; p = (p + 1) % period;
          out[i] = cur * 0.5 * rel(i, inst === "guitar" ? 0.3 : 0.15);
        }
        break;
      }
      case "bell": {
        for (i = 0; i < len; i++) {
          var t5 = i / rate;
          var m5 = Math.sin(TAU * f * 3.5 * t5) * 2.2 * Math.exp(-t5 * 1.5);
          out[i] = Math.sin(TAU * f * t5 + m5) * Math.exp(-t5 * 1.4) * 0.35 * Math.min(1, i / (rate * 0.001)) * rel(i, 1.5);
        }
        break;
      }
      case "marimba": {
        for (i = 0; i < len; i++) {
          var t6 = i / rate;
          out[i] = (Math.sin(TAU * f * t6) * Math.exp(-t6 * 6) + 0.35 * Math.sin(TAU * f * 3.93 * t6) * Math.exp(-t6 * 25) + 0.15 * Math.sin(TAU * f * 9.2 * t6) * Math.exp(-t6 * 60)) * 0.5 * Math.min(1, i / (rate * 0.0008));
        }
        break;
      }
      case "flute": {
        var lpN = 0;
        for (i = 0; i < len; i++) {
          var t7 = i / rate, vib7 = 1 + 0.006 * Math.sin(TAU * 5 * t7) * Math.min(1, t7 * 3);
          lpN += 0.08 * ((r() * 2 - 1) - lpN);
          var s7 = Math.sin(TAU * f * vib7 * t7) + 0.12 * Math.sin(TAU * 2 * f * vib7 * t7) + lpN * 0.35 * Math.exp(-t7 * 6) + lpN * 0.08;
          out[i] = s7 * 0.42 * Math.min(1, t7 / 0.05) * rel(i, 0.12);
        }
        break;
      }
      case "chip": {
        for (i = 0; i < len; i++) {
          var t8 = i / rate, ph8 = (f * t8 * (1 + 0.004 * Math.sin(TAU * 6 * t8) * Math.min(1, t8 * 4))) % 1;
          out[i] = (ph8 < 0.25 ? 1 : -1) * 0.22 * Math.min(1, i / (rate * 0.002)) * rel(i, 0.03) * (0.85 + 0.15 * Math.exp(-t8 * 3));
        }
        break;
      }
      case "bass": {
        for (i = 0; i < len; i++) {
          var t9 = i / rate, s9 = Math.sin(TAU * f * t9) + 0.35 * Math.sin(TAU * 2 * f * t9) * Math.exp(-t9 * 4) + 0.15 * Math.sin(TAU * 3 * f * t9) * Math.exp(-t9 * 8);
          var pluckEnv = 0.75 + 0.25 * Math.exp(-t9 * 6);
          out[i] = Math.tanh(s9 * 1.2) * 0.5 * pluckEnv * Math.min(1, i / (rate * 0.003)) * rel(i, 0.08);
        }
        break;
      }
      case "sub": {
        for (i = 0; i < len; i++) {
          var t10 = i / rate, fq = f * (1 + 0.5 * Math.exp(-t10 * 30));
          ph += TAU * fq / rate;
          out[i] = Math.tanh(Math.sin(ph) * 1.4) * 0.6 * Math.min(1, i / (rate * 0.002)) * rel(i, 0.15);
        }
        break;
      }
    }
    var g = vel;
    for (i = 0; i < len; i++) out[i] *= g;
    return out;
  }
  function formant(st, x, fc, rate) {
    // a two-pole resonator (state-variable filter, band-pass output)
    var fq = 2 * Math.sin(Math.PI * fc / rate), q = 0.12;
    var low = st[0] + fq * st[1];
    var high = x - low - q * st[1];
    var band = fq * high + st[1];
    st[0] = low; st[1] = band;
    return band * 0.6;
  }

  function drum(name, vel, rate, r) {
    var secs = { bd: 0.45, sd: 0.25, hh: 0.06, oh: 0.35, cp: 0.25, rim: 0.05, lt: 0.4, mt: 0.35, ht: 0.3, crash: 1.6, ride: 1.0, sh: 0.08, cb: 0.25 }[name] || 0.2;
    var len = Math.floor(secs * rate), out = new Float32Array(len), TAU = 2 * Math.PI, i, ph = 0, hp = 0, last = 0, lp = 0;
    function noise() { return r() * 2 - 1; }
    for (i = 0; i < len; i++) {
      var t = i / rate, s = 0;
      switch (name) {
        case "bd": ph += TAU * (45 + 110 * Math.exp(-t * 28)) / rate; s = Math.sin(ph) * Math.exp(-t * 7) * 1.0 + (i < rate * 0.0015 ? noise() * 0.15 : 0); s = Math.tanh(s * 1.5) * 0.8; break;
        case "sd": ph += TAU * (185 + 40 * Math.exp(-t * 40)) / rate; s = Math.sin(ph) * Math.exp(-t * 22) * 0.5; { var n0 = noise(); hp = 0.75 * (hp + n0 - last); last = n0; s += hp * Math.exp(-t * 16) * 0.55; } break;
        case "cp": { var n1 = noise(); hp = 0.8 * (hp + n1 - last); last = n1; var burst = t < 0.03 ? Math.exp(-((t * 1000) % 10) * 0.35) : Math.exp(-(t - 0.03) * 18); s = hp * burst * 0.6; } break;
        case "hh": case "oh": case "sh": { var n2 = noise(); hp = 0.55 * (hp + n2 - last); last = n2; s = hp * Math.exp(-t * (name === "hh" ? 70 : name === "sh" ? 45 : 9)) * (name === "sh" ? 0.18 : name === "hh" ? 0.22 : 0.26) * (name === "sh" ? Math.min(1, t / 0.015) : 1); } break;
        case "rim": s = (Math.sin(TAU * 1700 * t) * 0.5 + noise() * 0.3) * Math.exp(-t * 90); break;
        case "lt": case "mt": case "ht": { var base = name === "lt" ? 90 : name === "mt" ? 130 : 180; ph += TAU * (base + base * 0.8 * Math.exp(-t * 18)) / rate; s = Math.sin(ph) * Math.exp(-t * 9) * 0.7 + noise() * 0.05 * Math.exp(-t * 40); } break;
        case "crash": case "ride": {
          var mtl = 0, fr = name === "ride" ? [527, 797, 1171, 1489, 1837] : [403, 619, 911, 1259, 1523, 1997];
          for (var k = 0; k < fr.length; k++) mtl += Math.sin(TAU * fr[k] * 2.3 * t + k) > 0 ? 1 : -1;
          var n3 = noise(); hp = 0.6 * (hp + n3 - last); last = n3;
          s = (mtl / fr.length * 0.25 + hp * 0.45) * Math.exp(-t * (name === "crash" ? 2.2 : 3.5)) * (name === "ride" ? 0.5 : 0.6);
        } break;
        case "cb": { var a = (540 * t) % 1 < 0.5 ? 1 : -1, b = (800 * t) % 1 < 0.5 ? 1 : -1; lp += 0.3 * ((a + b) * 0.5 - lp); s = lp * Math.exp(-t * 12) * 0.5; } break;
      }
      out[i] = s * vel;
    }
    return out;
  }

  // Freeverb-style room: parallel combs into series all-passes, per side.
  function reverb(L, R, rate, amount) {
    var scale = rate / 44100, combs = [1116, 1188, 1277, 1356, 1422, 1491], aps = [556, 441, 341];
    function side(input, spread) {
      var out = new Float32Array(input.length);
      combs.forEach(function (c) {
        var n = Math.round((c + spread) * scale), buf = new Float32Array(n), p = 0, store = 0, fb = 0.83, damp = 0.25;
        for (var i = 0; i < input.length; i++) {
          var y = buf[p];
          store = y * (1 - damp) + store * damp;
          buf[p] = input[i] + store * fb;
          p = (p + 1) % n;
          out[i] += y;
        }
      });
      aps.forEach(function (a) {
        var n = Math.round((a + spread) * scale), buf = new Float32Array(n), p = 0;
        for (var i = 0; i < out.length; i++) {
          var bo = buf[p], x = out[i];
          out[i] = -x + bo;
          buf[p] = x + bo * 0.5;
          p = (p + 1) % n;
        }
      });
      return out;
    }
    var wl = side(L, 0), wr = side(R, 23), g = amount * 0.06;
    return [wl, wr, g];
  }

  // The whole song as stereo samples. opts: { rate, loops, from, to (beats) }.
  function render(input, opts) {
    opts = opts || {};
    var rate = opts.rate || 44100;
    var ev = input && input.notes ? input : events(input);
    var score = ev.score, spb = 60 / score.bpm;
    var total = Math.ceil((ev.beats * spb + 2.5) * rate);
    var L = new Float32Array(total), R = new Float32Array(total);
    var sendL = new Float32Array(total), sendR = new Float32Array(total);
    var r = rng(hash(score.title || "song") + score.seed);
    var names = Object.keys(score.tracks), cache = {};
    names.forEach(function (tn) {
      var tr = score.tracks[tn];
      if (tr.mute) return;
      var mine = ev.notes.filter(function (x) { return x.track === tn; });
      if (!mine.length) return;
      var tl = new Float32Array(total), gainL = Math.cos((tr.pan + 1) * Math.PI / 4), gainR = Math.sin((tr.pan + 1) * Math.PI / 4);
      var mono = /bass|sub|lead|chip|flute|brass/.test(tr.inst);
      for (var k = 0; k < mine.length; k++) {
        var x = mine[k], start = Math.floor(x.t * spb * rate);
        var gate = tr.inst === "drums" ? 1 : mono ? Math.max(0.85, tr.legato || 0.92) : 0.97;
        // loops repeat the same notes, so each sound is made once and reused
        var secs = Math.max(0.02, x.d * spb * gate);
        var key = tr.inst === "drums" ? "d" + x.drum : tr.inst + "|" + x.n + "|" + Math.round(secs * 200) + "|" + tr.tone + "|" + (k & 1);
        var s = cache[key];
        if (!s) s = cache[key] = tr.inst === "drums" ? drum(x.drum, 1, rate, r) : voice(tr.inst, x.n, secs, 1, rate, tr.tone, r);
        var g = x.v * (tr.inst === "drums" ? 1 : 0.92 + r() * 0.16);
        for (var i = 0; i < s.length && start + i < total; i++) tl[start + i] += s[i] * g;
      }
      var vol = tr.vol * (tr.inst === "drums" ? 0.8 : 0.75);
      // echo: a dotted-eighth delay, a little darker each time round
      if (tr.echo > 0) {
        var dl = Math.floor(spb * 0.75 * rate), fb = tr.echo * 0.6;
        for (var j = dl; j < total; j++) tl[j] += tl[j - dl] * fb;
      }
      for (var q = 0; q < total; q++) {
        var v = tl[q] * vol;
        L[q] += v * gainL; R[q] += v * gainR;
        sendL[q] += v * gainL * tr.rev; sendR[q] += v * gainR * tr.rev;
      }
    });
    if (score.reverb > 0) {
      var rv = reverb(sendL, sendR, rate, score.reverb);
      for (var z = 0; z < total; z++) { L[z] += rv[0][z] * rv[2]; R[z] += rv[1][z] * rv[2]; }
    }
    // master: gentle limiter, then normalize to about -1 dB
    var peak = 0;
    for (var m = 0; m < total; m++) { var a = Math.abs(L[m]), b = Math.abs(R[m]); if (a > peak) peak = a; if (b > peak) peak = b; }
    var pre = peak > 0 ? 1.4 / peak : 1, clipped = 0, rms = 0;
    for (var w = 0; w < total; w++) {
      L[w] = Math.tanh(L[w] * pre) * 0.89 / Math.tanh(1.4); R[w] = Math.tanh(R[w] * pre) * 0.89 / Math.tanh(1.4);
      rms += L[w] * L[w] + R[w] * R[w];
    }
    // trim silent tail
    var end = total;
    while (end > rate && Math.abs(L[end - 1]) < 1e-4 && Math.abs(R[end - 1]) < 1e-4) end--;
    end = Math.min(total, end + Math.floor(rate * 0.05));
    return { L: L.subarray(0, end), R: R.subarray(0, end), rate: rate, seconds: end / rate, rms: Math.sqrt(rms / (2 * total)), clipped: clipped, peak: peak };
  }

  function toWav(L, R, rate) {
    var n = L.length, ch = R ? 2 : 1, bytes = new Uint8Array(44 + n * 2 * ch), v = new DataView(bytes.buffer);
    function str(o, s) { for (var i = 0; i < s.length; i++) bytes[o + i] = s.charCodeAt(i); }
    str(0, "RIFF"); v.setUint32(4, 36 + n * 2 * ch, true); str(8, "WAVE"); str(12, "fmt ");
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, ch, true); v.setUint32(24, rate, true);
    v.setUint32(28, rate * 2 * ch, true); v.setUint16(32, 2 * ch, true); v.setUint16(34, 16, true); str(36, "data"); v.setUint32(40, n * 2 * ch, true);
    var o = 44;
    for (var i = 0; i < n; i++) {
      v.setInt16(o, Math.round(clamp(L[i], -1, 1) * 32767), true); o += 2;
      if (R) { v.setInt16(o, Math.round(clamp(R[i], -1, 1) * 32767), true); o += 2; }
    }
    return bytes;
  }

  // ---- MIDI -----------------------------------------------------------------
  function toMidi(input) {
    var ev = input && input.notes ? input : events(input);
    var score = ev.score, PPQ = 480, chunks = [];
    function vlq(n) { var b = [n & 0x7f]; while ((n >>= 7)) b.unshift((n & 0x7f) | 0x80); return b; }
    function trackChunk(evs) {
      evs.sort(function (a, b) { return a.tick - b.tick || a.ord - b.ord; });
      var data = [], last = 0;
      evs.forEach(function (e) { data.push.apply(data, vlq(Math.max(0, e.tick - last))); data.push.apply(data, e.bytes); last = e.tick; });
      data.push(0, 0xff, 0x2f, 0);
      return [0x4d, 0x54, 0x72, 0x6b, (data.length >>> 24) & 255, (data.length >>> 16) & 255, (data.length >>> 8) & 255, data.length & 255].concat(data);
    }
    function text(type, s) { var b = []; for (var i = 0; i < s.length; i++) b.push(s.charCodeAt(i) & 0x7f); return [0xff, type].concat(vlq(b.length), b); }
    var us = Math.round(60000000 / score.bpm);
    var meta = [
      { tick: 0, ord: 0, bytes: text(3, score.title || "Maxx score") },
      { tick: 0, ord: 1, bytes: [0xff, 0x51, 3, (us >> 16) & 255, (us >> 8) & 255, us & 255] },
      { tick: 0, ord: 2, bytes: [0xff, 0x58, 4, Math.round(score.meter), 2, 24, 8] }
    ];
    ev.sections.forEach(function (s, i) { meta.push({ tick: Math.round(s.beat * PPQ), ord: 3 + i, bytes: text(6, s.name) }); });
    chunks.push(trackChunk(meta));
    var chan = 0;
    Object.keys(score.tracks).forEach(function (tn) {
      var tr = score.tracks[tn];
      var mine = ev.notes.filter(function (x) { return x.track === tn; });
      if (!mine.length) return;
      var c = tr.inst === "drums" ? 9 : chan++;
      if (chan === 9) chan++;
      if (c > 15) return;
      var list = [{ tick: 0, ord: 0, bytes: text(3, tn) }];
      if (c !== 9) list.push({ tick: 0, ord: 1, bytes: [0xc0 | c, INSTRUMENTS[tr.inst].gm] });
      list.push({ tick: 0, ord: 2, bytes: [0xb0 | c, 10, Math.round((tr.pan + 1) * 63.5)] });
      list.push({ tick: 0, ord: 3, bytes: [0xb0 | c, 7, Math.round(clamp(tr.vol, 0, 1.27) * 100)] });
      mine.forEach(function (x) {
        var on = Math.round(x.t * PPQ), off = Math.max(on + 1, Math.round((x.t + (tr.inst === "drums" ? 0.1 : x.d * 0.97)) * PPQ));
        var vel = Math.round(clamp(x.v * 96, 1, 127)), n = clamp(Math.round(x.n), 0, 127);
        list.push({ tick: on, ord: 5, bytes: [0x90 | c, n, vel] });
        list.push({ tick: off, ord: 4, bytes: [0x80 | c, n, 0] });
      });
      chunks.push(trackChunk(list));
    });
    var head = [0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 1, 0, chunks.length, (PPQ >> 8) & 255, PPQ & 255];
    var all = head;
    chunks.forEach(function (c) { all = all.concat(c); });
    return new Uint8Array(all);
  }

  // ---- what the model gets back ---------------------------------------------
  var MAJOR = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
  var MINOR = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
  var KEYNAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
  function detectKey(notes) {
    var h = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    notes.forEach(function (x) { if (!x.drum) h[((Math.round(x.n) % 12) + 12) % 12] += x.d; });
    var best = null;
    for (var k = 0; k < 12; k++) {
      [[MAJOR, "major"], [MINOR, "minor"]].forEach(function (pr) {
        var p = pr[0], mx = 0, my = 0, i;
        for (i = 0; i < 12; i++) { mx += h[(i + k) % 12]; my += p[i]; }
        mx /= 12; my /= 12;
        var num = 0, dx = 0, dy = 0;
        for (i = 0; i < 12; i++) { var a = h[(i + k) % 12] - mx, b = p[i] - my; num += a * b; dx += a * a; dy += b * b; }
        var cor = dx && dy ? num / Math.sqrt(dx * dy) : 0;
        if (!best || cor > best.cor) best = { root: k, mode: pr[1], cor: cor };
      });
    }
    return best && best.cor > 0 ? best : null;
  }
  function parseKey(s) {
    var m = /^\s*([A-Ga-g])(#|b)?\s*(major|maj|minor|min|dorian|mixolydian|lydian|phrygian|m)?\b/.exec(s || "");
    if (!m) return null;
    var root = (PC[m[1].toLowerCase()] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0) + 12) % 12;
    var mode = !m[3] ? (m[1] === m[1].toLowerCase() ? "minor" : "major") : /^m(in(or)?)?$/.test(m[3]) ? "minor" : /maj/.test(m[3]) ? "major" : m[3];
    return { root: root, mode: mode };
  }
  var SCALES = { major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10], mixolydian: [0, 2, 4, 5, 7, 9, 10], lydian: [0, 2, 4, 6, 7, 9, 11], phrygian: [0, 1, 3, 5, 7, 8, 10] };

  function where(beat, meter) { return "bar " + (Math.floor(beat / meter) + 1) + " beat " + (Math.round((beat % meter + 1) * 100) / 100); }

  // A short report: length, tracks, key, and what looks wrong.
  function analyze(input) {
    var ev = input && input.notes ? input : events(input);
    var score = ev.score, out = { title: score.title, bpm: score.bpm, meter: score.meter, beats: ev.beats, bars: ev.beats / score.meter, seconds: ev.beats * 60 / score.bpm, tracks: [], warnings: [], errors: score.errors.slice(), sections: ev.sections };
    var tonal = ev.notes.filter(function (x) { return !x.drum; });
    var found = detectKey(tonal);
    var declared = parseKey(score.key);
    var key = declared || found;
    out.key = key ? KEYNAMES[key.root] + " " + key.mode : "";
    if (found) out.detected = KEYNAMES[found.root] + " " + found.mode;
    if (declared && found) out.relative = (declared.mode === "major" && found.mode === "minor" && (declared.root + 9) % 12 === found.root) || (declared.mode === "minor" && found.mode === "major" && (declared.root + 3) % 12 === found.root);
    Object.keys(score.tracks).forEach(function (tn) {
      var tr = score.tracks[tn], mine = ev.notes.filter(function (x) { return x.track === tn; });
      var info = { name: tn, inst: tr.inst, notes: mine.length, mute: tr.mute };
      if (tr.inst !== "drums" && mine.length) {
        var lo = 999, hi = -999;
        mine.forEach(function (x) { if (x.n < lo) lo = x.n; if (x.n > hi) hi = x.n; });
        info.range = noteName(lo) + "-" + noteName(hi);
        var I = INSTRUMENTS[tr.inst];
        if (lo < I.lo - 2) out.warnings.push(tn + " goes down to " + noteName(lo) + ", too low for " + tr.inst + " (from " + noteName(I.lo) + "); it will sound muddy");
        if (hi > I.hi + 2) out.warnings.push(tn + " goes up to " + noteName(hi) + ", too high for " + tr.inst + " (up to " + noteName(I.hi) + ")");
        if (/bass|sub/.test(tr.inst) && hi > 64) out.warnings.push(tn + " is a bass but reaches " + noteName(hi) + "; basslines usually stay below e4 (try oct 2 or notes like a1 e2)");
      }
      if (!mine.length && !tr.mute) out.warnings.push(tn + " has no notes");
      // too dense?
      var bars = ev.beats / score.meter || 1;
      if (mine.length / bars > 48 && tr.inst !== "drums") out.warnings.push(tn + " plays " + Math.round(mine.length / bars) + " notes a bar; that is a blur at " + score.bpm + " bpm");
      out.tracks.push(info);
    });
    if (key && SCALES[key.mode]) {
      var sc = SCALES[key.mode], outside = [];
      tonal.forEach(function (x) {
        var deg = ((Math.round(x.n) - key.root) % 12 + 12) % 12;
        if (sc.indexOf(deg) < 0 && x.d >= 0.5) outside.push(x);
      });
      if (outside.length > Math.max(2, tonal.length * 0.08)) {
        out.warnings.push(outside.length + " long notes are outside " + out.key + ", e.g. " + outside.slice(0, 4).map(function (x) { return x.track + " " + noteName(x.n) + " at " + where(x.t, score.meter); }).join(", ") + " (fine if on purpose)");
      }
    }
    if (declared && found && (declared.root !== found.root || declared.mode !== found.mode) && found.cor > 0.75) {
      var rel = (declared.mode === "major" && found.mode === "minor" && (declared.root + 9) % 12 === found.root) || (declared.mode === "minor" && found.mode === "major" && (declared.root + 3) % 12 === found.root);
      if (!rel) out.warnings.push("the key says " + out.key + " but the notes sound like " + out.detected);
    }
    // the same bar over and over?
    var lead = out.tracks.filter(function (t) { return !/drums|bass|sub|pad/.test(t.inst); });
    if (out.bars >= 8 && lead.length) {
      lead.forEach(function (t) {
        var parts = 0, distinct = {};
        ev.sections.forEach(function (s) {
          var S = score.sections[s.name], p = S.parts[t.name];
          if (p) { parts++; p.bars.forEach(function (b) { distinct[JSON.stringify(b)] = 1; }); }
        });
        if (parts && Object.keys(distinct).length === 1) out.warnings.push(t.name + " repeats one bar for the whole song; vary it with more bars, <a b> turns or a section B");
      });
    }
    if (!ev.notes.length) out.warnings.push("the score has no notes");
    if (out.seconds > 600) out.warnings.push("the song is " + Math.round(out.seconds) + "s long; that is over 10 minutes");
    return out;
  }

  function describe(input) {
    var a = analyze(input);
    var mins = Math.floor(a.seconds / 60), secs = Math.round(a.seconds % 60);
    var lines = [(a.title ? a.title + ": " : "") + Math.round(a.bars) + " bars at " + a.bpm + " bpm" + (a.meter !== 4 ? " in " + a.meter + "/4" : "") + ", " + mins + ":" + (secs < 10 ? "0" : "") + secs + (a.key ? ", " + a.key : "") + (a.detected && a.detected !== a.key && !a.relative ? " (notes suggest " + a.detected + ")" : "")];
    if (a.sections.length > 1) lines.push("form: " + a.sections.map(function (s) { return s.name + "(" + s.bars + ")"; }).join(" "));
    a.tracks.forEach(function (t) { lines.push("  " + t.name.replace(/~(.*)$/, " [$1]") + " (" + t.inst + "): " + (t.mute ? "muted" : t.notes + " notes" + (t.range ? ", " + t.range : ""))); });
    return { text: lines.join("\n"), analysis: a };
  }

  return {
    INSTRUMENTS: INSTRUMENTS, DRUMS: DRUMS, QUALITIES: QUALITIES,
    parse: parse, events: events, render: render, toWav: toWav, toMidi: toMidi, analyze: analyze, describe: describe,
    parseChord: parseChord, noteName: noteName, hz: hz, instOf: instOf, detectKey: detectKey, hash: hash
  };
})();
