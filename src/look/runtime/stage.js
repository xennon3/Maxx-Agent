// LOOK.stage(): the renderer, camera, sky, sun, image-based light, fog,
// shadows, post effects (ambient occlusion, bloom, colour grade, film grain,
// anti-aliasing), rain and night lights, set up together from one preset.
import * as THREE from "three";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass.js";
import { GTAOPass } from "three/examples/jsm/postprocessing/GTAOPass.js";
import { PRESETS } from "./presets.js";
import { makeSky } from "./sky.js";
import { Lights } from "./lights.js";
import { makeRain } from "./weather.js";
import { FACADE } from "./facade.js";
import { fitUV } from "./fit.js";

const GradeShader = {
  uniforms: {
    tDiffuse: { value: null }, uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) },
    uSat: { value: 1 }, uContrast: { value: 1 }, uShadow: { value: new THREE.Vector3() }, uHigh: { value: new THREE.Vector3() },
    uVignette: { value: 0.25 }, uGrain: { value: 0.02 }, uCA: { value: 0 },
  },
  vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse; uniform float uTime, uSat, uContrast, uVignette, uGrain, uCA; uniform vec2 uRes; uniform vec3 uShadow, uHigh;
    varying vec2 vUv;
    float rand(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec2 d = vUv - 0.5; float r2 = dot(d, d);
      vec3 c;
      if (uCA > 0.0) { vec2 o = d * uCA * (0.5 + r2 * 4.0); c = vec3(texture2D(tDiffuse, vUv + o).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - o).b); }
      else c = texture2D(tDiffuse, vUv).rgb;
      float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
      c = mix(vec3(l), c, uSat);
      c = (c - 0.5) * uContrast + 0.5;
      c += uShadow * (1.0 - smoothstep(0.0, 0.55, l)) + uHigh * smoothstep(0.45, 1.0, l);
      c *= 1.0 - uVignette * smoothstep(0.1, 0.65, r2 * 1.8);
      c += (rand(vUv * uRes + fract(uTime * 7.31)) - 0.5) * uGrain;
      gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
    }`,
};

function autoQuality() {
  try {
    const q = new URLSearchParams(location.search).get("quality");
    if (q === "low" || q === "medium" || q === "high") return q;
  } catch {}
  const phone = (navigator.maxTouchPoints || 0) > 0 && Math.min(screen.width, screen.height) < 820;
  return phone ? "medium" : "high";
}

// The photographed sky for a preset: from look/hdri/<name>.js (a script tag
// works from file://). LOOK adds that script itself when the page didn't.
function withHdri(name, cb) {
  const reg = (window.LOOK_HDRI = window.LOOK_HDRI || {});
  if (reg[name]) return cb(reg[name]);
  const me = document.querySelector('script[src*="look.js"]');
  if (!me) return;
  const s = document.createElement("script");
  s.src = me.src.replace(/look\.js(\?.*)?$/, `hdri/${name}.js`);
  s.onload = () => reg[name] && cb(reg[name]);
  document.head.appendChild(s);
}

const TONES = { aces: THREE.ACESFilmicToneMapping, agx: THREE.AgXToneMapping, neutral: THREE.NeutralToneMapping, filmic: THREE.ACESFilmicToneMapping };

// Lambert, Phong and Toon materials can't reflect the sky: swap them for PBR.
export function upgradeMaterial(m) {
  if (!m || m.userData?.lookUpgraded || !(m.isMeshLambertMaterial || m.isMeshPhongMaterial || m.isMeshToonMaterial)) return m;
  const s = new THREE.MeshStandardMaterial({
    color: m.color, map: m.map, emissive: m.emissive, emissiveMap: m.emissiveMap, emissiveIntensity: m.emissiveIntensity ?? 1,
    transparent: m.transparent, opacity: m.opacity, side: m.side, vertexColors: m.vertexColors, alphaTest: m.alphaTest, alphaMap: m.alphaMap,
    normalMap: m.normalMap ?? null, flatShading: m.flatShading, fog: m.fog, depthWrite: m.depthWrite, wireframe: m.wireframe,
    roughness: m.isMeshPhongMaterial ? Math.max(0.15, 1 - Math.sqrt((m.shininess ?? 30) / 100)) : 0.85, metalness: 0,
  });
  s.name = m.name;
  s.userData = { ...m.userData, lookUpgraded: true, upgradedFrom: m.type };
  if (m.onBeforeCompile && m.onBeforeCompile.toString().length > 20) return m; // custom shaders: leave alone
  return s;
}

export function stage(opts = {}) {
  const quality = opts.quality ?? autoQuality();
  const container = opts.container ?? document.body;
  const renderer = opts.renderer ?? new THREE.WebGLRenderer({ canvas: opts.canvas, antialias: quality === "low", powerPreference: "high-performance", preserveDrawingBuffer: !!opts.preserveDrawingBuffer });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality === "high" ? 2 : 1.25));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  if (!opts.renderer && !opts.canvas) {
    container.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, { display: "block", width: "100%", height: "100%" });
  }
  const scene = opts.scene ?? new THREE.Scene();
  const camera = opts.camera ?? new THREE.PerspectiveCamera(opts.fov ?? 60, 1, opts.near ?? 0.1, opts.far ?? 1500);
  if (!camera.parent && !opts.camera) camera.position.set(0, 1.7, 6);

  const sky = makeSky();
  scene.add(sky.mesh);
  const sun = new THREE.DirectionalLight(0xffffff, 3);
  sun.castShadow = true;
  const sm = quality === "high" ? 2048 : quality === "medium" ? 1024 : 512;
  sun.shadow.mapSize.set(sm, sm);
  const span = opts.shadowSpan ?? 45;
  Object.assign(sun.shadow.camera, { left: -span, right: span, top: span, bottom: -span, near: 1, far: 400 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.04;
  sun.shadow.radius = 3;
  sun.userData.look = { name: "sun" };
  scene.add(sun, sun.target);
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5);
  scene.add(hemi);
  const lights = new Lights(scene, quality);
  const rain = makeRain(quality === "low" ? 2500 : quality === "medium" ? 4500 : 7000);
  scene.add(rain.group);

  const pmrem = new THREE.PMREMGenerator(renderer);
  let envTex = null;
  const skyEnv = () => {
    const s = new THREE.Scene();
    const m = makeSky();
    for (const k of Object.keys(m.uniforms)) if (k !== "uNoise") m.uniforms[k].value = sky.uniforms[k].value.clone ? sky.uniforms[k].value.clone() : sky.uniforms[k].value;
    s.add(m.mesh);
    const rt = pmrem.fromScene(s, 0.02);
    return rt.texture;
  };

  // Post effects.
  let composer = null, bloom = null, grade = null, gtao = null;
  if (quality !== "low") {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    if (quality === "high") {
      gtao = new GTAOPass(scene, camera, 1, 1);
      gtao.blendIntensity = 0.85;
      gtao.updateGtaoMaterial({ radius: 0.6, distanceExponent: 1.5, thickness: 1.2, scale: 1, samples: 12 });
      composer.addPass(gtao);
    }
    bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.5, 0.5, 1.0);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    if (quality === "high") composer.addPass(new SMAAPass(1, 1));
    grade = new ShaderPass(GradeShader);
    composer.addPass(grade);
  }

  const look = { name: "", wet: 0, rain: 0, night: 0, lampsOn: false, lampColor: new THREE.Color("#ffc27a"), fogDensity: 0, preset: null };
  const sunDir = new THREE.Vector3();
  const focus = new THREE.Vector3();
  let hdriToken = 0;

  function setPreset(name) {
    const p = typeof name === "object" ? name : PRESETS[name];
    if (!p) throw new Error(`LOOK: unknown preset "${name}". Presets: ${Object.keys(PRESETS).join(", ")}`);
    look.name = typeof name === "string" ? name : "custom";
    look.preset = p;
    renderer.toneMapping = TONES[p.tone] ?? THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = p.exposure ?? 1;
    const S = p.sky, U = sky.uniforms;
    U.uZenith.value.set(S.zenith); U.uHorizon.value.set(S.horizon); U.uGround.value.set(S.ground);
    U.uGlow.value.set(S.glow ?? "#000000"); U.uClouds.value = S.clouds ?? 0; U.uCloudLight.value.set(S.cloudLight ?? "#ffffff"); U.uCloudDark.value.set(S.cloudDark ?? "#888888"); U.uStars.value = S.stars ?? 0;
    const el = THREE.MathUtils.degToRad(p.sun.el), az = THREE.MathUtils.degToRad(p.sun.az);
    sunDir.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)).normalize();
    U.uSunDir.value.copy(sunDir);
    U.uSunColor.value.set(p.sun.color).multiplyScalar(p.sun.el > -2 ? Math.min(1.5, p.sun.power / 2.5) + (p.night > 0.5 ? 0.25 : 0) : 0);
    U.uSunSize.value = p.night > 0.5 ? 0.6 : 1;
    sun.color.set(p.sun.color);
    sun.intensity = p.sun.power;
    sun.castShadow = p.sun.shadows !== false;
    hemi.color.set(p.hemi.sky); hemi.groundColor.set(p.hemi.ground); hemi.intensity = p.hemi.power;
    if (p.fog) {
      scene.fog = new THREE.FogExp2(new THREE.Color(p.fog.color), p.fog.density);
      look.fogDensity = p.fog.density;
    } else {
      scene.fog = null;
      look.fogDensity = 0;
    }
    if (bloom) Object.assign(bloom, { strength: p.bloom.strength, radius: p.bloom.radius, threshold: p.bloom.threshold });
    if (grade) {
      const g = p.grade, u = grade.uniforms;
      u.uSat.value = g.saturation; u.uContrast.value = g.contrast; u.uShadow.value.set(...g.shadows); u.uHigh.value.set(...g.highlights);
      u.uVignette.value = g.vignette; u.uGrain.value = g.grain; u.uCA.value = g.aberration;
    }
    look.wet = p.wet ?? 0; look.rain = p.rain ?? 0; look.night = p.night ?? 0;
    look.lampsOn = !!p.lamps; if (p.lamps) look.lampColor.set(p.lamps.color);
    FACADE.uNight.value = look.night; FACADE.uLitFrac.value = p.litRooms ?? 0.5; FACADE.uWet.value = look.wet;
    FACADE.uDayInterior.value = 0.2 * (1 - look.night) + 0.03;
    scene.environmentIntensity = p.env ?? 1;
    if (envTex) envTex.dispose?.();
    envTex = skyEnv();
    scene.environment = envTex;
    scene.background = null;
    // Swap in the photographed sky light when it arrives.
    const token = ++hdriToken;
    if (p.hdri) withHdri(p.hdri, (url) => {
      new EXRLoader().load(url, (tex) => {
        if (token !== hdriToken) return tex.dispose();
        tex.mapping = THREE.EquirectangularReflectionMapping;
        const rt = pmrem.fromEquirectangular(tex);
        tex.dispose();
        envTex?.dispose?.();
        envTex = rt.texture;
        scene.environment = envTex;
      }, undefined, () => {});
    });
    return api;
  }

  // Older materials, missing shadows and stretched UVs get fixed as objects appear.
  const seen = new WeakSet();
  const traffic = [];
  const wp = new THREE.Vector3();
  function tidy() {
    scene.updateMatrixWorld();
    scene.traverse((o) => {
      if (seen.has(o)) return;
      seen.add(o);
      const u = o.userData;
      if (u.lookLamp) lights.addLamp({ position: wp.setFromMatrixPosition(o.matrixWorld), color: u.lookLamp.color, power: u.lookLamp.power ?? 1 });
      if (u.lookGlow && (u.lookGlow.power ?? 1) > 0) {
        const g = lights.addGlow({ position: wp.setFromMatrixPosition(o.matrixWorld), color: u.lookGlow.color, power: u.lookGlow.power ?? 1 });
        if (u.lookGlow.follow) g.object = o;
      }
      if (u.lookTraffic) traffic.push(u.lookTraffic);
      if (!(o.isMesh || o.isInstancedMesh) || o.userData.noShadow || o.userData.look?.name === "sky") return;
      if (opts.upgrade !== false) {
        if (Array.isArray(o.material)) o.material = o.material.map(upgradeMaterial);
        else o.material = upgradeMaterial(o.material);
      }
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      const clear = mats.every((m) => m && !m.transparent && m.blending === THREE.NormalBlending);
      if (opts.shadows !== false && clear) {
        if (o.userData.castShadow !== false) o.castShadow = true;
        o.receiveShadow = true;
      }
      fitUV(o);
    });
  }

  let w = 0, h = 0;
  function resize() {
    const el = renderer.domElement.parentElement && !opts.canvas ? renderer.domElement.parentElement : renderer.domElement;
    const W = (opts.width ?? (el === document.body ? window.innerWidth : el.clientWidth)) || window.innerWidth;
    const H = (opts.height ?? (el === document.body ? window.innerHeight : el.clientHeight)) || window.innerHeight;
    if (W === w && H === h) return;
    w = W; h = H;
    renderer.setSize(W, H, !opts.canvas);
    if (camera.isPerspectiveCamera) {
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    }
    if (composer) {
      composer.setSize(W, H);
      grade.uniforms.uRes.value.set(W, H);
    }
  }
  window.addEventListener("resize", resize);

  let t = 0, frame = 0, slow = 0;
  function update(dt = 1 / 60) {
    t += dt;
    resize();
    if (frame++ % 30 === 0) tidy();
    sky.uniforms.uTime.value = t;
    FACADE.uTime.value = t;
    if (grade) grade.uniforms.uTime.value = t;
    // The sun's shadow box follows what the player is looking at.
    const f = api.focus.lengthSq() > 0 ? api.focus : camera.position;
    sun.target.position.copy(f);
    sun.position.copy(f).addScaledVector(sunDir, 150);
    sun.target.updateMatrixWorld();
    lights.update(camera, look);
    for (const tl of traffic) {
      const ph = (t / 24 + tl.offset * 0.5) % 1;
      const on = ph < 0.45 ? 2 : ph < 0.52 ? 1 : 0;
      tl.lenses.forEach((l, i) => (l.material.emissiveIntensity = i === on ? 7 : 0.04));
    }
    rain.update(t, camera, look.rain);
    // Too slow? Drop the most expensive effect first.
    if (dt > 1 / 28) slow++;
    else slow = Math.max(0, slow - 1);
    if (slow > 90 && gtao && gtao.enabled) {
      gtao.enabled = false;
      slow = 0;
      console.info("LOOK: frame rate low, ambient occlusion off");
    }
  }
  function render() {
    if (composer) composer.render();
    else renderer.render(scene, camera);
  }
  const clock = new THREE.Clock();
  let running = false;
  function run(cb) {
    running = true;
    const loop = () => {
      if (!running) return;
      const dt = Math.min(clock.getDelta(), 0.1);
      cb?.(dt, t);
      update(dt);
      render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return api;
  }

  const api = {
    scene, camera, renderer, composer, sky, sun, hemi, lights, rain, quality, look, focus, sunDir,
    passes: { bloom, grade, gtao },
    setPreset, update, render, run, resize, tidy,
    stop() { running = false; },
    addLamp: (o) => lights.addLamp(o),
    addGlow: (o) => lights.addGlow(o),
    set wet(v) { look.wet = v; FACADE.uWet.value = v; },
    get wet() { return look.wet; },
    set rainAmount(v) { look.rain = v; },
    set night(v) { look.night = v; FACADE.uNight.value = v; },
  };
  resize();
  setPreset(opts.preset ?? "clear-day");
  if (typeof window !== "undefined") {
    window.__LOOK_STAGE__ = api;
  }
  return api;
}
