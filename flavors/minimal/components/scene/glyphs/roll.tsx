import * as React from "react";
import { step, TOGGLE_LAMBDA } from "@/flavors/minimal/lib/scene/poses";
import { CylinderGeometry, Matrix4 } from "three";

import {
  Ink,
  isOpen,
  motionState,
  place,
  unitBox,
  useGlyphFrame,
} from "../kit";

const cylinder = new CylinderGeometry(1, 1, 1, 18).rotateZ(Math.PI / 2);
const m = new Matrix4();

/**
 * C2: a small paper roll by a changelog year. Opening the year unrolls a
 * strip from it; closing rolls it back.
 */
export function Roll() {
  const [roll] = React.useState(() => new Ink(cylinder, 1));
  const [strip] = React.useState(() => new Ink(unitBox, 1));
  const pose = React.useRef({ open: 0 });

  useGlyphFrame((dt, glyph) => {
    const r = glyph.getBoundingClientRect();
    const { motion } = motionState();
    const moving = step(
      pose.current,
      { open: isOpen(glyph) ? 1 : 0 },
      TOGGLE_LAMBDA,
      dt,
      motion
    );
    const open = pose.current.open;
    const w = r.width * 0.7;
    const radius = r.height * (0.2 - open * 0.06);
    const top = r.height * 0.3;
    const length = open * r.height * 0.55;
    const tilt = { rx: -0.5, ry: 0.35 };
    place(m, { y: top, ...tilt, sx: w, sy: radius, sz: radius });
    roll.set(0, m, { accent: open * 0.7 });
    if (length > 0.5) {
      place(m, {
        y: top - length / 2,
        ...tilt,
        sx: w * 0.94,
        sy: length,
        sz: 0.4,
      });
      // Hinge the strip under the roll: place it, then pivot about its top.
      m.premultiply(new Matrix4().makeTranslation(0, 0, radius));
      strip.set(0, m, { accent: open * 0.4 });
    } else {
      strip.hide(0);
    }
    roll.flush();
    strip.flush();
    return moving;
  });

  return (
    <>
      <primitive object={roll.object} />
      <primitive object={strip.object} />
    </>
  );
}
