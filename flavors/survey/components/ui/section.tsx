import * as React from "react";
import { cn } from "@/flavors/survey/lib/utils";

import { Container } from "./container";
import { SectionHead } from "./section-head";

export function Section({
  id,
  kicker,
  title,
  aside,
  className,
  children,
}: {
  id?: string;
  kicker?: string;
  title?: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <section
      id={id}
      aria-labelledby={title ? headingId : undefined}
      className={cn(
        "mt-section scroll-mt-[calc(var(--header-height)+1rem)]",
        className
      )}
    >
      <Container>
        {title ? (
          <SectionHead
            id={headingId}
            kicker={kicker}
            title={title}
            aside={aside}
          />
        ) : null}
        <div className={title ? "mt-8" : undefined}>{children}</div>
      </Container>
    </section>
  );
}
