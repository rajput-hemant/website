import { VIEW } from "@/flavors/press/lib/scene/views";
import { BoxGeometry, CylinderGeometry, Group, Mesh } from "three";

import { motionOn } from "@/lib/scene/clock";
import { sceneStore } from "@/lib/scene/store";

import {
  createDamp,
  hoveredKey,
  inks,
  PressView,
  readData,
  visibleSize,
  type ViewWorld,
} from "./kit";

const FIT = {
  width: 0,
  height: 0.9,
  aim: [0, 0.3, 0],
  from: [0.35, 0.45, 1],
  fov: 20,
} as const;
const R = 0.2;

/**
 * A brayer on the press log's month axis. Pointing at a run rolls it to the
 * run's last month, laying an ink stripe from the run's first (yellow for
 * the run still on press). With motion off it is there at once, unrolled.
 */
function createRoller(el: HTMLElement | null): ViewWorld {
  const { runs } = readData<typeof VIEW.roller>(el, { runs: [] });
  const m = inks();
  const root = new Group();
  const brayer = new Group();
  const roll = new Mesh(
    new CylinderGeometry(R, R, 0.5, 24).rotateX(Math.PI / 2),
    m.pink
  );
  roll.position.y = R;
  // The handle: a frame up from the axle and back over the roll.
  const handle = new Mesh(new BoxGeometry(0.06, 0.52, 0.06), m.ink);
  handle.position.set(-0.2, R + 0.24, 0);
  handle.rotation.z = 0.75;
  brayer.add(roll, handle);
  const stripe = new Mesh(new BoxGeometry(1, 0.02, 0.36), m.pink);
  stripe.position.y = 0.01;
  root.add(brayer, stripe);

  const d = createDamp({ x: 0, to: 0 });
  let from = 0;
  let shown: string | null = null;
  let placed = false;
  return {
    root,
    frame(delta) {
      const key = hoveredKey(sceneStore.getState().hovered, "run");
      const run = runs.find((r) => r.id === key);
      const { width } = visibleSize(el, FIT);
      const at = (f: number) => (f - 0.5) * width;
      const rest = at(0) + R * 2;
      if (!placed) {
        d.v.x = rest;
        placed = true;
      }
      if (run && run.id !== shown) {
        // A new run starts its stripe at its first month.
        from = at(run.start);
        d.v.to = from;
        if (!motionOn()) d.v.x = at(run.start + run.length);
      }
      shown = run?.id ?? null;
      d.to("x", run ? at(run.start + run.length) : rest, 0.1, delta);
      d.to("to", run ? Math.max(from, d.v.x) : from, 0.5, delta);
      brayer.position.x = d.v.x;
      roll.rotation.z = -d.v.x / R;
      const length = d.v.to - from;
      stripe.visible = !!run && length > 0.01;
      stripe.scale.x = Math.max(0.001, length);
      stripe.position.x = from + length / 2;
      const ink = run?.current ? m.yellow : m.pink;
      stripe.material = ink;
      roll.material = ink;
      d.end();
    },
  };
}

export const Roller = () => (
  <PressView id={VIEW.roller} fit={FIT} create={createRoller} />
);
