// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { HapticKind } from "@/lib/haptics";

const engine = vi.hoisted(() => ({
  created: 0,
  trigger: vi.fn(() => Promise.resolve()),
  cancel: vi.fn(),
}));

vi.mock("web-haptics", () => ({
  WebHaptics: class {
    trigger = engine.trigger;
    cancel = engine.cancel;
    destroy = vi.fn();
    constructor() {
      engine.created += 1;
    }
  },
}));

let coarse = true;
let hidden = false;

async function load() {
  vi.resetModules();
  return import("@/lib/haptics");
}

beforeEach(() => {
  coarse = true;
  hidden = false;
  engine.created = 0;
  engine.trigger.mockClear();
  engine.cancel.mockClear();
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query === "(any-pointer: coarse)" && coarse,
  }));
  vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden);
  delete document.documentElement.dataset.haptics;
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("haptic", () => {
  it("loads the engine once and plays the first call when it lands", async () => {
    const { haptic, preloadHaptics } = await load();
    haptic("tap");
    expect(engine.trigger).not.toHaveBeenCalled();
    await preloadHaptics();
    expect(engine.trigger).toHaveBeenCalledOnce();

    haptic("select");
    haptic("success");
    await preloadHaptics();
    expect(engine.created).toBe(1);
    expect(engine.trigger).toHaveBeenCalledTimes(3);
  });

  it("maps kinds to short pulses and the library presets", async () => {
    const { haptic, preloadHaptics } = await load();
    await preloadHaptics();
    const kinds: HapticKind[] = ["tap", "select", "success", "error", "nudge"];
    for (const kind of kinds) haptic(kind);
    expect(engine.trigger.mock.calls).toEqual([
      [[{ duration: 10, intensity: 1 }]],
      [[{ duration: 15, intensity: 1 }]],
      ["success"],
      ["error"],
      ["nudge"],
    ]);
  });

  it("stays still with the preference off, in a hidden tab or without touch", async () => {
    const { haptic, preloadHaptics } = await load();
    await preloadHaptics();

    document.documentElement.dataset.haptics = "off";
    haptic("tap");
    document.documentElement.dataset.haptics = "on";
    hidden = true;
    haptic("tap");
    hidden = false;
    coarse = false;
    haptic("tap");
    expect(engine.trigger).not.toHaveBeenCalled();

    coarse = true;
    haptic("tap");
    expect(engine.trigger).toHaveBeenCalledOnce();
  });

  it("never fetches the engine for a mouse-only visitor", async () => {
    coarse = false;
    const { haptic } = await load();
    haptic("success");
    await Promise.resolve();
    expect(engine.created).toBe(0);
  });

  it("drops a call whose engine arrives too late for the gesture", async () => {
    const { haptic, preloadHaptics } = await load();
    const now = vi.spyOn(performance, "now").mockReturnValue(0);
    haptic("tap");
    now.mockReturnValue(5000);
    await preloadHaptics();
    expect(engine.trigger).not.toHaveBeenCalled();
  });

  it("cancels a running pattern", async () => {
    const { cancelHaptics, preloadHaptics } = await load();
    cancelHaptics();
    await preloadHaptics();
    cancelHaptics();
    expect(engine.cancel).toHaveBeenCalledOnce();
  });
});
