// A model of the GMKtec EVO-X2 (Ryzen AI Max+ 395, Radeon 8060S, 64 GB
// LPDDR5X-8000 on a 256-bit bus = 256 GB/s) running LM Studio.
//
// Speeds are anchored to published llama.cpp numbers for Strix Halo
// (github.com/visorcraft/strix-halo-llm-perf): Qwen2.5-32B Q4_K_M 242 pp / 11.3 tg,
// Qwen3-30B-A3B Q4_K_M 1142 pp / 86.1 tg (Vulkan). Token generation is memory
// bound, so other sizes scale by the bytes read per token.

export const MACHINE = {
  name: "GMKtec EVO-X2 (Ryzen AI Max+ 395, 64 GB)",
  ramGB: 64,
  // Assumption: 48 GB given to the iGPU in the BIOS, 16 GB left for Windows, Gradle and Maxx.
  gpuGB: 48,
  bandwidthGBs: 256,
};

export type ModelProfile = {
  id: string;
  label: string;
  weightsGB: number;
  kvGB: number; // at 32k context
  pp: number; // prompt tokens/s at short context
  tg: number; // generated tokens/s
  thinkTokens: number; // hidden reasoning per step (assumption)
  loadSeconds: number;
};

const anchorDense = { gb: 19.9, pp: 242, tg: 11.3, params: 32 };
const anchorMoE = { gb: 18.6, pp: 1142, tg: 86.1, activeGB: 1.9 };

function dense(id: string, label: string, params: number, gb: number, think: number): ModelProfile {
  return { id, label, weightsGB: gb, kvGB: 2.5, pp: Math.round(anchorDense.pp * (anchorDense.params / params)), tg: +(anchorDense.tg * (anchorDense.gb / gb)).toFixed(1), thinkTokens: think, loadSeconds: Math.round(gb / 3) };
}

function moe(id: string, label: string, gb: number, activeGB: number, think: number): ModelProfile {
  return { id, label, weightsGB: gb, kvGB: 2, pp: Math.round(anchorMoE.pp * 0.9), tg: +(anchorMoE.tg * (anchorMoE.activeGB / activeGB)).toFixed(1), thinkTokens: think, loadSeconds: Math.round(gb / 3) };
}

export const MODELS = {
  "qwen3.8-27b-q6": dense("qwen3.8-27b", "Qwen3.8-27B Q6_K + vision projector", 27, 22.4 + 0.9, 220),
  "qwen3.8-27b-q4": dense("qwen3.8-27b", "Qwen3.8-27B Q4_K_M + vision projector", 27, 16.5 + 0.9, 220),
  "agentworld-q4": moe("qwen-agentworld-35b-a3b", "Qwen AgentWorld 35B-A3B Q4_K_M", 21.2, 2.1, 90),
  "agentworld-q6": moe("qwen-agentworld-35b-a3b", "Qwen AgentWorld 35B-A3B Q6_K", 28.6, 2.8, 90),
} satisfies Record<string, ModelProfile>;

export type Setup = { name: string; main: ModelProfile; eyes?: ModelProfile };

export const SETUPS: Setup[] = [
  { name: "A: one model that codes and sees", main: MODELS["qwen3.8-27b-q6"] },
  { name: "A2: same, thinking off", main: { ...MODELS["qwen3.8-27b-q6"], thinkTokens: 0 } },
  { name: "B: fast coder + separate eyes", main: MODELS["agentworld-q4"], eyes: { ...MODELS["qwen3.8-27b-q4"], id: "qwen3.8-27b-eyes" } },
  { name: "C: both at Q6 (does it fit?)", main: MODELS["agentworld-q6"], eyes: { ...MODELS["qwen3.8-27b-q6"], id: "qwen3.8-27b-eyes" } },
];

export function memoryCheck(s: Setup) {
  const models = [s.main, ...(s.eyes ? [s.eyes] : [])];
  const used = models.reduce((n, m) => n + m.weightsGB + m.kvGB, 0);
  return { usedGB: +used.toFixed(1), fits: used <= MACHINE.gpuGB - 1.5, models };
}

// Prefill slows down as the context fills (attention cost); ~35% slower at 32k.
export function stepSeconds(m: ModelProfile, newTokens: number, contextTokens: number, outTokens: number) {
  const pp = m.pp / (1 + 0.35 * Math.min(1, contextTokens / 32768));
  return 0.12 + newTokens / pp + (outTokens + m.thinkTokens) / m.tg;
}

// Qwen-VL style: 16 px patches merged 2x2, so one token per 32x32 pixels.
export const imageTokens = (w: number, h: number) => Math.ceil(w / 32) * Math.ceil(h / 32) + 2;
