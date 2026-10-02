import * as React from "react";
import { HOVER_LAMBDA, step } from "@/flavors/minimal/lib/scene/poses";
import { BufferAttribute, BufferGeometry, Matrix4 } from "three";

import { Ink, motionState, place, useGlyphFrame, usePointerOver } from "../kit";

/** The folded flap in hinge space: hinge along x, the corner toward +y. */
const flap = new BufferGeometry()
  .setAttribute(
    "position",
    new BufferAttribute(new Float32Array([-0.5, 0, 0, 0.5, 0, 0, 0, 0.5, 0]), 3)
  )
  .setIndex([0, 1, 2]);

const FOLD = (40 * Math.PI) / 180;
const m = new Matrix4();

/**
 * F2: the content column's top-right corner, folded back. Hovering the
 * suggestions turns it down 0 to 40°; at rest it is nearly still.
 */
export function Dogear() {
  const [ink] = React.useState(() => new Ink(flap, 1));
  const pointer = usePointerOver(() =>
    document.querySelector('nav[aria-label="Suggested pages"]')
  );
  const pose = React.useRef({ fold: 0.25 });

  useGlyphFrame((dt, glyph) => {
    const r = glyph.getBoundingClientRect();
    const { motion } = motionState();
    const moving = step(
      pose.current,
      { fold: pointer.current.inside ? 1 : 0.25 },
      HOVER_LAMBDA,
      dt,
      motion
    );
    const s = Math.min(r.width, r.height) * 0.9;
    // The hinge runs from the left edge to the bottom edge of the box.
    place(m, {
      x: r.width / 2 - s / 2,
      y: r.height / 2 - s / 2,
      rz: -Math.PI / 4,
      rx: pose.current.fold * FOLD,
      sx: s * Math.SQRT2,
      sy: s * Math.SQRT2,
    });
    ink.set(0, m, { accent: pose.current.fold > 0.5 ? 0.5 : 0 });
    ink.flush();
    return moving;
  });

  return <primitive object={ink.object} />;
}
