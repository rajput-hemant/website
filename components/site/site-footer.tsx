import type { Link } from "@/lib/data/types";
import { Signature } from "@/components/signature/signature";

import { Container } from "./container";
import { CurrentYear } from "./current-year";
import { HiddenOn } from "./hidden-on";
import { MarkdownLink } from "./markdown-link";
import { SocialLinks } from "./social-links";

export type SiteFooterProps = {
  /** Social profiles, from `Profile.links`. Nothing renders when absent. */
  links?: readonly Link[];
  /** Off where the current URL has no page behind it, such as a 404. */
  showMarkdownLink?: boolean;
};

/**
 * Social links (except on home, whose intro already lists them beside the
 * email), then one quiet line: year and colophon on the left, the page's
 * markdown mirror on the right. The header's wordmark names the site, so the
 * copyright line doesn't repeat it.
 */
export function SiteFooter({
  links = [],
  showMarkdownLink = true,
}: SiteFooterProps) {
  return (
    <footer data-site-footer className="mt-section font-sans">
      <Container>
        <div className="grid gap-6 border-t border-border pt-8 pb-10 sm:pb-12">
          <HiddenOn path="/">
            <SocialLinks links={links} className="gap-x-6 text-sm" />
          </HiddenOn>
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 text-sm text-subtle">
            <p className="max-w-[46ch]">
              ©&nbsp;
              <CurrentYear buildYear={new Date().getFullYear()} />. Set in{" "}
              <span className="font-sans">Bricolage Grotesque</span>,{" "}
              <span className="font-serif italic">Fraunces</span> &amp;{" "}
              <span className="font-mono text-[0.84em]">Martian Mono</span>;
              built with Next.js &amp; Sanity.
              <Signature
                play="hover"
                decorative
                className="ml-2 inline-block w-14 align-[-0.35em] text-muted [--signature-stroke:1px]"
              />
            </p>
            {showMarkdownLink && (
              <MarkdownLink className="text-muted hover:text-foreground" />
            )}
          </div>
        </div>
      </Container>
    </footer>
  );
}
