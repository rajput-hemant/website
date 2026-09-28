import * as React from "react";
import { cn } from "@/flavors/surface/lib/utils";

/**
 * Every page.tsx wraps its content in this. Only a real client navigation
 * animates (a short channel-switch fade), never the first paint.
 */
export function Page({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <React.ViewTransition enter="page-in" exit="page-out" default="none">
      <main id="main" tabIndex={-1} className={cn("outline-none", className)}>
        {children}
      </main>
    </React.ViewTransition>
  );
}

export function SkipLink() {
  return (
    <a
      href="#main"
      className="key fixed top-2 left-2 z-[200] -translate-y-[calc(100%+1rem)] focus-visible:translate-y-0"
    >
      Skip to content
    </a>
  );
}
