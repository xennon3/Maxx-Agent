import { existsSync } from "node:fs";
import { join } from "node:path";

// Was maxx.exe started by double-clicking it? Windows then creates a console
// just for us, so we are the only process attached to it.
export function launchedFromExplorer(): boolean {
  if (process.platform !== "win32") return false;
  try {
    const { dlopen, FFIType, ptr } = require("bun:ffi") as typeof import("bun:ffi");
    const k = dlopen("kernel32.dll", { GetConsoleProcessList: { args: [FFIType.ptr, FFIType.u32], returns: FFIType.u32 } });
    const ids = new Uint32Array(4);
    const n = k.symbols.GetConsoleProcessList(ptr(ids), 4);
    k.close();
    return n === 1;
  } catch {
    return false;
  }
}

// Edge's app mode gives a window of its own with no tabs or address bar; it ships with Windows 11.
export function openWindow(url: string) {
  const edge = [process.env["ProgramFiles(x86)"], process.env.ProgramFiles]
    .filter(Boolean)
    .map((p) => join(p!, "Microsoft", "Edge", "Application", "msedge.exe"))
    .find(existsSync);
  const cmd =
    process.platform === "win32"
      ? edge
        ? [edge, `--app=${url}`, "--window-size=1400,900"]
        : ["rundll32", "url.dll,FileProtocolHandler", url]
      : process.platform === "darwin"
        ? ["open", url]
        : ["xdg-open", url];
  try {
    Bun.spawn(cmd, { stdout: "ignore", stderr: "ignore", stdin: "ignore" });
  } catch {}
}

// The native "choose folder" dialog, through PowerShell (Windows only).
export async function pickFolder(): Promise<string | null> {
  if (process.platform !== "win32") return null;
  const script =
    "Add-Type -AssemblyName System.Windows.Forms; $d = New-Object System.Windows.Forms.FolderBrowserDialog; " +
    "$d.Description = 'Choose a project folder for Maxx'; $d.ShowNewFolderButton = $true; " +
    "$f = New-Object System.Windows.Forms.Form -Property @{TopMost = $true}; " +
    "if ($d.ShowDialog($f) -eq 'OK') { [Console]::Out.Write($d.SelectedPath) }";
  const proc = Bun.spawn(["powershell.exe", "-NoProfile", "-STA", "-Command", script], { stdout: "pipe", stderr: "ignore" });
  const out = (await new Response(proc.stdout).text()).trim();
  await proc.exited;
  return out || null;
}
