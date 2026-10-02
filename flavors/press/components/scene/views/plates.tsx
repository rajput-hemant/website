import { ITEM, VIEW } from "@/flavors/press/lib/scene/views";
import { BoxGeometry, Group, Mesh } from "three";

import { motionOn } from "@/lib/scene/clock";
import { sceneStore } from "@/lib/scene/store";

import {
  createDamp,
  hoveredKey,
  inks,
  pageProgress,
  PressView,
  type ViewWorld,
} from "./kit";

const FIT = {
  width: 2.4,
  height: 1.7,
  aim: [0, 0, 0],
  from: [0.9, 0.45, 1],
  fov: 24,
} as const;
/** How far apart the plates hang before the section is read. */
const SPACE = 0.55;
const PULL = 0.35;

/**
 * An exploded progressive proof beside the separations: P1, P2 and the
 * composite as three thin plates, apart until the section is read (the
 * page's `[data-scene-section]`), then in register. Pointing at a plate's
 * list pulls that plate forward. With motion off they sit in register.
 */
function createPlates(): ViewWorld {
  const m = inks();
  const plate = new BoxGeometry(1.6, 1.1, 0.03);
  const p1 = new Mesh(plate, m.pink);
  const p2 = new Mesh(plate, m.blue);
  const proof = new Mesh(plate, m.sheet);
  const root = new Group();
  root.add(proof, p2, p1);
  const progress = pageProgress();
  const d = createDamp({ space: SPACE, p1: 0, p2: 0 });
  return {
    root,
    frame(delta) {
      const live = motionOn();
      const key = hoveredKey(sceneStore.getState().hovered, ITEM.plate);
      // Read from a fifth of the way in, fully in register past two thirds.
      const read = Math.min(1, Math.max(0, (progress() - 0.2) / 0.45));
      d.to("space", live ? SPACE * (1 - read) : 0, 0.12, delta);
      d.to("p1", live && key === "p1" ? PULL : 0, 0.18, delta);
      d.to("p2", live && key === "p2" ? PULL : 0, 0.18, delta);
      p1.position.z = d.v.space + d.v.p1 + 0.035;
      p2.position.z = d.v.p2 + 0.0175;
      proof.position.z = -d.v.space;
      d.end();
    },
  };
}

export const Plates = () => (
  <PressView id={VIEW.plates} fit={FIT} create={createPlates} />
);
