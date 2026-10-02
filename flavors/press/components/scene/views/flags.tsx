import { VIEW } from "@/flavors/press/lib/scene/views";
import { BoxGeometry, Group, InstancedMesh, Mesh, Object3D } from "three";

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
  visibleSize,
  whiteMaterial,
  type ViewWorld,
} from "./kit";

const FIT = {
  width: 0,
  height: 1,
  aim: [0, 0.35, 0],
  from: [0.2, 0.25, 1],
  fov: 22,
} as const;
const RAISE = 0.22;

const dummy = new Object3D();

/**
 * Correction flags in the feed's margin: a pin board with a flag per query
 * on the page, blue once answered and pink while waiting. Pointing at a
 * query raises its flag; with motion off it only darkens to ink.
 */
function createFlags(el: HTMLElement | null): ViewWorld {
  const { answered } = readData<typeof VIEW.flags>(el, { answered: [] });
  const n = Math.max(1, answered.length);
  const board = new Mesh(new BoxGeometry(1, 0.08, 0.3), inks().shade);
  const poles = new InstancedMesh(
    new BoxGeometry(0.02, 0.5, 0.02).translate(0, 0.25, 0),
    inks().inkSoft,
    n
  );
  const flags = new InstancedMesh(
    new BoxGeometry(0.16, 0.1, 0.01).translate(0.08, 0, 0),
    whiteMaterial(0.8),
    n
  );
  poles.count = answered.length;
  flags.count = answered.length;
  const root = new Group();
  root.add(board, poles, flags);
  let mark = -1;
  const colours = () => {
    answered.forEach((done, i) => {
      flags.setColorAt(
        i,
        inkColour(i === mark ? "ink" : done ? "blue" : "pink")
      );
    });
    if (flags.instanceColor) flags.instanceColor.needsUpdate = true;
  };
  colours();
  const offTheme = onTheme(colours);
  const up = createDamp(
    Object.fromEntries(answered.map((_, i) => [String(i), 0]))
  );
  return {
    root,
    frame(delta) {
      const { hovered, items } = sceneStore.getState();
      const queries = items.filter((it) => it.id.startsWith("query:"));
      const index =
        hoveredKey(hovered, "query") === null
          ? -1
          : queries.findIndex((it) => it.id === hovered);
      const live = motionOn();
      const { width } = visibleSize(el, FIT);
      const span = Math.min(width * 0.85, n * 0.3);
      board.scale.x = span + 0.2;
      answered.forEach((_, i) => {
        up.to(String(i), live && i === index ? RAISE : 0, 0.18, delta);
        const x = n > 1 ? -span / 2 + (i / (n - 1)) * span : 0;
        const raised = up.v[String(i)] ?? 0;
        dummy.position.set(x, 0.04 + raised, 0);
        dummy.updateMatrix();
        poles.setMatrixAt(i, dummy.matrix);
        dummy.position.set(x, 0.44 + raised, 0);
        dummy.updateMatrix();
        flags.setMatrixAt(i, dummy.matrix);
      });
      poles.instanceMatrix.needsUpdate = true;
      flags.instanceMatrix.needsUpdate = true;
      const next = live ? -1 : index;
      if (next !== mark) {
        mark = next;
        colours();
      }
      up.end();
    },
    dispose: offTheme,
  };
}

export const Flags = () => (
  <PressView id={VIEW.flags} fit={FIT} create={createFlags} />
);
