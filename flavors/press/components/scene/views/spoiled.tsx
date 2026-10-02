import { ITEM, VIEW, VIEW_EVENT } from "@/flavors/press/lib/scene/views";
import {
  BoxGeometry,
  CylinderGeometry,
  DoubleSide,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  Mesh,
  Object3D,
  TorusGeometry,
  Vector3,
} from "three";

import { kick, motionOn } from "@/lib/scene/clock";
import { sceneStore } from "@/lib/scene/store";

import {
  clamp,
  createDamp,
  hoveredKey,
  inkColour,
  inks,
  onTheme,
  PressView,
  visibleSize,
  whiteMaterial,
  type ViewWorld,
} from "./kit";

const BALL_FIT = {
  width: 0,
  height: 1.6,
  aim: [0, 0.6, 0],
  from: [0, 0.3, 1],
  fov: 22,
} as const;
const G = -9;
const BALL_R = 0.2;

/** A crumpled sheet: an icosphere pushed in and out by a fixed hash per vertex. */
function crumple() {
  const geo = new IcosahedronGeometry(BALL_R, 2);
  const pos = geo.attributes.position;
  const v = new Vector3();
  if (pos) {
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const h = Math.sin(v.x * 91.3 + v.y * 47.1 + v.z * 13.7) * 43758.5453;
      v.multiplyScalar(0.8 + (h - Math.floor(h)) * 0.35);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * A spoiled sheet crumpled into a ball beside the press, and a bin. Drag
 * and flick it (a mouse or pen), or tap it on touch, and it arcs toward
 * the bin; in the bin, the spoiled press prints another sheet and a new
 * ball comes back. With motion off the ball rests in the bin.
 */
function createBall(el: HTMLElement | null): ViewWorld {
  const m = inks();
  const root = new Group();
  const ball = new Mesh(crumple(), m.sheet);
  const binMat = m.inkSoft.clone();
  binMat.side = DoubleSide;
  const offTheme = onTheme(() => binMat.color.copy(m.inkSoft.color));
  const bin = new Mesh(
    new CylinderGeometry(0.34, 0.26, 0.6, 24, 1, true).translate(0, 0.3, 0),
    binMat
  );
  root.add(ball, bin);
  const size = () => visibleSize(el, BALL_FIT);
  const home = () => new Vector3(-size().width / 2 + 0.5, BALL_R, 0);
  const binAt = () => size().width / 2 - 0.5;
  const p = home();
  const v = new Vector3();
  let flying = false;
  let dragging: { id: number; x: number; y: number; t: number } | null = null;
  let respawnAt = -1;
  let now = 0;

  const toWorld = (e: PointerEvent) => {
    const r = el?.getBoundingClientRect();
    if (!r) return new Vector3();
    const s = size();
    return new Vector3(
      ((e.clientX - r.left) / r.width - 0.5) * s.width,
      (0.5 - (e.clientY - r.top) / r.height) * s.height + 0.6,
      0
    );
  };
  const throwTo = (vx: number, vy: number) => {
    v.set(clamp(vx, -8, 8), clamp(vy, -2, 7), 0);
    flying = true;
    kick();
  };
  const down = (e: PointerEvent) => {
    if (!motionOn() || flying) return;
    const w = toWorld(e);
    if (w.distanceTo(p) > BALL_R * 2.5) return;
    if (e.pointerType === "touch") {
      // A tap lobs it at the bin.
      const dx = binAt() - p.x;
      throwTo(dx / 0.9, -G * 0.45);
      return;
    }
    dragging = { id: e.pointerId, x: w.x, y: w.y, t: performance.now() };
    el?.setPointerCapture(e.pointerId);
  };
  const move = (e: PointerEvent) => {
    if (!dragging || e.pointerId !== dragging.id) return;
    const w = toWorld(e);
    const t = performance.now();
    const dt = Math.max(1, t - dragging.t) / 1000;
    v.set((w.x - dragging.x) / dt, (w.y - dragging.y) / dt, 0);
    dragging = { ...dragging, x: w.x, y: w.y, t };
    p.set(w.x, Math.max(BALL_R, w.y), 0);
    kick();
  };
  const up = (e: PointerEvent) => {
    if (!dragging || e.pointerId !== dragging.id) return;
    dragging = null;
    throwTo(v.x, v.y);
  };
  el?.addEventListener("pointerdown", down);
  el?.addEventListener("pointermove", move);
  el?.addEventListener("pointerup", up);
  el?.addEventListener("pointercancel", up);

  return {
    root,
    frame(delta) {
      now += delta;
      const s = size();
      bin.position.x = binAt();
      if (!motionOn()) {
        flying = false;
        p.set(binAt(), 0.3, 0);
      } else if (flying) {
        v.y += G * delta;
        p.addScaledVector(v, delta);
        const inBin = Math.abs(p.x - binAt()) < 0.26 && p.y < 0.6 && v.y < 0;
        if (inBin) {
          flying = false;
          p.set(binAt(), 0.25, 0);
          respawnAt = now + 0.7;
          dispatchEvent(new Event(VIEW_EVENT.feed));
        } else if (p.y <= BALL_R) {
          // Missed: it rolls to a stop on the floor.
          p.y = BALL_R;
          v.y = Math.abs(v.y) > 1 ? -v.y * 0.35 : 0;
          v.x *= 0.7;
          if (Math.abs(v.x) < 0.05 && v.y === 0) flying = false;
        }
        p.x = clamp(p.x, -s.width / 2 + BALL_R, s.width / 2 - BALL_R);
        kick();
      } else if (respawnAt >= 0 && now >= respawnAt) {
        respawnAt = -1;
        p.copy(home());
      } else if (respawnAt >= 0) {
        kick();
      }
      ball.position.copy(p);
      ball.rotation.z = -p.x / BALL_R;
    },
    dispose() {
      offTheme();
      el?.removeEventListener("pointerdown", down);
      el?.removeEventListener("pointermove", move);
      el?.removeEventListener("pointerup", up);
      el?.removeEventListener("pointercancel", up);
    },
  };
}

const TARGETS = 5;
const TARGET_FIT = {
  width: 0,
  height: 0.8,
  aim: [0, 0, 0],
  from: [0, 0, 1],
  fov: 20,
} as const;
const dummy = new Object3D();

/**
 * Five registration targets scattered far out of register above the list
 * of sheets. Pointing at a sheet registers the nearest target and turns it
 * toward the link. With motion off they sit in register.
 */
function createTargets(el: HTMLElement | null): ViewWorld {
  const rings = new InstancedMesh(
    new TorusGeometry(0.16, 0.018, 6, 36),
    whiteMaterial(0.5),
    TARGETS * 3
  );
  const cross = new InstancedMesh(
    new BoxGeometry(0.44, 0.012, 0.012),
    inks().ink,
    TARGETS * 2
  );
  const INKS = ["yellow", "pink", "blue"] as const;
  const colours = () => {
    for (let i = 0; i < TARGETS * 3; i++)
      rings.setColorAt(i, inkColour(INKS[i % 3] ?? "ink"));
    if (rings.instanceColor) rings.instanceColor.needsUpdate = true;
  };
  colours();
  const offTheme = onTheme(colours);
  const root = new Group();
  root.add(rings, cross);
  // Each plate's fixed offset out of register, per target.
  const off = Array.from({ length: TARGETS * 3 }, (_, i) => {
    const h = Math.sin(i * 12.9898) * 43758.5453;
    const a = (h - Math.floor(h)) * Math.PI * 2;
    return [Math.cos(a) * 0.09, Math.sin(a) * 0.09] as const;
  });
  const d = createDamp(
    Object.fromEntries(
      Array.from({ length: TARGETS }, (_, i) => [String(i), 1])
    )
  );
  const turn = createDamp(
    Object.fromEntries(
      Array.from({ length: TARGETS }, (_, i) => [String(i), 0])
    )
  );
  return {
    root,
    frame(delta) {
      const live = motionOn();
      const { width } = visibleSize(el, TARGET_FIT);
      const key = hoveredKey(sceneStore.getState().hovered, ITEM.sheet);
      const links = [
        ...document.querySelectorAll<HTMLElement>(
          `[data-scene-item^="${ITEM.sheet}:"]`
        ),
      ];
      const box = el?.getBoundingClientRect();
      const link =
        key === null ? null : links[Number(key)]?.getBoundingClientRect();
      const fx =
        link && box
          ? (link.left + link.width / 2 - box.left) / Math.max(1, box.width)
          : -1;
      const xs = Array.from(
        { length: TARGETS },
        (_, t) => ((t + 0.5) / TARGETS - 0.5) * width * 0.9
      );
      const nearest =
        fx < 0
          ? -1
          : xs.reduce(
              (best, x, t) =>
                Math.abs(x - (fx - 0.5) * width) <
                Math.abs((xs[best] ?? 0) - (fx - 0.5) * width)
                  ? t
                  : best,
              0
            );
      for (let t = 0; t < TARGETS; t++) {
        d.to(String(t), live && t !== nearest ? 1 : 0, 0.16, delta);
        // Turn toward the link below: the nearer it is, the less it turns.
        const aim =
          t === nearest && link && box
            ? clamp(((fx - 0.5) * width - (xs[t] ?? 0)) * 0.8, -0.6, 0.6)
            : 0;
        turn.to(String(t), live ? aim : 0, 0.16, delta);
        const k = d.v[String(t)] ?? 0;
        const x = xs[t] ?? 0;
        for (let p = 0; p < 3; p++) {
          const [ox, oy] = off[t * 3 + p] ?? [0, 0];
          dummy.position.set(x + ox * k, oy * k, p * 0.004);
          dummy.rotation.set(0.5, turn.v[String(t)] ?? 0, 0);
          dummy.updateMatrix();
          rings.setMatrixAt(t * 3 + p, dummy.matrix);
        }
        for (let c = 0; c < 2; c++) {
          dummy.position.set(x, 0, 0.01);
          dummy.rotation.set(0.5, turn.v[String(t)] ?? 0, (c * Math.PI) / 2);
          dummy.updateMatrix();
          cross.setMatrixAt(t * 2 + c, dummy.matrix);
        }
      }
      rings.instanceMatrix.needsUpdate = true;
      cross.instanceMatrix.needsUpdate = true;
      d.end();
      turn.end();
    },
    dispose: offTheme,
  };
}

export const Ball = () => (
  <PressView id={VIEW.ball} fit={BALL_FIT} create={createBall} />
);

export const Targets = () => (
  <PressView id={VIEW.targets} fit={TARGET_FIT} create={createTargets} />
);
