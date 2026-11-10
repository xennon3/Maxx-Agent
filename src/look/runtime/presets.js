// Looks: every number a scene needs to read as one picture, picked by name.
// A small model chooses "neon-rain" instead of inventing forty numbers.
// Colours are sRGB hex; sun.el/az are degrees.
export const PRESETS = {
  "neon-rain": {
    about: "night city in the rain: wet streets mirroring neon, haze, lamp cones, lit windows",
    hdri: "night", env: 0.55, tone: "aces", exposure: 1.05,
    sky: { zenith: "#04060d", horizon: "#1a1630", ground: "#060609", glow: "#3a1f4a", clouds: 0.75, cloudLight: "#2c2640", cloudDark: "#0b0b12", stars: 0 },
    sun: { color: "#7d93c4", power: 0.35, el: 38, az: 210, shadows: true },
    hemi: { sky: "#25304d", ground: "#0d0b10", power: 0.35 },
    fog: { color: "#17142a", density: 0.013 },
    bloom: { strength: 0.95, radius: 0.55, threshold: 0.9 },
    grade: { saturation: 1.12, contrast: 1.08, shadows: [0.02, 0.0, 0.05], highlights: [0.03, 0.012, 0.0], vignette: 0.38, grain: 0.035, aberration: 0.0035 },
    night: 1, litRooms: 0.55, wet: 0.85, rain: 1, lamps: { color: "#ffc27a", power: 1 }, ao: 1,
  },
  cyberpunk: {
    about: "neon megacity: magenta and teal haze, heavy bloom, chromatic fringes, rain",
    hdri: "night", env: 0.5, tone: "aces", exposure: 1.1,
    sky: { zenith: "#07020f", horizon: "#3b0f45", ground: "#07040a", glow: "#7a1d6e", clouds: 0.8, cloudLight: "#4a1a52", cloudDark: "#120616", stars: 0 },
    sun: { color: "#6fd8ff", power: 0.3, el: 40, az: 140, shadows: true },
    hemi: { sky: "#3a1f5c", ground: "#0b0612", power: 0.4 },
    fog: { color: "#2a0f3a", density: 0.016 },
    bloom: { strength: 1.25, radius: 0.7, threshold: 0.85 },
    grade: { saturation: 1.25, contrast: 1.1, shadows: [0.0, 0.03, 0.05], highlights: [0.05, 0.0, 0.03], vignette: 0.42, grain: 0.04, aberration: 0.006 },
    night: 1, litRooms: 0.65, wet: 0.9, rain: 0.7, lamps: { color: "#9ee7ff", power: 1 }, ao: 1,
  },
  "golden-hour": {
    about: "low warm sun, long shadows, glowing haze, warm highlights and cool shadows",
    hdri: "sunset", env: 0.9, tone: "aces", exposure: 0.95,
    sky: { zenith: "#3c6aa6", horizon: "#f3b27c", ground: "#4a3b33", glow: "#ff9a52", clouds: 0.35, cloudLight: "#ffd9b0", cloudDark: "#8a6a78", stars: 0 },
    sun: { color: "#ffb36b", power: 3.4, el: 9, az: 250, shadows: true },
    hemi: { sky: "#8fb2e0", ground: "#5a4537", power: 0.45 },
    fog: { color: "#e2ad85", density: 0.0032 },
    bloom: { strength: 0.35, radius: 0.5, threshold: 1.0 },
    grade: { saturation: 1.08, contrast: 1.06, shadows: [0.0, 0.01, 0.04], highlights: [0.04, 0.015, -0.01], vignette: 0.25, grain: 0.02, aberration: 0.0015 },
    night: 0.1, litRooms: 0.25, wet: 0, rain: 0, lamps: null, ao: 1,
  },
  "clear-day": {
    about: "bright midday, crisp shadows, blue sky with a few clouds",
    hdri: "sky", env: 1, tone: "aces", exposure: 1.0,
    sky: { zenith: "#2a66c9", horizon: "#b9d3ee", ground: "#55524c", glow: "#000000", clouds: 0.32, cloudLight: "#ffffff", cloudDark: "#9aa8ba", stars: 0 },
    sun: { color: "#fff3df", power: 3.6, el: 52, az: 160, shadows: true },
    hemi: { sky: "#a9c8f0", ground: "#6b6255", power: 0.55 },
    fog: { color: "#c2d6ea", density: 0.0022 },
    bloom: { strength: 0.18, radius: 0.4, threshold: 1.2 },
    grade: { saturation: 1.05, contrast: 1.05, shadows: [0.0, 0.0, 0.02], highlights: [0.01, 0.01, 0.0], vignette: 0.18, grain: 0.012, aberration: 0 },
    night: 0, litRooms: 0.1, wet: 0, rain: 0, lamps: null, ao: 1,
  },
  overcast: {
    about: "soft grey daylight, no hard shadows, damp streets, muted realistic colour",
    hdri: "city", env: 1.15, tone: "agx", exposure: 1.15,
    sky: { zenith: "#7f8a97", horizon: "#c4c9cd", ground: "#4b4b4b", glow: "#000000", clouds: 0.97, cloudLight: "#d3d7dc", cloudDark: "#7b828c", stars: 0 },
    sun: { color: "#dfe6ee", power: 0.7, el: 60, az: 180, shadows: true },
    hemi: { sky: "#c8cdd3", ground: "#5a5752", power: 0.8 },
    fog: { color: "#b3b9bf", density: 0.0065 },
    bloom: { strength: 0.12, radius: 0.4, threshold: 1.3 },
    grade: { saturation: 0.86, contrast: 1.04, shadows: [0.0, 0.01, 0.02], highlights: [0.0, 0.0, 0.0], vignette: 0.22, grain: 0.02, aberration: 0 },
    night: 0.05, litRooms: 0.35, wet: 0.35, rain: 0, lamps: null, ao: 1,
  },
  "blue-hour": {
    about: "just after sunset: deep blue sky, orange horizon, first lights and lit windows",
    hdri: "dawn", env: 0.6, tone: "aces", exposure: 1.1,
    sky: { zenith: "#14244f", horizon: "#d98a6a", ground: "#1c1a22", glow: "#ff8a5a", clouds: 0.4, cloudLight: "#d58f8f", cloudDark: "#2a2a45", stars: 0.3 },
    sun: { color: "#ff9a6a", power: 0.5, el: 2, az: 255, shadows: true },
    hemi: { sky: "#4a5a8f", ground: "#221d24", power: 0.45 },
    fog: { color: "#5a5070", density: 0.006 },
    bloom: { strength: 0.6, radius: 0.55, threshold: 0.95 },
    grade: { saturation: 1.1, contrast: 1.06, shadows: [0.0, 0.0, 0.05], highlights: [0.04, 0.015, 0.0], vignette: 0.3, grain: 0.025, aberration: 0.002 },
    night: 0.75, litRooms: 0.5, wet: 0.2, rain: 0, lamps: { color: "#ffb870", power: 0.9 }, ao: 1,
  },
  noir: {
    about: "black-and-white crime film: hard light, deep shadows, rain, heavy grain",
    hdri: "night", env: 0.5, tone: "aces", exposure: 1.1,
    sky: { zenith: "#030303", horizon: "#1c1c1c", ground: "#050505", glow: "#151515", clouds: 0.8, cloudLight: "#2a2a2a", cloudDark: "#0a0a0a", stars: 0 },
    sun: { color: "#cfd6e0", power: 0.5, el: 35, az: 200, shadows: true },
    hemi: { sky: "#30343a", ground: "#0b0b0b", power: 0.3 },
    fog: { color: "#161616", density: 0.014 },
    bloom: { strength: 0.7, radius: 0.5, threshold: 0.9 },
    grade: { saturation: 0.08, contrast: 1.28, shadows: [0, 0, 0], highlights: [0.02, 0.02, 0.02], vignette: 0.55, grain: 0.07, aberration: 0 },
    night: 1, litRooms: 0.4, wet: 0.95, rain: 1, lamps: { color: "#fff0d6", power: 1.2 }, ao: 1,
  },
  "misty-forest": {
    about: "damp woods in morning mist: soft green light, deep fog, gentle shafts of sun",
    hdri: "forest", env: 0.9, tone: "agx", exposure: 1.1,
    sky: { zenith: "#8ea3a8", horizon: "#c9d2c8", ground: "#3d4636", glow: "#000000", clouds: 0.85, cloudLight: "#e0e6df", cloudDark: "#9aa59c", stars: 0 },
    sun: { color: "#fff0cf", power: 1.6, el: 25, az: 120, shadows: true },
    hemi: { sky: "#b8c9b8", ground: "#3f4a33", power: 0.7 },
    fog: { color: "#b7c2b5", density: 0.022 },
    bloom: { strength: 0.25, radius: 0.6, threshold: 1.1 },
    grade: { saturation: 0.95, contrast: 1.02, shadows: [0.0, 0.02, 0.01], highlights: [0.02, 0.02, 0.0], vignette: 0.25, grain: 0.02, aberration: 0 },
    night: 0, litRooms: 0, wet: 0.4, rain: 0, lamps: null, ao: 1,
  },
  desert: {
    about: "harsh high sun, bleached colours, heat haze on the horizon",
    hdri: "sunrise", env: 0.9, tone: "aces", exposure: 0.95,
    sky: { zenith: "#3577d4", horizon: "#e6d3ad", ground: "#8a7354", glow: "#f0c890", clouds: 0.08, cloudLight: "#ffffff", cloudDark: "#c9c3b8", stars: 0 },
    sun: { color: "#fff0d6", power: 4.2, el: 64, az: 190, shadows: true },
    hemi: { sky: "#b7cdea", ground: "#a48a62", power: 0.6 },
    fog: { color: "#e2cfa8", density: 0.0035 },
    bloom: { strength: 0.2, radius: 0.5, threshold: 1.2 },
    grade: { saturation: 1.05, contrast: 1.1, shadows: [0.02, 0.01, 0.0], highlights: [0.03, 0.02, 0.0], vignette: 0.2, grain: 0.015, aberration: 0 },
    night: 0, litRooms: 0, wet: 0, rain: 0, lamps: null, ao: 1,
  },
  studio: {
    about: "showroom lighting for one object or character: soft boxes, clean grey backdrop",
    hdri: "studio", env: 1.2, tone: "agx", exposure: 1.0,
    sky: { zenith: "#2a2c30", horizon: "#4a4d52", ground: "#2a2a2c", glow: "#000000", clouds: 0, cloudLight: "#ffffff", cloudDark: "#ffffff", stars: 0 },
    sun: { color: "#ffffff", power: 2.2, el: 50, az: 135, shadows: true },
    hemi: { sky: "#ffffff", ground: "#444444", power: 0.4 },
    fog: null,
    bloom: { strength: 0.15, radius: 0.4, threshold: 1.3 },
    grade: { saturation: 1.0, contrast: 1.04, shadows: [0, 0, 0], highlights: [0, 0, 0], vignette: 0.2, grain: 0.01, aberration: 0 },
    night: 0, litRooms: 0, wet: 0, rain: 0, lamps: null, ao: 1,
  },
};

export const HDRIS = ["bridge", "city", "dawn", "forest", "night", "park", "sky", "studio", "sunrise", "sunset", "venice", "warehouse"];

// Pick a look from words: "rainy night", "sunset", "cyberpunk"...
export function presetFor(text = "") {
  const t = String(text).toLowerCase();
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
