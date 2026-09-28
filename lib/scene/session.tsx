import * as React from "react";
import { View } from "@react-three/drei";
import {
  advance,
  createRoot,
  events,
  extend,
  flushSync,
  useThree,
  type Dpr,
  type RootStore,
} from "@react-three/fiber";
import { Group } from "three";
import { useStore } from "zustand";

import { isDevelopment } from "@/lib/env";

import { frameStats, recordFrame } from "./budget";
import { kick, renderNow, startClock } from "./clock";
import { attachScene, bindSceneDom, enableTilt } from "./dom";
import { input, sceneStore } from "./store";
import {
  markViewReady,
  SLOT_VIEW,
  trackViews,
  viewStore,
  type TrackedView,
} from "./views";

type LiveTier = 1 | 2;

const DEFAULT_DPR: Record<LiveTier, Dpr> = { 1: 1, 2: [1, 1.5] };

/**
 * A viewport canvas covers the whole screen, not a slot, so it fills every
 * pixel on every frame. Below this width (phones) it renders at DPR 1 and
 * without MSAA unless the edition asks for `antialias: "always"`.
 */
const NARROW_VIEWPORT = 768;
const VIEWPORT_DPR: Record<LiveTier, Dpr> = { 1: 1, 2: [1, 1.25] };

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

/** What each `[data-scene-view="<id>"]` placeholder renders, by id. */
export type SceneViews = Readonly<Record<string, () => React.ReactNode>>;

export type ViewportOptions = {
  /**
   * The fixed canvas's z-index: above the page's own backgrounds, below the
   * edition's chrome (header, frame, overlays). Minimal uses -1, so text
   * always paints above the scene.
   */
  zIndex: number;
  /**
   * A `view-transition-name` for the canvas, so it is its own live group in
   * a view transition (the edition's CSS drops its old snapshot) rather than
   * part of the root snapshot, which freezes it and fades it with the page.
   */
  transitionName?: string;
  /**
   * Views beyond the slot. Each renders into its own scene; give it its own
   * camera with drei `<PerspectiveCamera makeDefault />` (or orthographic).
   * A placeholder whose id isn't here keeps its poster.
   */
  views?: SceneViews;
};

export type SessionSceneOptions = {
  /** The slot's scene (view 0 in viewport mode), on the root camera. */
  world: () => React.ReactNode;
  camera: { fov: number; position?: [number, number, number] };
  /** Turns on the renderer's local clipping planes. */
  clipping?: boolean;
  /** DPR per live tier; T1 1 and T2 [1, 1.5] by default. */
  dpr?: Readonly<Record<LiveTier, Dpr>>;
  /**
   * MSAA at T2 only (the default); at every tier on viewports 768px and wider
   * (`"wide"`, 1px linework that keeps the phone cap); or at every tier and
   * width. Decided once, when the GL context is created: a later resize
   * across 768px keeps whatever the context started with.
   */
  antialias?: "t2" | "wide" | "always";
  /**
   * Viewport mode: one fixed full-viewport canvas behind the page, the slot
   * and every placeholder drawn as drei `View`s. Without it the canvas is
   * lent to the slot and sized to it.
   */
  viewport?: ViewportOptions;
} & (
  | { drag: DragBounds }
  /** An edition's own pointer input over the slot, in place of `drag`. */
  | { bindInput: (host: HTMLElement) => () => void }
);

// drei `View` draws its regions from `<group>`s; the catalogue is opt-in.
extend({ Group });

const SlotContext = React.createContext<{
  readonly current: HTMLElement;
} | null>(null);

/**
 * Inside view 0 in viewport mode: the slot host the view tracks, which
 * changes with each slot the session is lent to (read `current` per frame).
 * The canvas is fixed to the viewport, so DOM that sits over the scene
 * (labels, leader lines) is placed against this element. Mount that DOM as
 * a sibling of the host, never inside it: drei `View`'s event compute only
 * updates the ray when `event.target` is the tracked host itself, so a
 * pointer over a child would leave hover on a stale ray. Null elsewhere.
 */
export function useSceneSlot() {
  return React.useContext(SlotContext);
}

/** Renders `onMount` once its view's content has committed. */
function Mounted({ onMount }: { onMount: () => void }) {
  React.useLayoutEffect(() => onMount(), [onMount]);
  return null;
}

/**
 * One drei `View` over a tracked element. Frames (the rect re-read) run only
 * while it's in range; a resize re-injects the portal's size.
 */
function TrackedViewport({
  track,
  view,
  index,
  onMount,
  children,
}: {
  track: { current: HTMLElement };
  view: TrackedView | undefined;
  index: number;
  onMount: () => void;
  children: React.ReactNode;
}) {
  const set = useThree((s) => s.set);
  const rev = view?.rev ?? 0;
  React.useEffect(() => {
    if (!rev) return;
    // The portal copies its size from the root only when the root changes.
    set({});
    kick();
  }, [rev, set]);
  return (
    <View
      track={track}
      index={index}
      visible={!!view}
      frames={view?.inView ? Infinity : 0}
    >
      <Mounted onMount={onMount} />
      {children}
    </View>
  );
}

function PlaceholderView({
  view,
  index,
  render,
}: {
  view: TrackedView;
  index: number;
  render: () => React.ReactNode;
}) {
  const { el } = view;
  const [track] = React.useState(() => ({ current: el }));
  const onMount = React.useCallback(() => markViewReady(el), [el]);
  return (
    <TrackedViewport track={track} view={view} index={index} onMount={onMount}>
      {render()}
    </TrackedViewport>
  );
}

function ViewportWorld({
  world,
  views,
  slot,
  onSlotMount,
}: {
  world: () => React.ReactNode;
  views: SceneViews;
  slot: { current: HTMLElement };
  onSlotMount: () => void;
}) {
  const tracked = useStore(viewStore, (s) => s.views);
  return (
    <>
      <View.Port />
      <TrackedViewport
        track={slot}
        view={tracked.find((v) => v.id === SLOT_VIEW)}
        index={1}
        onMount={onSlotMount}
      >
        <SlotContext value={slot}>{world()}</SlotContext>
      </TrackedViewport>
      {tracked.map((view, i) => {
        const render = views[view.id];
        if (view.id === SLOT_VIEW || !render) return null;
        return (
          <PlaceholderView
            key={view.key}
            view={view}
            index={i + 1}
            render={render}
          />
        );
      })}
    </>
  );
}

const viewportSize = () => ({
  width: document.documentElement.clientWidth,
  height: document.documentElement.clientHeight,
  top: 0,
  left: 0,
});

/**
 * One canvas and one R3F root for the whole session, lent to whichever slot
 * is on screen (the SceneModule contract of `useSceneMount`). The frame loop
 * is the shared clock, so nothing renders while the scene is idle. An edition
 * passes its world, camera and pointer input; in viewport mode also its
 * z-layer and extra views.
 */
export function createSessionScene(options: SessionSceneOptions) {
  const { world, camera, clipping = false, viewport } = options;
  const baseDpr = options.dpr ?? (viewport ? VIEWPORT_DPR : DEFAULT_DPR);
  const narrow = () =>
    Boolean(viewport) && document.documentElement.clientWidth < NARROW_VIEWPORT;
  const dprFor = (tier: LiveTier): Dpr => (narrow() ? 1 : baseDpr[tier]);
  const bindInput =
    "bindInput" in options
      ? options.bindInput
      : (host: HTMLElement) => bindDragInput(host, options.drag);
  const views = viewport?.views ?? {};

  let canvas: HTMLCanvasElement | null = null;
  let fiber: RootStore | null = null;
  /** Viewport mode: view 0's track, pointed at each slot in turn. */
  let slot: { current: HTMLElement } | null = null;
  let created = false;
  let slotMounted = false;
  let pending: (() => void) | null = null;
  const warned = new Set<string>();

  const fail = () => sceneStore.setState({ tier: 0, maxTier: 0 });
  const onSlotMount = () => {
    slotMounted = true;
    const ready = pending;
    pending = null;
    ready?.();
  };

  function ensureRoot(tier: LiveTier, host: HTMLElement) {
    if (fiber && canvas) return { store: fiber, canvas };
    const el = document.createElement("canvas");
    el.setAttribute("aria-hidden", "true");
    el.style.display = "block";
    el.addEventListener("webglcontextlost", fail);
    if (viewport) {
      Object.assign(el.style, {
        position: "fixed",
        inset: "0",
        pointerEvents: "none",
        zIndex: String(viewport.zIndex),
        visibility: "hidden",
      });
      if (viewport.transitionName) {
        el.style.viewTransitionName = viewport.transitionName;
      }
      document.body.append(el);
    }
    const next = createRoot(el);
    void next
      .configure({
        frameloop: "never",
        flat: true,
        dpr: dprFor(tier),
        events,
        gl: {
          antialias:
            options.antialias === "always" ||
            (!narrow() && (tier === 2 || options.antialias === "wide")),
          alpha: true,
          powerPreference: "default",
        },
        camera: { ...camera, near: 0.1, far: 80 },
        size: viewport
          ? viewportSize()
          : { width: 1, height: 1, top: 0, left: 0 },
        onCreated: (state) => {
          state.gl.setClearColor(0x000000, 0);
          state.gl.localClippingEnabled = clipping;
          // Views each call render(); the frame sums them (budget.ts).
          if (viewport) state.gl.info.autoReset = false;
          // Before R3F would connect pointer events to the (inert) canvas.
          // A slot detached before creation is skipped: R3F then connects the
          // pointer-events:none canvas, which is harmless, and the next
          // mountViewport reconnects to its host.
          if (viewport && slot?.current.isConnected) {
            state.events.connect?.(slot.current);
          }
          created = true;
        },
      })
      .catch(fail);
    if (viewport) {
      slot = { current: host };
      const track = slot;
      fiber = next.render(
        <ViewportWorld
          world={world}
          views={views}
          slot={track}
          onSlotMount={onSlotMount}
        />
      );
      const store = fiber;
      startClock((seconds) => {
        if (!created) return;
        const { gl } = store.getState();
        gl.setScissorTest(false);
        gl.clear();
        gl.info.reset();
        advance(seconds);
        const over = recordFrame(
          gl.info.render,
          viewStore.getState().views.length
        );
        for (const key of over) {
          if (!isDevelopment || warned.has(key)) continue;
          warned.add(key);
          console.warn(`Scene over budget (${key}):`, frameStats);
        }
      });
      addEventListener("resize", () => {
        const { width, height } = viewportSize();
        store.getState().setSize(width, height, 0, 0);
        kick();
      });
    } else {
      fiber = next.render(world());
      startClock((seconds) => advance(seconds));
    }
    canvas = el;
    return { store: fiber, canvas: el };
  }

  function mountViewport(
    host: HTMLElement,
    store: RootStore,
    el: HTMLCanvasElement,
    onReady: () => void
  ): () => void {
    if (slot) slot.current = host;
    el.style.visibility = "";
    const accepts = (id: string) => Object.hasOwn(views, id);
    const offViews = trackViews(host, { accepts, commit: flushSync });
    const offInput = bindInput(host);
    const offDom = bindSceneDom();
    // The canvas takes no pointer events; mesh handlers listen on the slot.
    // The first slot connects once the root is created (see onCreated).
    if (created) store.getState().events.connect?.(host);
    const ready = () => {
      sceneStore.setState({ live: true });
      renderNow();
      document.documentElement.dataset.sceneLive = "";
      onReady();
    };
    // View 0 mounts once, a task after the root; later slots are drawn now.
    if (slotMounted) ready();
    else pending = ready;

    return () => {
      if (pending === ready) pending = null;
      offViews();
      offInput();
      offDom();
      const { events } = store.getState();
      if (events.connected === host) {
        // Cancel hover first, so a mesh under the pointer at navigation
        // gets its pointer-out instead of staying hovered.
        events.handlers?.onPointerLeave(new PointerEvent("pointerleave"));
        events.disconnect?.();
      }
      sceneStore.setState({
        live: false,
        hovered: null,
        focused: null,
        active: null,
      });
      delete document.documentElement.dataset.sceneLive;
      if (created) {
        const { gl } = store.getState();
        gl.setScissorTest(false);
        gl.clear();
      }
      el.style.visibility = "hidden";
    };
  }

  function mountScene(
    host: HTMLElement,
    tier: LiveTier,
    onReady: () => void
  ): () => void {
    let made: { store: RootStore; canvas: HTMLCanvasElement };
    try {
      made = ensureRoot(tier, host);
    } catch {
      fail();
      return () => {};
    }
    const { store } = made;
    store.getState().setDpr(dprFor(tier));
    if (viewport) return mountViewport(host, store, made.canvas, onReady);
    return attachScene(host, made.canvas, {
      setSize: (width, height) => store.getState().setSize(width, height, 0, 0),
      bindInput,
      onReady,
    });
  }

  return { mountScene, enableTilt };
}
