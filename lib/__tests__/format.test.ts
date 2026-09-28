import { describe, expect, it } from "vitest";

import {
  formatDate,
  formatDateRange,
  formatMonthYear,
  formatShortDate,
  formatTenure,
  formatTimestamp,
  formatYearRange,
  isMonthPrecision,
  parseIsoDate,
  toDateTime,
  toMonthDateTime,
} from "../format";

describe("parseIsoDate", () => {
  it("reads full dates and month-only dates", () => {
    expect(parseIsoDate("2026-01-15")).toEqual({
      year: 2026,
      month: 1,
      day: 15,
    });
    expect(parseIsoDate("2024-09")).toEqual({ year: 2024, month: 9, day: 1 });
  });

  it("rejects malformed input", () => {
    expect(() => parseIsoDate("")).toThrow(RangeError);
    expect(() => parseIsoDate("Jan 2026")).toThrow(RangeError);
    expect(() => parseIsoDate("2026-13-01")).toThrow(RangeError);
  });
});

describe("formatMonthYear", () => {
  it("formats content dates without shifting across timezones", () => {
    expect(formatMonthYear("2026-01-01")).toBe("Jan 2026");
    expect(formatMonthYear("2025-09-01")).toBe("Sep 2025");
    expect(formatMonthYear("2024-12-31")).toBe("Dec 2024");
  });

  it("accepts a Date in local time", () => {
    expect(formatMonthYear(new Date(2026, 4, 20))).toBe("May 2026");
  });
});

describe("formatDate", () => {
  it("formats a full date", () => {
    expect(formatDate("2026-09-25")).toBe("Sep 25, 2026");
    expect(formatDate("2026-03-01")).toBe("Mar 1, 2026");
  });
});

describe("formatTimestamp", () => {
  it("formats an ISO datetime in UTC", () => {
    expect(formatTimestamp("2026-09-25T10:00:00Z")).toBe("Sep 25, 2026");
    expect(formatTimestamp("2026-09-25T23:30:00-05:00")).toBe("Sep 26, 2026");
    expect(formatTimestamp("2026-01-01T00:00:00.000Z")).toBe("Jan 1, 2026");
  });

  it("returns an empty string for unparseable input", () => {
    expect(formatTimestamp("")).toBe("");
    expect(formatTimestamp("not a date")).toBe("");
  });
});

describe("formatShortDate", () => {
  it("shows the day, or only the month for month-precision dates", () => {
    expect(formatShortDate("2026-09-25")).toBe("Sep 25");
    expect(formatShortDate("2026-03-01")).toBe("Mar");
    expect(isMonthPrecision("2026-03-01")).toBe(true);
    expect(isMonthPrecision("2026-03-02")).toBe(false);
  });
});

describe("dateTime helpers", () => {
  it("produce valid <time dateTime> values", () => {
    expect(toMonthDateTime("2026-01-01")).toBe("2026-01");
    expect(toDateTime("2026-09-05")).toBe("2026-09-05");
    expect(toDateTime(new Date(2026, 0, 2))).toBe("2026-01-02");
  });
});

describe("formatDateRange", () => {
  it("joins two months with an en dash", () => {
    expect(formatDateRange("2024-09-01", "2026-01-01")).toBe(
      "Sep 2024 – Jan 2026"
    );
  });

  it("reads Present for an open-ended range", () => {
    expect(formatDateRange("2026-01-01")).toBe("Jan 2026 – Present");
  });
});

describe("formatYearRange", () => {
  it("formats spans and single years", () => {
    expect(formatYearRange(2020, 2024)).toBe("2020 – 2024");
    expect(formatYearRange(undefined, 2018)).toBe("2018");
    expect(formatYearRange(2020, 2020)).toBe("2020");
  });
});

describe("formatTenure", () => {
  it("counts both end months", () => {
    expect(formatTenure("2026-01-01", "2026-03-01")).toBe("3 mos");
    expect(formatTenure("2024-09-01", "2026-01-01")).toBe("1 yr 5 mos");
    expect(formatTenure("2025-09-01", "2025-09-01")).toBe("1 mo");
  });

  it("formats years and months with plurals", () => {
    expect(formatTenure("2025-01-01", "2025-12-01")).toBe("1 yr");
    expect(formatTenure("2024-06-01", "2025-09-01")).toBe("1 yr 4 mos");
    expect(formatTenure("2024-01-01", "2025-12-01")).toBe("2 yrs");
    expect(formatTenure("2024-01-01", "2026-01-01")).toBe("2 yrs 1 mo");
  });

  it("measures an ongoing role to a Date", () => {
    expect(formatTenure("2026-01-01", new Date(2026, 8, 25))).toBe("9 mos");
  });

  it("never returns less than one month", () => {
    expect(formatTenure("2026-05-01", "2026-01-01")).toBe("1 mo");
  });
});
