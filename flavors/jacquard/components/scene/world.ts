import {
  asSceneRoute,
  cellAt,
  decodeWeave,
  hotIds,
  poses,
  type Weave,
} from "@/flavors/jacquard/lib/scene/poses";
import {
  Color,
  CylinderGeometry,
  DataTexture,
  DirectionalLight,
  DoubleSide,
  Group,
  HemisphereLight,
  MathUtils,
  Mesh,
  MeshLambertMaterial,
  NearestFilter,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Vector2,
  Vector3,
  type WebGLRenderer,
} from "three";

import { kick, motionOn, settle } from "@/lib/scene/clock";
import { tokenColor, watchTheme } from "@/lib/scene/colors";
import { input, sceneStore } from "@/lib/scene/store";

import { fragmentShader, vertexShader } from "./shaders";

/** Cloth width and height in world units. */
const CW = 3;
const CH = 3.9;
const MAX_IDS = 36;
/** How long the cloth takes to re-weave, rod to hem, after a route change. */
const WEAVE_SECONDS = 0.9;
const YAW_MIN = -1.2;
const YAW_MAX = 0.8;

/** Loom-state cloth is the same in both themes; only the light changes. */
const WEFT = "#cdccc4";
const WARP = "#2b2e33";
const LABEL = "#b8393f";
/** The yarns, spun brighter than the page's dyes so they read on the cloth. */
const YARNS = ["#4a66b3", "#b8393f", "#cfa634", "#8a5e3b", "#77519e"];

const LIGHT = {
  light: { sky: "#f4f2ec", floor: "#8d8d86", sun: "#fff6ea" },
  dark: { sky: "#95a4d6", floor: "#1a2140", sun: "#c9d4ff" },
};

const EMPTY: Weave = { w: 1, h: 1, ids: [], kinds: [], rows: [], cells: "." };

/** Approaches `target` at `rate` per 60th of a second; returns whether it still moves. */
function approach(value: number, target: number, rate: number, dt: number) {
  const d = target - value;
  if (Math.abs(d) < 1e-4) return { value: target, moving: false };
  return { value: value + d * (1 - Math.pow(1 - rate, dt * 60)), moving: true };
}

function patternTexture(weave: Weave) {
  const data = new Uint8Array(weave.w * weave.h * 4);
  for (let y = 0; y < weave.h; y++) {
    for (let x = 0; x < weave.w; x++) {
      const id = cellAt(weave, x, y);
      const i = (y * weave.w + x) * 4;
      data[i] = id + 1;
      data[i + 1] = id >= 0 ? (weave.kinds[id] ?? 0) : 0;
      data[i + 3] = 255;
    }
  }
  const texture = new DataTexture(data, weave.w, weave.h, RGBAFormat);
  texture.magFilter = NearestFilter;
  texture.minFilter = NearestFilter;
  // Row 0 of the data is the pick nearest the rod; the shader counts rows down.
  texture.flipY = false;
  texture.needsUpdate = true;
  return texture;
}

/**
 * The loom-state cloth: one plane woven in the fragment shader from the
 * page's weave, hanging from a rod. The pointer sends a ripple through it,
 * a drag turns it, and pointing at a pick or an end re-dyes those ends.
 * Every value is damped in `frame`, which reports when it has settled, so
 * nothing renders while the cloth is still.
 */
export function createWorld(renderer: WebGLRenderer) {
  const scene = new Scene();
  const camera = new PerspectiveCamera(28, 1, 0.1, 60);

  const rig = new Group();
  rig.position.y = -0.05;
  scene.add(rig);

  const hot = new DataTexture(new Uint8Array(MAX_IDS * 4), MAX_IDS, 1);
  hot.magFilter = NearestFilter;
  hot.minFilter = NearestFilter;
  hot.needsUpdate = true;

  const uniforms = {
    uPattern: { value: patternTexture(EMPTY) },
    uHot: { value: hot },
    uSize: { value: new Vector2(1, 1) },
    uRepeat: { value: new Vector2(2, 8) },
    uWoven: { value: 1 },
    uBroken: { value: -1 },
    uTime: { value: 0 },
    uAmp: { value: 0 },
    uRip: { value: new Vector2() },
    uDrape: { value: 1 },
    uCloth: { value: new Vector2(CW, CH) },
    uWeft: { value: new Color(WEFT) },
    uWarp: { value: new Color(WARP) },
    uLabel: { value: new Color(LABEL) },
    uYarn: { value: YARNS.map((c) => new Color(c)) },
    uSky: { value: new Color() },
    uFloor: { value: new Color() },
    uSun: { value: new Color() },
    uSunDir: { value: new Vector3(-3, 4, 6).normalize() },
  };

  const cloth = new Mesh(
    new PlaneGeometry(CW, CH, 60, 78),
    new ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      side: DoubleSide,
    })
  );
  rig.add(cloth);

  const rodMaterial = new MeshLambertMaterial({ color: "#2a2d32" });
  const rod = new Mesh(
    new CylinderGeometry(0.035, 0.035, CW + 0.5, 20).rotateZ(Math.PI / 2),
    rodMaterial
  );
  rod.position.y = CH / 2 + 0.02;
  rig.add(rod);
  for (const side of [-1, 1]) {
    const knob = new Mesh(new SphereGeometry(0.06, 16, 12), rodMaterial);
    knob.position.set(side * (CW / 2 + 0.25), CH / 2 + 0.02, 0);
    rig.add(knob);
  }
  const hemi = new HemisphereLight("#ffffff", "#8a8a84", 1.3);
  const sun = new DirectionalLight("#fff8ee", 2);
  sun.position.set(-3, 4, 6);
  scene.add(hemi, sun);

  const light = () => {
    const dark = document.documentElement.dataset.theme === "dark";
    const set = dark ? LIGHT.dark : LIGHT.light;
    // Night keeps the cloth readable on indigo: a cooler light, nearly as strong.
    const k = dark ? 0.95 : 1.08;
    uniforms.uSky.value.set(set.sky).multiplyScalar(0.72 * k);
    uniforms.uFloor.value
      .set(set.floor)
      .multiplyScalar((dark ? 0.9 : 0.55) * k);
    uniforms.uSun.value.set(set.sun).multiplyScalar(0.42 * k);
    hemi.color.set(set.sky);
    hemi.groundColor.set(set.floor);
    hemi.intensity = dark ? 0.9 : 1.3;
    sun.intensity = dark ? 1.3 : 2;
    // By night the iron rod would vanish into the indigo; it takes the soft ink.
    rodMaterial.color.set(
      dark ? tokenColor("--color-ink-soft", "#a9adbd") : "#2a2d32"
    );
    kick();
  };
  light();
  const offTheme = watchTheme(light);

  let weave: Weave = EMPTY;
  let board: string | null = null;
  let hovered: string | null = null;
  let pose = poses[asSceneRoute(sceneStore.getState().route)];

  const S = { yaw: pose.yaw, target: pose.yaw, drape: pose.drape, amp: 0 };
  let dragFrom: number | null = null;
  let last = 0;
  let lastMoved = 0;
  let lastPx = 0;
  let lastPy = 0;
  const ray = new Raycaster();
  const ndc = new Vector2();

  const paintHot = () => {
    const on = hotIds(weave, hovered);
    const data = hot.image.data;
    if (!data) return;
    for (let i = 0; i < MAX_IDS; i++) data[i * 4] = on.has(i) ? 255 : 0;
    hot.needsUpdate = true;
  };

  const setBoard = (next: string | null, animate: boolean) => {
    if (next === board) return;
    board = next;
    weave = decodeWeave(next) ?? EMPTY;
    uniforms.uPattern.value.dispose();
    uniforms.uPattern.value = patternTexture(weave);
    uniforms.uSize.value.set(weave.w, weave.h);
    if (animate && motionOn()) uniforms.uWoven.value = 0;
    paintHot();
  };

  const applyPose = () => {
    uniforms.uRepeat.value.set(pose.repeat[0], pose.repeat[1]);
    uniforms.uBroken.value = pose.broken ? Math.floor(weave.w * 0.55) : -1;
  };

  setBoard(sceneStore.getState().board, false);
  applyPose();

  const offStore = sceneStore.subscribe((state, prev) => {
    if (state.route !== prev.route) {
      pose = poses[asSceneRoute(state.route)];
      S.target = pose.yaw;
    }
    if (state.board !== prev.board) setBoard(state.board, prev.board !== null);
    applyPose();
    if (state.hovered !== hovered) {
      hovered = state.hovered;
      paintHot();
      // Re-dyeing sends a small wave down from the rod.
      if (motionOn() && hovered) {
        uniforms.uRip.value.set(0, CH * 0.35);
        S.amp = Math.max(S.amp, 0.05);
      }
    }
    kick();
  });

  function ripple() {
    if (input.movedAt === lastMoved || !input.inside || input.dragging) return;
    lastMoved = input.movedAt;
    const speed = Math.hypot(input.px - lastPx, input.py - lastPy);
    lastPx = input.px;
    lastPy = input.py;
    ndc.set(input.px, input.py);
    ray.setFromCamera(ndc, camera);
    const uv = ray.intersectObject(cloth)[0]?.uv;
    if (!uv) return;
    uniforms.uRip.value.set((uv.x - 0.5) * CW, (uv.y - 0.5) * CH);
    S.amp = Math.min(0.14, S.amp + speed * 0.18);
  }

  function frame(width: number, height: number, time: number) {
    const dt = Math.min(Math.max(time - last, 0), 1 / 20);
    last = time;
    const live = motionOn();
    let busy = false;

    if (input.dragging) {
      dragFrom ??= S.target;
      S.target = MathUtils.clamp(
        dragFrom + input.dragX * 0.006,
        YAW_MIN,
        YAW_MAX
      );
    } else {
      dragFrom = null;
    }

    if (live) {
      const yaw = approach(S.yaw, S.target, 0.14, dt);
      const drape = approach(S.drape, pose.drape, 0.08, dt);
      S.yaw = yaw.value;
      S.drape = drape.value;
      busy = yaw.moving || drape.moving;
      ripple();
      if (S.amp > 0) {
        S.amp *= Math.pow(0.95, dt * 60);
        if (S.amp < 0.002) S.amp = 0;
        else busy = true;
      }
      if (uniforms.uWoven.value < 1) {
        uniforms.uWoven.value = Math.min(
          1,
          uniforms.uWoven.value + dt / WEAVE_SECONDS
        );
        busy = true;
      }
    } else {
      S.yaw = S.target;
      S.drape = pose.drape;
      S.amp = 0;
      uniforms.uWoven.value = 1;
    }

    uniforms.uTime.value = time;
    uniforms.uAmp.value = S.amp;
    uniforms.uDrape.value = S.drape;
    rig.rotation.set(0.04, S.yaw, 0);

    const aspect = width / Math.max(1, height);
    camera.aspect = aspect;
    const t = Math.tan(MathUtils.degToRad(14));
    camera.position.set(0, 0, Math.max(2.3 / t, 1.95 / (t * aspect)));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    renderer.render(scene, camera);
    settle(busy);
  }

  return {
    frame,
    dispose() {
      offStore();
      offTheme();
    },
  };
}
