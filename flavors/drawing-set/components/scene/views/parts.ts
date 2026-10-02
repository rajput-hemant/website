import { BufferAttribute, BufferGeometry } from "three";

import { box, polyline, type Part } from "../linework";

/**
 * Unit parts for the tracked views, which are drawn in CSS pixels: each is
 * scaled per instance to its placeholder's box.
 */

/** The angle (in the y-z plane, from +y towards +z) of a triangular prism's vertex `j` of 3. */
export const prismVertex = (j: number, turn = 0): [number, number] => {
  const a = Math.PI / 2 + (j * 2 * Math.PI) / 3 + turn;
  return [Math.cos(a), Math.sin(a)];
};

/**
 * A triangular prism along `axis`, unit length, circumradius 1, centred:
 * the architect's scale, whose three faces carry the graduations.
 */
export function prism(axis: "x" | "y" = "x"): Part {
  const v = [0, 1, 2].map((j) => prismVertex(j));
  const at = (s: number, j: number): number[] => {
    const [a, b] = v[j % 3] ?? [0, 0];
    return axis === "x" ? [s, a, b] : [b, s, a];
  };
  const tris: number[] = [];
  const quad = (p: number[], q: number[], r: number[], s: number[]) =>
    tris.push(...p, ...q, ...r, ...p, ...r, ...s);
  for (let j = 0; j < 3; j++) {
    quad(at(-0.5, j), at(-0.5, j + 1), at(0.5, j + 1), at(0.5, j));
  }
  tris.push(...at(-0.5, 0), ...at(-0.5, 2), ...at(-0.5, 1));
  tris.push(...at(0.5, 0), ...at(0.5, 1), ...at(0.5, 2));
  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(new Float32Array(tris), 3));
  return { geo, threshold: 20 };
}

/** A unit graduation: a segment from the origin along +y; scale y for its length. */
export function tick(): Part {
  return polyline([
    [0, 0, 0],
    [0, 1, 0],
  ]);
}

/** A unit box centred on the origin, scaled per instance (slabs, piled sheets). */
export function unitBox(): Part {
  return box(1, 1, 1);
}

/** A sheet lying flat, unit square in x-z centred on the origin, with its title block. */
export function flatSheet(): Part[] {
  return [
    box(1, 1, 1),
    polyline(
      [
        [0.1, 0.5, 0.2],
        [0.45, 0.5, 0.2],
        [0.45, 0.5, 0.45],
        [0.1, 0.5, 0.45],
      ],
      true,
      true
    ),
  ];
}
