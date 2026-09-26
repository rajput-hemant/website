import Image from "next/image";

import type { Profile } from "@/lib/data/types";
import { MetaList, RichText } from "@/components/ui";

/**
 * The editorial lede: bio prose at reading measure, with a stylised avatar
 * (only when the profile has one) and the location / availability line.
 * No drop cap, no author photo treatment; the avatar is a small framed print.
 */
export function Bio({ profile }: { profile: Profile }) {
  return (
    <header className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-start">
      <div className="max-w-[64ch]">
        <RichText value={profile.bio} />
        <MetaList
          className="mt-6"
          items={[
            ...(profile.location
              ? [{ label: "Location", value: profile.location }]
              : []),
            ...(profile.availability
              ? [
                  {
                    label: "Availability",
                    value: (
                      <>
                        <span
                          aria-hidden
                          className="mr-2 inline-block size-1.5 rounded-full bg-accent align-[0.1em]"
                        />
                        {profile.availability}
                      </>
                    ),
                  },
                ]
              : []),
          ]}
        />
      </div>
      {profile.avatar && (
        <div className="order-first justify-self-start border border-hairline p-1.5 sm:order-none sm:justify-self-end">
          <Image
            src={profile.avatar.url}
            alt={profile.avatar.alt}
            width={96}
            height={96}
            placeholder={profile.avatar.blurDataUrl ? "blur" : "empty"}
            blurDataURL={profile.avatar.blurDataUrl}
            className="size-24 object-cover grayscale"
          />
        </div>
      )}
    </header>
  );
}
