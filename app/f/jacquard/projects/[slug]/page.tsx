import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WeaveFocus } from "@/flavors/jacquard/components/draft/weave-focus";
import { CatalogueImage } from "@/flavors/jacquard/components/projects/catalogue-image";
import {
  Materials,
  technique,
} from "@/flavors/jacquard/components/projects/swatch-card";
import { SwatchCloth } from "@/flavors/jacquard/components/projects/swatch-cloth";
import { Page } from "@/flavors/jacquard/components/site/page";
import { buttonClass } from "@/flavors/jacquard/components/ui/button";
import { Container } from "@/flavors/jacquard/components/ui/container";
import { MuseumLabel } from "@/flavors/jacquard/components/ui/museum-label";
import { PageHeader } from "@/flavors/jacquard/components/ui/page-header";
import { RichText } from "@/flavors/jacquard/components/ui/rich-text";
import { summarize } from "@/flavors/jacquard/lib/focus";
import { twillWeave } from "@/flavors/jacquard/lib/scene/poses";
import {
  accessions,
  buildDraft,
  byYear,
  kindNames,
  pad2,
  pickFor,
} from "@/flavors/jacquard/lib/weave";

import { projectStatusLabels } from "@/lib/data/labels";
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

/** One swatch, catalogued: the cloth large, its entry, the story, and the swatches either side. */
export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const result = await loadProjectPage(slug, byYear);
  if (!result) notFound();
  const { project, projects, previous: prev, next } = result;
  const draft = buildDraft(projects);
  const pick = pickFor(draft, project.slug);
  const numbers = accessions(projects);
  const accession = numbers.get(project.slug) ?? "";
  const kinds = [
    ...new Set(pick?.ends.flatMap((e) => draft.ends[e]?.kind ?? []) ?? []),
  ];

  const links = [
    { label: "See it live", href: project.live },
    { label: "Source on GitHub", href: project.github },
  ].filter((link): link is { label: string; href: string } => !!link.href);

  return (
    <Page>
      <WeaveFocus summary={summarize(draft)} />
      <PageHeader
        card={2}
        kicker={`${pick ? `Pick ${pad2(pick.index + 1)} · ` : ""}${accession}`}
        title={project.name}
        lede={project.tagline}
        meta={[
          {
            label: "Date",
            value: `${project.year ?? "Undated"}, ${projectStatusLabels[project.status].toLowerCase()}`,
          },
          { label: "Technique", value: technique(draft, pick) },
          ...(kinds.length
            ? [
                {
                  label: "Kinds",
                  value: kinds.map((kind) => kindNames[kind]).join(", "),
                },
              ]
            : []),
        ]}
        scene={{
          route: "project",
          weave: twillWeave(draft, pick),
          caption: `The cloth, woven from ${project.name}'s pick alone.`,
        }}
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

      <Container className="mt-section grid gap-x-14 gap-y-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
        <section aria-labelledby="about-heading" className="min-w-0">
          <h2 id="about-heading" className="label">
            Catalogue note
          </h2>
          {project.image ? (
            <CatalogueImage
              image={project.image}
              sizes="(min-width: 64rem) 55vw, 100vw"
              className="mt-6 rounded-[3px] shadow-card"
            />
          ) : null}
          <RichText
            value={project.description}
            className="mt-6 text-[1.125rem] leading-relaxed"
          />
        </section>
        <section aria-labelledby="swatch-heading" className="min-w-0">
          <h2 id="swatch-heading" className="label">
            Swatch · {accession}
          </h2>
          <SwatchCloth
            id={project.slug}
            draft={draft}
            pick={pick}
            selvedge={`${project.name} · ${accession}`}
            className="mt-6"
          />
          <MuseumLabel
            className="mt-8"
            rows={[
              {
                label: "Materials",
                value: project.stack.length ? (
                  <Materials draft={draft} stack={project.stack} />
                ) : (
                  "Not recorded"
                ),
              },
              {
                label: "Ends",
                value: `${pick?.ends.length ?? 0} of ${draft.ends.length}`,
              },
            ]}
          />
        </section>
      </Container>

      <Container as="nav" aria-label="Other swatches" className="mt-section">
        <div className="grid gap-4 border-t border-rule-strong pt-5 sm:grid-cols-3">
          {prev ? (
            <Link
              href={`/projects/${prev.slug}`}
              className="group grid min-h-11 content-start gap-1"
            >
              <span className="label">← {numbers.get(prev.slug)}</span>
              <span className="font-display text-h3 transition-colors duration-(--duration-ui) ease-out fine:group-hover:text-madder">
                {prev.name}
              </span>
            </Link>
          ) : (
            <span />
          )}
          <Link
            href="/projects"
            className="thread-link inline-flex min-h-11 items-center self-center font-medium sm:justify-self-center"
          >
            The whole swatch book
          </Link>
          {next ? (
            <Link
              href={`/projects/${next.slug}`}
              className="group grid min-h-11 content-start gap-1 sm:text-right"
            >
              <span className="label">{numbers.get(next.slug)} →</span>
              <span className="font-display text-h3 transition-colors duration-(--duration-ui) ease-out fine:group-hover:text-madder">
                {next.name}
              </span>
            </Link>
          ) : null}
        </div>
      </Container>
    </Page>
  );
}
