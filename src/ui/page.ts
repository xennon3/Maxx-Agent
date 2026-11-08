import { STAGE_CSS, STAGE_HTML, STAGE_JS } from "./stage-page.ts";
import { VIS_CSS, VIS_JS } from "./visuals-page.ts";
import { SOUND_CSS, SOUND_JS } from "./sound-page.ts";
import { MUSIC_CSS, MUSIC_JS } from "./music-page.ts";
import { BREVITY_LABEL } from "../brevity.ts";
import { THINKING_LABEL, THINKING_SAY } from "../thinking.ts";
import { VOICE_CSS, VOICE_HINT, VOICE_HTML, VOICE_JS } from "./voice-page.ts";
import { LAB_CSS, LAB_HTML, LAB_JS, LAB_NAV, LAB_VIEW } from "./lab-page.ts";
import { ALIEN_CSS, ALIEN_HTML, ALIEN_JS } from "./aliens-page.ts";
import { SKIN_BOOT, SKIN_CSS, SKIN_HTML, SKIN_JS, SKIN_ROW } from "./themes-page.ts";
import { CONNECT_CSS, CONNECT_HTML, CONNECT_JS, CONNECT_TOOLS_HTML } from "./connect-page.ts";

// The whole web UI in one string, so the compiled maxx.exe carries it.
export const PAGE = /* html */ `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Maxx</title>
${SKIN_BOOT}
<style>
:root {
  --bg: #f6f6f3; --panel: #ffffff; --ink: #1d1d1b; --mute: #6d6d68; --line: #e3e2dc;
  --accent: #d9480f; --accent-ink: #fff; --ok: #2b8a3e; --bad: #c92a2a; --code: #f0efe9; --user: #fff4e6;
  --radius: 10px; --mono: ui-monospace, "Cascadia Code", Consolas, monospace;
  --font: system-ui, "Segoe UI", sans-serif; --agent: #1971c2; --crew: #7048e8; --warn: #f59f00; --warn-ink: #1a1a1a;
}
@media (prefers-color-scheme: dark) {
  :root { --bg: #141413; --panel: #1d1d1b; --ink: #ecebe6; --mute: #9a9991; --line: #2f2e2b; --code: #252422; --user: #2b2117; }
}
* { box-sizing: border-box; }
html, body { height: 100%; margin: 0; }
body { background: var(--bg); color: var(--ink); font: 14px/1.5 var(--font); display: grid; grid-template-columns: 260px 1fr auto; grid-template-rows: 100vh; overflow: hidden; }
#sets { display: flex; gap: 6px; }
.msg code { font-family: var(--mono); font-size: 12.5px; background: var(--code); padding: 1px 4px; border-radius: 4px; }
.msg pre { background: var(--code); padding: 8px 10px; border-radius: 8px; overflow: auto; font: 12px/1.45 var(--mono); }
.tool summary .arg { color: var(--mute); }
aside { border-right: 1px solid var(--line); background: var(--panel); display: flex; flex-direction: column; min-height: 0; }
.brand { padding: 14px 16px; font-weight: 700; font-size: 18px; letter-spacing: .5px; display: flex; gap: 8px; align-items: center; }
.brand b { color: var(--accent); }
.openbox { padding: 0 12px 12px; display: flex; gap: 6px; }
input, select, textarea, button { font: inherit; color: inherit; }
input, select, textarea { background: var(--bg); border: 1px solid var(--line); border-radius: 8px; padding: 7px 9px; min-width: 0; }
button { border: 1px solid var(--line); background: var(--panel); border-radius: 8px; padding: 7px 12px; cursor: pointer; }
button:hover { border-color: var(--mute); }
button.primary { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
button.danger { color: var(--bad); }
.projects { overflow: auto; padding: 0 8px 12px; flex: 1; }
.proj { margin-top: 10px; }
.proj > .name { font-weight: 600; padding: 4px 8px; cursor: pointer; border-radius: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.proj > .name:hover, .sess:hover { background: var(--bg); }
.proj .path { color: var(--mute); font-size: 11px; padding: 0 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sess { padding: 4px 8px 4px 16px; cursor: pointer; border-radius: 6px; font-size: 13px; display: flex; justify-content: space-between; gap: 6px; }
.sess span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sess .when { color: var(--mute); font-size: 11px; flex: none; }
.sess.on { background: var(--user); }
.sess .x { display: none; border: 0; background: none; padding: 0 4px; color: var(--mute); line-height: 1; flex: none; }
.sess:hover .x { display: inline; }
.sess:hover .when { display: none; }
.sess .x:hover { color: var(--bad); }
.sess.confirm { background: var(--bg); cursor: default; align-items: center; }
.sess.confirm button { padding: 2px 8px; font-size: 12px; }
#toast { position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%); background: var(--ink); color: var(--bg); border-radius: 999px; padding: 8px 10px 8px 16px; display: none; gap: 12px; align-items: center; z-index: 10; box-shadow: 0 6px 24px rgba(0,0,0,.25); max-width: calc(100vw - 32px); }
#toast.on { display: flex; }
#toast span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#toast button { background: none; border: 0; color: var(--accent); font-weight: 700; padding: 2px 8px; }
main { display: flex; flex-direction: column; min-width: 0; min-height: 0; }
header { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding: 10px 16px; border-bottom: 1px solid var(--line); background: var(--panel); }
header .where { font-weight: 600; margin-right: auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 40%; }
.chip { border: 1px solid var(--line); border-radius: 999px; padding: 4px 10px; cursor: pointer; user-select: none; font-size: 13px; }
.chip.on { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
#log { flex: 1; min-height: 120px; overflow: auto; padding: 18px 16px 8px; display: flex; flex-direction: column; gap: 10px; }
.msg { max-width: 860px; white-space: pre-wrap; word-wrap: break-word; }
.msg.user { align-self: flex-end; background: var(--user); padding: 8px 12px; border-radius: var(--radius); }
.msg.note { color: var(--mute); font-size: 13px; }
.msg.err { color: var(--bad); }
.msg.retracted { color: var(--mute); font-size: 13px; border-left: 2px solid var(--line); padding-left: 8px; }
.msg.retracted summary { cursor: pointer; }
.msg.retracted .body { white-space: pre-wrap; margin-top: 4px; max-height: 240px; overflow: auto; }
.tool { max-width: 860px; border: 1px solid var(--line); border-radius: var(--radius); background: var(--panel); }
.tool summary { padding: 6px 10px; cursor: pointer; font-family: var(--mono); font-size: 12.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tool summary b { color: var(--accent); font-weight: 600; }
.tool pre, .ask pre { margin: 0; padding: 8px 10px; background: var(--code); font: 12px/1.45 var(--mono); white-space: pre-wrap; max-height: 320px; overflow: auto; border-top: 1px solid var(--line); }
.tool.run summary::after { content: " …"; }
.ask { max-width: 860px; border: 2px solid var(--accent); border-radius: var(--radius); background: var(--panel); }
.ask .q { padding: 8px 12px; font-weight: 600; }
.ask .btns { display: flex; gap: 8px; padding: 8px 12px; }
.ask.answered { border-color: var(--line); opacity: .7; }
/* A step waiting for the user's OK is pinned above the message box, outside the scrolling transcript, so its buttons can't end up out of reach. */
#okdock { display: none; flex-direction: column; gap: 8px; padding: 8px 16px; border-top: 2px solid var(--accent); background: var(--bg); max-height: 45vh; overflow: auto; flex: none; }
#okdock.on { display: flex; }
#okdock .ask { box-shadow: 0 -2px 14px color-mix(in srgb, var(--accent) 18%, transparent); animation: okpulse 1.6s ease-in-out 3; }
#okdock .ask pre { max-height: 22vh; }
#okdock .more { color: var(--mute); font-size: 12px; }
@keyframes okpulse { 50% { box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 25%, transparent); } }
.ask .btns kbd { font: 11px var(--mono); opacity: .7; margin-left: 6px; }
.ask .btns .hint { margin-left: auto; align-self: center; color: var(--mute); font-size: 12px; }
.askslot { display: none; }
#okdock .ask:focus { outline: none; }
/* On a short window the dock wins: the transcript, board and Plan give up their room before the buttons do. */
main:has(#okdock.on) #log { min-height: min(120px, 12vh); }
main:has(#okdock.on) .board.on, main:has(#okdock.on) .plan.on { min-height: 0; }
main:has(#okdock.on) .composer textarea { height: 40px; }
.activity.asking { cursor: pointer; }
.qcard { max-width: 860px; border: 2px solid var(--crew); border-radius: var(--radius); background: var(--panel); }
.qcard .q { padding: 10px 12px 4px; font-weight: 600; }
.qcard .q::before { content: "❓ "; }
.qcard .choices { display: flex; flex-wrap: wrap; gap: 8px; padding: 8px 12px 0; }
.qcard .choices button.guess { border-color: var(--crew); }
.qcard .choices button.guess::after { content: " · Maxx's guess"; color: var(--mute); font-size: 11px; }
.qcard .own { display: flex; gap: 8px; padding: 8px 12px 10px; }
.qcard .own input { flex: 1; min-width: 0; }
.qcard .wait { padding: 0 12px 8px; color: var(--mute); font-size: 12px; }
.qcard .a { padding: 4px 12px 10px; }
.qcard .a b { color: var(--mute); font-weight: 400; }
.qcard.answered { border-color: var(--line); }
.board .brief { color: var(--mute); font-size: 12px; white-space: pre-wrap; margin: 2px 0 4px; }
.add { color: var(--ok); } .del { color: var(--bad); } .dim { color: var(--mute); }
.composer { display: flex; flex-direction: column; gap: 8px; padding: 12px 16px 16px; border-top: 1px solid var(--line); background: var(--panel); }
.composer .row { display: flex; gap: 8px; }
.composer textarea { flex: 1; resize: none; height: 64px; }
#clipBtn { padding: 7px 10px; font-size: 16px; line-height: 1; }
#autoBtn { align-self: flex-start; padding: 7px 10px; font-size: 13px; line-height: 1; white-space: nowrap; }
#autoBtn.on { background: var(--warn); border-color: var(--warn); color: var(--warn-ink); font-weight: 600; }
#autoBtn.half { border-color: var(--warn); }
.ask .btns .auto { margin-left: auto; border-color: var(--warn); }
.files { display: flex; flex-wrap: wrap; gap: 6px; }
.files:empty { display: none; }
.file { display: flex; align-items: center; gap: 6px; border: 1px solid var(--line); border-radius: 8px; padding: 3px 4px 3px 6px; font-size: 12.5px; background: var(--bg); max-width: 100%; }
.file img { width: 28px; height: 28px; object-fit: cover; border-radius: 4px; }
.file .nm { max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.file .sz { color: var(--mute); }
.file .how { border: 1px solid var(--line); border-radius: 999px; padding: 0 8px; font-size: 11.5px; cursor: pointer; white-space: nowrap; }
.file .how.fixed { cursor: default; opacity: .8; }
.file .rm { border: 0; background: none; padding: 0 4px; color: var(--mute); }
.file.up { opacity: .6; } .file.bad { border-color: var(--bad); color: var(--bad); }
.msg .att { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
.msg .att span { font-size: 12px; border: 1px solid var(--line); border-radius: 6px; padding: 0 6px; background: var(--panel); }
#drop { position: fixed; inset: 8px; border: 3px dashed var(--accent); border-radius: 16px; background: color-mix(in srgb, var(--accent) 8%, transparent); display: none; align-items: center; justify-content: center; font-size: 20px; font-weight: 600; color: var(--accent); z-index: 8; pointer-events: none; }
#drop.on { display: flex; }
.empty { margin: auto; text-align: center; color: var(--mute); max-width: 420px; }
.empty h2 { color: var(--ink); margin: 0 0 6px; }
.starters { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 10px; margin: 18px 0 0; text-align: left; }
.empty:has(.starters) { max-width: 760px; }
.starter { display: flex; flex-direction: column; gap: 2px; align-items: flex-start; text-align: left; padding: 12px; border-radius: var(--radius); background: var(--panel); }
.starter .icon { font-size: 22px; }
.starter b { color: var(--ink); }
.starter span { color: var(--mute); font-size: 12.5px; line-height: 1.35; }
.starter:disabled { opacity: .5; cursor: wait; }
.ideas { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 12px; }
#zoom { position: fixed; inset: 0; background: rgba(0,0,0,.85); display: none; align-items: center; justify-content: center; cursor: zoom-out; z-index: 9; }
#zoom img { max-width: 95vw; max-height: 95vh; }
.status { font-size: 12px; color: var(--mute); }
.activity { display: none; align-items: center; gap: 8px; padding: 6px 16px; border-top: 1px solid var(--line); background: var(--panel); font-size: 13px; min-width: 0; }
.activity.on { display: flex; }
.activity .spin { color: var(--accent); font-family: var(--mono); width: 1ch; flex: none; }
.activity .what { font-weight: 600; flex: none; max-width: 50%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.activity .meta { color: var(--mute); flex: none; font-variant-numeric: tabular-nums; }
.activity .tail { color: var(--mute); font-family: var(--mono); font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.tool.live { border-color: var(--accent); }
.tool.live summary::after { content: ""; }
.tool summary .meta { color: var(--mute); font-family: var(--font); font-size: 12px; margin-left: 6px; }
.tool.live pre::after { content: "▍"; color: var(--accent); animation: blink 1s steps(1) infinite; }
.tool.skipped { opacity: .6; }
.think { max-width: 860px; color: var(--mute); }
/* Folding: the task board, the Plan and the live code preview each fold to one line, so the current activity keeps its room. */
.board .head, .plan .head { cursor: pointer; user-select: none; }
.board .head:hover .caret, .plan .head:hover .caret { color: var(--accent); }
.caret { display: inline-block; width: 1em; color: var(--mute); font-weight: 400; transition: transform .15s; }
.min .caret { transform: rotate(-90deg); }
.head .now { display: none; color: var(--mute); font-weight: 400; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; flex: 1; }
.min .head .now { display: block; }
.board.min .head .goal { flex: 0 1 auto; max-width: 35%; }
.board.min > :not(.head):not(.bar), .plan.min > :not(.head) { display: none; }
.board.on.min, .board.crew.on.min { max-height: none; overflow: visible; }
.board.min .bar { margin-bottom: 0; }
.plan.on:not(.min) { max-height: 30vh; overflow: auto; flex: 0 1 auto; min-height: 2.6em; }
.plan .head { gap: 8px; align-items: baseline; }
.plan .head > b { flex: none; }
.tool.live:not([open]) summary .meta::after { content: " · click to watch the code"; }
.foldall { font-size: 12px; padding: 2px 8px; border-radius: 999px; }
.think summary { cursor: pointer; font-size: 13px; font-style: italic; }
.think pre { margin: 4px 0 0; padding: 6px 10px; border-left: 2px solid var(--line); font: 12px/1.45 var(--mono); white-space: pre-wrap; max-height: 240px; overflow: auto; }
.plan { display: none; margin: 10px 16px 0; padding: 8px 12px; border: 1px solid var(--line); border-left: 3px solid var(--accent); border-radius: var(--radius); background: var(--panel); font-size: 13px; max-width: 860px; }
.plan.on { display: block; }
.plan .head { display: flex; justify-content: space-between; font-weight: 600; margin-bottom: 2px; }
.plan .head span { color: var(--mute); font-weight: 400; }
.plan .step { display: flex; gap: 8px; padding: 1px 0; }
.plan .step .box { flex: none; width: 1.2em; color: var(--mute); }
.plan .step.done { color: var(--mute); }
.plan .step.done span + span { text-decoration: line-through; }
.plan .step.done .box { color: var(--ok); }
.plan .step.next { font-weight: 600; }
.plan .step.missed .box { color: var(--warn); }
.plan .step .why { color: var(--mute); font-size: 12px; }
.report { margin-top: 8px; padding: 5px 10px; border: 1px solid var(--line); border-left: 3px solid var(--ok); border-radius: var(--radius); background: var(--panel); font-size: 13px; font-weight: 600; }
.report.no { border-left-color: var(--warn); }
.report .go { margin-left: 10px; padding: 2px 10px; border: 1px solid var(--warn); border-radius: var(--radius); background: transparent; color: inherit; font: inherit; font-size: 12px; cursor: pointer; }
.report .go:hover { background: var(--warn); color: var(--bg); }
.errbar { display: none; margin: 10px 16px 0; padding: 6px 10px; border: 1px solid var(--bad); border-left: 3px solid var(--bad); border-radius: var(--radius); background: var(--panel); color: var(--bad); font-size: 13px; max-width: 860px; gap: 8px; align-items: flex-start; }
.errbar.on { display: flex; }
.errbar .txt { flex: 1; white-space: pre-wrap; word-break: break-word; max-height: 30vh; overflow: auto; font-family: var(--mono); font-size: 12px; }
.errbar button { flex: none; font-size: 12px; padding: 2px 8px; }
.plan .step.next .box { color: var(--accent); }
.board { display: none; margin: 10px 16px 0; padding: 8px 12px; border: 1px solid var(--line); border-left: 3px solid var(--agent); border-radius: var(--radius); background: var(--panel); font-size: 13px; max-width: 860px; }
.board.on { display: block; max-height: 34vh; overflow: auto; flex: 0 1 auto; min-height: 2.6em; }
.board .head { display: flex; gap: 8px; align-items: baseline; font-weight: 600; }
.board .head .goal { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.board .head .state { color: var(--mute); font-weight: 400; flex: none; }
.board .bar { height: 3px; background: var(--line); border-radius: 2px; margin: 6px 0 4px; overflow: hidden; }
.board .bar i { display: block; height: 100%; background: var(--agent); transition: width .3s; }
.board.stuck { border-left-color: var(--bad); } .board.stuck .bar i { background: var(--bad); }
.board.done { border-left-color: var(--ok); } .board.done .bar i { background: var(--ok); }
.board .task { display: flex; gap: 8px; padding: 1px 0; }
.board .task .box { flex: none; width: 1.3em; text-align: center; color: var(--mute); }
.board .task .n { flex: 1; min-width: 0; }
.board .task .sub { display: block; color: var(--mute); font-size: 12px; }
.board .task.done { color: var(--mute); } .board .task.done .box { color: var(--ok); }
.board .task.doing, .board .task.checking { font-weight: 600; } .board .task.doing .box { color: var(--agent); }
.board .task.failed .box, .board .task.failed .sub { color: var(--bad); }
.board .task .tries { color: var(--mute); font-weight: 400; font-size: 12px; flex: none; }
.board .note { color: var(--mute); margin-top: 4px; }
.chip.agent.on { background: var(--agent); border-color: var(--agent); }
.chip.gear { padding: 4px 8px; }
.chip.crew.on { background: var(--crew); border-color: var(--crew); color: #fff; }
body.crew .composer textarea { border-color: var(--crew); }
#crewDlg { border: 1px solid var(--line); border-radius: 12px; background: var(--panel); color: var(--ink); padding: 0; width: min(480px, calc(100vw - 32px)); }
#crewDlg::backdrop { background: rgba(0,0,0,.35); }
#crewDlg form { display: flex; flex-direction: column; gap: 10px; padding: 16px; }
#crewDlg h3 { margin: 0; }
#crewDlg label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: var(--mute); }
#crewDlg label.check { flex-direction: row; align-items: center; gap: 8px; color: var(--ink); }
#crewDlg .row { display: flex; gap: 8px; } #crewDlg .row label { flex: 1; }
#crewDlg .hint { font-size: 12px; color: var(--mute); margin: 0; }
#crewDlg .btns { display: flex; gap: 8px; justify-content: flex-end; } #crewDlg .btns .left { margin-right: auto; }
#crewDlg .models { display: flex; flex-wrap: wrap; gap: 6px; max-height: 120px; overflow: auto; }
#crewDlg .models label { flex-direction: row; align-items: center; gap: 6px; color: var(--ink); border: 1px solid var(--line); border-radius: 999px; padding: 2px 10px; font-size: 12px; }
.board.crew { border-left-color: var(--crew); } .board.crew.on { max-height: 58vh; } .board.crew .bar i { background: var(--crew); }
.board.crew.done { border-left-color: var(--ok); } .board.crew.done .bar i { background: var(--ok); }
.board.crew.stuck { border-left-color: var(--bad); }
.crew-workers { display: flex; gap: 8px; flex-wrap: wrap; margin: 6px 0; }
.wk { display: flex; gap: 8px; align-items: center; border: 1px solid var(--line); border-radius: 10px; padding: 5px 9px; min-width: 170px; flex: 1; max-width: 260px; background: var(--bg); }
.wk .av { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; color: #fff; font-weight: 700; font-size: 12px; flex: none; position: relative; }
.wk .av::after { content: ""; position: absolute; right: -2px; bottom: -2px; width: 9px; height: 9px; border-radius: 50%; border: 2px solid var(--bg); background: var(--mute); }
.wk.thinking .av::after { background: var(--agent); animation: pulse 1s infinite; }
.wk.queued .av::after { background: var(--warn); }
.wk.working .av::after { background: var(--ok); }
.wk.merging .av::after { background: var(--crew); animation: pulse 1s infinite; }
@keyframes pulse { 50% { opacity: .3; } }
.wk .who { min-width: 0; flex: 1; line-height: 1.25; }
.wk .who .l1 { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.wk .who b { font-size: 13px; } .wk .who .m { color: var(--mute); font-size: 11px; margin-left: 4px; }
.wk .who .st { display: block; font-size: 12px; color: var(--mute); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.wk.queued .who .st { color: var(--warn); }
.crew-models { font-size: 12px; color: var(--mute); display: flex; gap: 14px; flex-wrap: wrap; margin: 2px 0 6px; }
.crew-models .slots { letter-spacing: 2px; }
.crew-lanes { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
.lane { background: var(--bg); border-radius: 8px; padding: 6px; min-height: 48px; }
.lane h4 { margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: .6px; color: var(--mute); display: flex; justify-content: space-between; }
.card { background: var(--panel); border: 1px solid var(--line); border-left: 3px solid var(--line); border-radius: 6px; padding: 4px 6px; margin-bottom: 5px; font-size: 12.5px; line-height: 1.35; }
.card .t { font-weight: 600; } .card .sub { display: block; color: var(--mute); font-size: 11.5px; }
.card.failed { border-left-color: var(--bad); } .card.failed .sub { color: var(--bad); }
.card.done { border-left-color: var(--ok); color: var(--mute); } .card.done .t { font-weight: 500; }
.card.fixing { border-left-color: var(--warn); } .card.merging { border-left-color: var(--crew); }
.crew-log { font-size: 12px; color: var(--mute); margin-top: 6px; border-top: 1px dashed var(--line); padding-top: 4px; }
.crew-log div { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
@media (max-width: 900px) { .crew-lanes { grid-template-columns: repeat(2, minmax(0, 1fr)); } }

body.agent .composer textarea { border-color: var(--agent); }
#agentDlg { border: 1px solid var(--line); border-radius: 12px; background: var(--panel); color: var(--ink); padding: 0; width: min(460px, calc(100vw - 32px)); }
#agentDlg::backdrop { background: rgba(0,0,0,.35); }
#agentDlg form { display: flex; flex-direction: column; gap: 10px; padding: 16px; }
#agentDlg h3 { margin: 0; }
#agentDlg label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: var(--mute); }
#agentDlg label.check { flex-direction: row; align-items: center; gap: 8px; color: var(--ink); }
#agentDlg .row { display: flex; gap: 8px; }
#agentDlg .row label { flex: 1; }
#agentDlg .hint { font-size: 12px; color: var(--mute); margin: 0; }
#agentDlg .btns { display: flex; gap: 8px; justify-content: flex-end; }
#agentDlg .btns .left { margin-right: auto; }
.tool.check summary b { color: var(--ok); }
.tool.check.bad summary b { color: var(--bad); }
.mark { max-width: 860px; align-self: center; font-size: 12.5px; padding: 4px 12px; border-radius: 999px; border: 1px dashed var(--line); color: var(--mute); }
.mark.up { border: 1px solid var(--crew); color: var(--crew); background: color-mix(in srgb, var(--crew) 8%, transparent); }
.chip.helper.on { background: var(--crew); border-color: var(--crew); }
.activity.helper .what::before { content: "🧠 "; }
.activity.helper { box-shadow: inset 3px 0 0 var(--crew); }
#helperDlg { border: 1px solid var(--line); border-radius: 12px; background: var(--panel); color: var(--ink); padding: 0; width: min(460px, calc(100vw - 32px)); }
#helperDlg::backdrop { background: rgba(0,0,0,.35); }
#helperDlg form { display: flex; flex-direction: column; gap: 10px; padding: 16px; }
#helperDlg h3 { margin: 0; }
#helperDlg label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: var(--mute); }
#helperDlg .row { display: flex; gap: 8px; }
#helperDlg .row label { flex: 1; }
#helperDlg .hint { font-size: 12px; color: var(--mute); margin: 0; }
#helperDlg .btns { display: flex; gap: 8px; justify-content: flex-end; }
.chip .sw { display: inline-flex; margin-left: 6px; vertical-align: -2px; border-radius: 3px; overflow: hidden; }
.sw i { display: block; width: 8px; height: 12px; }
.sw.big { display: flex; border-radius: 6px; overflow: hidden; min-height: 28px; border: 1px solid var(--line); }
.sw.big i { flex: 1; height: auto; min-height: 28px; }
.sw.big:empty { border-style: dashed; }
#rulesDlg { border: 1px solid var(--line); border-radius: 12px; background: var(--panel); color: var(--ink); padding: 0; width: min(560px, calc(100vw - 32px)); }
#rulesDlg::backdrop { background: rgba(0,0,0,.35); }
#rulesDlg form { display: flex; flex-direction: column; gap: 10px; padding: 16px; }
#rulesDlg h3 { margin: 0; }
#rulesDlg .hint { font-size: 12px; color: var(--mute); margin: 0; }
#rulesDlg label.check { display: flex; align-items: center; gap: 8px; font-size: 13px; }
#rulesDlg .btns { display: flex; gap: 8px; justify-content: flex-end; }
#ruleList { display: flex; flex-direction: column; gap: 6px; max-height: 50vh; overflow: auto; }
#ruleList .rule { display: flex; gap: 6px; align-items: center; }
#ruleList .rule input { flex: 1; min-width: 0; }
#ruleList .rule .x { flex: none; font-size: 12px; color: var(--mute); min-width: 2.6em; text-align: right; }
#ruleList .rule .x:empty { display: none; }
#undoBtn:disabled { opacity: .45; cursor: default; }
#ruleList .rule .x.strong { color: var(--accent); font-weight: 700; }
#ruleList .rule button { flex: none; padding: 2px 8px; }
#ruleList .none { color: var(--mute); font-size: 13px; padding: 6px 0; }
.chip.rules.on { background: var(--ok); border-color: var(--ok); color: #fff; }
.msg.learned { border-left: 3px solid var(--ok); padding-left: 10px; color: var(--ink); }
.ask .why { display: flex; gap: 8px; padding: 0 12px 10px; }
.ask .why input { flex: 1; min-width: 0; }
#palDlg { border: 1px solid var(--line); border-radius: 12px; background: var(--panel); color: var(--ink); padding: 0; width: min(620px, calc(100vw - 32px)); }
#palDlg::backdrop { background: rgba(0,0,0,.35); }
#palDlg form { display: flex; flex-direction: column; gap: 10px; padding: 16px; }
#palDlg h3 { margin: 0; }
#palDlg label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: var(--mute); }
#palDlg .hint { font-size: 12px; color: var(--mute); margin: 0; }
#palDlg .btns { display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; }
#palDlg .btns .left { margin-right: auto; }
.pals { display: grid; grid-template-columns: repeat(auto-fill, minmax(132px, 1fr)); gap: 8px; max-height: 46vh; overflow: auto; padding: 2px; }
.pal { border: 1px solid var(--line); border-radius: 8px; padding: 0; overflow: hidden; text-align: left; cursor: pointer; background: var(--panel); color: var(--ink); font: inherit; }
.pal:hover { border-color: var(--accent); }
.pal.on { outline: 2px solid var(--accent); outline-offset: 1px; }
.pal .sw.big { border: 0; border-radius: 0; min-height: 34px; }
.pal .nm { display: block; padding: 4px 8px 0; font-weight: 600; font-size: 13px; }
.pal .vb { display: block; padding: 0 8px 6px; font-size: 11px; color: var(--mute); line-height: 1.3; }
@keyframes blink { 50% { opacity: 0; } }
@media (max-width: 860px) {
  body { grid-template-columns: 1fr; grid-template-rows: auto 1fr auto; }
  aside { max-height: 34vh; border-right: 0; border-bottom: 1px solid var(--line); }
  header .where { max-width: 100%; }
}
${STAGE_CSS}
${VOICE_CSS}
${LAB_CSS}
${VIS_CSS}
${SOUND_CSS}
${MUSIC_CSS}
${ALIEN_CSS}
${CONNECT_CSS}
/* Layout (batch 4): one calm header row, grouped menus, a centered reading column and one message box with its tools inside. */
main { --col: max(16px, calc((100% - 860px) / 2)); container-type: inline-size; }
header { flex-wrap: nowrap; gap: 6px; padding: 8px 16px; min-height: 52px; }
header .where { flex: 1; max-width: none; min-width: 60px; margin-right: 6px; display: flex; flex-direction: column; line-height: 1.2; }
header .where b { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
header .where small { color: var(--mute); font-weight: 400; font-size: 11.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; direction: rtl; text-align: left; }
header select#model { flex: 0 1 230px; min-width: 96px; text-overflow: ellipsis; padding: 6px 8px; font-size: 13px; }
.hbtn { padding: 6px 10px; font-size: 13px; white-space: nowrap; display: inline-flex; align-items: center; gap: 4px; }
.hbtn.gear { padding: 6px 8px; }
#modelRefresh { margin-left: -4px; } #modelRefresh.spin { animation: mxspin 0.8s linear infinite; } @keyframes mxspin { to { transform: rotate(360deg); } }
.hbtn .n { background: var(--accent); color: var(--accent-ink); border-radius: 999px; font-size: 11px; padding: 0 6px; line-height: 16px; font-weight: 600; }
.hbtn .ind:empty { display: none; }
.hbtn .ind { font-size: 12px; letter-spacing: 1px; }
.seg { display: inline-flex; border: 1px solid var(--line); border-radius: 9px; padding: 2px; background: var(--bg); gap: 2px; flex: none; }
.seg button { border: 0; background: none; padding: 4px 10px; font-size: 13px; border-radius: 7px; white-space: nowrap; color: var(--mute); }
.seg button:hover { color: var(--ink); }
.seg button.on { background: var(--panel); color: var(--ink); font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,.14); }
.seg.small button { padding: 3px 8px; font-size: 12px; }
#agentBtn.on { color: var(--agent); } #crewBtn.on { color: var(--crew); }
/* The two menus */
.pop { margin: 0; inset: auto; border: 1px solid var(--line); border-radius: 12px; background: var(--panel); color: var(--ink); padding: 12px 14px; box-shadow: 0 12px 36px rgba(0,0,0,.2); width: min(440px, calc(100vw - 24px)); max-height: calc(100vh - 80px); overflow: auto; }
.pop h4 { margin: 0 0 2px; font-size: 13px; }
.pop .hint { margin: 0 0 8px; color: var(--mute); font-size: 12px; }
.pop .foot { display: flex; justify-content: space-between; align-items: center; gap: 8px; border-top: 1px solid var(--line); margin-top: 8px; padding-top: 8px; color: var(--mute); font-size: 12.5px; }
.pop .foot button, .prow button:not(.switch) { padding: 4px 10px; font-size: 12.5px; }
.prow { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-top: 1px solid var(--line); }
.prow:first-child { border-top: 0; padding-top: 2px; }
.prow .pl { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.prow .pl b { font-size: 13px; font-weight: 600; }
.prow .pl span { color: var(--mute); font-size: 12px; line-height: 1.35; }
.prow select { font-size: 12.5px; padding: 4px 6px; }
.prow .pbtns { display: flex; gap: 6px; }
#palBtn { display: inline-flex; align-items: center; gap: 6px; max-width: 170px; }
#palBtn .sw { margin: 0; }
#sets { display: flex; flex-direction: column; }
#sets .tset { display: flex; align-items: center; gap: 10px; padding: 7px 4px; border-radius: 8px; cursor: pointer; }
#sets .tset:hover { background: var(--bg); }
#sets .tset .ic { font-size: 18px; width: 24px; text-align: center; flex: none; }
.switch { position: relative; width: 36px; height: 20px; border-radius: 999px; padding: 0; background: var(--line); border: 0; flex: none; transition: background .15s; }
.switch i { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,.3); transition: left .15s; }
.switch.on { background: var(--accent); }
.switch.on i { left: 18px; }
/* The reading column: transcript, board, Plan and message box share one centered width. */
#log { padding-left: var(--col); padding-right: var(--col); }
.board, .plan { margin-left: var(--col); margin-right: var(--col); max-width: none; }
.board.on + .plan.on { margin-top: 6px; }
main:has(.board.on, .plan.on) #log { margin-top: 10px; border-top: 1px solid var(--line); }
.activity, #okdock { padding-left: var(--col); padding-right: var(--col); }
#toast { bottom: 104px; }
body.noproj .projonly { display: none !important; }
.composer { padding: 10px var(--col) 14px; border-top: 0; background: var(--bg); }
.cbox { border: 1px solid var(--line); border-radius: 14px; background: var(--panel); display: flex; flex-direction: column; box-shadow: 0 1px 4px rgba(0,0,0,.05); }
.cbox:focus-within { border-color: var(--mute); }
.cbox textarea, main:has(#okdock.on) .composer .cbox textarea { border: 0; background: none; height: 56px; resize: none; padding: 10px 12px 4px; outline: none; }
body.agent .cbox { border-color: var(--agent); } body.crew .cbox { border-color: var(--crew); }
body.agent .composer textarea, body.crew .composer textarea { border-color: transparent; }
.cbar { display: flex; align-items: center; gap: 2px; padding: 4px 6px 6px; }
.cbar .sp { flex: 1; }
.cbar .sep { width: 1px; height: 18px; background: var(--line); margin: 0 4px; }
.cbar .tb, .cbar .micmore { border: 1px solid transparent; background: none; padding: 4px 8px; font-size: 12.5px; border-radius: 8px; color: var(--mute); line-height: 1.4; white-space: nowrap; }
.cbar .tb:hover:not(:disabled), .cbar .micmore:hover { background: var(--bg); color: var(--ink); }
.cbar #clipBtn { font-size: 15px; padding: 3px 8px; }
.cbar #autoBtn { align-self: auto; }
.cbar #autoBtn.on { background: var(--warn); border-color: var(--warn); color: var(--warn-ink); }
.cbar #autoBtn.half { border-color: var(--warn); color: var(--ink); }
.cbar .micwrap { flex-direction: row; align-items: center; gap: 0; }
.cbar .mic { width: auto; height: auto; padding: 3px 8px; font-size: 15px; border: 1px solid transparent; background: none; }
.cbar .mic:hover { background: var(--bg); }
.cbar .micmore { height: auto; padding: 4px 4px; font-size: 11px; }
.cbar #micMenu { bottom: 34px; }
.cbar .kbd { color: var(--mute); font-size: 11.5px; margin-right: 6px; }
.cbar #sendBtn, .cbar #stopBtn { padding: 5px 14px; border-radius: 9px; font-size: 13px; }
.cbar #stopBtn:disabled { display: none; }
.cbar:has(#stopBtn:not(:disabled)) #sendBtn, .cbar:has(#stopBtn:not(:disabled)) .kbd { display: none; }
.cbar #sendBtn:disabled { opacity: .5; }
/* Sidebar: open a folder from under Projects. */
.projhead { display: flex; align-items: center; justify-content: space-between; padding-right: 12px; margin-top: 6px; }
.projhead button { font-size: 11.5px; padding: 1px 8px; text-transform: none; letter-spacing: 0; border-radius: 999px; color: var(--ink); }
.openarea { display: none; padding-top: 6px; }
aside.adding .openarea { display: block; }
aside.adding #addProj { background: var(--bg); }
/* A narrow middle (the preview open on a laptop): the header keeps one row by dropping words, then the path. */
@container (max-width: 900px) { header .lbl, .cbar .kbd { display: none; } .seg.modes button { padding: 4px 8px; font-size: 15px; } .hbtn { padding: 6px 8px; } }
@container (max-width: 640px) { header .where small { display: none; } .cbar .tb { padding: 4px 5px; } }
@media (max-width: 860px) { header { flex-wrap: wrap; } }
${SKIN_CSS}
</style>
</head>
<body>
<aside id="aside">
  <div class="brand"><b>◆</b> Maxx</div>
  <div class="chathead">Chat</div>
  <div class="chatnav" id="chatnav"><button class="go" id="chatBtn" title="Everyday questions, with charts and diagrams drawn right in the chat. No project, no tools.">💬 New chat</button></div>
  ${LAB_NAV}
  <div class="chathead projhead">Projects<span style="display:flex;gap:4px"><button id="cloneBtn" title="Get a repository from GitHub or any git URL, and open it as a project">⤓ Clone</button><button id="addProj" title="Open a project folder">＋ Open</button></span></div>
  <div class="openarea" id="openArea">
    <div class="openbox">
      <input id="folder" placeholder="Project folder, e.g. C:\\code\\app" style="flex:1">
      <button id="openBtn">Open</button>
    </div>
    <div class="openbox" id="pickRow" style="display:none"><button id="pickBtn" style="flex:1">Choose folder…</button></div>
  </div>
  <div class="projects" id="projects"></div>
</aside>
<main>
  <header>
    <div class="where" id="where">No project open</div>
    <div class="seg modes projonly" id="modeSeg" role="group" aria-label="How Maxx works">
      <button id="pairBtn" title="Pair: you and Maxx take turns. It does what you ask, then waits for you.">💬<span class="lbl"> Pair</span></button>
      <button id="agentBtn" title="Agent mode: give Maxx a goal. It splits it into tasks and works through them on its own, checking each one and rewinding any that fail.">🤖<span class="lbl"> Agent</span></button>
      <button id="crewBtn" title="Crew mode: give Maxx a goal. It splits it into tasks and several workers do them at the same time, each in its own copy of the project, then Maxx merges their work.">👥<span class="lbl"> Crew</span></button>
    </div>
    <button class="hbtn gear projonly" id="modeCfg" title="Settings for this mode">⚙</button>
    <select id="model" title="Model"></select>
    <button class="hbtn gear" id="modelRefresh" title="Refresh the model list: ask the server again which models it has and which one is loaded">⟳</button>
    <button class="hbtn projonly" id="toolsBtn" popovertarget="toolsPop" title="Toolsets: extra tools Maxx can use in this project">🧰<span class="lbl"> Tools</span></button>
    <button class="hbtn" id="tuneBtn" popovertarget="tunePop" title="Settings: permissions, network, replies, thinking, colors, rules and the helper model">⚙<span class="lbl"> Settings</span><span class="ind" id="tuneInd"></span></button>
    <button class="hbtn" id="newBtn" title="Start a new session">＋<span class="lbl"> New</span></button>
  </header>
  <div class="pop" id="toolsPop" popover>
    <h4>Toolsets</h4>
    <p class="hint">Extra tools for this project. Each one adds a few tools to what Maxx can use; fewer tools keep a small model focused.</p>
    <div id="sets"></div>
    <div class="foot"><span id="toolCount"></span><button id="toolsList">List them</button></div>${CONNECT_TOOLS_HTML}
  </div>
  <div class="pop" id="tunePop" popover>
    <div class="prow projonly"><div class="pl"><b>⚡ Permissions</b><span>What Maxx may do without asking</span></div>
      <select id="mode" title="Permissions">
        <option value="ask">Ask before acting</option>
        <option value="auto-edit">Auto-approve edits</option>
        <option value="yolo">⚡ Auto-run everything</option>
      </select></div>
    <div class="prow"><div class="pl"><b>🌐 Network</b><span>Web lookups, MCP servers, package installs and downloads</span></div>
      <button class="switch" id="netBtn" role="switch" aria-checked="false" title="Let Maxx look things up on the web (and in the MCP servers in ~/.maxx/mcp.json), install packages (pip, npm...) and download files"><i></i></button></div>
    <div class="prow"><div class="pl"><b>✂ Replies</b><span>How much Maxx says</span></div>
      <div class="seg small" id="briefSeg"></div></div>
    <div class="prow"><div class="pl"><b>💭 Thinking</b><span id="thinkSay">How much a reasoning model thinks before it acts</span></div>
      <div class="seg small" id="thinkSeg"></div></div>
    ${SKIN_ROW}
    <div class="prow"><div class="pl"><b>🎨 Colors</b><span>The palette Maxx designs charts, pages, apps and games with</span></div>
      <button id="palBtn" title="The colors Maxx designs with. You can also say it in a message: “make it in synthwave colors”">Auto</button></div>
    <div class="prow"><div class="pl"><b>👽 Typing buddy</b><span>The alien that acts out what Maxx is doing while it works</span></div>
      <button id="alienBtn" title="Pick the alien in the status bar, or turn it off">Zorp</button></div>
    <div class="prow projonly"><div class="pl"><b>📏 Rules</b><span id="rulesSay">Rules Maxx learned when you corrected it</span></div>
      <button id="rulesBtn" title="Rules Maxx learned when you corrected it (saying “no, use…”, denying a step with a reason, fixing its code by hand, or undoing a turn). They live in this project's MAXX.md.">Edit</button></div>
    <div class="prow projonly"><div class="pl"><b>🧠 Helper</b><span id="helperSay">A bigger model Maxx calls when the local one is stuck</span></div>
      <button id="helperBtn" title="A bigger model Maxx calls when the local one is stuck">Off</button></div>
    <div class="prow projonly"><div class="pl"><b>Modes</b><span>Budgets for Agent and Crew runs</span></div>
      <span class="pbtns"><button id="agentCfg" title="Agent mode settings">🤖 Agent…</button><button id="crewCfg" title="Crew mode settings">👥 Crew…</button></span></div>
  </div>
  <div class="board" id="board"></div>
  <div class="plan" id="plan"></div>
  <div class="errbar" id="errbar" role="alert"><span class="txt" id="errText"></span><button id="errCopy" title="Copy the error">Copy</button><button id="errX" title="Dismiss">✕</button></div>
  ${LAB_VIEW}
  <div id="log"></div>
  <div id="okdock"></div>
  <div class="activity" id="activity"><span class="buddy" id="actBuddy"></span><span class="spin" id="actSpin">⠋</span><span class="what" id="actWhat"></span><span class="meta" id="actMeta"></span><span class="tail" id="actTail"></span></div>
  ${VOICE_HINT}
  <div class="composer">
    <div class="files" id="files"></div>
    <div class="cbox">
      <textarea id="input" placeholder="Ask Maxx to build, fix or test something…  (Enter to send, Shift+Enter for a new line; drop or paste files to attach)"></textarea>
      <div class="cbar">
        <button class="tb" id="clipBtn" title="Attach files: images, code, anything. You can also drop or paste them.">📎</button>
        <input type="file" id="fileInput" multiple hidden>${VOICE_HTML}
        <span class="sep projonly"></span>
        <button class="tb projonly" id="autoBtn" title="">⚡ Auto</button>
        <button class="tb projonly" id="recipeBtn" title="📜 Save what Maxx just did as a recipe in .maxx/recipes, so next time it follows the same steps">📜 Recipe</button>
        <button class="tb projonly" id="undoBtn" disabled title="Put every file back as it was before Maxx's last turn. Then say what you wanted instead, and Maxx learns a rule from it.">↶ Undo</button>
        <span class="sp"></span>
        <span class="kbd" id="sendHint">Enter to send</span>
        <button class="danger" id="stopBtn" disabled>■ Stop</button>
        <button class="primary" id="sendBtn">Send ➤</button>
      </div>
    </div>
  </div>
</main>
${STAGE_HTML}
<dialog id="palDlg"><form method="dialog" id="palForm">
  <h3>🎨 Color palette</h3>
  <p class="hint">Maxx designs with these colors: charts and diagrams in chat, and the pages, apps and games it builds. For a single request you can also just say it: “draw it in sunset colors”, “use the palette #0b132b #3a506b #5bc0be”.</p>
  <div class="pals" id="palGrid"></div>
  <label>Your own colors <input id="palSpec" autocomplete="off" placeholder="#264653 #2a9d8f #e9c46a  ·  #ff6600 triad  ·  a coolors.co link"></label>
  <div class="sw big" id="palPreview"></div>
  <p class="hint">One color grows into five: add analogous, complementary, triad, split, tetrad or mono after it.</p>
  <input type="file" id="palFile" accept="image/*" hidden>
  <div class="btns"><button class="left" value="auto" formnovalidate title="No palette: the model picks its own colors">Auto</button><button value="random" title="A fresh palette that still hangs together">🎲 Surprise me</button><button type="button" id="palImgBtn" title="Pull the main colors out of a picture, a logo or a screenshot">🖼 From an image</button><button value="cancel" formnovalidate>Cancel</button><button class="primary" value="save">Use these</button></div>
</form></dialog>
<dialog id="rulesDlg"><form method="dialog" id="rulesForm">
  <h3>📏 Rules from your corrections</h3>
  <p class="hint">When you correct Maxx (“no, use pnpm”, Deny with a reason, fixing its code by hand, or ↶ Undo), it writes one short rule here so it doesn't make the same mistake again. xN means you corrected it N times. They are saved in this project's MAXX.md and go to the model at the start of every session.</p>
  <div id="ruleList"></div>
  <div class="ruleadd" style="display:flex;gap:6px"><input id="ruleNew" style="flex:1" autocomplete="off" placeholder="Add your own rule: “Keep all colors in src/theme.ts.”"><button type="button" id="ruleAdd">Add</button></div>
  <label class="check"><input type="checkbox" id="learnOn"> Learn new rules when I correct Maxx</label>
  <div class="btns"><button value="cancel" formnovalidate>Cancel</button><button class="primary" value="save">Save</button></div>
</form></dialog>
<dialog id="helperDlg"><form method="dialog" id="helperForm">
  <h3>🧠 Helper model</h3>
  <p class="hint">The local model does the routine steps. When it is stuck (the same call over and over, or several failures in a row), Maxx hands that one step to a bigger model, then hands back.</p>
  <label>Helper
    <select id="hKind">
      <option value="off">Off: everything stays on this machine</option>
      <option value="lmstudio">Another LM Studio model</option>
      <option value="anthropic">Claude (Anthropic API key)</option>
      <option value="openai">Other OpenAI-compatible API</option>
    </select>
  </label>
  <label id="hModelRow">Model <input id="hModel" list="hModels" placeholder="claude-opus-5-5"><datalist id="hModels"></datalist></label>
  <label id="hUrlRow">API base URL <input id="hUrl" placeholder="https://openrouter.ai/api/v1"></label>
  <label id="hKeyRow">API key <input id="hKey" type="password" autocomplete="off"></label>
  <div class="row" id="hNums">
    <label>Escalate after <input id="hAfter" type="number" min="1" max="10" title="Failed tool calls in a row"></label>
    <label>Helper steps <input id="hSteps" type="number" min="1" max="20" title="Steps the helper may take before handing back"></label>
    <label>Per message <input id="hTurn" type="number" min="1" max="10" title="Escalations allowed in one message"></label>
  </div>
  <p class="hint" id="hPrivacy"></p>
  <div class="btns"><button value="cancel" formnovalidate>Cancel</button><button class="primary" id="hSave" value="save">Save</button></div>
</form></dialog>
<dialog id="agentDlg"><form method="dialog" id="agentForm">
  <h3>🤖 Agent mode</h3>
  <p class="hint">Give Maxx a goal with 🤖 Agent on. It splits the goal into tasks and works through them alone: a snapshot before each task, a check after it, and a rewind and a different approach when a task fails. File edits need no approval while it runs; commands still follow the permission setting.</p>
  <div class="row">
    <label>Most tasks <input id="aTasks" type="number" min="1" max="30"></label>
    <label>Steps per try <input id="aSteps" type="number" min="3" max="200" title="Tool calls the model may make on one try at a task"></label>
    <label>Tries per task <input id="aTries" type="number" min="1" max="5" title="A failed try is rewound before the next"></label>
  </div>
  <div class="row">
    <label>Project map tokens <input id="aMap" type="number" min="0" max="20000" title="Size of the list of files and functions the model gets; 0 turns it off"></label>
    <label>Judge fix rounds <input id="aFixes" type="number" min="0" max="5" title="Times a FAIL from the screenshot judge goes back to the model"></label>
  </div>
  <label class="check"><input type="checkbox" id="aJudge"> Screenshot judge: after a task changes what you see, screenshot it and let the vision model check it</label>
  <label class="check"><input type="checkbox" id="aBrief"> Ask first: before planning, Maxx asks about anything the goal leaves unclear</label>
  <div class="row"><label>Wait for answers (minutes) <input id="aWait" type="number" min="0" max="120" title="How long a question waits before Maxx goes with its own guess, so a run keeps going while you are away. 0 waits for ever."></label></div>
  <p class="hint" id="aHint"></p>
  <div class="btns"><button class="left" id="aReset" value="reset" formnovalidate>Defaults</button><button value="cancel" formnovalidate>Cancel</button><button class="primary" value="save">Save</button></div>
</form></dialog>
<dialog id="crewDlg"><form method="dialog" id="crewForm">
  <h3>👥 Crew mode</h3>
  <p class="hint">Give Maxx a goal with 👥 Crew on. It plans tasks that say what they need first and which files they touch, and several workers do them at the same time, each in its own git worktree. Each hand-in is merged; a worker whose changes clash with merged work pulls it in and sorts the clash out. Then one last pass checks the pieces fit, and the result lands in your folder (/rewind undoes it). Each task uses the 🤖 Agent mode budgets.</p>
  <div class="row">
    <label>Workers <input id="cWorkers" type="number" min="1" max="8" title="Workers at the same time"></label>
    <label>Most tasks <input id="cTasks" type="number" min="2" max="20"></label>
    <label>At once per model <input id="cSlots" type="number" min="0" max="16" title="Requests LM Studio answers at the same time for one model (its Max Concurrent Predictions load setting). 0 measures it on the first run."></label>
  </div>
  <label>Worker models <span class="hint">Shared out in turn. None ticked: the model picked at the top. Two different models really think at the same time even when each takes one request at a time.</span></label>
  <div class="models" id="cModels"></div>
  <label class="check"><input type="checkbox" id="cFinal"> Final check: after the last merge, one worker runs the build and fixes what doesn't fit together</label>
  <p class="hint" id="cHint"></p>
  <div class="btns"><button class="left" value="reset" formnovalidate>Defaults</button><button value="cancel" formnovalidate>Cancel</button><button class="primary" value="save">Save</button></div>
</form></dialog>
${LAB_HTML}
${ALIEN_HTML}
${SKIN_HTML}
${CONNECT_HTML}
<div id="zoom"><img id="zoomImg" alt=""></div>
<div id="drop">Drop files to attach them to your message</div>
<div id="toast"><span id="toastText"></span><button id="toastBtn">Undo</button></div>
<script>
const BREVITY_LABEL = ${JSON.stringify(BREVITY_LABEL)};
const THINKING_LABEL = ${JSON.stringify(THINKING_LABEL)};
const THINKING_SAY = ${JSON.stringify(THINKING_SAY)};
const $ = (id) => document.getElementById(id);
const token = new URLSearchParams(location.search).get("t");
let ws, state = null, busy = false, live = null, streaming = null;
// While the model streams: tool cards being written (by call index, not run yet), the thinking block, the status bar.
let writing = [], thinkCard = null, act = null;
// The helper model's id while it has the wheel.
let helperLive = null;

function connect() {
  ws = new WebSocket((location.protocol === "https:" ? "wss://" : "ws://") + location.host + "/ws?t=" + token);
  ws.onopen = () => ws.send(JSON.stringify({ type: "hello" }));
  ws.onmessage = (e) => on(JSON.parse(e.data));
  ws.onclose = () => { note("Disconnected from Maxx. Is it still running? Retrying…", "err"); setTimeout(connect, 2000); };
}
const send = (m) => ws.send(JSON.stringify(m));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// Diffs and previews come with terminal colors; turn them into spans.
function ansi(s) {
  let out = "", open = false;
  for (const part of String(s).split(/(\\x1b\\[[0-9;]*m)/)) {
    const m = part.match(/^\\x1b\\[([0-9;]*)m$/);
    if (!m) { out += esc(part); continue; }
    if (open) out += "</span>", open = false;
    const c = m[1];
    const cls = /(^|;)32/.test(c) ? "add" : /(^|;)31/.test(c) ? "del" : /(^|;)(2|90)/.test(c) ? "dim" : "";
    if (cls) out += '<span class="' + cls + '">', open = true;
  }
  return out + (open ? "</span>" : "");
}
const ago = (iso) => { const s = (Date.now() - Date.parse(iso)) / 1000; return s < 60 ? "now" : s < 3600 ? Math.floor(s / 60) + "m" : s < 86400 ? Math.floor(s / 3600) + "h" : Math.floor(s / 86400) + "d"; };

function clearEmpty() { const e = document.querySelector("#log .empty"); if (e) e.remove(); }
function add(el) { clearEmpty(); const log = $("log"); const stick = log.scrollHeight - log.scrollTop - log.clientHeight < 80; log.appendChild(el); if (stick) log.scrollTop = log.scrollHeight; return el; }
function div(cls, text) { const d = document.createElement("div"); d.className = cls; if (text !== undefined) d.textContent = text; return d; }
function note(text, cls = "note") { add(div("msg " + cls, text)); }
// A reply whose last line is Maxx's report (✅ Done / ⚠ Not finished) shows that line as a status bar.
function paintReply(el, text, chat) {
  const lines = String(text || "").replace(/\\s+$/, "").split("\\n");
  const last = lines[lines.length - 1] || "";
  const isReport = /^(✅ Done|⚠ Not finished)/.test(last);
  visuals.paint(el, isReport ? lines.slice(0, -1).join("\\n") : text, chat);
  if (!isReport) return;
  const r = el.appendChild(div("report" + (last.startsWith("✅") ? "" : " no"), last));
  // Only the newest report keeps the button (the transcript paints oldest first).
  document.querySelectorAll("#log .report .go").forEach((b) => b.remove());
  // Not finished: one click picks the work up where it stopped.
  if (!last.startsWith("✅") && !chat) {
    const go = document.createElement("button");
    go.className = "go"; go.textContent = "▶ Keep going"; go.title = "Carry on with what is left";
    go.onclick = () => { if (busy) return; $("input").value = "Keep going: finish what is left. Don't redo what is already done."; submit(); };
    r.appendChild(go);
  }
}
// Errors stay on screen until dismissed: the transcript is redrawn when a turn ends, which used to wipe them.
const errs = [];
function showError(text) {
  errs.push(new Date().toLocaleTimeString() + "  " + text);
  $("errText").textContent = errs.slice(-5).join("\\n");
  $("errbar").classList.add("on");
}
$("errX").onclick = () => { errs.length = 0; $("errbar").classList.remove("on"); };
$("errCopy").onclick = () => { try { navigator.clipboard.writeText(errs.join("\\n")); } catch {} };
// A reply that was not an answer, folded: the model's thinking, or one cut short. Maxx asked again.
function retracted(why, text) {
  const d = document.createElement("details");
  d.className = "msg retracted";
  const sum = document.createElement("summary");
  sum.textContent = (why === "thinking" || why === "empty" ? "💭 This was the model's thinking, not an answer" : why === "length" ? "✂ This reply ran out of room" : "✂ This reply stopped mid-way") + ", so Maxx asked it to finish";
  const body = document.createElement("div");
  body.className = "body";
  body.textContent = text || "(nothing)";
  d.append(sum, body);
  return d;
}
// Claude Code style labels: "Write app/build.gradle.kts", "Tap Calculate".
const VERBS = { read_file: "Read", write_file: "Write", edit_file: "Edit", list_files: "List", grep: "Search", bash: "Run",
  android_run: "Build & run on phone", android_screen: "Look at phone", android_tap: "Tap", android_type: "Type", android_swipe: "Swipe",
  android_key: "Press", android_logcat: "Read phone log", android_explore: "Explore the app", android_devices: "List devices", android_connect: "Connect phone",
  repo_clone: "Clone", repo: "Repo", github: "GitHub", mcp_more: "MCP",
  desktop_screenshot: "Look at desktop", desktop_click: "Click", desktop_type: "Type", desktop_key: "Press", desktop_scroll: "Scroll", desktop_open: "Open",
  web_search: "Search the web", web_fetch: "Read page",
  preview: "Preview", start_server: "Start", use_template: "Start from template", make_sounds: "Make sounds", compose: "Compose", make_song: "Make song", mix_audio: "Mix", plan: "Plan", remember: "Remember", check: "Check" };
function label(name, args) {
  let a = {}; try { a = JSON.parse(args || "{}"); } catch {}
  if (name === "plan") return ["Plan", a.done ? "step " + a.done + " done" : "write the steps"];
  if (name === "remember") return ["Remember", String(a.note ?? "")];
  if (name === "ask_user") return ["Ask", String(a.question ?? "")];
  if (name === "make_sounds") return ["Make sounds", [...(a.effects || []).map((e) => e.name), ...(a.music || []).map((m) => "♪ " + m.name + (m.mood ? " (" + m.mood + ")" : ""))].join(", ")];
  if (name === "compose") return ["Compose", String(a.file ?? ((/^\\s*title:\\s*(.+)$/im.exec(a.score || "") || [])[1] ?? "song"))];
  if (name === "make_song") return ["Make song", String(a.prompt ?? "")];
  if (name === "mix_audio") return ["Mix", String(a.action ?? "") + " " + String(a.output ?? a.input ?? "")];
  const main = a.template ?? a.path ?? a.query ?? a.url ?? a.libraryName ?? a.question ?? a.command ?? a.pattern ?? a.keys ?? a.key ?? a.target ?? a.direction ?? (a.text !== undefined ? JSON.stringify(a.text) : undefined) ??
    (a.element !== undefined ? "element " + a.element : a.x !== undefined ? a.x + "," + a.y : a.crashes ? "crashes" : a.project_dir ?? a.apk ?? "");
  return [VERBS[name] || name, String(main)];
}
function md(text) {
  return esc(text)
    .replace(/\`\`\`[\\w-]*\\n([\\s\\S]*?)\`\`\`/g, (_, c) => "<pre>" + c + "</pre>")
    .replace(/\`([^\`\\n]+)\`/g, "<code>$1</code>")
    .replace(/\\*\\*([^*\\n]+)\\*\\*/g, "<b>$1</b>");
}
// What the user folded away (the task board, the Plan, the live code preview), remembered in this browser.
const fold = { board: false, plan: false, live: false };
for (const k in fold) try { fold[k] = localStorage.getItem("maxx.fold." + k) === "1"; } catch {}
function setFold(k, v) { fold[k] = v; try { localStorage.setItem("maxx.fold." + k, v ? "1" : "0"); } catch {} }
for (const k of ["board", "plan"]) $(k).addEventListener("click", (e) => {
  if (!e.target.closest(".head")) return;
  setFold(k, !fold[k]);
  $(k).classList.toggle("min", fold[k]);
});
// The pinned checklist, Claude Code style: what is done, what is next.
function drawPlan(steps) {
  const box = $("plan");
  steps = steps || [];
  box.classList.toggle("on", steps.length > 0);
  if (!steps.length) return box.innerHTML = "";
  const done = steps.filter((x) => x.done).length, missed = steps.filter((x) => x.missed).length;
  const next = missed ? -1 : steps.findIndex((x) => !x.done);
  const nextText = missed ? "⚠ " + missed + " not done" : next >= 0 ? "▸ " + esc(steps[next].text) : "✓ all done";
  box.classList.toggle("min", fold.plan);
  box.innerHTML = '<div class="head" title="Click to fold or unfold the Plan"><b><span class="caret">▾</span>Plan</b><span class="now">' + nextText + "</span><span>" + done + " of " + steps.length + " done</span></div>" +
    steps.map((x, i) => '<div class="step' + (x.done ? " done" : x.missed ? " missed" : i === next ? " next" : "") + '"><span class="box">' + (x.done ? "✓" : x.missed ? "✗" : i === next ? "▸" : "○") + "</span><span>" + esc(x.text) + (x.missed ? ' <span class="why">— not done' + (x.why ? ": " + esc(x.why) : "") + "</span>" : "") + "</span></div>").join("");
}
// Agent mode's task board: the goal, a progress bar, and each task's state.
function drawBoard(b) {
  const box = $("board");
  box.classList.toggle("on", !!(b && b.tasks));
  if (!b) return box.innerHTML = "";
  if (b.kind === "crew") return drawCrew(b);
  const done = b.tasks.filter((t) => t.status === "done").length, n = b.tasks.length;
  box.className = "board on " + b.state + (fold.board ? " min" : "");
  const state = b.state === "planning" ? "planning…" : b.state === "running" ? "task " + Math.min(b.current + 1, n) + " of " + n : b.state === "done" ? "done" : b.state === "stuck" ? "stuck" : "stopped";
  const icon = { done: "✓", doing: "▸", checking: "👁", failed: "✗", todo: "○" };
  const cur = b.tasks.find((t) => t.status === "doing" || t.status === "checking") || b.tasks.find((t) => t.status === "todo");
  box.innerHTML = '<div class="head" title="Click to fold or unfold the task list"><span class="caret">▾</span><span>🤖</span><span class="goal"></span><span class="now">' + (cur ? "▸ " + esc(cur.text) : "") + '</span><span class="state">' + state + "</span></div>" +
    (b.brief ? '<div class="brief">' + esc(b.brief) + "</div>" : "") +
    '<div class="bar"><i style="width:' + (n ? Math.round((done / n) * 100) : 0) + '%"></i></div>' +
    b.tasks.map((t) => '<div class="task ' + t.status + '"><span class="box">' + icon[t.status] + '</span><span class="n">' + esc(t.text) +
      (t.check && t.status !== "done" ? '<span class="sub">✔ when ' + esc(t.check) + "</span>" : "") + (t.note ? '<span class="sub">' + esc(t.note) + "</span>" : "") +
      "</span>" + (t.tries > 1 ? '<span class="tries">try ' + t.tries + "</span>" : "") + "</div>").join("") +
    (b.note && b.state !== "running" ? '<div class="note">' + esc(b.note) + "</div>" : "");
  box.querySelector(".goal").textContent = b.goal;
  box.querySelector(".goal").title = b.goal;
}
// Crew mode's board: the workers and what each is doing, the models' queues, and the tasks in lanes.
const CREW_COLORS = ["#1971c2", "#d9480f", "#2b8a3e", "#ae3ec9", "#e67700", "#0c8599", "#c2255c", "#5f3dc4"];
const WK_SAY = { idle: "idle", queued: "waiting for the model", thinking: "thinking", working: "working", merging: "handing in" };
function drawCrew(b) {
  const box = $("board");
  const done = b.tasks.filter((t) => t.status === "done").length, n = b.tasks.length;
  box.className = "board crew on " + b.state + (fold.board ? " min" : "");
  const secs = Math.round((Date.now() - b.started) / 1000);
  const state = b.state === "planning" ? "planning…" : b.state === "running" ? done + " of " + n + " done · " + clock(secs * 1000) : b.state === "checking" ? "final check…" : b.state === "applying" ? "applying…" : b.state;
  const color = (name) => CREW_COLORS[Math.max(0, b.workers.findIndex((w) => w.name === name)) % CREW_COLORS.length];
  const workers = b.workers.map((w, i) => {
    const what = w.state === "working" && w.doing ? w.doing : w.state === "thinking" && w.tokens ? "thinking · " + w.tokens + " tokens" : WK_SAY[w.state];
    return '<div class="wk ' + w.state + '" title="' + esc(w.model) + (w.done ? " · " + w.done + " handed in" : "") + '"><span class="av" style="background:' + CREW_COLORS[i % CREW_COLORS.length] + '">' + esc(w.name[0]) + '</span><span class="who"><span class="l1"><b>' + esc(w.name) + "</b>" +
      '<span class="m">' + esc(w.model.split("/").pop()) + "</span></span>" +
      '<span class="st">' + (w.done ? "✓" + w.done + " · " : "") + (w.task ? "#" + w.task + " · " : "") + esc(what) + "</span></span></div>";
  }).join("");
  const models = (b.models || []).map((m) => '<span title="' + esc(m.model) + ': LM Studio answers ' + m.slots + ' at once">' + esc(m.model.split("/").pop().slice(0, 30)) + ' <span class="slots">' + "●".repeat(Math.min(m.busy, m.slots)) + "○".repeat(Math.max(0, m.slots - m.busy)) + "</span>" + (m.waiting ? " · " + m.waiting + " in line" : "") + "</span>").join("");
  const lanes = [["To do", ["waiting", "ready"]], ["Working", ["doing", "checking", "fixing"]], ["Handing in", ["merging"]], ["Done", ["done", "failed"]]];
  const card = (t) => '<div class="card ' + t.status + '" style="' + (t.worker && t.status !== "done" && t.status !== "failed" && t.status !== "ready" && t.status !== "waiting" ? "border-left-color:" + color(t.worker) : "") + '"><span class="t">#' + t.id + " " + esc(t.text) + "</span>" +
    (t.status === "waiting" && t.after.length ? '<span class="sub">after ' + t.after.map((a) => "#" + a).join(", ") + "</span>" : "") +
    (t.worker && t.status !== "ready" && t.status !== "waiting" ? '<span class="sub">' + esc(t.worker) + (t.tries > 1 ? " · try " + t.tries : "") + (t.files ? " · " + t.files + " files" : "") + "</span>" : "") +
    (t.status === "fixing" ? '<span class="sub">⚡ ' + esc(t.note || "sorting out a clash") + "</span>" : t.note ? '<span class="sub">' + esc(t.note) + "</span>" : "") + "</div>";
  const busyW = b.workers.filter((w) => w.state !== "idle").map((w) => w.name + (w.task ? " #" + w.task : "")).join(", ");
  box.innerHTML = '<div class="head" title="Click to fold or unfold the crew board"><span class="caret">▾</span><span>👥</span><span class="goal"></span><span class="now">' + (busyW ? "▸ " + esc(busyW) : "") + '</span><span class="state">' + state + "</span></div>" +
    (b.brief ? '<div class="brief">' + esc(b.brief) + "</div>" : "") +
    '<div class="bar"><i style="width:' + (n ? Math.round((done / n) * 100) : 0) + '%"></i></div>' +
    '<div class="crew-workers">' + workers + "</div>" + (models ? '<div class="crew-models">' + models + "</div>" : "") +
    (n ? '<div class="crew-lanes">' + lanes.map(([name, sts]) => { const ts = b.tasks.filter((t) => sts.includes(t.status)); return '<div class="lane"><h4>' + name + "<span>" + ts.length + "</span></h4>" + ts.map(card).join("") + "</div>"; }).join("") + "</div>" : "") +
    (b.log.length ? '<div class="crew-log">' + b.log.slice(-3).map((l) => "<div>✓ " + esc(l) + "</div>").join("") + "</div>" : "") +
    (b.note && b.state !== "running" ? '<div class="note">' + esc(b.note) + "</div>" : "");
  box.querySelector(".goal").textContent = b.goal;
  box.querySelector(".goal").title = b.goal;
}
function toolCard(name, args, result) {
  const d = document.createElement("details");
  d.className = "tool" + (result === undefined ? " run" : "");
  const [verb, arg] = label(name, args);
  d.innerHTML = "<summary><b>" + esc(verb) + "</b> <span class=arg>" + esc(arg.slice(0, 160)) + "</span></summary><pre></pre>";
  d.title = name + " " + (args || "");
  if (result !== undefined) d.querySelector("pre").innerHTML = ansi(result);
  return add(d);
}

// The status bar under the transcript, Claude Code style: what, how much, how long.
const SPIN = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
let spinFrame = 0;
const clock = (ms) => { const s = Math.floor(ms / 1000); return s < 60 ? s + "s" : Math.floor(s / 60) + "m" + String(s % 60).padStart(2, "0") + "s"; };
function activity(a) { act = a && Object.assign({ at: Date.now(), elapsedMs: 0 }, a); drawActivity(); }
function drawActivity() {
  const bar = $("activity");
  bar.classList.toggle("on", !!(busy && act));
  if (!busy || !act) return;
  drawAlien(act);
  const ms = act.elapsedMs + Date.now() - act.at;
  const meta = [];
  if (act.lines > 1) meta.push(act.lines + " lines");
  if (act.tokens && act.phase !== "waiting") { meta.push(act.tokens + " tokens"); if (act.generatingMs >= 2000) meta.push((act.tokens / (act.generatingMs / 1000)).toFixed(1) + " tok/s"); }
  meta.push(clock(ms));
  $("actSpin").textContent = SPIN[spinFrame++ % SPIN.length];
  $("actWhat").textContent = act.title || "Working";
  $("actMeta").textContent = meta.join(" · ");
  $("actTail").textContent = act.tail || "";
}
setInterval(drawActivity, 100);

function progress(m) {
  if (m.phase !== "thinking" && thinkCard) {
    thinkCard.querySelector("summary").textContent = "Thought for " + clock(thinkCard.ms);
    thinkCard = null;
  }
  if (m.phase === "waiting") abandonWriting();
  if (m.phase === "done") return activity({ title: "Working" });
  const tail = (m.preview || "").split("\\n").filter((l) => l.trim()).pop() || "";
  activity({ phase: m.phase, tool: m.tool && m.tool.name, title: m.title, tokens: m.tokens, elapsedMs: m.elapsedMs, generatingMs: m.generatingMs || 0, lines: m.lines, tail: m.phase === "tool" ? "" : tail.trim().slice(-160) });
  if (m.phase === "thinking") {
    if (!thinkCard) { streaming = null; thinkCard = add(document.createElement("details")); thinkCard.className = "think"; thinkCard.innerHTML = "<summary></summary><pre></pre>"; }
    thinkCard.ms = m.elapsedMs;
    thinkCard.querySelector("summary").textContent = "Thinking… " + m.tokens + " tokens";
    const pre = thinkCard.querySelector("pre"); pre.textContent = m.preview; pre.scrollTop = pre.scrollHeight;
  }
  if (m.phase === "tool" && m.tool) {
    let d = writing[m.tool.index];
    if (!d) {
      streaming = null;
      d = writing[m.tool.index] = add(document.createElement("details"));
      d.className = "tool run live"; d.open = !fold.live; d.auto = true;
      d.innerHTML = "<summary><b></b> <span class=arg></span><span class=meta></span></summary><pre></pre>";
      // Opening or closing a card while its code is being written sets how the next ones start.
      d.querySelector("summary").addEventListener("click", () => setTimeout(() => { if (d.classList.contains("live")) setFold("live", !d.open); }, 0));
    }
    const [verb, ...rest] = m.title.split(" ");
    d.tool = m.tool.name;
    d.querySelector("b").textContent = verb;
    d.querySelector(".arg").textContent = rest.join(" ").slice(0, 160);
    d.querySelector(".meta").textContent = (m.lines > 1 ? m.lines + " lines · " : "") + m.tokens + " tokens · " + clock(m.elapsedMs);
    const pre = d.querySelector("pre"); const stick = pre.scrollHeight - pre.scrollTop - pre.clientHeight < 40;
    pre.textContent = m.preview; if (stick) pre.scrollTop = pre.scrollHeight;
    const log = $("log"); if (log.scrollHeight - log.scrollTop - log.clientHeight < 200) log.scrollTop = log.scrollHeight;
  }
}
// Calls that were written but never ran (bad arguments, or the turn stopped).
function abandonWriting() {
  for (const d of writing) if (d) { d.classList.remove("run", "live"); d.classList.add("skipped"); d.querySelector(".meta").textContent = "not run"; }
  writing = [];
}

function on(m) {
  stage.on(m);
  voice.on(m);
  connectUI.on(m);
  soundLab.on(m);
  musicTab.on(m);
  switch (m.type) {
    case "state": return render(m);
    case "progress": return progress(m);
    case "token":
      if (!streaming) streaming = add(div("msg")), streaming.raw = "";
      streaming.raw += m.text;
      paintReply(streaming, streaming.raw, chatMode());
      return;
    case "toolStart": {
      streaming = null;
      // A question gets its own card (below), not a tool card.
      if (m.name === "ask_user") { writing.forEach((d) => d && d.remove()); writing = []; live = null; return; }
      const [verb, arg] = label(m.name, m.args);
      activity({ title: verb + " " + arg.slice(0, 80), tool: m.name });
      // The card that showed the call being written becomes the card that runs it.
      let i = writing.findIndex((d) => d && d.tool === m.name);
      if (i < 0) i = writing.findIndex(Boolean);
      if (i < 0) { live = toolCard(m.name, m.args); return; }
      live = writing[i]; writing[i] = undefined;
      if (!writing.some(Boolean)) writing = [];
      live.classList.remove("live");
      live.querySelector("b").textContent = verb;
      live.querySelector(".arg").textContent = arg.slice(0, 160);
      live.title = m.name + " " + (m.args || "");
      return;
    }
    case "toolEnd":
      if (m.name === "ask_user") return;
      if (live) {
        live.classList.remove("run");
        if (m.name === "check") live.classList.add("check"), live.classList.toggle("bad", /^error: |^exit code: (?!0\\b)/m.test(m.result));
        const meta = live.querySelector(".meta"); if (meta) meta.textContent = "";
        live.querySelector("pre").innerHTML = ansi(m.result);
        if (live.auto) live.open = false;
        live = null;
      }
      activity({ title: "Working" });
      return;
    case "note": return note(m.text);
    case "modelsRefreshed": {
      const b = $("modelRefresh"); b.disabled = false; b.classList.remove("spin");
      b.textContent = m.ok ? "✓" : "⚠";
      b.title = m.ok ? m.count + " models listed" + (m.loaded.length ? "; loaded: " + m.loaded.join(", ") : "; the server does not say which is loaded") : "No answer from " + m.baseURL + ". Is the model server running?";
      setTimeout(() => { b.textContent = "⟳"; }, 1500);
      if (!m.ok) note("No answer from " + m.baseURL + " when refreshing the models. Is the model server running?");
      return;
    }
    case "retract": {
      // What just streamed was the model's thinking or a reply cut short: fold it away, Maxx asks again.
      if (!streaming) return;
      streaming.replaceWith(retracted(m.why, streaming.raw || ""));
      streaming = null;
      return;
    }
    case "learned": {
      note(m.text, "learned");
      return toast("📏 " + m.rule.text, "Undo", () => send({ type: "forgetRule", text: m.rule.text }));
    }
    case "plan": return drawPlan(m.steps);
    case "board": return drawBoard(m.board);
    case "lab": return onStudy(m.study, m.viewing);
    case "capture": return labCapture(m);
    case "instruments": onInstrumentsForWatch(m); return drawInstruments(m);
    case "simLab": return onSimLab(m);
    case "simRuns": return onSimRuns(m);
    case "watch": return onWatch(m.watch);
    case "escalation":
      helperLive = m.active ? m.model : null;
      $("activity").classList.toggle("helper", !!helperLive);
      add(div("mark" + (m.active ? " up" : ""), (m.active ? "🧠 " : "↩ ") + m.text));
      activity({ title: m.active ? m.model + " is on it" : "Working" });
      return;
    case "image": return stage.shot(m.images[m.images.length - 1], m.tool);
    case "ask": return askCard(m);
    case "askDone": return askClosed(m.id, m.why === "auto" ? "Allowed by ⚡ auto-run" : m.answer === "yes" ? "Allowed" : m.answer === "always" ? "Always allowed" : m.stopped ? "Stopped" : "Denied");
    case "question": return questionCard(m);
    case "questionDone": return questionDone(m);
    case "busy":
      busy = m.busy; $("stopBtn").disabled = !busy; $("sendBtn").disabled = busy; if (busy) $("undoBtn").disabled = true;
      $("rgo").disabled = busy; $("rstop").disabled = !busy;
      if (!busy) { helperLive = null; $("activity").classList.remove("helper"); }
      if (!busy) { streaming = null; thinkCard = null; abandonWriting(); for (const id of [...askCards.keys()]) askClosed(id, "Stopped"); }
      if (busy) alienTurn();
      activity(busy ? { title: "Starting" } : null);
      return;
    case "done": streaming = null; return;
    case "templated": return templated(m);
    case "recipe": return note("📜 Saved recipe \u201c" + m.name + "\u201d (" + m.when + ") to " + m.path + ". Maxx will offer it for similar tasks; edit the file to tune it.", "learned");
    case "error":
      if (m.text !== "(stopped)") showError(m.text);
      return note(m.text, "msg err");
    case "deleted":
      return toast("Deleted “" + (m.title || "session") + "”", "Undo", () => send({ type: "undelete", cwd: m.cwd, session: m.session, reopen: m.wasOpen }));
  }
}

let toastTimer = 0;
function toast(text, action, fn) {
  $("toastText").textContent = text;
  $("toastBtn").textContent = action;
  $("toastBtn").onclick = () => { $("toast").classList.remove("on"); fn(); };
  $("toast").classList.add("on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("toast").classList.remove("on"), 10000);
}

// Deleting asks once, right in the row, then offers Undo for ten seconds.
function confirmDelete(row, cwd, ss) {
  row.className = "sess confirm";
  row.onclick = (e) => e.stopPropagation();
  row.innerHTML = "<span>Delete “" + esc(ss.title) + "”?</span>";
  const yes = document.createElement("button"); yes.className = "danger"; yes.textContent = "Delete";
  const no = document.createElement("button"); no.textContent = "Keep";
  const cancel = () => state && render(state);
  yes.onclick = () => send({ type: "delete", cwd, session: ss.id, title: ss.title });
  no.onclick = cancel;
  const box = document.createElement("span"); box.style.cssText = "display:flex;gap:4px;flex:none"; box.append(yes, no);
  row.appendChild(box);
  yes.focus();
  row.onkeydown = (e) => { if (e.key === "Escape") cancel(); };
}

// Attachments: dropped, pasted or picked files, uploaded right away and sent with the message.
// Images are shrunk in the browser first (it can decode webp, gif, bmp...) and arrive as JPEG.
let files = [];
const TEXTISH = /\\.(txt|md|markdown|json|jsonc|ya?ml|toml|ini|cfg|conf|env|csv|tsv|log|xml|html?|css|scss|less|svg|js|mjs|cjs|jsx|ts|tsx|py|rb|go|rs|java|kt|kts|gradle|swift|c|h|cc|cpp|hpp|cs|php|lua|sh|bash|zsh|ps1|bat|cmd|sql|vue|svelte|dart|r|pl|ex|exs|hs|ml|clj|scala|groovy|properties|lock|gitignore|dockerfile|makefile)$/i;
function kindOf(f) {
  if (/^image\\//.test(f.type) && !/svg/.test(f.type)) return "image";
  if (/^text\\/|json|xml|javascript|typescript|yaml|toml|x-sh/.test(f.type) || TEXTISH.test(f.name) || /^(Dockerfile|Makefile|README|LICENSE)$/i.test(f.name)) return "text";
  return "other";
}
const fsize = (n) => n < 1024 ? n + " B" : n < 1048576 ? (n / 1024).toFixed(0) + " KB" : (n / 1048576).toFixed(1) + " MB";
async function toJpeg(f, side) {
  try {
    const bmp = await createImageBitmap(f);
    const k = Math.min(1, side / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas"); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    const g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.drawImage(bmp, 0, 0, c.width, c.height);
    return await new Promise((res) => c.toBlob(res, "image/jpeg", 0.88));
  } catch { return null; }
}
function attach(list) {
  if (!state || !state.current) return note("Open a project folder first, then attach files.", "msg err");
  for (const f of list) {
    if (f.size > state.maxUpload) { note(f.name + " is too big to attach (" + fsize(f.size) + "; the limit is " + fsize(state.maxUpload) + ").", "msg err"); continue; }
    // Pasted screenshots have no useful name.
    const name = f.name && f.name !== "image.png" ? f.name : "pasted-" + new Date().toTimeString().slice(0, 8).replace(/:/g, "") + ".png";
    const it = { raw: f, name, size: f.size, kind: kindOf(f) };
    it.mode = it.kind === "other" ? "save" : "attach";
    files.push(it);
    it.p = (async () => {
      if (it.kind === "image") {
        it.small = await toJpeg(f, state.imageSide || 1024);
        if (it.small) it.thumb = URL.createObjectURL(it.small);
        else it.kind = "other", it.mode = "save";
      }
      await upload(it);
    })();
  }
  drawFiles();
}
// Images go to the model as a small JPEG; saved into the project, they keep the original file.
async function upload(it) {
  if (it.id) send({ type: "discard", ids: [it.id] });
  const small = it.kind === "image" && it.mode === "attach" && it.small;
  const body = small || it.raw, name = small ? it.name.replace(/\\.[^.]+$/, "") + ".jpg" : it.name;
  it.id = null; it.status = "up"; it.size = body.size; drawFiles();
  try {
    const r = await fetch("/upload?t=" + token + "&name=" + encodeURIComponent(name), { method: "POST", body, headers: { "content-type": body.type || "application/octet-stream" } });
    const j = await r.json();
    if (j.error) throw new Error(j.error);
    it.id = j.id; it.status = "ok";
  } catch (e) { it.status = "bad"; it.err = e.message; }
  drawFiles();
}
const HOW = { attach: { image: "👁 Show to Maxx", text: "📄 Add to context" }, save: "💾 Save to project" };
function drawFiles() {
  const box = $("files"); box.innerHTML = "";
  for (const it of files) {
    const d = div("file" + (it.status === "up" ? " up" : it.status === "bad" ? " bad" : ""));
    d.title = it.status === "bad" ? "Upload failed: " + it.err : it.name;
    d.innerHTML = (it.thumb ? '<img alt="" src="' + it.thumb + '">' : "<span>" + (it.kind === "text" ? "📄" : it.kind === "image" ? "🖼" : "📦") + "</span>") +
      '<span class="nm">' + esc(it.name) + '</span><span class="sz">' + fsize(it.size) + "</span>";
    const how = div("how" + (it.kind === "other" ? " fixed" : ""), it.mode === "save" ? HOW.save : HOW.attach[it.kind]);
    how.title = it.kind === "other" ? "Maxx can't read this kind of file, so it is copied into the project folder" : "Click to switch between giving it to Maxx and saving it into the project folder";
    if (it.kind !== "other") how.onclick = () => {
      it.mode = it.mode === "save" ? "attach" : "save";
      if (it.kind === "image") it.p = it.p.then(() => upload(it));
      drawFiles();
    };
    const rm = document.createElement("button"); rm.className = "rm"; rm.textContent = "×"; rm.title = "Remove";
    rm.onclick = () => { files = files.filter((x) => x !== it); it.p.then(() => it.id && send({ type: "discard", ids: [it.id] })); drawFiles(); };
    d.append(how, rm);
    box.appendChild(d);
  }
}
function attachedNames(names) {
  if (!names || !names.length) return null;
  const a = div("att");
  for (const n of names) { const s = document.createElement("span"); s.textContent = "📎 " + n; a.appendChild(s); }
  return a;
}
function userMsg(text, names) {
  const d = add(div("msg user", text));
  const a = attachedNames(names); if (a) d.appendChild(a);
  return d;
}

// A follow-up question: click a choice, or type an answer. Skip lets Maxx go with its guess.
const questionCards = new Map();
function questionCard(m) {
  streaming = null;
  activity({ title: "Waiting for your answer" });
  const d = add(div("qcard"));
  d.innerHTML = '<div class="q"></div><div class="choices"></div><div class="own"><input placeholder="Or type your own answer…"><button class="primary">Answer</button><button>Skip</button></div><div class="wait"></div>';
  d.querySelector(".q").textContent = m.question;
  const reply = (a) => send({ type: "reply", id: m.id, answer: a });
  for (const c of m.choices || []) {
    const b = document.createElement("button"); b.textContent = c;
    if (m.guess && c.toLowerCase() === m.guess.toLowerCase()) b.className = "guess";
    b.onclick = () => reply(c);
    d.querySelector(".choices").appendChild(b);
  }
  if (!(m.choices || []).length) d.querySelector(".choices").remove();
  const input = d.querySelector("input"), [ok, skip] = d.querySelectorAll(".own button");
  if (m.guess && !(m.choices || []).some((c) => c.toLowerCase() === m.guess.toLowerCase())) input.placeholder = "Your answer (Maxx would guess: " + m.guess + ")";
  ok.onclick = () => input.value.trim() && reply(input.value.trim());
  input.onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); ok.onclick(); } };
  skip.onclick = () => reply("");
  skip.title = m.guess ? "Let Maxx go with its guess: " + m.guess : "Let Maxx decide";
  // Agent mode doesn't wait for ever: show how long is left before the guess is used.
  const wait = d.querySelector(".wait");
  const tick = () => {
    if (!m.deadline) return wait.remove();
    const left = Math.max(0, m.deadline - Date.now());
    wait.textContent = "No answer in " + clock(left) + (m.guess ? " and Maxx goes with “" + m.guess + "”" : " and Maxx decides itself") + ", so the run keeps going while you're away.";
  };
  tick(); d.timer = m.deadline ? setInterval(tick, 1000) : 0;
  questionCards.set(m.id, d);
  setTimeout(() => input.focus(), 0);
  if (document.hidden && "Notification" in window && Notification.permission === "granted") new Notification("Maxx has a question", { body: m.question });
}
function questionDone(m) {
  const d = questionCards.get(m.id);
  if (!d) return;
  questionCards.delete(m.id); clearInterval(d.timer);
  d.classList.add("answered");
  d.querySelectorAll(".choices, .own, .wait").forEach((e) => e.remove());
  const a = div("a"); d.appendChild(a);
  a.innerHTML = m.answer ? "<b>You:</b> " : "<b>" + (m.timedOut ? "No answer in time; Maxx went with its guess." : "Skipped; Maxx decides.") + "</b>";
  if (m.answer) a.appendChild(document.createTextNode(m.answer));
  activity({ title: "Working" });
}
function answeredCard(question, result) {
  const d = add(div("qcard answered"));
  d.innerHTML = '<div class="q"></div><div class="a"></div>';
  d.querySelector(".q").textContent = question;
  const m = result.match(/^The user answered: ([\\s\\S]*)$/);
  d.querySelector(".a").innerHTML = m ? "<b>You:</b> " : "<b>" + esc(result.split(".")[0]) + ".</b>";
  if (m) d.querySelector(".a").appendChild(document.createTextNode(m[1]));
}

// Steps waiting for the user's OK, by id. Each card sits in the dock above the message box while it waits,
// then goes back into the transcript where it was asked.
const askCards = new Map();
const baseTitle = document.title;
function askCard(m) {
  streaming = null;
  activity({ title: "Waiting for your OK" });
  const slot = add(div("askslot"));
  const d = div("ask");
  d.dataset.id = m.id;
  d.innerHTML = '<div class="q">' + esc(m.question) + "</div>" + (m.preview ? "<pre>" + ansi(m.preview) + "</pre>" : "") +
    '<div class="btns"><button class="primary" data-a="yes">Allow<kbd>Y</kbd></button><button data-a="always">Always allow<kbd>A</kbd></button><button class="danger" data-a="no">Deny<kbd>N</kbd></button>' +
    (state && state.current && state.current.mode === "yolo" ? "" : '<button class="auto" data-a="auto" title="Allow this, and stop asking: edits and commands run on their own from now on. Risky ones (git push, sudo, deleting a whole drive) still ask. Switch it off with ⚡ Auto next to the message box.">⚡ Allow &amp; auto-run</button>') +
    '<span class="hint">Maxx is paused until you answer</span></div>' +
    '<div class="why"><input placeholder="Why not? (optional: Maxx reads it and learns a rule; Enter denies)" autocomplete="off"></div>';
  const why = d.querySelector(".why input");
  const answer = (a) => {
    if (!askCards.has(m.id)) return;
    const reason = a === "no" ? why.value.trim() : "";
    send({ type: "answer", id: m.id, answer: a === "auto" ? "yes" : a, why: reason });
    if (a === "auto") send({ type: "settings", mode: "yolo" });
    askClosed(m.id, a === "no" ? "Denied" + (reason ? ": " + reason : "") : a === "always" ? "Always allowed" : a === "auto" ? "Allowed, and ⚡ auto-run is on" : "Allowed");
  };
  d.answer = answer;
  d.askSlot = slot;
  d.querySelectorAll("button").forEach((b) => b.onclick = () => answer(b.dataset.a));
  why.onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); answer("no"); } };
  askCards.set(m.id, d);
  $("okdock").appendChild(d);
  drawDock();
  // Put the keyboard on the card (not on a button, so a stray Enter can't allow anything): Y / A / N answer
  // right away, and Tab goes straight to Allow. Leave it alone while the user is typing something.
  const ae = document.activeElement, typing = ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName) && ae.value;
  if (!typing && askCards.size === 1) { d.tabIndex = -1; d.focus({ preventScroll: true }); }
  if (document.hidden && "Notification" in window && Notification.permission === "granted") new Notification("Maxx needs your OK", { body: m.question });
}
// The step stopped waiting: answered here, in another window, or cancelled by Stop.
function askClosed(id, label) {
  const d = askCards.get(id);
  if (!d) return;
  askCards.delete(id);
  d.classList.add("answered");
  d.querySelector(".btns").textContent = label;
  const w = d.querySelector(".why"); if (w) w.remove();
  d.askSlot.replaceWith(d);
  drawDock();
  if (!askCards.size && busy) activity({ title: "Working" });
}
function drawDock() {
  const dock = $("okdock"), n = askCards.size;
  dock.querySelectorAll(".more").forEach((e) => e.remove());
  if (n > 1) dock.appendChild(div("more", n + " steps are waiting for your OK; Y / A / N answers the top one."));
  dock.classList.toggle("on", n > 0);
  $("activity").classList.toggle("asking", n > 0);
  document.title = n ? "⏳ OK? · " + baseTitle : baseTitle;
}
$("activity").addEventListener("click", () => { const d = askCards.values().next().value; if (d) d.querySelector("button").focus(); });
document.addEventListener("keydown", (e) => {
  if (!askCards.size || e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
  const t = e.target, typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
  if (typing || document.querySelector("dialog[open]")) return;
  const a = { y: "yes", a: "always", n: "no" }[e.key.toLowerCase()];
  if (!a) return;
  e.preventDefault();
  askCards.values().next().value.answer(a);
});

${STAGE_JS}
${VOICE_JS}
${VIS_JS}
${SOUND_JS}
${MUSIC_JS}
${ALIEN_JS}
${SKIN_JS}
${CONNECT_JS}

function render(s) {
  state = s;
  const cur = s.current;
  $("pickRow").style.display = s.platform === "win32" ? "flex" : "none";
  // Sidebar
  document.body.classList.toggle("chat", !!(cur && cur.chat));
  document.body.classList.toggle("noproj", !cur);
  const cn = $("chatnav"); cn.querySelectorAll(".sess").forEach((x) => x.remove());
  $("chatBtn").classList.toggle("on", !!(cur && cur.chat));
  for (const ss of (s.chat && s.chat.sessions) || []) cn.appendChild(sessRow(s.chat.cwd, ss, cur));
  const p = $("projects"); p.innerHTML = "";
  if (!s.projects.length) p.appendChild(div("status", "No sessions yet. Open a folder to start."));
  for (const proj of s.projects) {
    const box = div("proj");
    const name = proj.cwd.split(/[\\\\/]/).filter(Boolean).pop() || proj.cwd;
    const n = div("name", name); n.title = "Open " + proj.cwd; n.onclick = () => send({ type: "open", cwd: proj.cwd });
    box.append(n, div("path", proj.cwd));
    for (const ss of proj.sessions) box.appendChild(sessRow(proj.cwd, ss, cur));
    p.appendChild(box);
  }
  // Header
  const sel = $("model"); sel.innerHTML = "";
  // The session's model (or $MAXX_MODEL before one is open) is shown even when the server lists it under another name.
  const want = cur ? cur.model : s.defaultModel;
  const loaded = s.loadedModels || [];
  const models = want && !s.models.includes(want) ? [want, ...s.models] : s.models;
  if (!models.length) sel.innerHTML = "<option>No model: start LM Studio's server</option>";
  // ● marks what the server has in memory; a model it no longer lists says so, instead of passing for a real choice.
  for (const id of models) {
    const o = document.createElement("option"); o.value = id;
    o.textContent = (loaded.includes(id) ? "● " : "") + id + (s.modelsOk && s.models.length && !s.models.includes(id) ? "  (not on the server)" : "");
    if (want === id) o.selected = true; sel.appendChild(o);
  }
  sel.title = "Model" + (want ? ": " + want : "") + (loaded.length ? "\\nLoaded on the server: " + loaded.join(", ") : "") + (cur ? "" : "\\nA new session starts on the one shown.");
  if (cur && !cur.chat) $("where").innerHTML = "<b>" + esc(cur.cwd.split(/[\\\\/]/).filter(Boolean).pop() || cur.cwd) + "</b><small>\u200e" + esc(cur.cwd) + "\u200e</small>";
  else $("where").innerHTML = "<b>" + (cur ? "💬 Chat" : "No project open") + "</b>";
  $("aside").classList.toggle("adding", !s.projects.length || openWanted);
  $("where").title = cur ? (cur.chat ? "No project: just ask. Charts and diagrams are drawn right here, and with 🌐 Network on Maxx can look things up on the web." : cur.cwd) : "";
  $("input").placeholder = cur && cur.chat ? "Ask anything. Try \u201cchart my monthly budget\u201d or \u201cdraw how a bill becomes a law\u201d  (Enter to send, Shift+Enter for a new line)" : PROJECT_HINT;
  if (cur) $("mode").value = cur.mode;
  drawAuto(cur && cur.mode);
  // 🧰 Tools menu: one switch per toolset, and what the model can really use right now (so nobody has to ask it).
  const sets = $("sets"); sets.innerHTML = "";
  const onSets = cur ? cur.toolsets : [];
  for (const t of s.toolsets) {
    const on = onSets.includes(t.name), [ic, nm] = TOOLSET_NAME[t.name] || ["🧩", t.name];
    const row = div("tset");
    row.innerHTML = '<span class="ic">' + ic + '</span><span class="pl" style="flex:1;min-width:0;display:flex;flex-direction:column"><b style="font-size:13px">' + esc(nm) + '</b><span style="color:var(--mute);font-size:12px;line-height:1.35">' + esc(t.about) + '</span></span><button class="switch' + (on ? " on" : "") + '" role="switch" aria-checked="' + on + '" aria-label="' + esc(nm) + '"><i></i></button>';
    row.onclick = () => { if (!cur) return; send({ type: "settings", toolsets: on ? cur.toolsets.filter((x) => x !== t.name) : [...cur.toolsets, t.name] }); };
    sets.appendChild(row);
  }
  const tl = (cur && cur.tools) || [];
  $("toolCount").textContent = "🧰 " + tl.length + " tools ready" + (onSets.length ? " · " + onSets.length + " toolset" + (onSets.length > 1 ? "s" : "") + " on" : "");
  $("toolCount").title = tl.join(", ");
  $("toolsBtn").innerHTML = '🧰<span class="lbl"> Tools</span>' + (onSets.length ? ' <span class="n">' + onSets.length + "</span>" : "");
  $("toolsBtn").title = "Toolsets: extra tools Maxx can use in this project. " + tl.length + " tools ready now" + (onSets.length ? " (" + onSets.join(", ") + ")" : "");
  connectUI.render(s);
  drawPlan(cur && cur.plan);
  drawBoard(cur && cur.board);
  if (cur && cur.lab) { lastStudy = cur.lab; drawLab(lastStudy); drawPane(); }
  else if (!(cur && cur.research)) { lastStudy = null; drawLab(null); drawPane(); }
  drawAgent();
  drawResearch();
  // ⚙ Settings menu
  const nb = $("netBtn");
  nb.classList.toggle("on", !!s.network); nb.setAttribute("aria-checked", String(!!s.network));
  segment("briefSeg", Object.keys(BREVITY_LABEL), s.brevity || "brief", (k) => BREVITY_LABEL[k].replace(/^\S+\s/, ""), (k) => send({ type: "brevity", level: k }));
  const tl2 = s.thinking || "auto";
  segment("thinkSeg", Object.keys(THINKING_LABEL), tl2, (k) => k, (k) => send({ type: "thinking", level: k }));
  $("thinkSay").textContent = "How long a reasoning model thinks before it acts";
  $("thinkSeg").querySelectorAll("button").forEach((b) => { b.title = THINKING_SAY[b.textContent] || ""; });
  $("thinkSeg").title = "Now: " + (THINKING_SAY[tl2] || "");
  const pb = $("palBtn"), pal = s.palette;
  pb.innerHTML = pal ? swatchHtml(pal.colors.slice(0, 6), "sw") + esc(pal.name) : "Auto · pick";
  const rb = $("rulesBtn"), rules = (cur && cur.rules) || [];
  rb.textContent = "Edit" + (rules.length ? " (" + rules.length + ")" : "");
  $("rulesSay").textContent = (rules.length ? rules.length + " rule" + (rules.length > 1 ? "s" : "") + " in MAXX.md" : "No rules yet") + (s.learn ? "; learns when you correct Maxx" : "; learning is off");
  $("undoBtn").disabled = !(cur && cur.canUndo) || !!(cur && cur.busy);
  const hs = s.helper;
  const helperOn = hs && !hs.off && hs.model;
  $("helperBtn").textContent = helperOn ? "Change" : "Set up";
  $("helperSay").textContent = helperOn ? "On: " + hs.model + ", called when the local model is stuck" : "Off. A bigger model Maxx calls when the local one is stuck";
  // The Settings button shows what is switched on that matters most: the internet, and a helper that may send the conversation out.
  $("tuneInd").textContent = (s.network ? "🌐" : "") + (helperOn ? "🧠" : "");
  $("tuneBtn").title = "Settings: permissions, network" + (s.network ? " (on)" : " (off)") + ", replies, thinking, colors, rules and the helper model";
  busy = !!(cur && cur.busy);
  $("stopBtn").disabled = !busy; $("sendBtn").disabled = busy;
  // Transcript, redrawn from the agent's history whenever a turn ends or a session opens
  if (!busy) {
    const log = $("log"); log.innerHTML = ""; live = null; streaming = null; writing = []; thinkCard = null;
    if (!cur) { log.innerHTML = '<div class="empty"><h2>Pick a project</h2>Open a folder on the left, or choose one of your recent sessions. Everything runs on this machine against LM Studio.</div>'; $("log").querySelector(".empty").appendChild(chatStart()); return; }
    if (!cur.history.length && cur.chat) log.appendChild(chatEmpty());
    else if (!cur.history.length && cur.research) log.innerHTML = '<div class="empty">Approvals and notes from a running study show up here.</div>';
    else if (!cur.history.length) log.innerHTML = '<div class="empty"><h2>' + esc(cur.cwd.split(/[\\\\/]/).filter(Boolean).pop() || "") + '</h2>Ask for something: "make a tip calculator app and test it on my phone", "why does the build fail?"</div>';
    if (!cur.history.length && !cur.chat && !cur.research && s.templates) $("log").querySelector(".empty").appendChild(starters(s.templates));
    const results = cur.history.filter((h) => h.role === "tool").map((h) => h.text);
    let ri = 0;
    for (const h of cur.history) {
      if (h.role === "mark" && h.retracted) add(retracted(h.retracted.why, h.retracted.text));
      else if (h.role === "mark") add(h.learned ? div("msg learned", h.text) : div("mark" + (h.active ? " up" : ""), (h.active ? "🧠 " : "↩ ") + h.text));
      else if (h.role === "user") userMsg(h.text, h.files);
      else if (h.role === "note") note(h.text.split("\\n")[0]);
      else if (h.role === "assistant") {
        if (h.text) paintReply(add(div("msg")), h.text, cur.chat);
        for (const t of h.tools || []) {
          const r = results[ri++] ?? "";
          if (t.name !== "ask_user") { toolCard(t.name, t.args, r); continue; }
          let a = {}; try { a = JSON.parse(t.args || "{}"); } catch {}
          answeredCard(String(a.question || ""), r);
        }
      }
    }
    $("log").scrollTop = $("log").scrollHeight;
  }
}

const PROJECT_HINT = $("input").placeholder;
const chatMode = () => !!(state && state.current && state.current.chat);
function sessRow(cwd, ss, cur) {
  const r = div("sess" + (cur && cur.session === ss.id ? " on" : ""));
  r.innerHTML = "<span>" + esc(ss.title) + "</span><span class=when>" + ago(ss.updated) + "</span>";
  r.title = ss.turns + " turns" + (ss.toolsets.length ? " · " + ss.toolsets.join(", ") : "");
  r.onclick = () => send({ type: "open", cwd, session: ss.id });
  const x = document.createElement("button"); x.className = "x"; x.textContent = "×"; x.title = "Delete this session";
  x.onclick = (e) => { e.stopPropagation(); confirmDelete(r, cwd, ss); };
  r.appendChild(x);
  return r;
}
function chatStart() {
  const b = document.createElement("button"); b.className = "primary"; b.style.marginTop = "14px";
  b.textContent = "💬 Or just chat"; b.onclick = () => send({ type: "chat" });
  return b;
}
// Chat mode's empty screen: a few things worth asking, each showing off a kind of visual.
const CHAT_IDEAS = [
  ["📊", "Chart my monthly budget: rent 1200, food 450, transport 180, fun 220, savings 400"],
  ["🧭", "Draw a flowchart for deciding whether to repair or replace an old laptop"],
  ["🧠", "Make a mind map of ideas for a weekend trip"],
  ["🕹", "Make an interactive tip calculator I can use right here"],
  ["🪐", "Compare the planets by diameter in a bar chart"],
  ["🗓", "Plan a 4-week learn-to-run schedule as a Gantt chart"],
];
function chatEmpty() {
  const e = div("empty");
  e.style.maxWidth = "760px";
  e.innerHTML = "<h2>💬 Chat</h2>Everyday questions, no project needed. Maxx draws charts, diagrams and small interactive tools right in the conversation, all on this machine.";
  const box = div("starters");
  for (const [icon, text] of CHAT_IDEAS) {
    const b = document.createElement("button"); b.className = "starter";
    b.innerHTML = '<span class="icon">' + icon + "</span><span>" + esc(text) + "</span>";
    b.onclick = () => { $("input").value = text; submit(); };
    box.appendChild(b);
  }
  e.appendChild(box);
  return e;
}

// New sessions offer starter projects: a small model does far better changing
// a project that already builds than writing one from nothing.
function starters(list) {
  const box = div("starters");
  box.prepend(div("status", "Or start from a template that already works:"));
  box.firstChild.style.gridColumn = "1 / -1";
  for (const t of list) {
    const b = document.createElement("button");
    b.className = "starter";
    b.innerHTML = '<span class="icon">' + esc(t.icon) + "</span><b>" + esc(t.name) + "</b><span>" + esc(t.about) + "</span>";
    b.onclick = () => { box.querySelectorAll("button").forEach((x) => x.disabled = true); send({ type: "template", id: t.id }); };
    box.appendChild(b);
  }
  return box;
}
function templated(m) {
  const e = document.querySelector("#log .empty") || add(div("empty"));
  e.innerHTML = "<h2>✓ " + esc(m.name) + " is ready</h2>" + esc(m.files.length + " files in " + m.cwd) + ". It builds as it is, so ask Maxx to change it:";
  const ideas = div("ideas");
  for (const idea of m.try) {
    const c = div("chip", idea);
    c.onclick = () => { $("input").value = idea; $("input").focus(); };
    ideas.appendChild(c);
  }
  e.appendChild(ideas);
  $("input").focus();
}

async function submit() {
  const text = $("input").value.trim();
  if ((!text && !files.length) || busy) return;
  if (!state || !state.current) return note("Open a project folder first.", "msg err");
  const sending = files;
  $("sendBtn").disabled = true;
  await Promise.all(sending.map((f) => f.p));
  $("sendBtn").disabled = busy;
  const failed = sending.filter((f) => f.status !== "ok");
  if (failed.length) return note("Could not upload " + failed.map((f) => f.name).join(", ") + ". Remove it or attach it again.", "msg err");
  files = []; drawFiles();
  userMsg(text, sending.map((f) => f.name));
  $("input").value = "";
  send(Object.assign({ type: "send", text, files: sending.map((f) => ({ id: f.id, mode: f.mode })), agent: agentOn(), crew: crewOn() }, voice.flags()));
  if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
}

$("sendBtn").onclick = submit;
$("input").onkeydown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } };
$("stopBtn").onclick = () => send({ type: "stop" });
$("openBtn").onclick = () => { const v = $("folder").value.trim(); if (v) send({ type: "open", cwd: v }); };
$("folder").onkeydown = (e) => { if (e.key === "Enter") $("openBtn").onclick(); };
$("pickBtn").onclick = () => send({ type: "pick" });
$("newBtn").onclick = () => send({ type: "new" });
$("chatBtn").onclick = () => send({ type: "chat" });
// With no session open, the pick is saved and the next session starts on it.
$("model").onchange = (e) => state && send({ type: "settings", model: e.target.value });
$("modelRefresh").onclick = () => { const b = $("modelRefresh"); b.disabled = true; b.classList.add("spin"); send({ type: "models" }); };
$("mode").onchange = (e) => send({ type: "settings", mode: e.target.value });
// ⚡ Auto next to the message box: the quick switch between asking and auto-run.
// It works mid-turn, and a step already waiting for an OK goes through.
const AUTO_TIP = {
  ask: "Auto-run is off: Maxx asks before every edit and command. Click to let it run them on its own (risky ones like git push, sudo or deleting a whole drive still ask; ↶ Undo puts files back).",
  "auto-edit": "Edits run on their own, commands still ask. Click to auto-run commands too (risky ones still ask).",
  yolo: "⚡ Auto-run is on: edits and commands run without asking. Risky ones (git push, sudo, deleting a whole drive) still ask, and ↶ Undo puts files back. Click to go back to asking.",
};
function drawAuto(mode) {
  const b = $("autoBtn"), md = mode || "ask";
  b.classList.toggle("on", md === "yolo");
  b.classList.toggle("half", md === "auto-edit");
  b.textContent = md === "yolo" ? "⚡ Auto: on" : "⚡ Auto";
  b.title = AUTO_TIP[md] || AUTO_TIP.ask;
}
$("autoBtn").onclick = () => {
  const md = (state && state.current && state.current.mode) || "ask";
  send({ type: "settings", mode: md === "yolo" ? "ask" : "yolo" });
};
$("zoom").onclick = () => $("zoom").style.display = "none";
$("clipBtn").onclick = () => $("fileInput").click();
$("fileInput").onchange = (e) => { attach([...e.target.files]); e.target.value = ""; };
$("input").onpaste = (e) => { const fs = [...(e.clipboardData && e.clipboardData.files || [])]; if (fs.length) { e.preventDefault(); attach(fs); } };
let dragDepth = 0;
const hasFiles = (e) => e.dataTransfer && [...e.dataTransfer.types].includes("Files");
addEventListener("dragenter", (e) => { if (hasFiles(e)) { dragDepth++; $("drop").classList.add("on"); } });
addEventListener("dragleave", () => { if (--dragDepth <= 0) dragDepth = 0, $("drop").classList.remove("on"); });
addEventListener("dragover", (e) => { if (hasFiles(e)) e.preventDefault(); });
addEventListener("drop", (e) => { if (!hasFiles(e)) return; e.preventDefault(); dragDepth = 0; $("drop").classList.remove("on"); attach([...e.dataTransfer.files]); });
// Helper settings
function helperForm() {
  const h = (state && state.helper) || {};
  $("hKind").value = h.off || !h.kind ? "off" : h.kind;
  $("hModel").value = h.model || "";
  $("hUrl").value = h.baseURL || "";
  $("hKey").value = "";
  $("hAfter").value = h.afterFailures; $("hSteps").value = h.maxSteps; $("hTurn").value = h.maxPerTurn;
  helperFields();
  $("helperDlg").showModal();
}
function helperFields() {
  const h = (state && state.helper) || {}, k = $("hKind").value;
  $("hModelRow").style.display = k === "off" ? "none" : "";
  $("hNums").style.display = k === "off" ? "none" : "";
  $("hUrlRow").style.display = k === "openai" ? "" : "none";
  $("hKeyRow").style.display = k === "openai" || k === "anthropic" ? "" : "none";
  const ids = k === "anthropic" ? h.claudeModels || [] : k === "lmstudio" ? (state && state.models) || [] : [];
  $("hModels").innerHTML = ids.map((id) => '<option value="' + esc(id) + '">').join("");
  $("hModel").placeholder = k === "anthropic" ? "claude-opus-5-5" : k === "openai" ? "gpt-5" : "a bigger model you have downloaded";
  const fromEnv = k === "anthropic" ? h.envKey && h.envKey.anthropic : k === "openai" ? h.envKey && h.envKey.openai : false;
  $("hKey").placeholder = h.hasKey && h.kind === k ? "saved (leave blank to keep)" : fromEnv ? "using " + (k === "anthropic" ? "ANTHROPIC_API_KEY" : "OPENAI_API_KEY") + " from the environment" : "paste a key";
  $("hPrivacy").textContent = k === "off" ? "Nothing is sent anywhere." :
    k === "lmstudio" ? "Stays on this machine. LM Studio loads the bigger model when Maxx first asks for it, which can take a while on a laptop." :
    "When Maxx escalates, the conversation so far (files it read, command output) is sent to that API and billed to your key. Nothing is sent while the local model is doing fine.";
}
$("helperBtn").onclick = helperForm;
// Agent mode: a switch remembered in this browser, and its budgets in ~/.maxx/agent.json.
let agentMode = false;
try { agentMode = localStorage.getItem("maxx.agent") === "1"; } catch {}
let crewMode = false;
try { crewMode = localStorage.getItem("maxx.crew") === "1"; } catch {}
const crewOn = () => crewMode && !!(state && state.current && !state.current.chat);
const agentOn = () => agentMode && !crewMode && !!(state && state.current && !state.current.chat);
function drawAgent() {
  const on = agentOn(), crew = crewOn();
  $("agentBtn").classList.toggle("on", on);
  $("crewBtn").classList.toggle("on", crew);
  $("pairBtn").classList.toggle("on", !on && !crew);
  $("modeCfg").style.display = on || crew ? "" : "none";
  $("modeCfg").title = crew ? "Crew mode settings" : "Agent mode settings";
  document.body.classList.toggle("agent", on);
  document.body.classList.toggle("crew", crew);
  if (state && state.current && !state.current.chat) $("input").placeholder = crew ? "Give the crew a goal, e.g. \u201cbuild a weather app with a search page, a 5-day forecast and a settings page\u201d. Workers do its tasks at the same time." : on ? "Give Maxx a goal, e.g. \u201cbuild a tip calculator web app and check it works\u201d. It plans the tasks and works through them on its own." : PROJECT_HINT;
}
const remember = (k, v) => { try { localStorage.setItem(k, v ? "1" : "0"); } catch {} };
function setWorkMode(m) { agentMode = m === "agent"; crewMode = m === "crew"; remember("maxx.agent", agentMode); remember("maxx.crew", crewMode); drawAgent(); }
$("pairBtn").onclick = () => setWorkMode("pair");
$("agentBtn").onclick = () => setWorkMode("agent");
$("crewBtn").onclick = () => setWorkMode("crew");
$("modeCfg").onclick = () => (crewOn() ? $("crewCfg") : $("agentCfg")).click();
function crewForm(values) {
  const c = (state && state.crewMode) || {};
  const v = values || c.settings || {};
  $("cWorkers").value = v.workers; $("cTasks").value = v.maxTasks; $("cSlots").value = v.slots;
  $("cFinal").checked = v.finalCheck !== false;
  const picked = new Set(v.models || []);
  const all = [...new Set([...((state && state.models) || []), ...picked])];
  $("cModels").innerHTML = all.map((m) => '<label><input type="checkbox" value="' + esc(m) + '"' + (picked.has(m) ? " checked" : "") + "> " + esc(m) + "</label>").join("") || '<span class="hint">No models listed; start the LM Studio server.</span>';
  const p = Object.entries(c.probed || {});
  $("cHint").textContent = (p.length ? "Measured: " + p.map(([m, n]) => m + " answers " + n + " at once").join("; ") + ". " : "") +
    "LM Studio shares one model's context between the requests it runs at once, so load it with about workers \u00d7 the context one worker needs.";
}
$("crewCfg").onclick = () => { crewForm(); $("crewDlg").showModal(); };
$("crewForm").onsubmit = (e) => {
  const how = e.submitter && e.submitter.value;
  if (how === "reset") { e.preventDefault(); return crewForm((state && state.crewMode && state.crewMode.defaults) || {}); }
  if (how !== "save") return;
  const d = (state && state.crewMode && state.crewMode.defaults) || {}, out = {};
  for (const [id, k] of [["cWorkers", "workers"], ["cTasks", "maxTasks"], ["cSlots", "slots"]]) { const n = Number($(id).value); if ($(id).value !== "" && n !== d[k]) out[k] = n; }
  if ($("cFinal").checked !== (d.finalCheck !== false)) out.finalCheck = $("cFinal").checked;
  out.models = [...$("cModels").querySelectorAll("input:checked")].map((x) => x.value);
  const prev = (state && state.crewMode && state.crewMode.settings) || {};
  send({ type: "crewSettings", settings: out, reprobe: String(out.models) !== String(prev.models || []) });
};
const AGENT_FIELDS = { aTasks: "maxTasks", aSteps: "stepsPerTask", aTries: "tries", aMap: "mapTokens", aFixes: "judgeFixes", aWait: "askMinutes" };
function agentForm(values) {
  const a = (state && state.agentMode) || {};
  const v = values || a.settings || {};
  for (const [id, k] of Object.entries(AGENT_FIELDS)) $(id).value = v[k];
  $("aJudge").checked = !!v.judge;
  $("aBrief").checked = v.briefing !== false;
  const ctx = a.context ? Math.round(a.context / 1024) + "K" : "the";
  $("aHint").textContent = "Defaults follow the " + ctx + " context window (start Maxx with --context to change it), so a bigger model on a bigger machine gets more steps, tries and map." +
    (a.browser ? "" : " No Edge or Chrome found, so the judge can only check the phone.");
}
$("agentCfg").onclick = () => { agentForm(); $("agentDlg").showModal(); };
$("agentForm").onsubmit = (e) => {
  const how = e.submitter && e.submitter.value;
  if (how === "reset") { e.preventDefault(); return agentForm((state && state.agentMode && state.agentMode.defaults) || {}); }
  if (how !== "save") return;
  // Only what differs from the defaults is saved, so the rest keeps following the context window.
  const d = (state && state.agentMode && state.agentMode.defaults) || {}, out = {};
  for (const [id, k] of Object.entries(AGENT_FIELDS)) { const n = Number($(id).value); if ($(id).value !== "" && n !== d[k]) out[k] = n; }
  if ($("aJudge").checked !== !!d.judge) out.judge = $("aJudge").checked;
  if ($("aBrief").checked !== (d.briefing !== false)) out.briefing = $("aBrief").checked;
  send({ type: "agentSettings", settings: out });
};
${LAB_JS}
// The two header menus are native popovers: a click outside or Esc closes them. They open under their button.
const TOOLSET_NAME = { android: ["📱", "Android"], desktop: ["🖥", "Desktop"], browser: ["🧭", "Browser"], engineer: ["🛠", "Engineer"], studio: ["🎨", "Studio"], media: ["🎬", "Media"], director: ["✨", "Director"], repo: ["🐙", "Repo"], music: ["🎼", "Music"] };
function segment(id, keys, cur, label, pick) {
  const box = $(id); box.innerHTML = "";
  for (const k of keys) { const b = document.createElement("button"); b.textContent = label(k); b.className = k === cur ? "on" : ""; b.onclick = () => pick(k); box.appendChild(b); }
}
for (const [pop, btn] of [["toolsPop", "toolsBtn"], ["tunePop", "tuneBtn"]]) {
  $(pop).addEventListener("beforetoggle", (e) => {
    if (e.newState !== "open") return;
    const r = $(btn).getBoundingClientRect(), w = Math.min(440, innerWidth - 24);
    $(pop).style.top = r.bottom + 6 + "px";
    $(pop).style.left = Math.max(12, Math.min(r.right - w, innerWidth - w - 12)) + "px";
  });
}
// A button in the Settings menu that opens a dialog closes the menu first.
$("tunePop").addEventListener("click", (e) => { if (e.target.closest("#palBtn, #rulesBtn, #helperBtn, #agentCfg, #crewCfg")) $("tunePop").hidePopover(); }, true);
$("toolsList").onclick = () => {
  const cur = state && state.current, tl = (cur && cur.tools) || [];
  $("toolsPop").hidePopover();
  note("🧰 " + (cur && cur.chat ? "Chat mode" : "This project") + " has " + tl.length + " tools: " + (tl.join(", ") || "none") + (cur && cur.chat ? ". Open a project folder for files, commands, tests, git and the phone and desktop tools." : ". Switch on more toolsets in 🧰 Tools."));
};
let openWanted = false;
$("addProj").onclick = () => { openWanted = !$("aside").classList.contains("adding"); $("aside").classList.toggle("adding", openWanted); if (openWanted) $("folder").focus(); };
$("netBtn").onclick = () => {
  const on = !(state && state.network);
  if (on && !confirm("Let Maxx use the internet?\\n\\nIt can then look up things it isn't sure about (web search, library docs), install packages (pip, npm...) and download files. Searches go to DuckDuckGo and the MCP servers in ~/.maxx/mcp.json. With 'Ask before acting', every install still asks first.")) return;
  send({ type: "network", on });
};
$("hKind").onchange = helperFields;
$("helperForm").onsubmit = (e) => {
  if (e.submitter && e.submitter.value !== "save") return;
  const k = $("hKind").value;
  const prev = (state && state.helper) || {};
  send({ type: "helper", off: k === "off", kind: k === "off" ? prev.kind || "lmstudio" : k, model: k === "off" ? prev.model || "" : $("hModel").value,
    baseURL: $("hUrl").value, apiKey: $("hKey").value, afterFailures: $("hAfter").value, maxSteps: $("hSteps").value, maxPerTurn: $("hTurn").value });
};
$("palBtn").onclick = () => {
  const grid = $("palGrid"), cur = state && state.palette;
  grid.innerHTML = "";
  for (const p of (state && state.palettes) || []) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "pal" + (cur && cur.colors.join() === p.colors.join() ? " on" : "");
    b.title = p.colors.join(" ");
    b.innerHTML = swatchHtml(p.colors, "sw big") + '<span class="nm">' + esc(p.name) + '</span><span class="vb">' + esc(p.vibe) + "</span>";
    b.onclick = () => { send({ type: "palette", spec: p.name }); $("palDlg").close(); };
    grid.appendChild(b);
  }
  $("palSpec").value = cur && !(state.palettes || []).some((p) => p.name === cur.name) ? cur.colors.join(" ") : "";
  palPreview();
  $("palDlg").showModal();
};
// The rules dialog: edit in place, remove, add; Save sends the whole list.
let ruleDraft = [];
function drawRules() {
  const list = $("ruleList"); list.innerHTML = "";
  if (!ruleDraft.length) list.appendChild(div("none", "No rules yet. Correct Maxx when it gets something wrong and it writes one here."));
  ruleDraft.forEach((r, i) => {
    const row = div("rule");
    const x = div("x" + (r.times > 2 ? " strong" : ""), r.times > 1 ? "x" + r.times : "");
    x.title = r.times > 1 ? "You corrected this " + r.times + " times" : "";
    const inp = document.createElement("input"); inp.value = r.text; inp.oninput = () => { r.text = inp.value; };
    const del = document.createElement("button"); del.type = "button"; del.textContent = "✕"; del.title = "Remove this rule";
    del.onclick = () => { ruleDraft.splice(i, 1); drawRules(); };
    row.append(x, inp, del); list.appendChild(row);
  });
}
$("rulesBtn").onclick = () => {
  ruleDraft = (((state && state.current && state.current.rules) || [])).map((r) => ({ ...r }));
  $("learnOn").checked = !!(state && state.learn);
  $("ruleNew").value = "";
  drawRules();
  $("rulesDlg").showModal();
};
const addRuleDraft = () => { const t = $("ruleNew").value.trim(); if (!t) return; ruleDraft.push({ text: t, times: 1 }); $("ruleNew").value = ""; drawRules(); };
$("ruleAdd").onclick = addRuleDraft;
$("ruleNew").onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); addRuleDraft(); } };
$("rulesForm").onsubmit = (e) => {
  if (!e.submitter || e.submitter.value !== "save") return;
  if ($("ruleNew").value.trim()) addRuleDraft();
  send({ type: "rules", learn: $("learnOn").checked, rules: ruleDraft.filter((r) => r.text.trim()) });
};
$("undoBtn").onclick = () => send({ type: "undoTurn" });
$("recipeBtn").onclick = () => {
  const hint = prompt("Save the last task as a recipe. What is it for? (optional, e.g. \u201cadd a settings screen\u201d)", "");
  if (hint === null) return;
  note("📜 Writing a recipe from this session…");
  send({ type: "recordRecipe", hint });
};
function swatchHtml(colors, cls) { return '<span class="' + cls + '">' + colors.map((c) => '<i style="background:' + esc(c) + '"></i>').join("") + "</span>"; }
function palPreview() {
  const hexes = ($("palSpec").value.match(/#[0-9a-f]{6}\\b|#[0-9a-f]{3}\\b|\\b[0-9a-f]{6}\\b/gi) || []).map((h) => "#" + h.replace("#", ""));
  $("palPreview").innerHTML = hexes.length ? swatchHtml(hexes, "sw big").replace(/^<span class="sw big">|<\\/span>$/g, "") : "";
}
$("palSpec").oninput = palPreview;
$("palForm").onsubmit = (e) => {
  const how = e.submitter && e.submitter.value;
  if (how === "auto") send({ type: "palette", spec: "auto" });
  if (how === "random") send({ type: "palette", spec: "random" });
  if (how === "save") { if (!$("palSpec").value.trim()) return; send({ type: "palette", spec: $("palSpec").value }); }
};
$("palImgBtn").onclick = () => $("palFile").click();
$("palFile").onchange = async () => {
  const f = $("palFile").files[0]; $("palFile").value = "";
  if (!f) return;
  const img = new Image(), url = URL.createObjectURL(f);
  img.onload = () => {
    const colors = imagePalette(img);
    URL.revokeObjectURL(url);
    if (colors.length < 2) return alert("Couldn't find two different colors in that picture.");
    send({ type: "palette", name: (f.name.replace(/\\.[^.]+$/, "") || "image").slice(0, 30), colors });
    $("palDlg").close();
  };
  img.src = url;
};
// The picture's main colors, all in the browser: shrink it, count colors in
// coarse buckets, then keep the commonest ones that look different from each other.
function imagePalette(img, most = 6) {
  const n = 72, c = document.createElement("canvas");
  c.width = c.height = n;
  const g = c.getContext("2d"); g.drawImage(img, 0, 0, n, n);
  const px = g.getImageData(0, 0, n, n).data, buckets = new Map();
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] < 128) continue;
    const k = (px[i] >> 4) << 8 | (px[i + 1] >> 4) << 4 | px[i + 2] >> 4;
    const b = buckets.get(k) || { n: 0, r: 0, g: 0, b: 0 };
    b.n++; b.r += px[i]; b.g += px[i + 1]; b.b += px[i + 2]; buckets.set(k, b);
  }
  const all = [...buckets.values()].map((b) => [b.r / b.n, b.g / b.n, b.b / b.n, b.n]).sort((a, b) => b[3] - a[3]);
  const out = [];
  for (const col of all) {
    if (out.length >= most) break;
    if (out.every((o) => Math.hypot(o[0] - col[0], o[1] - col[1], o[2] - col[2]) > 60)) out.push(col);
  }
  const lum = (x) => 0.2126 * x[0] + 0.7152 * x[1] + 0.0722 * x[2];
  return out.sort((a, b) => lum(a) - lum(b)).map((x) => "#" + x.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, "0")).join(""));
}
connect();
</script>
</body>
</html>`;
