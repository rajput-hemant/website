import * as React from "react";
import { cn } from "@/flavors/drawing-set/lib/utils";

export type KbdProps = {
  className?: string;
  children: React.ReactNode;
};

export function Kbd({ className, children }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex min-w-5 items-center justify-center border border-line-strong px-[7px] py-1 font-mono text-mono-xs leading-none font-medium text-ink-soft",
        className
      )}
    >
      {children}
    </kbd>
  );
}
