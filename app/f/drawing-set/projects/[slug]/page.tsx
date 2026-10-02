import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DrawingFrame } from "@/flavors/drawing-set/components/projects/drawing-frame";
import { sheetOf } from "@/flavors/drawing-set/components/projects/sheet";
import {
  stampWord,
  StatusStamp,
} from "@/flavors/drawing-set/components/projects/status-stamp";
import { Page, SceneSlot } from "@/flavors/drawing-set/components/site";
import { StackPoster } from "@/flavors/drawing-set/components/site/scene-posters";
import { SceneView } from "@/flavors/drawing-set/components/site/scene-view";
import {
  ArrowLink,
  Container,
  ExternalLink,
  PageHeader,
  RichText,
  Schedule,
  SheetHeading,
  TitleBlock,
} from "@/flavors/drawing-set/components/ui";

import { orderProjectsForCatalog } from "@/lib/data/project-order";
import {
  loadProjectPage,
  projectMetadata,
  projectStaticParams,
} from "@/lib/data/project-page";

type ProjectPageProps = { params: Promise<{ slug: string }> };

const pad = (n: number) => String(n).padStart(3, "0");

export async function generateStaticParams() {
  return projectStaticParams();
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  return projectMetadata(slug);
}

/** The case-study sheet: title block, views, notes and the stack as a schedule. */
export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const page = await loadProjectPage(slug, orderProjectsForCatalog);
  if (!page) notFound();
  const { project, projects, index } = page;

  const dwg = `DWG ${pad(index + 1)}`;
  const links = [
    { label: "Source", href: project.github },
    { label: "Live", href: project.live },
  ].filter((link): link is { label: string; href: string } => !!link.href);

  return (
    <Page>
      <PageHeader
        sheet={sheetOf("/projects")}
        eyebrow={dwg}
        title={project.name}
        lede={project.tagline}
        meta={[
          {
            label: "Year",
            value: project.year != null ? String(project.year) : "-",
          },
          { label: "Status", value: <StatusStamp status={project.status} /> },
        ]}
      />
      <SceneSlot route="project" size="band" />

      <Container className="py-section">
        <ArrowLink href="/projects">Back to the register</ArrowLink>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <DrawingFrame
            view="View A"
            caption={
              project.image
                ? project.image.alt
                : "Interface, screenshot to follow"
            }
            image={project.image}
          />
          {project.stack.length > 0 ? (
            <DrawingFrame view="View B" caption="Stack, exploded axonometric">
              <SceneView
                id="stack"
                className="absolute inset-0 bg-ground"
                data={{ "data-count": project.stack.length }}
                poster={<StackPoster count={project.stack.length} />}
              />
            </DrawingFrame>
          ) : (
            <DrawingFrame
              view="View B"
              caption="Architecture, diagram to follow"
            />
          )}
        </div>

        <div
          data-scene-section
          className="mt-20 grid gap-x-12 gap-y-16 lg:grid-cols-12"
        >
          <section aria-labelledby="notes" className="lg:col-span-7">
            <SheetHeading id="notes" n="01" title="Notes" />
            <RichText
              value={project.description}
              className="mt-8 max-w-[64ch]"
            />
          </section>

          <aside
            aria-label="Drawing details"
            className="flex flex-col gap-12 lg:col-span-5"
          >
            <TitleBlock
              className="w-full"
              rows={[
                { label: "Drawing", value: dwg },
                { label: "Title", value: project.name },
                { label: "Status", value: stampWord(project.status) },
                {
                  label: "Year",
                  value: project.year != null ? String(project.year) : "-",
                },
              ]}
              sheet={pad(index + 1)}
              total={pad(projects.length)}
              rev={project.year != null ? String(project.year) : "-"}
            />
            {project.stack.length > 0 && (
              <Schedule
                caption="Stack"
                columns={[
                  { key: "mark", label: "Mark", className: "w-20" },
                  { key: "item", label: "Stack" },
                ]}
                rows={project.stack.map((name, i) => ({
                  mark: `S-${String(i + 1).padStart(2, "0")}`,
                  item: name,
                }))}
                rowItem={(_, i) => `stack:${i}`}
              />
            )}

            {links.length > 0 && (
              <ul className="flex flex-wrap gap-x-8 gap-y-3 font-mono text-mono-sm tracking-[0.08em] uppercase">
                {links.map((link) => (
                  <li key={link.href}>
                    <ExternalLink href={link.href}>{link.label}</ExternalLink>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      </Container>
    </Page>
  );
}
