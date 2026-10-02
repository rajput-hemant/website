/**
 * Minimal's in-page 3D glyphs (docs/minimal.md, "3D"): small ink-on-paper
 * objects drawn on the shared viewport canvas beside the text they belong
 * to. No three.js here, so server components and tests can use it.
 *
 * Every page has one lead glyph, the slot the session canvas is lent to
 * (view 0), and up to three more placeholders (`data-scene-view`), which
 * keeps each page inside the shared four-view budget.
 */

/** What a glyph draws. The lead's kind is its slot's `data-glyph`. */
export type GlyphKind =
  | "clock"
  | "cards"
  | "tenure"
  | "beads"
  | "folder"
  | "fan"
  | "pad"
  | "tabs"
  | "spines"
  | "roll"
  | "plane"
  | "envelopes"
  | "letter"
  | "thread"
  | "sheet"
  | "clip"
  | "padlock"
  | "keytag"
  | "crumple"
  | "dogear"
  | "fieldlite";

/**
 * Placeholder ids (`data-scene-view`) and the kind each draws. Ids are
 * unique per page, so a view can find its own element; a kind can appear
 * under several ids (the two project groups, the first changelog years).
 */
export const glyphViews = {
  "cards-home": "cards",
  "cards-featured": "cards",
  "cards-more": "cards",
  beads: "beads",
  "folder-skills": "folder",
  "folder-education": "folder",
  tabs: "tabs",
  spines: "spines",
  "roll-1": "roll",
  "roll-2": "roll",
  envelopes: "envelopes",
  thread: "thread",
  clip: "clip",
  keytag: "keytag",
  dogear: "dogear",
} as const satisfies Record<string, GlyphKind>;

export type GlyphViewId = keyof typeof glyphViews;

/** Each route's lead and placeholders, for the budget test and the docs. */
export const pageGlyphs: Readonly<
  Record<string, { lead: GlyphKind; views: readonly GlyphViewId[] }>
> = {
  "/": { lead: "clock", views: ["cards-home"] },
  "/work": {
    lead: "tenure",
    views: ["beads", "folder-skills", "folder-education"],
  },
  "/projects": { lead: "fan", views: ["cards-featured", "cards-more"] },
  "/now": { lead: "pad", views: ["tabs"] },
  "/changelog": { lead: "roll", views: ["spines", "roll-1", "roll-2"] },
  "/ask": { lead: "plane", views: ["envelopes"] },
  "/ask/page/[page]": { lead: "envelopes", views: [] },
  "/ask/[slug]": { lead: "letter", views: ["thread"] },
  "/resume": { lead: "sheet", views: ["clip"] },
  "/owner": { lead: "padlock", views: ["keytag"] },
  "/404": { lead: "crumple", views: ["dogear"] },
  "/lab": { lead: "fieldlite", views: [] },
};

/** How many changelog years get a live roll: the lead plus `roll-1..2`. */
export const LIVE_ROLLS = 3;

/** The changelog roll id for the year at `index` (0 is the lead). */
export function rollView(index: number): GlyphViewId | "lead" | null {
  if (index === 0) return "lead";
  if (index >= LIVE_ROLLS) return null;
  return index === 1 ? "roll-1" : "roll-2";
}

/**
 * `window` event the owner sign-in fires for the padlock: `open` on a
 * sign-in, `shake` on a wrong passphrase.
 */
export const OWNER_EVENT = "minimal:owner";
export type OwnerEventDetail = "open" | "shake";

/** Months a role ran, counting both ends, from month indexes. */
export function tenureMonths(start: number, end: number): number {
  return Math.max(1, end - start + 1);
}

/**
 * Sheets in the /now tear-off pad: a fresh page is a thick pad, and it thins
 * a sheet a fortnight or so down to two.
 */
export function padSheets(ageDays: number): number {
  const fresh = 8;
  const stale = 2;
  if (!(ageDays > 0)) return fresh;
  return Math.max(stale, fresh - Math.floor(ageDays / 14));
}

/** Whether the /now page is fresh enough to tear a sheet off on arrival. */
export const PEEL_WITHIN_DAYS = 7;
