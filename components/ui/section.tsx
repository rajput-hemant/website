import * as React from "react";

import { cn } from "@/lib/utils";

import { Container } from "./container";
import { SheetHeading } from "./sheet-heading";
import { Tag } from "./tag";

export type SectionProps = {
  id?: string;
  /** The mono number column, e.g. "Sheet 01" or "A". */
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
        {title ? (
          <SheetHeading n={label} title={title} />
        ) : label ? (
          <Tag>{label}</Tag>
        ) : null}
        <div className={label || title ? "mt-8" : undefined}>{children}</div>
      </Container>
    </section>
  );
}
