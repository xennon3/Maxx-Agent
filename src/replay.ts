import { join, dirname, basename } from "node:path";
import { mkdir } from "node:fs/promises";
import { sleep, type ReplayStep } from "./devices/run.ts";
import * as A from "./devices/adb.ts";
import * as W from "./devices/windows.ts";
import { crashLog, launch } from "./tools/android.ts";

// `maxx replay .maxx/replays/<session>.jsonl`: run the device actions of an
// earlier session again, saving a screenshot after each step, so a test the
// agent worked out once becomes a repeatable smoke test.

export async function replay(file: string, opts: { delayMs?: number; shots?: boolean; log?: (s: string) => void } = {}): Promise<boolean> {
  const log = opts.log ?? console.log;
  const steps = (await Bun.file(file).text())
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l) as ReplayStep);
  if (!steps.length) return (log("no steps in " + file), false);

  const outDir = join(dirname(file), basename(file, ".jsonl"));
  if (opts.shots !== false) await mkdir(outDir, { recursive: true });
  const usesPhone = steps.some((s) => s.kind !== "desktop");
  if (usesPhone) await A.ensureDevice();

  let ok = true;
  for (const [i, s] of steps.entries()) {
    const label = s.kind === "launch" ? `launch ${s.package}` : s.note ?? (s.kind === "adb" ? s.args.join(" ") : s.action);
    try {
      if (s.kind === "adb") await A.adbText(s.args, { timeout: s.args[0] === "install" ? 300 : 30 });
      else if (s.kind === "launch") {
        const crash = await launch(s.package, 3);
        if (crash) throw new Error(`app crashed on launch:\n${crash}`);
      } else await W.win(s.action, s.args);
      await sleep(opts.delayMs ?? 800);
      if (opts.shots !== false) {
        const shot = s.kind === "desktop" ? (await W.look({ elements: false, marks: false })).shot : (await A.look({ marks: false })).shot;
        await Bun.write(join(outDir, `step-${String(i + 1).padStart(2, "0")}.jpg`), Buffer.from(shot.base64, "base64"));
      }
      log(`  ${String(i + 1).padStart(2)} ok    ${label}`);
    } catch (e) {
      ok = false;
      log(`  ${String(i + 1).padStart(2)} FAIL  ${label}\n${(e as Error).message}`);
      break;
    }
  }
  if (usesPhone && ok) {
    const crash = await crashLog();
    if (crash) (ok = false), log(`crash logged during the replay:\n${crash}`);
  }
  log(ok ? `\nreplay passed (${steps.length} steps)${opts.shots !== false ? `; screenshots in ${outDir}` : ""}` : "\nreplay failed");
  return ok;
}
