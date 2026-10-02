import * as React from "react";
import { spring } from "@/flavors/minimal/lib/scene/poses";
import { CatmullRomCurve3, Vector3 } from "three";

import { kick } from "@/lib/scene/clock";

import { motionState, useGlyphFrame, usePointerOver, Wire } from "../kit";

const POINTS = 40;

/** The clip's outline in a 10 by 26 box: two nested loops of wire. */
const path = new CatmullRomCurve3(
  [
    [-1.5, -10, 0],
    [-1.5, 8, 0],
    [0, 12, 0],
    [3, 12, 0],
    [4.5, 8, 0],
    [4.5, -6, 0],
    [3, -9.5, 0],
    [1.5, -9.5, 0],
    [0, -6, 0],
    [0, 4, 0],
  ].map(([x = 0, y = 0, z = 0]) => new Vector3(x, y, z))
);
const curve = path.getPoints(POINTS - 1);

/**
 * R2: a paper clip on the resume's top edge. Entering the header wiggles it
 * (plus or minus 4°, two damped cycles).
 */
export function Clip() {
  const [wire] = React.useState(() => new Wire(POINTS));
  const pointer = usePointerOver((glyph) => glyph.closest("header"));
  const swing = React.useRef({ x: 0, v: 0 });
  const was = React.useRef(false);

  useGlyphFrame((dt, glyph) => {
    const r = glyph.getBoundingClientRect();
    const { motion } = motionState();
    const inside = pointer.current.inside;
    if (inside && !was.current) swing.current.v += (motion ? 1 : 0.4) * 1.9;
    was.current = inside;
    const moving = spring(swing.current, 700, 11, dt);
    const scale = Math.min(r.width / 6, r.height / 24);
    // Plus or minus 4° at the impulse below: x is in radians.
    const a = swing.current.x;
    const c = Math.cos(a);
    const s = Math.sin(a);
    curve.forEach((p, i) => {
      // Pivot at the clip's lower end, where it grips the sheet.
      const px = p.x - 1.5;
      const py = p.y + 9;
      wire.point(i, (px * c - py * s) * scale, (px * s + py * c - 9) * scale);
    });
    wire.flush({ alpha: 0.75 });
    return moving;
  });

  React.useEffect(() => kick(2), []);
  return <primitive object={wire.object} />;
}
