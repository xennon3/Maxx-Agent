// Live phone video: `adb exec-out screenrecord --output-format=h264 -` sends
// the phone's own hardware-encoded H.264 stream, which the app window decodes
// with WebCodecs. That is smooth (up to 60 fps) where screencap polling manages
// about two frames a second. This file splits the raw Annex B byte stream into
// frames ("access units") the browser's VideoDecoder can take one at a time.

export type Frame = { data: Uint8Array; key: boolean; codec?: string };

// Child processes that stream (swappable so tests can feed canned bytes).
export type StreamProc = { stdout: ReadableStream<Uint8Array>; kill(): void; exited: Promise<number | null> };
export type Spawner = (argv: string[]) => StreamProc;
const spawnReal: Spawner = (argv) => {
  const p = Bun.spawn(argv, { stdout: "pipe", stderr: "ignore", stdin: "ignore" });
  return { stdout: p.stdout as ReadableStream<Uint8Array>, kill: () => p.kill(), exited: p.exited };
};
let spawner: Spawner = spawnReal;
export const spawnStream: Spawner = (argv) => spawner(argv);
export function setSpawner(s: Spawner | null) {
  spawner = s ?? spawnReal;
}

const nalType = (n: Uint8Array) => n[0]! & 0x1f;
const isVcl = (t: number) => t >= 1 && t <= 5;

// "avc1.PPCCLL" from a sequence parameter set (profile, constraints, level).
export function codecFromSps(sps: Uint8Array): string {
  const hex = (b: number) => b.toString(16).padStart(2, "0");
  return `avc1.${hex(sps[1]!)}${hex(sps[2]!)}${hex(sps[3]!)}`;
}

// Find start codes (00 00 01, or 00 00 00 01) and return the NAL units between
// them. The last one may be cut short by the pipe, so it is returned as `rest`.
export function splitNals(buf: Uint8Array): { nals: Uint8Array[]; rest: Uint8Array } {
  const starts: { at: number; len: number }[] = [];
  for (let i = 0; i + 2 < buf.length; i++) {
    if (buf[i] === 0 && buf[i + 1] === 0) {
      if (buf[i + 2] === 1) (starts.push({ at: i, len: 3 }), (i += 2));
      else if (buf[i + 2] === 0 && buf[i + 3] === 1) (starts.push({ at: i, len: 4 }), (i += 3));
    }
  }
  if (!starts.length) return { nals: [], rest: buf };
  const nals: Uint8Array[] = [];
  for (let k = 0; k + 1 < starts.length; k++) {
    const body = buf.subarray(starts[k]!.at + starts[k]!.len, starts[k + 1]!.at);
    if (body.length) nals.push(body);
  }
  return { nals, rest: buf.subarray(starts.at(-1)!.at) };
}

const START = new Uint8Array([0, 0, 0, 1]);
function annexB(nals: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(nals.reduce((n, x) => n + 4 + x.length, 0));
  let o = 0;
  for (const n of nals) (out.set(START, o), out.set(n, o + 4), (o += 4 + n.length));
  return out;
}

// Groups NAL units into whole frames. screenrecord only sends a frame when the
// screen changes, so the last NAL of a frame is flushed after a short quiet
// spell instead of waiting for the next frame's start code (which could be
// minutes away on a still screen).
export class AccessUnits {
  private buf: Uint8Array = new Uint8Array(0);
  private au: Uint8Array[] = [];
  private codec: string | undefined;

  constructor(private emit: (f: Frame) => void) {}

  push(chunk: Uint8Array) {
    const joined = new Uint8Array(this.buf.length + chunk.length);
    joined.set(this.buf);
    joined.set(chunk, this.buf.length);
    const { nals, rest } = splitNals(joined);
    this.buf = rest;
    for (const n of nals) this.nal(n);
  }

  // No more bytes for now: the pending NAL is complete.
  flush() {
    const { nals } = splitNals(this.buf);
    const last = this.buf.subarray(this.buf[2] === 1 ? 3 : 4);
    if (this.buf.length > 4 && !nals.length) this.nal(last);
    this.buf = new Uint8Array(0);
    this.done();
  }

  private nal(n: Uint8Array) {
    const t = nalType(n);
    const hasVcl = this.au.some((x) => isVcl(nalType(x)));
    // A parameter set, SEI or delimiter after picture data, or a slice that starts
    // at macroblock 0, begins the next frame.
    if (hasVcl && ((t >= 6 && t <= 9) || (isVcl(t) && (n[1]! & 0x80) !== 0))) this.done();
    if (t === 7) this.codec = codecFromSps(n);
    this.au.push(n);
  }

  private done() {
    if (!this.au.some((x) => isVcl(nalType(x)))) return;
    const key = this.au.some((x) => nalType(x) === 5);
    this.emit({ data: annexB(this.au), key, ...(key && this.codec ? { codec: this.codec } : {}) });
    this.au = [];
  }
}

// Pick a capture size the phone's encoder accepts: full size up to 1920 on the
// long side, otherwise scaled down, with both sides a multiple of 16.
export function captureSize(w: number, h: number, maxSide = Number(process.env.MAXX_MIRROR_MAX ?? 1920)): { w: number; h: number } | null {
  const long = Math.max(w, h);
  if (long <= maxSide) return null;
  const s = maxSide / long;
  const r = (v: number) => Math.max(16, Math.floor((v * s) / 16) * 16);
  return { w: r(w), h: r(h) };
}

export function screenrecordArgs(size: { w: number; h: number } | null, bitRate = Number(process.env.MAXX_MIRROR_BITRATE ?? 8_000_000)): string[] {
  return ["exec-out", "screenrecord", "--output-format=h264", `--bit-rate=${bitRate}`, ...(size ? [`--size=${size.w}x${size.h}`] : []), "--time-limit=180", "-"];
}

// Read a streaming process into frames until it ends or `stop` is called.
export async function pump(proc: StreamProc, units: AccessUnits, quietMs = 12): Promise<void> {
  const reader = proc.stdout.getReader();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      clearTimeout(timer);
      units.push(value);
      timer = setTimeout(() => units.flush(), quietMs);
    }
  } finally {
    clearTimeout(timer);
    units.flush();
  }
}
