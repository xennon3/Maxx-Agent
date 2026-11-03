import { z } from "zod";
import type { Tool } from "./types.ts";
import type { ToolSpec } from "../llm.ts";
import { readFile } from "./read.ts";
import { listFiles } from "./list.ts";
import { grep } from "./grep.ts";
import { editFile } from "./edit.ts";
import { writeFile } from "./write.ts";
import { bash } from "./bash.ts";
import { useTemplate } from "./template.ts";
import { makeSounds } from "./sound.ts";
import { ANDROID_TOOLS, ANDROID_PROMPT } from "./android.ts";
import { DESKTOP_TOOLS, DESKTOP_PROMPT } from "./desktop.ts";
import { runTests } from "./tests.ts";
import { gitTool, gitCommit } from "./git.ts";
import { snapPage, makeIcons } from "./studio.ts";
import { imageEdit, spriteSheet } from "./canvas.ts";
import { drawSvg, designTokens, pickFonts, moodBoard } from "./design.ts";
import { imageGenerate } from "./imagegen.ts";
import { speak, video } from "./media.ts";
import { recipeTool } from "../recipes.ts";
import { browserOpen, browserAct, browserLook, browserEval } from "./browse.ts";
import { profilePage } from "./profile.ts";
import { ENGINEER_TOOLS, ENGINEER_PROMPT } from "./engineer.ts";

export const TOOLS: Tool<any>[] = [readFile, listFiles, grep, editFile, writeFile, bash, runTests, gitTool, gitCommit, snapPage, recipeTool, useTemplate, makeSounds];

// Opt-in groups (--with android,desktop or /with), so small models are not
// handed twenty tools when they are only editing code.
export type Toolset = { tools: Tool<any>[]; prompt: string; about: string };
export const TOOLSETS: Record<string, Toolset> = {
  android: { tools: ANDROID_TOOLS, prompt: ANDROID_PROMPT, about: "build, install, screenshot and drive apps on an Android phone over adb" },
  desktop: { tools: DESKTOP_TOOLS, prompt: DESKTOP_PROMPT, about: "see and control the Windows desktop (screenshot, mouse, keyboard)" },
  browser: {
    tools: [browserOpen, browserAct, browserLook, browserEval, profilePage],
    prompt: "Browser tools: browser_open shows a page with numbered boxes on what can be clicked; browser_act clicks, types and presses keys by those numbers and shows the result. Test web apps and games like a user would: click through them and read the console output. profile_page measures speed and frame rate and names the top problems.",
    about: "Maxx's own browser: open your web app or game, click, type, play it, read the console, measure speed",
  },
  engineer: { tools: ENGINEER_TOOLS, prompt: ENGINEER_PROMPT, about: "IDE-grade code navigation and renames, probe debugging, git bisect, mutation testing, one-step releases" },
  // snap_page is in TOOLS for every project; the rest of the studio joins it here.
  studio: {
    tools: [drawSvg, imageEdit, spriteSheet, makeIcons, designTokens, pickFonts, moodBoard],
    prompt:
      "Studio tools: for logos, icons and illustrations write SVG with draw_svg, look at the render and improve it. Set colors, fonts and spacing once with design_tokens (and pick_fonts) and use the token names in code instead of raw values. image_edit crops, resizes, removes backgrounds, recolors and pixelates; sprite_sheet packs frames. make_icons turns one logo into every app icon. Before designing something new, mood_board can sum up reference sites or images. After changing how a page looks, call snap_page and look.",
    about: "design: SVG art you can see, image editing, sprite sheets, app icons, design tokens, fonts, mood boards",
  },
  media: {
    tools: [imageGenerate, speak, video],
    prompt: "Media tools: image_generate draws pictures with the local image model (use transparent for sprites; look at the result and retry with a new prompt or seed if it is off). speak makes voice lines as WAV files. video trims clips, makes GIFs and turns frames into videos with ffmpeg.",
    about: "make assets: pictures from the local image model, spoken voice lines, video and GIFs",
  },
};

export function withToolsets(names: string[]): { tools: Tool<any>[]; prompts: string[] } {
  const unknown = names.filter((n) => !TOOLSETS[n]);
  if (unknown.length) throw new Error(`unknown toolset ${unknown.join(", ")}; available: ${Object.keys(TOOLSETS).join(", ")}`);
  return {
    tools: names.flatMap((n) => TOOLSETS[n]!.tools),
    prompts: names.map((n) => TOOLSETS[n]!.prompt),
  };
}

export function toolSpecs(tools: Tool<any>[] = TOOLS): ToolSpec[] {
  return tools.map((t) => {
    if (t.parameters) return { type: "function", function: { name: t.name, description: t.description, parameters: t.parameters } };
    const { $schema, ...parameters } = z.toJSONSchema(t.schema, { io: "input" }) as Record<string, unknown>;
    return { type: "function", function: { name: t.name, description: t.description, parameters } };
  });
}

export function findTool(name: string, tools: Tool<any>[] = TOOLS) {
  return tools.find((t) => t.name === name);
}
