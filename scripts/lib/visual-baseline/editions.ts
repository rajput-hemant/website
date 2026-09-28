import {
  PREFS_KEY as drawingSetKey,
  defaultPrefs as drawingSetPrefs,
} from "@/flavors/drawing-set/lib/prefs";
import {
  PREFS_KEY as jacquardKey,
  defaultPrefs as jacquardPrefs,
} from "@/flavors/jacquard/lib/prefs";
import {
  PREFS_KEY as minimalKey,
  defaultPrefs as minimalPrefs,
} from "@/flavors/minimal/lib/prefs";
import {
  PREFS_KEY as pressKey,
  defaultPrefs as pressPrefs,
} from "@/flavors/press/lib/prefs";
import type { LiveFlavorId } from "@/flavors/registry";
import {
  PREFS_KEY as surfaceKey,
  defaultPrefs as surfacePrefs,
} from "@/flavors/surface/lib/prefs";
import {
  PREFS_KEY as surveyKey,
  defaultPrefs as surveyPrefs,
} from "@/flavors/survey/lib/prefs";
import {
  PREFS_KEY as timetableKey,
  defaultPrefs as timetablePrefs,
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
  jacquard: { storageKey: jacquardKey, defaults: jacquardPrefs },
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
