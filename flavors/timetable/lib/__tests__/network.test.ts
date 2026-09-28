import {
  buildNetwork,
  monthDate,
  monthIndex,
  type NetworkRole,
} from "@/flavors/timetable/lib/network";
import { describe, expect, it } from "vitest";

const role = (
  id: string,
  startDate: string,
  endDate?: string,
  next?: string
): NetworkRole => ({
  id,
  company: id,
  title: `${id} engineer`,
  startDate,
  endDate,
  continuedInto: next ? { id: next, company: next } : undefined,
});

/** The real history, newest first. */
const roles = [
  role("Zunta", "2026-01-01"),
  role("Blai", "2025-09-01", "2026-05-01"),
  role("Proghit", "2024-09-01", "2026-01-01", "Zunta"),
  role("Lightwork", "2024-09-01", "2025-07-01"),
  role("FastLane", "2024-06-01", "2025-09-01", "Blai"),
  role("MixR", "2024-07-01", "2025-02-01"),
];

const net = buildNetwork(roles, "2026-09-26");
const line = (id: string) => net.lines.find((l) => l.id === id)!;

describe("monthIndex", () => {
  it("round-trips through monthDate", () => {
    expect(monthDate(monthIndex("2024-09-15"))).toBe("2024-09-01");
    expect(monthIndex("2025-01-01") - monthIndex("2024-12-01")).toBe(1);
  });
});

describe("buildNetwork", () => {
  it("never puts two overlapping lines on one row", () => {
    for (const a of net.lines) {
      for (const b of net.lines) {
        if (a === b || a.row !== b.row) continue;
        expect(a.to < b.from || b.to < a.from).toBe(true);
      }
    }
  });

  it("uses as few rows as the busiest month needs", () => {
    expect(net.rows).toBe(4);
    expect(net.peak).toEqual({
      count: 4,
      from: monthIndex("2024-09-01"),
      to: monthIndex("2025-02-01"),
    });
  });

  it("branches a continued role off its predecessor's row, next to it", () => {
    expect(line("Blai").branchFrom).toBe(line("FastLane").row);
    expect(line("Zunta").branchFrom).toBe(line("Proghit").row);
    expect(Math.abs(line("Zunta").row - line("Proghit").row)).toBe(1);
    expect(Math.abs(line("Blai").row - line("FastLane").row)).toBe(1);
  });

  it("colours lines newest first and runs current ones to today", () => {
    expect(line("Zunta").colour).toBe(1);
    expect(line("MixR").colour).toBe(6);
    expect(line("Zunta").current).toBe(true);
    expect(line("Zunta").to).toBe(monthIndex("2026-09-01"));
    expect(net.to).toBe(monthIndex("2026-09-01"));
    expect(net.from).toBe(monthIndex("2024-06-01"));
  });

  it("finds the joint departure and both changes", () => {
    expect(
      net.interchanges.map(({ kind, at, ids }) => [kind, monthDate(at), ids])
    ).toEqual([
      ["joint", "2024-09-01", ["Proghit", "Lightwork"]],
      ["change", "2025-09-01", ["FastLane", "Blai"]],
      ["change", "2026-01-01", ["Proghit", "Zunta"]],
    ]);
  });

  it("writes the events a line diagram lists", () => {
    expect(net.events.map((e) => `${monthDate(e.at)} ${e.text}`)).toEqual([
      "2024-06-01 FastLane starts",
      "2024-07-01 MixR starts",
      expect.stringMatching(
        /^2024-09-01 (Proghit and Lightwork|Lightwork and Proghit) start$/
      ),
      "2025-02-01 MixR ends",
      "2025-07-01 Lightwork ends",
      "2025-09-01 Change: FastLane to Blai",
      "2026-01-01 Change: Proghit to Zunta",
      "2026-05-01 Blai ends",
      "2026-09-01 You are here, on Zunta",
    ]);
  });

  it("handles a single current role", () => {
    const solo = buildNetwork([role("Solo", "2025-01-01")], "2025-03-10");
    expect(solo.rows).toBe(1);
    expect(solo.interchanges).toEqual([]);
    expect(solo.peak.count).toBe(1);
  });
});
