import { glyphOf, toDrum } from "@/flavors/timetable/lib/board";
import {
  BufferGeometry,
  Float32BufferAttribute,
  Matrix4,
  MeshBasicMaterial,
  Vector3,
} from "three";

import { COLS, ROWS, sharedAtlas } from "../flaps";

/**
 * Flap-atlas lettering for views: each character is one quad whose UVs
 * point at its cell in the indicator's atlas (the edition's one exception
 * to "no canvas text", docs/guides/m2-scene-spec.md), so a word on a pylon or a
 * drum is part of one mesh and one draw call. The words stay in the DOM.
 */
export type GlyphRun = {
  text: string;
  /** Cell size and gap, in scene units. */
  w: number;
  h: number;
  gap?: number;
  yellow?: boolean;
  /** Where the run's centre sits and which way it faces. */
  matrix: Matrix4;
};

/** UV corners of a glyph's cell: [u0, v0, u1, v1] (the texture flips y). */
export function glyphUv(glyph: number): [number, number, number, number] {
  const col = glyph % COLS;
  const row = Math.floor(glyph / COLS);
  return [col / COLS, 1 - (row + 1) / ROWS, (col + 1) / COLS, 1 - row / ROWS];
}

/** One geometry holding every run's quads. */
export function glyphGeometry(runs: readonly GlyphRun[]) {
  const positions: number[] = [];
  const uvs: number[] = [];
  const index: number[] = [];
  const p = new Vector3();
  for (const run of runs) {
    const text = toDrum(run.text);
    const gap = run.gap ?? run.w * 0.12;
    const span = text.length * run.w + (text.length - 1) * gap;
    [...text].forEach((char, i) => {
      const x0 = -span / 2 + i * (run.w + gap);
      const [u0, v0, u1, v1] = glyphUv(glyphOf(char, run.yellow));
      const base = positions.length / 3;
      const corners: [number, number, number, number][] = [
        [x0, -run.h / 2, u0, v0],
        [x0 + run.w, -run.h / 2, u1, v0],
        [x0 + run.w, run.h / 2, u1, v1],
        [x0, run.h / 2, u0, v1],
      ];
      for (const [x, y, u, v] of corners) {
        p.set(x, y, 0).applyMatrix4(run.matrix);
        positions.push(p.x, p.y, p.z);
        uvs.push(u, v);
      }
      index.push(base, base + 1, base + 2, base, base + 2, base + 3);
    });
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(index);
  return geometry;
}

let material: MeshBasicMaterial | null = null;

/** Unlit, like the indicator's modules: the atlas prints its own shading. */
export function glyphMaterial() {
  material ??= new MeshBasicMaterial({ map: sharedAtlas().texture });
  return material;
}
