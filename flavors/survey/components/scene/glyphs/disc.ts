import type { OpenOptions } from "@/flavors/survey/components/scene/use-glyph";
import {
  BufferGeometry,
  CylinderGeometry,
  Float32BufferAttribute,
  Group,
  LineSegments,
  Scene,
} from "three";

import type { Glyph } from "@/lib/scene/blit";

import { glyphs } from "./engine";
import {
  createTurntable,
  DEG,
  glyphCamera,
  glyphInks,
  outlined,
  turntableHandle,
  type Handle,
} from "./kit";

const R = 5;
const T = 0.9;

/** The benchmark's broad arrow under its bench line, cut in the face (x right, y up). */
const MARK = [
  [0, 1.1, 0, -2.9],
  [0, 1.1, -1.5, -1.6],
  [0, 1.1, 1.5, -1.6],
  [-2.3, 1.9, 2.3, 1.9],
];

let shared: { disc: BufferGeometry; mark: BufferGeometry } | null = null;

/** One disc and its mark for every benchmark on the page. */
function parts() {
  if (shared) return shared;
  const disc = new CylinderGeometry(R, R, T, 32, 1).rotateX(Math.PI / 2);
  const mark = new BufferGeometry();
  mark.setAttribute(
    "position",
    new Float32BufferAttribute(
      MARK.flatMap(([x1 = 0, y1 = 0, x2 = 0, y2 = 0]) => [
        x1,
        y1,
        T / 2 + 0.02,
        x2,
        y2,
        T / 2 + 0.02,
      ]),
      3
    )
  );
  shared = { disc, mark };
  return shared;
}

/**
 * A brass benchmark disc (K2 beside a notebook entry's number, E2 as the
 * entry page's mark): a disc in contour brass with the broad arrow cut in
 * its face, facing the reader. The mouse tilts it (up to `lean` degrees);
 * with `spin` a drag spins it about its upright, coasting with inertia when
 * motion is on. Motion off: flat, and it moves only under the drag. The
 * root `Group` is the one inspectable object.
 */
export function attachDisc(
  host: HTMLElement,
  options: OpenOptions & { lean: number; spin: boolean }
): Handle {
  const inks = glyphInks();
  const { disc, mark } = parts();
  const scene = new Scene();
  const tilt = new Group();
  const root = new Group();
  scene.add(tilt);
  tilt.add(root);
  root.add(outlined(disc, inks.fills.contour, inks.lines.ink, 20));
  root.add(new LineSegments(mark, inks.lines.ink));

  const camera = glyphCamera(R * 1.22, 0, 0);
  const table = createTurntable({
    rest: options.spin ? 18 : 0,
    friction: options.spin ? 0.92 : 0,
    lean: options.lean,
  });

  const glyph: Glyph = {
    scene,
    camera,
    paint: inks.paint,
    step: (dt) => {
      const moving = table.step(dt);
      root.rotation.y = table.yaw * DEG;
      // Leaning toward the pointer: its x swings the face round, its y nods it.
      tilt.rotation.set(table.tiltX * DEG, -table.tiltZ * DEG, 0);
      if (!moving) queueMicrotask(() => options.onRest?.());
      return moving;
    },
  };

  const detach = glyphs.attach(host, glyph, options);
  return turntableHandle(table, () => glyphs.kick(glyph), detach);
}
