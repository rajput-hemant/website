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
  ExtrudeGeometry,
  InstancedMesh,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Path,
  Shape,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

import { tokenColor } from "@/lib/scene/colors";

/**
 * An analog needle meter: a bezel round a window (the LCD glass behind the
 * canvas is its face), a ring of ticks with no numerals, and a needle on
 * a pivot. The needle rides the detent spring, so a new reading overshoots
 * a little. `bump` knocks it like a tapped panel; `tremble` keeps it
 * shivering about its reading while something points at it.
 */
export type Meter = Mounted & {
  /** Read `value`, 0 to 1. */
  read: (value: number) => void;
  bump: () => void;
  tremble: (on: boolean) => void;
};

/** Degrees either side of straight up. */
export const SWEEP = 48;
const TICKS = 11;
const DEG = Math.PI / 180;

/** The needle's angle for `value`, clockwise from straight up. */
export function needleAngle(value: number): number {
  return (Math.min(Math.max(value, 0), 1) * 2 - 1) * SWEEP;
}

let unit: {
  tick: BoxGeometry;
  needle: ReturnType<typeof mergeGeometries>;
} | null = null;

function geometry() {
  if (unit) return unit;
  const tick = new BoxGeometry(1, 1, 1);
  tick.translate(0, 0.5, 0);
  // A needle one unit long from its pivot, with the pivot cap: one draw.
  const blade = new BoxGeometry(0.025, 1, 0.01);
  blade.translate(0, 0.5, 0.02);
  const cap = new CylinderGeometry(0.08, 0.08, 0.04, 16);
  cap.rotateX(Math.PI / 2);
  cap.translate(0, 0, 0.03);
  unit = { tick, needle: mergeGeometries([blade, cap]) };
  return unit;
}

type MeterPart = Part & { goal: number; trembling: boolean; shown: Sprung };

function createMeter(value: number): MeterPart {
  const stage = createStage();
  const { tick, needle } = geometry();
  const frame = new MeshStandardMaterial();
  const ink = new MeshStandardMaterial({ metalness: 0, roughness: 0.7 });
  const bezel = new Mesh(undefined, frame);
  const ticks = new InstancedMesh(tick, ink, TICKS);
  const hand = new Mesh(needle, ink);
  stage.root.add(bezel, ticks, hand);
  const shown: Sprung = { x: needleAngle(value), v: 0 };
  const o = new Object3D();
  let t = 0;

  const part: MeterPart = {
    stage,
    goal: needleAngle(value),
    trembling: false,
    shown,
    paint() {
      finish(frame, "anodised");
      ink.color.set(tokenColor("--color-lcd-ink"));
    },
    resize(w, h) {
      bezel.geometry.dispose();
      const r = 5;
      const outer = new Shape();
      outer.moveTo(-w / 2 + r, -h / 2);
      outer.lineTo(w / 2 - r, -h / 2);
      outer.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
      outer.lineTo(w / 2, h / 2 - r);
      outer.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
      outer.lineTo(-w / 2 + r, h / 2);
      outer.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
      outer.lineTo(-w / 2, -h / 2 + r);
      outer.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
      const b = 5;
      const glass = new Path();
      glass.moveTo(-w / 2 + b, -h / 2 + b);
      glass.lineTo(-w / 2 + b, h / 2 - b);
      glass.lineTo(w / 2 - b, h / 2 - b);
      glass.lineTo(w / 2 - b, -h / 2 + b);
      glass.lineTo(-w / 2 + b, -h / 2 + b);
      outer.holes.push(glass);
      bezel.geometry = new ExtrudeGeometry(outer, {
        depth: 2,
        bevelEnabled: true,
        bevelThickness: 1,
        bevelSize: 1,
        bevelSegments: 2,
        curveSegments: 4,
      });

      // The pivot sits low in the window; the ticks ring the top of its reach.
      const pivot = -h / 2 + 9;
      const reach = Math.min(h - 20, w / 2 / Math.sin(SWEEP * DEG) - 8);
      hand.position.set(0, pivot, 1);
      hand.scale.setScalar(reach);
      for (let i = 0; i < TICKS; i++) {
        const a = (i / (TICKS - 1)) * 2 * SWEEP - SWEEP;
        const major = i % 5 === 0;
        const long = major ? 7 : 4;
        o.position.set(
          Math.sin(a * DEG) * (reach - long),
          pivot + Math.cos(a * DEG) * (reach - long),
          0.5
        );
        o.rotation.set(0, 0, -a * DEG);
        o.scale.set(major ? 1.6 : 1, long, 0.5);
        o.updateMatrix();
        ticks.setMatrixAt(i, o.matrix);
      }
      ticks.instanceMatrix.needsUpdate = true;
    },
    step(dt) {
      let moving = spring(shown, part.goal, dt);
      let angle = shown.x;
      if (part.trembling && !still()) {
        t += dt;
        // Two incommensurate shivers, about 1.5 degrees at most.
        angle += 1.5 * Math.sin(t * 47) * Math.sin(t * 13.3);
        moving = true;
      }
      hand.rotation.z = -angle * DEG;
      return moving;
    },
  };
  return part;
}

const meters = new Map<string, MeterPart>();

/** A meter reading `value`; the same `key` is the same needle across pages. */
export function attachMeter(
  host: HTMLElement,
  options: BenchOptions,
  key: string,
  value: number
): Meter {
  let part = meters.get(key);
  if (!part) {
    part = createMeter(value);
    meters.set(key, part);
  }
  const meter = part;
  meter.goal = needleAngle(value);
  meter.trembling = false;
  const mounted = mount(host, meter, options);
  return {
    ...mounted,
    read(next) {
      const goal = needleAngle(next);
      if (meter.goal === goal) return;
      meter.goal = goal;
      mounted.kick();
    },
    bump() {
      if (still()) return;
      // A tap on the glass: a kick either way, which the spring rings out.
      meter.shown.v += (Math.random() < 0.5 ? -1 : 1) * 70;
      mounted.kick();
    },
    tremble(on) {
      meter.trembling = on;
      mounted.kick();
    },
  };
}
