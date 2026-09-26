import { ChannelSelector } from "@/flavors/surface/components/knob/channel-selector";
import {
  KeyLink,
  Led,
  Legend,
  LegendRow,
  Screws,
} from "@/flavors/surface/components/ui/primitives";
import { pad2, Seg } from "@/flavors/surface/components/ui/seg";
import { MODEL, STACK } from "@/flavors/surface/content";
import { toPlainText } from "@portabletext/toolkit";

import { site } from "@/content/site";
import type { Experience, Profile } from "@/lib/data/types";
import { formatMonthYear } from "@/lib/format";

import { CopyEmail } from "./copy-email";

type HeroProps = {
  profile: Profile;
  current: Experience | undefined;
  since: number;
  projects: number;
  roles: number;
  revision: string;
};

const SOCIAL = new Set(["GitHub", "LinkedIn"]);

/**
 * The faceplate. The headline is the h1; the channel selector is the
 * signature; under them a strip of modules states true facts: the readout,
 * status, and the aluminium rating plate.
 */
export function Hero({
  profile,
  current,
  since,
  projects,
  roles,
  revision,
}: HeroProps) {
  const social = profile.links.filter((link) => SOCIAL.has(link.label));
  const bio = toPlainText(profile.bio);

  return (
    <div className="relative grid grid-cols-1 gap-x-6 gap-y-6 px-4 pt-5 pb-8 md:px-6 lg:min-h-[calc(100svh-var(--header-height))] lg:grid-cols-12 lg:grid-rows-[auto_minmax(0,1fr)_auto] lg:gap-y-5 lg:px-12 lg:pt-6 lg:pb-8">
      <Screws className="max-lg:hidden" />

      <div className="seam-b flex flex-col gap-1.5 pb-3.5 sm:flex-row sm:justify-between lg:col-span-12 lg:px-2.5">
        <Legend>
          <LegendRow
            parts={[`Model ${MODEL}`, `Rev ${revision}`, "Fullstack engineer"]}
          />
        </Legend>
        <Legend>
          <LegendRow parts={[profile.location, "UTC+05:30", "Remote"]} />
        </Legend>
      </div>

      <div className="flex flex-col justify-between gap-10 pt-2 lg:col-span-7 lg:pt-4">
        <h1 className="-ml-[0.04em] max-w-[14ch] text-[clamp(2.75rem,0.9rem+4.6vw,5.5rem)] leading-[0.9] tracking-[-0.02em]">
          {profile.headline}
        </h1>
        <div>
          <p className="max-w-[52ch] text-ink-2">{bio}</p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <KeyLink href="/projects">Browse projects</KeyLink>
            <KeyLink href="/ask">Ask a question</KeyLink>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center lg:col-span-5 lg:min-h-0">
        <ChannelSelector className="max-w-[34rem]" />
      </div>

      <section aria-label="Readout" className="mod p-2.5 lg:col-span-6">
        <div className="glass px-5 pt-3 pb-3">
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3.5 sm:flex sm:gap-x-9">
            {[
              { label: "Ch", value: "00", sr: "Channel 00, home" },
              { label: "Since", value: String(since) },
              { label: "Projects", value: pad2(projects) },
              { label: "Roles", value: pad2(roles) },
            ].map((field) => (
              <div key={field.label}>
                <dt className="legend mb-1.5 text-[0.59375rem]">
                  {field.label}
                </dt>
                <dd>
                  <Seg
                    value={field.value}
                    label={field.sr}
                    className="h-10 md:h-12"
                  />
                </dd>
              </div>
            ))}
          </dl>
          {current && (
            <p className="matrix mt-2.5 border-t border-lcd-ink-2/35 pt-2 text-[0.9375rem] leading-tight sm:truncate">
              Now: {current.title} at {current.company},{" "}
              {formatMonthYear(current.startDate)} to now
            </p>
          )}
        </div>
      </section>

      <section
        aria-labelledby="status-legend"
        className="mod flex flex-col justify-between gap-3 px-[18px] py-4 lg:col-span-3"
      >
        <Legend id="status-legend">Status</Legend>
        <p className="flex items-center gap-2.5 font-display text-xl leading-none">
          <Led on className="size-2" />
          {profile.availability ?? "Available for work"}
        </p>
        <CopyEmail email={profile.email} />
        <ul className="flex flex-wrap gap-2">
          {social.map((link) => (
            <li key={link.url}>
              <KeyLink href={link.url} size="sm">
                {link.label}
              </KeyLink>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-label="Rating plate"
        className="rating-plate px-[22px] py-3.5 lg:col-span-3"
      >
        <div className="flex items-baseline justify-between border-b border-black/25 pb-[7px]">
          <b className="font-display text-[1.0625rem] leading-none tracking-[0.06em]">
            {MODEL}
          </b>
          <span className="font-display text-[0.625rem] leading-none tracking-[0.14em] uppercase">
            {site.handle}
          </span>
        </div>
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[0.78125rem] leading-[1.3]">
          {[
            ["Type", "Fullstack engineer"],
            ["Stack", STACK],
            ["Teams", "US and UK, remote"],
            ["Made in", profile.location],
          ].map(([term, value]) => (
            <div key={term} className="contents">
              <dt className="legend text-[0.59375rem] leading-[1.4]">{term}</dt>
              <dd className="font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
