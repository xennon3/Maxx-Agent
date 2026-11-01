import jpeg from "jpeg-js";

// Turning what instruments send into numbers a weak model can reason about.
// A serial device or a command prints lines; a camera gives frames; a mic
// gives samples. Each becomes rows (one per reading, `t` in seconds from the
// start), a CSV the test scripts load, and a few lines of statistics the
// model reads instead of the raw data.

export type Row = Record<string, number>;
export type Stat = { key: string; n: number; min: number; max: number; mean: number; sd: number; first: number; last: number; slope: number };

const NUM = String.raw`[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?`;
const PAIR = new RegExp(String.raw`([A-Za-z_][\w.%°/-]*)\s*[=:]\s*(${NUM})`, "g");
const isNum = (s: string) => new RegExp(`^${NUM}$`).test(s.trim());

// "temp=23.4, hum=40" · "T: 23.4 H: 40" · CSV with a header line · bare numbers.
// `at` is each line's time in seconds; lines without numbers are skipped.
export function parseLines(lines: { t: number; text: string }[]): { rows: Row[]; keys: string[] } {
  const rows: Row[] = [];
  const keys = new Set<string>();
  let header: string[] | null = null;
  for (const { t, text } of lines) {
    const line = text.trim();
    if (!line) continue;
    const pairs = [...line.matchAll(PAIR)];
    if (pairs.length) {
      const row: Row = { t };
      for (const p of pairs) {
        // "t" is the time column, so a sensor's own "T:" becomes t_value.
        const k0 = p[1]!.replace(/[^\w]+/g, "_").replace(/^_|_$/g, "").toLowerCase() || "v";
        const k = k0 === "t" ? "t_value" : k0;
        row[k] = Number(p[2]);
        keys.add(k);
      }
      rows.push(row);
      continue;
    }
    const cells = line.split(/[,;\t]|\s+/).map((c) => c.trim()).filter(Boolean);
    if (!cells.length) continue;
    if (cells.every(isNum)) {
      const row: Row = { t };
      cells.forEach((c, i) => {
        const k = header?.[i] ?? `v${i + 1}`;
        row[k] = Number(c);
        keys.add(k);
      });
      rows.push(row);
    } else if (!rows.length && cells.length > 1 && cells.every((c) => !isNum(c))) {
      header = cells.map((c) => c.replace(/[^\w]+/g, "_").replace(/^_|_$/g, "").toLowerCase() || "v");
    }
  }
  return { rows, keys: [...keys] };
}

export function toCSV(rows: Row[], keys: string[]): string {
  const cols = ["t", ...keys.filter((k) => k !== "t")];
  return [cols.join(","), ...rows.map((r) => cols.map((c) => (r[c] === undefined ? "" : String(+r[c]!.toFixed(6)))).join(","))].join("\n") + "\n";
}

export function stats(rows: Row[], keys: string[]): Stat[] {
  return keys.filter((k) => k !== "t").map((key) => {
    const pts = rows.filter((r) => Number.isFinite(r[key])).map((r) => [r.t ?? 0, r[key]!] as const);
    const v = pts.map((p) => p[1]);
    const n = v.length;
    const mean = n ? v.reduce((a, b) => a + b, 0) / n : 0;
    const sd = n > 1 ? Math.sqrt(v.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1)) : 0;
    // Least-squares slope per second: is it rising or falling?
    const tm = n ? pts.reduce((a, p) => a + p[0], 0) / n : 0;
    const den = pts.reduce((a, p) => a + (p[0] - tm) ** 2, 0);
    const slope = den ? pts.reduce((a, p) => a + (p[0] - tm) * (p[1] - mean), 0) / den : 0;
    return { key, n, min: n ? Math.min(...v) : 0, max: n ? Math.max(...v) : 0, mean, sd, first: v[0] ?? 0, last: v[n - 1] ?? 0, slope };
  });
}

const r3 = (x: number) => (Math.abs(x) >= 100 ? x.toFixed(1) : Math.abs(x) >= 1 ? x.toFixed(2) : x.toPrecision(3));
export function describeStats(s: Stat[]): string {
  return s.map((x) => `${x.key}: n=${x.n} mean=${r3(x.mean)} sd=${r3(x.sd)} min=${r3(x.min)} max=${r3(x.max)} first=${r3(x.first)} last=${r3(x.last)} trend=${x.slope >= 0 ? "+" : ""}${r3(x.slope)}/s`).join("\n");
}

// A few points per key for the notebook's sparklines.
export function series(rows: Row[], keys: string[], max = 120): { name: string; values: number[] }[] {
  const step = Math.max(1, Math.ceil(rows.length / max));
  return keys.filter((k) => k !== "t").slice(0, 6).map((name) => ({ name, values: rows.filter((_, i) => i % step === 0).map((r) => r[name]).filter((x): x is number => Number.isFinite(x)) }));
}

// ---- Audio ----

// 16-bit PCM mono WAV, the format the mic bridge and ffmpeg both give.
export function encodeWav(samples: Float32Array, rate: number): Uint8Array {
  const buf = new ArrayBuffer(44 + samples.length * 2);
  const d = new DataView(buf);
  const str = (o: number, s: string) => [...s].forEach((c, i) => d.setUint8(o + i, c.charCodeAt(0)));
  str(0, "RIFF"); d.setUint32(4, 36 + samples.length * 2, true); str(8, "WAVE"); str(12, "fmt ");
  d.setUint32(16, 16, true); d.setUint16(20, 1, true); d.setUint16(22, 1, true); d.setUint32(24, rate, true);
  d.setUint32(28, rate * 2, true); d.setUint16(32, 2, true); d.setUint16(34, 16, true); str(36, "data"); d.setUint32(40, samples.length * 2, true);
  samples.forEach((s, i) => d.setInt16(44 + i * 2, Math.max(-1, Math.min(1, s)) * 0x7fff, true));
  return new Uint8Array(buf);
}

export function decodeWav(wav: Uint8Array): { samples: Float32Array; rate: number } {
  const d = new DataView(wav.buffer, wav.byteOffset, wav.byteLength);
  const tag = (o: number) => String.fromCharCode(...wav.subarray(o, o + 4));
  if (tag(0) !== "RIFF" || tag(8) !== "WAVE") throw new Error("not a WAV file");
  let o = 12, rate = 16000, channels = 1, bits = 16;
  while (o + 8 <= wav.length) {
    const id = tag(o), size = d.getUint32(o + 4, true);
    if (id === "fmt ") (channels = d.getUint16(o + 10, true)), (rate = d.getUint32(o + 12, true)), (bits = d.getUint16(o + 22, true));
    if (id === "data") {
      if (bits !== 16) throw new Error(`${bits}-bit WAV; Maxx reads 16-bit`);
      const end = Math.min(wav.length, o + 8 + size);
      const n = Math.floor((end - o - 8) / 2 / channels);
      const out = new Float32Array(n);
      for (let i = 0; i < n; i++) out[i] = d.getInt16(o + 8 + i * 2 * channels, true) / 0x8000;
      return { samples: out, rate };
    }
    o += 8 + size + (size & 1);
  }
  throw new Error("WAV has no data");
}

// Loudness every 100 ms, the peak, and the loudest pitch: enough to test
// "is the fan louder on high?" or "what note is the buzzer?".
export function audioStats(samples: Float32Array, rate: number): { rows: Row[]; peakDb: number; rmsDb: number; dominantHz: number; seconds: number } {
  const win = Math.max(1, Math.round(rate / 10));
  const db = (x: number) => (x > 0 ? 20 * Math.log10(x) : -120);
  const rows: Row[] = [];
  let sum = 0, peak = 0;
  for (let i = 0; i < samples.length; i += win) {
    let s = 0;
    const end = Math.min(samples.length, i + win);
    for (let j = i; j < end; j++) (s += samples[j]! ** 2), (peak = Math.max(peak, Math.abs(samples[j]!)));
    sum += s;
    rows.push({ t: +(i / rate).toFixed(2), level_db: +db(Math.sqrt(s / (end - i))).toFixed(1) });
  }
  return { rows, peakDb: +db(peak).toFixed(1), rmsDb: +db(Math.sqrt(sum / Math.max(1, samples.length))).toFixed(1), dominantHz: dominant(samples, rate), seconds: +(samples.length / rate).toFixed(2) };
}

// The strongest frequency, averaged over a few 4096-sample windows.
export function dominant(samples: Float32Array, rate: number): number {
  const N = 4096;
  if (samples.length < N) return 0;
  const mags = new Float64Array(N / 2);
  const hops = Math.min(8, Math.floor(samples.length / N));
  for (let h = 0; h < hops; h++) {
    const off = Math.floor(((samples.length - N) * h) / Math.max(1, hops - 1));
    const re = new Float64Array(N), im = new Float64Array(N);
    for (let i = 0; i < N; i++) re[i] = samples[off + i]! * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (N - 1)));
    fft(re, im);
    for (let k = 1; k < N / 2; k++) mags[k]! += Math.hypot(re[k]!, im[k]!);
  }
  // Below 40 Hz is rumble and DC offset, not a pitch anyone asked about.
  const lo = Math.max(1, Math.ceil((40 * N) / rate));
  let best = lo;
  for (let k = lo + 1; k < N / 2; k++) if (mags[k]! > mags[best]!) best = k;
  return Math.round((best * rate) / N);
}

function fft(re: Float64Array, im: Float64Array) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) [re[i], re[j], im[i], im[j]] = [re[j]!, re[i]!, im[j]!, im[i]!];
  }
  for (let len = 2; len <= n; len <<= 1) {
    const a = (-2 * Math.PI) / len;
    for (let i = 0; i < n; i += len) {
      for (let k = 0; k < len / 2; k++) {
        const wr = Math.cos(a * k), wi = Math.sin(a * k);
        const xr = re[i + k + len / 2]! * wr - im[i + k + len / 2]! * wi;
        const xi = re[i + k + len / 2]! * wi + im[i + k + len / 2]! * wr;
        re[i + k + len / 2] = re[i + k]! - xr; im[i + k + len / 2] = im[i + k]! - xi;
        re[i + k]! += xr; im[i + k]! += xi;
      }
    }
  }
}

// ---- Camera ----

// Brightness, colour and how much changed since the previous frame.
export function frameStats(jpg: Uint8Array, prev?: Uint8Array): Row {
  const img = jpeg.decode(jpg, { useTArray: true, formatAsRGBA: true });
  const before = prev ? jpeg.decode(prev, { useTArray: true, formatAsRGBA: true }) : null;
  let r = 0, g = 0, b = 0, diff = 0, n = 0;
  const step = Math.max(1, Math.floor((img.width * img.height) / 40000));
  const same = before && before.width === img.width && before.height === img.height;
  for (let p = 0; p < img.width * img.height; p += step) {
    const i = p * 4;
    r += img.data[i]!; g += img.data[i + 1]!; b += img.data[i + 2]!;
    if (same) diff += (Math.abs(img.data[i]! - before!.data[i]!) + Math.abs(img.data[i + 1]! - before!.data[i + 1]!) + Math.abs(img.data[i + 2]! - before!.data[i + 2]!)) / 3;
    n++;
  }
  const row: Row = { brightness: +((0.2126 * r + 0.7152 * g + 0.0722 * b) / n / 2.55).toFixed(1), red: +(r / n).toFixed(1), green: +(g / n).toFixed(1), blue: +(b / n).toFixed(1) };
  if (same) row.motion = +((diff / n / 2.55)).toFixed(2);
  return row;
}
