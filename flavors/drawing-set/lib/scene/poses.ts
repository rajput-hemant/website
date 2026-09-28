export type SceneRoute =
  | "home"
  | "projects"
  | "project"
  | "work"
  | "about"
  | "now"
  | "ask"
  | "lab"
  | "resume"
  | "notfound";

export type Drawer = {
  id: string;
  sheet: string;
  letter: string;
  label: string;
  href: string;
};

/** The labelled drawers, top to bottom. The chest has one more, unlabelled, for 404. */
export const drawers: readonly Drawer[] = [
  {
    id: "drawer:01",
    sheet: "01",
    letter: "A",
    label: "Projects",
    href: "/projects",
  },
  {
    id: "drawer:02",
    sheet: "02",
    letter: "B",
    label: "Experience",
    href: "/work",
  },
  { id: "drawer:03", sheet: "03", letter: "C", label: "Lab", href: "/lab" },
  { id: "drawer:04", sheet: "04", letter: "D", label: "About", href: "/about" },
  { id: "drawer:05", sheet: "05", letter: "E", label: "Now", href: "/now" },
  { id: "drawer:06", sheet: "06", letter: "F", label: "Ask", href: "/ask" },
  {
    id: "drawer:07",
    sheet: "07",
    letter: "G",
    label: "Resume",
    href: "/resume",
  },
];

/** Plan chest, in scene units, centred on the origin. */
export const CHEST = { W: 3.6, H: 2.8, D: 2.3, N: 8 } as const;
export const DH = (CHEST.H - 0.3) / CHEST.N;
export const drawerY = (k: number) => CHEST.H / 2 - 0.2 - DH * k - DH / 2;

/** Drafting table board centre and its tilt about x (far edge up). */
export const TABLE = { x: -4.8, y: 0.3, z: 0, tilt: 0.2 } as const;

export type Vec3 = [number, number, number];

/** A point in the board's local frame (y up from its centre plane) in world space. */
export function onBoard([x, y, z]: Vec3): Vec3 {
  const c = Math.cos(TABLE.tilt);
  const s = Math.sin(TABLE.tilt);
  return [TABLE.x + x, TABLE.y + y * c - z * s, TABLE.z + y * s + z * c];
}

/** Scales a route's props by `scale` about the world point `at`, then moves them by `lift`. */
export type PropStage = { at: Vec3; scale: number; lift?: Vec3 };

/**
 * A camera orbit around `target`: `az` from +z towards +x, `el` above the
 * horizon, both in radians. `frame` is the world width and height that must
 * stay in view whatever the slot's aspect. `drawer` (0-based) slides out by
 * `open`.
 */
export type Pose = {
  target: Vec3;
  frame: [number, number];
  /** Moves the picture right by this fraction of the half-width (wide slots only). */
  shift?: number;
  /**
   * Narrow slots only: moves the picture right by this fraction of the
   * half-width. The ensemble projects right of the pivot, so it is negative;
   * defaults to NARROW.shift.
   */
  narrowShift?: number;
  az: number;
  el: number;
  fov: number;
  drawer: number | null;
  open: number;
  prop?: PropStage;
};

/**
 * Narrow (phone) slots are width-bound, and at every pose's angle the
 * ensemble projects well inside the frame width and right of the pivot. They
 * fit `fit` of the frame width and slide the picture by `shift` of the
 * half-width (a pose's `narrowShift` overrides it) to centre it.
 */
export const NARROW = { fit: 0.85, shift: -0.1 } as const;

/** Where the tray sits on the board, in the board's local frame. */
export const TRAY: Vec3 = [0.55, 0.03, 0.25];

/**
 * The table and chest together, with room for an open drawer and the route
 * props. Every route frames all of it: zooming into one piece would crop the
 * other at the slot edge, so routes differ by angle and by what moves.
 */
const ENSEMBLE = {
  target: [-2.3, -0.1, 0.5] as Vec3,
  frame: [10, 5.4] as [number, number],
};

export const poses: Record<SceneRoute, Pose> = {
  home: {
    target: ENSEMBLE.target,
    frame: ENSEMBLE.frame,
    // Clears the CTAs on the left; the orbit still pivots on the group centre.
    shift: 0.2,
    narrowShift: -0.14,
    az: 0.62,
    el: 0.32,
    fov: 22,
    drawer: null,
    open: 0,
  },
  projects: {
    target: ENSEMBLE.target,
    frame: ENSEMBLE.frame,
    az: 0.38,
    el: 0.36,
    fov: 22,
    drawer: 0,
    open: 1.4,
    narrowShift: -0.08,
    prop: {
      at: [0, drawerY(0) - 0.1, CHEST.D / 2 + 1.1],
      scale: 1.5,
      lift: [0, -0.05, 0.25],
    },
  },
  project: {
    target: ENSEMBLE.target,
    frame: ENSEMBLE.frame,
    az: 0.15,
    el: 0.95,
    fov: 22,
    drawer: 0,
    open: 0.3,
  },
  work: {
    target: ENSEMBLE.target,
    // The low angle enlarges the near side, so it needs a wider frame.
    frame: [11.5, 5.8],
    az: 0.28,
    el: 0.1,
    fov: 24,
    drawer: 1,
    open: 0.35,
    prop: {
      at: [CHEST.W / 2 + 0.55, 0.05, CHEST.D / 2 + 0.15],
      scale: 1.1,
      lift: [0.1, 0, 0.3],
    },
  },
  lab: {
    target: ENSEMBLE.target,
    frame: ENSEMBLE.frame,
    az: 0.5,
    el: 0.38,
    fov: 22,
    drawer: 2,
    open: 0.3,
    // The lift keeps the scaled base resting on the top slab (0.145 * 0.4).
    prop: { at: [0, CHEST.H / 2 + 0.225, 0], scale: 1.4, lift: [0, 0.06, 0] },
  },
  about: {
    target: ENSEMBLE.target,
    frame: ENSEMBLE.frame,
    az: 0.3,
    el: 0.72,
    fov: 22,
    drawer: 3,
    open: 1.3,
    narrowShift: -0.06,
    prop: {
      at: [0, drawerY(3) - DH * 0.4, CHEST.D / 2 + 1],
      scale: 1.6,
      lift: [0, 0.05, 0.2],
    },
  },
  now: {
    target: ENSEMBLE.target,
    frame: ENSEMBLE.frame,
    az: 0.55,
    el: 0.32,
    fov: 22,
    drawer: 4,
    open: 1.6,
    prop: { at: [0, drawerY(4) - DH * 0.4, CHEST.D / 2 + 1.3], scale: 1.8 },
  },
  ask: {
    target: ENSEMBLE.target,
    frame: ENSEMBLE.frame,
    az: 0.45,
    el: 0.62,
    fov: 22,
    drawer: 5,
    open: 0.35,
    prop: { at: onBoard(TRAY), scale: 1.5, lift: [-0.35, 0, 0] },
  },
  resume: {
    target: ENSEMBLE.target,
    frame: ENSEMBLE.frame,
    az: 0,
    el: 1.25,
    fov: 22,
    drawer: 6,
    open: 0.35,
  },
  notfound: {
    target: ENSEMBLE.target,
    frame: ENSEMBLE.frame,
    az: 0.42,
    el: 0.62,
    fov: 22,
    drawer: 7,
    open: 1.7,
  },
};

/**
 * Orbit distance that keeps a `width` x `height` frame in view for a vertical
 * `fov` (degrees) and viewport `aspect`, with a little margin for perspective.
 * A `shift` of the picture leaves `1 - shift` of the half-width on its far side.
 */
export function fitDistance(
  [width, height]: readonly [number, number],
  fov: number,
  aspect: number,
  shift = 0
) {
  const t = Math.tan((fov * Math.PI) / 360);
  return (
    Math.max(height / 2 / t, width / 2 / (t * aspect * (1 - shift))) * 1.08
  );
}
