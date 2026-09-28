import type { Metadata } from "next";
import Link from "next/link";
import { CopyEmail } from "@/flavors/maquette/components/site/copy-email";
import { Page } from "@/flavors/maquette/components/site/page";
import { Container } from "@/flavors/maquette/components/ui/container";
import { ExternalLink } from "@/flavors/maquette/components/ui/external-link";
import { actionLinkClass } from "@/flavors/maquette/components/ui/link-class";
import { PageHeader } from "@/flavors/maquette/components/ui/page-header";
import { RichText } from "@/flavors/maquette/components/ui/rich-text";
import { SectionHead } from "@/flavors/maquette/components/ui/section-head";
import { SCALE } from "@/flavors/maquette/lib/model";
import { siteBoard } from "@/flavors/maquette/lib/site-board";
import { SITE } from "@/flavors/maquette/lib/sun";

import { sitePage } from "@/content/site";
import { getEducation, getProfile, getSkills } from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/about");

export const metadata: Metadata = pageMetadata(page);

const years = (start: number | undefined, end: number) =>
  start && start !== end ? `${start} to ${end}` : String(end);

/** The studio's wall label: the bio, the materials on the shelf, the schooling, the address. */
export default async function AboutPage() {
  const [profile, skills, education, board] = await Promise.all([
    getProfile(),
    getSkills(),
    getEducation(),
    siteBoard(),
  ]);
  const total = skills.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <Page>
      <PageHeader
        frame="04"
        kicker="Wall label"
        title={page.title}
        lede={page.description}
        meta={[
          { label: "Studio", value: profile.location },
          { label: "On the shelf", value: `${total} skills` },
          { label: "Scale", value: SCALE },
        ]}
        scene="about"
        board={board}
      />

      <Container
        as="section"
        aria-labelledby="back-heading"
        className="mt-section"
      >
        <div className="rounded-[2px] bg-raise px-[clamp(1.25rem,0.6rem+3vw,4rem)] pt-6 pb-[clamp(2rem,1rem+3vw,4rem)] shadow-vitrine">
          <p className="num">
            {profile.name}, {profile.location}, {SITE.lat}° N
          </p>
          <h2 id="back-heading" className="mt-8 caps">
            About the maker
          </h2>
          <RichText
            value={profile.bio}
            className="mt-5 max-w-[46ch] font-display text-[clamp(1.375rem,1rem+1.2vw,2.125rem)] leading-[1.22] font-light tracking-[-0.015em]"
          />
          <p className="mt-8 num">
            Card, basswood and foam. Made remote, for teams in the US and UK.
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
            kicker="On the shelf"
            title="Skills"
            aside={`${total} materials, ${skills.length} shelves`}
          />
          <dl className="grid md:grid-cols-[14rem_minmax(0,1fr)] md:gap-x-6">
            {skills.map((group) => (
              <div key={group.id} className="contents">
                <dt className="pt-5 pb-1 font-display text-lead md:border-b md:border-line md:py-5">
                  {group.title}
                </dt>
                <dd className="flex flex-wrap gap-x-5 gap-y-2 border-b border-line pt-1 pb-5 md:py-5">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="font-display text-lead text-soft"
                    >
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
            kicker="Where I learned to build"
            title="Education"
          />
          <ol>
            {education.map((entry) => (
              <li
                key={entry.id}
                className="grid gap-x-6 gap-y-1 border-b border-line py-5 sm:grid-cols-[9rem_minmax(0,1fr)_auto]"
              >
                <span className="num text-sm text-ink">
                  {years(entry.startYear, entry.endYear)}
                </span>
                <span>
                  <b className="block font-display text-lead font-normal">
                    {entry.degree}
                  </b>
                  <span className="text-soft">
                    {entry.institution}, {entry.location}
                  </span>
                </span>
                {entry.score ? (
                  <span className="num sm:text-right">{entry.score}</span>
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
          kicker="The studio door is open"
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
                className="inline-flex min-h-11 items-center num fine:hover:text-ink"
              />
            </div>
          </li>
          {profile.links.map((link) => (
            <li key={link.url}>
              <ExternalLink
                href={link.url}
                className="inline-flex min-h-11 items-center font-display text-lead"
              >
                {link.label}
              </ExternalLink>
            </li>
          ))}
          <li>
            <Link href="/resume" className={`${actionLinkClass} text-lead`}>
              The spec sheet (resume)
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
