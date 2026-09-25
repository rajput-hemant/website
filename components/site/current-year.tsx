"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * The visitor's current year. The page is static, so the server snapshot is
 * the build year: the markup hydrates unchanged and only a stale year updates.
 */
export function CurrentYear({ buildYear }: { buildYear: number }) {
  return useSyncExternalStore(
    subscribe,
    () => new Date().getFullYear(),
    () => buildYear
  );
}
