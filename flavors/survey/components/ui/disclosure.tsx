"use client";

import * as React from "react";
import { cn } from "@/flavors/survey/lib/utils";

import { useHashOpen } from "@/components/semantic/disclosure/use-hash-open";

import styles from "./disclosure.module.css";

export type DisclosureProps = {
  summary: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  id?: string;
  /** Another id whose hash also opens this, e.g. `/work#zunta`. */
  openOnHash?: string;
  className?: string;
  summaryClassName?: string;
  contentClassName?: string;
};

/**
 * A native <details>, so content stays in the DOM for find-in-page, no-JS
 * and print. Its marker is a survey cross that turns to an x when open.
 */
export function Disclosure({
  summary,
  children,
  defaultOpen,
  id,
  openOnHash,
  className,
  summaryClassName,
  contentClassName,
}: DisclosureProps) {
  const ref = React.useRef<HTMLDetailsElement>(null);
  useHashOpen(ref, { openOnHash, instantClass: styles.instant });

  return (
    <details
      ref={ref}
      id={id}
      open={defaultOpen}
      className={cn("group/disclosure", styles.root, className)}
    >
      <summary
        className={cn(
          "flex min-h-11 cursor-pointer list-none items-center gap-2.5 [&::-webkit-details-marker]:hidden",
          summaryClassName
        )}
      >
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          className={cn("size-3 shrink-0 text-contour", styles.marker)}
        >
          <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.4" />
        </svg>
        <span className="min-w-0 flex-1">{summary}</span>
      </summary>
      <div className={contentClassName}>{children}</div>
    </details>
  );
}
