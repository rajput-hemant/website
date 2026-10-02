// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Glyph } from "@/lib/scene/blit";

import { attachCase } from "../case";
import { attachDisc } from "../disc";
import { attachLayers } from "../layers";
import { attachSeal } from "../seal";

const attached: Glyph[] = [];
let clock = 0;

vi.mock("../engine", () => ({
  glyphs: {
    attach: (_host: HTMLElement, glyph: Glyph) => {
      attached.push(glyph);
      return () => {};
    },
    kick: () => {},
  },
}));

// Colours come from CSS tokens; jsdom has no canvas to resolve them.
vi.mock("@/lib/scene/colors", () => ({
  tokenColor: (_token: string, fallback = "#000000") => fallback,
}));

const base = { tier: 2 as const, onLost: () => {} };
const host = () => document.createElement("div");
const last = () => {
  const glyph = attached.at(-1);
  if (!glyph) throw new Error("not attached");
  return glyph;
};
function settle(glyph: Glyph, cap = 600) {
  for (let i = 1; i <= cap; i++) if (!glyph.step(1 / 60)) return i;
  return cap;
}
/** The first descendant group's world y, for lifts and presses. */
const heightOf = (glyph: Glyph, depth: number[]) => {
  let node = glyph.scene;
  for (const i of depth) node = node.children[i] ?? node;
  return node.position.y;
};

beforeEach(() => {
  attached.length = 0;
  document.documentElement.dataset.motion = "on";
  clock = 0;
  vi.spyOn(performance, "now").mockImplementation(() => clock);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("survey glyphs", () => {
  it("every glyph attaches at rest, so an untouched page draws one frame", () => {
    attachDisc(host(), { ...base, lean: 15, spin: false });
    attachLayers(host(), [3, 8, 12], { ...base, aspect: 1.4 });
    attachSeal(host(), base);
    attachCase(host(), { ...base, open: false });
    for (const glyph of attached) expect(glyph.step(1 / 60)).toBe(false);
  });

  it("spins the entry mark on with inertia after a flick", () => {
    const disc = attachDisc(host(), { ...base, lean: 10, spin: true });
    const glyph = last();
    disc.grab(0);
    clock = 16;
    disc.drag(12);
    clock = 32;
    disc.drag(24);
    disc.release();
    expect(settle(glyph)).toBeGreaterThan(5);
  });

  it("lifts a pointed year's tile, and only tints it with motion off", () => {
    const layers = attachLayers(host(), [3, 8], { ...base, aspect: 1.4 });
    const glyph = last();
    const rest = heightOf(glyph, [0, 1]);
    layers.point(1);
    settle(glyph);
    expect(heightOf(glyph, [0, 1])).toBeGreaterThan(rest + 1);
    layers.point(null);
    settle(glyph);
    document.documentElement.dataset.motion = "off";
    layers.point(1);
    // One frame lands the tint at once; the tile never rises.
    expect(settle(glyph)).toBe(1 + 1);
    expect(heightOf(glyph, [0, 1])).toBe(rest);
  });

  it("presses the seal while held and lets it back up", () => {
    const seal = attachSeal(host(), base);
    const glyph = last();
    const up = heightOf(glyph, [0, 0]);
    seal.press(true);
    settle(glyph);
    expect(heightOf(glyph, [0, 0])).toBeLessThan(up);
    seal.press(false);
    settle(glyph);
    expect(heightOf(glyph, [0, 0])).toBe(up);
  });

  it("opens the case on sign-in with a spring, or at once with motion off", () => {
    const mapCase = attachCase(host(), { ...base, open: false });
    const glyph = last();
    mapCase.open(true);
    expect(settle(glyph)).toBeGreaterThan(3);
    document.documentElement.dataset.motion = "off";
    mapCase.open(false);
    expect(glyph.step(1 / 60)).toBe(false);
  });
});
