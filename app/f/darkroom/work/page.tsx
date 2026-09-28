import type { Metadata } from "next";
import Link from "next/link";
import { FilmRoll } from "@/flavors/darkroom/components/roll/film-roll";
import { Page } from "@/flavors/darkroom/components/site/page";
import { Container } from "@/flavors/darkroom/components/ui/container";
import { ExternalLink } from "@/flavors/darkroom/components/ui/external-link";
import { linkClass } from "@/flavors/darkroom/components/ui/link-class";
import { PageHeader } from "@/flavors/darkroom/components/ui/page-header";
import { RichText } from "@/flavors/darkroom/components/ui/rich-text";
import { SectionHead } from "@/flavors/darkroom/components/ui/section-head";
import { hash } from "@/flavors/darkroom/lib/frame-art";
import { filmRoll, pad2 } from "@/flavors/darkroom/lib/roll";
import { encodeBoard } from "@/flavors/darkroom/lib/scene/prints";

import { sitePage } from "@/content/site";
import { getExperience } from "@/lib/data";
import { employmentLabels } from "@/lib/data/labels";
import { formatMonthYear } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/work");

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata(page);
}

/** The film roll: one frame per role, then each frame's notes, newest first. */
export default async function WorkPage() {
  const experience = await getExperience();
  const frames = filmRoll(experience, new Date());
  const first = experience.at(-1);
  const longest = frames.reduce<(typeof frames)[number] | undefined>(
    (best, frame) => (!best || frame.months > best.months ? frame : best),
    undefined
  );

  return (
    <Page>
      <PageHeader
        frame="02"
        kicker="Film roll"
        title="Experience"
        lede={page.description}
        meta={[
          { label: "Frames", value: `${frames.length} roles` },
          ...(first
            ? [
                {
                  label: "First frame",
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
        board={encodeBoard(
          [...frames]
            .sort((a, b) => a.n - b.n)
            .map((frame) => ({
              archetype: frame.current ? "terminal" : "hills",
              seed: hash(frame.role.company),
              select: frame.current,
            }))
        )}
      />

      <Container className="mt-section">
        <FilmRoll frames={frames} hrefFor={(id) => `#${id}`} />
      </Container>

      <Container
        as="section"
        aria-labelledby="notes-heading"
        className="mt-section"
      >
        <SectionHead
          id="notes-heading"
          kicker="Notes on the sleeve"
          title="Every frame, newest first"
        />
        <ol>
          {frames.map(({ role, n, code, tenure, current }) => (
            <li
              key={role.id}
              id={role.id}
              data-scene-item={`role:${role.id}`}
              className="grid scroll-mt-8 gap-x-10 gap-y-5 border-b border-line py-10 lg:grid-cols-12"
            >
              <div className="lg:col-span-4">
                <p className="edge">
                  ▸ Frame {pad2(n)} / {code} /{" "}
                  {current ? (
                    <b className="text-grease">On the drying line</b>
                  ) : (
                    "Fixed"
                  )}
                </p>
                <h3 className="mt-3 text-[clamp(2rem,1.3rem+2.4vw,3.25rem)] leading-[0.92]">
                  {role.company}
                </h3>
                <p className="mt-3 text-lead font-medium">{role.title}</p>
                <dl className="mt-5 grid grid-cols-[5.5rem_1fr] gap-y-1.5 text-sm">
                  <dt className="edge">Dates</dt>
                  <dd>
                    {formatMonthYear(role.startDate)} to{" "}
                    {role.endDate ? formatMonthYear(role.endDate) : "now"}
                  </dd>
                  <dt className="edge">Length</dt>
                  <dd>{tenure}</dd>
                  <dt className="edge">Terms</dt>
                  <dd>
                    {role.employmentNote ??
                      employmentLabels[role.employmentType]}
                  </dd>
                  <dt className="edge">Where</dt>
                  <dd>
                    {role.remote ? `Remote, ${role.location}` : role.location}
                  </dd>
                </dl>
                {role.companyUrl ? (
                  <p className="mt-4">
                    <ExternalLink
                      href={role.companyUrl}
                      className="inline-flex min-h-11 items-center text-sm font-semibold"
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
                        <span aria-hidden className="edge text-grease">
                          ▸
                        </span>
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
          Skills and education are written on the back of the{" "}
          <Link href="/about" className={`text-ink ${linkClass}`}>
            enlargement
          </Link>
          .
        </p>
      </Container>
    </Page>
  );
}
