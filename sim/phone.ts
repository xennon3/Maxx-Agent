import { PNG } from "pngjs";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

// A pretend Pixel 9 (1080x2400). The "app" is whatever source the fake Gradle
// packed into the APK; launching it runs a tiny interpreter of its behavior:
// it crashes if onCreate parses an empty string, and otherwise shows a tip
// calculator whose Calculate button really computes the tip.

export type PhoneState = {
  installed: { pkg: string; src: string } | null;
  foreground: "launcher" | "app";
  fields: { bill: string; tip: string };
  focus: "bill" | "tip" | null;
  result: string;
  crash: string[];
  log: string[];
};

const FILE = process.env.SIM_PHONE ?? "phone.json";

export function load(): PhoneState {
  if (existsSync(FILE)) return JSON.parse(readFileSync(FILE, "utf8"));
  return { installed: null, foreground: "launcher", fields: { bill: "", tip: "" }, focus: null, result: "", crash: [], log: [] };
}
export const save = (s: PhoneState) => writeFileSync(FILE, JSON.stringify(s, null, 2));

type El = { cls: string; text: string; id: string; clickable: boolean; b: [number, number, number, number]; color: [number, number, number] };

export function elements(s: PhoneState): El[] {
  if (s.foreground === "launcher") {
    const els: El[] = [{ cls: "android.widget.TextView", text: "Settings", id: "", clickable: true, b: [80, 1900, 300, 2120], color: [120, 120, 130] }];
    if (s.installed) els.push({ cls: "android.widget.TextView", text: "Tip Calculator", id: "", clickable: true, b: [340, 1900, 560, 2120], color: [40, 160, 90] });
    return els;
  }
  return [
    { cls: "android.widget.TextView", text: "Tip Calculator", id: "title", clickable: false, b: [60, 180, 1020, 300], color: [30, 30, 30] },
    { cls: "android.widget.EditText", text: s.fields.bill || "Bill amount", id: "bill", clickable: true, b: [60, 420, 1020, 580], color: [225, 225, 232] },
    { cls: "android.widget.EditText", text: s.fields.tip || "Tip %", id: "tip", clickable: true, b: [60, 640, 1020, 800], color: [225, 225, 232] },
    { cls: "android.widget.Button", text: "Calculate", id: "calculate", clickable: true, b: [60, 880, 1020, 1040], color: [50, 110, 230] },
    { cls: "android.widget.TextView", text: s.result || "Tip: $0.00", id: "result", clickable: false, b: [60, 1120, 1020, 1240], color: [250, 250, 250] },
  ];
}

export function screenshot(s: PhoneState): Buffer {
  const png = new PNG({ width: 1080, height: 2400 });
  const bg = s.foreground === "launcher" ? [20, 40, 70] : [246, 246, 250];
  for (let i = 0; i < png.data.length; i += 4) (png.data[i] = bg[0]!), (png.data[i + 1] = bg[1]!), (png.data[i + 2] = bg[2]!), (png.data[i + 3] = 255);
  for (const e of elements(s)) {
    const [x1, y1, x2, y2] = e.b;
    for (let y = y1; y < y2; y++) for (let x = x1; x < x2; x++) {
      const i = (y * 1080 + x) * 4;
      png.data[i] = e.color[0]; png.data[i + 1] = e.color[1]; png.data[i + 2] = e.color[2];
    }
  }
  return PNG.sync.write(png);
}

export function uiXml(s: PhoneState): string {
  const pkg = s.foreground === "app" ? s.installed!.pkg : "com.google.android.apps.nexuslauncher";
  const nodes = elements(s).map((e, i) =>
    `<node index="${i}" text="${e.text.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}" resource-id="${e.id ? `${pkg}:id/${e.id}` : ""}" class="${e.cls}" package="${pkg}" content-desc="" clickable="${e.clickable}" scrollable="false" bounds="[${e.b[0]},${e.b[1]}][${e.b[2]},${e.b[3]}]" />`,
  );
  return `<?xml version='1.0' encoding='UTF-8' standalone='yes' ?><hierarchy rotation="0"><node index="0" text="" resource-id="" class="android.widget.FrameLayout" package="${pkg}" content-desc="" clickable="false" bounds="[0,0][1080,2400]">${nodes.join("")}</node></hierarchy>`;
}

export function launch(s: PhoneState, pkg: string): string {
  if (!s.installed || s.installed.pkg !== pkg) return "** No activities found to run, monkey aborted.";
  s.fields = { bill: "", tip: "" };
  s.focus = null;
  s.result = "";
  const bad = s.installed.src.match(/""\s*\.toDouble\(\)/);
  if (bad) {
    const line = s.installed.src.slice(0, bad.index).split("\n").length;
    s.crash.push(
      `E/AndroidRuntime( 4242): FATAL EXCEPTION: main`,
      `E/AndroidRuntime( 4242): Process: ${pkg}, PID: 4242`,
      `E/AndroidRuntime( 4242): java.lang.RuntimeException: Unable to start activity ComponentInfo{${pkg}/${pkg}.MainActivity}: java.lang.NumberFormatException: empty String`,
      `E/AndroidRuntime( 4242): Caused by: java.lang.NumberFormatException: empty String`,
      `E/AndroidRuntime( 4242): \tat java.lang.Double.parseDouble(Double.java:538)`,
      `E/AndroidRuntime( 4242): \tat ${pkg}.MainActivity.onCreate(MainActivity.kt:${line})`,
    );
    s.foreground = "launcher";
  } else s.foreground = "app";
  return "Events injected: 1\n## Network stats: elapsed time=34ms";
}

export function tap(s: PhoneState, x: number, y: number) {
  const hit = elements(s).find((e) => e.clickable && x >= e.b[0] && x < e.b[2] && y >= e.b[1] && y < e.b[3]);
  if (!hit) return;
  if (s.foreground === "launcher" && hit.text === "Tip Calculator") return void launch(s, s.installed!.pkg);
  if (hit.id === "bill" || hit.id === "tip") s.focus = hit.id;
  if (hit.id === "calculate") {
    const bill = Number(s.fields.bill) || 0, pct = Number(s.fields.tip) || 0;
    const tip = (bill * pct) / 100;
    s.result = `Tip: $${tip.toFixed(2)} · Total: $${(bill + tip).toFixed(2)}`;
    s.log.push(`D/TipCalc ( 4242): calculate bill=${bill} pct=${pct}`);
  }
}

export function type(s: PhoneState, raw: string) {
  if (!s.focus) return;
  const t = raw.replace(/^'|'$/g, "").replace(/'\\''/g, "'").replace(/%s/g, " ").replace(/\\%/g, "%");
  s.fields[s.focus] += t;
}
