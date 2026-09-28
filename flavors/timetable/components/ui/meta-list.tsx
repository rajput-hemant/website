import * as React from "react";
import { cn } from "@/flavors/timetable/lib/utils";

export type MetaListItem = { label: string; value: React.ReactNode };

export type MetaListProps = {
  items: MetaListItem[];
  className?: string;
};

/** Mono labels over values, like the heads of a timetable column. */
export function MetaList({ items, className }: MetaListProps) {
  return (
    <dl className={cn("flex flex-wrap gap-x-10 gap-y-5", className)}>
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="font-mono text-mono-xs font-semibold tracking-[0.1em] text-ink-soft uppercase">
            {item.label}
          </dt>
          <dd className="mt-1.5 text-lead leading-tight font-bold">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
