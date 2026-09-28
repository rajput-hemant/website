import {
  FRAME_H,
  FRAME_W,
  frameArt,
  isArchetype,
  type Archetype,
  type Tone,
} from "../frame-art";
import type { PrintKind } from "./poses";

/**
 * The print in the tray, as flat shapes on a 1000 by 640 sheet of paper.
 * The poster draws them in SVG, the scene paints them on a canvas texture
 * (shapes only: canvas text is banned). Both read the same list.
 */
export const PRINT_W = 1000;
export const PRINT_H = 640;

export type PrintTone = Tone | "black" | "grease";

export type PrintShape =
  | {
      kind: "rect";
      x: number;
      y: number;
      w: number;
      h: number;
      tone: PrintTone;
      alpha?: number;
    }
  | { kind: "circle"; cx: number; cy: number; r: number; tone: PrintTone }
  | { kind: "poly"; points: readonly number[]; tone: PrintTone }
  | {
      kind: "ring";
      cx: number;
      cy: number;
      rx: number;
      ry: number;
      tone: "grease";
    };

export type BoardFrame = {
  archetype: Archetype;
  seed: number;
  select: boolean;
};

/** The most frames one contact print holds: three strips of five. */
export const MAX_FRAMES = 15;

/**
 * Frames travel from the page to the scene as `data-scene-board`:
 * `music.3* api.1`, one token per frame, `*` on a select.
 */
export function encodeBoard(frames: readonly BoardFrame[]): string {
  return frames
    .slice(0, MAX_FRAMES)
    .map((f) => `${f.archetype}.${f.seed % 7}${f.select ? "*" : ""}`)
    .join(" ");
}

export function parseBoard(board: string | null): BoardFrame[] {
  if (!board) return [];
  const frames: BoardFrame[] = [];
  for (const token of board.trim().split(/\s+/)) {
    const match = /^([a-z]+)\.(\d)(\*?)$/.exec(token);
    const name = match?.[1];
    if (!match || !name || !isArchetype(name)) continue;
    frames.push({
      archetype: name,
      seed: Number(match[2]),
      select: match[3] === "*",
    });
    if (frames.length === MAX_FRAMES) break;
  }
  return frames;
}

/** A frame's shapes, scaled from 150 by 100 into a box on the print. */
function place(
  archetype: Archetype,
  seed: number,
  x: number,
  y: number,
  w: number
): PrintShape[] {
  const k = w / FRAME_W;
  return frameArt(archetype, seed).map((shape): PrintShape => {
    switch (shape.kind) {
      case "rect":
        return {
          ...shape,
          x: x + shape.x * k,
          y: y + shape.y * k,
          w: shape.w * k,
          h: shape.h * k,
        };
      case "circle":
        return {
          ...shape,
          cx: x + shape.cx * k,
          cy: y + shape.cy * k,
          r: shape.r * k,
        };
      case "poly":
        return {
          ...shape,
          points: shape.points.map((v, i) => (i % 2 ? y : x) + v * k),
        };
    }
  });
}

const COLS = 5;
const MARGIN = 40;

function sheet(all: readonly BoardFrame[]): PrintShape[] {
  const frames = all.slice(0, MAX_FRAMES);
  const shapes: PrintShape[] = [];
  const fw = (PRINT_W - 2 * MARGIN) / COLS;
  const pw = fw - 12;
  const ph = (pw * FRAME_H) / FRAME_W;
  const band = 22;
  const sh = ph + 2 * band;
  const rows = Math.ceil(frames.length / COLS);
  const top = (PRINT_H - (rows * sh + (rows - 1) * 26)) / 2;
  for (let r = 0; r < rows; r++) {
    const row = frames.slice(r * COLS, r * COLS + COLS);
    const y = top + r * (sh + 26);
    shapes.push({
      kind: "rect",
      x: MARGIN,
      y,
      w: fw * row.length,
      h: sh,
      tone: "black",
    });
    row.forEach((frame, i) => {
      const x = MARGIN + i * fw + 6;
      shapes.push(...place(frame.archetype, frame.seed, x, y + band, pw));
      if (frame.select) {
        shapes.push({
          kind: "ring",
          cx: x + pw / 2,
          cy: y + band + ph / 2,
          rx: pw * 0.6,
          ry: ph * 0.72,
          tone: "grease",
        });
      }
    });
  }
  return shapes;
}

function enlargement(frame: BoardFrame | undefined): PrintShape[] {
  const h = PRINT_H - 120;
  const w = (h * FRAME_W) / FRAME_H;
  return place(
    frame?.archetype ?? "portrait",
    frame?.seed ?? 0,
    (PRINT_W - w) / 2,
    60,
    w
  );
}

/** Six exposures across one print, darker to the right, as a test strip is made. */
function testStrip(frame: BoardFrame | undefined): PrintShape[] {
  const shapes = enlargement(frame);
  const steps = 6;
  const w = PRINT_W / steps;
  for (let i = 1; i < steps; i++) {
    shapes.push({
      kind: "rect",
      x: i * w,
      y: 0,
      w,
      h: PRINT_H,
      tone: "black",
      alpha: i * 0.13,
    });
  }
  return shapes;
}

/** A sheet fogged by light in the box: a pale print with a burnt edge. */
function fog(): PrintShape[] {
  return [
    ...enlargement({ archetype: "hills", seed: 3, select: false }),
    { kind: "rect", x: 0, y: 0, w: 260, h: PRINT_H, tone: "black", alpha: 0.7 },
    {
      kind: "rect",
      x: 260,
      y: 0,
      w: 140,
      h: PRINT_H,
      tone: "black",
      alpha: 0.4,
    },
    { kind: "circle", cx: 180, cy: 120, r: 90, tone: "lo" },
  ];
}

export function composePrint(
  kind: PrintKind,
  frames: readonly BoardFrame[]
): PrintShape[] {
  switch (kind) {
    case "sheet":
      return sheet(
        frames.length ? frames : [{ archetype: "sun", seed: 0, select: false }]
      );
    case "enlargement":
      return enlargement(frames[0]);
    case "test":
      return testStrip(frames[0]);
    case "fog":
      return fog();
  }
}
