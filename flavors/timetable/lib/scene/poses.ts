/**
 * The indicator's route states. No three.js here, so DOM code (the poster,
 * the loader) can read the same numbers the scene uses.
 */
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

/** The hanging indicator, in scene units, centred on its face. */
export const HOUSING = { W: 4.8, H: 2.1, D: 0.34, rodX: 1.7 } as const;

/** Module rows: count, cell width and height, and the row's centre height. */
export const MODULE_ROWS = [
  { n: 12, w: 0.32, h: 0.56, y: 0.26 },
  { n: 16, w: 0.24, h: 0.36, y: -0.36 },
] as const;

export const MODULE_GAP = 0.036;

export type Pose = {
  /** Turn about the rods, radians; negative shows the right side. */
  yaw: number;
  pitch: number;
  /** How much of the slot width the housing may use (0..1). */
  fit: number;
  /** Painted on the housing's top left, above the modules. */
  plate: string;
  /** What the indicator reads when nothing on the page is pointed at. */
  board: string;
};

export const poses: Record<SceneRoute, Pose> = {
  home: {
    yaw: -0.32,
    pitch: 0.04,
    fit: 0.94,
    plate: "PLATFORM 0",
    board: "CONCOURSE|ALL SERVICES",
  },
  projects: {
    yaw: -0.18,
    pitch: 0.02,
    fit: 0.9,
    plate: "PLATFORM 1",
    board: "PROJECTS|DEPARTURES",
  },
  project: {
    yaw: 0.2,
    pitch: 0.03,
    fit: 0.9,
    plate: "PLATFORM 1",
    board: "PROJECT|NOW BOARDING",
  },
  work: {
    yaw: 0.24,
    pitch: 0.02,
    fit: 0.9,
    plate: "PLATFORM 2",
    board: "EXPERIENCE|NETWORK MAP",
  },
  lab: {
    yaw: -0.4,
    pitch: 0.06,
    fit: 0.9,
    plate: "PLATFORM 3",
    board: "LAB|EXPERIMENTS",
  },
  about: {
    yaw: 0.3,
    pitch: 0.03,
    fit: 0.9,
    plate: "PLATFORM 4",
    board: "ABOUT|STATION GUIDE",
  },
  now: {
    yaw: -0.26,
    pitch: 0.02,
    fit: 0.9,
    plate: "PLATFORM 5",
    board: "NOW|SERVICE UPDATES",
  },
  ask: {
    yaw: 0.16,
    pitch: 0.04,
    fit: 0.9,
    plate: "PLATFORM 6",
    board: "INFORMATION|ASK A QUESTION",
  },
  resume: {
    yaw: -0.12,
    pitch: 0.02,
    fit: 0.9,
    plate: "PLATFORM 7",
    board: "RESUME|PRINTED GUIDE",
  },
  notfound: {
    yaw: -0.5,
    pitch: 0.08,
    fit: 0.9,
    plate: "PLATFORM --",
    board: "NOT IN|SERVICE|404",
  },
};

/** Camera distance that keeps `[width, height]` in view for a slot aspect. */
export function fitDistance(
  [width, height]: readonly [number, number],
  fov: number,
  aspect: number
) {
  const t = Math.tan((fov * Math.PI) / 360);
  return Math.max(height / 2 / t, width / 2 / (t * aspect));
}

/** The shared store holds any edition's route; this narrows it to ours. */
export const asSceneRoute = (route: string): SceneRoute =>
  route in poses ? (route as SceneRoute) : "home";
