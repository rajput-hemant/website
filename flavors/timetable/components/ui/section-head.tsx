import * as React from "react";
import { PlatformPlate } from "@/flavors/timetable/components/site/nav-links";
import { cn } from "@/flavors/timetable/lib/utils";

export type SectionHeadProps = {
  /** Platform number shown in the kicker plate, if the section has one. */
  platform?: string;
  kicker?: string;
  title: React.ReactNode;
  /** Right-hand link or count. */
  aside?: React.ReactNode;
  as?: "h2" | "h3";
  id?: string;
  className?: string;
};

/** A section's sign: the heavy rule, a mono kicker, the heading and an aside. */
export function SectionHead({
  platform,
  kicker,
  title,
  aside,
  as: Heading = "h2",
  id,
  className,
}: SectionHeadProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 items-end gap-x-6 gap-y-4 border-t-[3px] border-rule-strong pt-4 sm:grid-cols-[1fr_auto]",
        className
      )}
    >
      <div className="min-w-0">
        {kicker ? (
          <p className="flex items-center gap-2.5 font-mono text-mono-sm leading-none font-bold tracking-[0.08em] text-ink-soft uppercase">
            {platform ? (
              <PlatformPlate n={platform} className="text-ink" />
            ) : null}
            <span className="pt-0.5">{kicker}</span>
          </p>
        ) : null}
        <Heading
          id={id}
          className={cn(
            "scroll-mt-[calc(var(--header-height)+1rem)] font-extrabold tracking-[-0.03em]",
            Heading === "h2" ? "text-h2" : "text-h3 tracking-[-0.015em]",
            kicker && "mt-3"
          )}
        >
          {title}
        </Heading>
      </div>
      {aside ? (
        <div className="justify-self-start font-mono text-mono-sm text-ink-soft sm:justify-self-end">
          {aside}
        </div>
      ) : null}
    </div>
  );
}
