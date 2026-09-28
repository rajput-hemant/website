import Image from "next/image";
import { MetaList, RichText } from "@/flavors/drawing-set/components/ui";

import type { Profile } from "@/lib/data/types";

/**
 * "General notes": the bio as numbered notes, one per paragraph block, the
 * way a drawing's general notes are genuinely numbered. An avatar (only
 * when the profile has one) sits as a small framed print beside them.
 */
export function GeneralNotes({ profile }: { profile: Profile }) {
  return (
    <header className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-start">
      <div className="max-w-[64ch]">
        <ol className="grid gap-4">
          {profile.bio.map((block, index) => (
            <li key={block._key ?? index} className="flex gap-3">
              <span
                aria-hidden
                className="pt-[0.3em] font-mono text-mono-xs text-ink-faint tabular-nums"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <RichText value={[block]} className="max-w-none" />
            </li>
          ))}
        </ol>
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
        <div className="order-first justify-self-start border border-line p-1.5 sm:order-none sm:justify-self-end">
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
