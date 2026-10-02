import * as React from "react";
import { step } from "@/flavors/minimal/lib/scene/poses";
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
} from "../kit";

const MAX = 24;
/** The riffle's spring, per the audit's λ 10 (about a 220ms settle). */
const RIFFLE_LAMBDA = 10;
const SPREAD = (6 * Math.PI) / 180;

const m = new Matrix4();
const local = new Matrix4();

/** Rows the /projects filter leaves showing (it sets `hidden` on the rest). */
function visibleProjects() {
  return document.querySelectorAll("[data-project]:not([hidden])").length;
}

/**
 * P2: a fan of cards, one per project the filter leaves showing. A filter
 * change riffles cards in or out; hovering the filter bar spreads the fan
 * 6°. The count stays in the DOM beside it.
 */
export function Fan() {
  const { el } = useAnchor();
  const [ink] = React.useState(() => new Ink(unitBox, MAX));
  const pointer = usePointerOver(
    (glyph) => glyph.closest("[data-glyph-region]") ?? glyph.parentElement
  );
  const shown = React.useRef(
    Array.from({ length: MAX }, () => ({ v: 0, a: 0 }))
  );

  React.useEffect(() => {
    const groups = document.getElementById("project-groups");
    if (!groups) return;
    const observer = new MutationObserver(() => kick(2));
    observer.observe(groups, {
      attributes: true,
      subtree: true,
      attributeFilter: ["hidden"],
    });
    return () => observer.disconnect();
  }, [el]);

  useGlyphFrame((dt, glyph) => {
    const r = glyph.getBoundingClientRect();
    const { motion, tilt } = motionState();
    const count = Math.min(MAX, visibleProjects());
    const spread = pointer.current.inside && tilt ? 1 : 0;
    const w = r.height * 0.42;
    const h = r.height * 0.6;
    let moving = false;
    shown.current.forEach((card, i) => {
      moving =
        step(
          card,
          { v: i < count ? 1 : 0, a: spread },
          RIFFLE_LAMBDA,
          dt,
          motion
        ) || moving;
      if (card.v < 0.01) {
        ink.hide(i);
        return;
      }
      // Cards fan from a pivot at the bottom: at most about 70° in all.
      const step0 = Math.min(0.12, 1.2 / Math.max(1, count));
      const angle = (i - (count - 1) / 2) * (step0 + card.a * SPREAD * 0.2);
      place(m, { y: -r.height * 0.4, rx: -0.3, ry: 0.2, rz: -angle * card.v });
      m.multiply(
        place(local, {
          y: h / 2,
          z: i * 0.35,
          sx: w * card.v,
          sy: h * card.v,
          sz: 0.5,
        })
      );
      ink.set(i, m, { accent: i === count - 1 ? card.a : 0 });
    });
    ink.flush();
    return moving;
  });

  return <primitive object={ink.object} />;
}
