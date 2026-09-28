/**
 * The press's route states. No three.js here, so the poster and the loader
 * read the same numbers the scene uses.
 */
export type SceneRoute =
  | "home"
  | "projects"
  | "project"
  | "work"
  | "lab"
  | "about"
  | "now"
  | "ask"
  | "resume"
  | "notfound";

export type Pose = {
  /** Printed large on the sheet, in two plates. */
  glyph: string;
  /** The sheet's slug line. */
  slug: string;
  /** Turn of the whole press, radians. */
  yaw: number;
  /** How far the resting corner is peeled, 0..1. */
  peel: number;
  /** Peeling the corner all the way turns to this sheet. */
  next: string;
  /** A spoiled sheet prints far out of register. */
  spoiled?: boolean;
  /** Reading the page's `[data-scene-section]` feeds the sheet off the press. */
  reads?: boolean;
};

export const poses: Record<SceneRoute, Pose> = {
  home: {
    next: "/projects",
    // The owner's initials: `posesFor` sets them in.
    glyph: "",
    slug: "SHEET 1 OF 8  /  HOME",
    yaw: 0,
    peel: 0.28,
  },
  projects: {
    next: "/work",
    glyph: "02",
    slug: "SHEET 2 OF 8  /  SIGNATURES",
    yaw: -0.06,
    peel: 0.22,
  },
  project: {
    next: "/projects",
    glyph: "SIG",
    slug: "SHEET 2 OF 8  /  PROGRESSIVE PROOF",
    yaw: 0.05,
    peel: 0.3,
  },
  work: {
    next: "/lab",
    glyph: "03",
    slug: "SHEET 3 OF 8  /  PRESS LOG",
    yaw: 0.07,
    peel: 0.2,
  },
  lab: {
    next: "/about",
    glyph: "04",
    slug: "SHEET 4 OF 8  /  TEST SHEETS",
    yaw: -0.08,
    peel: 0.34,
  },
  about: {
    next: "/now",
    glyph: "05",
    slug: "SHEET 5 OF 8  /  COLOPHON",
    yaw: 0.04,
    peel: 0.24,
  },
  now: {
    next: "/ask",
    glyph: "06",
    slug: "SHEET 6 OF 8  /  LATEST PROOF",
    yaw: -0.04,
    peel: 0.26,
    reads: true,
  },
  ask: {
    next: "/resume",
    glyph: "07",
    slug: "SHEET 7 OF 8  /  CORRECTIONS",
    yaw: 0.06,
    peel: 0.3,
  },
  resume: {
    next: "/",
    glyph: "08",
    slug: "SHEET 8 OF 8  /  FINAL PRINT",
    yaw: -0.03,
    peel: 0.18,
  },
  notfound: {
    next: "/",
    glyph: "404",
    slug: "SPOILED SHEET  /  NOT IN THE SET",
    yaw: -0.1,
    peel: 0.46,
    spoiled: true,
  },
};

/** The poses with the owner's initials (`getSiteIdentity().initials`) set on the home sheet. */
export function posesFor(initials: string): Record<SceneRoute, Pose> {
  return { ...poses, home: { ...poses.home, glyph: initials } };
}

/** The shared store holds any edition's route; this narrows it to ours. */
export const asSceneRoute = (route: string): SceneRoute =>
  route in poses ? (route as SceneRoute) : "home";

/**
 * What the sheet prints: the glyph and slug, and the rule bars beside the
 * glyph as lengths, 0..1, in six slots down the sheet (0 leaves a slot blank).
 */
export type PrintContent = {
  glyph: string;
  slug: string;
  bars: readonly number[];
};

/** The resting rules: a column of body text, one blank line in. */
const BODY: readonly number[] = [1, 1, 0.9, 0, 0.7, 0.57];
const SLOTS = BODY.length;

/** A count as a tally of full bars, capped at the six slots. */
const tally = (n: number) =>
  Array.from({ length: SLOTS }, (_, i) => (i < n ? 1 : 0));

const pad2 = (n: number) => String(n).padStart(2, "0");
const upper = (text: string) =>
  text.length > 28
    ? `${text.slice(0, 27).trimEnd().toUpperCase()}.`
    : text.toUpperCase();

/** The item facts the print reads: the page's `data-scene-label` and `-weight`. */
export type PrintItem = { id: string; label: string | null; weight: number };

/**
 * The print for the page's pose, or for the item a visitor points at: the
 * sheet shows what that item is. A signature prints its initial, a run its
 * number (and the number again as bars), a group of inks its initial and
 * how many it holds, a current item and a query their numbers. Anything
 * else, the headline included, prints the page's own sheet.
 */
export function printFor(
  pose: Pose,
  hovered: string | null,
  items: readonly PrintItem[]
): PrintContent {
  const own = { glyph: pose.glyph, slug: pose.slug, bars: BODY };
  if (!hovered || pose.spoiled) return own;
  const split = hovered.indexOf(":");
  if (split < 0) return own;
  const kind = hovered.slice(0, split);
  const key = hovered.slice(split + 1);
  const item = items.find((it) => it.id === hovered);
  const label = item?.label?.trim() || null;
  const initial = (label ?? key).charAt(0).toUpperCase();
  switch (kind) {
    case "project":
      return initial
        ? {
            glyph: initial,
            slug: `SIGNATURE  /  ${upper(label ?? key)}`,
            bars: BODY,
          }
        : own;
    case "run": {
      const run = Math.max(1, Math.round(item?.weight ?? 1));
      return {
        glyph: pad2(run),
        slug: `RUN ${pad2(run)}  /  ${upper(label ?? key)}`,
        bars: tally(run),
      };
    }
    case "skills": {
      if (!initial) return own;
      const inks = Math.max(1, Math.round(item?.weight ?? 1));
      return {
        glyph: initial,
        slug: `INKS ON HAND  /  ${upper(label ?? key)}`,
        bars: tally(inks),
      };
    }
    case "now": {
      const n = Number(key);
      if (!Number.isInteger(n)) return own;
      return {
        glyph: pad2(n + 1),
        slug: `ON PRESS NOW  /  ${pad2(n + 1)}`,
        bars: BODY,
      };
    }
    case "query": {
      const number = label?.match(/\d+/)?.[0];
      return number
        ? {
            glyph: number,
            slug: `CORRECTIONS  /  ${upper(label ?? key)}`,
            bars: BODY,
          }
        : own;
    }
    default:
      return own;
  }
}

/** Whether two prints put the same ink down, so the canvas redraws only on a change. */
export const samePrint = (a: PrintContent, b: PrintContent) =>
  a.glyph === b.glyph &&
  a.slug === b.slug &&
  a.bars.length === b.bars.length &&
  a.bars.every((bar, i) => bar === b.bars[i]);
