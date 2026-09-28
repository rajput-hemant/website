import type { Metadata } from "next";
import { WeaveFocus } from "@/flavors/jacquard/components/draft/weave-focus";
import { SwatchCard } from "@/flavors/jacquard/components/projects/swatch-card";
import { Page } from "@/flavors/jacquard/components/site/page";
import { Container } from "@/flavors/jacquard/components/ui/container";
import { PageHeader } from "@/flavors/jacquard/components/ui/page-header";
import { summarize } from "@/flavors/jacquard/lib/focus";
import { draftWeave } from "@/flavors/jacquard/lib/scene/poses";
import {
  accessions,
  buildDraft,
  byYear,
  pickFor,
} from "@/flavors/jacquard/lib/weave";

import { sitePage } from "@/content/site";
import { getProjects, getSiteIdentity } from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/projects");

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata(page);
}

/** The swatch book: every project as the twill of its own pick, in accession order. */
export default async function ProjectsPage() {
  const site = await getSiteIdentity();
  const projects = await getProjects();
  const draft = buildDraft(projects);
  const numbers = accessions(projects, site.initials);
  const ordered = byYear(projects);

  return (
    <Page>
      <WeaveFocus summary={summarize(draft)} />
      <PageHeader
        card={2}
        kicker="Swatch book"
        title={page.title}
        lede={page.description}
        meta={[
          { label: "Swatches", value: String(projects.length) },
          {
            label: "Warp",
            value: `${draft.ends.length} technologies, set up once and reused`,
          },
          {
            label: "Still woven",
            value: `${projects.filter((p) => p.status !== "archived").length} active or maintained`,
          },
        ]}
        scene={{
          route: "projects",
          weave: draftWeave(draft),
          caption:
            "The whole draft on the cloth. Point at a material on any swatch to dye its end.",
        }}
      />
      <Container className="mt-section">
        <p className="mb-12 max-w-[62ch] text-[1.0625rem] text-ink-soft">
          Each swatch is woven from its project&rsquo;s own pick, stepped one
          end per row the way a twill steps, in the order the projects came into
          the book. The colours are the kinds of technology: woad for language,
          madder for interface, weld for data and state, walnut for runtime and
          tooling, orchil for 3D.
        </p>
        <ol className="grid gap-x-7 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {ordered.map((project) => (
            <li key={project.id}>
              <SwatchCard
                project={project}
                draft={draft}
                pick={pickFor(draft, project.slug)}
                accession={numbers.get(project.slug) ?? ""}
                headingLevel="h2"
              />
            </li>
          ))}
        </ol>
      </Container>
    </Page>
  );
}
