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
const TILT = (16 * Math.PI) / 180;
const m = new Matrix4();

/** The year whose entries are under the header right now, if any. */
function yearInView(years: readonly string[]) {
  const line =
    parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) ||
    96;
  let current: string | null = null;
  for (const year of years) {
    const section = document.getElementById(year);
    if (section && section.getBoundingClientRect().top <= line + 1) {
      current = year;
    }
  }
  return current ?? years[0] ?? null;
}

/**
 * C1: the changelog's year rail as ledger spines, each as long as its year
 * has entries (the hairline bar is its poster). Hovering or focusing a year
 * pulls its spine out; the year being read leans forward.
 */
export function Spines() {
  const { el } = useAnchor();
  const [count] = React.useState(() =>
    Math.min(MAX, anchorsOf(el() ?? document.body).length)
  );
  const [ink] = React.useState(() => new Ink(unitBox, count));
  const poses = React.useRef(
    Array.from({ length: count }, () => ({ out: 0, lean: 0 }))
  );

  useGlyphFrame((dt, list) => {
    const frame = list.getBoundingClientRect();
    const { motion } = motionState();
    const over = hovered();
    const anchors = anchorsOf(list);
    const reading = yearInView(anchors.map((a) => a.dataset.glyphAnchor ?? ""));
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
      const year = anchor.dataset.glyphAnchor;
      const hot = over === `year:${year}`;
      moving =
        step(
          pose,
          { out: hot ? 1 : 0, lean: year === reading ? 1 : 0 },
          HOVER_LAMBDA,
          dt,
          motion
        ) || moving;
      // Spines lie on the rail's right edge, so pulling one out slides it left.
      place(m, {
        x: at.x - pose.out * at.width * 0.3,
        y: at.y,
        rx: -0.45 - pose.lean * TILT,
        ry: 0.25,
        sx: at.width,
        sy: 6,
        sz: 5,
      });
      ink.set(i, m, { accent: Math.max(pose.out, pose.lean * 0.6) });
    }
    ink.flush();
    return moving;
  });

  return <primitive object={ink.object} />;
}
