import { expect, test } from "bun:test";
import { ACTS, ALIEN_JS, CHARS, PICS, TOOL_ACT, alienSvg } from "../src/ui/aliens-page.ts";
import { PAGE } from "../src/ui/page.ts";

test("every alien can play every scene", () => {
  for (const c of Object.keys(CHARS)) for (const a of Object.keys(ACTS)) {
    const svg = alienSvg(c, a);
    expect(svg.startsWith(`<svg class="al c-${c} a-${a}"`)).toBe(true);
    expect(svg).not.toContain("undefined");
    expect(svg).not.toContain("NaN");
  }
});

test("tools map to the scene that matches them", () => {
  const act = (t: string) => TOOL_ACT.find(([re]) => re.test(t))?.[1] ?? "run";
  expect(act("write_file")).toBe("type");
  expect(act("read_file")).toBe("read");
  expect(act("bash")).toBe("run");
  expect(act("web_search")).toBe("web");
  expect(act("draw_svg")).toBe("draw");
  expect(act("android_tap")).toBe("phone");
  expect(act("make_sounds")).toBe("sound");
});

test("the buddy is in the page and the spliced script parses", () => {
  expect(PAGE).toContain('id="actBuddy"');
  expect(PAGE).toContain('id="alienBtn"');
  expect(ALIEN_JS).not.toContain("`");
  const js = PAGE.split("<script>")[1]!.split("</script>")[0]!;
  expect(() => new Function(js)).not.toThrow();
});

test("the drawn alien has a picture for every scene and is the default", () => {
  for (const c of Object.keys(PICS)) for (const a of Object.keys(ACTS)) expect(alienSvg(c, a)).toStartWith('<img class="alimg" alt="" src="data:image/webp;base64,');
  expect(ALIEN_JS).toContain('pick: "hoodie"');
});
