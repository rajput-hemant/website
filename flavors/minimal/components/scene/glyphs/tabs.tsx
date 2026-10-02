import * as React from "react";
import { HOVER_LAMBDA, step } from "@/flavors/minimal/lib/scene/poses";
import { Matrix4 } from "three";

import {
  anchorsOf,
  hovered,
  Ink,
  motionState,
  offsetIn,
  place,
  unitBox,
  useAnchor,
  useGlyphFrame,
} from "../kit";

const MAX = 16;
const m = new Matrix4();

/**
 * N2: a paper index tab on the left edge of each "01…0n" numeral on /now.
 * The numeral is DOM and the tab sits beside it, in the margin; hovering a row lifts its tab with an accent edge.
 */
export function Tabs() {
  const { el } = useAnchor();
  const [count] = React.useState(() =>
    Math.min(MAX, anchorsOf(el() ?? document.body).length)
  );
  const [ink] = React.useState(() => new Ink(unitBox, count));
  const poses = React.useRef(
    Array.from({ length: count }, () => ({ lift: 0 }))
  );

  useGlyphFrame((dt, list) => {
    const frame = list.getBoundingClientRect();
    const { motion } = motionState();
    const over = hovered();
    const anchors = anchorsOf(list);
    let moving = false;
    for (let i = 0; i < count; i++) {
      const anchor = anchors[i];
      const pose = poses.current[i];
      if (!anchor || !pose) continue;
      const at = offsetIn(frame, anchor);
      if (!at.shown) {
        ink.hide(i);
        continue;
      }
      const hot = over === `now:${anchor.dataset.glyphAnchor}`;
      moving =
        step(pose, { lift: hot ? 1 : 0 }, HOVER_LAMBDA, dt, motion) || moving;
      place(m, {
        x: at.x + pose.lift * 1.5,
        y: at.y + pose.lift * 2,
        z: -4 + pose.lift * 3,
        rx: -0.25,
        ry: 0.3,
        sx: at.width,
        sy: at.height,
        sz: 1,
      });
      ink.set(i, m, { accent: pose.lift });
    }
    ink.flush();
    return moving;
  });

  return <primitive object={ink.object} />;
}
