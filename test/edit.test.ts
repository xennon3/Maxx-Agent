import { expect, test } from "bun:test";
import { applyEdit, changedLines } from "../src/tools/edit.ts";

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

test("an edit that was already made is reported as done, not as missing", () => {
  const once = applyEdit(src, `return "hi";`, `return "hello";`);
  const again = once.ok ? applyEdit(once.text, `return "hi";`, `return "hello";`) : once;
  expect(again.ok && again.how).toBe("already");
  expect(again.ok && again.text).toBe(once.ok ? once.text : "");
});

test("the changed lines are shown with a little context", () => {
  const after = src.replace(`return "hi";`, `return "hello";`);
  expect(changedLines(src, after)).toBe(`    1  function greet(name) {\n    2      if (!name) {\n    3          return "hello";\n    4      }\n    5      return "hi " + name;`);
});
