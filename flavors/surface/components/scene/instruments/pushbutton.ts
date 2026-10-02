import type { BenchOptions } from "@/flavors/surface/components/scene/bench";
import {
  createStage,
  ease,
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
import { Group, Mesh, MeshStandardMaterial } from "three";

import { tokenColor } from "@/lib/scene/colors";

/**
 * A momentary arcade push button: a chrome bezel, a lamp ring and a domed
 * cap with about 3mm of travel on a spring return. The ring lights while a
 * message is sending and flashes brighter once it is filed.
 */
export type PushButton = Mounted & {
  press: (down: boolean) => void;
  /** 0 dark, 1 lit, 2 the brief flash once filed. */
  light: (level: 0 | 1 | 2) => void;
};

let parts: {
  bezel: ReturnType<typeof turned>;
  ring: ReturnType<typeof turned>;
  cap: ReturnType<typeof turned>;
} | null = null;

function geometry() {
  parts ??= {
    bezel: turned(
      [
        [0.7, 0.08],
        [0.72, 0.22],
        [0.86, 0.26],
        [0.98, 0.14],
        [1, 0],
      ],
      32
    ),
    ring: turned(
      [
        [0.6, 0.02],
        [0.6, 0.17],
        [0.7, 0.17],
        [0.7, 0.02],
      ],
      32
    ),
    cap: turned(
      [
        [0.001, 0.62],
        [0.3, 0.6],
        [0.48, 0.52],
        [0.56, 0.4],
        [0.57, 0.12],
      ],
      32
    ),
  };
  return parts;
}

/** Travel, in button radii (about 3mm on a 25mm button). */
const TRAVEL = 0.24;

type ButtonPart = Part & { down: boolean; level: number };

function createButton(): ButtonPart {
  const stage = createStage();
  const { bezel, ring, cap } = geometry();
  const chrome = new MeshStandardMaterial();
  const lamp = new MeshStandardMaterial({ metalness: 0, roughness: 0.3 });
  const plastic = new MeshStandardMaterial();
  const plunger = new Group();
  plunger.add(new Mesh(cap, plastic));
  stage.root.add(new Mesh(bezel, chrome), new Mesh(ring, lamp), plunger);
  stage.root.rotation.x = 0.3;
  // Travel in hundredths of the full stroke, so the spring settles finely.
  const travel: Sprung = { x: 0, v: 0 };
  const glow = { x: 0 };

  const part: ButtonPart = {
    stage,
    down: false,
    level: 0,
    paint() {
      finish(chrome, "chrome");
      finish(plastic, "bakelite");
      lamp.color.set(tokenColor("--color-led-off"));
      lamp.emissive.set(tokenColor("--color-signal"));
    },
    resize(w, h) {
      stage.root.scale.setScalar(Math.min(w, h) / 2);
    },
    step(dt) {
      let moving = spring(travel, part.down ? 100 : 0, dt);
      if (ease(glow, part.level, 16, dt)) moving = true;
      plunger.position.z = -(Math.max(travel.x, -20) / 100) * TRAVEL;
      lamp.emissiveIntensity = glow.x * 0.7;
      return moving;
    },
  };
  return part;
}

const buttons = new Map<string, ButtonPart>();

/** A push button; the same `key` is the same button. */
export function attachPushButton(
  host: HTMLElement,
  options: BenchOptions,
  key: string
): PushButton {
  let part = buttons.get(key);
  if (!part) {
    part = createButton();
    buttons.set(key, part);
  }
  const button = part;
  button.down = false;
  const mounted = mount(host, button, options);
  return {
    ...mounted,
    press(down) {
      if (button.down === down) return;
      button.down = down;
      mounted.kick();
    },
    light(level) {
      if (button.level === level) return;
      button.level = level;
      mounted.kick();
    },
  };
}
