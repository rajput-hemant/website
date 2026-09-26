"use client";

import dynamic from "next/dynamic";
import { usePrefs } from "@/flavors/press/lib/prefs-store";

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

/** "Impressions 012,408": the print run so far. Nothing renders when the counter is off. */
export function VisitorCounter({ enabled }: { enabled: boolean }) {
  const count = useVisitorCount(enabled);
  const { motion } = usePrefs();
  if (count.status === "off") return null;
  return (
    <span className="inline-flex min-w-[21ch] items-baseline gap-2 tabular-nums">
      <span aria-hidden>Impressions</span>
      {count.status === "ready" && (
        <>
          <span className="sr-only">
            {visitorNumberFormat.format(count.visitors)}{" "}
            {count.visitors === 1 ? "visitor" : "visitors"}
          </span>
          <span aria-hidden className="whitespace-nowrap">
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
