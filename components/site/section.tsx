import { type ComponentProps } from "react";

import { cn } from "@/lib/utils";

/** A page section; consecutive sections are one `section` spacing unit apart. */
export function Section({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={cn("py-[calc(var(--spacing-section)/2)]", className)}
      {...props}
    />
  );
}
