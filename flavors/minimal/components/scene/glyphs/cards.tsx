import * as React from "react";
import {
  HOVER_LAMBDA,
  step,
  TOGGLE_LAMBDA,
} from "@/flavors/minimal/lib/scene/poses";
import { Matrix4 } from "three";

import {
  anchorsOf,
  hovered,
  Ink,
  isOpen,
  motionState,
  offsetIn,
  place,
  unitBox,
  useAnchor,
  useGlyphFrame,
} from "../kit";

/** Cards past this in one list keep their posters. */
const MAX_CARDS = 24;
const LIFT = (12 * Math.PI) / 180;
const UNFOLD = (165 * Math.PI) / 180;
/** Card thickness, px. */
const DEPTH = 0.8;

const root = new Matrix4();
const local = new Matrix4();
const out = new Matrix4();

/**
 * H1 and P1: a small folded index card on each project row, in one view over
 * the whole list (two draw calls for every card). Hovering or focusing a row
 * lifts its card 12° with an accent edge; opening the row unfolds its flap
 * to 165°. Archived projects draw faint, and while one row is hovered the
 * others dim with their text (project-list.module.css).
 */
export function Cards() {
  const { el } = useAnchor();
  const [count] = React.useState(() =>
    Math.min(MAX_CARDS, anchorsOf(el() ?? document.body).length)
  );
  const [ink] = React.useState(() => new Ink(unitBox, count * 2));
  const poses = React.useRef(
    Array.from({ length: count }, () => ({ lift: 0, unfold: 0, accent: 0 }))
  );

  useGlyphFrame((dt, list) => {
    const frame = list.getBoundingClientRect();
    const { motion, tilt } = motionState();
    const over = hovered();
    const anchors = anchorsOf(list);
    const dimming = anchors.some(
      (a) => `project:${a.dataset.glyphAnchor}` === over
    );
    let moving = false;
    for (let i = 0; i < count; i++) {
      const anchor = anchors[i];
      const pose = poses.current[i];
      if (!anchor || !pose) continue;
      const at = offsetIn(frame, anchor);
      if (!at.shown) {
        ink.hide(i * 2);
        ink.hide(i * 2 + 1);
        continue;
      }
      const hot = over === `project:${anchor.dataset.glyphAnchor}`;
      moving =
        step(
          pose,
          {
            lift: hot && tilt ? 1 : 0,
            accent: hot ? 1 : 0,
            unfold: pose.unfold,
          },
          HOVER_LAMBDA,
          dt,
          motion
        ) || moving;
      moving =
        step(
          pose,
          { ...pose, unfold: isOpen(anchor) ? 1 : 0 },
          TOGGLE_LAMBDA,
          dt,
          motion
        ) || moving;

      const w = at.width;
      const h = at.height;
      const faint = anchor.dataset.glyphFaint !== undefined;
      const alpha =
        (faint ? 0.3 : 0.55) * (dimming && !hot ? 0.5 : 1) + pose.accent * 0.45;
      place(root, {
        x: at.x,
        y: at.y - h * 0.1,
        rx: -0.35 - pose.lift * LIFT,
        ry: 0.35,
      });
      // The base panel, then the flap hinged on its top edge: folded down
      // over the front at rest, swung up and over as the row opens.
      ink.set(
        i * 2,
        out.multiplyMatrices(root, place(local, { sx: w, sy: h, sz: DEPTH })),
        { accent: pose.accent, alpha }
      );
      const hinge = Math.PI - pose.unfold * UNFOLD;
      place(local, { y: h / 2, z: DEPTH, rx: hinge });
      out.multiplyMatrices(root, local);
      out.multiply(
        place(local, { y: h / 2, sx: w, sy: h * 0.92, sz: DEPTH * 0.6 })
      );
      ink.set(i * 2 + 1, out, { accent: pose.accent, alpha });
    }
    ink.flush();
    return moving;
  });

  return <primitive object={ink.object} />;
}
