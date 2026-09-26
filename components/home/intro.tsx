import * as React from "react";
import Link from "next/link";

import { introLinks } from "@/content/site";
import type { Profile } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { SplitHeading, Tag } from "@/components/ui";

function IntroLinks() {
  return (
    <p className="mt-4 max-w-lg text-graphite">
      {introLinks.map((part, index) =>
        typeof part === "string" ? (
          <React.Fragment key={index}>{part}</React.Fragment>
        ) : (
          <Link
            key={part.href}
            href={part.href}
            className="text-paper underline decoration-hairline underline-offset-4 hover:text-accent"
          >
            {part.label}
          </Link>
        )
      )}
    </p>
  );
}

export type HomeIntroProps = {
  profile: Profile;
  /** The archive's founding year, for the eyebrow's catalogue line. */
  firstYear: number;
  className?: string;
};

/**
 * The hero overlay: a catalogue eyebrow, the owner's name as the page's h1
 * (the LCP element, rendered as plain text), the headline, an availability
 * chip and the intro links.
 */
export function HomeIntro({ profile, firstYear, className }: HomeIntroProps) {
  return (
    <div className={cn("max-w-xl", className)}>
      <p className="font-mono text-mono-xs tracking-[0.14em] text-pencil uppercase">
        The Night Archive · Est. {firstYear}
      </p>
      <SplitHeading
        as="h1"
        className="mt-3 font-display text-display leading-none text-paper"
      >
        {profile.name}
      </SplitHeading>
      <p className="mt-4 max-w-lg text-lg text-graphite">{profile.headline}</p>
      {profile.availability && (
        <Tag className="mt-4 inline-flex">{profile.availability}</Tag>
      )}
      <IntroLinks />
    </div>
  );
}
