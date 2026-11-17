// Finding the right saved passage without the internet or a GPU: pages are cut
// into sections, and a query is matched with BM25 (the ranking classic search
// engines started with). Version numbers and tech names (agp, 8.13, three.js,
// c++) stay whole, so "gradle 9.1 agp" finds the line that says exactly that.

const STOP = new Set("a an and are as at be but by can do does for from has have how i if in into is it its me my no not of on or our so than that the their them then there these they this to too us was we were what when where which who why will with you your about after all also any been before being both did each few get got just more most much need only other over same should some such very via want would use using".split(" "));

export function tokens(text: string): string[] {
  const out: string[] = [];
  for (const raw of text.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}._+#-]*/gu) ?? []) {
    const w = raw.replace(/[._-]+$/, "");
    if (w.length < 2 && !/\d/.test(w)) continue;
    if (STOP.has(w)) continue;
    out.push(stem(w));
    // three.js -> three, js too; but 8.13 and v1.2 stay as one number.
    if (/[._-]/.test(w) && !/^v?\d+([._]\d+)*$/.test(w)) for (const part of w.split(/[._-]+/)) if (part.length > 1 && !STOP.has(part)) out.push(stem(part));
  }
  return out;
}

// A light touch: errors -> error, builds -> build. Never on numbers or short words.
function stem(w: string): string {
  if (w.length <= 3 || /[\d._+#-]/.test(w)) return w;
  if (w.endsWith("ies") && w.length > 4) return w.slice(0, -3) + "y";
  if (w.endsWith("sses")) return w.slice(0, -2);
  if (w.endsWith("s") && !w.endsWith("ss") && !w.endsWith("us") && !w.endsWith("is")) return w.slice(0, -1);
  return w;
}

// Sections of about `size` characters, cut at headings and paragraphs; each
// keeps the heading it sits under, so a passage still says what it is about.
export function chunk(text: string, size = 900): string[] {
  const out: string[] = [];
  let heading = "";
  let cur = "";
  const flush = () => {
    const t = cur.trim();
    if (t.length > 40) out.push(heading && !t.startsWith(heading) ? `${heading}\n${t}` : t);
    cur = "";
  };
  for (const para of text.split(/\n{2,}/)) {
    const p = para.trim();
    if (!p) continue;
    if (/^#{1,6} /.test(p) && p.length < 160) {
      flush();
      heading = p.split("\n")[0]!;
      cur = p;
      continue;
    }
    if (cur.length + p.length + 2 > size && cur.length > size / 3) flush();
    if (p.length > size * 1.6) {
      flush();
      for (const piece of p.match(new RegExp(`[\\s\\S]{1,${size}}(?=\\s|$)`, "g")) ?? [p]) {
        cur = piece;
        flush();
      }
      continue;
    }
    cur += (cur ? "\n\n" : "") + p;
  }
  flush();
  return out;
}

export type Doc = { id: string; text: string; boost?: string };

// An index over many small documents (chunks, lessons). Rebuilt when they change: it takes milliseconds.
export class Bm25 {
  private docs: { id: string; tf: Map<string, number>; len: number; boost: Set<string> }[] = [];
  private df = new Map<string, number>();
  private avg = 1;

  constructor(docs: Doc[]) {
    let total = 0;
    for (const d of docs) {
      const tf = new Map<string, number>();
      const ts = tokens(d.text);
      for (const t of ts) tf.set(t, (tf.get(t) ?? 0) + 1);
      for (const t of tf.keys()) this.df.set(t, (this.df.get(t) ?? 0) + 1);
      this.docs.push({ id: d.id, tf, len: ts.length, boost: new Set(d.boost ? tokens(d.boost) : []) });
      total += ts.length;
    }
    this.avg = Math.max(1, total / Math.max(1, docs.length));
  }

  get size() {
    return this.docs.length;
  }

  // Each match: its BM25 score, and how much of the query it covers (0..1), the honest "does this answer it?" number.
  search(query: string, k = 10): { id: string; score: number; cover: number }[] {
    const q = [...new Set(tokens(query))];
    if (!q.length || !this.docs.length) return [];
    const N = this.docs.length;
    const k1 = 1.2, b = 0.75;
    const out: { id: string; score: number; cover: number }[] = [];
    for (const d of this.docs) {
      let score = 0, have = 0;
      for (const t of q) {
        const f = d.tf.get(t) ?? 0;
        const inBoost = d.boost.has(t);
        if (!f && !inBoost) continue;
        have++;
        const df = this.df.get(t) ?? 0;
        const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
        score += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * d.len) / this.avg))) + (inBoost ? idf * 0.6 : 0);
      }
      if (have) out.push({ id: d.id, score, cover: have / q.length });
    }
    return out.sort((a, b) => b.score - a.score).slice(0, k);
  }
}

// The words of the query a text leaves out (to say why a saved page isn't enough).
export function missing(query: string, text: string): string[] {
  const have = new Set(tokens(text));
  return [...new Set(tokens(query))].filter((t) => !have.has(t));
}
