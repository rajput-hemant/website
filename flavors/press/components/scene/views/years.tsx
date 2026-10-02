import { VIEW } from "@/flavors/press/lib/scene/views";
import { BoxGeometry, InstancedMesh, Object3D } from "three";

import { motionOn } from "@/lib/scene/clock";

import {
  createDamp,
  inkColour,
  onTheme,
  pageProgress,
  PressView,
  readData,
  whiteMaterial,
  type ViewWorld,
} from "./kit";

const FIT = {
  width: 1.9,
  height: 1.9,
  aim: [0, 0.55, 0],
  from: [0.2, 0.3, 1],
  fov: 24,
} as const;
/** The whole fan's spread, radians. */
const SPREAD = 1.1;

const dummy = new Object3D();

/**
 * One sheet per year of the log, pinned at a corner, fanning open as the
 * reading passes each year (the page's `[data-scene-section]`); scrolling
 * back never closes it. The current year is the yellow sheet. With motion
 * off it shows fully fanned.
 */
function createYears(el: HTMLElement | null): ViewWorld {
  const { years } = readData<typeof VIEW.years>(el, { years: 0 });
  const n = Math.max(1, years);
  const mesh = new InstancedMesh(
    new BoxGeometry(0.9, 1.2, 0.012).translate(0.45, 0.6, 0),
    whiteMaterial(0.95),
    n
  );
  mesh.count = years;
  const colours = () => {
    for (let i = 0; i < years; i++) {
      mesh.setColorAt(
        i,
        inkColour(i === 0 ? "yellow" : i % 2 ? "shade" : "sheet")
      );
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  };
  colours();
  const offTheme = onTheme(colours);
  const progress = pageProgress();
  const d = createDamp({ open: 0 });
  let read = 0;

  return {
    root: mesh,
    frame(delta) {
      read = Math.max(read, progress());
      d.to("open", motionOn() ? read : 1, 0.12, delta);
      for (let i = 0; i < years; i++) {
        // Year i opens once the reading is past its share of the log.
        const share = Math.min(1, Math.max(0, d.v.open * n - i));
        dummy.position.set(-0.45, 0, i * 0.02);
        dummy.rotation.set(0, 0, (share * SPREAD * (i + 1)) / n - 0.1);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
      d.end();
    },
    dispose: offTheme,
  };
}

export const Years = () => (
  <PressView id={VIEW.years} fit={FIT} create={createYears} />
);
