// Rain: falling streaks in a box that follows the camera, splashes on the
// ground, and a wetness value that the asphalt, facades and reflections use.
import * as THREE from "three";

export function makeRain(count = 6000) {
  const pos = new Float32Array(count * 2 * 3);
  const seed = new Float32Array(count * 2 * 4);
  for (let i = 0; i < count; i++) {
    const s = [Math.random(), Math.random(), Math.random(), Math.random()];
    for (let e = 0; e < 2; e++) {
      pos.set([0, e, 0], (i * 2 + e) * 3);
      seed.set(s, (i * 2 + e) * 4);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 4));
  const uniforms = { uTime: { value: 0 }, uCam: { value: new THREE.Vector3() }, uAmount: { value: 1 }, uWind: { value: new THREE.Vector2(1.2, 0.4) }, uColor: { value: new THREE.Color("#a9b8d8") } };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    vertexShader: /* glsl */ `
      attribute vec4 aSeed; uniform float uTime, uAmount; uniform vec3 uCam; uniform vec2 uWind; varying float vA;
      void main() {
        vec3 box = vec3(50.0, 26.0, 50.0);
        float speed = 22.0 + aSeed.w * 8.0;
        vec3 base = vec3(aSeed.x * box.x, aSeed.y * box.y - uTime * speed, aSeed.z * box.z);
        base.xz += uWind * uTime;
        vec3 p = uCam + mod(base - uCam, box) - box * 0.5;
        vec3 dir = normalize(vec3(uWind.x, -speed, uWind.y));
        p -= dir * position.y * (0.55 + aSeed.w * 0.3);
        vA = (aSeed.w < uAmount ? 1.0 : 0.0) * (0.25 + 0.5 * position.y);
        float d = distance(p, cameraPosition);
        vA *= smoothstep(1.0, 4.0, d) * (1.0 - smoothstep(18.0, 25.0, d));
        gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying float vA;
      void main() { gl_FragColor = vec4(uColor * vA * 0.5, 1.0); }`,
  });
  const lines = new THREE.LineSegments(g, mat);
  lines.frustumCulled = false;
  lines.userData.noShadow = true;
  lines.userData.look = { name: "rain" };

  // Splashes: little rings that pop on the ground near the camera.
  const N = 500;
  const splash = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({
    uniforms: { uTime: uniforms.uTime, uAmount: uniforms.uAmount, uColor: uniforms.uColor },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      varying vec2 vUv; varying float vPh;
      uniform float uTime;
      void main() {
        vUv = uv;
        vec4 o = instanceMatrix[3];
        vPh = fract(uTime * 1.6 + o.x * 0.37 + o.z * 0.91);
        vec3 p = position * (0.05 + vPh * 0.2);
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uAmount; uniform vec3 uColor; varying vec2 vUv; varying float vPh;
      void main() { float r = length(vUv - 0.5) * 2.0; float ring = smoothstep(0.75, 0.9, r) * (1.0 - smoothstep(0.9, 1.0, r)); gl_FragColor = vec4(uColor * ring * (1.0 - vPh) * (1.0 - vPh) * 0.22 * uAmount, 1.0); }`,
  }), N);
  const m = new THREE.Matrix4();
  for (let i = 0; i < N; i++) splash.setMatrixAt(i, m.makeTranslation((Math.random() - 0.5) * 24, 0.035, (Math.random() - 0.5) * 24));
  splash.frustumCulled = false;
  splash.userData.noShadow = true;
  splash.userData.look = { name: "rain" };
  const group = new THREE.Group();
  group.add(lines, splash);
  group.userData.look = { name: "rain" };
  return {
    group, uniforms,
    update(t, camera, amount) {
      uniforms.uTime.value = t;
      uniforms.uCam.value.copy(camera.position);
      uniforms.uAmount.value = amount;
      group.visible = amount > 0.01;
      splash.position.set(Math.round(camera.position.x / 24) * 24, 0, Math.round(camera.position.z / 24) * 24);
    },
  };
}
