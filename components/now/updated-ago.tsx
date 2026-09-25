"use client";

import { useSyncExternalStore } from "react";

const DAY_MS = 86_400_000;
const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function relativeLabel(isoDate: string, now: number) {
  const days = Math.max(
    0,
    Math.floor((now - Date.parse(`${isoDate}T00:00:00Z`)) / DAY_MS)
  );
  if (days < 14) return relative.format(-days, "day");
  if (days < 60) return relative.format(-Math.floor(days / 7), "week");
  if (days < 730) return relative.format(-Math.floor(days / 30), "month");
  return relative.format(-Math.floor(days / 365), "year");
}

const subscribe = () => () => {};

/**
 * "updated 3 days ago", measured against the visitor's clock. The page is
 * static, so a build-time label would go stale; the server renders nothing and
 * the label appears after hydration, which keeps the markup identical.
 */
export function UpdatedAgo({ date }: { date: string }) {
  const label = useSyncExternalStore(
    subscribe,
    () => relativeLabel(date, Date.now()),
    () => null
  );

  if (!label) return null;
  return (
    <>
      <span aria-hidden>·</span>
      <span>updated {label}</span>
    </>
  );
}
