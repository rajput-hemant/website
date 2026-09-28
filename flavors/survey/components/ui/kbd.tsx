import * as React from "react";
import { cn } from "@/flavors/survey/lib/utils";

export function Kbd({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <kbd
      className={cn(
        "inline-flex min-w-5 items-center justify-center rounded-sm border border-rule px-1.5 py-0.5 font-sans text-[0.6875rem] leading-none font-semibold tabular-nums",
        className
      )}
    >
      {children}
    </kbd>
  );
}
