"use client";

import * as React from "react";
import { cn } from "@/flavors/mission/lib/utils";

import { useHashOpen } from "@/components/semantic/disclosure/use-hash-open";

/**
 * A native <details>, so the content stays in the DOM for find-in-page, print
 * and no-JS. A URL hash that targets it, or `openOnHash`, opens it.
 */
export function Disclosure({
  summary,
  children,
  id,
  openOnHash,
  defaultOpen,
  className,
  summaryClassName,
}: {
  summary: React.ReactNode;
  children: React.ReactNode;
  id?: string;
  openOnHash?: string;
  defaultOpen?: boolean;
  className?: string;
  summaryClassName?: string;
}) {
  const ref = React.useRef<HTMLDetailsElement>(null);
  useHashOpen(ref, { openOnHash });
  return (
    <details
      ref={ref}
      id={id}
      open={defaultOpen}
      className={cn("group/disclosure", className)}
    >
      <summary
        className={cn(
          "flex min-h-11 w-fit cursor-pointer list-none items-center gap-2.5 [&::-webkit-details-marker]:hidden",
          summaryClassName
        )}
      >
        <span
          aria-hidden
          className="grid size-3 place-items-center border border-current transition-transform duration-(--duration-ui) ease-out group-open/disclosure:rotate-45"
        >
          <span className="block size-1 bg-current" />
        </span>
        {summary}
      </summary>
      {children}
    </details>
  );
}
