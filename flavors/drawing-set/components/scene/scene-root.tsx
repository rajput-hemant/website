import {
  advance,
  createRoot,
  events,
  type Dpr,
  type ReconcilerRoot,
  type RootStore,
} from "@react-three/fiber";

import { startClock } from "@/lib/scene/clock";
import { attachScene } from "@/lib/scene/dom";
import { input, sceneStore } from "@/lib/scene/store";

import { World } from "./world";

type LiveTier = 1 | 2;

const DPR: Record<LiveTier, Dpr> = { 1: 1, 2: [1, 2] };

let canvas: HTMLCanvasElement | null = null;
let root: ReconcilerRoot<HTMLCanvasElement> | null = null;
let fiber: RootStore | null = null;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const fail = () => sceneStore.setState({ tier: 0, maxTier: 0 });

/** One canvas and one R3F root for the whole session; slots borrow it. */
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
      // Linework is all 1px edges; without MSAA it breaks up, and MSAA on lines is cheap.
      gl: { antialias: true, alpha: true, powerPreference: "default" },
      camera: { fov: 22, near: 0.1, far: 80 },
      size: { width: 1, height: 1, top: 0, left: 0 },
      onCreated: (state) => state.gl.setClearColor(0x000000, 0),
    })
    .catch(fail);
  fiber = root.render(<World />);
  startClock((seconds) => advance(seconds));
  return fiber;
}

function bindInput(host: HTMLElement) {
  let start: {
    x: number;
    y: number;
    dx: number;
    dy: number;
    id: number;
  } | null = null;
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
      host.setPointerCapture(e.pointerId);
    }
    if (!dragging) return;
    const lab = sceneStore.getState().route === "lab";
    input.dragX = lab ? start.dx + dx : clamp(start.dx + dx, -160, 160);
    // Touch keeps vertical movement for page scroll (touch-action: pan-y).
    if (e.pointerType !== "touch") input.dragY = clamp(start.dy + dy, -60, 110);
  };
  const down = (e: PointerEvent) => {
    if (e.button !== 0) return;
    start = {
      x: e.clientX,
      y: e.clientY,
      dx: input.dragX,
      dy: input.dragY,
      id: e.pointerId,
    };
    dragging = false;
  };
  const up = () => {
    start = null;
    dragging = false;
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

/** Borrows the session canvas into `host`; see `attachScene`. */
export function mountScene(
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
    bindInput,
    onReady,
  });
}

export { enableTilt } from "@/lib/scene/dom";
