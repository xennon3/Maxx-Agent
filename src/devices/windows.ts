import { tmpdir } from "node:os";
import { join } from "node:path";
import { readFile, rm } from "node:fs/promises";
import { run, text, record } from "./run.ts";
import { Screen, type Element } from "./screen.ts";

// Windows desktop control through one PowerShell helper script: screenshots,
// UI Automation elements, mouse and keyboard via user32 SendInput.
// Each call is a fresh powershell.exe; arguments travel as base64 JSON so
// nothing gets mangled by Windows command-line quoting.

export const desktop = new Screen("Desktop");

// Mouse in the top-left corner of the screen = stop. Checked before every action.
export const FAILSAFE_EXIT = 3;

const HELPER = String.raw`
param([string]$Action, [string]$ArgB64 = "")
$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$a = if ($ArgB64) { [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($ArgB64)) | ConvertFrom-Json } else { $null }

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public static class MaxxWin {
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern bool GetCursorPos(out POINT p);
  [DllImport("user32.dll")] public static extern int GetSystemMetrics(int i);
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern int GetWindowText(IntPtr h, System.Text.StringBuilder s, int n);
  [DllImport("user32.dll", SetLastError = true)] public static extern uint SendInput(uint n, INPUT[] inputs, int size);
  public struct POINT { public int X; public int Y; }
  [StructLayout(LayoutKind.Sequential)] public struct MOUSEINPUT { public int dx; public int dy; public uint mouseData; public uint dwFlags; public uint time; public IntPtr dwExtraInfo; }
  [StructLayout(LayoutKind.Sequential)] public struct KEYBDINPUT { public ushort wVk; public ushort wScan; public uint dwFlags; public uint time; public IntPtr dwExtraInfo; }
  [StructLayout(LayoutKind.Explicit)] public struct UNION { [FieldOffset(0)] public MOUSEINPUT mi; [FieldOffset(0)] public KEYBDINPUT ki; }
  [StructLayout(LayoutKind.Sequential)] public struct INPUT { public uint type; public UNION u; }
  static void Send(INPUT i) { SendInput(1, new INPUT[] { i }, Marshal.SizeOf(typeof(INPUT))); }
  public static void Mouse(uint flags, int data) { INPUT i = new INPUT(); i.type = 0; i.u.mi.dwFlags = flags; i.u.mi.mouseData = (uint)data; Send(i); }
  public static void Key(ushort vk, bool up) { INPUT i = new INPUT(); i.type = 1; i.u.ki.wVk = vk; i.u.ki.dwFlags = up ? 2u : 0u; Send(i); }
  public static void Char(char c) {
    INPUT d = new INPUT(); d.type = 1; d.u.ki.wScan = c; d.u.ki.dwFlags = 4; Send(d);
    INPUT u = new INPUT(); u.type = 1; u.u.ki.wScan = c; u.u.ki.dwFlags = 6; Send(u);
  }
  public static string Title() { var s = new System.Text.StringBuilder(512); GetWindowText(GetForegroundWindow(), s, 512); return s.ToString(); }
}
"@
[void][MaxxWin]::SetProcessDPIAware()

function Out-Json($o) { [Console]::Out.Write((ConvertTo-Json -InputObject $o -Compress -Depth 5)) }

if ($Action -ne "screenshot") {
  $p = New-Object MaxxWin+POINT
  [void][MaxxWin]::GetCursorPos([ref]$p)
  if ($p.X -le 0 -and $p.Y -le 0) { [Console]::Error.Write("failsafe"); exit 3 }
}

switch ($Action) {
  "screenshot" {
    Add-Type -AssemblyName System.Drawing
    $w = [MaxxWin]::GetSystemMetrics(0); $h = [MaxxWin]::GetSystemMetrics(1)
    $bmp = New-Object System.Drawing.Bitmap $w, $h
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.CopyFromScreen(0, 0, 0, 0, $bmp.Size)
    $bmp.Save($a.path, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose()
    $els = @()
    if ($a.elements) {
      try {
        Add-Type -AssemblyName UIAutomationClient, UIAutomationTypes
        $root = [System.Windows.Automation.AutomationElement]::FromHandle([MaxxWin]::GetForegroundWindow())
        $all = $root.FindAll([System.Windows.Automation.TreeScope]::Descendants, [System.Windows.Automation.Condition]::TrueCondition)
        $keep = "Button","Edit","MenuItem","ListItem","Hyperlink","CheckBox","RadioButton","TabItem","ComboBox","TreeItem","Slider","SplitButton","DataItem","MenuBarItem"
        foreach ($e in $all) {
          $c = $e.Current
          if ($c.IsOffscreen) { continue }
          $t = $c.ControlType.ProgrammaticName -replace "ControlType\.", ""
          if ($keep -notcontains $t) { continue }
          $r = $c.BoundingRectangle
          if ($r.IsEmpty -or $r.Width -lt 4 -or $r.Height -lt 4) { continue }
          $els += [pscustomobject]@{ name = $c.Name; type = $t; x1 = [int]$r.Left; y1 = [int]$r.Top; x2 = [int]$r.Right; y2 = [int]$r.Bottom }
          if ($els.Count -ge $a.limit) { break }
        }
      } catch { }
    }
    Out-Json ([pscustomobject]@{ width = $w; height = $h; title = [MaxxWin]::Title(); elements = @($els) })
  }
  "click" {
    [void][MaxxWin]::SetCursorPos($a.x, $a.y)
    Start-Sleep -Milliseconds 40
    $down = 2; $up = 4
    if ($a.button -eq "right") { $down = 8; $up = 16 }
    if ($a.button -eq "middle") { $down = 32; $up = 64 }
    for ($i = 0; $i -lt $a.count; $i++) { [MaxxWin]::Mouse($down, 0); [MaxxWin]::Mouse($up, 0); Start-Sleep -Milliseconds 60 }
    Out-Json "ok"
  }
  "drag" {
    [void][MaxxWin]::SetCursorPos($a.x, $a.y); [MaxxWin]::Mouse(2, 0)
    for ($i = 1; $i -le 20; $i++) { [void][MaxxWin]::SetCursorPos([int]($a.x + ($a.x2 - $a.x) * $i / 20), [int]($a.y + ($a.y2 - $a.y) * $i / 20)); Start-Sleep -Milliseconds 15 }
    [MaxxWin]::Mouse(4, 0)
    Out-Json "ok"
  }
  "scroll" {
    if ($null -ne $a.x) { [void][MaxxWin]::SetCursorPos($a.x, $a.y) }
    $flag = 2048; if ($a.horizontal) { $flag = 4096 }
    [MaxxWin]::Mouse($flag, [int]$a.delta)
    Out-Json "ok"
  }
  "type" {
    foreach ($ch in $a.text.ToCharArray()) {
      if ($ch -eq [char]10) { [MaxxWin]::Key(13, $false); [MaxxWin]::Key(13, $true) }
      elseif ($ch -ne [char]13) { [MaxxWin]::Char($ch) }
      Start-Sleep -Milliseconds 4
    }
    Out-Json "ok"
  }
  "keys" {
    foreach ($vk in $a.vks) { [MaxxWin]::Key([uint16]$vk, $false); Start-Sleep -Milliseconds 20 }
    [array]::Reverse($a.vks)
    foreach ($vk in $a.vks) { [MaxxWin]::Key([uint16]$vk, $true) }
    Out-Json "ok"
  }
  "open" {
    Start-Process $a.target
    Out-Json "ok"
  }
  default { [Console]::Error.Write("unknown action $Action"); exit 2 }
}
`;

let helperPath: string | null = null;
async function helper() {
  if (helperPath) return helperPath;
  const p = join(tmpdir(), `maxx-desktop-${Bun.hash(HELPER).toString(16)}.ps1`);
  // UTF-8 with BOM so Windows PowerShell 5.1 reads it as UTF-8.
  await Bun.write(p, "﻿" + HELPER);
  return (helperPath = p);
}

export async function win(action: string, args: Record<string, unknown> = {}, timeout = 60): Promise<unknown> {
  if (process.platform !== "win32" && !process.env.MAXX_DESKTOP_FAKE) throw new Error("desktop control is only implemented for Windows so far");
  const b64 = Buffer.from(JSON.stringify(args), "utf8").toString("base64");
  const r = await run(["powershell.exe", "-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", await helper(), "-Action", action, "-ArgB64", b64], { timeout });
  if (r.code === FAILSAFE_EXIT) throw new Error("STOPPED: the user moved the mouse to the top-left corner (failsafe). Do not continue desktop actions; ask the user what to do.");
  if (r.code !== 0) throw new Error(`desktop ${action} failed: ${r.stderr.trim() || text(r).trim()}`);
  const out = text(r).trim();
  return out ? JSON.parse(out) : null;
}

// Recorded so `maxx replay` can run it again (in screen pixels).
export async function winAct(action: string, args: Record<string, unknown>, note: string) {
  await record({ kind: "desktop", action, args, note });
  return win(action, args);
}

type Shot = { width: number; height: number; title: string; elements: { name: string; type: string; x1: number; y1: number; x2: number; y2: number }[] | object };

export async function look(opts: { marks?: boolean; elements?: boolean } = {}) {
  const path = join(tmpdir(), `maxx-shot-${process.pid}-${Date.now()}.png`);
  const wantEls = opts.elements !== false;
  const info = (await win("screenshot", { path, elements: wantEls, limit: 80 })) as Shot;
  const png = new Uint8Array(await readFile(path));
  await rm(path, { force: true });
  const raw = Array.isArray(info.elements) ? info.elements : info.elements && "x1" in info.elements ? [info.elements] : [];
  const els: Omit<Element, "n">[] = raw.map((e: any) => ({
    label: [e.type, e.name && JSON.stringify(String(e.name).slice(0, 60))].filter(Boolean).join(" "),
    bounds: { x1: e.x1, y1: e.y1, x2: e.x2, y2: e.y2 },
  }));
  const l = desktop.look(png, els, { marks: opts.marks });
  return { png, title: info.title, ...l, text: `Foreground window: ${JSON.stringify(info.title)}\n${l.text}` };
}

// "ctrl+shift+s", "alt+f4", "enter", "win+r" to virtual-key codes, pressed in order.
const VK: Record<string, number> = {
  ctrl: 0x11, control: 0x11, shift: 0x10, alt: 0x12, win: 0x5b, windows: 0x5b, cmd: 0x5b, meta: 0x5b,
  enter: 0x0d, return: 0x0d, tab: 0x09, esc: 0x1b, escape: 0x1b, space: 0x20, backspace: 0x08, delete: 0x2e, del: 0x2e, insert: 0x2d,
  home: 0x24, end: 0x23, pageup: 0x21, pagedown: 0x22, up: 0x26, down: 0x28, left: 0x25, right: 0x27,
  printscreen: 0x2c, capslock: 0x14, menu: 0x5d, plus: 0xbb, minus: 0xbd, comma: 0xbc, period: 0xbe,
};

export function parseKeys(combo: string): number[] {
  return combo
    .toLowerCase()
    .split(/\s*\+\s*/)
    .filter(Boolean)
    .map((k) => {
      if (VK[k] !== undefined) return VK[k]!;
      const f = k.match(/^f(\d{1,2})$/);
      if (f && Number(f[1]) >= 1 && Number(f[1]) <= 24) return 0x6f + Number(f[1]);
      if (/^[a-z0-9]$/.test(k)) return k.toUpperCase().charCodeAt(0);
      throw new Error(`unknown key "${k}" in "${combo}". Use names like ctrl, shift, alt, win, enter, tab, esc, f5, a-z, 0-9.`);
    });
}
