import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

import type { SceneRoute } from "./poses";

export type Tier = 0 | 1 | 2;

/** A DOM element marked `data-scene-item`, in document order. */
export type SceneItem = { id: string; href: string | null; weight: number };

export type SceneEvent = { type: "rfi:sent" };

export type SceneState = {
  route: SceneRoute;
  tier: Tier;
  /** Highest tier left after PerformanceMonitor stepped down; never rises. */
  maxTier: Tier;
  /** The canvas is attached to a slot and has rendered. */
  live: boolean;
  /** The slot intersects the viewport. */
  visible: boolean;
  /** Pointer hover, from the DOM (`data-scene-item`, scene nav) or a mesh. */
  hovered: string | null;
  /** Keyboard focus in the scene nav. */
  focused: string | null;
  /** What the scene currently highlights; mirrored to `data-scene-active`. */
  active: string | null;
  items: SceneItem[];
  /** Scroll through `[data-scene-section]` (or the page), 0..1. */
  progress: number;
  /** Bumped when the clock wakes after sleeping; resets the perf sampler. */
  wake: number;
  navigate: ((href: string) => void) | null;
};

export const sceneStore = createStore<SceneState>()(() => ({
  route: "home",
  tier: 0,
  maxTier: 2,
  live: false,
  visible: true,
  hovered: null,
  focused: null,
  active: null,
  items: [],
  progress: 0,
  wake: 0,
  navigate: null,
}));

/** Raw input written by DOM listeners and read by the frame loop. */
export const input = {
  /** Pointer over the canvas, -1..1. */
  px: 0,
  py: 0,
  inside: false,
  movedAt: 0,
  /** Accumulated drag in CSS px since the last route change. */
  dragX: 0,
  dragY: 0,
  tiltX: 0,
  tiltY: 0,
};

export const setHovered = (hovered: string | null) =>
  sceneStore.setState({ hovered });

export const setFocused = (focused: string | null) =>
  sceneStore.setState({ focused });

/** Clears hover only if `id` still owns it. */
export function clearHovered(id: string) {
  if (sceneStore.getState().hovered === id) setHovered(null);
}

const listeners = new Set<(event: SceneEvent) => void>();

/** Fire-and-forget scene events, e.g. `emit({ type: "rfi:sent" })`. */
export function emit(event: SceneEvent) {
  for (const listener of listeners) listener(event);
}

export function onSceneEvent(listener: (event: SceneEvent) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSceneStore<T>(selector: (state: SceneState) => T): T {
  return useStore(sceneStore, selector);
}
