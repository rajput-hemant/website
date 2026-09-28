import * as React from "react";
import { step, TOGGLE_LAMBDA } from "@/flavors/minimal/lib/scene/poses";
import { Matrix4 } from "three";

import {
  hingeBox,
  hovered,
  Ink,
  isOpen,
  motionState,
  place,
  useGlyphFrame,
} from "../kit";

const OPEN = (110 * Math.PI) / 180;

const root = new Matrix4();
const m = new Matrix4();
const local = new Matrix4();

/**
 * W3: a manila folder by a collapsed /work section. Opening the section
 * swings the front flap open to 110°.
 */
export function Folder() {
  const [ink] = React.useState(() => new Ink(hingeBox, 3));
  const pose = React.useRef({ open: 0, accent: 0 });

  useGlyphFrame((dt, glyph) => {
    const r = glyph.getBoundingClientRect();
    const { motion } = motionState();
    const open = isOpen(glyph);
    const hot = hovered() === `section:${glyph.dataset.glyphFor ?? ""}`;
    const moving = step(
      pose.current,
      { open: open ? 1 : 0, accent: hot || open ? 1 : 0 },
      TOGGLE_LAMBDA,
      dt,
      motion
    );
    const w = r.width * 0.86;
    const h = r.height * 0.62;
    place(root, { y: -h / 2, rx: -0.45, ry: 0.45 });
    const tone = { accent: pose.current.accent * 0.8 };
    // Back panel with its tab, then the front flap hinged at the bottom.
    ink.set(
      0,
      m.multiplyMatrices(root, place(local, { sx: w, sy: h, sz: 0.6 })),
      tone
    );
    ink.set(
      1,
      m.multiplyMatrices(
        root,
        place(local, {
          x: -w * 0.25,
          y: h,
          sx: w * 0.36,
          sy: h * 0.14,
          sz: 0.6,
        })
      ),
      tone
    );
    ink.set(
      2,
      m.multiplyMatrices(
        root,
        place(local, {
          z: 1.2,
          rx: pose.current.open * OPEN,
          sx: w,
          sy: h * 0.9,
          sz: 0.6,
        })
      ),
      tone
    );
    ink.flush();
    return moving;
  });

  return <primitive object={ink.object} />;
}
