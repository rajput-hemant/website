import type { Metadata } from "next";
import Link from "next/link";
import { CopyEmail } from "@/flavors/timetable/components/site/copy-email";
import { Page } from "@/flavors/timetable/components/site/page";
import {
  ExternalLink,
  PageHeader,
  RichText,
  Section,
  Tag,
} from "@/flavors/timetable/components/ui";

import { sitePage } from "@/content/site";
import { getEducation, getProfile, getSkills } from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/about");

export const metadata: Metadata = pageMetadata(page);

const years = (start: number | undefined, end: number) =>
  start && start !== end ? `${start} to ${end}` : String(end);

/** The station guide: who runs this station, its facilities, its history, and the desk. */
export default async function AboutPage() {
  const [profile, skills, education] = await Promise.all([
    getProfile(),
    getSkills(),
    getEducation(),
  ]);
  const total = skills.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <Page>
      <PageHeader
        platform="4"
        kicker="Station guide"
        title={page.title}
        lede={page.description}
        meta={[
          { label: "Based in", value: profile.location },
          { label: "Facilities", value: `${total} skills` },
        ]}
        scene="about"
      />

      <Section
        id="guide"
        kicker="General information"
        title="About this station"
      >
        <RichText
          value={profile.bio}
          className="max-w-[60ch] text-statement leading-snug font-medium tracking-[-0.01em]"
        />
      </Section>

      {skills.length > 0 ? (
        <Section
          id="facilities"
          kicker="Facilities"
          title="What you'll find here"
          aside={`${skills.length} groups, ${total} skills`}
        >
          <dl className="grid gap-x-6 border-t border-rule md:grid-cols-[14rem_minmax(0,1fr)]">
            {skills.map((group) => (
              <div
                key={group.id}
                data-scene-item={`facility:${group.id}`}
                data-scene-label={`${group.title}|${group.items.length} facilities`}
                className="contents"
              >
                <dt className="border-b border-rule pt-5 pb-1 text-lead font-extrabold md:py-5">
                  {group.title}
                </dt>
                <dd className="flex flex-wrap gap-2 border-b border-rule pt-2 pb-5 md:py-5">
                  {group.items.map((item) => (
                    <Tag key={item}>{item}</Tag>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </Section>
      ) : null}

      {education.length > 0 ? (
        <Section id="history" kicker="History" title="Education">
          <ol className="border-t border-rule">
            {education.map((entry) => (
              <li
                key={entry.id}
                className="grid gap-x-6 gap-y-1 border-b border-rule py-5 sm:grid-cols-[9rem_minmax(0,1fr)_auto]"
              >
                <span className="font-mono text-mono font-bold">
                  {years(entry.startYear, entry.endYear)}
                </span>
                <span>
                  <b className="block text-lead font-extrabold">
                    {entry.degree}
                  </b>
                  <span className="text-ink-soft">
                    {entry.institution}, {entry.location}
                  </span>
                </span>
                {entry.score ? (
                  <span className="font-mono text-mono-sm text-ink-soft sm:text-right">
                    {entry.score}
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </Section>
      ) : null}

      <Section id="desk" kicker="Information desk" title="Reach me">
        <ul className="grid gap-x-10 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
          <li>
            <a
              href={`mailto:${profile.email}`}
              className="text-lead font-extrabold underline decoration-2 underline-offset-[0.2em]"
            >
              {profile.email}
            </a>
            <div>
              <CopyEmail
                email={profile.email}
                className="inline-flex min-h-11 items-center font-mono text-mono-sm font-semibold tracking-[0.06em] text-ink-soft uppercase fine:hover:text-ink"
              />
            </div>
          </li>
          {profile.links.map((link) => (
            <li key={link.url}>
              <ExternalLink
                href={link.url}
                className="inline-flex min-h-11 items-center text-lead font-bold"
              >
                {link.label}
              </ExternalLink>
            </li>
          ))}
          <li>
            <Link
              href="/resume"
              className="inline-flex min-h-11 items-center text-lead font-bold underline decoration-rule-strong decoration-2 underline-offset-[0.22em]"
            >
              Printed guide (resume)
            </Link>
          </li>
          {profile.resumeUrl ? (
            <li>
              <ExternalLink
                href={profile.resumeUrl}
                className="inline-flex min-h-11 items-center text-lead font-bold"
              >
                Hosted resume
              </ExternalLink>
            </li>
          ) : null}
          <li>
            <Link
              href="/ask"
              className="inline-flex min-h-11 items-center text-lead font-bold underline decoration-rule-strong decoration-2 underline-offset-[0.22em]"
            >
              Ask a question in public
            </Link>
          </li>
        </ul>
      </Section>
    </Page>
  );
}
