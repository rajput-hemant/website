import Link from "next/link";
import { VisitorCounter } from "@/flavors/mission/components/visitor-counter/visitor-counter";
import { sections } from "@/flavors/mission/content";
import { revision } from "@/flavors/mission/lib/flight";

import { getProfile, getSiteIdentity } from "@/lib/data";
import { isSanityConfigured } from "@/lib/env";
import { EXTERNAL_REL, safeHref } from "@/lib/safe-href";
import { EditionChoice } from "@/components/semantic/edition-choice";

import { CopyEmail } from "./copy-email";

const SOCIAL = new Set(["GitHub", "LinkedIn"]);
const CHANNELS: Record<string, string> = {
  "/now": "Status report",
  "/ask": "Capcom, a moderated public Q&A",
  "/resume": "Crew record",
};
const channels = sections.filter((s) => s.href in CHANNELS);

const linkClass =
  "inline-flex min-h-11 items-center font-display text-[0.9375rem] font-bold transition-colors duration-(--duration-ui) ease-out fine:hover:text-signal";

/** The foot of the flight plan: channels, the downlink, and the imprint. */
export async function SiteFooter() {
  const site = await getSiteIdentity();
  const profile = await getProfile();
  const social = profile.links.filter((link) => SOCIAL.has(link.label));
  const { plan } = revision(new Date(), site.initials);

  return (
    <footer
      data-print="hide"
      className="mx-auto mt-section max-w-[90rem] px-gutter pb-10"
    >
      <div className="grid gap-x-6 gap-y-8 border-t-2 border-ink pt-7 md:grid-cols-12">
        <nav aria-label="Channels" className="md:col-span-3">
          <h2 className="label">Channels</h2>
          <ul className="mt-2">
            {channels.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {item.label}
                  <small className="ml-2 font-sans text-[0.8125rem] font-normal text-ink-soft max-sm:hidden">
                    {CHANNELS[item.href]}
                  </small>
                </Link>
              </li>
            ))}
            <li>
              <a href="/ask/feed.xml" className={linkClass}>
                RSS
              </a>
            </li>
          </ul>
        </nav>
        <div className="md:col-span-4">
          <h2 className="label">Downlink</h2>
          <ul className="mt-2">
            <li className="flex flex-wrap items-center gap-x-4">
              <a
                href={`mailto:${profile.email}`}
                className={`${linkClass} break-all`}
              >
                {profile.email}
              </a>
              <CopyEmail
                email={profile.email}
                className="inline-flex min-h-11 items-center text-sm text-ink-soft fine:hover:text-signal"
              />
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
        </div>
        <div className="flex flex-col gap-2 label md:col-span-5 md:items-end md:justify-end md:text-right">
          <p>
            Flight plan {plan} · {profile.location}
          </p>
          <p>
            © {new Date().getFullYear()} {site.handle} · Set in Chivo, Public
            Sans and Overpass Mono
          </p>
          <div className="flex flex-wrap items-center gap-x-8 md:justify-end">
            <VisitorCounter enabled={isSanityConfigured} />
            <EditionChoice>
              {/* Another edition has its own root layout, so this is a full page load; a plain link skips the prefetch of the picker's styles and fonts. */}
              <a
                href="/flavors"
                className="rule-link inline-flex min-h-11 items-center fine:hover:text-ink"
              >
                Change edition
              </a>
            </EditionChoice>
          </div>
        </div>
      </div>
    </footer>
  );
}
