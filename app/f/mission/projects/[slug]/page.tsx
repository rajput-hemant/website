import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MissionPatch } from "@/flavors/mission/components/flight/patch";
import { CatalogueImage } from "@/flavors/mission/components/projects/catalogue-image";
import { StateLamp } from "@/flavors/mission/components/projects/mission-card";
import { Page } from "@/flavors/mission/components/site/page";
import { buttonClass } from "@/flavors/mission/components/ui/button";
import { Checklist } from "@/flavors/mission/components/ui/checklist";
import { Container } from "@/flavors/mission/components/ui/container";
import { PageHeader } from "@/flavors/mission/components/ui/page-header";
import { RichText } from "@/flavors/mission/components/ui/rich-text";
import {
  byLaunch,
  designation,
  missionState,
  stateLabels,
} from "@/flavors/mission/lib/flight";

import { projectStatusLabels } from "@/lib/data/labels";
import {
  loadProjectPage,
  projectMetadata,
  projectStaticParams,
} from "@/lib/data/project-page";

type Props = { params: Promise<{ slug: string }> };

export const generateStaticParams = projectStaticParams;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return projectMetadata((await params).slug);
}

/** One mission's briefing: the patch large, the mission profile, the story, and the missions either side. */
export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const result = await loadProjectPage(slug, byLaunch);
  if (!result) notFound();
  const { project, index, previous: prev, next } = result;
  const state = missionState[project.status];
  const code = designation(project);

  const links = [
    { label: "See it live", href: project.live },
    { label: "Source on GitHub", href: project.github },
  ].filter((link): link is { label: string; href: string } => !!link.href);

  return (
    <Page>
      <PageHeader
        section="2.0"
        kicker={`Mission ${code}`}
        title={project.name}
        lede={project.tagline}
        meta={[
          { label: "Designation", value: code },
          { label: "Launched", value: String(project.year ?? "Undated") },
          {
            label: "State",
            value: `${stateLabels[state]}, ${projectStatusLabels[project.status].toLowerCase()}`,
            nominal: state === "nominal" || state === "operational",
          },
          { label: "Orbits", value: String(project.stack.length) },
        ]}
        figure={
          <figure className="group/mission m-0 flex flex-col gap-3">
            <p className="label text-ink-soft">
              <b className="font-semibold text-ink">Fig. 1</b>&nbsp; Mission
              patch
            </p>
            <MissionPatch
              id={`patch-${project.slug}`}
              name={project.name}
              code={code}
              state={state}
              technologies={project.stack.length}
              year={project.year}
              index={Math.max(0, index)}
              className="mx-auto w-full max-w-[22rem] p-4"
            />
            <figcaption className="label">
              One orbit per technology aboard
              {project.stack.length > 5 ? ", the first five drawn" : ""}.
            </figcaption>
          </figure>
        }
      >
        {links.length > 0 ? (
          <div className="mt-8 flex flex-wrap gap-3">
            {links.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass({
                  variant: i === 0 ? "signal" : "outline",
                })}
              >
                {link.label} <span aria-hidden>↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ))}
          </div>
        ) : null}
      </PageHeader>

      <Container className="mt-section grid gap-x-6 gap-y-14 lg:grid-cols-12">
        <section
          aria-labelledby="brief-heading"
          className="min-w-0 lg:col-span-7"
        >
          <h2
            id="brief-heading"
            className="border-t-2 border-ink pt-3 label text-ink-soft"
          >
            <b className="font-semibold text-signal">2.1</b>&nbsp; Mission
            briefing
          </h2>
          {project.image ? (
            <figure className="m-0 mt-6">
              <CatalogueImage
                image={project.image}
                sizes="(min-width: 64rem) 55vw, 100vw"
                className="border border-rule-strong"
              />
              <figcaption className="mt-2 label">
                <b className="font-semibold text-ink">Fig. 2</b>&nbsp;{" "}
                {project.image.alt}
              </figcaption>
            </figure>
          ) : null}
          <RichText
            value={project.description}
            className="mt-6 text-[1.125rem] leading-relaxed"
          />
        </section>
        <section
          aria-labelledby="payload-heading"
          className="min-w-0 lg:col-span-4 lg:col-start-9"
        >
          <h2
            id="payload-heading"
            className="border-t-2 border-ink pt-3 label text-ink-soft"
          >
            <b className="font-semibold text-signal">2.2</b>&nbsp; Payload
          </h2>
          {project.stack.length ? (
            <Checklist
              className="mt-6"
              rows={project.stack.map((tech, i) => ({
                label: `Orbit ${i + 1}`,
                value: tech,
              }))}
            />
          ) : (
            <p className="mt-6 text-ink-soft">No payload recorded.</p>
          )}
          <p className="mt-5 flex items-center gap-2 label">
            <StateLamp state={state} />
            {stateLabels[state]}
          </p>
        </section>
      </Container>

      <Container as="nav" aria-label="Other missions" className="mt-section">
        <div className="grid gap-4 border-t-2 border-ink pt-5 sm:grid-cols-3">
          {prev ? (
            <Link
              href={`/projects/${prev.slug}`}
              className="group grid min-h-11 content-start gap-1"
            >
              <span className="label">← {designation(prev)}</span>
              <span className="font-display text-h3 transition-colors duration-(--duration-ui) ease-out fine:group-hover:text-signal">
                {prev.name}
              </span>
            </Link>
          ) : (
            <span />
          )}
          <Link
            href="/projects"
            className="rule-link inline-flex min-h-11 items-center self-center font-display font-bold sm:justify-self-center"
          >
            The full manifest
          </Link>
          {next ? (
            <Link
              href={`/projects/${next.slug}`}
              className="group grid min-h-11 content-start gap-1 sm:text-right"
            >
              <span className="label">{designation(next)} →</span>
              <span className="font-display text-h3 transition-colors duration-(--duration-ui) ease-out fine:group-hover:text-signal">
                {next.name}
              </span>
            </Link>
          ) : null}
        </div>
      </Container>
    </Page>
  );
}
