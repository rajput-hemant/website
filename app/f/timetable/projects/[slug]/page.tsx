import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CallingPattern } from "@/flavors/timetable/components/projects/calling-pattern";
import { Page } from "@/flavors/timetable/components/site/page";
import {
  Button,
  Container,
  PageHeader,
  RichText,
  SectionHead,
} from "@/flavors/timetable/components/ui";
import { departures } from "@/flavors/timetable/lib/board";

import { getProjects } from "@/lib/data";
import { orderProjectsForCatalog } from "@/lib/data/project-order";
import { pageMetadata } from "@/lib/metadata";

type ProjectPageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = (await getProjects()).find((item) => item.slug === slug);
  if (!project) return {};
  return pageMetadata({
    title: project.name,
    description: project.tagline,
    path: `/projects/${project.slug}`,
  });
}

/** One departure's service details: where it goes, what it calls at, how to board. */
export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const projects = orderProjectsForCatalog(await getProjects());
  const index = projects.findIndex((item) => item.slug === slug);
  const project = projects[index];
  if (!project) notFound();

  const status = departures[project.status];
  const platform = project.stack[0] ?? "Web";
  const prev = projects[index - 1];
  const next = projects[index + 1];
  const links = [
    { label: "Board the live service", href: project.live },
    { label: "Source on GitHub", href: project.github },
  ].filter((link): link is { label: string; href: string } => !!link.href);

  return (
    <Page>
      <PageHeader
        platform="1"
        kicker={`Departure ${project.year ?? "—"}`}
        title={project.name}
        lede={project.tagline}
        meta={[
          {
            label: "Departs",
            value: project.year != null ? String(project.year) : "—",
          },
          { label: "Platform", value: platform },
          {
            label: "Status",
            value: (
              <>
                {status.label}
                <span className="ml-2 font-mono text-mono-sm font-medium text-ink-soft">
                  {status.meaning}
                </span>
              </>
            ),
          },
        ]}
        scene="project"
        board={`${project.name}|${project.year ?? ""}|${status.label}`}
      >
        {links.length > 0 ? (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {links.map((link, i) => (
              <Button
                key={link.href}
                asChild
                variant={i === 0 ? "primary" : "ghost"}
                arrow={false}
              >
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                  <span aria-hidden>↗</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </Button>
            ))}
          </div>
        ) : null}
      </PageHeader>

      <Container className="mt-section grid gap-x-6 gap-y-16 lg:grid-cols-12">
        <section aria-labelledby="about-heading" className="lg:col-span-7">
          <SectionHead id="about-heading" title="About this service" as="h2" />
          {project.image ? (
            <Image
              src={project.image.url}
              alt={project.image.alt}
              width={project.image.width}
              height={project.image.height}
              placeholder={project.image.blurDataUrl ? "blur" : "empty"}
              blurDataURL={project.image.blurDataUrl}
              className="mt-8 h-auto w-full rounded-lg"
              sizes="(min-width: 64rem) 55vw, 100vw"
            />
          ) : null}
          <RichText value={project.description} className="mt-8 text-lead" />
        </section>
        <section
          aria-labelledby="calling-heading"
          className="lg:col-span-4 lg:col-start-9"
        >
          <SectionHead
            id="calling-heading"
            title="Calling at"
            aside={`${project.stack.length} stops`}
          />
          <CallingPattern stops={project.stack} className="mt-6" />
        </section>
      </Container>

      <Container as="nav" aria-label="Other departures" className="mt-section">
        <div className="grid gap-3 border-t-[3px] border-rule-strong pt-6 sm:grid-cols-3">
          {prev ? (
            <Link
              href={`/projects/${prev.slug}`}
              className="group grid min-h-11 content-start gap-1"
            >
              <span className="font-mono text-mono-xs font-semibold tracking-[0.08em] text-ink-soft uppercase">
                ← Previous departure
              </span>
              <span className="text-lead font-extrabold fine:group-hover:underline">
                {prev.name}
              </span>
            </Link>
          ) : (
            <span />
          )}
          <Link
            href="/projects"
            className="inline-flex min-h-11 items-center justify-center gap-2 self-center justify-self-center border-b-2 border-current leading-none font-bold max-sm:justify-self-start"
          >
            All departures
          </Link>
          {next ? (
            <Link
              href={`/projects/${next.slug}`}
              className="group grid min-h-11 content-start gap-1 sm:text-right"
            >
              <span className="font-mono text-mono-xs font-semibold tracking-[0.08em] text-ink-soft uppercase">
                Next departure →
              </span>
              <span className="text-lead font-extrabold fine:group-hover:underline">
                {next.name}
              </span>
            </Link>
          ) : null}
        </div>
      </Container>
    </Page>
  );
}
