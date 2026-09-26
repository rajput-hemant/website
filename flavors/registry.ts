/**
 * Every edition of the portfolio. `live` flavors have a route tree under
 * `app/f/<id>`; `future` ones are designed (docs/mocks) but not built yet, and
 * the picker shows them as coming later. The proxy only routes to live ones.
 */
export type FlavorStatus = "live" | "future";

export type FlavorMeta = {
  name: string;
  tagline: string;
  status: FlavorStatus;
  /** Ground, ink and accent, for the picker's specimen card. */
  swatch: { ground: string; ink: string; accent: string };
};

export const flavors = {
  minimal: {
    name: "Minimal",
    tagline: "Quiet, editorial pages that put the work first.",
    status: "live",
    swatch: { ground: "#f8f5ef", ink: "#2b2622", accent: "#b4562c" },
  },
  "drawing-set": {
    name: "Drawing Set",
    tagline:
      "The portfolio as an engineering drawing set, with a 3D plan chest.",
    status: "live",
    swatch: { ground: "#0e2542", ink: "#dce8f0", accent: "#f0664a" },
  },
  surface: {
    name: "Control Surface",
    tagline: "A precision instrument faceplate where every control is real.",
    status: "live",
    swatch: { ground: "#d5d2ca", ink: "#1a1a18", accent: "#f2b705" },
  },
  timetable: {
    name: "Timetable",
    tagline: "Six overlapping roles drawn as a transit network.",
    status: "live",
    swatch: { ground: "#f3f5f6", ink: "#14191e", accent: "#ffc20e" },
  },
  survey: {
    name: "Field Survey",
    tagline: "A survey sheet mapping the shape of the career.",
    status: "future",
    swatch: { ground: "#dfe6dd", ink: "#1c2a2b", accent: "#9a5b2a" },
  },
  press: {
    name: "Press Proof",
    tagline: "The proof you check before the run, in two plates.",
    status: "future",
    swatch: { ground: "#e7e8e4", ink: "#2a4690", accent: "#ff48b0" },
  },
  darkroom: {
    name: "Darkroom",
    tagline: "A contact sheet of fourteen frames under the safelight.",
    status: "future",
    swatch: { ground: "#120605", ink: "#f3d6c2", accent: "#ffb26b" },
  },
  jacquard: {
    name: "Jacquard",
    tagline: "Projects woven across a warp of technologies.",
    status: "future",
    swatch: { ground: "#d7d8d3", ink: "#1e2125", accent: "#9b2d3b" },
  },
  maquette: {
    name: "Maquette",
    tagline: "A study model on a plinth, lit by a real sun path.",
    status: "future",
    swatch: { ground: "#efefeb", ink: "#202326", accent: "#76552a" },
  },
  mission: {
    name: "Flight Plan",
    tagline: "The career as a mission, plotted as transfer arcs.",
    status: "future",
    swatch: { ground: "#f4f5f3", ink: "#121417", accent: "#d2291d" },
  },
  calibre: {
    name: "Calibre",
    tagline: "One watch movement where every figure is true.",
    status: "future",
    swatch: { ground: "#e9c2ae", ink: "#221c1a", accent: "#1c3491" },
  },
} as const satisfies Record<string, FlavorMeta>;

export type FlavorId = keyof typeof flavors;

export const DEFAULT_FLAVOR = "minimal" satisfies FlavorId;

export const FLAVOR_COOKIE = "hr_flavor";

export type LiveFlavorId = {
  [K in FlavorId]: (typeof flavors)[K]["status"] extends "live" ? K : never;
}[FlavorId];

export const liveFlavors = (Object.keys(flavors) as FlavorId[]).filter(
  (id): id is LiveFlavorId => flavors[id].status === "live"
);

export function isLiveFlavor(value: unknown): value is LiveFlavorId {
  return (
    typeof value === "string" &&
    (liveFlavors as readonly string[]).includes(value)
  );
}
