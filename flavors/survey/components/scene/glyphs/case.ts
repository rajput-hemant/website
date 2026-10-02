import type { OpenOptions } from "@/flavors/survey/components/scene/use-glyph";
import { BoxGeometry, Group, Mesh, PlaneGeometry, Scene } from "three";

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

const W = 8;
const D = 5.4;
const BASE = 3;
const LID = 1.1;
/** How far the lid opens, and the latch lifts under the mouse, in degrees. */
const OPEN = 70;
const LATCH = 35;

export type MapCase = {
  detach(): void;
  /** Open the lid (signed in) or close it. */
  open(open: boolean): void;
  /** The mouse is over the case: the latch lifts. */
  hover(on: boolean): void;
};

/**
 * O1, the surveyor's map case beside the owner's sign-in: a closed case in
 * ink with a brass latch, which opens on its hinge when the owner signs in
 * and shows its revision-purple lining. Pointing at it lifts the latch.
 * Motion off: the lid is simply open or shut, and the latch stays. The root
 * `Group` is the one inspectable object.
 */
export function attachCase(
  host: HTMLElement,
  options: OpenOptions & { open: boolean }
): MapCase {
  const inks = glyphInks();
  const scene = new Scene();
  const root = new Group();
  root.rotation.y = -28 * DEG;
  scene.add(root);

  root.add(
    outlined(
      new BoxGeometry(W, BASE, D).translate(0, BASE / 2, 0),
      inks.fills.ink,
      inks.lines.sheet
    )
  );
  // The lining, seen once the lid is up.
  root.add(
    new Mesh(
      new PlaneGeometry(W - 0.6, D - 0.6)
        .rotateX(-Math.PI / 2)
        .translate(0, BASE + 0.01, 0),
      inks.fills.revision
    )
  );

  // The lid turns about its hinge along the back edge.
  const hinge = new Group();
  hinge.position.set(0, BASE, -D / 2);
  root.add(hinge);
  hinge.add(
    outlined(
      new BoxGeometry(W, LID, D).translate(0, LID / 2, D / 2),
      inks.fills.ink,
      inks.lines.sheet
    )
  );
  hinge.add(
    new Mesh(
      new PlaneGeometry(W - 0.6, D - 0.6)
        .rotateX(Math.PI / 2)
        .translate(0, -0.01, D / 2),
      inks.fills.revision
    )
  );
  hinge.add(
    outlined(
      new BoxGeometry(2.4, 0.5, 0.6).translate(0, LID + 0.25, D / 2),
      inks.fills.contour,
      inks.lines.ink
    )
  );

  // The latch hangs from the lid's front over the base, pivoting at its top.
  const latch = new Group();
  latch.position.set(0, LID, D);
  hinge.add(latch);
  latch.add(
    outlined(
      new BoxGeometry(1.1, 1.8, 0.3).translate(0, -0.9, 0.15),
      inks.fills.contour,
      inks.lines.ink
    )
  );

  const camera = glyphCamera(6.4, 26, 2.6);
  const lid = { x: options.open ? OPEN : 0, v: 0 };
  const lift = { x: 0, v: 0 };
  let open = options.open;
  let over = false;

  const glyph: Glyph = {
    scene,
    camera,
    paint: inks.paint,
    step: (dt) => {
      const motion = motionOn();
      let moving = ease(lid, open ? OPEN : 0, dt, motion);
      if (ease(lift, over && motion && !open ? LATCH : 0, dt, motion)) {
        moving = true;
      }
      hinge.rotation.x = -lid.x * DEG;
      latch.rotation.x = -lift.x * DEG;
      return moving;
    },
  };

  const detach = glyphs.attach(host, glyph, options);
  return {
    detach() {
      detach();
      disposeGeometry(root);
    },
    open(next) {
      open = next;
      glyphs.kick(glyph);
    },
    hover(on) {
      over = on;
      glyphs.kick(glyph);
    },
  };
}
