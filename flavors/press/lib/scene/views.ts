/**
 * The press's tracked views (docs/flavors/press.md, "3D"): every
 * `[data-scene-view]` placeholder a page can carry, by id, and the facts
 * each one reads from its `data-view` attribute. No three.js here, so pages
 * and posters import it without the scene chunk.
 */
export const VIEW = {
  loupe: "press-loupe",
  stamp: "press-stamp",
  signatures: "press-signatures",
  pad: "press-pad",
  roller: "press-roller",
  pile: "press-pile",
  fountain: "press-fountain",
  years: "press-years",
  plates: "press-plates",
  pins: "press-pins",
  tins: "press-tins",
  books: "press-books",
  guillotine: "press-guillotine",
  fold: "press-fold",
  tray: "press-tray",
  flags: "press-flags",
  correction: "press-correction",
  threadLoupe: "press-thread-loupe",
  rack: "press-rack",
  colourBar: "press-colour-bar",
  lever: "press-lever",
  accentRoller: "press-accent-roller",
  chase: "press-chase",
  target: "press-target",
  ball: "press-ball",
  targets: "press-targets",
} as const;

/** One stamp pad per status group on /projects; past the page's view cap they keep posters. */
export const PAD_VIEWS = 4;
export const padView = (i: number) => `${VIEW.pad}-${i}` as const;

export type ViewId =
  (typeof VIEW)[keyof typeof VIEW] | ReturnType<typeof padView>;

/** What each view reads from its placeholder's `data-view` JSON. */
export type ViewData = {
  "press-signatures": { sigs: { id: string; solid: boolean }[] };
  "press-pad": { status: string; struck: boolean };
  "press-roller": {
    runs: { id: string; start: number; length: number; current: boolean }[];
  };
  "press-pile": { runs: { id: string; share: number }[] };
  "press-fountain": { items: number };
  "press-years": { years: number };
  "press-tins": { groups: { id: string; plate: "p1" | "p2" }[] };
  "press-books": { count: number };
  "press-flags": { answered: boolean[] };
  "press-correction": { answered: boolean };
  "press-rack": { tests: number };
};

/** The `data-view` attribute for a placeholder's facts. */
export const viewData = <K extends keyof ViewData>(data: ViewData[K]) =>
  JSON.stringify(data);

/** Scene items the views answer to, beyond the press's own (`poses.ts`). */
export const ITEM = {
  /** A separations row on the home page: `plate:p1`, `p2`, `both`, `p3`. */
  plate: "plate",
  /** An education entry on /about, by index. */
  edu: "edu",
  /** The resume's print button. */
  print: "print",
  /** One of the sender's queries awaiting approval. */
  pending: "pending",
  /** A test sheet on /lab, by index. */
  test: "test",
  /** A sheet link on the 404, by index. */
  sheet: "sheet",
} as const;

/** DOM events the page sends the views (names on `window`). */
export const VIEW_EVENT = {
  /** The resume's print button was pressed; the print dialog follows. */
  print: "press:print",
  /** Something on the 404 went in the bin: the spoiled press prints again. */
  feed: "press:feed",
} as const;
