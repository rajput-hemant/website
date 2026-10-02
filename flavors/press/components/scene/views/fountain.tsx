import { VIEW } from "@/flavors/press/lib/scene/views";
import { BoxGeometry, CylinderGeometry, DoubleSide, Group, Mesh } from "three";

import { motionOn } from "@/lib/scene/clock";
import { sceneStore } from "@/lib/scene/store";

import {
  createDamp,
  hoveredKey,
  inks,
  onTheme,
  PressView,
  readData,
  type ViewWorld,
} from "./kit";

const FIT = {
  width: 2.2,
  height: 1.3,
  aim: [0, 0.35, 0],
  from: [0.35, 0.6, 1],
  fov: 24,
} as const;
/** The duct's depth, and how many items fill it. */
const DEPTH = 0.42;
const FULL = 6;

/**
 * The P3 ink fountain by "On press now": a duct of yellow filled one step
 * per current item, the ink knife resting across it. Pointing at an item
 * dips the knife into the ink. With motion off it rests.
 */
function createFountain(el: HTMLElement | null): ViewWorld {
  const { items } = readData<typeof VIEW.fountain>(el, { items: 0 });
  const m = inks();
  const root = new Group();
  // An open trough: the box without its top face, both sides drawn.
  const trough = new BoxGeometry(1.8, DEPTH, 0.7).translate(0, DEPTH / 2, 0);
  const top = trough.groups[2];
  const index = trough.index;
  if (top && index) {
    const kept = [...index.array].filter(
      (_, i) => i < top.start || i >= top.start + top.count
    );
    trough.setIndex(kept);
    trough.clearGroups();
  }
  const wall = m.shade.clone();
  wall.side = DoubleSide;
  const offTheme = onTheme(() => wall.color.copy(m.shade.color));
  const duct = new Mesh(trough, wall);
  const level = Math.max(0.08, Math.min(1, items / FULL)) * (DEPTH - 0.02);
  const ink = new Mesh(
    new BoxGeometry(1.76, level, 0.66).translate(0, level / 2 + 0.01, 0),
    m.yellow
  );
  const knife = new Group();
  const blade = new Mesh(
    new BoxGeometry(0.9, 0.02, 0.22).translate(0.45, 0, 0),
    m.inkSoft
  );
  const grip = new Mesh(
    new CylinderGeometry(0.06, 0.06, 0.5, 12)
      .rotateZ(Math.PI / 2)
      .translate(-0.25, 0, 0),
    m.ink
  );
  knife.add(blade, grip);
  knife.position.set(-0.35, DEPTH + 0.02, 0.08);
  root.add(duct, ink, knife);

  const d = createDamp({ dip: 0 });
  return {
    root,
    frame(delta) {
      const dipping =
        motionOn() && hoveredKey(sceneStore.getState().hovered, "now") !== null;
      d.to("dip", dipping ? 1 : 0, 0.16, delta);
      knife.rotation.z = -0.12 - d.v.dip * 0.32;
      knife.position.y = DEPTH + 0.02 - d.v.dip * 0.05;
      d.end();
    },
    dispose: offTheme,
  };
}

export const Fountain = () => (
  <PressView id={VIEW.fountain} fit={FIT} create={createFountain} />
);
