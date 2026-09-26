import type { Experience, Project, ProjectStatus } from "@/lib/data/types";
import { monthIndex } from "@/lib/format";

/**
 * The survey sheet (docs/survey.md). Eastings are calendar years; north of
 * the boundary is employment, south is own work; east of today is sea. Each
 * role is a hill whose height is its months in the role. Everything is laid
 * out in sheet units, the same numbers the SVG, the poster and the relief
 * mesh use, so DOM labels sit exactly on the summits.
 */
export const SHEET = {
  /** The SVG viewBox. */
  W: 1030,
  H: 560,
  /** West and east neat lines. */
  X0: 40,
  X1: 990,
  /** Top of the map face on screen. */
  Y0: 70,
  /** Northing depth of the face. */
  P: 460,
  /** Oblique: screen y = Y0 + YS * p - LIFT * h. */
  YS: 0.9,
  LIFT: 3.4,
  /** North to south spread of a hill. */
  SPREAD: 30,
  /** A contour every 2 months in a role; every 8th month is an index contour. */
  INTERVAL: 2,
  INDEX: 8,
  /** Ten northing rows of 46 units; rows 05 to 09 are employment. */
  ROW: 46,
  BOUNDARY: 230,
} as const;

/** Relative spread of a hill east to west, as a share of its time span. */
const EAST_SPREAD = 0.375;
const LANE_TOP = 36;
const LANE_BOTTOM = 212;
const SITE_TOP = 262;
const SITE_BOTTOM = 436;

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const;

export type Summit = {
  id: string;
  company: string;
  title: string;
  /** Months since year 0, the first month of the role. */
  start: number;
  /** First month after the role, or today's month for the current role. */
  end: number;
  current: boolean;
  /** Months in the role: the height of the hill. */
  h: number;
  x: number;
  p: number;
  /** East to west spread. */
  sx: number;
  /** Where the name is lettered: above the summit, or below it when a taller summit's name is in the way. */
  label: "above" | "below";
};

export type Site = {
  id: string;
  slug: string;
  name: string;
  year: number;
  status: ProjectStatus;
  featured: boolean;
  x: number;
  p: number;
  /** "22 02": year, then northing row. */
  ref: string;
};

export type Relief = {
  /** The first surveyed year: the west neat line. */
  from: number;
  /** The year after the last: the east neat line. */
  to: number;
  /** Today, in months since year 0. */
  today: number;
  /** Sheet units per year. */
  yearW: number;
  /** The coast: where today falls. */
  coast: number;
  summits: Summit[];
  sites: Site[];
  /** The most roles running at once, and the first month it happened. */
  peak: { count: number; month: number };
};

export const clamp = (v: number, a: number, b: number) =>
  Math.min(b, Math.max(a, v));

/** Sheet x for a month count. */
export const eastingOf = (relief: Pick<Relief, "from" | "yearW">, m: number) =>
  SHEET.X0 + (m / 12 - relief.from) * relief.yearW;

/** Months since year 0 at a sheet x. */
export const monthAt = (relief: Pick<Relief, "from" | "yearW">, x: number) =>
  ((x - SHEET.X0) / relief.yearW + relief.from) * 12;

/** Northing row 0 (south) to 9 (north). */
export const rowOf = (p: number) => clamp(9 - Math.floor(p / SHEET.ROW), 0, 9);

/** "24 03": the grid square a point falls in. */
export function gridRef(relief: Relief, x: number, p: number): string {
  const year = Math.floor(monthAt(relief, x) / 12);
  return `${String(year % 100).padStart(2, "0")} ${String(rowOf(p)).padStart(2, "0")}`;
}

/** Screen y on the sheet for a ground point at height `h`. */
export const screenY = (p: number, h = 0) =>
  SHEET.Y0 + SHEET.YS * p - SHEET.LIFT * h;

/**
 * Assigns each role a northing lane. Roles are placed in start order; each
 * takes the free lane farthest from every role it overlaps in time, so a
 * massif of concurrent roles spreads north to south instead of stacking.
 */
function assignLanes(roles: { start: number; end: number }[]): number[] {
  const n = roles.length;
  const lanes = Array.from({ length: n }, (_, i) =>
    n === 1
      ? (LANE_TOP + LANE_BOTTOM) / 2
      : LANE_TOP + ((LANE_BOTTOM - LANE_TOP) * i) / (n - 1)
  );
  const order = roles
    .map((role, i) => ({ ...role, i }))
    .sort((a, b) => a.start - b.start || b.end - a.end);
  const taken = new Map<number, number>();
  const placed: { start: number; end: number; p: number }[] = [];
  for (const role of order) {
    let best = -1;
    let bestScore = -Infinity;
    lanes.forEach((p, li) => {
      if ([...taken.values()].includes(li)) return;
      const overlapping = placed.filter(
        (o) => o.start < role.end && role.start < o.end
      );
      const score = overlapping.length
        ? Math.min(...overlapping.map((o) => Math.abs(o.p - p)))
        : 1000 - Math.abs(p - (LANE_TOP + LANE_BOTTOM) / 2);
      if (score > bestScore) {
        bestScore = score;
        best = li;
      }
    });
    taken.set(role.i, best);
    placed.push({ start: role.start, end: role.end, p: lanes[best] ?? 0 });
  }
  return roles.map((_, i) => lanes[taken.get(i) ?? 0] ?? 0);
}

/**
 * Lays out the sheet from the real data. `today` sets the coast; a current
 * role rises to today's month.
 */
export function buildRelief(
  experience: Experience[],
  projects: Project[],
  today: Date = new Date()
): Relief {
  const now = monthIndex(today);
  const starts = [
    ...experience.map((role) => Math.floor(monthIndex(role.startDate) / 12)),
    ...projects.map((project) => project.year),
  ];
  const from = starts.length ? Math.min(...starts) : today.getFullYear();
  const to = Math.floor(now / 12) + 1;
  const yearW = (SHEET.X1 - SHEET.X0) / Math.max(1, to - from);
  const frame = { from, yearW };

  const spans = experience.map((role) => {
    const start = monthIndex(role.startDate);
    const end = role.endDate ? monthIndex(role.endDate) : now;
    return { start, end: Math.max(end, start + 1) };
  });
  const lanes = assignLanes(spans);
  const summits: Summit[] = experience.map((role, i) => {
    const { start, end } = spans[i]!;
    return {
      id: role.id,
      company: role.company,
      title: role.title,
      start,
      end,
      current: !role.endDate,
      h: end - start,
      x: eastingOf(frame, (start + end) / 2),
      p: lanes[i]!,
      sx: ((end - start) / 12) * yearW * EAST_SPREAD,
      label: "above" as const,
    };
  });
  placeLabels(summits);

  const byYear = new Map<number, Project[]>();
  for (const project of [...projects].sort((a, b) =>
    a.name.localeCompare(b.name)
  )) {
    byYear.set(project.year, [...(byYear.get(project.year) ?? []), project]);
  }
  const sites: Site[] = [];
  for (const [year, group] of byYear) {
    group.forEach((project, i) => {
      const n = group.length;
      const x = eastingOf(frame, (year + (i + 0.5) / n) * 12);
      // Golden-ratio steps keep neighbours in a year far apart north to south.
      const p =
        SITE_TOP + (SITE_BOTTOM - SITE_TOP) * ((i * 0.618 + year * 0.31) % 1);
      sites.push({
        id: project.id,
        slug: project.slug,
        name: project.name,
        year,
        status: project.status,
        featured: project.featured,
        x,
        p,
        ref: `${String(year % 100).padStart(2, "0")} ${String(rowOf(p)).padStart(2, "0")}`,
      });
    });
  }
  sites.sort((a, b) => a.x - b.x);

  let peak = { count: 0, month: now };
  for (let m = from * 12; m <= now; m++) {
    const count = summits.filter((s) => s.start <= m && m < s.end).length;
    if (count > peak.count) peak = { count, month: m };
  }

  return {
    from,
    to,
    today: now,
    yearW,
    coast: clamp(eastingOf(frame, now + 1), SHEET.X0, SHEET.X1),
    summits,
    sites,
    peak,
  };
}

/** Screen box of a summit's name, lettered at about 10 units a character. */
export function labelBox(s: Summit) {
  const half = s.company.length * 5 + 4;
  const y = screenY(s.p, s.h) + (s.label === "above" ? -11 : 19);
  return { x0: s.x - half, x1: s.x + half, y0: y - 11, y1: y + 3 };
}

/** Screen box of a summit's dot and height figure. */
export function markBox(s: Summit) {
  const y = screenY(s.p, s.h);
  return { x0: s.x - 4, x1: s.x + 22, y0: y - 7, y1: y + 7 };
}

/** Letters the tallest summits first; a name that would touch one already placed goes below its summit. */
function placeLabels(summits: Summit[]) {
  const placed: ReturnType<typeof labelBox>[] = summits.map(markBox);
  const hits = (b: ReturnType<typeof labelBox>) =>
    placed.some(
      (o) => b.x0 < o.x1 && o.x0 < b.x1 && b.y0 < o.y1 && o.y0 < b.y1
    );
  for (const s of [...summits].sort((a, b) => b.h - a.h)) {
    if (hits(labelBox(s))) s.label = "below";
    placed.push(labelBox(s));
  }
}

type Hill = Pick<Summit, "x" | "p" | "sx" | "h">;

/** Ground height at a point: the highest hill there, in months. */
export function heightAt(hills: readonly Hill[], x: number, p: number) {
  let m = 0;
  for (const hill of hills) {
    const a = (x - hill.x) / hill.sx;
    const b = (p - hill.p) / SHEET.SPREAD;
    const v = hill.h * Math.exp(-(a * a + b * b) / 2);
    if (v > m) m = v;
  }
  return m;
}

/** "NOV 2024" for a month count. */
export const monthLabel = (m: number) =>
  `${MONTHS[((Math.floor(m) % 12) + 12) % 12]} ${Math.floor(m / 12)}`;

/** A month count as `YYYY-MM-01`, for the shared date formatters. */
export const isoMonth = (m: number) =>
  `${Math.floor(m / 12)}-${String((m % 12) + 1).padStart(2, "0")}-01`;

/** Roles running during month `m`. */
export const rolesRunning = (relief: Relief, m: number) =>
  relief.summits.filter((s) => s.start <= m && m < s.end);

/**
 * What the loupe reads at a point: the month and grid square, then how many
 * roles were running, or the site or summit under it.
 */
export function readout(relief: Relief, x: number, p: number) {
  const m = Math.floor(monthAt(relief, x));
  if (x >= relief.coast) {
    return {
      where: `BEYOND ${monthLabel(relief.today)}`,
      what: "Not yet surveyed",
    };
  }
  const where = `${monthLabel(m)} · GRID ${gridRef(relief, x, p)}`;
  const site = relief.sites.find(
    (s) => Math.hypot(s.x - x, (s.p - p) * SHEET.YS) < 14
  );
  if (site) return { where, what: site.name };
  const n = rolesRunning(relief, m).length;
  return {
    where,
    what: n ? `${n} role${n > 1 ? "s" : ""} running` : "Own work only",
  };
}

/** Loupe ring radii, in sheet units. */
export const LOUPE = { RX: 84, RY: 76 } as const;

/**
 * Where the loupe's two readout lines go, relative to the lens centre. On
 * wide screens they sit beside the lens, on the side with room. On narrow
 * screens they sit under it, or over it when under would run off the foot
 * of the sheet.
 */
export function readoutPlacement(x: number, p: number, narrow: boolean) {
  if (!narrow) {
    const right = x < SHEET.W * 0.72;
    return {
      x: right ? LOUPE.RX + 8 : -(LOUPE.RX + 8),
      anchor: right ? ("start" as const) : ("end" as const),
      lines: [-4, 14] as const,
    };
  }
  const below = [LOUPE.RY + 24, LOUPE.RY + 42] as const;
  const fits = screenY(p) + below[1] + 6 <= SHEET.H;
  return {
    x: 0,
    anchor: "middle" as const,
    lines: fits ? below : ([-(LOUPE.RY + 30), -(LOUPE.RY + 12)] as const),
  };
}

export type Ring = { points: [number, number][]; closed: boolean };

const STEP = 10;
const P_MIN = -80;
const P_MAX = 540;

/**
 * Contours of the relief at `level` months, traced with marching squares
 * into rings of [x, p] points. Rings that meet the sheet edge stay open.
 */
export function contour(hills: readonly Hill[], level: number): Ring[] {
  const cols = Math.ceil((SHEET.X1 - SHEET.X0) / STEP);
  const rows = Math.ceil((P_MAX - P_MIN) / STEP);
  const xs = (i: number) => SHEET.X0 + i * STEP;
  const ps = (j: number) => P_MIN + j * STEP;
  const v: number[][] = [];
  for (let j = 0; j <= rows; j++) {
    const row: number[] = [];
    for (let i = 0; i <= cols; i++) row.push(heightAt(hills, xs(i), ps(j)));
    v.push(row);
  }

  // Edge ids: horizontal edge (i, j) to (i+1, j) is "h i j"; vertical is "v i j".
  const at = (key: string): [number, number] => {
    const [kind, si, sj] = key.split(" ");
    const i = Number(si);
    const j = Number(sj);
    const a = v[j]![i]!;
    const b = kind === "h" ? v[j]![i + 1]! : v[j + 1]![i]!;
    const t = (level - a) / (b - a);
    return kind === "h" ? [xs(i) + STEP * t, ps(j)] : [xs(i), ps(j) + STEP * t];
  };

  const links = new Map<string, string[]>();
  const link = (a: string, b: string) => {
    links.set(a, [...(links.get(a) ?? []), b]);
    links.set(b, [...(links.get(b) ?? []), a]);
  };

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const tl = v[j]![i]! >= level;
      const tr = v[j]![i + 1]! >= level;
      const br = v[j + 1]![i + 1]! >= level;
      const bl = v[j + 1]![i]! >= level;
      const top = `h ${i} ${j}`;
      const bottom = `h ${i} ${j + 1}`;
      const left = `v ${i} ${j}`;
      const right = `v ${i + 1} ${j}`;
      const code = (tl ? 8 : 0) | (tr ? 4 : 0) | (br ? 2 : 0) | (bl ? 1 : 0);
      const mid =
        (v[j]![i]! + v[j]![i + 1]! + v[j + 1]![i + 1]! + v[j + 1]![i]!) / 4 >=
        level;
      switch (code) {
        case 1:
        case 14:
          link(left, bottom);
          break;
        case 2:
        case 13:
          link(bottom, right);
          break;
        case 3:
        case 12:
          link(left, right);
          break;
        case 4:
        case 11:
          link(top, right);
          break;
        case 6:
        case 9:
          link(top, bottom);
          break;
        case 7:
        case 8:
          link(left, top);
          break;
        case 5:
          if (mid) {
            link(left, top);
            link(bottom, right);
          } else {
            link(left, bottom);
            link(top, right);
          }
          break;
        case 10:
          if (mid) {
            link(left, bottom);
            link(top, right);
          } else {
            link(left, top);
            link(bottom, right);
          }
          break;
      }
    }
  }

  const rings: Ring[] = [];
  const seen = new Set<string>();
  const walk = (startKey: string) => {
    const keys = [startKey];
    seen.add(startKey);
    let current = startKey;
    for (;;) {
      const next = (links.get(current) ?? []).find((k) => !seen.has(k));
      if (!next) break;
      seen.add(next);
      keys.push(next);
      current = next;
    }
    return keys;
  };
  // Open chains start at an end (one link); then closed loops.
  for (const [key, ends] of links) {
    if (ends.length === 1 && !seen.has(key)) {
      rings.push({ points: walk(key).map(at), closed: false });
    }
  }
  for (const key of links.keys()) {
    if (!seen.has(key)) {
      rings.push({ points: walk(key).map(at), closed: true });
    }
  }
  return rings;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/** A ring as SVG path data on the sheet, at ground level (lift it with a transform). */
export function ringPath(rings: Ring[]): string {
  return rings
    .map(
      (ring) =>
        `M${ring.points.map(([x, p]) => `${r1(x)} ${r1(screenY(p))}`).join("L")}${ring.closed ? "Z" : ""}`
    )
    .join("");
}

/** The contour levels on this sheet, lowest first. */
export function levels(relief: Relief): number[] {
  const top = Math.max(0, ...relief.summits.map((s) => s.h));
  const out: number[] = [];
  for (let l = SHEET.INTERVAL; l < top; l += SHEET.INTERVAL) out.push(l);
  return out;
}

/** Heights along the east to west line through northing `p`, for a transect. */
export function profile(
  hills: readonly Hill[],
  p: number,
  x0: number,
  x1: number,
  samples = 96
): [number, number][] {
  return Array.from({ length: samples + 1 }, (_, i) => {
    const x = x0 + ((x1 - x0) * i) / samples;
    return [x, heightAt(hills, x, p)];
  });
}
