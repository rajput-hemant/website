import { ITEM, VIEW } from "@/flavors/press/lib/scene/views";
import { BoxGeometry, Group, InstancedMesh, Mesh, Object3D } from "three";

import { motionOn } from "@/lib/scene/clock";
import { sceneStore } from "@/lib/scene/store";

import { createDamp, inks, PressView, type ViewWorld } from "./kit";

const FIT = {
  width: 2,
  height: 1,
  aim: [0, 0.2, 0],
  from: [0.3, 0.8, 1],
  fov: 22,
} as const;
/** Sheets the tray shows at most, and one sheet's thickness. */
const MAX = 8;
const SHEET = 0.035;

const dummy = new Object3D();

/**
 * A wire in-tray by the composer, holding one sheet per query of yours
 * awaiting approval. A newly filed one slides in from above. With motion
 * off it appears in place.
 */
function createTray(): ViewWorld {
  const m = inks();
  const root = new Group();
  const base = new Mesh(new BoxGeometry(1.5, 0.04, 1), m.inkSoft);
  // The tray's lip: a low back rail and two sides, as one wire frame.
  const lip = new InstancedMesh(new BoxGeometry(1, 1, 1), m.inkSoft, 3);
  [
    [0, 0.08, -0.5, 1.5, 0.16, 0.03],
    [-0.75, 0.08, 0, 0.03, 0.16, 1],
    [0.75, 0.08, 0, 0.03, 0.16, 1],
  ].forEach(([x, y, z, sx, sy, sz], i) => {
    dummy.position.set(x ?? 0, y ?? 0, z ?? 0);
    dummy.scale.set(sx ?? 1, sy ?? 1, sz ?? 1);
    dummy.updateMatrix();
    lip.setMatrixAt(i, dummy.matrix);
  });
  dummy.scale.set(1, 1, 1);
  const sheets = new InstancedMesh(
    new BoxGeometry(1.3, SHEET * 0.8, 0.86),
    m.sheet,
    MAX
  );
  sheets.count = 0;
  root.add(base, lip, sheets);
  const d = createDamp({ drop: 0 });
  let shown = 0;
  return {
    root,
    frame(delta) {
      const count = Math.min(
        MAX,
        sceneStore
          .getState()
          .items.filter((it) => it.id.startsWith(`${ITEM.pending}:`)).length
      );
      if (count > shown && motionOn()) d.v.drop = 1;
      shown = count;
      d.to("drop", 0, 0.12, delta);
      sheets.count = count;
      for (let i = 0; i < count; i++) {
        const top = i === count - 1;
        dummy.position.set(
          (i % 2) * 0.03,
          0.04 + (i + 0.5) * SHEET + (top ? d.v.drop * 0.9 : 0),
          top ? -d.v.drop * 0.3 : 0
        );
        dummy.rotation.set(0, (i % 3) * 0.02, 0);
        dummy.updateMatrix();
        sheets.setMatrixAt(i, dummy.matrix);
      }
      sheets.instanceMatrix.needsUpdate = true;
      d.end();
    },
  };
}

export const Tray = () => (
  <PressView id={VIEW.tray} fit={FIT} create={createTray} />
);
