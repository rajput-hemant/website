import Link from "next/link";
import { VisitorCounter } from "@/flavors/drawing-set/components/visitor-counter";

import { site } from "@/content/site";
import { getChangelog, getProfile } from "@/lib/data";
import { isSanityConfigured } from "@/lib/env";

import { CopyEmail } from "./copy-email";
import { FooterTitleBlock } from "./footer-title-block";

const setLinks = [
  { href: "/now", label: "Now" },
  { href: "/ask", label: "Ask" },
  { href: "/ask/feed.xml", label: "RSS" },
  { href: "/resume", label: "Resume" },
  // Another edition has its own root layout, so this is a full page load.
  { href: "/flavors", label: "Change edition" },
] as const;

const SOCIAL = new Set(["GitHub", "LinkedIn"]);

const headingClass =
  "font-mono text-mono-xs tracking-[0.08em] text-ink-faint uppercase";
const footerLinkClass =
  "group relative inline-flex min-h-11 items-center font-display text-sm leading-none font-semibold tracking-[0.09em] text-ink-soft uppercase [font-stretch:72%] transition-colors duration-200 after:absolute after:inset-x-0 after:bottom-2.5 after:h-px after:origin-left after:scale-x-0 after:bg-accent motion:after:transition-transform motion:after:duration-200 motion:after:ease-glide fine:hover:text-ink fine:hover:after:scale-x-100";

/** `2026-09-14` as the drawing revision `26.09`. */
function revision(date: string | undefined): string {
  if (!date) return "--";
  const [year = "", month = ""] = date.split("-");
  return `${year.slice(2)}.${month}`;
}

/**
 * The page end: where else to go and how to reach me on the left, the title
 * block on the right (full width on mobile), all from real data.
 */
export async function SiteFooter() {
  const [profile, changelog] = await Promise.all([
    getProfile(),
    getChangelog(),
  ]);
  const social = profile.links.filter((link) => SOCIAL.has(link.label));
  const rows = [
    {
      label: "Engineer",
      value: <span className="normal-case">{site.handle}</span>,
    },
    ...(profile.availability
      ? [
          {
            label: "Status",
            value: (
              <span className="text-accent">● {profile.availability}</span>
            ),
          },
        ]
      : []),
    { label: "Location", value: profile.location },
  ];

  return (
    <footer
      data-site-footer
      data-print="hide"
      className="relative mt-section border-t border-line px-4 pt-10 pb-8 md:px-12"
    >
      <div className="flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
        <div className="grid grid-cols-2 gap-8 sm:gap-16">
          <nav aria-label="More sheets">
            <h2 className={headingClass}>Set</h2>
            <ul className="mt-2">
              {setLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLinkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className={headingClass}>Contact</h2>
            <ul className="mt-2">
              <li>
                <CopyEmail email={profile.email} className={footerLinkClass} />
              </li>
              {social.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className={footerLinkClass}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <FooterTitleBlock rows={rows} rev={revision(changelog[0]?.date)} />
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 font-mono text-mono-xs tracking-[0.08em] text-ink-faint uppercase">
        <p>
          © {new Date().getFullYear()} {site.handle}
        </p>
        <VisitorCounter enabled={isSanityConfigured} />
      </div>
    </footer>
  );
}
