import {
  defaultPrefs as drawingSetPrefs,
  PREFS_KEY as drawingSetKey,
} from "@/flavors/drawing-set/lib/prefs";
import {
  defaultPrefs as minimalPrefs,
  PREFS_KEY as minimalKey,
} from "@/flavors/minimal/lib/prefs";
import {
  defaultPrefs as pressPrefs,
  PREFS_KEY as pressKey,
} from "@/flavors/press/lib/prefs";
import { type LiveFlavorId } from "@/flavors/registry";
import {
  defaultPrefs as surveyPrefs,
  PREFS_KEY as surveyKey,
} from "@/flavors/survey/lib/prefs";
import {
  defaultPrefs as surfacePrefs,
  PREFS_KEY as surfaceKey,
} from "@/flavors/surface/lib/prefs";
import {
  defaultPrefs as timetablePrefs,
  PREFS_KEY as timetableKey,
} from "@/flavors/timetable/lib/prefs";

export const VIEWPORTS = [
  { width: 390, height: 844, label: "390" },
  { width: 1440, height: 900, label: "1440" },
] as const;

export type VisualVariant = "light" | "dark" | "reduced-motion";

export const VISUAL_VARIANTS: VisualVariant[] = [
  "light",
  "dark",
  "reduced-motion",
];

type EditionPrefs = {
  storageKey: string;
  defaults: Record<string, unknown>;
};

export const editionPrefs: Record<LiveFlavorId, EditionPrefs> = {
  minimal: { storageKey: minimalKey, defaults: minimalPrefs },
  "drawing-set": { storageKey: drawingSetKey, defaults: drawingSetPrefs },
  surface: { storageKey: surfaceKey, defaults: surfacePrefs },
  timetable: { storageKey: timetableKey, defaults: timetablePrefs },
  survey: { storageKey: surveyKey, defaults: surveyPrefs },
  press: { storageKey: pressKey, defaults: pressPrefs },
};

export function prefsForVariant(
  flavor: LiveFlavorId,
  variant: VisualVariant
): Record<string, unknown> {
  const { defaults } = editionPrefs[flavor];
  if (variant === "light") {
    return { ...defaults, theme: "light", motion: true };
  }
  if (variant === "dark") {
    return { ...defaults, theme: "dark", motion: true };
  }
  return { ...defaults, theme: "light", motion: false };
}
