import Link from "next/link";
import { VisitorCounter } from "@/flavors/jacquard/components/visitor-counter/visitor-counter";
import { cards } from "@/flavors/jacquard/content";

import { site } from "@/content/site";
import { getProfile } from "@/lib/data";
import { isSanityConfigured } from "@/lib/env";

import { CopyEmail } from "./copy-email";

const more = cards.filter((c) => ["/now", "/ask", "/resume"].includes(c.href));
const SOCIAL = new Set(["GitHub", "LinkedIn"]);

const linkClass =
  "inline-flex min-h-11 items-center text-sm text-ink-soft transition-colors duration-(--duration-ui) ease-out fine:hover:text-madder";

/** The foot of the book: the address, the other cards, and the maker's mark. */
export async function SiteFooter() {
  const profile = await getProfile();
  const social = profile.links.filter((link) => SOCIAL.has(link.label));
  const place = profile.location.split(",")[0] ?? profile.location;

  return (
    <footer
      data-print="hide"
      className="mx-auto mt-section max-w-[90rem] px-gutter pb-10"
    >
      <div className="grid gap-x-8 gap-y-4 border-t border-rule-strong pt-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="flex flex-wrap items-center gap-x-6">
          <a
            href={`mailto:${profile.email}`}
            className="thread-link min-h-11 py-2.5 font-display text-[clamp(1.375rem,1rem+1.2vw,2rem)] leading-tight break-all"
          >
            {profile.email}
          </a>
          <CopyEmail email={profile.email} className={linkClass} />
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6">
            {more.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {item.href === "/ask" ? "Ask, a public Q&A" : item.label}
                </Link>
              </li>
            ))}
            <li>
              <a href="/ask/feed.xml" className={linkClass}>
                RSS
              </a>
            </li>
            {social.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className={linkClass}
                >
                  {link.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-8 gap-y-1 border-t border-rule pt-3 label">
        <p>
          © {new Date().getFullYear()} {site.handle} &nbsp;/&nbsp; Woven in{" "}
          {place}. Set in Tenor Sans, Hanken Grotesk and Chivo Mono.
        </p>
        <div className="flex flex-wrap items-center gap-x-8">
          <VisitorCounter enabled={isSanityConfigured} />
          {/* Another edition has its own root layout, so this is a full page load; a plain link skips the prefetch of the picker's styles and fonts. */}
          <a
            href="/flavors"
            className="thread-link inline-flex min-h-11 items-center fine:hover:text-ink"
          >
            Change edition
          </a>
        </div>
      </div>
    </footer>
  );
}
