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

/**
 * A camera orbit around `target`: `az` from +z towards +x, `el` above the
 * horizon, both in radians. `drawer` (0-based) slides out by `open`.
 */
export type Pose = {
  target: Vec3;
  dist: number;
  az: number;
  el: number;
  fov: number;
  drawer: number | null;
  open: number;
};

const T: Vec3 = [TABLE.x, TABLE.y, TABLE.z];

export const poses: Record<SceneRoute, Pose> = {
  home: {
    target: [0.2, -0.15, 0],
    dist: 13,
    az: 0.62,
    el: 0.32,
    fov: 22,
    drawer: null,
    open: 0,
  },
  projects: {
    target: [0, drawerY(0) + 0.5, 1.6],
    dist: 10.5,
    az: 0.38,
    el: 0.36,
    fov: 22,
    drawer: 0,
    open: 1.4,
  },
  project: {
    target: T,
    dist: 8,
    az: 0.15,
    el: 0.95,
    fov: 22,
    drawer: 0,
    open: 0.3,
  },
  work: {
    target: [1.4, -0.2, 0.8],
    dist: 12,
    az: 0.28,
    el: 0.1,
    fov: 24,
    drawer: 1,
    open: 0.35,
  },
  lab: {
    target: [0, CHEST.H / 2 + 0.5, 0],
    dist: 8.5,
    az: 0.5,
    el: 0.38,
    fov: 22,
    drawer: 2,
    open: 0.3,
  },
  about: {
    target: [0, drawerY(3) + 0.4, 1.6],
    dist: 8.5,
    az: 0.3,
    el: 0.72,
    fov: 22,
    drawer: 3,
    open: 1.3,
  },
  now: {
    target: [0.4, drawerY(4) + 0.3, 1.4],
    dist: 9,
    az: 0.55,
    el: 0.32,
    fov: 22,
    drawer: 4,
    open: 1.6,
  },
  ask: {
    target: [T[0] + 0.5, T[1], 0.3],
    dist: 7.5,
    az: 0.45,
    el: 0.62,
    fov: 22,
    drawer: 5,
    open: 0.35,
  },
  resume: {
    target: T,
    dist: 7,
    az: 0,
    el: 1.25,
    fov: 22,
    drawer: 6,
    open: 0.35,
  },
  notfound: {
    target: [0, drawerY(7), 1.8],
    dist: 7.5,
    az: 0.42,
    el: 0.62,
    fov: 22,
    drawer: 7,
    open: 1.7,
  },
};
