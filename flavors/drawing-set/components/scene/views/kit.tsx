import * as React from "react";
import { OrthographicCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Euler, Matrix4, Quaternion, Vector3 } from "three";
import type { Group, OrthographicCamera as OrthoCamera } from "three";
import { useStore } from "zustand";

import { kick, motionOn } from "@/lib/scene/clock";
import { viewStore } from "@/lib/scene/views";

/**
 * Shared pieces of the Drawing Set's tracked views (audit appendix B slice
 * 7): each view draws one `[data-scene-view]` placeholder on the session's
 * fixed canvas, in CSS pixels (1 world unit = 1px of its box), through an
 * orthographic camera like the posters' axonometric.
 */

type Vec3 = [number, number, number];

/** The placeholder `id` names on this page, once it is tracked. */
export function useViewElement(id: string): HTMLElement | null {
  return useStore(
    viewStore,
    (s) => s.views.find((v) => v.id === id)?.el ?? null
  );
}

/**
 * Per-frame state for one view: its placeholder's box and the frame's
 * `dt`, whether motion is on, and a damped `approach` that keeps the
 * session clock awake until everything it moves has settled (the clock
 * sleeps once no view asks for another frame).
 */
export type ViewFrame = {
  el: HTMLElement;
  width: number;
  height: number;
  dt: number;
  motion: boolean;
  approach: (cur: number, target: number, k: number) => number;
};

export function useViewFrame(
  id: string,
  frame: (f: ViewFrame) => void,
  camera: React.RefObject<OrthoCamera | null>,
  view: { az: number; el: number }
) {
  const el = useViewElement(id);
  useFrame((_, delta) => {
    const cam = camera.current;
    if (!el || !cam) return;
    const dt = Math.min(delta, 0.1);
    const motion = motionOn();
    let moving = false;
    const approach = (cur: number, target: number, k: number) => {
      if (Math.abs(target - cur) < 1e-3) return target;
      moving = true;
      return cur + (target - cur) * (1 - Math.exp(-k * dt));
    };
    aim(cam, view.az, view.el);
    frame({
      el,
      width: el.clientWidth,
      height: el.clientHeight,
      dt,
      motion,
      approach,
    });
    if (moving) kick();
  });
  return el;
}

/** Points an orthographic camera at the origin from `az` (from +z towards +x) and `el` above. */
function aim(cam: OrthoCamera, az: number, el: number) {
  const d = 1000;
  cam.position.set(
    d * Math.cos(el) * Math.sin(az),
    d * Math.sin(el),
    d * Math.cos(el) * Math.cos(az)
  );
  cam.lookAt(0, 0, 0);
  cam.updateMatrixWorld();
}

/** The view's own camera: orthographic in the placeholder's CSS pixels. */
export function ViewCamera({
  ref,
}: {
  ref: React.RefObject<OrthoCamera | null>;
}) {
  return (
    <OrthographicCamera ref={ref} makeDefault near={1} far={3000} zoom={1} />
  );
}

const m = new Matrix4();
const q = new Quaternion();
const e = new Euler();
const p3 = new Vector3();
const s3 = new Vector3();

/** A world matrix from a position, Euler rotation and scale, optionally under `parent`. */
export function compose(
  out: Matrix4,
  pos: Vec3,
  rot: Vec3 = [0, 0, 0],
  scale: Vec3 = [1, 1, 1],
  parent?: Matrix4
) {
  out.compose(p3.set(...pos), q.setFromEuler(e.set(...rot)), s3.set(...scale));
  if (parent) out.premultiply(parent);
  return out;
}

/** Scratch matrix for callers that set one instance at a time. */
export const scratch = m;

/** The element's box relative to `el`'s top-left, in CSS px. */
export function offsetIn(el: HTMLElement, child: Element) {
  const a = el.getBoundingClientRect();
  const b = child.getBoundingClientRect();
  return {
    x: b.left - a.left,
    y: b.top - a.top,
    width: b.width,
    height: b.height,
  };
}

/**
 * `measure(el)`, cached until `el` or its parent resizes: DOM layout a view
 * reads relative to its own box, which scrolling does not change.
 */
export function measured<T>(measure: (el: HTMLElement) => T) {
  let cache: { value: T } | null = null;
  return {
    read(el: HTMLElement): T {
      cache ??= { value: measure(el) };
      return cache.value;
    },
    watch(el: HTMLElement): () => void {
      cache = null;
      const reset = new ResizeObserver(() => {
        cache = null;
        kick();
      });
      reset.observe(el);
      if (el.parentElement) reset.observe(el.parentElement);
      return () => reset.disconnect();
    },
  };
}

/**
 * One view's scene, made once per placeholder: its linework, where its
 * camera looks from, the per-frame pose, and any DOM input it binds on the
 * placeholder (or around it) while tracked.
 */
export type ViewModel = {
  group: Group;
  aim: { az: number; el: number };
  frame: (f: ViewFrame) => void;
  bind?: (el: HTMLElement) => () => void;
};

/** Draws a {@link ViewModel} into the `[data-scene-view="<id>"]` placeholder. */
export function TrackedView({
  id,
  create,
}: {
  id: string;
  create: () => ViewModel;
}) {
  const camera = React.useRef<OrthoCamera>(null);
  const [view] = React.useState(create);
  const el = useViewFrame(id, view.frame, camera, view.aim);
  React.useEffect(
    () => (el && view.bind ? view.bind(el) : undefined),
    [el, view]
  );
  return (
    <>
      <ViewCamera ref={camera} />
      <primitive object={view.group} />
    </>
  );
}
