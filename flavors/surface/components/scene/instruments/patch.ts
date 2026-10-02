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
import {
  CatmullRomCurve3,
  InstancedMesh,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  TubeGeometry,
  Vector3,
} from "three";

/**
 * A patch bay: an Out jack, a row of sockets and one plug on a sagging
 * cable (a Catmull-Rom tube, rebuilt only while the plug moves). Drag the
 * plug into a socket and it seats with the spring; let go anywhere else and
 * it swings back to hang under the Out jack.
 */
export type Patch = Mounted & {
  /** Pick the plug up if (x, y) is on it (slot px from the centre, y up). */
  grab: (x: number, y: number) => boolean;
  move: (x: number, y: number) => void;
  /** Let go: the socket it seated in, or null (it swings home). */
  release: () => number | null;
  /** Where the plug is now, in slot px, for the DOM grip that follows it. */
  plug: () => { x: number; y: number };
};

export type PatchLayout = {
  /** The Out jack's and every socket's centre, as fractions of the slot's width. */
  out: number;
  sockets: readonly number[];
  /** The jacks' row, in px down from the slot's top. */
  row: number;
};

/** Plug unit (its sleeve radius), socket radius, and how near counts as in. */
const UNIT = 8;
const SOCKET = 9;
export const SEAT = 18;
const DEG = Math.PI / 180;
/** The plug's back, where the cable leaves it, in plug units along its axis. */
const BACK = 2.4;

let parts: {
  jack: ReturnType<typeof turned>;
  plug: ReturnType<typeof turned>;
} | null = null;

function geometry() {
  if (parts) return parts;
  parts = {
    jack: turned(
      [
        [0.42, -0.3],
        [0.42, 0.22],
        [0.56, 0.3],
        [0.92, 0.3],
        [1, 0.18],
        [1.02, 0],
      ],
      24
    ),
    plug: turned(
      [
        [0.001, BACK],
        [0.28, BACK],
        [0.5, 2.2],
        [0.66, 1.6],
        [0.62, 0.3],
        [0.34, 0.1],
        [0.34, -0.2],
        [0.18, -0.3],
        [0.16, -0.85],
        [0.001, -0.9],
      ],
      20
    ),
  };
  return parts;
}

type PatchPart = Part & {
  layout: PatchLayout;
  seated: number | null;
  held: { x: number; y: number } | null;
  x: Sprung;
  y: Sprung;
};

function createPatch(layout: PatchLayout): PatchPart {
  const stage = createStage();
  const { jack, plug } = geometry();
  const chrome = new MeshStandardMaterial();
  const rubber = new MeshStandardMaterial({ metalness: 0, roughness: 0.55 });
  const jacks = new InstancedMesh(jack, chrome, layout.sockets.length + 1);
  const plugMesh = new Mesh(plug, rubber);
  const cable = new Mesh(undefined, rubber);
  stage.root.add(jacks, cable, plugMesh);
  plugMesh.scale.setScalar(UNIT);
  const lift = { x: 8 };
  const hang = { x: -70 };
  const o = new Object3D();
  const back = new Vector3();
  let drawn = "";

  const at = (fraction: number) => (fraction - 0.5) * stage.size.w;
  const rowY = () => stage.size.h / 2 - part.layout.row;
  const rest = () => ({ x: at(part.layout.out) + 26, y: rowY() - 44 });
  const socketAt = (i: number) => ({
    x: at(part.layout.sockets[i] ?? 0.5),
    y: rowY(),
  });

  const part: PatchPart = {
    stage,
    layout,
    seated: null,
    held: null,
    x: { x: 0, v: 0 },
    y: { x: 0, v: 0 },
    paint() {
      finish(chrome, "chrome");
      finish(rubber, "bakelite");
    },
    resize() {
      const all = [part.layout.out, ...part.layout.sockets];
      all.forEach((fraction, i) => {
        o.position.set(at(fraction), rowY(), 0);
        o.scale.setScalar(SOCKET);
        o.updateMatrix();
        jacks.setMatrixAt(i, o.matrix);
      });
      jacks.instanceMatrix.needsUpdate = true;
      // A new width moves the jacks; the plug goes with them, no swing.
      const goal = part.seated !== null ? socketAt(part.seated) : rest();
      part.x.x = goal.x;
      part.y.x = goal.y;
      part.x.v = part.y.v = 0;
      drawn = "";
    },
    step(dt) {
      let moving = false;
      if (part.held) {
        part.x.x = part.held.x;
        part.y.x = part.held.y;
        part.x.v = part.y.v = 0;
      } else {
        const goal = part.seated !== null ? socketAt(part.seated) : rest();
        if (spring(part.x, goal.x, dt)) moving = true;
        if (spring(part.y, goal.y, dt)) moving = true;
      }
      const seated = part.seated !== null && !part.held;
      if (ease(lift, seated ? 0 : part.held ? 16 : 8, 18, dt)) moving = true;
      if (ease(hang, seated ? 0 : part.held ? -35 : -70, 14, dt)) moving = true;
      plugMesh.position.set(part.x.x, part.y.x, lift.x);
      plugMesh.rotation.set(hang.x * DEG, 0, 0);

      const key = `${part.x.x.toFixed(2)},${part.y.x.toFixed(2)},${lift.x.toFixed(2)},${hang.x.toFixed(2)}`;
      if (key !== drawn) {
        drawn = key;
        rebuild();
      }
      return moving;
    },
  };

  function rebuild() {
    const a = hang.x * DEG;
    back
      .set(0, -BACK * UNIT * Math.sin(a), BACK * UNIT * Math.cos(a))
      .add(plugMesh.position);
    const out = new Vector3(at(part.layout.out), rowY(), 2);
    const dir = new Vector3(0, -Math.sin(a), Math.cos(a));
    const span = Math.hypot(back.x - out.x, back.y - out.y);
    const sag = 14 + span * 0.18;
    const curve = new CatmullRomCurve3([
      out,
      new Vector3(out.x, out.y - 3, 12),
      new Vector3((out.x + back.x) / 2, Math.min(out.y, back.y) - sag, 16),
      back.clone().addScaledVector(dir, 7),
      back.clone(),
    ]);
    cable.geometry.dispose();
    cable.geometry = new TubeGeometry(curve, 40, 2.2, 6);
  }

  return part;
}

const bays = new Map<string, PatchPart>();

/** A patch bay; the same `key` remembers which socket its plug is in. */
export function attachPatch(
  host: HTMLElement,
  options: BenchOptions,
  key: string,
  layout: PatchLayout
): Patch {
  let part = bays.get(key);
  if (!part || part.layout.sockets.length !== layout.sockets.length) {
    part = createPatch(layout);
    bays.set(key, part);
  }
  const bay = part;
  bay.layout = layout;
  bay.held = null;
  const mounted = mount(host, bay, options);
  const socketAt = (i: number) => ({
    x: ((bay.layout.sockets[i] ?? 0.5) - 0.5) * bay.stage.size.w,
    y: bay.stage.size.h / 2 - bay.layout.row,
  });
  return {
    ...mounted,
    grab(x, y) {
      if (Math.hypot(x - bay.x.x, y - bay.y.x) > SEAT) return false;
      bay.held = { x, y };
      bay.seated = null;
      mounted.kick();
      return true;
    },
    move(x, y) {
      if (!bay.held) return;
      bay.held = { x, y };
      mounted.kick();
    },
    release() {
      const held = bay.held;
      if (!held) return null;
      bay.held = null;
      let best: number | null = null;
      let near = SEAT;
      for (let i = 0; i < bay.layout.sockets.length; i++) {
        const s = socketAt(i);
        const d = Math.hypot(held.x - s.x, held.y - s.y);
        if (d <= near) {
          near = d;
          best = i;
        }
      }
      bay.seated = best;
      mounted.kick();
      return best;
    },
    plug: () => ({ x: bay.x.x, y: bay.y.x }),
  };
}
