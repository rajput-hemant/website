import * as React from "react";
import { cn } from "@/flavors/maquette/lib/utils";

export function Kbd({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5.5 min-w-5.5 items-center justify-center rounded-[3px] border border-line-strong px-1.5 font-mono text-[0.75rem] leading-none font-semibold tracking-[0.08em] text-soft",
        className
      )}
      {...props}
    />
  );
}
