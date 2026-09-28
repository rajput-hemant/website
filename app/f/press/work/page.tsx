import type { Metadata } from "next";
import Link from "next/link";
import { Page } from "@/flavors/press/components/site/page";
import { Container } from "@/flavors/press/components/ui/container";
import { ExternalLink } from "@/flavors/press/components/ui/external-link";
import { Overprint } from "@/flavors/press/components/ui/overprint";
import { PageHeader } from "@/flavors/press/components/ui/page-header";
import { RichText } from "@/flavors/press/components/ui/rich-text";
import { SectionHead } from "@/flavors/press/components/ui/section-head";
import { PressLog } from "@/flavors/press/components/work/press-log";
import { pad2, pressLog } from "@/flavors/press/lib/proof";

import { sitePage } from "@/content/site";
import { getExperience } from "@/lib/data";
import { employmentLabels } from "@/lib/data/labels";
import { formatMonthYear } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/work");

export const metadata: Metadata = pageMetadata(page);

/** The press log: every run on one axis, then each run's job ticket, newest first. */
export default async function WorkPage() {
  const experience = await getExperience();
  const log = pressLog(experience, new Date());
  const first = experience.at(-1);

  return (
    <Page>
      <PageHeader
        sheet={3}
        kicker="Press log"
        title="Experience"
        lede={page.description}
        meta={[
          { label: "Runs", value: String(log.runs.length) },
          { label: "Most at once", value: `${log.peak} on press` },
          ...(first
            ? [
                {
                  label: "First run",
                  value: formatMonthYear(first.startDate),
                },
              ]
            : []),
        ]}
        scene="work"
      />

      <Container className="mt-section">
        <PressLog log={log} hrefFor={(id) => `#${id}`} />
      </Container>

      <Container
        as="section"
        aria-labelledby="tickets-heading"
        className="mt-section"
      >
        <SectionHead
          id="tickets-heading"
          kicker="Job tickets"
          title="Every run, newest first"
          size="h2"
        />
        <ol className="mt-10">
          {log.runs.map(({ role, run, tenure, current }) => (
            <li
              key={role.id}
              id={role.id}
              data-scene-item={`run:${role.id}`}
              className="registers grid scroll-mt-8 gap-x-6 gap-y-5 border-t-2 border-ink py-10 lg:grid-cols-12"
            >
              <div className="lg:col-span-4">
                <p className="slug">
                  Run {pad2(run)} &nbsp;/&nbsp;{" "}
                  {current ? (
                    <mark className="text-slug">On press</mark>
                  ) : (
                    "Off press"
                  )}
                </p>
                <h3 className="mt-3 text-[clamp(2rem,1.3rem+2.4vw,3.5rem)] leading-[0.9] tracking-[-0.04em]">
                  <Overprint>{role.company}</Overprint>
                </h3>
                <p className="mt-3 text-lead font-semibold">{role.title}</p>
                <dl className="mt-5 grid grid-cols-[6rem_1fr] gap-y-1.5 slug">
                  <dt>Dates</dt>
                  <dd className="text-ink">
                    {formatMonthYear(role.startDate)} to{" "}
                    {role.endDate ? formatMonthYear(role.endDate) : "now"}
                  </dd>
                  <dt>Length</dt>
                  <dd className="text-ink">{tenure}</dd>
                  <dt>Terms</dt>
                  <dd className="text-ink">
                    {role.employmentNote ??
                      employmentLabels[role.employmentType]}
                  </dd>
                  <dt>Where</dt>
                  <dd className="text-ink">
                    {role.remote ? `Remote, ${role.location}` : role.location}
                  </dd>
                </dl>
                {role.companyUrl ? (
                  <p className="mt-4">
                    <ExternalLink
                      href={role.companyUrl}
                      className="inline-flex min-h-11 items-center text-sm font-bold"
                    >
                      {role.company}
                    </ExternalLink>
                  </p>
                ) : null}
              </div>
              <div className="min-w-0 lg:col-span-7 lg:col-start-6">
                {role.note ? (
                  <p className="text-[clamp(1.25rem,1rem+0.8vw,1.625rem)] leading-snug font-medium tracking-[-0.015em]">
                    {role.note}
                  </p>
                ) : null}
                <RichText value={role.body} className="mt-5" />
                {role.highlights.length > 0 ? (
                  <ul className="mt-6 grid gap-2.5">
                    {role.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-2 leading-snug"
                      >
                        <span aria-hidden className="mt-2 size-2 bg-pink" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {role.continuedFrom || role.continuedInto ? (
                  <p className="mt-6 slug">
                    {role.continuedFrom ? (
                      <>
                        Continued from{" "}
                        <a
                          href={`#${role.continuedFrom.id}`}
                          className="text-ink underline"
                        >
                          {role.continuedFrom.company}
                        </a>
                        {role.continuedFrom.note
                          ? `, ${role.continuedFrom.note}`
                          : ""}
                        .{" "}
                      </>
                    ) : null}
                    {role.continuedInto ? (
                      <>
                        Continued into{" "}
                        <a
                          href={`#${role.continuedInto.id}`}
                          className="text-ink underline"
                        >
                          {role.continuedInto.company}
                        </a>
                        {role.continuedInto.note
                          ? `, ${role.continuedInto.note}`
                          : ""}
                        .
                      </>
                    ) : null}
                  </p>
                ) : null}
                {role.endNote ? (
                  <p className="mt-2 slug">Ended: {role.endNote}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-6 border-t border-rule pt-5 text-ink-soft">
          Skills and education are in the{" "}
          <Link
            href="/about"
            className="font-bold text-ink underline decoration-pink decoration-2 underline-offset-[0.2em]"
          >
            colophon
          </Link>
          .
        </p>
      </Container>
    </Page>
  );
}
