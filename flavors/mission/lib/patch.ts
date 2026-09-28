import { MAX_ORBITS, type MissionState } from "./flight";

/**
 * A mission patch, generated from the project: one orbit per technology
 * aboard (up to five), round a planet at the centre. A nominal mission has
 * its craft on the outer orbit; in flight, the outer orbit is still being
 * drawn (dashed, red); deorbited, the orbits fade and the craft decays in a
 * spiral to the planet. Pure: the SVG is drawn in a 120 by 120 box.
 */

export const PATCH_C = 60;
/** Orbits are flattened ellipses: seen from just above the plane. */
const FLAT = 0.34;
const PLANET = 8.5;
const D = Math.PI / 180;

const r2 = (n: number) => Math.round(n * 100) / 100;
const ring = (j: number) => 16 + j * 7;

export type PatchOrbit = {
  rx: number;
  ry: number;
  kind: "solid" | "dash" | "faint";
  /** The near half, redrawn over the planet. */
  front: string | null;
};

export type Patch = {
  orbits: PatchOrbit[];
  /** The craft on a live mission. */
  craft: { x: number; y: number } | null;
  /** The decay spiral of a deorbited one, and where it ends. */
  decay: { points: string; end: { x: number; y: number } } | null;
  planet: number;
};

/** Where the craft sits, from the launch year and the patch's place in a list. */
const phaseAngle = (year: number | null, index: number) =>
  (30 + (((year ?? 2024) * 37 + index * 53) % 110)) * D;

export function patchFor({
  technologies,
  state,
  year,
  index,
}: {
  technologies: number;
  state: MissionState;
  year: number | null;
  index: number;
}): Patch {
  const n = Math.max(1, Math.min(MAX_ORBITS, technologies));
  const outer = ring(n - 1);
  const a0 = phaseAngle(year, index);
  const orbits: PatchOrbit[] = [];
  for (let j = 0; j < n; j++) {
    const rx = ring(j);
    const ry = r2(rx * FLAT);
    const kind =
      state === "deorbited"
        ? "faint"
        : state === "inflight" && j === n - 1
          ? "dash"
          : "solid";
    orbits.push({
      rx,
      ry,
      kind,
      front:
        state === "deorbited"
          ? null
          : `M${PATCH_C - rx} ${PATCH_C}A${rx} ${ry} 0 0 0 ${PATCH_C + rx} ${PATCH_C}`,
    });
  }

  if (state === "deorbited") {
    const pts: string[] = [];
    let end = { x: PATCH_C, y: PATCH_C };
    for (let s = 0; s <= 60; s++) {
      const f = s / 60;
      const th = a0 + f * 2.6 * Math.PI;
      const r = outer * (1 - f) + PLANET * f;
      end = {
        x: r2(PATCH_C + r * Math.cos(th)),
        y: r2(PATCH_C + r * FLAT * Math.sin(th)),
      };
      pts.push(`${end.x},${end.y}`);
    }
    return {
      orbits,
      craft: null,
      decay: { points: pts.join(" "), end },
      planet: PLANET,
    };
  }

  return {
    orbits,
    craft: {
      x: r2(PATCH_C + outer * Math.cos(a0)),
      y: r2(PATCH_C + outer * FLAT * Math.sin(a0)),
    },
    decay: null,
    planet: PLANET,
  };
}
