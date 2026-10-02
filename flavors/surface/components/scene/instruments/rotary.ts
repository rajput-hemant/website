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
  BoxGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Shape,
} from "three";

/**
 * A chicken-head rotary switch: a bakelite skirt and a pointer with an
 * inlaid line, stepping between a few positions 30 degrees apart. It turns
 * on the detent spring.
 */
export type Rotary = Mounted & { to: (degrees: number) => void };

export const ROTARY_STEP = 30;
const DEG = Math.PI / 180;

/** The pointer's angle for `position` of `count`, 0 at twelve o'clock, clockwise positive. */
export function rotaryAngle(position: number, count: number): number {
  return (position - (count - 1) / 2) * ROTARY_STEP;
}

let shapes: {
  skirt: ReturnType<typeof turned>;
  head: ExtrudeGeometry;
  line: BoxGeometry;
} | null = null;

function geometry() {
  if (shapes) return shapes;
  const outline = new Shape();
  outline.moveTo(0, 0.98);
  outline.quadraticCurveTo(0.12, 0.62, 0.32, 0.05);
  outline.quadraticCurveTo(0.42, -0.55, 0, -0.62);
  outline.quadraticCurveTo(-0.42, -0.55, -0.32, 0.05);
  outline.quadraticCurveTo(-0.12, 0.62, 0, 0.98);
  const head = new ExtrudeGeometry(outline, {
    depth: 0.32,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.04,
    bevelSegments: 2,
    curveSegments: 10,
  });
  head.translate(0, 0, 0.3);
  const line = new BoxGeometry(0.06, 0.62, 0.02);
  line.translate(0, 0.42, 0.68);
  shapes = {
    skirt: turned(
      [
        [0, 0.3],
        [0.6, 0.3],
        [0.68, 0.27],
        [0.72, 0.06],
        [0.74, 0],
      ],
      32
    ),
    head,
    line,
  };
  return shapes;
}

type RotaryPart = Part & { goal: number };

function createRotary(angle: number): RotaryPart {
  const stage = createStage();
  const { skirt, head, line } = geometry();
  const plastic = new MeshStandardMaterial();
  const inlay = new MeshStandardMaterial({ roughness: 0.6, metalness: 0 });
  const turn = new Group();
  turn.add(
    new Mesh(skirt, plastic),
    new Mesh(head, plastic),
    new Mesh(line, inlay)
  );
  stage.root.add(turn);
  stage.root.rotation.x = 0.22;
  const shown: Sprung = { x: angle, v: 0 };

  const part: RotaryPart = {
    stage,
    goal: angle,
    paint() {
      finish(plastic, "bakelite");
      inlay.color.set(0xf1eee6);
    },
    resize(w, h) {
      stage.root.scale.setScalar(Math.min(w, h) / 2);
    },
    step(dt) {
      const moving = spring(shown, part.goal, dt);
      turn.rotation.z = -shown.x * DEG;
      return moving;
    },
  };
  return part;
}

let rotary: RotaryPart | null = null;

/** The bank switch. Its angle survives a navigation. */
export function attachRotary(
  host: HTMLElement,
  options: BenchOptions,
  angle: number
): Rotary {
  const part = (rotary ??= createRotary(angle));
  part.goal = angle;
  const mounted = mount(host, part, options);
  return {
    ...mounted,
    to(next) {
      if (part.goal === next) return;
      part.goal = next;
      mounted.kick();
    },
  };
}
