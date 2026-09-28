import * as React from "react";
import { cn } from "@/flavors/surface/lib/utils";

import styles from "./resume.module.css";

/**
 * A numbered section of the manual. The legend sits in a narrow left column
 * from `sm` up and in print. Float rather than grid, so the browser can split
 * a long section cleanly across printed pages.
 */
export function ResumeSection({
  id,
  n,
  title,
  detent,
  children,
  className,
}: {
  id: string;
  /** Manual section number, e.g. "2". */
  n: string;
  title: string;
  /** The knob detent this section answers to. */
  detent: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-labelledby={id}
      data-knob-item={detent}
      className={cn(
        styles.section,
        "flow-root scroll-mt-28 border-t border-black/15 pt-6",
        className
      )}
    >
      <h2
        id={id}
        className="mb-4 pt-1 font-display text-[0.75rem] leading-none tracking-[0.15em] text-[#4b4944] uppercase sm:float-left sm:mb-0 sm:w-28 print:float-left print:mb-0 print:w-28"
      >
        <span aria-hidden className="mr-2 font-sans font-medium">
          {n}.
        </span>
        {title}
      </h2>
      <div className="min-w-0 sm:ml-34 print:ml-34">{children}</div>
    </section>
  );
}
