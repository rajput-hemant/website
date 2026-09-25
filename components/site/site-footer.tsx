import { site } from "@/content/site";
import type { Link } from "@/lib/data/types";
import { ExternalLink } from "@/components/ui/external-link";

import { Container } from "./container";
import { MarkdownLink } from "./markdown-link";

export type SiteFooterProps = {
  /** Social profiles, from `Profile.links`. Nothing renders when absent. */
  links?: readonly Link[];
};

export function SiteFooter({ links }: SiteFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer data-site-footer className="mt-section font-sans">
      <Container>
        <div className="grid gap-8 border-t border-border pt-10 pb-12">
          {links && links.length > 0 && (
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {links.map((link) => (
                <li key={link.url}>
                  <ExternalLink href={link.url}>{link.label}</ExternalLink>
                </li>
              ))}
            </ul>
          )}
          <p className="max-w-[44ch] text-sm text-muted">
            Set in <span className="font-sans">Bricolage Grotesque</span>,{" "}
            <span className="font-serif italic">Fraunces</span> &amp;{" "}
            <span className="font-mono text-[0.84em]">Martian Mono</span>. Built
            with Next.js &amp; Sanity.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 meta text-subtle">
            <p>
              © {year} {site.name}
            </p>
            <MarkdownLink />
          </div>
        </div>
      </Container>
    </footer>
  );
}
