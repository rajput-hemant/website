"use client";

import dynamic from "next/dynamic";
import { usePrefs } from "@/flavors/survey/lib/prefs-store";
import { cn } from "@/flavors/survey/lib/utils";

import {
  useVisitorCount,
  visitorNumberFormat,
} from "@/components/semantic/visitor-count/use-visitor-count";

const AnimatedCount = dynamic(
  () =>
    import("@/components/semantic/visitor-count/animated-count").then(
      (mod) => mod.AnimatedCount
    ),
  { ssr: false }
);

const label = (visitors: number) => (visitors === 1 ? "visitor" : "visitors");

export type VisitorCounterProps = {
  /** Whether the server can count (`isSanityConfigured` from `@/lib/env`); off never requests. */
  enabled: boolean;
  className?: string;
};

/**
 * "Visitors surveyed 012,408" in map lettering. Counts this visit once per
 * session after the page is idle, then rolls from the last count this
 * browser saw. Renders nothing when not configured or when the request fails.
 */
export function VisitorCounter({ enabled, className }: VisitorCounterProps) {
  const count = useVisitorCount(enabled);
  const { motion } = usePrefs();

  if (count.status === "off") return null;

  return (
    <span
      className={cn(
        // Reserves room for the label and "000,000" up front, so the footer line never shifts.
        "caps inline-flex min-w-[28ch] items-baseline gap-2 text-ink-soft tabular-nums",
        className
      )}
    >
      <span aria-hidden>Visitors surveyed</span>
      {count.status === "ready" && (
        <>
          <span className="sr-only">
            {visitorNumberFormat.format(count.visitors)} {label(count.visitors)}
          </span>
          <span aria-hidden className="whitespace-nowrap text-ink">
            <AnimatedCount
              from={count.previous ?? 0}
              to={count.visitors}
              animated={motion}
            />
          </span>
        </>
      )}
    </span>
  );
}
