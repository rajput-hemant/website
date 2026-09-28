"use client";

import dynamic from "next/dynamic";
import { usePrefs } from "@/flavors/minimal/lib/prefs-store";
import { cn } from "@/flavors/minimal/lib/utils";

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
  /** Whether the server can count (`isVisitCounterConfigured`); off never requests. */
  enabled: boolean;
  className?: string;
};

/**
 * "12,408 visitors" in the footer. Counts this visit once per session after
 * the page is idle, so the page itself stays static, then rolls from the last
 * count this browser saw to the new one. Renders nothing when the counter is
 * not configured or the request fails.
 */
export function VisitorCounter({ enabled, className }: VisitorCounterProps) {
  const count = useVisitorCount(enabled);
  const { motion } = usePrefs();

  if (count.status === "off") return null;

  return (
    <span
      className={cn(
        // Mono meta without the caps. Room for "000,000 visitors" up front, so the line never shifts when it loads.
        "inline-block min-w-[16ch] meta font-normal text-subtle normal-case tabular-nums",
        className
      )}
    >
      {count.status === "ready" && (
        <>
          <span className="sr-only">
            {visitorNumberFormat.format(count.visitors)} {label(count.visitors)}
          </span>
          <span aria-hidden className="whitespace-nowrap">
            <AnimatedCount
              from={count.previous ?? 0}
              to={count.visitors}
              animated={motion}
            />
            &nbsp;{label(count.visitors)}
          </span>
        </>
      )}
    </span>
  );
}
