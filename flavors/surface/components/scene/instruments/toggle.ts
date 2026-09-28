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
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

/**
 * Bat-handle toggles: a hex nut and threaded bushing with a chrome lever,
 * one instanced draw each however many levers there are. Each lever throws
 * to -1, 0 (centre off) or 1; `axis` "y" throws down and up, "x" left and
 * right. The levers sit `pitch` px apart, centred in the slot.
 */
export type Toggles = Mounted & {
  /** Throw lever `i` to `position` (-1, 0 or 1; fractions are allowed while dragging). */
  throw: (i: number, position: number) => void;
};

export type ToggleLayout = { count: number; axis: "x" | "y"; pitch: number };

/** A lever's throw, either side of centre. */
export const THROW = 32;
const DEG = Math.PI / 180;
/** The pivot: the bushing's top, in nut radii. */
const PIVOT = 0.95;

let shapes: {
  base: ReturnType<typeof mergeGeometries>;
  lever: ReturnType<typeof turned>;
} | null = null;

function geometry() {
  if (shapes) return shapes;
  const nut = new CylinderGeometry(1, 1, 0.34, 6);
  nut.rotateX(Math.PI / 2);
  nut.translate(0, 0, 0.17);
  const bushing = turned(
    [
      [0.52, 0.34],
      [0.52, 0.88],
      [0.44, PIVOT],
      [0.18, PIVOT],
    ],
    18
  );
  const lever = turned(
    [
      [0.001, 0],
      [0.2, 0],
      [0.19, 1.2],
      [0.25, 1.9],
      [0.33, 2.45],
      [0.3, 2.66],
      [0.001, 2.72],
    ],
    16
  );
  shapes = {
    // Both indexed, one material: nut and bushing are a single draw.
    base: mergeGeometries([nut, bushing]),
    lever,
  };
  return shapes;
}

type TogglePart = Part & { goals: number[]; layout: ToggleLayout };

function createToggles(layout: ToggleLayout, positions: number[]): TogglePart {
  const stage = createStage();
  const { base, lever } = geometry();
  const nuts = new MeshStandardMaterial();
  const chrome = new MeshStandardMaterial();
  const bases = new InstancedMesh(base, nuts, layout.count);
  const levers = new InstancedMesh(lever, chrome, layout.count);
  stage.root.add(bases, levers);
  // Looked at a little from above, so a lever at centre still reads as a lever.
  stage.root.rotation.x = 0.2;
  const shown: Sprung[] = positions.map((p) => ({ x: p * THROW, v: 0 }));
  const o = new Object3D();
  const scale = { s: 1 };

  const part: TogglePart = {
    stage,
    goals: [...positions],
    layout,
    paint() {
      finish(nuts, "chrome");
      finish(chrome, "chrome");
      nuts.roughness = 0.45;
    },
    resize(w, h) {
      const cell = Math.min(
        part.layout.pitch,
        part.layout.axis === "y" ? w : h
      );
      scale.s = Math.min(
        cell * 0.24,
        (part.layout.axis === "y" ? h : w) * 0.13
      );
    },
    step(dt) {
      let moving = false;
      const { count, axis, pitch } = part.layout;
      const s = scale.s;
      for (let i = 0; i < count; i++) {
        const sprung = shown[i];
        if (!sprung) continue;
        if (spring(sprung, (part.goals[i] ?? 0) * THROW, dt)) moving = true;
        const along = (i - (count - 1) / 2) * pitch;
        o.position.set(axis === "y" ? along : 0, axis === "y" ? 0 : along, 0);
        o.rotation.set(0, 0, 0);
        o.scale.setScalar(s);
        o.updateMatrix();
        bases.setMatrixAt(i, o.matrix);
        o.position.z = PIVOT * s;
        const a = sprung.x * DEG;
        if (axis === "y") o.rotation.set(-a, 0, 0);
        else o.rotation.set(0, a, 0);
        o.updateMatrix();
        levers.setMatrixAt(i, o.matrix);
      }
      bases.instanceMatrix.needsUpdate = true;
      levers.instanceMatrix.needsUpdate = true;
      return moving;
    },
  };
  return part;
}

const banks = new Map<string, TogglePart>();

/**
 * Levers in `host`. The same `key` (with the same count) is the same bank,
 * so a lever thrown on one page is still thrown when you come back, and a
 * navigation lever springs home from where it was thrown.
 */
export function attachToggles(
  host: HTMLElement,
  options: BenchOptions,
  key: string,
  layout: ToggleLayout,
  positions: readonly number[]
): Toggles {
  let part = banks.get(key);
  if (!part || part.layout.count !== layout.count) {
    part = createToggles(layout, [...positions]);
    banks.set(key, part);
  }
  const bank = part;
  bank.layout = layout;
  bank.goals = [...positions];
  const mounted = mount(host, bank, options);
  return {
    ...mounted,
    throw(i, position) {
      if (bank.goals[i] === undefined || bank.goals[i] === position) return;
      bank.goals[i] = position;
      mounted.kick();
    },
  };
}
