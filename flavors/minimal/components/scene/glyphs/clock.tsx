import * as React from "react";
import { HOVER_LAMBDA, step } from "@/flavors/minimal/lib/scene/poses";
import { CylinderGeometry, Matrix4 } from "three";

import { kick } from "@/lib/scene/clock";

import {
  hingeBox,
  Ink,
  motionState,
  place,
  useAnchor,
  useGlyphFrame,
  usePointerOver,
} from "../kit";

const TILT = (10 * Math.PI) / 180;
const TAU = Math.PI * 2;
const disc = new CylinderGeometry(1, 1, 1, 28).rotateX(Math.PI / 2);

const formats = new Map<string, Intl.DateTimeFormat>();

/** The owner's wall clock as hour and minute hand angles, clockwise from 12. */
function handsAt(zone: string, now: number) {
  let format = formats.get(zone);
  if (!format) {
    format = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      hour: "numeric",
      minute: "numeric",
      hourCycle: "h23",
    });
    formats.set(zone, format);
  }
  const parts = format.formatToParts(now);
  const value = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);
  const minute = value("minute");
  const hour = (value("hour") % 12) + minute / 60;
  return { hour: (hour / 12) * TAU, minute: (minute / 60) * TAU };
}

/** Unwraps `angle` to the turn nearest `from`, so a hand never sweeps back. */
function nearest(from: number, angle: number) {
  return angle + Math.round((from - angle) / TAU) * TAU;
}

const m = new Matrix4();
const root = new Matrix4();
const local = new Matrix4();

/**
 * H2: a desk clock disc beside the local time, its hands at the owner's
 * time. It draws once a minute (one frame) and otherwise sleeps; the pointer
 * over the meta row tilts it up to 10° toward itself.
 */
export function Clock() {
  const { el } = useAnchor();
  const [face] = React.useState(() => new Ink(disc, 1));
  const [hands] = React.useState(() => new Ink(hingeBox, 2));
  const pointer = usePointerOver(
    (glyph) => glyph.parentElement?.parentElement ?? null
  );
  const pose = React.useRef({ tx: 0, ty: 0, hour: 0, minute: 0, hot: 0 });
  const zone = React.useRef("UTC");

  React.useEffect(() => {
    const glyph = el();
    zone.current = glyph?.dataset.glyphZone ?? "UTC";
    const now = handsAt(zone.current, Date.now());
    pose.current.hour = now.hour;
    pose.current.minute = now.minute;
    let timer = 0;
    const tick = () => {
      kick(2);
      timer = window.setTimeout(tick, 60_000 - (Date.now() % 60_000) + 50);
    };
    tick();
    return () => window.clearTimeout(timer);
  }, [el]);

  useGlyphFrame((dt, glyph) => {
    const r = glyph.getBoundingClientRect();
    const radius = Math.min(r.width, r.height) / 2 - 1;
    const { motion, tilt } = motionState();
    const p = pointer.current;
    const now = handsAt(zone.current, Date.now());
    const s = pose.current;
    const moving = step(
      s,
      {
        tx: tilt && p.inside ? -p.y * TILT : 0,
        ty: tilt && p.inside ? p.x * TILT : 0,
        hour: nearest(s.hour, now.hour),
        minute: nearest(s.minute, now.minute),
        hot: p.inside ? 1 : 0,
      },
      HOVER_LAMBDA,
      dt,
      motion
    );

    place(root, { rx: -0.3 + s.tx, ry: 0.25 + s.ty });
    face.set(
      0,
      m.multiplyMatrices(
        root,
        place(local, { sx: radius, sy: radius, sz: 1.6 })
      ),
      { accent: s.hot * 0.35 }
    );
    face.flush();
    const hand = (i: number, angle: number, length: number, width: number) => {
      hands.set(
        i,
        m.multiplyMatrices(
          root,
          place(local, {
            z: 1.2,
            rz: -angle,
            sx: width,
            sy: length,
            sz: 0.6,
          })
        ),
        { accent: i === 1 ? s.hot : 0 }
      );
    };
    hand(0, s.hour, radius * 0.5, 1.4);
    hand(1, s.minute, radius * 0.78, 1);
    hands.flush();
    return moving;
  });

  return (
    <>
      <primitive object={face.object} />
      <primitive object={hands.object} />
    </>
  );
}
