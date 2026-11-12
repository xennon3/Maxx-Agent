import { describe, expect, test } from "bun:test";
import { MD_JS, renderMarkdown } from "../src/ui/markdown.ts";

const fence = "\x60\x60\x60";

describe("renderMarkdown", () => {
  test("headings, rules and paragraphs", () => {
    const h = renderMarkdown("## Shape of it\n\nTwo processes,\none socket.\n\n---\n# Big");
    expect(h).toContain("<h2>Shape of it</h2>");
    expect(h).toContain("<p>Two processes,<br>one socket.</p>");
    expect(h).toContain("<hr>");
    expect(h).toContain("<h1>Big</h1>");
  });

  test("tables with inline markdown and alignment", () => {
    const h = renderMarkdown("| Boundary | Handoff | Why |\n|---|:--:|--:|\n| ①→② | \x60float32[]\x60 at **16 kHz** | a \\| b |\n| x |");
    expect(h).toContain("<table>");
    expect(h).toContain("<th>Boundary</th>");
    expect(h).toContain('<td style="text-align:center"><code>float32[]</code> at <b>16 kHz</b></td>');
    expect(h).toContain('<td style="text-align:right">a | b</td>');
    expect((h.match(/<tr>/g) || []).length).toBe(3);
  });

  test("a pipe in a code span does not split a cell", () => {
    const h = renderMarkdown("| a | b |\n|--|--|\n| \x60x | y\x60 | z |");
    expect(h).toContain("<td><code>x | y</code></td><td>z</td>");
  });

  test("nested lists and task boxes", () => {
    const h = renderMarkdown("- one\n  - one.a\n  - one.b\n- two\n\n1. first\n2. [x] done");
    expect(h).toContain("<ul><li>one<ul><li>one.a</li><li>one.b</li></ul></li><li>two</li></ul>");
    expect(h).toContain("<ol><li>first</li><li>");
    expect(h).toContain("☑");
  });

  test("escapes HTML and only links http(s)", () => {
    const h = renderMarkdown("<script>x</script> [a](javascript:alert(1)) [b](https://e.com/x) *em* **b**");
    expect(h).not.toContain("<script>");
    expect(h).not.toContain('href="javascript');
    expect(h).toContain('<a href="https://e.com/x"');
    expect(h).toContain("<em>em</em>");
    expect(h).toContain("<b>b</b>");
  });

  test("snake_case and a*b*c stay as written", () => {
    const h = renderMarkdown("call read_file_now and 2*3*4");
    expect(h).toContain("read_file_now");
    expect(h).toContain("2*3*4");
  });

  test("box diagrams get one cell per character, and keep their text", () => {
    const art = "┌──┐\n│①→│\n└──┘";
    const h = renderMarkdown(fence + "\n" + art + "\n" + fence);
    expect(h).toContain('class="cb diagram"');
    expect(h).toContain('<i class="bx" style="--u:0;--d:1;--l:0;--r:1">┌</i>');
    expect(h).toContain('<i class="bx" style="--u:0;--d:0;--l:1;--r:1;width:2ch">──</i>');
    expect(h).toContain('<i class="gc">①</i>');
    expect(h).toContain("Redraw as diagram");
    // Strip the tags: the diagram's text comes back exactly.
    const text = h.match(/<pre>([\s\S]*?)<\/pre>/)![1].replace(/<[^>]+>/g, "");
    expect(text).toBe(art);
  });

  test("emoji take two cells, plain code stays plain", () => {
    expect(renderMarkdown(fence + "\nok ✅\n" + fence)).toContain('<i class="gc w2">✅</i>');
    const plain = renderMarkdown(fence + "ts\nconst a = 1 < 2;\n" + fence);
    expect(plain).toContain("<pre>const a = 1 &lt; 2;</pre>");
    expect(plain).not.toContain("diagram");
  });

  test("an unclosed fence while streaming is still code", () => {
    expect(renderMarkdown("Here:\n" + fence + "py\nprint(1)")).toContain("<pre>print(1)</pre>");
  });

  test("the page copy runs", () => {
    expect(MD_JS.toLowerCase()).not.toContain("</script");
    const fn = new Function("return " + renderMarkdown.toString())();
    expect(fn("## Hi")).toContain("<h2>Hi</h2>");
  });
});
