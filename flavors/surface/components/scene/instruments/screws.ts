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
  CanvasTexture,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
} from "three";

/**
 * Four slotted pan-head screws in the corners of a plate, in one instanced
 * draw. The slot is a texture mapped straight down on the head. The canvas
 * covers the plate; each screw keeps its angle for the session.
 */
export type Screws = Mounted & {
  /** Turn screw `i` (0 top left, 1 top right, 2 bottom left, 3 bottom right) to `degrees`. */
  turn: (i: number, degrees: number) => void;
  angle: (i: number) => number;
};

export type ScrewLayout = {
  /** Centre of each screw from its corner, in CSS px. */
  inset: readonly [number, number];
  radius: number;
};

const DEG = Math.PI / 180;
/** Where each screw's slot starts, so no two match (like the printed ones). */
const REST = [24, -58, 81, -12];

let head: ReturnType<typeof turned> | null = null;
let slot: CanvasTexture | null = null;

function shapes() {
  if (!head) {
    head = turned(
      [
        [0, 0.42],
        [0.45, 0.4],
        [0.8, 0.3],
        [0.97, 0.14],
        [1, 0],
      ],
      24
    );
    // Map the slot straight down onto the dome.
    const pos = head.attributes.position;
    const uv = head.attributes.uv;
    if (pos && uv) {
      for (let i = 0; i < pos.count; i++) {
        uv.setXY(i, pos.getX(i) * 0.5 + 0.5, pos.getY(i) * 0.5 + 0.5);
      }
    }
  }
  if (!slot) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 64, 64);
      ctx.fillStyle = "#1a1a18";
      ctx.fillRect(4, 27, 56, 10);
    }
    slot = new CanvasTexture(canvas);
  }
  return { head, slot };
}

type ScrewsPart = Part & { goals: number[]; layout: ScrewLayout };

function createScrews(layout: ScrewLayout): ScrewsPart {
  const stage = createStage();
  const { head, slot } = shapes();
  const metal = new MeshStandardMaterial({ map: slot });
  const mesh = new InstancedMesh(head, metal, 4);
  stage.root.add(mesh);
  const shown: Sprung[] = REST.map((x) => ({ x, v: 0 }));
  const place = new Object3D();

  const part: ScrewsPart = {
    stage,
    goals: [...REST],
    layout,
    paint: () => finish(metal, "chrome"),
    step(dt) {
      let moving = false;
      const { w, h } = stage.size;
      const [ix, iy] = part.layout.inset;
      for (let i = 0; i < 4; i++) {
        const s = shown[i];
        const goal = part.goals[i];
        if (!s || goal === undefined) continue;
        if (spring(s, goal, dt)) moving = true;
        place.position.set(
          i % 2 === 0 ? -w / 2 + ix : w / 2 - ix,
          i < 2 ? h / 2 - iy : -h / 2 + iy,
          0
        );
        place.rotation.set(0, 0, -s.x * DEG);
        place.scale.setScalar(part.layout.radius);
        place.updateMatrix();
        mesh.setMatrixAt(i, place.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
      return moving;
    },
  };
  return part;
}

const plates = new Map<string, ScrewsPart>();

/** Screws for the plate `host` covers. The same `key` is the same four screws, angles and all. */
export function attachScrews(
  host: HTMLElement,
  options: BenchOptions,
  key: string,
  layout: ScrewLayout
): Screws {
  let part = plates.get(key);
  if (!part) {
    part = createScrews(layout);
    plates.set(key, part);
  }
  const screws = part;
  screws.layout = layout;
  const mounted = mount(host, screws, options);
  return {
    ...mounted,
    turn(i, degrees) {
      if (screws.goals[i] === undefined) return;
      screws.goals[i] = degrees;
      mounted.kick();
    },
    angle: (i) => screws.goals[i] ?? 0,
  };
}
