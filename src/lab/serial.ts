import { readdirSync, existsSync, createReadStream, appendFile } from "node:fs";

// COM ports without a native module, so it still works inside maxx.exe.
// Windows: Windows PowerShell's .NET has System.IO.Ports built in. Linux and
// macOS: stty sets the speed and the device file is read directly.
// Arduinos reset when the port opens (DTR), so reading waits a moment first.

export type Port = { path: string; name: string };
export type SerialLine = { t: number; text: string };
export type SerialRead = { port: string; baud: number; seconds: number; send?: string; settleMs?: number; signal?: AbortSignal };

// MAXX_FAKE_SERIAL="COM3=Arduino Uno" adds a simulated board that prints
// temp/light/sound lines, for trying the lab without hardware.
export function fakePorts(env = process.env): Port[] {
  return (env.MAXX_FAKE_SERIAL ?? "").split(";").map((s) => s.trim()).filter(Boolean).map((s) => {
    const [path, name] = s.split("=");
    return { path: path!.trim(), name: `${(name ?? "Simulated board").trim()} (simulated)` };
  });
}

const PS_LIST = `$ErrorActionPreference='SilentlyContinue'
$named = Get-CimInstance Win32_PnPEntity | Where-Object { $_.Name -match '\\((COM\\d+)\\)' } | ForEach-Object { $_.Name }
$named | ForEach-Object { $_ }
[System.IO.Ports.SerialPort]::GetPortNames() | ForEach-Object { if (-not ($named -match "\\($_\\)")) { "$_" } }`;

const PS_READ = `$ErrorActionPreference='Stop'
$p = New-Object System.IO.Ports.SerialPort $env:MAXX_PORT, ([int]$env:MAXX_BAUD), 'None', 8, 'One'
$p.ReadTimeout = 300; $p.DtrEnable = $true; $p.NewLine = "\`n"
try { $p.Open() } catch { [Console]::Error.WriteLine("cannot open $($env:MAXX_PORT): $($_.Exception.Message)"); exit 2 }
Start-Sleep -Milliseconds ([int]$env:MAXX_SETTLE)
$p.DiscardInBuffer()
if ($env:MAXX_SEND) { $p.Write($env:MAXX_SEND + "\`n") }
$sw = [Diagnostics.Stopwatch]::StartNew()
while ($sw.Elapsed.TotalSeconds -lt [double]$env:MAXX_SECONDS) {
  try { $l = $p.ReadLine(); [Console]::Out.WriteLine(([math]::Round($sw.Elapsed.TotalSeconds, 3)).ToString([Globalization.CultureInfo]::InvariantCulture) + "\`t" + $l.TrimEnd()); [Console]::Out.Flush() } catch [TimeoutException] {}
}
$p.Close()`;

export async function listPorts(platform = process.platform, env = process.env): Promise<Port[]> {
  const fake = fakePorts(env);
  try {
    if (platform === "win32") {
      const out = await run(["powershell.exe", "-NoLogo", "-NoProfile", "-NonInteractive", "-Command", PS_LIST], {}, 8000);
      const real = out.stdout.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((l) => {
        const m = l.match(/\((COM\d+)\)/);
        return { path: m ? m[1]! : l, name: m ? l.replace(/\s*\(COM\d+\)\s*$/, "") : "Serial port" };
      });
      return [...fake, ...dedupe(real)];
    }
    const dir = "/dev";
    const names = existsSync(dir) ? readdirSync(dir).filter((n) => /^(ttyUSB\d+|ttyACM\d+|cu\.usb\w*|ttyAMA\d+|cu\.wchusbserial\w*)$/.test(n)) : [];
    return [...fake, ...names.map((n) => ({ path: `${dir}/${n}`, name: /ACM|usbmodem/.test(n) ? "USB serial (Arduino-like)" : "USB serial" }))];
  } catch {
    return fake;
  }
}

const dedupe = (ports: Port[]) => ports.filter((p, i) => ports.findIndex((q) => q.path === p.path) === i);

export async function readSerial(o: SerialRead, platform = process.platform, env = process.env): Promise<SerialLine[]> {
  const settle = o.settleMs ?? 1800;
  if (fakePorts(env).some((p) => p.path === o.port)) return fakeBoard(o);
  if (platform === "win32") {
    const out = await run(["powershell.exe", "-NoLogo", "-NoProfile", "-NonInteractive", "-Command", PS_READ], { MAXX_PORT: o.port, MAXX_BAUD: String(o.baud), MAXX_SECONDS: String(o.seconds), MAXX_SEND: o.send ?? "", MAXX_SETTLE: String(settle) }, (o.seconds + settle / 1000 + 10) * 1000, o.signal);
    if (out.code !== 0 && !out.stdout.trim()) throw new Error(out.stderr.trim().split("\n")[0] || `reading ${o.port} failed`);
    return out.stdout.split(/\r?\n/).filter(Boolean).map((l) => {
      const tab = l.indexOf("\t");
      return { t: Number(l.slice(0, tab)) || 0, text: l.slice(tab + 1) };
    });
  }
  const stty = await run(platform === "darwin" ? ["stty", "-f", o.port, String(o.baud), "raw", "-echo"] : ["stty", "-F", o.port, String(o.baud), "raw", "-echo"], {}, 5000);
  if (stty.code !== 0) throw new Error(`cannot set up ${o.port}: ${stty.stderr.trim() || "stty failed"} (on Linux, add yourself to the dialout group)`);
  return readDevice(o, settle);
}

async function readDevice(o: SerialRead, settle: number): Promise<SerialLine[]> {
  const lines: SerialLine[] = [];
  const stream = createReadStream(o.port, { flags: "r+" });
  let buf = "";
  let start = 0;
  const begun = Date.now();
  if (o.send) setTimeout(() => stream.destroyed || appendFile(o.port, o.send + "\n", () => {}), settle);
  await new Promise<void>((res, rej) => {
    const stop = () => (stream.destroy(), res());
    const timer = setTimeout(stop, settle + o.seconds * 1000);
    o.signal?.addEventListener("abort", () => (clearTimeout(timer), stop()));
    stream.on("error", (e) => (clearTimeout(timer), rej(e)));
    stream.on("data", (chunk) => {
      if (Date.now() - begun < settle) return;
      if (!start) start = Date.now();
      buf += chunk.toString();
      const parts = buf.split(/\r?\n/);
      buf = parts.pop()!;
      for (const p of parts) if (p.trim()) lines.push({ t: (Date.now() - start) / 1000, text: p.trim() });
    });
  });
  return lines;
}

// A pretend Arduino on a desk by a window: temperature drifts up, light
// follows the clouds, sound has a fan that kicks in halfway.
async function fakeBoard(o: SerialRead): Promise<SerialLine[]> {
  const n = Math.max(3, Math.round(o.seconds * 4));
  const lines: SerialLine[] = [];
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5);
  for (let i = 0; i < n; i++) {
    const t = i / 4;
    const temp = 22.5 + 0.08 * t + rnd() * 0.2;
    const light = 610 + 120 * Math.sin(t / 3) + rnd() * 25;
    const sound = (t > o.seconds / 2 ? 58 : 41) + rnd() * 3;
    lines.push({ t, text: `temp=${temp.toFixed(2)},light=${light.toFixed(0)},sound=${sound.toFixed(1)}` });
  }
  await Bun.sleep(Math.min(1500, o.seconds * 100));
  return lines;
}

async function run(cmd: string[], env: Record<string, string>, timeoutMs: number, signal?: AbortSignal): Promise<{ code: number; stdout: string; stderr: string }> {
  const p = Bun.spawn(cmd, { env: { ...process.env, ...env }, stdout: "pipe", stderr: "pipe", stdin: "ignore" });
  const kill = () => p.kill();
  const timer = setTimeout(kill, timeoutMs);
  signal?.addEventListener("abort", kill);
  const [stdout, stderr] = await Promise.all([new Response(p.stdout).text(), new Response(p.stderr).text()]);
  const code = await p.exited;
  clearTimeout(timer);
  signal?.removeEventListener("abort", kill);
  return { code, stdout, stderr };
}

// A sketch that prints lines the lab understands, for anyone starting from a bare board.
export const ARDUINO_SKETCH = `// Maxx lab: prints one line of readings every 250 ms, as key=value pairs.
// Wire a sensor to A0 (light, sound, a potentiometer...) and flash this.
// Maxx reads it at 9600 baud and turns each key into a column.
void setup() {
  Serial.begin(9600);
}

void loop() {
  int a0 = analogRead(A0);
  int a1 = analogRead(A1);
  Serial.print("a0="); Serial.print(a0);
  Serial.print(",a1="); Serial.print(a1);
  Serial.print(",ms="); Serial.println(millis());
  // Answer "R" with an extra reading on demand (send=R in the lab).
  if (Serial.available() && Serial.read() == 'R') { Serial.print("on_demand="); Serial.println(analogRead(A0)); }
  delay(250);
}
`;
