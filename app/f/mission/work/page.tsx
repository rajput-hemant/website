import type { Metadata } from "next";
import Link from "next/link";
import { Trajectory } from "@/flavors/mission/components/flight/trajectory";
import { Page } from "@/flavors/mission/components/site/page";
import { Checklist } from "@/flavors/mission/components/ui/checklist";
import { Container } from "@/flavors/mission/components/ui/container";
import { ExternalLink } from "@/flavors/mission/components/ui/external-link";
import { PageHeader } from "@/flavors/mission/components/ui/page-header";
import { RichText } from "@/flavors/mission/components/ui/rich-text";
import { SectionHead } from "@/flavors/mission/components/ui/section-head";
import {
  activeAt,
  flightPlan,
  launchLabel,
  phaseSpan,
} from "@/flavors/mission/lib/flight";
import { boardFor } from "@/flavors/mission/lib/scene/poses";

import { sitePage } from "@/content/site";
import { getExperience, getProjects } from "@/lib/data";
import { employmentLabels } from "@/lib/data/labels";
import { formatMonthYear, formatTenure } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/work");

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata(page);
}

/** The full trajectory, then a briefing for each phase, newest first. */
export default async function WorkPage() {
  const [experience, projects] = await Promise.all([
    getExperience(),
    getProjects(),
  ]);
  const today = new Date();
  const flight = flightPlan(experience, projects, today);
  const phaseOf = new Map(flight.phases.map((p) => [p.id, p]));
  const peak = Math.max(
    0,
    ...flight.phases.map((p) => activeAt(flight, p.a).length)
  );
  const briefings = [...flight.phases].reverse();
  const roles = new Map(experience.map((role) => [role.id, role]));

  return (
    <Page>
      <PageHeader
        section={3}
        kicker="Trajectory"
        title="Experience"
        lede={page.description}
        meta={[
          { label: "T-0", value: launchLabel(flight) },
          { label: "Phases", value: `${flight.phases.length} flown` },
          { label: "Most at once", value: `${peak} phases on board` },
          ...(flight.pre
            ? [
                {
                  label: "Pre-launch",
                  value: `${flight.pre.from} to ${flight.pre.to}, side projects`,
                },
              ]
            : []),
        ]}
        scene={{
          route: "work",
          board: boardFor(flight),
          caption: "Scrub Fig. 2 and the orbits in phase turn red.",
        }}
      />

      <Container className="mt-section">
        <Trajectory flight={flight} />
      </Container>

      <Container
        as="section"
        aria-labelledby="briefings-heading"
        className="mt-section"
      >
        <SectionHead
          id="briefings-heading"
          number="3.1"
          title="Phase briefings"
          size="h2"
          aside="Newest first"
        />
        <ol>
          {briefings.map((phase) => {
            const role = roles.get(phase.id);
            if (!role) return null;
            return (
              <li
                key={role.id}
                id={role.id}
                className="grid scroll-mt-8 gap-x-6 gap-y-6 border-b border-rule py-12 lg:grid-cols-12"
              >
                <div className="lg:col-span-4">
                  <p className="flex items-center gap-3 label">
                    <b className="font-semibold text-signal">{phase.code}</b>
                    {phaseSpan(flight, phase)}
                    {phase.b === null ? (
                      <em className="text-signal not-italic">In flight</em>
                    ) : null}
                  </p>
                  <h3 className="mt-4 text-h2">{role.company}</h3>
                  <p className="mt-2 text-lg font-medium">{role.title}</p>
                  <Checklist
                    className="mt-6"
                    rows={[
                      {
                        label: "Dates",
                        value: `${formatMonthYear(role.startDate)} to ${role.endDate ? formatMonthYear(role.endDate) : "now"}`,
                      },
                      {
                        label: "Duration",
                        value: formatTenure(
                          role.startDate,
                          role.endDate ?? today
                        ),
                      },
                      { label: "Inclination", value: `${phase.inc}°` },
                      {
                        label: "Terms",
                        value:
                          role.employmentNote ??
                          employmentLabels[role.employmentType],
                      },
                      {
                        label: "Station",
                        value: role.remote
                          ? `Remote, ${role.location}`
                          : role.location,
                      },
                    ]}
                  />
                  {role.companyUrl ? (
                    <p className="mt-3">
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
                    <p className="font-display text-[clamp(1.375rem,1.1rem+0.8vw,1.875rem)] leading-tight font-bold tracking-[-0.02em]">
                      {role.note}
                    </p>
                  ) : null}
                  <RichText
                    value={role.body}
                    className="mt-5 text-[1.0625rem] leading-relaxed"
                  />
                  {role.highlights.length > 0 ? (
                    <ul className="mt-6 grid gap-2.5">
                      {role.highlights.map((highlight) => (
                        <li
                          key={highlight}
                          className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-2 leading-snug"
                        >
                          <span
                            aria-hidden
                            className="mt-2 size-1.5 bg-signal"
                          />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {role.continuedFrom || role.continuedInto ? (
                    <p className="mt-6 text-sm text-ink-soft">
                      {role.continuedFrom ? (
                        <>
                          Transfer from{" "}
                          <a
                            href={`#${role.continuedFrom.id}`}
                            className="rule-link text-ink"
                          >
                            {phaseOf.get(role.continuedFrom.id)?.code ?? ""}{" "}
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
                          Transfer to{" "}
                          <a
                            href={`#${role.continuedInto.id}`}
                            className="rule-link text-ink"
                          >
                            {phaseOf.get(role.continuedInto.id)?.code ?? ""}{" "}
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
                    <p className="mt-2 label">Phase ended: {role.endNote}</p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
        <p className="mt-8 text-ink-soft">
          Skills and education are in the{" "}
          <Link href="/about" className="rule-link text-ink">
            crew biography
          </Link>
          .
        </p>
      </Container>
    </Page>
  );
}
