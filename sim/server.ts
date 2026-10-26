import jpeg from "jpeg-js";
import { think, describe } from "./brain.ts";
import { spend } from "./ledger.ts";
import { imageTokens, stepSeconds, type Setup } from "./profile.ts";

// A stand-in for LM Studio's server on the EVO-X2: OpenAI-compatible
// streaming chat, /v1/models, and LM Studio's /api/v0/models (which says
// whether a model is a "vlm"). Each request is charged prefill and decode
// time from the hardware profile, with prefix caching like llama.cpp.

export function startServer(setup: Setup, port = 0) {
  const models = [setup.main, ...(setup.eyes ? [setup.eyes] : [])];
  const cache = new Map<string, string[]>(); // model id -> previous prompt, one string per message
  let loaded = false;

  const tokensOf = (m: any): { text: number; image: number; images: number } => {
    if (typeof m.content === "string" || m.content == null) return { text: Math.ceil(JSON.stringify(m).length / 4), image: 0, images: 0 };
    let text = 4, image = 0, images = 0;
    for (const p of m.content) {
      if (p.type === "text") text += Math.ceil(p.text.length / 4);
      else {
        const { width, height } = jpeg.decode(Buffer.from(p.image_url.url.split(",")[1], "base64"), { formatAsRGBA: false });
        image += imageTokens(width, height);
        images++;
      }
    }
    return { text, image, images };
  };

  return Bun.serve({
    port,
    idleTimeout: 120,
    async fetch(req) {
      const url = new URL(req.url);
      if (url.pathname === "/v1/models") return Response.json({ data: models.map((m) => ({ id: m.id, object: "model" })) });
      if (url.pathname === "/api/v0/models") return Response.json({ data: models.map((m) => ({ id: m.id, type: m === setup.main && setup.eyes ? "llm" : "vlm", state: "loaded" })) });
      if (url.pathname !== "/v1/chat/completions") return new Response("not found", { status: 404 });

      const body = (await req.json()) as { model: string; messages: any[] };
      const model = models.find((m) => m.id === body.model) ?? setup.main;
      if (!loaded) {
        loaded = true;
        for (const m of models) await spend("model", `load ${m.label}`, m.loadSeconds);
      }

      // Prefix cache: only messages after the first difference are prefilled again.
      const keys = body.messages.map((m) => JSON.stringify(m));
      const prev = cache.get(model.id) ?? [];
      let same = 0;
      while (same < keys.length && same < prev.length && keys[same] === prev[same]) same++;
      cache.set(model.id, keys);
      const counts = body.messages.map(tokensOf);
      const context = counts.reduce((n, c) => n + c.text + c.image, 0);
      const fresh = counts.slice(same).reduce((n, c) => n + c.text + c.image, 0);
      const images = counts.slice(same).reduce((n, c) => n + c.images, 0);
      const imageTok = counts.slice(same).reduce((n, c) => n + c.image, 0);

      const isEyes = model !== setup.main;
      const reply = isEyes ? { text: describe(JSON.stringify(body.messages.at(-1)?.content ?? ""), images) } : think(body.messages);
      const out = "tool" in reply ? JSON.stringify(reply.args) : reply.text;
      const outTokens = Math.ceil(out.length / 4) + 12;
      const seconds = stepSeconds(model, fresh, context, outTokens);
      const what = isEyes ? "describe screenshot" : "tool" in reply ? `→ ${reply.tool}` : "final answer";
      await spend(isEyes ? "eyes" : "model", what, seconds, { model: model.id, fresh, cached: context - fresh, context, outTokens, think: model.thinkTokens, images, imageTok });

      const chunks: object[] = [];
      if ("tool" in reply) {
        chunks.push({ choices: [{ delta: { tool_calls: [{ index: 0, id: `call_${Date.now()}`, function: { name: reply.tool, arguments: "" } }] } }] });
        for (let i = 0; i < out.length; i += 40) chunks.push({ choices: [{ delta: { tool_calls: [{ index: 0, function: { arguments: out.slice(i, i + 40) } }] } }] });
      } else for (let i = 0; i < out.length; i += 12) chunks.push({ choices: [{ delta: { content: out.slice(i, i + 12) } }] });
      return new Response(chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join("") + "data: [DONE]\n\n", { headers: { "content-type": "text/event-stream" } });
    },
  });
}
