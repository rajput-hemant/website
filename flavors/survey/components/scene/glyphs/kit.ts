import {
  BufferGeometry,
  Color,
  DoubleSide,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  type Object3D,
} from "three";

import { tokenColor } from "@/lib/scene/colors";

/**
 * What every Survey glyph shares: the sheet's inks as unlit materials, one
 * spring, a framing camera and a turntable. Glyphs pose a single root group
 * (`Group`), so a later inspect control can take hold of one object.
 */

export const DEG = Math.PI / 180;

export const motionOn = () => document.documentElement.dataset.motion === "on";

export type Spring = { x: number; v: number };

/** Critically damped by default (stiffness 380, damping 32: about 180ms), as the props'. */
export function spring(
  s: Spring,
  target: number,
  dt: number,
  k = 380,
  c = 32
): boolean {
  for (let t = dt; t > 0; t -= 1 / 120) {
    const h = Math.min(t, 1 / 120);
    s.v += (k * (target - s.x) - c * s.v) * h;
    s.x += s.v * h;
  }
  if (Math.abs(s.v) < 0.05 && Math.abs(target - s.x) < 0.05) {
    s.x = target;
    s.v = 0;
    return false;
  }
  return true;
}

/** Springs with motion on, snaps with it off; whether it still moves. */
export function ease(s: Spring, target: number, dt: number, motion: boolean) {
  if (motion) return spring(s, target, dt);
  s.x = target;
  s.v = 0;
  return false;
}

/** The inks a glyph may use, each one colour token. */
export type Ink =
  "ink" | "sheet" | "faint" | "contour" | "water" | "revision" | "wood";

const TOKENS: Record<Ink, [string, string]> = {
  ink: ["--color-ink", "#1c2a2b"],
  sheet: ["--color-sheet", "#ebefe7"],
  faint: ["--color-ink-faint", "#536361"],
  contour: ["--color-contour", "#9a5b2a"],
  water: ["--color-water", "#255f8a"],
  revision: ["--color-revision", "#7a4aa5"],
  wood: ["--color-wood", "#36683a"],
};
const INKS = Object.keys(TOKENS) as Ink[];

/** The eight stepped layer tints, lowland to summit. */
export const TINTS = 8;

function createInks() {
  const fill = (): MeshBasicMaterial =>
    // Faces sit a hair behind their edges.
    new MeshBasicMaterial({
      // Open shells (skirts, lids) show both faces; closed ones hide the back by depth.
      side: DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
  const fills = Object.fromEntries(INKS.map((i) => [i, fill()])) as Record<
    Ink,
    MeshBasicMaterial
  >;
  const lines = Object.fromEntries(
    INKS.map((i) => [i, new LineBasicMaterial()])
  ) as Record<Ink, LineBasicMaterial>;
  /** Stepped tints for vertex-coloured ground, read by `tint`. */
  const tints = Array.from({ length: TINTS }, () => new Color());
  /** Vertex-coloured faces (the ground), in the tints. */
  const ground = new MeshBasicMaterial({
    vertexColors: true,
    side: DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });
  const listeners = new Set<() => void>();
  const paint = () => {
    for (const ink of INKS) {
      const css = tokenColor(...TOKENS[ink]);
      fills[ink].color.set(css);
      lines[ink].color.set(css);
    }
    tints.forEach((c, i) => c.set(tokenColor(`--color-tint-${i + 1}`)));
    for (const listener of listeners) listener();
  };
  return {
    fills,
    lines,
    tints,
    ground,
    paint,
    /** Runs after each paint, for colours baked into geometry. */
    onPaint(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

let inks: ReturnType<typeof createInks> | null = null;

/** The page's glyph inks (one set, shared); `paint` re-reads the tokens. */
export const glyphInks = () => (inks ??= createInks());

/**
 * A model drawn the Survey way: an unlit fill with its ink edges (creases
 * over `angle` degrees and open borders).
 */
export function outlined(
  geometry: BufferGeometry,
  fill: MeshBasicMaterial,
  edge: LineBasicMaterial,
  angle = 15
): Group {
  const group = new Group();
  group.add(new Mesh(geometry, fill));
  group.add(new LineSegments(new EdgesGeometry(geometry, angle), edge));
  return group;
}

/** Frees the geometry under `root`; the materials are the page's and stay. */
export function disposeGeometry(root: Object3D) {
  root.traverse((o) => {
    if ("geometry" in o && o.geometry instanceof BufferGeometry) {
      o.geometry.dispose();
    }
  });
}

/**
 * An orthographic camera looking down at `elevation` degrees on a box
 * `extent` wide (half-width) about (0, `lookY`, 0). `aspect` is width over
 * height of the glyph's canvas.
 */
export function glyphCamera(
  extent: number,
  elevation: number,
  lookY = 0,
  aspect = 1
): OrthographicCamera {
  const camera = new OrthographicCamera(
    -extent,
    extent,
    extent / aspect,
    -extent / aspect,
    0.1,
    200
  );
  const e = elevation * DEG;
  camera.position.set(0, lookY + Math.sin(e) * 80, Math.cos(e) * 80);
  camera.lookAt(0, lookY, 0);
  return camera;
}

export type TurntableOptions = {
  /** Degrees of yaw at rest. */
  rest: number;
  /** Degrees per CSS pixel dragged. */
  perPx?: number;
  /** Velocity kept per 16ms once let go; 0 springs back to rest instead. */
  friction?: number;
  /** Largest lean toward the pointer, in degrees. */
  lean?: number;
  /** Yaw allowed either side of rest, in degrees (Infinity: all the way round). */
  range?: number;
};

/**
 * Yaw and lean for a glyph under a pointer: a drag turns it, a flick coasts
 * on (when `friction` is set and motion is on) or springs back to rest (when
 * it is 0), the pointer leans it, and `aim` springs it to a bearing. With
 * motion off nothing coasts, eases or leans; it moves only under the drag.
 */
export function createTurntable({
  rest,
  perPx = 1.4,
  friction = 0.92,
  lean: maxLean = 8,
  range = Infinity,
}: TurntableOptions) {
  const yaw: Spring = { x: rest, v: 0 };
  const tiltX: Spring = { x: 0, v: 0 };
  const tiltZ: Spring = { x: 0, v: 0 };
  const target = { yaw: rest, x: 0, z: 0 };
  const clampYaw = (v: number) =>
    Math.min(rest + range, Math.max(rest - range, v));
  let spin = 0;
  let coasting = false;
  let held: { x: number; samples: { dx: number; t: number }[] } | null = null;

  return {
    /** Current yaw and lean (x about the camera's right, z about its view), in degrees. */
    get yaw() {
      return yaw.x;
    },
    get tiltX() {
      return tiltX.x;
    },
    get tiltZ() {
      return tiltZ.x;
    },
    get held() {
      return held !== null;
    },
    /** Advance by `dt` seconds; whether it still moves. */
    step(dt: number): boolean {
      const motion = motionOn();
      let moving = false;
      if (held) {
        yaw.v = 0;
      } else if (coasting) {
        yaw.x = clampYaw(yaw.x + spin * dt);
        spin *= Math.pow(friction, dt / 0.016);
        if (Math.abs(spin) < 4 || Math.abs(yaw.x - rest) >= range) {
          spin = 0;
          coasting = false;
          target.yaw = yaw.x;
        } else moving = true;
      } else if (ease(yaw, target.yaw, dt, motion)) moving = true;

      const lx = motion ? target.x : 0;
      const lz = motion ? target.z : 0;
      if (ease(tiltX, lx, dt, motion)) moving = true;
      if (ease(tiltZ, lz, dt, motion)) moving = true;
      return moving;
    },
    grab(clientX: number) {
      held = { x: clientX, samples: [] };
      coasting = false;
      spin = 0;
    },
    drag(clientX: number) {
      if (!held) return;
      const now = performance.now();
      const dx = clientX - held.x;
      held.samples.push({ dx, t: now });
      held.samples = held.samples.filter((s) => now - s.t < 90);
      held.x = clientX;
      yaw.x = clampYaw(yaw.x + dx * perPx);
      target.yaw = yaw.x;
    },
    release() {
      if (!held) return;
      const recent = held.samples;
      held = null;
      if (friction === 0) {
        target.yaw = rest;
        return;
      }
      const first = recent[0];
      const span = first ? (performance.now() - first.t) / 1000 : 0;
      const moved = recent.reduce((sum, s) => sum + s.dx, 0);
      // With motion off it stops where it was let go.
      spin =
        motionOn() && span > 0 ? (moved * perPx) / Math.max(span, 1 / 60) : 0;
      coasting = spin !== 0;
      target.yaw = yaw.x;
    },
    /** Lean toward the pointer, -1 to 1 across the glyph; (0, 0) stands it up. */
    lean(x: number, y: number) {
      target.z = -x * maxLean;
      target.x = y * maxLean;
    },
    /** Spring to `degrees` past rest. */
    aim(degrees: number) {
      held = null;
      coasting = false;
      spin = 0;
      target.yaw = clampYaw(rest + degrees);
    },
  };
}

export type Turntable = ReturnType<typeof createTurntable>;

/**
 * The pointer surface every draggable glyph exposes to its DOM host (the
 * same shape as the monument's).
 */
export type Handle = {
  /** Detach the glyph; the poster comes back. */
  detach(): void;
  grab(clientX: number): void;
  drag(clientX: number): void;
  release(): void;
  lean(x: number, y: number): void;
  aim(degrees: number): void;
};

/** A turntable's pointer methods, each kicking the glyph. */
export function turntableHandle(
  table: Turntable,
  kick: () => void,
  detach: () => void
): Handle {
  return {
    detach,
    grab(x) {
      table.grab(x);
      kick();
    },
    drag(x) {
      table.drag(x);
      kick();
    },
    release() {
      table.release();
      kick();
    },
    lean(x, y) {
      table.lean(x, y);
      kick();
    },
    aim(degrees) {
      table.aim(degrees);
      kick();
    },
  };
}
