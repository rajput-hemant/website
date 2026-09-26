import type { Metadata } from "next";
import Link from "next/link";
import { CopyEmail } from "@/flavors/press/components/site/copy-email";
import { Page } from "@/flavors/press/components/site/page";
import { Container } from "@/flavors/press/components/ui/container";
import { ExternalLink } from "@/flavors/press/components/ui/external-link";
import { PageHeader } from "@/flavors/press/components/ui/page-header";
import { RichText } from "@/flavors/press/components/ui/rich-text";
import { SectionHead } from "@/flavors/press/components/ui/section-head";
import { plateFor } from "@/flavors/press/lib/proof";
import { cn, route } from "@/flavors/press/lib/utils";

import { sitePage } from "@/content/site";
import { getEducation, getProfile, getSkills } from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/about");

export const metadata: Metadata = pageMetadata(page);

const years = (start: number | undefined, end: number) =>
  start && start !== end ? `${start} to ${end}` : String(end);

/** The colophon: who printed this, the inks on hand, where they trained, and how to reach the press. */
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
        sheet={5}
        kicker="Colophon"
        title={page.title}
        lede={page.description}
        meta={[
          { label: "Printed in", value: profile.location },
          { label: "Inks on hand", value: `${total} skills` },
        ]}
        scene="about"
      />

      <Container
        as="section"
        aria-labelledby="bio-heading"
        className="mt-section"
      >
        <SectionHead
          id="bio-heading"
          kicker="About the printer"
          title="Bio"
          size="h2"
        />
        <RichText
          value={profile.bio}
          className="mt-8 max-w-[52ch] text-[clamp(1.25rem,1rem+1vw,1.875rem)] leading-[1.25] font-medium tracking-[-0.015em]"
        />
      </Container>

      {skills.length > 0 ? (
        <Container
          as="section"
          aria-labelledby="inks-heading"
          className="mt-section"
        >
          <SectionHead
            id="inks-heading"
            kicker="Inks on hand"
            title="Skills"
            size="h2"
            aside={
              <span className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <i aria-hidden className="size-2.5 bg-pink" /> P1 interface
                </span>
                <span className="flex items-center gap-1.5">
                  <i aria-hidden className="size-2.5 bg-blue" /> P2 systems
                </span>
              </span>
            }
          />
          <dl className="mt-8 grid border-t-2 border-ink md:grid-cols-[14rem_minmax(0,1fr)] md:gap-x-6">
            {skills.map((group) => (
              <div
                key={group.id}
                data-scene-item={`skills:${group.id}`}
                className="contents"
              >
                <dt className="pt-5 pb-1 text-lead font-extrabold md:border-b md:border-rule md:py-5">
                  {group.title}
                </dt>
                <dd className="flex flex-wrap gap-x-5 gap-y-2 border-b border-rule pt-1 pb-5 md:py-5">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-2 text-lead"
                    >
                      <i
                        aria-hidden
                        className={cn(
                          "size-2",
                          plateFor(item) === "p1" ? "bg-pink" : "bg-blue"
                        )}
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
          aria-labelledby="imprint-heading"
          className="mt-section"
        >
          <SectionHead
            id="imprint-heading"
            kicker="Imprint history"
            title="Education"
            size="h2"
          />
          <ol className="mt-8 border-t-2 border-ink">
            {education.map((entry) => (
              <li
                key={entry.id}
                className="grid gap-x-6 gap-y-1 border-b border-rule py-5 sm:grid-cols-[9rem_minmax(0,1fr)_auto]"
              >
                <span className="slug text-slug-lg text-ink!">
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
                  <span className="slug sm:text-right">{entry.score}</span>
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
          kicker="Reach the press"
          title="Contact"
          size="h2"
        />
        <ul className="mt-8 grid gap-x-10 gap-y-2 border-t border-rule pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <li>
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex min-h-11 items-center text-lead font-extrabold break-all underline decoration-pink decoration-2 underline-offset-[0.2em]"
            >
              {profile.email}
            </a>
            <div>
              <CopyEmail
                email={profile.email}
                className="inline-flex min-h-11 items-center slug fine:hover:text-ink"
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
              href={route("/resume")}
              className="inline-flex min-h-11 items-center text-lead font-bold underline decoration-pink decoration-2 underline-offset-[0.2em]"
            >
              The final print (resume)
            </Link>
          </li>
          <li>
            <Link
              href={route("/ask")}
              className="inline-flex min-h-11 items-center text-lead font-bold underline decoration-pink decoration-2 underline-offset-[0.2em]"
            >
              Send a query in public
            </Link>
          </li>
        </ul>
      </Container>
    </Page>
  );
}
