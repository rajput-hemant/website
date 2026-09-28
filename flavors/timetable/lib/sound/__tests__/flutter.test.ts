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

const { createFlutter } = await import("@/flavors/timetable/lib/sound/flutter");
const { VOICES } = await import("@/flavors/timetable/lib/sound/voices");

/** createFlutter makes the grain pool, then the seat pool. */
function setup() {
  const before = sound.pools.length;
  const flutter = createFlutter();
  const [grains, seats] = sound.pools.slice(before);
  if (!grains || !seats) throw new Error("createFlutter made no pools");
  return { flutter, grains, seats };
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
  vi.unstubAllGlobals();
});

describe("createFlutter", () => {
  it("pools grains to the audit's budget", () => {
    const { grains } = setup();
    expect(grains.options).toEqual({
      maxPerSecond: 40,
      minGap: 0.016,
      maxPerBurst: 3,
    });
  });

  it("places one grain per flap step, at most three a frame", () => {
    const { flutter, grains } = setup();

    flutter.steps(2);
    expect(grains.play).toHaveBeenCalledTimes(2);
    flutter.steps(28);
    expect(grains.play).toHaveBeenCalledTimes(5);

    const delays = grains.play.mock.calls
      .slice(2)
      .map(([, options]) => options?.delay ?? 0);
    expect(delays[0]).toBe(0);
    // Spaced over the pool's minimum gap, so rounding never rejects one.
    expect(delays[1] ?? 0).toBeGreaterThan(0.016);
    expect((delays[2] ?? 0) - (delays[1] ?? 0)).toBeGreaterThan(0.016);
    for (const [voice, options] of grains.play.mock.calls) {
      expect(voice).toBe(VOICES.flutter);
      expect(Math.abs((options?.detune ?? 0) - 1)).toBeLessThanOrEqual(0.08);
      expect(Math.abs((options?.gain ?? 0) - 1)).toBeLessThanOrEqual(0.2);
    }
  });

  it("scales grains for the DOM riffle's half gain", () => {
    const { flutter, grains } = setup();
    flutter.steps(1, 0.5);
    const gain = grains.play.mock.calls[0]?.[1]?.gain ?? 0;
    expect(gain).toBeGreaterThanOrEqual(0.4);
    expect(gain).toBeLessThanOrEqual(0.6);
  });

  it("seats the drum on its own budget (the reduced-motion thunk)", () => {
    const { flutter, grains, seats } = setup();
    flutter.seat();
    expect(grains.play).not.toHaveBeenCalled();
    expect(seats.play).toHaveBeenCalledWith(VOICES.seat);
  });

  it("stays silent with sound off or the tab hidden", () => {
    const { flutter, grains, seats } = setup();
    sound.isSoundOn.mockReturnValue(false);
    flutter.steps(3);
    flutter.seat();
    sound.isSoundOn.mockReturnValue(true);
    setHidden(true);
    flutter.steps(3);
    flutter.seat();
    expect(grains.play).not.toHaveBeenCalled();
    expect(seats.play).not.toHaveBeenCalled();
  });

  it("waits for the first user gesture", () => {
    const { flutter, grains } = setup();
    vi.stubGlobal("navigator", {
      userActivation: { hasBeenActive: false, isActive: false },
    });
    flutter.steps(3);
    flutter.seat();
    expect(grains.play).not.toHaveBeenCalled();
  });
});
