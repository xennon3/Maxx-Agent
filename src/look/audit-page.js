// Runs inside any three.js page (Maxx injects it; LOOK.audit() calls it too).
// It reads the live scene and reports what makes a 3D game look cheap:
// lighting models that can't reflect anything, flat untextured surfaces,
// stretched textures, no tone mapping, no shadows, no sky light, toy scale.
// Plain JavaScript on purpose: no imports, no build step.
(function lookAudit() {
  const seen = window.__LOOK_SEEN__ || { scenes: [], renderers: [] };
  const stage = window.__LOOK_STAGE__;
  const scenes = new Set(seen.scenes);
  const renderers = new Set(seen.renderers);
  if (stage) { scenes.add(stage.scene); renderers.add(stage.renderer); }
  const out = {
    three: window.__THREE__ || null, look: !!window.LOOK, preset: stage ? stage.look.name : null, quality: stage ? stage.quality : null,
    scenes: scenes.size, renderers: renderers.size, meshes: 0, triangles: 0, materials: {}, flatBig: 0, flatBigNames: [], stretched: [], boxes: 0, primitives: 0,
    shadowsOn: false, toneMapping: null, colorSpace: null, env: false, fog: false, lights: {}, castShadow: 0, emissive: 0,
    bigPlanes: 0, people: [], buildings: [], post: stage ? !!stage.composer : null, sky: false, extent: 0, instanced: 0, textures: 0,
  };
  const TONES = { 0: "none", 1: "linear", 2: "reinhard", 3: "cineon", 4: "aces", 6: "agx", 7: "neutral", 5: "custom" };
  for (const r of renderers) {
    out.shadowsOn = out.shadowsOn || !!(r.shadowMap && r.shadowMap.enabled);
    out.toneMapping = TONES[r.toneMapping] || String(r.toneMapping);
    out.colorSpace = r.outputColorSpace || (r.outputEncoding === 3001 ? "srgb" : "linear");
  }
  const texSeen = new Set();
  const size = (o) => {
    const g = o.geometry;
    if (!g) return null;
    if (!g.boundingBox) g.computeBoundingBox();
    const b = g.boundingBox;
    const s = o.getWorldScale ? o.getWorldScale(new o.position.constructor()) : { x: 1, y: 1, z: 1 };
    return { x: (b.max.x - b.min.x) * Math.abs(s.x), y: (b.max.y - b.min.y) * Math.abs(s.y), z: (b.max.z - b.min.z) * Math.abs(s.z) };
  };
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const scene of scenes) {
    out.env = out.env || !!scene.environment;
    out.fog = out.fog || !!scene.fog;
    if (scene.background && scene.background.isTexture) out.sky = true;
    scene.updateMatrixWorld(true);
    scene.traverse((o) => {
      if (o.isLight) {
        const k = o.type;
        out.lights[k] = (out.lights[k] || 0) + 1;
        return;
      }
      if (!o.isMesh && !o.isInstancedMesh) return;
      if (o.userData && o.userData.look && o.userData.look.name === "sky") { out.sky = true; return; }
      if (o.material && o.material.isShaderMaterial && o.geometry && o.geometry.type && /Sphere/.test(o.geometry.type) && o.material.side === 1) out.sky = true;
      out.meshes++;
      if (o.isInstancedMesh) out.instanced++;
      const g = o.geometry;
      const tris = g ? (g.index ? g.index.count : (g.attributes.position ? g.attributes.position.count : 0)) / 3 : 0;
      out.triangles += tris * (o.isInstancedMesh ? o.count : 1);
      const gt = g && g.type;
      if (gt === "BoxGeometry" || gt === "CylinderGeometry" || gt === "SphereGeometry" || gt === "CapsuleGeometry" || gt === "PlaneGeometry" || gt === "ConeGeometry") out.primitives++;
      if (gt === "BoxGeometry" && tris <= 12) out.boxes++;
      if (o.castShadow) out.castShadow++;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      const s = size(o);
      const big = s ? Math.max(s.x, s.y, s.z) : 0;
      if (s) {
        const p = o.getWorldPosition(new (o.position.constructor)());
        minX = Math.min(minX, p.x - s.x / 2); maxX = Math.max(maxX, p.x + s.x / 2); minZ = Math.min(minZ, p.z - s.z / 2); maxZ = Math.max(maxZ, p.z + s.z / 2);
        if (gt === "BoxGeometry" && s.y > 8 && s.y > s.x * 0.4) out.buildings.push(Math.round(s.y));
      }
      for (const m of mats) {
        if (!m) continue;
        out.materials[m.type] = (out.materials[m.type] || 0) + 1;
        if (m.emissive && (m.emissiveIntensity || 0) * Math.max(m.emissive.r, m.emissive.g, m.emissive.b) > 0.8) out.emissive++;
        const lookMat = m.userData && m.userData.look;
        const textured = !!(m.map || m.normalMap || m.roughnessMap || m.emissiveMap || m.isShaderMaterial || (m.onBeforeCompile && String(m.onBeforeCompile).length > 30) || lookMat);
        if (!textured && big > 6 && !m.isMeshBasicMaterial && !o.isInstancedMesh) {
          out.flatBig++;
          if (out.flatBigNames.length < 6) out.flatBigNames.push((o.name || gt || "mesh") + ` (${Math.round(big)} m)`);
        }
        if (gt === "PlaneGeometry" && s && Math.max(s.x, s.z) > 80 && !textured) out.bigPlanes++;
        // Texture pixels per metre: under ~24 a texture looks smeared up close.
        const t = m.map || m.emissiveMap;
        if (t && t.image && t.image.width && s && !lookMat && !(m.isShaderMaterial)) {
          if (!texSeen.has(t)) { texSeen.add(t); out.textures++; }
          const rep = Math.max(Math.abs(t.repeat ? t.repeat.x : 1), 0.001);
          const uvSpan = g.attributes.uv ? spanOf(g.attributes.uv) : 1;
          const ppm = (t.image.width * rep * uvSpan) / Math.max(1e-3, Math.max(s.x, s.z, s.y));
          if (ppm < 24 && big > 5 && out.stretched.length < 8) out.stretched.push(`${o.name || gt} (${Math.round(big)} m, ${ppm.toFixed(1)} px/m)`);
        }
      }
    });
  }
  function spanOf(uv) {
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < Math.min(uv.count, 400); i++) { const u = uv.getX(i); lo = Math.min(lo, u); hi = Math.max(hi, u); }
    return Math.max(1e-3, hi - lo);
  }
  if (isFinite(minX)) out.extent = Math.round(Math.max(maxX - minX, maxZ - minZ));
  out.buildings = out.buildings.sort((a, b) => a - b).slice(0, 200);
  // A person, if the game made one: the tallest thing named like one.
  try {
    for (const scene of scenes) scene.traverse((o) => {
      const n = (o.name || "") + " " + ((o.userData && o.userData.look && o.userData.look.name) || "");
      if (!/(^|\b)(player|hero|character|human|person)(\b|$)/i.test(n) || o.isScene) return;
      const V = o.position.constructor;
      let lo = Infinity, hi = -Infinity;
      o.traverse((m) => {
        const g = m.geometry;
        if (!g || !g.attributes || !g.attributes.position) return;
        if (!g.boundingBox) g.computeBoundingBox();
        const b = g.boundingBox;
        for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) {
          const v = new V(x, y, z).applyMatrix4(m.matrixWorld);
          lo = Math.min(lo, v.y); hi = Math.max(hi, v.y);
        }
      });
      if (isFinite(hi)) out.people.push({ name: n.trim(), height: +(hi - lo).toFixed(2) });
    });
  } catch (e) {}
  out.people = out.people.slice(0, 4);
  return out;
})()
