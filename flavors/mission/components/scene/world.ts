import {
  asSceneRoute,
  craftAngle,
  decodeBoard,
  litAt,
  orbitRadius,
  poses,
  rigAngles,
  SITE,
  VIEW,
  type Board,
  type Pose,
} from "@/flavors/mission/lib/scene/poses";
import { onScrub, scrubTime } from "@/flavors/mission/lib/scrub";
import {
  BufferGeometry,
  CircleGeometry,
  Float32BufferAttribute,
  Group,
  Line,
  LineBasicMaterial,
  LineSegments,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  OctahedronGeometry,
  OrthographicCamera,
  Scene,
  SphereGeometry,
  Vector3,
  type WebGLRenderer,
} from "three";

import { kick, motionOn, settle } from "@/lib/scene/clock";
import { tokenColor, watchTheme } from "@/lib/scene/colors";
import { input, sceneStore } from "@/lib/scene/store";

const D = Math.PI / 180;
const N = 120;
/** How far round the globe starts before it settles on the launch site. */
const SETTLE_TURN = 1.3;
const PITCH_LIMIT = 1.2;

const EMPTY: Board = { now: 0, orbits: [] };

/** Approaches `target` at `rate` per 60th of a second; returns whether it still moves. */
function approach(value: number, target: number, rate: number, dt: number) {
  const d = target - value;
  if (Math.abs(d) < 1e-4) return { value: target, moving: false };
  return { value: value + d * (1 - Math.pow(1 - rate, dt * 60)), moving: true };
}

const sph = (lat: number, lon: number, r = 1) =>
  new Vector3(
    r * Math.cos(lat) * Math.sin(lon),
    r * Math.sin(lat),
    r * Math.cos(lat) * Math.cos(lon)
  );

function segments(points: number[], material: LineBasicMaterial) {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(points, 3));
  return new LineSegments(geometry, material);
}

function ring(r: number, n: number) {
  const p: number[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 2 * Math.PI;
    const b = ((i + 1) / n) * 2 * Math.PI;
    p.push(
      Math.cos(a) * r,
      Math.sin(a) * r,
      0,
      Math.cos(b) * r,
      Math.sin(b) * r,
      0
    );
  }
  return p;
}

type OrbitMesh = {
  line: Line<BufferGeometry, LineBasicMaterial>;
  craft: Mesh;
  r: number;
  group: Group;
};

/**
 * Fig. 1: a small orthographic globe in hidden line. A 15 degree graticule
 * behind an occluding sphere in the ground colour, the limb drawn over it,
 * the launch site at Mathura, and one orbit per phase, inclined by the
 * months it lasted and turned to its start month. Orbits active at the
 * scrubbed time burn red with their craft. Everything eases in `frame`,
 * which reports when it has settled, so nothing renders while it is still.
 */
export function createWorld(renderer: WebGLRenderer) {
  const scene = new Scene();
  const camera = new OrthographicCamera(-VIEW, VIEW, VIEW, -VIEW, 0.1, 20);
  camera.position.set(0, 0, 10);

  const rig = new Group();
  scene.add(rig);

  const fill = new MeshBasicMaterial({
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });
  const grid = new LineBasicMaterial({ transparent: true, opacity: 0.3 });
  const limbMat = new LineBasicMaterial({ depthTest: false });
  const redLine = new LineBasicMaterial();
  const redFill = new MeshBasicMaterial();

  rig.add(new Mesh(new SphereGeometry(1, 64, 40), fill));
  const gp: number[] = [];
  const seg = (a: Vector3, b: Vector3) => gp.push(a.x, a.y, a.z, b.x, b.y, b.z);
  for (let lat = -75; lat <= 75; lat += 15) {
    for (let i = 0; i < N; i++) {
      seg(
        sph(lat * D, (i / N) * 2 * Math.PI),
        sph(lat * D, ((i + 1) / N) * 2 * Math.PI)
      );
    }
  }
  for (let lon = 0; lon < 360; lon += 15) {
    for (let i = 0; i < N / 2; i++) {
      seg(
        sph((i / (N / 2) - 0.5) * Math.PI, lon * D),
        sph(((i + 1) / (N / 2) - 0.5) * Math.PI, lon * D)
      );
    }
  }
  rig.add(segments(gp, grid));
  const limb = segments(ring(1, N), limbMat);
  limb.renderOrder = 9;
  scene.add(limb);

  const at = sph(SITE.lat * D, SITE.lon * D, 1.004);
  const site = new Group();
  site.position.copy(at);
  site.lookAt(at.clone().multiplyScalar(2));
  site.add(segments(ring(0.065, 40), redLine));
  site.add(segments([0, 0, 0, 0, 0, 0.26], redLine));
  site.add(new Mesh(new CircleGeometry(0.024, 20), redFill));
  rig.add(site);

  const craftGeometry = new OctahedronGeometry(0.05);
  let orbits: OrbitMesh[] = [];
  let board: Board = EMPTY;
  let boardKey: string | null = null;
  let pose: Pose = poses[asSceneRoute(sceneStore.getState().route)];
  let T = scrubTime() ?? board.now;
  let colors = { ink: "#121417", red: "#d2291d" };

  const light = () => {
    orbits.forEach((o, i) => {
      const orbit = board.orbits[i];
      const lit = orbit ? litAt(pose, orbit, T) : false;
      o.line.material.color.set(lit ? colors.red : colors.ink);
      o.line.material.opacity = lit ? 1 : 0.32;
      o.craft.visible = lit;
      if (lit && orbit) {
        const a = craftAngle(orbit, T);
        o.craft.position.set(Math.cos(a) * o.r, 0, Math.sin(a) * o.r);
      }
    });
  };

  const build = (next: Board) => {
    for (const o of orbits) {
      o.group.removeFromParent();
      o.line.geometry.dispose();
      o.line.material.dispose();
    }
    orbits = next.orbits.map((orbit, i) => {
      const r = orbitRadius(i);
      const outer = new Group();
      const inner = new Group();
      outer.rotation.y = orbit.node * D;
      inner.rotation.x = orbit.inc * D;
      outer.add(inner);
      rig.add(outer);
      const cp: number[] = [];
      for (let k = 0; k <= 160; k++) {
        const a = (k / 160) * 2 * Math.PI;
        cp.push(Math.cos(a) * r, 0, Math.sin(a) * r);
      }
      const geometry = new BufferGeometry();
      geometry.setAttribute("position", new Float32BufferAttribute(cp, 3));
      const line = new Line(
        geometry,
        new LineBasicMaterial({ transparent: true })
      );
      inner.add(line);
      const craft = new Mesh(craftGeometry, redFill);
      inner.add(craft);
      return { line, craft, r, group: outer };
    });
    light();
  };

  const setBoard = (value: string | null) => {
    if (value === boardKey) return;
    boardKey = value;
    board = decodeBoard(value) ?? EMPTY;
    T = scrubTime() ?? board.now;
    build(board);
  };

  const paint = () => {
    colors = {
      ink: tokenColor("--color-ink", "#121417"),
      red: tokenColor("--color-signal", "#d2291d"),
    };
    fill.color.set(tokenColor("--color-ground", "#f4f5f3"));
    grid.color.set(colors.ink);
    limbMat.color.set(colors.ink);
    redLine.color.set(colors.red);
    redFill.color.set(colors.red);
    light();
    kick();
  };

  setBoard(sceneStore.getState().board);
  paint();
  const offTheme = watchTheme(paint);

  const start = rigAngles(pose);
  const S = {
    yaw: start.yaw + (motionOn() ? SETTLE_TURN : 0),
    pitch: start.pitch,
    ty: start.yaw,
    tp: start.pitch,
  };
  let dragFrom: { yaw: number; pitch: number } | null = null;
  let last = 0;

  const offStore = sceneStore.subscribe((state, prev) => {
    if (state.route !== prev.route) {
      pose = poses[asSceneRoute(state.route)];
      const next = rigAngles(pose);
      S.ty = next.yaw;
      S.tp = next.pitch;
      light();
    }
    if (state.board !== prev.board) setBoard(state.board);
    kick();
  });

  const offScrub = onScrub((t) => {
    T = t ?? board.now;
    light();
    kick();
  });

  function frame(width: number, height: number, time: number) {
    const dt = Math.min(Math.max(time - last, 0), 1 / 20);
    last = time;
    let busy = false;

    if (input.dragging) {
      dragFrom ??= { yaw: S.ty, pitch: S.tp };
      S.ty = dragFrom.yaw + input.dragX * 0.008;
      S.tp = MathUtils.clamp(
        dragFrom.pitch + input.dragY * 0.006,
        -PITCH_LIMIT,
        PITCH_LIMIT
      );
    } else {
      dragFrom = null;
    }

    // Reduced motion snaps into place; a drag is direct manipulation and still eases.
    if (motionOn() || input.dragging) {
      const rate = input.dragging ? 0.2 : 0.085;
      const yaw = approach(S.yaw, S.ty, rate, dt);
      const pitch = approach(S.pitch, S.tp, rate, dt);
      S.yaw = yaw.value;
      S.pitch = pitch.value;
      busy = yaw.moving || pitch.moving;
    } else {
      S.yaw = S.ty;
      S.pitch = S.tp;
    }
    rig.rotation.set(S.pitch, S.yaw, 0);

    const aspect = width / Math.max(1, height);
    const wide = aspect >= 1;
    camera.left = wide ? -VIEW * aspect : -VIEW;
    camera.right = wide ? VIEW * aspect : VIEW;
    camera.top = wide ? VIEW : VIEW / aspect;
    camera.bottom = wide ? -VIEW : -VIEW / aspect;
    camera.updateProjectionMatrix();

    renderer.render(scene, camera);
    settle(busy);
  }

  return {
    frame,
    dispose() {
      offStore();
      offTheme();
      offScrub();
    },
  };
}
