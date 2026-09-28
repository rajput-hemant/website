import { eastingOf, heightAt, SHEET, type Relief, type Summit } from "./relief";

/**
 * A block diagram of the sheet: a rectangle of the relief cut out and stood
 * on its skirts, as a geologist draws a ridge. The glyph (W2, L2) and its
 * SVG poster both build from this, so they agree. Pure; no three.js.
 */
export type BlockSpec = {
  /** Every hill on the sheet: x, p, east spread, height in months. */
  hills: [number, number, number, number][];
  /** The cut, in sheet units: east to west, then north to south. */
  x0: number;
  x1: number;
  p0: number;
  p1: number;
  /** The tallest hill on the sheet, so every block is to the same scale. */
  tallest: number;
  /** Grid cells east to west and north to south. */
  nx: number;
  np: number;
  /** A stake on the block (a trial), in sheet units. */
  stake?: [number, number];
};

/** The block's width in world units; its depth keeps the cut's proportions. */
export const BLOCK_W = 16;
/** World height of the tallest hill, and the skirt's depth below the lowland. */
export const BLOCK_H = 5.5;
export const BLOCK_BASE = 1.1;

/** A role's ridge, cut east to west across its transect, a third as deep as wide. */
export function ridgeSpec(relief: Relief, summit: Summit): BlockSpec {
  const pad = 6;
  const x0 = eastingOf(relief, summit.start - pad);
  const x1 = eastingOf(relief, summit.end + pad);
  const half = (x1 - x0) / 6;
  return {
    hills: hillsOf(relief),
    x0,
    x1,
    p0: summit.p - half,
    p1: summit.p + half,
    tallest: tallestOf(relief),
    nx: 64,
    np: 16,
  };
}

/** A trial's pit: a 16 by 9 cut round its stake, reaching north over the boundary. */
export function pitSpec(
  relief: Relief,
  at: { x: number; p: number }
): BlockSpec {
  const w = relief.yearW * 1.4;
  const d = (w * 9) / 16;
  const x0 = Math.max(SHEET.X0, Math.min(at.x - w / 2, relief.coast - w));
  return {
    hills: hillsOf(relief),
    x0,
    x1: x0 + w,
    p0: at.p - d * 0.78,
    p1: at.p + d * 0.22,
    tallest: tallestOf(relief),
    nx: 48,
    np: 27,
    stake: [at.x, at.p],
  };
}

const hillsOf = (relief: Relief): BlockSpec["hills"] =>
  relief.summits.map((s) => [s.x, s.p, s.sx, s.h]);

const tallestOf = (relief: Relief) =>
  Math.max(1, ...relief.summits.map((s) => s.h));

/** The resting view (the glyph's and the poster's): turned 20 degrees, seen from 32 up. */
export const RIDGE_VIEW = { yaw: 20, elevation: 32 };
/** Yaw either side of rest the frame leaves room for (the drag's range). */
export const RIDGE_RANGE = 30;
/** A stake's height on a block, in world units. */
export const STAKE_H = 1.8;

/**
 * The orthographic frame that holds the whole block, turned anywhere in its
 * range, in a box `aspect` wide per unit of height: half its width in world
 * units, and the height it looks at.
 */
export function blockFrame(spec: BlockSpec, aspect: number) {
  const d = blockDepth(spec);
  const top =
    worldHeight(spec, Math.max(0, ...blockHeights(spec))) +
    (spec.stake ? STAKE_H : 0);
  const e = (RIDGE_VIEW.elevation * Math.PI) / 180;
  let wide = 0;
  let low = Infinity;
  let high = -Infinity;
  for (let k = -2; k <= 2; k++) {
    const a = ((RIDGE_VIEW.yaw + (k * RIDGE_RANGE) / 2) * Math.PI) / 180;
    for (const x of [-BLOCK_W / 2, BLOCK_W / 2]) {
      for (const z of [-d / 2, d / 2]) {
        const rx = Math.cos(a) * x + Math.sin(a) * z;
        const rz = -Math.sin(a) * x + Math.cos(a) * z;
        wide = Math.max(wide, Math.abs(rx));
        for (const y of [-BLOCK_BASE, top]) {
          const up = y * Math.cos(e) - rz * Math.sin(e);
          low = Math.min(low, up);
          high = Math.max(high, up);
        }
      }
    }
  }
  // Room for the lean, too.
  const margin = 1.08;
  return {
    extent: Math.max(wide, ((high - low) / 2) * aspect) * margin,
    lookY: (high + low) / 2 / Math.cos(e),
  };
}

/** The block's depth in world units. */
export const blockDepth = (spec: BlockSpec) =>
  (BLOCK_W * (spec.p1 - spec.p0)) / (spec.x1 - spec.x0);

/** Sheet (x, p) to world (x, z), centred on the block. */
export function toWorld(spec: BlockSpec, x: number, p: number) {
  const d = blockDepth(spec);
  return {
    x: ((x - spec.x0) / (spec.x1 - spec.x0) - 0.5) * BLOCK_W,
    z: ((p - spec.p0) / (spec.p1 - spec.p0) - 0.5) * d,
  };
}

/** Months to world height. */
export const worldHeight = (spec: BlockSpec, h: number) =>
  (h / spec.tallest) * BLOCK_H;

/**
 * Ground heights in months on the (nx + 1) by (np + 1) grid, row by row
 * north to south.
 */
export function blockHeights(spec: BlockSpec): Float32Array {
  const hills = spec.hills.map(([x, p, sx, h]) => ({ x, p, sx, h }));
  const out = new Float32Array((spec.nx + 1) * (spec.np + 1));
  for (let j = 0; j <= spec.np; j++) {
    const p = spec.p0 + ((spec.p1 - spec.p0) * j) / spec.np;
    for (let i = 0; i <= spec.nx; i++) {
      const x = spec.x0 + ((spec.x1 - spec.x0) * i) / spec.nx;
      out[j * (spec.nx + 1) + i] = heightAt(hills, x, p);
    }
  }
  return out;
}

/** Which of the eight layer tints a height in months falls in. */
export const tintIndex = (spec: BlockSpec, h: number) =>
  Math.max(0, Math.min(7, Math.floor((h / spec.tallest) * 8)));

/**
 * The poster: the block at its resting view (yaw and elevation in degrees)
 * as SVG paths in a `w` by `h` box, drawn back to front: the far skirts,
 * the top, the near skirts. The same orthographic view as the glyph's
 * camera, framed on `extent` world units either side.
 */
export function blockPoster(
  spec: BlockSpec,
  {
    yaw,
    elevation,
    extent,
    lookY,
    w,
    h,
  }: {
    yaw: number;
    elevation: number;
    extent: number;
    lookY: number;
    w: number;
    h: number;
  }
) {
  const heights = blockHeights(spec);
  const d = blockDepth(spec);
  const cy = Math.cos((yaw * Math.PI) / 180);
  const sy = Math.sin((yaw * Math.PI) / 180);
  const ce = Math.cos((elevation * Math.PI) / 180);
  const se = Math.sin((elevation * Math.PI) / 180);
  const scale = w / (2 * extent);
  // World to the glyph camera's screen, y down.
  const project = (x: number, y: number, z: number): [number, number] => {
    const rx = cy * x + sy * z;
    const rz = -sy * x + cy * z;
    const up = (y - lookY) * ce - rz * se;
    return [w / 2 + rx * scale, h / 2 - up * scale];
  };
  const at = (i: number, j: number) =>
    worldHeight(spec, heights[j * (spec.nx + 1) + i] ?? 0);
  const gx = (i: number) => (i / spec.nx - 0.5) * BLOCK_W;
  const gz = (j: number) => (j / spec.np - 0.5) * d;
  const path = (pts: [number, number][]) =>
    pts
      .map(([x, y], k) => `${k ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`)
      .join("") + "Z";

  // The four edges of the top, each as (x, z, ground) walking the edge.
  const edge = (side: "n" | "s" | "w" | "e") => {
    const pts: [number, number, number][] = [];
    if (side === "n" || side === "s") {
      const j = side === "n" ? 0 : spec.np;
      for (let i = 0; i <= spec.nx; i++) pts.push([gx(i), gz(j), at(i, j)]);
    } else {
      const i = side === "w" ? 0 : spec.nx;
      for (let j = 0; j <= spec.np; j++) pts.push([gx(i), gz(j), at(i, j)]);
    }
    return pts;
  };
  const wall = (side: "n" | "s" | "w" | "e") => {
    const top = edge(side);
    const first = top[0];
    const last = top.at(-1);
    if (!first || !last) return "";
    return path([
      ...top.map(([x, z, y]) => project(x, y, z)),
      project(last[0], -BLOCK_BASE, last[1]),
      project(first[0], -BLOCK_BASE, first[1]),
    ]);
  };
  // A wall faces the camera when its outward normal, turned by the yaw, points toward +z.
  const facing = (nx: number, nz: number) => -sy * nx + cy * nz > 0;
  const sides = [
    { side: "n" as const, near: facing(0, -1) },
    { side: "s" as const, near: facing(0, 1) },
    { side: "w" as const, near: facing(-1, 0) },
    { side: "e" as const, near: facing(1, 0) },
  ];
  const outline = [
    ...edge("n"),
    ...edge("e"),
    ...edge("s").reverse(),
    ...edge("w").reverse(),
  ];
  const top = path(outline.map(([x, z, y]) => project(x, y, z)));
  // The ridge line: the highest ground on each column, where the eye reads the crest.
  const crest: [number, number][] = [];
  for (let i = 0; i <= spec.nx; i++) {
    let best = 0;
    for (let j = 1; j <= spec.np; j++) if (at(i, j) > at(i, best)) best = j;
    crest.push(project(gx(i), at(i, best), gz(best)));
  }
  return {
    far: sides.filter((s) => !s.near).map((s) => wall(s.side)),
    top,
    crest: crest
      .map(([x, y], k) => `${k ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`)
      .join(""),
    near: sides.filter((s) => s.near).map((s) => wall(s.side)),
  };
}
