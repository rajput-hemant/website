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
  CanvasTexture,
  CylinderGeometry,
  InstancedMesh,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  RepeatWrapping,
} from "three";

/**
 * A paper spindle: a roll of tractor-feed paper (sprocket holes and green
 * bars, so a turn shows) between two chrome end caps, with the sheet's lip
 * hanging off the front. It advances one notch per log detent.
 */
export type Spindle = Mounted & { to: (notch: number) => void };

/** Degrees the roll turns per notch. */
export const NOTCH = 36;
const DEG = Math.PI / 180;

let parts: {
  roll: CylinderGeometry;
  cap: ReturnType<typeof turned>;
  lip: PlaneGeometry;
  paper: CanvasTexture;
} | null = null;

function feedPaper(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 256, 64);
    // Green bars around the roll (u), sprocket holes along both edges (v).
    ctx.fillStyle = "#dfe8cf";
    for (let u = 0; u < 256; u += 64) ctx.fillRect(u, 0, 32, 64);
    ctx.fillStyle = "#8f8b82";
    for (let u = 4; u < 256; u += 16) {
      ctx.beginPath();
      ctx.arc(u, 4, 2, 0, Math.PI * 2);
      ctx.arc(u, 60, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  return texture;
}

function geometry() {
  if (parts) return parts;
  const roll = new CylinderGeometry(1, 1, 1, 40, 1, true);
  // The cylinder's axis (y) along x.
  roll.rotateZ(Math.PI / 2);
  const cap = turned(
    [
      [0.001, 0.14],
      [0.8, 0.14],
      [1.08, 0.08],
      [1.1, 0],
    ],
    32
  );
  // Caps face outward along x.
  cap.rotateY(Math.PI / 2);
  const lip = new PlaneGeometry(1, 1);
  lip.translate(0, -0.5, 0);
  parts = { roll, cap, lip, paper: feedPaper() };
  return parts;
}

type SpindlePart = Part & { goal: number };

function createSpindle(notch: number): SpindlePart {
  const stage = createStage();
  const { roll, cap, lip, paper } = geometry();
  const sheet = new MeshStandardMaterial({ map: paper });
  const chrome = new MeshStandardMaterial();
  const rollMesh = new Mesh(roll, sheet);
  const caps = new InstancedMesh(cap, chrome, 2);
  const lipMesh = new Mesh(lip, sheet);
  stage.root.add(rollMesh, caps, lipMesh);
  const angle: Sprung = { x: notch * NOTCH, v: 0 };
  const o = new Object3D();

  const part: SpindlePart = {
    stage,
    goal: notch,
    paint() {
      finish(sheet, "paper");
      finish(chrome, "chrome");
    },
    resize(w, h) {
      const r = Math.max(h / 2 - 5, 3);
      const length = Math.max(w - 4 * r, 8);
      rollMesh.scale.set(length, r, r);
      rollMesh.position.set(0, 2, 0);
      for (let i = 0; i < 2; i++) {
        const side = i === 0 ? -1 : 1;
        o.position.set((side * length) / 2, 2, 0);
        o.rotation.set(0, i === 0 ? Math.PI : 0, 0);
        o.scale.setScalar(r);
        o.updateMatrix();
        caps.setMatrixAt(i, o.matrix);
      }
      caps.instanceMatrix.needsUpdate = true;
      // The lip leaves the roll's front and hangs toward the reader.
      lipMesh.scale.set(length - 2, r * 0.9, 1);
      lipMesh.position.set(0, 2 - r * 0.2, r * 0.98);
      lipMesh.rotation.x = -0.35;
    },
    step(dt) {
      const moving = spring(angle, part.goal * NOTCH, dt);
      // Paper feeds forward: the front of the roll moves down.
      rollMesh.rotation.x = angle.x * DEG;
      return moving;
    },
  };
  return part;
}

let spindle: SpindlePart | null = null;

/** The session's spindle. */
export function attachSpindle(
  host: HTMLElement,
  options: BenchOptions,
  notch: number
): Spindle {
  const part = (spindle ??= createSpindle(notch));
  part.goal = notch;
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
