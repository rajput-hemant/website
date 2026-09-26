import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusStamp } from "@/flavors/press/components/projects/status-stamp";
import { Page } from "@/flavors/press/components/site/page";
import { buttonClass } from "@/flavors/press/components/ui/button";
import { Container } from "@/flavors/press/components/ui/container";
import { PageHeader } from "@/flavors/press/components/ui/page-header";
import { RichText } from "@/flavors/press/components/ui/rich-text";
import { pad2, separate } from "@/flavors/press/lib/proof";
import { cn } from "@/flavors/press/lib/utils";

import { getProjects } from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = (await getProjects()).find((item) => item.slug === slug);
  if (!project) return {};
  return pageMetadata({
    title: project.name,
    description: project.tagline,
    path: `/projects/${project.slug}`,
  });
}

function Plate({
  name,
  swatch,
  items,
}: {
  name: string;
  swatch: string;
  items: string[];
}) {
  return (
    <div className="border-t border-rule pt-3">
      <h3 className="flex items-center gap-2.5 text-sm font-bold tracking-normal">
        <i aria-hidden className={cn("size-3.5", swatch)} />
        {name}
      </h3>
      {items.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {items.map((item) => (
            <li key={item} className="text-lead font-semibold">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-ink-soft">Nothing on this plate.</p>
      )}
    </div>
  );
}

/** One signature, proofed plate by plate: its story, then the stack split into separations. */
export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const projects = await getProjects();
  const index = projects.findIndex((item) => item.slug === slug);
  const project = projects[index];
  if (!project) notFound();

  const plates = separate(project.stack);
  const prev = projects[index - 1];
  const next = projects[index + 1];
  const links = [
    { label: "See it live", href: project.live },
    { label: "Source on GitHub", href: project.github },
  ].filter((link): link is { label: string; href: string } => !!link.href);

  return (
    <Page>
      <PageHeader
        sheet={2}
        kicker={`Sig. ${pad2(index + 1)} / Progressive proof`}
        title={project.name}
        lede={project.tagline}
        meta={[
          { label: "First printed", value: String(project.year) },
          { label: "Stamp", value: <StatusStamp status={project.status} /> },
          { label: "Plates", value: `${project.stack.length} inks` },
        ]}
        scene="project"
      >
        {links.length > 0 ? (
          <div className="mt-8 flex flex-wrap gap-3">
            {links.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                data-magnetic
                className={buttonClass({
                  variant: i === 0 ? "ink" : "outline",
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
        <section aria-labelledby="about-heading" className="lg:col-span-7">
          <h2 id="about-heading" className="slug">
            The job
          </h2>
          {project.image ? (
            <Image
              src={project.image.url}
              alt={project.image.alt}
              width={project.image.width}
              height={project.image.height}
              placeholder={project.image.blurDataUrl ? "blur" : "empty"}
              blurDataURL={project.image.blurDataUrl}
              sizes="(min-width: 64rem) 55vw, 100vw"
              className="crop-marks mt-6 h-auto w-full"
            />
          ) : null}
          <RichText value={project.description} className="mt-6 text-lead" />
        </section>
        <section
          aria-labelledby="plates-heading"
          className="grid content-start gap-5 lg:col-span-4 lg:col-start-9"
        >
          <h2 id="plates-heading" className="slug">
            Separations &nbsp;/&nbsp; {project.stack.length} inks
          </h2>
          <Plate name="P1 Interface" swatch="bg-pink" items={plates.p1} />
          <Plate name="P2 Systems" swatch="bg-blue" items={plates.p2} />
        </section>
      </Container>

      <Container as="nav" aria-label="Other signatures" className="mt-section">
        <div className="grid gap-4 border-t-2 border-ink pt-5 sm:grid-cols-3">
          {prev ? (
            <Link
              href={`/projects/${prev.slug}`}
              className="group grid min-h-11 content-start gap-1"
            >
              <span className="slug">← Sig. {pad2(index)}</span>
              <span className="text-lead font-extrabold fine:group-hover:underline fine:group-hover:decoration-pink">
                {prev.name}
              </span>
            </Link>
          ) : (
            <span />
          )}
          <Link
            href="/projects"
            className="inline-flex min-h-11 items-center self-center font-bold underline decoration-pink decoration-2 underline-offset-[0.3em] sm:justify-self-center"
          >
            All signatures
          </Link>
          {next ? (
            <Link
              href={`/projects/${next.slug}`}
              className="group grid min-h-11 content-start gap-1 sm:text-right"
            >
              <span className="slug">Sig. {pad2(index + 2)} →</span>
              <span className="text-lead font-extrabold fine:group-hover:underline fine:group-hover:decoration-pink">
                {next.name}
              </span>
            </Link>
          ) : null}
        </div>
      </Container>
    </Page>
  );
}
