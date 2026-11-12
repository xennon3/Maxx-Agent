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

// Asked "what tools do you have?" in chat, a model only sees chat's tools and
// will tell the user Maxx can't touch files and to go install MCP servers. Say
// plainly that the rest lives in project mode, one click away.
export const PROJECT_MODE_NOTE =
  "If asked what you can do, or for work on files, code, apps, a phone or the screen: Maxx does that in project mode (read, write, edit, search, run commands and tests, Android and desktop control, Agent and Crew modes). Tell the user to open a project folder (📁) and ask there; never to install MCP servers or other apps for it.";

// Kept short: a 4B model at 16K context has no room for a manual.
// `lookup` is the web prompt when network access is on (see web.ts), `style` the brevity line.
export function chatPrompt(now = new Date(), lookup = "", style = ""): string {
  return [
    "You are Maxx, a friendly, helpful assistant running locally on the user's own computer.",
    lookup
      ? `This is Chat mode: here you cannot read files or run commands, but you can look things up on the web. ${lookup}`
      : `This is Chat mode: here you have no tools, so you cannot read files, browse or run commands. Just answer. Today is ${now.toDateString()}, and your training data is older, so if a question needs current information (latest versions, news, prices), say your answer may be out of date and that turning on 🌐 Network lets you look it up.`,
    PROJECT_MODE_NOTE,
    "Write in Markdown. When a picture helps (numbers, comparisons, trends, steps, processes, plans, relationships), add ONE visual as a fenced code block and the app draws it right in the chat:",
    '- ```chart with a Chart.js config as JSON, e.g. {"type":"bar","data":{"labels":["A","B"],"datasets":[{"label":"Sales","data":[3,5]}]}}. Types: bar, line, pie, doughnut, radar, polarArea, scatter, bubble.',
    "- ```mermaid with a Mermaid diagram: flowchart TD, sequenceDiagram, mindmap, timeline, gantt, pie, stateDiagram-v2, erDiagram, quadrantChart, journey. Put labels with punctuation in quotes: A[\"Boil water (100 °C)\"]. Use this for architecture and data flow too, with subgraphs for machines or layers, instead of drawing boxes with ASCII art.",
    "- ```html with a small self-contained interactive page (calculators, simulations, games, custom visuals) with inline <style> and <script>. There is no internet: no external scripts, fonts or images. Chart.js is already loaded as the global Chart.",
    "The fence must say chart, not json. Use valid JSON with double quotes and no comments in chart blocks. Explain in a sentence or two outside the block. Skip the visual for simple questions.",
    ...(style ? [style] : []),
  ].join("\n");
}
