import * as React from "react";
import { SplitHeading } from "@/flavors/drawing-set/components/motion/split-heading";
import { cn } from "@/flavors/drawing-set/lib/utils";

import { Container } from "./container";
import { MetaList, type MetaListItem } from "./meta-list";

export type PageHeaderProps = {
  /** The sheet number from `sheets` in content/site.ts, e.g. "02". */
  sheet: string;
  eyebrow?: string;
  title: string;
  lede?: React.ReactNode;
  meta?: MetaListItem[];
  className?: string;
};

/** The sheet title: mono sheet row, condensed-caps h1, optional lede and meta. */
export function PageHeader({
  sheet,
  eyebrow,
  title,
  lede,
  meta,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("pt-[clamp(3rem,1.5rem+5vw,7rem)] pb-12", className)}>
      <Container>
        <p className="font-mono text-mono-xs tracking-[0.08em] text-ink-soft uppercase">
          Sheet {sheet}
          {eyebrow ? <> &nbsp;·&nbsp; {eyebrow}</> : null}
        </p>
        <SplitHeading
          as="h1"
          className="mt-6 -ml-[0.035em] font-display text-display font-[540] tracking-[-0.018em] break-words uppercase [font-stretch:62%]"
        >
          {title}
        </SplitHeading>
        {lede || meta?.length ? (
          <div className="mt-10 grid gap-x-6 gap-y-8 lg:grid-cols-12">
            {lede ? (
              <div className="max-w-[44ch] text-lead font-[340] text-ink lg:col-span-7">
                {lede}
              </div>
            ) : null}
            {meta?.length ? (
              <MetaList
                items={meta}
                className="self-end lg:col-span-4 lg:col-start-9"
              />
            ) : null}
          </div>
        ) : null}
      </Container>
    </header>
  );
}
