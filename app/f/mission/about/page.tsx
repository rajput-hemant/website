import type { Metadata } from "next";
import Link from "next/link";
import { CopyEmail } from "@/flavors/mission/components/site/copy-email";
import { Page } from "@/flavors/mission/components/site/page";
import { Checklist } from "@/flavors/mission/components/ui/checklist";
import { Container } from "@/flavors/mission/components/ui/container";
import { ExternalLink } from "@/flavors/mission/components/ui/external-link";
import { PageHeader } from "@/flavors/mission/components/ui/page-header";
import { RichText } from "@/flavors/mission/components/ui/rich-text";
import { SectionHead } from "@/flavors/mission/components/ui/section-head";
import { flightPlan, launchLabel, pad2 } from "@/flavors/mission/lib/flight";
import { boardFor } from "@/flavors/mission/lib/scene/poses";

import { sitePage } from "@/content/site";
import {
  getEducation,
  getExperience,
  getNow,
  getProfile,
  getProjects,
  getSkills,
} from "@/lib/data";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/about");

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata(page);
}

const years = (start: number | undefined, end: number) =>
  start && start !== end ? `${start} to ${end}` : String(end);

/** The crew biography: the bio, systems qualified on, training, and the pre-flight checklist. */
export default async function AboutPage() {
  const [profile, skills, education, experience, projects, now] =
    await Promise.all([
      getProfile(),
      getSkills(),
      getEducation(),
      getExperience(),
      getProjects(),
      getNow(),
    ]);
  const flight = flightPlan(experience, projects, new Date());
  const total = skills.reduce((sum, group) => sum + group.items.length, 0);
  const current = flight.phases.findLast((p) => p.b === null);

  return (
    <Page>
      <PageHeader
        section={5}
        kicker="Crew biography"
        title={page.title}
        lede={page.description}
        meta={[
          { label: "Crew", value: profile.name },
          { label: "Launch site", value: profile.location },
          { label: "T-0", value: launchLabel(flight) },
          {
            label: "Systems",
            value: `${total} in ${skills.length} groups`,
          },
        ]}
        scene={{
          route: "about",
          board: boardFor(flight),
          caption: "The launch site faces you: Mathura, India.",
        }}
      />

      <Container
        as="section"
        aria-labelledby="bio-heading"
        className="mt-section"
      >
        <SectionHead
          id="bio-heading"
          number="5.1"
          title="Biography"
          size="h2"
        />
        <RichText
          value={profile.bio}
          className="mt-8 max-w-[44ch] font-display text-[clamp(1.375rem,1.1rem+1vw,2rem)] leading-[1.18] font-bold tracking-[-0.02em]"
        />
      </Container>

      {skills.length > 0 ? (
        <Container
          as="section"
          aria-labelledby="systems-heading"
          className="mt-section"
        >
          <SectionHead
            id="systems-heading"
            number="5.2"
            title="Systems"
            size="h2"
            aside="Qualified to operate"
          />
          <dl className="mt-2 grid md:grid-cols-12 md:gap-x-6">
            {skills.map((group, i) => (
              <div key={group.id} className="contents">
                <dt className="flex gap-3 pt-5 pb-1 font-display text-xl font-bold md:col-span-3 md:border-b md:border-rule md:py-5">
                  <span className="pt-1 label font-semibold text-signal">
                    SYS-{pad2(i + 1)}
                  </span>
                  {group.title}
                </dt>
                <dd className="flex flex-wrap gap-x-5 gap-y-2 border-b border-rule pt-1 pb-5 md:col-span-9 md:py-5">
                  {group.items.map((item) => (
                    <span key={item} className="inline-flex items-center gap-2">
                      <i aria-hidden className="size-1.5 bg-ink" />
                      {item}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      ) : null}

      {education.length > 0 ? (
        <Container
          as="section"
          aria-labelledby="training-heading"
          className="mt-section"
        >
          <SectionHead
            id="training-heading"
            number="5.3"
            title="Training"
            size="h2"
            aside="Education"
          />
          <ol>
            {education.map((entry) => (
              <li
                key={entry.id}
                className="grid gap-x-6 gap-y-1 border-b border-rule py-5 sm:grid-cols-[9rem_minmax(0,1fr)_auto]"
              >
                <span className="font-mono text-sm text-ink-soft">
                  {years(entry.startYear, entry.endYear)}
                </span>
                <span>
                  <b className="block font-display text-xl font-bold">
                    {entry.degree}
                  </b>
                  <span className="text-ink-soft">
                    {entry.institution}, {entry.location}
                  </span>
                </span>
                {entry.score ? (
                  <span className="label sm:text-right">{entry.score}</span>
                ) : null}
              </li>
            ))}
          </ol>
        </Container>
      ) : null}

      <Container
        as="section"
        aria-labelledby="checklist-heading"
        className="mt-section grid gap-x-6 gap-y-12 lg:grid-cols-12"
      >
        <div className="lg:col-span-6">
          <SectionHead
            id="checklist-heading"
            number="5.4"
            title="Pre-flight checklist"
            size="h2"
          />
          <Checklist
            className="mt-6 border-t-0"
            rows={[
              {
                label: "Status",
                value: profile.availability ?? "Busy, but reading mail",
                nominal: Boolean(profile.availability),
              },
              {
                label: "Current phase",
                value: current
                  ? `${current.code} ${current.company}, ${current.title}`
                  : "Between phases",
              },
              {
                label: "Missions",
                value: `${projects.length} flown`,
              },
              { label: "Last report", value: formatDate(now.updatedAt) },
              {
                label: "Comms",
                value: "Questions welcome, on capcom or by email",
              },
            ]}
          />
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <h2
            id="downlink-heading"
            className="border-t-2 border-ink pt-3.5 text-h3"
          >
            Downlink
          </h2>
          <ul aria-labelledby="downlink-heading" className="mt-2">
            <li className="flex flex-wrap items-center gap-x-5 border-b border-rule py-2">
              <a
                href={`mailto:${profile.email}`}
                className="rule-link inline-flex min-h-11 items-center font-display text-xl font-bold break-all"
              >
                {profile.email}
              </a>
              <CopyEmail
                email={profile.email}
                className="inline-flex min-h-11 items-center text-sm text-ink-soft fine:hover:text-signal"
              />
            </li>
            {profile.links.map((link) => (
              <li key={link.url} className="border-b border-rule py-1">
                <ExternalLink
                  href={link.url}
                  className="inline-flex min-h-11 items-center"
                >
                  {link.label}
                </ExternalLink>
              </li>
            ))}
            <li className="border-b border-rule py-1">
              <Link
                href="/resume"
                className="rule-link inline-flex min-h-11 items-center"
              >
                The crew record (resume)
              </Link>
            </li>
            <li className="border-b border-rule py-1">
              <Link
                href="/ask"
                className="rule-link inline-flex min-h-11 items-center"
              >
                Open a channel on capcom
              </Link>
            </li>
          </ul>
        </div>
      </Container>
    </Page>
  );
}
