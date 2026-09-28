import Link from "next/link";
import { VisitorCounter } from "@/flavors/timetable/components/visitor-counter";
import { platforms } from "@/flavors/timetable/content";

import { site } from "@/content/site";
import { getProfile, getProjects } from "@/lib/data";
import { isSanityConfigured } from "@/lib/env";

import { CopyEmail } from "./copy-email";
import { PlatformPlate } from "./nav-links";

const more = platforms.filter((p) =>
  ["/now", "/ask", "/resume"].includes(p.href)
);

const SOCIAL = new Set(["GitHub", "LinkedIn"]);

const headingClass =
  "font-mono text-mono-xs font-semibold tracking-[0.1em] text-ink-soft uppercase";

const linkClass =
  "group inline-flex min-h-11 items-center gap-2.5 text-[0.9375rem] leading-none font-semibold text-ink underline decoration-transparent underline-offset-[0.3em] transition-colors duration-150 fine:hover:decoration-current";

/**
 * The foot of the concourse: the other platforms, how to reach me, and the
 * small print (edition switch, passenger count). Every value is real data.
 */
export async function SiteFooter() {
  const [profile, projects] = await Promise.all([getProfile(), getProjects()]);
  const social = profile.links.filter((link) => SOCIAL.has(link.label));
  const validFrom = Math.min(
    new Date().getFullYear(),
    ...projects.map((p) => p.year)
  );

  return (
    <footer data-site-footer data-print="hide" className="mt-section">
      <div className="mx-auto max-w-[100rem] px-gutter pb-10">
        <div className="grid gap-10 border-t-[3px] border-rule-strong pt-8 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="flex items-center gap-2.5 text-h3 font-extrabold tracking-[-0.01em]">
              <span
                aria-hidden
                className="size-3 flex-none rounded-full bg-signal shadow-[0_0_0_1.5px_var(--color-ink)]"
              />
              {profile.availability ?? "In service"}
            </p>
            <p className="mt-3 max-w-[36ch] text-ink-soft">
              {profile.location}. Email for work, or ask a question in public at
              the information desk.
            </p>
          </div>

          <nav aria-label="More platforms" className="lg:col-span-4">
            <h2 className={headingClass}>Platforms</h2>
            <ul className="mt-2">
              {more.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    <PlatformPlate n={item.platform} className="text-ink" />
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href="/ask/feed.xml" className={linkClass}>
                  RSS feed
                </a>
              </li>
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className={headingClass}>Contact</h2>
            <ul className="mt-2">
              <li>
                <CopyEmail email={profile.email} className={linkClass} />
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
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-rule pt-5 font-mono text-mono-xs tracking-[0.08em] text-ink-soft uppercase">
          <p>
            © {new Date().getFullYear()} {site.handle} · Timetable valid from{" "}
            {validFrom}
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            <VisitorCounter enabled={isSanityConfigured} />
            {/* Another edition has its own root layout, so this is a full page load. */}
            <Link
              href="/flavors"
              className="inline-flex min-h-11 items-center underline decoration-rule-strong underline-offset-[0.3em] fine:hover:text-ink"
            >
              Change edition
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
