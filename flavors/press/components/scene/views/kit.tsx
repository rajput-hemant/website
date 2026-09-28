import * as React from "react";
import type { ViewData } from "@/flavors/press/lib/scene/views";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  MeshStandardMaterial,
  PerspectiveCamera,
  Vector3,
  type Object3D,
} from "three";

import { kick, motionOn } from "@/lib/scene/clock";
import { tokenColor, watchTheme } from "@/lib/scene/colors";
import { sceneStore } from "@/lib/scene/store";

/**
 * What every press view shares: its placeholder and facts, the page's inks
 * as materials, a camera that fits a box to the placeholder, and damped
 * values that keep the clock awake only while they move. A view never
 * settles the clock itself (the press does); it kicks one more frame while
 * anything it draws is still moving, so an idle page renders nothing.
 */

export const clamp = (v: number, a: number, b: number) =>
  Math.min(b, Math.max(a, v));

/** The placeholder's `data-view` facts, or `fallback` when missing or bad. */
export function readData<K extends keyof ViewData>(
  el: HTMLElement | null,
  fallback: ViewData[K]
): ViewData[K] {
  const raw = el?.dataset.view;
  if (!raw) return fallback;
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object"
      ? { ...fallback, ...parsed }
      : fallback;
  } catch {
    return fallback;
  }
}

const INKS = {
  pink: ["--color-pink", "#ff48b0"],
  blue: ["--color-blue", "#3255a4"],
  yellow: ["--color-yellow", "#ffe800"],
  ink: ["--color-ink", "#2a4690"],
  inkSoft: ["--color-ink-soft", "#4a5f93"],
  shade: ["--color-shade", "#d6d9d3"],
  sheet: ["--color-sheet", "#f2f3f0"],
  paper: ["--color-paper", "#e7e8e4"],
  danger: ["--color-danger", "#b0183d"],
} as const;

export type Ink = keyof typeof INKS;

const byInk = <T,>(make: (name: Ink) => T): Record<Ink, T> => ({
  pink: make("pink"),
  blue: make("blue"),
  yellow: make("yellow"),
  ink: make("ink"),
  inkSoft: make("inkSoft"),
  shade: make("shade"),
  sheet: make("sheet"),
  paper: make("paper"),
  danger: make("danger"),
});

let palette: Record<Ink, Color> | null = null;
let materials: Record<Ink, MeshStandardMaterial> | null = null;
const themeListeners = new Set<() => void>();

function recolour() {
  if (!palette || !materials) return;
  const mats = materials;
  byInk((name) => {
    const [token, fallback] = INKS[name];
    const colour = palette?.[name].set(tokenColor(token, fallback));
    if (colour) mats[name].color.copy(colour);
  });
  for (const listener of themeListeners) listener();
  kick();
}

function ensureInks() {
  if (palette && materials) return { palette, materials };
  const made = {
    palette: byInk(() => new Color()),
    materials: byInk(
      (name) =>
        new MeshStandardMaterial({
          roughness: name === "ink" || name === "inkSoft" ? 0.45 : 0.85,
        })
    ),
  };
  palette = made.palette;
  materials = made.materials;
  recolour();
  // Session-long, like the press: the inks follow every theme flip.
  watchTheme(recolour);
  return made;
}

/**
 * The page's inks as one shared material each, recoloured on a theme flip.
 * Plates are opaque here: the canvas sits over the page, so `--blend`
 * cannot reach the stock beneath it.
 */
export const inks = () => ensureInks().materials;

/** The inks as colours, for instance colours; current after `onTheme` fires. */
export const inkColour = (name: Ink) => ensureInks().palette[name];

/** Calls `listener` after every theme flip; returns the unsubscribe. */
export function onTheme(listener: () => void) {
  ensureInks();
  themeListeners.add(listener);
  return () => {
    themeListeners.delete(listener);
  };
}

/** A plain material of its own, for a view that tints per instance. */
export const whiteMaterial = (roughness = 0.8) =>
  new MeshStandardMaterial({ color: 0xffffff, roughness });

/** Soft light from above and a key from the upper left, like the press. */
export function createLights() {
  const g = new Group();
  g.add(new HemisphereLight(0xffffff, 0x9aa0a8, 1.9));
  const sun = new DirectionalLight(0xffffff, 1.4);
  sun.position.set(-2.5, 5, 3.5);
  g.add(sun);
  return g;
}

export type Fit = {
  /** The box to keep in frame, in world units. */
  width: number;
  height: number;
  /** The point the camera looks at. */
  aim?: readonly [number, number, number];
  /** Where the camera looks from, as a direction. */
  from?: readonly [number, number, number];
  fov?: number;
};

const aspectOf = (el: HTMLElement | null) => {
  const r = el?.getBoundingClientRect();
  return r && r.height > 0 && r.width > 0 ? r.width / r.height : 1;
};

/** How far back the camera sits so `fit` fills a box of this aspect. */
function fitDistance(fit: Fit, aspect: number) {
  const t = Math.tan((((fit.fov ?? 26) / 2) * Math.PI) / 180);
  return (
    Math.max(fit.height / 2 / t, fit.width / 2 / (t * aspect)) * FIT_MARGIN
  );
}
const FIT_MARGIN = 1.08;

/**
 * The world-unit size the placeholder shows at the aim point, so a view can
 * place things by fractions of its box (a rail, a row, a card's centre).
 */
export function visibleSize(el: HTMLElement | null, fit: Fit) {
  const aspect = aspectOf(el);
  const t = Math.tan((((fit.fov ?? 26) / 2) * Math.PI) / 180);
  const height = 2 * t * fitDistance(fit, aspect);
  return { width: height * aspect, height, aspect };
}

/** What a view's factory returns: its objects, its frame and its cleanup. */
export type ViewWorld = {
  root: Object3D;
  /** One frame; `delta` is capped so a wake from sleep never jumps. */
  frame: (delta: number) => void;
  dispose?: () => void;
};

function createCamera(fit: Fit) {
  const camera = new PerspectiveCamera(fit.fov ?? 26);
  const aim = new Vector3(...(fit.aim ?? [0, 0, 0]));
  const from = new Vector3(...(fit.from ?? [0.25, 0.45, 1])).normalize();
  return {
    camera,
    place(el: HTMLElement | null) {
      const aspect = aspectOf(el);
      const distance = fitDistance(fit, aspect);
      camera.aspect = aspect;
      camera.near = 0.05;
      camera.far = distance * 4 + 10;
      camera.position.copy(aim).addScaledVector(from, distance);
      camera.lookAt(aim);
      camera.updateProjectionMatrix();
    },
  };
}

/**
 * One press view: finds its placeholder, builds its world once with
 * `create`, gives it a camera of its own (the portal's default, moved each
 * frame so `fit` fills the placeholder whatever its aspect) and the lights,
 * and runs its frame. All mutable state lives in the factory.
 */
export function PressView({
  id,
  fit,
  create,
}: {
  id: string;
  fit: Fit;
  create: (el: HTMLElement | null) => ViewWorld;
}) {
  const set = useThree((s) => s.set);
  const get = useThree((s) => s.get);
  const [el] = React.useState(() =>
    document.querySelector<HTMLElement>(`[data-scene-view="${id}"]`)
  );
  const [w] = React.useState(() => create(el));
  const [cam] = React.useState(() => createCamera(fit));
  const [lights] = React.useState(createLights);
  React.useEffect(() => () => w.dispose?.(), [w]);
  React.useLayoutEffect(() => {
    const previous = get().camera;
    set({ camera: cam.camera });
    kick();
    return () => set({ camera: previous });
  }, [cam, get, set]);
  useFrame((_, delta) => {
    cam.place(el);
    w.frame(Math.min(delta, 1 / 20));
  });
  return (
    <>
      <primitive object={lights} />
      <primitive object={w.root} />
    </>
  );
}

/**
 * Damped values: `to` eases a key toward its target (rate per 60th of a
 * second), snapping with motion off; `end` kicks one more frame while any
 * key still moves.
 */
export function createDamp<K extends string>(initial: Record<K, number>) {
  const v: Record<K, number> = { ...initial };
  let busy = false;
  return {
    v,
    to(key: K, target: number, rate: number, delta: number) {
      const value = v[key];
      const d = target - value;
      if (!motionOn() || Math.abs(d) < 5e-4) {
        v[key] = target;
        return;
      }
      v[key] = value + d * (1 - Math.pow(1 - rate, delta * 60));
      busy = true;
    },
    /** Marks the frame busy for work the damped keys don't cover. */
    hold() {
      busy = true;
    },
    end() {
      if (busy) kick();
      busy = false;
    },
  };
}

/**
 * Where the pointer is over `el`, -1..1, for a mouse or pen, and whether it
 * is within `reach` boxes of it; wakes the clock while it is near.
 */
export function trackPointer(el: HTMLElement | null, reach = 1.2) {
  const p = { x: 0, y: 0, inside: false };
  const move = (e: PointerEvent) => {
    if (!el || e.pointerType === "touch") return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / Math.max(1, r.width)) * 2 - 1;
    const y = -(((e.clientY - r.top) / Math.max(1, r.height)) * 2 - 1);
    const inside = Math.abs(x) <= reach && Math.abs(y) <= reach;
    if (!inside && !p.inside) return;
    p.x = clamp(x, -1, 1);
    p.y = clamp(y, -1, 1);
    p.inside = inside;
    kick();
  };
  addEventListener("pointermove", move, { passive: true });
  return { p, dispose: () => removeEventListener("pointermove", move) };
}

/** How far `el` has come up the viewport: 0 as its top enters, 1 once it's fully in. */
export function scrolledIn(el: HTMLElement | null) {
  if (!el) return 1;
  const r = el.getBoundingClientRect();
  return clamp((innerHeight - r.top) / Math.max(1, r.height), 0, 1);
}

/** The hovered scene item's key when it has this prefix, else null. */
export function hoveredKey(hovered: string | null, prefix: string) {
  if (!hovered?.startsWith(`${prefix}:`)) return null;
  return hovered.slice(prefix.length + 1);
}

/**
 * Progress through the page's `[data-scene-section]` that ignores the last
 * page's value: until this page reports its own, the store still holds it.
 */
export function pageProgress() {
  const first = sceneStore.getState().progress;
  let live = false;
  return () => {
    const { progress } = sceneStore.getState();
    if (progress !== first) live = true;
    return live ? progress : 0;
  };
}
