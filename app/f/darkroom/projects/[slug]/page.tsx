import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Page } from "@/flavors/darkroom/components/site/page";
import { Art } from "@/flavors/darkroom/components/ui/art";
import { buttonClass } from "@/flavors/darkroom/components/ui/button";
import { Container } from "@/flavors/darkroom/components/ui/container";
import { actionLinkClass } from "@/flavors/darkroom/components/ui/link-class";
import { PageHeader } from "@/flavors/darkroom/components/ui/page-header";
import { RichText } from "@/flavors/darkroom/components/ui/rich-text";
import { archetypeFor, hash } from "@/flavors/darkroom/lib/frame-art";
import { development, pad2, STOCK } from "@/flavors/darkroom/lib/roll";
import { encodeBoard } from "@/flavors/darkroom/lib/scene/prints";

import { orderProjectsForCatalog } from "@/lib/data/project-order";
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

/** One frame, printed up: the work print, its story and stack, and the frames either side of it on the roll. */
export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const result = await loadProjectPage(slug, orderProjectsForCatalog);
  if (!result) notFound();
  const { project, index, previous: prev, next } = result;
  const n = index + 1;
  const archetype = archetypeFor(project);
  const seed = hash(project.slug);
  const stage = development[project.status];

  const links = [
    { label: "See it live", href: project.live },
    { label: "Source on GitHub", href: project.github },
  ].filter((link): link is { label: string; href: string } => !!link.href);

  return (
    <Page>
      <PageHeader
        frame="01"
        kicker={`Frame ${pad2(n)} / Work print`}
        title={project.name}
        lede={project.tagline}
        meta={[
          {
            label: "Shot",
            value: project.year != null ? String(project.year) : "Undated",
          },
          { label: stage.meaning, value: stage.word },
          { label: "Stack", value: `${project.stack.length} parts` },
        ]}
        scene="project"
        board={encodeBoard([{ archetype, seed, select: project.featured }])}
        sceneLabel={`Frame ${n}, printed up`}
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

      <Container className="mt-section grid gap-x-10 gap-y-14 lg:grid-cols-12">
        <section aria-labelledby="print-heading" className="lg:col-span-7">
          <h2 id="print-heading" className="edge">
            The print
          </h2>
          <div className="mt-5 rounded-[2px] bg-paper p-[clamp(0.75rem,0.4rem+1.6vw,2rem)] shadow-sheet">
            {project.image ? (
              <Image
                src={project.image.url}
                alt={project.image.alt}
                width={project.image.width}
                height={project.image.height}
                placeholder={project.image.blurDataUrl ? "blur" : "empty"}
                {...(project.image.blurDataUrl !== undefined && {
                  blurDataURL: project.image.blurDataUrl,
                })}
                sizes="(min-width: 64rem) 55vw, 100vw"
                className="h-auto w-full"
              />
            ) : (
              <div className="aspect-[3/2]">
                <Art archetype={archetype} seed={seed} />
              </div>
            )}
            <p aria-hidden className="mt-3 flex justify-between edge">
              <span>{STOCK}</span>
              <span>
                ▸{n} / {n}A
              </span>
            </p>
          </div>
          <RichText value={project.description} className="mt-8 text-lead" />
        </section>
        <section
          aria-labelledby="stack-heading"
          className="grid content-start gap-4 lg:col-span-4 lg:col-start-9"
        >
          <h2 id="stack-heading" className="edge">
            On the back / {project.stack.length} parts
          </h2>
          <ul className="grid border-t border-line-strong">
            {project.stack.map((item) => (
              <li
                key={item}
                className="border-b border-line py-3 text-lead font-medium"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
      </Container>

      <Container as="nav" aria-label="Other frames" className="mt-section">
        <div className="grid gap-4 border-t border-line-strong pt-5 sm:grid-cols-3">
          {prev ? (
            <Link
              href={`/projects/${prev.slug}`}
              className="group grid min-h-11 content-start gap-1"
            >
              <span className="edge">← Frame {pad2(n - 1)}</span>
              <span className="text-lead font-semibold fine:group-hover:underline fine:group-hover:decoration-grease">
                {prev.name}
              </span>
            </Link>
          ) : (
            <span />
          )}
          <Link
            href="/projects"
            className={`${actionLinkClass} self-center sm:justify-self-center`}
          >
            The whole contact sheet
          </Link>
          {next ? (
            <Link
              href={`/projects/${next.slug}`}
              className="group grid min-h-11 content-start gap-1 sm:text-right"
            >
              <span className="edge">Frame {pad2(n + 1)} →</span>
              <span className="text-lead font-semibold fine:group-hover:underline fine:group-hover:decoration-grease">
                {next.name}
              </span>
            </Link>
          ) : null}
        </div>
      </Container>
    </Page>
  );
}
