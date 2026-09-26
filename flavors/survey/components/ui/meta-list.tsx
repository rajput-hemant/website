import * as React from "react";
import { cn } from "@/flavors/survey/lib/utils";

export type MetaListItem = { label: string; value: React.ReactNode };

/** Marginal notes: map capitals over their values. */
export function MetaList({
  items,
  className,
}: {
  items: MetaListItem[];
  className?: string;
}) {
  return (
    <dl className={cn("flex flex-wrap gap-x-10 gap-y-4", className)}>
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="caps text-ink-faint">{item.label}</dt>
          <dd className="mt-1.5 text-lead leading-tight font-medium tabular-nums">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
