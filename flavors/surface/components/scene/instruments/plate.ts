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
import {
  CanvasTexture,
  ExtrudeGeometry,
  InstancedMesh,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Shape,
} from "three";

/**
 * A brushed aluminium nameplate with four rivets. The brushing is a
 * roughness map of fine horizontal strokes, so leaning the plate toward the
 * pointer (up to 6 degrees) slides a streak of highlight across it. The
 * plate is always light, like the printed rating plates; its legend is DOM.
 */
export type Plate = Mounted & { lean: (x: number, y: number) => void };

export const LEAN = 6;
const DEG = Math.PI / 180;

let rivet: ReturnType<typeof turned> | null = null;
let brushed: CanvasTexture | null = null;

function strokes(): CanvasTexture {
  if (brushed) return brushed;
  const canvas = document.createElement("canvas");
  canvas.width = 4;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    for (let y = 0; y < 256; y++) {
      // Deterministic noise, so every visit gets the same plate.
      const n = (((Math.sin(y * 78.233) * 43758.5453) % 1) + 1) % 1;
      const g = 70 + Math.floor(n * 90);
      ctx.fillStyle = `rgb(${g},${g},${g})`;
      ctx.fillRect(0, y, 4, 1);
    }
  }
  brushed = new CanvasTexture(canvas);
  return brushed;
}

function roundedRect(w: number, h: number, r: number): Shape {
  const s = new Shape();
  s.moveTo(-w / 2 + r, -h / 2);
  s.lineTo(w / 2 - r, -h / 2);
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  s.lineTo(w / 2, h / 2 - r);
  s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  s.lineTo(-w / 2 + r, h / 2);
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  s.lineTo(-w / 2, -h / 2 + r);
  s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return s;
}

type PlatePart = Part & { target: { x: number; y: number } };

function createPlate(): PlatePart {
  const stage = createStage();
  rivet ??= turned(
    [
      [0.001, 0.5],
      [0.6, 0.42],
      [0.92, 0.2],
      [1, 0],
    ],
    16
  );
  const metal = new MeshStandardMaterial({ roughnessMap: strokes() });
  const heads = new MeshStandardMaterial();
  const plate = new Mesh(undefined, metal);
  const rivets = new InstancedMesh(rivet, heads, 4);
  stage.root.add(plate, rivets);
  const tilt = { x: { x: 0 }, y: { x: 0 } };
  const o = new Object3D();

  const part: PlatePart = {
    stage,
    target: { x: 0, y: 0 },
    paint() {
      finish(metal, "aluminium");
      metal.roughness = 1;
      finish(heads, "aluminium");
      heads.roughness = 0.3;
    },
    resize(w, h) {
      // Room for the lean, so a corner never leaves the canvas.
      const pw = w - 6;
      const ph = h - 6;
      plate.geometry.dispose();
      const g = new ExtrudeGeometry(roundedRect(pw, ph, 4), {
        depth: 1.5,
        bevelEnabled: true,
        bevelThickness: 0.8,
        bevelSize: 0.8,
        bevelSegments: 2,
        curveSegments: 4,
      });
      // Strokes run the plate's length: map v across its height.
      const pos = g.attributes.position;
      const uv = g.attributes.uv;
      if (pos && uv) {
        for (let i = 0; i < pos.count; i++) {
          uv.setXY(i, pos.getX(i) / pw + 0.5, pos.getY(i) / ph + 0.5);
        }
      }
      plate.geometry = g;
      for (let i = 0; i < 4; i++) {
        o.position.set(
          (i % 2 === 0 ? -1 : 1) * (pw / 2 - 6),
          (i < 2 ? 1 : -1) * (ph / 2 - 6),
          2.3
        );
        o.scale.setScalar(2.2);
        o.updateMatrix();
        rivets.setMatrixAt(i, o.matrix);
      }
      rivets.instanceMatrix.needsUpdate = true;
    },
    step(dt) {
      let moving = ease(tilt.x, part.target.y * LEAN, 11.87, dt);
      if (ease(tilt.y, part.target.x * LEAN, 11.87, dt)) moving = true;
      stage.root.rotation.set(tilt.x.x * DEG, tilt.y.x * DEG, 0);
      return moving;
    },
  };
  return part;
}

let nameplate: PlatePart | null = null;

/** The session's brushed plate. */
export function attachPlate(host: HTMLElement, options: BenchOptions): Plate {
  const part = (nameplate ??= createPlate());
  part.target.x = part.target.y = 0;
  const mounted = mount(host, part, options);
  return {
    ...mounted,
    lean(x, y) {
      part.target.x = x;
      part.target.y = y;
      mounted.kick();
    },
  };
}
