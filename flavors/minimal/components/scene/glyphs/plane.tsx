import * as React from "react";
import { BufferAttribute, BufferGeometry, Matrix4 } from "three";

import { kick, motionOn } from "@/lib/scene/clock";
import { onSceneEvent } from "@/lib/scene/store";

import { Ink, place, rectIn, useGlyphFrame } from "../kit";

/** One wing: a triangle from the nose along the keel, 14 by 5 px. */
const wing = new BufferGeometry()
  .setAttribute(
    "position",
    new BufferAttribute(new Float32Array([0, 0, 0, -14, 0, 0, -12, 5, 0]), 3)
  )
  .setIndex([0, 1, 2]);

/** Fold, then flight, in seconds (the audit's 180ms and 520ms). */
const FOLD = 0.18;
const FLIGHT = 0.52;
/** With motion off the sheet folds and fades where it is. */
const STILL = 0.3;
const FOLDED = (68 * Math.PI) / 180;

const m = new Matrix4();
const local = new Matrix4();

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * A1: a sent message leaves as a paper plane. On `ask:sent` a sheet at the
 * send button folds into a plane (two wings on the keel) and flies off to
 * the top right along a quadratic curve; the "sent" sound starts in the
 * same frame. At rest nothing is drawn.
 */
export function Plane() {
  const [ink] = React.useState(() => new Ink(wing, 2));
  const flight = React.useRef<{ t: number; from: DOMRect } | null>(null);
  const button = React.useRef<DOMRect | null>(null);

  React.useEffect(() => {
    // The send button of the form that just submitted.
    const submit = (e: Event) => {
      const form = e.target instanceof HTMLFormElement ? e.target : null;
      const send = form?.querySelector('button[type="submit"]');
      if (send) button.current = send.getBoundingClientRect();
    };
    document.addEventListener("submit", submit, true);
    const off = onSceneEvent((event) => {
      if (event.type !== "ask:sent" || !button.current) return;
      flight.current = { t: 0, from: button.current };
      kick(2);
    });
    return () => {
      document.removeEventListener("submit", submit, true);
      off();
    };
  }, []);

  useGlyphFrame((dt, region) => {
    const f = flight.current;
    if (!f) {
      ink.hide(0);
      ink.hide(1);
      ink.flush();
      return false;
    }
    f.t += dt;
    const frame = region.getBoundingClientRect();
    const start = rectIn(frame, f.from);
    const still = !motionOn();
    const fold = ease(Math.min(1, f.t / (still ? STILL : FOLD)));
    const fly = still
      ? 0
      : ease(Math.max(0, Math.min(1, (f.t - FOLD) / FLIGHT)));
    const end = { x: frame.width / 2 + 20, y: frame.height / 2 + 20 };
    const ctrl = { x: start.x + frame.width * 0.1, y: end.y };
    const u = 1 - fly;
    const x = u * u * start.x + 2 * u * fly * ctrl.x + fly * fly * end.x;
    const y = u * u * start.y + 2 * u * fly * ctrl.y + fly * fly * end.y;
    const heading =
      Math.atan2(end.y - start.y, end.x - start.x) * fly + 0.5 * (1 - fly);
    const fade = still ? 1 - fold : 1 - fly;
    for (const side of [0, 1]) {
      place(m, { x, y, rz: heading, rx: -0.6 });
      m.multiply(
        place(local, {
          rx: (side ? 1 : -1) * fold * FOLDED + (side ? 0 : Math.PI),
          sx: 1 - fly * 0.4,
          sy: 1 - fly * 0.4,
        })
      );
      ink.set(side, m, { accent: fold, alpha: 0.9 * fade });
    }
    ink.flush();
    // One more frame after the end clears the plane.
    if (f.t > (still ? STILL : FOLD + FLIGHT)) flight.current = null;
    return true;
  });

  return <primitive object={ink.object} />;
}
