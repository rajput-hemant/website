import Link from "next/link";
import { VisitorCounter } from "@/flavors/calibre/components/visitor-counter/visitor-counter";
import { more } from "@/flavors/calibre/content";
import { calibre } from "@/flavors/calibre/lib/movement";

import { getProfile, getSiteIdentity } from "@/lib/data";
import { isSanityConfigured } from "@/lib/env";
import { EXTERNAL_REL, safeHref } from "@/lib/safe-href";
import { EditionChoice } from "@/components/semantic/edition-choice";

import { CopyEmail } from "./copy-email";

const SOCIAL = new Set(["GitHub", "LinkedIn"]);

const linkClass =
  "inline-flex min-h-11 items-center spec text-spec-lg text-ink transition-colors duration-(--duration-ui) fine:hover:text-steel";

/** The caseback's engraving: the address, the other pages, and where the calibre was regulated. */
export async function SiteFooter() {
  const site = await getSiteIdentity();
  const profile = await getProfile();
  const social = profile.links.filter((link) => SOCIAL.has(link.label));
  const town = profile.location.split(",")[0];

  return (
    <footer data-print="hide" className="mt-section border-t border-line">
      <div className="mx-auto grid max-w-[96rem] gap-x-8 gap-y-4 px-gutter pt-7 pb-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="flex flex-wrap items-center gap-x-5">
          <a
            href={`mailto:${profile.email}`}
            className="inline-flex min-h-11 items-center numeral text-[1.375rem] break-all fine:hover:text-steel"
          >
            {profile.email}
          </a>
          <CopyEmail
            email={profile.email}
            className={`${linkClass} text-soft`}
          />
        </div>
        <nav aria-label="More pages">
          <ul className="flex flex-wrap gap-x-7">
            {more.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {item.label}
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
                  href={safeHref(link.url)}
                  target="_blank"
                  rel={EXTERNAL_REL}
                  className={linkClass}
                >
                  {link.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-1 border-t border-line pt-4 text-sm text-soft lg:col-span-2">
          <p>
            © {new Date().getFullYear()} {site.name} · Calibre{" "}
            {calibre(site.initials)} · regulated in {town} · set in Bodoni Moda
            and Alegreya Sans
          </p>
          <div className="flex flex-wrap items-center gap-x-8">
            <VisitorCounter enabled={isSanityConfigured} />
            <EditionChoice>
              {/* Another root layout: a full page load, so prefetching it only preloads unused CSS and fonts. */}
              <Link
                href="/flavors"
                prefetch={false}
                className="inline-flex min-h-11 items-center underline decoration-line-strong underline-offset-[0.3em] fine:hover:text-ink"
              >
                Change edition
              </Link>
            </EditionChoice>
          </div>
        </div>
      </div>
    </footer>
  );
}
