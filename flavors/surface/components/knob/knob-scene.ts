import { detentAngle } from "@/flavors/surface/lib/knob/geometry";
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
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

import type { Tier } from "@/lib/scene/store";

/** Half the canvas's world width: the knob (radius 1.5) plus room for its shadow. */
export const EXTENT = 1.9;
const HEIGHT = 0.56;
const RIBS = 150;
const DEG = Math.PI / 180;

type World = {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: OrthographicCamera;
  knob: Group;
  metal: MeshStandardMaterial;
  grain: MeshStandardMaterial;
  index: MeshBasicMaterial;
  shadows: [MeshBasicMaterial, MeshBasicMaterial];
};

let world: World | null = null;
let host: HTMLElement | null = null;
let raf = 0;
let visible = true;
let unwatch: (() => void) | null = null;

// Presentation values survive navigations, so the knob turns from wherever it was.
const shown = { angle: 0, velocity: 0, tiltX: 0, tiltY: 0, sink: 0 };
let started = false;

const still = () => document.documentElement.dataset.motion !== "on";

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

/** A CSS colour token resolved to a string three.js can parse (it can't read light-dark()). */
function token(name: string) {
  const probe = document.createElement("span");
  probe.style.color = `var(${name})`;
  probe.style.display = "none";
  document.body.append(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
}

function build(canvas: HTMLCanvasElement, tier: Tier): World {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: tier === 2,
    alpha: true,
    powerPreference: "default",
  });
  renderer.setPixelRatio(tier === 2 ? Math.min(devicePixelRatio, 2) : 1);
  renderer.outputColorSpace = SRGBColorSpace;

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

  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

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
    renderer,
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
  w.index.color.set(token("--color-signal"));
  w.shadows[0].opacity = black ? 0.7 : 0.28;
  w.shadows[1].opacity = black ? 0.8 : 0.35;
}

function target() {
  const state = knobStore.getState();
  return state.drag ?? detentAngle(state.count, shownIndex(state));
}

/** One frame. Returns whether anything is still moving. */
function step(w: World): boolean {
  const state = knobStore.getState();
  const goal = target();
  let moving = false;

  if (state.drag !== null || still()) {
    shown.angle = goal;
    shown.velocity = 0;
  } else {
    // Sprung detent with a little overshoot, like a real ball-bearing click.
    shown.velocity = (shown.velocity + (goal - shown.angle) * 0.13) * 0.7;
    shown.angle += shown.velocity;
    if (
      Math.abs(goal - shown.angle) < 0.05 &&
      Math.abs(shown.velocity) < 0.05
    ) {
      shown.angle = goal;
      shown.velocity = 0;
    } else moving = true;
  }

  const lean = still() || state.drag !== null;
  const tx = lean ? 0 : state.tiltX * 0.16;
  const ty = lean ? 0 : state.tiltY * 0.16;
  const sinkGoal = state.pressed ? 0.035 : 0;
  const ease = (from: number, to: number, k: number) => {
    const next = still() ? to : from + (to - from) * k;
    if (Math.abs(to - next) > 0.0005) moving = true;
    return Math.abs(to - next) > 0.0005 ? next : to;
  };
  shown.tiltX = ease(shown.tiltX, tx, 0.18);
  shown.tiltY = ease(shown.tiltY, ty, 0.18);
  shown.sink = ease(shown.sink, sinkGoal, 0.35);

  w.knob.rotation.set(shown.tiltX, shown.tiltY, -shown.angle * DEG);
  w.knob.position.z = -shown.sink;
  w.renderer.render(w.scene, w.camera);
  return moving;
}

function tick() {
  raf = 0;
  if (!world || !host || !visible) return;
  if (step(world)) kick();
}

/** Ask for frames until the knob settles. Nothing renders while it is at rest. */
export function kick() {
  if (!raf && world && host) raf = requestAnimationFrame(tick);
}

function resize() {
  if (!world || !host) return;
  const size = Math.round(host.clientWidth);
  if (size > 0) world.renderer.setSize(size, size, false);
  kick();
}

/**
 * Borrow the one canvas for `slot`. The world is built once per session and
 * moves between slots on navigation, so the knob keeps its angle and turns to
 * the new page's detent. Returns the cleanup, which detaches without disposing.
 */
export function attachKnob(
  slot: HTMLElement,
  tier: Tier,
  onLost: () => void
): () => void {
  if (!world) {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.className = "block size-full";
    world = build(canvas, tier);
    paint(world);
  }
  if (!started) {
    shown.angle = target();
    started = true;
  }

  const w = world;
  const canvas = w.renderer.domElement;
  host = slot;
  slot.append(canvas);

  const lost = (event: Event) => {
    event.preventDefault();
    onLost();
  };
  canvas.addEventListener("webglcontextlost", lost);

  const sizer = new ResizeObserver(resize);
  sizer.observe(slot);
  const seen = new IntersectionObserver(([entry]) => {
    visible = !!entry?.isIntersecting;
    kick();
  });
  seen.observe(slot);

  const themes = new MutationObserver(() => {
    paint(w);
    kick();
  });
  themes.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "data-motion"],
  });

  unwatch?.();
  unwatch = knobStore.subscribe(kick);

  resize();
  step(w);

  return () => {
    canvas.removeEventListener("webglcontextlost", lost);
    sizer.disconnect();
    seen.disconnect();
    themes.disconnect();
    if (host === slot) {
      unwatch?.();
      unwatch = null;
      host = null;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      canvas.remove();
    }
  };
}
