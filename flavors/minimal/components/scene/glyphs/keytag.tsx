import * as React from "react";
import { HOVER_LAMBDA, spring, step } from "@/flavors/minimal/lib/scene/poses";
import { Matrix4 } from "three";

import { kick } from "@/lib/scene/clock";

import {
  Ink,
  motionState,
  place,
  unitBox,
  useAnchor,
  useGlyphFrame,
  usePointerOver,
  Wire,
} from "../kit";

const TILT = (10 * Math.PI) / 180;
const root = new Matrix4();
const m = new Matrix4();
const local = new Matrix4();

/**
 * O2: a paper tag on a string, right of the header. The pointer over the
 * header tilts it; it swings once when the passphrase field gains focus.
 */
export function Keytag() {
  const [tag] = React.useState(() => new Ink(unitBox, 1));
  const [string] = React.useState(() => new Wire(3));
  const pointer = usePointerOver((glyph) =>
    glyph.closest("[data-glyph-region]")
  );
  const pose = React.useRef({ tilt: 0, hot: 0 });
  const swing = React.useRef({ x: 0, v: 0 });
  const { el } = useAnchor();

  React.useEffect(() => {
    const focus = (e: FocusEvent) => {
      if (
        !(e.target instanceof HTMLInputElement) ||
        e.target.type !== "password"
      ) {
        return;
      }
      swing.current.v += motionState().motion ? 4 : 1.5;
      kick(2);
    };
    document.addEventListener("focusin", focus);
    return () => document.removeEventListener("focusin", focus);
  }, [el]);

  useGlyphFrame((dt, glyph) => {
    const r = glyph.getBoundingClientRect();
    const { motion, tilt } = motionState();
    const p = pointer.current;
    let moving = step(
      pose.current,
      { tilt: tilt && p.inside ? p.x * TILT : 0, hot: p.inside ? 1 : 0 },
      HOVER_LAMBDA,
      dt,
      motion
    );
    moving = spring(swing.current, 70, 3.2, dt) || moving;
    const w = r.width * 0.72;
    const h = w * 1.5;
    const top = r.height * 0.5 - 4;
    // The tag hangs from a pivot at the top of the string.
    place(root, {
      y: top - r.height * 0.18,
      rz: swing.current.x + pose.current.tilt,
      ry: 0.3,
    });
    tag.set(
      0,
      m.multiplyMatrices(
        root,
        place(local, { y: -h / 2 - r.height * 0.1, sx: w, sy: h, sz: 1 })
      ),
      {
        accent: pose.current.hot * 0.6,
      }
    );
    tag.flush();
    string.point(0, 0, top);
    string.point(1, 0, top - r.height * 0.12);
    string.point(
      2,
      Math.sin(swing.current.x) * r.height * 0.18,
      top - r.height * 0.28
    );
    string.flush({ alpha: 0.6 });
    return moving;
  });

  return (
    <>
      <primitive object={tag.object} />
      <primitive object={string.object} />
    </>
  );
}
