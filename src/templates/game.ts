import type { Template } from "./index.ts";

// Snake on a <canvas>, no build step: open index.html and play. The numbers a
// person is likely to ask about sit at the top of game.js under "Tweak me".

export const htmlGame: Template = {
  id: "html-game",
  name: "HTML game",
  icon: "🎮",
  about: "Snake on an HTML canvas, plain JavaScript, no build step (open index.html)",
  folder: "snake-game",
  try: ["Make the snake faster", "Add walls that end the game", "Add a sound when it eats"],
  files: ({ name }) => ({
    "MAXX.md": `# ${name} (HTML canvas game)

Started from Maxx's html-game template: a working Snake game in plain JavaScript. Change it, don't rewrite it.

- Speed, grid size and colors: the "Tweak me" block at the top of game.js
- Game rules (moving, eating, dying): \`step()\` in game.js
- Drawing: \`draw()\` in game.js
- Page and score text: index.html
- Run: open index.html in a browser, or use the preview tool on index.html. No build or server needed.
- game.js logs "game over" with the score to the console, so the preview tool shows whether it runs.
`,
    "index.html": `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${name}</title>
<style>
  html, body { margin: 0; height: 100%; background: #0b1020; color: #e5e7eb; font: 16px system-ui, sans-serif; }
  body { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; }
  h1 { margin: 0; font-size: 22px; }
  #hud { display: flex; gap: 24px; }
  canvas { width: min(90vw, 70vh); aspect-ratio: 1; border-radius: 8px; touch-action: none; }
  #help { color: #9ca3af; font-size: 13px; }
</style>
</head>
<body>
  <h1>${name}</h1>
  <div id="hud"><span>Score <b id="score">0</b></span><span>Best <b id="best">0</b></span></div>
  <canvas id="board" width="480" height="480"></canvas>
  <div id="help">Arrow keys or WASD to steer, swipe on a phone. Space to restart.</div>
  <script src="game.js"></script>
</body>
</html>
`,
    "game.js": `// ---- Tweak me ----
const GRID = 20; // cells per side
const SPEED = 8; // moves per second: higher is faster
const START_LENGTH = 3;
const COLORS = { board: "#111827", snake: "#4ade80", head: "#86efac", food: "#f87171" };
// -------------------

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const cell = canvas.width / GRID;
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

let snake, dir, nextDir, food, score, alive;
let best = 0;
try { best = Number(localStorage.getItem("best")) || 0; } catch {}

function reset() {
  const mid = Math.floor(GRID / 2);
  snake = Array.from({ length: START_LENGTH }, (_, i) => ({ x: mid - i, y: mid }));
  dir = nextDir = "right";
  score = 0;
  alive = true;
  food = placeFood();
  updateHud();
}

function placeFood() {
  while (true) {
    const f = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    if (!snake.some((s) => s.x === f.x && s.y === f.y)) return f;
  }
}

function turn(d) {
  // No turning straight back into yourself.
  const [dx, dy] = DIRS[d];
  const [cx, cy] = DIRS[dir];
  if (dx !== -cx || dy !== -cy) nextDir = d;
}

function step() {
  dir = nextDir;
  const [dx, dy] = DIRS[dir];
  // The board wraps around at the edges.
  const head = { x: (snake[0].x + dx + GRID) % GRID, y: (snake[0].y + dy + GRID) % GRID };
  if (snake.some((s) => s.x === head.x && s.y === head.y)) {
    alive = false;
    best = Math.max(best, score);
    try { localStorage.setItem("best", String(best)); } catch {}
    console.log("game over, score " + score);
    updateHud();
    return;
  }
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score++;
    food = placeFood();
    updateHud();
  } else {
    snake.pop();
  }
}

function draw() {
  ctx.fillStyle = COLORS.board;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = COLORS.food;
  ctx.beginPath();
  ctx.arc((food.x + 0.5) * cell, (food.y + 0.5) * cell, cell * 0.4, 0, Math.PI * 2);
  ctx.fill();
  snake.forEach((s, i) => {
    ctx.fillStyle = i === 0 ? COLORS.head : COLORS.snake;
    ctx.fillRect(s.x * cell + 1, s.y * cell + 1, cell - 2, cell - 2);
  });
  if (!alive) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = "bold 32px system-ui, sans-serif";
    ctx.fillText("Game over", canvas.width / 2, canvas.height / 2);
    ctx.font = "16px system-ui, sans-serif";
    ctx.fillText("Press space or tap to play again", canvas.width / 2, canvas.height / 2 + 32);
  }
}

function updateHud() {
  document.getElementById("score").textContent = score;
  document.getElementById("best").textContent = best;
}

const KEYS = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", w: "up", s: "down", a: "left", d: "right" };
addEventListener("keydown", (e) => {
  if (e.key === " ") {
    if (!alive) reset();
    e.preventDefault();
    return;
  }
  const d = KEYS[e.key] || KEYS[e.key.toLowerCase()];
  if (d) {
    turn(d);
    e.preventDefault();
  }
});

let touch = null;
canvas.addEventListener("pointerdown", (e) => {
  if (!alive) return reset();
  touch = { x: e.clientX, y: e.clientY };
});
canvas.addEventListener("pointerup", (e) => {
  if (!touch) return;
  const dx = e.clientX - touch.x, dy = e.clientY - touch.y;
  if (Math.max(Math.abs(dx), Math.abs(dy)) > 20) turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
  touch = null;
});

// Fixed-rate game steps, drawn every frame.
let last = performance.now(), acc = 0;
function frame(now) {
  acc = Math.min(acc + now - last, 250); // a hidden tab doesn't fast-forward
  last = now;
  while (acc >= 1000 / SPEED) {
    if (alive) step();
    acc -= 1000 / SPEED;
  }
  draw();
  requestAnimationFrame(frame);
}

reset();
console.log("${name} ready: " + GRID + "x" + GRID + " board, speed " + SPEED);
requestAnimationFrame(frame);
`,
  }),
};
