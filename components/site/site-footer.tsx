import type { Link } from "@/lib/data/types";
import { isVisitCounterConfigured } from "@/lib/visits/store";
import { Disclosure } from "@/components/ui/disclosure";
import { VisitorCounter } from "@/components/visitor-counter/visitor-counter";

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

const itemClass = "inline-flex min-h-10 items-center";

/**
 * One quiet line: the year, the page's markdown mirror and the colophon
 * (behind a small disclosure) on the left, the visitor count on the right. Social
 * links take a second line of their own (except on home, whose contact row
 * already lists them), so the first line reads the same on every page. The
 * header's wordmark names the site, so the copyright line doesn't repeat it.
 */
export function SiteFooter({
  links = [],
  showMarkdownLink = true,
}: SiteFooterProps) {
  return (
    <footer data-site-footer className="mt-section font-sans">
      <Container size="frame">
        <div className="relative flex flex-wrap items-center justify-between gap-x-8 border-t border-hairline py-5 text-sm text-subtle sm:py-6">
          <div className="flex flex-wrap items-center gap-x-5 max-sm:basis-full">
            <p className={itemClass}>
              ©&nbsp;
              <CurrentYear buildYear={new Date().getFullYear()} />
            </p>
            {showMarkdownLink && (
              <MarkdownLink
                className={`${itemClass} hover:text-foreground active:text-foreground`}
              />
            )}
            <Colophon />
          </div>
          <VisitorCounter
            enabled={isVisitCounterConfigured()}
            className="max-sm:order-last sm:text-right"
          />
          <HiddenOn path="/">
            <SocialLinks links={links} className="basis-full gap-x-5 gap-y-0" />
          </HiddenOn>
        </div>
      </Container>
    </footer>
  );
}

/**
 * Type and stack credits. From `sm` they open upward as a small panel above
 * the summary; on phones the disclosure takes a line of its own and
 * expands in place, so it never covers the footer.
 */
function Colophon() {
  return (
    <Disclosure
      summary="Colophon"
      chevron="end"
      className="max-sm:basis-full sm:relative"
      summaryClassName="min-h-10 w-fit items-center gap-1.5 transition-colors hover:text-foreground active:text-foreground group-open/disclosure:text-foreground"
      contentClassName="max-w-[40ch] pb-2 text-xs leading-relaxed text-muted sm:absolute sm:bottom-full sm:left-0 sm:z-10 sm:-mb-3 sm:w-max sm:max-w-[min(20rem,calc(100vw-2*var(--gutter)))] sm:rounded-lg sm:border sm:border-hairline sm:bg-background sm:px-3.5 sm:py-2.5 sm:shadow-popover"
    >
      Set in <span className="font-sans">Bricolage Grotesque</span>,{" "}
      <span className="font-serif italic">Fraunces</span> &amp;{" "}
      <span className="font-mono text-[0.9em]">Martian Mono</span>; built with
      Next.js &amp; Sanity.
    </Disclosure>
  );
}
