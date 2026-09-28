import type { Metadata } from "next";
import Link from "next/link";
import { CopyEmail } from "@/flavors/calibre/components/site/copy-email";
import { Page } from "@/flavors/calibre/components/site/page";
import { Container } from "@/flavors/calibre/components/ui/container";
import { ExternalLink } from "@/flavors/calibre/components/ui/external-link";
import { actionLinkClass } from "@/flavors/calibre/components/ui/link-class";
import { PageHeader } from "@/flavors/calibre/components/ui/page-header";
import { RichText } from "@/flavors/calibre/components/ui/rich-text";
import { SectionHead } from "@/flavors/calibre/components/ui/section-head";
import {
  bezelPrints,
  CALIBRE,
  jewels,
  jewelTags,
} from "@/flavors/calibre/lib/movement";
import { encodeBoard } from "@/flavors/calibre/lib/scene/poses";

import { sitePage } from "@/content/site";
import { getEducation, getProfile, getProjects, getSkills } from "@/lib/data";
import { orderProjectsForCatalog } from "@/lib/data/project-order";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/about");

export const metadata: Metadata = pageMetadata(page);

const years = (start: number | undefined, end: number) =>
  start && start !== end ? `${start} to ${end}` : String(end);

/** The watchmaker's bench notes: the bio, the tools on the bench (skills), the schooling, the address. */
export default async function AboutPage() {
  const [profile, skills, education, projects] = await Promise.all([
    getProfile(),
    getSkills(),
    getEducation(),
    getProjects(),
  ]);
  const total = skills.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <Page>
      <PageHeader
        hour={9}
        kicker="Bench notes"
        title={page.title}
        lede={page.description}
        meta={[
          { label: "Bench", value: profile.location },
          { label: "Tools", value: `${total} skills` },
          { label: "Complications", value: `${skills.length} groups` },
        ]}
        scene="about"
        board={encodeBoard({ jewels: projects.length, lit: 0 })}
        tags={jewelTags(jewels(orderProjectsForCatalog(projects)))}
        prints={bezelPrints(projects.length, profile.location)}
      />

      <Container
        as="section"
        aria-labelledby="back-heading"
        className="mt-section"
      >
        <div className="engraving rounded-[3px] px-[clamp(1.25rem,0.6rem+3vw,4rem)] pt-6 pb-[clamp(2rem,1rem+3vw,4rem)]">
          <p aria-hidden className="spec">
            Calibre {CALIBRE} · notes kept at the bench
          </p>
          <h2 id="back-heading" className="mt-8 spec">
            On the bench
          </h2>
          <RichText
            value={profile.bio}
            className="mt-5 max-w-[46ch] font-display text-[clamp(1.5rem,1rem+1.4vw,2.375rem)] leading-[1.22]"
          />
          <p className="mt-8 numeral-italic text-[1.25rem] text-soft">
            {profile.name}, {profile.location}
          </p>
        </div>
      </Container>

      {skills.length > 0 ? (
        <Container
          as="section"
          aria-labelledby="shelf-heading"
          className="mt-section"
        >
          <SectionHead
            id="shelf-heading"
            kicker="Tools on the bench"
            title="Skills"
            aside={`${total} tools, ${skills.length} complications`}
          />
          <dl className="grid md:grid-cols-[14rem_minmax(0,1fr)] md:gap-x-6">
            {skills.map((group) => (
              <div key={group.id} className="contents">
                <dt className="pt-5 pb-1 text-lead font-medium md:border-b md:border-line md:py-5">
                  {group.title}
                </dt>
                <dd className="flex flex-wrap gap-x-5 gap-y-2 border-b border-line pt-1 pb-5 md:py-5">
                  {group.items.map((item) => (
                    <span key={item} className="text-lead text-soft">
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
          aria-labelledby="school-heading"
          className="mt-section"
        >
          <SectionHead
            id="school-heading"
            kicker="Where I learned the trade"
            title="Education"
          />
          <ol>
            {education.map((entry) => (
              <li
                key={entry.id}
                className="grid gap-x-6 gap-y-1 border-b border-line py-5 sm:grid-cols-[9rem_minmax(0,1fr)_auto]"
              >
                <span className="spec text-spec-lg text-ink!">
                  {years(entry.startYear, entry.endYear)}
                </span>
                <span>
                  <b className="block text-lead font-medium">{entry.degree}</b>
                  <span className="text-soft">
                    {entry.institution}, {entry.location}
                  </span>
                </span>
                {entry.score ? (
                  <span className="spec sm:text-right">{entry.score}</span>
                ) : null}
              </li>
            ))}
          </ol>
        </Container>
      ) : null}

      <Container
        as="section"
        aria-labelledby="reach-heading"
        className="mt-section"
      >
        <SectionHead
          id="reach-heading"
          kicker="Send the watch in"
          title="Contact"
        />
        <ul className="grid gap-x-10 gap-y-2 pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <li>
            <a
              href={`mailto:${profile.email}`}
              className={`${actionLinkClass} text-lead break-all`}
            >
              {profile.email}
            </a>
            <div>
              <CopyEmail
                email={profile.email}
                className="inline-flex min-h-11 items-center spec fine:hover:text-ink"
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
            <Link href="/resume" className={`${actionLinkClass} text-lead`}>
              The certificate (resume)
            </Link>
          </li>
          <li>
            <Link href="/ask" className={`${actionLinkClass} text-lead`}>
              Ask a question in public
            </Link>
          </li>
        </ul>
      </Container>
    </Page>
  );
}
