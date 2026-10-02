import * as React from "react";
import { HOVER_LAMBDA, step } from "@/flavors/minimal/lib/scene/poses";
import { Matrix4 } from "three";

import {
  Ink,
  motionState,
  place,
  unitBox,
  useGlyphFrame,
  usePointerOver,
} from "../kit";

const TILT = (8 * Math.PI) / 180;
const root = new Matrix4();
const m = new Matrix4();
const local = new Matrix4();

/**
 * S2: an opened letter beside a conversation's title: the envelope, its
 * flap already up (a static pose, no intro), and the letter drawn half out.
 * The pointer over the header tilts it up to 8°.
 */
export function Letter() {
  const [ink] = React.useState(() => new Ink(unitBox, 3));
  const pointer = usePointerOver((glyph) => glyph.closest("header"));
  const pose = React.useRef({ tx: 0, ty: 0, hot: 0 });

  useGlyphFrame((dt, glyph) => {
    const r = glyph.getBoundingClientRect();
    const { motion, tilt } = motionState();
    const p = pointer.current;
    const moving = step(
      pose.current,
      {
        tx: tilt && p.inside ? -p.y * TILT : 0,
        ty: tilt && p.inside ? p.x * TILT : 0,
        hot: p.inside ? 1 : 0,
      },
      HOVER_LAMBDA,
      dt,
      motion
    );
    const w = r.width * 0.72;
    const h = w * 0.62;
    place(root, {
      y: -r.height * 0.14,
      rx: -0.35 + pose.current.tx,
      ry: 0.35 + pose.current.ty,
    });
    const tone = { accent: pose.current.hot * 0.6 };
    // The letter, half out, behind the envelope's front.
    ink.set(
      0,
      m.multiplyMatrices(
        root,
        place(local, { y: h * 0.42, z: -0.6, sx: w * 0.86, sy: h, sz: 0.3 })
      ),
      tone
    );
    ink.set(
      1,
      m.multiplyMatrices(root, place(local, { sx: w, sy: h, sz: 0.8 })),
      tone
    );
    place(local, { y: h / 2, z: -0.8, rx: -0.25 });
    m.multiplyMatrices(root, local);
    m.multiply(
      place(local, { y: h * 0.28, sx: w * 0.98, sy: h * 0.56, sz: 0.3 })
    );
    ink.set(2, m, tone);
    ink.flush();
    return moving;
  });

  return <primitive object={ink.object} />;
}
