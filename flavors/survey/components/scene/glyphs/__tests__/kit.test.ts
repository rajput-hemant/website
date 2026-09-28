// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createTurntable, type Turntable } from "../kit";

let clock = 0;

function settle(table: Turntable, cap = 600) {
  for (let i = 1; i <= cap; i++) if (!table.step(1 / 60)) return i;
  return cap;
}

beforeEach(() => {
  document.documentElement.dataset.motion = "on";
  clock = 0;
  vi.spyOn(performance, "now").mockImplementation(() => clock);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createTurntable", () => {
  it("holds a drag inside its range and springs back to rest when let go", () => {
    const table = createTurntable({ rest: 20, friction: 0, range: 30 });
    table.grab(0);
    clock = 16;
    table.drag(500);
    expect(table.yaw).toBe(50);
    table.release();
    expect(settle(table)).toBeLessThan(600);
    expect(table.yaw).toBe(20);
  });

  it("coasts after a flick, then rests where it stopped", () => {
    const table = createTurntable({ rest: 0 });
    table.grab(0);
    clock = 16;
    table.drag(10);
    clock = 32;
    table.drag(20);
    table.release();
    const frames = settle(table);
    expect(frames).toBeGreaterThan(5);
    expect(table.yaw).toBeGreaterThan(28);
    expect(table.step(1 / 60)).toBe(false);
  });

  it("with motion off snaps an aim and neither coasts nor leans", () => {
    document.documentElement.dataset.motion = "off";
    const table = createTurntable({ rest: 0 });
    table.aim(45);
    table.lean(1, 1);
    expect(table.step(1 / 60)).toBe(false);
    expect(table.yaw).toBe(45);
    expect(table.tiltX).toBe(0);
    table.grab(0);
    clock = 16;
    table.drag(30);
    table.release();
    expect(table.step(1 / 60)).toBe(false);
  });
});
