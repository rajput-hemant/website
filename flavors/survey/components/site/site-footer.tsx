import Link from "next/link";
import { CopyEmail } from "@/flavors/survey/components/site/copy-email";
import { VisitorCounter } from "@/flavors/survey/components/visitor-counter";
import { places } from "@/flavors/survey/content";

import { site } from "@/content/site";
import { getProfile } from "@/lib/data";
import { isSanityConfigured } from "@/lib/env";
import { formatMonthYear } from "@/lib/format";

const more = places.filter((p) => ["/now", "/ask"].includes(p.href));
const SOCIAL = new Set(["GitHub", "LinkedIn"]);

const linkClass =
  "inline-flex min-h-11 items-center text-ink-soft transition-colors duration-150 fine:hover:text-ink";

/**
 * The sheet's bottom margin: the edition line, every way off the sheet, and
 * the small print (edition switch, visitor count).
 */
export async function SiteFooter() {
  const profile = await getProfile();
  const social = profile.links.filter((link) => SOCIAL.has(link.label));
  const edition = formatMonthYear(new Date());

  return (
    <footer data-print="hide" className="mt-section">
      <div className="mx-auto max-w-[90rem] px-gutter pb-10">
        <div className="caps flex flex-wrap items-center justify-between gap-x-8 gap-y-2 border-t-[1.5px] border-rule-strong pt-3">
          <p className="flex min-h-11 items-center gap-2.5 text-wood">
            <span aria-hidden className="size-1.5 rounded-full bg-current" />
            {profile.availability ?? "Available for work"}
          </p>
          <ul className="flex flex-wrap gap-x-6">
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
            <li>
              <CopyEmail
                email={profile.email}
                className={`caps ${linkClass}`}
              />
            </li>
          </ul>
        </div>
        <div className="caps mt-4 flex flex-wrap items-center justify-between gap-x-8 gap-y-2 text-ink-faint">
          <p>
            © {new Date().getFullYear()} {site.handle} · Edition of {edition}
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            <VisitorCounter enabled={isSanityConfigured} />
            {/* Another edition has its own root layout, so this is a full page load. */}
            <Link
              href="/flavors"
              prefetch={false}
              className="inline-flex min-h-11 items-center underline decoration-contour underline-offset-[0.35em] fine:hover:text-ink"
            >
              Change edition
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
