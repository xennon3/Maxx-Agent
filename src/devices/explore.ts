import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { center, contactSheet, decodePng, toShot, type Image, type Raw } from "../image.ts";
import { truncate } from "../context.ts";
import { sleep, type ReplayStep } from "./run.ts";
import * as A from "./adb.ts";

// android_explore: a tireless tester. It launches the app, taps every button
// on every screen it can reach (going back when a screen is used up), types a
// sample into text fields, and notes crashes (with the exact taps that lead to
// them, saved as a replay), taps that change nothing, and buttons that leave
// the app. No model calls per tap, so a small local model gets a whole test
// pass for the price of reading one report.

export type ExploreOptions = {
  pkg: string;
  steps?: number; // actions to spend, default 30
  settleMs?: number; // wait after each action, default 700
  sample?: string; // what to type into text fields
  bold?: boolean; // also press Delete / Buy / Log out and the like
  cwd?: string; // where crash replays are saved (.maxx/replays)
  launch: (pkg: string) => Promise<string | null>; // returns a crash log when launching crashed
  crashLog: (pkg: string) => Promise<string | null>;
  log?: (line: string) => void;
};

type El = { key: string; label: string; x: number; y: number; input: boolean };
type ScreenInfo = { n: number; title: string; els: El[]; tried: Set<string>; shot?: Raw };
export type Finding = { screen: number; label: string };
export type Crash = { steps: string[]; log: string; replay?: string };
export type ExploreReport = {
  pkg: string;
  actions: number;
  seconds: number;
  screens: ScreenInfo[];
  edges: { from: number; to: number; label: string; x: number; y: number }[];
  crashes: Crash[];
  dead: Finding[];
  left: (Finding & { to: string })[];
  skipped: Finding[];
  anr: string[];
  stoppedBecause: string;
};

export const RISKY = /\b(delete|remove|erase|clear all|reset|log ?out|sign ?out|uninstall|pay|buy|purchase|order|checkout|subscribe|send|call|dial|share|post|publish|report)\b/i;

const IME_HIDDEN = /mInputShown=false/;

// Screens are told apart by what you can press on them, not by their text,
// so a counter that goes from 1 to 2 doesn't make a "new screen".
export function signature(nodes: A.UiNode[]): string {
  const keys = nodes
    .filter((n) => n.clickable || n.scrollable)
    .map((n) => `${n.cls}#${n.id}${n.cls === "EditText" ? "" : ":" + (n.text || n.desc).slice(0, 30)}`)
    .sort();
  return `${nodes[0]?.pkg ?? ""}|${keys.join(",")}`;
}

// Everything visible, so we can tell whether a tap changed anything at all.
export function fingerprint(nodes: A.UiNode[]): string {
  return nodes.map((n) => `${n.cls}${n.text}${n.desc}${n.bounds.x1},${n.bounds.y1},${n.bounds.x2},${n.bounds.y2}`).join("|");
}

export function pressable(nodes: A.UiNode[]): El[] {
  const out: El[] = [];
  for (const n of nodes) {
    if (!n.clickable) continue;
    const { x1, y1, x2, y2 } = n.bounds;
    if (x2 - x1 < 8 || y2 - y1 < 8) continue;
    // A clickable row: name it after the text inside it.
    const inner = nodes.find((m) => (m.text || m.desc) && m.bounds.x1 >= x1 && m.bounds.y1 >= y1 && m.bounds.x2 <= x2 && m.bounds.y2 <= y2);
    const name = n.text || n.desc || inner?.text || inner?.desc || "";
    const input = n.cls === "EditText";
    const label = input ? `field ${n.id ? "#" + n.id : JSON.stringify(name.slice(0, 30))}` : name ? JSON.stringify(name.slice(0, 40)) : n.id ? `#${n.id}` : `${n.cls || "view"} at ${center(n.bounds).x},${center(n.bounds).y}`;
    const key = `${n.cls}#${n.id}:${input ? "" : name.slice(0, 30)}@${input || name || n.id ? "" : `${x1},${y1}`}`;
    if (out.some((o) => o.key === key)) continue;
    out.push({ key, label, input, ...center(n.bounds) });
  }
  return out;
}

const titleOf = (nodes: A.UiNode[]) => {
  const texts = nodes.filter((n) => n.text && !n.clickable && n.cls !== "EditText").sort((a, b) => a.bounds.y1 - b.bounds.y1 || a.bounds.x1 - b.bounds.x1);
  return (texts[0]?.text ?? nodes.find((n) => n.text || n.desc)?.text ?? "").slice(0, 50);
};

export async function explore(o: ExploreOptions): Promise<ExploreReport> {
  const started = Date.now();
  const budget = o.steps ?? 30, settle = o.settleMs ?? 700, sample = o.sample ?? "42";
  const log = o.log ?? (() => {});
  const r: ExploreReport = { pkg: o.pkg, actions: 0, seconds: 0, screens: [], edges: [], crashes: [], dead: [], left: [], skipped: [], anr: [], stoppedBecause: "" };
  const bySig = new Map<string, ScreenInfo>();
  let path: string[] = []; // what was done since the last launch, for crash repros
  let replaySteps: ReplayStep[] = [];

  const relaunch = async (): Promise<boolean> => {
    path = ["launch"];
    replaySteps = [{ kind: "launch", package: o.pkg }];
    const crash = await o.launch(o.pkg);
    if (crash) {
      await saveCrash(["launch"], crash);
      return false;
    }
    return true;
  };
  const saveCrash = async (steps: string[], crashLog: string) => {
    const c: Crash = { steps: [...steps], log: crashLog };
    if (o.cwd) {
      const file = join(o.cwd, ".maxx", "replays", `crash-${Date.now()}-${r.crashes.length + 1}.jsonl`);
      await mkdir(join(o.cwd, ".maxx", "replays"), { recursive: true });
      await writeFile(file, replaySteps.map((s) => JSON.stringify(s)).join("\n") + "\n");
      c.replay = file;
    }
    r.crashes.push(c);
    log(`crash after: ${steps.join(" → ")}`);
  };
  const doAct = async (args: string[], note: string) => {
    replaySteps.push({ kind: "adb", args, note });
    r.actions++;
    await A.act(args, note);
  };

  if (!(await relaunch())) return finish(r, started, "the app crashes on launch");
  let home = "";

  while (r.actions < budget) {
    const nodes = await A.uiTree();
    if (!nodes.length) {
      await sleep(settle);
      if (!(await A.uiTree()).length) return finish(r, started, "the screen can't be read (uiautomator returned nothing)");
      continue;
    }
    const fg = nodes[0]!.pkg;

    // "App isn't responding" dialog.
    const anr = nodes.find((n) => /isn.t responding|not responding/i.test(n.text));
    if (anr) {
      r.anr.push(`after: ${path.join(" → ")}`);
      const wait = nodes.find((n) => n.clickable && /^(wait|close app)$/i.test(n.text));
      if (wait) await doAct(["shell", "input", "tap", ...xy(center(wait.bounds))], "dismiss ANR");
      if (!(await relaunch())) break;
      continue;
    }

    if (fg && fg !== o.pkg) {
      // We left the app: a crash, a share sheet or browser, or a back press on the first screen.
      const crash = await o.crashLog(o.pkg);
      if (crash) {
        await saveCrash(path, crash);
        if (!(await relaunch())) break;
        continue;
      }
      if (path.at(-1) !== "back") {
        await doAct(["shell", "input", "keyevent", "4"], "back to the app");
        path.push("back");
        await sleep(settle);
        if ((await A.uiTree())[0]?.pkg === o.pkg) continue;
      }
      if (!(await relaunch())) break;
      continue;
    }

    const sig = signature(nodes);
    if (path.length === 1) home = sig;
    let screen = bySig.get(sig);
    if (!screen) {
      screen = { n: r.screens.length + 1, title: titleOf(nodes), els: pressable(nodes), tried: new Set() };
      try {
        screen.shot = decodePng(await A.screencap());
      } catch {}
      bySig.set(sig, screen);
      r.screens.push(screen);
      log(`screen ${screen.n}: ${screen.title || "(untitled)"} · ${screen.els.length} things to press`);
    }

    const todo = screen.els.filter((e) => !screen!.tried.has(e.key));
    const next = todo.find((e) => o.bold || !RISKY.test(e.label));
    for (const e of todo) if (e !== next && !o.bold && RISKY.test(e.label) && !screen.tried.has(e.key)) (screen.tried.add(e.key), r.skipped.push({ screen: screen.n, label: e.label }));

    if (!next) {
      // This screen is used up. Head for a screen that still has untried buttons.
      if (!r.screens.some((s) => s.els.some((e) => !s.tried.has(e.key)))) return finish(r, started, "every button on every screen it found was tried");
      const hop = route(screen.n, r);
      if (hop) {
        const before = fingerprint(nodes);
        await doAct(["shell", "input", "tap", `${hop.x}`, `${hop.y}`], `tap ${hop.label}`);
        path.push(`tap ${hop.label}`);
        await sleep(settle);
        if (fingerprint(await A.uiTree()) !== before) continue;
      }
      if (sig === home) return finish(r, started, "everything reachable from the start screen was tried");
      await doAct(["shell", "input", "keyevent", "4"], "back");
      path.push("back");
      await sleep(settle);
      continue;
    }

    screen.tried.add(next.key);
    const before = fingerprint(nodes);
    const what = next.input ? `type "${sample}" into ${next.label}` : `tap ${next.label}`;
    await doAct(["shell", "input", "tap", `${next.x}`, `${next.y}`], `tap ${next.label}`);
    if (next.input) {
      await sleep(300);
      await doAct(["shell", "input", "text", A.escapeInputText(sample)], "type");
    }
    path.push(what);
    await sleep(settle);
    if (next.input) {
      // Put the keyboard away so it doesn't cover the buttons below.
      const ime = await A.adbText(["shell", "dumpsys", "input_method"]).catch(() => "");
      if (ime && !IME_HIDDEN.test(ime)) (await doAct(["shell", "input", "keyevent", "111"], "hide keyboard"), await sleep(200));
    }

    const crash = await o.crashLog(o.pkg);
    if (crash) {
      await saveCrash(path, crash);
      if (!(await relaunch())) break;
      continue;
    }
    const after = await A.uiTree();
    if (!after.length) continue;
    if (after[0]!.pkg && after[0]!.pkg !== o.pkg) {
      r.left.push({ screen: screen.n, label: next.label, to: after[0]!.pkg });
      continue;
    }
    if (!next.input && fingerprint(after) === before) r.dead.push({ screen: screen.n, label: next.label });
    const to = bySig.get(signature(after));
    if (signature(after) !== sig) r.edges.push({ from: screen.n, to: to?.n ?? r.screens.length + 1, label: next.label, x: next.x, y: next.y });
  }
  return finish(r, started, r.actions >= budget ? `the budget of ${budget} actions ran out` : "it could not get back into the app");
}

// First step on the shortest known way from screen `from` to a screen with untried buttons.
export function route(from: number, r: Pick<ExploreReport, "screens" | "edges">): { label: string; x: number; y: number } | null {
  const open = new Set(r.screens.filter((s) => s.els.some((e) => !s.tried.has(e.key))).map((s) => s.n));
  const firstHop = new Map<number, ExploreReport["edges"][number]>();
  const queue = [from];
  const seen = new Set([from]);
  while (queue.length) {
    const at = queue.shift()!;
    for (const e of r.edges) {
      if (e.from !== at || seen.has(e.to)) continue;
      seen.add(e.to);
      const hop = at === from ? e : firstHop.get(at)!;
      firstHop.set(e.to, hop);
      if (open.has(e.to)) return hop;
      queue.push(e.to);
    }
  }
  return null;
}

const xy = (p: { x: number; y: number }) => [`${p.x}`, `${p.y}`];

function finish(r: ExploreReport, started: number, why: string): ExploreReport {
  r.seconds = Math.round((Date.now() - started) / 1000);
  r.stoppedBecause = why;
  return r;
}

export function describe(r: ExploreReport, relTo?: (p: string) => string): { text: string; images: Image[] } {
  const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;
  const crashes = `${r.crashes.length} crash${r.crashes.length === 1 ? "" : "es"}`;
  const lines = [
    `Explored ${r.pkg} with ${plural(r.actions, "action")} in ${r.seconds} s: ${plural(r.screens.length, "screen")}, ${crashes}, ${plural(r.dead.length, "tap")} that changed nothing. Stopped because ${r.stoppedBecause}.`,
  ];
  if (r.crashes.length) {
    lines.push("", "CRASHES (fix these first)");
    r.crashes.forEach((c, i) => {
      lines.push(`${i + 1}. after: ${c.steps.join(" → ")}`);
      lines.push(truncate(c.log, 12, 0).replace(/^/gm, "   "));
      if (c.replay) lines.push(`   reproduce: maxx replay ${relTo ? relTo(c.replay) : c.replay}`);
    });
  }
  if (r.anr.length) lines.push("", "NOT RESPONDING (the main thread was blocked)", ...r.anr.map((a) => "- " + a));
  if (r.screens.length) {
    lines.push("", "SCREENS (the numbers match the picture)");
    for (const s of r.screens) {
      const left = s.els.filter((e) => !s.tried.has(e.key)).length;
      lines.push(`[${s.n}] ${s.title ? JSON.stringify(s.title) : "(no title)"}: ${s.els.map((e) => e.label).join(", ") || "nothing to press"}${left ? ` (${left} not tried yet)` : ""}`);
    }
  }
  if (r.edges.length) lines.push("", "HOW THEY CONNECT", ...dedupe(r.edges.map((e) => `[${e.from}] ${e.label} → [${e.to}]`)));
  if (r.dead.length) lines.push("", "TAPS THAT CHANGED NOTHING (a button without a handler, or one that only works with input?)", ...r.dead.map((d) => `- [${d.screen}] ${d.label}`));
  if (r.left.length) lines.push("", "LEFT THE APP", ...r.left.map((d) => `- [${d.screen}] ${d.label} opened ${d.to}`));
  if (r.skipped.length) lines.push("", "NOT PRESSED (could delete, pay or send; pass bold: true to include)", ...dedupe(r.skipped.map((d) => `- [${d.screen}] ${d.label}`)));
  const tiles = r.screens.filter((s) => s.shot).slice(0, 8);
  const images: Image[] = [];
  if (tiles.length) {
    const sheet = contactSheet(tiles.map((s) => s.shot!), { cols: Math.min(4, tiles.length) });
    // Renumber the marks to match the screen numbers (some screens may lack a shot).
    sheet.marks.forEach((m, i) => (m.n = tiles[i]!.n));
    images.push(toShot(sheet.img, { maxSide: 1400, marks: sheet.marks }));
  }
  return { text: lines.join("\n"), images };
}

const dedupe = (xs: string[]) => [...new Set(xs)];
