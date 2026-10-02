import * as React from "react";
import { HOVER_LAMBDA, step } from "@/flavors/minimal/lib/scene/poses";
import { Matrix4 } from "three";

import {
  DESK_TILT,
  hovered,
  Ink,
  motionState,
  Sheet as Paper,
  place,
  unitBox,
  useAnchor,
  useGlyphFrame,
} from "../kit";

const m = new Matrix4();
const RULES = 4;

/**
 * R1: an A4 sheet beside Print. Hovering the button curls the sheet's
 * bottom-right corner; pressing it flattens the sheet to 97%, in step with
 * the button's own `:active`. The click is still the DOM's `window.print()`.
 */
export function Sheet() {
  const [paper] = React.useState(() => new Paper(1, 1.414, 10, 14));
  const [rules] = React.useState(() => new Ink(unitBox, RULES));
  const pose = React.useRef({ curl: 0, press: 0, hot: 0 });
  const pressed = React.useRef(false);
  const { el } = useAnchor();

  React.useEffect(() => {
    const down = (e: Event) => {
      pressed.current =
        e.target instanceof Element &&
        e.target.closest('[data-scene-item="print"]') !== null;
    };
    const up = () => {
      pressed.current = false;
    };
    document.addEventListener("pointerdown", down, true);
    document.addEventListener("pointerup", up, true);
    document.addEventListener("pointercancel", up, true);
    return () => {
      document.removeEventListener("pointerdown", down, true);
      document.removeEventListener("pointerup", up, true);
      document.removeEventListener("pointercancel", up, true);
    };
  }, [el]);

  useGlyphFrame((dt, glyph) => {
    const r = glyph.getBoundingClientRect();
    const { motion, tilt } = motionState();
    const hot = hovered() === "print";
    const moving = step(
      pose.current,
      {
        curl: hot && tilt ? 1 : 0,
        press: hot && pressed.current ? 1 : 0,
        hot: hot ? 1 : 0,
      },
      HOVER_LAMBDA,
      dt,
      motion
    );
    const w = r.width * 0.78;
    const h = w * 1.414;
    const k = pose.current.curl * 0.35;
    paper.deform((x, y, out) => {
      const u = x + 0.5;
      const v = 0.5 - y / 1.414;
      const lift = Math.max(0, u + v - 0.85) ** 2;
      return out.set(
        (x - lift * k * 0.5) * w,
        (y + lift * k * 0.35) * w,
        lift * k * w * 1.1
      );
    });
    paper.tone({ accent: pose.current.hot * 0.6 });
    const s = 1 - pose.current.press * 0.03;
    paper.object.scale.setScalar(s);
    paper.object.rotation.set(DESK_TILT.x * 0.6, DESK_TILT.y * 0.6, 0);
    rules.object.scale.setScalar(s);
    rules.object.rotation.copy(paper.object.rotation);
    for (let i = 0; i < RULES; i++) {
      place(m, {
        x: -w * 0.04,
        y: h * (0.22 - i * 0.12),
        z: 0.4,
        sx: w * (i === 0 ? 0.5 : 0.68),
        sy: 0.8,
        sz: 0.2,
      });
      rules.set(i, m, { accent: pose.current.hot * 0.6, alpha: 0.4 });
    }
    rules.flush();
    return moving;
  });

  return (
    <>
      <primitive object={paper.object} />
      <primitive object={rules.object} />
    </>
  );
}
