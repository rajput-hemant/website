/**
 * Writes components/signature/signature-paths.ts from the hand-authored pen
 * strokes below. Each stroke is a list of points along the centre of the pen
 * line, in writing order; a centripetal Catmull-Rom spline through them gives
 * the smooth cubic Béziers a real pen would leave. Durations follow each
 * stroke's length, so the pen keeps an even speed, with the flourish quicker.
 *
 *   bun run signature
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

type Point = readonly [x: number, y: number];

type StrokeSource = {
  name: string;
  points: readonly Point[];
  /** Pen speed relative to the letters; flourishes are dashed off faster. */
  pace?: number;
};

const OUTPUT = resolve(
  import.meta.dirname,
  "../components/signature/signature-paths.ts"
);

/** Drawing time for the whole signature, pauses included. */
const TOTAL_MS = 2200;
/** The pen lifting and moving to the next stroke. */
const PAUSE_MS = 110;
const MIN_STROKE_MS = 200;
const PADDING = 12;

// prettier-ignore
const strokes: readonly StrokeSource[] = [
  {
    name: "H",
    points: [
      [158, 181], [140, 168], [100, 156], [70, 140], [66, 118], [90, 102],
      [140, 97], [185, 99], [210, 112], [212, 140], [200, 175], [178, 215],
      [150, 258], [115, 300], [70, 345], [40, 370], [32, 372], [38, 358],
      [70, 330], [110, 295], [150, 262], [200, 228], [250, 195], [300, 160],
      [340, 128], [360, 102], [357, 93], [345, 97], [320, 120], [290, 155],
      [255, 200], [220, 250], [195, 290], [180, 322], [185, 335], [205, 333],
      [230, 316], [243, 304],
    ],
  },
  {
    name: "emant",
    points: [
      [262, 306], [290, 292], [318, 272], [327, 258], [318, 254], [298, 262],
      [280, 285], [270, 312], [276, 330], [300, 332], [330, 318], [360, 295],
      [375, 278], [365, 295], [352, 325], [350, 332], [362, 310], [385, 285],
      [405, 272], [415, 275], [410, 292], [398, 318], [395, 332], [408, 310],
      [430, 285], [450, 272], [460, 276], [455, 295], [445, 318], [447, 332],
      [462, 330], [485, 315], [510, 295], [545, 272], [530, 268], [505, 280],
      [490, 305], [490, 328], [505, 332], [530, 315], [550, 290], [556, 272],
      [548, 300], [542, 325], [548, 333], [565, 326], [590, 305], [602, 280],
      [592, 305], [585, 332], [598, 308], [620, 284], [640, 272], [650, 277],
      [645, 297], [637, 320], [640, 333], [658, 328], [690, 305], [720, 270],
      [760, 225], [795, 195], [800, 192], [785, 215], [750, 262], [725, 305],
      [720, 330], [735, 333], [765, 312], [797, 277],
    ],
  },
  {
    name: "t-cross",
    points: [
      [740, 238], [790, 229], [845, 221], [895, 216],
    ],
  },
  {
    name: "flourish",
    pace: 1.4,
    points: [
      [108, 394], [190, 403], [360, 401], [545, 387], [725, 361], [865, 328],
      [948, 294],
    ],
  },
];

type Cubic = readonly [Point, Point, Point, Point];

function catmullRomToCubics(points: readonly Point[]): Cubic[] {
  const first = points[0];
  const last = points.at(-1);
  if (!first || !last) return [];
  const padded = [first, ...points, last];
  const knot = (a: Point, b: Point) =>
    Math.max(Math.sqrt(Math.hypot(a[0] - b[0], a[1] - b[1])), 1e-4);

  const cubics: Cubic[] = [];
  for (let i = 1; i < padded.length - 2; i++) {
    const [p0, p1, p2, p3] = [
      padded[i - 1],
      padded[i],
      padded[i + 1],
      padded[i + 2],
    ];
    if (!p0 || !p1 || !p2 || !p3) continue;
    const d1 = knot(p0, p1);
    const d2 = knot(p1, p2);
    const d3 = knot(p2, p3);
    const control = (a: Point, b: Point, c: Point, da: number): Point => {
      const axis = (k: 0 | 1) =>
        (da * da * c[k] -
          d2 * d2 * a[k] +
          (2 * da * da + 3 * da * d2 + d2 * d2) * b[k]) /
        (3 * da * (da + d2));
      return [axis(0), axis(1)];
    };
    cubics.push([p1, control(p0, p1, p2, d1), control(p3, p2, p1, d3), p2]);
  }
  return cubics;
}

function pointOnCubic([a, b, c, d]: Cubic, t: number): Point {
  const u = 1 - t;
  const blend = (k: 0 | 1) =>
    u * u * u * a[k] +
    3 * u * u * t * b[k] +
    3 * u * t * t * c[k] +
    t * t * t * d[k];
  return [blend(0), blend(1)];
}

function cubicLength(cubic: Cubic, samples = 24): number {
  let length = 0;
  let previous = cubic[0];
  for (let i = 1; i <= samples; i++) {
    const next = pointOnCubic(cubic, i / samples);
    length += Math.hypot(next[0] - previous[0], next[1] - previous[1]);
    previous = next;
  }
  return length;
}

function bounds(cubicSets: readonly Cubic[][]) {
  const all = cubicSets
    .flat()
    .flatMap((cubic) =>
      Array.from({ length: 25 }, (_, i) => pointOnCubic(cubic, i / 24))
    );
  const xs = all.map(([x]) => x);
  const ys = all.map(([, y]) => y);
  return {
    minX: Math.min(...xs) - PADDING,
    minY: Math.min(...ys) - PADDING,
    maxX: Math.max(...xs) + PADDING,
    maxY: Math.max(...ys) + PADDING,
  };
}

const round = (n: number) => Math.round(n * 10) / 10;

function toPathData(cubics: readonly Cubic[], dx: number, dy: number): string {
  const [start] = cubics[0] ?? [[0, 0]];
  const at = ([x, y]: Point) => `${round(x - dx)} ${round(y - dy)}`;
  return [
    `M${at(start)}`,
    ...cubics.map(([, c1, c2, end]) => `C${at(c1)} ${at(c2)} ${at(end)}`),
  ].join(" ");
}

function main() {
  const cubicSets = strokes.map(({ points }) => catmullRomToCubics(points));
  const box = bounds(cubicSets);
  const lengths = cubicSets.map((set) =>
    set.reduce((sum, c) => sum + cubicLength(c), 0)
  );

  const drawingMs = TOTAL_MS - PAUSE_MS * (strokes.length - 1);
  const weighted = lengths.reduce(
    (sum, length, i) => sum + length / (strokes[i]?.pace ?? 1),
    0
  );

  const entries = strokes.map((stroke, i) => ({
    name: stroke.name,
    d: toPathData(cubicSets[i] ?? [], box.minX, box.minY),
    duration: Math.max(
      MIN_STROKE_MS,
      Math.round(
        ((lengths[i] ?? 0) / (stroke.pace ?? 1) / weighted) * drawingMs
      )
    ),
    pause: i === 0 ? 0 : PAUSE_MS,
  }));

  const width = Math.round(box.maxX - box.minX);
  const height = Math.round(box.maxY - box.minY);

  const source = `// Generated by \`bun run signature\` (scripts/generate-signature.ts). See README.md to replace it.
import type { SignatureStroke } from "./types";

export const SIGNATURE_VIEWBOX = { width: ${width}, height: ${height} } as const;

export const signatureStrokes: readonly SignatureStroke[] = [
${entries
  .map(
    ({ name, d, duration, pause }) => `  {
    // ${name}
    d: "${d}",
    duration: ${duration},
    pause: ${pause},
  },`
  )
  .join("\n")}
];
`;

  writeFileSync(OUTPUT, source);
  console.log(
    `Wrote ${entries.length} strokes (${width}×${height}) to ${OUTPUT}:`,
    entries.map(({ name, duration }) => `${name} ${duration}ms`).join(", ")
  );
}

main();
