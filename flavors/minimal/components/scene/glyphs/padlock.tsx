import * as React from "react";
import { OWNER_EVENT } from "@/flavors/minimal/lib/scene/glyphs";
import { damp, spring } from "@/flavors/minimal/lib/scene/poses";
import { Matrix4, TorusGeometry } from "three";

import { kick } from "@/lib/scene/clock";

import {
  DESK_TILT,
  Ink,
  motionState,
  place,
  unitBox,
  useGlyphFrame,
} from "../kit";

/** The shackle: a half torus in the XY plane, legs pointing down. */
const shackle = new TorusGeometry(0.5, 0.09, 5, 12, Math.PI);

const root = new Matrix4();
const m = new Matrix4();
const local = new Matrix4();

/** Whether the owner is signed in, as the sign-in panel says so. */
const signedIn = () => document.querySelector("[data-owner-open]") !== null;

/**
 * O1: a padlock beside the sign-in form. A sign-in lifts and swings the
 * shackle open (lambda 10); a wrong passphrase shakes the lock plus or
 * minus 3px over three cycles in about 240ms.
 */
export function Padlock() {
  const [body] = React.useState(() => new Ink(unitBox, 1));
  const [bow] = React.useState(() => new Ink(shackle, 1, 40));
  const open = React.useRef(0);
  const shake = React.useRef({ x: 0, v: 0 });

  React.useEffect(() => {
    const on = (e: Event) => {
      const shaking = e instanceof CustomEvent && e.detail === "shake";
      if (shaking) shake.current.v += 235;
      kick(2);
    };
    window.addEventListener(OWNER_EVENT, on);
    return () => window.removeEventListener(OWNER_EVENT, on);
  }, []);

  useGlyphFrame((dt, glyph) => {
    const r = glyph.getBoundingClientRect();
    const { motion } = motionState();
    const target = signedIn() ? 1 : 0;
    open.current = damp(open.current, target, motion ? 10 : 30, dt);
    let moving = open.current !== target;
    moving = spring(shake.current, 6168, 31, dt) || moving;
    const w = r.width * 0.7;
    const h = w * 0.8;
    place(root, {
      x: shake.current.x,
      y: (h - w * 0.3) / 2,
      rx: DESK_TILT.x * 0.6,
      ry: DESK_TILT.y * 0.6,
    });
    const o = open.current;
    body.set(
      0,
      m.multiplyMatrices(
        root,
        place(local, { y: -h / 2, sx: w, sy: h, sz: w * 0.4 })
      ),
      { accent: o }
    );
    // The shackle lifts and swings about its left leg as it opens.
    place(local, {
      x: -w * 0.3 + w * 0.3 * Math.cos(o * 2.2),
      y: o * h * 0.22,
      z: w * 0.3 * Math.sin(o * 2.2),
      ry: -o * 2.2,
    });
    m.multiplyMatrices(root, local);
    m.multiply(place(local, { sx: w * 0.6, sy: w * 0.6, sz: w * 0.6 }));
    bow.set(0, m, { accent: o });
    body.flush();
    bow.flush();
    return moving;
  });

  return (
    <>
      <primitive object={body.object} />
      <primitive object={bow.object} />
    </>
  );
}
