// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Glyph } from "@/lib/scene/blit";

import { attachMonument } from "../monument";

const attached: Glyph[] = [];
const kicks = vi.fn<() => void>();
let clock = 0;

vi.mock("../engine", () => ({
  glyphs: {
    attach: (_host: HTMLElement, glyph: Glyph) => {
      attached.push(glyph);
      return () => {};
    },
    kick: () => {
      kicks();
    },
  },
}));

/** Step until the glyph rests; how many frames that took (capped). */
function settle(glyph: Glyph, cap = 600) {
  for (let i = 1; i <= cap; i++) if (!glyph.step(1 / 60)) return i;
  return cap;
}

function mount(onRest = vi.fn()) {
  const monument = attachMonument(document.createElement("div"), "active", {
    tier: 2,
    onLost: () => {},
    onRest,
  });
  const glyph = attached.at(-1);
  if (!glyph) throw new Error("not attached");
  return { monument, glyph, onRest };
}

const yaw = (glyph: Glyph) =>
  glyph.scene.children[0]?.children.find((c) => c.type === "Group")?.rotation
    .y ?? NaN;

beforeEach(() => {
  attached.length = 0;
  kicks.mockClear();
  document.documentElement.dataset.motion = "on";
  clock = 0;
  vi.spyOn(performance, "now").mockImplementation(() => clock);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("attachMonument", () => {
  it("attaches at rest, so a page that never touches it renders one frame", async () => {
    const { glyph, onRest } = mount();
    expect(glyph.step(1 / 60)).toBe(false);
    await Promise.resolve();
    expect(onRest).toHaveBeenCalled();
  });

  it("coasts after a flick with motion on, then stops", () => {
    const { monument, glyph } = mount();
    settle(glyph);
    monument.grab(100);
    clock = 16;
    monument.drag(110);
    clock = 32;
    monument.drag(120);
    const held = yaw(glyph);
    monument.release();
    const frames = settle(glyph);
    expect(frames).toBeGreaterThan(5);
    expect(frames).toBeLessThan(600);
    expect(yaw(glyph)).toBeGreaterThan(held);
    expect(kicks).toHaveBeenCalled();
  });

  it("stops where it is let go and does not lean with motion off", () => {
    document.documentElement.dataset.motion = "off";
    const { monument, glyph } = mount();
    monument.grab(100);
    clock = 16;
    monument.drag(140);
    monument.release();
    monument.lean(1, 1);
    expect(glyph.step(1 / 60)).toBe(false);
    expect(glyph.scene.children[0]?.rotation.x).toBe(0);
  });

  it("springs a quarter turn on aim and back again", () => {
    const { monument, glyph } = mount();
    settle(glyph);
    const rest = yaw(glyph);
    monument.aim(90);
    settle(glyph);
    expect(yaw(glyph) - rest).toBeCloseTo(Math.PI / 2, 3);
    monument.aim(0);
    settle(glyph);
    expect(yaw(glyph)).toBeCloseTo(rest, 3);
  });
});
