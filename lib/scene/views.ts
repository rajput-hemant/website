import { createStore } from "zustand/vanilla";

import { SCENE_BUDGET } from "./budget";
import { afterNextFrame, kick, motionOn, renderNow } from "./clock";
import { postersOf, showPoster } from "./poster";
import { sceneStore } from "./store";

/**
 * Tracked views (docs/guides/m2-scene-spec.md, "Viewport mode"): the slot the
 * session is lent to is view 0, and every `[data-scene-view="<id>"]`
 * placeholder the edition has a view for is another, in document order, up
 * to {@link SCENE_BUDGET}.views. Each view has its own IntersectionObserver;
 * `visible` in the scene store is "any view is in range". DOM only, so the
 * rules are testable without WebGL.
 */

/** The id view 0 (the slot) carries. */
export const SLOT_VIEW = "slot";

/**
 * How far outside the viewport a view counts as in range, so a view scrolled
 * in is measured and drawn before its first row of pixels shows.
 */
export const VIEW_MARGIN = "100px 0px";
const MARGIN_PX = 100;

export type TrackedView = {
  /** {@link SLOT_VIEW}, or the placeholder's `data-scene-view`. */
  readonly id: string;
  readonly el: HTMLElement;
  /** Stable per element, for React keys. */
  readonly key: number;
  /** In range of the viewport: its frames run and it redraws on scroll. */
  readonly inView: boolean;
  /** Bumped a frame after the element resizes, so the view re-reads its size. */
  readonly rev: number;
};

export const viewStore = createStore<{ views: readonly TrackedView[] }>()(
  () => ({ views: [] })
);

let nextKey = 1;
const keys = new WeakMap<Element, number>();
function keyOf(el: Element) {
  let key = keys.get(el);
  if (key === undefined) {
    key = nextKey++;
    keys.set(el, key);
  }
  return key;
}

/** The IntersectionObserver's answer before its first callback. */
function inRange(el: Element) {
  const r = el.getBoundingClientRect();
  if (!r.width || !r.height) return false;
  return (
    r.bottom > -MARGIN_PX &&
    r.top < innerHeight + MARGIN_PX &&
    r.right > 0 &&
    r.left < innerWidth
  );
}

/** Fades a placeholder's posters once its view has drawn, and flags it live. */
function reveal(el: HTMLElement) {
  el.dataset.sceneLive = "";
  for (const poster of postersOf(el)) showPoster(poster, false, motionOn());
}

/** Gives a placeholder its posters back. */
function conceal(el: HTMLElement) {
  delete el.dataset.sceneLive;
  for (const poster of postersOf(el)) showPoster(poster, true, false);
}

/**
 * Called from inside a placeholder's view once its content has mounted: the
 * poster fades after the next frame, if the view is still tracked by then.
 */
export function markViewReady(el: HTMLElement) {
  const tracked = () =>
    viewStore.getState().views.some((v) => v.el === el && v.id !== SLOT_VIEW);
  if (!tracked()) return;
  afterNextFrame(() => {
    if (tracked()) reveal(el);
  });
}

export type TrackOptions = {
  /** Whether the edition renders anything for a placeholder id. */
  accepts: (id: string) => boolean;
  /**
   * Wraps each view-list update; the session passes the R3F `flushSync`, so
   * the views are committed before the frame that follows.
   */
  commit?: (update: () => void) => void;
};

/**
 * Tracks `slot` as view 0 plus the page's placeholders until the returned
 * stop is called, which also hands every placeholder its poster back.
 */
export function trackViews(slot: HTMLElement, options: TrackOptions) {
  const commit = options.commit ?? ((update) => update());
  const observers = new Map<HTMLElement, IntersectionObserver>();
  let views: TrackedView[] = [];

  const publish = (next: TrackedView[]) => {
    views = next;
    commit(() => viewStore.setState({ views }));
    const was = sceneStore.getState().visible;
    const visible = views.some((v) => v.inView);
    if (visible !== was) sceneStore.setState({ visible });
    kick();
    // The canvas is fixed: one last frame drops what the views drew, then
    // the clock sleeps until a view comes back in range.
    if (was && !visible) renderNow();
  };
  const patch = (el: HTMLElement, change: Partial<TrackedView>) => {
    if (!views.some((v) => v.el === el)) return;
    publish(views.map((v) => (v.el === el ? { ...v, ...change } : v)));
  };

  const resize = new ResizeObserver((entries) => {
    kick();
    const changed = entries.map((e) => e.target);
    afterNextFrame(() => {
      const next = views.map((v) =>
        changed.includes(v.el) ? { ...v, rev: v.rev + 1 } : v
      );
      if (next.some((v, i) => v !== views[i])) publish(next);
    });
  });
  // Content above a view can move it without a scroll; one frame re-glues it.
  const layout = new ResizeObserver(() => kick());
  layout.observe(document.body);

  const observe = (el: HTMLElement) => {
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries.at(-1);
        if (entry) patch(el, { inView: entry.isIntersecting });
      },
      { rootMargin: VIEW_MARGIN }
    );
    io.observe(el);
    observers.set(el, io);
    resize.observe(el);
  };
  const forget = (el: HTMLElement) => {
    observers.get(el)?.disconnect();
    observers.delete(el);
    resize.unobserve(el);
    if (el !== slot) conceal(el);
  };

  const collect = () => {
    const found: { id: string; el: HTMLElement }[] = [
      { id: SLOT_VIEW, el: slot },
    ];
    for (const el of document.querySelectorAll<HTMLElement>(
      "[data-scene-view]"
    )) {
      const id = el.dataset.sceneView;
      if (!id || el === slot || !options.accepts(id)) continue;
      // Past the budget a placeholder simply keeps its poster.
      if (found.length === SCENE_BUDGET.views) break;
      found.push({ id, el });
    }
    const next = found.map(
      ({ id, el }) =>
        views.find((v) => v.el === el && v.id === id) ?? {
          id,
          el,
          key: keyOf(el),
          inView: inRange(el),
          rev: 0,
        }
    );
    for (const v of views) {
      if (!next.some((n) => n.el === v.el && n.id === v.id)) forget(v.el);
    }
    for (const v of next) if (!observers.has(v.el)) observe(v.el);
    if (next.length !== views.length || next.some((v, i) => v !== views[i])) {
      publish(next);
    }
  };

  let queued = 0;
  const mutations = new MutationObserver(() => {
    queued ||= requestAnimationFrame(() => {
      queued = 0;
      collect();
    });
  });
  mutations.observe(document.body, { childList: true, subtree: true });
  collect();

  return () => {
    mutations.disconnect();
    cancelAnimationFrame(queued);
    layout.disconnect();
    for (const v of views) forget(v.el);
    resize.disconnect();
    views = [];
    commit(() => viewStore.setState({ views }));
  };
}
