import Link from "next/link";
import { Signature } from "@/flavors/minimal/components/signature/signature";
import { Avatar } from "@/flavors/minimal/components/ui/avatar";
import { MetaList } from "@/flavors/minimal/components/ui/meta-list";
import { RichText } from "@/flavors/minimal/components/ui/portable-text";
import { introLinks } from "@/flavors/minimal/content";
import { cn } from "@/flavors/minimal/lib/utils";

import type { Profile } from "@/lib/data/types";

import { ContactRow } from "./contact-row";
import { Headline } from "./headline";
import { LocalTime } from "./local-time";

const AVATAR_SIZE = 64;

/** The bio's closing line, whose links double as the page's navigation. */
function IntroLinks({ className }: { className?: string }) {
  return (
    <p className={cn("prose", className)}>
      {introLinks.map((part) =>
        typeof part === "string" ? (
          part
        ) : (
          <Link key={part.href} href={part.href}>
            {part.label}
          </Link>
        )
      )}
    </p>
  );
}

/**
 * The top of the home page. The header's wordmark already names the owner, so
 * the headline leads as the page's h1 and the name is kept for assistive tech
 * and search in visually hidden text. Then the bio, signed: from `sm` the
 * signature closes the bio's last line, and it writes itself once, with the
 * headline's rise, on the first load.
 */
export function Intro({ profile }: { profile: Profile }) {
  const headline = profile.headline || profile.name;

  return (
    <header className="pt-10 sm:pt-16 lg:pt-14">
      <div className="flex items-start gap-4 sm:gap-6">
        <Avatar
          image={profile.avatar}
          size={AVATAR_SIZE}
          preload
          className="mt-1.5 max-sm:size-12!"
        />
        <Headline
          text={headline}
          prefix={headline !== profile.name ? profile.name : undefined}
          className="display text-[clamp(1.875rem,0.95rem+3.95vw,3.5rem)] leading-[1.08] font-light text-balance text-foreground sm:leading-[1.06]"
        />
      </div>

      {/* One box at the bio's measure, so the signature signs off at its right edge. */}
      <div className="mt-7 max-w-[62ch] sm:mt-8">
        <RichText value={profile.bio} />
        <div className="mt-[1.15em] sm:flex sm:items-end sm:justify-between sm:gap-6">
          <IntroLinks />
          <Signature
            play="intro"
            className="mt-5 w-30 shrink-0 text-foreground sm:mt-0 sm:-mb-1 sm:w-36"
          />
        </div>
      </div>

      <MetaList className="mt-6 items-center meta text-subtle">
        {profile.location && <span>{profile.location}</span>}
        {profile.availability && (
          <span className="text-muted">
            <span
              aria-hidden
              className="mr-2 inline-block size-1.5 rounded-full bg-accent align-[0.1em]"
            />
            {profile.availability}
          </span>
        )}
        <LocalTime className="tabular-nums" />
      </MetaList>
    </header>
  );
}

/**
 * Every way to reach the owner. From `sm` it sits right under the intro, on
 * the first screen; on phones the page moves it below "Selected" so the first
 * project shows first, where a small label names it.
 */
export function IntroContact({
  profile,
  className,
}: {
  profile: Profile;
  className?: string;
}) {
  return (
    <div className={className}>
      <p aria-hidden className="mb-3 meta text-subtle sm:hidden">
        Contact
      </p>
      <ContactRow
        email={profile.email}
        links={profile.links}
        resumeUrl={profile.resumeUrl}
      />
    </div>
  );
}
