import type { Metadata } from "next";
import { ProofCard } from "@/flavors/press/components/projects/proof-card";
import { StatusStamp } from "@/flavors/press/components/projects/status-stamp";
import { Page } from "@/flavors/press/components/site/page";
import { Container } from "@/flavors/press/components/ui/container";
import { PageHeader } from "@/flavors/press/components/ui/page-header";
import { SectionHead } from "@/flavors/press/components/ui/section-head";
import { printStatus } from "@/flavors/press/lib/proof";

import { sitePage } from "@/content/site";
import { getProjects } from "@/lib/data";
import type { ProjectStatus } from "@/lib/data/types";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/projects");

export const metadata: Metadata = pageMetadata(page);

const ORDER: ProjectStatus[] = ["active", "maintained", "wip", "archived"];

/** Every signature, gathered by its stamp: on press and in print first, out of print last. */
export default async function ProjectsPage() {
  const projects = await getProjects();
  const groups = ORDER.map((status) => ({
    status,
    items: projects.filter((p) => p.status === status),
  })).filter((group) => group.items.length > 0);
  const featured = projects.filter((p) => p.featured).length;

  return (
    <Page>
      <PageHeader
        sheet={2}
        kicker="Signatures"
        title={page.title}
        lede={page.description}
        meta={[
          { label: "Signatures", value: String(projects.length) },
          { label: "Solid on the strip", value: `${featured} featured` },
          {
            label: "Still in print",
            value: String(
              projects.filter((p) => p.status !== "archived").length
            ),
          },
        ]}
        scene="projects"
      />
      <Container className="mt-section grid gap-section">
        {groups.map((group) => (
          <section key={group.status} aria-labelledby={`group-${group.status}`}>
            <SectionHead
              id={`group-${group.status}`}
              size="h2"
              kicker={<StatusStamp status={group.status} />}
              title={printStatus[group.status].meaning}
              aside={`${group.items.length} ${group.items.length === 1 ? "signature" : "signatures"}`}
            />
            <ul className="mt-12 grid gap-x-12 gap-y-14 px-3.5 sm:grid-cols-2 xl:grid-cols-3">
              {group.items.map((project) => (
                <li key={project.id}>
                  <ProofCard
                    project={project}
                    sig={projects.indexOf(project) + 1}
                    size="sm"
                    className="h-full"
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </Container>
    </Page>
  );
}
