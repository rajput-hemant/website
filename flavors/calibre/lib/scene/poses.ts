import { jewelling, PALLET_STONES } from "../movement";

/**
 * The movement's route states. No three.js here, so the poster and the
 * loader read the same numbers the scene uses.
 */
export type SceneRoute = "home" | "projects" | "project" | "about" | "notfound";

export type Pose = {
  /** Turn of the whole movement about its arbor, radians. */
  turn: number;
  /** Tilt of the caseback towards the viewer, radians. */
  tilt: number;
  /** Whether the balance beats on arrival; a stopped movement rests. */
  running: boolean;
  /** The label under the caseback. */
  caption: string;
};

export const poses: Record<SceneRoute, Pose> = {
  home: { turn: 0, tilt: 0.34, running: true, caption: "Calibre HR-26" },
  projects: { turn: 0.5, tilt: 0.3, running: true, caption: "Every jewel" },
  project: { turn: -0.35, tilt: 0.42, running: true, caption: "Its jewel" },
  about: { turn: 0.9, tilt: 0.26, running: true, caption: "On the bench" },
  notfound: { turn: -0.8, tilt: 0.3, running: false, caption: "Stopped" },
};

export const isSceneRoute = (route: string): route is SceneRoute =>
  Object.prototype.hasOwnProperty.call(poses, route);

/** The shared store holds any edition's route; this narrows it to ours. */
export const poseFor = (route: string): Pose =>
  isSceneRoute(route) ? poses[route] : poses.home;

/**
 * What the movement shows on this page: how many jewels (the project count)
 * and which one is lit, from 1, or 0 for none. Carried as `data-scene-board`.
 */
export type Board = { jewels: number; lit: number };

export const encodeBoard = (board: Board) => `${board.jewels}:${board.lit}`;

/** Reads a board back; anything malformed shows a plain movement. */
export function parseBoard(value: string | null): Board {
  const match = /^(\d{1,3}):(\d{1,3})$/.exec(value ?? "");
  const jewels = Number(match?.[1] ?? PALLET_STONES);
  const lit = Number(match?.[2] ?? 0);
  return { jewels, lit: lit <= jewels ? lit : 0 };
}

export type Setting = {
  /** Jewel number, from 1. */
  n: number;
  x: number;
  y: number;
  /** In a chaton on the plate, or a stone on the pallet fork. */
  on: "chaton" | "pallet";
};

/*
 * Where the parts sit on the plate, in plate units (radius 1, +y up), shared
 * by the poster's drawing and the 3D scene so both show the same movement.
 */
export const LAYOUT = {
  centre: { x: 0, y: 0.06, r: 0.3 },
  third: { x: 0.4, y: 0.42, r: 0.22 },
  fourth: { x: 0.04, y: -0.4, r: 0.2 },
  escape: { x: 0.44, y: -0.12, r: 0.14 },
  balance: { x: -0.46, y: -0.32, r: 0.3 },
  barrel: { x: -0.4, y: 0.44, r: 0.32 },
  fork: { x: 0.2, y: -0.2 },
} as const;

/** Chaton seats on the train's pivots, then round the rim, clockwise from twelve. */
function chatonSeats(count: number): { x: number; y: number }[] {
  const pivots = [
    LAYOUT.centre,
    LAYOUT.third,
    LAYOUT.fourth,
    LAYOUT.escape,
    LAYOUT.balance,
  ].map(({ x, y }) => ({ x, y }));
  const seats: { x: number; y: number }[] = pivots.slice(0, count);
  const rest = count - seats.length;
  for (let i = 0; i < rest; i++) {
    const a = Math.PI / 2 - (i / rest) * Math.PI * 2 - 0.2;
    seats.push({ x: Math.cos(a) * 0.8, y: Math.sin(a) * 0.8 });
  }
  return seats;
}

/** Every jewel's seat: chatons first, then the pallet stones. */
export function settings(jewels: number): Setting[] {
  const { chatons, pallet } = jewelling(jewels);
  const seats: Setting[] = chatonSeats(chatons).map((p, i) => ({
    n: i + 1,
    ...p,
    on: "chaton",
  }));
  for (let i = 0; i < pallet; i++) {
    seats.push({
      n: chatons + i + 1,
      x: LAYOUT.fork.x + (i === 0 ? -0.09 : 0.09),
      y: LAYOUT.fork.y - 0.02,
      on: "pallet",
    });
  }
  return seats;
}
