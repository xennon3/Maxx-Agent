import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Study, Evidence, Hypothesis } from "./lab.ts";
import { STATUS_ICON, type Claim, type ClaimStatus } from "./truth.ts";
import { gapMapSvg, ideaTreeSvg } from "./discover.ts";
import type { SimRun } from "./sim.ts";

// The study as a lab notebook: REPORT.md for reading anywhere, and a
// self-contained report.html (pictures inlined, sparklines drawn as SVG)
// that opens straight from disk and can be mailed to someone.

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const pct = (n: number | undefined) => (n === undefined ? "–" : `${Math.round(n)}%`);
const hm = (iso: string) => iso.slice(11, 19);

export function reportMarkdown(s: Study): string {
  const out: string[] = [`# 🔬 ${s.question}`, "", `*${s.started.slice(0, 16).replace("T", " ")} · ${s.model} · ${s.state}${s.confidence !== undefined ? ` · ${s.confidence}% confident` : ""}*`, ""];
  if (s.sharpened && s.sharpened !== s.question) out.push(`**Made measurable:** ${s.sharpened}`, "");
  if (s.measure) out.push(`**What would answer it:** ${s.measure}`, "");
  out.push(s.answer ?? `_${s.note ?? "No conclusion yet."}_`, "");
  if (s.hypotheses.length) {
    out.push("## Hypotheses", "", "| | Hypothesis | Result | Before → after | Why |", "|---|---|---|---|---|");
    for (const h of s.hypotheses) out.push(`| ${h.id} | ${h.text.replace(/\|/g, "/")}${tags(h)} | ${h.status} | ${(h.trail ?? [h.prior]).map((x) => pct(x)).join(" → ")} | ${(h.why ?? "").replace(/\|/g, "/")}${h.because?.length ? ` (rests on ${h.because.join(", ")})` : ""} |`);
    out.push("");
  }
  if (s.audit) out.push(`**Fact check:** ${auditLine(s)}`, "");
  if (s.claims?.length) {
    out.push("## Claim ledger", "", `${tally(s.claims)}`, "", "| | Claim | Status | From | Why |", "|---|---|---|---|---|");
    for (const c of s.claims) out.push(`| ${c.id} | ${c.text.replace(/\|/g, "/").replace(/\n/g, " ")} | ${STATUS_ICON[c.status]} ${c.status} | ${c.evidence}${c.url ? ` <${c.url}>` : ""} | ${c.history.map((h) => `r${h.round} ${h.status}: ${h.why}`).join("; ").replace(/\|/g, "/")} |`);
    out.push("");
  }
  if (s.skeptic) out.push(`## Reviewer (${s.skepticModel ?? "model"})`, "", s.skeptic, "");
  out.push(...discoveryMarkdown(s));
  out.push("## Evidence", "");
  for (const e of s.evidence) {
    out.push(`### ${e.icon} ${e.id} · ${e.title}`, "", `*${e.instrument} · ${hm(e.at)}${e.data ? ` · [${e.data}](${e.data})` : ""}*`, "");
    out.push(e.error ? `Failed: ${e.error}` : "```\n" + e.text.trim() + "\n```", "");
    for (const u of e.urls ?? []) out.push(`- <${u}>`);
    if (e.urls?.length) out.push("");
  }
  if (s.hypotheses.some((h) => h.script)) {
    out.push("## Tests", "");
    for (const h of s.hypotheses.filter((h) => h.script)) out.push(`### ${h.id}: [${h.script}](${h.script})`, "", "```", (h.output ?? "").trim().slice(-1500), "```", "");
  }
  out.push("## Instrument log", "", "| Time | Instrument | Arguments | Approved | Took | Result |", "|---|---|---|---|---|---|");
  for (const l of s.log) out.push(`| ${hm(l.at)} | ${l.instrument} | ${l.args.replace(/\|/g, "/")} | ${l.approval} | ${(l.ms / 1000).toFixed(1)}s | ${l.ok ? "✓" : "✗"} ${l.note.replace(/\|/g, "/")} |`);
  return out.join("\n") + "\n";
}

function discoveryMarkdown(s: Study): string[] {
  const out: string[] = [];
  if (s.parent) out.push(`**Grew from:** ${s.parent.question}${s.parent.id ? ` (${s.parent.id})` : ""}`, "");
  if (s.assumptions?.length) out.push("## Assumptions, flipped", "", ...s.assumptions.map((a) => `- ${a.text} → *what if not:* ${a.flip}`), "");
  if (s.lab) out.push(`## 🧪 Virtual lab: ${s.lab.title}`, "", `${s.lab.about}`, "", `*${s.lab.reused ? "Reused from the lab library" : "Designed for this study"} · ${s.lab.sweeps} sweep${s.lab.sweeps === 1 ? "" : "s"} · code: [sim/lab.js](sim/lab.js) · runs: [sim/runs.jsonl](sim/runs.jsonl)*`, "", "Simulations show what a model's assumptions imply. They count as predictions, never as measurements.", "");
  if (s.debate) {
    const d = s.debate;
    out.push(`## ⚔ Debate (judged by ${d.judge})`, "", `| | Side | Evidence score |`, "|---|---|---|", `| A | ${d.a.h} | ${d.a.score.toFixed(1)} |`, `| B | ${d.b.h} | ${d.b.score.toFixed(1)} |`, "", `**Winner:** ${d.winner === "TIE" ? "a tie" : d.winner === "A" ? d.a.h : d.b.h}. ${d.why}`, "");
  }
  if (s.map?.length) out.push("## Gap map", "", ...s.map.map((n) => `- ${n.state === "known" ? "🟢" : n.state === "partly" ? "🟡" : "🔴"} ${n.label}${n.cites.length ? ` (${n.cites.join(", ")})` : ""}`), "");
  if (s.predictions?.length) out.push("## 🔮 Predictions to check later", "", "| Due | Prediction | How to check | Confidence |", "|---|---|---|---|", ...s.predictions.map((p) => `| ${p.due} | ${p.text.replace(/\|/g, "/")} | ${p.check.replace(/\|/g, "/")} | ${p.confidence}% |`), "");
  if (s.experiments?.length) out.push("## 🧰 Experiments you could run", "", ...s.experiments.map((x) => `- **${x.title}** (${x.uses}): ${x.how}`), "");
  if (s.changeMind?.length) out.push("## What would change my mind", "", ...s.changeMind.map((c) => `- ${c}`), "");
  if (s.leads?.length) out.push("## ✨ Odd things noticed on the way", "", ...s.leads.map((l) => `- ${l}`), "");
  return out;
}

async function discoveryHtml(s: Study): Promise<string> {
  const out: string[] = [];
  if (s.assumptions?.length) out.push(`<h2>Assumptions · flipped</h2><div class="flips">${s.assumptions.map((a) => `<div class="flip"><span>${esc(a.text)}</span><b>⇄</b><span><i>what if not:</i> ${esc(a.flip)}</span></div>`).join("")}</div>`);
  const tree = ideaTreeSvg({ question: s.question, parent: s.parent?.question, evidence: s.evidence.map((e) => ({ id: e.id, icon: e.icon, title: e.title })), hypotheses: s.hypotheses });
  if (tree) out.push(`<h2>Idea genealogy · which evidence each idea grew from</h2><div class="svgwrap">${tree}</div>`);
  if (s.lab) {
    const runs: SimRun[] = (await readFile(join(s.dir, "sim", "runs.jsonl"), "utf8").catch(() => "")).trim().split("\n").filter(Boolean).flatMap((l) => { try { return [JSON.parse(l) as SimRun]; } catch { return []; } });
    const keys = [...new Set(runs.flatMap((r) => [...Object.keys(r.params), ...Object.keys(r.final)]))].slice(0, 8);
    const rows = runs.slice(-40).map((r) => `<tr class="${r.source}"><td>${r.source === "you" ? "📌 you" : "sweep"}</td><td>${r.seed}</td>${keys.map((k) => `<td>${k in r.params ? `<b>${+(+r.params[k]!).toPrecision(4)}</b>` : k in r.final ? +(+r.final[k]!).toPrecision(4) : ""}</td>`).join("")}<td class="sub">${esc(r.note ?? "")}</td></tr>`).join("");
    out.push(`<h2>🧪 Virtual lab · ${esc(s.lab.title)}</h2><article class="simlab"><p>${esc(s.lab.about)}</p><p class="sub">${s.lab.reused ? "Reused from the lab library" : "Designed for this study"} · ${s.lab.sweeps} sweep${s.lab.sweeps === 1 ? "" : "s"} · <a href="sim/lab.js">sim/lab.js</a> · open it in the Research tab to play with it. A simulation shows what its assumptions imply: it counts as a prediction, never as a measurement.</p>${rows ? `<details open><summary>${runs.length} run${runs.length === 1 ? "" : "s"} on record</summary><div class="tablewrap"><table><tr><th></th><th>seed</th>${keys.map((k) => `<th>${esc(k)}</th>`).join("")}<th>note</th></tr>${rows}</table></div></details>` : ""}</article>`);
  }
  if (s.debate) {
    const d = s.debate;
    const side = (x: typeof d.a, tag: string, win: boolean) => `<div class="side${win ? " win" : ""}"><header><b>${tag} · ${esc(x.h)}</b><span class="score">${x.score.toFixed(1)} pts</span></header>${x.points.map((p) => `<p class="pt"><span class="ps ${p.score > 0 ? "up" : p.score < 0 ? "down" : ""}">${p.score > 0 ? "+" : ""}${p.score.toFixed(1)}</span> ${md(p.text)}</p>`).join("") || `<p class="sub">${esc(x.text.slice(0, 600))}</p>`}</div>`;
    out.push(`<h2>⚔ Debate arena · scored only on cited evidence</h2><div class="arena">${side(d.a, "A", d.winner === "A")}${side(d.b, "B", d.winner === "B")}</div><p class="sub">Judge (${esc(d.judge)}): <b>${d.winner === "TIE" ? "a tie" : `${d.winner} wins`}</b> · ${esc(d.why)}</p>`);
  }
  const gap = s.map?.length ? gapMapSvg(s.sharpened ?? s.question, s.map) : "";
  if (gap) out.push(`<h2>Gap map · 🟢 known · 🟡 partly · 🔴 nobody knows yet</h2><div class="svgwrap">${gap}</div>`);
  if (s.predictions?.length) out.push(`<h2>🔮 Prediction ledger</h2><div class="tablewrap"><table><tr><th>Due</th><th>Prediction</th><th>How to check</th><th>Confidence</th></tr>${s.predictions.map((p) => `<tr><td>${esc(p.due)}</td><td>${esc(p.text)}</td><td class="sub">${esc(p.check)}</td><td>${p.confidence}%</td></tr>`).join("")}</table></div><p class="sub">Settle them in the Research tab when they come due; Maxx keeps score of how calibrated it is.</p>`);
  if (s.experiments?.length) out.push(`<h2>🧰 Experiments you could run</h2>${s.experiments.map((x) => `<article class="exp"><b>${esc(x.title)}</b> <span class="pill">${esc(x.uses)}</span><p>${esc(x.how)}</p></article>`).join("")}`);
  if (s.changeMind?.length) out.push(`<h2>What would change my mind</h2><ul class="mind">${s.changeMind.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>`);
  if (s.leads?.length) out.push(`<h2>✨ Odd things noticed on the way</h2><ul class="mind">${s.leads.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>`);
  return out.join("\n");
}

const ORDER: ClaimStatus[] = ["observed", "corroborated", "verified", "opinion", "unverified", "contested", "fabricated"];
export function tally(claims: Claim[]): string {
  return ORDER.map((st) => [st, claims.filter((c) => c.status === st).length] as const).filter(([, n]) => n).map(([st, n]) => `${STATUS_ICON[st]} ${n} ${st}`).join(" · ");
}
export function auditLine(s: Study): string {
  const a = s.audit!;
  if (a.ok) return `passed: ${a.numbers} numbers traced to the evidence, every citation real${a.revised ? " (after one revision)" : ""}.`;
  return [a.unsupported.length ? `numbers not found in the evidence: ${a.unsupported.join(", ")}` : "", a.fakeCitations.length ? `citations to nothing: ${a.fakeCitations.join(", ")}` : "", a.uncited.length ? `${a.uncited.length} finding(s) cite nothing` : ""].filter(Boolean).join("; ") + (a.revised ? " (after one revision)" : "");
}
const tags = (h: Hypothesis) => (h.speculative ? " *(speculative: rests on no evidence)*" : "") + (h.wildcard ? " *(wildcard: a new perspective)*" : "");

// Tiny markdown for the model's conclusion: headings, bullets, bold, [E1] chips.
export function md(text: string): string {
  const lines = esc(text).split("\n");
  const html: string[] = [];
  let list = false;
  for (const l of lines) {
    const b = l.match(/^\s*[-*•]\s+(.*)$/);
    if (b && !list) (html.push("<ul>"), (list = true));
    if (!b && list) (html.push("</ul>"), (list = false));
    const inline = (t: string) => t.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\[(E\d+|H\d+|C\d+)\]/g, '<a class="cite" href="#$1">$1</a>');
    if (b) html.push(`<li>${inline(b[1]!)}</li>`);
    else if (/^#{1,3}\s/.test(l)) html.push(`<h3>${inline(l.replace(/^#+\s*/, ""))}</h3>`);
    else if (l.trim()) html.push(`<p>${inline(l)}</p>`);
  }
  if (list) html.push("</ul>");
  return html.join("\n");
}

export function sparkline(values: number[], w = 220, h = 44): string {
  if (values.length < 2) return "";
  const lo = Math.min(...values), hi = Math.max(...values), span = hi - lo || 1;
  const pts = values.map((v, i) => `${((i / (values.length - 1)) * (w - 4) + 2).toFixed(1)},${(h - 2 - ((v - lo) / span) * (h - 4)).toFixed(1)}`).join(" ");
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img"><polyline fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" points="${pts}"/></svg>`;
}

function meter(h: Hypothesis): string {
  const a = Math.round(h.prior), b = Math.round(h.posterior ?? h.prior);
  return `<div class="meter" title="${a}% before the test, ${b}% after"><i class="prior" style="left:${a}%"></i><i class="post ${h.status}" style="left:${b}%"></i><span class="lo" style="width:${Math.min(a, b)}%"></span><span class="mv ${b >= a ? "up" : "down"}" style="left:${Math.min(a, b)}%;width:${Math.abs(b - a)}%"></span></div>`;
}

async function evidenceCard(s: Study, e: Evidence): Promise<string> {
  const imgs: string[] = [];
  for (const f of e.images ?? []) {
    try {
      imgs.push(`<img src="data:image/jpeg;base64,${Buffer.from(await readFile(join(s.dir, f))).toString("base64")}" alt="${esc(f)}">`);
    } catch {}
  }
  const spark = (e.series ?? []).filter((x) => x.values.length > 1).map((x) => `<figure>${sparkline(x.values)}<figcaption>${esc(x.name)} <span>${+Math.min(...x.values).toFixed(2)} – ${+Math.max(...x.values).toFixed(2)}</span></figcaption></figure>`).join("");
  return `<article class="ev${e.error ? " bad" : ""}" id="${e.id}"><header><span class="ic">${e.icon}</span><b>${e.id}</b> ${esc(e.title)}<time>${hm(e.at)} · ${esc(e.instrument)}</time></header>` +
    (e.error ? `<p class="err">Failed: ${esc(e.error)}</p>` : `<pre>${esc(e.text.trim())}</pre>`) +
    (spark ? `<div class="sparks">${spark}</div>` : "") + (imgs.length ? `<div class="imgs">${imgs.join("")}</div>` : "") +
    ((e.urls ?? []).length ? `<ul class="src">${e.urls!.map((u) => `<li><a href="${esc(u)}">${esc(u)}</a></li>`).join("")}</ul>` : "") +
    (e.data ? `<p class="file">data: <a href="${esc(e.data)}">${esc(e.data)}</a></p>` : "") + "</article>";
}

export async function reportHtml(s: Study): Promise<string> {
  const ev = (await Promise.all(s.evidence.map((e) => evidenceCard(s, e)))).join("\n");
  const hy = s.hypotheses.map((h) => `<article class="hy ${h.status}" id="${h.id}"><header><b>${h.id}</b> ${esc(h.text)}${h.speculative ? '<span class="pill spec" title="It cites no evidence, so its prior is capped at 35%">speculative</span>' : ""}${h.wildcard ? '<span class="pill wild" title="Added in a later round: a perspective nobody had considered">wildcard</span>' : ""}<span class="tag">${h.status}</span></header>${meter(h)}<p class="nums">${(h.trail ?? [h.prior]).map((x, i, a) => (i === a.length - 1 && a.length > 1 ? `<b>${pct(x)}</b>` : pct(x))).join(" → ")}${h.why ? ` · ${esc(h.why)}` : ""}</p>` +
    (h.because?.length ? `<p class="sub">rests on ${h.because.map((id) => `<a class="cite" href="#${id}">${id}</a>`).join(" ")}</p>` : "") +
    (h.predicts ? `<p class="sub">predicts: ${esc(h.predicts)}</p>` : "") +
    (h.output ? `<details><summary>test ${h.script ? `<a href="${esc(h.script)}">${esc(h.script)}</a>` : ""}${h.tries > 1 ? ` · ${h.tries} tries` : ""}</summary><pre>${esc(h.output.trim().slice(-3000))}</pre></details>` : "") + "</article>").join("\n");
  const claims = (s.claims ?? []).map((c) => `<tr class="cl ${c.status}" id="${c.id}"><td><b>${c.id}</b></td><td>${esc(c.text)}${c.note ? `<div class="sub">${esc(c.note)}</div>` : ""}</td><td class="st">${STATUS_ICON[c.status]} ${c.status}</td><td><a class="cite" href="#${c.evidence}">${c.evidence}</a>${c.url ? `<div class="sub"><a href="${esc(c.url)}">${esc(c.url.replace(/^https?:\/\/(www\.)?/, "").slice(0, 40))}</a></div>` : ""}</td><td class="sub">${c.history.map((h) => `r${h.round} ${STATUS_ICON[h.status]} ${esc(h.why)}`).join("<br>")}</td></tr>`).join("");
  const log = s.log.map((l) => `<tr class="${l.ok ? "" : "bad"}"><td>${hm(l.at)}</td><td>${esc(l.instrument)}</td><td>${esc(l.args)}</td><td>${l.approval}</td><td>${(l.ms / 1000).toFixed(1)}s</td><td>${l.ok ? "✓" : "✗"} ${esc(l.note)}</td></tr>`).join("");
  const conf = s.confidence;
  const disc = await discoveryHtml(s);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Lab notebook</title><style>
:root{--bg:#fbfaf6;--grid:#e9e6dc;--ink:#1f2328;--mute:#6b6f76;--line:#d9d5c9;--card:#fffffe;--ok:#2b8a3e;--bad:#c92a2a;--maybe:#b08400;--acc:#5f3dc4}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#15171a;--grid:#1f2226;--ink:#e6e6e3;--mute:#9a9ea5;--line:#30343a;--card:#1b1e22;--ok:#51cf66;--bad:#ff6b6b;--maybe:#fcc419;--acc:#b197fc}}
:root[data-theme=dark]{--bg:#15171a;--grid:#1f2226;--ink:#e6e6e3;--mute:#9a9ea5;--line:#30343a;--card:#1b1e22;--ok:#51cf66;--bad:#ff6b6b;--maybe:#fcc419;--acc:#b197fc}
*{box-sizing:border-box}body{margin:0;background:var(--bg);background-image:linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px);background-size:22px 22px;color:var(--ink);font:15px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:900px;margin:0 auto;padding:28px 16px 60px}h1{font-size:26px;margin:0 0 4px}h2{font-size:15px;text-transform:uppercase;letter-spacing:.08em;color:var(--mute);margin:30px 0 10px;border-bottom:1px dashed var(--line);padding-bottom:4px}
.stamp{font:12px ui-monospace,Consolas,monospace;color:var(--mute)}.answer{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--acc);border-radius:10px;padding:6px 18px;margin-top:16px}
.answer h3{font-size:14px;margin:14px 0 4px;color:var(--acc)}.conf{display:flex;align-items:center;gap:10px;margin:14px 0 4px}.conf .bar{flex:1;height:10px;border-radius:5px;background:var(--line);overflow:hidden}.conf .bar i{display:block;height:100%;background:var(--acc)}
article{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px 14px;margin:10px 0}article header{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap}article header time{margin-left:auto;font:12px ui-monospace,Consolas,monospace;color:var(--mute)}
pre{white-space:pre-wrap;word-break:break-word;font:12.5px/1.5 ui-monospace,Consolas,monospace;background:var(--bg);border-radius:6px;padding:8px 10px;margin:8px 0 4px;max-height:320px;overflow:auto}
.ev.bad,.hy.error{border-color:var(--bad)}.err{color:var(--bad)}.sparks{display:flex;flex-wrap:wrap;gap:6px 18px;color:var(--acc)}figure{margin:4px 0}figcaption{font-size:12px;color:var(--mute)}figcaption span{font-family:ui-monospace,monospace}
.imgs{display:flex;gap:8px;flex-wrap:wrap}.imgs img{width:calc(33% - 6px);min-width:160px;border-radius:6px;border:1px solid var(--line)}.src,.file{font-size:12px;color:var(--mute);margin:4px 0}.src a,.file a{color:var(--mute)}
.tag{margin-left:auto;font-size:12px;padding:1px 8px;border-radius:9px;border:1px solid currentColor}.supported .tag{color:var(--ok)}.refuted .tag{color:var(--bad)}.inconclusive .tag,.untested .tag,.testing .tag{color:var(--maybe)}.error .tag{color:var(--bad)}
.meter{position:relative;height:8px;background:var(--line);border-radius:4px;margin:10px 0 4px}.meter .mv{position:absolute;top:0;height:100%;border-radius:4px}.meter .mv.up{background:color-mix(in srgb,var(--ok) 55%,transparent)}.meter .mv.down{background:color-mix(in srgb,var(--bad) 55%,transparent)}
.meter i{position:absolute;top:-4px;width:3px;height:16px;margin-left:-1px;border-radius:2px;background:var(--mute)}.meter i.post{background:var(--ink);width:4px}.nums{margin:2px 0;font-size:13px}.sub{margin:2px 0;font-size:13px;color:var(--mute)}
details summary{cursor:pointer;font-size:13px;color:var(--mute)}a.cite{font:600 11px ui-monospace,monospace;padding:0 5px;border-radius:5px;background:color-mix(in srgb,var(--acc) 18%,transparent);color:var(--acc);text-decoration:none}
.skeptic{border-left:4px solid var(--maybe)}.pill{font-size:11px;padding:0 7px;border-radius:9px;border:1px dashed var(--mute);color:var(--mute)}.pill.wild{border-color:var(--acc);color:var(--acc)}
.audit{padding:8px 12px;border-radius:8px;border:1px solid var(--line);background:var(--card);font-size:13.5px}.audit.ok{border-left:4px solid var(--ok)}.audit.bad{border-left:4px solid var(--maybe)}
.ledger td.st{white-space:nowrap}.cl.verified td.st,.cl.corroborated td.st,.cl.observed td.st{color:var(--ok)}.cl.unverified td.st,.cl.contested td.st{color:var(--maybe)}.cl.fabricated td.st{color:var(--bad)}.cl.fabricated td{text-decoration:line-through;text-decoration-color:var(--bad)}.cl.opinion td.st{color:var(--mute)}table{width:100%;border-collapse:collapse;font-size:12.5px;background:var(--card)}td,th{border:1px solid var(--line);padding:4px 6px;text-align:left;vertical-align:top}tr.bad td{color:var(--bad)}.tablewrap{overflow-x:auto}
.flips{display:grid;gap:8px}.flip{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:center;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:8px 12px;font-size:13.5px}.flip b{color:var(--acc);font-size:18px}
.svgwrap{overflow-x:auto;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:6px}.svgwrap svg{width:100%;min-width:560px;height:auto;display:block;font:12px system-ui,sans-serif}
.gapmap .ln{stroke:var(--line);stroke-width:1.5}.gapmap .ln.gap{stroke-dasharray:4 4}.gapmap .center circle{fill:color-mix(in srgb,var(--acc) 16%,var(--card));stroke:var(--acc)}.gapmap .cq{font:600 11px system-ui,sans-serif;color:var(--ink);text-align:center;display:flex;align-items:center;justify-content:center;height:100%}
.gapmap .node rect{stroke-width:1.5}.gapmap .node text{text-anchor:middle;fill:var(--ink)}.gapmap .known rect{fill:color-mix(in srgb,var(--ok) 18%,var(--card));stroke:var(--ok)}.gapmap .partly rect{fill:color-mix(in srgb,var(--maybe) 18%,var(--card));stroke:var(--maybe)}.gapmap .gap rect{fill:color-mix(in srgb,var(--bad) 14%,var(--card));stroke:var(--bad);stroke-dasharray:5 3;filter:url(#glow)}
.tree text{fill:var(--ink)}.tree .edge{fill:none;stroke:var(--acc);stroke-opacity:.45;stroke-width:1.5}.tree .enode rect{fill:var(--bg);stroke:var(--line)}.tree .pnode rect{fill:color-mix(in srgb,var(--acc) 12%,var(--card));stroke:var(--acc);stroke-dasharray:4 3}.tree .hnode rect{fill:var(--card);stroke:var(--maybe)}.tree .hnode.supported rect{stroke:var(--ok)}.tree .hnode.refuted rect{stroke:var(--bad)}.tree .hnode.wildcard rect,.tree .hnode.flipped rect,.tree .hnode.borrowed rect{stroke-dasharray:5 3}
.arena{display:grid;grid-template-columns:1fr 1fr;gap:10px}@media (max-width:640px){.arena,.flip{grid-template-columns:1fr}}.side{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px 12px}.side.win{border:2px solid var(--ok)}.side header{display:flex;justify-content:space-between;gap:8px}.score{font:600 12px ui-monospace,monospace;color:var(--acc)}
.pt{font-size:13px;margin:6px 0;display:flex;gap:8px;align-items:baseline}.pt p{margin:0}.ps{flex:none}.ps{font:600 11px ui-monospace,monospace;padding:0 5px;border-radius:5px;background:var(--line)}.ps.up{color:var(--ok)}.ps.down{color:var(--bad)}.simlab{border-left:4px solid var(--acc)}tr.you td{background:color-mix(in srgb,var(--acc) 8%,transparent)}.exp p{margin:4px 0;font-size:13.5px}.mind li{margin:3px 0}
</style></head><body><main>
<p class="stamp">LAB NOTEBOOK · ${esc(s.id)}</p>${s.parent ? `<p class="stamp">↳ grew from: ${esc(s.parent.question)}</p>` : ""}<h1>🔬 ${esc(s.question)}</h1>
<p class="stamp">${esc(s.started.slice(0, 16).replace("T", " "))} · ${esc(s.model)} · ${s.rounds > 1 ? `round ${s.round} of ${s.rounds} · ` : ""}${s.state}</p>
${s.sharpened && s.sharpened !== s.question ? `<p><b>Made measurable:</b> ${esc(s.sharpened)}</p>` : ""}${s.measure ? `<p><b>What would answer it:</b> ${esc(s.measure)}</p>` : ""}
<section class="answer">${conf !== undefined ? `<div class="conf"><b>Confidence</b><div class="bar"><i style="width:${conf}%"></i></div><b>${conf}%</b></div>` : ""}${s.answer ? md(s.answer) : `<p>${esc(s.note ?? "No conclusion yet.")}</p>`}</section>
${s.audit ? `<p class="audit ${s.audit.ok ? "ok" : "bad"}"><b>${s.audit.ok ? "✔" : "⚠"} Fact check</b> ${esc(auditLine(s))}</p>` : ""}
${hy ? `<h2>Hypotheses · before → after testing</h2>${hy}` : ""}
${s.skeptic ? `<h2>Reviewer${s.skepticModel ? ` · ${esc(s.skepticModel)}` : ""}</h2><article class="skeptic">${md(s.skeptic)}</article>` : ""}
${disc}
${claims ? `<h2>Claim ledger · what is fact, what is opinion</h2><p class="sub">${esc(tally(s.claims))} · 📏 measured here · ✔ found on the cited page · 🔁 confirmed by another site · 💬 a judgement · ⚠ a number not on its page · ⚖ sources disagree · ✗ cites a page never fetched</p><div class="tablewrap"><table class="ledger"><tr><th></th><th>Claim</th><th>Status</th><th>From</th><th>History</th></tr>${claims}</table></div>` : ""}
<h2>Evidence</h2>${ev || "<p>No readings.</p>"}
<h2>Instrument log</h2><div class="tablewrap"><table><tr><th>Time</th><th>Instrument</th><th>Arguments</th><th>Approved</th><th>Took</th><th>Result</th></tr>${log}</table></div>
</main></body></html>`;
}
