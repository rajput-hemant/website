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

const { createDetents, createStopLatch, detentDetune } =
  await import("@/flavors/surface/lib/sound/detents");
const { VOICES } = await import("@/flavors/surface/lib/sound/voices");

/** createDetents makes the detent pool, then the end-stop pool. */
function setup() {
  const before = sound.pools.length;
  const knob = createDetents();
  const [detents, stops] = sound.pools.slice(before);
  if (!detents || !stops) throw new Error("createDetents made no pools");
  return { knob, detents, stops };
}

function setHidden(hidden: boolean) {
  Object.defineProperty(document, "hidden", {
    value: hidden,
    configurable: true,
  });
}

beforeEach(() => {
  sound.isSoundOn.mockReturnValue(true);
  setHidden(false);
});

afterEach(() => {
  setHidden(false);
});

describe("detentDetune", () => {
  it("spreads the bandpass ±3% across the sweep", () => {
    expect(detentDetune(0, 5)).toBeCloseTo(0.97);
    expect(detentDetune(2, 5)).toBeCloseTo(1);
    expect(detentDetune(4, 5)).toBeCloseTo(1.03);
    expect(detentDetune(9, 5)).toBeCloseTo(1.03);
    expect(detentDetune(0, 1)).toBe(1);
  });
});

describe("createStopLatch", () => {
  it("clunks once per contact and re-arms after leaving the stop", () => {
    const stop = createStopLatch();
    expect([false, true, true, true, false, true].map(stop)).toEqual([
      false,
      true,
      false,
      false,
      false,
      true,
    ]);
  });
});

describe("createDetents", () => {
  it("pools detents to one per 25ms, outside the click limiter", () => {
    const { detents } = setup();
    expect(detents.options.minGap).toBe(0.025);
    expect(detents.options.maxPerSecond).toBe(40);
    expect(sound.playVoice).not.toHaveBeenCalled();
  });

  it("plays every detent of a fast spin, pitched by its index", () => {
    const { knob, detents } = setup();
    for (let i = 0; i < 5; i++) knob.detent(i, 5);
    expect(detents.play).toHaveBeenCalledTimes(5);
    const detunes = detents.play.mock.calls.map(([voice, options]) => {
      expect(voice).toBe(VOICES.detent);
      return options?.detune ?? 0;
    });
    expect(detunes).toEqual([...detunes].sort((a, b) => a - b));
  });

  it("clunks the end stop on its own budget", () => {
    const { knob, detents, stops } = setup();
    knob.endStop();
    expect(detents.play).not.toHaveBeenCalled();
    expect(stops.play).toHaveBeenCalledWith(VOICES.endStop);
  });

  it("stays silent with sound off or the tab hidden", () => {
    const { knob, detents, stops } = setup();
    sound.isSoundOn.mockReturnValue(false);
    knob.detent(1, 5);
    knob.endStop();
    sound.isSoundOn.mockReturnValue(true);
    setHidden(true);
    knob.detent(1, 5);
    knob.endStop();
    expect(detents.play).not.toHaveBeenCalled();
    expect(stops.play).not.toHaveBeenCalled();
  });
});
