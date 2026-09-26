import * as React from "react";
import { cn } from "@/flavors/minimal/lib/utils";

import styles from "./resume.module.css";

/**
 * A labelled band of the document: the label sits in a narrow left column from
 * `sm` up and in print. It floats rather than using grid so Chromium can split
 * long sections cleanly across printed pages.
 */
export function ResumeSection({
  id,
  title,
  children,
  className,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-labelledby={id}
      className={cn(
        styles.section,
        "flow-root border-t border-border pt-6",
        className
      )}
    >
      <h2
        id={id}
        className="mb-4 pt-1 meta text-subtle sm:float-left sm:mb-0 sm:w-24 print:float-left print:mb-0 print:w-28"
      >
        {title}
      </h2>
      <div className="min-w-0 sm:ml-30 print:ml-34">{children}</div>
    </section>
  );
}
