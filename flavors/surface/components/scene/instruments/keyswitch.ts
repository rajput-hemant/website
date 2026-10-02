import type { BenchOptions } from "@/flavors/surface/components/scene/bench";
import {
  createStage,
  finish,
  mount,
  spring,
  still,
  turned,
} from "@/flavors/surface/components/scene/workshop";
import type {
  Mounted,
  Part,
  Sprung,
} from "@/flavors/surface/components/scene/workshop";
import {
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Path,
  Shape,
} from "three";

/**
 * A key switch: a chrome lock cylinder with its key in it, seen from a
 * little above and to the side. The key turns a quarter to open, and a
 * wrong key shakes it: 4 degrees either way, three times in 240ms.
 */
export type KeySwitch = Mounted & {
  set: (open: boolean) => void;
  shake: () => void;
};

const DEG = Math.PI / 180;
export const SHAKE = { degrees: 4, cycles: 3, seconds: 0.24 };

/** The shake's offset `t` seconds in, decaying to nothing. */
export function shakeAt(t: number): number {
  if (t < 0 || t >= SHAKE.seconds) return 0;
  const k = t / SHAKE.seconds;
  return SHAKE.degrees * Math.sin(2 * Math.PI * SHAKE.cycles * k) * (1 - k);
}

let parts: {
  cylinder: ReturnType<typeof turned>;
  key: ExtrudeGeometry;
} | null = null;

function geometry() {
  if (parts) return parts;
  // The key in its own plane: y is out of the lock, x across the bow.
  const outline = new Shape();
  outline.moveTo(-0.1, 0);
  outline.lineTo(-0.1, 0.62);
  outline.quadraticCurveTo(-0.46, 0.66, -0.46, 1.02);
  outline.quadraticCurveTo(-0.46, 1.42, 0, 1.44);
  outline.quadraticCurveTo(0.46, 1.42, 0.46, 1.02);
  outline.quadraticCurveTo(0.46, 0.66, 0.1, 0.62);
  outline.lineTo(0.1, 0);
  outline.lineTo(-0.1, 0);
  const ring = new Path();
  ring.absarc(0, 1.16, 0.12, 0, Math.PI * 2, true);
  outline.holes.push(ring);
  const key = new ExtrudeGeometry(outline, {
    depth: 0.08,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 1,
    curveSegments: 10,
  });
  key.translate(0, 0, -0.04);
  // Stand it out of the lock face: y becomes z.
  key.rotateX(Math.PI / 2);
  key.translate(0, 0, 0.24);
  parts = {
    cylinder: turned(
      [
        [0.001, 0.2],
        [0.55, 0.2],
        [0.62, 0.24],
        [0.9, 0.24],
        [1, 0.14],
        [1, 0],
      ],
      36
    ),
    key,
  };
  return parts;
}

type KeyPart = Part & { open: boolean; shaken: number };

function createKeySwitch(open: boolean): KeyPart {
  const stage = createStage();
  const { cylinder, key } = geometry();
  const chrome = new MeshStandardMaterial();
  const brass = new MeshStandardMaterial();
  const turn = new Group();
  turn.add(new Mesh(key, brass));
  stage.root.add(new Mesh(cylinder, chrome), turn);
  stage.root.rotation.set(0.5, -0.4, 0);
  const angle: Sprung = { x: open ? 90 : 0, v: 0 };

  const part: KeyPart = {
    stage,
    open,
    shaken: -1,
    paint() {
      finish(chrome, "chrome");
      finish(brass, "chrome");
      brass.color.set(0xc9a95c);
    },
    resize(w, h) {
      stage.root.scale.setScalar(Math.min(w, h) * 0.34);
    },
    step(dt) {
      let moving = spring(angle, part.open ? 90 : 0, dt);
      let shake = 0;
      if (part.shaken >= 0) {
        part.shaken += dt;
        shake = shakeAt(part.shaken);
        if (part.shaken >= SHAKE.seconds) part.shaken = -1;
        else moving = true;
      }
      // Locked, the key stands upright; open, it lies a quarter turn clockwise.
      turn.rotation.z = -(angle.x + shake) * DEG;
      return moving;
    },
  };
  return part;
}

let lock: KeyPart | null = null;

/** The owner's key switch. */
export function attachKeySwitch(
  host: HTMLElement,
  options: BenchOptions,
  open: boolean
): KeySwitch {
  const part = (lock ??= createKeySwitch(open));
  part.open = open;
  const mounted = mount(host, part, options);
  return {
    ...mounted,
    set(next) {
      if (part.open === next) return;
      part.open = next;
      mounted.kick();
    },
    shake() {
      // With motion off the error is the lamp and the message, not a shake.
      if (still()) return;
      part.shaken = 0;
      mounted.kick();
    },
  };
}
