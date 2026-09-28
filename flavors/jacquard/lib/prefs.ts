import {
  applyStandardPrefs,
  migrateStandardPrefs,
  STANDARD_PREFS_VERSION,
  standardDefaults,
  standardPrefsScript,
  type StandardPrefs,
} from "@/lib/prefs/standard";

export type { SceneLevel, Theme } from "@/lib/prefs/standard";
export type Prefs = StandardPrefs;

// Own key: every edition stores its own preferences.
export const PREFS_KEY = "hr.jq.prefs";

export const PREFS_VERSION = STANDARD_PREFS_VERSION;

export const defaultPrefs: Prefs = standardDefaults;

export const migratePrefs = (stored: unknown): Prefs =>
  migrateStandardPrefs(stored, defaultPrefs);

export const applyPrefs = applyStandardPrefs;

/** Source of the render-blocking <head> script. */
export const prefsScript = standardPrefsScript(PREFS_KEY);
