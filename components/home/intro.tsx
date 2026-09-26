import Link from "next/link";

import { introLinks } from "@/content/site";
import type { Profile } from "@/lib/data/types";
import { Signature } from "@/components/signature/signature";
import { Avatar } from "@/components/ui/avatar";
import { MetaList } from "@/components/ui/meta-list";
import { RichText } from "@/components/ui/portable-text";

import { ContactRow } from "./contact-row";
import { LocalTime } from "./local-time";

const AVATAR_SIZE = 64;

/**
 * Keeps hyphenated words such as "pixel-perfect" whole at display size. A word
 * joiner rather than a nowrap span, so the text stays one run and balances.
 */
const keepHyphenatedWords = (text: string) =>
  text.replace(/(\S)-(?=\S)/g, "$1-⁠");

/** The bio's closing line, whose links double as the page's navigation. */
function IntroLinks() {
  return (
    <p className="prose mt-[1.15em]">
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
 * and search in visually hidden text. Then the bio, signed, and every way to
 * get in touch; nothing here is behind a disclosure.
 */
export function Intro({ profile }: { profile: Profile }) {
  const headline = profile.headline || profile.name;

  return (
    <header className="pt-14 sm:pt-24">
      <div className="flex items-start gap-4 sm:gap-6">
        <Avatar
          image={profile.avatar}
          size={AVATAR_SIZE}
          preload
          className="mt-1.5 max-sm:size-12!"
        />
        <h1 className="display text-[clamp(2.25rem,1.6rem+2.8vw,3.5rem)] leading-[1.06] font-light text-balance text-foreground">
          {headline !== profile.name && (
            <span className="sr-only">{profile.name}: </span>
          )}
          {keepHyphenatedWords(headline)}
        </h1>
      </div>

      <div className="mt-8 sm:mt-10">
        <RichText value={profile.bio} />
        <IntroLinks />
      </div>

      <Signature className="mt-6 w-30 text-foreground sm:w-40" />

      <MetaList className="mt-8 items-center meta text-subtle">
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

      <ContactRow
        email={profile.email}
        links={profile.links}
        resumeUrl={profile.resumeUrl}
        className="mt-4"
      />
    </header>
  );
}
