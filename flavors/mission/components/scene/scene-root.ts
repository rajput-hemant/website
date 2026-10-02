import { WebGLRenderer } from "three";

import { kick, motionOn, startClock } from "@/lib/scene/clock";
import { attachScene } from "@/lib/scene/dom";
import { sceneInspect } from "@/lib/scene/inspect";
import { input, sceneStore } from "@/lib/scene/store";

import { createWorld } from "./world";

type LiveTier = 1 | 2;

const DPR: Record<LiveTier, number> = { 1: 1, 2: 1.5 };

/** Turning and zooming the globe (`lib/scene/inspect.ts`), all the way round. */
const turn = sceneInspect({
  pitch: [-1.3, 1.3],
  zoom: [0.8, 1.8],
  reducedMotion: () => !motionOn(),
  onWake: () => kick(),
});

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
  const world = createWorld(renderer, turn);
  startClock((time) => world.frame(size.width, size.height, time));
  session = { canvas, renderer };
  return session;
}

/**
 * Pointer over the globe into `input.px/py`. A drag turns the globe through
 * the inspect, which also keeps the page's vertical touch scroll.
 */
function bindInput(host: HTMLElement) {
  const move = (e: PointerEvent) => {
    const r = host.getBoundingClientRect();
    input.px = ((e.clientX - r.left) / r.width) * 2 - 1;
    input.py = -(((e.clientY - r.top) / r.height) * 2 - 1);
    input.inside = e.pointerType !== "touch";
  };
  const leave = () => {
    input.inside = false;
  };
  host.addEventListener("pointermove", move);
  host.addEventListener("pointerleave", leave);
  const offTurn = turn.bindInput(host);
  return () => {
    offTurn();
    host.removeEventListener("pointermove", move);
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
