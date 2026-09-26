import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { conditions } from "@/flavors/survey/components/projects/conditions";
import { SiteSymbol } from "@/flavors/survey/components/projects/site-symbol";
import { Page } from "@/flavors/survey/components/site/page";
import { Button } from "@/flavors/survey/components/ui/button";
import { Container } from "@/flavors/survey/components/ui/container";
import { PageHeader } from "@/flavors/survey/components/ui/page-header";
import { RichText } from "@/flavors/survey/components/ui/rich-text";
import { SectionHead } from "@/flavors/survey/components/ui/section-head";
import { Tag } from "@/flavors/survey/components/ui/tag";
import { getRelief } from "@/flavors/survey/lib/sheet";

import { getProjects } from "@/lib/data";
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

/** A site report: where it lies, its condition, what it was surveyed with, and its neighbours in grid order. */
export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const [projects, relief] = await Promise.all([getProjects(), getRelief()]);
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();

  const order = relief.sites;
  const index = order.findIndex((s) => s.slug === slug);
  const site = order[index];
  const prev = order[index - 1];
  const next = order[index + 1];
  const condition = conditions[project.status];
  const links = [
    { label: "Visit the site", href: project.live },
    { label: "Source on GitHub", href: project.github },
  ].filter((link): link is { label: string; href: string } => !!link.href);

  return (
    <Page>
      <PageHeader
        kicker={`Site report · grid ${site?.ref ?? project.year}`}
        title={project.name}
        lede={project.tagline}
        meta={[
          { label: "Surveyed", value: String(project.year) },
          {
            label: "Condition",
            value: (
              <span className={condition.className}>{condition.label}</span>
            ),
          },
          { label: "Instruments", value: String(project.stack.length) },
        ]}
        scene={{ relief, route: "project", target: project.slug }}
      >
        {links.length > 0 ? (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {links.map((link, i) => (
              <Button
                key={link.href}
                asChild
                variant={i === 0 ? "primary" : "ghost"}
                magnetic
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

      <Container className="mt-section grid gap-x-12 gap-y-14 lg:grid-cols-12">
        <section aria-labelledby="report-heading" className="lg:col-span-7">
          <SectionHead id="report-heading" as="h2" title="Field notes" />
          {project.image ? (
            <Image
              src={project.image.url}
              alt={project.image.alt}
              width={project.image.width}
              height={project.image.height}
              placeholder={project.image.blurDataUrl ? "blur" : "empty"}
              blurDataURL={project.image.blurDataUrl}
              className="mt-8 h-auto w-full border border-rule"
              sizes="(min-width: 64rem) 55vw, 100vw"
            />
          ) : null}
          <RichText value={project.description} className="mt-8 text-lead" />
        </section>
        <section
          aria-labelledby="instruments-heading"
          className="lg:col-span-4 lg:col-start-9"
        >
          <SectionHead
            id="instruments-heading"
            as="h2"
            title="Surveyed with"
            aside={`${project.stack.length} instruments`}
          />
          <ul className="mt-6 flex flex-wrap gap-2">
            {project.stack.map((item) => (
              <li key={item}>
                <Tag className="text-ink">{item}</Tag>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex items-center gap-4 border-t border-rule pt-5">
            <SiteSymbol status={project.status} />
            <p className="text-sm text-ink-soft">
              Marked on the sheet as{" "}
              {project.status === "archived"
                ? "an antiquity"
                : project.status === "wip"
                  ? "works under construction"
                  : "a trig pillar"}
              , in grid square {site?.ref}.
            </p>
          </div>
        </section>
      </Container>

      <Container
        as="nav"
        aria-label="Neighbouring sites"
        className="mt-section"
      >
        <div className="grid gap-4 border-t-[1.5px] border-rule-strong pt-6 sm:grid-cols-3">
          {prev ? (
            <Link
              href={`/projects/${prev.slug}`}
              className="group grid min-h-11 content-start gap-1"
            >
              <span className="caps text-ink-faint">
                ← West, grid {prev.ref}
              </span>
              <span className="font-display text-lead fine:group-hover:text-water">
                {prev.name}
              </span>
            </Link>
          ) : (
            <span />
          )}
          <Link
            href="/projects"
            className="inline-flex min-h-11 items-center justify-center self-center justify-self-center font-medium underline decoration-contour underline-offset-[0.35em] max-sm:justify-self-start"
          >
            The gazetteer
          </Link>
          {next ? (
            <Link
              href={`/projects/${next.slug}`}
              className="group grid min-h-11 content-start gap-1 sm:text-right"
            >
              <span className="caps text-ink-faint">
                East, grid {next.ref} →
              </span>
              <span className="font-display text-lead fine:group-hover:text-water">
                {next.name}
              </span>
            </Link>
          ) : null}
        </div>
      </Container>
    </Page>
  );
}
