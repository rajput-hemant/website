import {
  activeAt,
  designation,
  elapsed,
  flightPlan,
  launchLabel,
  launchTime,
  met,
  monthLabel,
  phaseSpan,
  readout,
  revision,
} from "@/flavors/mission/lib/flight";
import { describe, expect, it } from "vitest";

import { experience } from "@/content/fallback/experience";
import { projects } from "@/content/fallback/projects";

/** The item at `i`, or a failed test. */
function at<T>(list: readonly T[], i: number): T {
  const item = list[i];
  if (item === undefined) throw new Error(`nothing at ${i}`);
  return item;
}

const today = new Date(2026, 8, 27);
const flight = flightPlan(experience, projects, today);

describe("flightPlan", () => {
  it("puts T-0 at the first role and orders the phases by start", () => {
    expect(launchLabel(flight)).toBe("Jun 2024");
    expect(flight.phases.map((p) => `${p.code} ${p.company}`)).toEqual([
      "PH-1 FastLane",
      "PH-2 MixR",
      "PH-3 Proghit",
      "PH-4 Lightwork AI",
      "PH-5 Blai",
      "PH-6 Zunta",
    ]);
  });

  it("measures each phase in months from T-0, ends exclusive", () => {
    const [fastlane, , , , , zunta] = flight.phases;
    expect(fastlane).toMatchObject({
      a: 0,
      b: 16,
      dur: 16,
      inc: 64,
      node: 150,
    });
    expect(zunta?.b).toBeNull();
    expect(zunta?.a).toBe(19);
    expect(flight.now).toBeCloseTo(27 + 26 / 31);
  });

  it("files the side projects before launch as ground tests", () => {
    expect(flight.pre?.from).toBe(2022);
    expect(flight.pre?.to).toBe(2024);
    expect(flight.pre?.tests[2022]).toContain("Infinitunes");
    expect(flight.pre?.tests[2024]).toBeUndefined();
  });

  it("names who was on board at a time", () => {
    expect(activeAt(flight, 4).map((p) => p.company)).toEqual([
      "FastLane",
      "MixR",
      "Proghit",
      "Lightwork AI",
    ]);
    expect(activeAt(flight, flight.now).map((p) => p.company)).toEqual([
      "Zunta",
    ]);
    expect(readout(flight, 4)).toMatchObject({
      head: "T+ 0Y 04M · OCT 24",
      active: "4 active",
    });
    expect(readout(flight, -20).head).toBe("Pre-launch · 2022");
  });
});

describe("labels", () => {
  it("prints mission time and months", () => {
    expect(elapsed(15.4)).toBe("T+ 1Y 03M");
    expect(monthLabel(flight, 0)).toBe("JUN 24");
    expect(monthLabel(flight, -1)).toBe("MAY 24");
    expect(phaseSpan(flight, at(flight.phases, 0))).toBe("JUN 24 to SEP 25");
  });

  it("runs the MET clock from the first of the launch month", () => {
    expect(launchTime(flight)).toBe(Date.UTC(2024, 5, 1));
    expect(met(((2 * 24 + 3) * 3600 + 4 * 60 + 5) * 1000)).toBe("002:03:04:05");
    expect(met(-5)).toBe("000:00:00:00");
  });

  it("designates missions by name and launch year", () => {
    expect(designation({ name: "Infinitunes", year: 2022 })).toBe("INF-22");
    expect(designation({ name: "JioSaavn API", year: 2023 })).toBe("JSV-23");
    expect(designation({ name: "Lipi", year: null })).toBe("LP");
  });

  it("revises the plan by year and month", () => {
    expect(revision(today, "AL")).toEqual({ plan: "AL-26", rev: "Rev 26.09" });
  });
});
