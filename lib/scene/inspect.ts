import type { BlitRenderer, Glyph } from "./blit";

/**
 * Inspect controls (docs/guides/m2-scene-spec.md, "Inspect controls"): turn a 3D
 * object a full 360 degrees and zoom it, by drag, pinch, ctrl/cmd+wheel or
 * the keyboard, damped, and settling so the clock sleeps. One pure core
 * (`createInspect`), one DOM input binding (`bindInspect`) and two thin
 * adapters: `sceneInspect` for an R3F world and `inspectGlyph` for a blit
 * glyph. No three.js, no clock and no edition here; editions pass the object
 * to pose and the function that wakes their frames.
 */

export type InspectPose = { yaw: number; pitch: number; zoom: number };

export type InspectOptions = {
  /** Pitch limits, radians. Default a little over a quarter turn either way. */
  pitch?: readonly [number, number];
  /** Zoom limits, as a scale. Default 0.75 to 2. */
  zoom?: readonly [number, number];
  /** The pose a reset returns to. Default yaw 0, pitch 0, zoom 1. */
  rest?: Partial<InspectPose>;
  /** Read on every input and step: no inertia, drag snaps, springs shorten. */
  reducedMotion?: () => boolean;
  /** Runs after input that needs frames (kick the clock or the glyph). */
  onWake?: () => void;
};

export type Inspect = {
  /** Where the object is now, springs included. */
  readonly pose: InspectPose;
  /** Where the springs are heading. */
  readonly target: InspectPose;
  readonly dragging: boolean;
  /** Start a drag (pointer down past the slop, or a second finger). */
  grab(): void;
  /** Turn by radians during a drag; `t` is the event time in ms, for inertia. */
  drag(dYaw: number, dPitch: number, t: number): void;
  /** End the drag; a flick released at `t` ms coasts on (not in reduced motion). */
  release(t: number): void;
  /** End the drag without a fling (pointer cancelled, or the scene lent away). */
  cancel(): void;
  /** Turn by radians, damped (keyboard). */
  rotateBy(dYaw: number, dPitch: number): void;
  /** Scale the zoom by `factor`, clamped. */
  zoomBy(factor: number): void;
  /** Back to the rest pose, the short way round. */
  reset(): void;
  /**
   * A keyboard twin: arrows turn (shift for bigger steps), + and - zoom, 0
   * or Home resets. Whether the key was one of these.
   */
  key(key: string, shift?: boolean): boolean;
  /** Advance by `dt` seconds; whether it still moves. */
  step(dt: number): boolean;
  /** Called on every user input, e.g. to hide a hint. Returns the unsubscribe. */
  subscribe(listener: () => void): () => void;
};

const TAU = Math.PI * 2;
/** Spring rates (rad/s): critically damped, so nothing overshoots. */
const OMEGA = 16;
const OMEGA_REDUCED = 40;
/** How fast a flick's coast decays, 1/s, and the speed it stops below. */
const FRICTION = 4;
const MIN_SPIN = 0.05;
const MAX_SPIN = 14;
/** A release this long after the last move is a hold, not a flick. */
const FLICK_MS = 80;
const EPS_X = 1e-4;
const EPS_V = 1e-3;
/** Keyboard steps, radians, and the zoom step, as a factor. */
export const KEY_YAW = Math.PI / 12;
export const KEY_PITCH = Math.PI / 24;
export const KEY_ZOOM = 1.2;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

type Axis = { x: number; v: number };

/** One critically damped step of `s` towards `target`, exact for any `dt`. */
function spring(s: Axis, target: number, omega: number, dt: number) {
  const x = s.x - target;
  const temp = (s.v + omega * x) * dt;
  const decay = Math.exp(-omega * dt);
  s.x = target + (x + temp) * decay;
  s.v = (s.v - omega * temp) * decay;
}

const settled = (s: Axis, target: number) =>
  Math.abs(s.x - target) < EPS_X && Math.abs(s.v) < EPS_V;

export function createInspect(options: InspectOptions = {}): Inspect {
  const [pMin, pMax] = options.pitch ?? [-1.2, 1.2];
  const [zMin, zMax] = options.zoom ?? [0.75, 2];
  const rest: InspectPose = {
    yaw: options.rest?.yaw ?? 0,
    pitch: clamp(options.rest?.pitch ?? 0, pMin, pMax),
    zoom: clamp(options.rest?.zoom ?? 1, zMin, zMax),
  };
  const reduced = options.reducedMotion ?? (() => false);
  const wake = options.onWake ?? (() => {});
  const listeners = new Set<() => void>();

  const target = { ...rest };
  const yaw: Axis = { x: rest.yaw, v: 0 };
  const pitch: Axis = { x: rest.pitch, v: 0 };
  const zoom: Axis = { x: rest.zoom, v: 0 };
  /** The flick's coast, rad/s, and the drag's measured speed. */
  const spin = { yaw: 0, pitch: 0 };
  const speed = { yaw: 0, pitch: 0 };
  let lastMove = 0;
  let dragging = false;

  const used = () => {
    for (const listener of listeners) listener();
    wake();
  };
  const snap = () => {
    yaw.x = target.yaw;
    pitch.x = target.pitch;
    zoom.x = target.zoom;
    yaw.v = pitch.v = zoom.v = 0;
  };
  const stopSpin = () => {
    spin.yaw = spin.pitch = 0;
  };

  const inspect: Inspect = {
    get pose() {
      return { yaw: yaw.x, pitch: pitch.x, zoom: zoom.x };
    },
    get target() {
      return { ...target };
    },
    get dragging() {
      return dragging;
    },
    grab() {
      dragging = true;
      stopSpin();
      speed.yaw = speed.pitch = 0;
      lastMove = 0;
      used();
    },
    drag(dYaw, dPitch, t) {
      target.yaw += dYaw;
      target.pitch = clamp(target.pitch + dPitch, pMin, pMax);
      const dt = lastMove ? (t - lastMove) / 1000 : 0;
      if (dt > 0) {
        // Smoothed, so one jittery sample doesn't decide the flick.
        const blend = dt > 0.1 ? 1 : 0.8;
        speed.yaw += (dYaw / dt - speed.yaw) * blend;
        speed.pitch += (dPitch / dt - speed.pitch) * blend;
      }
      lastMove = t;
      if (reduced()) snap();
      used();
    },
    release(t) {
      if (!dragging) return;
      dragging = false;
      const fresh = lastMove > 0 && t - lastMove <= FLICK_MS;
      if (fresh && !reduced()) {
        spin.yaw = clamp(speed.yaw, -MAX_SPIN, MAX_SPIN);
        spin.pitch = clamp(speed.pitch, -MAX_SPIN, MAX_SPIN);
      }
      used();
    },
    cancel() {
      if (!dragging) return;
      dragging = false;
      stopSpin();
      speed.yaw = speed.pitch = 0;
      used();
    },
    rotateBy(dYaw, dPitch) {
      stopSpin();
      target.yaw += dYaw;
      target.pitch = clamp(target.pitch + dPitch, pMin, pMax);
      used();
    },
    zoomBy(factor) {
      if (!(factor > 0)) return;
      target.zoom = clamp(target.zoom * factor, zMin, zMax);
      used();
    },
    reset() {
      stopSpin();
      // The nearest turn of the rest yaw, so a reset never unwinds turns.
      target.yaw = rest.yaw + TAU * Math.round((yaw.x - rest.yaw) / TAU);
      target.pitch = rest.pitch;
      target.zoom = rest.zoom;
      used();
    },
    key(key, shift = false) {
      const k = shift ? 3 : 1;
      switch (key) {
        case "ArrowLeft":
          inspect.rotateBy(-KEY_YAW * k, 0);
          return true;
        case "ArrowRight":
          inspect.rotateBy(KEY_YAW * k, 0);
          return true;
        case "ArrowUp":
          inspect.rotateBy(0, -KEY_PITCH * k);
          return true;
        case "ArrowDown":
          inspect.rotateBy(0, KEY_PITCH * k);
          return true;
        case "+":
        case "=":
          inspect.zoomBy(KEY_ZOOM);
          return true;
        case "-":
        case "_":
          inspect.zoomBy(1 / KEY_ZOOM);
          return true;
        case "0":
        case "Home":
          inspect.reset();
          return true;
        default:
          return false;
      }
    },
    step(rawDt) {
      const dt = Number.isFinite(rawDt) ? clamp(rawDt, 0, 1 / 20) : 0;
      const calm = reduced();
      if (calm) stopSpin();
      if (spin.yaw || spin.pitch) {
        target.yaw += spin.yaw * dt;
        const p = target.pitch + spin.pitch * dt;
        target.pitch = clamp(p, pMin, pMax);
        // Coasting into a pitch limit stops that axis there.
        if (target.pitch !== p) spin.pitch = 0;
        const decay = Math.exp(-FRICTION * dt);
        spin.yaw *= decay;
        spin.pitch *= decay;
        if (Math.hypot(spin.yaw, spin.pitch) < MIN_SPIN) stopSpin();
      }
      const omega = calm ? OMEGA_REDUCED : OMEGA;
      spring(yaw, target.yaw, omega, dt);
      spring(pitch, target.pitch, omega, dt);
      spring(zoom, target.zoom, omega, dt);
      const still =
        !spin.yaw &&
        !spin.pitch &&
        settled(yaw, target.yaw) &&
        settled(pitch, target.pitch) &&
        settled(zoom, target.zoom);
      if (!still) return true;
      snap();
      // At rest, fold whole turns away so the angle never grows unbounded.
      if (!dragging) {
        const turns = Math.round(target.yaw / TAU);
        target.yaw -= turns * TAU;
        yaw.x = target.yaw;
      }
      return false;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
  return inspect;
}

/** What `applyPose` needs; a three.js `Object3D` is one. */
export type Posable = {
  rotation: { set(x: number, y: number, z: number): unknown };
  scale: { setScalar(s: number): unknown };
};

/**
 * Pose `object` (a group wrapping the model, so the model keeps its own
 * rotation): pitch about the screen's x axis, then yaw about the model's up
 * axis, then the zoom as a uniform scale.
 */
export function applyPose(object: Posable, pose: InspectPose) {
  object.rotation.set(pose.pitch, pose.yaw, 0);
  object.scale.setScalar(pose.zoom);
}

/* Which host shows which inspect, for the DOM keyboard control and hint. */

const hosts = new Map<Element, Inspect>();
const watchers = new Set<() => void>();
let usedOnce = false;

const notify = () => {
  for (const watcher of watchers) watcher();
};

/** The inspect bound to `host`, if its scene is live. */
export function inspectFor(host: Element | null | undefined): Inspect | null {
  return (host && hosts.get(host)) ?? null;
}

/** Whether any inspect on the page has been used this session. */
export function inspectUsed() {
  return usedOnce;
}

/** Runs `listener` when an inspect binds, unbinds or is first used. */
export function watchInspect(listener: () => void): () => void {
  watchers.add(listener);
  return () => {
    watchers.delete(listener);
  };
}

export type BindOptions = {
  /** Radians of yaw for a drag across the host's width. Default a half turn. */
  turnPerWidth?: number;
  /** Touch travel, px, before a horizontal move starts turning. Default 10. */
  touchSlop?: number;
};

type Point = { x: number; y: number; type: string };

/**
 * Pointer input on `host` (the slot host in an R3F session, or a glyph's
 * host): a drag turns (pointer capture; on touch only after a horizontal
 * move or with two fingers, so vertical swipes scroll the page), a pinch or
 * ctrl/cmd+wheel zooms (a plain wheel scrolls the page), and a double click
 * or double tap resets. Sets `touch-action: pan-y` on the host while bound,
 * mirrors the drag to `data-inspect="drag"`, and registers the host for
 * `InspectControl` and `InspectHint`. Returns the cleanup.
 */
export function bindInspect(
  host: HTMLElement,
  inspect: Inspect,
  options: BindOptions = {}
): () => void {
  const turn = options.turnPerWidth ?? Math.PI;
  const slop = options.touchSlop ?? 10;
  const points = new Map<number, Point>();
  let mode: "idle" | "pending" | "turn" | "pinch" | "scroll" = "idle";
  let origin = { x: 0, y: 0 };
  let last = { x: 0, y: 0 };
  let spread = 0;
  let moved = false;
  let lastTap = { t: -Infinity, x: 0, y: 0 };
  let lastType = "mouse";

  const perPx = () => turn / Math.max(1, host.clientWidth);
  const centre = () => {
    let x = 0;
    let y = 0;
    for (const p of points.values()) {
      x += p.x;
      y += p.y;
    }
    return { x: x / points.size, y: y / points.size };
  };
  const distance = () => {
    const [a, b] = [...points.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  };
  const capture = () => {
    for (const id of points.keys()) {
      try {
        host.setPointerCapture(id);
      } catch {
        // The pointer is already gone.
      }
    }
  };
  const begin = (next: "turn" | "pinch") => {
    if (mode !== "turn" && mode !== "pinch") inspect.grab();
    mode = next;
    moved = true;
    last = centre();
    spread = distance();
    capture();
    host.dataset.inspect = "drag";
  };
  const end = (t: number, fling = true) => {
    if (mode === "turn" || mode === "pinch") {
      if (fling) inspect.release(t);
      else inspect.cancel();
    }
    mode = "idle";
    host.dataset.inspect = "";
  };

  const down = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    lastType = e.pointerType;
    points.set(e.pointerId, {
      x: e.clientX,
      y: e.clientY,
      type: e.pointerType,
    });
    if (points.size === 1) {
      mode = "pending";
      moved = false;
      origin = { x: e.clientX, y: e.clientY };
    } else if (mode !== "scroll") {
      // A second or later finger: carry on from the new set's centre.
      begin("pinch");
    }
  };
  const move = (e: PointerEvent) => {
    const p = points.get(e.pointerId);
    if (!p) return;
    // The button was let go outside the host while not captured.
    if (p.type === "mouse" && e.buttons === 0) {
      up(e);
      return;
    }
    p.x = e.clientX;
    p.y = e.clientY;
    if (mode === "pending") {
      const dx = p.x - origin.x;
      const dy = p.y - origin.y;
      const starts =
        p.type === "touch"
          ? Math.abs(dx) > slop && Math.abs(dx) > 1.5 * Math.abs(dy)
          : Math.hypot(dx, dy) > 3;
      // The page is scrolling (the browser will cancel the pointer).
      if (!starts && p.type === "touch" && Math.abs(dy) > slop) mode = "scroll";
      // Turning starts from here, so the slop isn't a jump.
      if (starts) begin("turn");
      return;
    }
    if (mode !== "turn" && mode !== "pinch") return;
    const c = centre();
    const k = perPx();
    inspect.drag((c.x - last.x) * k, (c.y - last.y) * k, e.timeStamp);
    last = c;
    if (mode === "pinch") {
      const d = distance();
      if (spread > 0 && d > 0) inspect.zoomBy(d / spread);
      spread = d;
    }
  };
  const up = (e: PointerEvent) => {
    const p = points.get(e.pointerId);
    if (!p) return;
    points.delete(e.pointerId);
    const tap = e.type === "pointerup" && mode === "pending" && !moved;
    if (tap && p.type === "touch") {
      const near = Math.hypot(p.x - lastTap.x, p.y - lastTap.y) < 30;
      if (e.timeStamp - lastTap.t < 300 && near) {
        inspect.reset();
        lastTap = { t: -Infinity, x: 0, y: 0 };
      } else {
        lastTap = { t: e.timeStamp, x: p.x, y: p.y };
      }
    }
    if (points.size === 0) end(e.timeStamp, e.type !== "pointercancel");
    else if (mode === "turn" || mode === "pinch") {
      // The set changed: two or more still pinch, one carries on turning,
      // each from where it is now.
      mode = points.size >= 2 ? "pinch" : "turn";
      last = centre();
      spread = mode === "pinch" ? distance() : 0;
      capture();
    }
  };
  const wheel = (e: WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    // Trackpad pinches arrive as ctrl+wheel too; either way, not the page's zoom.
    e.preventDefault();
    const lines = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
    inspect.zoomBy(Math.exp(-e.deltaY * lines * 0.002));
  };
  const dblclick = (e: MouseEvent) => {
    if (lastType === "touch") return;
    e.preventDefault();
    inspect.reset();
  };
  // A drag that ends over a mesh must not click it.
  const click = (e: MouseEvent) => {
    if (!moved) return;
    moved = false;
    e.stopImmediatePropagation();
  };

  const touchAction = host.style.touchAction;
  host.style.touchAction = "pan-y";
  host.dataset.inspect = "";
  host.addEventListener("pointerdown", down);
  host.addEventListener("pointermove", move);
  host.addEventListener("pointerup", up);
  host.addEventListener("pointercancel", up);
  host.addEventListener("wheel", wheel, { passive: false });
  host.addEventListener("dblclick", dblclick);
  host.addEventListener("click", click, { capture: true });
  const offUse = inspect.subscribe(() => {
    if (usedOnce) return;
    usedOnce = true;
    notify();
  });
  hosts.set(host, inspect);
  notify();

  return () => {
    host.removeEventListener("pointerdown", down);
    host.removeEventListener("pointermove", move);
    host.removeEventListener("pointerup", up);
    host.removeEventListener("pointercancel", up);
    host.removeEventListener("wheel", wheel);
    host.removeEventListener("dblclick", dblclick);
    host.removeEventListener("click", click, { capture: true });
    offUse();
    if (mode === "turn" || mode === "pinch") inspect.cancel();
    host.style.touchAction = touchAction;
    delete host.dataset.inspect;
    if (hosts.get(host) === inspect) hosts.delete(host);
    notify();
  };
}

/**
 * The R3F adapter: an inspect whose input wakes the session clock. Bind it
 * in the session's `bindInput` (beside any other input) and call `frame`
 * from the world's `useFrame` with the group to pose; OR its result into
 * the world's own `settle(busy)`, since the clock has one settle flag.
 */
export function sceneInspect(
  options: InspectOptions & { onWake: () => void },
  bind: BindOptions = {}
) {
  const inspect = createInspect(options);
  return {
    inspect,
    bindInput: (host: HTMLElement) => bindInspect(host, inspect, bind),
    /** Step and pose `object`; whether it still moves. */
    frame: (object: Posable, dt: number) => {
      const moving = inspect.step(dt);
      applyPose(object, inspect.pose);
      return moving;
    },
  };
}

/**
 * The blit adapter: wraps `glyph` so each step also steps the inspect and
 * poses `object` (a group in the glyph's scene), and input kicks the glyph.
 * Mount the returned glyph instead of the original, and `bindInspect` its
 * host (the element the glyph's canvas fills).
 */
export function inspectGlyph<R extends BlitRenderer>(
  glyph: Glyph<R>,
  object: Posable,
  options: InspectOptions & { kick: (glyph: Glyph<R>) => void }
): { glyph: Glyph<R>; inspect: Inspect } {
  const { kick, ...rest } = options;
  const wrapped: Glyph<R> = {
    get scene() {
      return glyph.scene;
    },
    get camera() {
      return glyph.camera;
    },
    step(dt) {
      // Both step every frame: no short circuit.
      const own = glyph.step(dt);
      const turning = inspect.step(dt);
      applyPose(object, inspect.pose);
      return own || turning;
    },
  };
  if (glyph.setup) wrapped.setup = (renderer) => glyph.setup?.(renderer);
  if (glyph.paint) wrapped.paint = () => glyph.paint?.();
  const inspect = createInspect({
    ...rest,
    onWake: () => {
      rest.onWake?.();
      kick(wrapped);
    },
  });
  applyPose(object, inspect.pose);
  return { glyph: wrapped, inspect };
}
