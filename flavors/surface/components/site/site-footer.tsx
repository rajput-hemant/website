import Link from "next/link";
import {
  KeyLink,
  Legend,
  LegendRow,
} from "@/flavors/surface/components/ui/primitives";
import { VisitorReadout } from "@/flavors/surface/components/visitor-counter/visitor-readout";
import { channels, MODEL } from "@/flavors/surface/content";

import { site } from "@/content/site";
import { getChangelog, getProfile } from "@/lib/data";
import { isSanityConfigured } from "@/lib/env";

import { SceneSwitch, SoundSwitch } from "./switches";

const aux = channels.slice(5);
const SOCIAL = new Set(["GitHub", "LinkedIn"]);

/** `2026-09-14` as the instrument revision `2026.09`. */
const revision = (date?: string) =>
  date ? date.slice(0, 7).replace("-", ".") : "--";

/**
 * The rear panel: auxiliary channels, the visit counter, the service switches
 * (3D and clicks), and the serial plate with a way to change edition.
 */
export async function SiteFooter() {
  const [profile, changelog] = await Promise.all([
    getProfile(),
    getChangelog(),
  ]);
  const social = profile.links.filter((link) => SOCIAL.has(link.label));

  return (
    <footer
      data-print="hide"
      className="seam-t mt-section px-4 pt-8 pb-8 md:px-6 lg:px-12"
    >
      <div className="grid gap-4 md:grid-cols-12">
        <nav
          aria-labelledby="aux-legend"
          className="mod p-4 md:col-span-12 xl:col-span-5"
        >
          <Legend id="aux-legend">Auxiliary channels</Legend>
          <ul className="mt-3 flex flex-wrap gap-2">
            {aux.map((item) => (
              <li key={item.href}>
                <KeyLink href={item.href} size="sm">
                  <span aria-hidden className="font-medium text-ink-2">
                    {item.ch}
                  </span>
                  {item.label}
                </KeyLink>
              </li>
            ))}
            <li>
              <KeyLink href="/ask/feed.xml" size="sm">
                RSS
              </KeyLink>
            </li>
          </ul>
        </nav>

        <div className="mod flex flex-col justify-center p-3 md:col-span-6 xl:col-span-3">
          <VisitorReadout enabled={isSanityConfigured} />
        </div>

        <section
          aria-labelledby="service-legend"
          className="mod flex items-center justify-between gap-4 p-4 md:col-span-6 xl:col-span-4"
        >
          <Legend id="service-legend">Service</Legend>
          <div className="flex gap-6">
            <SceneSwitch />
            <SoundSwitch />
          </div>
        </section>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <Legend>
          <LegendRow
            parts={[site.handle, MODEL, `Rev ${revision(changelog[0]?.date)}`]}
          />
        </Legend>
        <ul className="flex flex-wrap items-center gap-2">
          {social.map((link) => (
            <li key={link.url}>
              <KeyLink href={link.url} size="sm">
                {link.label}
              </KeyLink>
            </li>
          ))}
          <li>
            {/* Another edition has its own root layout, so this is a full page load. */}
            <Link href="/flavors" prefetch={false} className="key key-sm">
              Change edition
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
