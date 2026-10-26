import { expect, test } from "bun:test";
import { rescueToolCalls } from "../src/llm.ts";

const known = new Set(["read_file", "bash"]);

test("hermes-style <tool_call> block", () => {
  const calls = rescueToolCalls(`Let me look.\n<tool_call>\n{"name": "read_file", "arguments": {"path": "a.ts"}}\n</tool_call>`, known);
  expect(calls).toHaveLength(1);
  expect(JSON.parse(calls[0]!.arguments)).toEqual({ path: "a.ts" });
});

test("qwen3-coder xml function block", () => {
  const calls = rescueToolCalls(`<function=bash>\n<parameter=command>\nbun test\n</parameter>\n</function>`, known);
  expect(calls[0]?.name).toBe("bash");
  expect(JSON.parse(calls[0]!.arguments)).toEqual({ command: "bun test" });
});

test("fenced json with a trailing comma", () => {
  const calls = rescueToolCalls("```json\n{\"name\": \"bash\", \"arguments\": {\"command\": \"ls\",}}\n```", known);
  expect(calls[0]?.name).toBe("bash");
});

test("unknown tools and plain prose are ignored", () => {
  expect(rescueToolCalls(`<tool_call>{"name":"rm_rf","arguments":{}}</tool_call>`, known)).toHaveLength(0);
  expect(rescueToolCalls("All done! I fixed the bug.", known)).toHaveLength(0);
});
