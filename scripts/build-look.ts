// Builds src/look/look.bundle.js: three.js r180 + its add-ons + the LOOK kit
// as one classic script (works from file:// and next to old global-THREE code).
// Run after changing src/look/runtime: bun scripts/build-look.ts
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const r = await Bun.build({ entrypoints: [join(root, "src/look/runtime/index.js")], format: "iife", minify: true, target: "browser" });
if (!r.success) {
  console.error(r.logs.join("\n"));
  process.exit(1);
}
const code = await r.outputs[0]!.text();
const audit = readFileSync(join(root, "src/look/audit-page.js"), "utf8").trim();
const out = `/* LOOK ${JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version} for Maxx: three.js r180 (MIT) + LOOK realism kit. */\n${code}\nwindow.__LOOK_AUDIT__ = function () { return ${audit.replace(/^[\s\S]*?\(function lookAudit/, "(function lookAudit")}; };\n`;
writeFileSync(join(root, "src/look/look.bundle.js"), out);
console.log(`src/look/look.bundle.js: ${(out.length / 1024).toFixed(0)} KB`);
