import * as React from "react";
import { cn } from "@/flavors/minimal/lib/utils";

/**
 * Separates inline metadata with slashes. The separator trails each item, so
 * when the line wraps it stays at the end of a line instead of leading the
 * next one. Falsy children are skipped; a child that renders nothing (a
 * client-only leaf before hydration) simply leaves its predecessor last.
 */
export const metaSeparators =
  "[&>*:not(:last-child)]:after:mx-2 [&>*:not(:last-child)]:after:text-border [&>*:not(:last-child)]:after:content-['/']";

export function MetaList({
  children,
  className,
  as: Tag = "p",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "p" | "div";
}) {
  return (
    <Tag className={cn("flex flex-wrap gap-y-1", metaSeparators, className)}>
      {children}
    </Tag>
  );
}
