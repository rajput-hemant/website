import {
  kick,
  renderNow,
  startClock,
} from "@/flavors/drawing-set/lib/scene/clock";
import {
  clearHovered,
  input,
  sceneStore,
  setHovered,
  type SceneItem,
} from "@/flavors/drawing-set/lib/scene/store";
import {
  advance,
  createRoot,
  events,
  type Dpr,
  type ReconcilerRoot,
  type RootStore,
} from "@react-three/fiber";

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

/**
 * The page side of the contract: `[data-scene-item]` elements become items and
 * hover sources, `[data-scene-section]` drives progress, and the scene's
 * `active` id comes back as `data-scene-active`.
 */
function bindDom() {
  const itemOf = (target: EventTarget | null) =>
    target instanceof Element
      ? target.closest<HTMLElement>("[data-scene-item]")
      : null;
  const over = (e: Event) => {
    const id = itemOf(e.target)?.dataset.sceneItem;
    if (id) setHovered(id);
  };
  const out = (e: PointerEvent | FocusEvent) => {
    const el = itemOf(e.target);
    const id = el?.dataset.sceneItem;
    if (!el || !id) return;
    if (e.relatedTarget instanceof Node && el.contains(e.relatedTarget)) return;
    clearHovered(id);
  };

  let section: Element | null = null;
  const progress = () => {
    let p: number;
    if (section) {
      const r = section.getBoundingClientRect();
      p = (innerHeight - r.top) / (innerHeight + r.height);
    } else {
      const max = document.documentElement.scrollHeight - innerHeight;
      p = max > 0 ? scrollY / max : 0;
    }
    p = clamp(p, 0, 1);
    if (Math.abs(p - sceneStore.getState().progress) > 1e-4) {
      sceneStore.setState({ progress: p });
    }
  };

  let marked: Element[] = [];
  const mirror = () => {
    const { active } = sceneStore.getState();
    for (const el of marked) el.removeAttribute("data-scene-active");
    marked = active
      ? [
          ...document.querySelectorAll(
            `[data-scene-item="${CSS.escape(active)}"]`
          ),
        ]
      : [];
    for (const el of marked) el.setAttribute("data-scene-active", "");
  };

  const scan = () => {
    section = document.querySelector("[data-scene-section]");
    const seen = new Set<string>();
    const items: SceneItem[] = [];
    for (const el of document.querySelectorAll<HTMLElement>(
      "[data-scene-item]"
    )) {
      const id = el.dataset.sceneItem;
      if (!id || seen.has(id)) continue;
      seen.add(id);
      items.push({
        id,
        href: el.dataset.sceneHref ?? el.getAttribute("href"),
        weight: Number(el.dataset.sceneWeight) || 1,
      });
    }
    if (JSON.stringify(items) !== JSON.stringify(sceneStore.getState().items)) {
      sceneStore.setState({ items });
    }
    progress();
    mirror();
  };

  let queued = 0;
  const observer = new MutationObserver((records) => {
    const outside = records.some(
      (r) =>
        !(r.target instanceof Element && r.target.closest("[data-scene-root]"))
    );
    if (outside && !queued) {
      queued = requestAnimationFrame(() => {
        queued = 0;
        scan();
      });
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  const offActive = sceneStore.subscribe((s, prev) => {
    if (s.active !== prev.active) mirror();
  });

  document.addEventListener("pointerover", over);
  document.addEventListener("focusin", over);
  document.addEventListener("pointerout", out);
  document.addEventListener("focusout", out);
  addEventListener("scroll", progress, { passive: true });
  addEventListener("resize", progress);
  scan();

  return () => {
    observer.disconnect();
    cancelAnimationFrame(queued);
    offActive();
    document.removeEventListener("pointerover", over);
    document.removeEventListener("focusin", over);
    document.removeEventListener("pointerout", out);
    document.removeEventListener("focusout", out);
    removeEventListener("scroll", progress);
    removeEventListener("resize", progress);
    for (const el of marked) el.removeAttribute("data-scene-active");
  };
}

/**
 * Borrows the session canvas into `host` and renders one frame before
 * returning, so the caller can hide the poster without a blank flash.
 */
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
  const el = canvas!;
  host.append(el);
  store.getState().setDpr(DPR[tier]);

  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    store.getState().setSize(width, height, 0, 0);
    kick();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  const io = new IntersectionObserver(([entry]) => {
    sceneStore.setState({ visible: !!entry?.isIntersecting });
    kick();
  });
  io.observe(host);
  const offInput = bindInput(host);
  const offDom = bindDom();

  sceneStore.setState({ live: true, visible: true });
  renderNow();
  onReady();

  return () => {
    ro.disconnect();
    io.disconnect();
    offInput();
    offDom();
    if (el.parentElement === host) el.remove();
    sceneStore.setState({
      live: false,
      hovered: null,
      focused: null,
      active: null,
    });
  };
}

let tilting = false;

/** Device tilt as a small orbit offset; call from a user gesture (iOS asks permission). */
export async function enableTilt(): Promise<boolean> {
  if (tilting) return true;
  const Orientation = globalThis.DeviceOrientationEvent as
    | (typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<string>;
      })
    | undefined;
  if (!Orientation) return false;
  try {
    if (
      Orientation.requestPermission &&
      (await Orientation.requestPermission()) !== "granted"
    ) {
      return false;
    }
  } catch {
    return false;
  }
  tilting = true;
  addEventListener("deviceorientation", (e) => {
    if (e.gamma == null || e.beta == null) return;
    input.tiltX = clamp(e.gamma / 90, -0.5, 0.5) * 0.5;
    input.tiltY = clamp((e.beta - 45) / 90, -0.5, 0.5) * 0.3;
    input.movedAt = performance.now();
  });
  return true;
}
