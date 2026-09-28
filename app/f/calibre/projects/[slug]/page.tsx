import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JewelMap } from "@/flavors/calibre/components/jewels/jewel-map";
import { StatePip } from "@/flavors/calibre/components/jewels/state-pip";
import { Page } from "@/flavors/calibre/components/site/page";
import { buttonClass } from "@/flavors/calibre/components/ui/button";
import { Container } from "@/flavors/calibre/components/ui/container";
import { actionLinkClass } from "@/flavors/calibre/components/ui/link-class";
import { PageHeader } from "@/flavors/calibre/components/ui/page-header";
import { RichText } from "@/flavors/calibre/components/ui/rich-text";
import {
  bezelPrints,
  jewels,
  jewelTags,
  pad2,
  states,
} from "@/flavors/calibre/lib/movement";
import { encodeBoard } from "@/flavors/calibre/lib/scene/poses";

import { getProfile, getProjects } from "@/lib/data";
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

/** One jewel, taken out to the loupe: its place in the movement, its story and complications, and its neighbours. */
export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const result = await loadProjectPage(slug, orderProjectsForCatalog);
  if (!result) notFound();
  const { project, index, previous: prev, next } = result;
  const [profile, projects] = await Promise.all([getProfile(), getProjects()]);
  const n = index + 1;
  const of = projects.length;
  const state = states[project.status];

  const links = [
    { label: "See it live", href: project.live },
    { label: "Source on GitHub", href: project.github },
  ].filter((link): link is { label: string; href: string } => !!link.href);

  return (
    <Page>
      <PageHeader
        hour={0}
        kicker={`Jewel ${pad2(n)} of ${of}`}
        title={project.name}
        lede={project.tagline}
        meta={[
          {
            label: "Set",
            value: project.year != null ? String(project.year) : "Undated",
          },
          { label: "State", value: <StatePip status={project.status} /> },
          {
            label: "Complications",
            value: `${project.stack.length} in the stack`,
          },
        ]}
        scene="project"
        board={encodeBoard({ jewels: of, lit: n })}
        tags={jewelTags(jewels(orderProjectsForCatalog(projects)))}
        prints={bezelPrints(of, profile.location)}
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
          <h2 id="print-heading" className="spec">
            Under the loupe
          </h2>
          <div className="engraving mt-5 rounded-[3px] p-[clamp(0.75rem,0.4rem+1.6vw,2rem)]">
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
              <div className="flex aspect-[3/2] items-center justify-center">
                <JewelMap n={n} of={of} className="size-[min(60%,16rem)]" />
              </div>
            )}
            <p className="mt-3 flex justify-between spec">
              <span>
                Jewel {pad2(n)} of {of}
              </span>
              <span>{state.word}</span>
            </p>
          </div>
          <RichText value={project.description} className="mt-8 text-lead" />
        </section>
        <section
          aria-labelledby="stack-heading"
          className="grid content-start gap-4 lg:col-span-4 lg:col-start-9"
        >
          <h2 id="stack-heading" className="spec">
            Complications · {project.stack.length} in the stack
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

      <Container
        as="nav"
        aria-label="Neighbouring jewels"
        className="mt-section"
      >
        <div className="grid gap-4 border-t border-line-strong pt-5 sm:grid-cols-3">
          {prev ? (
            <Link
              href={`/projects/${prev.slug}`}
              className="group grid min-h-11 content-start gap-1"
            >
              <span className="spec">← Jewel {pad2(n - 1)}</span>
              <span className="text-lead font-medium fine:group-hover:underline fine:group-hover:decoration-steel">
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
            The whole register
          </Link>
          {next ? (
            <Link
              href={`/projects/${next.slug}`}
              className="group grid min-h-11 content-start gap-1 sm:text-right"
            >
              <span className="spec">Jewel {pad2(n + 1)} →</span>
              <span className="text-lead font-medium fine:group-hover:underline fine:group-hover:decoration-steel">
                {next.name}
              </span>
            </Link>
          ) : null}
        </div>
      </Container>
    </Page>
  );
}
