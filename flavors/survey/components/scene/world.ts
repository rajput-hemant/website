import {
  aimLoupe,
  loupe,
  onLoupe,
  restLoupe,
} from "@/flavors/survey/lib/loupe";
import { clamp, SHEET } from "@/flavors/survey/lib/relief";
import {
  decodeBoard,
  fit,
  FULL_SHEET,
  type Board,
  type SheetWindow,
} from "@/flavors/survey/lib/scene/poses";
import {
  Color,
  DoubleSide,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Quaternion,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  Vector4,
  type WebGLRenderer,
} from "three";

import { kick, motionOn, settle, tween } from "@/lib/scene/clock";
import { tokenColor, watchTheme } from "@/lib/scene/colors";
import { input, sceneStore } from "@/lib/scene/store";

import { createOverprint } from "./overprint";
import { createProps } from "./props";
import { fragmentShader, MAX_HILLS, vertexShader } from "./shaders";

/** World height per month in a role; with the camera's 64 degree tilt this is the SVG's 3.4 lift. */
const HEIGHT = SHEET.LIFT / 0.436;
const LOUPE_RADIUS = 80;
const P_MIN = -80;
const P_MAX = 540;
const DISTANCE = 1000;

const FORWARD = new Vector3(0, -0.9, -0.436).normalize();
const UP = new Vector3(0, 0.436, -0.9).normalize();
const Y_AXIS = new Vector3(0, 1, 0);
const X_AXIS = new Vector3(1, 0, 0);

type Spring = { x: number; v: number };
const spring = (s: Spring, target: number, dt: number) => {
  const scale = dt * 60;
  s.v = (s.v + (target - s.x) * 0.08 * scale) * Math.pow(0.82, scale);
  s.x += s.v * scale;
  return Math.abs(s.v) > 1e-5 || Math.abs(target - s.x) > 1e-4;
};

/**
 * The relief model: one displaced plane on an orthographic camera that, at
 * rest, reproduces the sheet's SVG oblique exactly, so the home map's DOM
 * labels sit on the summits. Each page flies the camera to its own window;
 * on inset slots the pointer leans it a few degrees to show the relief.
 */
export function createWorld(renderer: WebGLRenderer) {
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 1, DISTANCE * 3);

  const geometry = new PlaneGeometry(
    SHEET.X1 - SHEET.X0,
    P_MAX - P_MIN,
    380,
    248
  );
  geometry.translate((SHEET.X0 + SHEET.X1) / 2, (P_MIN + P_MAX) / 2, 0);

  const uniforms = {
    uHills: {
      value: Array.from({ length: MAX_HILLS }, () => new Vector4()),
    },
    uCount: { value: 0 },
    uLoupe: { value: new Vector2() },
    uRadius: { value: LOUPE_RADIUS },
    uRing: { value: 0 },
    uCoast: { value: SHEET.X1 as number },
    uHeight: { value: HEIGHT },
    uX0: { value: SHEET.X0 as number },
    uYearW: { value: 190 },
    uPaper: { value: new Color() },
    uTints: { value: Array.from({ length: 8 }, () => new Color()) },
    uContour: { value: new Color() },
    uGrid: { value: new Color() },
    uBoundary: { value: new Color() },
    uSea: { value: new Color() },
    uInk: { value: new Color() },
    uHot: { value: -1 },
    uHotLift: { value: 0 },
    uHotMix: { value: 0 },
    uCurrent: { value: -1 },
    uCut: { value: new Vector4() },
    uRevision: { value: 0 },
    uRevColor: { value: new Color() },
  };
  const material = new ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    // Mapping the plane's (x, p) onto (x, height, z) mirrors it, so its front faces point down.
    side: DoubleSide,
  });
  const mesh = new Mesh(geometry, material);
  mesh.frustumCulled = false;
  scene.add(mesh);

  const TOKENS = {
    paper: ["--color-sheet", "#ebefe7"],
    contour: ["--color-contour", "#9a5b2a"],
    grid: ["--color-water", "#255f8a"],
    boundary: ["--color-ink-soft", "#465755"],
    sea: ["--color-sea", "#d2e1e5"],
    ink: ["--color-ink", "#1c2a2b"],
    inkFaint: ["--color-ink-faint", "#536361"],
    wood: ["--color-wood", "#36683a"],
    revision: ["--color-revision", "#7a4aa5"],
  } as const;
  type Name = keyof typeof TOKENS;
  const names = [
    "paper",
    "contour",
    "grid",
    "boundary",
    "sea",
    "ink",
    "inkFaint",
    "wood",
    "revision",
  ] as const satisfies readonly Name[];
  const TINTS = 8;

  // The colours every material reads by reference; a theme flip tweens them in place.
  const palette = {
    paper: uniforms.uPaper.value,
    contour: uniforms.uContour.value,
    grid: uniforms.uGrid.value,
    boundary: uniforms.uBoundary.value,
    sea: uniforms.uSea.value,
    ink: uniforms.uInk.value,
    inkFaint: new Color(),
    wood: new Color(),
    revision: uniforms.uRevColor.value,
  } satisfies Record<Name, Color>;

  const readColours = () => {
    const set = (token: string, fallback: string) =>
      new Color().setStyle(tokenColor(token, fallback), "srgb-linear");
    return {
      named: names.map((name) => set(TOKENS[name][0], TOKENS[name][1])),
      tints: Array.from({ length: TINTS }, (_, i) =>
        set(`--color-tint-${i + 1}`, "#dbcdaa")
      ),
    };
  };
  type Colours = ReturnType<typeof readColours>;

  const snapshot = (): Colours => ({
    named: names.map((name) => palette[name].clone()),
    tints: uniforms.uTints.value.map((c) => c.clone()),
  });

  const mixColours = (from: Colours, to: Colours, t: number) => {
    names.forEach((name, i) => {
      const a = from.named[i];
      const b = to.named[i];
      if (a && b) palette[name].lerpColors(a, b, t);
    });
    uniforms.uTints.value.forEach((c, i) => {
      const a = from.tints[i];
      const b = to.tints[i];
      if (a && b) c.lerpColors(a, b, t);
    });
    kick();
  };

  const first = readColours();
  mixColours(first, first, 1);

  const offTheme = watchTheme(() => {
    const next = readColours();
    const prev = snapshot();
    if (!motionOn()) {
      mixColours(prev, next, 1);
      return;
    }
    const mix = { t: 0 };
    tween(mix, {
      t: 1,
      duration: 0.22,
      ease: "power2.out",
      onUpdate: () => mixColours(prev, next, mix.t),
      onComplete: () => mixColours(prev, next, 1),
    });
  });

  const props = createProps(scene, {
    paper: palette.paper,
    ink: palette.ink,
    inkFaint: palette.inkFaint,
    water: palette.grid,
    contour: palette.contour,
    wood: palette.wood,
  });
  const overprint = createOverprint(scene, uniforms, palette);

  const view: SheetWindow = { ...FULL_SHEET };
  const yaw: Spring = { x: 0, v: 0 };
  const pitch: Spring = { x: 0, v: 0 };
  let board: Board | null = null;
  let boardText: string | null = null;
  let hovered: string | null = null;

  function applyBoard(next: Board) {
    uniforms.uCount.value = Math.min(MAX_HILLS, next.hills.length);
    next.hills.slice(0, MAX_HILLS).forEach(([x, p, sx, h], i) => {
      uniforms.uHills.value[i]!.set(x, p, sx, h);
    });
    uniforms.uCoast.value = next.coast;
    uniforms.uYearW.value = next.yearW;
    props.setBoard(next);
    overprint.setBoard(next);
    const flying = board !== null;
    board = next;
    if (flying) {
      const d =
        Math.hypot(next.window.cx - view.cx, next.window.cy - view.cy) /
        SHEET.W;
      const duration = d < 0.5 ? 0.9 : 1.2;
      const ease = d < 0.5 ? "expo.out" : "expo.inOut";
      tween(view, { ...next.window, duration, ease });
    } else {
      Object.assign(view, next.window);
    }
  }

  function update(state: ReturnType<typeof sceneStore.getState>) {
    if (state.board !== boardText) {
      boardText = state.board;
      const next = decodeBoard(state.board);
      if (next) applyBoard(next);
    }
    uniforms.uRing.value = state.route === "home" ? 0 : 1;
    overprint.update(state);
    if (state.hovered !== hovered) {
      const point = state.hovered ? board?.points[state.hovered] : undefined;
      if (point) aimLoupe(point[0], point[1]);
      else if (hovered && board?.points[hovered]) restLoupe();
      hovered = state.hovered;
      if (sceneStore.getState().active !== (point ? state.hovered : null)) {
        sceneStore.setState({ active: point ? state.hovered : null });
      }
    }
  }
  update(sceneStore.getState());
  const offStore = sceneStore.subscribe(update);
  // One frame per step of the lens, its last included, and none once it lands.
  const offLoupe = onLoupe(() => kick());

  const pivot = new Vector3();
  const q = new Quaternion();
  const q2 = new Quaternion();
  const forward = new Vector3();
  const up = new Vector3();

  let lastTime = 0;

  function frame(width: number, height: number, time = 0) {
    const dt =
      lastTime > 0
        ? Math.min(Math.max(time - lastTime, 0.001), 1 / 30)
        : 1 / 60;
    lastTime = time;
    const aspect = width / Math.max(1, height);
    const win = fit(view, aspect);
    const leaning =
      sceneStore.getState().route !== "home" &&
      document.documentElement.dataset.motion === "on";
    const lx = leaning && input.inside ? input.px : 0;
    const ly = leaning && input.inside ? input.py : 0;
    let busy = spring(yaw, lx * 0.12, dt);
    busy = spring(pitch, -ly * 0.06, dt) || busy;

    // The window's centre on the ground is the pivot the lean turns about.
    pivot.set(win.cx, 0, (win.cy - SHEET.Y0) / SHEET.YS);
    q.setFromAxisAngle(Y_AXIS, yaw.x);
    q2.setFromAxisAngle(X_AXIS, clamp(pitch.x, -0.2, 0.2));
    q.multiply(q2);
    forward.copy(FORWARD).applyQuaternion(q);
    up.copy(UP).applyQuaternion(q);
    camera.position.copy(pivot).addScaledVector(forward, -DISTANCE);
    camera.up.copy(up);
    camera.lookAt(pivot);
    camera.left = -win.w / 2;
    camera.right = win.w / 2;
    camera.top = win.h / 2;
    camera.bottom = -win.h / 2;
    camera.updateProjectionMatrix();

    uniforms.uLoupe.value.set(loupe.x, loupe.p);
    const state = sceneStore.getState();
    busy =
      props.step({
        dt,
        time,
        now: performance.now(),
        motion: document.documentElement.dataset.motion === "on",
        hovered: state.hovered,
        active: state.active,
        unitsPerPx: win.w / Math.max(1, width),
        pointer: input,
      }) || busy;
    busy =
      overprint.step({
        dt,
        motion: document.documentElement.dataset.motion === "on",
        hovered: state.hovered,
        route: state.route,
      }) || busy;
    renderer.render(scene, camera);
    settle(busy);
  }

  return {
    frame,
    dispose() {
      offStore();
      offLoupe();
      offTheme();
      props.dispose();
      overprint.dispose();
      geometry.dispose();
      material.dispose();
    },
  };
}
