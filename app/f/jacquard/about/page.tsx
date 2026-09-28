import type { Metadata } from "next";
import Link from "next/link";
import { CopyEmail } from "@/flavors/jacquard/components/site/copy-email";
import { Page } from "@/flavors/jacquard/components/site/page";
import { Container } from "@/flavors/jacquard/components/ui/container";
import { ExternalLink } from "@/flavors/jacquard/components/ui/external-link";
import { MuseumLabel } from "@/flavors/jacquard/components/ui/museum-label";
import { PageHeader } from "@/flavors/jacquard/components/ui/page-header";
import { RichText } from "@/flavors/jacquard/components/ui/rich-text";
import { SectionHead } from "@/flavors/jacquard/components/ui/section-head";
import { draftWeave } from "@/flavors/jacquard/lib/scene/poses";
import { cn } from "@/flavors/jacquard/lib/utils";
import {
  buildDraft,
  kindFor,
  kindNames,
  KINDS,
  yarnClass,
} from "@/flavors/jacquard/lib/weave";

import { sitePage } from "@/content/site";
import {
  getEducation,
  getExperience,
  getNow,
  getProfile,
  getProjects,
  getSkills,
} from "@/lib/data";
import { formatDate, formatMonthYear } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/about");

export const metadata: Metadata = pageMetadata(page);

const years = (start: number | undefined, end: number) =>
  start && start !== end ? `${start} to ${end}` : String(end);

/** The full object label, the materials on hand, the provenance, and a condition report. */
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
  const draft = buildDraft(projects);
  const total = skills.reduce((sum, group) => sum + group.items.length, 0);
  const current = experience.find((role) => !role.endDate);
  const first = experience.at(-1);

  return (
    <Page>
      <PageHeader
        card={5}
        kicker="Object label"
        title={page.title}
        lede={page.description}
        meta={[
          { label: "Maker", value: profile.name },
          { label: "Place", value: `${profile.location}, working remotely` },
          ...(first
            ? [
                {
                  label: "Date",
                  value: `${formatMonthYear(first.startDate)} to present`,
                },
              ]
            : []),
          {
            label: "Materials",
            value: `${total} skills in ${skills.length} groups`,
          },
        ]}
        scene={{
          route: "about",
          weave: draftWeave(draft),
          caption: "The object itself: the cloth the whole draft weaves.",
        }}
      />

      <Container
        as="section"
        aria-labelledby="bio-heading"
        className="mt-section"
      >
        <SectionHead id="bio-heading" title="Description" size="h2" />
        <RichText
          value={profile.bio}
          className="mt-8 max-w-[48ch] font-display text-[clamp(1.375rem,1.1rem+1vw,2rem)] leading-[1.2]"
        />
      </Container>

      {skills.length > 0 ? (
        <Container
          as="section"
          aria-labelledby="materials-heading"
          className="mt-section"
        >
          <SectionHead
            id="materials-heading"
            title="Materials"
            size="h2"
            aside={
              <span className="flex flex-wrap gap-x-4 gap-y-1">
                {KINDS.map((kind) => (
                  <span
                    key={kind}
                    className={cn("flex items-center gap-1.5", yarnClass[kind])}
                  >
                    <i aria-hidden className="size-2 bg-(--y)" />
                    {kindNames[kind]}
                  </span>
                ))}
              </span>
            }
          />
          <dl className="mt-2 grid md:grid-cols-[12rem_minmax(0,1fr)]">
            {skills.map((group) => (
              <div key={group.id} className="contents">
                <dt className="pt-5 pb-1 font-display text-xl md:border-b md:border-rule md:py-5">
                  {group.title}
                </dt>
                <dd className="flex flex-wrap gap-x-5 gap-y-2 border-b border-rule pt-1 pb-5 md:py-5">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className={cn(
                        "inline-flex items-center gap-2",
                        yarnClass[kindFor(item)]
                      )}
                    >
                      <i
                        aria-hidden
                        className="yarn h-[3px] w-3 rounded-[2px]"
                      />
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
          aria-labelledby="provenance-heading"
          className="mt-section"
        >
          <SectionHead
            id="provenance-heading"
            title="Provenance"
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
                  <b className="block font-display text-xl font-normal">
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
        aria-labelledby="condition-heading"
        className="mt-section grid gap-x-14 gap-y-12 lg:grid-cols-2"
      >
        <div>
          <SectionHead
            id="condition-heading"
            title="Condition report"
            size="h2"
          />
          <MuseumLabel
            wide
            className="mt-6 border-t-0"
            rows={[
              {
                label: "Condition",
                value: current
                  ? `In daily use: ${current.title} at ${current.company}`
                  : "Resting between projects",
              },
              ...(profile.availability
                ? [{ label: "Availability", value: profile.availability }]
                : []),
              {
                label: "Warp",
                value: `${draft.ends.length} technologies across ${draft.picks.length} woven projects`,
              },
              { label: "Last examined", value: formatDate(now.updatedAt) },
              {
                label: "Handling",
                value:
                  "Questions welcome, in public on the sampler board or by email",
              },
            ]}
          />
        </div>
        <div>
          <h2
            id="enquiries-heading"
            className="border-b border-rule-strong pb-4 text-h3"
          >
            Enquiries
          </h2>
          <ul aria-labelledby="enquiries-heading" className="mt-2">
            <li className="flex flex-wrap items-center gap-x-5 border-b border-rule py-2">
              <a
                href={`mailto:${profile.email}`}
                className="thread-link inline-flex min-h-11 items-center font-display text-xl break-all"
              >
                {profile.email}
              </a>
              <CopyEmail
                email={profile.email}
                className="inline-flex min-h-11 items-center text-sm text-ink-soft fine:hover:text-madder"
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
                className="thread-link inline-flex min-h-11 items-center"
              >
                The pattern card (resume)
              </Link>
            </li>
            <li className="border-b border-rule py-1">
              <Link
                href="/ask"
                className="thread-link inline-flex min-h-11 items-center"
              >
                Pin a question to the sampler board
              </Link>
            </li>
          </ul>
        </div>
      </Container>
    </Page>
  );
}
