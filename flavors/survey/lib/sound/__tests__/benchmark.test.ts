// @vitest-environment jsdom

import { buildRelief, SHEET } from "@/flavors/survey/lib/relief";
import {
  pingSite,
  pingSummit,
  tallyAt,
  tallyCount,
} from "@/flavors/survey/lib/sound/benchmark";
import { VOICES } from "@/flavors/survey/lib/sound/voices";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { experience } from "@/content/fallback/experience";
import { projects } from "@/content/fallback/projects";
import type { PlayOptions, Voice } from "@/lib/sound";

const play = vi.hoisted(() =>
  vi.fn<(voice: Voice, options?: PlayOptions) => boolean>(() => true)
);

vi.mock("@/lib/sound", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/sound")>()),
  createGrainPool: () => ({ play }),
}));

const relief = buildRelief(experience, projects, new Date(2026, 8, 27));
const mouse = { pointerType: "mouse" };
const root = document.documentElement;

beforeEach(() => {
  root.dataset.sound = "on";
  root.dataset.motion = "on";
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
});

afterEach(() => {
  delete root.dataset.sound;
  delete root.dataset.motion;
  vi.unstubAllGlobals();
  play.mockClear();
});

describe("pingSummit", () => {
  it("rings a summit at its height, the current role with its octave", () => {
    pingSummit(mouse, { h: 24, current: false });
    expect(play).toHaveBeenLastCalledWith(VOICES.ping, { detune: 2 });
    pingSummit({ pointerType: "pen" }, { h: 12, current: true });
    const [voice, options] = play.mock.lastCall ?? [];
    expect(voice).toBe(VOICES.pingCurrent);
    expect(options?.detune).toBeCloseTo(Math.SQRT2);
  });

  it("stays quiet on touch and with sound off", () => {
    expect(pingSummit({ pointerType: "touch" }, { h: 6, current: false })).toBe(
      false
    );
    delete root.dataset.sound;
    expect(pingSummit(mouse, { h: 6, current: false })).toBe(false);
    expect(pingSite(mouse)).toBe(false);
    expect(play).not.toHaveBeenCalled();
  });

  it("rings a site at its fixed pitch", () => {
    pingSite(mouse);
    expect(play).toHaveBeenLastCalledWith(VOICES.pingSite);
  });
});

describe("tallyAt", () => {
  // The first easting where the count of roles running changes.
  const west = SHEET.X0;
  const counts = Array.from({ length: 400 }, (_, i) => west + i * 2);
  const change = counts.find((x, i) => {
    const prev = counts[i - 1];
    return (
      prev !== undefined && tallyCount(relief, x) !== tallyCount(relief, prev)
    );
  });

  it("finds a count change on the fallback sheet", () => {
    expect(change).toBeDefined();
  });

  it("plays only when the count changes, never on a sheet's first reading", () => {
    if (change === undefined) return;
    const before = change - 2;
    expect(tallyAt(relief, before)).toBe(false);
    expect(tallyAt(relief, before)).toBe(false);
    expect(tallyAt(relief, change)).toBe(true);
    expect(play).toHaveBeenCalledTimes(1);
    expect(play.mock.lastCall?.[0]).toBe(VOICES.tally);
    // A new sheet starts from its own first reading.
    const other = buildRelief(experience, projects, new Date(2026, 8, 27));
    expect(tallyAt(other, before)).toBe(false);
  });

  it("stays quiet with motion off, where the loupe snaps", () => {
    if (change === undefined) return;
    tallyAt(relief, change - 2);
    root.dataset.motion = "off";
    expect(tallyAt(relief, change)).toBe(false);
    expect(play).not.toHaveBeenCalled();
  });

  it("counts nothing beyond the coast", () => {
    expect(tallyCount(relief, relief.coast + 1)).toBe(0);
  });
});
