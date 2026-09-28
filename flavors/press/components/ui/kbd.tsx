import * as React from "react";
import { cn } from "@/flavors/press/lib/utils";

export function Kbd({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center border border-rule px-1 font-mono text-slug leading-none [font-stretch:75%]",
        className
      )}
      {...props}
    />
  );
}
