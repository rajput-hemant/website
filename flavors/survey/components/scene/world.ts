import { aimLoupe, loupe, restLoupe } from "@/flavors/survey/lib/loupe";
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

import { kick, settle, tween } from "@/lib/scene/clock";
import { tokenColor, watchTheme } from "@/lib/scene/colors";
import { input, sceneStore } from "@/lib/scene/store";

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
const spring = (s: Spring, target: number) => {
  s.v = (s.v + (target - s.x) * 0.08) * 0.82;
  s.x += s.v;
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
    190,
    124
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
  };
  const material = new ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
  });
  const mesh = new Mesh(geometry, material);
  mesh.frustumCulled = false;
  scene.add(mesh);

  const colours = () => {
    // Token colours are sRGB; the renderer outputs them as is.
    const set = (c: Color, token: string, fallback: string) =>
      c.setStyle(tokenColor(token, fallback), "srgb-linear");
    set(uniforms.uPaper.value, "--color-sheet", "#ebefe7");
    uniforms.uTints.value.forEach((c, i) =>
      set(c, `--color-tint-${i + 1}`, "#dbcdaa")
    );
    set(uniforms.uContour.value, "--color-contour", "#9a5b2a");
    set(uniforms.uGrid.value, "--color-water", "#255f8a");
    set(uniforms.uBoundary.value, "--color-ink-soft", "#465755");
    set(uniforms.uSea.value, "--color-sea", "#d2e1e5");
    set(uniforms.uInk.value, "--color-ink", "#1c2a2b");
    kick();
  };
  colours();
  const offTheme = watchTheme(colours);

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
    const flying = board !== null;
    board = next;
    if (flying) {
      tween(view, { ...next.window, duration: 1.4, ease: "expo.inOut" });
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

  const pivot = new Vector3();
  const q = new Quaternion();
  const q2 = new Quaternion();
  const forward = new Vector3();
  const up = new Vector3();

  function frame(width: number, height: number) {
    const aspect = width / Math.max(1, height);
    const win = fit(view, aspect);
    const leaning =
      sceneStore.getState().route !== "home" &&
      document.documentElement.dataset.motion === "on";
    const lx = leaning && input.inside ? input.px : 0;
    const ly = leaning && input.inside ? input.py : 0;
    let busy = spring(yaw, lx * 0.12);
    busy = spring(pitch, -ly * 0.06) || busy;

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
    renderer.render(scene, camera);
    settle(busy);
  }

  return {
    frame,
    dispose() {
      offStore();
      offTheme();
      geometry.dispose();
      material.dispose();
    },
  };
}
