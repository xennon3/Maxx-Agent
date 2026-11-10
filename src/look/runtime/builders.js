// Builders: detailed, real-scale things a game can drop in with one call.
// 1 unit = 1 metre. Storeys are about 3.2 m, a lane 3.5 m, a person 1.75 m,
// a car 4.6 m long. Everything casts shadows and uses LOOK's PBR materials.
import * as THREE from "three";
import * as M from "./materials.js";
import { facade, STYLES } from "./facade.js";
import { box, lathe, loft, mesh, mergeStatic } from "./parts.js";
import { canvas, hash2, rng } from "./noise.js";

const mat = (name, o = {}) => M.cached(name, M[name], o);
const pick = (r, a) => a[Math.floor(r() * a.length) % a.length];

// ---------------------------------------------------------------- buildings

export function building(o = {}) {
  const r = rng(o.seed ?? Math.floor(Math.random() * 1e6));
  const style = o.style ?? pick(r, Object.keys(STYLES));
  const s = STYLES[style] ?? STYLES.brick;
  const w = o.w ?? o.width ?? 20, d = o.d ?? o.depth ?? 18;
  const storeys = Math.max(1, Math.round(((o.h ?? o.height ?? 30) - s.ground - 1.2) / s.storey));
  const top = s.ground + storeys * s.storey;
  const H = top + 1.2;
  const seed = r() * 100;
  // One shared material per style, so a whole city merges into a few meshes;
  // the per-building seed (in the facade attribute) still varies every window.
  const wallMat = o.colors || o.wall ? facade({ style, ...(o.colors ?? {}), ...(o.wall ? { wall: o.wall, wall2: o.wall2 ?? o.wall } : {}) }) : M.cached(`facade:${style}`, () => facade({ style }));
  const trim = mat("concrete", { color: style === "brick" ? "#b8b0a2" : style === "stucco" ? "#ece4d4" : "#8d8a84" });
  const g = new THREE.Group();
  g.name = o.name ?? `building-${style}`;
  // Tall buildings step back as they rise.
  const tiers = [];
  if (H > 45 && r() < 0.75) {
    const cut1 = s.ground + Math.round((storeys * (0.55 + r() * 0.15))) * s.storey;
    tiers.push({ w, d, y0: 0, y1: cut1 });
    const inset = 2 + r() * 2.5;
    const w2 = Math.max(8, w - inset * 2), d2 = Math.max(8, d - inset * 2);
    if (H > 80 && r() < 0.6) {
      const cut2 = cut1 + Math.round(((top - cut1) / s.storey) * 0.6) * s.storey;
      tiers.push({ w: w2, d: d2, y0: cut1, y1: cut2 });
      tiers.push({ w: Math.max(6, w2 - inset * 2), d: Math.max(6, d2 - inset * 2), y0: cut2, y1: H });
    } else tiers.push({ w: w2, d: d2, y0: cut1, y1: H });
  } else tiers.push({ w, d, y0: 0, y1: H });
  tiers.forEach((t, i) => {
    const last = i === tiers.length - 1;
    const floorsTop = last ? top : t.y1;
    g.add(mesh(box(t.w, t.y1 - t.y0, t.d, { y0: t.y0, v0: t.y0, bay: s.bay, facade: [floorsTop, seed + i] }), wallMat));
    // Cornice at the top of each tier, and a ledge over the shop floor.
    g.add(mesh(box(t.w + 0.5, 0.35, t.d + 0.5, { y0: t.y1 - (last ? 0 : 0.2), tile: 4 }), trim));
    if (i === 0) g.add(mesh(box(t.w + 0.3, 0.28, t.d + 0.3, { y0: s.ground - 0.2, tile: 4 }), trim));
  });
  // Roof clutter.
  const tt = tiers[tiers.length - 1];
  if (o.roof !== false) {
    const metal = mat("metal", { color: "#8e949a", roughness: 0.45 });
    const n = 2 + Math.floor(r() * 4);
    for (let i = 0; i < n; i++) {
      const ac = new THREE.Group();
      ac.add(mesh(box(1.6, 1.0, 1.1, { tile: 2 }), metal));
      const fan = mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.06, 20), mat("rubber", { color: "#2a2c2e" }));
      fan.position.set(0, 1.02, 0);
      ac.add(fan);
      ac.position.set((r() - 0.5) * (tt.w - 4), tt.y1, (r() - 0.5) * (tt.d - 4));
      ac.rotation.y = Math.floor(r() * 4) * (Math.PI / 2);
      g.add(ac);
    }
    const stair = mesh(box(3, 2.6, 3.2, { y0: tt.y1, tile: 4 }), trim);
    stair.position.set((r() - 0.5) * (tt.w - 6), 0, (r() - 0.5) * (tt.d - 6));
    g.add(stair);
    if ((style === "brick" || style === "stucco") && r() < 0.6) g.add(waterTank(tt, r));
    if (H > 60 && r() < 0.5) {
      const mast = mesh(lathe([[0.25, 0], [0.12, 6], [0.04, 14]], 10), metal);
      mast.position.set(0, tt.y1, 0);
      g.add(mast);
      const tip = mesh(new THREE.SphereGeometry(0.18, 12, 8), M.lightLens({ color: "#ff3030", power: 6 }), { cast: false });
      tip.position.set(0, tt.y1 + 14, 0);
      g.add(tip);
    }
  }
  // Shop fronts: awnings and neon signs on the street sides (+z, and +x for corners).
  const faces = o.front ?? ["+z"];
  for (const f of faces) {
    const along = f.endsWith("z") ? w : d;
    const out = (f.endsWith("z") ? d : w) / 2;
    const bays = Math.max(1, Math.round(along / s.bay / 2));
    const bw = along / bays;
    for (let b = 0; b < bays; b++) {
      const c = -along / 2 + bw * (b + 0.5);
      const roll = r();
      if (roll < 0.45 && o.awnings !== false) {
        const aw = awning(bw * 0.8, pick(r, ["#7a1f1f", "#1f4d3a", "#23395d", "#5b2a5e", "#8a5a14"]));
        aw.position.set(0, s.ground * 0.72, out);
        place(aw, f, c);
        g.add(aw);
      } else if (roll < 0.8 && o.signs !== false) {
        const sign = neonSign({ text: o.signText ?? pick(r, SIGNS), color: pick(r, NEON), height: 0.7 + r() * 0.4 });
        sign.position.set(0, s.ground - 0.75, out + 0.12);
        place(sign, f, c);
        g.add(sign);
      }
    }
  }
  g.position.set(o.x ?? 0, 0, o.z ?? 0);
  g.rotation.y = o.rotation ?? 0;
  g.userData.look = { name: "building", style, height: H, storeys };
  g.userData.collider = { w, d };
  return o.merge === false ? g : mergeStatic(g);
}

function place(obj, face, along) {
  if (face === "+z") obj.position.x = along;
  else if (face === "-z") { obj.position.x = -along; obj.position.z *= -1; obj.rotation.y = Math.PI; }
  else if (face === "+x") { const z = obj.position.z; obj.position.set(z, obj.position.y, -along); obj.rotation.y = Math.PI / 2; }
  else if (face === "-x") { const z = obj.position.z; obj.position.set(-z, obj.position.y, along); obj.rotation.y = -Math.PI / 2; }
}

const SIGNS = ["NOODLES", "BAR", "HOTEL", "24/7", "PHARMACY", "PAWN", "DINER", "TATTOO", "LIQUOR", "ARCADE", "RAMEN", "LAUNDRY", "PIZZA", "CLUB", "MOTEL", "SUSHI", "DELI", "BOOKS"];
const NEON = ["#ff2a6d", "#05d9e8", "#ff9f1c", "#b967ff", "#39ff88", "#fffb96", "#ff4d4d"];

function waterTank(t, r) {
  const g = new THREE.Group();
  const wood = mat("wood", { color: "#6b4a30" });
  const metal = mat("metal", { color: "#3b3f44", roughness: 0.6 });
  const body = mesh(new THREE.CylinderGeometry(1.4, 1.4, 2.6, 24), wood);
  body.position.y = 3.6;
  const cap = mesh(new THREE.ConeGeometry(1.55, 0.9, 24), metal);
  cap.position.y = 5.35;
  g.add(body, cap);
  for (let i = 0; i < 4; i++) {
    const leg = mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.3, 8), metal);
    leg.position.set(Math.cos(i * 1.57 + 0.78) * 1.1, 1.15, Math.sin(i * 1.57 + 0.78) * 1.1);
    g.add(leg);
  }
  g.position.set((r() - 0.5) * (t.w - 5), t.y1, (r() - 0.5) * (t.d - 5));
  return g;
}

export function awning(width = 3, color = "#7a1f1f") {
  const c = canvas(128), x = c.getContext("2d");
  x.fillStyle = color; x.fillRect(0, 0, 128, 128);
  x.fillStyle = "rgba(255,255,255,0.85)";
  for (let i = 0; i < 128; i += 32) x.fillRect(i, 0, 16, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.set(width / 1.2, 1);
  const m = new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.8, sheen: 0.5, sheenColor: new THREE.Color("#ffffff"), side: THREE.DoubleSide });
  const g = new THREE.Group();
  const shape = new THREE.Shape();
  shape.moveTo(0, 0); shape.lineTo(1.3, -0.7); shape.lineTo(1.3, -0.95); shape.lineTo(1.24, -0.95); shape.lineTo(1.24, -0.74); shape.lineTo(0, -0.06);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: width, bevelEnabled: false }).translate(0, 0, -width / 2).rotateY(-Math.PI / 2);
  geo.computeVertexNormals();
  const a = mesh(geo, m);
  g.add(a);
  // ExtrudeGeometry's UVs are in shape units; good enough for stripes across the width.
  g.userData.look = { name: "awning" };
  return g;
}

// ---------------------------------------------------------------- neon signs

export function neonSign(o = {}) {
  const { text = "OPEN", color = "#ff2a6d", height = 0.8, power = 5, font = "700 96px 'Arial Narrow', Arial, sans-serif" } = o;
  const c = document.createElement("canvas");
  const x = c.getContext("2d");
  x.font = font;
  const tw = Math.ceil(x.measureText(text).width) + 60;
  c.width = Math.min(2048, tw); c.height = 150;
  x.font = font;
  x.textAlign = "center"; x.textBaseline = "middle";
  x.fillStyle = "#000"; x.fillRect(0, 0, c.width, c.height);
  x.lineWidth = 9; x.strokeStyle = "#fff"; x.lineJoin = "round";
  x.strokeText(text, c.width / 2, c.height / 2 + 4);
  x.fillStyle = "#222"; x.fillText(text, c.width / 2, c.height / 2 + 4);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const w = (height * c.width) / c.height;
  const g = new THREE.Group();
  const board = mesh(box(w + 0.3, height + 0.25, 0.12, { tile: 2, y0: -(height + 0.25) / 2 }), mat("metal", { color: "#1a1c20", roughness: 0.5 }));
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w, height), new THREE.MeshStandardMaterial({ color: "#050505", emissive: color, emissiveMap: tex, emissiveIntensity: power, roughness: 0.4, transparent: false }));
  face.position.z = 0.065;
  face.userData.noShadow = true;
  const glow = new THREE.Object3D();
  glow.userData.lookGlow = { color, power: 1.2 };
  g.add(board, face, glow);
  g.userData.look = { name: "neonSign", text };
  return g;
}

// ---------------------------------------------------------------- street furniture

export function streetLamp(o = {}) {
  const { height = 7.5, reach = 1.6, color = null, power = 1 } = o;
  const metal = mat("metal", { color: "#2b2f33", roughness: 0.5, brushed: false });
  const g = new THREE.Group();
  g.add(mesh(lathe([[0.16, 0], [0.13, 0.5], [0.09, 0.6], [0.075, height - 0.4], [0.06, height]], 14), metal));
  const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, height - 0.6, 0), new THREE.Vector3(0, height + 0.15, 0), new THREE.Vector3(reach, height + 0.05, 0));
  g.add(mesh(new THREE.TubeGeometry(curve, 16, 0.05, 8), metal));
  const head = new THREE.Group();
  head.add(mesh(box(0.75, 0.16, 0.34, { tile: 2 }), metal));
  const lens = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.24).rotateX(Math.PI / 2), M.lightLens({ color: color ?? "#ffe2b0", power: 10 }));
  lens.position.y = -0.005;
  lens.userData.noShadow = true;
  head.add(lens);
  head.position.set(reach + 0.2, height - 0.05, 0);
  const bulb = new THREE.Object3D();
  bulb.position.y = -0.1;
  bulb.userData.lookLamp = { color, power };
  head.add(bulb);
  g.add(head);
  g.userData.look = { name: "streetLamp" };
  return g;
}

export function trafficLight(o = {}) {
  const { arm = 4.5 } = o;
  const metal = mat("metal", { color: "#2d3136", roughness: 0.55, brushed: false });
  const g = new THREE.Group();
  g.add(mesh(lathe([[0.14, 0], [0.1, 0.4], [0.09, 5.6]], 12), metal));
  const a = mesh(new THREE.CylinderGeometry(0.06, 0.07, arm, 10).rotateZ(Math.PI / 2), metal);
  a.position.set(arm / 2, 5.4, 0);
  g.add(a);
  const head = new THREE.Group();
  head.add(mesh(box(0.38, 1.05, 0.3, { tile: 2, y0: -0.52 }), mat("metal", { color: "#1d2024", roughness: 0.6 })));
  const cols = ["#ff2a1a", "#ffb000", "#20ff70"];
  const lenses = cols.map((c, i) => {
    const l = new THREE.Mesh(new THREE.CircleGeometry(0.11, 20), new THREE.MeshStandardMaterial({ color: "#111", emissive: c, emissiveIntensity: 0.05 }));
    l.position.set(0, 0.32 - i * 0.32, 0.155);
    l.userData.noShadow = true;
    head.add(l);
    return l;
  });
  head.position.set(arm - 0.4, 5.25, 0);
  head.userData.lookTraffic = { lenses, offset: o.offset ?? 0 };
  head.userData.keep = true;
  g.add(head);
  g.userData.look = { name: "trafficLight" };
  return g;
}

export function hydrant() {
  const red = M.cached("hydrant", () => new THREE.MeshPhysicalMaterial({ color: "#b3201a", roughness: 0.45, clearcoat: 0.4 }));
  const g = new THREE.Group();
  g.add(mesh(lathe([[0.16, 0], [0.14, 0.08], [0.12, 0.1], [0.12, 0.55], [0.14, 0.58], [0.1, 0.7], [0.05, 0.78], [0.0, 0.8]], 16), red));
  const nub = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.36, 10).rotateZ(Math.PI / 2), red);
  nub.position.y = 0.45;
  g.add(nub);
  g.userData.look = { name: "hydrant" };
  return g;
}

export function trashCan() {
  const g = new THREE.Group();
  g.add(mesh(lathe([[0.27, 0], [0.3, 0.9], [0.31, 0.92], [0.3, 0.95], [0.0, 0.97]], 18), mat("metal", { color: "#2f4a3a", roughness: 0.55, brushed: false })));
  g.userData.look = { name: "trashCan" };
  return g;
}

// ---------------------------------------------------------------- trees

let leafTex = null;
function leaves() {
  if (leafTex) return leafTex;
  const c = canvas(256), x = c.getContext("2d");
  x.clearRect(0, 0, 256, 256);
  const r = rng(9);
  for (let i = 0; i < 70; i++) {
    const px = 40 + r() * 176, py = 40 + r() * 176, a = r() * Math.PI * 2, s = 10 + r() * 16;
    x.save(); x.translate(px, py); x.rotate(a);
    const gshade = 90 + Math.floor(r() * 80);
    x.fillStyle = `rgb(${40 + Math.floor(r() * 30)},${gshade},${30 + Math.floor(r() * 25)})`;
    x.beginPath(); x.ellipse(0, 0, s, s * 0.45, 0, 0, Math.PI * 2); x.fill();
    x.strokeStyle = "rgba(0,0,0,0.25)"; x.lineWidth = 1; x.beginPath(); x.moveTo(-s, 0); x.lineTo(s, 0); x.stroke();
    x.restore();
  }
  leafTex = new THREE.CanvasTexture(c);
  leafTex.colorSpace = THREE.SRGBColorSpace;
  return leafTex;
}

export function tree(o = {}) {
  const r = rng(o.seed ?? Math.floor(Math.random() * 1e6));
  const H = o.height ?? 6 + r() * 3;
  const bark = M.cached("bark", () => {
    const m = M.wood({ color: "#4a3b2e", seed: 3 });
    m.userData.look = { name: "bark", uv: "own" };
    return m;
  });
  const g = new THREE.Group();
  g.add(mesh(lathe([[0.22, 0], [0.16, 0.4], [0.14, H * 0.45], [0.08, H * 0.8], [0.02, H]], 10), bark));
  const crown = new THREE.Vector3(0, H * 0.72, 0);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + r();
    const len = H * 0.35;
    const b = mesh(lathe([[0.07, 0], [0.02, len]], 6), bark);
    b.position.set(0, H * (0.45 + r() * 0.2), 0);
    b.rotation.set(0, a, 0.7 + r() * 0.3);
    g.add(b);
  }
  const N = o.leaves ?? 260;
  const leafMat = M.cached("leaf", () => new THREE.MeshStandardMaterial({ map: leaves(), alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.75 }));
  const im = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.3, 1.3), leafMat, N);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), sc = new THREE.Vector3();
  const tint = new THREE.Color();
  const rx = H * 0.36, ry = H * 0.3;
  for (let i = 0; i < N; i++) {
    let x, y, z;
    do { x = r() * 2 - 1; y = r() * 2 - 1; z = r() * 2 - 1; } while (x * x + y * y + z * z > 1);
    p.set(crown.x + x * rx, crown.y + y * ry, crown.z + z * rx);
    q.setFromEuler(e.set(r() * 6.28, r() * 6.28, r() * 6.28));
    const s = 0.7 + r() * 0.6;
    im.setMatrixAt(i, m.compose(p, q, sc.set(s, s, s)));
    const shade = 0.6 + (y + 1) * 0.25 + r() * 0.15;
    im.setColorAt(i, tint.setRGB(shade * 0.95, shade, shade * 0.85));
  }
  im.castShadow = true;
  im.receiveShadow = true;
  g.add(im);
  g.userData.look = { name: "tree" };
  return g;
}

// ---------------------------------------------------------------- cars

const CAR_TYPES = {
  sedan: { L: 4.7, W: 1.86, H: 1.45, belt: 0.98, hood: 0.86, trunk: 0.98, cab: [-1.25, 0.85], roof: [-0.6, 0.2], n: 3.2, clear: 0.3, wheel: 0.34, wb: 2.8 },
  hatch: { L: 4.1, W: 1.8, H: 1.5, belt: 0.98, hood: 0.84, trunk: 1.02, cab: [-1.95, 0.75], roof: [-1.75, 0.15], n: 3.4, clear: 0.3, wheel: 0.32, wb: 2.6 },
  suv: { L: 4.8, W: 1.95, H: 1.78, belt: 1.12, hood: 1.05, trunk: 1.15, cab: [-2.2, 0.95], roof: [-2.05, 0.3], n: 4.5, clear: 0.42, wheel: 0.4, wb: 2.9 },
  sport: { L: 4.5, W: 1.95, H: 1.2, belt: 0.84, hood: 0.68, trunk: 0.88, cab: [-1.0, 0.6], roof: [-0.55, -0.05], n: 2.8, clear: 0.22, wheel: 0.34, wb: 2.65 },
  taxi: { L: 4.7, W: 1.86, H: 1.45, belt: 0.98, hood: 0.86, trunk: 0.98, cab: [-1.25, 0.85], roof: [-0.6, 0.2], n: 3.2, clear: 0.3, wheel: 0.34, wb: 2.8 },
};
const CAR_COLORS = ["#7a0d16", "#0f2f5c", "#1c1c1e", "#d9d9d6", "#6e7378", "#2f4f3a", "#8a6a2a", "#3a1f4f", "#b5b9bd", "#0c3b3a"];

export function car(o = {}) {
  const r = rng(o.seed ?? Math.floor(Math.random() * 1e6));
  const type = o.type ?? pick(r, ["sedan", "sedan", "hatch", "suv", "sport"]);
  const T = CAR_TYPES[type] ?? CAR_TYPES.sedan;
  const color = o.color ?? (type === "taxi" ? "#f2b705" : pick(r, CAR_COLORS));
  const paint = M.carPaint({ color });
  const dark = mat("rubber", { color: "#0b0c0d" });
  const trimM = mat("metal", { color: "#151617", roughness: 0.4, brushed: false });
  const g = new THREE.Group();
  const L = T.L, hw = T.W / 2, z0 = -L / 2, z1 = L / 2;
  const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  // Lower body: front at +z.
  const body = loft(z0, z1, 40, 36, (t) => {
    const z = z0 + (z1 - z0) * t;
    const endF = sm(0, 0.07, t) * sm(1, 0.92, t);
    const topY = z > T.cab[1] ? T.hood + (T.belt - T.hood) * sm(z1, T.cab[1], z) * 0.9 - 0.12 * sm(z1 - 0.6, z1, z) : z < T.cab[0] ? T.trunk - 0.05 * sm(z0 + 0.5, z0, z) : T.belt;
    const bottom = T.clear;
    const b = (topY - bottom) / 2;
    return { a: hw * (0.82 + 0.18 * endF), b: b * (0.7 + 0.3 * Math.sqrt(endF)), cy: bottom + b, n: T.n, pinch: 0.06 };
  });
  g.add(mesh(body, paint));
  // Glass house and roof.
  const [c0, c1] = T.cab, [r0, r1] = T.roof;
  const cabin = loft(c0, c1, 24, 32, (t) => {
    const z = c0 + (c1 - c0) * t;
    const up = z < r0 ? sm(c0, r0, z) : z > r1 ? sm(c1, r1, z) : 1;
    const h = (T.H - T.belt) * (0.08 + 0.92 * up);
    return { a: hw * 0.9, b: h / 2 + 0.04, cy: T.belt - 0.04 + h / 2, n: 3, pinch: 0.28 };
  });
  g.add(mesh(cabin, M.glass({ tint: "#0e1418", opacity: 0.92 })));
  const roofG = loft(r0 - 0.08, r1 + 0.05, 10, 32, (t) => ({ a: hw * 0.68, b: 0.05, cy: T.H - 0.02, n: 4 }));
  g.add(mesh(roofG, paint));
  // Wheels in dark arches.
  const wheels = [];
  const tyre = lathe([[0.0, -0.12], [T.wheel - 0.05, -0.12], [T.wheel, -0.09], [T.wheel, 0.09], [T.wheel - 0.05, 0.12], [0.0, 0.12]], 28);
  tyre.rotateZ(Math.PI / 2);
  const rimM = M.chrome({ color: "#c9ccd0", roughness: 0.25 });
  for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    const wg = new THREE.Group();
    wg.add(mesh(tyre, dark));
    const rim = mesh(new THREE.CylinderGeometry(T.wheel * 0.62, T.wheel * 0.62, 0.05, 24).rotateZ(Math.PI / 2), rimM);
    rim.position.x = sx * 0.1;
    wg.add(rim);
    for (let k = 0; k < 5; k++) {
      const sp = mesh(new THREE.BoxGeometry(0.03, T.wheel * 1.1, 0.06), rimM);
      sp.position.x = sx * 0.125;
      sp.rotation.x = (k / 5) * Math.PI;
      wg.add(sp);
    }
    wg.position.set(sx * (hw - 0.14), T.wheel, sz * T.wb / 2);
    const arch = new THREE.Mesh(new THREE.CircleGeometry(T.wheel + 0.06, 24, 0, Math.PI), new THREE.MeshStandardMaterial({ color: "#050505", roughness: 1, side: THREE.DoubleSide }));
    arch.rotation.y = sx * Math.PI / 2;
    arch.position.set(sx * (hw - 0.02), T.wheel, sz * T.wb / 2);
    g.add(arch, wg);
    wheels.push(wg);
  }
  // Lights, grille, mirrors, plate.
  const head = M.lightLens({ color: "#f4f6ff", power: o.lightsOn === false ? 0.3 : 6 });
  const tail = M.lightLens({ color: "#ff1a1a", power: o.lightsOn === false ? 0.4 : 3.5 });
  for (const sx of [1, -1]) {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.1, 0.06), head);
    hl.position.set(sx * (hw - 0.3), T.hood - 0.12, z1 - 0.07);
    hl.rotation.y = sx * -0.25;
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.09, 0.05), tail);
    tl.position.set(sx * (hw - 0.32), T.trunk - 0.13, z0 + 0.05);
    hl.userData.noShadow = tl.userData.noShadow = true;
    g.add(hl, tl);
    const mir = mesh(box(0.2, 0.12, 0.1, { tile: 1 }), paint);
    mir.position.set(sx * (hw + 0.05), T.belt + 0.04, T.cab[1] - 0.25);
    g.add(mir);
  }
  const grille = mesh(box(T.W * 0.48, 0.16, 0.05, { tile: 1 }), trimM);
  grille.position.set(0, T.hood - 0.32, z1 - 0.03);
  g.add(grille);
  const plateC = canvas(128); const px = plateC.getContext("2d");
  plateC.height = 64; px.fillStyle = "#e8e8e0"; px.fillRect(0, 0, 128, 64); px.fillStyle = "#1a2a6a"; px.font = "bold 34px monospace"; px.textAlign = "center"; px.fillText(String(Math.floor(r() * 9000 + 1000)) + "X", 64, 44);
  const pt = new THREE.CanvasTexture(plateC); pt.colorSpace = THREE.SRGBColorSpace;
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.12), new THREE.MeshStandardMaterial({ map: pt, roughness: 0.4 }));
  plate.position.set(0, T.trunk - 0.35, z0 - 0.005);
  plate.rotation.y = Math.PI;
  g.add(plate);
  if (type === "taxi") {
    const sign = neonSign({ text: "TAXI", color: "#fff3b0", height: 0.2, power: 2.5 });
    sign.position.set(0, T.H + 0.12, (r0 + r1) / 2);
    sign.rotation.y = Math.PI / 2;
    g.add(sign);
  }
  // Glows that follow the car for wet reflections.
  const hg = new THREE.Object3D(); hg.position.set(0, 0.7, z1); hg.userData.lookGlow = { color: "#f4f6ff", power: o.lightsOn === false ? 0 : 0.9, follow: true };
  const tg = new THREE.Object3D(); tg.position.set(0, 0.85, z0); tg.userData.lookGlow = { color: "#ff1a1a", power: o.lightsOn === false ? 0 : 0.6, follow: true };
  g.add(hg, tg);
  g.userData.look = { name: "car", type };
  g.userData.wheels = wheels;
  g.userData.collider = { w: T.W, d: T.L };
  g.userData.size = { length: T.L, width: T.W, height: T.H };
  let spin = 0;
  // Turn the wheels: speed in m/s, steer in radians (front wheels).
  g.userData.drive = (dt, speed, steer = 0) => {
    spin += (speed * dt) / T.wheel;
    wheels.forEach((w, i) => {
      w.rotation.set(spin, i < 2 ? steer : 0, 0, "YXZ");
    });
  };
  g.drive = g.userData.drive;
  return g;
}

// ---------------------------------------------------------------- people

const OUTFITS = [
  { shirt: "#2f4a6e", pants: "#24262b", shoes: "#141414", hair: "#2a1d14" },
  { shirt: "#8a2b2b", pants: "#3b4a63", shoes: "#2b2b2b", hair: "#120d0a" },
  { shirt: "#d9d4c7", pants: "#45403a", shoes: "#3a2a1e", hair: "#6b4a2a" },
  { shirt: "#1e1e22", pants: "#1a1a1d", shoes: "#0d0d0d", hair: "#c9a467" },
  { shirt: "#3d6b4a", pants: "#2c2f36", shoes: "#e8e8e8", hair: "#3b2a20" },
];
const SKINS = ["#f1c8a8", "#d9a07a", "#b9805a", "#8d5a3b", "#5e3a26"];

export function human(o = {}) {
  const r = rng(o.seed ?? Math.floor(Math.random() * 1e6));
  const fit = { ...pick(r, OUTFITS), ...o };
  const sk = M.skin({ color: o.skin ?? pick(r, SKINS) });
  const shirt = M.fabric({ color: fit.shirt });
  const pants = M.fabric({ color: fit.pants, sheen: 0.2 });
  const shoes = new THREE.MeshStandardMaterial({ color: fit.shoes, roughness: 0.55 });
  const hairM = new THREE.MeshStandardMaterial({ color: fit.hair, roughness: 0.65 });
  const H = o.height ?? 1.76, k = H / 1.76;
  const root = new THREE.Group();
  const J = (name, parent, x, y, z) => { const j = new THREE.Group(); j.name = name; j.position.set(x, y, z); parent.add(j); return j; };
  const limb = (parent, profile, m, sx = 1, sz = 1) => { const g = mesh(lathe(profile, 18), m); g.rotation.x = Math.PI; g.scale.set(sx, 1, sz); parent.add(g); return g; };
  const hips = J("hips", root, 0, 0.95 * k, 0);
  // Pelvis and torso.
  const pelvis = mesh(lathe([[0.0, -0.1], [0.12, -0.08], [0.165, 0.0], [0.155, 0.1]], 20), pants); pelvis.scale.set(1.15, 1, 0.75); hips.add(pelvis);
  const spine = J("spine", hips, 0, 0.1, 0);
  const torso = mesh(lathe([[0.15, 0], [0.14, 0.12], [0.16, 0.28], [0.18, 0.4], [0.165, 0.46], [0.08, 0.5], [0.0, 0.505]], 22), shirt);
  torso.scale.set(1.18, 1, 0.68); spine.add(torso);
  const neck = J("neck", spine, 0, 0.5, 0);
  neck.add(mesh(lathe([[0.055, 0], [0.05, 0.1]], 12), sk));
  const head = J("head", neck, 0, 0.1, 0.01);
  const skull = mesh(new THREE.SphereGeometry(0.105, 28, 20), sk); skull.scale.set(0.92, 1.12, 1.0); skull.position.y = 0.11; head.add(skull);
  const jaw = mesh(new THREE.SphereGeometry(0.08, 20, 14), sk); jaw.scale.set(0.95, 0.8, 1.0); jaw.position.set(0, 0.05, 0.02); head.add(jaw);
  const nose = mesh(new THREE.ConeGeometry(0.018, 0.045, 10).rotateX(Math.PI / 2), sk); nose.position.set(0, 0.095, 0.105); head.add(nose);
  for (const sx of [1, -1]) {
    const ear = mesh(new THREE.SphereGeometry(0.025, 10, 8), sk); ear.scale.set(0.5, 1, 0.8); ear.position.set(sx * 0.098, 0.1, 0); head.add(ear);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 8), new THREE.MeshStandardMaterial({ color: "#1b1410", roughness: 0.2 }));
    eye.position.set(sx * 0.035, 0.125, 0.093); head.add(eye);
  }
  const hair = mesh(new THREE.SphereGeometry(0.112, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), hairM); hair.scale.set(0.95, 1.12, 1.06); hair.position.set(0, 0.12, -0.01); hair.rotation.x = -0.25; head.add(hair);
  const parts = { root, hips, spine, neck, head, arms: [], legs: [] };
  for (const sx of [1, -1]) {
    const sh = J("shoulder", spine, sx * 0.19, 0.44, 0);
    sh.add(mesh(new THREE.SphereGeometry(0.06, 14, 10), shirt));
    limb(sh, [[0.055, 0], [0.05, 0.14], [0.042, 0.29]], shirt);
    const el = J("elbow", sh, 0, -0.29, 0);
    limb(el, [[0.04, 0], [0.036, 0.14], [0.028, 0.25]], o.sleeves === "short" ? sk : shirt);
    const hand = mesh(new THREE.SphereGeometry(0.045, 12, 10), sk); hand.scale.set(0.6, 1.3, 1); hand.position.y = -0.3; el.add(hand);
    const hip = J("hip", hips, sx * 0.09, -0.05, 0);
    limb(hip, [[0.085, 0], [0.075, 0.2], [0.055, 0.43]], pants);
    const knee = J("knee", hip, 0, -0.43, 0);
    limb(knee, [[0.052, 0], [0.05, 0.12], [0.036, 0.42]], pants);
    const foot = mesh(box(0.1, 0.08, 0.25, { tile: 1 }), shoes); foot.position.set(0, -0.47, 0.06); knee.add(foot);
    parts.arms.push({ sh, el, side: sx });
    parts.legs.push({ hip, knee, side: sx });
  }
  root.userData.look = { name: "human" };
  root.userData.parts = parts;
  root.userData.collider = { w: 0.5, d: 0.35 };
  let phase = 0, blend = 0;
  // Walk / run cycle: speed in m/s (0 idles, ~1.4 walks, 4+ runs).
  root.userData.animate = (dt, speed = 0) => {
    const run = Math.min(1, Math.max(0, (speed - 1.8) / 2.5));
    const moving = Math.min(1, speed / 0.6);
    blend += (moving - blend) * Math.min(1, dt * 8);
    phase += dt * (speed > 0.05 ? (speed / (1.3 + run * 0.9)) * Math.PI * 2 * 0.55 : 1.2);
    const sw = Math.sin(phase), cw = Math.cos(phase);
    const legA = (0.45 + run * 0.35) * blend, armA = (0.35 + run * 0.5) * blend;
    parts.legs.forEach(({ hip, knee, side }) => {
      const s = side > 0 ? sw : -sw;
      hip.rotation.x = s * legA - run * 0.15 * blend;
      knee.rotation.x = Math.max(0, -Math.cos(phase + (side > 0 ? 0 : Math.PI)) * (0.55 + run * 0.7)) * blend + 0.05;
    });
    parts.arms.forEach(({ sh, el, side }) => {
      const s = side > 0 ? -sw : sw;
      sh.rotation.x = s * armA;
      sh.rotation.z = side * (0.03 + run * 0.05);
      el.rotation.x = -(0.15 + run * 1.1 * blend + Math.max(0, s) * 0.3 * blend);
    });
    const breathe = Math.sin(phase * 0.5) * 0.004 * (1 - blend);
    hips.position.y = 0.95 * k - Math.abs(cw) * (0.03 + run * 0.04) * blend + breathe;
    spine.rotation.x = run * 0.18 * blend;
    spine.rotation.y = sw * 0.08 * blend;
    head.rotation.y = -sw * 0.05 * blend;
  };
  root.animate = root.userData.animate;
  root.scale.setScalar(o.scale ?? 1);
  return root;
}

// ---------------------------------------------------------------- ground and city

export function ground(o = {}) {
  const { size = 400, material = "grass", y = 0 } = o;
  const m = typeof material === "string" ? mat(material, o.options ?? {}) : material;
  const g = mesh(new THREE.PlaneGeometry(size, size).rotateX(-Math.PI / 2), m, { cast: false });
  g.position.y = y;
  g.userData.look = { name: "ground" };
  return g;
}

// A grid of city blocks: streets with lane markings and crossings, kerbs and
// pavements, buildings of mixed styles (taller downtown), lamps, traffic lights,
// parked cars, trees and street furniture. Returns colliders and lanes for gameplay.
export function city(o = {}) {
  const r = rng(o.seed ?? 7);
  const blocks = o.blocks ?? 3, block = o.block ?? 64, road = o.road ?? 14, walk = o.sidewalk ?? 4.5;
  const wet = o.wet ?? 0;
  const pitch = block + road;
  const span = blocks * pitch;
  const off = -span / 2;
  const styles = o.styles ?? ["brick", "brick", "concrete", "glass", "stucco", "metal"];
  const [hMin, hMax] = o.heights ?? [12, 90];
  const root = new THREE.Group();
  root.name = "city";
  const statics = new THREE.Group();
  const colliders = [];
  const lanes = [];
  // Road surface: one plane under everything.
  const asphalt = M.asphalt({ wet, tile: 8 });
  const rs = mesh(new THREE.PlaneGeometry(span + road * 2 + 200, span + road * 2 + 200).rotateX(-Math.PI / 2), asphalt, { cast: false });
  rs.position.y = 0;
  root.add(rs);
  const pave = M.pavement({ wet: wet * 0.8 });
  const kerb = mat("concrete", { color: "#a19d95", wet: wet * 0.7 });
  const white = M.roadPaint({ wet }), yellow = M.roadPaint({ color: "#e0b43a", wet });
  const lines = { white: [], yellow: [] };
  const strip = (list, x, z, w, l, rot = 0) => {
    const g = new THREE.PlaneGeometry(w, l).rotateX(-Math.PI / 2).rotateY(rot).translate(x, 0.012, z);
    list.push(g);
  };
  // Blocks.
  for (let bx = 0; bx < blocks; bx++) for (let bz = 0; bz < blocks; bz++) {
    const x0 = off + bx * pitch + road / 2, z0 = off + bz * pitch + road / 2;
    const cx = x0 + block / 2, cz = z0 + block / 2;
    const sw = mesh(box(block, 0.15, block, { tile: 1 }), [kerb, kerb, pave, kerb, kerb, kerb]);
    // Material arrays need groups' UVs in each material's tile: pavement tiles at 3 m.
    sw.geometry = box(block, 0.15, block, { tile: 3 });
    sw.material = [kerb, kerb, pave, kerb, kerb, kerb];
    sw.position.set(cx, 0, cz);
    statics.add(sw);
    // Parcels along the four sides.
    const lot = block - walk * 2;
    const parcels = split({ x: cx - lot / 2, z: cz - lot / 2, w: lot, d: lot }, r, 22, 3);
    const dist = Math.hypot(cx, cz) / (span * 0.7);
    for (const p of parcels) {
      const gap = 0.4 + r() * 0.8;
      const w = p.w - gap, d = p.d - gap;
      if (w < 6 || d < 6) continue;
      const tall = Math.pow(r(), 1.6) * (1 - Math.min(1, dist) * 0.7);
      const h = hMin + (hMax - hMin) * tall;
      // Which sides face a street?
      const front = [];
      if (Math.abs(p.z + p.d - (cz + lot / 2)) < 0.5) front.push("+z");
      if (Math.abs(p.z - (cz - lot / 2)) < 0.5) front.push("-z");
      if (Math.abs(p.x + p.w - (cx + lot / 2)) < 0.5) front.push("+x");
      if (Math.abs(p.x - (cx - lot / 2)) < 0.5) front.push("-x");
      const b = building({ w, d, h, style: pick(r, styles), seed: Math.floor(r() * 1e6), x: p.x + p.w / 2, z: p.z + p.d / 2, front: front.slice(0, 2), merge: false, signs: o.signs, awnings: o.awnings });
      b.position.y = 0.15;
      statics.add(b);
      colliders.push({ minX: p.x + p.w / 2 - w / 2, maxX: p.x + p.w / 2 + w / 2, minZ: p.z + p.d / 2 - d / 2, maxZ: p.z + p.d / 2 + d / 2 });
    }
    // Street furniture around the kerb.
    const edge = block / 2 - 0.6;
    for (let side = 0; side < 4; side++) {
      const rot = (side * Math.PI) / 2;
      const dir = new THREE.Vector3(Math.sin(rot), 0, Math.cos(rot));
      const tan = new THREE.Vector3(dir.z, 0, -dir.x);
      for (let t = -block / 2 + 8; t <= block / 2 - 8; t += 24) {
        const lamp = streetLamp({ color: o.lampColor });
        const p = new THREE.Vector3(cx, 0.15, cz).addScaledVector(dir, edge).addScaledVector(tan, t + (side % 2) * 12);
        lamp.position.copy(p);
        lamp.rotation.y = rot - Math.PI / 2;
        statics.add(lamp);
      }
      if (o.trees !== false) for (let t = -block / 2 + 14; t <= block / 2 - 14; t += 18) {
        if (r() < 0.45) continue;
        const tr = tree({ seed: Math.floor(r() * 1e6), height: 6 + r() * 2.5 });
        tr.position.copy(new THREE.Vector3(cx, 0.15, cz).addScaledVector(dir, edge - 1.4).addScaledVector(tan, t));
        statics.add(tr);
      }
      for (let t = -block / 2 + 5; t <= block / 2 - 5; t += 9) {
        const roll = r();
        const p = new THREE.Vector3(cx, 0.15, cz).addScaledVector(dir, edge - 0.6).addScaledVector(tan, t);
        if (roll < 0.06) { const h = hydrant(); h.position.copy(p); statics.add(h); }
        else if (roll < 0.12) { const c = trashCan(); c.position.copy(p); statics.add(c); }
      }
      // Parked cars along the kerb.
      if (o.cars !== false) for (let t = -block / 2 + 10; t <= block / 2 - 10; t += 6.5) {
        if (r() > (o.parked ?? 0.35)) continue;
        const c = car({ seed: Math.floor(r() * 1e6), lightsOn: false });
        const p = new THREE.Vector3(cx, 0, cz).addScaledVector(dir, block / 2 + 1.3).addScaledVector(tan, t);
        c.position.copy(p);
        c.rotation.y = rot + Math.PI / 2 + (r() - 0.5) * 0.04;
        const parked = mergeStatic(c);
        parked.position.copy(c.position); parked.rotation.copy(c.rotation);
        root.add(parked);
        colliders.push({ minX: p.x - 2.4, maxX: p.x + 2.4, minZ: p.z - 2.4, maxZ: p.z + 2.4, car: true });
      }
    }
  }
  // Markings: centre lines, lane dashes, stop lines and zebra crossings.
  for (let i = 0; i <= blocks; i++) {
    const c = off + i * pitch;
    for (let j = 0; j < blocks; j++) {
      const a = off + j * pitch + road / 2 + 6, b = off + (j + 1) * pitch - road / 2 - 6;
      const len = b - a, mid = (a + b) / 2;
      strip(lines.yellow, c - 0.12, mid, 0.12, len); strip(lines.yellow, c + 0.12, mid, 0.12, len);
      strip(lines.yellow, mid, c - 0.12, len, 0.12); strip(lines.yellow, mid, c + 0.12, len, 0.12);
      for (let t = a + 1.5; t < b - 1; t += 6) {
        strip(lines.white, c - road / 4, t, 0.12, 3); strip(lines.white, c + road / 4, t, 0.12, 3);
        strip(lines.white, t, c - road / 4, 3, 0.12); strip(lines.white, t, c + road / 4, 3, 0.12);
      }
      // Zebra at both ends of this stretch, both directions.
      for (const e of [a - 3, b + 3]) {
        for (let k = -road / 2 + 0.8; k < road / 2 - 0.5; k += 1.1) {
          strip(lines.white, c + k, e, 0.55, 3.2);
          strip(lines.white, e, c + k, 3.2, 0.55);
        }
      }
      lanes.push({ from: [c + road / 4, a], to: [c + road / 4, b] }, { from: [c - road / 4, b], to: [c - road / 4, a] });
      lanes.push({ from: [a, c - road / 4], to: [b, c - road / 4] }, { from: [b, c + road / 4], to: [a, c + road / 4] });
    }
  }
  const merged = (list, m) => { if (!list.length) return; const g = mesh(mergeGeo(list), m, { cast: false }); g.geometry.userData.lookUV = true; root.add(g); };
  merged(lines.white, white);
  merged(lines.yellow, yellow);
  // Traffic lights at each inner crossing.
  for (let i = 1; i < blocks; i++) for (let j = 1; j < blocks; j++) {
    const cx = off + i * pitch, cz = off + j * pitch;
    [[1, 1, 0], [-1, -1, Math.PI], [1, -1, Math.PI / 2], [-1, 1, -Math.PI / 2]].forEach(([sx, sz, rot], k) => {
      const tl = trafficLight({ arm: road / 2 - 0.5, offset: k % 2 });
      tl.position.set(cx + sx * (road / 2 + 0.5), 0.15, cz + sz * (road / 2 + 0.5));
      tl.rotation.y = rot + Math.PI;
      root.add(tl);
    });
  }
  // Everything that never moves becomes a few big meshes, one per material.
  root.add(mergeStatic(statics));
  root.userData.look = { name: "city", blocks, pitch };
  const spawn = new THREE.Vector3(off + pitch + road / 2 + 2, 0.15, off + pitch + road / 2 + 10);
  return {
    group: root, colliders, lanes, spawn, size: span,
    // True when (x, z) is inside a building (or a parked car, unless cars is false).
    blocked(x, z, pad = 0.3, cars = true) {
      return colliders.some((c) => (cars || !c.car) && x > c.minX - pad && x < c.maxX + pad && z > c.minZ - pad && z < c.maxZ + pad);
    },
    // Ground height: pavements are 15 cm above the road.
    heightAt(x, z) {
      const lx = ((((x - off) % pitch) + pitch) % pitch), lz = ((((z - off) % pitch) + pitch) % pitch);
      return lx > road / 2 && lx < pitch - road / 2 && lz > road / 2 && lz < pitch - road / 2 ? 0.15 : 0;
    },
  };
}

import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
function mergeGeo(list) {
  return mergeGeometries(list, false);
}

function split(p, r, min, depth) {
  if (depth <= 0 || (p.w < min * 1.6 && p.d < min * 1.6)) return [p];
  const alongX = p.w >= p.d;
  const t = 0.35 + r() * 0.3;
  if (alongX) {
    const w1 = p.w * t;
    return [...split({ x: p.x, z: p.z, w: w1, d: p.d }, r, min, depth - 1), ...split({ x: p.x + w1, z: p.z, w: p.w - w1, d: p.d }, r, min, depth - 1)];
  }
  const d1 = p.d * t;
  return [...split({ x: p.x, z: p.z, w: p.w, d: d1 }, r, min, depth - 1), ...split({ x: p.x, z: p.z + d1, w: p.w, d: p.d - d1 }, r, min, depth - 1)];
}

export { hash2 };
