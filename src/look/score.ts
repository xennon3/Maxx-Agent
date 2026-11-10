import type { Raw } from "../image.ts";

// The look score: what the live scene and its screenshot say about how a 3D
// game will look to a player, as numbered fixes a small model can act on.

export type Audit = {
  three: string | null; look: boolean; preset: string | null; quality: string | null;
  scenes: number; renderers: number; meshes: number; triangles: number; materials: Record<string, number>;
  flatBig: number; flatBigNames: string[]; stretched: string[]; boxes: number; primitives: number;
  shadowsOn: boolean; toneMapping: string | null; colorSpace: string | null; env: boolean; fog: boolean;
  lights: Record<string, number>; castShadow: number; emissive: number; bigPlanes: number;
  people: { name: string; height: number }[]; buildings: number[]; post: boolean | null; sky: boolean; extent: number; instanced: number; textures: number;
};

export type Pixels = { mean: number; p5: number; p95: number; flat: number; saturation: number; colorful: number; blown: number; crushed: number };

export type Issue = { cost: number; what: string; fix: string };

// Image statistics on the screenshot (sRGB, 0..1).
export function pixelStats(img: Raw): Pixels {
  const { width: w, height: h, data } = img;
  const hist = new Uint32Array(256);
  let sum = 0, sat = 0, n = 0, blown = 0, crushed = 0, rg = 0, yb = 0, rg2 = 0, yb2 = 0;
  for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) {
    const i = (y * w + x) * 4;
    const r = data[i]!, g = data[i + 1]!, b = data[i + 2]!;
    const l = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
    hist[l]!++;
    sum += l;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    sat += mx ? (mx - mn) / mx : 0;
    if (l > 250) blown++;
    if (l < 6) crushed++;
    const a = r - g, c = 0.5 * (r + g) - b;
    rg += a; yb += c; rg2 += a * a; yb2 += c * c;
    n++;
  }
  const pct = (p: number) => {
    let acc = 0;
    for (let i = 0; i < 256; i++) {
      acc += hist[i]!;
      if (acc >= n * p) return i / 255;
    }
    return 1;
  };
  // Flat areas: 16 px tiles with almost no variation, in the lower two thirds
  // (the sky is allowed to be smooth).
  let tiles = 0, flat = 0;
  const T = 16;
  for (let ty = Math.floor(h / 3); ty + T <= h; ty += T) for (let tx = 0; tx + T <= w; tx += T) {
    let s = 0, s2 = 0, k = 0;
    for (let y = ty; y < ty + T; y += 2) for (let x = tx; x < tx + T; x += 2) {
      const i = (y * w + x) * 4;
      const l = 0.2126 * data[i]! + 0.7152 * data[i + 1]! + 0.0722 * data[i + 2]!;
      s += l; s2 += l * l; k++;
    }
    const v = s2 / k - (s / k) ** 2;
    tiles++;
    if (v < 4) flat++;
  }
  const mrg = rg / n, myb = yb / n;
  const colorful = Math.sqrt(Math.max(0, rg2 / n - mrg * mrg) + Math.max(0, yb2 / n - myb * myb)) + 0.3 * Math.hypot(mrg, myb);
  return { mean: sum / n / 255, p5: pct(0.05), p95: pct(0.95), flat: tiles ? flat / tiles : 0, saturation: sat / n, colorful, blown: blown / n, crushed: crushed / n };
}

const LEGACY = ["MeshLambertMaterial", "MeshPhongMaterial", "MeshToonMaterial"];

export function issuesOf(a: Audit | null, px: Pixels | null): Issue[] {
  const out: Issue[] = [];
  if (a && a.scenes > 0) {
    const mats = a.materials;
    const total = Object.values(mats).reduce((s, n) => s + n, 0) || 1;
    const legacy = LEGACY.reduce((s, k) => s + (mats[k] ?? 0), 0);
    const basic = mats.MeshBasicMaterial ?? 0;
    if (legacy / total > 0.1) out.push({ cost: legacy / total > 0.3 ? 20 : 10, what: `${legacy} of ${total} materials are Lambert/Phong: flat plastic that can't reflect the sky`, fix: "Use LOOK.mat.* (or MeshStandardMaterial). LOOK.stage swaps Lambert/Phong for PBR on its own." });
    if (basic / total > 0.25) out.push({ cost: 8, what: `${basic} MeshBasicMaterial meshes ignore light and shadow`, fix: "Keep Basic only for UI and glows; scenery needs a LOOK.mat surface." });
    if (!a.toneMapping || a.toneMapping === "none" || a.toneMapping === "linear") out.push({ cost: 12, what: "no filmic tone mapping: bright areas clip and colours look like a 2005 game", fix: "LOOK.stage({ preset }) sets ACES/AgX tone mapping (or renderer.toneMapping = THREE.ACESFilmicToneMapping)." });
    if (!a.env) out.push({ cost: 12, what: "no sky light (scene.environment): nothing reflects, shadows are dead grey", fix: "LOOK.stage lights the scene with a photographed sky that matches the preset." });
    if (!a.shadowsOn) out.push({ cost: 10, what: "shadows are off: objects float", fix: "LOOK.stage turns on soft shadows that follow S.focus." });
    else if (a.meshes > 10 && a.castShadow / a.meshes < 0.3) out.push({ cost: 5, what: `only ${a.castShadow} of ${a.meshes} meshes cast shadows`, fix: "LOOK.stage sets castShadow/receiveShadow on everything solid." });
    if (!a.fog && a.extent > 120) out.push({ cost: 4, what: "no fog or haze: the world ends in a hard line", fix: "Every LOOK preset has fog that matches its sky." });
    if (!a.sky) out.push({ cost: 6, what: "no sky (a flat background colour)", fix: "LOOK.stage draws a sky dome with clouds, sun and horizon glow." });
    if (a.flatBig > 2) out.push({ cost: Math.min(20, a.flatBig * 2), what: `${a.flatBig} big surfaces are one flat colour: ${a.flatBigNames.join(", ")}`, fix: "Give them a LOOK.mat surface: asphalt, pavement, concrete, brick, grass... or facade(\"brick\") for buildings." });
    if (a.stretched.length) out.push({ cost: Math.min(15, a.stretched.length * 4), what: `stretched textures (too few pixels per metre): ${a.stretched.join(", ")}`, fix: "Use LOOK.mat surfaces (UVs in metres, they repeat instead of stretching) or set texture.repeat by size." });
    if (a.meshes > 20 && a.boxes / a.meshes > 0.5) out.push({ cost: 10, what: `${a.boxes} of ${a.meshes} meshes are bare boxes`, fix: "Build with LOOK.building, LOOK.car, LOOK.human, LOOK.city instead of BoxGeometry." });
    if (a.bigPlanes) out.push({ cost: 6, what: `${a.bigPlanes} huge untextured ground plane(s)`, fix: "LOOK.ground({ material: 'grass' }) or LOOK.city() for streets." });
    for (const p of a.people) {
      if (p.height < 1.4 || p.height > 2.3) out.push({ cost: 8, what: `"${p.name}" is ${p.height} m tall: the world's scale is off (a person is about 1.75 m)`, fix: "Work in metres: storey 3.2, lane 3.5, street 12-16, car 4.6 long. LOOK.human() is 1.76 m." });
    }
    const bh = a.buildings;
    if (bh.length >= 4) {
      const med = bh[Math.floor(bh.length / 2)]!;
      if (med > 150) out.push({ cost: 6, what: `typical building is ${med} m tall: canyon walls, not a street`, fix: "Mix 12-90 m buildings; LOOK.city() does." });
    }
    if (a.post === false || (!a.look && a.post == null)) out.push({ cost: 6, what: "no post effects: no ambient occlusion, bloom or colour grade", fix: "LOOK.stage adds them (quality: high/medium/low)." });
  }
  if (px) {
    if (px.p95 - px.p5 < 0.35) out.push({ cost: 8, what: `washed out: the picture uses only ${Math.round((px.p95 - px.p5) * 100)}% of the brightness range`, fix: "Deeper shadows and brighter lights: a LOOK preset's grade, or more contrast between key light and fill." });
    if (px.flat > 0.4) out.push({ cost: 10, what: `${Math.round(px.flat * 100)}% of the lower picture is flat, untextured colour`, fix: "Surfaces need texture and detail: LOOK.mat materials, props along streets (lamps, trees, cars), shadows." });
    if (px.mean < 0.05) out.push({ cost: 6, what: "almost black: a player can't see anything", fix: "Raise S.renderer.toneMappingExposure, add S.addLamp lights, or pick a brighter preset." });
    if (px.blown > 0.12) out.push({ cost: 6, what: `${Math.round(px.blown * 100)}% of pixels are blown-out white`, fix: "Lower exposure or emissive intensity; check the bloom threshold." });
    if (px.colorful < 10 && px.saturation < 0.08) out.push({ cost: 3, what: "drab: almost no colour", fix: "Pick a preset with colour (neon-rain, golden-hour) unless grey is the point (noir)." });
  }
  return out.sort((x, y) => y.cost - x.cost);
}

export function score(issues: Issue[]): number {
  return Math.max(0, Math.min(100, 100 - issues.reduce((s, i) => s + i.cost, 0)));
}

export function verdict(n: number): string {
  return n >= 85 ? "looks great" : n >= 70 ? "looks decent" : n >= 50 ? "looks cheap" : "looks unfinished";
}

export function report(a: Audit | null, px: Pixels | null, max = 8): string {
  if (a && a.scenes === 0 && a.renderers === 0) return "no three.js scene found on the page (is it a 3D game? does it need a click or ?play to start?)";
  const issues = issuesOf(a, px);
  const n = score(issues);
  const head = `Look score ${n}/100 (${verdict(n)})${a?.preset ? `, LOOK preset ${a.preset}` : a?.look ? ", LOOK loaded" : ", no LOOK kit"}${a ? ` · ${a.meshes} meshes, ${Math.round(a.triangles / 1000)}k triangles` : ""}`;
  if (!issues.length) return `${head}\nNo problems found.`;
  return `${head}\n${issues.slice(0, max).map((i, k) => `${k + 1}. ${i.what} (−${i.cost})\n   Fix: ${i.fix}`).join("\n")}`;
}
