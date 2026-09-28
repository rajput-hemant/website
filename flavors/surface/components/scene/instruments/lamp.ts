import type { BenchOptions } from "@/flavors/surface/components/scene/bench";
import {
  createStage,
  ease,
  finish,
  mount,
  turned,
} from "@/flavors/surface/components/scene/workshop";
import type {
  Mounted,
  Part,
} from "@/flavors/surface/components/scene/workshop";
import { IcosahedronGeometry, Mesh, MeshStandardMaterial } from "three";

import { tokenColor } from "@/lib/scene/colors";

/**
 * The jewel pilot lamp: a lathe-turned chrome bezel around a faceted lens
 * with an emissive core. Lit steady, dark, or in the alarm colour; a pulse
 * is the slot's CSS halo, so a pulsing lamp renders no frames. The mouse
 * rolls the facets, so the highlight moves with it.
 */
export type LampTone = "signal" | "alarm" | "off";

export type Lamp = Mounted & {
  set: (tone: LampTone) => void;
  /** Lean toward the pointer, -1..1 on each axis (0, 0 to rest). */
  lean: (x: number, y: number) => void;
};

const DEG = Math.PI / 180;

let shapes: {
  bezel: ReturnType<typeof turned>;
  lens: IcosahedronGeometry;
} | null = null;

// Built once and shared: a lamp that follows the knob remounts every hover.
function geometry() {
  if (shapes) return shapes;
  const lens = new IcosahedronGeometry(0.6, 1);
  lens.scale(1, 1, 0.55);
  lens.translate(0, 0, 0.18);
  shapes = {
    bezel: turned(
      [
        [0.56, 0.02],
        [0.6, 0.26],
        [0.7, 0.34],
        [0.88, 0.31],
        [0.98, 0.18],
        [1, 0],
      ],
      36
    ),
    lens,
  };
  return shapes;
}

type LampPart = Part & { tone: LampTone; target: { x: number; y: number } };

function createLamp(): LampPart {
  const stage = createStage();
  const { bezel, lens } = geometry();
  const chrome = new MeshStandardMaterial();
  const glass = new MeshStandardMaterial({ flatShading: true });
  const lensMesh = new Mesh(lens, glass);
  stage.root.add(new Mesh(bezel, chrome), lensMesh);

  const glow = { x: 0 };
  const tilt = { x: { x: 0 }, y: { x: 0 } };
  const colors = { signal: "", alarm: "", off: "" };

  const part: LampPart = {
    stage,
    tone: "off",
    target: { x: 0, y: 0 },
    paint() {
      finish(chrome, "chrome");
      colors.signal = tokenColor("--color-signal");
      colors.alarm = tokenColor("--color-alarm");
      colors.off = tokenColor("--color-led-off");
      glass.roughness = 0.12;
      glass.metalness = 0.1;
      glow.x = part.tone === "off" ? 0 : 1;
      tint();
    },
    step(dt) {
      let moving = ease(glow, part.tone === "off" ? 0 : 1, 20, dt);
      if (ease(tilt.x, part.target.y * 30, 11.87, dt)) moving = true;
      if (ease(tilt.y, part.target.x * 30, 11.87, dt)) moving = true;
      tint();
      lensMesh.rotation.set(tilt.x.x * DEG, tilt.y.x * DEG, 0);
      stage.root.rotation.set(tilt.x.x * 0.25 * DEG, tilt.y.x * 0.25 * DEG, 0);
      return moving;
    },
    resize(w, h) {
      stage.root.scale.setScalar(Math.min(w, h) / 2);
    },
  };

  function tint() {
    // Not painted yet (the bench paints before the first frame).
    if (!colors.signal) return;
    const lit = part.tone === "off" ? colors.signal : colors[part.tone];
    glass.color.set(part.tone === "off" ? colors.off : lit);
    glass.emissive.set(lit);
    glass.emissiveIntensity = 0.85 * glow.x;
  }

  return part;
}

const lamps = new Map<string, LampPart>();

/**
 * Show a lamp in `host`. Lamps with the same `key` are one lamp that moves
 * between hosts and keeps its state (a navigation, or the lamp that follows
 * the knob across presets).
 */
export function attachLamp(
  host: HTMLElement,
  options: BenchOptions,
  key: string,
  tone: LampTone
): Lamp {
  let part = lamps.get(key);
  if (!part) {
    part = createLamp();
    lamps.set(key, part);
  }
  const lamp = part;
  lamp.tone = tone;
  const mounted = mount(host, lamp, options);
  return {
    ...mounted,
    set(next) {
      if (lamp.tone === next) return;
      lamp.tone = next;
      mounted.kick();
    },
    lean(x, y) {
      lamp.target.x = x;
      lamp.target.y = y;
      mounted.kick();
    },
  };
}
