import {
  applyStandardPrefs,
  migrateStandardPrefs,
  standardDefaults,
  standardPrefsScript,
  type StandardPrefs,
} from "@/lib/prefs/standard";

export type { SceneLevel, Theme } from "@/lib/prefs/standard";

/** Own key: every edition keeps its own shape. */
export const PREFS_KEY = "hr.sv.prefs";

export type Prefs = StandardPrefs;
export const defaultPrefs = standardDefaults;
export const migratePrefs = (stored: unknown) =>
  migrateStandardPrefs(stored, defaultPrefs);
export const applyPrefs = applyStandardPrefs;
export const prefsScript = standardPrefsScript(PREFS_KEY);
