import * as React from "react";

import { cn } from "@/lib/utils";

export type MetaListItem = { label: string; value: React.ReactNode };

export type MetaListProps = {
  items: MetaListItem[];
  className?: string;
};

/** A `dl` grid of mono labels and values (used for colophon-style meta rows). */
export function MetaList({ items, className }: MetaListProps) {
  return (
    <dl
      className={cn(
        "grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 font-mono text-sm",
        className
      )}
    >
      {items.map((item) => (
        <React.Fragment key={item.label}>
          <dt className="text-mono-xs tracking-[0.1em] text-pencil uppercase">
            {item.label}
          </dt>
          <dd className="text-paper">{item.value}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}
