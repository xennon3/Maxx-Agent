// Markdown for the transcript: headings, tables, lists, quotes, rules, links,
// and code blocks whose box drawings line up.
//
// renderMarkdown runs in the page too (MD_JS embeds its source), so it must be
// plain JavaScript once types are stripped, keep every helper inside itself,
// and never hold a closing script tag.
//
// Why code blocks get a grid: models draw architecture as ASCII boxes, and a
// box only lines up when every character takes exactly one column. Theme
// fonts like Space Mono have no ─ │ ┌ ① ⊕ → glyphs, so the browser borrows
// them from other fonts at other widths and the right edges wander. Each
// character outside ASCII sits in a cell exactly 1ch wide (2ch for emoji and
// CJK), and box-drawing characters are drawn as lines by CSS, so vertical
// lines join from row to row whatever the font. The real characters stay in
// the page, so copying a diagram copies its text.
export function renderMarkdown(src: string): string {
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => (({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }) as Record<string, string>)[c]);

  // Box-drawing arms, up down left right: 1 light, 2 heavy, 3 double.
  const ARMS: Record<string, string> = {};
  ("─0011 ━0022 │1100 ┃2200 ┄0011 ┅0022 ┆1100 ┇2200 ┈0011 ┉0022 ┊1100 ┋2200 ╌0011 ╍0022 ╎1100 ╏2200 ╴0010 ╵1000 ╶0001 ╷0100 ╸0020 ╹2000 ╺0002 ╻0200 ╼0012 ╽1200 ╾0021 ╿2100 " +
    "┌0101 ┍0102 ┎0201 ┏0202 ┐0110 ┑0120 ┒0210 ┓0220 └1001 ┕1002 ┖2001 ┗2002 ┘1010 ┙1020 ┚2010 ┛2020 ╭0101 ╮0110 ╯1010 ╰1001 " +
    "├1101 ┝1102 ┞2101 ┟1201 ┠2201 ┡2102 ┢1202 ┣2202 ┤1110 ┥1120 ┦2110 ┧1210 ┨2210 ┩2120 ┪1220 ┫2220 " +
    "┬0111 ┭0121 ┮0112 ┯0122 ┰0211 ┱0221 ┲0212 ┳0222 ┴1011 ┵1021 ┶1012 ┷1022 ┸2011 ┹2021 ┺2012 ┻2022 " +
    "┼1111 ┽1121 ┾1112 ┿1122 ╀2111 ╁1211 ╂2211 ╃2121 ╄2112 ╅1221 ╆1212 ╇2122 ╈1222 ╉2221 ╊2212 ╋2222 " +
    "═0033 ║3300 ╒0103 ╓0301 ╔0303 ╕0130 ╖0310 ╗0330 ╘1003 ╙3001 ╚3003 ╛1030 ╜3010 ╝3030 ╞1103 ╟3301 ╠3303 ╡1130 ╢3310 ╣3330 " +
    "╤0133 ╥0311 ╦0333 ╧1033 ╨3011 ╩3033 ╪1133 ╫3311 ╬3333")
    .split(" ").forEach((e) => { ARMS[e[0]] = e.slice(1); });
  const WIDE = /\p{Emoji_Presentation}|️|[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦]|[\u{20000}-\u{3FFFD}]/u;
  const graphemes = (s: string): string[] => {
    const Seg = (Intl as any).Segmenter;
    return Seg ? Array.from(new Seg(undefined, { granularity: "grapheme" }).segment(s), (x: any) => x.segment) : Array.from(s);
  };
  // One cell per character: ASCII as is, box drawings as CSS lines, the rest centred in a fixed cell.
  const cell = (g: string): string => {
    if (/^[\x20-\x7e]$/.test(g)) return esc(g);
    if (g === "\t") return "    ";
    const a = ARMS[g];
    if (a) return '<i class="bx" style="--u:' + a[0] + ";--d:" + a[1] + ";--l:" + a[2] + ";--r:" + a[3] + '">' + g + "</i>";
    return '<i class="gc' + (WIDE.test(g) ? " w2" : "") + '">' + esc(g) + "</i>";
  };
  const isDiagram = (code: string) => (code.match(/[─-╿]/g) || []).length >= 6;
  const codeBlock = (lang: string, code: string): string => {
    code = code.replace(/\n$/, "");
    const diagram = isDiagram(code);
    // A run of the same horizontal line is one element, so it has no seams between cells.
    const row = (line: string) => graphemes(line).map(cell).join("")
      .replace(/(<i class="bx" style="--u:0;--d:0;--l:(\d);--r:\2">(.)<\/i>)(?:<i class="bx" style="--u:0;--d:0;--l:\2;--r:\2">\3<\/i>)+/g,
        (run, _one, w, ch) => { const n = run.split("</i>").length - 1; return '<i class="bx" style="--u:0;--d:0;--l:' + w + ";--r:" + w + ";width:" + n + 'ch">' + ch.repeat(n) + "</i>"; });
    const body = /[^\x00-\x7e]/.test(code) ? code.split("\n").map(row).join("\n") : esc(code);
    const label = lang || (diagram ? "diagram" : "");
    return '<div class="cb' + (diagram ? " diagram" : "") + '"><div class="cbar"><span>' + esc(label) + "</span>" +
      (diagram ? '<button class="redraw" title="Ask Maxx to draw this as a real diagram">✦ Redraw as diagram</button>' : "") +
      '<button class="copy" title="Copy">Copy</button></div><pre>' + body + "</pre></div>";
  };

  // Inline: code spans first (kept as is), then links, bold, italics, strikes.
  const inline = (text: string): string => {
    const keep: string[] = [];
    const stash = (html: string) => "\u0000" + (keep.push(html) - 1) + "\u0000";
    let s = text.replace(/(\x60+)([^\x60]|[^\x60][\s\S]*?[^\x60])\1(?!\x60)/g, (_, _t, c) => stash("<code>" + esc(c.trim() || c) + "</code>"));
    s = s.replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g, (_, t, u) => stash('<a href="' + esc(u) + '" target="_blank" rel="noopener noreferrer">' + esc(t) + "</a>"));
    s = s.replace(/(^|[\s(])(https?:\/\/[^\s<>()]+[^\s<>().,;:!?'"])/g, (_, p, u) => p + stash('<a href="' + esc(u) + '" target="_blank" rel="noopener noreferrer">' + esc(u) + "</a>"));
    s = esc(s)
      .replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, "<b>$1</b>")
      .replace(/__(?=\S)([\s\S]*?\S)__/g, "<b>$1</b>")
      .replace(/~~(?=\S)([\s\S]*?\S)~~/g, "<s>$1</s>")
      .replace(/(^|[^\w*])\*(?=[^\s*])([^*\n]*?[^\s*])\*(?![\w*])/g, "$1<em>$2</em>")
      .replace(/(^|[^\w])_(?=[^\s_])([^_\n]*?[^\s_])_(?!\w)/g, "$1<em>$2</em>");
    return s.replace(/\u0000(\d+)\u0000/g, (_, i) => keep[+i]);
  };

  const lines = src.replace(/\r\n?/g, "\n").split("\n");
  const out: string[] = [];
  const FENCE = /^ {0,3}(\x60{3,}|~{3,})\s*([\w+#.-]*)[^\n]*$/;
  const HEAD = /^ {0,3}(#{1,6})\s+(.*?)\s*#*\s*$/;
  const RULE = /^ {0,3}([-*_])(\s*\1){2,}\s*$/;
  const ITEM = /^(\s*)([-*+•]|\d{1,3}[.)])\s+(.*)$/;
  const QUOTE = /^ {0,3}>\s?(.*)$/;
  const cells = (row: string) => {
    let r = row.trim();
    if (r.startsWith("|")) r = r.slice(1);
    if (r.endsWith("|") && !r.endsWith("\\|")) r = r.slice(0, -1);
    const parts: string[] = [];
    let cur = "", tick = false;
    for (let i = 0; i < r.length; i++) {
      const c = r[i];
      if (c === "\\" && r[i + 1] === "|") { cur += "|"; i++; continue; }
      if (c === "\x60") tick = !tick;
      if (c === "|" && !tick) { parts.push(cur.trim()); cur = ""; continue; }
      cur += c;
    }
    parts.push(cur.trim());
    return parts;
  };
  const isSep = (row: string | undefined) => !!row && /\|/.test(row) && /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(row);
  const blockStart = (l: string, next: string | undefined) => FENCE.test(l) || HEAD.test(l) || RULE.test(l) || QUOTE.test(l) || ITEM.test(l) || (/\|/.test(l) && isSep(next));

  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    let m: RegExpMatchArray | null;
    if ((m = l.match(FENCE))) {
      const close = new RegExp("^ {0,3}" + m[1][0] + "{" + m[1].length + ",}\\s*$");
      const body: string[] = [];
      i++;
      while (i < lines.length && !close.test(lines[i])) body.push(lines[i++]);
      i++;
      out.push(codeBlock(m[2], body.join("\n")));
      continue;
    }
    if ((m = l.match(HEAD))) { out.push("<h" + m[1].length + ">" + inline(m[2]) + "</h" + m[1].length + ">"); i++; continue; }
    if (RULE.test(l)) { out.push("<hr>"); i++; continue; }
    if (/\|/.test(l) && isSep(lines[i + 1])) {
      const head = cells(l), align = cells(lines[i + 1]).map((c) => (/^:-+:$/.test(c) ? "center" : /-:$/.test(c) ? "right" : ""));
      const td = (tag: string, c: string, k: number) => "<" + tag + (align[k] ? ' style="text-align:' + align[k] + '"' : "") + ">" + inline(c) + "</" + tag + ">";
      let t = '<div class="tbl"><table><thead><tr>' + head.map((c, k) => td("th", c, k)).join("") + "</tr></thead><tbody>";
      i += 2;
      while (i < lines.length && lines[i].trim() && /\|/.test(lines[i])) {
        const row = cells(lines[i++]);
        t += "<tr>" + head.map((_, k) => td("td", row[k] ?? "", k)).join("") + "</tr>";
      }
      out.push(t + "</tbody></table></div>");
      continue;
    }
    if (QUOTE.test(l)) {
      const body: string[] = [];
      while (i < lines.length && (m = lines[i].match(QUOTE))) body.push(m[1]), i++;
      out.push("<blockquote>" + renderMarkdown(body.join("\n")) + "</blockquote>");
      continue;
    }
    if (ITEM.test(l)) {
      // A list, nested by indentation. Continuation lines join the item above.
      const items: { depth: number; ordered: boolean; start: number; text: string }[] = [];
      const indents: number[] = [];
      while (i < lines.length) {
        const x = lines[i];
        const it = x.match(ITEM);
        if (it) {
          const ind = it[1].replace(/\t/g, "    ").length;
          while (indents.length && ind < indents[indents.length - 1]) indents.pop();
          if (!indents.length || ind > indents[indents.length - 1]) indents.push(ind);
          items.push({ depth: indents.length - 1, ordered: /\d/.test(it[2]), start: parseInt(it[2], 10) || 1, text: it[3] });
          i++;
        } else if (x.trim() && /^\s/.test(x) && items.length && !FENCE.test(x)) {
          items[items.length - 1].text += "\n" + x.trim();
          i++;
        } else if (!x.trim() && items.length && lines[i + 1] !== undefined && ITEM.test(lines[i + 1])) {
          i++; // a blank line between items keeps the list going
        } else break;
      }
      const list = (k: number, depth: number): [string, number] => {
        const ord = items[k].ordered;
        let html = "<" + (ord ? "ol" : "ul") + (ord && items[k].start !== 1 ? ' start="' + items[k].start + '"' : "") + ">";
        while (k < items.length && items[k].depth >= depth) {
          if (items[k].depth === depth && items[k].ordered !== ord) break; // - then 1. is a new list
          if (items[k].depth > depth) { const [sub, next] = list(k, items[k].depth); html += "<li>" + sub + "</li>"; k = next; continue; }
          let text = items[k].text, box = "";
          const task = text.match(/^\[([ xX])\]\s+([\s\S]*)$/);
          if (task) { box = task[1] === " " ? '<span class="tk">☐</span> ' : '<span class="tk on">☑</span> '; text = task[2]; }
          html += "<li>" + box + inline(text).replace(/\n/g, "<br>");
          k++;
          if (k < items.length && items[k].depth > depth) { const [sub, next] = list(k, items[k].depth); html += sub; k = next; }
          html += "</li>";
        }
        return [html + "</" + (ord ? "ol" : "ul") + ">", k];
      };
      for (let k = 0; k < items.length; ) { const [html, next] = list(k, items[k].depth); out.push(html); k = next; }
      continue;
    }
    // A paragraph runs until a blank line or the start of another block.
    const para: string[] = [l];
    i++;
    while (i < lines.length && lines[i].trim() && !blockStart(lines[i], lines[i + 1])) para.push(lines[i++]);
    out.push("<p>" + para.map((p) => inline(p.trim())).join("<br>") + "</p>");
  }
  return '<div class="md">' + out.join("") + "</div>";

}

export const MD_CSS = `
.msg .md { white-space: normal; }
.md > :first-child { margin-top: 0; }
.md > :last-child { margin-bottom: 0; }
.md p { margin: 0 0 .7em; }
.md h1, .md h2, .md h3, .md h4, .md h5, .md h6 { font-family: var(--head, var(--font)); line-height: 1.25; margin: 1.1em 0 .45em; }
.md h1 { font-size: 1.45em; } .md h2 { font-size: 1.25em; } .md h3 { font-size: 1.1em; } .md h4, .md h5, .md h6 { font-size: 1em; }
.md h1, .md h2 { padding-bottom: .2em; border-bottom: 1px solid var(--line); }
.md ul, .md ol { margin: 0 0 .7em; padding-left: 1.5em; }
.md li { margin: .15em 0; }
.md li > ul, .md li > ol { margin: .15em 0 0; }
.md .tk { color: var(--mute); } .md .tk.on { color: var(--ok); }
.md blockquote { margin: 0 0 .7em; padding: .1em 0 .1em .9em; border-left: 3px solid var(--accent); color: var(--mute); }
.md hr { border: 0; border-top: 1px solid var(--line); margin: 1em 0; }
.md a { color: var(--accent); }
.md .tbl { overflow-x: auto; margin: 0 0 .8em; border: 1px solid var(--line); border-radius: calc(var(--radius) * .7); }
.md table { border-collapse: collapse; width: 100%; font-size: .95em; }
.md th, .md td { padding: 6px 10px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: top; }
.md th { background: var(--code); font-weight: 600; white-space: nowrap; }
.md tr:last-child td { border-bottom: 0; }
.md tbody tr:nth-child(even) td { background: color-mix(in srgb, var(--code) 45%, transparent); }
.md .cb { margin: 0 0 .8em; border-radius: 8px; background: var(--code); overflow: hidden; }
.md .cbar { display: flex; align-items: center; gap: 6px; padding: 3px 6px 3px 10px; font: 11px var(--font); color: var(--mute); }
.md .cbar span { margin-right: auto; text-transform: lowercase; letter-spacing: .3px; }
.md .cbar button { padding: 1px 8px; font-size: 11px; border-color: transparent; background: none; color: var(--mute); }
.md .cbar button:hover { border-color: var(--line); color: var(--ink); }
.md .cb pre { margin: 0; border-radius: 0; padding: 4px 12px 10px; white-space: pre; overflow-x: auto; font: 12.5px/1.4 var(--mono); tab-size: 4; }
.md .cb.diagram pre { line-height: 1.3; }
.md .cb i { font-style: normal; display: inline-block; vertical-align: top; height: 1.4em; text-align: center; overflow: visible; white-space: pre; }
.md .cb.diagram i { height: 1.3em; }
.md .cb i.gc { width: 1ch; }
.md .cb i.gc.w2 { width: 2ch; }
.md .cb i.bx { width: 1ch; -webkit-text-fill-color: transparent; color: inherit;
  --t1: max(1px, .085em); --t2: max(2px, .17em); --t3: max(3px, .24em);
  --tu: calc(min(var(--u), 1) * var(--t1) + max(min(var(--u) - 1, 1), 0) * (var(--t2) - var(--t1)) + max(var(--u) - 2, 0) * (var(--t3) - var(--t2)));
  --td: calc(min(var(--d), 1) * var(--t1) + max(min(var(--d) - 1, 1), 0) * (var(--t2) - var(--t1)) + max(var(--d) - 2, 0) * (var(--t3) - var(--t2)));
  --tl: calc(min(var(--l), 1) * var(--t1) + max(min(var(--l) - 1, 1), 0) * (var(--t2) - var(--t1)) + max(var(--l) - 2, 0) * (var(--t3) - var(--t2)));
  --tr: calc(min(var(--r), 1) * var(--t1) + max(min(var(--r) - 1, 1), 0) * (var(--t2) - var(--t1)) + max(var(--r) - 2, 0) * (var(--t3) - var(--t2)));
  --hv: max(var(--tl), var(--tr)); --hh: max(var(--tu), var(--td));
  background:
    linear-gradient(currentColor, currentColor) 50% 0 / var(--tu) calc(50% + var(--hv) / 2 + .5px) no-repeat,
    linear-gradient(currentColor, currentColor) 50% 100% / var(--td) calc(50% + var(--hv) / 2 + .5px) no-repeat,
    linear-gradient(currentColor, currentColor) 0 50% / calc(50% + var(--hh) / 2 + .5px) var(--tl) no-repeat,
    linear-gradient(currentColor, currentColor) 100% 50% / calc(50% + var(--hh) / 2 + .5px) var(--tr) no-repeat;
  opacity: .8; }
.md .cb.diagram pre { color: var(--ink); }
`;

// The page's md(), plus the code block buttons.
export const MD_JS = String.raw`
const renderMarkdown = ${renderMarkdown.toString()};
function md(text) { return renderMarkdown(String(text || "")); }
// Fallback fonts draw some symbols (① ⊕ ✓) wider than their cell; shrink those to fit, so the
// next column isn't covered. Measured once per symbol and font, then reused.
const glyphFit = new Map();
function fitGlyphs(root) {
  const cells = root.querySelectorAll ? root.querySelectorAll(".md .cb i.gc:not([data-fit])") : [];
  if (!cells.length) return;
  const range = document.createRange();
  for (const c of cells) {
    c.dataset.fit = "1";
    const key = c.textContent + "|" + c.classList.contains("w2") + "|" + getComputedStyle(c).fontFamily + "|" + getComputedStyle(c).fontSize;
    let k = glyphFit.get(key);
    if (k === undefined) {
      range.selectNodeContents(c);
      const need = range.getBoundingClientRect().width, room = c.getBoundingClientRect().width;
      k = need > room + 0.5 && need > 0 ? Math.max(0.5, room / need) : 1;
      glyphFit.set(key, k);
    }
    if (k < 1) c.style.transform = "scale(" + k.toFixed(3) + ")";
  }
}
new MutationObserver((list) => { for (const m of list) for (const n of m.addedNodes) if (n.nodeType === 1) fitGlyphs(n.parentNode || n); })
  .observe(document.body, { childList: true, subtree: true });
// A new theme brings a new font: measure again, once its fonts are in.
function refitGlyphs() { glyphFit.clear(); document.querySelectorAll(".md .cb i.gc[data-fit]").forEach((c) => { c.removeAttribute("data-fit"); c.style.transform = ""; }); fitGlyphs(document); }
addEventListener("maxx-skin", () => requestAnimationFrame(() => (document.fonts ? document.fonts.ready.then(refitGlyphs) : refitGlyphs())));
if (document.fonts) document.fonts.ready.then(refitGlyphs);
document.addEventListener("click", (e) => {
  const b = e.target.closest && e.target.closest(".md .cbar button");
  if (!b) return;
  const pre = b.closest(".cb").querySelector("pre");
  if (b.classList.contains("copy")) {
    navigator.clipboard.writeText(pre.textContent).then(() => { b.textContent = "Copied"; setTimeout(() => (b.textContent = "Copy"), 1200); }, () => {});
  } else if (b.classList.contains("redraw")) {
    if (typeof busy !== "undefined" && busy) return;
    $("input").value = "Redraw that ASCII box diagram as a mermaid diagram (a fenced mermaid block, flowchart LR or TD with subgraphs for the boxes), so the app can draw it. Keep every label. Send only the new block and one line about it.";
    submit();
  }
});
`;
