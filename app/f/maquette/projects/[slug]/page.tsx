import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PieceDrawing } from "@/flavors/maquette/components/model/drawing";
import { Page } from "@/flavors/maquette/components/site/page";
import { buttonClass } from "@/flavors/maquette/components/ui/button";
import { Container } from "@/flavors/maquette/components/ui/container";
import { actionLinkClass } from "@/flavors/maquette/components/ui/link-class";
import { PageHeader } from "@/flavors/maquette/components/ui/page-header";
import { RichText } from "@/flavors/maquette/components/ui/rich-text";
import {
  dimensions,
  encodeBoard,
  pad2,
  pieces,
  sitePlan,
} from "@/flavors/maquette/lib/model";

import { getProjects } from "@/lib/data";
import { orderProjectsForCatalog } from "@/lib/data/project-order";
import {
  loadProjectPage,
  projectMetadata,
  projectStaticParams,
} from "@/lib/data/project-page";
import { safeHref } from "@/lib/safe-href";

type Props = { params: Promise<{ slug: string }> };

export const generateStaticParams = projectStaticParams;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return projectMetadata((await params).slug);
}

/** One piece, lifted off the site: its drawing, its story and what it is cut from, and the pieces either side of it in the catalogue. */
export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const [result, projects] = await Promise.all([
    loadProjectPage(slug, orderProjectsForCatalog),
    getProjects(),
  ]);
  if (!result) notFound();
  const { project, index, previous: prev, next } = result;
  const n = index + 1;
  const all = pieces(orderProjectsForCatalog(projects), new Date());
  const piece = all.find((p) => p.project.slug === project.slug);
  if (!piece) notFound();
  const { finish } = piece;

  const links = [
    { label: "See it live", href: project.live },
    { label: "Source on GitHub", href: project.github },
  ].filter((link): link is { label: string; href: string } => !!link.href);

  return (
    <Page>
      <PageHeader
        frame="01"
        kicker={`Piece ${pad2(n)} of ${all.length}`}
        title={project.name}
        lede={project.tagline}
        meta={[
          {
            label: "First commit",
            value: project.year != null ? String(project.year) : "Undated",
          },
          { label: "State", value: finish.meaning },
          { label: "Cut", value: `${finish.word}, ${dimensions(piece)}` },
        ]}
        scene="project"
        board={encodeBoard(
          sitePlan(all, { allFinished: true, focus: project.slug })
        )}
        pins={all.map((piece) => ({
          id: piece.project.slug,
          n: piece.n,
          name: piece.project.name,
        }))}
        sceneLabel={`${project.name}, lifted off the site`}
      >
        {links.length > 0 ? (
          <div className="mt-8 flex flex-wrap gap-3">
            {links.map((link, i) => (
              <a
                key={link.href}
                href={safeHref(link.href)}
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
          <h2 id="print-heading" className="caps">
            Elevation and plan
          </h2>
          <div className="vitrine mt-5 p-[clamp(0.5rem,0.3rem+1vw,1.25rem)]">
            <PieceDrawing piece={{ ...piece, name: project.name }} />
          </div>
          {project.image ? (
            <figure className="mt-8">
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
                className="h-auto w-full rounded-[2px] shadow-vitrine"
              />
              <figcaption className="mt-2 num">The built work</figcaption>
            </figure>
          ) : null}
          <RichText
            value={project.description}
            className="mt-8 text-lg leading-relaxed"
          />
        </section>
        <section
          aria-labelledby="stack-heading"
          className="grid content-start gap-4 lg:col-span-4 lg:col-start-9"
        >
          <h2 id="stack-heading" className="caps">
            The bays / {project.stack.length}{" "}
            {project.stack.length === 1 ? "technology" : "technologies"}
          </h2>
          <ul className="grid border-t border-line-strong">
            {project.stack.map((item, i) => (
              <li
                key={item}
                className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline border-b border-line py-3"
              >
                <span className="num">{pad2(i + 1)}</span>
                <span className="font-display text-lead">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </Container>

      <Container as="nav" aria-label="Other pieces" className="mt-section">
        <div className="grid gap-4 border-t border-line pt-5 sm:grid-cols-3">
          {prev ? (
            <Link
              href={`/projects/${prev.slug}`}
              className="group grid min-h-11 content-start gap-1"
            >
              <span className="num">← Piece {pad2(n - 1)}</span>
              <span className="font-display text-lead transition-colors duration-(--duration-ui) fine:group-hover:text-cut">
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
            All the vitrines
          </Link>
          {next ? (
            <Link
              href={`/projects/${next.slug}`}
              className="group grid min-h-11 content-start gap-1 sm:text-right"
            >
              <span className="num">Piece {pad2(n + 1)} →</span>
              <span className="font-display text-lead transition-colors duration-(--duration-ui) fine:group-hover:text-cut">
                {next.name}
              </span>
            </Link>
          ) : null}
        </div>
      </Container>
    </Page>
  );
}
