import { type ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function Kbd({ className, ...props }: ComponentProps<"kbd">) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-sm border border-b-2 border-border bg-surface px-1 font-mono text-2xs leading-none text-muted",
        className
      )}
      {...props}
    />
  );
}
