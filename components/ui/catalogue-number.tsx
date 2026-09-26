import * as React from "react";

import { cn } from "@/lib/utils";

export type CatalogueNumberProps = {
  n: number;
  prefix?: string;
  className?: string;
};

/** "No. 014". */
export function CatalogueNumber({
  n,
  prefix = "No.",
  className,
}: CatalogueNumberProps) {
  return (
    <span
      className={cn(
        "font-mono text-mono-xs tracking-[0.08em] text-graphite tabular-nums",
        className
      )}
    >
      {prefix} {String(n).padStart(3, "0")}
    </span>
  );
}
