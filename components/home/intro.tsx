import type { Profile } from "@/lib/data/types";
import { Avatar } from "@/components/avatar";
import { MetaList } from "@/components/experience/meta-list";
import { RichText } from "@/components/portable-text";

import { ContactLinks } from "./contact-links";
import { LocalTime } from "./local-time";

const AVATAR_SIZE = 56;

/**
 * The top of the home page. The avatar, when present, leads the name row; the
 * row keeps the avatar's height either way, so toggling it never moves the
 * text below.
 */
export function Intro({ profile }: { profile: Profile }) {
  return (
    <header className="pt-16 pb-4 sm:pt-24">
      <div className="flex min-h-14 items-center gap-3">
        <Avatar image={profile.avatar} size={AVATAR_SIZE} preload />
        <h1
          // Plain string: tailwind-merge mistakes `text-display` for a colour and drops it.
          className={`display text-display text-foreground ${
            // Narrow phones: keep the name on one line beside the avatar.
            profile.avatar ? "max-sm:text-[2.25rem]" : ""
          }`}
        >
          {profile.name}
        </h1>
      </div>

      {profile.headline && (
        <p className="mt-5 max-w-[34ch] text-xl text-muted">
          {profile.headline}
        </p>
      )}

      <RichText value={profile.bio} className="mt-8" />

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
        <LocalTime />
      </MetaList>

      <ContactLinks
        email={profile.email}
        links={profile.links}
        className="mt-6"
      />
    </header>
  );
}
