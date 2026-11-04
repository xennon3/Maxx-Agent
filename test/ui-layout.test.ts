import { expect, test } from "bun:test";
import { PAGE } from "../src/ui/page.ts";

// Every element the script looks up by id must be in the page, so moving a control
// (like the header chips into the ⚙ Settings menu) can't leave a handler on a missing element.
test("every $(id) the page's script uses exists in the page", () => {
  const html = PAGE.replace(/<script>[\s\S]*?<\/script>/g, "");
  const js = PAGE.split("<script>")[1]!.split("</script>")[0]!;
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  // Elements the script builds itself: el.id = "x", or id="x" / id=x inside an HTML string.
  const made = new Set([...js.matchAll(/\.id = "([^"]+)"|\bid=\\?"?([A-Za-z][\w-]*)/g)].map((m) => m[1] ?? m[2]));
  const used = new Set([...js.matchAll(/\$\("([A-Za-z][\w-]*)"\)/g)].map((m) => m[1]!));
  const missing = [...used].filter((id) => !ids.has(id) && !made.has(id));
  expect(missing).toEqual([]);
});

test("the header is one row: toolsets and settings live in two menus", () => {
  const header = PAGE.split("<header>")[1]!.split("</header>")[0]!;
  expect(header).not.toContain('class="chip');
  for (const id of ["modeSeg", "model", "toolsBtn", "tuneBtn", "newBtn"]) expect(header).toContain(`id="${id}"`);
  const menu = PAGE.split('id="tunePop"')[1]!.split('<div class="board"')[0]!;
  for (const id of ["mode", "netBtn", "briefSeg", "thinkSeg", "palBtn", "rulesBtn", "helperBtn", "agentCfg", "crewCfg"]) expect(menu).toContain(`id="${id}"`);
  expect(PAGE.split('id="toolsPop"')[1]!.split('id="tunePop"')[0]).toContain('id="sets"');
});
