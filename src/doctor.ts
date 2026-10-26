import { complete, type LLMConfig } from "./llm.ts";
import { toolSpecs, findTool } from "./tools/index.ts";

// Canned tool-call probes: does this model + template + server produce real,
// valid tool calls? Run it whenever you switch models or update LM Studio.
const PROBES = [
  { ask: "Show me the contents of package.json.", tool: "read_file", check: (a: any) => /package\.json$/.test(a.path) },
  { ask: "Find every place the word TODO appears in the src folder.", tool: "grep", check: (a: any) => /TODO/.test(a.pattern) },
  { ask: "Run the test suite with `bun test`.", tool: "bash", check: (a: any) => /bun test/.test(a.command) },
  { ask: "In src/app.ts, change the line `const port = 3000;` to `const port = 8080;`.", tool: "edit_file", check: (a: any) => /3000/.test(a.old_string) && /8080/.test(a.new_string) },
];

export async function doctor(llm: LLMConfig, log = console.log): Promise<boolean> {
  log(`Probing ${llm.model} at ${llm.baseURL}\n`);
  const specs = toolSpecs();
  let passed = 0;
  for (const p of PROBES) {
    const started = performance.now();
    let verdict: string;
    try {
      const res = await complete(llm, [
        { role: "system", content: "You are a coding agent. Use the provided tools to act; do not explain." },
        { role: "user", content: p.ask },
      ], specs);
      const call = res.toolCalls[0];
      const secs = ((performance.now() - started) / 1000).toFixed(1);
      if (!call) verdict = `FAIL  no tool call (replied: ${res.content.slice(0, 80).replace(/\n/g, " ")})`;
      else if (call.name !== p.tool) verdict = `FAIL  called ${call.name}, expected ${p.tool}`;
      else {
        const parsed = findTool(call.name)!.schema.safeParse(JSON.parse(call.arguments || "{}"));
        if (!parsed.success) verdict = `FAIL  invalid arguments ${call.arguments}`;
        else if (!p.check(parsed.data)) verdict = `FAIL  unexpected arguments ${call.arguments}`;
        else {
          passed++;
          verdict = `pass${res.rescued ? " (rescued from text)" : ""}`;
        }
      }
      log(`  ${p.tool.padEnd(10)} ${verdict}  ${secs}s`);
    } catch (e) {
      log(`  ${p.tool.padEnd(10)} ERROR ${(e as Error).message}`);
    }
  }
  log(`\n${passed}/${PROBES.length} probes passed.`);
  return passed === PROBES.length;
}
