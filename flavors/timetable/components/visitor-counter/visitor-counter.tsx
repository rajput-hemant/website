"use client";

import dynamic from "next/dynamic";
import { usePrefs } from "@/flavors/timetable/lib/prefs-store";
import { cn } from "@/flavors/timetable/lib/utils";

import {
  useVisitorCount,
  visitorNumberFormat,
} from "@/components/semantic/visitor-count/use-visitor-count";

const AnimatedCount = dynamic(
  () => import("./animated-count").then((mod) => mod.AnimatedCount),
  { ssr: false }
);

const label = (visitors: number) => (visitors === 1 ? "visitor" : "visitors");

export type VisitorCounterProps = {
  /** Whether the server can count (`isSanityConfigured` from `@/lib/env`); off never requests. */
  enabled: boolean;
  className?: string;
};

/**
 * "Visitors 012,408": a mono catalogue line, digits zero-padded like a
 * mechanical counter. Counts this visit once per session after the page is
 * idle, so the page itself stays static, then rolls from the last count this
 * browser saw to the new one. Renders nothing when the counter is not
 * configured or the request fails.
 */
export function VisitorCounter({ enabled, className }: VisitorCounterProps) {
  const count = useVisitorCount(enabled);
  const { motion } = usePrefs();

  if (count.status === "off") return null;

  return (
    <span
      className={cn(
        // Reserves room for "Visitors 000,000" up front, so the footer line never shifts when it loads.
        "inline-flex min-w-[19ch] items-baseline gap-2 font-mono text-mono-xs tracking-[0.08em] text-ink-soft uppercase tabular-nums",
        className
      )}
    >
      <span aria-hidden>Passengers</span>
      {count.status === "ready" && (
        <>
          <span className="sr-only">
            {visitorNumberFormat.format(count.visitors)} {label(count.visitors)}
          </span>
          <span aria-hidden className="whitespace-nowrap normal-case">
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
