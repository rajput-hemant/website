/**
 * The picture in each frame: a few flat shapes in three densities, drawn
 * from what the project is. No three.js and no DOM here, so the contact
 * sheet (SVG), the scene poster (SVG) and the print in the tray (a canvas
 * texture, shapes only, never text) all read the same numbers.
 */
export type Tone = "hi" | "mid" | "lo";

export type Shape =
  | { kind: "rect"; x: number; y: number; w: number; h: number; tone: Tone }
  | { kind: "circle"; cx: number; cy: number; r: number; tone: Tone }
  | { kind: "poly"; points: readonly number[]; tone: Tone };

/** Every picture a frame can hold. */
export type Archetype =
  | "music"
  | "api"
  | "doc"
  | "terminal"
  | "code"
  | "orb"
  | "keys"
  | "site"
  | "hills"
  | "sun"
  | "portrait";

/** A frame is 150 by 100 units, the 3:2 of a 35mm negative. */
export const FRAME_W = 150;
export const FRAME_H = 100;

const rules: [Archetype, RegExp][] = [
  ["music", /\b(music|player|audio|song|playlist)\b/],
  ["terminal", /\b(terminal|cli|shell|command[- ]line)\b/],
  ["api", /\b(api|wrapper|sdk|hono)\b/],
  ["doc", /\b(notion|workspace|editor|docs?|notes?|collaboration)\b/],
  ["code", /\b(leetcode|solutions?|algorithms?|rust|go|java)\b/],
  ["orb", /\b(three(\.js)?|webgl|3d|shader)\b/],
  ["keys", /\b(calculator|keypad)\b/],
  ["site", /\b(site|portfolio|landing|blog)\b/],
];

/** A small stable hash, so the same slug always gets the same picture. */
export function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** What the frame shows, read from the project's own words. */
export function archetypeFor(project: {
  slug: string;
  name: string;
  tagline: string;
  stack: readonly string[];
}): Archetype {
  const words = `${project.name} ${project.tagline} ${project.stack.join(" ")}`
    .toLowerCase()
    .replace(/[^a-z0-9.\- ]+/g, " ");
  for (const [archetype, rule] of rules) if (rule.test(words)) return archetype;
  return hash(project.slug) % 2 ? "hills" : "sun";
}

const rect = (
  x: number,
  y: number,
  w: number,
  h: number,
  tone: Tone
): Shape => ({ kind: "rect", x, y, w, h, tone });
const circle = (cx: number, cy: number, r: number, tone: Tone): Shape => ({
  kind: "circle",
  cx,
  cy,
  r,
  tone,
});
const poly = (points: number[], tone: Tone): Shape => ({
  kind: "poly",
  points,
  tone,
});

/** The shapes of one frame, back to front, in the 150 by 100 frame. */
export function frameArt(archetype: Archetype, seed = 0): Shape[] {
  const s = seed % 7;
  switch (archetype) {
    case "music":
      return [
        rect(0, 0, 150, 100, "mid"),
        rect(14, 14, 44, 44, "lo"),
        circle(36, 36, 9, "hi"),
        circle(36, 36, 2.5, "lo"),
        rect(68, 18, 54, 7, "hi"),
        rect(68, 31, 34, 5, "lo"),
        ...[8, 14, 6, 18, 10, 16, 7, 12, 4].map((h, i) =>
          rect(14 + i * 8, 84 - h, 4, h, "hi")
        ),
        circle(126, 76, 11, "hi"),
        poly([122, 70, 122, 82, 132, 76], "lo"),
      ];
    case "code":
      return [
        rect(0, 0, 150, 100, "lo"),
        ...[
          [14, 40],
          [24, 70],
          [24, 52],
          [34, 80],
          [24, 44],
          [14, 20],
        ].map(([x = 0, w = 0], i) => rect(x, 14 + i * 12, w, 5, "mid")),
        rect(34, 50, 26 + s * 2, 5, "hi"),
      ];
    case "api":
      return [
        rect(0, 0, 150, 100, "lo"),
        rect(12, 12, 4, 76, "hi"),
        rect(12, 12, 12, 4, "hi"),
        rect(12, 84, 12, 4, "hi"),
        rect(134, 12, 4, 76, "hi"),
        rect(126, 12, 12, 4, "hi"),
        rect(126, 84, 12, 4, "hi"),
        ...[28, 22, 32, 18].map((w, i) => rect(32, 24 + i * 16, w, 5, "mid")),
        ...[48, 30, 40, 54].map((w, i) =>
          rect(62 + (i % 2) * 4, 24 + i * 16, w, 5, "hi")
        ),
      ];
    case "doc":
      return [
        rect(0, 0, 150, 100, "mid"),
        rect(18, 8, 114, 92, "hi"),
        rect(30, 20, 60, 8, "lo"),
        rect(30, 36, 90, 4, "mid"),
        rect(30, 45, 80, 4, "mid"),
        rect(30, 54, 86, 4, "mid"),
        rect(30, 68, 40, 20, "mid"),
        rect(76, 68, 40, 20, "mid"),
        rect(110, 42, 2, 12, "lo"),
        rect(110, 38, 12, 5, "lo"),
      ];
    case "terminal":
      return [
        rect(0, 0, 150, 100, "lo"),
        poly([16, 18, 26, 24, 16, 30], "hi"),
        rect(30, 21, 56, 5, "hi"),
        rect(16, 42, 100, 4, "mid"),
        rect(16, 51, 84, 4, "mid"),
        rect(16, 60, 92, 4, "mid"),
        poly([16, 74, 26, 80, 16, 86], "hi"),
        rect(30, 76, 7, 11, "hi"),
      ];
    case "orb":
      return [
        rect(0, 0, 150, 100, "lo"),
        circle(75, 50, 34, "mid"),
        circle(66, 41, 16, "hi"),
        rect(0, 86, 150, 14, "mid"),
      ];
    case "keys":
      return [
        rect(0, 0, 150, 100, "mid"),
        rect(40, 8, 70, 84, "lo"),
        rect(48, 14, 54, 16, "hi"),
        ...Array.from({ length: 12 }, (_, i) =>
          rect(48 + (i % 4) * 14, 36 + Math.floor(i / 4) * 17, 10, 12, "mid")
        ),
      ];
    case "site":
      return [
        rect(0, 0, 150, 100, "mid"),
        rect(14, 14, 122, 20, "lo"),
        rect(14, 40, 58, 48, "lo"),
        rect(78, 40, 58, 48, "lo"),
        rect(22, 20, 30 + s * 4, 6, "hi"),
      ];
    case "hills":
      return [
        rect(0, 0, 150, 100, "hi"),
        poly(
          [0, 70, 40, 44 + s, 70, 60, 110, 30 + s, 150, 56, 150, 100, 0, 100],
          "mid"
        ),
        poly([0, 86, 50, 70, 100, 82, 150, 72, 150, 100, 0, 100], "lo"),
      ];
    case "portrait":
      return [
        rect(0, 0, 150, 100, "mid"),
        poly([38, 100, 46, 74, 75, 64, 104, 74, 112, 100], "lo"),
        circle(75, 42, 17, "lo"),
        rect(0, 0, 18, 100, "hi"),
      ];
    case "sun":
      return [
        rect(0, 0, 150, 100, "mid"),
        rect(0, 60 + s, 150, 40 - s, "lo"),
        circle(40 + s * 10, 32, 11, "hi"),
      ];
  }
}

export const archetypes: readonly Archetype[] = [
  "music",
  "api",
  "doc",
  "terminal",
  "code",
  "orb",
  "keys",
  "site",
  "hills",
  "sun",
  "portrait",
];

export const isArchetype = (value: string): value is Archetype =>
  archetypes.some((archetype) => archetype === value);
