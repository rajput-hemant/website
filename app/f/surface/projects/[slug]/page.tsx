import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { lamp } from "@/flavors/surface/components/projects/status";
import { Panel } from "@/flavors/surface/components/site/panel";
import {
  KeyLink,
  Led,
  Legend,
} from "@/flavors/surface/components/ui/primitives";
import { RichText } from "@/flavors/surface/components/ui/rich-text";
import { pad2 } from "@/flavors/surface/components/ui/seg";

import { getProjects } from "@/lib/data";
import { projectStatusLabels } from "@/lib/data/labels";
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

/**
 * One preset loaded: the spec sheet, the screen and the notes. The knob here
 * browses every preset; push it to load another.
 */
export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const projects = orderProjectsForCatalog(await getProjects());
  const index = projects.findIndex((item) => item.slug === slug);
  const project = projects[index];
  if (!project) notFound();

  const state = lamp[project.status];
  const prev = projects[index - 1];
  const next = projects[index + 1];
  const links = [
    { label: "Source", href: project.github },
    { label: "Live", href: project.live },
  ].filter((link): link is { label: string; href: string } => !!link.href);

  return (
    <Panel
      ch="01"
      name="Projects"
      aside={`Preset ${pad2(index + 1)} of ${pad2(projects.length)}`}
      title={project.name}
      lede={project.tagline}
      meta={
        <div className="flex flex-wrap items-center gap-2.5">
          <p className="legend mr-2 inline-flex items-center gap-2">
            <Led on={state.on} pulse={state.pulse} />
            {projectStatusLabels[project.status]}
          </p>
          {links.map((link) => (
            <KeyLink key={link.href} href={link.href}>
              {link.label}
            </KeyLink>
          ))}
        </div>
      }
      knob={{
        items: projects.map((item) => ({
          label: item.name,
          href: `/projects/${item.slug}`,
        })),
        unit: "Preset",
        label: "Preset selector",
        initial: index,
      }}
    >
      {project.image && (
        <figure className="mod mb-12 p-3">
          <div className="glass overflow-hidden p-1.5">
            <Image
              src={project.image.url}
              alt={project.image.alt}
              width={project.image.width}
              height={project.image.height}
              placeholder={project.image.blurDataUrl ? "blur" : "empty"}
              blurDataURL={project.image.blurDataUrl}
              sizes="(min-width: 64rem) 60vw, 100vw"
              className="block h-auto w-full rounded-[3px]"
            />
          </div>
          <figcaption className="legend px-1 pt-3">
            {project.image.alt}
          </figcaption>
        </figure>
      )}

      <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_17rem]">
        <section aria-labelledby="notes">
          <h2 id="notes" className="legend seam-b mb-6 pb-3">
            Notes
          </h2>
          <RichText value={project.description} />
        </section>

        <section
          aria-labelledby="spec"
          className="rating-plate self-start px-5 py-4"
        >
          <h2 id="spec" className="legend border-b border-black/25 pb-2">
            Spec sheet
          </h2>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
            <dt className="legend text-[0.625rem] leading-[1.6]">Preset</dt>
            <dd className="font-medium">{pad2(index + 1)}</dd>
            <dt className="legend text-[0.625rem] leading-[1.6]">Year</dt>
            <dd className="font-medium">{project.year ?? "—"}</dd>
            <dt className="legend text-[0.625rem] leading-[1.6]">Status</dt>
            <dd className="font-medium">
              {projectStatusLabels[project.status]}
            </dd>
            {project.stack.length > 0 && (
              <>
                <dt className="legend text-[0.625rem] leading-[1.6]">Stack</dt>
                <dd>
                  <ul className="font-medium">
                    {project.stack.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </dd>
              </>
            )}
          </dl>
        </section>
      </div>

      <nav
        aria-label="Other presets"
        className="seam-t mt-16 flex flex-wrap justify-between gap-3 pt-6"
      >
        {prev ? (
          <KeyLink href={`/projects/${prev.slug}`}>
            <span aria-hidden>←</span> {pad2(index)} {prev.name}
          </KeyLink>
        ) : (
          <span />
        )}
        <KeyLink href="/projects">All presets</KeyLink>
        {next ? (
          <KeyLink href={`/projects/${next.slug}`}>
            {pad2(index + 2)} {next.name} <span aria-hidden>→</span>
          </KeyLink>
        ) : (
          <Legend as="span" className="self-center">
            Last preset
          </Legend>
        )}
      </nav>
    </Panel>
  );
}
