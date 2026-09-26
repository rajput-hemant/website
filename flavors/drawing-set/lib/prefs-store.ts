"use client";

import * as React from "react";
import {
  defaultPrefs,
  migratePrefs,
  PREFS_KEY,
  type Prefs,
} from "@/flavors/drawing-set/lib/prefs";

type Listener = () => void;

const listeners = new Set<Listener>();
let cached: Prefs | null = null;

function read(): Prefs {
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    return raw ? migratePrefs(JSON.parse(raw)) : defaultPrefs;
  } catch {
    return defaultPrefs;
  }
}

function emit() {
  for (const listener of listeners) listener();
}

function getSnapshot(): Prefs {
  cached ??= read();
  return cached;
}

function getServerSnapshot(): Prefs {
  return defaultPrefs;
}

/** `key === null` means another tab cleared storage entirely. */
function onStorage(event: StorageEvent) {
  if (event.key !== PREFS_KEY && event.key !== null) return;
  cached = read();
  emit();
}

function subscribe(listener: Listener) {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function write(next: Prefs) {
  cached = next;
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  } catch {
    // Storage can be unavailable (private mode, quota); preferences then last for the session.
  }
  emit();
}

/** Current visitor preferences. Returns defaults during SSR and hydration. */
export function usePrefs(): Prefs {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function setPrefs(patch: Partial<Prefs>) {
  write({ ...getSnapshot(), ...patch });
}

export function resetPrefs() {
  write(defaultPrefs);
}

/** Subscribe outside React (e.g. to mirror preferences onto <html>). */
export function subscribePrefs(listener: (prefs: Prefs) => void) {
  return subscribe(() => listener(getSnapshot()));
}
