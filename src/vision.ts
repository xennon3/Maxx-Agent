import { complete, type ContentPart, type LLMConfig } from "./llm.ts";
import type { Image } from "./image.ts";

// How screenshots reach a model:
//   native  the main model is a vision model; images are attached to the chat
//   proxy   a second vision model looks at them and the main model gets its description
//   off     nobody can see; the main model works from element lists only
export type Vision = { mode: "native" } | { mode: "proxy"; llm: LLMConfig } | { mode: "off" };

export const imagePart = (img: Image): ContentPart => ({ type: "image_url", image_url: { url: `data:${img.mime};base64,${img.base64}` } });

// LM Studio's REST API says whether a model is a "vlm". Other servers: unknown (null).
export async function detectVision(llm: LLMConfig): Promise<boolean | null> {
  try {
    const origin = new URL(llm.baseURL).origin;
    const res = await fetch(`${origin}/api/v0/models`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { id: string; type?: string }[] };
    const m = json.data?.find((d) => d.id === llm.model);
    if (!m?.type) return null;
    return m.type === "vlm";
  } catch {
    return null;
  }
}

export async function pickVision(main: LLMConfig, opts: { flag?: string; visionModel?: string }): Promise<{ vision: Vision; note?: string }> {
  if (opts.visionModel) return { vision: { mode: "proxy", llm: { ...main, model: opts.visionModel, temperature: 0.2 } } };
  if (opts.flag === "off") return { vision: { mode: "off" } };
  if (opts.flag === "native") return { vision: { mode: "native" } };
  const sees = await detectVision(main);
  if (sees === false) {
    return {
      vision: { mode: "off" },
      note: `${main.model} cannot see images, so screenshots are reduced to element lists. Load a vision model (e.g. Qwen3.8-27B) or pass --vision-model <id>.`,
    };
  }
  return { vision: { mode: "native" } };
}

// The proxy model describes what matters to a tester, and nothing else.
export async function describeImages(llm: LLMConfig, images: Image[], context: string, signal?: AbortSignal): Promise<string> {
  const res = await complete(
    llm,
    [
      {
        role: "system",
        content:
          "You are the eyes of a coding agent that is testing software on a screen. Describe the screenshot precisely and briefly: " +
          "which app and screen it is, all visible text, buttons and fields (with their numbered marks when present), dialogs, error messages, " +
          "and anything that looks broken (overlapping or cut-off text, empty areas, wrong colors). Do not guess what is not visible.",
      },
      { role: "user", content: [{ type: "text", text: `The agent's last action and its result:\n${context.slice(0, 4000)}` }, ...images.map(imagePart)] },
    ],
    [],
    () => {},
    signal,
  );
  return res.content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}
