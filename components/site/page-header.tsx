import { type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { SharedElement } from "@/components/interaction/shared-element";

export type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  /** A mono metadata line under the description, e.g. "Updated Sep 2026". */
  meta?: ReactNode;
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
      <SharedElement name="page-title">
        <h1 className="display text-display text-foreground">{title}</h1>
      </SharedElement>
      {description && (
        <p className="mt-5 max-w-[48ch] text-lg text-muted">{description}</p>
      )}
      {meta && <div className="mt-6 meta text-subtle">{meta}</div>}
    </header>
  );
}
