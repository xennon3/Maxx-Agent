// Turn-taking for a model server. LM Studio answers a set number of requests
// at once per model ("Max Concurrent Predictions" in the model's load
// settings, 4 by default since 0.4; older versions and some setups do 1) and
// queues the rest out of sight. Crew mode keeps that queue on its own side
// instead, so the board can say which worker is waiting for the model, and
// workers that are busy running a build or reading files don't hold a slot.

import type { LLMConfig } from "./llm.ts";

export type GateState = { model: string; slots: number; busy: number; waiting: number };

export class Gate {
  private busy = 0;
  private queue: { go: () => void; drop: (e: Error) => void }[] = [];

  constructor(readonly model: string, public slots: number, private changed: () => void = () => {}) {}

  get state(): GateState {
    return { model: this.model, slots: this.slots, busy: this.busy, waiting: this.queue.length };
  }

  // Waits for a free slot; the returned function gives it back (once).
  async acquire(signal?: AbortSignal, waiting?: (queued: boolean) => void): Promise<() => void> {
    if (signal?.aborted) throw abortError();
    if (this.busy >= this.slots) {
      waiting?.(true);
      await new Promise<void>((resolve, reject) => {
        const entry = {
          go: () => (signal?.removeEventListener("abort", onAbort), resolve()),
          drop: (e: Error) => reject(e),
        };
        const onAbort = () => {
          this.queue = this.queue.filter((q) => q !== entry);
          this.changed();
          entry.drop(abortError());
        };
        signal?.addEventListener("abort", onAbort, { once: true });
        this.queue.push(entry);
        this.changed();
      });
      waiting?.(false);
    } else this.busy++;
    this.changed();
    let given = false;
    return () => {
      if (given) return;
      given = true;
      const next = this.queue.shift();
      // The slot passes straight to the next in line, so busy stays the same.
      if (next) next.go();
      else this.busy--;
      this.changed();
    };
  }

  // A changed slot count (from the settings or the probe) lets waiting workers in.
  resize(slots: number) {
    this.slots = Math.max(1, slots);
    while (this.busy < this.slots && this.queue.length) (this.busy++, this.queue.shift()!.go());
    this.changed();
  }
}

const abortError = () => Object.assign(new Error("stopped"), { name: "AbortError" });

// One gate per model on the server, shared by every worker that uses it.
export class Gates {
  private gates = new Map<string, Gate>();
  constructor(private changed: () => void = () => {}) {}

  get(model: string, slots = 1): Gate {
    let g = this.gates.get(model);
    if (!g) this.gates.set(model, (g = new Gate(model, slots, this.changed)));
    return g;
  }

  states(): GateState[] {
    return [...this.gates.values()].map((g) => g.state);
  }
}

// How many requests the server really runs at once for a model: one short
// request alone, then `n` together. If together takes about n times as long,
// the server is taking them one by one.
export async function probeParallel(llm: LLMConfig, n: number, signal?: AbortSignal): Promise<{ slots: number; aloneMs: number; togetherMs: number }> {
  const one = async () => {
    const t = performance.now();
    const res = await fetch(`${llm.baseURL.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      signal: signal ?? AbortSignal.timeout(120_000),
      headers: { "content-type": "application/json", authorization: `Bearer ${llm.apiKey ?? "lm-studio"}` },
      body: JSON.stringify({ model: llm.model, messages: [{ role: "user", content: "Count from 1 to 30, numbers only." }], max_tokens: 48, temperature: 0, stream: false }),
    });
    await res.text();
    if (!res.ok) throw new Error(`model server returned ${res.status}`);
    return performance.now() - t;
  };
  // The first request may load the model or warm the cache; it doesn't count.
  await one();
  const aloneMs = await one();
  const t = performance.now();
  await Promise.all(Array.from({ length: n }, one));
  const togetherMs = performance.now() - t;
  return { slots: slotsFrom(aloneMs, togetherMs, n), aloneMs, togetherMs };
}

// n requests in `together` ms that take `alone` ms each: about n·alone/together ran at once.
export function slotsFrom(aloneMs: number, togetherMs: number, n: number): number {
  if (n <= 1 || aloneMs <= 0) return 1;
  const ratio = togetherMs / aloneMs;
  // Batched requests run a little slower each, so anything well under n means "at once".
  if (ratio >= n * 0.8) return 1;
  return Math.max(1, Math.min(n, Math.round(n / Math.max(1, ratio))));
}
