import * as React from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  DirectionalLight,
  Group,
  HemisphereLight,
  MeshStandardMaterial,
  OrthographicCamera,
  PerspectiveCamera,
  type MeshStandardMaterialParameters,
  type Object3D,
} from "three";

import { kick, motionOn } from "@/lib/scene/clock";
import { tokenColor, watchTheme } from "@/lib/scene/colors";

/**
 * The kit every in-page view is built from (docs/timetable.md, "Views"):
 * each object is a plain factory over its placeholder, and `sceneView`
 * turns it into the component the session renders inside that view.
 */
export type ViewObject = {
  /** One root group per object, so inspect controls can attach to it. */
  root: Object3D;
  camera: PerspectiveCamera | OrthographicCamera;
  /**
   * Steps one frame at the view's size in CSS px; true while anything is
   * still moving, which keeps the clock awake for another frame.
   */
  frame: (delta: number, width: number, height: number) => boolean;
  /** DOM, store and theme listeners; returns their cleanup. */
  bind: () => () => void;
};

/** The placeholder a view tracks: at most one per id on a page. */
export const viewHost = (id: string) =>
  document.querySelector<HTMLElement>(`[data-scene-view="${id}"]`);

/**
 * The component for view `id`: builds the object once over its
 * placeholder, makes its camera the view's own, binds it while mounted and
 * steps it every frame the session renders.
 */
export function sceneView(
  id: string,
  make: (host: HTMLElement) => ViewObject
): () => React.ReactNode {
  function SceneViewObject() {
    const [object] = React.useState(() => {
      const host = viewHost(id);
      if (!host) return null;
      const made = make(host);
      // The object frames its own camera; R3F would reset it to the view's size.
      Object.assign(made.camera, { manual: true });
      return made;
    });
    const set = useThree((s) => s.set);
    React.useLayoutEffect(() => {
      if (object) set({ camera: object.camera });
    }, [object, set]);
    React.useEffect(() => object?.bind(), [object]);
    useFrame((state, delta) => {
      if (object?.frame(delta, state.size.width, state.size.height)) kick();
    });
    return object ? <primitive object={object.root} /> : null;
  }
  return function renderView() {
    return <SceneViewObject />;
  };
}

export type Spring = { x: number; v: number };

export const spring0 = (x = 0): Spring => ({ x, v: 0 });

/**
 * One step of a damped spring toward `target` (the indicator's k and
 * damp by default); with motion off it lands at once. True while moving.
 */
export function step(s: Spring, target: number, k = 0.05, damp = 0.88) {
  if (!motionOn()) {
    // This frame draws the landed value; nothing is left to animate.
    s.x = target;
    s.v = 0;
    return false;
  }
  s.v = (s.v + (target - s.x) * k) * damp;
  s.x += s.v;
  const moving = Math.abs(s.v) > 1e-4 || Math.abs(target - s.x) > 1e-3;
  if (!moving) {
    s.x = target;
    s.v = 0;
  }
  return moving;
}

export const clamp = (v: number, a: number, b: number) =>
  Math.min(b, Math.max(a, v));

/** The indicator's light: a sky and one key from the upper right. */
export function lights(root: Object3D) {
  root.add(new HemisphereLight(0xffffff, 0x3a4450, 1.1));
  const sun = new DirectionalLight(0xffffff, 1.6);
  sun.position.set(3, 5, 6);
  root.add(sun);
}

export const standard = (params: MeshStandardMaterialParameters = {}) =>
  new MeshStandardMaterial({ roughness: 0.55, metalness: 0.2, ...params });

/**
 * Keeps materials on the edition's tokens: `paint` runs now and on every
 * theme flip, then asks for one frame.
 */
export function themed(paint: (token: (name: string) => string) => void) {
  const run = () => {
    paint((name) => tokenColor(name, "#14191e"));
    kick();
  };
  run();
  return watchTheme(run);
}

/**
 * A perspective camera that keeps a `[w, h]` box (scene units, centred on
 * `center`) in frame at any view aspect, looking from `dir` (unit-ish).
 */
export function fitCamera(fov = 26) {
  const camera = new PerspectiveCamera(fov, 1, 0.1, 80);
  const t = Math.tan((fov * Math.PI) / 360);
  return {
    camera,
    fit(
      width: number,
      height: number,
      box: readonly [number, number],
      center: readonly [number, number, number] = [0, 0, 0],
      dir: readonly [number, number, number] = [0, 0, 1]
    ) {
      const aspect = width / Math.max(1, height);
      const d = Math.max(box[1] / 2 / t, box[0] / 2 / (t * aspect));
      const len = Math.hypot(...dir) || 1;
      camera.aspect = aspect;
      camera.position.set(
        center[0] + (dir[0] / len) * d,
        center[1] + (dir[1] / len) * d,
        center[2] + (dir[2] / len) * d
      );
      camera.lookAt(center[0], center[1], center[2]);
      camera.updateProjectionMatrix();
    },
  };
}

/**
 * An orthographic camera in an SVG's viewBox units (y down on the page, so
 * objects sit at `(x, -y)`), for a view laid exactly over that SVG.
 */
export function viewBoxCamera(viewWidth: number) {
  const camera = new OrthographicCamera(0, viewWidth, 0, -1, -200, 200);
  camera.position.set(0, 0, 100);
  return {
    camera,
    fit(width: number, height: number) {
      const bottom = -(viewWidth * height) / Math.max(1, width);
      if (camera.bottom === bottom) return;
      camera.bottom = bottom;
      camera.updateProjectionMatrix();
    },
  };
}

export type Drag = {
  /** Px since the drag started; touch reports x only. */
  dx: number;
  dy: number;
  /** Px/ms at release (x), for a throw. */
  speed: number;
};

/**
 * A drag over a placeholder, like the indicator's: past 4px it captures
 * the pointer; touch keeps vertical movement for page scroll (the
 * placeholder sets `touch-action: pan-y`), so a touch drag is horizontal.
 */
export function bindDrag(
  host: HTMLElement,
  on: {
    move?: (drag: Drag, e: PointerEvent) => void;
    end?: (drag: Drag, e: PointerEvent) => void;
    down?: (e: PointerEvent) => void;
  }
) {
  let start: { x: number; y: number; id: number; touch: boolean } | null = null;
  let dragging = false;
  let last = { x: 0, t: 0, speed: 0 };
  const drag = (e: PointerEvent): Drag => ({
    dx: start ? e.clientX - start.x : 0,
    dy: start && !start.touch ? e.clientY - start.y : 0,
    speed: last.speed,
  });
  const down = (e: PointerEvent) => {
    if (e.button !== 0 || start) return;
    start = {
      x: e.clientX,
      y: e.clientY,
      id: e.pointerId,
      touch: e.pointerType === "touch",
    };
    dragging = false;
    last = { x: e.clientX, t: e.timeStamp, speed: 0 };
    on.down?.(e);
  };
  const move = (e: PointerEvent) => {
    if (!start || e.pointerId !== start.id) return;
    const dt = e.timeStamp - last.t;
    if (dt > 0)
      last = { x: e.clientX, t: e.timeStamp, speed: (e.clientX - last.x) / dt };
    const d = drag(e);
    if (!dragging && Math.hypot(d.dx, d.dy) > 4) {
      dragging = true;
      host.setPointerCapture(e.pointerId);
    }
    if (dragging) on.move?.(d, e);
    kick();
  };
  const up = (e: PointerEvent) => {
    if (!start || e.pointerId !== start.id) return;
    if (e.timeStamp - last.t > 100) last.speed = 0;
    if (dragging) on.end?.(drag(e), e);
    start = null;
    dragging = false;
    kick();
  };
  host.addEventListener("pointerdown", down);
  host.addEventListener("pointermove", move);
  host.addEventListener("pointerup", up);
  host.addEventListener("pointercancel", up);
  return () => {
    host.removeEventListener("pointerdown", down);
    host.removeEventListener("pointermove", move);
    host.removeEventListener("pointerup", up);
    host.removeEventListener("pointercancel", up);
  };
}

/** Pointer enter and leave on `el`, as one flag; fine pointers only. */
export function bindHover(el: Element, on: (inside: boolean) => void) {
  const enter = (e: Event) => {
    if (e instanceof PointerEvent && e.pointerType === "touch") return;
    on(true);
    kick();
  };
  const leave = () => {
    on(false);
    kick();
  };
  el.addEventListener("pointerenter", enter);
  el.addEventListener("pointerleave", leave);
  return () => {
    el.removeEventListener("pointerenter", enter);
    el.removeEventListener("pointerleave", leave);
  };
}

/** A group whose children are the object; the root stays the one handle. */
export const group = (...children: Object3D[]) => {
  const g = new Group();
  if (children.length) g.add(...children);
  return g;
};

/** Runs every cleanup, last first. */
export const all =
  (...offs: (() => void)[]) =>
  () => {
    for (const off of [...offs].reverse()) off();
  };

/**
 * An orthographic camera in the view's own CSS px, origin top left (objects
 * sit at `(x, -y)`), for an object laid against DOM inside the placeholder.
 */
export function pxCamera() {
  const camera = new OrthographicCamera(0, 1, 0, -1, -400, 400);
  camera.position.set(0, 0, 200);
  return {
    camera,
    fit(width: number, height: number) {
      if (camera.right === width && camera.bottom === -height) return;
      camera.right = width;
      camera.bottom = -height;
      camera.updateProjectionMatrix();
    },
  };
}

/**
 * How far the reader is through `el`: 0 as its top reaches `from` of the
 * viewport height, 1 as its bottom does.
 */
export function readThrough(el: Element, from = 0.6) {
  const r = el.getBoundingClientRect();
  const line = innerHeight * from;
  return clamp((line - r.top) / Math.max(1, r.height), 0, 1);
}
