import type { Profile } from "@/lib/data/types";
import { Container, ExternalLink } from "@/components/ui";

import { CopyEmailButton } from "./copy-email-button";

/** The closing band: one large line, the email (copy to clipboard) and every profile link. */
export function ContactBand({ profile }: { profile: Profile }) {
  return (
    <section
      aria-labelledby="contact-heading"
      className="border-t border-hairline py-section"
    >
      <Container>
        <h2
          id="contact-heading"
          className="max-w-2xl font-display text-3xl text-balance text-paper"
        >
          Always glad to talk about the next thing to build.
        </h2>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <CopyEmailButton email={profile.email} />
          {profile.links.map((link) => (
            <ExternalLink key={link.url} href={link.url}>
              {link.label}
            </ExternalLink>
          ))}
        </div>
      </Container>
    </section>
  );
}
