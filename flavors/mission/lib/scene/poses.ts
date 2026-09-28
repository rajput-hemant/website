import type { Flight } from "@/flavors/mission/lib/flight";

/**
 * Fig. 1, the globe: its route states and the orbits it carries. No three.js
 * here, so the poster, the loader and the scene read the same numbers.
 */
export type SceneRoute =
  | "home"
  | "projects"
  | "work"
  | "lab"
  | "about"
  | "now"
  | "ask"
  | "resume"
  | "notfound";

export type Pose = {
  /** Turn away from the launch site, radians (0 faces Mathura). */
  yaw: number;
  /** Tilt toward the viewer, radians. */
  pitch: number;
  /** Which orbits burn red: those active today, all of them, or none. */
  lit: "now" | "all" | "none";
};

export const poses: Record<SceneRoute, Pose> = {
  home: { yaw: 0, pitch: 0.3, lit: "now" },
  projects: { yaw: -0.5, pitch: 0.22, lit: "now" },
  work: { yaw: 0.4, pitch: 0.42, lit: "now" },
  lab: { yaw: -1.1, pitch: -0.2, lit: "none" },
  about: { yaw: 0, pitch: 0.12, lit: "now" },
  now: { yaw: 0.2, pitch: 0.3, lit: "now" },
  ask: { yaw: 0.9, pitch: 0.36, lit: "now" },
  resume: { yaw: 0, pitch: 0.3, lit: "all" },
  notfound: { yaw: 2.6, pitch: -0.6, lit: "none" },
};

/** The shared store holds any edition's route; this narrows it to ours. */
const isSceneRoute = (route: string): route is SceneRoute =>
  Object.hasOwn(poses, route);

export const asSceneRoute = (route: string): SceneRoute =>
  isSceneRoute(route) ? route : "home";

/** The launch site, Mathura, in degrees. */
export const SITE = { lat: 27.49, lon: 77.67 } as const;

/** One orbit: the phase's span in months from T-0, its inclination and node in degrees. */
export type Orbit = { a: number; b: number | null; inc: number; node: number };

/** What the globe carries, through the slot's `data-scene-board`. */
export type Board = { now: number; orbits: Orbit[] };

export const boardFor = (flight: Flight): Board => ({
  now: flight.now,
  orbits: flight.phases.map(({ a, b, inc, node }) => ({ a, b, inc, node })),
});

/** `now|a,b,inc,node;…`, with an empty `b` for the phase still in flight. */
export function encodeBoard(board: Board): string {
  const orbits = board.orbits
    .map((o) => `${o.a},${o.b ?? ""},${o.inc},${o.node}`)
    .join(";");
  return `${board.now.toFixed(2)}|${orbits}`;
}

export function decodeBoard(value: string | null): Board | null {
  if (!value) return null;
  const [head, body = ""] = value.split("|");
  const now = Number(head);
  if (!head || !Number.isFinite(now)) return null;
  const orbits: Orbit[] = [];
  for (const part of body.split(";")) {
    if (!part) continue;
    const [a, b, inc, node] = part.split(",");
    const orbit = {
      a: Number(a),
      b: b ? Number(b) : null,
      inc: Number(inc),
      node: Number(node),
    };
    if (![orbit.a, orbit.inc, orbit.node].every(Number.isFinite)) return null;
    orbits.push(orbit);
  }
  return { now, orbits };
}

/** Whether an orbit is lit at `t` in this pose. */
export function litAt(pose: Pose, orbit: Orbit, t: number) {
  if (pose.lit === "none") return false;
  if (pose.lit === "all") return true;
  return t >= orbit.a && t < (orbit.b ?? Infinity);
}

/** Radius of the n-th orbit, in globe radii. */
export const orbitRadius = (i: number) => 1.2 + i * 0.1;

/** Half the view, in globe radii: the frame fits the widest orbit. */
export const VIEW = 1.92;

const D = Math.PI / 180;

export type V3 = [number, number, number];

/** A point on the sphere: y up, z toward the viewer at lon 0. */
export const sph = (lat: number, lon: number, r = 1): V3 => [
  r * Math.cos(lat) * Math.sin(lon),
  r * Math.sin(lat),
  r * Math.cos(lat) * Math.cos(lon),
];

const rotX = ([x, y, z]: V3, a: number): V3 => [
  x,
  y * Math.cos(a) - z * Math.sin(a),
  y * Math.sin(a) + z * Math.cos(a),
];

const rotY = ([x, y, z]: V3, a: number): V3 => [
  x * Math.cos(a) + z * Math.sin(a),
  y,
  -x * Math.sin(a) + z * Math.cos(a),
];

/** The rig's turn for a pose: yaw brings the launch site round to face the viewer. */
export const rigAngles = (pose: Pose) => ({
  yaw: -SITE.lon * D + pose.yaw,
  pitch: pose.pitch,
});

/** A world point seen through the rig (three's Euler XYZ: Rx · Ry · p). */
export const view = (p: V3, yaw: number, pitch: number) =>
  rotX(rotY(p, yaw), pitch);

/** A point on orbit i at angle u, before the rig turns it. */
export const orbitPoint = (orbit: Orbit, i: number, u: number): V3 =>
  rotY(
    rotX(
      [Math.cos(u) * orbitRadius(i), 0, Math.sin(u) * orbitRadius(i)],
      orbit.inc * D
    ),
    orbit.node * D
  );

/** Hidden by the globe: behind it and inside its disc. */
export const occluded = ([x, y, z]: V3) => z < 0 && x * x + y * y < 1;

/** Where the craft on a lit orbit sits at `t`: one lap a year. */
export const craftAngle = (orbit: Orbit, t: number) =>
  (-(t - orbit.a) / 12) * 2 * Math.PI;
