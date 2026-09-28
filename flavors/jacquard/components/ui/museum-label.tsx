import * as React from "react";
import { cn } from "@/flavors/jacquard/lib/utils";

export type LabelRow = { label: string; value: React.ReactNode };

/** A museum object label: mono captions on the left, plain facts on the right, ruled like a card. */
export function MuseumLabel({
  rows,
  className,
  wide = false,
}: {
  rows: LabelRow[];
  className?: string;
  /** A wider caption column, for longer captions. */
  wide?: boolean;
}) {
  return (
    <dl
      className={cn(
        "grid border-t border-rule-strong text-sm leading-snug",
        wide
          ? "grid-cols-[8.5rem_minmax(0,1fr)]"
          : "grid-cols-[6.5rem_minmax(0,1fr)]",
        className
      )}
    >
      {rows.map((row) => (
        <React.Fragment key={row.label}>
          <dt className="border-b border-rule py-2.5 label leading-[1.9]">
            {row.label}
          </dt>
          <dd className="min-w-0 border-b border-rule py-2.5">{row.value}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}
