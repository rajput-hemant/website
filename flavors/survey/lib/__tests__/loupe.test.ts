// @vitest-environment jsdom
import {
  aimLoupe,
  loupe,
  onLoupe,
  placeLoupe,
  restLoupe,
} from "@/flavors/survey/lib/loupe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { input } from "@/lib/scene/store";

describe("survey loupe", () => {
  beforeEach(() => {
    document.documentElement.dataset.motion = "on";
    placeLoupe(0, 0);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    delete document.documentElement.dataset.motion;
  });

  it("places the loupe immediately and notifies listeners", () => {
    const listener = vi.fn();
    const unsubscribe = onLoupe(listener);

    placeLoupe(120, 240);

    expect(loupe.x).toBe(120);
    expect(loupe.p).toBe(240);
    expect(loupe.rest).toEqual({ x: 120, p: 240 });
    expect(listener).toHaveBeenCalledWith(120, 240);

    unsubscribe();
  });

  it("aims toward target and converges via dt-integrated easing", () => {
    placeLoupe(0, 0);
    aimLoupe(100, 200);

    // Initial aim sets target
    expect(loupe.tx).toBe(100);
    expect(loupe.tp).toBe(200);

    // Run animation frames until settled
    let frames = 0;
    while ((loupe.x !== 100 || loupe.p !== 200) && frames < 60) {
      vi.advanceTimersByTime(16);
      frames++;
    }

    expect(loupe.x).toBe(100);
    expect(loupe.p).toBe(200);
    expect(frames).toBeGreaterThan(5);
    expect(frames).toBeLessThan(40);
  });

  it("snaps immediately when motion is off", () => {
    document.documentElement.dataset.motion = "off";
    placeLoupe(0, 0);
    aimLoupe(150, 300);

    vi.advanceTimersByTime(16);

    expect(loupe.x).toBe(150);
    expect(loupe.p).toBe(300);
  });

  it("returns to resting coordinates with restLoupe", () => {
    placeLoupe(50, 75);
    aimLoupe(100, 100);

    restLoupe();
    expect(loupe.tx).toBe(50);
    expect(loupe.tp).toBe(75);
  });

  it("reports every step, the landing included, without waking the pointer clock", () => {
    placeLoupe(0, 0);
    input.movedAt = 0;
    const steps: [number, number][] = [];
    const unsubscribe = onLoupe((x, p) => steps.push([x, p]));

    aimLoupe(100, 200);
    vi.advanceTimersByTime(16 * 60);

    expect(steps.at(-1)).toEqual([100, 200]);
    const count = steps.length;
    vi.advanceTimersByTime(16 * 60);
    expect(steps).toHaveLength(count);
    // The relief draws per step; a bumped pointer clock kept it drawing 1.2s more.
    expect(input.movedAt).toBe(0);

    unsubscribe();
  });
});
