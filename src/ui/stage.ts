import { existsSync } from "node:fs";
import { z } from "zod";
import { defineTool, type Tool } from "../tools/types.ts";
import { inside } from "../tools/paths.ts";
import { shell } from "../shell.ts";
import { decodePng, toShot } from "../image.ts";
import * as A from "../devices/adb.ts";
import { PreviewServer, htmlFiles } from "./preview.ts";
import { Runner, detectCommands, saveCommand, savedCommands, type Proc } from "./runner.ts";

// The app window's right-hand "stage": Preview (the project's web pages, or a
// dev server), Run (project commands with live output) and Phone (a live
// mirror you can tap). The model gets two tools here: `preview` to open a page
// and read back its console, and `start_server` for commands that keep running.

type Out = Record<string, unknown> & { type: string };
export type Report = { title?: string; text?: string; logs?: { level: string; text: string }[]; error?: string; unbridged?: boolean };

const strip = (s: string) => s.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, "").replace(/\r(?!\n)/g, "\n");
const tail = (s: string, lines = 40) => strip(s).trimEnd().split("\n").slice(-lines).join("\n");

export class Stage {
  readonly preview: PreviewServer;
  runner: Runner | null = null;
  private reports = new Map<string, (r: Report) => void>();
  private mirrorOn = false;
  private screen = { w: 0, h: 0 };

  constructor(private send: (m: Out) => void, private clients: () => number, port = 0) {
    this.preview = new PreviewServer((paths) => this.send({ type: "changed", paths }), port);
  }

  async use(cwd: string) {
    this.runner?.stopAll();
    this.runner = new Runner(cwd, {
      output: (id, text) => this.send({ type: "procOut", id, text }),
      changed: (p) => this.send({ type: "proc", proc: this.view(p) }),
    });
    this.preview.use(cwd);
  }

  private view({ output, ...p }: Proc) {
    return p;
  }

  async info(): Promise<Out> {
    const cwd = this.runner?.cwd;
    if (!cwd) return { type: "stage", base: this.preview.base, commands: [], html: [], procs: [] };
    const saved = (await savedCommands(cwd)).map((command) => ({ label: command, command, saved: true }));
    const detected = detectCommands(cwd).filter((d) => !saved.some((s) => s.command === d.command));
    return { type: "stage", base: this.preview.base, commands: [...saved, ...detected], html: await htmlFiles(cwd), procs: this.runner!.list() };
  }

  // Messages from the page; returns false for ones that aren't ours.
  async handle(m: any): Promise<boolean> {
    const r = this.runner;
    switch (m.type) {
      case "stageInfo":
        this.send(await this.info());
        return true;
      case "runStart": {
        if (!r) throw new Error("open a project folder first");
        const command = String(m.command ?? "").trim();
        if (!command) return true;
        if (m.save) await saveCommand(r.cwd, command);
        r.start(command);
        this.send(await this.info());
        return true;
      }
      case "runStop":
        r?.stop(m.id);
        return true;
      case "runForget":
        r?.forget(m.id);
        this.send(await this.info());
        return true;
      case "runOutput": {
        const p = r?.procs.get(m.id);
        if (p) this.send({ type: "procOutput", id: p.id, text: p.output });
        return true;
      }
      case "previewReport":
        this.reports.get(m.id)?.(m);
        this.reports.delete(m.id);
        return true;
      case "mirror":
        this.mirrorOn = !!m.on;
        if (this.mirrorOn) void this.mirror();
        return true;
      case "phoneTap":
        await this.phone(["shell", "input", "tap", ...this.px(m.fx, m.fy)]);
        return true;
      case "phoneSwipe":
        await this.phone(["shell", "input", "swipe", ...this.px(m.fx1, m.fy1), ...this.px(m.fx2, m.fy2), String(Math.round(m.ms ?? 300))]);
        return true;
      case "phoneKey": {
        const code = A.KEYCODES[String(m.key)];
        if (code) await this.phone(["shell", "input", "keyevent", String(code)]);
        return true;
      }
    }
    return false;
  }

  // Phone taps arrive as fractions of the mirrored image.
  private px(fx: number, fy: number) {
    return [String(Math.round(fx * this.screen.w)), String(Math.round(fy * this.screen.h))];
  }

  private async phone(args: string[]) {
    if (!this.screen.w) throw new Error("turn the live phone view on first");
    await A.adbText(args);
  }

  // About two frames a second over adb: enough to watch a test run or poke at a screen.
  private async mirror() {
    try {
      await A.ensureDevice();
    } catch (e) {
      this.mirrorOn = false;
      return this.send({ type: "mirrorFrame", error: (e as Error).message });
    }
    let failures = 0;
    while (this.mirrorOn && this.clients() > 0) {
      const t = Date.now();
      try {
        const raw = decodePng(await A.screencap());
        this.screen = { w: raw.width, h: raw.height };
        const shot = toShot(raw, { maxSide: 900, quality: 65 });
        this.send({ type: "mirrorFrame", src: `data:image/jpeg;base64,${shot.base64}`, w: raw.width, h: raw.height });
        failures = 0;
      } catch (e) {
        if (++failures >= 3) {
          this.mirrorOn = false;
          return this.send({ type: "mirrorFrame", error: (e as Error).message });
        }
      }
      await Bun.sleep(Math.max(0, 450 - (Date.now() - t)));
    }
  }

  // Ask the page to show a URL and wait for what the bridge script saw.
  async show(url: string, label: string, waitMs = 8000): Promise<Report | null> {
    const id = crypto.randomUUID();
    const got = new Promise<Report | null>((res) => {
      this.reports.set(id, res);
      setTimeout(() => (this.reports.delete(id), res(null)), waitMs);
    });
    this.send({ type: "preview", id, url, label });
    return got;
  }

  tools(): Tool<any>[] {
    const stage = this;
    const preview = defineTool({
      name: "preview",
      description:
        "Open a web page in the user's Preview panel and get back its title, visible text and console errors. Pass `path` for an HTML file in the workspace (e.g. index.html), or `url` for a running dev server (from start_server). Use it after building or changing a web page to check it works.",
      schema: z.object({
        path: z.string().optional().describe("HTML file relative to the workspace, e.g. index.html or public/game.html"),
        url: z.string().optional().describe("Or: a URL such as http://localhost:5173"),
      }),
      risk: "read",
      checkpoint: false,
      async run({ path, url }, { cwd }) {
        if (!stage.clients()) return "error: the Preview panel is not open (it is part of the app window, `maxx ui`)";
        let target: string;
        if (url) {
          if (!/^https?:\/\//i.test(url)) return "error: url must start with http:// or https://";
          target = url;
        } else {
          const p = path || "index.html";
          const abs = inside(cwd, p);
          if (!existsSync(abs)) return `error: ${p} does not exist. Write it first, or pass the path of an existing HTML file.`;
          target = stage.preview.url(p);
        }
        const r = await stage.show(target, url ?? path ?? "index.html");
        return describeReport(url ?? path ?? "index.html", r, !url);
      },
    });
    const startServer = defineTool({
      name: "start_server",
      description:
        "Start a command that keeps running (a dev server like `npm run dev`, a watcher) in the user's Run panel, without waiting for it to finish. Returns its first output and the URL it serves, which also opens in the Preview panel. Running the same command again restarts it. Use bash for commands that finish on their own.",
      schema: z.object({ command: z.string().describe("The command, e.g. npm run dev or python -m http.server 8000") }),
      risk: "exec",
      checkpoint: false,
      ruleKey: (a) => a.command,
      preview: ({ command }) => `${shell().kind === "powershell" ? "PS>" : "$"} ${command}   (keeps running in the Run panel)`,
      async run({ command }) {
        const r = stage.runner;
        if (!r) return "error: no project open";
        for (const p of r.procs.values()) if (p.command === command && p.status === "running") r.forget(p.id);
        const p = r.start(command);
        stage.send(await stage.info());
        await r.settle(p.id, 30_000);
        const out = tail(p.output) || "(no output yet)";
        if (p.status !== "running") return `the command exited with code ${p.code} instead of staying up:\n${out}`;
        if (!p.url) return `started; still running after 30 s but no URL in its output yet:\n${out}`;
        const report = await stage.show(p.url, p.url);
        return `running at ${p.url}\n${out}\n\n${describeReport(p.url, report, false)}`;
      },
    });
    return [preview, startServer];
  }

  stop() {
    this.mirrorOn = false;
    this.runner?.stopAll();
    this.preview.stop();
  }
}

export function describeReport(label: string, r: Report | null, bridged: boolean): string {
  if (!r) return `opened ${label} in the Preview panel, but the page did not report back within 8 s${bridged ? " (it may still be loading, or a script hangs)" : " (pages from a dev server can't report their console)"}.`;
  if (r.error) return `could not open ${label}: ${r.error}`;
  // Pages from another server load in the panel, but their console stays theirs.
  if (r.unbridged) return `opened ${label} in the Preview panel and it loaded. Its console isn't visible from here; check the server's output for errors.`;
  const logs = r.logs ?? [];
  const errors = logs.filter((l) => l.level === "error");
  const lines = [`opened ${label} in the Preview panel.`, `title: ${r.title || "(none)"}`];
  if (r.text !== undefined) lines.push(`visible text:\n${r.text.trim() ? r.text.trim().slice(0, 1200) : "(the page shows no text; it may be blank, or draw on a canvas)"}`);
  lines.push(errors.length ? `${errors.length} error(s):\n${errors.slice(0, 10).map((e) => "  " + e.text).join("\n")}` : "no errors in the console.");
  const other = logs.filter((l) => l.level !== "error").slice(-10);
  if (other.length) lines.push(`console:\n${other.map((l) => `  [${l.level}] ${l.text}`).join("\n")}`);
  return lines.join("\n");
}
