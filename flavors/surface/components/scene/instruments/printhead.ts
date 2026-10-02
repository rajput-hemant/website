import type { BenchOptions } from "@/flavors/surface/components/scene/bench";
import {
  createStage,
  finish,
  mount,
  spring,
  still,
} from "@/flavors/surface/components/scene/workshop";
import type {
  Mounted,
  Part,
  Sprung,
} from "@/flavors/surface/components/scene/workshop";
import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

import { tokenColor } from "@/lib/scene/colors";

/**
 * A dot-matrix print head on two chrome rails. Its carriage shuttles to
 * `at` (0 to 1 along the rail) on the detent spring and, once it arrives,
 * strikes: a two-pixel dip and back.
 */
export type Printhead = Mounted & { go: (at: number) => void };

/** The carriage's width; the rail keeps half of it clear at each end. */
export const CARRIAGE = 30;
const STRIKE = 0.16;

let parts: {
  rod: CylinderGeometry;
  body: RoundedBoxGeometry;
  mark: BoxGeometry;
} | null = null;

function geometry() {
  if (parts) return parts;
  const rod = new CylinderGeometry(1, 1, 1, 12);
  // Along x.
  rod.rotateZ(Math.PI / 2);
  const mark = new BoxGeometry(2, 9, 1);
  mark.translate(0, -3, 7);
  parts = { rod, body: new RoundedBoxGeometry(CARRIAGE, 24, 12, 2, 3), mark };
  return parts;
}

/** Where the carriage centre sits for `at` on a slot `w` px wide. */
export function carriageX(at: number, w: number): number {
  return (Math.min(Math.max(at, 0), 1) - 0.5) * Math.max(w - CARRIAGE, 0);
}

type HeadPart = Part & { goal: number };

function createHead(at: number): HeadPart {
  const stage = createStage();
  const { rod, body, mark } = geometry();
  const chrome = new MeshStandardMaterial();
  const shell = new MeshStandardMaterial();
  const signal = new MeshBasicMaterial();
  const rails = new InstancedMesh(rod, chrome, 2);
  const carriage = new Group();
  carriage.add(new Mesh(body, shell), new Mesh(mark, signal));
  stage.root.add(rails, carriage);
  stage.root.rotation.x = 0.3;

  // Pixels along the rail, so the spring settles to a twentieth of one.
  const x: Sprung = { x: 0, v: 0 };
  let placed = false;
  let travelled = false;
  let strike = -1;
  const o = new Object3D();

  const part: HeadPart = {
    stage,
    goal: at,
    paint() {
      finish(chrome, "chrome");
      finish(shell, "bakelite");
      signal.color.set(tokenColor("--color-signal"));
    },
    resize(w) {
      for (let i = 0; i < 2; i++) {
        o.position.set(0, i === 0 ? 5 : -5, 0);
        o.scale.set(Math.max(w - 6, 1), 2, 2);
        o.updateMatrix();
        rails.setMatrixAt(i, o.matrix);
      }
      rails.instanceMatrix.needsUpdate = true;
      // A new width moves the stops, not the carriage's reading: no journey.
      x.x = carriageX(part.goal, w);
      x.v = 0;
      placed = true;
    },
    step(dt) {
      const goal = carriageX(part.goal, stage.size.w);
      if (!placed) {
        // The first pose is the reading, not a journey from the rail's centre.
        x.x = goal;
        placed = true;
      }
      const from = x.x;
      let moving = spring(x, goal, dt);
      if (Math.abs(x.x - from) > 0.01) travelled = true;
      if (!moving && travelled && !still()) {
        travelled = false;
        strike = 0;
      }
      let dip = 0;
      if (strike >= 0) {
        strike += dt;
        if (strike < STRIKE) {
          dip = 2 * Math.sin((Math.PI * strike) / STRIKE);
          moving = true;
        } else strike = -1;
      }
      carriage.position.set(x.x, -dip, 8 - dip);
      return moving;
    },
  };
  return part;
}

let head: HeadPart | null = null;

/** The session's print head. */
export function attachPrinthead(
  host: HTMLElement,
  options: BenchOptions,
  at: number
): Printhead {
  const part = (head ??= createHead(at));
  part.goal = at;
  const mounted = mount(host, part, options);
  return {
    ...mounted,
    go(next) {
      if (part.goal === next) return;
      part.goal = next;
      mounted.kick();
    },
  };
}
