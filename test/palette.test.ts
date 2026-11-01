import { expect, test } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Agent, withPalette, type AgentIO } from "../src/loop.ts";
import { Permissions } from "../src/permissions.ts";
import { contrast, harmony, loadPalette, mentionedPalette, parsePalette, PRESETS, randomPalette, resolvePalette, savePalette } from "../src/palette.ts";

test("palettes come from presets, hex lists, one color and a harmony, coolors links, or a random roll", () => {
  expect(parsePalette("auto")).toBeNull();
  expect(parsePalette("Synthwave")!.colors).toEqual(PRESETS.synthwave!.colors);
  expect(parsePalette("gameboy")!.name).toBe("handheld");
  expect(parsePalette("#264653, #2a9d8f #E9C46A")!.colors).toEqual(["#264653", "#2a9d8f", "#e9c46a"]);
  expect(parsePalette("brand: #111 #f60")).toMatchObject({ name: "brand", colors: ["#111111", "#ff6600"] });
  expect(parsePalette("https://coolors.co/palette/264653-2a9d8f-e9c46a-f4a261-e76f51")!.colors).toHaveLength(5);
  const tri = parsePalette("#ff6600 triad")!;
  expect(tri.colors).toContain("#ff6600");
  expect(tri.colors.length).toBeGreaterThanOrEqual(4);
  expect(parsePalette("#ff6600")!.name).toBe("#ff6600 analogous");
  expect(randomPalette(42)).toEqual(randomPalette(42));
  expect(randomPalette(42).name).toMatch(/^\w+ \w+$/);
  expect(() => parsePalette("glitter")).toThrow("unknown palette");
  expect(() => parsePalette("#ff6600 sparkly")).toThrow("harmony");
});

test("every preset and generated palette has readable text on its background", () => {
  for (const [name, p] of Object.entries(PRESETS)) expect([name, contrast(p.bg, p.ink) >= 4.5]).toEqual([name, true]);
  for (const k of ["analogous", "complementary", "triad", "split", "tetrad", "mono"] as const) {
    const p = harmony("#3366cc", k);
    expect(contrast(p.bg!, p.ink!)).toBeGreaterThanOrEqual(4.5);
    for (const c of p.colors) expect(c).toMatch(/^#[0-9a-f]{6}$/);
  }
});

test("a palette named in a message is picked up for that request", () => {
  expect(mentionedPalette("make a snake game in synthwave colors")!.name).toBe("synthwave");
  expect(mentionedPalette("chart it with the color scheme: pastel")!.name).toBe("pastel");
  expect(mentionedPalette("use the palette #0b132b #3a506b #5bc0be for the site")!.colors).toEqual(["#0b132b", "#3a506b", "#5bc0be"]);
  expect(mentionedPalette("here: https://coolors.co/264653-2a9d8f-e9c46a")!.name).toBe("coolors");
  expect(mentionedPalette("give it a random palette", 7)!.colors.length).toBeGreaterThan(2);
  expect(mentionedPalette("what's the ocean temperature in May?")).toBeUndefined();
  expect(mentionedPalette("fix the build")).toBeUndefined();
  const sent = withPalette("draw it in sunset colors", null);
  expect(sent).toContain("#e56b6f");
  expect(withPalette("draw it in sunset colors", parsePalette("sunset"))).toBe("draw it in sunset colors");
  const parts = withPalette([{ type: "text" as const, text: "a pico palette pixel game" }], null);
  expect(parts[0]!.type === "text" && parts[0]!.text).toContain("#ff004d");
});

test("the palette is saved, the flag wins, and it goes into the prompt and switches in place", async () => {
  const home = process.env.MAXX_HOME;
  process.env.MAXX_HOME = await mkdtemp(join(tmpdir(), "maxx-palette-home-"));
  try {
    expect(await loadPalette()).toBeNull();
    const roll = randomPalette(3);
    await savePalette(roll);
    expect(await loadPalette()).toEqual(roll);
    expect((await resolvePalette(undefined, { MAXX_PALETTE: "ocean" }))!.name).toBe("ocean");
    expect(await resolvePalette("auto", { MAXX_PALETTE: "ocean" })).toBeNull();

    const cwd = await mkdtemp(join(tmpdir(), "maxx-palette-"));
    const io: AgentIO = { token: () => {}, toolStart: () => {}, toolEnd: () => {}, note: () => {}, ask: async () => "no" };
    const llm = { baseURL: "http://localhost:1/v1", model: "fake" };
    const online = async () => ({ tools: [], notes: [], servers: [] });
    for (const chat of [false, true]) {
      const agent = await new Agent({ llm, cwd, permissions: await new Permissions(cwd, "ask").load(), online, chat, palette: parsePalette("forest") }, io).init();
      expect(String(agent.history[0]!.content)).toContain('Color palette "forest": #283618');
      await agent.setPalette(null);
      expect(String(agent.history[0]!.content)).not.toContain("Color palette");
      expect(agent.history.filter((m) => m.role === "system")).toHaveLength(1);
    }
  } finally {
    if (home === undefined) delete process.env.MAXX_HOME;
    else process.env.MAXX_HOME = home;
  }
});
