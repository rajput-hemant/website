import * as React from "react";
import { HOVER_LAMBDA, step } from "@/flavors/minimal/lib/scene/poses";
import { IcosahedronGeometry, Matrix4 } from "three";

import { sceneStore } from "@/lib/scene/store";

import {
  anchorsOf,
  hovered,
  Ink,
  motionState,
  offsetIn,
  place,
  useAnchor,
  useGlyphFrame,
} from "../kit";

const MAX = 12;
const bead = new IcosahedronGeometry(1, 0);

const m = new Matrix4();

/**
 * W2: each timeline rail dot as an ink bead, drawn in a strip view over the
 * rail (the dots, its anchors, sit in the list beside it); the current role's is accent.
 * The beads roll with the scroll through the timeline, in step with the
 * rail's CSS fill, and a hovered role's bead swells toward the camera.
 */
export function Beads() {
  const { el } = useAnchor();
  const [count] = React.useState(() =>
    Math.min(MAX, anchorsOf(el()?.parentElement ?? document.body).length)
  );
  const [ink] = React.useState(() => new Ink(bead, count));
  const poses = React.useRef(
    Array.from({ length: count }, () => ({ lift: 0, roll: 0 }))
  );

  useGlyphFrame((dt, list) => {
    const frame = list.getBoundingClientRect();
    const { motion } = motionState();
    const over = hovered();
    const { progress } = sceneStore.getState();
    const anchors = anchorsOf(list.parentElement ?? list);
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
      const hot = over === `role:${anchor.dataset.glyphAnchor}`;
      moving =
        step(
          pose,
          { lift: hot ? 1 : 0, roll: progress * Math.PI * 4 },
          HOVER_LAMBDA,
          dt,
          motion
        ) || moving;
      const current = anchor.dataset.glyphCurrent !== undefined;
      const r = (at.width / 2) * (1 + pose.lift * 0.25);
      place(m, {
        x: at.x,
        y: at.y + pose.lift,
        rx: pose.roll,
        rz: pose.roll * 0.5,
        sx: r,
        sy: r,
        sz: r,
      });
      ink.set(i, m, {
        accent: current || hot ? 1 : 0,
        wash: current ? 1 : 0,
      });
    }
    ink.flush();
    return moving;
  });

  return <primitive object={ink.object} />;
}
