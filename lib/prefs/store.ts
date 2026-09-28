"use client";

import * as React from "react";

type Listener = () => void;

export type PrefsStore<P extends object> = {
  /** Current preferences. Returns the defaults during SSR and hydration. */
  usePrefs(): P;
  setPrefs(patch: Partial<P>): void;
  resetPrefs(): void;
  /** Subscribe outside React (e.g. to mirror preferences onto <html>). */
  subscribePrefs(listener: (prefs: P) => void): () => void;
};

/**
 * A localStorage-backed preference store for one edition's schema. Each
 * instance keeps its own snapshot and listeners, follows other tabs through
 * `storage` events, and survives unavailable storage by keeping the session's
 * values in memory. The key, defaults and migration stay with the edition.
 */
export function createPrefsStore<P extends object>({
  key,
  defaults,
  migrate,
}: {
  key: string;
  defaults: P;
  migrate: (stored: unknown) => P;
}): PrefsStore<P> {
  const listeners = new Set<Listener>();
  let cached: P | null = null;

  function read(): P {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? migrate(JSON.parse(raw)) : defaults;
    } catch {
      return defaults;
    }
  }

  function emit() {
    for (const listener of listeners) listener();
  }

  function getSnapshot(): P {
    cached ??= read();
    return cached;
  }

  const getServerSnapshot = (): P => defaults;

  /** `event.key === null` means another tab cleared storage entirely. */
  function onStorage(event: StorageEvent) {
    if (event.key !== key && event.key !== null) return;
    cached = read();
    emit();
  }

  function subscribe(listener: Listener) {
    if (listeners.size === 0) window.addEventListener("storage", onStorage);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) {
        window.removeEventListener("storage", onStorage);
      }
    };
  }

  function write(next: P) {
    cached = next;
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Storage can be unavailable (private mode, quota); preferences then last for the session.
    }
    emit();
  }

  return {
    usePrefs: () =>
      React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot),
    setPrefs: (patch) => write({ ...getSnapshot(), ...patch }),
    resetPrefs: () => write(defaults),
    subscribePrefs: (listener) => subscribe(() => listener(getSnapshot())),
  };
}
