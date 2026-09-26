import * as React from "react";
import { cn } from "@/flavors/drawing-set/lib/utils";

export type TagProps = {
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
};

/** A mono label in a hairline box. */
export function Tag({ as, className, children }: TagProps) {
  const Cmp = as ?? "span";
  return React.createElement(
    Cmp,
    {
      className: cn(
        "inline-flex items-center gap-1 border border-line px-2 py-1 font-mono text-mono-xs leading-none tracking-[0.08em] text-ink-soft uppercase",
        className
      ),
    },
    children
  );
}
