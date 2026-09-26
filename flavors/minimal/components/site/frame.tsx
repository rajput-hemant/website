import * as React from "react";
import { cn } from "@/flavors/minimal/lib/utils";

/*
 * Margin content for the wide frame (see ./container). Both are hidden below
 * `2xl` and are absolutely placed beside their nearest positioned ancestor,
 * which should be a column-wide block inside a `content` Container (give it
 * `relative`). They take the ancestor's full height, so a `sticky` child
 * stays in view while the ancestor scrolls past:
 *
 *   <section className="relative">
 *     <FrameRail><nav className={cn("sticky", frameStickyTop)}>…</nav></FrameRail>
 *     …column content…
 *   </section>
 */

/** Where a sticky rail or note child should stop: under the header, with air. */
export const frameStickyTop = "top-[calc(var(--header-h)+2rem)]";

/** The left rail (15rem): section indexes, dates and page meta. */
export function FrameRail({
  className,
  ...props
}: React.ComponentProps<"aside">) {
  return (
    <aside
      className={cn(
        "hidden 2xl:absolute 2xl:inset-y-0 2xl:right-[calc(100%+var(--frame-gap))] 2xl:block 2xl:w-(--frame-rail)",
        className
      )}
      {...props}
    />
  );
}

/** The right margin (12rem): short notes that gloss the column. */
export function FrameNote({
  className,
  ...props
}: React.ComponentProps<"aside">) {
  return (
    <aside
      className={cn(
        "hidden 2xl:absolute 2xl:inset-y-0 2xl:left-[calc(100%+var(--frame-gap))] 2xl:block 2xl:w-(--frame-note)",
        className
      )}
      {...props}
    />
  );
}
