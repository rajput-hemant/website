import { describe, expect, it, vi } from "vitest";

import { createRegisterGate } from "../register-gate";

describe("createRegisterGate", () => {
  it("plays once per page view", () => {
    const gate = createRegisterGate(1500);
    const play = vi.fn(() => true);
    expect(gate.enter("/", 0, play)).toBe(true);
    expect(gate.enter("/", 5000, play)).toBe(false);
    expect(play).toHaveBeenCalledOnce();
  });

  it("throttles across quick navigations, then allows the next view", () => {
    const gate = createRegisterGate(1500);
    const play = vi.fn(() => true);
    gate.enter("/", 0, play);
    expect(gate.enter("/work", 1000, play)).toBe(false);
    expect(gate.enter("/work", 1500, play)).toBe(true);
    // Coming back to a page is a new view.
    expect(gate.enter("/", 3200, play)).toBe(true);
    expect(play).toHaveBeenCalledTimes(3);
  });

  it("does not spend the view when the engine refuses the play", () => {
    const gate = createRegisterGate(1500);
    expect(gate.enter("/", 0, () => false)).toBe(false);
    expect(gate.enter("/", 10, () => true)).toBe(true);
  });
});
