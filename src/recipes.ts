import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import { maxxHome } from "./sessions.ts";
import { defineTool } from "./tools/types.ts";
import { textOf } from "./context.ts";
import type { Message } from "./llm.ts";
import { BUILTIN_RECIPES } from "./recipes-builtin.ts";

// Recipes: step-by-step playbooks ("ship a PWA", "fix a failing test") that a
// small model follows better than it improvises. Only their names and one line
// on when to use them go in the system prompt; the `recipe` tool loads the
// whole text when a task matches, so a 16K context still has room.
//
// A recipe is a Markdown file with a little front matter:
//
//   ---
//   name: pwa-install
//   when: make a web app installable on a phone
//   ---
//   1. ...
//
// They come from three places; a later one with the same name wins:
// the ones built into Maxx, ~/.maxx/recipes (yours, every project), and the
// project's .maxx/recipes (shared with the repo).

export type Recipe = { name: string; when: string; body: string; from: "built-in" | "yours" | "project" };

export const userRecipesDir = () => join(maxxHome(), "recipes");
export const projectRecipesDir = (cwd: string) => join(cwd, ".maxx", "recipes");

export function parseRecipe(text: string, fallbackName: string, from: Recipe["from"]): Recipe | null {
  const m = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/.exec(text.replace(/\r\n/g, "\n"));
  const head = m ? m[1]! : "";
  const body = (m ? m[2]! : text).trim();
  const field = (k: string) => new RegExp(`^${k}:\\s*(.+)$`, "m").exec(head)?.[1]?.trim();
  const name = slug(field("name") ?? fallbackName);
  if (!name || !body) return null;
  return { name, when: field("when") ?? body.split("\n")[0]!.replace(/^#+\s*/, "").slice(0, 100), body, from };
}

export const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/\.md$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

async function readDir(dir: string, from: Recipe["from"]): Promise<Recipe[]> {
  const names = await readdir(dir).catch(() => [] as string[]);
  const out: Recipe[] = [];
  for (const f of names.filter((n) => n.endsWith(".md")).sort()) {
    const r = parseRecipe(await readFile(join(dir, f), "utf8").catch(() => ""), f, from);
    if (r) out.push(r);
  }
  return out;
}

export async function loadRecipes(cwd?: string): Promise<Recipe[]> {
  const all = [
    ...BUILTIN_RECIPES.map((t) => parseRecipe(t, "", "built-in")!),
    ...(await readDir(userRecipesDir(), "yours")),
    ...(cwd ? await readDir(projectRecipesDir(cwd), "project") : []),
  ];
  const byName = new Map<string, Recipe>();
  for (const r of all) byName.set(r.name, r);
  return [...byName.values()];
}

// The menu in the system prompt: one short line each, and only so many.
export function recipesPrompt(recipes: Recipe[], max = 14): string {
  if (!recipes.length) return "";
  const shown = [...recipes].sort((a, b) => rank(a) - rank(b)).slice(0, max);
  return [
    "Recipes are proven step-by-step playbooks. When the task matches one, call recipe with its name first and follow its steps:",
    ...shown.map((r) => `- ${r.name}: ${r.when.slice(0, 90)}`),
  ].join("\n");
}
// The project's own and the user's come first: they are why recipes exist.
const rank = (r: Recipe) => (r.from === "project" ? 0 : r.from === "yours" ? 1 : 2);

const STOP = new Set(["make", "with", "that", "this", "from", "into", "have", "more", "some", "your", "the", "and", "for", "add"]);
export function closest(recipes: Recipe[], want: string): Recipe | undefined {
  const w = slug(want);
  const exact = recipes.find((r) => r.name === w) ?? recipes.find((r) => r.name.includes(w) || w.includes(r.name));
  if (exact) return exact;
  // Word overlap: a word in the name counts twice, a word in "when" once; stems match ("juicier" ~ "juice").
  const words = w.split("-").filter((p) => p.length > 2 && !STOP.has(p));
  const hit = (text: string, word: string) => text.includes(word) || (word.length > 4 && text.includes(word.slice(0, 4)));
  let best: Recipe | undefined, score = 0;
  for (const r of recipes) {
    const n = words.reduce((k, x) => k + (hit(r.name, x) ? 2 : 0) + (hit(r.when.toLowerCase(), x) ? 1 : 0), 0);
    if (n > score) (best = r), (score = n);
  }
  return best;
}

export const recipeTool = defineTool({
  name: "recipe",
  description: "Load a recipe (a step-by-step playbook listed in the system prompt) by name. Follow its steps for the task.",
  schema: z.object({ name: z.string().describe("The recipe's name, from the list in the system prompt") }),
  risk: "read",
  checkpoint: false,
  async run({ name }, { cwd }) {
    const all = await loadRecipes(cwd);
    const r = closest(all, name);
    if (!r) return `No recipe called "${name}". There are: ${all.map((x) => x.name).join(", ")}. Carry on without one if none fits.`;
    return `Recipe ${r.name} (${r.when}):\n\n${r.body}`;
  },
});

export function recipeFile(r: Pick<Recipe, "name" | "when" | "body">): string {
  return `---\nname: ${r.name}\nwhen: ${r.when}\n---\n\n${r.body.trim()}\n`;
}

export async function saveRecipe(dir: string, r: Pick<Recipe, "name" | "when" | "body">): Promise<string> {
  await mkdir(dir, { recursive: true });
  const path = join(dir, `${slug(r.name)}.md`);
  await writeFile(path, recipeFile({ ...r, name: slug(r.name) }));
  return path;
}

// The recorder: after a task went well, turn what was done into a recipe the
// next session can follow. The transcript goes in; a recipe file comes out.
export function recorderMessages(history: Message[], hint = ""): Message[] {
  const lines: string[] = [];
  for (const m of history) {
    if (m.role === "system") continue;
    if (m.role === "assistant" && "tool_calls" in m && m.tool_calls?.length) {
      for (const c of m.tool_calls) lines.push(`call ${c.function.name} ${c.function.arguments.slice(0, 300)}`);
      if (m.content) lines.push(`assistant: ${textOf(m.content).slice(0, 400)}`);
    } else if (m.role === "tool") lines.push(`result: ${textOf(m.content).slice(0, 300)}`);
    else lines.push(`${m.role}: ${textOf(m.content).slice(0, 800)}`);
  }
  const transcript = lines.join("\n").slice(-24_000);
  return [
    { role: "system", content: "You turn a finished coding session into a reusable recipe: a short playbook another, smaller model can follow for a similar task in another project." },
    {
      role: "user",
      content:
        `${hint ? `The user wants a recipe for: ${hint}\n\n` : ""}Session:\n${transcript}\n\n` +
        "Write the recipe in exactly this shape, and nothing else:\n---\nname: short-kebab-case-name\nwhen: one line saying which tasks it is for\n---\n1. First step, naming the tool or command to use\n2. ...\n\n" +
        "Rules: 4 to 10 numbered steps. Keep what worked; leave out the dead ends, but add a step that avoids the mistake that caused them. Name files by their role, not this project's paths. End with how to check the result.",
    },
  ];
}

export function parseRecorded(text: string, fallbackName = "recorded"): Recipe | null {
  const clean = text.replace(/<think>[\s\S]*?<\/think>/g, "").replace(/^```(?:markdown|md)?\s*\n|\n```\s*$/g, "").trim();
  const start = clean.indexOf("---");
  return parseRecipe(start >= 0 ? clean.slice(start) : clean, fallbackName, "project");
}
