// @vitest-environment jsdom
import type { Monument } from "@/flavors/survey/components/scene/glyphs/monument";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { bindRowHover, FADE_MS, SETTLE_MS } from "../row-hover";

function monument() {
  return {
    detach: vi.fn<() => void>(),
    grab: vi.fn<(x: number) => void>(),
    drag: vi.fn<(x: number) => void>(),
    release: vi.fn<() => void>(),
    lean: vi.fn<(x: number, y: number) => void>(),
    aim: vi.fn<(degrees: number) => void>(),
  } satisfies Monument;
}

function setup() {
  const row = document.createElement("li");
  const root = document.createElement("div");
  row.append(root);
  const glyph = monument();
  const hooks: { onRest?: () => void } = {};
  const open = vi.fn((h: { onLost: () => void; onRest: () => void }) => {
    hooks.onRest = h.onRest;
    return glyph;
  });
  const unbind = bindRowHover({ row, root, open });
  const pointer = (type: string) =>
    row.dispatchEvent(Object.assign(new Event(type), { pointerType: "mouse" }));
  return { row, root, glyph, hooks, open, unbind, pointer };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("bindRowHover", () => {
  it("opens and turns on enter, detaches once it rests after leave", () => {
    const { root, glyph, hooks, open, pointer } = setup();
    pointer("pointerenter");
    expect(open).toHaveBeenCalledTimes(1);
    expect(glyph.aim).toHaveBeenLastCalledWith(90);
    expect(root.dataset.live).toBe("");

    pointer("pointerleave");
    expect(glyph.aim).toHaveBeenLastCalledWith(0);
    hooks.onRest?.();
    expect(root.dataset.live).toBeUndefined();
    vi.advanceTimersByTime(FADE_MS);
    expect(glyph.detach).toHaveBeenCalledTimes(1);
  });

  it("detaches after the deadline when rest never comes (the row left the screen)", () => {
    const { root, glyph, pointer } = setup();
    pointer("pointerenter");
    pointer("pointerleave");
    vi.advanceTimersByTime(SETTLE_MS + FADE_MS - 1);
    expect(glyph.detach).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(glyph.detach).toHaveBeenCalledTimes(1);
    expect(root.dataset.live).toBeUndefined();
  });

  it("keeps the glyph when the pointer comes back before the deadline", () => {
    const { glyph, open, pointer } = setup();
    pointer("pointerenter");
    pointer("pointerleave");
    vi.advanceTimersByTime(SETTLE_MS);
    pointer("pointerenter");
    vi.advanceTimersByTime(SETTLE_MS + FADE_MS);
    expect(glyph.detach).not.toHaveBeenCalled();
    expect(open).toHaveBeenCalledTimes(1);
  });

  it("clears the deadline and detaches on unbind", () => {
    const { glyph, pointer, unbind } = setup();
    pointer("pointerenter");
    pointer("pointerleave");
    unbind();
    expect(glyph.detach).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(SETTLE_MS + FADE_MS);
    expect(glyph.detach).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });
});
