// LOOK: Maxx's realism kit for three.js games. One script tag gives a page
// THREE (r180) and LOOK. See look/README.md in a project for the API.
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import * as M from "./materials.js";
import { facade, STYLES, FACADE } from "./facade.js";
import { stage, upgradeMaterial } from "./stage.js";
import { PRESETS, HDRIS, presetFor } from "./presets.js";
import { fitUV, fitAll, metreUV } from "./fit.js";
import * as B from "./builders.js";
import { mergeStatic, loft, lathe } from "./parts.js";

const mat = {
  asphalt: (o) => M.cached("asphalt", M.asphalt, o),
  pavement: (o) => M.cached("pavement", M.pavement, o),
  concrete: (o) => M.cached("concrete", M.concrete, o),
  brick: (o) => M.cached("brick", M.brick, o),
  plaster: (o) => M.cached("plaster", M.plaster, o),
  metal: (o) => M.cached("metal", M.metal, o),
  gravel: (o) => M.cached("gravel", M.gravel, o),
  grass: (o) => M.cached("grass", M.grass, o),
  dirt: (o) => M.cached("dirt", M.dirt, o),
  wood: (o) => M.cached("wood", M.wood, o),
  fabric: M.fabric, skin: M.skin, carPaint: M.carPaint, glass: M.glass, chrome: M.chrome, rubber: M.rubber,
  neon: M.neon, lens: M.lightLens, roadPaint: M.roadPaint,
  facade: (o = {}) => facade(typeof o === "string" ? { style: o } : o),
};

// Load a .glb/.gltf model, stand it on the ground and scale it to a real height.
async function model(url, o = {}) {
  const gltf = await new GLTFLoader().loadAsync(url);
  const root = gltf.scene;
  root.traverse((m) => {
    if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; }
  });
  if (o.height) {
    const b = new THREE.Box3().setFromObject(root);
    const h = b.max.y - b.min.y;
    if (h > 0) root.scale.multiplyScalar(o.height / h);
    const b2 = new THREE.Box3().setFromObject(root);
    root.position.y -= b2.min.y;
  }
  root.userData.animations = gltf.animations;
  if (gltf.animations?.length) {
    const mixer = new THREE.AnimationMixer(root);
    root.userData.mixer = mixer;
    root.userData.play = (name) => {
      const clip = gltf.animations.find((a) => a.name.toLowerCase().includes(String(name).toLowerCase())) ?? gltf.animations[0];
      mixer.stopAllAction();
      mixer.clipAction(clip).play();
    };
  }
  return root;
}

// A third-person camera that follows a target smoothly and doesn't clip into walls (approximate).
function chaseCamera(camera, o = {}) {
  const { distance = 5.5, height = 2.2, lookHeight = 1.4, stiffness = 6 } = o;
  const want = new THREE.Vector3(), look = new THREE.Vector3();
  return {
    distance, height,
    update(dt, target, heading) {
      want.set(target.x - Math.sin(heading) * this.distance, target.y + this.height, target.z - Math.cos(heading) * this.distance);
      camera.position.lerp(want, 1 - Math.exp(-stiffness * dt));
      look.set(target.x, target.y + lookHeight, target.z);
      camera.lookAt(look);
    },
  };
}

function audit() {
  return window.__LOOK_AUDIT__ ? window.__LOOK_AUDIT__() : null;
}

const LOOK = {
  version: "1.0.0",
  stage, presets: PRESETS, hdris: HDRIS, presetFor,
  mat, styles: STYLES, facadeUniforms: FACADE,
  building: B.building, city: B.city, street: B.city, car: B.car, human: B.human, tree: B.tree,
  streetLamp: B.streetLamp, trafficLight: B.trafficLight, neonSign: B.neonSign, awning: B.awning, hydrant: B.hydrant, trashCan: B.trashCan, ground: B.ground,
  model, chaseCamera, fitUV, fitAll, metreUV, mergeStatic, loft, lathe, upgradeMaterial, audit,
  addons: { GLTFLoader, EXRLoader, RGBELoader, EffectComposer, RenderPass, UnrealBloomPass, OutputPass, ShaderPass, BufferGeometryUtils, SkeletonUtils },
};

if (typeof window !== "undefined") {
  window.THREE = THREE;
  window.LOOK = LOOK;
}
export default LOOK;
