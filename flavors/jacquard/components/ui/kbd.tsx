import * as React from "react";
import { cn } from "@/flavors/jacquard/lib/utils";

export function Kbd({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-[3px] border border-rule-strong px-1 font-mono text-label leading-none text-ink-soft",
        className
      )}
      {...props}
    />
  );
}
