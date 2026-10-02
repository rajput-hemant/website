import {
  BoxGeometry,
  CylinderGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

import { kick, motionOn } from "@/lib/scene/clock";
import { onSceneEvent } from "@/lib/scene/store";

import {
  all,
  bindHover,
  clamp,
  fitCamera,
  group,
  lights,
  spring0,
  standard,
  step,
  themed,
  type ViewObject,
} from "./kit";

const SIGN = { s: 1, rod: 1.3 };
const TAU = Math.PI * 2;

/**
 * /ask: the information desk's "i" sign hanging above "How the desk works".
 * The pointer nearby leans it, like the indicator; a sent notice turns it
 * once round on its rods, with the chime.
 */
export function createInfoSign(host: HTMLElement): ViewObject {
  const root = group();
  lights(root);
  const enamel = standard({ color: "#0a5eb0", roughness: 0.4 });
  const cube = new Mesh(
    new RoundedBoxGeometry(SIGN.s, SIGN.s, SIGN.s * 0.5, 3, 0.08),
    enamel
  );
  // The "i": a dot and a stem, one geometry, on both faces.
  const parts = [1, -1].flatMap((side) => {
    const stem = new BoxGeometry(0.14, 0.42, 0.02);
    stem.translate(0, -0.1, (side * SIGN.s) / 4 + side * 0.005);
    const dot = new CylinderGeometry(0.085, 0.085, 0.02, 20);
    dot.rotateX(Math.PI / 2);
    dot.translate(0, 0.25, (side * SIGN.s) / 4 + side * 0.005);
    return [stem, dot];
  });
  const glyph = new Mesh(
    mergeGeometries(parts) ?? parts[0],
    new MeshBasicMaterial({ color: "#ffffff" })
  );
  const rodMaterial = standard({ color: "#14191e", metalness: 0.6 });
  const rods = new InstancedMesh(
    new CylinderGeometry(0.018, 0.018, SIGN.rod, 8),
    rodMaterial,
    2
  );
  const m = new Matrix4();
  [-0.3, 0.3].forEach((x, i) =>
    rods.setMatrixAt(i, m.makeTranslation(x, SIGN.s / 2 + SIGN.rod / 2, 0))
  );
  const sign = group(cube, glyph, rods);
  sign.position.y = -(SIGN.s / 2 + SIGN.rod);
  // The pivot is where the rods meet the ceiling.
  const pivot = group(sign);
  pivot.position.y = SIGN.s / 2 + SIGN.rod - 0.35;
  root.add(pivot);
  const view = fitCamera(24);

  const yaw = spring0();
  const pitch = spring0();
  const spin = spring0();
  let spins = 0;
  const lean = { x: 0, y: 0 };

  return {
    root,
    camera: view.camera,
    frame(_delta, width, height) {
      view.fit(
        width,
        height,
        [SIGN.s * 1.8, SIGN.s + SIGN.rod],
        [0, 0, 0],
        [-0.2, 0.1, 1]
      );
      let moving = step(yaw, lean.x * 0.25, 0.05, 0.88);
      moving = step(pitch, -lean.y * 0.08, 0.05, 0.88) || moving;
      moving = step(spin, spins * TAU, 0.04, 0.9) || moving;
      pivot.rotation.set(pitch.x, yaw.x + spin.x - 0.3, 0);
      return moving;
    },
    bind() {
      const move = (e: PointerEvent) => {
        if (e.pointerType === "touch" || !motionOn()) return;
        const r = host.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
        const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
        // Only a pointer near the sign leans it.
        const near = Math.abs(nx) < 2.5 && Math.abs(ny) < 2.5;
        const next = near
          ? { x: clamp(nx, -1, 1), y: clamp(ny, -1, 1) }
          : { x: 0, y: 0 };
        if (next.x === lean.x && next.y === lean.y) return;
        lean.x = next.x;
        lean.y = next.y;
        kick();
      };
      addEventListener("pointermove", move, { passive: true });
      return all(
        () => removeEventListener("pointermove", move),
        onSceneEvent((event) => {
          if (event.type !== "ask:sent" || !motionOn()) return;
          spins++;
          kick();
        }),
        themed((token) => {
          enamel.color.set(token("--color-line-3"));
          rodMaterial.color.set(token("--color-ink"));
        })
      );
    },
  };
}

const SLIPS = 5;
const SLIP = { w: 0.5, h: 0.03, d: 0.3 };

/**
 * /ask: a ticket validator by the send button. A sent notice drops a slip
 * into its tray (at most five, oldest first out); pointing at the tray
 * lifts the last one.
 */
export function createValidator(host: HTMLElement): ViewObject {
  const root = group();
  lights(root);
  const casing = standard({ color: "#14191e", metalness: 0.45 });
  const housing = new BoxGeometry(0.8, 0.9, 0.5);
  housing.translate(0, 0.45, -0.1);
  const tray = new BoxGeometry(0.9, 0.08, 0.5);
  tray.translate(0, 0.04, 0.35);
  const lip = new BoxGeometry(0.9, 0.12, 0.04);
  lip.translate(0, 0.1, 0.58);
  const body = new Mesh(
    mergeGeometries([housing, tray, lip]) ?? housing,
    casing
  );
  const slotMaterial = new MeshBasicMaterial({ color: "#ffc20e" });
  const slot = new Mesh(new BoxGeometry(0.56, 0.05, 0.01), slotMaterial);
  slot.position.set(0, 0.72, 0.151);
  const slips = new InstancedMesh(
    new BoxGeometry(SLIP.w, SLIP.h, SLIP.d),
    standard({ color: "#efe4c8", roughness: 0.8, metalness: 0 }),
    SLIPS
  );
  slips.count = 0;
  const machine = group(body, slot, slips);
  machine.rotation.set(0.35, -0.5, 0);
  root.add(machine);
  const view = fitCamera(24);

  let count = 0;
  /** The newest slip's drop, from the slot (1) into the tray (0). */
  const fall = spring0();
  const lift = spring0();
  let over = false;
  const m = new Matrix4();
  const place = () => {
    slips.count = count;
    for (let i = 0; i < count; i++) {
      const newest = i === count - 1;
      const y = 0.1 + i * SLIP.h + (newest ? fall.x * 0.62 + lift.x : 0);
      const z = 0.35 + (newest ? fall.x * -0.3 : 0);
      m.makeRotationY((i % 2 ? 1 : -1) * 0.08 * i).setPosition(0, y, z);
      slips.setMatrixAt(i, m);
    }
    slips.instanceMatrix.needsUpdate = true;
  };

  return {
    root,
    camera: view.camera,
    frame(_delta, width, height) {
      view.fit(width, height, [1.3, 1.25], [0, 0.45, 0.1], [0, 0.15, 1]);
      let moving = step(fall, 0, 0.09, 0.72);
      moving = step(lift, over && count ? 0.18 : 0, 0.1, 0.75) || moving;
      place();
      return moving;
    },
    bind() {
      return all(
        onSceneEvent((event) => {
          if (event.type !== "ask:sent") return;
          count = Math.min(SLIPS, count + 1);
          fall.x = motionOn() ? 1 : 0;
          fall.v = 0;
          place();
          kick();
        }),
        bindHover(host, (inside) => (over = inside)),
        themed((token) => slotMaterial.color.set(token("--color-signal")))
      );
    },
  };
}
