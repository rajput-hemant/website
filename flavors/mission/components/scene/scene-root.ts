import { WebGLRenderer } from "three";

import { startClock } from "@/lib/scene/clock";
import { attachScene } from "@/lib/scene/dom";
import { input, sceneStore } from "@/lib/scene/store";

import { createWorld } from "./world";

type LiveTier = 1 | 2;

const DPR: Record<LiveTier, number> = { 1: 1, 2: 1.5 };
/** A drag counts once the pointer has travelled this far, in CSS px. */
const DRAG_START = 4;

type Session = { canvas: HTMLCanvasElement; renderer: WebGLRenderer };

let session: Session | null = null;
let size = { width: 1, height: 1 };

const fail = () => sceneStore.setState({ tier: 0, maxTier: 0 });

/** One canvas and one renderer for the whole visit; each slot borrows it. */
function ensureSession(tier: LiveTier): Session {
  if (session) return session;
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.display = "block";
  canvas.addEventListener("webglcontextlost", fail);
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: tier === 2,
    powerPreference: "default",
  });
  renderer.setClearColor(0x000000, 0);
  const world = createWorld(renderer);
  startClock((time) => world.frame(size.width, size.height, time));
  session = { canvas, renderer };
  return session;
}

/**
 * A drag on the globe into `input.dragX/dragY` once it passes 4px, with
 * pointer capture. The page keeps vertical touch scrolling
 * (`touch-action: pan-y` on the host), so on touch only the yaw follows.
 */
function bindInput(host: HTMLElement) {
  let start: { x: number; y: number; id: number } | null = null;
  const move = (e: PointerEvent) => {
    const r = host.getBoundingClientRect();
    input.px = ((e.clientX - r.left) / r.width) * 2 - 1;
    input.py = -(((e.clientY - r.top) / r.height) * 2 - 1);
    input.inside = e.pointerType !== "touch";
    if (!start || e.pointerId !== start.id) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (!input.dragging && Math.hypot(dx, dy) > DRAG_START) {
      input.dragging = true;
      host.setPointerCapture(e.pointerId);
    }
    if (input.dragging) {
      input.dragX = dx;
      input.dragY = dy;
      // Only a drag wakes the clock; hovering the globe renders nothing.
      input.movedAt = performance.now();
    }
  };
  const down = (e: PointerEvent) => {
    if (e.button !== 0 || start) return;
    start = { x: e.clientX, y: e.clientY, id: e.pointerId };
  };
  const up = (e: PointerEvent) => {
    if (start && e.pointerId !== start.id) return;
    start = null;
    if (input.dragging) input.movedAt = performance.now();
    input.dragging = false;
    input.dragX = 0;
    input.dragY = 0;
  };
  const leave = () => {
    input.inside = false;
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

/** Lends the session canvas to `host`; see `attachScene`. */
export function mountScene(
  host: HTMLElement,
  tier: LiveTier,
  onReady: () => void
): () => void {
  let current: Session;
  try {
    current = ensureSession(tier);
  } catch {
    fail();
    return () => {};
  }
  const { canvas, renderer } = current;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, DPR[tier]));
  return attachScene(host, canvas, {
    setSize: (width, height) => {
      size = { width, height };
      renderer.setSize(width, height);
    },
    bindInput,
    onReady,
  });
}

export { enableTilt } from "@/lib/scene/dom";
