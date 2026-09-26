import * as React from "react";

import { cn } from "@/lib/utils";

export type KbdProps = {
  className?: string;
  children: React.ReactNode;
};

export function Kbd({ className, children }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex min-w-5 items-center justify-center rounded-sm border border-hairline bg-ink-raised px-1.5 py-0.5 font-mono text-mono-xs text-graphite",
        className
      )}
    >
      {children}
    </kbd>
  );
}
