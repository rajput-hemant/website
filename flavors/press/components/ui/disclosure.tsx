"use client";

import * as React from "react";
import { cn } from "@/flavors/press/lib/utils";

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
          "flex min-h-11 w-fit cursor-pointer list-none items-center gap-2 font-bold [&::-webkit-details-marker]:hidden",
          summaryClassName
        )}
      >
        <span
          aria-hidden
          className="font-mono text-slug-lg transition-transform duration-(--duration-ui) group-open/disclosure:rotate-45"
        >
          +
        </span>
        {summary}
      </summary>
      {children}
    </details>
  );
}
