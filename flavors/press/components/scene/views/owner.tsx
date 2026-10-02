import { VIEW } from "@/flavors/press/lib/scene/views";
import {
  BoxGeometry,
  Group,
  InstancedMesh,
  Object3D,
  TorusGeometry,
} from "three";

import { kick, motionOn } from "@/lib/scene/clock";

import {
  createDamp,
  inkColour,
  inks,
  onTheme,
  PressView,
  watchAttribute,
  whiteMaterial,
  type ViewWorld,
} from "./kit";

const FIT = {
  width: 1.6,
  height: 1.4,
  aim: [0, 0, 0],
  from: [0.25, 0.6, 1],
  fov: 22,
} as const;
/** The sign-in says where it is with `data-owner-state`: out, busy, error or in. */
const SIGN_IN = "[data-owner-state]";
/** The quoins' slide from loose to locked, and the error shake: cycles, px-ish units. */
const LOCK = 0.05;
const SHAKE_S = 0.36;

const dummy = new Object3D();

/**
 * A chase by the sign-in: a metal frame locked by two quoins. They tighten
 * when the author is signed in and loosen on an error with a short shake
 * (motion on only).
 */
function createChase(): ViewWorld {
  const m = inks();
  const frame = new InstancedMesh(new BoxGeometry(1, 1, 1), m.inkSoft, 4);
  [
    [0, 0.55, 1.2, 0.1],
    [0, -0.55, 1.2, 0.1],
    [-0.55, 0, 0.1, 1.2],
    [0.55, 0, 0.1, 1.2],
  ].forEach(([x, z, sx, sz], i) => {
    dummy.position.set(x ?? 0, 0, z ?? 0);
    dummy.scale.set(sx ?? 1, 0.12, sz ?? 1);
    dummy.updateMatrix();
    frame.setMatrixAt(i, dummy.matrix);
  });
  const quoins = new InstancedMesh(new BoxGeometry(0.34, 0.1, 0.12), m.pink, 2);
  const forme = new InstancedMesh(new BoxGeometry(0.8, 0.08, 0.36), m.shade, 1);
  dummy.scale.set(1, 1, 1);
  dummy.position.set(-0.05, 0, -0.1);
  dummy.updateMatrix();
  forme.setMatrixAt(0, dummy.matrix);
  const root = new Group();
  root.add(frame, quoins, forme);
  let state: string | null = null;
  let shakeFrom = -1;
  let now = 0;
  const offState = watchAttribute(SIGN_IN, "data-owner-state", (v) => {
    if (v === "error" && motionOn()) shakeFrom = now;
    state = v;
  });
  const d = createDamp({ lock: 0 });
  return {
    root,
    frame(delta) {
      now += delta;
      d.to("lock", state === "in" ? 1 : 0, 0.14, delta);
      const t = shakeFrom < 0 ? 1 : (now - shakeFrom) / SHAKE_S;
      if (t < 1) d.hold();
      const shake = t < 1 ? Math.sin(t * Math.PI * 6) * 0.03 * (1 - t) : 0;
      [0, 1].forEach((i) => {
        dummy.position.set(0.3 - d.v.lock * LOCK + shake, 0, i ? 0.25 : 0.05);
        dummy.rotation.set(0, i ? 0.12 : -0.12, 0);
        dummy.updateMatrix();
        quoins.setMatrixAt(i, dummy.matrix);
      });
      quoins.instanceMatrix.needsUpdate = true;
      d.end();
    },
    dispose: offState,
  };
}

/**
 * A registration target of three rings (yellow, pink, blue) by the sign-in:
 * typing in the passphrase spreads them apart with the speed of typing,
 * and signing in brings them into register. With motion off they stay in
 * register.
 */
function createTarget(): ViewWorld {
  const rings = new InstancedMesh(
    new TorusGeometry(0.4, 0.035, 8, 48),
    whiteMaterial(0.5),
    3
  );
  const INKS = ["yellow", "pink", "blue"] as const;
  const colours = () => {
    INKS.forEach((ink, i) => rings.setColorAt(i, inkColour(ink)));
    if (rings.instanceColor) rings.instanceColor.needsUpdate = true;
  };
  colours();
  const offTheme = onTheme(colours);
  let energy = 0;
  let last = 0;
  const typed = (e: Event) => {
    if (!(e.target instanceof Element) || !e.target.closest(SIGN_IN)) return;
    const now = performance.now();
    // Faster typing, bigger spread: each key adds more the sooner it follows.
    energy = Math.min(
      1,
      energy + Math.min(0.35, 60 / Math.max(60, now - last))
    );
    last = now;
    kick();
  };
  const submitted = (e: Event) => {
    if (e.target instanceof Element && e.target.closest(SIGN_IN)) {
      energy = 0;
      kick();
    }
  };
  document.addEventListener("input", typed);
  document.addEventListener("submit", submitted);
  const d = createDamp({ spread: 0 });
  return {
    root: rings,
    frame(delta) {
      energy = Math.max(0, energy - delta * 0.6);
      if (energy > 0) d.hold();
      d.to("spread", motionOn() ? energy : 0, 0.2, delta);
      const s = d.v.spread * 0.18;
      [
        [-s, s],
        [s, 0],
        [0, -s],
      ].forEach(([x, y], i) => {
        dummy.position.set(x ?? 0, y ?? 0, i * 0.01);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        rings.setMatrixAt(i, dummy.matrix);
      });
      rings.instanceMatrix.needsUpdate = true;
      d.end();
    },
    dispose() {
      offTheme();
      document.removeEventListener("input", typed);
      document.removeEventListener("submit", submitted);
    },
  };
}

export const Chase = () => (
  <PressView id={VIEW.chase} fit={FIT} create={createChase} />
);

export const Target = () => (
  <PressView
    id={VIEW.target}
    fit={{ width: 1.3, height: 1.3, from: [0, 0, 1], fov: 22 }}
    create={createTarget}
  />
);
