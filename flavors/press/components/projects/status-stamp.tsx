import { printStatus } from "@/flavors/press/lib/proof";
import { cn } from "@/flavors/press/lib/utils";

import type { ProjectStatus } from "@/lib/data/types";

/** In print, On press, Proofing (dashed) or Out of print (struck), stamped a little off square. */
export function StatusStamp({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}) {
  const stamp = printStatus[status];
  return (
    <span
      title={stamp.meaning}
      className={cn(
        "stamp-ink inline-block -rotate-2 border-[1.5px] px-2 pt-1.5 pb-1 font-mono text-[0.625rem] leading-none font-semibold tracking-[0.1em] whitespace-nowrap uppercase [font-stretch:75%]",
        stamp.stamp === "struck"
          ? "border-ink-soft text-ink-soft line-through"
          : "border-blue text-blue",
        stamp.stamp === "dashed" && "border-dashed",
        className
      )}
    >
      {stamp.label}
      <span className="sr-only">, {stamp.meaning.toLowerCase()}</span>
    </span>
  );
}
