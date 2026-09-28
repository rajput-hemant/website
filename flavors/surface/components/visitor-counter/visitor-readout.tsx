"use client";

import { Seg } from "@/flavors/surface/components/ui/seg";

import {
  useVisitorCount,
  visitorNumberFormat,
} from "@/components/semantic/visitor-count/use-visitor-count";

/**
 * The visit counter on the rear panel: six seven-segment digits, like an
 * odometer. Counts this visit once per session after idle; shows dashes until
 * it knows, and reads "off" when counting is unavailable.
 */
export function VisitorReadout({ enabled }: { enabled: boolean }) {
  const count = useVisitorCount(enabled);
  const value =
    count.status === "ready"
      ? String(Math.min(count.visitors, 999_999)).padStart(6, " ")
      : "------";
  const label =
    count.status === "ready"
      ? `${visitorNumberFormat.format(count.visitors)} ${count.visitors === 1 ? "visit" : "visits"}`
      : count.status === "off"
        ? "Visit counter unavailable"
        : "Counting visits";

  return (
    <div className="glass flex items-end justify-between gap-4 px-4 pt-2.5 pb-3">
      <p className="legend">Visits</p>
      <Seg value={value} label={label} className="h-8" />
    </div>
  );
}
