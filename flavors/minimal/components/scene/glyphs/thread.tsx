import * as React from "react";
import { damp, spring } from "@/flavors/minimal/lib/scene/poses";

import { sceneStore } from "@/lib/scene/store";

import { hovered, motionState, useGlyphFrame, Wire } from "../kit";

const SEGMENTS = 24;
/** How far the slack thread sags at the top of the page, px. */
const SAG = 6;

/**
 * S1: the reply gutter's hairline as a real thread that sags when you
 * arrive and pulls taut as you read down the conversation. Hovering a reply
 * plucks it there, a damped wave of about 300ms.
 */
export function Thread() {
  const [wire] = React.useState(() => new Wire(SEGMENTS + 1));
  const state = React.useRef({ sag: SAG, pluckAt: 0, last: "" });
  const pluck = React.useRef({ x: 0, v: 0 });

  useGlyphFrame((dt, list) => {
    const frame = list.getBoundingClientRect();
    const { motion } = motionState();
    const items = [...list.children].filter((n) => n instanceof HTMLLIElement);
    const first = items[0]?.getBoundingClientRect();
    const last = items.at(-1)?.getBoundingClientRect();
    if (!first || !last) return false;
    const s = state.current;
    const target = SAG * (1 - sceneStore.getState().progress);
    const sag = damp(s.sag, target, motion ? 6 : 18, dt);
    let moving = sag !== target;
    s.sag = sag;

    const over = hovered();
    if (over?.startsWith("reply:") && over !== s.last) {
      const item = list.querySelector(
        `[data-scene-item="${CSS.escape(over)}"]`
      );
      if (item) {
        const r = item.getBoundingClientRect();
        s.pluckAt = r.top + 16;
        pluck.current.v += motion ? 60 : 20;
      }
    }
    s.last = over ?? "";
    moving = spring(pluck.current, 420, 14, dt) || moving;

    const gutter = innerWidth >= 640 ? 28 : 20;
    const x0 = first.left - gutter + 0.5 - (frame.left + frame.width / 2);
    const top = first.top;
    const bottom = last.top + 20;
    for (let i = 0; i <= SEGMENTS; i++) {
      const t = i / SEGMENTS;
      const yPage = top + (bottom - top) * t;
      const bump = Math.exp(-(((yPage - s.pluckAt) / 18) ** 2));
      const x = x0 + Math.sin(Math.PI * t) * s.sag + bump * pluck.current.x;
      const y = frame.top + frame.height / 2 - yPage;
      wire.point(i, x, y);
    }
    wire.flush({ alpha: 0.45 });
    return moving;
  });

  return <primitive object={wire.object} />;
}
