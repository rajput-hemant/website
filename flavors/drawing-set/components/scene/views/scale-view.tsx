import { Group, Matrix4 } from "three";

import { kick } from "@/lib/scene/clock";

import { Linework } from "../linework";
import { compose, type ViewFrame, type ViewModel } from "./kit";
import { prism, prismVertex, tick } from "./parts";

const TAU = Math.PI * 2;
const STEP = TAU / 3;
/** Radians of turn per CSS px dragged. */
const PER_PX = (0.9 * Math.PI) / 180;
const MAX_TICKS = 420;

/** Per face: graduations per year (0: a plain 10px scale), and which are long. */
const FACES = [
  { perYear: 4, long: 4 },
  { perYear: 12, long: 6 },
  { perYear: 0, long: 5 },
] as const;

type Drag = { id: number; x: number; y: number; from: number; moved: boolean };

/**
 * Home H2: a triangular architect's scale along the hero dimension, its
 * ends on the dimension's arrows. Face one is graduated in the years the
 * dimension measures (quarters between), face two in months, face three a
 * plain 10px scale. A drag turns it about its long axis and it springs to
 * the nearest face; a click turns it one face. Reduced motion: it snaps.
 * One root group, so a later inspect control can take it over.
 */
export function createScale(): ViewModel {
  const group = new Group();
  const body = new Linework([prism("x")]);
  const ticks = new Linework([tick()], MAX_TICKS);
  group.add(body.group, ticks.group);
  const m = new Matrix4();
  const turned = new Matrix4();
  let turn = 0;
  let target = 0;
  let drag: Drag | null = null;

  function frame(f: ViewFrame) {
    if (!drag) turn = f.motion ? f.approach(turn, target, 9) : target;
    const from = Number(f.el.dataset.from) || 0;
    const to = Number(f.el.dataset.to) || from;
    const span = Math.max(1, to - from);
    const len = Math.max(1, f.width - 2);
    const r = Math.max(4, Math.min(15, f.height * 0.36));
    const side = r * Math.sqrt(3);
    compose(turned, [0, 0, 0], [turn, 0, 0]);
    compose(m, [0, 0, 0], [0, 0, 0], [len, r, r], turned);
    body.setMatrix(0, m);
    body.commit(1);

    let n = 0;
    const add = (face: number, x: number, long: boolean, hot: boolean) => {
      if (n >= MAX_TICKS) return;
      // Face k's reading edge (vertex k + 1) and the way across it (to vertex k).
      const [ay, az] = prismVertex(face + 1);
      const [by, bz] = prismVertex(face);
      const across = Math.atan2(bz - az, by - ay);
      // Lifted a hair off the face, so its fill never covers the line.
      const ny = (ay + by) / 2;
      const nz = (az + bz) / 2;
      compose(
        m,
        [x, ay * r + ny * 0.4, az * r + nz * 0.4],
        [across, 0, 0],
        [1, side * (long ? 0.5 : 0.26), 1],
        turned
      );
      ticks.setMatrix(n, m);
      ticks.setHot(n, hot ? 1 : 0);
      n++;
    };
    FACES.forEach((face, k) => {
      if (face.perYear === 0) {
        const count = Math.floor(len / 10);
        for (let i = 0; i <= count; i++) {
          add(k, -len / 2 + i * 10, i % face.long === 0, false);
        }
        return;
      }
      const count = span * face.perYear;
      for (let i = 0; i <= count; i++) {
        const year = i % face.perYear === 0;
        add(
          k,
          -len / 2 + (i / count) * len,
          year || i % face.long === 0,
          i === count
        );
      }
    });
    ticks.setCount(n);
    ticks.commit(1);
  }

  function bind(el: HTMLElement) {
    el.dataset.cursor = "Turn";
    const down = (e: PointerEvent) => {
      if (e.button !== 0 || drag) return;
      drag = {
        id: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        from: turn,
        moved: false,
      };
    };
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      // Touch turns on a sideways drag, so a vertical swipe still scrolls.
      const delta =
        e.pointerType === "touch" ? e.clientX - drag.x : e.clientY - drag.y;
      if (!drag.moved && Math.abs(delta) < 4) return;
      if (!drag.moved) el.setPointerCapture(e.pointerId);
      drag.moved = true;
      turn = drag.from + delta * PER_PX;
      kick();
    };
    const up = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      target = drag.moved
        ? Math.round(turn / STEP) * STEP
        : Math.round(target / STEP) * STEP + STEP;
      drag = null;
      kick();
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      delete el.dataset.cursor;
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      drag = null;
    };
  }

  return { group, aim: { az: 0, el: 0.42 }, frame, bind };
}
