import { discover, ffmpegCapture, ICON, instrumentsFile } from "./instruments.ts";
import { ARDUINO_SKETCH } from "./serial.ts";
import { labFile, labSettings, loadLab } from "./lab.ts";

// `maxx lab [instruments|sketch]`: what the lab can measure from here.
export async function labCommand(args: string[], network: boolean): Promise<number> {
  const sub = args[0] ?? "instruments";
  if (sub === "sketch") return console.log(ARDUINO_SKETCH), 0;
  if (sub === "instruments" || sub === "ports") {
    const list = await discover({ network, capture: ffmpegCapture() });
    const shown = sub === "ports" ? list.filter((i) => i.kind === "serial") : list;
    if (!shown.length) console.log("No COM ports found. Plug in an Arduino or another USB serial device.");
    for (const i of shown) console.log(`${ICON[i.kind]} ${i.id.padEnd(18)} ${i.label}${i.gated ? " 🔒" : ""}${i.unavailable ? `  (${i.unavailable})` : ""}\n   ${i.usage}`);
    const s = labSettings(await loadLab());
    if (sub === "instruments") console.log(`\nAdd your own in ${instrumentsFile()}. Settings (${labFile()}): ${s.rounds} rounds, ${s.hypotheses} hypotheses, ${s.readings} readings per round, ${s.parallel} test(s) at once, ${s.testSeconds}s per test, skeptic ${s.skeptic ? "on" : "off"}.\nIn the terminal the camera and mic need ffmpeg; in maxx ui they go through the app window.`);
    return 0;
  }
  console.log("usage: maxx lab [instruments|ports|sketch]   ·   maxx --lab \"your question\"");
  return 1;
}
