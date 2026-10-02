import { VIEW } from "@/flavors/press/lib/scene/views";
import { BoxGeometry, Group, Mesh } from "three";

import { motionOn } from "@/lib/scene/clock";

import {
  createDamp,
  inks,
  pageProgress,
  PressView,
  type ViewWorld,
} from "./kit";

const FIT = {
  width: 2.3,
  height: 1.4,
  aim: [0, 0, 0],
  from: [0.2, 0.9, 1],
  fov: 22,
} as const;
/** One panel of the tri-fold: a third of an A4 sheet on its side. */
const PW = 0.7;
const PH = 1;

/**
 * The final print folded in three in the header. It unfolds flat as the
 * resume scrolls into view (the page's `[data-scene-section]`) and stays
 * flat. With motion off it lies flat.
 */
function createFold(): ViewWorld {
  const m = inks();
  const panel = new BoxGeometry(PW, 0.012, PH);
  const middle = new Mesh(panel, m.sheet);
  // The side panels hinge on the middle panel's edges.
  const left = new Group();
  left.position.x = -PW / 2;
  const leftPanel = new Mesh(panel, m.sheet);
  leftPanel.position.x = -PW / 2;
  left.add(leftPanel);
  const right = new Group();
  right.position.x = PW / 2;
  const rightPanel = new Mesh(panel, m.shade);
  rightPanel.position.x = PW / 2;
  right.add(rightPanel);
  const root = new Group();
  root.add(middle, left, right);
  const progress = pageProgress();
  const d = createDamp({ open: 0 });
  let read = 0;
  return {
    root,
    frame(delta) {
      read = Math.max(read, Math.min(1, progress() * 2.5));
      d.to("open", motionOn() ? read : 1, 0.12, delta);
      const closed = 1 - d.v.open;
      left.rotation.z = closed * 2.6;
      right.rotation.z = -closed * 2.9;
      right.position.y = closed * 0.02;
      d.end();
    },
  };
}

export const Fold = () => (
  <PressView id={VIEW.fold} fit={FIT} create={createFold} />
);
