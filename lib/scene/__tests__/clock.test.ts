// @vitest-environment jsdom
import { gsap } from "gsap";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { kick, startClock } from "../clock";
import { input, pauseScene, sceneStore } from "../store";

const render = vi.fn();
let stop = () => {};

/** Runs `n` ticker frames by hand. */
function frames(n: number) {
  for (let i = 0; i < n; i++) gsap.ticker.tick();
}

beforeEach(() => {
  render.mockClear();
  input.movedAt = -1e9;
  sceneStore.setState({ live: true, visible: true, paused: 0 });
  stop = startClock(render);
  // Drive the ticker manually: no rAF loop in the test.
  gsap.ticker.sleep();
  // Settle the first tick's scroll reading.
  frames(1);
  render.mockClear();
});

afterEach(() => {
  stop();
  scrollTo(0, 0);
});

describe("the scene clock", () => {
  it("renders zero frames while idle", () => {
    frames(120);
    expect(render).not.toHaveBeenCalled();
  });

  it("renders exactly the kicked frames, then sleeps", () => {
    kick(3);
    frames(20);
    expect(render).toHaveBeenCalledTimes(3);
  });

  it("redraws on scroll only while a view is visible", () => {
    Object.defineProperty(window, "scrollY", { value: 40, configurable: true });
    frames(1);
    expect(render).toHaveBeenCalledTimes(1);

    sceneStore.setState({ visible: false });
    Object.defineProperty(window, "scrollY", { value: 80, configurable: true });
    frames(5);
    expect(render).toHaveBeenCalledTimes(1);
  });

  it("renders nothing while paused, and resumes on release", () => {
    const release = pauseScene();
    const second = pauseScene();
    kick(5);
    frames(10);
    expect(render).not.toHaveBeenCalled();

    release();
    release();
    frames(2);
    expect(render).not.toHaveBeenCalled();
    expect(sceneStore.getState().paused).toBe(1);

    // The frames asked for while paused are drawn once it resumes.
    second();
    frames(10);
    expect(render).toHaveBeenCalledTimes(5);
  });
});
