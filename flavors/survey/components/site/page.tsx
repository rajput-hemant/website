import * as React from "react";
import { cn } from "@/flavors/survey/lib/utils";

/**
 * Every page.tsx wraps its content in this. Only a real client navigation
 * (which sets the page-in/page-out pair) animates, never the first paint.
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
