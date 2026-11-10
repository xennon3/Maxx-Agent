// PBR surfaces made in code: each one is a colour map, a normal map and a
// roughness map painted from noise, sized in real metres (userData.look.tile).
// LOOK lays their UVs out in metres on any mesh (see fit.js), so a texture is
// never stretched across a 100 m wall the way a single canvas texture is.
import * as THREE from "three";
import { canvas, clamp01, fbm, hash2, hexRgb, mix, normalCanvas, paint, rng, smooth, texture } from "./noise.js";

const SIZE = 512;
const cache = new Map();

function maps(key, size, fn) {
  if (cache.has(key)) return cache.get(key);
  const h = new Float32Array(size * size);
  const rough = new Float32Array(size * size);
  const col = paint(size, (x, y) => {
    const s = fn(x, y);
    h[y * size + x] = s.h;
    rough[y * size + x] = s.r;
    return s.c;
  });
  const r = paint(size, (x, y) => {
    const v = rough[y * size + x];
    // three reads roughness from green.
    return [v, v, v];
  });
  const out = { map: texture(col, { color: true }), normalMap: texture(normalCanvas(h, size, 3)), roughnessMap: texture(r) };
  cache.set(key, out);
  return out;
}

function standard(name, tile, m, extra = {}) {
  const mat = new THREE.MeshStandardMaterial({ ...m, ...extra });
  mat.userData.look = { name, tile, uv: "meters" };
  return mat;
}

// ---- surfaces ----

export function asphalt(o = {}) {
  const { tile = 8, wet = 0, color = "#3a3b3d", seed = 3 } = o;
  const base = hexRgb(color);
  const m = maps(`asphalt:${color}:${seed}:${wet.toFixed(2)}`, SIZE, (x, y) => {
    const grain = hash2(x, y, seed);
    const big = fbm(x, y, SIZE, { base: 3, octaves: 4, seed });
    const mid = fbm(x, y, SIZE, { base: 12, octaves: 3, seed: seed + 5 });
    // Cracks: thin dark valleys where ridged noise peaks.
    const rid = 1 - Math.abs(fbm(x, y, SIZE, { base: 6, octaves: 3, seed: seed + 9 }) * 2 - 1);
    const crack = smooth(0.965, 0.995, rid) * smooth(0.5, 0.65, big) * 0.6;
    // Puddles collect in low spots.
    const puddle = wet * smooth(0.52, 0.6, 1 - big + (mid - 0.5) * 0.3);
    const stone = grain > 0.86 ? 0.25 : grain < 0.08 ? -0.18 : 0;
    let v = 0.84 + (big - 0.5) * 0.22 + (mid - 0.5) * 0.12 + stone * 0.35 - crack * 0.45;
    v *= 1 - wet * 0.35 - puddle * 0.25;
    const c = base.map((b) => b * v * 1.25);
    const rough = clamp01(mix(0.92 - stone * 0.2, 0.06, puddle) - wet * 0.25);
    return { c, h: puddle > 0.3 ? 0.4 : grain * 0.3 + mid * 0.2 - crack * 0.5, r: rough };
  });
  return standard("asphalt", tile, { ...m, color: 0xffffff, roughness: 1, metalness: 0, envMapIntensity: 1 + wet * 0.8 });
}

// Sidewalk: square slabs with joints, stains and chewing gum.
export function pavement(o = {}) {
  const { tile = 3, slabs = 2, color = "#9a9893", wet = 0, seed = 11 } = o;
  const base = hexRgb(color);
  const m = maps(`pavement:${color}:${slabs}:${wet.toFixed(2)}`, SIZE, (x, y) => {
    const cell = SIZE / slabs;
    const fx = (x % cell) / cell, fy = (y % cell) / cell;
    const joint = Math.min(fx, fy, 1 - fx, 1 - fy) < 0.012 ? 1 : 0;
    const id = hash2(Math.floor(x / cell), Math.floor(y / cell), seed);
    const n = fbm(x, y, SIZE, { base: 8, octaves: 5, seed });
    const stain = smooth(0.62, 0.75, fbm(x, y, SIZE, { base: 3, octaves: 3, seed: seed + 3 }));
    const gum = hash2(x >> 1, y >> 1, seed + 7) > 0.9993 ? 1 : 0;
    let v = 0.9 + (id - 0.5) * 0.12 + (n - 0.5) * 0.25 - stain * 0.18 - joint * 0.45 - gum * 0.4;
    v *= 1 - wet * 0.3;
    return { c: base.map((b) => b * v), h: joint ? 0 : 0.6 + n * 0.3, r: clamp01(0.88 - wet * 0.45 + joint * 0.1 - stain * wet * 0.3) };
  });
  return standard("pavement", tile, { ...m, roughness: 1 });
}

export function concrete(o = {}) {
  const { tile = 4, color = "#8d8a84", seed = 21, wet = 0 } = o;
  const base = hexRgb(color);
  const m = maps(`concrete:${color}:${wet.toFixed(2)}`, SIZE, (x, y) => {
    const n = fbm(x, y, SIZE, { base: 4, octaves: 6, seed });
    const pores = hash2(x, y, seed) > 0.97 ? 1 : 0;
    const v = 0.85 + (n - 0.5) * 0.4 - pores * 0.25;
    return { c: base.map((b) => b * v * (1 - wet * 0.3)), h: n * 0.6 - pores * 0.4, r: clamp01(0.9 - wet * 0.5) };
  });
  return standard("concrete", tile, { ...m, roughness: 1 });
}

export function brick(o = {}) {
  const { tile = 2.4, color = "#8a4b36", mortar = "#b9b2a6", seed = 31 } = o;
  const b = hexRgb(color), mo = hexRgb(mortar);
  const m = maps(`brick:${color}:${mortar}`, SIZE, (x, y) => {
    const rows = 28, cols = 10;
    const ry = (y / SIZE) * rows, r = Math.floor(ry);
    const rx = (x / SIZE) * cols + (r % 2) * 0.5;
    const fx = rx - Math.floor(rx), fy = ry - r;
    const isM = fx < 0.05 || fy < 0.13;
    const id = hash2(Math.floor(rx) % cols, r, seed);
    const n = fbm(x, y, SIZE, { base: 16, octaves: 3, seed });
    const v = 0.75 + id * 0.45 + (n - 0.5) * 0.3;
    const burnt = id > 0.9 ? 0.6 : 1;
    const c = isM ? mo.map((q) => q * (0.85 + n * 0.2)) : b.map((q) => q * v * burnt);
    return { c, h: isM ? 0 : 0.7 + n * 0.3, r: isM ? 0.95 : 0.8 + n * 0.1 };
  });
  return standard("brick", tile, { ...m, roughness: 1 });
}

export function plaster(o = {}) {
  const { tile = 3, color = "#d8cbb5", seed = 41 } = o;
  const base = hexRgb(color);
  const m = maps(`plaster:${color}`, SIZE, (x, y) => {
    const n = fbm(x, y, SIZE, { base: 10, octaves: 6, seed });
    const dirt = smooth(0.55, 0.8, fbm(x, y, SIZE, { base: 2, octaves: 4, seed: seed + 1 }));
    return { c: base.map((q) => q * (0.9 + (n - 0.5) * 0.2 - dirt * 0.18)), h: n, r: 0.9 };
  });
  return standard("plaster", tile, { ...m, roughness: 1 });
}

export function metal(o = {}) {
  const { tile = 2, color = "#9aa0a6", brushed = true, roughness = 0.35, seed = 51 } = o;
  const base = hexRgb(color);
  const m = maps(`metal:${color}:${brushed}`, SIZE, (x, y) => {
    const n = brushed ? hash2(Math.floor(x / 64), y, seed) * 0.5 + fbm(x, y, SIZE, { base: 2, octaves: 2, seed }) * 0.5 : fbm(x, y, SIZE, { base: 6, octaves: 4, seed });
    return { c: base.map((q) => q * (0.9 + (n - 0.5) * 0.15)), h: n * 0.2, r: clamp01(roughness + (n - 0.5) * 0.15) };
  });
  return standard("metal", tile, { ...m, metalness: 1, roughness: 1 });
}

export function gravel(o = {}) {
  const { tile = 3, color = "#6f6c66", seed = 61 } = o;
  const base = hexRgb(color);
  const m = maps(`gravel:${color}`, SIZE, (x, y) => {
    const n = fbm(x, y, SIZE, { base: 48, octaves: 2, seed });
    const g = hash2(x >> 2, y >> 2, seed);
    return { c: base.map((q) => q * (0.7 + n * 0.5 + (g - 0.5) * 0.2)), h: n, r: 0.95 };
  });
  return standard("gravel", tile, { ...m, roughness: 1 });
}

export function grass(o = {}) {
  const { tile = 4, color = "#4a6b2e", seed = 71 } = o;
  const base = hexRgb(color);
  const m = maps(`grass:${color}`, SIZE, (x, y) => {
    const blade = hash2(x, y >> 1, seed);
    const n = fbm(x, y, SIZE, { base: 6, octaves: 4, seed });
    const dry = smooth(0.6, 0.8, fbm(x, y, SIZE, { base: 2, octaves: 3, seed: seed + 2 }));
    const c = [base[0] * (0.7 + blade * 0.5) + dry * 0.12, base[1] * (0.7 + blade * 0.5) + dry * 0.05, base[2] * (0.6 + blade * 0.3)];
    return { c: c.map((q) => q * (0.85 + n * 0.3)), h: blade * 0.5 + n * 0.5, r: 0.85 };
  });
  return standard("grass", tile, { ...m, roughness: 1 });
}

export function dirt(o = {}) {
  const { tile = 4, color = "#6b5641", seed = 81 } = o;
  const base = hexRgb(color);
  const m = maps(`dirt:${color}`, SIZE, (x, y) => {
    const n = fbm(x, y, SIZE, { base: 6, octaves: 6, seed });
    const peb = hash2(x >> 1, y >> 1, seed) > 0.985 ? 0.3 : 0;
    return { c: base.map((q) => q * (0.75 + n * 0.5 + peb)), h: n + peb, r: 0.95 };
  });
  return standard("dirt", tile, { ...m, roughness: 1 });
}

export function wood(o = {}) {
  const { tile = 2, color = "#8a5a35", seed = 91 } = o;
  const base = hexRgb(color);
  const m = maps(`wood:${color}`, SIZE, (x, y) => {
    const plank = Math.floor((y / SIZE) * 8);
    const id = hash2(plank, 0, seed);
    const grain = Math.sin((x / SIZE) * 40 + fbm(x, y, SIZE, { base: 4, octaves: 4, seed: seed + plank }) * 12) * 0.5 + 0.5;
    const gap = ((y / SIZE) * 8) % 1 < 0.03;
    return { c: base.map((q) => q * (gap ? 0.3 : 0.75 + grain * 0.25 + (id - 0.5) * 0.3)), h: gap ? 0 : 0.5 + grain * 0.2, r: 0.7 };
  });
  return standard("wood", tile, { ...m, roughness: 1 });
}

// Fine woven cloth for clothes (on curved meshes the tile is in UV units).
export function fabric(o = {}) {
  const { color = "#2f4a6e", tile = 0.25, seed = 101, sheen = 0.4 } = o;
  const base = hexRgb(color);
  const m = maps(`fabric:${color}`, 256, (x, y) => {
    const w = (Math.sin(x * 1.6) * Math.sin(y * 1.6)) * 0.5 + 0.5;
    const n = fbm(x, y, 256, { base: 8, octaves: 3, seed });
    return { c: base.map((q) => q * (0.85 + w * 0.15 + (n - 0.5) * 0.15)), h: w * 0.6 + n * 0.4, r: 0.85 };
  });
  const mat = new THREE.MeshPhysicalMaterial({ ...m, roughness: 1, sheen, sheenColor: new THREE.Color(color).lerp(new THREE.Color("#ffffff"), 0.3), sheenRoughness: 0.6 });
  mat.normalScale.set(0.6, 0.6);
  mat.userData.look = { name: "fabric", tile, uv: "own" };
  return mat;
}

export function skin(o = {}) {
  const { color = "#c68a68" } = o;
  const mat = new THREE.MeshPhysicalMaterial({ color, roughness: 0.55, sheen: 0.3, sheenColor: new THREE.Color("#ff9a80"), sheenRoughness: 0.5, clearcoat: 0.05 });
  mat.userData.look = { name: "skin", uv: "own" };
  return mat;
}

// Car paint: a clear coat over metallic flakes.
export function carPaint(o = {}) {
  const { color = "#7a0d16", metal = 0.6 } = o;
  const mat = new THREE.MeshPhysicalMaterial({ color, metalness: metal, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.03 });
  mat.userData.look = { name: "carPaint", uv: "own" };
  return mat;
}

export function glass(o = {}) {
  const { tint = "#1b2a33", opacity = 0.55, roughness = 0.02 } = o;
  const mat = new THREE.MeshPhysicalMaterial({ color: tint, metalness: 0.1, roughness, transparent: true, opacity, envMapIntensity: 1.6, clearcoat: 1, clearcoatRoughness: 0.02 });
  mat.userData.look = { name: "glass", uv: "own" };
  return mat;
}

export function chrome(o = {}) {
  const mat = new THREE.MeshStandardMaterial({ color: o.color ?? "#e8e8e8", metalness: 1, roughness: o.roughness ?? 0.12 });
  mat.userData.look = { name: "chrome", uv: "own" };
  return mat;
}

export function rubber(o = {}) {
  const mat = new THREE.MeshStandardMaterial({ color: o.color ?? "#161616", roughness: 0.9, metalness: 0 });
  mat.userData.look = { name: "rubber", uv: "own" };
  return mat;
}

// A glowing tube or sign: bright enough to bloom.
export function neon(o = {}) {
  const { color = "#ff2a6d", power = 6 } = o;
  const mat = new THREE.MeshStandardMaterial({ color: "#111111", emissive: color, emissiveIntensity: power, roughness: 0.4 });
  mat.userData.look = { name: "neon", uv: "own", glow: color };
  return mat;
}

export function lightLens(o = {}) {
  const { color = "#fff1d6", power = 8 } = o;
  const mat = new THREE.MeshStandardMaterial({ color: "#ffffff", emissive: color, emissiveIntensity: power, roughness: 0.2 });
  mat.userData.look = { name: "lens", uv: "own", glow: color };
  return mat;
}

// Paint for road lines (worn, a little reflective).
export function roadPaint(o = {}) {
  const { color = "#e9e4d4", wet = 0 } = o;
  const base = hexRgb(color);
  const m = maps(`paint:${color}:${wet.toFixed(2)}`, 256, (x, y) => {
    const wear = fbm(x, y, 256, { base: 8, octaves: 4, seed: 5 });
    const v = wear > 0.62 ? 0.45 : 1;
    return { c: base.map((q) => q * v * (1 - wet * 0.15)), h: v, r: clamp01(0.6 - wet * 0.4) };
  });
  const mat = standard("roadPaint", 2, { ...m, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  return mat;
}

// A small cache so every call to LOOK.mat.x() with the same options shares one material.
const matCache = new Map();
export function cached(name, fn, o = {}) {
  const key = name + JSON.stringify(o);
  if (!matCache.has(key)) matCache.set(key, fn(o));
  return matCache.get(key);
}

// A tileable 4-channel noise texture for shaders (facade, sky, water).
let noiseTex = null;
export function noiseTexture() {
  if (noiseTex) return noiseTex;
  const size = 256, c = canvas(size), g = c.getContext("2d"), img = g.createImageData(size, size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 4;
    img.data[i] = fbm(x, y, size, { base: 4, octaves: 5, seed: 1 }) * 255;
    img.data[i + 1] = fbm(x, y, size, { base: 16, octaves: 3, seed: 2 }) * 255;
    img.data[i + 2] = hash2(x, y, 3) * 255;
    img.data[i + 3] = fbm(x, y, size, { base: 2, octaves: 4, seed: 4 }) * 255;
  }
  g.putImageData(img, 0, 0);
  noiseTex = texture(c, { aniso: 4 });
  return noiseTex;
}

export { rng };
