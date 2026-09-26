import Link from "next/link";

import { getChangelog, getProfile } from "@/lib/data";
import { isSanityConfigured } from "@/lib/env";
import { DateStamp, Tag } from "@/components/ui";
import { VisitorCounter } from "@/components/visitor-counter";

import { CopyEmail } from "./copy-email";

const indexLinks = [
  { href: "/now", label: "Now" },
  { href: "/ask", label: "Ask" },
  { href: "/ask/feed.xml", label: "RSS" },
  { href: "/resume", label: "Resume" },
];

const linkClass =
  "inline-flex min-h-11 items-center text-sm text-graphite transition-colors duration-(--duration-ui) fine:hover:text-paper";

/**
 * A large sign-off line, then three quiet columns: the site's own index,
 * where else to find me, and the colophon (visitor count, last filed date).
 */
export async function SiteFooter() {
  const [profile, changelog] = await Promise.all([
    getProfile(),
    getChangelog(),
  ]);
  const lastFiled = changelog[0]?.date;

  return (
    <footer data-site-footer className="mt-section border-t border-hairline">
      <div className="mx-auto max-w-[88rem] px-gutter py-section">
        <p className="max-w-[18ch] font-display text-2xl tracking-[-0.02em] text-paper">
          Filed under H. Rajput.
        </p>

        <div className="mt-12 grid gap-10 sm:grid-cols-3">
          <div>
            <Tag>Index</Tag>
            <ul className="mt-4 space-y-2">
              {indexLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Tag>Elsewhere</Tag>
            <div className="mt-4 space-y-2">
              <CopyEmail email={profile.email} />
              <ul className="space-y-2">
                {profile.links.map((link) => (
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

          <div>
            <Tag>Colophon</Tag>
            <div className="mt-4 space-y-3 text-sm text-graphite">
              <VisitorCounter enabled={isSanityConfigured} />
              {lastFiled && (
                <p>
                  Last filed <DateStamp date={lastFiled} precision="day" />
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-hairline pt-6 font-mono text-mono-xs text-pencil">
          <p>© {new Date().getFullYear()} Hemant Rajput</p>
        </div>
      </div>
    </footer>
  );
}
