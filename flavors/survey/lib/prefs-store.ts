"use client";

import {
  defaultPrefs,
  migratePrefs,
  PREFS_KEY,
} from "@/flavors/survey/lib/prefs";

import { createPrefsStore } from "@/lib/prefs/store";

export const { usePrefs, setPrefs, resetPrefs, subscribePrefs } =
  createPrefsStore({
    key: PREFS_KEY,
    defaults: defaultPrefs,
    migrate: migratePrefs,
  });
