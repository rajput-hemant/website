import * as React from "react";
import { cn } from "@/flavors/minimal/lib/utils";

export type PageHeaderProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** A mono metadata line under the description, e.g. "Updated Sep 2026". */
  meta?: React.ReactNode;
  className?: string;
};

/** The shared top of every page. Place it inside a <Container>. */
export function PageHeader({
  title,
  description,
  meta,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("pt-16 pb-12 sm:pt-24 sm:pb-16", className)}>
      <h1 className="display text-display text-foreground">{title}</h1>
      {description && (
        <p className="mt-5 max-w-[48ch] text-lg text-muted">{description}</p>
      )}
      {meta && <div className="mt-6 meta text-subtle">{meta}</div>}
    </header>
  );
}
