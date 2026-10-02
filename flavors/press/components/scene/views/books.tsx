import { ITEM, VIEW } from "@/flavors/press/lib/scene/views";
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
  whiteMaterial,
  type ViewWorld,
} from "./kit";

const FIT = {
  width: 2,
  height: 1.3,
  aim: [0, 0.45, 0],
  from: [0.35, 0.3, 1],
  fov: 22,
} as const;
const PULL = 0.1;

const dummy = new Object3D();

/**
 * Bound imprint volumes by Education: one book per entry on a shelf, spine
 * out. Pointing at an entry pulls its book out; with motion off its spine
 * is marked in ink instead.
 */
function createBooks(el: HTMLElement | null): ViewWorld {
  const { count } = readData<typeof VIEW.books>(el, { count: 0 });
  const n = Math.max(1, count);
  const books = new InstancedMesh(
    new BoxGeometry(0.2, 0.9, 0.62).translate(0, 0.45, 0),
    whiteMaterial(0.7),
    n
  );
  books.count = count;
  const shelf = new Mesh(new BoxGeometry(1.8, 0.05, 0.8), inks().inkSoft);
  shelf.position.y = -0.025;
  const root = new Group();
  root.add(books, shelf);
  let mark = -1;
  const colours = () => {
    for (let i = 0; i < count; i++) {
      books.setColorAt(
        i,
        inkColour(i === mark ? "ink" : i % 2 ? "blue" : "pink")
      );
    }
    if (books.instanceColor) books.instanceColor.needsUpdate = true;
  };
  colours();
  const offTheme = onTheme(colours);
  const pull = createDamp(
    Object.fromEntries(Array.from({ length: count }, (_, i) => [String(i), 0]))
  );

  return {
    root,
    frame(delta) {
      const live = motionOn();
      const key = hoveredKey(sceneStore.getState().hovered, ITEM.edu);
      for (let i = 0; i < count; i++) {
        pull.to(String(i), live && key === String(i) ? PULL : 0, 0.2, delta);
        dummy.position.set(
          (i - (count - 1) / 2) * 0.24,
          0,
          pull.v[String(i)] ?? 0
        );
        // The last volume leans on its neighbour, as a shelf never is full.
        dummy.rotation.set(0, 0, i === count - 1 && count > 1 ? -0.12 : 0);
        dummy.updateMatrix();
        books.setMatrixAt(i, dummy.matrix);
      }
      books.instanceMatrix.needsUpdate = true;
      const next = live || key === null ? -1 : Number(key);
      if (next !== mark) {
        mark = next;
        colours();
      }
      pull.end();
    },
    dispose: offTheme,
  };
}

export const Books = () => (
  <PressView id={VIEW.books} fit={FIT} create={createBooks} />
);
