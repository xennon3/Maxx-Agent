import { expect, test } from "bun:test";
import { applyEdit } from "../src/tools/edit.ts";

const src = `function greet(name) {
    if (!name) {
        return "hi";
    }
    return "hi " + name;
}
`;

test("exact unique match", () => {
  const r = applyEdit(src, `return "hi";`, `return "hello";`);
  expect(r.ok && r.how).toBe("exact");
  expect(r.ok && r.text).toContain(`return "hello";`);
});

test("ambiguous exact match is refused", () => {
  const r = applyEdit(src, `"hi`, `"yo`);
  expect(r.ok).toBe(false);
  expect(!r.ok && r.error).toContain("matches 2 places");
});

test("replace_all replaces every match", () => {
  const r = applyEdit(src, `"hi`, `"yo`, true);
  expect(r.ok && r.text.match(/"yo/g)?.length).toBe(2);
});

test("wrong indentation still matches and is re-indented", () => {
  const r = applyEdit(src, `if (!name) {\n    return "hi";\n}`, `if (!name) {\n    return "who?";\n}`);
  expect(r.ok && r.how).toBe("whitespace");
  expect(r.ok && r.text).toContain(`    if (!name) {\n        return "who?";\n    }`);
});

test("missing text suggests the closest line", () => {
  const r = applyEdit(src, `return "hi" + nam;`, `x`);
  expect(r.ok).toBe(false);
  expect(!r.ok && r.error).toContain("closest line is 5");
});
