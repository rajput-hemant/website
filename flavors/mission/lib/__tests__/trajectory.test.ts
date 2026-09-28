import { flightPlan } from "@/flavors/mission/lib/flight";
import {
  NARROW,
  plotFor,
  timeAt,
  WIDE,
  xAt,
  yOn,
} from "@/flavors/mission/lib/trajectory";
import { describe, expect, it } from "vitest";

import { experience } from "@/content/fallback/experience";
import { projects } from "@/content/fallback/projects";

/** The item at `i`, or a failed test. */
function at<T>(list: readonly T[], i: number): T {
  const item = list[i];
  if (item === undefined) throw new Error(`nothing at ${i}`);
  return item;
}

const flight = flightPlan(experience, projects, new Date(2026, 8, 27));
const plot = plotFor(flight, WIDE);

describe("plotFor", () => {
  it("compresses pre-launch from January of the first ground test", () => {
    expect(plot.tg).toBe(-29);
    expect(xAt(plot, plot.tg)).toBe(0);
    expect(xAt(plot, 0)).toBe(plot.x0);
  });

  it("draws one arc per phase, the current one running on dotted", () => {
    expect(plot.arcs).toHaveLength(6);
    expect(plot.arcs.filter((arc) => arc.cont)).toHaveLength(1);
    const tallest = Math.max(...plot.arcs.map((a) => a.h));
    expect(tallest).toBeCloseTo(plot.base - 44);
  });

  it("labels T-0 and every 3rd month, only every 6th when narrow", () => {
    expect(plot.ticks[0]?.label).toBe("T-0");
    expect(plot.ticks[3]?.label).toBe("SEP 24");
    const narrow = plotFor(flight, NARROW);
    expect(narrow.ticks[3]?.label).toBeNull();
    expect(narrow.ticks[6]?.label).toBe("DEC 24");
  });
});

describe("scrubbing", () => {
  it("maps plot x back to mission time, clamped to today", () => {
    expect(timeAt(plot, xAt(plot, 12), flight.now)).toBeCloseTo(12);
    expect(timeAt(plot, WIDE.width, flight.now)).toBe(flight.now);
    expect(timeAt(plot, -10, flight.now)).toBe(plot.tg);
  });

  it("puts the cursor dot on the arc, at its peak mid-phase", () => {
    const arc = at(plot.arcs, 0);
    const mid = (arc.phase.a + (arc.phase.b ?? 0)) / 2;
    expect(yOn(plot, arc, mid, flight.now)).toBeCloseTo(plot.base - arc.h);
    expect(yOn(plot, arc, arc.phase.a, flight.now)).toBeCloseTo(plot.base);
  });
});
