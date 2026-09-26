import * as React from "react";

import { cn } from "@/lib/utils";

export type TagProps = {
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
};

/** The "label holder" chip: mono xs uppercase in a hairline box. */
export function Tag({ as, className, children }: TagProps) {
  const Cmp = as ?? "span";
  return React.createElement(
    Cmp,
    {
      className: cn(
        "inline-flex items-center gap-1 rounded-sm border border-hairline px-2 py-0.5 font-mono text-mono-xs tracking-[0.14em] text-graphite uppercase",
        className
      ),
    },
    children
  );
}
