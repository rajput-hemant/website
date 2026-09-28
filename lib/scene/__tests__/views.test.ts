// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderNow } from "../clock";
import { sceneStore } from "../store";
import {
  markViewReady,
  SLOT_VIEW,
  trackViews,
  VIEW_MARGIN,
  viewStore,
} from "../views";

vi.mock("../clock", async (actual) => {
  const clock = await actual<typeof import("../clock")>();
  return { ...clock, renderNow: vi.fn(clock.renderNow) };
});

/** A controllable IntersectionObserver, one per tracked element. */
class FakeIO {
  static all: FakeIO[] = [];
  readonly targets: Element[] = [];
  constructor(
    readonly callback: (entries: { isIntersecting: boolean }[]) => void,
    readonly options: IntersectionObserverInit = {}
  ) {
    FakeIO.all.push(this);
  }
  observe(el: Element) {
    this.targets.push(el);
  }
  disconnect() {
    this.targets.length = 0;
  }
  static fire(el: Element, isIntersecting: boolean) {
    for (const io of FakeIO.all) {
      if (io.targets.includes(el)) io.callback([{ isIntersecting }]);
    }
  }
}

class FakeRO {
  observe() {}
  unobserve() {}
  disconnect() {}
}

let frame: FrameRequestCallback | null = null;

/** Places `el` in (or far out of) the viewport for the first measurement. */
function at(el: HTMLElement, top: number) {
  el.getBoundingClientRect = () => new DOMRect(0, top, 300, 200);
  return el;
}

function placeholder(id: string, top = 0) {
  const el = document.createElement("div");
  el.dataset.sceneView = id;
  const poster = document.createElement("div");
  poster.dataset.scenePoster = "";
  el.append(poster);
  document.body.append(at(el, top));
  return { el, poster };
}

let slot: HTMLElement;
const accepts = (id: string) => id !== "unknown";

beforeEach(() => {
  FakeIO.all = [];
  vi.stubGlobal("IntersectionObserver", FakeIO);
  vi.stubGlobal("ResizeObserver", FakeRO);
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    frame = cb;
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {
    frame = null;
  });
  document.documentElement.dataset.motion = "on";
  slot = at(document.createElement("div"), 0);
  document.body.append(slot);
  sceneStore.setState({ visible: true, live: true });
  vi.mocked(renderNow).mockClear();
});

afterEach(() => {
  document.body.replaceChildren();
  vi.unstubAllGlobals();
});

const ids = () => viewStore.getState().views.map((v) => v.id);

describe("trackViews", () => {
  it("tracks the slot as view 0 and known placeholders in document order", () => {
    placeholder("loupe");
    placeholder("unknown");
    placeholder("stamp");
    const stop = trackViews(slot, { accepts });
    expect(ids()).toEqual([SLOT_VIEW, "loupe", "stamp"]);
    // One observer per view, with the scroll-in margin.
    expect(FakeIO.all).toHaveLength(3);
    expect(FakeIO.all[0]?.options.rootMargin).toBe(VIEW_MARGIN);
    stop();
    expect(ids()).toEqual([]);
  });

  it("keeps a page to 4 live views; the rest keep their posters", () => {
    const extra = ["a", "b", "c", "d", "e"].map((id) => placeholder(id));
    const stop = trackViews(slot, { accepts });
    expect(ids()).toEqual([SLOT_VIEW, "a", "b", "c"]);
    expect(extra[3]?.poster.dataset.scenePoster).toBe("");
    stop();
  });

  it("is visible while any view intersects, and draws one last frame after", () => {
    const { el } = placeholder("loupe", 5000);
    const stop = trackViews(slot, { accepts });
    const [first, second] = viewStore.getState().views;
    expect(first?.inView).toBe(true);
    expect(second?.inView).toBe(false);

    FakeIO.fire(slot, false);
    expect(sceneStore.getState().visible).toBe(false);
    expect(renderNow).toHaveBeenCalledTimes(1);

    FakeIO.fire(el, true);
    expect(sceneStore.getState().visible).toBe(true);
    expect(viewStore.getState().views[1]?.inView).toBe(true);
    FakeIO.fire(slot, true);
    FakeIO.fire(el, false);
    expect(sceneStore.getState().visible).toBe(true);
    expect(renderNow).toHaveBeenCalledTimes(1);
    stop();
  });

  it("picks up placeholders added later and drops removed ones", () => {
    const stop = trackViews(slot, { accepts });
    expect(ids()).toEqual([SLOT_VIEW]);
    const { el } = placeholder("stamp");
    return Promise.resolve().then(() => {
      frame?.(0);
      expect(ids()).toEqual([SLOT_VIEW, "stamp"]);
      el.remove();
      return Promise.resolve().then(() => {
        frame?.(0);
        expect(ids()).toEqual([SLOT_VIEW]);
        stop();
      });
    });
  });

  it("hands a placeholder's poster over after its first frame, and back on stop", () => {
    const { el, poster } = placeholder("loupe");
    const stop = trackViews(slot, { accepts });
    markViewReady(el);
    expect(poster.dataset.scenePoster).toBe("");
    renderNow();
    expect(el.dataset.sceneLive).toBe("");
    expect(poster.dataset.scenePoster).toBe("hidden");
    expect(poster.style.opacity).toBe("0");
    expect(poster.style.transition).toContain("var(--ease-enter");

    stop();
    expect(el.dataset.sceneLive).toBeUndefined();
    expect(poster.dataset.scenePoster).toBe("");
    expect(poster.style.opacity).toBe("");
  });

  it("never reveals a view that stopped being tracked before its frame", () => {
    const { el, poster } = placeholder("loupe");
    const stop = trackViews(slot, { accepts });
    markViewReady(el);
    stop();
    renderNow();
    expect(poster.dataset.scenePoster).toBe("");
  });
});
