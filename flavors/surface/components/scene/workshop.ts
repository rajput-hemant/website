import {
  createBench,
  glRenderer,
} from "@/flavors/surface/components/scene/bench";
import type {
  BenchOptions,
  Instrument,
} from "@/flavors/surface/components/scene/bench";
import { expApproach, springStep } from "@/flavors/surface/lib/knob/spring";
import {
  CanvasTexture,
  DirectionalLight,
  Group,
  LatheGeometry,
  MeshStandardMaterial,
  OrthographicCamera,
  PMREMGenerator,
  Scene,
  Vector2,
} from "three";
import type { Texture, WebGLRenderer } from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

import { tokenColor } from "@/lib/scene/colors";

/**
 * The workshop: what every instrument on the bench shares. One bench per
 * session (so one GL context and at most four live slots a page, the knob
 * included), one room light per renderer, and a stage whose world units are
 * CSS pixels, so a part is modelled at the size it shows.
 */
export const bench = createBench(glRenderer);

export const still = () => document.documentElement.dataset.motion !== "on";
export const black = () => document.documentElement.dataset.theme === "dark";

const rooms = new WeakMap<WebGLRenderer, Texture>();

/** The studio light every instrument reflects, made once per renderer (a restore makes it again). */
export function room(renderer: WebGLRenderer): Texture {
  let texture = rooms.get(renderer);
  if (!texture) {
    const pmrem = new PMREMGenerator(renderer);
    texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    rooms.set(renderer, texture);
  }
  return texture;
}

export type Stage = {
  scene: Scene;
  camera: OrthographicCamera;
  /** The part: one group, so an inspector can turn or zoom it later. */
  root: Group;
  /** The slot's CSS size, kept current by `mount`. */
  size: { w: number; h: number };
};

/** A scene looking straight at the faceplate: x right, y up, z out of the panel, 1 unit = 1 CSS px. */
export function createStage(): Stage {
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 1, 2000);
  camera.position.z = 1000;
  const sun = new DirectionalLight(0xffffff, 1.4);
  sun.position.set(-3, 4, 6);
  scene.add(sun);
  const root = new Group();
  scene.add(root);
  return { scene, camera, root, size: { w: 0, h: 0 } };
}

export type Finish =
  "anodised" | "chrome" | "bakelite" | "paper" | "aluminium" | "ink";

/** Theme a material as one of the faceplate's finishes. */
export function finish(material: MeshStandardMaterial, kind: Finish) {
  const k = black();
  const set = (
    color: number | string,
    metalness: number,
    roughness: number
  ) => {
    material.color.set(color);
    material.metalness = metalness;
    material.roughness = roughness;
  };
  switch (kind) {
    case "anodised":
      return set(k ? 0x1c1c1b : 0x8e8b85, k ? 0.55 : 0.9, 0.5);
    case "chrome":
      return set(k ? 0x77756f : 0xc9c6bf, 1, k ? 0.3 : 0.25);
    case "bakelite":
      return set(k ? 0x0d0d0c : 0x1d1d1b, 0, 0.4);
    case "paper":
      return set(k ? 0xcfcabd : 0xf1eee6, 0, 0.95);
    case "aluminium":
      // The rating plate is always light, like the printed one.
      return set(0xd6d4cf, 1, 0.35);
    case "ink":
      return set(tokenColor("--color-ink"), 0, 0.6);
  }
}

/** The stage's light level for the current theme. */
export function paintStage(stage: Stage) {
  stage.scene.environmentIntensity = black() ? 0.7 : 0.55;
}

/** A body turned on a lathe: `profile` is [radius, height] pairs, and the turning axis is z. */
export function turned(
  profile: readonly (readonly [number, number])[],
  segments = 32
): LatheGeometry {
  const geometry = new LatheGeometry(
    profile.map(([r, z]) => new Vector2(r, z)),
    segments
  );
  geometry.rotateX(Math.PI / 2);
  return geometry;
}

let blob: CanvasTexture | null = null;

/** A soft round shadow, shared by every part that casts one. */
export function shadowTexture(): CanvasTexture {
  if (blob) return blob;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(0,0,0,1)");
    g.addColorStop(0.6, "rgba(0,0,0,.7)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
  }
  blob = new CanvasTexture(canvas);
  return blob;
}

export type Sprung = { x: number; v: number };

/** Step a detent spring (slight overshoot) toward `goal`; whether it still moves. */
export function spring(s: Sprung, goal: number, dt: number): boolean {
  if (still()) {
    s.x = goal;
    s.v = 0;
    return false;
  }
  const next = springStep(s.x, s.v, goal, dt);
  s.x = next.x;
  s.v = next.v;
  return next.moving;
}

/** Ease `s.x` toward `goal` at `rate` per second (no overshoot); whether it still moves. */
export function ease(
  s: { x: number },
  goal: number,
  rate: number,
  dt: number
): boolean {
  s.x = expApproach(s.x, goal, rate, dt, still());
  return s.x !== goal;
}

/** One instrument of a part: its stage, how it paints, how it poses. */
export type Part = {
  stage: Stage;
  paint: () => void;
  /** Advance by `dt` seconds and pose; whether it still moves. */
  step: (dt: number) => boolean;
  /** The slot's CSS size changed (and on mount). */
  resize?: (w: number, h: number) => void;
};

export type Mounted = { kick: () => void; detach: () => void };

const instruments = new WeakMap<Part, Instrument<WebGLRenderer>>();

function instrumentOf(part: Part): Instrument<WebGLRenderer> {
  let instrument = instruments.get(part);
  if (!instrument) {
    instrument = {
      scene: part.stage.scene,
      camera: part.stage.camera,
      setup: (renderer) => {
        part.stage.scene.environment = room(renderer);
      },
      paint: () => {
        paintStage(part.stage);
        part.paint();
      },
      step: part.step,
    };
    instruments.set(part, instrument);
  }
  return instrument;
}

/**
 * Show `part` in `host` (a sized, positioned element). The camera follows the
 * host's CSS box, so the part draws at 1 unit per pixel. A part can move
 * between hosts (a navigation, a lamp that follows the knob) and keeps its
 * pose. Returns its kick and the cleanup, which detaches without disposing.
 */
export function mount(
  host: HTMLElement,
  part: Part,
  options: BenchOptions
): Mounted {
  const instrument = instrumentOf(part);
  const { camera, size } = part.stage;
  const measure = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (w === size.w && h === size.h) return false;
    size.w = w;
    size.h = h;
    camera.left = -w / 2;
    camera.right = w / 2;
    camera.top = h / 2;
    camera.bottom = -h / 2;
    camera.updateProjectionMatrix();
    part.resize?.(w, h);
    return true;
  };
  size.w = size.h = -1;
  measure();
  const kick = () => bench.kick(instrument);
  const sizer = new ResizeObserver(() => {
    if (measure()) kick();
  });
  sizer.observe(host);
  const detach = bench.attach(host, instrument, options);
  return {
    kick,
    detach: () => {
      sizer.disconnect();
      detach();
    },
  };
}
