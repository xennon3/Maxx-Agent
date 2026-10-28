import { readFileSync } from "node:fs";
import * as P from "./phone.ts";
import { spendSync } from "./ledger.ts";

// Stands in for adb.exe: same arguments, same output shapes, a simulated phone behind it.
let args = process.argv.slice(2);
if (args[0] === "-s") args = args.slice(2);
const cmd = args.join(" ");
const s = P.load();
const out = (t: string) => process.stdout.write(t);
const cost = (what: string, sec: number) => spendSync("phone", what, sec);

if (cmd === "devices -l") out("List of devices attached\nSIMPIXEL9   device usb:1-2 product:tokay model:Pixel_9 device:tokay transport_id:1\n\n");
else if (cmd === "exec-out screencap -p") (cost("screencap", 0.35), process.stdout.write(P.screenshot(s)));
else if (cmd.startsWith("shell uiautomator dump")) (cost("uiautomator dump", 1.4), out("UI hierchary dumped to: /sdcard/maxx_ui.xml\n"));
else if (cmd.startsWith("exec-out cat")) out(P.uiXml(s));
else if (cmd === "shell wm size") out("Physical size: 1080x2400\n");
else if (args[0] === "install") {
  cost("install apk", 3.5);
  const apk = JSON.parse(readFileSync(args.at(-1)!, "utf8"));
  s.installed = { pkg: apk.pkg, src: apk.src };
  out("Performing Streamed Install\nSuccess\n");
} else if (cmd === "logcat -c") s.crash = [];
else if (args[0] === "logcat" && args.includes("crash")) out(s.crash.length ? "--------- beginning of crash\n" + s.crash.join("\n") + "\n" : "");
else if (args[0] === "logcat") out(s.log.join("\n") + "\n");
else if (args[1] === "am" && args[2] === "force-stop") s.foreground = "launcher";
else if (args[1] === "monkey") (cost("cold start app", 1.1), out(P.launch(s, args[3]!) + "\n"));
else if (args[1] === "pidof") out(s.foreground === "app" ? "4242\n" : "");
else if (args[1] === "input") {
  cost(`input ${args[2]}`, 0.15);
  if (args[2] === "tap") P.tap(s, Number(args[3]), Number(args[4]));
  else if (args[2] === "text") P.type(s, args.slice(3).join(" "));
  else if (args[2] === "keyevent" && args[3] === "4") s.foreground = "launcher";
} else {
  process.stderr.write(`fake adb: unsupported command: ${cmd}\n`);
  process.exit(1);
}
P.save(s);
