import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spendSync } from "./ledger.ts";

// Stands in for ./gradlew assembleDebug. "Compiles" by checking the Kotlin
// source for obvious syntax trouble, then packs the source into the APK so the
// fake phone can run it. Build times modeled on 16 Zen 5 cores with a warm
// Gradle daemon after the first build.
const dir = process.cwd();
const src = join(dir, "app/src/main/java/com/example/tipcalc/MainActivity.kt");
const gradle = ["app/build.gradle.kts", "app/build.gradle"].map((f) => join(dir, f)).find(existsSync);
if (!gradle || !existsSync(src)) {
  console.error(`FAILURE: Build failed with an exception.\n* What went wrong: Project 'app' not found or has no sources (${src}).`);
  process.exit(1);
}
const code = readFileSync(src, "utf8");
const opens = (code.match(/\{/g) ?? []).length, closes = (code.match(/\}/g) ?? []).length;
const cold = !existsSync(join(dir, ".gradle-sim-warm"));
spendSync("gradle", cold ? "cold build (daemon start, deps cached)" : "incremental build", cold ? 75 : 14);
if (opens !== closes) {
  console.error(`e: file://${src}: Expecting '}'\n\nFAILURE: Build failed with an exception.\n* What went wrong:\nExecution failed for task ':app:compileDebugKotlin'.`);
  process.exit(1);
}
writeFileSync(join(dir, ".gradle-sim-warm"), "");
const pkg = readFileSync(gradle, "utf8").match(/applicationId\s*=\s*"([\w.]+)"/)?.[1] ?? "com.example.app";
const outDir = join(dir, "app/build/outputs/apk/debug");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "app-debug.apk"), JSON.stringify({ pkg, src: code }));
console.log(`> Task :app:compileDebugKotlin\n> Task :app:packageDebug\n> Task :app:assembleDebug\n\nBUILD SUCCESSFUL in ${cold ? "1m 15s" : "14s"}\n34 actionable tasks: ${cold ? 34 : 5} executed`);
