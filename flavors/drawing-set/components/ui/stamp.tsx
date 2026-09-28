import * as React from "react";
import { cn } from "@/flavors/drawing-set/lib/utils";

import { VisuallyHidden } from "./visually-hidden";

export type StampProps = {
  children: string;
  /** The plain meaning of the stamp word, for the tooltip and screen readers. */
  meaning: string;
  /** @default "ink" */
  tone?: "accent" | "ink" | "faint";
  className?: string;
};

/** A rubber-stamp status word, e.g. ISSUED (active). */
export function Stamp({
  children,
  meaning,
  tone = "ink",
  className,
}: StampProps) {
  return (
    <abbr
      title={meaning}
      className={cn(
        "inline-block -rotate-[2.5deg] cursor-help border-[1.5px] border-current px-2 pt-1.5 pb-[5px] font-mono text-mono-xs leading-none font-semibold tracking-[0.14em] whitespace-nowrap uppercase no-underline",
        {
          "text-accent": tone === "accent",
          "text-ink-soft": tone === "ink",
          "text-ink-faint": tone === "faint",
        },
        className
      )}
    >
      {children}
      <VisuallyHidden> ({meaning})</VisuallyHidden>
    </abbr>
  );
}
