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

const MAX = 12;
const OPEN = (140 * Math.PI) / 180;
const AJAR = (35 * Math.PI) / 180;

const root = new Matrix4();
const m = new Matrix4();
const local = new Matrix4();

/**
 * A2: an envelope by each conversation in the feed. Hovering a thread opens
 * its flap to 140°; a thread with replies rests with the flap ajar.
 */
export function Envelopes() {
  const { el } = useAnchor();
  const [count] = React.useState(() =>
    Math.min(MAX, anchorsOf(el() ?? document.body).length)
  );
  const [ink] = React.useState(() => new Ink(unitBox, count * 2));
  const poses = React.useRef(
    Array.from({ length: count }, () => ({ open: 0 }))
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
        ink.hide(i * 2);
        ink.hide(i * 2 + 1);
        continue;
      }
      const hot = over === `thread:${anchor.dataset.glyphAnchor}`;
      const ajar = anchor.dataset.glyphReplies !== undefined;
      moving =
        step(
          pose,
          { open: hot ? 1 : ajar ? AJAR / OPEN : 0 },
          HOVER_LAMBDA,
          dt,
          motion
        ) || moving;
      const w = at.width;
      const h = at.height * 0.7;
      place(root, { x: at.x, y: at.y - h * 0.1, rx: -0.4, ry: 0.35 });
      const tone = { accent: hot ? 1 : 0 };
      ink.set(
        i * 2,
        m.multiplyMatrices(root, place(local, { sx: w, sy: h, sz: 1 })),
        tone
      );
      // The flap hinges on the top edge, folded down over the front at rest.
      place(local, { y: h / 2, z: 0.8, rx: Math.PI - pose.open * OPEN });
      m.multiplyMatrices(root, local);
      m.multiply(
        place(local, { y: h * 0.3, sx: w * 0.98, sy: h * 0.6, sz: 0.4 })
      );
      ink.set(i * 2 + 1, m, tone);
    }
    ink.flush();
    return moving;
  });

  return <primitive object={ink.object} />;
}
