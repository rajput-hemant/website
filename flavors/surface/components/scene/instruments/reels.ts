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
  ExtrudeGeometry,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  Path,
  Quaternion,
  Shape,
  Vector3,
} from "three";

/**
 * Two tape reels: windowed aluminium flanges over the tape packs, with the
 * tape running between them. `wound` (0 to 1) is how much tape is on the
 * take-up reel on the right; the packs keep their area as it moves, and both
 * reels turn by the tape that passed, so a long jump spins them.
 */
export type Reels = Mounted & {
  /** Wind to `wound`, 0 to 1. */
  wind: (wound: number) => void;
};

const R_MIN = 0.34;
const R_MAX = 0.9;
/** Radians a reel of radius 1 turns per whole tape. */
const SPIN = 26;

let shapes: {
  flange: ExtrudeGeometry;
  hub: ReturnType<typeof turned>;
  tape: CylinderGeometry;
} | null = null;

function geometry() {
  if (shapes) return shapes;
  const disc = new Shape();
  disc.absarc(0, 0, 1, 0, Math.PI * 2, false);
  // Three windows between the spokes, like an NAB reel.
  for (let k = 0; k < 3; k++) {
    const a = (k * 2 * Math.PI) / 3 + 0.35;
    const b = a + 1.4;
    const hole = new Path();
    hole.absarc(0, 0, 0.84, a, b, false);
    hole.absarc(0, 0, 0.3, b, a, true);
    disc.holes.push(hole);
  }
  const flange = new ExtrudeGeometry(disc, {
    depth: 0.06,
    bevelEnabled: false,
    curveSegments: 20,
  });
  const tape = new CylinderGeometry(1, 1, 1, 40);
  tape.rotateX(Math.PI / 2);
  shapes = {
    flange,
    hub: turned(
      [
        [0.08, 0.2],
        [0.2, 0.2],
        [0.26, 0.14],
        [0.28, 0],
      ],
      16
    ),
    tape,
  };
  return shapes;
}

type ReelsPart = Part & { goal: number };

/** Radius of each pack for `wound` of the tape on the take-up reel. */
export function packs(wound: number): [number, number] {
  const f = Math.min(Math.max(wound, 0), 1);
  const area = R_MAX * R_MAX - R_MIN * R_MIN;
  return [
    Math.sqrt(R_MIN * R_MIN + (1 - f) * area),
    Math.sqrt(R_MIN * R_MIN + f * area),
  ];
}

function createReels(wound: number): ReelsPart {
  const stage = createStage();
  const { flange, hub, tape } = geometry();
  const metal = new MeshStandardMaterial();
  const hubs = new MeshStandardMaterial();
  const brown = new MeshStandardMaterial({ roughness: 0.55, metalness: 0 });
  const flanges = new InstancedMesh(flange, metal, 2);
  const nuts = new InstancedMesh(hub, hubs, 2);
  const tapes = new InstancedMesh(tape, brown, 3);
  stage.root.add(tapes, flanges, nuts);
  // Seen a little from below the faceplate's top edge, so the flanges read as discs.
  stage.root.rotation.x = 0.28;

  // Percent of tape wound, so the spring settles to a tenth of a percent.
  const f: Sprung = { x: wound * 100, v: 0 };
  const turn = [0, 0];
  let last = f.x;
  const o = new Object3D();
  const layout = { r: 1, d: 0 };

  const part: ReelsPart = {
    stage,
    goal: wound,
    paint() {
      finish(metal, "aluminium");
      finish(hubs, "bakelite");
      brown.color.set(0x3b2a1f);
    },
    resize(w, h) {
      layout.r = Math.max(4, Math.min(h / 2 - 3, w / 4 - 3));
      layout.d = Math.max(layout.r + 2, w / 2 - layout.r - 3);
    },
    step(dt) {
      const moving = spring(f, part.goal * 100, dt);
      const [rs, rt] = packs(f.x / 100);
      // Tape length in reel radii that passed since the last frame.
      const passed = ((f.x - last) / 100) * SPIN;
      last = f.x;
      turn[0] = (turn[0] ?? 0) - passed / rs;
      turn[1] = (turn[1] ?? 0) - passed / rt;
      const { r, d } = layout;
      for (let k = 0; k < 2; k++) {
        const x = k === 0 ? -d : d;
        const pack = k === 0 ? rs : rt;
        o.position.set(x, 0, 0);
        o.rotation.set(0, 0, turn[k] ?? 0);
        o.scale.setScalar(r);
        o.updateMatrix();
        flanges.setMatrixAt(k, o.matrix);
        o.position.z = 0.06 * r;
        o.updateMatrix();
        nuts.setMatrixAt(k, o.matrix);
        o.position.set(x, 0, -0.05 * r);
        o.rotation.set(0, 0, 0);
        o.scale.set(pack * r, pack * r, 0.1 * r);
        o.updateMatrix();
        tapes.setMatrixAt(k, o.matrix);
      }
      // The tape between the packs, along their bottoms.
      const from = new Vector3(-d, -rs * r, -0.05 * r);
      const to = new Vector3(d, -rt * r, -0.05 * r);
      const along = to.clone().sub(from);
      o.position.copy(from).add(to).multiplyScalar(0.5);
      o.quaternion.copy(
        new Quaternion().setFromUnitVectors(
          new Vector3(0, 0, 1),
          along.clone().normalize()
        )
      );
      o.scale.set(0.02 * r, 0.02 * r, along.length());
      o.updateMatrix();
      tapes.setMatrixAt(2, o.matrix);
      for (const mesh of [flanges, nuts, tapes]) {
        mesh.instanceMatrix.needsUpdate = true;
      }
      return moving;
    },
  };
  return part;
}

let reels: ReelsPart | null = null;

/** The session's reels: one pair that moves between pages and keeps its tape. */
export function attachReels(
  host: HTMLElement,
  options: BenchOptions,
  wound: number
): Reels {
  const part = (reels ??= createReels(wound));
  part.goal = wound;
  const mounted = mount(host, part, options);
  return {
    ...mounted,
    wind(next) {
      if (part.goal === next) return;
      part.goal = next;
      mounted.kick();
    },
  };
}
