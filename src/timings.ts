// How long each turn took, so the transcript can say "⏱ 4m12s" under the work and the
// user's message can show when it was sent. Saved with the session.
export type Timing = { text: string; start: string; ms: number; stopped?: boolean };

const key = (t: string) => t.replace(/\s+/g, " ").trim().slice(0, 200);

export function timingFor(text: string, start: number, end: number, stopped = false): Timing {
  return { text: key(text), start: new Date(start).toISOString(), ms: Math.max(0, end - start), ...(stopped ? { stopped: true } : {}) };
}

// Pairs each user message (in order) with its timing. History can be compacted and the
// Agent and Crew modes word their own messages, so a timing goes to the next message with
// the same text; a message with no timing gets none.
export function matchTimings(texts: string[], timings: Timing[]): (Timing | undefined)[] {
  let from = 0;
  return texts.map((t) => {
    const k = key(t);
    const i = timings.findIndex((x, j) => j >= from && x.text === k);
    if (i < 0) return undefined;
    from = i + 1;
    return timings[i];
  });
}
