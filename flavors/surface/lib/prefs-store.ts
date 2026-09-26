"use client";

import {
  defaultPrefs,
  migratePrefs,
  PREFS_KEY,
} from "@/flavors/surface/lib/prefs";

import { createPrefsStore } from "@/lib/prefs/store";

/** This edition's preferences, bound to its own key and schema. */
export const { usePrefs, setPrefs, resetPrefs, subscribePrefs } =
  createPrefsStore({
    key: PREFS_KEY,
    defaults: defaultPrefs,
    migrate: migratePrefs,
  });
