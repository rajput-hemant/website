import Link from "next/link";
import { VisitorCounter } from "@/flavors/press/components/visitor-counter/visitor-counter";
import { sheets } from "@/flavors/press/content";
import { route } from "@/flavors/press/lib/utils";

import { site } from "@/content/site";
import { getProfile } from "@/lib/data";
import { isSanityConfigured } from "@/lib/env";

import { CopyEmail } from "./copy-email";

const more = sheets.filter((s) => ["/now", "/ask", "/resume"].includes(s.href));
const SOCIAL = new Set(["GitHub", "LinkedIn"]);

const linkClass =
  "inline-flex min-h-11 items-center text-sm leading-none font-semibold underline decoration-transparent decoration-3 underline-offset-[0.45em] transition-[text-decoration-color] duration-(--duration-ui) fine:hover:decoration-pink";

/** The foot of the sheet: the address large, the other sheets, and the imprint. */
export async function SiteFooter() {
  const profile = await getProfile();
  const social = profile.links.filter((link) => SOCIAL.has(link.label));

  return (
    <footer data-print="hide" className="mt-section">
      <div className="mx-auto grid max-w-[96rem] gap-x-8 gap-y-6 px-gutter pb-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="grid gap-3">
          <p className="slug">Reach the press</p>
          <a
            href={`mailto:${profile.email}`}
            className="w-fit text-[clamp(1.75rem,1rem+2.6vw,3.25rem)] leading-none font-extrabold tracking-[-0.03em] break-all underline decoration-pink decoration-3 underline-offset-[0.18em] fine:hover:decoration-blue"
          >
            {profile.email}
          </a>
          <CopyEmail email={profile.email} className={`${linkClass} w-fit`} />
        </div>
        <nav aria-label="More sheets">
          <ul className="flex flex-wrap gap-x-6">
            {more.map((item) => (
              <li key={item.href}>
                <Link href={route(item.href)} className={linkClass}>
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
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2 border-t border-rule pt-4 slug lg:col-span-2">
          <p>
            © {new Date().getFullYear()} {site.handle} &nbsp;/&nbsp; Printed in{" "}
            {profile.location.split(",")[0]}. Set in Libre Franklin and Martian
            Mono. Two plates, one image.
          </p>
          <div className="flex flex-wrap items-center gap-x-8">
            <VisitorCounter enabled={isSanityConfigured} />
            {/* Another edition has its own root layout, so this is a full page load. */}
            <Link
              href="/flavors"
              className="inline-flex min-h-11 items-center underline decoration-rule underline-offset-[0.3em] fine:hover:text-ink"
            >
              Change edition
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
