// The simulated model. It plays a competent local model step by step, but it
// decides only from what Maxx actually sends it (tool results, element lists,
// crash logs, images), so the whole real pipeline is exercised.

export type Reply = { text: string } | { tool: string; args: Record<string, unknown> };

const BUGGY = `package com.example.tipcalc

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.activity.ComponentActivity

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        val bill = findViewById<EditText>(R.id.bill)
        var lastBill = "".toDouble()
        val tip = findViewById<EditText>(R.id.tip)
        val result = findViewById<TextView>(R.id.result)
        findViewById<Button>(R.id.calculate).setOnClickListener {
            val b = bill.text.toString().toDoubleOrNull() ?: 0.0
            val p = tip.text.toString().toDoubleOrNull() ?: 0.0
            val t = b * p / 100
            result.text = "Tip: $%.2f · Total: $%.2f".format(t, b + t)
            lastBill = b
        }
    }
}
`;

const GRADLE = `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.example.tipcalc"
    compileSdk = 35
    defaultConfig {
        applicationId = "com.example.tipcalc"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }
}
`;

type Msg = { role: string; content: any; tool_calls?: { function: { name: string; arguments: string } }[] };

export function think(messages: Msg[]): Reply {
  let u = messages.length - 1;
  while (u >= 0 && !(messages[u]!.role === "user" && typeof messages[u]!.content === "string" && !messages[u]!.content.startsWith("Summary of"))) u--;
  const ask: string = messages[u]?.content ?? "";
  const turn = messages.slice(u + 1);
  const done = turn.flatMap((m) => m.tool_calls?.map((c) => c.function.name) ?? []);
  const results = turn.filter((m) => m.role === "tool").map((m) => String(m.content));
  const last = results.at(-1) ?? "";
  const count = (n: string) => done.filter((d) => d === n).length;
  const el = (id: string) => Number(last.match(new RegExp(`\\[(\\d+)\\][^\\n]*#${id}\\b`))?.[1]);

  if (/tip calculator/i.test(ask)) {
    if (!done.length) return { tool: "list_files", args: { path: "." } };
    if (count("write_file") === 0) return { tool: "write_file", args: { path: "app/build.gradle.kts", content: GRADLE } };
    if (count("write_file") === 1) return { tool: "write_file", args: { path: "app/src/main/java/com/example/tipcalc/MainActivity.kt", content: BUGGY } };
    if (count("android_run") === 0) return { tool: "android_run", args: {} };
    if (count("android_run") === 1) {
      if (!/CRASHED/.test(results.find((r) => /launched|CRASHED|failed/.test(r)) ?? "")) return { text: "Built and launched without a crash on the first try." };
      if (!count("android_logcat")) return { tool: "android_logcat", args: { crashes: true } };
      if (!count("read_file")) return { tool: "read_file", args: { path: "app/src/main/java/com/example/tipcalc/MainActivity.kt" } };
      if (!count("edit_file")) return { tool: "edit_file", args: { path: "app/src/main/java/com/example/tipcalc/MainActivity.kt", old_string: `var lastBill = "".toDouble()`, new_string: "var lastBill = 0.0" } };
      return { tool: "android_run", args: {} };
    }
    if (count("android_type") === 0) {
      if (!el("bill")) return { text: `The app launched but I can't find the bill field. Last result:\n${last.slice(0, 400)}` };
      return { tool: "android_type", args: { element: el("bill"), text: "42.50" } };
    }
    if (count("android_type") === 1) return { tool: "android_type", args: { element: el("tip"), text: "18" } };
    if (count("android_tap") === 0) return { tool: "android_tap", args: { text: "Calculate" } };
    const ok = /Tip: \$7\.65 · Total: \$50\.15/.test(last);
    return {
      text: ok
        ? "The tip calculator works on your phone. The first build crashed on launch (NumberFormatException: an empty string was parsed in onCreate); I replaced it with 0.0, rebuilt, and tested it: a $42.50 bill at 18% shows Tip: $7.65 · Total: $50.15."
        : `The app runs, but the result looked wrong after tapping Calculate:\n${last.slice(0, 300)}`,
    };
  }

  if (/last time/i.test(ask)) {
    const earlier = messages.slice(0, u).some((m) => m.role === "assistant" && typeof m.content === "string" && /tip calculator works/i.test(m.content));
    if (!earlier) return { text: "I don't have any earlier work in this session." };
    if (!done.length) return { tool: "android_screen", args: {} };
    const still = /#calculate/.test(last) || /"Tip Calculator"/.test(last);
    return { text: `Last time we built the tip calculator (com.example.tipcalc) and fixed a launch crash. ${still ? "It's still installed and on screen." : "It's no longer on screen."}` };
  }

  if (/readme/i.test(ask)) {
    if (!done.length) return { tool: "read_file", args: { path: "README.md" } };
    if (!count("edit_file")) return { tool: "edit_file", args: { path: "README.md", old_string: "recieve", new_string: "receive" } };
    return { text: "Fixed the typo in README.md (recieve → receive)." };
  }

  return { text: "Done." };
}

// The "eyes" model in setup B only sees the screenshot and the tool's text.
export function describe(context: string, images: number): string {
  const els = [...context.matchAll(/\[(\d+)\] ([^@\n]+)@/g)].map((m) => `[${m[1]}] ${m[2]!.trim()}`);
  return `${images} screenshot(s). ${els.length ? `Visible: ${els.join("; ")}.` : "A home screen."} Nothing looks broken.`;
}
