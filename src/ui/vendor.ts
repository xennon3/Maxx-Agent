// Chart.js and Mermaid, bundled into maxx.exe so chat visuals draw offline.
// The page loads them from /vendor/<name>.js only when a message needs one.
// (Chart.js doesn't export its UMD build, so it is imported by path.)
// @ts-ignore: a text import has no type declarations
import CHART from "../../node_modules/chart.js/dist/chart.umd.min.js" with { type: "text" };
// @ts-ignore
import MERMAID from "../../node_modules/mermaid/dist/mermaid.min.js" with { type: "text" };

export const VENDOR: Record<string, string> = { chart: CHART as string, mermaid: MERMAID as string };
