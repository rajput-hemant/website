import { CylinderGeometry, Mesh, MeshStandardMaterial } from "three";

import { motionOn } from "@/lib/scene/clock";
import { sceneStore, type SceneState } from "@/lib/scene/store";

import {
  all,
  bindHover,
  fitCamera,
  group,
  lights,
  spring0,
  standard,
  step,
  themed,
  type ViewObject,
} from "./kit";

/**
 * /work: the active line's roundel, an enamel disc that hangs under the
 * docked indicator beside the line guides. When the guide in view changes
 * it turns over to show the new line's colour on its other face; pointing
 * at it spins it once.
 */
export function createRoundel(host: HTMLElement): ViewObject {
  const root = group();
  lights(root);
  const rim = standard({ color: "#14191e", metalness: 0.5 });
  const faces = [
    new MeshStandardMaterial({ roughness: 0.35, metalness: 0.1 }),
    new MeshStandardMaterial({ roughness: 0.35, metalness: 0.1 }),
  ] as const;
  const geometry = new CylinderGeometry(1, 1, 0.22, 48);
  // Caps face the camera: the front cap is +z, the back cap -z.
  geometry.rotateX(Math.PI / 2);
  const coin = new Mesh(geometry, [rim, faces[0], faces[1]]);
  const pivot = group(coin);
  root.add(pivot);
  const view = fitCamera(24);

  let colours: string[] = [];
  let line: number | null = null;
  /** Half turns so far; even shows face 0, odd face 1. */
  let turns = 0;
  const turn = spring0();
  const spin = spring0();

  const colourOf = (n: number | null) =>
    n ? (colours[n - 1] ?? "#39424a") : "#39424a";
  const update = (state: SceneState) => {
    const item = state.items.find((i) => i.id === state.active);
    const next = item?.id.startsWith("role:") ? item.line : null;
    if (next === line) return;
    line = next;
    if (!motionOn()) {
      faces[turns % 2]?.color.set(colourOf(line));
      return;
    }
    turns++;
    faces[turns % 2]?.color.set(colourOf(line));
  };

  return {
    root,
    camera: view.camera,
    frame(_delta, width, height) {
      view.fit(width, height, [2.4, 2.4], [0, 0, 0], [0.25, 0.1, 1]);
      const turning = step(turn, turns * Math.PI, 0.07, 0.8);
      const spinning = step(spin, spin.x > 0 ? Math.PI * 2 : 0, 0.05, 0.86);
      if (!spinning && spin.x >= Math.PI * 2) spin.x = 0;
      pivot.rotation.y = turn.x + spin.x;
      return turning || spinning;
    },
    bind() {
      update(sceneStore.getState());
      return all(
        sceneStore.subscribe(update),
        bindHover(host, (inside) => {
          if (inside && spin.x === 0 && motionOn()) spin.x = 1e-3;
        }),
        themed((token) => {
          colours = Array.from({ length: 6 }, (_, i) =>
            token(`--color-line-${i + 1}`)
          );
          faces[turns % 2]?.color.set(colourOf(line));
        })
      );
    },
  };
}
