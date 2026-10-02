import type { Instrument } from "@/flavors/surface/components/scene/bench";
import {
  bench,
  room,
  still,
} from "@/flavors/surface/components/scene/workshop";
import { detentAngle } from "@/flavors/surface/lib/knob/geometry";
import { expApproach, springStep } from "@/flavors/surface/lib/knob/spring";
import { knobStore, shownIndex } from "@/flavors/surface/lib/knob/store";
import {
  BoxGeometry,
  CanvasTexture,
  DirectionalLight,
  DoubleSide,
  Group,
  InstancedMesh,
  LatheGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  Vector2,
} from "three";
import type { WebGLRenderer } from "three";

import { tokenColor } from "@/lib/scene/colors";
import type { Tier } from "@/lib/scene/store";

/** Half the canvas's world width: the knob (radius 1.5) plus room for its shadow. */
export const EXTENT = 1.9;
const HEIGHT = 0.56;
const RIBS = 150;
const DEG = Math.PI / 180;

type World = {
  scene: Scene;
  camera: OrthographicCamera;
  knob: Group;
  metal: MeshStandardMaterial;
  grain: MeshStandardMaterial;
  index: MeshBasicMaterial;
  shadows: [MeshBasicMaterial, MeshBasicMaterial];
};

// The knob is the bench's first instrument (the workshop holds the bench).
let world: World | null = null;
let instrument: Instrument<WebGLRenderer> | null = null;

// Presentation values survive navigations, so the knob turns from wherever it was.
const shown = { angle: 0, velocity: 0, tiltX: 0, tiltY: 0, sink: 0 };

/** Concentric turning marks: grey stripes along the lathe profile read as rings on the dish. */
function turningMarks() {
  const canvas = document.createElement("canvas");
  canvas.width = 4;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  for (let y = 0; y < 512; y++) {
    // Deterministic noise, so every visit gets the same knob.
    const g =
      95 +
      Math.floor(((((Math.sin(y * 12.9898) * 43758.5453) % 1) + 1) % 1) * 60);
    ctx.fillStyle = `rgb(${g},${g},${g})`;
    ctx.fillRect(0, y, 4, 1);
  }
  return new CanvasTexture(canvas);
}

function softShadow() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(0,0,0,1)");
  g.addColorStop(0.62, "rgba(0,0,0,.8)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new CanvasTexture(canvas);
}

function build(): World {
  const scene = new Scene();
  const camera = new OrthographicCamera(
    -EXTENT,
    EXTENT,
    EXTENT,
    -EXTENT,
    0.1,
    50
  );
  camera.position.z = 20;

  const sun = new DirectionalLight(0xffffff, 1.4);
  sun.position.set(-3, 4, 6);
  scene.add(sun);

  const metal = new MeshStandardMaterial({
    metalness: 1,
    roughness: 1,
    roughnessMap: turningMarks(),
    side: DoubleSide,
  });
  const grain = new MeshStandardMaterial({ metalness: 1, roughness: 0.5 });

  const knob = new Group();
  scene.add(knob);

  const H = HEIGHT;
  const profile = [
    [0.001, H - 0.05],
    [0.4, H - 0.045],
    [0.8, H - 0.03],
    [1.15, H - 0.01],
    [1.28, H],
    [1.33, H - 0.005],
    [1.4, H - 0.045],
    [1.46, H - 0.09],
    [1.5, H - 0.14],
    [1.5, 0.02],
    [1.49, 0],
  ].map(([x, y]) => new Vector2(x, y));
  const body = new LatheGeometry(profile, 160);
  body.rotateX(Math.PI / 2);
  knob.add(new Mesh(body, metal));

  // Knurling: one instanced draw for every rib around the skirt.
  const ribs = new InstancedMesh(
    new BoxGeometry(0.045, 0.05, H - 0.22),
    grain,
    RIBS
  );
  const dummy = new Object3D();
  for (let i = 0; i < RIBS; i++) {
    const t = (i / RIBS) * Math.PI * 2;
    dummy.position.set(Math.sin(t) * 1.5, Math.cos(t) * 1.5, 0.23);
    dummy.rotation.z = -t;
    dummy.updateMatrix();
    ribs.setMatrixAt(i, dummy.matrix);
  }
  knob.add(ribs);

  // The inlaid signal-yellow index line.
  const index = new MeshBasicMaterial();
  const line = new Mesh(new BoxGeometry(0.075, 0.6, 0.012), index);
  line.position.set(0, 0.85, H - 0.022);
  knob.add(line);

  const blob = softShadow();
  const far = new MeshBasicMaterial({
    map: blob,
    transparent: true,
    depthWrite: false,
  });
  const near = new MeshBasicMaterial({
    map: blob,
    transparent: true,
    depthWrite: false,
  });
  const s1 = new Mesh(new PlaneGeometry(4, 4), far);
  s1.position.set(0.16, -0.28, -0.01);
  const s2 = new Mesh(new PlaneGeometry(3.2, 3.2), near);
  s2.position.set(0.03, -0.05, -0.005);
  scene.add(s1, s2);

  return {
    scene,
    camera,
    knob,
    metal,
    grain,
    index,
    shadows: [far, near],
  };
}

function paint(w: World) {
  const black = document.documentElement.dataset.theme === "dark";
  w.metal.color.set(black ? 0x1c1c1b : 0x8e8b85);
  w.grain.color.set(black ? 0x141413 : 0x74716c);
  w.metal.metalness = w.grain.metalness = black ? 0.55 : 0.9;
  w.scene.environmentIntensity = black ? 0.7 : 0.55;
  w.index.color.set(tokenColor("--color-signal"));
  w.shadows[0].opacity = black ? 0.7 : 0.28;
  w.shadows[1].opacity = black ? 0.8 : 0.35;
}

function target() {
  const state = knobStore.getState();
  return state.drag ?? detentAngle(state.count, shownIndex(state));
}

/** Pose one frame. Returns whether anything is still moving. */
function step(w: World, dt: number): boolean {
  const state = knobStore.getState();
  const goal = target();
  let moving = false;
  const snap = still();

  if (state.drag !== null || snap) {
    shown.angle = goal;
    shown.velocity = 0;
  } else {
    const sprung = springStep(shown.angle, shown.velocity, goal, dt);
    shown.angle = sprung.x;
    shown.velocity = sprung.v;
    if (sprung.moving) moving = true;
  }

  const lean = snap || state.drag !== null;
  const tx = lean ? 0 : state.tiltX * 0.16;
  const ty = lean ? 0 : state.tiltY * 0.16;
  const sinkGoal = state.pressed ? 0.035 : 0;
  const approach = (from: number, to: number, rate: number) => {
    const next = expApproach(from, to, rate, dt, snap);
    if (Math.abs(to - next) > 0.0005) moving = true;
    return next;
  };
  shown.tiltX = approach(shown.tiltX, tx, 11.87);
  shown.tiltY = approach(shown.tiltY, ty, 11.87);
  shown.sink = approach(shown.sink, sinkGoal, 26.16);

  w.knob.rotation.set(shown.tiltX, shown.tiltY, -shown.angle * DEG);
  w.knob.position.z = -shown.sink;
  return moving;
}

function knobInstrument(): Instrument<WebGLRenderer> {
  const w = (world ??= build());
  shown.angle = target();
  return {
    scene: w.scene,
    camera: w.camera,
    // The room light needs the renderer, so it is lit the first time they meet.
    setup: (renderer) => {
      w.scene.environment = room(renderer);
    },
    paint: () => paint(w),
    step: (dt) => step(w, dt),
  };
}

/**
 * Show the knob in `slot`. The knob is built once per session and moves
 * between slots on navigation, so it keeps its angle and turns to the new
 * page's detent. `onLost` brings the printed knob back, `onRestored` (after a
 * GL context restore) hides it again. Returns the cleanup, which detaches
 * without disposing.
 */
export function attachKnob(
  slot: HTMLElement,
  tier: Tier,
  onLost: () => void,
  onRestored: () => void
): () => void {
  const knob = (instrument ??= knobInstrument());
  const detach = bench.attach(slot, knob, { tier, onLost, onRestored });
  const unwatch = knobStore.subscribe(() => bench.kick(knob));
  return () => {
    unwatch();
    detach();
  };
}
