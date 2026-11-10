// A sky dome: gradient, sun or moon with a halo, moving clouds, stars and a
// glow on the horizon (sunset, or a city's light at night). It is HDR, so the
// sun blooms. The fog takes the horizon colour, so far streets melt into it.
import * as THREE from "three";
import { noiseTexture } from "./materials.js";

export function makeSky() {
  const uniforms = {
    uZenith: { value: new THREE.Color("#2f6fd0") },
    uHorizon: { value: new THREE.Color("#b8d4ef") },
    uGround: { value: new THREE.Color("#3a3a3a") },
    uGlow: { value: new THREE.Color("#000000") },
    uSunDir: { value: new THREE.Vector3(0.3, 0.6, -0.5).normalize() },
    uSunColor: { value: new THREE.Color("#fff4e0") },
    uSunSize: { value: 1 },
    uClouds: { value: 0.3 },
    uCloudLight: { value: new THREE.Color("#ffffff") },
    uCloudDark: { value: new THREE.Color("#8a96a8") },
    uStars: { value: 0 },
    uTime: { value: 0 },
    uNoise: { value: noiseTexture() },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = position;
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = p.xyww;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uZenith, uHorizon, uGround, uGlow, uSunDir, uSunColor, uCloudLight, uCloudDark;
      uniform float uSunSize, uClouds, uStars, uTime;
      uniform sampler2D uNoise;
      varying vec3 vDir;
      void main() {
        vec3 d = normalize(vDir);
        float h = d.y;
        vec3 col = mix(uHorizon, uZenith, pow(clamp(h, 0.0, 1.0), 0.5));
        col = mix(col, uGround, smoothstep(0.0, -0.12, h));
        col += uGlow * exp(-abs(h) * 7.0);
        float sd = max(dot(d, normalize(uSunDir)), 0.0);
        vec3 sun = uSunColor * (smoothstep(1.0 - 0.00012 * uSunSize * uSunSize, 1.0 - 0.00005 * uSunSize * uSunSize, sd) * 30.0 + pow(sd, 18.0) * 0.5 + pow(sd, 4.0) * 0.12);
        if (h > 0.0) {
          vec2 cp = d.xz / (h + 0.12) * 0.3 + vec2(uTime * 0.003, uTime * 0.001);
          float c = texture2D(uNoise, cp * 0.22).x * 0.55 + texture2D(uNoise, cp * 0.8 + 3.1).y * 0.3 + texture2D(uNoise, cp * 2.6).w * 0.15;
          float cov = smoothstep(1.0 - uClouds, 1.0 - uClouds + 0.3, c) * smoothstep(0.0, 0.12, h);
          vec3 cc = mix(uCloudDark, uCloudLight, smoothstep(0.35, 0.95, c)) + uSunColor * pow(sd, 5.0) * 0.5;
          sun *= 1.0 - cov * 0.9;
          col = mix(col, cc, cov * 0.94);
          vec2 sp = floor(d.xz / (h + 0.25) * 450.0);
          float st = step(0.9982, fract(sin(dot(sp, vec2(12.9898, 78.233))) * 43758.5453));
          col += vec3(st) * uStars * (1.0 - cov) * smoothstep(0.08, 0.35, h) * 2.0;
        }
        gl_FragColor = vec4(col + sun, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = -1000;
  mesh.userData.look = { name: "sky" };
  mesh.userData.noShadow = true;
  mesh.onBeforeRender = (r, s, cam) => {
    mesh.position.copy(cam.position);
    mesh.scale.setScalar(cam.far * 0.9);
    mesh.updateMatrixWorld();
  };
  return { mesh, uniforms };
}
