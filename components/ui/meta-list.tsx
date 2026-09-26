import * as React from "react";

import { cn } from "@/lib/utils";

export type MetaListItem = { label: string; value: React.ReactNode };

export type MetaListProps = {
  items: MetaListItem[];
  className?: string;
};

/** A `dl` of mono labels and values, ruled like a title block. */
export function MetaList({ items, className }: MetaListProps) {
  return (
    <dl
      className={cn(
        "grid grid-cols-[max-content_minmax(0,1fr)] border-t border-line font-mono text-mono-sm",
        className
      )}
    >
      {items.map((item) => (
        <React.Fragment key={item.label}>
          <dt className="border-b border-line py-2 pr-6 text-mono-xs tracking-[0.08em] text-ink-faint uppercase">
            {item.label}
          </dt>
          <dd className="border-b border-line py-2 text-ink">{item.value}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}
