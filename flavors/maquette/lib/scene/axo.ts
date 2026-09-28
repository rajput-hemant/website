import {
  BAY,
  SITE_D,
  SITE_W,
  type Block,
  type Board,
  type Material,
} from "../model";
import { hull, lightVector, type Sun } from "../sun";
import type { Pose } from "./poses";

/**
 * The model drawn in parallel projection from the scene camera's angle,
 * for the poster and the no-WebGL fallback. The same sizes the scene uses,
 * so the crossfade lands on the same model. No DOM, no three.js.
 */

/** Model units, shared with the scene. */
export const STOREY = 0.3;
/** The recessed reveal under each storey's slab, so storeys can be counted. */
export const REVEAL = 0.035;
/** The site card's thickness on top of the plinth. */
export const CARD = 0.03;
export const PLINTH = { w: 7.4, d: 5, h: 0.36 } as const;
export const SITE = { w: SITE_W * BAY, d: SITE_D * BAY } as const;

/** A block's centre on the site, in model units (x east, z south). */
export const blockCenter = (b: Block) => ({
  x: (b.i + b.cols / 2) * BAY - SITE.w / 2,
  z: (b.j + b.rows / 2) * BAY - SITE.d / 2,
});

export const blockHeight = (b: Pick<Block, "storeys">) => b.storeys * STOREY;

type V3 = { x: number; y: number; z: number };

export type Face = {
  points: string;
  /** Darkening over the material, 0..1. */
  shade: number;
};

export type DrawnBlock = {
  id: string;
  material: Material;
  faces: Face[];
  /** Storey lines on the visible sides, or the frame's members for basswood. */
  lines: string[];
  /** Where a pin would stand, just above the roof. */
  pin: { x: number; y: number };
};

export type Drawing = {
  width: number;
  height: number;
  plinth: Face[];
  card: string;
  shadows: string[];
  blocks: DrawnBlock[];
};

const f = (n: number) => n.toFixed(1);

/** Projects the model for `pose` into a `width` by `height` box, lit by `light`. */
export function drawModel(
  board: Board,
  pose: Pick<Pose, "yaw" | "pitch">,
  light: Sun,
  width = 800,
  height = 500
): Drawing {
  const cy = Math.cos(pose.yaw);
  const sy = Math.sin(pose.yaw);
  const cp = Math.cos(pose.pitch);
  const sp = Math.sin(pose.pitch);
  const rot = (v: V3) => ({ x: v.x * cy + v.z * sy, z: -v.x * sy + v.z * cy });
  const raw = (v: V3) => {
    const r = rot(v);
    return { x: r.x, y: -(v.y * cp - r.z * sp) };
  };

  // Fit the plinth, with room above it for four storeys and pins.
  const hw = PLINTH.w / 2;
  const hd = PLINTH.d / 2;
  const corners: V3[] = [];
  for (const x of [-hw, hw])
    for (const z of [-hd, hd])
      for (const y of [-PLINTH.h, 1.6]) corners.push({ x, y, z });
  const pts = corners.map(raw);
  const minX = Math.min(...pts.map((p) => p.x));
  const maxX = Math.max(...pts.map((p) => p.x));
  const minY = Math.min(...pts.map((p) => p.y));
  const maxY = Math.max(...pts.map((p) => p.y));
  const scale = Math.min(
    (width * 0.9) / (maxX - minX),
    (height * 0.92) / (maxY - minY)
  );
  const ox = width / 2 - ((minX + maxX) / 2) * scale;
  const oy = height / 2 - ((minY + maxY) / 2) * scale;
  const project = (v: V3) => {
    const p = raw(v);
    return { x: ox + p.x * scale, y: oy + p.y * scale };
  };
  const poly = (vs: V3[]) =>
    vs
      .map(project)
      .map((p) => `${f(p.x)},${f(p.y)}`)
      .join(" ");
  const depth = (v: V3) => v.y * sp + rot(v).z * cp;

  const sun = lightVector(light);
  const lambert = (n: V3) =>
    Math.max(0, n.x * sun.x + n.y * sun.y + n.z * sun.z);
  const shadeFor = (n: V3) => 0.34 - 0.3 * lambert(n);

  /** The visible faces of an axis-aligned box. */
  function box(
    x0: number,
    x1: number,
    y0: number,
    y1: number,
    z0: number,
    z1: number
  ) {
    const faces: { face: Face; normal: V3; at: V3[] }[] = [];
    const sides: { normal: V3; at: V3[] }[] = [
      {
        normal: { x: 1, y: 0, z: 0 },
        at: [
          { x: x1, y: y0, z: z0 },
          { x: x1, y: y0, z: z1 },
          { x: x1, y: y1, z: z1 },
          { x: x1, y: y1, z: z0 },
        ],
      },
      {
        normal: { x: -1, y: 0, z: 0 },
        at: [
          { x: x0, y: y0, z: z0 },
          { x: x0, y: y0, z: z1 },
          { x: x0, y: y1, z: z1 },
          { x: x0, y: y1, z: z0 },
        ],
      },
      {
        normal: { x: 0, y: 0, z: 1 },
        at: [
          { x: x0, y: y0, z: z1 },
          { x: x1, y: y0, z: z1 },
          { x: x1, y: y1, z: z1 },
          { x: x0, y: y1, z: z1 },
        ],
      },
      {
        normal: { x: 0, y: 0, z: -1 },
        at: [
          { x: x0, y: y0, z: z0 },
          { x: x1, y: y0, z: z0 },
          { x: x1, y: y1, z: z0 },
          { x: x0, y: y1, z: z0 },
        ],
      },
    ];
    for (const side of sides) {
      if (rot(side.normal).z <= 0) continue;
      faces.push({
        face: { points: poly(side.at), shade: shadeFor(side.normal) },
        ...side,
      });
    }
    const top = [
      { x: x0, y: y1, z: z0 },
      { x: x1, y: y1, z: z0 },
      { x: x1, y: y1, z: z1 },
      { x: x0, y: y1, z: z1 },
    ];
    const up = { x: 0, y: 1, z: 0 };
    faces.push({
      face: { points: poly(top), shade: Math.max(0, shadeFor(up) - 0.12) },
      normal: up,
      at: top,
    });
    return faces;
  }

  const plinth = box(-hw, hw, -PLINTH.h, 0, -hd, hd).map((s) => s.face);
  const card = poly([
    { x: -SITE.w / 2 - 0.19, y: CARD, z: -SITE.d / 2 - 0.04 },
    { x: SITE.w / 2 + 0.19, y: CARD, z: -SITE.d / 2 - 0.04 },
    { x: SITE.w / 2 + 0.19, y: CARD, z: SITE.d / 2 + 0.04 },
    { x: -SITE.w / 2 - 0.19, y: CARD, z: SITE.d / 2 + 0.04 },
  ]);

  // Shadows on the card, away from the light by height / tan(elevation).
  const el = Math.max(light.elevation, 4) * (Math.PI / 180);
  const reach = 1 / Math.tan(el);
  const shadows = board.blocks.map((b) => {
    const c = blockCenter(b);
    const w = (b.cols * BAY) / 2;
    const d = (b.rows * BAY) / 2;
    const h = Math.min(blockHeight(b) * reach, blockHeight(b) * 7);
    const level = Math.hypot(sun.x, sun.z) || 1;
    const dx = -sun.x / level;
    const dz = -sun.z / level;
    const base = [
      { x: c.x - w, z: c.z - d },
      { x: c.x + w, z: c.z - d },
      { x: c.x + w, z: c.z + d },
      { x: c.x - w, z: c.z + d },
    ];
    const all = [
      ...base,
      ...base.map((p) => ({ x: p.x + dx * h, z: p.z + dz * h })),
    ]
      .map((p) => project({ x: p.x, y: CARD, z: p.z }))
      .map((p): [number, number] => [p.x, p.y]);
    return hull(all)
      .map(([x, y]) => `${f(x)},${f(y)}`)
      .join(" ");
  });

  const blocks = [...board.blocks]
    .sort((a, b) => {
      const ca = blockCenter(a);
      const cb = blockCenter(b);
      return (
        depth({ x: ca.x, y: 0, z: ca.z }) - depth({ x: cb.x, y: 0, z: cb.z })
      );
    })
    .map((b): DrawnBlock => {
      const c = blockCenter(b);
      const w = (b.cols * BAY) / 2;
      const d = (b.rows * BAY) / 2;
      const top = CARD + blockHeight(b);
      const x0 = c.x - w;
      const x1 = c.x + w;
      const z0 = c.z - d;
      const z1 = c.z + d;
      const pinAt = project({ x: c.x, y: top + 0.12, z: c.z });
      const lines: string[] = [];
      const seg = (a: V3, z: V3) => {
        const p = project(a);
        const q = project(z);
        return `M${f(p.x)} ${f(p.y)}L${f(q.x)} ${f(q.y)}`;
      };
      if (b.material === "wood") {
        // The frame: columns on the bay grid, a slab at every storey, the top left open.
        for (let i = 0; i <= b.cols; i++)
          for (let j = 0; j <= b.rows; j++) {
            const x = x0 + i * BAY;
            const z = z0 + j * BAY;
            lines.push(seg({ x, y: CARD, z }, { x, y: top, z }));
          }
        for (let s = 0; s < b.storeys; s++) {
          const y = CARD + s * STOREY + 0.015;
          lines.push(
            seg({ x: x0, y, z: z0 }, { x: x1, y, z: z0 }),
            seg({ x: x1, y, z: z0 }, { x: x1, y, z: z1 }),
            seg({ x: x1, y, z: z1 }, { x: x0, y, z: z1 }),
            seg({ x: x0, y, z: z1 }, { x: x0, y, z: z0 })
          );
        }
        return { id: b.id, material: b.material, faces: [], lines, pin: pinAt };
      }
      const faces = box(x0, x1, CARD, top, z0, z1);
      for (const { normal, at } of faces) {
        if (normal.y) continue;
        const [a, bb] = [at[0], at[1]];
        if (!a || !bb) continue;
        for (let s = 1; s < b.storeys; s++) {
          const y = CARD + s * STOREY;
          lines.push(seg({ ...a, y }, { ...bb, y }));
        }
      }
      return {
        id: b.id,
        material: b.material,
        faces: faces.map((s) => s.face),
        lines,
        pin: pinAt,
      };
    });

  return { width, height, plinth, card, shadows, blocks };
}
