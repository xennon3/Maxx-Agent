// Night lighting that a weak GPU can afford: every lamp gets a glowing head,
// a pool of light on the ground, a haze cone in the fog and (when the street
// is wet) a long shimmering reflection; only the few lamps nearest the camera
// get a real shadow-free SpotLight. Neon signs and car lights add glows too.
import * as THREE from "three";

const MAX = 512;

function additive(vertex, fragment, uniforms) {
  return new THREE.ShaderMaterial({ uniforms, vertexShader: vertex, fragmentShader: fragment, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, toneMapped: true });
}

const VERT = /* glsl */ `
  varying vec2 vUv; varying vec3 vCol; varying float vDist; varying vec3 vN; varying vec3 vV;
  void main() {
    vUv = uv;
    vCol = vec3(1.0);
    mat4 m = modelMatrix;
    #ifdef USE_INSTANCING
      m = modelMatrix * instanceMatrix;
    #endif
    #ifdef USE_INSTANCING_COLOR
      vCol = instanceColor;
    #endif
    vec4 wp = m * vec4(position, 1.0);
    vN = normalize(mat3(m) * normal);
    vV = normalize(cameraPosition - wp.xyz);
    vDist = distance(cameraPosition, wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }`;

export class Lights {
  constructor(scene, quality = "high") {
    this.scene = scene;
    this.lamps = [];
    this.glows = [];
    this.dirty = true;
    this.real = [];
    this.uniforms = { uOn: { value: 1 }, uWet: { value: 0 }, uFog: { value: 0.01 }, uHaze: { value: 1 } };
    const n = quality === "high" ? 8 : quality === "medium" ? 4 : 2;
    for (let i = 0; i < n; i++) {
      const s = new THREE.SpotLight(0xffc27a, 0, 34, 0.95, 0.65, 2);
      s.castShadow = false;
      s.userData.noShadow = true;
      scene.add(s, s.target);
      this.real.push(s);
    }
    const u = this.uniforms;
    this.pools = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), additive(VERT, /* glsl */ `
      uniform float uOn, uFog; varying vec2 vUv; varying vec3 vCol; varying float vDist;
      void main() { float r = length(vUv - 0.5) * 2.0; float a = pow(max(1.0 - r, 0.0), 2.2); gl_FragColor = vec4(vCol * a * 0.32 * uOn * exp(-uFog * vDist * 0.5), 1.0); }`, u), MAX);
    this.cones = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.12, 1, 1, 24, 1, true).translate(0, -0.5, 0), additive(VERT, /* glsl */ `
      uniform float uOn, uHaze; varying vec2 vUv; varying vec3 vCol; varying vec3 vN; varying vec3 vV;
      void main() { float f = pow(abs(dot(normalize(vN), normalize(vV))), 1.6); float a = f * pow(vUv.y, 1.4) * 0.11 * uHaze * uOn; gl_FragColor = vec4(vCol * a, 1.0); }`, u), MAX);
    this.cones.material.side = THREE.DoubleSide;
    this.streaks = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), additive(VERT, /* glsl */ `
      uniform float uWet, uFog; varying vec2 vUv; varying vec3 vCol; varying float vDist;
      void main() {
        float x = (vUv.x - 0.5) * 2.0; float y = 1.0 - vUv.y;
        float a = exp(-x * x * 6.0) * smoothstep(0.0, 0.04, y) * pow(1.0 - y, 1.6);
        a *= 0.75 + 0.25 * sin(y * 90.0 + x * 7.0);
        gl_FragColor = vec4(vCol * a * 0.9 * uWet * exp(-uFog * vDist * 0.6), 1.0);
      }`, u), MAX);
    for (const m of [this.pools, this.cones, this.streaks]) {
      m.count = 0;
      m.frustumCulled = false;
      m.userData.noShadow = true;
      m.userData.look = { name: "lighting-fx" };
      m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(MAX * 3), 3);
      scene.add(m);
    }
    this.cones.renderOrder = 10;
    this._m = new THREE.Matrix4();
    this._c = new THREE.Color();
    this._frame = 0;
  }

  // A street lamp: its head at `position`, shining down.
  addLamp({ position, color = null, power = 1, reach = null }) {
    const l = { position: position.clone(), color: color ? new THREE.Color(color) : null, power, reach: reach ?? position.y * 1.3 };
    this.lamps.push(l);
    this.glows.push({ position: l.position, color: l.color, power: power * 0.9, lamp: true, lampRef: l });
    this.dirty = true;
    return l;
  }

  // Anything bright that should mirror in a wet street: a neon sign, a car light.
  addGlow({ position, color = "#ff2a6d", power = 1 }) {
    const g = { position: position.clone ? position.clone() : new THREE.Vector3(...position), color: new THREE.Color(color), power };
    this.glows.push(g);
    return g;
  }

  removeGlow(g) {
    const i = this.glows.indexOf(g);
    if (i >= 0) this.glows.splice(i, 1);
  }

  update(camera, look) {
    const on = look.lampsOn;
    const u = this.uniforms;
    u.uOn.value = on ? 1 : 0;
    u.uWet.value = look.wet;
    u.uFog.value = look.fogDensity;
    u.uHaze.value = 0.6 + look.fogDensity * 40 + look.rain * 0.6;
    const lampColor = look.lampColor;
    const m = this._m, c = this._c;
    if (this.dirty) {
      this.dirty = false;
      const n = Math.min(this.lamps.length, MAX);
      for (let i = 0; i < n; i++) {
        const l = this.lamps[i], col = l.color ?? lampColor;
        const r = l.reach;
        m.makeScale(r * 2, 1, r * 2).setPosition(l.position.x, 0.03, l.position.z);
        this.pools.setMatrixAt(i, m);
        this.pools.setColorAt(i, c.copy(col).multiplyScalar(l.power));
        m.makeScale(r * 0.8, l.position.y - 0.1, r * 0.8).setPosition(l.position.x, l.position.y - 0.05, l.position.z);
        this.cones.setMatrixAt(i, m);
        this.cones.setColorAt(i, c.copy(col).multiplyScalar(l.power));
      }
      this.pools.count = this.cones.count = n;
      for (const x of [this.pools, this.cones]) {
        x.instanceMatrix.needsUpdate = true;
        if (x.instanceColor) x.instanceColor.needsUpdate = true;
      }
    }
    this.pools.visible = this.cones.visible = on && this.lamps.length > 0;
    // Real lights for the nearest lamps (re-picked every few frames).
    if (on && this._frame++ % 8 === 0) {
      const cp = camera.position;
      const near = this.lamps.map((l) => [l, l.position.distanceToSquared(cp)]).sort((a, b) => a[1] - b[1]).slice(0, this.real.length);
      this.real.forEach((s, i) => {
        const l = near[i]?.[0];
        if (!l) return (s.intensity = 0);
        s.position.copy(l.position);
        s.target.position.set(l.position.x, 0, l.position.z);
        s.target.updateMatrixWorld();
        s.color.copy(l.color ?? lampColor);
        s.intensity = 90 * l.power;
        s.distance = l.reach * 2.6;
      });
    }
    if (!on) this.real.forEach((s) => (s.intensity = 0));
    // Wet reflections stretch from under each glow toward the camera.
    const wet = look.wet;
    let k = 0;
    if (wet > 0.05) {
      const cp = camera.position;
      for (const g of this.glows) {
        if (k >= MAX) break;
        if (g.object) {
          if (!g.object.parent) continue;
          g.object.getWorldPosition(g.position);
        }
        if (g.lamp && !on) continue;
        const p = g.position;
        const dx = cp.x - p.x, dz = cp.z - p.z;
        const d = Math.hypot(dx, dz);
        if (d > 160 || d < 0.5) continue;
        const len = Math.min(p.y * 2.2 + 2, d * 0.9);
        const ang = Math.atan2(dx, dz);
        m.makeRotationY(ang);
        m.scale(new THREE.Vector3(Math.max(0.5, p.y * 0.18), 1, len));
        m.setPosition(p.x + (dx / d) * len * 0.5, 0.04, p.z + (dz / d) * len * 0.5);
        this.streaks.setMatrixAt(k, m);
        this.streaks.setColorAt(k, c.copy(g.color ?? lampColor).multiplyScalar(g.power));
        k++;
      }
    }
    this.streaks.count = k;
    this.streaks.visible = k > 0;
    this.streaks.instanceMatrix.needsUpdate = true;
    if (this.streaks.instanceColor) this.streaks.instanceColor.needsUpdate = true;
  }
}
