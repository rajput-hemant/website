import * as React from "react";
import { cn } from "@/flavors/survey/lib/utils";

/** One stack item or category, in small map capitals. */
export function Tag({
  as,
  className,
  children,
}: {
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
}) {
  return React.createElement(
    as ?? "span",
    {
      className: cn(
        "caps inline-flex items-center gap-1.5 border border-rule px-2 py-1 whitespace-nowrap text-ink-soft",
        className
      ),
    },
    children
  );
}
