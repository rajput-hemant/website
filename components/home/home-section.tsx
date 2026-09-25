import { type ReactNode } from "react";

import { Reveal } from "@/components/interaction/reveal";
import {
  SectionHeading,
  type SectionHeadingProps,
} from "@/components/ui/section-heading";

export type HomeSectionProps = {
  /** Used for the heading id and the section's accessible name. */
  id: string;
  title: ReactNode;
  link?: SectionHeadingProps["link"];
  children: ReactNode;
};

/** A home page section that fades in on first view, labelled by its heading. */
export function HomeSection({ id, title, link, children }: HomeSectionProps) {
  const headingId = `${id}-heading`;
  return (
    <Reveal as="section" aria-labelledby={headingId} className="pt-section">
      <SectionHeading id={headingId} title={title} link={link} />
      {children}
    </Reveal>
  );
}
