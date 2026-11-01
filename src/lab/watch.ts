import { mkdir, writeFile, appendFile } from "node:fs/promises";
import { join } from "node:path";
import { parseArgs, type Instrument } from "./instruments.ts";
import { toCSV, type Row } from "./data.ts";
import { addLeads } from "./discover.ts";

// Overnight watch: leave a sensor running and let Maxx look for surprises.
// The instrument is read in chunks; every value is compared with the recent
// past (a rolling mean and spread), and anything far outside it is logged as
// an anomaly and saved to the serendipity log. On Windows the PC is kept
// awake while it runs (it otherwise sleeps after a few minutes and the
// watch dies with it).

export type Anomaly = { at: string; t: number; key: string; value: number; z: number };
export type WatchState = { id: string; instrument: string; args: string; hours: number; chunk: number; started: string; ends: string; state: "running" | "done" | "stopped" | "failed"; rows: number; chunks: number; anomalies: Anomaly[]; keys: string[]; last?: Record<string, number>; note?: string; dir: string; awake: boolean };

const WINDOW = 120;
export const Z_LIMIT = 4;

// Values far from the recent ones. `history` is the rolling window, mutated.
export function detect(history: Row[], fresh: Row[], keys: string[], at = (t: number) => new Date().toISOString()): Anomaly[] {
  const out: Anomaly[] = [];
  for (const r of fresh) {
    for (const k of keys) {
      const v = r[k];
      if (!Number.isFinite(v)) continue;
      const past = history.map((h) => h[k]).filter((x): x is number => Number.isFinite(x));
      if (past.length >= 20) {
        const mean = past.reduce((a, b) => a + b, 0) / past.length;
        const sd = Math.sqrt(past.reduce((a, b) => a + (b - mean) ** 2, 0) / (past.length - 1)) || Math.abs(mean) * 0.01 || 1e-9;
        const z = (v! - mean) / sd;
        if (Math.abs(z) >= Z_LIMIT) out.push({ at: at(r.t ?? 0), t: r.t ?? 0, key: k, value: v!, z: Math.round(z * 10) / 10 });
      }
    }
    history.push(r);
    if (history.length > WINDOW) history.shift();
  }
  return out;
}

// Windows: SetThreadExecutionState(ES_CONTINUOUS | ES_SYSTEM_REQUIRED) from a
// PowerShell child that lives as long as the watch.
export function keepAwake(platform = process.platform): { stop(): void; on: boolean } {
  if (platform !== "win32") return { stop() {}, on: false };
  const ps = `Add-Type -Name P -Namespace W -MemberDefinition '[DllImport("kernel32.dll")] public static extern uint SetThreadExecutionState(uint f);'; [W.P]::SetThreadExecutionState(0x80000001) | Out-Null; while ($true) { Start-Sleep -Seconds 50; [W.P]::SetThreadExecutionState(0x80000001) | Out-Null }`;
  try {
    const p = Bun.spawn(["powershell.exe", "-NoLogo", "-NoProfile", "-NonInteractive", "-Command", ps], { stdout: "ignore", stderr: "ignore", stdin: "ignore" });
    return { stop: () => p.kill(), on: true };
  } catch {
    return { stop() {}, on: false };
  }
}

export async function runWatch(o: { inst: Instrument; args: string; hours: number; chunkSeconds: number; root: string; cwd: string; signal: AbortSignal; update(w: WatchState): void; awake?: () => { stop(): void; on: boolean } }): Promise<WatchState> {
  const id = `watch-${new Date().toISOString().replace(/[-:]/g, "").slice(0, 13)}-${o.inst.id.replace(/[^\w]+/g, "-")}`;
  const dir = join(o.root, id);
  await mkdir(dir, { recursive: true });
  const started = Date.now();
  const end = started + o.hours * 3600_000;
  const awake = (o.awake ?? keepAwake)();
  const w: WatchState = { id, instrument: o.inst.id, args: o.args, hours: o.hours, chunk: o.chunkSeconds, started: new Date(started).toISOString(), ends: new Date(end).toISOString(), state: "running", rows: 0, chunks: 0, anomalies: [], keys: [], dir, awake: awake.on };
  const history: Row[] = [];
  const all: Row[] = [];
  let fails = 0;
  o.update({ ...w });
  try {
    while (Date.now() < end && !o.signal.aborted) {
      const t0 = (Date.now() - started) / 1000;
      try {
        const args = { ...parseArgs(o.args), seconds: String(o.chunkSeconds), frames: "1" };
        const r = await o.inst.run(args, { cwd: o.cwd, signal: o.signal, serialSeconds: o.chunkSeconds });
        fails = 0;
        const keys = (r.keys ?? []).filter((k) => k !== "t");
        const rows = (r.rows ?? []).map((x) => ({ ...x, t: +(t0 + (x.t ?? 0)).toFixed(2) }));
        w.keys = [...new Set([...w.keys, ...keys])];
        const found = detect(history, rows, keys, (t) => new Date(started + t * 1000).toISOString());
        w.anomalies.push(...found);
        all.push(...rows);
        w.rows += rows.length;
        w.chunks++;
        w.last = rows.at(-1);
        if (rows.length) await appendFile(join(dir, "readings.jsonl"), rows.map((x) => JSON.stringify(x)).join("\n") + "\n");
        if (found.length) await addLeads(found.slice(0, 5).map((a) => ({ kind: "anomaly", source: id, text: `${o.inst.label}: ${a.key} hit ${+a.value.toPrecision(4)} at ${a.at.slice(11, 19)} (${a.z > 0 ? "+" : ""}${a.z} sd from the hour before)`, question: `What made ${a.key} on ${o.inst.label} jump to ${+a.value.toPrecision(4)} at ${a.at.slice(11, 16)}?` })));
      } catch (e) {
        if (o.signal.aborted) break;
        w.note = `a reading failed: ${(e as Error).message}`;
        if (++fails >= 5) throw new Error(`5 readings in a row failed: ${(e as Error).message}`);
        await Bun.sleep(5000);
      }
      o.update({ ...w, anomalies: w.anomalies.slice(-20) });
    }
    w.state = o.signal.aborted ? "stopped" : "done";
  } catch (e) {
    w.state = "failed";
    w.note = (e as Error).message;
  } finally {
    awake.stop();
  }
  if (all.length) await writeFile(join(dir, "readings.csv"), toCSV(all, w.keys));
  w.note = `${w.rows} readings in ${w.chunks} chunks, ${w.anomalies.length} anomal${w.anomalies.length === 1 ? "y" : "ies"}.${w.note && w.state === "failed" ? ` ${w.note}` : ""}`;
  await writeFile(join(dir, "watch.json"), JSON.stringify(w, null, 2));
  o.update({ ...w, anomalies: w.anomalies.slice(-20) });
  return w;
}
