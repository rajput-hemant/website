import * as React from "react";
import { cn } from "@/flavors/timetable/lib/utils";

import { Container } from "./container";
import { SectionHead } from "./section-head";

export type SectionProps = {
  id?: string;
  platform?: string;
  kicker?: string;
  title?: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export function Section({
  id,
  platform,
  kicker,
  title,
  aside,
  className,
  children,
}: SectionProps) {
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
            platform={platform}
            kicker={kicker}
            title={title}
            aside={aside}
          />
        ) : null}
        <div className={title ? "mt-10" : undefined}>{children}</div>
      </Container>
    </section>
  );
}
