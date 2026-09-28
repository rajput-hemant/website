// @vitest-environment jsdom
import * as React from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { frameStats } from "../budget";
import { sceneStore } from "../store";

/** The fake R3F root: what was rendered, and the renderer the frame uses. */
const r3f = vi.hoisted(() => ({
  element: null as React.ReactElement<{ onSlotMount: () => void }> | null,
  gl: {
    setClearColor: () => {},
    setScissorTest: () => {},
    clear: () => {},
    localClippingEnabled: false,
    info: {
      autoReset: true,
      reset: () => {},
      render: { calls: 7, triangles: 900 },
    },
  },
  advance: (_seconds: number) => {},
  events: {
    connected: null as HTMLElement | null,
    connect(target: HTMLElement) {
      r3f.events.connected = target;
    },
    disconnect() {
      r3f.events.connected = null;
    },
    handlers: {
      onPointerLeave: vi.fn<(event: Event) => void>(),
    },
  },
  config: null as { dpr?: unknown; gl?: { antialias?: boolean } } | null,
}));

vi.mock("@react-three/fiber", () => {
  const state = {
    gl: r3f.gl,
    setDpr: () => {},
    setSize: () => {},
    events: r3f.events,
  };
  return {
    advance: (s: number) => r3f.advance(s),
    events: {},
    extend: () => {},
    flushSync: (fn: () => void) => fn(),
    useThree: () => () => {},
    createRoot: () => ({
      configure: (
        config: { onCreated: (s: typeof state) => void } & NonNullable<
          typeof r3f.config
        >
      ) => {
        r3f.config = config;
        config.onCreated(state);
        return Promise.resolve();
      },
      render: (element: React.ReactElement<{ onSlotMount: () => void }>) => {
        r3f.element = element;
        return { getState: () => state };
      },
    }),
  };
});
vi.mock("@react-three/drei", () => ({
  View: Object.assign(
    ({ children }: { children?: React.ReactNode }) => children,
    { Port: () => null }
  ),
}));

class FakeIO {
  observe() {}
  disconnect() {}
}
class FakeRO {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", FakeIO);
  vi.stubGlobal("ResizeObserver", FakeRO);
  vi.stubGlobal("requestAnimationFrame", () => 1);
  vi.stubGlobal("cancelAnimationFrame", () => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function scene(
  options: {
    world?: () => React.ReactNode;
    antialias?: "t2" | "wide" | "always";
    transitionName?: string;
  } = {}
) {
  const { createSessionScene } = await import("../session");
  return createSessionScene({
    world: options.world ?? (() => null),
    camera: { fov: 30 },
    drag: { x: [-1, 1], y: [-1, 1] },
    ...(options.antialias ? { antialias: options.antialias } : {}),
    viewport: {
      zIndex: 10,
      views: {},
      ...(options.transitionName
        ? { transitionName: options.transitionName }
        : {}),
    },
  });
}

function setViewportWidth(width: number) {
  Object.defineProperty(document.documentElement, "clientWidth", {
    configurable: true,
    value: width,
  });
}

describe("createSessionScene in viewport mode", () => {
  it("draws on one fixed canvas behind the page, handing the slot over once view 0 mounts", async () => {
    const { mountScene } = await scene();
    const host = document.createElement("div");
    document.body.append(host);
    const onReady = vi.fn();
    const detach = mountScene(host, 2, onReady);

    const canvas = document.querySelector("canvas");
    expect(canvas?.parentElement).toBe(document.body);
    expect(canvas?.getAttribute("aria-hidden")).toBe("true");
    expect(canvas?.style).toMatchObject({
      position: "fixed",
      pointerEvents: "none",
      zIndex: "10",
    });
    expect(r3f.gl.info.autoReset).toBe(false);

    // View 0's content commits a task after the root: nothing hands over yet.
    expect(onReady).not.toHaveBeenCalled();
    expect(sceneStore.getState().live).toBe(false);
    const advance = vi.spyOn(r3f, "advance");
    r3f.element?.props.onSlotMount();
    expect(onReady).toHaveBeenCalledTimes(1);
    expect(advance).toHaveBeenCalledTimes(1);
    expect(sceneStore.getState().live).toBe(true);
    expect(document.documentElement.dataset.sceneLive).toBe("");
    expect(frameStats).toMatchObject({ calls: 7, triangles: 900, views: 1 });

    const clear = vi.spyOn(r3f.gl, "clear");
    detach();
    expect(clear).toHaveBeenCalled();
    expect(canvas?.style.visibility).toBe("hidden");
    expect(sceneStore.getState().live).toBe(false);
    expect(document.documentElement.dataset.sceneLive).toBeUndefined();

    // A later slot reuses the mounted view 0 and hands over at once.
    const next = document.createElement("div");
    const again = vi.fn();
    const off = mountScene(next, 2, again);
    expect(again).toHaveBeenCalledTimes(1);
    expect(canvas?.style.visibility).toBe("");
    expect(document.querySelectorAll("canvas")).toHaveLength(1);
    off();
  });
});

describe("createSessionScene viewport resolution", () => {
  it("renders a full-screen canvas at DPR 1 without MSAA on phone widths", async () => {
    setViewportWidth(390);
    const { mountScene } = await scene();
    const host = document.createElement("div");
    document.body.append(host);
    const detach = mountScene(host, 2, () => {});
    expect(r3f.config?.dpr).toBe(1);
    expect(r3f.config?.gl?.antialias).toBe(false);
    detach();
  });

  it("keeps MSAA and a capped DPR range on wide viewports", async () => {
    setViewportWidth(1440);
    const { mountScene } = await scene();
    const host = document.createElement("div");
    document.body.append(host);
    const detach = mountScene(host, 2, () => {});
    expect(r3f.config?.dpr).toEqual([1, 1.25]);
    expect(r3f.config?.gl?.antialias).toBe(true);
    detach();
    setViewportWidth(0);
  });
});

describe("createSessionScene wide antialiasing", () => {
  it("keeps MSAA at T1 on wide viewports and drops it on phones", async () => {
    setViewportWidth(1440);
    const wide = await scene({ antialias: "wide" });
    const host = document.createElement("div");
    document.body.append(host);
    wide.mountScene(host, 1, () => {})();
    expect(r3f.config?.gl?.antialias).toBe(true);

    setViewportWidth(390);
    const phone = await scene({ antialias: "wide" });
    phone.mountScene(host, 2, () => {})();
    expect(r3f.config?.gl?.antialias).toBe(false);
    expect(r3f.config?.dpr).toBe(1);
    setViewportWidth(0);
  });
});

describe("createSessionScene slot plumbing", () => {
  it("names the canvas for view transitions", async () => {
    const { mountScene } = await scene({ transitionName: "desk" });
    const host = document.createElement("div");
    document.body.append(host);
    const detach = mountScene(host, 2, () => {});
    const canvas = [...document.querySelectorAll("canvas")].at(-1);
    expect(canvas?.style.viewTransitionName).toBe("desk");
    detach();
  });

  it("connects pointer events to each slot host and lets go on detach", async () => {
    const { mountScene } = await scene();
    const first = document.createElement("div");
    const second = document.createElement("div");
    document.body.append(first, second);
    const detach = mountScene(first, 2, () => {});
    expect(r3f.events.connected).toBe(first);
    detach();
    expect(r3f.events.connected).toBeNull();
    const off = mountScene(second, 2, () => {});
    expect(r3f.events.connected).toBe(second);
    off();
  });

  it("cancels hover before letting go of a slot", async () => {
    const { mountScene } = await scene();
    const host = document.createElement("div");
    document.body.append(host);
    const leave = r3f.events.handlers.onPointerLeave;
    leave.mockImplementation(() => {
      // Still connected, so R3F can send pointer-out to the hovered mesh.
      expect(r3f.events.connected).toBe(host);
    });
    const detach = mountScene(host, 2, () => {});
    leave.mockClear();
    detach();
    expect(leave).toHaveBeenCalledOnce();
    expect(leave.mock.calls[0]?.[0].type).toBe("pointerleave");
    expect(r3f.events.connected).toBeNull();
    leave.mockReset();
  });

  it("gives view 0 the host it tracks, following each slot", async () => {
    const { useSceneSlot } = await import("../session");
    const seen: (HTMLElement | undefined)[] = [];
    function Probe() {
      const slot = useSceneSlot();
      seen.push(slot?.current);
      return null;
    }
    const { mountScene } = await scene({ world: () => <Probe /> });
    const first = document.createElement("div");
    const second = document.createElement("div");
    document.body.append(first, second);
    mountScene(first, 2, () => {})();
    const element = r3f.element;
    if (!element) throw new Error("no root element");
    const container = document.createElement("div");
    const root = createRoot(container);
    React.act(() => root.render(element));
    expect(seen.at(-1)).toBe(first);
    mountScene(second, 2, () => {})();
    seen.length = 0;
    React.act(() => root.render(React.cloneElement(element)));
    expect(seen.at(-1)).toBe(second);
    React.act(() => root.unmount());
  });
});
