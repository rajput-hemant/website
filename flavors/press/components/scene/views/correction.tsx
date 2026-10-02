import { VIEW } from "@/flavors/press/lib/scene/views";
import { BoxGeometry, Group, Mesh, type MeshStandardMaterial } from "three";

import { motionOn } from "@/lib/scene/clock";

import {
  createDamp,
  inks,
  PressView,
  readData,
  trackPointer,
  type ViewWorld,
} from "./kit";

const FIT = {
  width: 1.5,
  height: 1.3,
  aim: [0, 0, 0],
  from: [0.1, 0.15, 1],
  fov: 22,
} as const;

/**
 * One sheet with a query marked on it: a pink caret in the margin and the
 * line it points at. Once the author has answered, the sheet shows its
 * answered side, the correction struck through in blue. It leans with the
 * pointer; with motion off it is still.
 */
function createCorrection(el: HTMLElement | null): ViewWorld {
  const { answered } = readData<typeof VIEW.correction>(el, {
    answered: false,
  });
  const m = inks();
  const root = new Group();
  const sheet = new Mesh(new BoxGeometry(0.9, 1.15, 0.01), m.sheet);
  // Text lines, a caret (two strokes) and, answered, a blue line through.
  const bar = new BoxGeometry(1, 1, 1);
  const marks = new Group();
  const stroke = (
    x: number,
    y: number,
    w: number,
    rot: number,
    ink: MeshStandardMaterial
  ) => {
    const s = new Mesh(bar, ink);
    s.position.set(x, y, 0.012);
    s.scale.set(w, 0.028, 0.004);
    s.rotation.z = rot;
    marks.add(s);
  };
  for (let i = 0; i < 5; i++) stroke(0.02, 0.35 - i * 0.15, 0.6, 0, m.inkSoft);
  stroke(-0.36, 0.02, 0.12, 0.9, m.pink);
  stroke(-0.3, 0.02, 0.12, -0.9, m.pink);
  if (answered) stroke(0.02, 0.05, 0.66, 0, m.blue);
  root.add(sheet, marks);
  const pointer = trackPointer(el, 4);
  const d = createDamp({ yaw: 0, pitch: 0 });
  return {
    root,
    frame(delta) {
      const lean = motionOn() && pointer.p.inside;
      d.to("yaw", lean ? pointer.p.x * 0.25 : -0.12, 0.12, delta);
      d.to("pitch", lean ? -pointer.p.y * 0.12 : 0.05, 0.12, delta);
      root.rotation.set(d.v.pitch, d.v.yaw, answered ? -0.04 : 0.04);
      d.end();
    },
    dispose: pointer.dispose,
  };
}

export const Correction = () => (
  <PressView id={VIEW.correction} fit={FIT} create={createCorrection} />
);
