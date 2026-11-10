// UVs in metres. A texture that is 8 m across must repeat every 8 m on a
// road of any length, and a facade needs metres along the wall and up from
// the ground. fitUV rewrites a mesh's UVs that way (box projection, using the
// mesh's world scale), and LOOK runs it on every mesh whose material asks for
// it, so a model can put LOOK materials on plain boxes and planes.
import * as THREE from "three";

const _s = new THREE.Vector3(), _q = new THREE.Quaternion(), _p = new THREE.Vector3();

function tileOf(material) {
  const l = material?.userData?.look;
  if (!l) return null;
  if (l.uv === "meters") return l.tile ?? 4;
  if (l.uv === "facade") return 1;
  return null;
}

// Rewrite a geometry's uv attribute: box projection in metres, divided by tile.
// For box-like faces it also snaps facade bays so windows meet the corners.
export function metreUV(geometry, scale = new THREE.Vector3(1, 1, 1), tile = 1, opts = {}) {
  const pos = geometry.attributes.position, nor = geometry.attributes.normal;
  if (!pos) return geometry;
  if (!nor) geometry.computeVertexNormals();
  const n = geometry.attributes.normal;
  geometry.computeBoundingBox();
  const min = geometry.boundingBox.min, max = geometry.boundingBox.max;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const x = (pos.getX(i) - min.x) * scale.x, y = (pos.getY(i) - min.y) * scale.y, z = (pos.getZ(i) - min.z) * scale.z;
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
    let u, v;
    if (ay >= ax && ay >= az) { u = x; v = z; }
    else if (ax >= az) { u = n.getX(i) > 0 ? (max.z - min.z) * scale.z - z : z; v = y; }
    else { u = n.getZ(i) > 0 ? x : (max.x - min.x) * scale.x - x; v = y; }
    uv[i * 2] = u / tile;
    uv[i * 2 + 1] = v / tile;
  }
  // Facades: stretch each wall slightly so it holds a whole number of bays.
  if (opts.bay) {
    const spanX = (max.x - min.x) * scale.x, spanZ = (max.z - min.z) * scale.z;
    for (let i = 0; i < pos.count; i++) {
      const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
      if (ay >= ax && ay >= az) continue;
      const span = ax >= az ? spanZ : spanX;
      const bays = Math.max(1, Math.round(span / opts.bay));
      uv[i * 2] *= (bays * opts.bay) / Math.max(span, 1e-3);
    }
  }
  geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  geometry.userData.lookUV = true;
  return geometry;
}

// Fit one mesh (cloning a shared geometry first so other meshes keep theirs).
export function fitUV(mesh) {
  if (!mesh.isMesh || mesh.isInstancedMesh || mesh.geometry?.userData?.lookUV) return false;
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  const m = mats.find((x) => tileOf(x) != null);
  if (!m) return false;
  mesh.updateWorldMatrix(true, false);
  mesh.matrixWorld.decompose(_p, _q, _s);
  mesh.geometry = metreUV(mesh.geometry.clone(), _s, tileOf(m), { bay: m.userData.look.uv === "facade" ? m.userData.look.bay : 0 });
  return true;
}

// Walk a scene and fit what needs it. Cheap to call every frame: fitted
// geometries are skipped.
export function fitAll(root) {
  let n = 0;
  root.traverse((o) => {
    if (o.isMesh && fitUV(o)) n++;
  });
  return n;
}
