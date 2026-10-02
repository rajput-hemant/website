import type { BenchOptions } from "@/flavors/surface/components/scene/bench";
import {
  createStage,
  finish,
  mount,
  spring,
  turned,
} from "@/flavors/surface/components/scene/workshop";
import type {
  Mounted,
  Part,
  Sprung,
} from "@/flavors/surface/components/scene/workshop";
import {
  CylinderGeometry,
  DoubleSide,
  InstancedMesh,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
} from "three";

/**
 * A thermal paper roll. `feed` pays out paper, in millimetres of the roll's
 * own scale, off its bottom and into a curl toward the reader; the roll
 * turns with it. Printing feeds 20mm, a hover 1mm, and tearing off winds
 * the curl back to nothing.
 */
export type Roll = Mounted & { feed: (mm: number) => void };

/** CSS px per millimetre at the roll's scale (a 40px roll is about 30mm wide). */
export const PX_PER_MM = 1.3;
const RADIUS = 9;
const CURL = 11;
const ROWS = 14;

let parts: { roll: CylinderGeometry; core: ReturnType<typeof turned> } | null =
  null;

function geometry() {
  if (parts) return parts;
  const roll = new CylinderGeometry(1, 1, 1, 32);
  roll.rotateZ(Math.PI / 2);
  const core = turned(
    [
      [0.001, 0.06],
      [0.38, 0.06],
      [0.42, 0],
    ],
    20
  );
  core.rotateY(Math.PI / 2);
  parts = { roll, core };
  return parts;
}

type RollPart = Part & { goal: number };

function createRoll(): RollPart {
  const stage = createStage();
  const { roll, core } = geometry();
  const paper = new MeshStandardMaterial({ side: DoubleSide });
  const chrome = new MeshStandardMaterial();
  const body = new Mesh(roll, paper);
  const cores = new InstancedMesh(core, chrome, 2);
  const curl = new Mesh(new PlaneGeometry(1, 1, 1, ROWS), paper);
  stage.root.add(body, cores, curl);
  stage.root.rotation.x = 0.35;
  const fed: Sprung = { x: 0, v: 0 };
  const o = new Object3D();
  const box = { length: 30, top: 8 };

  function shape() {
    const length = fed.x * PX_PER_MM;
    const pos = curl.geometry.attributes.position;
    if (!pos) return;
    // Rows run from where the paper leaves the roll (its bottom) to the free edge.
    for (let i = 0; i < pos.count; i++) {
      const row = Math.floor(i / 2);
      const s = (row / ROWS) * length;
      const a = s / CURL;
      pos.setXYZ(
        i,
        (i % 2 === 0 ? -0.5 : 0.5) * (box.length - 2),
        box.top - RADIUS - Math.sin(a) * CURL,
        (1 - Math.cos(a)) * CURL
      );
    }
    pos.needsUpdate = true;
    curl.geometry.computeVertexNormals();
    curl.geometry.computeBoundingSphere();
    curl.visible = length > 0.2;
  }

  const part: RollPart = {
    stage,
    goal: 0,
    paint() {
      finish(paper, "paper");
      finish(chrome, "chrome");
    },
    resize(w, h) {
      box.length = Math.max(w - 12, 10);
      box.top = h / 2 - RADIUS - 3;
      body.scale.set(box.length, RADIUS, RADIUS);
      body.position.set(0, box.top, 0);
      for (let i = 0; i < 2; i++) {
        o.position.set(((i === 0 ? -1 : 1) * box.length) / 2, box.top, 0);
        o.rotation.set(0, i === 0 ? Math.PI : 0, 0);
        o.scale.setScalar(RADIUS);
        o.updateMatrix();
        cores.setMatrixAt(i, o.matrix);
      }
      cores.instanceMatrix.needsUpdate = true;
      shape();
    },
    step(dt) {
      const moving = spring(fed, part.goal, dt);
      // The roll turns by the paper that left it.
      body.rotation.x = (fed.x * PX_PER_MM) / RADIUS;
      shape();
      return moving;
    },
  };
  return part;
}

let roll: RollPart | null = null;

/** The session's paper roll. */
export function attachRoll(host: HTMLElement, options: BenchOptions): Roll {
  const part = (roll ??= createRoll());
  const mounted = mount(host, part, options);
  return {
    ...mounted,
    feed(mm) {
      if (part.goal === mm) return;
      part.goal = mm;
      mounted.kick();
    },
  };
}
