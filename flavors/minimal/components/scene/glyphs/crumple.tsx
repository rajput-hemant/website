import * as React from "react";
import { damp } from "@/flavors/minimal/lib/scene/poses";

import { kick } from "@/lib/scene/clock";

import {
  DESK_TILT,
  motionState,
  Sheet,
  useAnchor,
  useGlyphFrame,
} from "../kit";

/** Drag distance that smooths the page fully flat, px. */
const FLAT_AT = 90;
const GRID = 20;

/** A cheap deterministic hash noise in -1..1, so the crumples never change. */
const noise = (x: number, y: number, seed: number) => {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return (n - Math.floor(n)) * 2 - 1;
};

/**
 * F1: a crumpled page beside "Nothing here.". Dragging smooths it flat by
 * the drag distance; letting go crumples it again on a spring. With motion
 * off it sits crumpled and still drags.
 */
export function Crumple() {
  const [paper] = React.useState(() => new Sheet(1, 1, GRID, GRID));
  const amount = React.useRef({ flat: 0, drag: 0, down: false });
  const { el } = useAnchor();

  React.useEffect(() => {
    const glyph = el();
    if (!glyph) return;
    let startY = 0;
    let startX = 0;
    const down = (e: PointerEvent) => {
      amount.current.down = true;
      startX = e.clientX;
      startY = e.clientY;
      glyph.setPointerCapture(e.pointerId);
      kick(2);
    };
    const move = (e: PointerEvent) => {
      if (!amount.current.down) return;
      amount.current.drag = Math.hypot(e.clientX - startX, e.clientY - startY);
      kick(2);
    };
    const up = () => {
      amount.current.down = false;
      kick(2);
    };
    glyph.addEventListener("pointerdown", down);
    glyph.addEventListener("pointermove", move);
    glyph.addEventListener("pointerup", up);
    glyph.addEventListener("pointercancel", up);
    return () => {
      glyph.removeEventListener("pointerdown", down);
      glyph.removeEventListener("pointermove", move);
      glyph.removeEventListener("pointerup", up);
      glyph.removeEventListener("pointercancel", up);
    };
  }, [el]);

  useGlyphFrame((dt, glyph) => {
    const r = glyph.getBoundingClientRect();
    const { motion } = motionState();
    const a = amount.current;
    const target = a.down ? Math.min(1, a.drag / FLAT_AT) : 0;
    // Smoothing out follows the hand closely; crumpling back is the spring.
    a.flat = damp(a.flat, target, a.down ? 20 : motion ? 7 : 21, dt);
    const crumple = 1 - a.flat;
    const size = Math.min(r.width, r.height) * 0.84;
    paper.deform((x, y, out) => {
      const u = x + 0.5;
      const v = y + 0.5;
      const edge = Math.min(u, 1 - u, v, 1 - v) * 2;
      const fold =
        noise(Math.round(u * 5), Math.round(v * 5), 1) * 0.5 +
        noise(u * 9, v * 9, 2) * 0.5;
      return out.set(
        (x * (1 - crumple * 0.3) + crumple * noise(u * 7, v * 7, 3) * 0.05) *
          size,
        (y * (1 - crumple * 0.3) + crumple * noise(u * 7, v * 7, 4) * 0.05) *
          size,
        crumple * fold * size * (0.18 + 0.12 * (1 - edge))
      );
    });
    paper.tone({ accent: a.down ? 0.5 : 0 });
    paper.object.rotation.set(DESK_TILT.x * 0.5, DESK_TILT.y * 0.5, 0);
    return a.flat !== target;
  });

  return <primitive object={paper.object} />;
}
