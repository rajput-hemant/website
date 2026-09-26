import * as React from "react";

import { cn } from "@/lib/utils";
import { SplitHeading } from "@/components/motion/split-heading";

import { Container } from "./container";
import { Tag } from "./tag";

export type PageHeaderProps = {
  eyebrow?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
};

/** The page's h1 block: generous top spacing, left-aligned, editorial. */
export function PageHeader({
  eyebrow,
  title,
  lede,
  meta,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("pt-[clamp(6rem,4rem+6vw,10rem)] pb-12", className)}>
      <Container>
        {eyebrow ? <Tag className="mb-4">{eyebrow}</Tag> : null}
        <SplitHeading as="h1" className="text-display">
          {title}
        </SplitHeading>
        {lede ? (
          <p className="mt-6 max-w-[58ch] text-lg text-graphite">{lede}</p>
        ) : null}
        {meta ? <div className="mt-8">{meta}</div> : null}
      </Container>
    </header>
  );
}
