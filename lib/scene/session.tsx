import type * as React from "react";
import {
  advance,
  createRoot,
  events,
  type Dpr,
  type ReconcilerRoot,
  type RootStore,
} from "@react-three/fiber";

import { startClock } from "./clock";
import { attachScene, enableTilt } from "./dom";
import { input, sceneStore } from "./store";

type LiveTier = 1 | 2;

const DPR: Record<LiveTier, Dpr> = { 1: 1, 2: [1, 1.5] };

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export type DragBounds = {
  x: readonly [number, number];
  y: readonly [number, number];
};

/**
 * Pointer input over a slot: normalised hover into `input.px/py`, and a drag
 * (after 4px, with pointer capture) into `input.dragX/dragY`, clamped. Touch
 * drags horizontally only, so vertical swipes still scroll the page.
 */
export function bindDragInput(host: HTMLElement, bounds: DragBounds) {
  let start: { x: number; y: number; id: number } | null = null;
  let dragging = false;

  const move = (e: PointerEvent) => {
    const r = host.getBoundingClientRect();
    input.px = ((e.clientX - r.left) / r.width) * 2 - 1;
    input.py = -(((e.clientY - r.top) / r.height) * 2 - 1);
    input.inside = e.pointerType !== "touch";
    input.movedAt = performance.now();
    if (!start || e.pointerId !== start.id) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (!dragging && Math.hypot(dx, dy) > 4) {
      dragging = true;
      input.dragging = true;
      host.setPointerCapture(e.pointerId);
    }
    if (!dragging) return;
    input.dragX = clamp(dx, bounds.x[0], bounds.x[1]);
    if (e.pointerType !== "touch") {
      input.dragY = clamp(dy, bounds.y[0], bounds.y[1]);
    }
  };
  const down = (e: PointerEvent) => {
    if (e.button !== 0 || start) return;
    start = { x: e.clientX, y: e.clientY, id: e.pointerId };
    dragging = false;
  };
  const up = (e: PointerEvent) => {
    if (start && e.pointerId !== start.id) return;
    start = null;
    dragging = false;
    input.dragging = false;
    input.dragX = 0;
    input.dragY = 0;
    input.movedAt = performance.now();
  };
  const leave = () => {
    input.inside = false;
    input.movedAt = performance.now();
  };

  host.addEventListener("pointermove", move);
  host.addEventListener("pointerdown", down);
  host.addEventListener("pointerup", up);
  host.addEventListener("pointercancel", up);
  host.addEventListener("pointerleave", leave);
  return () => {
    host.removeEventListener("pointermove", move);
    host.removeEventListener("pointerdown", down);
    host.removeEventListener("pointerup", up);
    host.removeEventListener("pointercancel", up);
    host.removeEventListener("pointerleave", leave);
    leave();
  };
}

/**
 * One canvas and one R3F root for the whole session, lent to whichever slot
 * is on screen (the SceneModule contract of `useSceneMount`). The frame loop
 * is the shared clock, so nothing renders while the scene is idle. An edition
 * passes only its world, camera and drag bounds.
 */
export function createSessionScene({
  world,
  camera,
  drag,
  clipping = false,
}: {
  world: () => React.ReactNode;
  camera: { fov: number; position: [number, number, number] };
  drag: DragBounds;
  /** Turns on the renderer's local clipping planes. */
  clipping?: boolean;
}) {
  let canvas: HTMLCanvasElement | null = null;
  let root: ReconcilerRoot<HTMLCanvasElement> | null = null;
  let fiber: RootStore | null = null;

  const fail = () => sceneStore.setState({ tier: 0, maxTier: 0 });

  function ensureRoot(tier: LiveTier) {
    if (fiber) return fiber;
    canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.display = "block";
    canvas.addEventListener("webglcontextlost", fail);
    root = createRoot(canvas);
    void root
      .configure({
        frameloop: "never",
        flat: true,
        dpr: DPR[tier],
        events,
        gl: { antialias: tier === 2, alpha: true, powerPreference: "default" },
        camera: { ...camera, near: 0.1, far: 80 },
        size: { width: 1, height: 1, top: 0, left: 0 },
        onCreated: (state) => {
          state.gl.setClearColor(0x000000, 0);
          state.gl.localClippingEnabled = clipping;
        },
      })
      .catch(fail);
    fiber = root.render(world());
    startClock((seconds) => advance(seconds));
    return fiber;
  }

  function mountScene(
    host: HTMLElement,
    tier: LiveTier,
    onReady: () => void
  ): () => void {
    let store: RootStore;
    try {
      store = ensureRoot(tier);
    } catch {
      fail();
      return () => {};
    }
    store.getState().setDpr(DPR[tier]);
    return attachScene(host, canvas!, {
      setSize: (width, height) => store.getState().setSize(width, height, 0, 0),
      bindInput: (el) => bindDragInput(el, drag),
      onReady,
    });
  }

  return { mountScene, enableTilt };
}
