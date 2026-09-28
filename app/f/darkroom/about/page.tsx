import type { Metadata } from "next";
import Link from "next/link";
import { CopyEmail } from "@/flavors/darkroom/components/site/copy-email";
import { Page } from "@/flavors/darkroom/components/site/page";
import { Container } from "@/flavors/darkroom/components/ui/container";
import { ExternalLink } from "@/flavors/darkroom/components/ui/external-link";
import { actionLinkClass } from "@/flavors/darkroom/components/ui/link-class";
import { PageHeader } from "@/flavors/darkroom/components/ui/page-header";
import { RichText } from "@/flavors/darkroom/components/ui/rich-text";
import { SectionHead } from "@/flavors/darkroom/components/ui/section-head";
import { STOCK } from "@/flavors/darkroom/lib/roll";

import { sitePage } from "@/content/site";
import { getEducation, getProfile, getSkills } from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/about");

export const metadata: Metadata = pageMetadata(page);

const years = (start: number | undefined, end: number) =>
  start && start !== end ? `${start} to ${end}` : String(end);

/** The enlargement, and what's written on its back: the bio, the chemistry on the shelf, the schooling, the address. */
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
        frame="04"
        kicker="Enlargement"
        title={page.title}
        lede={page.description}
        meta={[
          { label: "Printed in", value: profile.location },
          { label: "On the shelf", value: `${total} skills` },
        ]}
        scene="about"
        board="portrait.0"
      />

      <Container
        as="section"
        aria-labelledby="back-heading"
        className="mt-section"
      >
        <div className="rounded-[2px] bg-paper px-[clamp(1.25rem,0.6rem+3vw,4rem)] pt-6 pb-[clamp(2rem,1rem+3vw,4rem)] shadow-sheet">
          <p
            aria-hidden
            className="overflow-hidden edge whitespace-nowrap opacity-60"
          >
            {Array.from({ length: 6 }, () => `${STOCK} · fibre based`).join(
              "   ·   "
            )}
          </p>
          <h2 id="back-heading" className="mt-8 edge">
            Written on the back
          </h2>
          <RichText
            value={profile.bio}
            className="mt-5 max-w-[46ch] text-[clamp(1.375rem,1rem+1.2vw,2.125rem)] leading-[1.22] font-medium tracking-[-0.02em]"
          />
          <p aria-hidden className="mt-8 -rotate-2 hand text-[1rem]">
            {profile.name.split(" ")[0]}, roll 26
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
            aside={`${total} bottles, ${skills.length} shelves`}
          />
          <dl className="grid md:grid-cols-[14rem_minmax(0,1fr)] md:gap-x-6">
            {skills.map((group) => (
              <div key={group.id} className="contents">
                <dt className="pt-5 pb-1 text-lead font-semibold md:border-b md:border-line md:py-5">
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
            kicker="Where I learned the chemistry"
            title="Education"
          />
          <ol>
            {education.map((entry) => (
              <li
                key={entry.id}
                className="grid gap-x-6 gap-y-1 border-b border-line py-5 sm:grid-cols-[9rem_minmax(0,1fr)_auto]"
              >
                <span className="edge text-edge-lg text-ink!">
                  {years(entry.startYear, entry.endYear)}
                </span>
                <span>
                  <b className="block text-lead font-semibold">
                    {entry.degree}
                  </b>
                  <span className="text-soft">
                    {entry.institution}, {entry.location}
                  </span>
                </span>
                {entry.score ? (
                  <span className="edge sm:text-right">{entry.score}</span>
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
          kicker="Knock before you open the door"
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
                className="inline-flex min-h-11 items-center edge fine:hover:text-ink"
              />
            </div>
          </li>
          {profile.links.map((link) => (
            <li key={link.url}>
              <ExternalLink
                href={link.url}
                className="inline-flex min-h-11 items-center text-lead font-semibold"
              >
                {link.label}
              </ExternalLink>
            </li>
          ))}
          <li>
            <Link href="/resume" className={`${actionLinkClass} text-lead`}>
              The fibre print (resume)
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
