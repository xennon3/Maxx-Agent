import type { Message } from "../llm.ts";

// Telling what is true from what is said. Every fact the lab uses becomes a
// claim in a ledger, with how we know it and how well it held up:
//
//   observed      measured here, by an instrument (the strongest kind)
//   verified      a source says it, and the words and numbers are really on
//                 the page Maxx fetched
//   corroborated  verified, and an independent site (another domain) agrees
//   opinion       someone's judgement or a value claim, not a checkable fact
//   unverified    the model attributes it to a source, but a number in it is
//                 not on that page (it may be misread or made up)
//   contested     two claims disagree; neither is taken as settled
//   fabricated    it cites a page Maxx never fetched
//
// Statuses can change as evidence comes in (truth is allowed to move), and
// every change is kept in the claim's history. The conclusion is checked the
// same way: a number that appears nowhere in the evidence, a citation to
// nothing, or a finding with no citation is sent back to be fixed.

export type ClaimKind = "observed" | "sourced" | "opinion";
export type ClaimStatus = "observed" | "verified" | "corroborated" | "opinion" | "unverified" | "contested" | "fabricated";
export type Claim = { id: string; text: string; kind: ClaimKind; status: ClaimStatus; evidence: string; url?: string; note?: string; history: { round: number; status: ClaimStatus; why: string }[] };
export type Audit = { ok: boolean; numbers: number; unsupported: string[]; fakeCitations: string[]; uncited: string[]; revised: boolean };

export const STATUS_ICON: Record<ClaimStatus, string> = { observed: "📏", verified: "✔", corroborated: "🔁", opinion: "💬", unverified: "⚠", contested: "⚖", fabricated: "✗" };
// How much weight a claim of each status may carry in a hypothesis or conclusion.
export const WEIGHT: Record<ClaimStatus, string> = { observed: "strong", corroborated: "strong", verified: "moderate", opinion: "none (an opinion)", unverified: "weak (not confirmed by its source)", contested: "disputed", fabricated: "none (do not use)" };

const strip = (t: string) => t.replace(/<think>[\s\S]*?<\/think>/g, "").replace(/\*\*/g, "").trim();

// Numbers as written ("1,200", "-3.5", "40%"), as values.
export function numbersIn(text: string): number[] {
  return [...text.replace(/\b[EHC]\d+\b/g, " ").matchAll(/(?<![\w.])[-+]?\d{1,3}(?:,\d{3})+(?:\.\d+)?|(?<![\w.])[-+]?\d+(?:\.\d+)?/g)].map((m) => Number(m[0].replace(/,/g, ""))).filter(Number.isFinite);
}

// Is `n` (as the model wrote it) in the corpus? Rounding is allowed: 0.0786 supports "0.08".
export function supported(n: number, corpus: number[]): boolean {
  const tol = Math.max(Math.abs(n) * 0.02, decimals(n) ? 0.5 * 10 ** -decimals(n) : 0.5);
  return corpus.some((c) => Math.abs(c - n) <= tol || Math.abs(Math.abs(c) - Math.abs(n)) <= tol);
}
const decimals = (n: number) => (String(n).split(".")[1] ?? "").length;
// Small counts ("2 sources", "3 bullets") and years say little; they are not checked.
const trivial = (n: number) => (Number.isInteger(n) && Math.abs(n) <= 10) || (Number.isInteger(n) && n >= 1900 && n <= 2100);

const domain = (u?: string) => {
  try {
    return u ? new URL(u).hostname.replace(/^www\./, "") : "";
  } catch {
    return "";
  }
};

// "- FACT: Solar panels lose 0.4% per °C <https://…>" · "- OPINION: …"
export function parseFacts(text: string): { kind: "sourced" | "opinion"; text: string; url?: string }[] {
  const out: { kind: "sourced" | "opinion"; text: string; url?: string }[] = [];
  for (const raw of strip(text).split("\n")) {
    const m = raw.trim().match(/^(?:[-*•]|\d+[.)])?\s*(FACT|OPINION|CLAIM)\s*[:\-]\s*(.+)$/i) ?? raw.trim().match(/^(?:[-*•])\s+(.+)$/);
    if (!m) continue;
    const kind = m.length === 3 && /opinion/i.test(m[1]!) ? "opinion" : "sourced";
    let body = (m.length === 3 ? m[2] : m[1])!.trim();
    const url = body.match(/<?(https?:\/\/[^\s>)]+)>?/)?.[1];
    body = body.replace(/\s*\(?<?https?:\/\/[^\s>)]+>?\)?\.?\s*$/, "").replace(/\s*\(source:?\s*\)\s*$/i, "").trim();
    if (body.length < 6 || /^NONE\b/i.test(body)) continue;
    out.push({ kind: kind === "sourced" && looksLikeOpinion(body) ? "opinion" : kind, text: body.slice(0, 400), url });
  }
  return out;
}

// Value words and hedges mark a judgement even when the model called it a fact.
export function looksLikeOpinion(t: string): boolean {
  return /\b(i think|i believe|in my (view|opinion)|we (think|believe)|arguably|should|best|worst|better than|overrated|underrated|beautiful|ugly|amazing|terrible|must-have|everyone knows|obviously)\b/i.test(t) && !/\b\d/.test(t);
}

// Check a sourced claim against the pages actually fetched.
export function verify(c: { kind: ClaimKind; text: string; url?: string }, pages: { url: string; text: string }[]): { status: ClaimStatus; note?: string } {
  if (c.kind === "observed") return { status: "observed" };
  if (c.kind === "opinion") return { status: "opinion" };
  const page = c.url ? pages.find((p) => sameUrl(p.url, c.url!)) : pages.length === 1 ? pages[0] : undefined;
  if (c.url && !page) return { status: "fabricated", note: "cites a page Maxx never fetched" };
  const corpus = page ? [page] : pages;
  const nums = numbersIn(c.text).filter((n) => !trivial(n));
  const pageNums = corpus.flatMap((p) => numbersIn(p.text));
  const missing = nums.filter((n) => !supported(n, pageNums));
  if (missing.length) return { status: "unverified", note: `${missing.join(", ")} not found on ${page ? domain(page.url) || "the page" : "any fetched page"}` };
  // No numbers: at least some of its distinctive words must be on the page.
  if (!nums.length) {
    const words = [...new Set(c.text.toLowerCase().match(/[a-z]{6,}/g) ?? [])];
    const body = corpus.map((p) => p.text.toLowerCase()).join(" ");
    const hit = words.filter((w) => body.includes(w)).length;
    if (words.length >= 3 && hit / words.length < 0.4) return { status: "unverified", note: "most of its words are not on the page" };
  }
  return { status: "verified" };
}
const sameUrl = (a: string, b: string) => a.replace(/[#?].*$/, "").replace(/\/$/, "") === b.replace(/[#?].*$/, "").replace(/\/$/, "");

export function setStatus(c: Claim, status: ClaimStatus, round: number, why: string) {
  if (c.status === status) return;
  c.status = status;
  c.history.push({ round, status, why });
}

export function ledger(claims: Claim[], max = 40): string {
  return claims.slice(-max).map((c) => `${c.id} [${c.status}; weight ${WEIGHT[c.status]}; from ${c.evidence}${c.url ? ` ${domain(c.url)}` : ""}] ${c.text}`).join("\n");
}

export function crossCheckMessages(claims: Claim[]): Message[] {
  return [
    { role: "system", content: "You are a fact checker. You compare claims and say which ones agree and which contradict each other. You do not judge which is true; you only compare what they say." },
    {
      role: "user",
      content:
        `Claims:\n${ledger(claims)}\n\n` +
        "Reply with lines only:\nAGREE: C1, C4 (claims that say the same thing)\nCONFLICT: C2 vs C5 - <how they differ>\nIf none, reply NONE.",
    },
  ];
}

export function parseCrossCheck(text: string): { agree: string[][]; conflict: { a: string; b: string; why: string }[] } {
  const agree: string[][] = [];
  const conflict: { a: string; b: string; why: string }[] = [];
  for (const line of strip(text).split("\n")) {
    const ag = line.match(/AGREE\s*:\s*(.+)$/i);
    if (ag) {
      const ids = [...ag[1]!.matchAll(/\bC\d+\b/g)].map((m) => m[0]);
      if (ids.length > 1) agree.push(ids);
    }
    const co = line.match(/CONFLICT\s*:\s*(C\d+)\s*(?:vs\.?|and|,|\/)\s*(C\d+)\s*[-—–:]*\s*(.*)$/i);
    if (co) conflict.push({ a: co[1]!, b: co[2]!, why: co[3]!.trim().slice(0, 200) });
  }
  return { agree, conflict };
}

// Agreement between different sites lifts verified claims; conflicts mark both contested.
export function applyCrossCheck(claims: Claim[], r: ReturnType<typeof parseCrossCheck>, round: number) {
  const by = new Map(claims.map((c) => [c.id, c]));
  for (const ids of r.agree) {
    const group = ids.map((i) => by.get(i)).filter((c): c is Claim => !!c);
    const sites = new Set(group.filter((c) => c.status === "verified" || c.status === "corroborated" || c.status === "observed").map((c) => (c.kind === "observed" ? `here:${c.evidence}` : domain(c.url) || c.evidence)));
    if (sites.size < 2) continue;
    for (const c of group) if (c.status === "verified") setStatus(c, "corroborated", round, `agrees with ${group.filter((x) => x !== c).map((x) => x.id).join(", ")}`);
  }
  for (const k of r.conflict) {
    for (const [x, y] of [[k.a, k.b], [k.b, k.a]] as const) {
      const c = by.get(x);
      // A measurement is not overturned by a web page; the page becomes contested instead.
      if (!c || c.status === "observed" || c.status === "fabricated" || c.status === "opinion") continue;
      setStatus(c, "contested", round, `conflicts with ${y}${k.why ? `: ${k.why}` : ""}`);
    }
  }
}

// The conclusion, held to the evidence.
export function audit(answer: string, corpusText: string, known: Set<string>): Omit<Audit, "revised"> {
  const corpus = numbersIn(corpusText);
  const body = answer.replace(/overall confidence\s*:?\s*\d+(?:\.\d+)?\s*%/gi, "");
  const nums = [...new Set(numbersIn(body))].filter((n) => !trivial(n));
  const unsupported = nums.filter((n) => !supported(n, corpus)).map(String);
  const fakeCitations = [...new Set([...answer.matchAll(/\[([EHC]\d+)\]/g)].map((m) => m[1]!))].filter((id) => !known.has(id));
  const findings = answer.match(/##\s*Findings\s*\n([\s\S]*?)(?=\n##|$)/i)?.[1] ?? "";
  const uncited = findings.split("\n").filter((l) => /^\s*[-*•]/.test(l) && !/\[[EHC]\d+\]/.test(l)).map((l) => l.replace(/^\s*[-*•]\s*/, "").slice(0, 120));
  return { ok: !unsupported.length && !fakeCitations.length && !uncited.length, numbers: nums.length, unsupported, fakeCitations, uncited };
}

export function auditNote(a: Omit<Audit, "revised">): string {
  return [
    a.unsupported.length ? `These numbers appear nowhere in the evidence, test output or claims: ${a.unsupported.join(", ")}. Remove them or replace them with numbers that are there.` : "",
    a.fakeCitations.length ? `These citations point to nothing: ${a.fakeCitations.join(", ")}. Cite only ids that exist.` : "",
    a.uncited.length ? `These findings cite nothing; add the [E#], [C#] or [H#] they rest on, or drop them:\n${a.uncited.map((u) => `- ${u}`).join("\n")}` : "",
  ].filter(Boolean).join("\n");
}

export const RULES =
  "Rules: base every statement on the evidence, the claim ledger or a test result, and cite it. Observed and corroborated claims carry the most weight; verified ones moderate; unverified and contested ones only as possibilities; opinions are reported as opinions (\"X argues...\"), never as facts; never use fabricated ones. Do not add numbers that are not in the evidence. Stay open: if the evidence fits another explanation, say so.";
