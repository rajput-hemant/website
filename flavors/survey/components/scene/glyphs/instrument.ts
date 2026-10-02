import type { OpenOptions } from "@/flavors/survey/components/scene/use-glyph";
import { Group, Scene } from "three";

import type { Glyph } from "@/lib/scene/blit";

import { theodolite } from "../models";
import { glyphs } from "./engine";
import {
  createTurntable,
  DEG,
  disposeGeometry,
  ease,
  glyphCamera,
  glyphInks,
  motionOn,
  outlined,
  turntableHandle,
  type Handle,
} from "./kit";

/** Where the alidade rests: the telescope turned toward the reader's left. */
const REST = -35;

export type Instrument = Handle & {
  /** Swing the telescope to a bearing past rest and an elevation, in degrees. */
  sight(bearing: number, elevation: number): void;
};

/**
 * A2, the survey's instrument beside "What the survey used": the home
 * sheet's theodolite (one model, `theodolite()`), standing on its tripod.
 * A drag turns the alidade, coasting with inertia when motion is on;
 * pointing at a kit swings the telescope to that kit's bearing and nods it
 * to its elevation, both on springs. Motion off: bearings snap, and it
 * moves only under the drag. The root `Group` is the one inspectable
 * object.
 */
export function attachInstrument(
  host: HTMLElement,
  options: OpenOptions & { aspect: number }
): Instrument {
  const inks = glyphInks();
  const parts = theodolite();
  const scene = new Scene();
  const root = new Group();
  scene.add(root);
  root.add(outlined(parts.stand, inks.fills.sheet, inks.lines.ink, 30));
  const alidade = new Group();
  root.add(alidade);
  alidade.add(outlined(parts.alidade, inks.fills.contour, inks.lines.ink, 30));
  const scope = new Group();
  scope.position.y = parts.trunnion;
  alidade.add(scope);
  scope.add(outlined(parts.telescope, inks.fills.contour, inks.lines.ink, 30));

  const camera = glyphCamera(7.2, 16, 5.6, options.aspect);
  const table = createTurntable({ rest: REST, lean: 0 });
  const nod = { x: 0, v: 0 };
  let elevation = 0;

  const glyph: Glyph = {
    scene,
    camera,
    paint: inks.paint,
    step: (dt) => {
      let moving = table.step(dt);
      if (ease(nod, elevation, dt, motionOn())) moving = true;
      alidade.rotation.y = table.yaw * DEG;
      scope.rotation.z = nod.x * DEG;
      return moving;
    },
  };

  const detach = glyphs.attach(host, glyph, options);
  const handle = turntableHandle(
    table,
    () => glyphs.kick(glyph),
    () => {
      detach();
      disposeGeometry(root);
    }
  );
  return {
    ...handle,
    sight(bearing, next) {
      elevation = next;
      handle.aim(bearing);
    },
  };
}
