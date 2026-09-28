import type { OpenOptions } from "@/flavors/survey/components/scene/use-glyph";
import {
  BoxGeometry,
  Color,
  EdgesGeometry,
  Group,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  Scene,
} from "three";

import type { Glyph } from "@/lib/scene/blit";

import { glyphs } from "./engine";
import {
  DEG,
  disposeGeometry,
  ease,
  glyphCamera,
  glyphInks,
  motionOn,
} from "./kit";

/** World units a pointed tile rises; about 8 sheet units at glyph scale. */
const LIFT = 1.4;
/** A tile's thickness for one revision, and the thinnest and thickest. */
const PER_ENTRY = 0.09;
const THIN = 0.3;
const THICK = 1.1;
const GAP = 0.45;

export type Layers = {
  detach(): void;
  /** Lift the tile at `index` (oldest first), or none. */
  point(index: number | null): void;
};

/**
 * N2, revision layers: one thin sheet tile per year of the changelog,
 * oldest at the bottom, each as thick as that year's revisions, stacked a
 * little askew like sheets on a plan chest. The newest is edged in
 * revision purple. Pointing at a year lifts its tile with a spring and
 * tints it water blue in 120ms; with motion off it only tints. The root
 * `Group` is the one inspectable object.
 */
export function attachLayers(
  host: HTMLElement,
  counts: readonly number[],
  options: OpenOptions & { aspect: number }
): Layers {
  const inks = glyphInks();
  const scene = new Scene();
  const root = new Group();
  root.rotation.y = 32 * DEG;
  scene.add(root);

  let y = 0;
  const tiles = counts.map((count, i) => {
    const t = Math.min(THICK, Math.max(THIN, count * PER_ENTRY));
    const geometry = new BoxGeometry(10, t, 7).translate(0, t / 2, 0);
    const fill = new MeshBasicMaterial({
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
    const newest = i === counts.length - 1;
    const tile = new Group();
    tile.add(new Mesh(geometry, fill));
    tile.add(
      new LineSegments(
        new EdgesGeometry(geometry),
        newest ? inks.lines.revision : inks.lines.ink
      )
    );
    // Each sheet lies a little off the one below.
    tile.position.set((i % 2 ? 0.35 : -0.35) * i * 0.5, y, 0);
    tile.rotation.y = (i % 2 ? 3 : -3) * DEG;
    const rest = y;
    y += t + GAP;
    root.add(tile);
    return { tile, fill, rest, lift: { x: 0, v: 0 }, mix: 0 };
  });
  const height = Math.max(1, y - GAP);

  const sheet = new Color();
  const water = new Color();
  let hot: number | null = null;

  const camera = glyphCamera(9.2, 30, height / 2 + LIFT / 2, options.aspect);

  const glyph: Glyph = {
    scene,
    camera,
    paint: () => {
      inks.paint();
      sheet.copy(inks.fills.sheet.color);
      water.copy(inks.fills.water.color);
    },
    step: (dt) => {
      const motion = motionOn();
      let moving = false;
      tiles.forEach((t, i) => {
        const on = hot === i;
        if (ease(t.lift, on ? LIFT : 0, dt, motion)) moving = true;
        const target = on ? 1 : 0;
        if (t.mix !== target) {
          const d = motion ? dt / 0.12 : 1;
          t.mix =
            target > t.mix
              ? Math.min(target, t.mix + d)
              : Math.max(target, t.mix - d);
          moving = true;
        }
        t.tile.position.y = t.rest + t.lift.x;
        t.fill.color.lerpColors(sheet, water, t.mix * 0.4);
      });
      return moving;
    },
  };

  const detach = glyphs.attach(host, glyph, options);
  return {
    detach() {
      detach();
      disposeGeometry(root);
      for (const t of tiles) t.fill.dispose();
    },
    point(index) {
      hot = index;
      glyphs.kick(glyph);
    },
  };
}
