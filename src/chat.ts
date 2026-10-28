import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { maxxHome } from "./sessions.ts";

// Chat mode: everyday questions with no project and no tools. Its sessions
// live under one folder of their own, so they save and list like any project's.
export const chatDir = () => join(maxxHome(), "chat");
export const isChatDir = (dir: string) => resolve(dir).toLowerCase() === resolve(chatDir()).toLowerCase();

export async function ensureChatDir() {
  await mkdir(chatDir(), { recursive: true });
  return chatDir();
}

// The languages the app draws when they come in a fenced code block.
export const VISUAL_LANGS = ["chart", "mermaid", "html"] as const;

// Kept short: a 4B model at 16K context has no room for a manual.
export function chatPrompt(now = new Date()): string {
  return [
    "You are Maxx, a friendly, helpful assistant running locally on the user's own computer.",
    `This is a chat: you have no tools, so you cannot read files, browse or run commands. Just answer. Today is ${now.toDateString()}.`,
    "Write in Markdown. When a picture helps (numbers, comparisons, trends, steps, processes, plans, relationships), add ONE visual as a fenced code block and the app draws it right in the chat:",
    '- ```chart with a Chart.js config as JSON, e.g. {"type":"bar","data":{"labels":["A","B"],"datasets":[{"label":"Sales","data":[3,5]}]}}. Types: bar, line, pie, doughnut, radar, polarArea, scatter, bubble.',
    "- ```mermaid with a Mermaid diagram: flowchart TD, sequenceDiagram, mindmap, timeline, gantt, pie, stateDiagram-v2, erDiagram, quadrantChart, journey. Put labels with punctuation in quotes: A[\"Boil water (100 °C)\"].",
    "- ```html with a small self-contained interactive page (calculators, simulations, games, custom visuals) with inline <style> and <script>. There is no internet: no external scripts, fonts or images. Chart.js is already loaded as the global Chart.",
    "Use valid JSON with double quotes and no comments in chart blocks. Explain in a sentence or two outside the block. Skip the visual for simple questions.",
  ].join("\n");
}
