// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { GrainPoolOptions, PlayOptions, Voice } from "@/lib/sound";

type Pool = {
  options: GrainPoolOptions;
  play: ReturnType<
    typeof vi.fn<(voice: Voice, options?: PlayOptions) => boolean>
  >;
};

const sound = vi.hoisted(() => {
  const pools: Pool[] = [];
  return {
    pools,
    isSoundOn: vi.fn(() => true),
    playVoice: vi.fn(() => true),
    createGrainPool: vi.fn((options: GrainPoolOptions) => {
      const pool: Pool = {
        options,
        play: vi.fn<(voice: Voice, options?: PlayOptions) => boolean>(
          () => true
        ),
      };
      pools.push(pool);
      return pool;
    }),
  };
});

vi.mock("@/lib/sound", () => sound);

const scene = await import("@/flavors/drawing-set/lib/sound/scene");
const { VOICES } = await import("@/flavors/drawing-set/lib/sound/voices");

// voices.ts makes the confirmations pool, then scene.ts the scene pool and
// the stepper.
const [, scenePool, stepper] = sound.pools;
if (!scenePool || !stepper) throw new Error("pools not created");

let now = 0;

beforeEach(() => {
  now += 10_000;
  vi.spyOn(performance, "now").mockImplementation(() => now);
  document.documentElement.dataset.motion = "on";
  sound.isSoundOn.mockReturnValue(true);
  scenePool.play.mockClear();
  stepper.play.mockClear();
  sound.playVoice.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
  delete document.documentElement.dataset.motion;
});

const closed = { drawer: null, open: 0 };

describe("createRateGate", () => {
  it("lets one play through per interval, and a refused play is free", () => {
    const gate = scene.createRateGate(800);
    expect(gate(0, () => false)).toBe(false);
    expect(gate(10, () => true)).toBe(true);
    expect(gate(700, () => true)).toBe(false);
    expect(gate(810, () => true)).toBe(true);
  });
});

describe("drawerOpens", () => {
  it("opens for a new drawer or a drawer pulled further out", () => {
    expect(scene.drawerOpens(closed, { drawer: 0, open: 1.4 })).toBe(true);
    expect(
      scene.drawerOpens({ drawer: 0, open: 1.4 }, { drawer: 3, open: 1.3 })
    ).toBe(true);
    expect(
      scene.drawerOpens({ drawer: 0, open: 0.3 }, { drawer: 0, open: 1.4 })
    ).toBe(true);
  });

  it("stays quiet going home or pushing a drawer back in", () => {
    expect(scene.drawerOpens({ drawer: 0, open: 1.4 }, closed)).toBe(false);
    expect(
      scene.drawerOpens({ drawer: 0, open: 1.4 }, { drawer: 0, open: 0.3 })
    ).toBe(false);
  });
});

describe("playRouteDrawer", () => {
  it("runs the drawer with motion on", () => {
    scene.playRouteDrawer(closed, { drawer: 1, open: 0.35 });
    expect(scenePool.play).toHaveBeenCalledWith(VOICES.drawer);
  });

  it("becomes one thunk with the plot under reduced motion", () => {
    document.documentElement.dataset.motion = "off";
    scene.playRouteDrawer(closed, { drawer: 1, open: 0.35 });
    now += 100;
    scene.playPlot();
    expect(scenePool.play).toHaveBeenCalledTimes(1);
    expect(scenePool.play).toHaveBeenCalledWith(VOICES.thunk);
    expect(stepper.play).not.toHaveBeenCalled();
  });

  it("is silent with sound off or a hidden tab", () => {
    sound.isSoundOn.mockReturnValue(false);
    scene.playRouteDrawer(closed, { drawer: 1, open: 0.35 });
    sound.isSoundOn.mockReturnValue(true);
    vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    scene.playRouteDrawer(closed, { drawer: 1, open: 0.35 });
    expect(scenePool.play).not.toHaveBeenCalled();
  });
});

describe("playPlot", () => {
  it("steps the plotter at 55Hz, at most once per 800ms", () => {
    scene.playPlot();
    expect(stepper.play).toHaveBeenCalledTimes(scene.PLOT_STEPS);
    const delays = stepper.play.mock.calls.map(([, o]) => o?.delay ?? 0);
    expect(delays[1]).toBeCloseTo(1 / 55);
    expect(stepper.options.maxLive).toBeGreaterThanOrEqual(scene.PLOT_STEPS);
    // Spacing the pool accepts must fit the gate.
    expect(stepper.options.minGap).toBeLessThan(1 / 55);

    now += scene.PLOT_INTERVAL - 1;
    scene.playPlot();
    expect(stepper.play).toHaveBeenCalledTimes(scene.PLOT_STEPS);
    now += 1;
    scene.playPlot();
    expect(stepper.play).toHaveBeenCalledTimes(scene.PLOT_STEPS * 2);
  });
});

describe("playSheet", () => {
  it("slides a sheet for a mouse click, never for touch", () => {
    scene.playSheet(new MouseEvent("click"));
    expect(sound.playVoice).toHaveBeenCalledWith(VOICES.sheet);
    sound.playVoice.mockClear();
    scene.playSheet(new PointerEvent("click", { pointerType: "touch" }));
    expect(sound.playVoice).not.toHaveBeenCalled();
  });
});
