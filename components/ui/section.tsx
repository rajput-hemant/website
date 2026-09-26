import * as React from "react";

import { cn } from "@/lib/utils";
import { SplitHeading } from "@/components/motion/split-heading";

import { Container } from "./container";
import { Tag } from "./tag";

export type SectionProps = {
  id?: string;
  label?: string;
  title?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export function Section({
  id,
  label,
  title,
  className,
  children,
}: SectionProps) {
  return (
    <section id={id} className={cn("py-section", className)}>
      <Container>
        {label ? <Tag className="mb-4">{label}</Tag> : null}
        {title ? (
          <SplitHeading as="h2" className="text-2xl">
            {title}
          </SplitHeading>
        ) : null}
        <div className={label || title ? "mt-8" : undefined}>{children}</div>
      </Container>
    </section>
  );
}
