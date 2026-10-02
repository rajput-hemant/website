import * as React from "react";
import {
  padSheets,
  PEEL_WITHIN_DAYS,
} from "@/flavors/minimal/lib/scene/glyphs";
import { HOVER_LAMBDA, step } from "@/flavors/minimal/lib/scene/poses";
import { Matrix4 } from "three";

import { sceneStore } from "@/lib/scene/store";

import {
  Ink,
  motionState,
  place,
  unitBox,
  useAnchor,
  useGlyphFrame,
  usePointerOver,
} from "../kit";

const LIFT = (18 * Math.PI) / 180;
/** The peel: a 600ms damp from 0 to 1, once per visit. */
const PEEL_LAMBDA = 7;
const PEELED_KEY = "minimal.pad-peeled";
const SHEET = 0.9;
const DAY = 86_400_000;

const root = new Matrix4();
const m = new Matrix4();
const local = new Matrix4();

function peeledThisVisit() {
  try {
    return sessionStorage.getItem(PEELED_KEY) === "1";
  } catch {
    return true;
  }
}

function markPeeled() {
  try {
    sessionStorage.setItem(PEELED_KEY, "1");
  } catch {
    // Without storage the peel simply doesn't repeat until the next load.
  }
}

/**
 * N1: a desk-calendar tear-off pad beside "As of", as thick as the page is
 * fresh: blank sheets with a ruled header band, no digits. Hovering the meta
 * lifts the top sheet 18°. Once per visit, if the page changed this week,
 * one sheet peels away (not at T1 or with motion off, where the pad is
 * simply one sheet thinner).
 */
export function Pad() {
  const { el } = useAnchor();
  const pointer = usePointerOver(
    (glyph) => glyph.closest("[data-glyph-region]") ?? glyph.parentElement
  );
  const [setup] = React.useState(() => {
    const updated = Date.parse(el()?.dataset.glyphDate ?? "");
    const age = Number.isNaN(updated) ? Infinity : (Date.now() - updated) / DAY;
    const sheets = padSheets(age);
    const { motion } = motionState();
    const peel =
      age <= PEEL_WITHIN_DAYS &&
      motion &&
      sceneStore.getState().tier === 2 &&
      !peeledThisVisit();
    if (age <= PEEL_WITHIN_DAYS) markPeeled();
    return { sheets, peel };
  });
  // The sheets, the header band on the top one, and the sheet that peels.
  const [ink] = React.useState(() => new Ink(unitBox, setup.sheets + 2));
  const pose = React.useRef({ lift: 0, peel: 0, hot: 0 });

  useGlyphFrame((dt, glyph) => {
    const r = glyph.getBoundingClientRect();
    const { motion, tilt } = motionState();
    const p = pointer.current;
    const s = pose.current;
    let moving = step(
      s,
      { lift: p.inside && tilt ? 1 : 0, hot: p.inside ? 1 : 0, peel: s.peel },
      HOVER_LAMBDA,
      dt,
      motion
    );
    if (setup.peel) {
      moving = step(s, { ...s, peel: 1 }, PEEL_LAMBDA, dt, motion) || moving;
    }
    const w = r.width * 0.62;
    const h = r.height * 0.56;
    const stack = setup.sheets - (setup.peel ? 1 : 0);
    place(root, { y: -h * 0.05, rx: -0.55, ry: 0.4 });
    for (let i = 0; i < stack - 1; i++) {
      m.multiplyMatrices(
        root,
        place(local, { z: i * SHEET, sx: w, sy: h, sz: SHEET * 0.8 })
      );
      ink.set(i, m);
    }
    for (let i = Math.max(0, stack - 1); i < setup.sheets - 1; i++) ink.hide(i);
    // The top sheet hinges on its top edge, like the pad's binding.
    const top = (z: number, angle: number, index: number, alpha = 1) => {
      m.multiplyMatrices(
        root,
        place(local, { y: h / 2, z: z * SHEET, rx: angle })
      );
      ink.set(
        index,
        m
          .clone()
          .multiply(place(local, { y: -h / 2, sx: w, sy: h, sz: SHEET * 0.8 })),
        { accent: s.hot * 0.6, alpha: 0.55 * alpha + s.hot * 0.45 }
      );
      return m;
    };
    top(stack - 1, -s.lift * LIFT, setup.sheets - 1);
    // The ruled band across the top sheet's head.
    m.multiply(
      place(local, {
        y: -h * 0.16,
        z: SHEET * 0.5,
        sx: w,
        sy: h * 0.2,
        sz: 0.2,
      })
    );
    ink.set(setup.sheets, m, { wash: 0.35 });
    if (setup.peel && s.peel < 1) {
      top(stack, -s.peel * Math.PI * 0.9, setup.sheets + 1, 1 - s.peel);
    } else {
      ink.hide(setup.sheets + 1);
    }
    ink.flush();
    return moving;
  });

  return <primitive object={ink.object} />;
}
