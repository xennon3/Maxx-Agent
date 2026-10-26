import { center, crop, decodePng, toShot, type Bounds, type Mark, type Shot } from "../image.ts";

// What the model last saw of a screen: the scale of its screenshot and the
// numbered elements on it. The model always speaks in screenshot pixels and
// element numbers; this converts back to real screen pixels.
export type Element = Mark & { label: string };

export class Screen {
  scale = 1;
  elements: Element[] = [];
  seen = false;

  constructor(readonly name: string) {}

  // Turn a full-resolution PNG plus known elements into what the model sees.
  look(png: Uint8Array, elements: Omit<Element, "n">[], opts: { marks?: boolean; maxSide?: number } = {}) {
    this.elements = elements.map((e, i) => ({ ...e, n: i + 1 }));
    const shot = toShot(png, { maxSide: opts.maxSide ?? maxSide(), marks: opts.marks === false ? [] : this.elements });
    this.scale = shot.scale;
    this.seen = true;
    return { shot, text: this.describe(shot, opts.marks !== false) };
  }

  // A full-resolution crop of part of the last screenshot, for small text.
  zoom(png: Uint8Array, region: string): Shot {
    const b = parseRegion(region);
    if (!b) throw new Error(`zoom must be "x1,y1,x2,y2" in screenshot pixels, got "${region}"`);
    const s = this.scale;
    return toShot(crop(decodePng(png), { x1: b.x1 * s, y1: b.y1 * s, x2: b.x2 * s, y2: b.y2 * s }), { maxSide: maxSide() });
  }

  describe(shot: Shot, marked: boolean): string {
    const head = `${this.name} screenshot, ${shot.width}x${shot.height} pixels. Use these pixel coordinates (or element numbers) for actions.`;
    if (!this.elements.length) return `${head}\nNo element list available; work from the image.`;
    const list = this.elements.map((e) => {
      const c = this.toImage(center(e.bounds));
      return `[${e.n}] ${e.label} @ ${c.x},${c.y}`;
    });
    return `${head}\n${marked ? "Numbered boxes on the image match this list" : "Elements"}:\n${list.join("\n")}`;
  }

  toImage(p: { x: number; y: number }) {
    return { x: Math.round(p.x / this.scale), y: Math.round(p.y / this.scale) };
  }

  toScreen(p: { x: number; y: number }) {
    return { x: Math.round(p.x * this.scale), y: Math.round(p.y * this.scale) };
  }

  // element number, or x/y in screenshot pixels, or a text match, to screen pixels.
  point(a: { element?: number; x?: number; y?: number; text?: string }): { x: number; y: number; what: string } {
    if (a.element !== undefined) {
      const e = this.elements.find((e) => e.n === a.element);
      if (!e) throw new Error(`no element ${a.element} on the last screenshot (${this.elements.length} elements). Take a new screenshot first.`);
      return { ...center(e.bounds), what: `[${e.n}] ${e.label}` };
    }
    if (a.text !== undefined) {
      const needle = a.text.toLowerCase();
      const hits = this.elements.filter((e) => e.label.toLowerCase().includes(needle));
      const exact = hits.find((e) => e.label.toLowerCase().includes(`"${needle}"`));
      const e = exact ?? hits[0];
      if (!e) throw new Error(`no element matching "${a.text}" on the last screenshot. Take a new screenshot or use x,y.`);
      return { ...center(e.bounds), what: `[${e.n}] ${e.label}` };
    }
    if (a.x !== undefined && a.y !== undefined) return { ...this.toScreen({ x: a.x, y: a.y }), what: `${a.x},${a.y}` };
    throw new Error("give element (a number from the last screenshot), text, or both x and y");
  }
}

export function parseRegion(s: string): Bounds | null {
  const n = s.split(/[\s,]+/).filter(Boolean).map(Number);
  if (n.length !== 4 || n.some((v) => !Number.isFinite(v))) return null;
  const [x1, y1, x2, y2] = n as [number, number, number, number];
  return { x1: Math.min(x1, x2), y1: Math.min(y1, y2), x2: Math.max(x1, x2), y2: Math.max(y1, y2) };
}

const maxSide = () => Number(process.env.MAXX_SCREEN_MAX ?? 1280);
