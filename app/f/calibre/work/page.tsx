import type { Metadata } from "next";
import Link from "next/link";
import {
  ServiceDial,
  ServiceRecord,
} from "@/flavors/calibre/components/dial/service-record";
import { Page } from "@/flavors/calibre/components/site/page";
import { Container } from "@/flavors/calibre/components/ui/container";
import { ExternalLink } from "@/flavors/calibre/components/ui/external-link";
import { linkClass } from "@/flavors/calibre/components/ui/link-class";
import { PageHeader } from "@/flavors/calibre/components/ui/page-header";
import { RichText } from "@/flavors/calibre/components/ui/rich-text";
import { SectionHead } from "@/flavors/calibre/components/ui/section-head";
import {
  bezelPrints,
  pad2,
  serviceRecord,
  span,
} from "@/flavors/calibre/lib/movement";

import { sitePage } from "@/content/site";
import { getExperience, getProfile, getProjects } from "@/lib/data";
import { employmentLabels } from "@/lib/data/labels";
import { formatMonthYear, formatTenure } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/work");

export const metadata: Metadata = pageMetadata(page);

/** The service record, enlarged: the subdial, then each role's entry, newest first. */
export default async function WorkPage() {
  const [experience, profile, projects] = await Promise.all([
    getExperience(),
    getProfile(),
    getProjects(),
  ]);
  const today = new Date();
  const record = serviceRecord(experience, today);
  const entries = record.arcs.map((arc, i) => ({
    ...arc,
    n: record.arcs.length - i,
    tenure: formatTenure(arc.role.startDate, arc.role.endDate ?? today),
  }));
  const first = experience.at(-1);

  return (
    <Page>
      <PageHeader
        hour={3}
        kicker="Service record"
        title="Experience"
        lede={page.description}
        meta={[
          { label: "Arcs", value: `${record.arcs.length} roles` },
          { label: "Span", value: `${record.months} months` },
          ...(first
            ? [
                {
                  label: "First entry",
                  value: formatMonthYear(first.startDate),
                },
              ]
            : []),
        ]}
        prints={bezelPrints(projects.length, profile.location)}
        dial={
          <ServiceDial record={record} className="h-full bg-raise p-[8%]" />
        }
      />

      <Container className="mt-section">
        <ServiceRecord record={record} size="lg" hrefFor={(id) => `#${id}`} />
      </Container>

      <Container
        as="section"
        aria-labelledby="notes-heading"
        className="mt-section"
      >
        <SectionHead
          id="notes-heading"
          kicker="Entries in the service record"
          title="Every role, newest first"
        />
        <ol>
          {entries.map(({ role, n, tenure, current }) => (
            <li
              key={role.id}
              id={role.id}
              className="grid scroll-mt-8 gap-x-10 gap-y-5 border-b border-line py-10 lg:grid-cols-12"
            >
              <div className="lg:col-span-4">
                <p className="spec">
                  Arc {pad2(n)} · {span(role)} ·{" "}
                  {current ? <b className="text-steel">Running</b> : "Serviced"}
                </p>
                <h3 className="mt-3 text-[clamp(2rem,1.3rem+2.4vw,3.25rem)] leading-[1]">
                  {role.company}
                </h3>
                <p className="mt-3 text-lead font-medium">{role.title}</p>
                <dl className="mt-5 grid grid-cols-[5.5rem_1fr] gap-y-1.5 text-sm">
                  <dt className="spec">Dates</dt>
                  <dd>
                    {formatMonthYear(role.startDate)} to{" "}
                    {role.endDate ? formatMonthYear(role.endDate) : "now"}
                  </dd>
                  <dt className="spec">Length</dt>
                  <dd>{tenure}</dd>
                  <dt className="spec">Terms</dt>
                  <dd>
                    {role.employmentNote ??
                      employmentLabels[role.employmentType]}
                  </dd>
                  <dt className="spec">Where</dt>
                  <dd>
                    {role.remote ? `Remote, ${role.location}` : role.location}
                  </dd>
                </dl>
                {role.companyUrl ? (
                  <p className="mt-4">
                    <ExternalLink
                      href={role.companyUrl}
                      className="inline-flex min-h-11 items-center text-sm font-medium"
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
                <RichText value={role.body} className="mt-5 text-soft" />
                {role.highlights.length > 0 ? (
                  <ul className="mt-6 grid gap-2.5">
                    {role.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-2 leading-snug"
                      >
                        <span
                          aria-hidden
                          className="mt-2 size-1.5 rounded-full bg-steel"
                        />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {role.continuedFrom || role.continuedInto ? (
                  <p className="mt-6 text-sm text-soft">
                    {role.continuedFrom ? (
                      <>
                        Continued from{" "}
                        <a
                          href={`#${role.continuedFrom.id}`}
                          className={`text-ink ${linkClass}`}
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
                          className={`text-ink ${linkClass}`}
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
                  <p className="mt-2 text-sm text-soft">
                    Ended: {role.endNote}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-soft">
          Skills and education are in the{" "}
          <Link href="/about" className={`text-ink ${linkClass}`}>
            bench notes
          </Link>
          .
        </p>
      </Container>
    </Page>
  );
}
