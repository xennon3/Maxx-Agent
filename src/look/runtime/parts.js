// Small geometry helpers shared by the builders.
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { metreUV } from "./fit.js";

export function box(w, h, d, { y0 = 0, tile = 1, bay = 0, facade = null, v0 = null } = {}) {
  const g = new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0);
  metreUV(g, new THREE.Vector3(1, 1, 1), tile, { bay });
  if (v0 != null) {
    // Facade UVs count metres from the ground, not from this box's bottom.
    const uv = g.attributes.uv, n = g.attributes.normal;
    for (let i = 0; i < uv.count; i++) if (Math.abs(n.getY(i)) < 0.5) uv.setY(i, uv.getY(i) + v0 / tile);
  }
  if (facade) {
    const a = new Float32Array(g.attributes.position.count * 2);
    for (let i = 0; i < a.length; i += 2) { a[i] = facade[0]; a[i + 1] = facade[1]; }
    g.setAttribute("facade", new THREE.BufferAttribute(a, 2));
  }
  g.translate(0, y0, 0);
  return g;
}

// A smooth tapered limb or post: profile is [[radius, y], ...] from bottom to top.
export function lathe(profile, segs = 20) {
  return new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(Math.max(r, 0.0001), y)), segs);
}

// Loft a closed cross-section along z: section(t) returns {a, b, cy, n, top} for t in 0..1.
// a: half width, b: half height, cy: centre height, n: superellipse power, pinch: narrowing toward the top.
export function loft(z0, z1, stations, around, section) {
  const pos = [], idx = [], uv = [];
  for (let i = 0; i <= stations; i++) {
    const tt = i / stations;
    const t = 0.5 - 0.5 * Math.cos(tt * Math.PI); // more stations near the ends
    const z = z0 + (z1 - z0) * t;
    const s = section(t);
    for (let j = 0; j < around; j++) {
      const th = (j / around) * Math.PI * 2;
      const c = Math.cos(th), sn = Math.sin(th);
      const e = 2 / s.n;
      let x = Math.sign(c) * Math.pow(Math.abs(c), e) * s.a;
      const y = Math.sign(sn) * Math.pow(Math.abs(sn), e) * s.b;
      const up = (y / Math.max(s.b, 1e-4) + 1) / 2;
      x *= 1 - (s.pinch ?? 0) * up;
      pos.push(x, s.cy + y, z);
      uv.push(j / around, t);
    }
  }
  for (let i = 0; i < stations; i++) for (let j = 0; j < around; j++) {
    const a = i * around + j, b = i * around + ((j + 1) % around), c = (i + 1) * around + j, d = (i + 1) * around + ((j + 1) % around);
    idx.push(a, b, c, b, d, c);
  }
  // Caps.
  const capStart = pos.length / 3;
  const s0 = section(0), s1 = section(1);
  pos.push(0, s0.cy, z0, 0, s1.cy, z1);
  uv.push(0.5, 0, 0.5, 1);
  for (let j = 0; j < around; j++) {
    idx.push(capStart, (j + 1) % around, j);
    const o = stations * around;
    idx.push(capStart + 1, o + j, o + ((j + 1) % around));
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export function mesh(geo, mat, { cast = true } = {}) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = cast;
  m.receiveShadow = true;
  return m;
}

// Merge every mesh under root that shares a material into one mesh per material.
// Lamps, glows and anything marked userData.keep stay as they are.
export function mergeStatic(root) {
  root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const byMat = new Map();
  const keep = [];
  root.traverse((o) => {
    if (o === root) return;
    if (keep.some((k) => isUnder(o, k))) return;
    if (o.userData.keep || o.userData.lookLamp || o.userData.lookGlow || o.userData.lookTraffic || o.isInstancedMesh || (o.isMesh && Array.isArray(o.material))) { keep.push(o); return; }
    if (!o.isMesh) return;
    const key = o.material.uuid + (o.geometry.index ? "i" : "n") + Object.keys(o.geometry.attributes).sort().join();
    if (!byMat.has(key)) byMat.set(key, { mat: o.material, geos: [], cast: o.castShadow });
    const g = o.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld));
    byMat.get(key).geos.push(g);
  });
  const out = new THREE.Group();
  out.name = root.name;
  out.userData = { ...root.userData };
  out.position.copy(root.position); out.quaternion.copy(root.quaternion); out.scale.copy(root.scale);
  for (const { mat, geos, cast } of byMat.values()) {
    const g = geos.length === 1 ? geos[0] : mergeGeometries(geos, false);
    if (!g) continue;
    g.userData.lookUV = true;
    const m = mesh(g, mat, { cast });
    out.add(m);
  }
  for (const k of keep) {
    const m = new THREE.Matrix4().multiplyMatrices(inv, k.matrixWorld);
    k.removeFromParent();
    m.decompose(k.position, k.quaternion, k.scale);
    out.add(k);
  }
  return out;
}

function isUnder(o, k) {
  for (let p = o.parent; p; p = p.parent) if (p === k) return true;
  return false;
}
