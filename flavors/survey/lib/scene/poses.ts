import { places } from "@/flavors/survey/content";
import {
  clamp,
  eastingOf,
  gridRef,
  screenY,
  SHEET,
  type Prop,
  type Relief,
  type Site,
} from "@/flavors/survey/lib/relief";

import { labExperiments } from "@/content/lab";

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
  | "entry"
  | "lab"
  | "trial"
  | "resume"
  | "owner"
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

/** Field trials stand on their own lane, just south of the boundary. */
const TRIAL_LANE = SHEET.BOUNDARY + 16;

/**
 * Where each lab trial is staked: its year's column on the trial lane,
 * spread east to west within the year, and always on land.
 */
export function trialPoints(relief: Relief) {
  const byYear = new Map<number, string[]>();
  for (const trial of labExperiments) {
    byYear.set(trial.year, [...(byYear.get(trial.year) ?? []), trial.slug]);
  }
  return [...byYear].flatMap(([year, slugs]) =>
    slugs.map((slug, i) => ({
      slug,
      x: Math.min(
        eastingOf(relief, (year + (i + 0.5) / slugs.length) * 12),
        relief.coast - 12
      ),
      p: TRIAL_LANE,
    }))
  );
}

/**
 * A notebook entry's spot on the cairn at the current summit: numbered
 * entries walk round the summit by the golden angle, so each has its own.
 */
export function entryOffset(n: number) {
  const a = n * 2.39996;
  const r = 6 + (n % 4) * 3;
  return { dx: Math.cos(a) * r, dp: Math.sin(a) * r };
}

/** Base camp: on the own-work lowland, just short of the coast. */
const campOf = (relief: Relief) => ({
  x: relief.coast - 14,
  p: SHEET.BOUNDARY + 30,
});

/** Inset slots are 4:3. */
export const INSET_ASPECT = 4 / 3;

export type Pose = { window: SheetWindow; focus: Focus; label: string };

/**
 * Each page's grid square: projects look at the own-work lowland, work at
 * the massif, now at the coast, about at the first surveyed year, the
 * notebook and its entries at the current summit, trials on their lane,
 * the owner at base camp on the coast, and a missing page at the sea.
 * `target` is a site slug, role id, trial slug or entry number.
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
  const trials = trialPoints(relief).map(({ x, p }) => ({ x, p }));
  const trial = trialPoints(relief).find((t) => t.slug === target);

  const pick = (): { points: Focus[]; focus: Focus } => {
    switch (route) {
      case "projects":
        return { points: sites, focus: sites[0] ?? land };
      case "project":
        return {
          points: site ? neighbours(sites, site) : sites,
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
      case "entry": {
        const at = current ?? land;
        const { dx, dp } = entryOffset(Number(target) || 0);
        const focus = { x: at.x + dx, p: clamp(at.p + dp, 0, SHEET.P) };
        return { points: current ? [current] : [land], focus };
      }
      case "lab":
        // The lane either side of the stakes, so the trials read in context.
        return trials.length
          ? {
              points: trials.flatMap((t) => [
                { x: t.x - 90, p: t.p },
                { x: Math.min(t.x + 90, coast), p: t.p },
              ]),
              focus: trials[0] ?? land,
            }
          : {
              points: recent.length ? recent : [land],
              focus: recent[0] ?? land,
            };
      case "trial": {
        const at = trial ?? trials[0];
        return at
          ? { points: [at], focus: { x: at.x, p: at.p } }
          : { points: [land], focus: land };
      }
      case "owner": {
        const camp = campOf(relief);
        return {
          points: [camp, { x: coast - 110, p: SHEET.BOUNDARY - 20 }],
          focus: camp,
        };
      }
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
    route === "home"
      ? FULL_SHEET
      : route === "resume"
        ? fit(FULL_SHEET, INSET_ASPECT)
        : fit(frame(points), INSET_ASPECT);
  return { window, focus, label: gridRef(relief, focus.x, focus.p) };
}

/** A site with the sites either side of it, west to east. */
function neighbours(sites: readonly Site[], site: Site) {
  const i = sites.indexOf(site);
  return [sites[i - 1], site, sites[i + 1]].filter(
    (s): s is Site => s !== undefined
  );
}

/** What a page knows about the notebook: its size, and which entry it shows. */
export type Notebook = { count: number; entry?: number | undefined };

/** Most stones a cairn holds: one per entry, the newest on top. */
export const CAIRN_MAX = 24;

const CAIRN = [
  { n: 7, r: 5.5, lift: 0 },
  { n: 6, r: 4, lift: 2.6 },
  { n: 5, r: 2.8, lift: 5 },
  { n: 3, r: 1.6, lift: 7.2 },
  { n: 2, r: 0.8, lift: 9 },
  { n: 1, r: 0, lift: 10.6 },
] as const;

/** Stone `i` of a cairn: rings from the ground up, each ring turned a little. */
export function cairnStone(i: number) {
  let k = Math.max(0, Math.min(CAIRN_MAX - 1, i));
  for (const [level, ring] of CAIRN.entries()) {
    if (k < ring.n) {
      const a = ((k + level * 0.5) / ring.n) * Math.PI * 2;
      return {
        dx: Math.cos(a) * ring.r,
        dp: Math.sin(a) * ring.r,
        lift: ring.lift,
        size: 0.85 + ((i * 7) % 5) * 0.08,
      };
    }
    k -= ring.n;
  }
  return { dx: 0, dp: 0, lift: 0, size: 1 };
}

const PLACE_ROUTES: Record<string, SceneRoute> = {
  "/": "home",
  "/projects": "projects",
  "/work": "work",
  "/lab": "lab",
  "/about": "about",
  "/now": "now",
  "/ask": "ask",
  "/resume": "resume",
};

/**
 * What stands on a page's square: site markers on the gazetteer, this site
 * and its sight lines to the sites either side, the notebook's cairn (one
 * stone per entry, plus a spare the composer lifts), trial stakes, base
 * camp's tent, and at sea a buoy and a lighthouse that points back to land.
 */
export function propsFor(
  relief: Relief,
  route: SceneRoute,
  target?: string,
  notebook?: Notebook
): Prop[] {
  const { sites, summits, coast } = relief;
  const marker = (s: Site): Prop => ({
    kind:
      s.status === "archived"
        ? "antiquity"
        : s.status === "wip"
          ? "works"
          : "pillar",
    x: s.x,
    p: s.p,
    id: `site:${s.slug}`,
  });
  switch (route) {
    case "home": {
      // Surveyed today: the instrument stands at the coast, sighting the peak.
      const peak = summits.reduce<Relief["summits"][number] | undefined>(
        (top, s) => (!top || s.h > top.h ? s : top),
        undefined
      );
      return [
        {
          kind: "theodolite",
          ...THEODOLITE(relief),
          id: "place:/now",
          ...(peak && { to: [peak.x, peak.p] }),
        },
      ];
    }
    case "projects":
      return sites.map(marker);
    case "project": {
      const site = sites.find((s) => s.slug === target);
      if (!site) return [];
      const near = neighbours(sites, site).filter((s) => s !== site);
      // Sight lines first, so the flat twins draw the markers over them.
      return [
        ...near.map((s): Prop => ({
          kind: "ray",
          x: site.x,
          p: site.p,
          to: [s.x, s.p],
          id: `site:${s.slug}`,
        })),
        { ...marker(site), hot: true },
        ...near.map(marker),
      ];
    }
    case "ask":
    case "entry": {
      const summit = summits.find((s) => s.current) ?? summits[0];
      if (!summit) return [];
      const count = Math.min(CAIRN_MAX, notebook?.count ?? 0);
      const hot =
        route === "entry" && notebook?.entry
          ? (notebook.entry - 1) % Math.max(1, count)
          : -1;
      const stone = (i: number): Prop => {
        const { dx, dp, lift, size } = cairnStone(i);
        return {
          kind: "stone",
          x: summit.x + dx,
          p: summit.p + dp,
          lift,
          size,
          ...(i === hot && { hot: true, id: `stone:${i + 1}` }),
        };
      };
      const stones = Array.from({ length: count }, (_, i) => stone(i));
      if (route === "entry" || count >= CAIRN_MAX) return stones;
      return [...stones, { ...stone(count), id: "stone:spare" }];
    }
    case "lab":
    case "trial":
      return trialPoints(relief).map((t) => ({
        kind: "stake",
        x: t.x,
        p: t.p,
        id: `trial:${t.slug}`,
        ...(route === "trial" && t.slug === target && { hot: true }),
      }));
    case "owner":
      return [{ kind: "tent", ...campOf(relief) }];
    case "notfound": {
      const buoy = poseFor(relief, "notfound").focus;
      return [
        { kind: "buoy", x: buoy.x, p: buoy.p },
        { kind: "light", x: coast - 6, p: SHEET.BOUNDARY - 50 },
        ...places.map((place): Prop => {
          const { focus } = poseFor(relief, PLACE_ROUTES[place.href] ?? "home");
          return {
            kind: "aim",
            x: focus.x,
            p: focus.p,
            id: `place:${place.href}`,
          };
        }),
      ];
    }
    default:
      return [];
  }
}

/** Where home's theodolite stands: at the coast, on the boundary. */
export const THEODOLITE = (relief: Relief) => ({
  x: relief.coast - 16,
  p: SHEET.BOUNDARY,
});

/** The relief with this page's props on it, for its inset and poster. */
export function withProps(
  relief: Relief,
  route: SceneRoute,
  target?: string,
  notebook?: Notebook
): Relief {
  return { ...relief, props: propsFor(relief, route, target, notebook) };
}

/** What the scene needs from a page, carried on the slot's `data-scene-board`. */
export type Board = {
  from: number;
  yearW: number;
  coast: number;
  /** Hills: x, p, sx, h, current (1 or 0). */
  hills: [number, number, number, number, number][];
  /** Each hill's role id, in the same order. */
  ids: string[];
  window: SheetWindow;
  focus: Focus;
  /** `data-scene-item` ids the loupe can visit, with their ground points. */
  points: Record<string, [number, number]>;
  props: Prop[];
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
    ids: relief.summits.map((s) => s.id),
    window: {
      cx: r(pose.window.cx),
      cy: r(pose.window.cy),
      w: r(pose.window.w),
      h: r(pose.window.h),
    },
    focus: { x: r(pose.focus.x), p: r(pose.focus.p) },
    points: Object.fromEntries([
      ...(relief.props ?? []).flatMap((prop): [string, [number, number]][] =>
        prop.id ? [[prop.id, [r(prop.x), r(prop.p)]]] : []
      ),
      ...relief.summits.map((s): [string, [number, number]] => [
        `role:${s.id}`,
        [r(s.x), r(s.p)],
      ]),
      ...relief.sites.map((s): [string, [number, number]] => [
        `site:${s.slug}`,
        [r(s.x), r(s.p)],
      ]),
    ]),
    props: (relief.props ?? []).map((prop) => ({
      ...prop,
      x: r(prop.x),
      p: r(prop.p),
      ...(prop.to && { to: [r(prop.to[0]), r(prop.to[1])] }),
    })),
  };
  return JSON.stringify(board);
}

export function decodeBoard(value: string | null): Board | null {
  if (!value) return null;
  try {
    const board = JSON.parse(value) as Board;
    if (!Array.isArray(board.hills) || !board.window) return null;
    return {
      ...board,
      ids: Array.isArray(board.ids) ? board.ids : [],
      props: Array.isArray(board.props) ? board.props : [],
    };
  } catch {
    return null;
  }
}
