import { WebGLRenderer } from "three";

import { startClock } from "@/lib/scene/clock";
import { attachScene } from "@/lib/scene/dom";
import { input, sceneStore } from "@/lib/scene/store";

import { createWorld } from "./world";

type LiveTier = 1 | 2;

const DPR: Record<LiveTier, number> = { 1: 1, 2: 1.75 };

let canvas: HTMLCanvasElement | null = null;
let renderer: WebGLRenderer | null = null;
let size = { width: 1, height: 1 };

const fail = () => sceneStore.setState({ tier: 0, maxTier: 0 });

/** One canvas and one renderer for the session; slots borrow it. */
function ensureRenderer(tier: LiveTier) {
  if (renderer) return renderer;
  canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.display = "block";
  canvas.addEventListener("webglcontextlost", fail);
  renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: tier === 2,
    powerPreference: "default",
  });
  renderer.setClearColor(0x000000, 0);
  const world = createWorld(renderer);
  startClock(() => world.frame(size.width, size.height));
  return renderer;
}

/** Pointer lean on the inset slots; the loupe itself is driven by the DOM. */
function bindInput(host: HTMLElement) {
  const move = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    const r = host.getBoundingClientRect();
    input.px = ((e.clientX - r.left) / r.width) * 2 - 1;
    input.py = -(((e.clientY - r.top) / r.height) * 2 - 1);
    input.inside = true;
    input.movedAt = performance.now();
  };
  const leave = () => {
    input.inside = false;
    input.movedAt = performance.now();
  };
  host.addEventListener("pointermove", move);
  host.addEventListener("pointerleave", leave);
  return () => {
    host.removeEventListener("pointermove", move);
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
  let gl: WebGLRenderer;
  try {
    gl = ensureRenderer(tier);
  } catch {
    fail();
    return () => {};
  }
  gl.setPixelRatio(Math.min(window.devicePixelRatio, DPR[tier]));
  return attachScene(host, canvas!, {
    setSize: (width, height) => {
      size = { width, height };
      gl.setSize(width, height);
    },
    bindInput,
    onReady,
  });
}

export { enableTilt } from "@/lib/scene/dom";
