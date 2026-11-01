import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Study, Evidence, Hypothesis } from "./lab.ts";

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
    for (const h of s.hypotheses) out.push(`| ${h.id} | ${h.text.replace(/\|/g, "/")} | ${h.status} | ${pct(h.prior)} → ${pct(h.posterior)} | ${(h.why ?? "").replace(/\|/g, "/")} |`);
    out.push("");
  }
  if (s.skeptic) out.push(`## Reviewer (${s.skepticModel ?? "model"})`, "", s.skeptic, "");
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

// Tiny markdown for the model's conclusion: headings, bullets, bold, [E1] chips.
export function md(text: string): string {
  const lines = esc(text).split("\n");
  const html: string[] = [];
  let list = false;
  for (const l of lines) {
    const b = l.match(/^\s*[-*•]\s+(.*)$/);
    if (b && !list) (html.push("<ul>"), (list = true));
    if (!b && list) (html.push("</ul>"), (list = false));
    const inline = (t: string) => t.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\[(E\d+|H\d+)\]/g, '<a class="cite" href="#$1">$1</a>');
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
  const hy = s.hypotheses.map((h) => `<article class="hy ${h.status}" id="${h.id}"><header><b>${h.id}</b> ${esc(h.text)}<span class="tag">${h.status}</span></header>${meter(h)}<p class="nums">${pct(h.prior)} → <b>${pct(h.posterior)}</b>${h.why ? ` · ${esc(h.why)}` : ""}</p>` +
    (h.predicts ? `<p class="sub">predicts: ${esc(h.predicts)}</p>` : "") +
    (h.output ? `<details><summary>test ${h.script ? `<a href="${esc(h.script)}">${esc(h.script)}</a>` : ""}${h.tries > 1 ? ` · ${h.tries} tries` : ""}</summary><pre>${esc(h.output.trim().slice(-3000))}</pre></details>` : "") + "</article>").join("\n");
  const log = s.log.map((l) => `<tr class="${l.ok ? "" : "bad"}"><td>${hm(l.at)}</td><td>${esc(l.instrument)}</td><td>${esc(l.args)}</td><td>${l.approval}</td><td>${(l.ms / 1000).toFixed(1)}s</td><td>${l.ok ? "✓" : "✗"} ${esc(l.note)}</td></tr>`).join("");
  const conf = s.confidence;
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
.skeptic{border-left:4px solid var(--maybe)}table{width:100%;border-collapse:collapse;font-size:12.5px;background:var(--card)}td,th{border:1px solid var(--line);padding:4px 6px;text-align:left;vertical-align:top}tr.bad td{color:var(--bad)}.tablewrap{overflow-x:auto}
</style></head><body><main>
<p class="stamp">LAB NOTEBOOK · ${esc(s.id)}</p><h1>🔬 ${esc(s.question)}</h1>
<p class="stamp">${esc(s.started.slice(0, 16).replace("T", " "))} · ${esc(s.model)} · ${s.rounds > 1 ? `round ${s.round} of ${s.rounds} · ` : ""}${s.state}</p>
${s.sharpened && s.sharpened !== s.question ? `<p><b>Made measurable:</b> ${esc(s.sharpened)}</p>` : ""}${s.measure ? `<p><b>What would answer it:</b> ${esc(s.measure)}</p>` : ""}
<section class="answer">${conf !== undefined ? `<div class="conf"><b>Confidence</b><div class="bar"><i style="width:${conf}%"></i></div><b>${conf}%</b></div>` : ""}${s.answer ? md(s.answer) : `<p>${esc(s.note ?? "No conclusion yet.")}</p>`}</section>
${hy ? `<h2>Hypotheses · before → after testing</h2>${hy}` : ""}
${s.skeptic ? `<h2>Reviewer${s.skepticModel ? ` · ${esc(s.skepticModel)}` : ""}</h2><article class="skeptic">${md(s.skeptic)}</article>` : ""}
<h2>Evidence</h2>${ev || "<p>No readings.</p>"}
<h2>Instrument log</h2><div class="tablewrap"><table><tr><th>Time</th><th>Instrument</th><th>Arguments</th><th>Approved</th><th>Took</th><th>Result</th></tr>${log}</table></div>
</main></body></html>`;
}
