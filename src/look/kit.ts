import { existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
// @ts-ignore: a text import has no type declarations
import BUNDLE from "./look.bundle.js" with { type: "text" };
// @ts-ignore
import AUDIT_SRC from "./audit-page.js" with { type: "text" };
// @ts-ignore
import HOOK_SRC from "./hook-page.js" with { type: "text" };
import H_BRIDGE from "./hdri/bridge.exr" with { type: "file" };
import H_CITY from "./hdri/city.exr" with { type: "file" };
import H_DAWN from "./hdri/dawn.exr" with { type: "file" };
import H_FOREST from "./hdri/forest.exr" with { type: "file" };
import H_NIGHT from "./hdri/night.exr" with { type: "file" };
import H_PARK from "./hdri/park.exr" with { type: "file" };
import H_SKY from "./hdri/sky.exr" with { type: "file" };
import H_STUDIO from "./hdri/studio.exr" with { type: "file" };
import H_SUNRISE from "./hdri/sunrise.exr" with { type: "file" };
import H_SUNSET from "./hdri/sunset.exr" with { type: "file" };
import H_VENICE from "./hdri/venice.exr" with { type: "file" };
import H_WAREHOUSE from "./hdri/warehouse.exr" with { type: "file" };

// LOOK, Maxx's realism kit for three.js games: one script (three.js r180 +
// add-ons + LOOK) and twelve CC0 photographed skies from Poly Haven (512 px
// EXR, via @pmndrs/assets) for image-based light. Maxx writes it into a
// project's look/ folder; the page needs no build step and works from file://.

export const LOOK_JS: string = BUNDLE as string;
export const AUDIT_JS: string = AUDIT_SRC as string;
export const HOOK_JS: string = HOOK_SRC as string;
export const LOOK_VERSION = "1.0.0";

export const HDRI_FILES: Record<string, string> = {
  bridge: H_BRIDGE, city: H_CITY, dawn: H_DAWN, forest: H_FOREST, night: H_NIGHT, park: H_PARK,
  sky: H_SKY, studio: H_STUDIO, sunrise: H_SUNRISE, sunset: H_SUNSET, venice: H_VENICE, warehouse: H_WAREHOUSE,
};

export type Preset = { about: string; hdri: string };
// Kept in step with src/look/runtime/presets.js (a test checks).
export const PRESET_INFO: Record<string, Preset> = {
  "neon-rain": { about: "night city in the rain: wet streets mirroring neon, haze, lamp cones, lit windows", hdri: "night" },
  cyberpunk: { about: "neon megacity: magenta and teal haze, heavy bloom, chromatic fringes, rain", hdri: "night" },
  "golden-hour": { about: "low warm sun, long shadows, glowing haze, warm highlights and cool shadows", hdri: "sunset" },
  "clear-day": { about: "bright midday, crisp shadows, blue sky with a few clouds", hdri: "sky" },
  overcast: { about: "soft grey daylight, no hard shadows, damp streets, muted realistic colour", hdri: "city" },
  "blue-hour": { about: "just after sunset: deep blue sky, orange horizon, first lights and lit windows", hdri: "dawn" },
  noir: { about: "black-and-white crime film: hard light, deep shadows, rain, heavy grain", hdri: "night" },
  "misty-forest": { about: "damp woods in morning mist: soft green light, deep fog, gentle shafts of sun", hdri: "forest" },
  desert: { about: "harsh high sun, bleached colours, heat haze on the horizon", hdri: "sunrise" },
  studio: { about: "showroom lighting for one object or character: soft boxes, clean grey backdrop", hdri: "studio" },
};
export const PRESET_NAMES = Object.keys(PRESET_INFO) as [string, ...string[]];

// Words in a request to a look (mirrors presetFor in presets.js).
export function presetFor(text = ""): string {
  const t = text.toLowerCase();
  if (/cyber|synth|blade|neon city|megacity/.test(t)) return "cyberpunk";
  if (/noir|black.and.white|detective|crime film/.test(t)) return "noir";
  if (/rain|neon|night|vice|gta|tide|dark street/.test(t)) return "neon-rain";
  if (/sunset|golden|evening|dusk light/.test(t)) return "golden-hour";
  if (/dusk|twilight|blue hour/.test(t)) return "blue-hour";
  if (/fog|mist|forest|woods|swamp/.test(t)) return "misty-forest";
  if (/desert|sand|western|mars|dune/.test(t)) return "desert";
  if (/overcast|grey|gray|cloudy|london|realistic/.test(t)) return "overcast";
  if (/showroom|studio|product|character viewer/.test(t)) return "studio";
  return "clear-day";
}

export function hdriScript(name: string, bytes: Uint8Array): string {
  return `(window.LOOK_HDRI = window.LOOK_HDRI || {})[${JSON.stringify(name)}] = "data:application/octet-stream;base64,${Buffer.from(bytes).toString("base64")}";\n`;
}

export function hdriBytes(name: string): Uint8Array {
  const f = HDRI_FILES[name];
  if (!f) throw new Error(`no bundled sky "${name}"`);
  return new Uint8Array(readFileSync(f));
}

export const README = `# LOOK: realism kit for three.js games (made by Maxx)

One script gives the page THREE (three.js r180, with its add-ons) and LOOK. No import, no build step, works from file://.
  <script src="look/look.js"></script>
(LOOK loads the photographed sky light for your preset from look/hdri/ by itself.)
Remove any other three.js <script> or import: LOOK's THREE replaces it.

## Stage: one call sets up everything
  const S = LOOK.stage({ preset: "neon-rain" });   // renderer, camera, sky, sun, sky light, fog, soft shadows,
                                                   // ambient occlusion, bloom, colour grade, film grain, rain, lamps
  S.scene.add(thing);
  S.focus.copy(player.position);                   // the sun's shadows follow the player
  S.run((dt, t) => { /* your game update */ });    // renders every frame; S.camera is a PerspectiveCamera
  S.setPreset("golden-hour");                      // change the whole look at runtime
Presets: neon-rain, cyberpunk, golden-hour, clear-day, overcast, blue-hour, noir, misty-forest, desert, studio.
Do not make your own WebGLRenderer, lights, fog or tone mapping: LOOK.stage owns them. S.renderer, S.sun, S.hemi exist if you must.

## Scale: 1 unit = 1 metre
Person 1.75 · door 2.1 · storey 3.2 · car 4.6 long, 1.85 wide · lane 3.5 · street 12-16 wide · pavement 4 · walk 1.4 m/s · run 5 m/s · car 15-40 m/s.

## Builders: detailed, real scale, shadows on
  const city = LOOK.city({ blocks: 3, block: 64, road: 14, seed: 1, wet: S.look.wet });
  S.scene.add(city.group);   // streets, kerbs, markings, crossings, buildings, lamps, traffic lights, parked cars, trees
  city.spawn                 // a Vector3 on a pavement
  city.blocked(x, z)         // true inside a building or parked car (use it for collisions)
  city.heightAt(x, z)        // 0.15 on pavements, 0 on roads
  city.lanes                 // [{ from: [x, z], to: [x, z] }] driving lanes for traffic
  LOOK.building({ w: 20, d: 18, h: 40, style: "brick" | "glass" | "concrete" | "stucco" | "metal", front: ["+z"] })
  LOOK.car({ type: "sedan" | "sport" | "suv" | "hatch" | "taxi", color: "#7a0d16" })  → car.drive(dt, speed, steer)
  LOOK.human({ shirt: "#2f4a6e", pants: "#24262b", skin: "#c68a68", hair: "#2a1d14" })  → person.animate(dt, speedInMetresPerSecond)
  LOOK.tree(), LOOK.streetLamp(), LOOK.trafficLight(), LOOK.neonSign({ text: "BAR", color: "#ff2a6d" }),
  LOOK.hydrant(), LOOK.trashCan(), LOOK.ground({ material: "grass", size: 400 })
  const cam = LOOK.chaseCamera(S.camera, { distance: 5.5, height: 2.2 }); cam.update(dt, player.position, player.rotation.y)
  const m = await LOOK.model("assets/robot.glb", { height: 1.8 }); m.userData.play?.("walk"); m.userData.mixer?.update(dt)

## Materials: PBR, sized in metres, never stretched
  LOOK.mat.asphalt({ wet: 0.8 }), pavement(), concrete(), brick(), plaster(), metal(), gravel(), grass(), dirt(), wood(),
  fabric({ color }), skin({ color }), carPaint({ color }), glass(), chrome(), rubber(), neon({ color }), facade("brick")
Put them on any mesh, even a plain BoxGeometry: LOOK lays the UVs out in metres for you.
facade(style) draws windows, frames, grime and lit rooms behind the glass on any box (a building in one line).

## Lights that read at night
  S.addLamp({ position: new THREE.Vector3(x, 7, z), color: "#ffc27a" })   // pool of light, haze cone, wet reflection
  S.addGlow({ position, color: "#05d9e8" })                                // neon that mirrors in wet streets
Emissive materials brighter than 1 bloom: new THREE.MeshStandardMaterial({ emissive: "#ff2a6d", emissiveIntensity: 4 }).

## Never
- MeshBasicMaterial, MeshLambertMaterial or MeshPhongMaterial for scenery (they can't reflect the sky; LOOK swaps Lambert/Phong for you).
- One flat colour on anything over 5 m (use a LOOK.mat surface), or one small canvas texture stretched over a big wall.
- Boxes or capsules for people, cars or buildings: use LOOK.human, LOOK.car, LOOK.building.
- Toy scale: a 60 m wide street, a 3 m person, a 400 m wall.
Check the result with the look_check tool: it reads the live scene, scores it and names the fixes.
`;

// Write look/ into a project. Returns the files written.
export async function writeKit(cwd: string, dir = "look", skies: string[] = Object.keys(HDRI_FILES)): Promise<string[]> {
  const root = join(cwd, dir);
  await mkdir(join(root, "hdri"), { recursive: true });
  const out: string[] = [];
  await writeFile(join(root, "look.js"), LOOK_JS);
  out.push(`${dir}/look.js`);
  for (const name of skies) {
    const bytes = hdriBytes(name);
    await writeFile(join(root, "hdri", `${name}.js`), hdriScript(name, bytes));
    out.push(`${dir}/hdri/${name}.js`);
  }
  await writeFile(join(root, "README.md"), README);
  await writeFile(join(root, "VERSION"), `${LOOK_VERSION}\n`);
  await writeFile(join(root, "LICENSES.md"), "three.js (look.js): MIT, Copyright 2010-2025 three.js authors.\nSkies in hdri/: CC0 from Poly Haven (polyhaven.com), resized by pmndrs/assets (CC0).\nLOOK (the rest of look.js): made by Maxx for this project.\n");
  out.push(`${dir}/README.md`);
  return out;
}

export async function kitVersion(cwd: string, dir = "look"): Promise<string | null> {
  return readFile(join(cwd, dir, "VERSION"), "utf8").then((v) => v.trim()).catch(() => null);
}

// Does this project draw with three.js? (a LOOK kit, a three script, or an import)
export async function usesThree(cwd: string, html: string[] = ["index.html"]): Promise<boolean> {
  if (existsSync(join(cwd, "look", "look.js"))) return true;
  for (const h of html) {
    const t = await readFile(join(cwd, h), "utf8").catch(() => "");
    if (/three(\.module)?(\.min)?\.js|from\s+["']three["']|unpkg\.com\/three|cdn\.jsdelivr\.net\/npm\/three/i.test(t)) return true;
  }
  return false;
}
