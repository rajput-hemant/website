import {
  eastingOf,
  gridRef,
  screenY,
  SHEET,
  type Relief,
} from "@/flavors/survey/lib/relief";

/**
 * Where the camera looks on each page: a window on the sheet, in sheet
 * units. No three.js here, so the poster and the page can read the same
 * numbers the scene uses. The scene flies between windows as you navigate.
 */
export type SceneRoute =
  | "home"
  | "projects"
  | "project"
  | "work"
  | "about"
  | "now"
  | "ask"
  | "lab"
  | "resume"
  | "notfound";

/** Centre and size on the sheet's screen plane. */
export type SheetWindow = { cx: number; cy: number; w: number; h: number };

/** A point of interest: where the loupe rests, in sheet ground units. */
export type Focus = { x: number; p: number };

export const FULL_SHEET: SheetWindow = {
  cx: SHEET.W / 2,
  cy: SHEET.H / 2,
  w: SHEET.W,
  h: SHEET.H,
};

const PAD = 34;

/** The window that holds these ground points (at their heights) with a margin. */
export function frame(points: { x: number; p: number; h?: number }[]) {
  if (points.length === 0) return FULL_SHEET;
  const xs = points.map((pt) => pt.x);
  const ys = points.flatMap((pt) => [screenY(pt.p, pt.h ?? 0), screenY(pt.p)]);
  const x0 = Math.min(...xs) - PAD;
  const x1 = Math.max(...xs) + PAD;
  const y0 = Math.min(...ys) - PAD;
  const y1 = Math.max(...ys) + PAD;
  return {
    cx: (x0 + x1) / 2,
    cy: (y0 + y1) / 2,
    w: Math.max(160, x1 - x0),
    h: Math.max(110, y1 - y0),
  };
}

/**
 * Grows a window to fill `aspect` (width over height) without cropping it,
 * then slides it back onto the sheet so it never shows empty ground.
 */
export function fit(win: SheetWindow, aspect: number): SheetWindow {
  const w = Math.max(win.w, win.h * aspect);
  const h = w / aspect;
  const keep = (c: number, size: number, span: number) =>
    size >= span ? span / 2 : Math.min(span - size / 2, Math.max(size / 2, c));
  return { cx: keep(win.cx, w, SHEET.W), cy: keep(win.cy, h, SHEET.H), w, h };
}

/** Inset slots are 4:3. */
export const INSET_ASPECT = 4 / 3;

export type Pose = { window: SheetWindow; focus: Focus; label: string };

/**
 * Each page's grid square: projects look at the own-work lowland, work at
 * the massif, now at the coast, about at the first surveyed year, and a
 * missing page at the unsurveyed sea.
 */
export function poseFor(
  relief: Relief,
  route: SceneRoute,
  target?: string
): Pose {
  const { summits, sites, coast } = relief;
  const current = summits.find((s) => s.current) ?? summits[0];
  const site = sites.find((s) => s.slug === target);
  const summit = summits.find((s) => s.id === target);
  const first = sites.filter((s) => s.year === relief.from);
  const lastYear = Math.max(relief.from, ...sites.map((s) => s.year));
  const recent = sites.filter((s) => s.year === lastYear);
  const land = { x: coast - 40, p: 150 };

  const pick = (): { points: Focus[]; focus: Focus } => {
    switch (route) {
      case "projects":
        return { points: sites, focus: sites[0] ?? land };
      case "project":
        return {
          points: site ? [site] : sites,
          focus: site ?? sites[0] ?? land,
        };
      case "work":
        return {
          points: summits.map((s) => ({ ...s, h: s.h })),
          focus: summit ?? current ?? land,
        };
      case "about":
        return {
          points: first.length ? first : sites.slice(0, 2),
          focus: first[0] ?? sites[0] ?? land,
        };
      case "now":
        return {
          points: [
            { x: coast - 70, p: 120 },
            { x: coast + 20, p: 200 },
          ],
          focus: current ?? land,
        };
      case "ask":
        return {
          points: current ? [current] : [land],
          focus: current ?? land,
        };
      case "lab":
        return {
          points: recent.length ? recent : [land],
          focus: recent[0] ?? land,
        };
      case "notfound":
        return {
          points: [
            { x: coast + 10, p: 60 },
            { x: SHEET.X1 + 10, p: 380 },
          ],
          focus: { x: (coast + SHEET.X1) / 2, p: 230 },
        };
      default:
        return {
          points: [],
          focus: { x: eastingOf(relief, relief.peak.month), p: 150 },
        };
    }
  };

  const { points, focus } = pick();
  const window =
    route === "home" || route === "resume"
      ? FULL_SHEET
      : fit(frame(points), INSET_ASPECT);
  return { window, focus, label: gridRef(relief, focus.x, focus.p) };
}

/** What the scene needs from a page, carried on the slot's `data-scene-board`. */
export type Board = {
  from: number;
  yearW: number;
  coast: number;
  /** Hills: x, p, sx, h, current (1 or 0). */
  hills: [number, number, number, number, number][];
  window: SheetWindow;
  focus: Focus;
  /** `data-scene-item` ids the loupe can visit, with their ground points. */
  points: Record<string, [number, number]>;
};

const r = (n: number) => Math.round(n * 10) / 10;

export function encodeBoard(relief: Relief, pose: Pose): string {
  const board: Board = {
    from: relief.from,
    yearW: r(relief.yearW),
    coast: r(relief.coast),
    hills: relief.summits.map((s) => [
      r(s.x),
      r(s.p),
      r(s.sx),
      s.h,
      s.current ? 1 : 0,
    ]),
    window: {
      cx: r(pose.window.cx),
      cy: r(pose.window.cy),
      w: r(pose.window.w),
      h: r(pose.window.h),
    },
    focus: { x: r(pose.focus.x), p: r(pose.focus.p) },
    points: Object.fromEntries([
      ...relief.summits.map((s) => [`role:${s.id}`, [r(s.x), r(s.p)]]),
      ...relief.sites.map((s) => [`site:${s.slug}`, [r(s.x), r(s.p)]]),
    ]),
  };
  return JSON.stringify(board);
}

export function decodeBoard(value: string | null): Board | null {
  if (!value) return null;
  try {
    const board = JSON.parse(value) as Board;
    return Array.isArray(board.hills) && board.window ? board : null;
  } catch {
    return null;
  }
}
