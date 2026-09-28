// @vitest-environment jsdom
import {
  aimLoupe,
  loupe,
  onLoupe,
  placeLoupe,
  restLoupe,
} from "@/flavors/survey/lib/loupe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
});
