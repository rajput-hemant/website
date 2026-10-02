import { Group, Matrix4, Quaternion, Vector3 } from "three";

import { sceneStore } from "@/lib/scene/store";

import { Linework } from "../linework";
import {
  compose,
  measured,
  offsetIn,
  type ViewFrame,
  type ViewModel,
} from "./kit";
import { prism, prismVertex, tick } from "./parts";

const MAX_TICKS = 160;
/** Graduations per year on each face; a year's own tick is always long. */
const FACES = [4, 2, 1] as const;
const UP = new Vector3(0, 1, 0);

/** Each year link's centre, from the top of the view. */
function measureRows(el: HTMLElement): number[] {
  const nav = el.parentElement;
  if (!nav) return [];
  return [...nav.querySelectorAll("a")].map((a) => {
    const box = offsetIn(el, a);
    return box.y + box.height / 2;
  });
}

/**
 * Work W1: the year rail's sticky triangular scale, its long graduations
 * level with each year link and the current year's in redline. Scrolling
 * the roles turns it a third, bringing the finer faces round (quarters,
 * halves, whole years). Reduced motion: it stays on its first face.
 */
export function createYearScale(): ViewModel {
  const group = new Group();
  const body = new Linework([prism("y")]);
  const ticks = new Linework([tick()], MAX_TICKS);
  group.add(body.group, ticks.group);
  const m = new Matrix4();
  const turned = new Matrix4();
  const q = new Quaternion();
  const p = new Vector3();
  const s = new Vector3();
  const d = new Vector3();
  const rows = measured(measureRows);
  let angle = 0;

  function frame(f: ViewFrame) {
    const list = rows.read(f.el);
    const links = [...(f.el.parentElement?.querySelectorAll("a") ?? [])];
    const active = links.findIndex(
      (a) => a.getAttribute("aria-current") === "true"
    );
    const target = f.motion
      ? (sceneStore.getState().progress * Math.PI * 2) / 3
      : 0;
    angle = f.motion ? f.approach(angle, target, 6) : target;

    const r = Math.max(3, Math.min(8, f.width * 0.36));
    const side = r * Math.sqrt(3);
    compose(turned, [0, 0, 0], [0, angle, 0]);
    compose(m, [0, 0, 0], [0, 0, 0], [r, f.height - 2, r], turned);
    body.setMatrix(0, m);
    body.commit(1);

    let n = 0;
    const add = (face: number, at: number, long: boolean, hot: boolean) => {
      if (n >= MAX_TICKS) return;
      // The upright prism's vertex j sits at (x, z) = (sin, cos) of its angle.
      const [az, ax] = prismVertex(face + 1);
      const [bz, bx] = prismVertex(face);
      d.set(bx - ax, 0, bz - az).normalize();
      q.setFromUnitVectors(UP, d);
      m.compose(
        p.set(
          ax * r + (ax + bx) * 0.3,
          f.height / 2 - at,
          az * r + (az + bz) * 0.3
        ),
        q,
        s.set(1, side * (long ? 0.55 : 0.28), 1)
      );
      m.premultiply(turned);
      ticks.setMatrix(n, m);
      ticks.setHot(n, hot ? 1 : 0);
      n++;
    };
    FACES.forEach((per, k) => {
      list.forEach((y, i) => {
        add(k, y, true, i === active);
        const next = list[i + 1];
        if (next === undefined) return;
        for (let j = 1; j < per; j++) {
          add(k, y + ((next - y) * j) / per, false, false);
        }
      });
    });
    ticks.setCount(n);
    ticks.commit(1);
  }

  return {
    group,
    aim: { az: 0.5, el: 0.12 },
    frame,
    bind: (el) => rows.watch(el),
  };
}
