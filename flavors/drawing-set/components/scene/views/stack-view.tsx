import { Group, Matrix4 } from "three";

import { kick, motionOn } from "@/lib/scene/clock";
import { applyPose, bindInspect, createInspect } from "@/lib/scene/inspect";
import { sceneStore } from "@/lib/scene/store";

import { Linework } from "../linework";
import { compose, type ViewFrame, type ViewModel } from "./kit";
import { unitBox } from "./parts";

const MAX = 12;
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Project J1, in View B: an exploded axonometric of the project's stack,
 * one slab per Stack schedule row (S-01 on top). The slabs part as the
 * view scrolls up the page, and hovering or focusing a schedule row
 * (`data-scene-item="stack:<i>"`) slides its slab out in redline.
 * Reduced motion: drawn exploded, and a row only redlines its slab.
 */
export function createStack(): ViewModel {
  const group = new Group();
  const slabs = new Linework([unitBox()], MAX);
  group.add(slabs.group);
  const m = new Matrix4();
  const out = new Float32Array(MAX);
  const hot = new Float32Array(MAX);
  let explode = 0;

  // Turning and zooming (`lib/scene/inspect.ts`): the eye orbits the stack all
  // the way round and tips; the group scales for the zoom.
  const rest = { az: Math.PI / 4, el: 0.52 };
  const aim = { ...rest };
  const inspect = createInspect({
    pitch: [-0.4, 0.6],
    zoom: [0.8, 2],
    reducedMotion: () => !motionOn(),
    onWake: () => kick(),
  });
  const eye = {
    rotation: {
      set(x: number, y: number) {
        aim.el = rest.el + x;
        aim.az = rest.az - y;
      },
    },
    scale: {
      setScalar(z: number) {
        group.scale.setScalar(z);
      },
    },
  };

  function frame(f: ViewFrame) {
    const turning = inspect.step(f.dt);
    applyPose(eye, inspect.pose);
    if (turning) kick();
    const n = Math.max(1, Math.min(MAX, Number(f.el.dataset.count) || 1));
    const r = f.el.getBoundingClientRect();
    const p = (innerHeight - r.top) / (innerHeight + r.height);
    const target = f.motion ? smooth(0.2, 0.6, p) : 1;
    explode = f.motion ? f.approach(explode, target, 6) : target;
    const { hovered, focused } = sceneStore.getState();
    const lit = hovered ?? focused;

    const w = f.width * 0.46;
    const d = f.width * 0.28;
    const t = Math.max(6, Math.min(12, f.height * 0.04));
    const footprint = (w + d) * 0.36;
    const room = Math.max(0, f.height * 0.8 - footprint);
    const gap = 2 + explode * Math.max(0, room / n - t - 2);
    const pitch = t + gap;
    const top = ((n - 1) * pitch) / 2;
    slabs.setCount(n);
    for (let i = 0; i < n; i++) {
      const on = lit === `stack:${i}`;
      out[i] = f.approach(out[i] ?? 0, on && f.motion ? 1 : 0, 10);
      hot[i] = f.approach(hot[i] ?? 0, on ? 1 : 0, 12);
      compose(
        m,
        [(out[i] ?? 0) * w * 0.28, top - i * pitch, 0],
        [0, 0, 0],
        [w, t, d]
      );
      slabs.setMatrix(i, m);
      slabs.setHot(i, hot[i] ?? 0);
    }
    slabs.commit(1);
  }

  return {
    group,
    aim,
    frame,
    bind: (el) => bindInspect(el, inspect),
  };
}
