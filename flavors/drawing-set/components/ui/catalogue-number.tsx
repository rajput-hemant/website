import * as React from "react";
import { cn } from "@/flavors/drawing-set/lib/utils";

export type CatalogueNumberProps = {
  n: number;
  prefix?: string;
  className?: string;
};

/** A drawing number: "DWG 014". */
export function CatalogueNumber({
  n,
  prefix = "DWG",
  className,
}: CatalogueNumberProps) {
  return (
    <span
      className={cn(
        "font-mono text-mono-xs tracking-[0.08em] text-ink-faint uppercase tabular-nums",
        className
      )}
    >
      {prefix} {String(n).padStart(3, "0")}
    </span>
  );
}
