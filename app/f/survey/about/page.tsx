import type { Metadata } from "next";
import Link from "next/link";
import { CopyEmail } from "@/flavors/survey/components/site/copy-email";
import { Page } from "@/flavors/survey/components/site/page";
import { ExternalLink } from "@/flavors/survey/components/ui/external-link";
import { PageHeader } from "@/flavors/survey/components/ui/page-header";
import { RichText } from "@/flavors/survey/components/ui/rich-text";
import { Section } from "@/flavors/survey/components/ui/section";
import { Tag } from "@/flavors/survey/components/ui/tag";
import { getRelief } from "@/flavors/survey/lib/sheet";

import { site, sitePage } from "@/content/site";
import { getEducation, getProfile, getSkills } from "@/lib/data";
import { formatYearRange } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/about");

export const metadata: Metadata = pageMetadata(page);

const linkClass =
  "inline-flex min-h-11 items-center text-lead font-medium underline decoration-contour underline-offset-[0.35em] fine:hover:text-water";

/** The sheet's survey history: who surveyed it, with what instruments, their training, and where to write. */
export default async function AboutPage() {
  const [profile, skills, education, relief] = await Promise.all([
    getProfile(),
    getSkills(),
    getEducation(),
    getRelief(),
  ]);
  const total = skills.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <Page>
      <PageHeader
        kicker="Survey history"
        title={page.title}
        lede={page.description}
        meta={[
          { label: "Based in", value: profile.location },
          { label: "First surveyed", value: String(relief.from) },
          { label: "Instruments", value: String(total) },
        ]}
        scene={{ relief, route: "about" }}
      />

      <Section id="surveyor" kicker="The surveyor" title={site.handle}>
        <RichText
          value={profile.bio}
          className="max-w-[58ch] font-serif text-statement"
        />
      </Section>

      {skills.length > 0 ? (
        <Section
          id="instruments"
          kicker="Instruments"
          title="What the survey used"
          aside={`${skills.length} kits, ${total} instruments`}
        >
          <dl className="grid gap-x-10 border-t border-rule md:grid-cols-[13rem_minmax(0,1fr)]">
            {skills.map((group) => (
              <div key={group.id} className="contents">
                <dt className="spaced border-b border-rule pt-5 pb-1 text-sm tracking-[0.2em] md:py-5">
                  {group.title}
                </dt>
                <dd className="flex flex-wrap gap-2 border-b border-rule pt-2 pb-5 md:py-5">
                  {group.items.map((item) => (
                    <Tag key={item} className="text-ink">
                      {item}
                    </Tag>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </Section>
      ) : null}

      {education.length > 0 ? (
        <Section id="training" kicker="Training" title="Education">
          <ol className="border-t border-rule">
            {education.map((entry) => (
              <li
                key={entry.id}
                className="grid gap-x-10 gap-y-1 border-b border-rule py-5 sm:grid-cols-[9rem_minmax(0,1fr)_auto]"
              >
                <span className="caps pt-1 text-ink-faint">
                  {formatYearRange(entry.startYear, entry.endYear)}
                </span>
                <span>
                  <b className="block font-display text-lead font-medium">
                    {entry.degree}
                  </b>
                  <span className="text-ink-soft">
                    {entry.institution}, {entry.location}
                  </span>
                </span>
                {entry.score ? (
                  <span className="text-sm text-ink-soft tabular-nums sm:text-right">
                    {entry.score}
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </Section>
      ) : null}

      <Section id="correspondence" kicker="Correspondence" title="Write to me">
        <ul className="grid gap-x-10 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
          <li>
            <a href={`mailto:${profile.email}`} className={linkClass}>
              {profile.email}
            </a>
            <div>
              <CopyEmail
                email={profile.email}
                className="caps inline-flex min-h-11 items-center text-ink-soft fine:hover:text-ink"
              />
            </div>
          </li>
          {profile.links.map((link) => (
            <li key={link.url}>
              <ExternalLink
                href={link.url}
                className="inline-flex min-h-11 items-center text-lead font-medium"
              >
                {link.label}
              </ExternalLink>
            </li>
          ))}
          <li>
            <Link href="/resume" className={linkClass}>
              The printed sheet (resume)
            </Link>
          </li>
          {profile.resumeUrl ? (
            <li>
              <ExternalLink
                href={profile.resumeUrl}
                className="inline-flex min-h-11 items-center text-lead font-medium"
              >
                Hosted resume
              </ExternalLink>
            </li>
          ) : null}
          <li>
            <Link href="/ask" className={linkClass}>
              Ask in the field notebook
            </Link>
          </li>
        </ul>
      </Section>
    </Page>
  );
}
