// Every request Maxx has open on the model server. A server like Strata will
// not unload a model while it has requests from Maxx, so Stop, closing the
// last window and quitting all cancel every one, and the header shows any
// that are still open.

const open = new Map<AbortController, { model: string; since: number }>();
let listener: (() => void) | null = null;

export function trackRequest(ctl: AbortController, model: string): () => void {
  open.set(ctl, { model, since: Date.now() });
  listener?.();
  return () => {
    if (open.delete(ctl)) listener?.();
  };
}

// Cancels them all and says how many there were.
export function cancelAllRequests(): number {
  const n = open.size;
  for (const ctl of [...open.keys()]) ctl.abort();
  open.clear();
  if (n) listener?.();
  return n;
}

export const openRequests = () => [...open.values()].map((r) => ({ ...r }));

export function onRequestsChange(f: (() => void) | null) {
  listener = f;
}
