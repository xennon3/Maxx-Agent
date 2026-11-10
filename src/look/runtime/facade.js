// Building fronts drawn by a shader on top of three's PBR material: brick,
// concrete, stucco, metal panel or glass curtain walls, with window frames,
// grime streaks under the sills, and real-looking rooms behind every window
// (interior mapping: the ray from the camera is traced into a box room with a
// floor, ceiling, walls, furniture and a lamp). Rooms switch on at night.
//
// The geometry's UVs are metres along the wall (u) and up from the ground (v);
// LOOK.building and LOOK.fit lay them out. An optional "facade" attribute
// carries (top of the last full storey in metres, building seed).
import * as THREE from "three";
import { noiseTexture } from "./materials.js";

// Shared by every facade: LOOK's stage sets these from the preset and the clock.
export const FACADE = {
  uTime: { value: 0 },
  uNight: { value: 0 }, // 0 day .. 1 night: lit rooms glow
  uLitFrac: { value: 0.55 }, // share of rooms with the light on at night
  uDayInterior: { value: 0.18 }, // how bright rooms look by day
  uWet: { value: 0 },
};

export const STYLES = {
  brick: { style: 0, wall: "#7d3f2c", wall2: "#5e2e21", frame: "#e7e1d6", bay: 2.8, storey: 3.2, ground: 4.2, winW: 0.46, winH: 0.52, sill: 0.28, blank: 0.04, shopTint: "#ffb36b" },
  glass: { style: 1, wall: "#1d2730", wall2: "#2c3a46", frame: "#2a3138", bay: 1.6, storey: 3.8, ground: 5.0, winW: 0.94, winH: 0.78, sill: 0.16, blank: 0.0, shopTint: "#bfe3ff", glass: "#35505f" },
  concrete: { style: 2, wall: "#9b978f", wall2: "#7f7b74", frame: "#3b3f44", bay: 3.0, storey: 3.4, ground: 4.5, winW: 0.62, winH: 0.5, sill: 0.3, blank: 0.06, shopTint: "#ffe2a8" },
  stucco: { style: 3, wall: "#d9c7a8", wall2: "#c4ae8b", frame: "#f3efe6", bay: 3.2, storey: 3.1, ground: 4.0, winW: 0.42, winH: 0.5, sill: 0.3, blank: 0.08, shopTint: "#ffc98a" },
  metal: { style: 4, wall: "#5d646c", wall2: "#454b52", frame: "#1d2125", bay: 2.4, storey: 3.6, ground: 4.8, winW: 0.8, winH: 0.42, sill: 0.34, blank: 0.02, shopTint: "#a8f0ff" },
};

const GLSL_FN = /* glsl */ `
uniform float uTime, uNight, uLitFrac, uDayInterior, uWet;
uniform int uStyle;
uniform vec3 uWall, uWall2, uFrame, uGlass, uShopTint;
uniform float uBay, uStorey, uGround, uWinW, uWinH, uSill, uBlank, uSeed;
uniform sampler2D uNoise;
varying vec2 vUvM;
varying vec2 vFacade;
varying vec3 vWPos;
varying vec3 vWN;
float fh(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7)) + uSeed * 13.7 + vFacade.y * 7.31) * 43758.5453); }
vec3 fh3(vec2 p) { return vec3(fh(p), fh(p + 17.3), fh(p + 41.9)); }
vec3 fPerturb(vec3 surf_pos, vec3 surf_norm, vec2 dHdxy) {
  vec3 sx = dFdx(surf_pos), sy = dFdy(surf_pos);
  vec3 R1 = cross(sy, surf_norm), R2 = cross(surf_norm, sx);
  float det = dot(sx, R1);
  vec3 grad = sign(det) * (dHdxy.x * R1 + dHdxy.y * R2);
  return normalize(abs(det) * surf_norm - grad);
}
`;

const GLSL_MAIN = /* glsl */ `
  vec3 fNw = normalize(vWN);
  vec2 m = vUvM;
  float topF = vFacade.x > 0.5 ? vFacade.x : 1e5;
  vec3 fEmit = vec3(0.0);
  float fH = 0.0;
  float vertical = 1.0 - step(0.6, abs(fNw.y));
  vec4 nzA = texture2D(uNoise, m * 0.07);
  vec4 nzB = texture2D(uNoise, m * 0.6);
  // Storeys: a taller shop floor at the bottom, then regular floors up to topF.
  float row; float ly; float cellH; float bay;
  if (m.y < uGround) { row = -1.0; ly = m.y; cellH = uGround; bay = uBay * 2.0; }
  else { row = floor((m.y - uGround) / uStorey); ly = mod(m.y - uGround, uStorey); cellH = uStorey; bay = uBay; }
  float col = floor(m.x / bay); float lx = mod(m.x, bay);
  vec2 cell = vec2(col, row);
  bool shop = row < 0.0;
  float ww = (shop ? 0.84 : uWinW) * bay;
  float x0 = (bay - ww) * 0.5;
  float sill = shop ? 0.1 * cellH : uSill * cellH;
  float wh = (shop ? 0.72 : uWinH) * cellH;
  vec2 wp = vec2(lx - x0, ly - sill);
  float inWin = step(0.0, wp.x) * step(wp.x, ww) * step(0.0, wp.y) * step(wp.y, wh) * vertical;
  if (m.y > topF) inWin = 0.0;
  if (!shop && fh(cell + 3.1) < uBlank) inWin = 0.0;
  // A shop front is a door every few bays.
  float edge = min(min(wp.x, ww - wp.x), min(wp.y, wh - wp.y));
  float frameW = uStyle == 1 ? 0.035 : 0.07;
  float inGlass = inWin * step(frameW, edge);
  if (ww > 1.5 && abs(wp.x - ww * 0.5) < 0.03) inGlass = 0.0;
  if (!shop && uStyle != 1 && abs(wp.y - wh * 0.7) < 0.025) inGlass = 0.0;
  // Far away a window is a pixel or two: draw the average instead of shimmering.
  vec2 mfw = fwidth(m);
  float lod = smoothstep(0.06, 0.22, max(mfw.x / bay, mfw.y / cellH));
  if (lod > 0.995) { inWin = 0.0; inGlass = 0.0; }

  // ---- wall ----
  vec3 wall = uWall; float wr = 0.88; float wm = 0.0;
  if (uStyle == 0) {
    vec2 b = m / vec2(0.25, 0.086); float r = floor(b.y); b.x += mod(r, 2.0) * 0.5;
    vec2 bi = floor(b); vec2 bf = fract(b);
    vec2 bfw = fwidth(m) / vec2(0.25, 0.086);
    float baa = smoothstep(0.08, 0.35, max(bfw.x, bfw.y));
    float mortar = mix(clamp(step(bf.x, 0.05) + step(bf.y, 0.12), 0.0, 1.0), 0.17, baa);
    float v = mix(fh(bi * 0.37), 0.5, baa);
    wall = mix(uWall, uWall2, v) * (0.8 + 0.4 * nzB.y);
    wall = mix(wall, vec3(0.62, 0.6, 0.56), mortar);
    fH = (1.0 - mortar) * 0.8;
    wr = mix(0.82, 0.96, mortar);
  } else if (uStyle == 1) {
    // Spandrel panels between the glass bands.
    wall = mix(uWall, uWall2, nzA.x * 0.6); wr = 0.35; wm = 0.6;
    float seam = step(fract(m.x / uBay), 0.02);
    wall *= 1.0 - seam * 0.5;
  } else if (uStyle == 2) {
    vec2 pnl = vec2(fract(m.x / (uBay * 0.5)), fract((m.y - uGround) / uStorey));
    float joint = step(pnl.x, 0.012) + step(pnl.y, 0.01);
    wall = uWall * (0.85 + 0.3 * nzA.x + 0.12 * nzB.y) * (1.0 - joint * 0.35);
    fH = 1.0 - clamp(joint, 0.0, 1.0); wr = 0.9;
  } else if (uStyle == 3) {
    wall = mix(uWall, uWall2, smoothstep(0.4, 0.8, nzA.x)) * (0.9 + 0.15 * nzB.x);
    fH = nzB.x * 0.5; wr = 0.92;
  } else {
    float band = step(fract((m.y - uGround) / (uStorey * 0.5)), 0.03);
    wall = mix(uWall, uWall2, nzA.w) * (1.0 - band * 0.4) * (0.92 + 0.12 * nzB.y);
    fH = 1.0 - band; wr = 0.42; wm = 0.75;
  }
  // Rain streaks and grime: under each sill, and darker near the ground.
  if (!shop && wp.x > 0.0 && wp.x < ww && ly < sill) {
    float s = (1.0 - ly / max(sill, 0.01)) * (0.35 + 0.65 * texture2D(uNoise, vec2(m.x * 1.7, m.y * 0.15)).x);
    wall *= 1.0 - 0.35 * s;
  }
  wall *= mix(0.62, 1.0, smoothstep(0.0, 2.2, m.y));
  wall *= 0.9 + 0.2 * nzA.w;
  // A cornice line at the top.
  if (m.y > topF && m.y < topF + 0.35) { wall = mix(wall, uFrame, 0.6); fH = 1.2; }
  // Shop floor: a fascia band over the windows.
  if (shop && ly > sill + wh + 0.1) { wall = mix(uWall2, vec3(0.05), 0.55); wr = 0.5; }
  // Wet walls get darker and shinier.
  wall *= 1.0 - uWet * 0.25; wr = mix(wr, wr * 0.55, uWet);

  vec3 fCol = wall; float fRough = wr; float fMetal = wm;
  if (inWin > 0.5) { fCol = uFrame * 0.9; fRough = 0.4; fMetal = 0.5; fH = 0.6; }
  if (inGlass > 0.5) {
    // ---- the room behind the glass ----
    vec3 dp1 = dFdx(vWPos), dp2 = dFdy(vWPos);
    vec2 du1 = dFdx(m), du2 = dFdy(m);
    vec3 p2 = cross(dp2, fNw), p1 = cross(fNw, dp1);
    vec3 T = p2 * du1.x + p1 * du2.x; vec3 B = p2 * du1.y + p1 * du2.y;
    float inv = inversesqrt(max(max(dot(T, T), dot(B, B)), 1e-12)); T *= inv; B *= inv;
    vec3 rd = normalize(vWPos - cameraPosition);
    float rx = dot(rd, T), ry = dot(rd, B), rz = max(dot(rd, -fNw), 0.04);
    float D = shop ? 7.0 : 4.5;
    float tx = rx > 0.0 ? (ww + x0 - wp.x) / max(rx, 1e-4) : (-x0 - wp.x) / min(rx, -1e-4);
    float ty = ry > 0.0 ? (cellH - sill - wp.y) / max(ry, 1e-4) : (-sill - wp.y) / min(ry, -1e-4);
    float tz = D / rz;
    float t = min(min(tx, ty), tz);
    vec3 h = vec3(wp, 0.0) + vec3(rx, ry, rz) * t;
    vec3 rc = fh3(cell * 1.7 + 0.5);
    vec3 wallC = mix(vec3(0.78, 0.74, 0.67), mix(vec3(0.55, 0.62, 0.66), vec3(0.7, 0.55, 0.5), rc.y), rc.x);
    vec3 floorC = mix(vec3(0.33, 0.22, 0.14), vec3(0.28, 0.29, 0.31), step(0.5, rc.y));
    vec3 ic;
    if (t == tz) {
      ic = wallC * 0.9;
      float fy = h.y + sill;
      // Furniture against the back wall: a sofa or a desk and a shelf.
      float fx = h.x - (ww * rc.z);
      if (fy < 0.85 && abs(fx) < 0.9) ic *= 0.32 + 0.2 * rc.x;
      if (fy > 1.3 && fy < 2.0 && abs(h.x - ww * (1.0 - rc.z)) < 0.45) ic = mix(ic, vec3(0.2, 0.25, 0.3) + rc * 0.4, 0.8);
    } else if (t == ty) {
      ic = ry > 0.0 ? vec3(0.86) : floorC;
    } else {
      ic = wallC * 0.78;
    }
    float litR = step(fh(cell + 9.0), uLitFrac);
    vec3 lc = rc.z < 0.62 ? vec3(1.0, 0.76, 0.48) : rc.z < 0.88 ? vec3(0.86, 0.93, 1.0) : vec3(0.42, 0.58, 1.0);
    float flick = rc.z >= 0.88 ? 0.65 + 0.35 * sin(uTime * 6.0 + rc.x * 40.0) * sin(uTime * 2.3 + rc.y * 9.0) : 1.0;
    float fall = 1.0 / (1.0 + 0.05 * t * t) * (0.55 + 0.45 * smoothstep(0.0, cellH, h.y + sill));
    vec3 inside = ic * (lc * litR * flick * uNight * 2.4 + uDayInterior) * fall;
    if (shop) {
      float open = step(0.25, fh(cell + 2.0));
      // Shelves of goods on the walls.
      float hy = h.y + sill;
      if (t != ty && hy > 0.3 && hy < 2.2) {
        float shelf = step(0.9, fract(hy / 0.45));
        vec2 slot = floor(vec2((h.x + h.z) * 4.0, hy / 0.45));
        vec3 g3 = fh3(slot + cell * 3.0);
        vec3 goods = mix(vec3(dot(g3, vec3(0.33))), g3, 0.55) * (0.12 + 0.4 * fh(slot * 1.3 + 7.0));
        goods *= 0.6 + 0.4 * step(0.25, fract((h.x + h.z) * 4.0));
        ic = mix(goods, vec3(0.6), shelf);
      }
      inside = ic * mix(vec3(1.0, 0.93, 0.82), uShopTint, 0.45) * fall * (open * (uNight * 1.5 + 0.12) + uDayInterior * 1.4);
    }
    // Blinds or curtains, part way down.
    float bl = mix(0.1, 0.8, fh(cell + 6.0));
    if (!shop && fh(cell + 5.0) < 0.38 && wp.y > wh * (1.0 - bl)) {
      float slat = 0.6 + 0.4 * step(0.45, fract(wp.y * 12.0));
      inside = (lc * litR * uNight * 1.3 + vec3(0.55) * uDayInterior * 2.5) * slat * mix(vec3(1.0), vec3(0.95, 0.9, 0.8), rc.y);
    }
    fEmit = inside;
    fCol = uStyle == 1 ? uGlass * 0.25 : vec3(0.02);
    fRough = 0.07;
    fMetal = uStyle == 1 ? 0.55 : 0.0;
    if (uStyle == 1) fEmit *= 0.55;
    fH = 0.0;
  }
  // Blend to the average look of the wall at a distance.
  if (lod > 0.0) {
    float wf = shop ? 0.6 : uWinW * uWinH * (1.0 - uBlank);
    vec3 avgEmit = wf * (vec3(1.0, 0.8, 0.56) * uLitFrac * uNight * (shop ? 0.9 : 1.2) + vec3(0.5) * uDayInterior);
    vec3 avgCol = mix(wall, uStyle == 1 ? uGlass * 0.3 : vec3(0.04), wf);
    if (m.y > topF) { avgEmit = vec3(0.0); avgCol = wall; wf = 0.0; }
    fCol = mix(fCol, avgCol, lod); fEmit = mix(fEmit, avgEmit, lod);
    fRough = mix(fRough, mix(wr, 0.15, wf), lod); fMetal = mix(fMetal, wm, lod); fH *= 1.0 - lod;
  }
  // Roofs and other flat faces: plain weathered concrete.
  if (vertical < 0.5) { fCol = vec3(0.38, 0.37, 0.35) * (0.75 + 0.4 * nzA.x); fRough = 0.95; fMetal = 0.0; fEmit = vec3(0.0); fH = nzB.x * 0.3; }
`;

let n = 0;
export function facade(o = {}) {
  const s = { ...(STYLES[o.style ?? "brick"] ?? STYLES.brick), ...o };
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0, envMapIntensity: 1 });
  const id = ++n;
  const uniforms = {
    ...FACADE,
    uStyle: { value: s.style },
    uWall: { value: new THREE.Color(s.wall) },
    uWall2: { value: new THREE.Color(s.wall2) },
    uFrame: { value: new THREE.Color(s.frame) },
    uGlass: { value: new THREE.Color(s.glass ?? "#2b3b45") },
    uShopTint: { value: new THREE.Color(s.shopTint) },
    uBay: { value: s.bay }, uStorey: { value: s.storey }, uGround: { value: s.ground },
    uWinW: { value: s.winW }, uWinH: { value: s.winH }, uSill: { value: s.sill }, uBlank: { value: s.blank },
    uSeed: { value: o.seed ?? id * 0.37 },
    uNoise: { value: noiseTexture() },
  };
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uniforms);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nattribute vec2 facade;\nvarying vec2 vUvM;\nvarying vec2 vFacade;\nvarying vec3 vWPos;\nvarying vec3 vWN;")
      .replace("#include <fog_vertex>", `#include <fog_vertex>
  vUvM = uv; vFacade = facade;
  mat4 fM = modelMatrix;
  #ifdef USE_INSTANCING
  fM = modelMatrix * instanceMatrix;
  #endif
  vWPos = (fM * vec4(transformed, 1.0)).xyz;
  vWN = normalize(mat3(fM) * objectNormal);`);
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\n" + GLSL_FN)
      .replace("#include <metalnessmap_fragment>", "#include <metalnessmap_fragment>\n" + GLSL_MAIN + "\n  diffuseColor.rgb = fCol; roughnessFactor = fRough; metalnessFactor = fMetal;")
      .replace("#include <normal_fragment_maps>", "#include <normal_fragment_maps>\n  normal = fPerturb(-vViewPosition, normal, vec2(dFdx(fH), dFdy(fH)) * 0.25);")
      .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\n  totalEmissiveRadiance += fEmit;");
  };
  mat.customProgramCacheKey = () => "look-facade";
  mat.userData.look = { name: "facade", style: o.style ?? "brick", uv: "facade", bay: s.bay, storey: s.storey, ground: s.ground };
  mat.userData.uniforms = uniforms;
  return mat;
}
