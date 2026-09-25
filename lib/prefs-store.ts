"use client";

import { useSyncExternalStore } from "react";

import { defaultPrefs, PREFS_KEY, type Prefs } from "@/lib/prefs";

type Listener = () => void;

const listeners = new Set<Listener>();
let cached: Prefs | null = null;

function read(): Prefs {
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    return raw
      ? { ...defaultPrefs, ...(JSON.parse(raw) as Partial<Prefs>) }
      : defaultPrefs;
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

function subscribe(listener: Listener) {
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key !== PREFS_KEY) return;
    cached = read();
    emit();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
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
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
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
