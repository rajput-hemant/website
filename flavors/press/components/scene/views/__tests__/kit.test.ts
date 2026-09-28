// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

import { createDamp, hoveredKey, readData, trackPointer } from "../kit";

const clock = vi.hoisted(() => ({
  kick: vi.fn(),
  motionOn: vi.fn(() => true),
}));

vi.mock("@/lib/scene/clock", () => clock);

beforeEach(() => {
  clock.kick.mockClear();
  clock.motionOn.mockReturnValue(true);
});

describe("createDamp", () => {
  it("keeps the clock awake only while a value still moves", () => {
    const d = createDamp({ x: 0 });
    d.to("x", 1, 0.5, 1 / 60);
    d.end();
    expect(d.v.x).toBeCloseTo(0.5);
    expect(clock.kick).toHaveBeenCalledTimes(1);
    for (let i = 0; i < 40; i++) {
      d.to("x", 1, 0.5, 1 / 60);
      d.end();
    }
    clock.kick.mockClear();
    d.to("x", 1, 0.5, 1 / 60);
    d.end();
    expect(d.v.x).toBe(1);
    expect(clock.kick).not.toHaveBeenCalled();
  });

  it("snaps to the target with motion off", () => {
    clock.motionOn.mockReturnValue(false);
    const d = createDamp({ x: 0 });
    d.to("x", 1, 0.1, 1 / 60);
    d.end();
    expect(d.v.x).toBe(1);
    expect(clock.kick).not.toHaveBeenCalled();
  });
});

describe("readData", () => {
  it("reads a placeholder's facts over the fallback", () => {
    const el = document.createElement("div");
    el.dataset.view = JSON.stringify({ items: 3 });
    expect(readData<"press-fountain">(el, { items: 0 })).toEqual({ items: 3 });
  });

  it("falls back on missing or broken facts", () => {
    const el = document.createElement("div");
    expect(readData<"press-fountain">(el, { items: 1 })).toEqual({ items: 1 });
    el.dataset.view = "{";
    expect(readData<"press-fountain">(el, { items: 1 })).toEqual({ items: 1 });
    expect(readData<"press-fountain">(null, { items: 1 })).toEqual({
      items: 1,
    });
  });
});

describe("hoveredKey", () => {
  it("returns the key for its own prefix only", () => {
    expect(hoveredKey("run:acme", "run")).toBe("acme");
    expect(hoveredKey("runner:acme", "run")).toBeNull();
    expect(hoveredKey(null, "run")).toBeNull();
  });
});

describe("trackPointer", () => {
  it("ignores touch and wakes the clock for a mouse near the element", () => {
    const el = document.createElement("div");
    el.getBoundingClientRect = () => new DOMRect(0, 0, 100, 100);
    const { p, dispose } = trackPointer(el);
    const move = (clientX: number, pointerType: string) =>
      dispatchEvent(
        Object.assign(new MouseEvent("pointermove", { clientX, clientY: 50 }), {
          pointerType,
        })
      );
    move(75, "touch");
    expect(p.inside).toBe(false);
    move(75, "mouse");
    expect(p).toMatchObject({ inside: true, x: 0.5 });
    expect(clock.kick).toHaveBeenCalled();
    dispose();
  });
});
