import { expect, test } from "bun:test";
import { SKINS, SKIN_CSS, SKIN_DEFAULT, SKIN_BOOT } from "../src/ui/themes-page.ts";
import { PAGE } from "../src/ui/page.ts";

test("every theme has its own look and the default exists", () => {
  expect(SKINS.some((s) => s.id === SKIN_DEFAULT)).toBe(true);
  for (const s of SKINS.filter((s) => !s.id.startsWith("classic"))) {
    expect(SKIN_CSS).toContain(`[data-skin="${s.id}"] {`);
    expect(SKIN_CSS).toContain(`html[data-skin="${s.id}"]`);
  }
});

test("theme fonts are baked in, so they work offline", () => {
  expect(SKIN_CSS).not.toContain("fonts.googleapis");
  for (const f of ["Space Grotesk", "VT323", "Orbitron", "Architects Daughter", "Archivo Black", "Syne"]) expect(SKIN_CSS).toContain(`font-family:"${f}";src:url(data:font/woff2;base64,`);
});

test("the page applies the saved theme before it paints, and has the picker", () => {
  expect(PAGE.indexOf(SKIN_BOOT)).toBeLessThan(PAGE.indexOf("<style>"));
  for (const id of ["skinBtn", "skinDlg", "skinGrid"]) expect(PAGE).toContain(`id="${id}"`);
});
