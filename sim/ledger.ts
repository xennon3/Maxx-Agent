import { appendFileSync } from "node:fs";

// Simulated time. Each simulated component (model server, Gradle, phone) books
// what the step would take on the real machine and sleeps a compressed version
// of it, so a 20-minute session replays in under a minute.
export const SPEEDUP = Number(process.env.SIM_SPEEDUP ?? 40);

export type Entry = { who: string; what: string; virtual: number; real: number; t: number; extra?: Record<string, unknown> };

export async function spend(who: string, what: string, virtualSeconds: number, extra?: Record<string, unknown>) {
  const real = virtualSeconds / SPEEDUP;
  if (process.env.SIM_LEDGER) appendFileSync(process.env.SIM_LEDGER, JSON.stringify({ who, what, virtual: virtualSeconds, real, t: Date.now(), extra } satisfies Entry) + "\n");
  await Bun.sleep(real * 1000);
}

export function spendSync(who: string, what: string, virtualSeconds: number) {
  const real = virtualSeconds / SPEEDUP;
  if (process.env.SIM_LEDGER) appendFileSync(process.env.SIM_LEDGER, JSON.stringify({ who, what, virtual: virtualSeconds, real, t: Date.now() } satisfies Entry) + "\n");
  Bun.sleepSync(real * 1000);
}
