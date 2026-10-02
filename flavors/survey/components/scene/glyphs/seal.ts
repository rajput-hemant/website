import type { OpenOptions } from "@/flavors/survey/components/scene/use-glyph";
import {
  BufferGeometry,
  CylinderGeometry,
  EllipseCurve,
  Group,
  LatheGeometry,
  LineLoop,
  Scene,
  Vector2,
  Vector3,
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
  outlined,
} from "./kit";

/** How far the seal travels onto the sheet, in world units (3 at prop scale). */
const TRAVEL = 1.1;

export type Seal = {
  detach(): void;
  /** Press it onto the sheet, or let it spring back up. */
  press(down: boolean): void;
};

/**
 * R2, the surveyor's seal beside Print: a turned wooden handle over a brass
 * die, above the ring it leaves on the sheet. Pressing the button presses
 * it down (a spring, in the same frame as the confirm ping) and letting go
 * springs it back. Motion off: it stays up. The root `Group` is the one
 * inspectable object.
 */
export function attachSeal(host: HTMLElement, options: OpenOptions): Seal {
  const inks = glyphInks();
  const scene = new Scene();
  const root = new Group();
  root.rotation.y = 20 * DEG;
  scene.add(root);

  const handle = new LatheGeometry(
    [
      [0, 1.2],
      [0.7, 1.2],
      [0.5, 2],
      [0.55, 3.8],
      [1.25, 4.8],
      [1.2, 5.7],
      [0.6, 6.2],
      [0, 6.3],
    ].map(([x = 0, y = 0]) => new Vector2(x, y)),
    12
  );
  const die = new CylinderGeometry(2, 2, 1.2, 20, 1).translate(0, 0.6, 0);
  const seal = new Group();
  seal.add(outlined(handle, inks.fills.sheet, inks.lines.ink, 30));
  seal.add(outlined(die, inks.fills.contour, inks.lines.ink, 20));
  seal.position.y = TRAVEL;
  root.add(seal);

  // The ring it presses: the die's outline on the sheet.
  const ring = new BufferGeometry().setFromPoints(
    new EllipseCurve(0, 0, 2.3, 2.3)
      .getPoints(28)
      .map((p) => new Vector3(p.x, 0, p.y))
  );
  root.add(new LineLoop(ring, inks.lines.faint));

  const camera = glyphCamera(4.6, 24, 3.4);
  const drop = { x: 0, v: 0 };
  let down = false;

  const glyph: Glyph = {
    scene,
    camera,
    paint: inks.paint,
    step: (dt) => {
      const target = down && motionOn() ? TRAVEL : 0;
      const moving = ease(drop, target, dt, motionOn());
      seal.position.y = TRAVEL - drop.x;
      return moving;
    },
  };

  const detach = glyphs.attach(host, glyph, options);
  return {
    detach() {
      detach();
      disposeGeometry(root);
    },
    press(next) {
      down = next;
      glyphs.kick(glyph);
    },
  };
}
