// Procedural texture helpers: seeded random, tileable value noise and fbm,
// canvases, and normal / roughness maps made from a height field. Every
// texture LOOK makes comes from here, so nothing is downloaded and nothing
// carries a license.
import * as THREE from "three";

export function rng(seed = 1) {
  let s = (seed >>> 0) || 1;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return ((s >>> 0) % 1_000_000) / 1_000_000;
  };
}

export const hash2 = (x, y, seed = 0) => {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

// Tileable value noise on a period-p lattice.
export function valueNoise(x, y, p, seed) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const w = (a, b) => hash2(((a % p) + p) % p, ((b % p) + p) % p, seed);
  const a = w(xi, yi), b = w(xi + 1, yi), c = w(xi, yi + 1), d = w(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

// Fractal noise that tiles across a size x size texture. Returns 0..1.
export function fbm(x, y, size, o = {}) {
  const { octaves = 5, base = 4, seed = 7, gain = 0.5 } = o;
  let amp = 1, sum = 0, norm = 0, f = base;
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise((x / size) * f, (y / size) * f, f, seed + i * 31);
    norm += amp; amp *= gain; f *= 2;
  }
  return sum / norm;
}

export function canvas(size) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  return c;
}

// A height field (Float32Array, size*size, 0..1) to a tangent-space normal map canvas.
export function normalCanvas(h, size, strength = 2) {
  const c = canvas(size), g = c.getContext("2d"), img = g.createImageData(size, size);
  const at = (x, y) => h[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const dx = (at(x + 1, y) - at(x - 1, y)) * strength;
    const dy = (at(x, y + 1) - at(x, y - 1)) * strength;
    const len = Math.hypot(dx, dy, 1);
    const i = (y * size + x) * 4;
    img.data[i] = ((-dx / len) * 0.5 + 0.5) * 255;
    img.data[i + 1] = ((dy / len) * 0.5 + 0.5) * 255;
    img.data[i + 2] = ((1 / len) * 0.5 + 0.5) * 255;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c;
}

// Fill a canvas from a per-pixel function returning [r, g, b] in 0..1.
export function paint(size, fn) {
  const c = canvas(size), g = c.getContext("2d"), img = g.createImageData(size, size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const [r, gg, b] = fn(x, y);
    const i = (y * size + x) * 4;
    img.data[i] = Math.max(0, Math.min(255, r * 255));
    img.data[i + 1] = Math.max(0, Math.min(255, gg * 255));
    img.data[i + 2] = Math.max(0, Math.min(255, b * 255));
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c;
}

export function texture(c, { color = false, repeat = true, aniso = 8 } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = aniso;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}

export const mix = (a, b, t) => a + (b - a) * t;
export const clamp01 = (v) => Math.max(0, Math.min(1, v));
export const smooth = (e0, e1, x) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
// sRGB 0..1 components of a colour, for painting canvases.
export function hexRgb(hex) {
  const c = new THREE.Color(hex).getRGB({ r: 0, g: 0, b: 0 }, THREE.SRGBColorSpace);
  return [c.r, c.g, c.b];
}
