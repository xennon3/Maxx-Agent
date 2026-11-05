// The app's 🔌 MCP servers dialog (in 🧰 Tools) and ⤓ Clone dialog (in the
// sidebar). CONNECT_JS is spliced into page.ts's script as a value, so it is a
// String.raw with no ${ and no backticks of its own. Emoji outside JS strings must
// stay out of String.raw: Bun writes them as \u{...} escapes, which raw text keeps.

export const CONNECT_CSS = `
#mcpDlg, #cloneDlg { border: 1px solid var(--line); border-radius: 12px; background: var(--panel); color: var(--ink); padding: 0; width: min(780px, calc(100vw - 32px)); max-height: calc(100vh - 48px); }
#cloneDlg { width: min(620px, calc(100vw - 32px)); }
#mcpDlg::backdrop, #cloneDlg::backdrop { background: rgba(0,0,0,.35); }
.cdlg { display: flex; flex-direction: column; gap: 10px; padding: 16px; }
.cdlg h3 { margin: 0; display: flex; align-items: center; gap: 8px; }
.cdlg h3 .sp { flex: 1; }
.cdlg h4 { margin: 8px 0 0; font-size: 13px; color: var(--mute); text-transform: uppercase; letter-spacing: .06em; }
.cdlg .hint { font-size: 12px; color: var(--mute); margin: 0; }
.cdlg label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: var(--mute); }
.cdlg .row { display: flex; gap: 8px; align-items: flex-end; flex-wrap: wrap; }
.cdlg .row > label { flex: 1; min-width: 140px; }
.cdlg textarea { font: 12px/1.45 var(--mono); min-height: 54px; resize: vertical; }
.cdlg .btns { display: flex; gap: 8px; justify-content: flex-end; }
.cdlg button.sm { padding: 3px 9px; font-size: 12px; }
.srv { border: 1px solid var(--line); border-radius: 10px; padding: 8px 10px; display: flex; flex-direction: column; gap: 6px; background: var(--bg); }
.srv .top { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.srv .nm { font-weight: 600; }
.srv .what { color: var(--mute); font: 11.5px var(--mono); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; min-width: 120px; }
.srv .st { font-size: 12px; color: var(--mute); }
.srv .st.ready { color: var(--ok); } .srv .st.failed { color: var(--bad); } .srv .st.unapproved { color: var(--accent); }
.dot { width: 8px; height: 8px; border-radius: 50%; background: var(--line); flex: none; }
.dot.ready { background: var(--ok); } .dot.failed { background: var(--bad); } .dot.connecting, .dot.idle { background: #e8a33d; } .dot.unapproved { background: var(--accent); }
.srv select { padding: 3px 6px; font-size: 12px; }
.srv .err { font-size: 12px; color: var(--bad); white-space: pre-wrap; }
.srv .ask { font-size: 12.5px; background: var(--user); border-radius: 8px; padding: 6px 8px; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.srv .ask code { font: 11.5px var(--mono); }
.tlist { display: flex; flex-direction: column; gap: 2px; max-height: 260px; overflow: auto; border-top: 1px dashed var(--line); padding-top: 6px; }
.tl { display: flex; align-items: flex-start; gap: 8px; font-size: 12.5px; padding: 3px 2px; border-radius: 6px; }
.tl:hover { background: var(--panel); }
.tl input { margin-top: 3px; }
.tl .tn { font: 12px var(--mono); font-weight: 600; }
.tl .td { color: var(--mute); flex: 1; min-width: 0; }
.tag { font-size: 10.5px; border-radius: 999px; padding: 0 6px; border: 1px solid var(--line); color: var(--mute); white-space: nowrap; }
.tag.ro { color: var(--ok); border-color: color-mix(in srgb, var(--ok) 40%, transparent); }
.tag.dz { color: var(--bad); border-color: color-mix(in srgb, var(--bad) 40%, transparent); }
.tag.proj { color: var(--accent); border-color: color-mix(in srgb, var(--accent) 40%, transparent); }
.presets { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 8px; }
.pre { border: 1px solid var(--line); border-radius: 10px; padding: 8px 10px; display: flex; flex-direction: column; gap: 4px; cursor: pointer; background: var(--bg); text-align: left; }
.pre:hover { border-color: var(--accent); }
.pre.added { opacity: .6; cursor: default; }
.pre .pt { display: flex; align-items: center; gap: 6px; font-weight: 600; }
.pre .pt .ic { font-size: 18px; }
.pre .pa { font-size: 12px; color: var(--mute); line-height: 1.35; }
.pre .keys { display: flex; flex-direction: column; gap: 4px; }
.pre .miss { font-size: 11.5px; color: var(--accent); }
.cdlg .tl { flex-direction: row; color: var(--ink); }
.found { display: flex; flex-direction: column; gap: 4px; }
.found label { flex-direction: row; align-items: center; gap: 8px; color: var(--ink); font-size: 12.5px; }
.found code { color: var(--mute); font: 11px var(--mono); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#mcpTester { border: 1px solid var(--accent); border-radius: 10px; padding: 10px; display: none; flex-direction: column; gap: 6px; }
#mcpTester.on { display: flex; }
#mcpOut { max-height: 260px; overflow: auto; background: var(--code); border-radius: 8px; padding: 8px; font: 12px/1.45 var(--mono); white-space: pre-wrap; margin: 0; }
#mcpOutImgs img { max-width: 100%; border-radius: 8px; margin-top: 6px; }
.mini { display: flex; flex-direction: column; gap: 3px; margin: 6px 0 2px; }
.mini .mr { display: flex; align-items: center; gap: 8px; font-size: 12.5px; }
.mini .mr .mn { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mini .mr .mc { color: var(--mute); font-size: 12px; }
.repos { display: flex; flex-direction: column; gap: 2px; max-height: 200px; overflow: auto; }
.rp { display: flex; gap: 8px; align-items: baseline; padding: 4px 6px; border-radius: 6px; cursor: pointer; font-size: 12.5px; }
.rp:hover, .rp.on { background: var(--user); }
.rp b { font-weight: 600; white-space: nowrap; }
.rp span { color: var(--mute); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
.rp small { color: var(--mute); }
.ghrow { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; font-size: 13px; border: 1px solid var(--line); border-radius: 10px; padding: 8px 10px; background: var(--bg); }
.ghrow input { flex: 1; min-width: 160px; }
.msg.offer { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
`;

export const CONNECT_TOOLS_HTML = `
    <h4 style="margin-top:10px">🔌 MCP servers</h4>
    <p class="hint">Tools from MCP servers: a real browser, Blender, GitHub, docs, a memory graph, or anything you add. Each call follows the permission setting; risky ones still ask under ⚡ auto-run.</p>
    <div class="mini" id="mcpMini"></div>
    <div class="foot" style="border:0;margin-top:2px;padding-top:0"><span></span><button id="mcpOpen">🔌 Manage MCP servers…</button></div>`;

export const CONNECT_HTML = `
<dialog id="mcpDlg"><form method="dialog" class="cdlg" id="mcpForm">
  <h3>🔌 MCP servers<span class="sp"></span><button class="sm" value="close" formnovalidate>Done</button></h3>
  <p class="hint">Servers at a URL work while 🌐 Network is on; programs (npx, uvx, docker) run on this computer either way. <b>Smart</b> approval lets tools the server marks read-only just run and keeps asking for the destructive ones, even with ⚡ auto-run. Saved in <code id="mcpFile"></code>.</p>
  <div id="mcpList" style="display:flex;flex-direction:column;gap:8px"></div>
  <div id="mcpTester">
    <div class="row" style="align-items:center"><b id="mcpTName" style="flex:1"></b><button type="button" class="sm" id="mcpTClose">✕</button></div>
    <span class="hint" id="mcpTDesc"></span>
    <label>Arguments (JSON)<textarea id="mcpArgs" spellcheck="false"></textarea></label>
    <div class="btns"><span class="hint" id="mcpTMeta" style="flex:1;align-self:center"></span><button type="button" class="primary" id="mcpRun">▶ Run it</button></div>
    <pre id="mcpOut"></pre><div id="mcpOutImgs"></div>
  </div>
  <h4>Add a starter</h4>
  <div class="presets" id="mcpPresets"></div>
  <div id="mcpFoundBox" style="display:none">
    <h4>Already set up in your other apps</h4>
    <div class="found" id="mcpFound"></div>
    <div class="btns"><button type="button" class="sm" id="mcpImport">Import the ticked ones</button></div>
  </div>
  <h4>Add any server</h4>
  <div class="row">
    <label style="flex:0 0 140px">Name<input id="mcpName" autocomplete="off" placeholder="my-server"></label>
    <label style="flex:3">URL, or the command that starts it<input id="mcpTarget" autocomplete="off" placeholder="https://example.com/mcp   or   npx -y @scope/some-mcp --flag"></label>
  </div>
  <div class="row">
    <label>Environment (KEY=value per line)<textarea id="mcpEnv" spellcheck="false" placeholder="API_KEY=..."></textarea></label>
    <label>Headers for a URL (Name: value)<textarea id="mcpHeaders" spellcheck="false" placeholder="Authorization: Bearer ..."></textarea></label>
  </div>
  <div class="btns"><button type="button" id="mcpAddOne">＋ Add server</button></div>
  <details><summary class="hint" style="cursor:pointer">…or paste a config from a README (Claude Desktop, Cursor, VS Code and LM Studio formats all work)</summary>
    <textarea id="mcpJson" spellcheck="false" style="width:100%;margin-top:6px;min-height:90px" placeholder='{ "mcpServers": { "name": { "command": "npx", "args": ["-y", "package"] } } }'></textarea>
    <div class="btns"><button type="button" id="mcpAddJson">＋ Add from JSON</button></div>
  </details>
</form></dialog>
<dialog id="cloneDlg"><form method="dialog" class="cdlg" id="cloneForm">
  <h3>⤓ Get a repository</h3>
  <p class="hint">Clone a GitHub repository (owner/name or a link) or any git URL, then open it as a project with the 🐙 repo tools on: Maxx works on a branch, runs the tests, commits, pushes and opens a pull request, asking before anything reaches GitHub.</p>
  <div class="row">
    <label style="flex:3">Repository<input id="cloneUrl" autocomplete="off" placeholder="owner/name   ·   https://github.com/owner/name   ·   any git URL"></label>
    <label style="flex:1">Branch<input id="cloneBranch" autocomplete="off" placeholder="default"></label>
  </div>
  <div class="row" style="align-items:center">
    <label style="flex:3">Folder<input id="cloneFolder" autocomplete="off"></label>
    <label style="flex:1;flex-direction:row;align-items:center;gap:6px;color:var(--ink)"><input type="checkbox" id="cloneShallow"> Latest commit only</label>
  </div>
  <div id="cloneMineBox" style="display:none">
    <h4>Your repositories</h4>
    <input id="cloneFilter" autocomplete="off" placeholder="Filter…" style="width:100%;margin:4px 0">
    <div class="repos" id="cloneMine"></div>
  </div>
  <div id="cloneLocalBox" style="display:none">
    <h4>Already on this computer</h4>
    <div class="repos" id="cloneLocal"></div>
  </div>
  <h4>GitHub sign-in</h4>
  <div class="ghrow" id="ghRow"></div>
  <p class="hint" id="ghHint"></p>
  <pre id="cloneLog" style="display:none;margin:0;max-height:140px;overflow:auto;background:var(--code);border-radius:8px;padding:8px;font:12px/1.45 var(--mono);white-space:pre-wrap"></pre>
  <div class="btns"><button value="cancel" formnovalidate>Cancel</button><button type="button" class="primary" id="cloneGo">⤓ Clone and open</button></div>
</form></dialog>`;

export const CONNECT_JS = String.raw`
const connectUI = (() => {
  let mcp = null, gh = null, testing = null;
  const KIND = { docs: "📚", browser: "🧭", think: "🧠", files: "📄", make: "🧊", code: "🐙", hub: "🧰" };
  const STATE = { ready: "connected", failed: "failed", connecting: "starting…", idle: "not started yet", off: "off", offline: "needs 🌐 Network", unapproved: "waiting for your OK", denied: "you said no" };
  const what = (c) => c.url || [c.command].concat(c.args || []).join(" ");
  const pairs = (r, sep) => Object.entries(r || {}).map(([k, v]) => k + sep + v).join("\n");

  function drawMini(s) {
    const box = $("mcpMini"); if (!box) return;
    box.innerHTML = "";
    const list = s.mcp || [];
    if (!list.length) { box.innerHTML = '<span class="hint">No servers yet. Add Playwright, Blender, GitHub, a memory graph and more.</span>'; return; }
    for (const m of list) {
      const r = div("mr");
      r.innerHTML = '<span class="dot ' + m.state + '"></span><span class="mn">' + esc(m.label) + (m.source === "project" ? ' <span class="tag proj">project</span>' : "") + '</span><span class="mc">' + (m.state === "ready" ? m.n + " tools" : esc(STATE[m.state] || m.state)) + "</span>";
      r.style.cursor = "pointer";
      r.onclick = () => openMcp();
      box.appendChild(r);
    }
  }

  function openMcp() {
    try { $("toolsPop").hidePopover(); } catch {}
    send({ type: "mcp" });
    const d = $("mcpDlg"); if (!d.open) d.showModal();
  }

  function server(sv) {
    const card = div("srv");
    const top = div("top");
    const proj = sv.source === "project";
    top.innerHTML = '<span class="dot ' + sv.state + '"></span><span class="nm">' + esc(sv.label) + "</span>" + (proj ? '<span class="tag proj" title="' + esc(sv.file || "") + '">from this project</span>' : "") + (sv.cfg.preset && !proj ? "" : "") + '<span class="what" title="' + esc(what(sv.cfg)) + '">' + esc(what(sv.cfg)) + '</span><span class="st ' + sv.state + '">' + esc(STATE[sv.state] || sv.state) + (sv.state === "ready" ? " · " + sv.tools.filter((t) => t.on).length + "/" + sv.tools.length + " tools" : "") + "</span>";
    if (!proj) {
      const sw = document.createElement("button");
      sw.type = "button"; sw.className = "switch" + (sv.cfg.disabled ? "" : " on"); sw.setAttribute("role", "switch"); sw.setAttribute("aria-checked", String(!sv.cfg.disabled)); sw.title = sv.cfg.disabled ? "Off: Maxx doesn't start it" : "On"; sw.innerHTML = "<i></i>";
      sw.onclick = () => send({ type: "mcpUpdate", name: sv.name, patch: { disabled: !sv.cfg.disabled } });
      const ap = document.createElement("select");
      ap.title = "When Maxx asks before calling this server's tools";
      for (const [v, l] of [["smart", "Smart approval"], ["ask", "Ask every call"], ["auto", "Never ask"]]) { const o = document.createElement("option"); o.value = v; o.textContent = l; if (sv.approval === v) o.selected = true; ap.appendChild(o); }
      ap.onchange = () => send({ type: "mcpUpdate", name: sv.name, patch: { approval: ap.value } });
      top.append(ap, sw);
    }
    card.appendChild(top);
    if (sv.state === "unapproved" || sv.state === "denied") {
      const ask = div("ask");
      ask.innerHTML = "<span>This project's <b>" + esc(sv.file || ".mcp.json") + "</b> wants Maxx to start <code>" + esc(what(sv.cfg)) + "</code>. Only say yes if you trust whoever wrote it.</span>";
      const yes = document.createElement("button"); yes.type = "button"; yes.className = "sm primary"; yes.textContent = "Approve and start";
      yes.onclick = () => send({ type: "mcpApprove", name: sv.name, yes: true });
      const no = document.createElement("button"); no.type = "button"; no.className = "sm"; no.textContent = sv.state === "denied" ? "Keep off" : "No";
      no.onclick = () => send({ type: "mcpApprove", name: sv.name, yes: false });
      ask.append(yes, no);
      card.appendChild(ask);
    }
    if (sv.error && sv.state === "failed") card.appendChild(div("err", sv.error));
    const bar = div("top");
    const btn = (label, title, fn) => { const b = document.createElement("button"); b.type = "button"; b.className = "sm"; b.textContent = label; b.title = title; b.onclick = fn; bar.appendChild(b); return b; };
    let list = null, keys = null;
    if (sv.tools.length) btn("Tools ▾", "Pick which tools the model gets (fewer keeps a small model focused)", () => { list.style.display = list.style.display === "none" ? "flex" : "none"; });
    if (sv.state !== "unapproved" && sv.state !== "denied" && sv.state !== "off") btn(sv.state === "ready" ? "↻ Reconnect" : "▶ Connect now", "Start it and list its tools", () => { send({ type: "mcpTest", name: sv.label }); });
    if (!proj) {
      btn("Keys…", "Environment variables and headers (saved keys show only their last 4 characters)", () => {
        if (keys.style.display !== "none") return void (keys.style.display = "none");
        keys.style.display = "flex";
        keys.innerHTML = "";
        const ta = (label, val, ph) => { const l = document.createElement("label"); l.textContent = label; const t = document.createElement("textarea"); t.spellcheck = false; t.value = val; t.placeholder = ph; l.appendChild(t); keys.appendChild(l); return t; };
        const env = ta("Environment (KEY=value per line)", pairs(sv.cfg.env, "="), "API_KEY=...");
        const hd = sv.cfg.url ? ta("Headers (Name: value per line)", pairs(sv.cfg.headers, ": "), "Authorization: Bearer ...") : null;
        const save = document.createElement("button"); save.type = "button"; save.className = "sm primary"; save.textContent = "Save keys"; save.style.alignSelf = "flex-end";
        save.onclick = () => send({ type: "mcpUpdate", name: sv.name, patch: hd ? { env: env.value, headers: hd.value } : { env: env.value } });
        keys.appendChild(save);
      });
      const sp = document.createElement("span"); sp.style.flex = "1"; bar.appendChild(sp);
      btn("Remove", "Take it out of mcp.json", () => { if (confirm("Remove " + sv.label + "?")) send({ type: "mcpRemove", name: sv.name }); }).classList.add("danger");
    }
    if (sv.server) { const v = div("st", sv.server); bar.appendChild(v); }
    card.appendChild(bar);
    keys = div("row"); keys.style.display = "none"; keys.style.flexDirection = "column"; keys.style.alignItems = "stretch";
    card.appendChild(keys);
    if (sv.tools.length) {
      list = div("tlist"); list.style.display = "none";
      const picked = () => [...list.querySelectorAll("input:checked")].map((i) => i.value);
      for (const t of sv.tools) {
        const r = document.createElement("label"); r.className = "tl";
        r.innerHTML = '<input type="checkbox" value="' + esc(t.name) + '"' + (t.on ? " checked" : "") + (proj ? " disabled" : "") + '><span class="tn">' + esc(t.name) + '</span><span class="td">' + esc(t.description) + "</span>" + (t.readOnly ? '<span class="tag ro" title="Runs without asking">read-only</span>' : "") + (t.danger ? '<span class="tag dz" title="' + esc(t.danger) + '">asks on ⚡</span>' : "");
        const tr = document.createElement("button"); tr.type = "button"; tr.className = "sm"; tr.textContent = "Try"; tr.title = "Run it yourself";
        tr.onclick = (e) => { e.preventDefault(); tester(sv.label, t); };
        r.appendChild(tr);
        const cb = r.querySelector("input");
        cb.onchange = () => { const p = picked(); send({ type: "mcpUpdate", name: sv.name, patch: { tools: p.length === sv.tools.length ? null : p } }); };
        list.appendChild(r);
      }
      card.appendChild(list);
    }
    return card;
  }

  function tester(label, t) {
    testing = { server: label, tool: t.name };
    $("mcpTester").classList.add("on");
    $("mcpTName").textContent = "▶ " + label + " → " + t.name;
    $("mcpTDesc").textContent = t.description || "";
    $("mcpArgs").value = "{}";
    $("mcpOut").textContent = ""; $("mcpOutImgs").innerHTML = ""; $("mcpTMeta").textContent = "";
    $("mcpTester").scrollIntoView({ block: "nearest" });
  }

  function preset(p) {
    const b = document.createElement("div");
    b.className = "pre" + (p.added ? " added" : "");
    b.innerHTML = '<span class="pt"><span class="ic">' + p.icon + "</span>" + esc(p.title) + (p.added ? ' <span class="tag ro">added</span>' : "") + (p.url ? ' <span class="tag" title="Needs 🌐 Network">web</span>' : ' <span class="tag" title="Runs on this computer">local</span>') + '</span><span class="pa">' + esc(p.about) + "</span>" + (p.missing.length ? '<span class="miss">Needs ' + esc(p.missing.join("; ")) + "</span>" : "");
    if (p.added) return b;
    b.onclick = (e) => {
      if (e.target.closest("input,button")) return;
      if (!p.needs.length) return send({ type: "mcpAdd", preset: p.id });
      if (b.querySelector(".keys")) return;
      const k = div("keys");
      for (const n of p.needs) { const l = document.createElement("label"); l.innerHTML = esc(n.label) + '<input type="password" autocomplete="off" data-key="' + esc(n.key) + '" placeholder="' + esc(n.help || "") + '">'; k.appendChild(l); }
      const go = document.createElement("button"); go.type = "button"; go.className = "sm primary"; go.textContent = "＋ Add";
      go.onclick = () => { const keys = {}; k.querySelectorAll("input").forEach((i) => { if (i.value.trim()) keys[i.dataset.key] = i.value.trim(); }); send({ type: "mcpAdd", preset: p.id, keys }); };
      k.appendChild(go);
      b.appendChild(k);
      k.querySelector("input").focus();
    };
    return b;
  }

  function drawMcp(m) {
    mcp = m;
    $("mcpFile").textContent = m.file;
    const list = $("mcpList"); list.innerHTML = "";
    if (!m.servers.length) list.appendChild(div("hint", "No MCP servers yet: add a starter below."));
    for (const sv of m.servers) list.appendChild(server(sv));
    const pr = $("mcpPresets"); pr.innerHTML = "";
    for (const p of m.presets) pr.appendChild(preset(p));
    const f = $("mcpFound"); f.innerHTML = "";
    $("mcpFoundBox").style.display = m.found.length ? "" : "none";
    for (const x of m.found) { const l = document.createElement("label"); l.innerHTML = '<input type="checkbox" checked value="' + esc(x.name) + '"><b>' + esc(x.name) + '</b><span class="tag">' + esc(x.app) + "</span><code>" + esc(x.what) + "</code>"; f.appendChild(l); }
  }

  // ⤓ Clone
  function openClone(url) {
    send({ type: "github", repos: true });
    const d = $("cloneDlg");
    if (url) $("cloneUrl").value = url;
    $("cloneLog").style.display = "none";
    if (!d.open) d.showModal();
    setTimeout(() => $("cloneUrl").focus(), 30);
  }
  const repoName = (u) => (String(u).trim().replace(/\.git$/, "").replace(/\/+$/, "").split(/[\/:]/).pop() || "");
  function suggestFolder() {
    if (!gh) return;
    const n = repoName($("cloneUrl").value);
    const f = $("cloneFolder");
    if (!f.dataset.touched) f.value = n ? gh.root.replace(/[\\\/]+$/, "") + (gh.root.includes("\\") ? "\\" : "/") + n : "";
    f.placeholder = gh.root;
  }
  function drawGh(g) {
    gh = g;
    suggestFolder();
    const row = $("ghRow"); row.innerHTML = "";
    if (g.signedIn) {
      row.innerHTML = '<span>✓ Signed in as <b>' + esc(g.login) + "</b> " + (g.source === "gh" ? "(from the GitHub CLI)" : g.source === "env" ? "(from GH_TOKEN)" : "(token saved in Maxx)") + '</span><span style="flex:1"></span>';
      if (g.hasSaved) { const b = document.createElement("button"); b.type = "button"; b.className = "sm"; b.textContent = "Sign out"; b.onclick = () => send({ type: "githubToken", clear: true }); row.appendChild(b); }
    } else {
      const i = document.createElement("input"); i.type = "password"; i.autocomplete = "off"; i.placeholder = "Paste a GitHub token (github_pat_… or ghp_…)";
      const b = document.createElement("button"); b.type = "button"; b.className = "sm primary"; b.textContent = "Sign in";
      b.onclick = () => send({ type: "githubToken", token: i.value });
      row.append(i, b);
    }
    $("ghHint").innerHTML = g.signedIn ? "Pushes and pull requests use this sign-in. The token only ever goes to GitHub." : (g.error ? '<span style="color:var(--bad)">' + esc(g.error) + "</span> " : "") + "Public repositories clone without it. For private ones, pushes and pull requests: make a token at <b>github.com/settings/tokens</b> (fine-grained: Contents and Pull requests, read and write)" + (g.gh ? ", or run <code>gh auth login</code>." : ".");
    const mine = $("cloneMine"); mine.innerHTML = "";
    $("cloneMineBox").style.display = g.mine && g.mine.length ? "" : "none";
    const flt = $("cloneFilter").value.toLowerCase();
    for (const r of g.mine || []) {
      if (flt && !(r.full + " " + r.about).toLowerCase().includes(flt)) continue;
      const d = div("rp"); d.innerHTML = "<b>" + esc(r.full) + "</b><span>" + esc(r.about) + "</span><small>" + (r.private ? "🔒 " : "") + esc(r.pushed) + "</small>";
      d.onclick = () => { $("cloneUrl").value = r.full; suggestFolder(); mine.querySelectorAll(".rp").forEach((x) => x.classList.toggle("on", x === d)); };
      mine.appendChild(d);
    }
    const loc = $("cloneLocal"); loc.innerHTML = "";
    $("cloneLocalBox").style.display = g.local && g.local.length ? "" : "none";
    for (const r of g.local || []) {
      const d = div("rp"); d.innerHTML = "<b>" + esc(r.name) + "</b><span>" + esc(r.cwd) + "</span><small>Open</small>";
      d.onclick = () => { $("cloneDlg").close(); send({ type: "open", cwd: r.cwd, toolsets: ["repo"] }); };
      loc.appendChild(d);
    }
  }

  function offer(m) {
    const d = div("msg note offer");
    d.innerHTML = "<span>⤓ " + esc(m.name) + " is on this computer at <code>" + esc(m.cwd) + "</code></span>";
    const b = document.createElement("button"); b.className = "primary"; b.textContent = "Open it as the project";
    b.onclick = () => { if (busy) return note("Stop or wait for the current turn first, then open it."); send({ type: "open", cwd: m.cwd, toolsets: ["repo"] }); };
    d.appendChild(b);
    add(d);
  }

  function wire() {
    $("mcpOpen").onclick = openMcp;
    $("cloneBtn").onclick = () => openClone("");
    $("mcpTClose").onclick = () => $("mcpTester").classList.remove("on");
    $("mcpRun").onclick = () => {
      if (!testing) return;
      let args;
      try { args = JSON.parse($("mcpArgs").value || "{}"); } catch (e) { $("mcpTMeta").textContent = "That is not valid JSON."; return; }
      $("mcpTMeta").textContent = "Running…"; $("mcpOut").textContent = ""; $("mcpOutImgs").innerHTML = "";
      send({ type: "mcpCall", server: testing.server, tool: testing.tool, args });
    };
    $("mcpAddOne").onclick = () => {
      const target = $("mcpTarget").value.trim();
      if (!target) return $("mcpTarget").focus();
      send({ type: "mcpAdd", name: $("mcpName").value.trim(), target, env: $("mcpEnv").value, headers: $("mcpHeaders").value });
      $("mcpName").value = $("mcpTarget").value = $("mcpEnv").value = $("mcpHeaders").value = "";
    };
    $("mcpAddJson").onclick = () => { const j = $("mcpJson").value.trim(); if (j) send({ type: "mcpAdd", json: j }), ($("mcpJson").value = ""); };
    $("mcpImport").onclick = () => { const names = [...$("mcpFound").querySelectorAll("input:checked")].map((i) => i.value); if (names.length) send({ type: "mcpAdd", found: names }); };
    $("cloneUrl").oninput = suggestFolder;
    $("cloneFolder").oninput = () => { $("cloneFolder").dataset.touched = "1"; };
    $("cloneFilter").oninput = () => gh && drawGh(gh);
    $("cloneGo").onclick = () => {
      const url = $("cloneUrl").value.trim();
      if (!url) return $("cloneUrl").focus();
      if (busy) return note("Stop or wait for the current turn first.");
      $("cloneGo").disabled = true; $("cloneGo").textContent = "Cloning…";
      $("cloneLog").style.display = ""; $("cloneLog").textContent = "git clone " + url + " …";
      send({ type: "clone", url, folder: $("cloneFolder").dataset.touched ? $("cloneFolder").value.trim() : "", branch: $("cloneBranch").value.trim(), shallow: $("cloneShallow").checked });
    };
  }
  setTimeout(wire, 0);

  return {
    render(s) { drawMini(s); },
    open: openMcp,
    clone: openClone,
    on(m) {
      switch (m.type) {
        case "mcp": return drawMcp(m);
        case "mcpResult":
          if (!testing || m.tool !== testing.tool) return;
          $("mcpTMeta").textContent = (m.text.startsWith("error:") ? "Failed" : "Done") + " in " + (m.ms / 1000).toFixed(1) + " s";
          $("mcpOut").textContent = m.text;
          $("mcpOutImgs").innerHTML = (m.images || []).map((u) => '<img src="' + u + '" alt="">').join("");
          return;
        case "github": return drawGh(m);
        case "cloning":
          if (m.busy) return;
          $("cloneGo").disabled = false; $("cloneGo").textContent = "⤓ Clone and open";
          $("cloneLog").textContent = m.text || "";
          if (m.ok) $("cloneDlg").close(), $("cloneFolder").dataset.touched = "", ($("cloneUrl").value = "");
          return;
        case "offerOpen": return offer(m);
      }
    },
  };
})();
`;
