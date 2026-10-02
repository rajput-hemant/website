import {
  BoxGeometry,
  CylinderGeometry,
  Euler,
  InstancedMesh,
  Matrix4,
  Mesh,
  Quaternion,
  Vector3,
} from "three";

import { sceneStore, type SceneState } from "@/lib/scene/store";

import {
  all,
  clamp,
  group,
  lights,
  spring0,
  standard,
  step,
  themed,
  viewBoxCamera,
  type ViewObject,
} from "./kit";

/**
 * The network map's two objects, drawn in the map's own viewBox units on a
 * view laid over the horizontal map: the "you are here" totem on home and
 * the train on /work. The map writes its geometry onto the placeholder.
 */
type Point = readonly [number, number];
type MapLine = { id: string; pts: Point[] };

function readMap(host: HTMLElement) {
  const width = Number(host.dataset.viewWidth) || 1344;
  const [hx = 0, hy = 0] = (host.dataset.here ?? "").split(" ").map(Number);
  let lines: MapLine[] = [];
  try {
    const parsed: unknown = JSON.parse(host.dataset.lines ?? "[]");
    if (Array.isArray(parsed)) lines = parsed.filter(isLine);
  } catch {
    lines = [];
  }
  return { width, here: [hx, hy] as const, lines };
}

function isLine(value: unknown): value is MapLine {
  if (typeof value !== "object" || value === null) return false;
  return (
    "id" in value &&
    typeof value.id === "string" &&
    "pts" in value &&
    Array.isArray(value.pts)
  );
}

/** Length of a polyline and the point and heading `d` along it. */
function along(pts: readonly Point[], d: number) {
  let left = Math.max(0, d);
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    if (!a || !b) continue;
    const seg = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (left <= seg || i === pts.length - 1) {
      const t = seg ? Math.min(1, left / seg) : 0;
      return {
        x: a[0] + (b[0] - a[0]) * t,
        y: a[1] + (b[1] - a[1]) * t,
        angle: Math.atan2(-(b[1] - a[1]), b[0] - a[0]),
      };
    }
    left -= seg;
  }
  const only = pts[0] ?? [0, 0];
  return { x: only[0], y: only[1], angle: 0 };
}

const lengthOf = (pts: readonly Point[]) =>
  pts.reduce((sum, p, i) => {
    const prev = pts[i - 1];
    return prev ? sum + Math.hypot(p[0] - prev[0], p[1] - prev[1]) : sum;
  }, 0);

const midpoint = (pts: readonly Point[]) => along(pts, lengthOf(pts) / 2);

/** Home: a yellow disc on an ink post over "you are here" that leans to the line pointed at. */
export function createTotem(host: HTMLElement): ViewObject {
  const map = readMap(host);
  const view = viewBoxCamera(map.width);
  const root = group();
  lights(root);
  const POST = 46;
  const R = 15;
  const ink = standard({ metalness: 0.4 });
  // A touch of glow keeps the enamel yellow under the side light.
  const signal = standard({ roughness: 0.4, emissiveIntensity: 0.35 });
  const post = new Mesh(new CylinderGeometry(2.2, 2.6, POST, 12), ink);
  post.position.y = POST / 2;
  const disc = new Mesh(new CylinderGeometry(R, R, 5, 36), [
    ink,
    signal,
    signal,
  ]);
  disc.rotation.x = Math.PI / 2;
  disc.position.y = POST + R - 2;
  // Pivot at the marker; a quarter turn shows the disc's edge and depth.
  const totem = group(post, disc);
  totem.position.set(map.here[0], -map.here[1], 0);
  root.add(totem);

  // Roll toward the line across the map, pitch toward its row.
  const roll = spring0();
  const pitch = spring0();
  const target = { roll: 0, pitch: 0 };
  const update = (state: SceneState) => {
    const id = state.hovered ?? state.active;
    const line = map.lines.find((l) => l.id === id);
    if (!line) {
      target.roll = 0;
      target.pitch = 0;
      return;
    }
    const m = midpoint(line.pts);
    const vx = m.x - map.here[0];
    const vy = map.here[1] - m.y;
    target.roll = clamp(-Math.atan2(vx, 900), -0.4, 0.4);
    target.pitch = clamp(-vy / 400, -0.35, 0.35);
  };

  return {
    root,
    camera: view.camera,
    frame(_delta, width, height) {
      view.fit(width, height);
      const rolling = step(roll, target.roll);
      const pitching = step(pitch, target.pitch);
      totem.rotation.set(pitch.x, 0.35, roll.x);
      return rolling || pitching;
    },
    bind() {
      update(sceneStore.getState());
      return all(
        sceneStore.subscribe(update),
        themed((token) => {
          ink.color.set(token("--color-ink"));
          signal.color.set(token("--color-signal"));
          signal.emissive.set(token("--color-signal"));
        })
      );
    },
  };
}

const CARS = 3;
const CAR = { w: 30, h: 11, d: 11, gap: 4 };

/**
 * /work: a three-car train on the active role's line. Reading a line guide
 * runs it along that line; pointing at a key entry sends it there; at rest
 * it waits at "you are here".
 */
export function createTrain(host: HTMLElement): ViewObject {
  const map = readMap(host);
  const view = viewBoxCamera(map.width);
  const root = group();
  lights(root);
  const body = standard({ metalness: 0.3 });
  const band = standard({ roughness: 0.4 });
  const cars = new InstancedMesh(
    new BoxGeometry(CAR.w, CAR.h, CAR.d),
    body,
    CARS
  );
  const stripe = new InstancedMesh(
    new BoxGeometry(CAR.w + 0.4, 3, CAR.d + 0.4),
    band,
    CARS
  );
  root.add(cars, stripe);

  const pos = Array.from({ length: CARS }, () => ({
    x: spring0(map.here[0]),
    y: spring0(map.here[1]),
    a: spring0(),
  }));
  let targets = pos.map(() => ({ x: map.here[0], y: map.here[1], a: 0 }));

  const update = (state: SceneState) => {
    const hovered = map.lines.find((l) => l.id === state.hovered);
    const line = hovered ?? map.lines.find((l) => l.id === state.active);
    if (!line) {
      targets = pos.map((_, i) => ({
        x: map.here[0] - i * (CAR.w + CAR.gap),
        y: map.here[1],
        a: 0,
      }));
      return;
    }
    const len = lengthOf(line.pts);
    let t = 1;
    if (!hovered) {
      // How far through this role's guide the scroll is.
      const roles = state.items.filter((item) => item.id.startsWith("role:"));
      const i = roles.findIndex((item) => item.id === line.id);
      if (i >= 0) t = clamp(state.progress * roles.length - i, 0, 1);
    }
    const head = CARS * (CAR.w + CAR.gap);
    targets = pos.map((_, i) => {
      const d = Math.min(len, head + t * Math.max(0, len - head));
      const p = along(line.pts, d - CAR.w / 2 - i * (CAR.w + CAR.gap));
      return { x: p.x, y: p.y, a: p.angle };
    });
  };

  const m = new Matrix4();
  const q = new Quaternion();
  const e = new Euler();
  const v = new Vector3();
  const one = new Vector3(1, 1, 1);
  const place = () => {
    pos.forEach((p, i) => {
      // Tipped back so the roof shows, then turned along the track.
      e.set(0.6, 0, p.a.x, "ZYX");
      q.setFromEuler(e);
      v.set(p.x.x, -p.y.x + 3, 6);
      m.compose(v, q, one);
      cars.setMatrixAt(i, m);
      stripe.setMatrixAt(i, m);
    });
    cars.instanceMatrix.needsUpdate = true;
    stripe.instanceMatrix.needsUpdate = true;
  };
  place();

  return {
    root,
    camera: view.camera,
    frame(_delta, width, height) {
      view.fit(width, height);
      let moving = false;
      pos.forEach((p, i) => {
        const target = targets[i];
        if (!target) return;
        moving = step(p.x, target.x, 0.06, 0.8) || moving;
        moving = step(p.y, target.y, 0.06, 0.8) || moving;
        moving = step(p.a, target.a, 0.08, 0.78) || moving;
      });
      place();
      return moving;
    },
    bind() {
      update(sceneStore.getState());
      return all(
        sceneStore.subscribe(update),
        themed((token) => {
          body.color.set(token("--color-ink"));
          band.color.set(token("--color-signal"));
        })
      );
    },
  };
}
