import { VIEW } from "@/flavors/press/lib/scene/views";
import { CylinderGeometry, Group, InstancedMesh, Object3D } from "three";

import { motionOn } from "@/lib/scene/clock";
import { sceneStore } from "@/lib/scene/store";

import {
  createDamp,
  hoveredKey,
  inkColour,
  inks,
  onTheme,
  PressView,
  readData,
  whiteMaterial,
  type ViewWorld,
} from "./kit";

const FIT = {
  width: 3.2,
  height: 1,
  aim: [0, 0.3, 0],
  from: [0.1, 0.8, 1],
  fov: 22,
} as const;
const R = 0.24;
const H = 0.32;

const dummy = new Object3D();

/**
 * Ink tins by "Inks on hand": one per skill group, its lid striped in the
 * plate most of the group prints on. Pointing at a group lifts its lid and
 * tips it back; with motion off the lid is marked in ink instead.
 */
function createTins(el: HTMLElement | null): ViewWorld {
  const { groups } = readData<typeof VIEW.tins>(el, { groups: [] });
  const n = Math.max(1, groups.length);
  const bodies = new InstancedMesh(
    new CylinderGeometry(R, R, H, 24).translate(0, H / 2, 0),
    inks().shade,
    n
  );
  const lids = new InstancedMesh(
    new CylinderGeometry(R + 0.015, R + 0.015, 0.06, 24),
    whiteMaterial(0.5),
    n
  );
  bodies.count = groups.length;
  lids.count = groups.length;
  const root = new Group();
  root.add(bodies, lids);
  let mark: string | null = null;
  const colours = () => {
    groups.forEach((g, i) => {
      lids.setColorAt(
        i,
        inkColour(g.id === mark ? "ink" : g.plate === "p1" ? "pink" : "blue")
      );
    });
    if (lids.instanceColor) lids.instanceColor.needsUpdate = true;
  };
  colours();
  const offTheme = onTheme(colours);
  const lift = createDamp(Object.fromEntries(groups.map((g) => [g.id, 0])));
  const step = Math.min(0.62, 3 / n);

  return {
    root,
    frame(delta) {
      const live = motionOn();
      const key = hoveredKey(sceneStore.getState().hovered, "skills");
      groups.forEach((g, i) => {
        lift.to(g.id, live && g.id === key ? 1 : 0, 0.18, delta);
        const x = (i - (groups.length - 1) / 2) * step;
        dummy.position.set(x, 0, 0);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        bodies.setMatrixAt(i, dummy.matrix);
        const up = lift.v[g.id] ?? 0;
        dummy.position.set(x, H + 0.03 + up * 0.08, -up * 0.05);
        dummy.rotation.set(-up * 0.5, 0, 0);
        dummy.updateMatrix();
        lids.setMatrixAt(i, dummy.matrix);
      });
      bodies.instanceMatrix.needsUpdate = true;
      lids.instanceMatrix.needsUpdate = true;
      const next = live ? null : key;
      if (next !== mark) {
        mark = next;
        colours();
      }
      lift.end();
    },
    dispose: offTheme,
  };
}

export const Tins = () => (
  <PressView id={VIEW.tins} fit={FIT} create={createTins} />
);
