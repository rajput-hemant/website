import { VIEW } from "@/flavors/press/lib/scene/views";
import { BoxGeometry, Color, InstancedMesh, Object3D } from "three";

import { motionOn } from "@/lib/scene/clock";
import { sceneStore } from "@/lib/scene/store";

import {
  createDamp,
  hoveredKey,
  inkColour,
  onTheme,
  PressView,
  readData,
  visibleSize,
  whiteMaterial,
  type ViewWorld,
} from "./kit";

const FIT = { width: 0, height: 1.3, aim: [0, 0.45, 0], fov: 22 } as const;
/** A folded signature: thin, standing, the fold toward the viewer. */
const SIG_W = 0.16;
const SIG_H = 0.9;
const LIFT = 0.15;

const dummy = new Object3D();
const mixed = new Color();

/**
 * The signature stack in the header's facts: one folded signature per
 * project, gathered like a book block. Featured ones print solid (the two
 * plates overprinted), the rest in tint, as on the control strip. Pointing
 * at a project's card lifts its signature; with motion off it is marked in
 * ink instead.
 */
function createSignatures(el: HTMLElement | null): ViewWorld {
  const { sigs } = readData<typeof VIEW.signatures>(el, { sigs: [] });
  const mesh = new InstancedMesh(
    new BoxGeometry(SIG_W, SIG_H, 0.7).translate(0, SIG_H / 2, 0),
    whiteMaterial(0.9),
    Math.max(1, sigs.length)
  );
  mesh.count = sigs.length;
  const lift = createDamp(Object.fromEntries(sigs.map((s) => [s.id, 0])));
  let mark: string | null = null;
  const colours = () => {
    mixed.copy(inkColour("pink")).multiply(inkColour("blue"));
    sigs.forEach((sig, i) => {
      mesh.setColorAt(
        i,
        sig.id === mark
          ? inkColour("ink")
          : sig.solid
            ? mixed
            : inkColour("shade")
      );
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  };
  colours();
  const offTheme = onTheme(colours);

  return {
    root: mesh,
    frame(delta) {
      const key = hoveredKey(sceneStore.getState().hovered, "project");
      const live = motionOn();
      const { width } = visibleSize(el, FIT);
      const gap = (width * 0.9) / Math.max(1, sigs.length) - SIG_W;
      const step = SIG_W + Math.min(0.1, Math.max(0.01, gap));
      const x0 = -((sigs.length - 1) * step) / 2;
      sigs.forEach((sig, i) => {
        lift.to(sig.id, live && sig.id === key ? LIFT : 0, 0.18, delta);
        dummy.position.set(x0 + i * step, lift.v[sig.id] ?? 0, 0);
        dummy.rotation.set(0, -0.35, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
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

export const Signatures = () => (
  <PressView id={VIEW.signatures} fit={FIT} create={createSignatures} />
);
