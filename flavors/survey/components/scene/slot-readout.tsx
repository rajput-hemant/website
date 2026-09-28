"use client";

import * as React from "react";
import { onLoupe } from "@/flavors/survey/lib/loupe";
import { readout, type Relief } from "@/flavors/survey/lib/relief";

/**
 * The loupe's reading under a scene slot: month, grid square and what is
 * there. Written straight to the DOM as the lens moves, so React never
 * re-renders per frame. Decorative; the page says the same in text.
 */
export function SlotReadout({
  relief,
  initial,
}: {
  relief: Relief;
  initial: { where: string; what: string };
}) {
  const where = React.useRef<HTMLSpanElement>(null);
  const what = React.useRef<HTMLSpanElement>(null);

  React.useEffect(
    () =>
      onLoupe((x, p) => {
        const next = readout(relief, x, p);
        if (where.current) where.current.textContent = next.where;
        if (what.current) what.current.textContent = next.what;
      }),
    [relief]
  );

  return (
    <p
      aria-hidden
      className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-rule pt-2"
    >
      <span ref={where} className="caps text-ink-soft tabular-nums">
        {initial.where}
      </span>
      <span ref={what} className="font-serif text-sm text-ink italic">
        {initial.what}
      </span>
    </p>
  );
}
