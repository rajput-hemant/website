/**
 * The press's route states. No three.js here, so the poster and the loader
 * read the same numbers the scene uses.
 */
export type SceneRoute =
  | "home"
  | "projects"
  | "project"
  | "work"
  | "lab"
  | "about"
  | "now"
  | "ask"
  | "resume"
  | "notfound";

export type Pose = {
  /** Printed large on the sheet, in two plates. */
  glyph: string;
  /** The sheet's slug line. */
  slug: string;
  /** Turn of the whole press, radians. */
  yaw: number;
  /** How far the resting corner is peeled, 0..1. */
  peel: number;
  /** Peeling the corner all the way turns to this sheet. */
  next: string;
  /** A spoiled sheet prints far out of register. */
  spoiled?: boolean;
};

export const poses: Record<SceneRoute, Pose> = {
  home: {
    next: "/projects",
    glyph: "HR",
    slug: "SHEET 1 OF 8  /  HOME",
    yaw: 0,
    peel: 0.28,
  },
  projects: {
    next: "/work",
    glyph: "02",
    slug: "SHEET 2 OF 8  /  SIGNATURES",
    yaw: -0.06,
    peel: 0.22,
  },
  project: {
    next: "/projects",
    glyph: "SIG",
    slug: "SHEET 2 OF 8  /  PROGRESSIVE PROOF",
    yaw: 0.05,
    peel: 0.3,
  },
  work: {
    next: "/lab",
    glyph: "03",
    slug: "SHEET 3 OF 8  /  PRESS LOG",
    yaw: 0.07,
    peel: 0.2,
  },
  lab: {
    next: "/about",
    glyph: "04",
    slug: "SHEET 4 OF 8  /  TEST SHEETS",
    yaw: -0.08,
    peel: 0.34,
  },
  about: {
    next: "/now",
    glyph: "05",
    slug: "SHEET 5 OF 8  /  COLOPHON",
    yaw: 0.04,
    peel: 0.24,
  },
  now: {
    next: "/ask",
    glyph: "06",
    slug: "SHEET 6 OF 8  /  LATEST PROOF",
    yaw: -0.04,
    peel: 0.26,
  },
  ask: {
    next: "/resume",
    glyph: "07",
    slug: "SHEET 7 OF 8  /  CORRECTIONS",
    yaw: 0.06,
    peel: 0.3,
  },
  resume: {
    next: "/",
    glyph: "08",
    slug: "SHEET 8 OF 8  /  FINAL PRINT",
    yaw: -0.03,
    peel: 0.18,
  },
  notfound: {
    next: "/",
    glyph: "404",
    slug: "SPOILED SHEET  /  NOT IN THE SET",
    yaw: -0.1,
    peel: 0.46,
    spoiled: true,
  },
};

/** The shared store holds any edition's route; this narrows it to ours. */
export const asSceneRoute = (route: string): SceneRoute =>
  route in poses ? (route as SceneRoute) : "home";
