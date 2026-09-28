// @vitest-environment jsdom
import { OrthographicCamera, Scene } from "three";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BLIT_GLYPHS, createBlit } from "../blit";
import type { BlitRenderer, Glyph } from "../blit";
import { frameStats } from "../budget";

let frames: FrameRequestCallback[] = [];
let sightings: ((entries: { isIntersecting: boolean }[]) => void)[] = [];
const drawImage = vi.fn();

function flush(times = 1) {
  for (let i = 0; i < times; i++) {
    const due = frames;
    frames = [];
    for (const cb of due) cb(performance.now());
  }
}

function fakeRenderer(): BlitRenderer & { renders: number } {
  const domElement = document.createElement("canvas");
  const r = {
    domElement,
    renders: 0,
    getPixelRatio: () => 2,
    setSize: (w: number, h: number) => {
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
  drawImage.mockClear();
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    frames.push(cb);
    return frames.length;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
  vi.stubGlobal(
    "ResizeObserver",
    class {
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
