import { ITEM, VIEW } from "@/flavors/press/lib/scene/views";
import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  InstancedMesh,
  Mesh,
  Object3D,
} from "three";

import { kick, motionOn } from "@/lib/scene/clock";
import { sceneStore } from "@/lib/scene/store";

import {
  hoveredKey,
  inks,
  PressView,
  readData,
  visibleSize,
  type ViewWorld,
} from "./kit";

const FIT = {
  width: 0,
  height: 1.1,
  aim: [0, -0.2, 0],
  from: [0, 0.1, 1],
  fov: 20,
} as const;
/** The pendulum: stiffness, damping, and the push a pointed-at sheet gets. */
const K = 60;
const C = 4;
const PUSH = 1.6;

const dummy = new Object3D();

/**
 * A drying rack over the test sheets: a wire with one pegged sheet above
 * each card. Pointing at a card swings its sheet on a damped pendulum and
 * sways the others a little. With motion off they hang still.
 */
function createRack(el: HTMLElement | null): ViewWorld {
  const { tests } = readData<typeof VIEW.rack>(el, { tests: 0 });
  const n = Math.max(1, tests);
  const m = inks();
  const wire = new Mesh(
    new CylinderGeometry(0.008, 0.008, 1, 6).rotateZ(Math.PI / 2),
    m.ink
  );
  const sheets = new InstancedMesh(
    new BoxGeometry(0.34, 0.44, 0.005).translate(0, -0.26, 0),
    m.sheet,
    n
  );
  const pegs = new InstancedMesh(new BoxGeometry(0.04, 0.1, 0.03), m.pink, n);
  sheets.count = tests;
  pegs.count = tests;
  const root = new Group();
  root.add(wire, sheets, pegs);
  const angle = new Float32Array(n);
  const speed = new Float32Array(n);
  let pushed: string | null = null;

  return {
    root,
    frame(delta) {
      const live = motionOn();
      const key = hoveredKey(sceneStore.getState().hovered, ITEM.test);
      if (key !== pushed && key !== null && live) {
        for (let i = 0; i < tests; i++) {
          speed[i] = (speed[i] ?? 0) + (String(i) === key ? PUSH : PUSH * 0.15);
        }
      }
      pushed = key;
      const { width } = visibleSize(el, FIT);
      const box = el?.getBoundingClientRect();
      wire.scale.y = width;
      const cards = [
        ...document.querySelectorAll<HTMLElement>(
          `[data-scene-item^="${ITEM.test}:"]`
        ),
      ];
      let moving = false;
      for (let i = 0; i < tests; i++) {
        let a = angle[i] ?? 0;
        let v = speed[i] ?? 0;
        if (live) {
          v += (-K * a - C * v) * delta;
          a += v * delta;
        } else {
          a = 0;
          v = 0;
        }
        if (Math.abs(a) < 1e-4 && Math.abs(v) < 1e-3) {
          a = 0;
          v = 0;
        } else moving = true;
        angle[i] = a;
        speed[i] = v;
        // Each sheet hangs over its card's centre.
        const r = cards[i]?.getBoundingClientRect();
        const f =
          r && box
            ? (r.left + r.width / 2 - box.left) / Math.max(1, box.width)
            : (i + 0.5) / n;
        const x = (f - 0.5) * width;
        dummy.position.set(x, 0, 0);
        dummy.rotation.set(0, 0, a);
        dummy.updateMatrix();
        sheets.setMatrixAt(i, dummy.matrix);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        pegs.setMatrixAt(i, dummy.matrix);
      }
      sheets.instanceMatrix.needsUpdate = true;
      pegs.instanceMatrix.needsUpdate = true;
      if (moving) kick();
    },
  };
}

export const Rack = () => (
  <PressView id={VIEW.rack} fit={FIT} create={createRack} />
);
