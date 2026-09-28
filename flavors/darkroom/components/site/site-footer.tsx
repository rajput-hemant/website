import Link from "next/link";
import { VisitorCounter } from "@/flavors/darkroom/components/visitor-counter/visitor-counter";
import { more } from "@/flavors/darkroom/content";
import { ROLL, STOCK } from "@/flavors/darkroom/lib/roll";

import { site } from "@/content/site";
import { getProfile } from "@/lib/data";
import { isSanityConfigured } from "@/lib/env";

import { CopyEmail } from "./copy-email";

const SOCIAL = new Set(["GitHub", "LinkedIn"]);

const linkClass =
  "inline-flex min-h-11 items-center text-sm leading-none text-soft transition-colors duration-(--duration-ui) fine:hover:text-ink";

/** The end of the roll: the address, the other pages, and the stock it was shot on. */
export async function SiteFooter() {
  const profile = await getProfile();
  const social = profile.links.filter((link) => SOCIAL.has(link.label));

  return (
    <footer data-print="hide" className="mt-section border-t border-line">
      <div className="mx-auto grid max-w-[96rem] gap-x-8 gap-y-4 px-gutter pt-7 pb-10 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center">
        <div className="flex flex-wrap items-center gap-x-5">
          <a
            href={`mailto:${profile.email}`}
            className="inline-flex min-h-11 items-center text-[1.0625rem] font-semibold break-all fine:hover:underline fine:hover:decoration-grease"
          >
            {profile.email}
          </a>
          <CopyEmail email={profile.email} className={`${linkClass} edge`} />
        </div>
        <nav aria-label="More pages">
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
          </ul>
        </nav>
        <p className="edge lg:text-right">End of roll {ROLL}</p>
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-1 border-t border-line pt-4 edge lg:col-span-3">
          <p>
            © {new Date().getFullYear()} {site.handle} / Shot on {STOCK},
            printed in {profile.location.split(",")[0]} / Set in Schibsted
            Grotesk and Sofia Sans
          </p>
          <div className="flex flex-wrap items-center gap-x-8">
            <VisitorCounter enabled={isSanityConfigured} />
            {/* Another root layout: a full page load, so prefetching it only preloads unused CSS and fonts. */}
            <Link
              href="/flavors"
              prefetch={false}
              className="inline-flex min-h-11 items-center underline decoration-line-strong underline-offset-[0.3em] fine:hover:text-ink"
            >
              Change edition
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
