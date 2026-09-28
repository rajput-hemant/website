import type { Metadata } from "next";
import Link from "next/link";
import { PhasingPlan } from "@/flavors/maquette/components/model/phasing-plan";
import { Page } from "@/flavors/maquette/components/site/page";
import { Container } from "@/flavors/maquette/components/ui/container";
import { ExternalLink } from "@/flavors/maquette/components/ui/external-link";
import { linkClass } from "@/flavors/maquette/components/ui/link-class";
import { PageHeader } from "@/flavors/maquette/components/ui/page-header";
import { RichText } from "@/flavors/maquette/components/ui/rich-text";
import { SectionHead } from "@/flavors/maquette/components/ui/section-head";
import {
  encodeBoard,
  pad2,
  phaseBoard,
  phaseDates,
  phasingPlan,
} from "@/flavors/maquette/lib/model";

import { sitePage } from "@/content/site";
import { getExperience } from "@/lib/data";
import { employmentLabels } from "@/lib/data/labels";
import { formatMonthYear } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/work");

export const metadata: Metadata = pageMetadata(page);

/** The full phasing plan, then each phase's notes, newest first. */
export default async function WorkPage() {
  const experience = await getExperience();
  const plan = phasingPlan(experience, new Date());
  const frames = plan.phases;
  const first = experience.at(-1);
  const longest = frames.reduce<(typeof frames)[number] | undefined>(
    (best, frame) => (!best || frame.months > best.months ? frame : best),
    undefined
  );

  return (
    <Page>
      <PageHeader
        frame="02"
        kicker="Phasing plan"
        title="Experience"
        lede={page.description}
        meta={[
          { label: "Phases", value: `${frames.length} roles` },
          ...(first
            ? [
                {
                  label: "Phase 1",
                  value: formatMonthYear(first.startDate),
                },
              ]
            : []),
          ...(longest
            ? [
                {
                  label: "Longest",
                  value: `${longest.role.company}, ${longest.tenure}`,
                },
              ]
            : []),
        ]}
        scene="work"
        board={encodeBoard(phaseBoard(plan))}
        sceneLabel="One slab per role, set out by start date"
      />

      <Container className="mt-section">
        <PhasingPlan plan={plan} hrefFor={(id) => `#${id}`} />
      </Container>

      <Container
        as="section"
        aria-labelledby="notes-heading"
        className="mt-section"
      >
        <SectionHead
          id="notes-heading"
          kicker="Notes on each phase"
          title="Every phase, newest first"
        />
        <ol>
          {frames.map(({ role, n, tenure, current }) => (
            <li
              key={role.id}
              id={role.id}
              data-scene-item={`role:${role.id}`}
              className="grid scroll-mt-8 gap-x-10 gap-y-5 border-b border-line py-10 lg:grid-cols-12"
            >
              <div className="lg:col-span-4">
                <p className="num">
                  Phase {pad2(n)} · {phaseDates(role)} ·{" "}
                  {current ? (
                    <b className="font-normal text-cut">Basswood, building</b>
                  ) : (
                    "White card, built"
                  )}
                </p>
                <h3 className="mt-3 text-[clamp(2rem,1.3rem+2.4vw,3.25rem)] leading-[0.96] font-light tracking-[-0.03em]">
                  {role.company}
                </h3>
                <p className="mt-3 font-display text-lead">{role.title}</p>
                <dl className="mt-5 grid grid-cols-[5.5rem_1fr] gap-y-1.5 text-sm">
                  <dt className="caps">Dates</dt>
                  <dd>
                    {formatMonthYear(role.startDate)} to{" "}
                    {role.endDate ? formatMonthYear(role.endDate) : "now"}
                  </dd>
                  <dt className="caps">Length</dt>
                  <dd>{tenure}</dd>
                  <dt className="caps">Terms</dt>
                  <dd>
                    {role.employmentNote ??
                      employmentLabels[role.employmentType]}
                  </dd>
                  <dt className="caps">Where</dt>
                  <dd>
                    {role.remote ? `Remote, ${role.location}` : role.location}
                  </dd>
                </dl>
                {role.companyUrl ? (
                  <p className="mt-4">
                    <ExternalLink
                      href={role.companyUrl}
                      className="inline-flex min-h-11 items-center font-display text-sm"
                    >
                      {role.company}
                    </ExternalLink>
                  </p>
                ) : null}
              </div>
              <div className="min-w-0 lg:col-span-7 lg:col-start-6">
                {role.note ? (
                  <p className="font-display text-[clamp(1.25rem,1rem+0.8vw,1.625rem)] leading-snug tracking-[-0.01em]">
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
                          className="mt-[0.55em] size-1.5 bg-wood"
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
          Skills and education are on the studio&rsquo;s{" "}
          <Link href="/about" className={`text-ink ${linkClass}`}>
            wall label
          </Link>
          .
        </p>
      </Container>
    </Page>
  );
}
