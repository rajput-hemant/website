import type { Metadata } from "next";
import Link from "next/link";
import { Page } from "@/flavors/jacquard/components/site/page";
import { Container } from "@/flavors/jacquard/components/ui/container";
import { ExternalLink } from "@/flavors/jacquard/components/ui/external-link";
import { MuseumLabel } from "@/flavors/jacquard/components/ui/museum-label";
import { PageHeader } from "@/flavors/jacquard/components/ui/page-header";
import { RichText } from "@/flavors/jacquard/components/ui/rich-text";
import { SectionHead } from "@/flavors/jacquard/components/ui/section-head";
import { Threads } from "@/flavors/jacquard/components/work/threads";
import { threadWeave } from "@/flavors/jacquard/lib/scene/poses";
import { cn } from "@/flavors/jacquard/lib/utils";
import { loomThreads, pad2, yarnClass } from "@/flavors/jacquard/lib/weave";

import { sitePage } from "@/content/site";
import { getExperience } from "@/lib/data";
import { employmentLabels } from "@/lib/data/labels";
import { formatMonthYear } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/work");

export const metadata: Metadata = pageMetadata(page);

/** Every role as a thread on one axis, then each role's own entry, newest first. */
export default async function WorkPage() {
  const experience = await getExperience();
  const loom = loomThreads(experience, new Date());
  const first = experience.at(-1);

  return (
    <Page>
      <PageHeader
        card={3}
        kicker="Threads"
        title="Experience"
        lede={page.description}
        meta={[
          {
            label: "Roles",
            value: `${loom.rows.length} roles on ${loom.threads} threads`,
          },
          ...(first
            ? [{ label: "First end", value: formatMonthYear(first.startDate) }]
            : []),
          {
            label: "Carried on",
            value: `${loom.carries.length} times, when a team moved`,
          },
        ]}
        scene={{
          route: "work",
          weave: threadWeave(loom),
          caption:
            "The roles woven across the months, one band per role in its thread's yarn.",
        }}
      />

      <Container className="mt-section">
        <Threads loom={loom} hrefFor={(id) => `#${id}`} />
      </Container>

      <Container
        as="section"
        aria-labelledby="roles-heading"
        className="mt-section"
      >
        <SectionHead
          id="roles-heading"
          title="Every role, newest first"
          size="h2"
          aside="Thread by thread"
        />
        <ol>
          {loom.rows.map(({ role, thread, yarn, tenure, current }) => (
            <li
              key={role.id}
              id={role.id}
              data-scene-item={`role:${role.id}`}
              className={cn(
                "grid scroll-mt-8 gap-x-14 gap-y-6 border-b border-rule py-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]",
                yarnClass[yarn]
              )}
            >
              <div>
                <p className="flex items-center gap-3 label">
                  <i aria-hidden className="yarn h-[5px] w-8 rounded-[3px]" />
                  Thread {pad2(thread + 1)}
                  {current ? " · on the loom" : ""}
                </p>
                <h3 className="mt-4 text-h2">{role.company}</h3>
                <p className="mt-2 text-lg font-medium">{role.title}</p>
                <MuseumLabel
                  className="mt-6"
                  rows={[
                    {
                      label: "Dates",
                      value: `${formatMonthYear(role.startDate)} to ${role.endDate ? formatMonthYear(role.endDate) : "now"}`,
                    },
                    { label: "Length", value: tenure },
                    {
                      label: "Terms",
                      value:
                        role.employmentNote ??
                        employmentLabels[role.employmentType],
                    },
                    {
                      label: "Where",
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
              <div className="min-w-0">
                {role.note ? (
                  <p className="font-display text-[clamp(1.375rem,1.1rem+0.8vw,1.875rem)] leading-tight">
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
                          className="yarn mt-2.5 h-[3px] w-3 rounded-[2px]"
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
                        The thread carries on from{" "}
                        <a
                          href={`#${role.continuedFrom.id}`}
                          className="thread-link text-ink"
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
                        The thread carries on into{" "}
                        <a
                          href={`#${role.continuedInto.id}`}
                          className="thread-link text-ink"
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
                  <p className="mt-2 label">Ended: {role.endNote}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-ink-soft">
          Skills and education are on the{" "}
          <Link href="/about" className="thread-link text-ink">
            object label
          </Link>
          .
        </p>
      </Container>
    </Page>
  );
}
