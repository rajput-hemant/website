import {
  applyStandardPrefs,
  migrateStandardPrefs,
  standardDefaults,
  standardPrefsScript,
  type StandardPrefs,
} from "@/lib/prefs/standard";

export type { SceneLevel, Theme } from "@/lib/prefs/standard";
export type Prefs = StandardPrefs;

// Own key: every edition stores its own preferences.
export const PREFS_KEY = "hr.pp.prefs";

export const defaultPrefs: Prefs = standardDefaults;

export const migratePrefs = (stored: unknown): Prefs =>
  migrateStandardPrefs(stored, defaultPrefs);

export const applyPrefs = applyStandardPrefs;

/** Source of the render-blocking <head> script. */
export const prefsScript = standardPrefsScript(PREFS_KEY);
