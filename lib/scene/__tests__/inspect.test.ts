// @vitest-environment jsdom
import { OrthographicCamera, Scene } from "three";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { BlitRenderer, Glyph } from "../blit";
import {
  applyPose,
  bindInspect,
  createInspect,
  inspectFor,
  inspectGlyph,
  inspectUsed,
  KEY_YAW,
  KEY_ZOOM,
  sceneInspect,
  watchInspect,
} from "../inspect";
import type { Inspect, Posable } from "../inspect";

const TAU = Math.PI * 2;

/** Steps at 60fps until it settles; the frames it took (throws past `max`). */
function settle(inspect: Inspect, max = 600) {
  for (let i = 1; i <= max; i++) if (!inspect.step(1 / 60)) return i;
  throw new Error("never settled");
}

/** A drag of `dYaw` split into moves 16ms apart, released right after. */
function flick(inspect: Inspect, dYaw: number, moves = 5, releaseAfter = 16) {
  inspect.grab();
  let t = 1000;
  for (let i = 0; i < moves; i++) {
    t += 16;
    inspect.drag(dYaw / moves, 0, t);
  }
  inspect.release(t + releaseAfter);
}

function posable() {
  const calls = { rotation: [0, 0, 0], scale: 1 };
  const object: Posable = {
    rotation: {
      set: (x, y, z) => {
        calls.rotation = [x, y, z];
      },
    },
    scale: {
      setScalar: (s) => {
        calls.scale = s;
      },
    },
  };
  return { object, calls };
}

describe("createInspect", () => {
  it("starts at rest and settled", () => {
    const inspect = createInspect({ rest: { yaw: 0.5, zoom: 1.2 } });
    expect(inspect.pose).toEqual({ yaw: 0.5, pitch: 0, zoom: 1.2 });
    expect(inspect.step(1 / 60)).toBe(false);
  });

  it("clamps pitch and zoom, targets and rest alike", () => {
    const inspect = createInspect({
      pitch: [-0.5, 0.5],
      zoom: [0.8, 1.5],
      rest: { pitch: 2, zoom: 9 },
    });
    expect(inspect.target).toMatchObject({ pitch: 0.5, zoom: 1.5 });
    inspect.rotateBy(0, -5);
    inspect.zoomBy(0.01);
    expect(inspect.target).toMatchObject({ pitch: -0.5, zoom: 0.8 });
    inspect.grab();
    inspect.drag(0, 10, 16);
    expect(inspect.target.pitch).toBe(0.5);
    inspect.release(32);
    settle(inspect);
    expect(inspect.pose.pitch).toBe(0.5);
    expect(inspect.pose.zoom).toBe(0.8);
    // A zero or negative factor is ignored.
    inspect.zoomBy(0);
    inspect.zoomBy(-2);
    expect(inspect.target.zoom).toBe(0.8);
  });

  it("turns without a yaw limit and folds whole turns away at rest", () => {
    const inspect = createInspect();
    inspect.rotateBy(TAU * 3 + 0.25, 0);
    // Mid-way the angle is past a full turn: nothing stops yaw.
    for (let i = 0; i < 10; i++) inspect.step(1 / 60);
    expect(inspect.pose.yaw).toBeGreaterThan(TAU);
    settle(inspect);
    expect(inspect.pose.yaw).toBeCloseTo(0.25, 6);
    expect(inspect.target.yaw).toBeCloseTo(0.25, 6);
  });

  it("resets the short way round", () => {
    const inspect = createInspect({ rest: { yaw: 0 } });
    inspect.rotateBy(TAU - 0.3, 0.4);
    inspect.zoomBy(1.5);
    settle(inspect);
    inspect.reset();
    // Rest is a whole turn away, not 2pi - 0.3 back.
    expect(Math.abs(inspect.target.yaw - inspect.pose.yaw)).toBeCloseTo(0.3, 6);
    settle(inspect);
    expect(inspect.pose.pitch).toBe(0);
    expect(inspect.pose.zoom).toBe(1);
    expect(Math.abs(inspect.pose.yaw % TAU)).toBeLessThan(1e-6);
  });

  it("coasts after a flick and settles in bounded frames", () => {
    const inspect = createInspect();
    flick(inspect, 0.5);
    const released = inspect.target.yaw;
    const frames = settle(inspect);
    // The coast carried it on past where the finger left it.
    expect(inspect.pose.yaw).toBeGreaterThan(released + 0.3);
    expect(frames).toBeLessThan(240);
    expect(inspect.step(1 / 60)).toBe(false);
  });

  it("does not coast when held still before release", () => {
    const inspect = createInspect();
    flick(inspect, 0.5, 5, 200);
    const released = inspect.target.yaw;
    settle(inspect);
    expect(inspect.pose.yaw).toBeCloseTo(released, 6);
  });

  it("stops the coast at a pitch limit", () => {
    const inspect = createInspect({ pitch: [-0.2, 0.2] });
    inspect.grab();
    inspect.drag(0, 0.1, 16);
    inspect.drag(0, 0.05, 32);
    inspect.release(40);
    settle(inspect);
    expect(inspect.pose.pitch).toBe(0.2);
  });

  it("reduced motion: drag snaps, no coast, short springs", () => {
    const inspect = createInspect({ reducedMotion: () => true });
    inspect.grab();
    inspect.drag(0.4, 0.1, 16);
    expect(inspect.pose).toMatchObject({ yaw: 0.4, pitch: 0.1 });
    inspect.drag(0.4, 0, 32);
    inspect.release(40);
    expect(inspect.step(1 / 60)).toBe(false);
    expect(inspect.pose.yaw).toBeCloseTo(0.8, 9);
    // A key or reset still eases, but briefly.
    inspect.key("ArrowRight");
    const frames = settle(inspect);
    expect(frames).toBeGreaterThan(1);
    expect(frames).toBeLessThan(40);
  });

  it("damps a normal key turn longer than a reduced one", () => {
    const calm = createInspect({ reducedMotion: () => true });
    const full = createInspect();
    calm.key("ArrowLeft");
    full.key("ArrowLeft");
    expect(settle(full)).toBeGreaterThan(settle(calm));
  });

  it("maps the keyboard twin", () => {
    const inspect = createInspect();
    expect(inspect.key("ArrowRight")).toBe(true);
    expect(inspect.target.yaw).toBeCloseTo(KEY_YAW);
    expect(inspect.key("ArrowLeft", true)).toBe(true);
    expect(inspect.target.yaw).toBeCloseTo(-2 * KEY_YAW);
    inspect.key("ArrowDown");
    expect(inspect.target.pitch).toBeGreaterThan(0);
    inspect.key("ArrowUp");
    inspect.key("ArrowUp");
    expect(inspect.target.pitch).toBeLessThan(0);
    inspect.key("+");
    expect(inspect.target.zoom).toBeCloseTo(KEY_ZOOM);
    inspect.key("-");
    inspect.key("_");
    expect(inspect.target.zoom).toBeCloseTo(1 / KEY_ZOOM);
    expect(inspect.key("0")).toBe(true);
    settle(inspect);
    expect(inspect.pose).toEqual({ yaw: 0, pitch: 0, zoom: 1 });
    expect(inspect.key("Home")).toBe(true);
    expect(inspect.key("a")).toBe(false);
    expect(inspect.key("Tab")).toBe(false);
  });

  it("wakes and notifies on input only", () => {
    const onWake = vi.fn();
    const heard = vi.fn();
    const inspect = createInspect({ onWake });
    inspect.subscribe(heard);
    settle(inspect);
    expect(onWake).not.toHaveBeenCalled();
    inspect.key("ArrowRight");
    inspect.zoomBy(1.1);
    expect(onWake).toHaveBeenCalledTimes(2);
    expect(heard).toHaveBeenCalledTimes(2);
  });

  it("caps a long frame's step", () => {
    const inspect = createInspect();
    inspect.rotateBy(1, 0);
    inspect.step(5);
    // One 5s frame steps at most 1/20s, so it's still on its way.
    expect(inspect.pose.yaw).toBeLessThan(0.9);
  });
});

describe("createInspect cancel and bad dt", () => {
  it("cancel ends a drag without a fling, release(0) is not needed", () => {
    const inspect = createInspect();
    inspect.grab();
    inspect.drag(0.1, 0, 1016);
    inspect.drag(0.1, 0, 1032);
    inspect.cancel();
    expect(inspect.dragging).toBe(false);
    settle(inspect);
    expect(inspect.pose.yaw).toBeCloseTo(0.2, 1);
    // Nothing to cancel is a no-op.
    inspect.cancel();
    expect(inspect.dragging).toBe(false);
  });

  it("treats a non-finite dt as zero", () => {
    const inspect = createInspect();
    inspect.rotateBy(1, 0);
    inspect.step(Number.NaN);
    expect(Number.isFinite(inspect.pose.yaw)).toBe(true);
    expect(inspect.step(1 / 60)).toBe(true);
    expect(settle(inspect)).toBeLessThan(600);
    expect(inspect.pose.yaw).toBeCloseTo(1);
  });
});

describe("applyPose", () => {
  it("pitches, yaws and scales", () => {
    const { object, calls } = posable();
    applyPose(object, { yaw: 1, pitch: 0.2, zoom: 1.5 });
    expect(calls).toEqual({ rotation: [0.2, 1, 0], scale: 1.5 });
  });
});

describe("bindInspect", () => {
  let host: HTMLElement;
  let off = () => {};
  const capture = vi.fn();

  afterEach(() => {
    off();
    host.remove();
  });

  function setup(inspect = createInspect()) {
    host = document.createElement("div");
    Object.defineProperty(host, "clientWidth", { value: 300 });
    capture.mockClear();
    host.setPointerCapture = capture;
    document.body.append(host);
    off = bindInspect(host, inspect);
    return inspect;
  }

  const pointer = (
    type: string,
    x: number,
    y: number,
    init: PointerEventInit = {}
  ) =>
    host.dispatchEvent(
      new PointerEvent(type, {
        clientX: x,
        clientY: y,
        pointerId: 1,
        pointerType: "mouse",
        buttons: type === "pointerup" ? 0 : 1,
        bubbles: true,
        cancelable: true,
        ...init,
      })
    );

  it("registers the host, sets touch-action and cleans up", () => {
    const watcher = vi.fn();
    const stop = watchInspect(watcher);
    host = document.createElement("div");
    host.style.touchAction = "manipulation";
    const inspect = createInspect();
    const unbind = bindInspect(host, inspect);
    expect(inspectFor(host)).toBe(inspect);
    expect(host.style.touchAction).toBe("pan-y");
    expect(watcher).toHaveBeenCalledTimes(1);
    unbind();
    expect(inspectFor(host)).toBeNull();
    expect(host.style.touchAction).toBe("manipulation");
    expect(host.dataset.inspect).toBeUndefined();
    expect(watcher).toHaveBeenCalledTimes(2);
    stop();
  });

  it("turns on a mouse drag with capture, half a turn per width", () => {
    const inspect = setup();
    pointer("pointerdown", 100, 100);
    pointer("pointermove", 102, 100);
    expect(inspect.dragging).toBe(false);
    pointer("pointermove", 110, 100);
    expect(inspect.dragging).toBe(true);
    expect(capture).toHaveBeenCalledWith(1);
    expect(host.dataset.inspect).toBe("drag");
    pointer("pointermove", 260, 130);
    expect(inspect.target.yaw).toBeCloseTo(Math.PI * (150 / 300));
    expect(inspect.target.pitch).toBeCloseTo(Math.PI * (30 / 300));
    pointer("pointerup", 260, 130);
    expect(inspect.dragging).toBe(false);
    expect(host.dataset.inspect).toBe("");
  });

  it("swallows the click that ends a drag, not a plain click", () => {
    setup();
    const clicked = vi.fn();
    host.addEventListener("click", clicked);
    pointer("pointerdown", 0, 0);
    pointer("pointermove", 50, 0);
    pointer("pointerup", 50, 0);
    host.click();
    expect(clicked).not.toHaveBeenCalled();
    pointer("pointerdown", 0, 0);
    pointer("pointerup", 0, 0);
    host.click();
    expect(clicked).toHaveBeenCalledTimes(1);
  });

  it("leaves a vertical touch swipe to the page", () => {
    const inspect = setup();
    const touch = { pointerType: "touch" };
    pointer("pointerdown", 100, 100, touch);
    pointer("pointermove", 104, 130, touch);
    pointer("pointermove", 120, 160, touch);
    expect(inspect.dragging).toBe(false);
    pointer("pointercancel", 120, 160, touch);
    expect(inspect.target.yaw).toBe(0);
  });

  it("turns on a horizontal touch move past the slop, without a jump", () => {
    const inspect = setup();
    const touch = { pointerType: "touch" };
    pointer("pointerdown", 100, 100, touch);
    pointer("pointermove", 106, 101, touch);
    expect(inspect.dragging).toBe(false);
    pointer("pointermove", 120, 102, touch);
    expect(inspect.dragging).toBe(true);
    expect(inspect.target.yaw).toBe(0);
    pointer("pointermove", 150, 102, touch);
    expect(inspect.target.yaw).toBeCloseTo(Math.PI * (30 / 300));
    pointer("pointerup", 150, 102, touch);
  });

  it("pinches to zoom with two fingers", () => {
    const inspect = setup();
    const a = { pointerType: "touch", pointerId: 1 };
    const b = { pointerType: "touch", pointerId: 2 };
    pointer("pointerdown", 100, 100, a);
    pointer("pointerdown", 200, 100, b);
    expect(inspect.dragging).toBe(true);
    pointer("pointermove", 250, 100, b);
    expect(inspect.target.zoom).toBeCloseTo(1.5);
    pointer("pointerup", 250, 100, b);
    // One finger left keeps turning.
    expect(inspect.dragging).toBe(true);
    pointer("pointerup", 100, 100, a);
    expect(inspect.dragging).toBe(false);
  });

  it("never flings on pointercancel or when unbound mid-drag", () => {
    const inspect = setup();
    pointer("pointerdown", 100, 100);
    pointer("pointermove", 110, 100);
    pointer("pointermove", 125, 100);
    pointer("pointercancel", 125, 100);
    expect(inspect.dragging).toBe(false);
    const yaw = inspect.target.yaw;
    settle(inspect);
    expect(inspect.pose.yaw).toBeCloseTo(yaw, 1);
    pointer("pointerdown", 100, 100);
    pointer("pointermove", 110, 100);
    pointer("pointermove", 125, 100);
    const was = inspect.target.yaw;
    off();
    expect(inspect.dragging).toBe(false);
    settle(inspect);
    expect(inspect.pose.yaw).toBeCloseTo(was, 1);
  });

  it("re-baselines when a third finger lands or one of three lifts", () => {
    const inspect = setup();
    const f = (id: number) => ({ pointerType: "touch", pointerId: id });
    pointer("pointerdown", 100, 100, f(1));
    pointer("pointerdown", 140, 100, f(2));
    pointer("pointermove", 142, 100, f(2));
    pointer("pointerdown", 280, 100, f(3));
    const yaw = inspect.target.yaw;
    const zoom = inspect.target.zoom;
    expect(capture).toHaveBeenCalledWith(3);
    pointer("pointermove", 281, 100, f(3));
    expect(Math.abs(inspect.target.yaw - yaw)).toBeLessThan(0.02);
    expect(Math.abs(inspect.target.zoom - zoom)).toBeLessThan(0.05);
    // One of three lifts: two remain and still pinch, without a jump.
    pointer("pointerup", 281, 100, f(3));
    const yaw2 = inspect.target.yaw;
    pointer("pointermove", 143, 100, f(2));
    expect(Math.abs(inspect.target.yaw - yaw2)).toBeLessThan(0.02);
    const zoom2 = inspect.target.zoom;
    pointer("pointermove", 192, 100, f(2));
    expect(inspect.target.zoom).toBeGreaterThan(zoom2 * 1.2);
    pointer("pointerup", 192, 100, f(2));
    pointer("pointerup", 100, 100, f(1));
    expect(inspect.dragging).toBe(false);
  });

  it("drops a mouse that was released outside the host", () => {
    const inspect = setup();
    pointer("pointerdown", 100, 100);
    pointer("pointermove", 101, 100);
    // The pointerup went to another element; this is hover.
    pointer("pointermove", 150, 100, { buttons: 0 });
    pointer("pointermove", 200, 100, { buttons: 0 });
    expect(inspect.dragging).toBe(false);
    expect(inspect.target.yaw).toBe(0);
  });

  it("zooms on ctrl or cmd + wheel only", () => {
    const inspect = setup();
    const plain = new WheelEvent("wheel", { deltaY: 100, cancelable: true });
    host.dispatchEvent(plain);
    expect(plain.defaultPrevented).toBe(false);
    expect(inspect.target.zoom).toBe(1);
    const ctrl = new WheelEvent("wheel", {
      deltaY: -100,
      ctrlKey: true,
      cancelable: true,
    });
    host.dispatchEvent(ctrl);
    expect(ctrl.defaultPrevented).toBe(true);
    expect(inspect.target.zoom).toBeCloseTo(Math.exp(0.2));
    host.dispatchEvent(
      new WheelEvent("wheel", { deltaY: 100, metaKey: true, cancelable: true })
    );
    expect(inspect.target.zoom).toBeCloseTo(1);
  });

  it("resets on a double click and a double tap", () => {
    const inspect = setup();
    inspect.rotateBy(1, 0.3);
    host.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    expect(inspect.target).toMatchObject({ yaw: 0, pitch: 0 });
    inspect.rotateBy(1, 0.3);
    const touch = { pointerType: "touch" };
    pointer("pointerdown", 50, 50, touch);
    pointer("pointerup", 50, 50, touch);
    expect(inspect.target.yaw).toBe(1);
    pointer("pointerdown", 52, 51, touch);
    pointer("pointerup", 52, 51, touch);
    expect(inspect.target).toMatchObject({ yaw: 0, pitch: 0 });
  });

  it("ignores other mouse buttons", () => {
    const inspect = setup();
    pointer("pointerdown", 0, 0, { button: 2 });
    pointer("pointermove", 80, 0, { button: 2 });
    expect(inspect.dragging).toBe(false);
  });

  it("marks the page's inspect used on first input", () => {
    const watcher = vi.fn();
    const stop = watchInspect(watcher);
    const inspect = setup();
    const before = watcher.mock.calls.length;
    const was = inspectUsed();
    inspect.key("ArrowRight");
    expect(inspectUsed()).toBe(true);
    expect(watcher.mock.calls.length).toBe(was ? before : before + 1);
    stop();
  });
});

describe("sceneInspect (R3F adapter)", () => {
  it("binds the host, wakes the clock and poses the group each frame", () => {
    const onWake = vi.fn();
    const { inspect, bindInput, frame } = sceneInspect({ onWake });
    const host = document.createElement("div");
    const off = bindInput(host);
    expect(inspectFor(host)).toBe(inspect);
    inspect.key("ArrowRight");
    expect(onWake).toHaveBeenCalled();
    const { object, calls } = posable();
    let frames = 0;
    while (frame(object, 1 / 60)) frames++;
    expect(frames).toBeGreaterThan(0);
    expect(calls.rotation[1]).toBeCloseTo(KEY_YAW, 6);
    // Settled: the world's settle(busy) gets false and the clock sleeps.
    expect(frame(object, 1 / 60)).toBe(false);
    off();
  });
});

describe("inspectGlyph (blit adapter)", () => {
  it("wraps step, kicks the wrapped glyph and keeps setup and paint", () => {
    const own = { left: 2 };
    const setup = vi.fn();
    const paint = vi.fn();
    const base: Glyph = {
      scene: new Scene(),
      camera: new OrthographicCamera(),
      setup,
      paint,
      step: () => --own.left > 0,
    };
    const { object, calls } = posable();
    const kick = vi.fn();
    const { glyph, inspect } = inspectGlyph(base, object, {
      kick,
      rest: { zoom: 1.2 },
    });
    expect(calls.scale).toBe(1.2);
    expect(glyph.scene).toBe(base.scene);
    const renderer: BlitRenderer = {
      domElement: document.createElement("canvas"),
      getPixelRatio: () => 1,
      setSize: () => {},
      setViewport: () => {},
      setScissor: () => {},
      setScissorTest: () => {},
      render: () => {},
    };
    glyph.setup?.(renderer);
    glyph.paint?.();
    expect(setup).toHaveBeenCalledWith(renderer);
    expect(paint).toHaveBeenCalled();
    // The glyph's own motion keeps it dirty while the inspect is at rest.
    expect(glyph.step(1 / 60)).toBe(true);
    expect(glyph.step(1 / 60)).toBe(false);
    inspect.key("ArrowLeft");
    expect(kick).toHaveBeenCalledWith(glyph);
    expect(glyph.step(1 / 60)).toBe(true);
    while (glyph.step(1 / 60));
    expect(calls.rotation[1]).toBeCloseTo(-KEY_YAW, 6);
  });
});
