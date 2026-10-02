import * as React from "react";
import {
  HOVER_LAMBDA,
  step,
  TOGGLE_LAMBDA,
} from "@/flavors/minimal/lib/scene/poses";
import { Matrix4 } from "three";

import { sceneStore } from "@/lib/scene/store";

import {
  hovered,
  Ink,
  motionState,
  place,
  unitBox,
  useGlyphFrame,
} from "../kit";

const MAX = 12;
const FAN = (7 * Math.PI) / 180;

const m = new Matrix4();

/** The /work roles (`data-scene-item="role:<id>"`, weight = months), in order. */
function roles() {
  return sceneStore
    .getState()
    .items.filter((item) => item.id.startsWith("role:"))
    .slice(0, MAX);
}

/** Whether a role's story is open. */
function roleOpen(id: string) {
  const article = document.getElementById(id.slice("role:".length));
  return article?.querySelector("details")?.open ?? false;
}

/**
 * W1: a ream of sheets, one per role, each as thick as the role was long.
 * Hovering a role slides its sheet out; opening roles ("Expand all" opens
 * every one) fans the stack.
 */
export function Tenure() {
  const [ink] = React.useState(() => new Ink(unitBox, MAX));
  const poses = React.useRef(
    Array.from({ length: MAX }, () => ({ out: 0, accent: 0 }))
  );
  const fan = React.useRef({ v: 0 });

  useGlyphFrame((dt, glyph) => {
    const r = glyph.getBoundingClientRect();
    const { motion } = motionState();
    const list = roles();
    const total = list.reduce((sum, role) => sum + role.weight, 0) || 1;
    const height = r.height * 0.5;
    const width = r.width * 0.55;
    const over = hovered();
    const opened = list.filter((role) => roleOpen(role.id)).length;
    let moving = step(
      fan.current,
      { v: list.length ? opened / list.length : 0 },
      TOGGLE_LAMBDA,
      dt,
      motion
    );
    // Newest on top: the list is newest first, so stack from the bottom up.
    let y = -height / 2;
    for (let i = MAX - 1; i >= 0; i--) {
      const role = list[i];
      const pose = poses.current[i];
      if (!role || !pose) {
        ink.hide(i);
        continue;
      }
      const hot = over === role.id;
      moving =
        step(
          pose,
          { out: hot ? 1 : 0, accent: hot ? 1 : 0 },
          HOVER_LAMBDA,
          dt,
          motion
        ) || moving;
      const t = Math.max(1, (role.weight / total) * height);
      const spread = (i - (list.length - 1) / 2) * FAN * fan.current.v;
      place(m, {
        x: pose.out * width * 0.2,
        y: y + t / 2,
        rx: -0.55,
        ry: 0.5 + spread,
        sx: width,
        sy: t * 0.8,
        sz: width * 0.6,
      });
      ink.set(i, m, { accent: pose.accent });
      y += t;
    }
    ink.flush();
    return moving;
  });

  return <primitive object={ink.object} />;
}
