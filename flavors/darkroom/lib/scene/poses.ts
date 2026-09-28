/**
 * The tray's route states. No three.js here, so the poster and the loader
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

/** What lies in the tray. */
export type PrintKind = "sheet" | "enlargement" | "test" | "fog";

export type Pose = {
  print: PrintKind;
  /** Turn of the whole tray, radians. */
  yaw: number;
  /** The label pinned beside the tray. */
  caption: string;
};

export const poses: Record<SceneRoute, Pose> = {
  home: { print: "sheet", yaw: -0.14, caption: "Contact print, roll 26" },
  projects: { print: "sheet", yaw: 0.08, caption: "Every frame, one print" },
  project: { print: "enlargement", yaw: -0.06, caption: "Work print" },
  work: { print: "sheet", yaw: 0.12, caption: "One frame per role" },
  lab: { print: "test", yaw: -0.1, caption: "Test strip, six exposures" },
  about: { print: "enlargement", yaw: 0.05, caption: "Enlargement, 8 by 10" },
  now: { print: "sheet", yaw: -0.08, caption: "Still in the developer" },
  ask: { print: "sheet", yaw: 0.1, caption: "One frame per question" },
  resume: { print: "enlargement", yaw: -0.04, caption: "Fibre print" },
  notfound: { print: "fog", yaw: 0.16, caption: "Fogged in the box" },
};

export const isSceneRoute = (route: string): route is SceneRoute =>
  Object.prototype.hasOwnProperty.call(poses, route);

/** The shared store holds any edition's route; this narrows it to ours. */
export const poseFor = (route: string): Pose =>
  isSceneRoute(route) ? poses[route] : poses.home;
