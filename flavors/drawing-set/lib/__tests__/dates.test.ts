import { describe, expect, it } from "vitest";

import { formatTenure, tenure, tenureMonths } from "../dates";

describe("tenure", () => {
  it("counts both end months", () => {
    expect(tenure("2024-06-01", "2026-09-01")).toEqual({ years: 2, months: 4 });
    expect(tenureMonths(tenure("2024-01-01", "2024-03-01"))).toBe(3);
  });
});

describe("formatTenure", () => {
  it("reads as a dimension label", () => {
    expect(formatTenure("2024-01-01", "2024-03-01")).toBe("3M");
    expect(formatTenure("2024-06-01", "2026-09-01")).toBe("2Y 4M");
    expect(formatTenure("2025-01-01", "2025-12-01")).toBe("1Y");
  });

  it("never reads less than a month, and counts ongoing roles to a date", () => {
    expect(formatTenure("2026-09-01", "2026-01-01")).toBe("1M");
    expect(formatTenure("2025-09-01", new Date(2026, 8, 26))).toBe("1Y 1M");
  });
});
