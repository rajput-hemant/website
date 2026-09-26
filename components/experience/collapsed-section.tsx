import * as React from "react";

import { Disclosure } from "@/components/ui/disclosure";

export type CollapsedSectionProps = {
  /** Anchor id: `/work#skills` opens the section. */
  id: string;
  title: string;
  /** How many things are inside, shown beside the title. */
  count: number;
  children: React.ReactNode;
};

/** A secondary /work section that stays one line until asked for. */
export function CollapsedSection({
  id,
  title,
  count,
  children,
}: CollapsedSectionProps) {
  const headingId = `${id}-heading`;

  return (
    <section
      aria-labelledby={headingId}
      className="border-b border-hairline first:border-t"
    >
      <Disclosure
        id={id}
        summaryClassName="-mx-3 items-baseline rounded-md px-3 py-4 text-xl leading-(--text-xl--line-height) focus-visible:outline-offset-0"
        contentClassName="pt-2 pb-10"
        summary={
          <h2
            id={headingId}
            className="flex items-baseline gap-3 display text-xl font-book text-foreground"
          >
            {title}
            <span className="meta text-subtle tabular-nums">
              <span className="sr-only">(</span>
              {count}
              <span className="sr-only">)</span>
            </span>
          </h2>
        }
      >
        {children}
      </Disclosure>
    </section>
  );
}
