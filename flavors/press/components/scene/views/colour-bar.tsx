import { VIEW } from "@/flavors/press/lib/scene/views";
import { BoxGeometry, InstancedMesh, Object3D } from "three";

import { motionOn } from "@/lib/scene/clock";

import {
  createDamp,
  inkColour,
  onTheme,
  PressView,
  trackPointer,
  whiteMaterial,
  type Ink,
  type ViewWorld,
} from "./kit";

const FIT = {
  width: 2.4,
  height: 0.7,
  aim: [0, 0.15, 0],
  from: [0.1, 0.9, 1],
  fov: 20,
} as const;
/** The four process patches, and how far a patch rises under the sweep. */
const PATCHES: readonly Ink[] = ["yellow", "pink", "blue", "ink"];
const RISE = 0.35;

const dummy = new Object3D();

/**
 * The colour bar under the header's facts: the four patches as thin
 * blocks. Moving the pointer along the header sweeps them like a
 * densitometer, the patch under it standing tallest. With motion off they
 * lie flat.
 */
function createColourBar(el: HTMLElement | null): ViewWorld {
  const mesh = new InstancedMesh(
    new BoxGeometry(0.5, 1, 0.4).translate(0, 0.5, 0),
    whiteMaterial(0.6),
    PATCHES.length
  );
  const colours = () => {
    PATCHES.forEach((ink, i) => mesh.setColorAt(i, inkColour(ink)));
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  };
  colours();
  const offTheme = onTheme(colours);
  const pointer = trackPointer(el, 2.5);
  const d = createDamp(Object.fromEntries(PATCHES.map((p) => [p, 0])));
  return {
    root: mesh,
    frame(delta) {
      const live = motionOn();
      PATCHES.forEach((ink, i) => {
        const x = (i - (PATCHES.length - 1) / 2) * 0.56;
        const at = (pointer.p.x * PATCHES.length * 0.56) / 2;
        const near = Math.exp(-((x - at) ** 2) / 0.12);
        d.to(ink, live && pointer.p.inside ? near : 0, 0.14, delta);
        dummy.position.set(x, 0, 0);
        dummy.scale.set(1, 0.06 + (d.v[ink] ?? 0) * RISE, 1);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      d.end();
    },
    dispose() {
      offTheme();
      pointer.dispose();
    },
  };
}

export const ColourBar = () => (
  <PressView id={VIEW.colourBar} fit={FIT} create={createColourBar} />
);
