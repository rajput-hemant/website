/**
 * The model's route states. No three.js here, so the poster and the loader
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
  /** Turn of the plinth, radians; positive turns it clockwise seen from above. */
  yaw: number;
  /** How far above the model the eye sits, radians from level. */
  pitch: number;
  /** The label on the plinth's edge. */
  caption: string;
};

export const poses: Record<SceneRoute, Pose> = {
  home: { yaw: -0.4, pitch: 0.5, caption: "Site model, 14 pieces" },
  projects: { yaw: -0.25, pitch: 0.62, caption: "Every piece in its material" },
  project: {
    yaw: -0.5,
    pitch: 0.46,
    caption: "The piece, lifted off the site",
  },
  work: { yaw: -0.18, pitch: 0.7, caption: "Phasing model, one slab per role" },
  lab: { yaw: 0.3, pitch: 0.55, caption: "Test massing" },
  about: { yaw: 0.35, pitch: 0.45, caption: "The studio's model" },
  now: { yaw: -0.3, pitch: 0.58, caption: "Current revision" },
  ask: { yaw: 0.2, pitch: 0.6, caption: "Comment cards pinned to the model" },
  resume: { yaw: -0.2, pitch: 0.5, caption: "The model as built" },
  notfound: { yaw: 0.5, pitch: 0.52, caption: "Site cleared" },
};

export const isSceneRoute = (route: string): route is SceneRoute =>
  Object.prototype.hasOwnProperty.call(poses, route);

/** The shared store holds any edition's route; this narrows it to ours. */
export const poseFor = (route: string): Pose =>
  isSceneRoute(route) ? poses[route] : poses.home;
