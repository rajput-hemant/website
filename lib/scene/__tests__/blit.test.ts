// @vitest-environment jsdom
import { OrthographicCamera, Scene } from "three";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BLIT_GLYPHS, BLIT_MAX_SIDE, createBlit } from "../blit";
import type { BlitRenderer, Glyph } from "../blit";
import { frameStats } from "../budget";

let frames: FrameRequestCallback[] = [];
let sightings: ((entries: { isIntersecting: boolean }[]) => void)[] = [];
let resizes: (() => void)[] = [];
const drawImage = vi.fn();

function flush(times = 1) {
  for (let i = 0; i < times; i++) {
    const due = frames;
    frames = [];
    for (const cb of due) cb(performance.now());
  }
}

function fakeRenderer(): BlitRenderer & { renders: number; sizes: number } {
  const domElement = document.createElement("canvas");
  const r = {
    domElement,
    renders: 0,
    sizes: 0,
    getPixelRatio: () => 2,
    setSize: (w: number, h: number) => {
      r.sizes++;
      domElement.width = Math.floor(w * 2);
      domElement.height = Math.floor(h * 2);
    },
    setViewport: () => {},
    setScissor: () => {},
    setScissorTest: () => {},
    render: () => {
      r.renders++;
    },
  };
  return r;
}

/** A glyph that keeps moving for `frames` steps after each kick. */
function glyph(settleAfter: number) {
  let left = settleAfter;
  const steps: number[] = [];
  const it: Glyph & { steps: number[]; wake: () => void } = {
    scene: new Scene(),
    camera: new OrthographicCamera(),
    steps,
    step: (dt) => {
      steps.push(dt);
      left = Math.max(0, left - 1);
      return left > 0;
    },
    wake: () => {
      left = settleAfter;
    },
  };
  return it;
}

function slot(size = 100) {
  const el = document.createElement("div");
  Object.defineProperty(el, "clientWidth", { value: size });
  Object.defineProperty(el, "clientHeight", { value: size });
  document.body.append(el);
  return el;
}

beforeEach(() => {
  frames = [];
  sightings = [];
  resizes = [];
  drawImage.mockClear();
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    frames.push(cb);
    return frames.length;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(cb: () => void) {
        resizes.push(cb);
      }
      observe() {}
      disconnect() {}
    }
  );
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(cb: (entries: { isIntersecting: boolean }[]) => void) {
        sightings.push(cb);
      }
      observe() {}
      disconnect() {}
    }
  );
  // jsdom has no 2D canvas; the engine only clears and copies into it.
  Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
    configurable: true,
    value: () => ({ clearRect: () => {}, drawImage }),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

describe("createBlit", () => {
  it("paints once on attach and renders no frames once settled", () => {
    const renderer = fakeRenderer();
    const blit = createBlit(() => renderer);
    const g = glyph(1);
    blit.attach(slot(), g, { tier: 2, onLost: () => {} });

    expect(renderer.renders).toBe(1);
    expect(drawImage).toHaveBeenCalledTimes(1);
    flush(5);
    expect(renderer.renders).toBe(1);
    expect(frames).toHaveLength(0);
  });

  it("renders a dirty glyph once per frame and a clean one not at all", () => {
    const renderer = fakeRenderer();
    const blit = createBlit(() => renderer);
    const a = glyph(1);
    const b = glyph(1);
    blit.attach(slot(), a, { tier: 2, onLost: () => {} });
    blit.attach(slot(48), b, { tier: 2, onLost: () => {} });
    flush(3);
    const before = { a: a.steps.length, b: b.steps.length };

    a.wake();
    blit.kick(a);
    flush();
    expect(a.steps.length - before.a).toBe(1);
    expect(b.steps.length - before.b).toBe(0);
    expect(renderer.renders).toBe(3);
    flush(3);
    expect(renderer.renders).toBe(3);
  });

  it("keeps stepping while a glyph settles, then stops", () => {
    const renderer = fakeRenderer();
    const blit = createBlit(() => renderer);
    const g = glyph(4);
    blit.attach(slot(), g, { tier: 2, onLost: () => {} });
    flush(10);
    expect(g.steps).toHaveLength(4);
    expect(frames).toHaveLength(0);
  });

  it("does not render a slot that is off screen", () => {
    const renderer = fakeRenderer();
    const blit = createBlit(() => renderer);
    const g = glyph(1);
    blit.attach(slot(), g, { tier: 2, onLost: () => {} });
    sightings[0]?.([{ isIntersecting: false }]);
    g.wake();
    blit.kick(g);
    flush(3);
    expect(renderer.renders).toBe(1);
  });

  it("falls back on context loss, now and for later slots", async () => {
    const renderer = fakeRenderer();
    const blit = createBlit(() => renderer);
    const first = vi.fn();
    blit.attach(slot(), glyph(1), { tier: 2, onLost: first });
    renderer.domElement.dispatchEvent(
      new Event("webglcontextlost", { cancelable: true })
    );
    expect(first).toHaveBeenCalledTimes(1);

    const later = vi.fn();
    blit.attach(slot(), glyph(1), { tier: 2, onLost: later });
    expect(later).not.toHaveBeenCalled();
    await Promise.resolve();
    expect(later).toHaveBeenCalledTimes(1);
  });

  describe("context restore", () => {
    const lose = (r: BlitRenderer) =>
      r.domElement.dispatchEvent(
        new Event("webglcontextlost", { cancelable: true })
      );
    const restore = (r: BlitRenderer) =>
      r.domElement.dispatchEvent(new Event("webglcontextrestored"));

    it("cancels the loss so the browser may restore, and draws nothing while lost", () => {
      const renderer = fakeRenderer();
      const blit = createBlit(() => renderer);
      const g = glyph(3);
      blit.attach(slot(), g, { tier: 2, onLost: () => {} });
      const event = new Event("webglcontextlost", { cancelable: true });
      renderer.domElement.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
      const renders = renderer.renders;
      g.wake();
      blit.kick(g);
      flush(3);
      expect(renderer.renders).toBe(renders);
    });

    it("recreates the renderer, sets glyphs up again and brings them back", () => {
      const made: ReturnType<typeof fakeRenderer>[] = [];
      const disposed = vi.fn();
      const blit = createBlit(() => {
        const r = Object.assign(fakeRenderer(), { dispose: disposed });
        made.push(r);
        return r;
      });
      const setup = vi.fn();
      const g = { ...glyph(0), setup };
      const onLost = vi.fn();
      const onRestored = vi.fn();
      blit.attach(slot(), g, { tier: 2, onLost, onRestored });
      const [first] = made;
      if (!first) throw new Error("no renderer");
      lose(first);
      expect(onLost).toHaveBeenCalledTimes(1);
      expect(onRestored).not.toHaveBeenCalled();

      restore(first);
      expect(disposed).toHaveBeenCalledTimes(1);
      expect(made).toHaveLength(2);
      expect(setup).toHaveBeenCalledTimes(2);
      expect(setup).toHaveBeenLastCalledWith(made[1]);
      expect(made[1]?.renders).toBe(1);
      expect(drawImage).toHaveBeenLastCalledWith(
        made[1]?.domElement,
        0,
        expect.any(Number),
        200,
        200,
        0,
        0,
        200,
        200
      );
      expect(onRestored).toHaveBeenCalledTimes(1);
      flush(3);
      expect(made[1]?.renders).toBe(1);
    });

    it("releases the replaced context, so only one stays live", () => {
      const made: (BlitRenderer & { live: boolean })[] = [];
      const blit = createBlit(() => {
        const r = Object.assign(fakeRenderer(), {
          live: true,
          forceContextLoss: () => {
            r.live = false;
            lose(r);
          },
        });
        made.push(r);
        return r;
      });
      const onLost = vi.fn();
      const onRestored = vi.fn();
      blit.attach(slot(), glyph(0), { tier: 2, onLost, onRestored });
      const [first] = made;
      if (!first) throw new Error("no renderer");
      lose(first);
      restore(first);
      expect(made.filter((r) => r.live)).toHaveLength(1);
      expect(made[1]?.live).toBe(true);
      // The forced loss of the old context is not a loss of the new one.
      expect(onLost).toHaveBeenCalledTimes(1);
      expect(onRestored).toHaveBeenCalledTimes(1);
    });

    it("keeps posters when no renderer can be made on restore", async () => {
      let fail = false;
      const made: BlitRenderer[] = [];
      const blit = createBlit(() => {
        if (fail) throw new Error("no WebGL");
        const r = fakeRenderer();
        made.push(r);
        return r;
      });
      const onRestored = vi.fn();
      blit.attach(slot(), glyph(0), { tier: 2, onLost: () => {}, onRestored });
      const [first] = made;
      if (!first) throw new Error("no renderer");
      lose(first);
      fail = true;
      expect(() => restore(first)).not.toThrow();
      expect(onRestored).not.toHaveBeenCalled();

      const later = vi.fn();
      expect(() =>
        blit.attach(slot(), glyph(0), { tier: 2, onLost: later })
      ).not.toThrow();
      await Promise.resolve();
      expect(later).toHaveBeenCalledTimes(1);
    });

    it("sends a glyph to its poster when the first renderer cannot be made", async () => {
      const blit = createBlit((): BlitRenderer => {
        throw new Error("no WebGL");
      });
      const onLost = vi.fn();
      const host = slot();
      expect(() =>
        blit.attach(host, glyph(0), { tier: 2, onLost })
      ).not.toThrow();
      await Promise.resolve();
      expect(onLost).toHaveBeenCalledTimes(1);
      expect(host.querySelector("canvas")).toBeNull();
    });

    it("brings back a glyph mounted while the context was lost", async () => {
      const renderer = fakeRenderer();
      const blit = createBlit(() => renderer);
      blit.attach(slot(), glyph(0), { tier: 2, onLost: () => {} });
      lose(renderer);
      const onLost = vi.fn();
      const onRestored = vi.fn();
      const host = slot();
      blit.attach(host, glyph(0), { tier: 2, onLost, onRestored });
      await Promise.resolve();
      expect(onLost).toHaveBeenCalledTimes(1);
      expect(host.querySelector("canvas")).not.toBeNull();

      restore(renderer);
      expect(onRestored).toHaveBeenCalledTimes(1);
    });

    it("leaves a glyph cleaned up while lost on its poster", () => {
      const made: BlitRenderer[] = [];
      const create = vi.fn(() => {
        const r = fakeRenderer();
        made.push(r);
        return r;
      });
      const blit = createBlit(create);
      const onRestored = vi.fn();
      const detach = blit.attach(slot(), glyph(0), {
        tier: 2,
        onLost: () => {},
        onRestored,
      });
      const [first] = made;
      if (!first) throw new Error("no renderer");
      lose(first);
      detach();
      restore(first);
      expect(onRestored).not.toHaveBeenCalled();
      expect(create).toHaveBeenCalledTimes(1);

      blit.attach(slot(), glyph(0), { tier: 2, onLost: () => {} });
      expect(create).toHaveBeenCalledTimes(2);
    });

    it("ignores events from a renderer it has replaced", () => {
      const made: BlitRenderer[] = [];
      const create = vi.fn(() => {
        const r = fakeRenderer();
        made.push(r);
        return r;
      });
      const blit = createBlit(create);
      const onLost = vi.fn();
      blit.attach(slot(), glyph(0), { tier: 2, onLost });
      const [first] = made;
      if (!first) throw new Error("no renderer");
      lose(first);
      restore(first);
      lose(first);
      restore(first);
      expect(onLost).toHaveBeenCalledTimes(1);
      expect(create).toHaveBeenCalledTimes(2);
    });
  });

  it("copies from the bottom-left corner of the grown GL canvas", () => {
    const renderer = fakeRenderer();
    const blit = createBlit(() => renderer);
    blit.attach(slot(100), glyph(1), { tier: 2, onLost: () => {} });
    const gl = renderer.domElement;
    expect(gl.width).toBeGreaterThanOrEqual(200);
    expect(drawImage).toHaveBeenLastCalledWith(
      gl,
      0,
      gl.height - 200,
      200,
      200,
      0,
      0,
      200,
      200
    );
  });
  it("shrinks the GL canvas to the largest slot left when one detaches", () => {
    const renderer = fakeRenderer();
    const blit = createBlit(() => renderer);
    const gl = renderer.domElement;
    const big = blit.attach(slot(200), glyph(0), { tier: 2, onLost: () => {} });
    blit.attach(slot(50), glyph(0), { tier: 2, onLost: () => {} });
    expect([gl.width, gl.height]).toEqual([400, 400]);

    big();
    expect([gl.width, gl.height]).toEqual([100, 100]);
  });

  it("leaves the canvas alone when a resize keeps its size", () => {
    const renderer = fakeRenderer();
    const blit = createBlit(() => renderer);
    const host = slot();
    blit.attach(host, glyph(0), { tier: 2, onLost: () => {} });
    const canvas = host.querySelector("canvas");
    if (!canvas) throw new Error("no canvas");
    const writes = vi.fn();
    const width = Object.getOwnPropertyDescriptor(
      HTMLCanvasElement.prototype,
      "width"
    );
    Object.defineProperty(canvas, "width", {
      get: () => Number(width?.get?.call(canvas)),
      set: (v: number) => {
        writes();
        width?.set?.call(canvas, v);
      },
    });
    // The observer's first callback, as on every mount, with the same box.
    resizes[0]?.();
    flush(3);
    expect(writes).not.toHaveBeenCalled();
    expect(renderer.renders).toBe(1);
    expect(frames).toHaveLength(0);
  });

  it("never reallocates the GL canvas while glyphs animate", () => {
    const renderer = fakeRenderer();
    const blit = createBlit(() => renderer);
    const a = glyph(3);
    const b = glyph(3);
    blit.attach(slot(100), a, { tier: 2, onLost: () => {} });
    blit.attach(slot(40), b, { tier: 2, onLost: () => {} });
    const sizes = renderer.sizes;
    for (let i = 0; i < 3; i++) {
      a.wake();
      b.wake();
      blit.kick();
      flush(4);
    }
    expect(renderer.renders).toBeGreaterThan(10);
    expect(renderer.sizes).toBe(sizes);
  });

  it(`caps a slot's backing store at ${BLIT_MAX_SIDE} device pixels`, () => {
    const renderer = fakeRenderer();
    const blit = createBlit(() => renderer);
    const host = slot(4000);
    blit.attach(host, glyph(0), { tier: 2, onLost: () => {} });
    const canvas = host.querySelector("canvas");
    expect([canvas?.width, canvas?.height]).toEqual([
      BLIT_MAX_SIDE,
      BLIT_MAX_SIDE,
    ]);
    expect(renderer.domElement.width).toBe(BLIT_MAX_SIDE);
  });

  it("releases the GL canvas once every slot detaches", () => {
    const renderer = fakeRenderer();
    const blit = createBlit(() => renderer);
    const detach = blit.attach(slot(200), glyph(0), {
      tier: 2,
      onLost: () => {},
    });
    detach();
    expect(
      renderer.domElement.width * renderer.domElement.height
    ).toBeLessThanOrEqual(4);
  });

  it("renders a dirty glyph once and a clean one not at all", () => {
    const renderer = fakeRenderer();
    const blit = createBlit(() => renderer);
    const dirty = glyph(0);
    const clean = glyph(0);
    blit.attach(slot(), dirty, { tier: 2, onLost: () => {} });
    blit.attach(slot(), clean, { tier: 2, onLost: () => {} });
    flush(3);
    expect(renderer.renders).toBe(2);

    blit.kick(dirty);
    flush(5);
    expect(renderer.renders).toBe(3);
    expect(dirty.steps).toHaveLength(2);
    expect(clean.steps).toHaveLength(1);
    expect(frames).toHaveLength(0);
  });

  it("draws into a canvas the page owns and leaves it in place", () => {
    const renderer = fakeRenderer();
    const blit = createBlit(() => renderer);
    const canvas = document.createElement("canvas");
    Object.defineProperty(canvas, "clientWidth", { value: 24 });
    Object.defineProperty(canvas, "clientHeight", { value: 16 });
    document.body.append(canvas);
    const cleanup = blit.register(canvas, glyph(0), {
      tier: 1,
      onLost: () => {},
    });
    expect([canvas.width, canvas.height]).toEqual([48, 32]);
    expect(drawImage).toHaveBeenCalledTimes(1);
    cleanup();
    expect(canvas.isConnected).toBe(true);
  });

  it("keeps the poster at T0 without creating a renderer", async () => {
    const create = vi.fn(fakeRenderer);
    const blit = createBlit(create);
    const onLost = vi.fn();
    const host = slot();
    blit.attach(host, glyph(1), { tier: 0, onLost });
    await Promise.resolve();
    expect(onLost).toHaveBeenCalledTimes(1);
    expect(create).not.toHaveBeenCalled();
    expect(host.querySelector("canvas")).toBeNull();
  });

  it(`draws at most ${BLIT_GLYPHS} glyphs and sends the rest to their posters`, async () => {
    const renderer = fakeRenderer();
    const blit = createBlit(() => renderer);
    const lost = vi.fn();
    const detach = Array.from({ length: BLIT_GLYPHS }, () =>
      blit.attach(slot(), glyph(0), { tier: 2, onLost: lost })
    );
    const extra = slot();
    blit.attach(extra, glyph(0), { tier: 2, onLost: lost });
    await Promise.resolve();
    expect(lost).toHaveBeenCalledTimes(1);
    expect(extra.querySelector("canvas")).toBeNull();
    expect(renderer.renders).toBe(BLIT_GLYPHS);

    detach[0]?.();
    blit.attach(extra, glyph(0), { tier: 2, onLost: lost });
    expect(extra.querySelector("canvas")).not.toBeNull();
  });

  it("records each pass's draw calls, summed over glyphs, for the budget", () => {
    const renderer = {
      ...fakeRenderer(),
      info: { render: { calls: 3, triangles: 120 } },
    };
    const blit = createBlit(() => renderer);
    const a = glyph(0);
    blit.attach(slot(), a, { tier: 2, onLost: () => {} });
    blit.attach(slot(), glyph(0), { tier: 2, onLost: () => {} });
    const before = frameStats.frames;
    blit.kick();
    flush();
    expect(frameStats).toMatchObject({ calls: 6, triangles: 240, views: 2 });
    expect(frameStats.frames).toBe(before + 1);
    flush(3);
    expect(frameStats.frames).toBe(before + 1);
  });
});
