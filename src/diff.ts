// A small line diff (LCS) for permission previews. Fine for edit-sized inputs.
const RED = "\x1b[31m", GREEN = "\x1b[32m", DIM = "\x1b[2m", RESET = "\x1b[0m";

export function lineDiff(before: string, after: string, context = 3): string {
  const a = before.split("\n"), b = after.split("\n");
  const n = a.length, m = b.length;
  if (n * m > 4_000_000) return `${DIM}(diff too large to show: ${n} -> ${m} lines)${RESET}`;
  const dp: Uint32Array[] = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i]![j] = a[i] === b[j] ? dp[i + 1]![j + 1]! + 1 : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);

  type Op = { k: " " | "-" | "+"; t: string };
  const ops: Op[] = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) ops.push({ k: " ", t: a[i++]! }), j++;
    else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) ops.push({ k: "-", t: a[i++]! });
    else ops.push({ k: "+", t: b[j++]! });
  }
  while (i < n) ops.push({ k: "-", t: a[i++]! });
  while (j < m) ops.push({ k: "+", t: b[j++]! });

  // Keep only changed lines plus a little context around them.
  const keep = new Set<number>();
  ops.forEach((o, idx) => {
    if (o.k !== " ") for (let d = -context; d <= context; d++) keep.add(idx + d);
  });
  const out: string[] = [];
  let last = -1;
  ops.forEach((o, idx) => {
    if (!keep.has(idx)) return;
    if (last !== -1 && idx !== last + 1) out.push(`${DIM}  ...${RESET}`);
    last = idx;
    const color = o.k === "-" ? RED : o.k === "+" ? GREEN : DIM;
    out.push(`${color}${o.k} ${o.t}${RESET}`);
  });
  return out.length ? out.join("\n") : `${DIM}(no changes)${RESET}`;
}
