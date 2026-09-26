import * as React from "react";
import { cn } from "@/flavors/minimal/lib/utils";

/**
 * A page section; consecutive sections are one `section` spacing unit apart.
 * The last one ends flush: every page stops at its content and the footer's
 * `mt-section` supplies the one unit before it.
 */
export function Section({
  className,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section
      className={cn("py-[calc(var(--spacing-section)/2)] last:pb-0", className)}
      {...props}
    />
  );
}
