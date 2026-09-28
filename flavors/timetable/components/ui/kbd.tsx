import * as React from "react";
import { cn } from "@/flavors/timetable/lib/utils";

export type KbdProps = {
  className?: string;
  children: React.ReactNode;
};

export function Kbd({ className, children }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex min-w-5 items-center justify-center rounded-[3px] border border-current px-1.5 pt-1 pb-0.5 font-mono text-mono-xs leading-none font-semibold",
        className
      )}
    >
      {children}
    </kbd>
  );
}
