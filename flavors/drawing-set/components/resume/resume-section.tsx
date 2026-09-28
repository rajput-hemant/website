import * as React from "react";
import { cn } from "@/flavors/drawing-set/lib/utils";

import styles from "./resume.module.css";

/**
 * A labelled band of the document: the label sits in a narrow left column
 * from `sm` up and in print. Float rather than grid, so the browser can
 * split a long section cleanly across printed pages.
 */
export function ResumeSection({
  id,
  title,
  children,
  weight = 1,
  className,
}: {
  id: string;
  title: string;
  /** How many entries it holds; sizes its block on the scene's A4. */
  weight?: number;
  children: React.ReactNode;
  className?: string | undefined;
}) {
  return (
    <section
      aria-labelledby={id}
      data-scene-item={`section:${id}`}
      data-scene-href={`#${id}`}
      data-scene-weight={weight}
      className={cn(
        styles.section,
        "flow-root border-t border-line pt-6",
        className
      )}
    >
      <h2
        id={id}
        className="mb-4 pt-1 font-mono text-mono-xs tracking-[0.14em] text-ink-faint uppercase sm:float-left sm:mb-0 sm:w-24 print:float-left print:mb-0 print:w-28"
      >
        {title}
      </h2>
      <div className="min-w-0 sm:ml-30 print:ml-34">{children}</div>
    </section>
  );
}
