import * as React from "react";
import Image from "next/image";
import { toPlainText } from "@portabletext/toolkit";

import type { Profile } from "@/lib/data/types";
import { displayUrl } from "@/lib/url";

import { ResumeLink } from "./resume-link";

const AVATAR_SIZE = 64;

/** The page h1 is "Resume", so the name is an h2. Name, headline and contact line; the avatar takes the top-right corner only when there is one. */
export function ResumeHeader({ profile }: { profile: Profile }) {
  const [firstParagraph] = profile.bio;
  const summary = firstParagraph ? toPlainText([firstParagraph]) : null;
  const contacts = [
    { key: "location", node: profile.location },
    {
      key: "email",
      node: (
        <ResumeLink href={`mailto:${profile.email}`}>
          {profile.email}
        </ResumeLink>
      ),
    },
    ...profile.links.map((link) => ({
      key: link.url,
      node: (
        <ResumeLink
          href={link.url}
          aria-label={`${link.label}: ${displayUrl(link.url)}`}
        >
          {displayUrl(link.url)}
        </ResumeLink>
      ),
    })),
  ];

  return (
    <header>
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h2 className="font-display text-[2.75rem] leading-[0.9] tracking-[-0.02em] sm:text-[3.5rem] print:text-[2.75rem]">
            {profile.name}
          </h2>
          <p className="mt-3 text-lg font-medium text-[#4b4944]">
            {profile.headline}
          </p>
        </div>
        {profile.avatar && (
          <Image
            src={profile.avatar.url}
            alt={profile.avatar.alt}
            width={AVATAR_SIZE}
            height={AVATAR_SIZE}
            placeholder={profile.avatar.blurDataUrl ? "blur" : "empty"}
            blurDataURL={profile.avatar.blurDataUrl}
            className="size-16 shrink-0 rounded-full object-cover grayscale"
          />
        )}
      </div>
      <ul className="mt-5 flex flex-wrap gap-x-2 gap-y-1 text-sm text-[#4b4944]">
        {contacts.map(({ key, node }, index) => (
          <React.Fragment key={key}>
            {index > 0 && (
              <li aria-hidden className="text-[#6f6c65]">
                ·
              </li>
            )}
            <li>{node}</li>
          </React.Fragment>
        ))}
      </ul>
      {summary && <p className="mt-6 max-w-[66ch]">{summary}</p>}
    </header>
  );
}
