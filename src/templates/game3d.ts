import type { Template } from "./index.ts";
import { HDRI_FILES, LOOK_JS, README, LOOK_VERSION, hdriBytes, hdriScript } from "../look/kit.ts";
import { artDoc } from "../tools/look.ts";

// A 3D open-world starter that already looks like a game: a rainy neon city
// block grid (LOOK.city), a walking, running person, cars you can get into and
// drive, traffic, a chase camera, and every LOOK effect switched on. A small
// model changes this instead of starting from boxes on a grey plane.

function lookFiles(): Record<string, string> {
  const files: Record<string, string> = { "look/look.js": LOOK_JS, "look/README.md": README, "look/VERSION": `${LOOK_VERSION}\n` };
  for (const name of Object.keys(HDRI_FILES)) files[`look/hdri/${name}.js`] = hdriScript(name, hdriBytes(name));
  return files;
}

export const game3d: Template = {
  id: "game-3d",
  name: "3D open-world game",
  icon: "🌆",
  about: "3D open-world game with realistic looks: a city to walk and drive in (three.js + Maxx's LOOK kit), no build step",
  folder: "open-world",
  try: ["Make it a sunny afternoon instead of rainy night", "Add a mission: reach the glowing marker before the timer runs out", "Add police cars that chase you"],
  files: ({ name }) => ({
    "MAXX.md": `# ${name} (3D open-world game)

Started from Maxx's game-3d template. It already looks right: change it, don't rewrite it.

- Look and feel: ART.md (the LOOK preset, scale, what's banned). Read look/README.md for the LOOK API.
- Numbers people ask about (speeds, city size, traffic, preset): the "Tweak me" block at the top of game.js
- The world: LOOK.city(...) in game.js. Buildings, streets, lamps and parked cars come from LOOK builders; add more with LOOK.building, LOOK.car, LOOK.human, LOOK.tree, LOOK.neonSign.
- Player on foot: updateWalker() · driving: updateCar() · traffic: updateTraffic() · camera: LOOK.chaseCamera
- Controls: WASD/arrows move or drive, Shift runs, F gets in or out of a car, P changes the look, R toggles rain.
- Run: open index.html (no server needed). Add ?quality=medium for a slower PC.
- After changing how it looks: run look_check (aim for 80+). game.js logs "ready" when the world is built.
- 1 unit = 1 metre. A person is 1.75 m, a lane 3.5 m, a storey 3.2 m.
`,
    "ART.md": artDoc(`${name}: an open-world city game`, "neon-rain", {
      mood: "A rain-soaked harbour city at night: wet asphalt mirrors every sign, light spills from shops and windows.",
      palette: ["#ff2a6d", "#05d9e8", "#ff9f1c", "#b967ff", "#39ff88"],
      signature: ["long neon reflections in the wet street", "lamp cones glowing through the rain", "lit windows stacked up the towers", "parked cars and trees lining every kerb"],
    }),
    "index.html": `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${name}</title>
<style>
  html, body { margin: 0; height: 100%; overflow: hidden; background: #05060a; color: #e8ecf5; font: 14px system-ui, sans-serif; }
  #hud { position: fixed; left: 16px; bottom: 14px; display: flex; gap: 14px; align-items: center; text-shadow: 0 1px 3px #000; pointer-events: none; }
  #hud b { font-size: 22px; font-variant-numeric: tabular-nums; }
  #hint { position: fixed; left: 50%; bottom: 18px; transform: translateX(-50%); padding: 6px 12px; border-radius: 999px; background: #0008; backdrop-filter: blur(6px); opacity: 0; transition: opacity .2s; pointer-events: none; }
  #help { position: fixed; right: 16px; top: 12px; opacity: .7; text-align: right; line-height: 1.5; text-shadow: 0 1px 3px #000; pointer-events: none; }
</style>
</head>
<body>
  <div id="hud"><b id="speed">0</b><span>km/h</span><span id="look"></span></div>
  <div id="hint"></div>
  <div id="help">WASD move · Shift run · F car · P look · R rain</div>
  <script src="look/look.js"></script>
  <script src="game.js"></script>
</body>
</html>
`,
    "game.js": `// ---- Tweak me ----
const PRESET = "neon-rain"; // a LOOK preset: neon-rain, cyberpunk, golden-hour, clear-day, overcast, blue-hour, noir, misty-forest, desert
const CITY = { blocks: 3, block: 64, road: 14, seed: 7 }; // blocks per side, metres
const WALK = 1.5, RUN = 5.5; // m/s
const CAR = { top: 38, accel: 9, brake: 18, grip: 2.2, steer: 0.55 }; // m/s, m/s², radians
const TRAFFIC = 10; // cars driving around
// -------------------

const S = LOOK.stage({ preset: PRESET });
const city = LOOK.city({ ...CITY, wet: S.look.wet });
S.scene.add(city.group);

// The player: a person who walks and runs.
const player = LOOK.human({ seed: 11, shirt: "#1d3557", pants: "#22252b" });
player.name = "player";
player.position.copy(city.spawn);
S.scene.add(player);

// A car to steal, parked near the start.
const myCar = LOOK.car({ type: "sport", color: "#c1121f", seed: 3 });
myCar.position.set(city.spawn.x - 3.2, 0, city.spawn.z + 6);
myCar.rotation.y = 0;
S.scene.add(myCar);

const cam = LOOK.chaseCamera(S.camera, { distance: 5.5, height: 2.1 });
S.camera.position.set(city.spawn.x, 3, city.spawn.z - 6);

// ---- input ----
const keys = {};
addEventListener("keydown", (e) => {
  keys[e.code] = true;
  if (e.code === "KeyF") toggleCar();
  if (e.code === "KeyP") nextLook();
  if (e.code === "KeyR") S.rainAmount = S.look.rain > 0 ? 0 : 1;
});
addEventListener("keyup", (e) => (keys[e.code] = false));
const axis = () => ({
  x: (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0),
  y: (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0),
});

const LOOKS = ["neon-rain", "golden-hour", "clear-day", "blue-hour", "overcast", "cyberpunk", "noir"];
function nextLook() {
  const i = (LOOKS.indexOf(S.look.name) + 1) % LOOKS.length;
  S.setPreset(LOOKS[i]);
  document.getElementById("look").textContent = LOOKS[i];
}
document.getElementById("look").textContent = PRESET;

// ---- on foot ----
let heading = 0; // radians, 0 = +z
function updateWalker(dt) {
  const a = axis();
  heading -= a.x * dt * 2.4;
  const speed = a.y > 0 ? (keys.ShiftLeft || keys.ShiftRight ? RUN : WALK) : a.y < 0 ? -WALK * 0.6 : 0;
  const nx = player.position.x + Math.sin(heading) * speed * dt;
  const nz = player.position.z + Math.cos(heading) * speed * dt;
  if (!city.blocked(nx, nz, 0.3) && !near(myCar, nx, nz, 1.2)) player.position.set(nx, city.heightAt(nx, nz), nz);
  player.rotation.y = heading;
  player.animate(dt, Math.abs(speed));
  cam.update(dt, player.position, heading);
}

// ---- driving ----
let driving = false, carSpeed = 0, carHeading = 0;
function toggleCar() {
  if (driving) {
    driving = false;
    player.visible = true;
    const side = new THREE.Vector3(Math.cos(carHeading), 0, -Math.sin(carHeading)).multiplyScalar(-1.8);
    player.position.copy(myCar.position).add(side);
    player.position.y = city.heightAt(player.position.x, player.position.z);
    heading = carHeading;
  } else if (player.position.distanceTo(myCar.position) < 3.5) {
    driving = true;
    player.visible = false;
    carHeading = myCar.rotation.y;
  }
}
function updateCar(dt) {
  const a = axis();
  if (a.y > 0) carSpeed += CAR.accel * dt;
  else if (a.y < 0) carSpeed -= (carSpeed > 0 ? CAR.brake : CAR.accel * 0.6) * dt;
  else carSpeed -= Math.sign(carSpeed) * Math.min(Math.abs(carSpeed), 3 * dt);
  carSpeed = Math.max(-8, Math.min(CAR.top, carSpeed));
  const steer = -a.x * CAR.steer * Math.min(1, 6 / (Math.abs(carSpeed) + 2));
  carHeading += steer * carSpeed * dt * 0.35;
  const nx = myCar.position.x + Math.sin(carHeading) * carSpeed * dt;
  const nz = myCar.position.z + Math.cos(carHeading) * carSpeed * dt;
  if (city.blocked(nx, nz, 1.0)) carSpeed *= -0.3; // bump
  else myCar.position.set(nx, 0, nz);
  myCar.rotation.y = carHeading;
  myCar.drive(dt, carSpeed, steer);
  cam.update(dt, myCar.position, carHeading);
  document.getElementById("speed").textContent = Math.round(Math.abs(carSpeed) * 3.6);
}
const near = (o, x, z, r) => Math.hypot(o.position.x - x, o.position.z - z) < r;

// ---- traffic: cars that follow the lanes and turn at crossings ----
const traffic = [];
for (let i = 0; i < TRAFFIC; i++) {
  const lane = city.lanes[(i * 7) % city.lanes.length];
  const c = LOOK.car({ seed: 100 + i, type: i % 5 === 0 ? "taxi" : undefined });
  c.userData.lane = lane;
  c.userData.t = (i * 0.37) % 1;
  c.userData.speed = 9 + (i % 4) * 2;
  S.scene.add(c);
  traffic.push(c);
}
function updateTraffic(dt) {
  for (const c of traffic) {
    const L = c.userData.lane;
    const dx = L.to[0] - L.from[0], dz = L.to[1] - L.from[1];
    const len = Math.hypot(dx, dz);
    const blocked = (driving ? near(myCar, c.position.x + (dx / len) * 6, c.position.z + (dz / len) * 6, 4) : near(player, c.position.x + (dx / len) * 5, c.position.z + (dz / len) * 5, 2.5));
    const v = blocked ? 0 : c.userData.speed;
    c.userData.t += (v * dt) / len;
    if (c.userData.t >= 1) {
      // Pick a lane that starts near where this one ends.
      const next = city.lanes.filter((l) => Math.hypot(l.from[0] - L.to[0], l.from[1] - L.to[1]) < 30 && l !== L);
      c.userData.lane = next.length ? next[Math.floor(Math.random() * next.length)] : L;
      c.userData.t = 0;
    }
    const t = c.userData.t;
    c.position.set(L.from[0] + dx * t, 0, L.from[1] + dz * t);
    c.rotation.y = Math.atan2(dx, dz);
    c.drive(dt, v, 0);
  }
}

// ---- the loop ----
const hint = document.getElementById("hint");
S.run((dt) => {
  if (driving) updateCar(dt);
  else updateWalker(dt);
  updateTraffic(dt);
  S.focus.copy(driving ? myCar.position : player.position);
  const canEnter = !driving && player.position.distanceTo(myCar.position) < 3.5;
  hint.textContent = canEnter ? "Press F to drive" : "";
  hint.style.opacity = canEnter ? 1 : 0;
});
window.game = { S, city, player, myCar, traffic };
console.log("${name} ready: " + CITY.blocks + "x" + CITY.blocks + " blocks, look " + PRESET);
`,
    ...lookFiles(),
  }),
};
